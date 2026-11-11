#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';

// Recompute expected values from raw observations, independently of the compiler.
const raw = JSON.parse(await fs.readFile(process.env.META_PROFILES_FILE ?? 'src/constants/metaProfiles.json', 'utf8'));
const generated = JSON.parse(await fs.readFile(process.env.META_TARGETS_FILE ?? 'src/constants/generatedMetaTargets.json', 'utf8'));
const settings = generated.compiler;
const groups = { health: [1, 55], protection: [28, 56], speed: [5], potency: [17], tenacity: [18], offense: [41, 48], defense: [42, 49], critChance: [53] };
const names = { 5: 'Speed', 16: 'Critical Damage %', 17: 'Potency %', 18: 'Tenacity %', 48: 'Offense %', 49: 'Defense %', 52: 'Accuracy %', 53: 'Critical Chance %', 54: 'Critical Avoidance %', 55: 'Health %', 56: 'Protection %' };
const sets = { 1: 'health', 2: 'offense', 3: 'defense', 4: 'speed', 5: 'critchance', 6: 'critdamage', 7: 'potency', 8: 'tenacity' };
const baselines = {};
for (const character of Object.values(raw.characters)) {
  for (const [id, stat] of Object.entries(character.aggregate?.secondaries?.stats ?? {})) {
    const average = Number(stat.average), count = Number(stat.count);
    if (!Number.isFinite(average) || !Number.isFinite(count) || count <= 0) continue;
    const bucket = baselines[id] ??= { sum: 0, count: 0 };
    bucket.sum += average * count;
    bucket.count += count;
  }
}
const results = [];
const failures = [];
function check(condition, id, message) {
  if (!condition) failures.push({ character: id, message });
}
function validatePrimaries(id, data, preferences, restrictions) {
  const expectedSlots = Object.keys(data ?? {});
  check(JSON.stringify(Object.keys(preferences ?? {}).sort()) === JSON.stringify(expectedSlots.sort()), id, 'Primary slot coverage differs');
  const expectedLocks = {};
  for (const [slot, distribution] of Object.entries(data ?? {})) {
    const expected = {};
    for (const stat of Object.values(distribution.stats ?? {})) {
      if (names[stat.statId]) expected[names[stat.statId]] = Number(stat.frequency ?? 0);
    }
    const actual = preferences?.[slot];
    check(JSON.stringify(actual?.probabilities) === JSON.stringify(expected), id, `${slot}: primary probabilities differ`);
    check(actual?.confidence === Math.min(1, Number(distribution.total ?? 0) / settings.minimumPrimarySampleSize), id, `${slot}: primary confidence differs`);
    const ranked = Object.entries(expected).sort((a, b) => b[1] - a[1]);
    if (Number(distribution.total ?? 0) >= settings.minimumPrimarySampleSize && ranked.length &&
        ranked[0][1] >= settings.primaryLockThreshold && ranked[0][1] - (ranked[1]?.[1] ?? 0) >= settings.primaryLockMargin) {
      expectedLocks[slot] = ranked[0][0];
    }
  }
  if (restrictions) check(JSON.stringify(restrictions) === JSON.stringify(expectedLocks), id, 'Hard primary locks differ');
}
for (const [id, character] of Object.entries(raw.characters)) {
  const sampleSize = Number(character.population?.sampleSize ?? 0);
  if (sampleSize < settings.minimumCharacterSampleSize) {
    check(!generated.characters[id], id, 'Insufficient sample was compiled');
    continue;
  }
  const compiled = generated.characters[id];
  check(Boolean(compiled), id, 'Eligible character missing');
  if (!compiled) continue;
  const start = failures.length;
  const expectedArchetypes = Object.values(character.loadouts ?? {}).filter(l => Number(l.count ?? 0) >= settings.archetypeMinimumCount && Number(l.share ?? 0) >= settings.archetypeMinimumShare)
    .sort((a, b) => b.share - a.share).slice(0, settings.maximumArchetypesPerCharacter);
  check(compiled.targets.length === 1 + expectedArchetypes.length, id, 'Archetype coverage differs');
  for (const target of compiled.targets) {
    const aggregate = target.source.type === 'aggregate';
    const source = aggregate ? character.aggregate : Object.values(character.loadouts ?? {}).find(l => l.id === target.source.loadoutId);
    check(Boolean(source), id, 'Target source missing');
    if (!source) continue;
    const signals = {};
    for (const [key, ids] of Object.entries(groups)) {
      signals[key] = ids.reduce((sum, statId) => {
        const stat = source.secondaries?.stats?.[statId];
        if (!stat) return sum;
        const baseline = baselines[statId]?.sum / baselines[statId]?.count;
        const ratio = Number.isFinite(Number(stat.average)) && Number.isFinite(baseline) && baseline !== 0
          ? Math.max(0.5, Math.min(1.5, Number(stat.average) / baseline)) : 1;
        return sum + Number(stat.frequency ?? 0) * Math.sqrt(ratio);
      }, 0) / ids.length;
    }
    const max = Math.max(0, ...Object.values(signals));
    for (const key of [...Object.keys(groups), 'critDmg', 'accuracy', 'critAvoid']) {
      let expected = max > 0 ? Math.round(100 * ((signals[key] ?? 0) / max) ** settings.weightGamma) : 0;
      if (expected < settings.minimumOutputWeight) expected = 0;
      check(target[key] === expected, id, `${target.name}: ${key} weight ${target[key]} != ${expected}`);
    }
    const meta = target.metaPreferences;
    check(meta?.version === 2, id, 'V2 preferences missing');
    if (!meta) continue;
    validatePrimaries(id, source.primaries, meta.primaries, target.primaryStatRestrictions);
    check(meta.setStrength === (aggregate ? settings.setPriorStrength : 0), id, 'Set prior strength differs');
    check(meta.primaryStrength === settings.primaryPriorStrength && meta.candidatePrimaryStrength === settings.primaryPriorStrength * 0.25, id, 'Primary prior strength differs');
    check(meta.epsilon === settings.priorEpsilon, id, 'Prior smoothing differs');
    if (aggregate) {
      check(Object.keys(target.setRestrictions).length === 0, id, 'Aggregate set was hard locked');
      const loadouts = Object.values(character.loadouts ?? {}).filter(l => l.setIds?.length);
      check(Object.keys(meta.loadouts).length === loadouts.length, id, 'Loadout coverage differs');
      for (const loadout of loadouts) {
        const key = [...loadout.setIds].sort((a, b) => a - b).join('-');
        check(meta.loadouts[key]?.probability === Number(loadout.share ?? 0), id, `${key}: loadout probability differs`);
        validatePrimaries(id, loadout.primaries, meta.loadouts[key]?.primaries);
      }
    } else {
      const restrictions = {};
      for (const setId of source.setIds) restrictions[sets[setId]] = (restrictions[sets[setId]] ?? 0) + 1;
      check(JSON.stringify(target.setRestrictions) === JSON.stringify(restrictions), id, 'Archetype sets differ');
    }
  }
  results.push({ id, name: compiled.name, sampleSize, targets: compiled.targets.length, passed: failures.length === start });
}
for (const id of Object.keys(generated.characters)) check(Boolean(raw.characters[id]), id, 'Unknown generated character');
const report = { generatedAt: new Date().toISOString(), charactersChecked: results.length, targetsChecked: results.reduce((n, r) => n + r.targets, 0), failureCount: failures.length, results, failures };
const directory = process.env.META_REPORT_DIRECTORY ?? 'reports';
await fs.mkdir(directory, { recursive: true });
await fs.writeFile(path.join(directory, 'metaValidationV2.json'), JSON.stringify(report, null, 2) + '\n');
const focus = ['R2D2_LEGENDARY', 'BADBATCHHUNTER'].map(id => {
  const target = generated.characters[id]?.targets[0];
  return target ? `### ${id}\n\nWeights: ${JSON.stringify(Object.fromEntries(Object.keys(groups).map(key => [key, target[key]])))}\n\nHard primaries: ${JSON.stringify(target.primaryStatRestrictions)}\n` : '';
}).join('\n');
await fs.writeFile(path.join(directory, 'metaValidationV2.md'), `# Meta architecture V2 validation\n\nChecked ${report.charactersChecked} characters and ${report.targetsChecked} targets. Failures: ${failures.length}.\n\nChecks cover secondary-only weights, set probabilities, aggregate and conditional primary probabilities, consensus locks, and archetype restrictions. This verifies data compilation; it does not measure roster recommendation quality against unseen players.\n\n${focus}\n${failures.map(f => `- ${f.character}: ${f.message}`).join('\n')}\n`);
console.log(`V2 validation: ${report.charactersChecked} characters, ${report.targetsChecked} targets, ${failures.length} failures`);
if (failures.length) { console.error(failures.slice(0, 10)); process.exitCode = 1; }
