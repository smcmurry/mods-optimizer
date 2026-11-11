import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const combat = require('../src/domain/combatUtility.js');
assert.equal(fs.readFileSync('public/workers/combatUtility.js', 'utf8'), fs.readFileSync('src/domain/combatUtility.js', 'utf8'));
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < Math.max(1e-9, Math.abs(expected) * 1e-10), `${actual} != ${expected}`);
const stats = { health: 50000, protection: 50000, speed: 200, physDmg: 4000, specDmg: 3000,
  physCritChance: 50, specCritChance: 25, critDmg: 150, armor: 637.5, resistance: 637.5,
  potency: 60, tenacity: 80, accuracy: 0, critAvoid: 0, level: 85 };
const model = combat.defaults('GLHONDO');
combat.validate(model);
const neutral = combat.evaluate(stats, model).scenarios[0].self;
close(neutral.expectedDamage, 2500);
close(neutral.actionRate, 2);
close(neutral.dps, 5000);
close(neutral.ehp, 160000);
close(combat.score(stats, stats, model).total, 100);
close(combat.mitigation(637.5), 0.5);
close(combat.mitigation(637.5, 85, 1), 0);
close(combat.resist(100, 90), 0.15);
close(combat.resist(100, 60), 0.4);
close(combat.resist(200, 0), 1);
// Equal proportional offense and survival improvements have equal utility.
close(combat.score({ ...stats, physDmg: 4040 }, stats, model).total, 101);
close(combat.score({ ...stats, health: 50500, protection: 50500 }, stats, model).total, 101);
const capped = { ...stats, physCritChance: 120 };
close(combat.marginals(capped, model).physCritChance.logUtilityGain, 0);
close(combat.marginals(stats, model).potency.logUtilityGain, 0);
const effects = { ...model, debuffValue: 1, incomingControlLoss: 0.5 };
assert.ok(combat.marginals(stats, effects).potency.logUtilityGain > 0);
assert.ok(combat.marginals({ ...stats, tenacity: 140 }, effects).tenacity.logUtilityGain > 0);
close(combat.marginals(stats, effects).tenacity.logUtilityGain, 0);
close(combat.marginals({ ...stats, potency: 90 }, effects).potency.logUtilityGain, 0);
assert.ok(combat.marginals(stats, model).critAvoid.logUtilityGain > 0);
const special = { ...model, physicalShare: 0 };
close(combat.evaluate(stats, special).scenarios[0].self.expectedDamage, 1687.5);
close(combat.marginals(stats, special).physDmg.logUtilityGain, 0);
const threshold = { ...model, openingTurnValue: 1, matchups: [{ ...model.matchups[0], speed: 205 }] };
close(combat.score({ ...stats, speed: 210 }, stats, threshold).total, 210);
const weighted = { ...model, matchups: [model.matchups[0], { ...model.matchups[0], weight: 3, armor: 0 }] };
close(combat.evaluate(stats, weighted).utility, (combat.evaluate(stats, model).utility + 3 * combat.evaluate(stats, { ...model, matchups: [weighted.matchups[1]] }).utility) / 4);
assert.throws(() => combat.validate({ ...model, turnMeterGain: 1 }));
assert.throws(() => combat.validate({ ...model, matchups: [{ ...model.matchups[0], weight: 0 }] }));
assert.throws(() => combat.validate({ ...model, teamIds: ['A', 'A'] }));

const r2 = { ...combat.defaults('R2D2_LEGENDARY'), teamIds: ['ALLY', 'OTHER'], team: [
  { id: 'ALLY', tags: ['Rebel', 'Droid'], physicalShare: 1, stats },
  { id: 'OTHER', tags: ['Sith'], physicalShare: 1, stats }
] };
const snapshot = JSON.stringify({ stats, r2 });
const shared = combat.evaluate(stats, r2);
close(shared.numberCrunchSharedStats.health, 6000);
close(shared.numberCrunchSharedStats.protection, 6000);
close(shared.numberCrunchSharedStats.physDmg, 440);
assert.ok(shared.scenarios[0].allies[0].dps > neutral.dps);
close(shared.scenarios[0].allies[1].dps, neutral.dps);
close(combat.evaluate(stats, { ...r2, bonusActionRate: 2 }).scenarios[0].allies[0].dps, shared.scenarios[0].allies[0].dps);
assert.equal(JSON.stringify({ stats, r2 }), snapshot);
console.log('Combat math passed: damage channels, EHP, crit caps, resist floor, effects, speed thresholds, weighted matchups, equal percentage utility, R2 sharing and independent ally assumptions.');

