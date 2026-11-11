import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { createFrontendLoader } from './lib/loadFrontend.mjs';
import './syncCombatUtility.mjs';

const args = process.argv.slice(2);
const option = (key, fallback) => args.includes(key) ? args[args.indexOf(key) + 1] : fallback;
const allyCode = option('--ally-code', '297546974');
if (!/^\d{9}$/.test(allyCode)) throw new Error('Supply a nine-digit ally code.');
const allowedOptions = new Set(['--ally-code', '--characters', '--coverage-only', '--output']);
for (let index = 0; index < args.length; index++) {
  const key = args[index];
  if (!allowedOptions.has(key)) throw new Error(`Unknown option: ${key}`);
  if (key !== '--coverage-only' && (!args[++index] || args[index].startsWith('--'))) throw new Error(`Supply a value for ${key}.`);
}
const outputDirectory = path.resolve('reports/local-optimizer', allyCode);
const outputPath = path.resolve(option('--output', path.join(outputDirectory, args.includes('--coverage-only') ? 'coverage.json' : 'latest.json')));
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
const engineFiles = ['src/domain/conditionalUtility.js', 'src/domain/characterMechanics.js', 'src/domain/combatUtility.js',
  'public/workers/optimizer.js', 'src/utils/resolveCombatTeam.js', 'src/domain/CharacterDataClasses.js',
  'src/domain/CharacterStats.js', 'src/domain/Mod.js', 'src/domain/ModSet.js', 'src/domain/OptimizationPlan.js',
  'scripts/runLocalOptimizer.mjs', 'scripts/lib/loadFrontend.mjs',
  'src/constants/generatedCombatPrograms.json', 'scripts/preprocessCombatPrograms.mjs', 'src/domain/cooldownUtility.js', 'src/domain/dispelUtility.js', 'src/domain/damageImmunityUtility.js'];
