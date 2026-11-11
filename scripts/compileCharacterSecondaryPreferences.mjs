import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const groups = { health: [1,55], protection: [28,56], offense: [41,48], defense: [42,49],
  speed: [5], potency: [17], tenacity: [18], critChance: [53] };
const sets = {1:'health',2:'offense',3:'defense',4:'speed',5:'critchance',6:'critdamage',7:'potency',8:'tenacity'};
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
function opportunities(data, count, statId) {
  // Fixed square/diamond primaries also block their percentage secondary.
  const fixed = statId === 48 || statId === 49 ? count : 0;
  const blocked = Object.values(data.primaries || {}).reduce((sum, slot) => sum + (slot.stats?.[statId]?.count || 0), 0);
  return Math.max(0, count * 6 - fixed - blocked);
}

export function compilePreferences(raw, targets) {
  const totals = {};
  for (const character of Object.values(raw.characters)) {
    for (const id of Object.values(groups).flat()) {
      const stat = character.aggregate?.secondaries?.stats?.[id];
      totals[id] ||= { count: 0, value: 0, opportunities: 0 };
      totals[id].opportunities += opportunities(character.aggregate || {}, character.population?.sampleSize || 0, id);
      if (!stat) continue;
      if (!(stat.count > 0) || !Number.isFinite(stat.average)) continue;
      totals[id].count += stat.count;
      totals[id].value += stat.count * stat.average;
    }
  }
  const characters = {};
  for (const [id, target] of Object.entries(targets.characters)) {
    const character = raw.characters[id];
    const combination = target.targets[0]?.metaRestrictions?.setCombinations[0];
    if (!character || !combination) continue;
    const loadout = Object.values(character.loadouts || {}).find(row => {
      const counts = {};
      for (const set of row.setIds || []) counts[sets[set]] = (counts[sets[set]] || 0) + 1;
      return Object.keys(counts).length === Object.keys(combination).length &&
        Object.entries(combination).every(([key, count]) => counts[key] === count);
    });
    if (!loadout?.secondaries?.observedCount) continue;
    const signals = Object.fromEntries(Object.entries(groups).map(([key, ids]) => [key,
      ids.reduce((sum, statId) => {
        const stat = loadout.secondaries.stats[statId];
        const baseline = totals[statId];
        if (!baseline || !(baseline.value > 0) || !(baseline.opportunities > 0)) return sum + 1;
        const eligible = opportunities(loadout, loadout.count, statId);
        if (!eligible) return sum + 1;
        if (!stat) return sum + 0.5;
        const ratio = stat.average / (baseline.value / baseline.count);
        const frequencyRatio = (stat.count / eligible) / (baseline.count / baseline.opportunities);
        return sum + clamp(frequencyRatio * Math.sqrt(clamp(ratio, 0.5, 1.5)), 0.5, 2);
      }, 0) / ids.length
    ]));
    // Small samples approach neutral fit; grouped forms do not get double weight.
    const confidence = Math.min(1, loadout.count / 100);
    characters[id] = { sampleSize: loadout.count, loadoutId: loadout.id,
      weights: Object.fromEntries(Object.entries(signals).map(([key, value]) =>
        [key, Number((0.5 + confidence * clamp(Math.log2(value) / 2, -0.5, 0.5)).toFixed(6))])) };
  }
  return { schemaVersion: 2, method: 'grouped-population-relative-eligible-frequency-and-value', characters };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const raw = JSON.parse(fs.readFileSync(process.env.META_PROFILES_FILE || 'src/constants/metaProfiles.json'));
  const targets = JSON.parse(fs.readFileSync(process.env.META_TARGETS_FILE || 'src/constants/generatedMetaTargets.json'));
  const output = compilePreferences(raw, targets);
  fs.writeFileSync('src/constants/generatedCharacterSecondaryPreferences.json', JSON.stringify(output, null, 2) + '\n');
  console.log(`Generated secondary preferences for ${Object.keys(output.characters).length} characters.`);
}