const context = vm.createContext({ self: {}, console, postMessage() {}, CombatUtility: combat });
vm.runInContext(fs.readFileSync('public/workers/optimizer.js', 'utf8'), context);
vm.runInContext('self.setBonuses = setBonuses; clearCache();', context);
const character = { baseID: 'GLHONDO', playerValues: { baseStats: stats, equippedStats: stats, level: 85, gearLevel: 13 },
  optimizerSettings: { sliceMods: false, minimumModDots: 1, isLocked: false } };
const target = context.deserializeTarget({ name: 'Combat Utility', combatModel: model, targetStats: [], primaryStatRestrictions: {}, setRestrictions: {}, upgradeMods: true });
const slots = ['square', 'arrow', 'diamond', 'triangle', 'circle', 'cross'];
const makeSet = (sets, prefix) => sets.map((name, i) => ({ id: prefix + i, slot: slots[i], set: context.self.setBonuses[name],
  level: 15, pips: 6, tier: 1, primaryStat: context.deserializeStat('Health %', '0%'), secondaryStats: [], characterID: prefix === 'h' ? 'GLHONDO' : null }));
const health = makeSet(Array(6).fill('health'), 'h');
const speed = makeSet(['speed', 'speed', 'speed', 'speed', 'health', 'health'], 's');
const offense = makeSet(['offense', 'offense', 'offense', 'offense', 'health', 'health'], 'o');
const mods = [...health, ...speed, ...offense];
mods.forEach(mod => context.getFlatStatsFromMod(mod, character, target));
close(context.scoreModSet(health, character, target), 115);
close(context.scoreModSet(speed, character, target), 115.5);
close(context.scoreModSet(offense, character, target), 120.75);
// Arbitrarily strong contradictory Kyber evidence cannot enter V3 scoring.
target.metaPreferences = { version: 2, setStrength: 100000, primaryStrength: 100000, candidatePrimaryStrength: 100000,
  confidence: 1, epsilon: 0.001, loadouts: { '1-1-1': { probability: 1 } }, primaries: {} };
close(context.metaModSetPrior(offense, target), 0);
close(context.metaCandidatePrior(offense[0], target), 0);
close(context.scoreModSet(offense, character, target), 120.75);
context.validation = { GLHONDO: target.metaPreferences };
vm.runInContext('runValidationMeta = validation;', context);
const settings = { modChangeThreshold: 0, lockUnselectedCharacters: false, forceCompleteSets: false };
const result = context.optimizeMods(mods, { GLHONDO: character }, [{ id: 'GLHONDO', target }], null, settings);
assert.equal(result[0].candidateAudit.recommendedCandidate.loadoutId, '1-2');
assert.equal(result[0].candidateAudit.recommendedCandidate.score.setPrior, 0);
assert.equal(result[0].candidateAudit.recommendedCandidate.score.primaryPrior, 0);
const report = context.buildOptimizationReport(mods, { GLHONDO: character }, [{ id: 'GLHONDO', target }], result, settings);
assert.equal(report.schemaVersion, 3);
assert.equal(report.characters[0].after.score.combat.scenarios[0].self.actionRate, 2);
assert.ok(report.characters[0].after.score.marginalUtilities.speed.priority > 0);
assert.equal(report.characters[0].before.score.observedLoadoutProbability, 1);
assert.ok(report.characters[0].scoreChange.delta > 0);
assert.ok(!JSON.stringify(report).includes('NaN'));
console.log('Real worker search and export passed: native set bonuses, no popularity priors, V3 metrics, marginal priorities and validation-only Kyber data.');