const fingerprintEngine = () => createHash('sha256').update(engineFiles.map(file => fs.readFileSync(file)).join('\n')).digest('hex');
const engineHash = fingerprintEngine();
const directory = path.resolve('data/optimizer-fixtures', allyCode);
const raw = fs.readFileSync(path.join(directory, 'profile.json'), 'utf8');
const source = JSON.parse(fs.readFileSync(path.join(directory, 'source.json'), 'utf8'));
if (source.sha256 !== createHash('sha256').update(raw).digest('hex')) throw new Error('Fixture hash mismatch. Refresh the fixture.');
const snapshot = JSON.parse(raw);
const configPath = path.join(directory, 'run-settings.json');
const config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf8')) : { characters: [] };
const savedTargets = Object.fromEntries(config.characters.map(row => [row.id, row]));
const load = createFrontendLoader();
const combat = load('src/domain/combatUtility.js');
const { PlayerValues } = load('src/domain/CharacterDataClasses.js');
const Mod = load('src/domain/Mod.js').default;
const Plan = load('src/domain/OptimizationPlan.js').default;
const resolveTeam = load('src/utils/resolveCombatTeam.js').default;
const ModSet = load('src/domain/ModSet.js').default;
const settings = load('src/constants/characterSettings.js').default;
const profile = { characters: {}, mods: snapshot.mods.map(Mod.fromHotUtils) };
const gameSettings = {};
snapshot.characters.forEach(row => {
  const kit = combat.getKit(row.baseId);
  profile.characters[row.baseId] = { baseID: row.baseId, playerValues: PlayerValues.fromHotUtils(row),
    optimizerSettings: savedTargets[row.baseId]?.optimizerSettings || { minimumModDots: 1, sliceMods: false, isLocked: false } };
  gameSettings[row.baseId] = { name: kit?.name || row.baseId, tags: kit?.categories || [] };
});
const coverageOnly = args.includes('--coverage-only');
const ids = option('--characters', '').split(',').filter(Boolean);
const ordered = ids.length ? ids : config.characters.length ? config.characters.map(row => row.id) : Object.keys(profile.characters).sort();
const selected = ordered.filter(id => combat.getKit(id) && profile.characters[id]?.playerValues.baseStats);
const missing = ordered.filter(id => !selected.includes(id));
if (missing.length) throw new Error(`Requested characters are missing a kit or roster stats: ${missing.join(', ')}`);
if (new Set(selected).size !== selected.length) throw new Error('Character selection contains duplicate IDs.');
const prepared = selected.map(id => {
  const saved = savedTargets[id]?.target;
  const target = Plan.deserialize(saved?.combatModel ? saved : { name: 'Combat Utility', combatModel: combat.forCharacter(id, settings[id]?.damageType || 1), upgradeMods: true });
  target.combatModel = resolveTeam(id, target, profile, gameSettings);
  return { id, target: target.serialize() };
});
const worker = vm.createContext({ self: {}, console, CombatUtility: combat, postMessage() {} });
vm.runInContext(fs.readFileSync('public/workers/optimizer.js', 'utf8'), worker);
const exports = vm.createContext({ self: {} });
vm.runInContext(fs.readFileSync('public/workers/exportOptimizationReport.js', 'utf8'), exports);
const allMods = profile.mods.map(mod => worker.deserializeMod(mod.serialize()));
const targets = prepared.map(({ id, target }) => ({ id, target: worker.deserializeTarget(target) }));
const started = performance.now();
let rows;
if (coverageOnly) {
  rows = targets.map(({ id, target }, index) => {
    const character = profile.characters[id];
    const summary = new ModSet(profile.mods.filter(mod => mod.characterID === id)).getSummary(character, target, false);
    const stats = combat.addStats({ ...character.playerValues.equippedStats, level: character.playerValues.level }, Object.values(summary).filter(Boolean));
    return { id, name: gameSettings[id].name, priority: index + 1, target: { combatModel: target.combatModel },
      after: { score: { combat: combat.evaluate(stats, target.combatModel), marginalUtilities: combat.marginals(stats, target.combatModel) } } };
  });
} else {
  let current;
  worker.postMessage = message => {
    const id = message.character?.baseID || message.character;
    if (message.type === 'Progress' && id && id !== current) {
      current = id; console.log(`Optimizing ${current}…`);
    }
  };
  const globalSettings = config.globalSettings || { modChangeThreshold: 0, lockUnselectedCharacters: false, forceCompleteSets: false };
  const assignments = worker.optimizeMods(allMods, profile.characters, targets, null, globalSettings);
  console.log('Preparing roster report…');
  rows = worker.buildOptimizationReport(allMods, profile.characters, targets, assignments, globalSettings).characters;
}
const unresolved = {};
rows.forEach(row => (row.after?.score?.combat?.scenarios || []).forEach(scenario =>
  (scenario.unresolvedStates || []).forEach(reason => { unresolved[reason] = (unresolved[reason] || 0) + 1; })));
const output = { generatedAt: new Date().toISOString(), allyCode, source, scoringVersion: 'combat-utility-v5-kits-15',
  engineHash, engineHashVersion: 3, preprocessing: combat.preprocessing,
  settingsHash: createHash('sha256').update(JSON.stringify({ config, selection: targets.map(row => row.id) })).digest('hex'),
  kitRevision: combat.kitRevision, mode: coverageOnly ? 'coverage-only' : 'roster-optimization',
  order: targets.map(row => row.id), settingsSource: config.sourceReport || 'Default targets in alphabetical order',
  globalSettings: config.globalSettings || { modChangeThreshold: 0, lockUnselectedCharacters: false, forceCompleteSets: false },
  milliseconds: Math.round(performance.now() - started),
  unresolvedStates: Object.entries(unresolved).sort((a, b) => b[1] - a[1]).map(([reason, scenarios]) => ({ reason, scenarios })),
  characters: rows.map(row => exports.compactCharacter(row, gameSettings[row.id]?.name || row.id)) };
if (fingerprintEngine() !== engineHash) throw new Error('Calculator files changed during this run. Repeat the run with stable files.');
fs.writeFileSync(outputPath, JSON.stringify(output));
console.log(`Saved ${output.characters.length} characters in ${output.milliseconds} ms: ${outputPath}`);
