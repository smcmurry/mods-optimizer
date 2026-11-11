import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createFrontendLoader } from './lib/loadFrontend.mjs';
const filename = process.argv[2] || 'reports/local-optimizer/297546974/latest.json';
const report = JSON.parse(fs.readFileSync(filename, 'utf8'));
const previous = process.argv[3] ? JSON.parse(fs.readFileSync(process.argv[3], 'utf8')) : null;
if (previous && (previous.mode !== report.mode || previous.source.sha256 !== report.source.sha256 || previous.settingsHash !== report.settingsHash || !report.settingsHash)) {
  throw new Error('Cannot attribute changes to the engine: mode/fixture/settings/selection differ or were not fingerprinted. Run both versions with the same cached inputs.');
}
const optimized = report.characters.filter(row => report.order.includes(row.id))
  .sort((a, b) => report.order.indexOf(a.id) - report.order.indexOf(b.id));
const loadout = row => (row?.after?.sets || []).map(set => [set.count ? `${set.count}× ${set.name}` : '',
  set.leftoverMods ? `${set.leftoverMods} loose ${set.name} mods` : ''].filter(Boolean).join(', ')).join(' + ') || row?.after?.score?.loadoutId || '—';
const counts = { high: 0, medium: 0, low: 0, unavailable: 0 };
optimized.forEach(row => { const level = row.after?.score?.combat?.kitConfidence?.level || 'unavailable'; counts[level]++; });
const omitted = {};
optimized.forEach(row => (row.after?.score?.combat?.kitConfidence?.members || []).forEach(member =>
  Object.entries(member.omissionReasons).forEach(([reason, count]) => { omitted[reason] = (omitted[reason] || 0) + count; })));
let markdown = `# Local optimizer analysis\n\nAlly code: ${report.allyCode}; ${report.mode}; kit revision ${report.kitRevision}.\n\n`;
markdown += `Fixed public fixture: ${report.source.characters} characters, ${report.source.mods} mods; unequipped inventory may be missing. Settings: ${report.settingsSource}.\n\n`;
markdown += `Elapsed: ${(report.milliseconds / 1000).toFixed(1)} seconds. Confidence counts: ${JSON.stringify(counts)}.\n\n`;
markdown += 'Confidence measures coverage of the bounded model. It does not certify live battle outcomes. High confidence requires no omitted active-team branches or unresolved queries, a complete example team and at least three scenarios.\n\n';
markdown += '| Character | Confidence | Omitted team branches | Unresolved conditions | Loadout | Value change % |\n|---|---|---:|---:|---|---:|\n';
optimized.forEach(row => {
  const confidence = row.after?.score?.combat?.kitConfidence;
  markdown += `| ${row.name} (${row.id}) | ${confidence?.level || 'unavailable'} | ${confidence?.omittedBranches ?? '—'} | ${confidence?.unresolvedStateCount ?? '—'} | ${loadout(row)} | ${row.scoreChange?.relativeChangePercent ?? '—'} |\n`;
});
markdown += '\n## Most frequent unresolved conditions\n\n';
(report.unresolvedStates || []).slice(0, 30).forEach(row => { markdown += `- ${row.reason}: ${row.scenarios} scenario occurrences\n`; });
markdown += '\n## Omitted operation categories\n\n';
Object.entries(omitted).sort((a, b) => b[1] - a[1]).forEach(([reason, count]) => { markdown += `- ${reason}: ${count} active-team branch occurrences\n`; });
if (previous) {
  const old = Object.fromEntries(previous.characters.map(row => [row.id, row]));
  markdown += '\n## Changes against the same fixed inputs\n\n';
  optimized.forEach(row => {
    const before = old[row.id];
    if (JSON.stringify(row.after?.mods) !== JSON.stringify(before?.after?.mods)) markdown += `- ${row.id}: ${loadout(before)} → ${loadout(row)}\n`;
  });
  // Old and new normalized scores use different calculators. Compare the
  // allocations under one current model instead, using exported raw stat
  // totals (not displayed defense percentages). Do not sum character gains.
  const engineFiles = ['src/domain/conditionalUtility.js', 'src/domain/characterMechanics.js', 'src/domain/combatUtility.js',
    'public/workers/optimizer.js', 'src/utils/resolveCombatTeam.js', 'src/domain/CharacterDataClasses.js',
    'src/domain/CharacterStats.js', 'src/domain/Mod.js', 'src/domain/ModSet.js', 'src/domain/OptimizationPlan.js',
    'scripts/runLocalOptimizer.mjs', 'scripts/lib/loadFrontend.mjs',
    'src/constants/generatedCombatPrograms.json', 'scripts/preprocessCombatPrograms.mjs', 'src/domain/cooldownUtility.js', 'src/domain/dispelUtility.js', 'src/domain/damageImmunityUtility.js'];
  const currentHash = createHash('sha256').update(engineFiles.map(file => fs.readFileSync(file)).join('\n')).digest('hex');
  if (report.mode === 'roster-optimization' && report.engineHashVersion === 3 && report.engineHash === currentHash) {
    const raw = fs.readFileSync(path.join('data/optimizer-fixtures', report.allyCode, 'profile.json'), 'utf8');
    if (createHash('sha256').update(raw).digest('hex') !== report.source.sha256) throw new Error('Rescoring requires the exact cached roster fixture.');
    const levels = Object.fromEntries(JSON.parse(raw).characters.map(row => [row.baseId, row.level]));
    const combat = createFrontendLoader()('src/domain/combatUtility.js');
    if (combat.kitRevision !== report.kitRevision) throw new Error('Rescoring requires the report’s kit revision.');
    markdown += '\n## Allocation comparison under the current model\n\n';
    markdown += 'Both allocations are rescored with the current report’s model and fixed teammate snapshots. Raw exported totals are rounded to six decimal places, so very small differences are approximate. Scores from different calculator versions are not subtracted, and these gains cannot be summed into roster strength.\n\n';
    markdown += '| Character | Previous loadout | Current loadout | Current-model utility change % |\n|---|---|---|---:|\n';
    optimized.forEach(row => {
      const before = old[row.id];
      const model = row.target?.combatModel;
      if (!model || !before?.after?.stats || !row.after?.stats) return;
      const vector = stats => ({ ...Object.fromEntries(Object.entries(stats).map(([key, stat]) => [key, stat.rawValue])), level: levels[row.id] });
      const oldUtility = combat.utility(vector(before.after.stats), model);
      const newUtility = combat.utility(vector(row.after.stats), model);
      const change = 100 * (newUtility / oldUtility - 1);
      if (!Number.isFinite(change)) throw new Error(`Invalid rescored comparison: ${row.id}`);
      markdown += `| ${row.name} (${row.id}) | ${loadout(before)} | ${loadout(row)} | ${change.toFixed(4)} |\n`;
    });
  } else if (report.mode === 'coverage-only') {
    markdown += '\nAllocation rescoring is not applicable: coverage mode evaluates equipped stats without searching for new allocations.\n';
  } else {
    markdown += '\nAllocation rescoring skipped: this report does not identify the currently loaded calculator. Run a new full result with this version to compare values under one model.\n';
  }
}
const output = path.join(path.dirname(filename), path.basename(filename, '.json') + '.md');
fs.writeFileSync(output, markdown);
console.log(`Confidence ${JSON.stringify(counts)}; analysis saved to ${output}`);