const domain = vm.createContext({ CombatUtility: combat, TargetStat: class {}, Stat: {} });
vm.runInContext(fs.readFileSync('src/utils/areObjectsEquivalent.js', 'utf8').replace('export default ', ''), domain);
vm.runInContext(fs.readFileSync('src/domain/OptimizationPlan.js', 'utf8').replace(/^import .*;$/gm, '').replace('export default OptimizationPlan;', 'this.OptimizationPlan = OptimizationPlan;'), domain);
const plan = domain.OptimizationPlan.deserialize({ name: 'Combat Utility', combatModel: r2, metaPreferences: target.metaPreferences });
assert.equal(plan.metaPreferences, null);
assert.equal(plan.rename('Team R2').combatModel, plan.combatModel);
assert.equal(plan.withUpgradeMods(false).combatModel, plan.combatModel);
assert.equal(JSON.stringify(domain.OptimizationPlan.deserialize(plan.serialize()).combatModel), JSON.stringify(r2));
assert.equal(plan.isBlank(), false);
domain.characterSettings = { GLHONDO: { targets: [domain.OptimizationPlan.deserialize({ name: 'Combat Utility', combatModel: model })] } };
vm.runInContext(fs.readFileSync('src/utils/refreshLegacyMetaTargets.js', 'utf8').replace(/^import .*;$/gm, '').replace('export default ', ''), domain);
const custom = { id: 'GLHONDO', target: domain.OptimizationPlan.deserialize({ name: 'Custom', health: 90 }) };
const legacy = { id: 'GLHONDO', target: domain.OptimizationPlan.deserialize({ name: 'Kyber Meta', health: 27, primaryStatRestrictions: { arrow: 'Speed' }, setRestrictions: { health: 3 } }) };
const profile = { selectedCharacters: [legacy, custom, { id: 'R2D2_LEGENDARY', target: plan }], characters: {},
  withSelectedCharacters(selectedCharacters) { return { ...this, selectedCharacters }; } };
const migrated = domain.refreshLegacyMetaTargets(profile);
assert.equal(migrated.selectedCharacters[0].target.name, 'Combat Utility');
assert.equal(migrated.selectedCharacters[0].target.combatModel.version, 3);
assert.equal(Object.keys(migrated.selectedCharacters[0].target.setRestrictions).length, 0);
assert.equal(Object.keys(migrated.selectedCharacters[0].target.primaryStatRestrictions).length, 0);
assert.equal(migrated.selectedCharacters[1], custom);
assert.equal(JSON.stringify(migrated.selectedCharacters[2].target.combatModel), JSON.stringify(combat.upgradeModel(r2, 'R2D2_LEGENDARY')));
console.log('Saved model checks passed: round trips, rename, upgrade settings, legacy migration, custom-plan preservation and cleared inherited restrictions.');

// Exercise the real frontend domain classes, including percentage conversion,
// completed bonuses and projected slicing, against the worker's implementation.
const frontend = vm.createContext({ CombatUtility: combat, modStats: {}, modSets: {}, modSlots: {} });
const load = (path, name) => vm.runInContext(fs.readFileSync(path, 'utf8').replace(/^import .*;$/gm, '')
  .replace(/export const /g, 'const ').replace(new RegExp(`export default ${name};`), `this.${name} = ${name};`).replace('export default ', ''), frontend);
load('src/constants/statTypeMap.js', 'statTypeMap');
load('src/domain/Stat.js', 'Stat');
load('src/domain/SetBonus.js', 'SetBonus');
load('src/constants/setbonuses.js', 'setBonuses');
load('src/utils/groupByKey.js', 'groupByKey');
load('src/domain/Mod.js', 'Mod');
load('src/domain/ModSet.js', 'ModSet');
const withStats = offense.map((mod, i) => ({ ...mod, pips: 5, level: i === 0 ? 12 : 15,
  primaryStat: context.deserializeStat(i === 1 ? 'Speed' : 'Health %', i === 1 ? '+30' : '5.88%'),
  secondaryStats: [context.deserializeStat('Offense %', '1.42%'), context.deserializeStat('Speed', '+5')] }));
const frontMods = withStats.map(mod => new frontend.Mod(mod.id, mod.slot, frontend.setBonuses[mod.set.name], mod.level, mod.pips,
  new frontend.Stat(mod.primaryStat.type, String(mod.primaryStat.value) + (mod.primaryStat.isPercent ? '%' : '')),
  mod.secondaryStats.map(stat => new frontend.Stat(stat.type, String(stat.value) + (stat.isPercent ? '%' : ''))), mod.characterID));
const slicingCharacter = { ...character, optimizerSettings: { ...character.optimizerSettings, sliceMods: true } };
for (const upgrades of [false, true]) {
  vm.runInContext('clearCache()', context);
  const workingCharacter = { ...slicingCharacter, optimizerSettings: { ...slicingCharacter.optimizerSettings, sliceMods: upgrades } };
  const workingTarget = { ...target, upgradeMods: upgrades };
  withStats.forEach(mod => context.getFlatStatsFromMod(mod, workingCharacter, workingTarget));
  const workerScore = context.scoreModSet(withStats, workingCharacter, workingTarget);
  close(new frontend.ModSet(frontMods).getOptimizationValue(slicingCharacter, target, upgrades), workerScore);
}
domain.ModSet = frontend.ModSet;
vm.runInContext(fs.readFileSync('src/utils/resolveCombatTeam.js', 'utf8').replace(/^import .*;$/gm, '').replace('export default ', ''), domain);
const refreshedWithStats = domain.refreshLegacyMetaTargets({ ...profile, characters: { GLHONDO: character }, mods: [],
  selectedCharacters: [legacy] });
assert.ok(refreshedWithStats.selectedCharacters[0].target.rawSpeed > 0);
console.log('Frontend/worker parity passed for actual stat conversion, set bonuses, leveling and slicing.');

const pirateIds = ['GLHONDO', 'VANE', 'BRUTUS', 'SM33', 'CAPTAINSILVO'];
const pirateProfile = { mods: [], characters: Object.fromEntries(pirateIds.map(id => [id, { ...character, baseID: id }])) };
const pirateTarget = domain.OptimizationPlan.deserialize({ name: 'Combat Utility', combatModel: combat.forCharacter('GLHONDO') });
const autoTeam = domain.resolveCombatTeam('GLHONDO', pirateTarget, pirateProfile, {});
assert.equal(autoTeam.team.length, 4);
assert.equal(autoTeam.leaderId, 'GLHONDO');
assert.equal(autoTeam.teamSource, 'game-example-squad');
assert.equal(autoTeam.teamIds.length, 0, 'Automatic team must not replace the manual selection');
assert.equal(JSON.stringify([...autoTeam.resolvedTeamIds].sort()), JSON.stringify(pirateIds.slice(1).sort()));
const noAuto = domain.resolveCombatTeam('GLHONDO', { ...pirateTarget, combatModel: { ...pirateTarget.combatModel, autoTeam: false } }, pirateProfile, {});
assert.equal(noAuto.team.length, 0);
const threeMember = domain.resolveCombatTeam('GLHONDO', { ...pirateTarget, combatModel: { ...pirateTarget.combatModel,
  battleContext: { type: 'TERRITORY_TOURNAMENT_BATTLE', squadSize: 3, eventId: null } } }, pirateProfile, {});
assert.equal(threeMember.team.length, 2, 'A declared three-member squad must not acquire four automatic allies');
assert.equal(combat.evaluate(stats, threeMember).kitConfidence.expectedTeamMembers, 3);
assert.throws(() => combat.validate({ ...threeMember, teamIds: pirateIds.slice(1) }), /squad size/);
console.log('Automatic team checks passed: actual game squads, four real roster allies, explicit leader, and opt-out.');

// Verify the application captures current teammate stats and rejects bad
// selections before starting a worker or displaying optimization progress.
const actions = [];
let request, workers = 0;
const exports = {};
const actionContext = vm.createContext({ exports, module: { exports }, process: { env: {} },
  Worker: class { constructor() { workers++; } postMessage(value) { request = value; } },
  require(path) {
    const modules = {
      './app': { showError: message => ({ type: 'ERROR', message }) },
      '../../utils/refreshLegacyMetaTargets': { default: domain.refreshLegacyMetaTargets },
      '../../utils/resolveCombatTeam': { default: domain.resolveCombatTeam },
      '../../domain/combatUtility': { default: combat },
      '../../domain/ModSet': { default: frontend.ModSet },
      '../../domain/OptimizationPlan': { default: domain.OptimizationPlan },
      '../../constants/characterSettings': { default: {} },
      '../../constants/generatedMetaTargets.json': { default: { characters: {} } }
    };
    return { __esModule: true, ...(modules[path] || {}) };
  }
});
const transformed = require('@babel/core').transformSync(fs.readFileSync('src/state/actions/optimize.js', 'utf8'), {
  babelrc: false, configFile: false, plugins: ['@babel/plugin-transform-react-jsx', '@babel/plugin-transform-modules-commonjs']
}).code;
vm.runInContext(transformed, actionContext);
const actor = { ...character, baseID: 'R2D2_LEGENDARY' };
const stateProfile = { ...profile, allyCode: '123', mods: [], characters: { R2D2_LEGENDARY: actor, ALLY: character },
  selectedCharacters: [{ id: 'R2D2_LEGENDARY', target: domain.OptimizationPlan.deserialize({ name: 'Combat Utility', combatModel: { ...r2, teamIds: ['ALLY'], team: [] } }) }] };
const state = { profile: stateProfile, gameSettings: { ALLY: { tags: ['Rebel'] } } };
exports.optimizeMods()(action => actions.push(action), () => state);
assert.equal(workers, 1);
assert.equal(request.selectedCharacters[0].target.combatModel.team.length, 1);
assert.equal(request.selectedCharacters[0].target.combatModel.team[0].stats.health, stats.health);
assert.ok(request.selectedCharacters[0].target.speed > 0);
assert.equal(stateProfile.selectedCharacters[0].target.combatModel.team.length, 0);
stateProfile.selectedCharacters[0].target.combatModel.teamIds = ['MISSING'];
exports.optimizeMods()(action => actions.push(action), () => state);
assert.equal(workers, 1);
assert.equal(actions.at(-1).type, 'ERROR');
assert.ok(actions.at(-1).message.includes('missing from the roster'));
console.log('Application request checks passed: current teammate snapshots, contextual priorities, unchanged input model and validation before worker startup.');

const formExports = {};
const formContext = vm.createContext({ exports: formExports, module: { exports: formExports },
  require(path) { return path === 'react' ? require('react') : combat; }
});
vm.runInContext(require('@babel/core').transformSync(fs.readFileSync('src/components/CombatModelForm/CombatModelForm.js', 'utf8'), {
  babelrc: false, configFile: false, plugins: ['@babel/plugin-transform-react-jsx', '@babel/plugin-transform-modules-commonjs']
}).code, formContext);
const form = new formExports.default({ model: weighted });
Object.entries(weighted).filter(([, value]) => typeof value === 'number').forEach(([key, value]) => { form.inputs[key] = { valueAsNumber: value }; });
form.state.scenarios.forEach(scenario => Object.entries(scenario.enemy).forEach(([key, value]) => {
  form.inputs['enemy-' + scenario.key + '-' + key] = { valueAsNumber: value };
}));
form.team = { selectedOptions: [] };
assert.equal(form.read().matchups.length, 2);
form.state.scenarios = form.state.scenarios.slice(1);
assert.equal(form.read().matchups[0].weight, 3);
assert.equal(form.read().matchups[0].armor, 0);
console.log('Matchup editor checks passed: multiple enemies and stable values after removing a scenario.');
const immuneFormModel = combat.forCharacter('GLREY');
const originalShares = JSON.stringify(immuneFormModel.incomingControlWeights);
const immuneForm = new formExports.default({ model: immuneFormModel });
Object.entries(immuneFormModel).filter(([, value]) => typeof value === 'number').forEach(([key, value]) => { immuneForm.inputs[key] = { valueAsNumber: value }; });
immuneForm.state.scenarios.forEach(scenario => Object.entries(scenario.enemy).forEach(([key, value]) => {
  immuneForm.inputs['enemy-' + scenario.key + '-' + key] = { valueAsNumber: value };
}));
immuneForm.team = { selectedOptions: [] };
for (const [key, value] of Object.entries({ stun: 100, fear: 0, daze: 0, abilityBlock: 0 })) immuneForm.inputs['control-' + key] = { valueAsNumber: value };
assert.equal(JSON.stringify(immuneForm.read().incomingControlWeights), JSON.stringify({ stun: 100, fear: 0, daze: 0, abilityBlock: 0 }));
assert.equal(JSON.stringify(immuneFormModel.incomingControlWeights), originalShares, 'Editing control assumptions must not mutate the existing plan');
console.log('Control editor checks passed: explicit shares are saved, validated and leave the original plan unchanged.');
immuneForm.battleType = { value: 'TERRITORY_TOURNAMENT_BATTLE' };
immuneForm.squadSize = { value: '3', valueAsNumber: 3 };
immuneForm.eventId = { value: '  ' };
assert.equal(JSON.stringify(immuneForm.read().battleContext), JSON.stringify({ type: 'TERRITORY_TOURNAMENT_BATTLE', squadSize: 3, eventId: null }));
assert.equal(immuneFormModel.battleContext, undefined, 'Editing mode must preserve the original plan');
immuneForm.battleType.value = '';
assert.equal(immuneForm.read().battleContext, null);
console.log('Battle-mode editor checks passed: explicit mode/size, unspecified context and unchanged saved plan.');
