import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const combat = require('../src/domain/combatUtility');
const data = require('../src/constants/generatedCharacterKits.json');
const analysis = JSON.parse(fs.readFileSync('reports/characterKitAnalysis.json', 'utf8'));
const stats = { health: 50000, protection: 60000, speed: 300, physDmg: 7000, specDmg: 6000,
  physCritChance: 50, specCritChance: 30, critDmg: 150, armor: 500, resistance: 400,
  potency: 100, tenacity: 120, accuracy: 0, critAvoid: 0, level: 85 };
const close = (a, b) => assert.ok(Math.abs(a - b) < Math.max(1e-8, Math.abs(b) * 1e-8), `${a} != ${b}`);
function assertFiniteNumbers(value, path) {
  if (typeof value === 'number') assert.ok(Number.isFinite(value), `Nonfinite report value ${path}`);
  else if (value && typeof value === 'object') Object.entries(value).forEach(([key, child]) => assertFiniteNumbers(child, `${path}.${key}`));
}
assert.equal(data.revision, analysis.revision);
assert.deepEqual([...combat.characterIds()].sort(), Object.keys(analysis.characters).sort());
const historical = require('../src/constants/generatedMetaTargets.json');
Object.keys(historical.characters).forEach(id => assert.ok(combat.getKit(id), `Missing kit ${id}`));
const started = performance.now();
for (const id of combat.characterIds()) {
  const model = combat.forCharacter(id);
  combat.validate(model);
  const result = combat.evaluate(stats, model);
  assert.ok(Number.isFinite(result.utility) && result.utility > 0, `Invalid utility ${id}`);
  result.scenarios.forEach(scenario => {
    for (const [key, value] of Object.entries(scenario.self)) if (typeof value === 'number') assert.ok(Number.isFinite(value), `${id}: ${key}`);
  });
  assert.equal(result.scenarios.length, 3);
  assertFiniteNumbers(result, id);
}
console.log(`All ${combat.characterIds().length} source kits produce finite utility across three scenarios (${Math.round(performance.now() - started)} ms).`);

const kit = id => combat.getKit(id);
const basic = id => kit(id).abilities.find(a => a.kind === 'basic');
close(basic('R2D2_LEGENDARY').operations.find(op => op.kind === 'damage').multiplier, 2.023);
close(basic('GRIEVOUS').operations.find(op => op.kind === 'damage').multiplier, 0.2);
assert.equal(basic('GRIEVOUS').operations.find(op => op.kind === 'damage').stat, 'health');
assert.equal(basic('R2D2_LEGENDARY').operations.find(op => op.kind === 'damage').resistible, false, 'Direct attacks do not test Potency/Tenacity');
assert.equal(basic('R2D2_LEGENDARY').operations.find(op => op.kind === 'control').resistible, true, 'Stun tests resistance');
assert.ok(kit('EMBO').abilities.flatMap(a => a.operations).some(op => op.kind === 'damage' && op.stat === 'protection' && op.crit === 'never'));
assert.ok(kit('GRANDMASTERLUKE').abilities.find(a => a.name === 'Indomitable Blast').operations.some(op => op.kind === 'damage' && op.crit === 'always'));
const grievous = combat.forCharacter('GRIEVOUS');
const damage = (s, m) => combat.evaluate(s, m).scenarios[0].self.expectedDamage;
close(damage({ ...stats, physDmg: 14000, specDmg: 12000 }, grievous), damage(stats, grievous));
assert.ok(damage({ ...stats, health: 100000 }, grievous) > 1.9 * damage(stats, grievous));
const recoveryBlocked = combat.evaluate(stats, grievous).scenarios[0];
assert.ok(recoveryBlocked.enemyRecoveryPreventedRate > 0, 'Healing immunity must contribute to U');
assert.equal(combat.evaluate(stats, { ...grievous, enemyRecoveryFraction: 0 }).scenarios[0].enemyRecoveryPreventedRate, 0);
assert.ok(combat.evaluate(stats, { ...grievous, enemyRecoveryFraction: 0 }).utility < combat.evaluate(stats, grievous).utility);
close(damage(stats, combat.forCharacter('HERMITYODA')), 0);
for (const id of ['HERMITYODA', 'C3POLEGENDARY']) assert.equal(basic(id).operations.some(op => op.kind === 'damage'), false);
const yoda = { ...combat.forCharacter('HERMITYODA'), leaderId: 'JEDIKNIGHTREVAN', teamIds: ['JEDIKNIGHTREVAN', 'GRANDMASTERYODA'],
  team: ['JEDIKNIGHTREVAN', 'GRANDMASTERYODA'].map(id => ({ id, tags: [], physicalShare: 1, stats })) };
const yodaResult = combat.evaluate(stats, yoda);
assert.ok(yodaResult.scenarios[0].allies.some(ally => ally.healingRate > 0 && ally.protectionRecoveryRate > 0));
assert.ok(yodaResult.scenarios[0].self.assistDamageRate > 0);
assert.ok(combat.marginals(stats, yoda).speed.marginalLogUtilityPerPoint > 0);
close(combat.marginals(stats, yoda).physDmg.marginalLogUtilityPerPoint, 0);
const barriss = combat.forCharacter('BARRISSOFFEE');
const barrissResult = combat.evaluate(stats, barriss).scenarios[0];
assert.ok(barrissResult.self.healingRate > 0);
assert.ok(combat.evaluate({ ...stats, health: 100000 }, barriss).scenarios[0].self.healingRate > barrissResult.self.healingRate);
const r2 = { ...combat.forCharacter('R2D2_LEGENDARY'), teamIds: ['PRINCESSLEIA'], team: [{ id: 'PRINCESSLEIA', tags: [], physicalShare: 1, stats }] };
const shared = combat.evaluate(stats, r2);
close(shared.numberCrunchSharedStats.health, 6000);
assert.ok(shared.scenarios[0].allies[0].statVector.health > stats.health);
const dark = combat.forCharacter('DARKTROOPER');
const darkResult = combat.evaluate(stats, dark).scenarios[0];
close(darkResult.self.statVector.health, stats.health / 4);
assert.ok(darkResult.self.actionRate < 10, '10% TM per stack must not become 100 times the normal action rate');
assert.ok(basic('DARKTROOPER').operations.filter(op => op.kind === 'damage').every(op => op.crit === 'advantage'));
assert.equal(JSON.stringify(stats), JSON.stringify({ health: 50000, protection: 60000, speed: 300, physDmg: 7000, specDmg: 6000,
  physCritChance: 50, specCritChance: 30, critDmg: 150, armor: 500, resistance: 400, potency: 100, tenacity: 120, accuracy: 0, critAvoid: 0, level: 85 }));
const simple = combat.defaults('TEST');
const gradient = combat.marginals(stats, simple);
close(gradient.health.marginalLogUtilityPerPoint, gradient.protection.marginalLogUtilityPerPoint);
assert.equal(gradient.health.step, 1);
assert.equal(gradient.protection.step, 1);
assert.ok(combat.marginals(stats, combat.forCharacter('R2D2_LEGENDARY')).potency.marginalLogUtilityPerPoint > 0);
assert.ok(combat.marginals(stats, combat.forCharacter('GLHONDO')).tenacity.marginalLogUtilityPerPoint > 0);
assert.throws(() => combat.validate({ ...barriss, missingHealth: 2 }));
console.log('Kit-specific checks passed: real coefficients, Health attacks, non-attacking supports, healing, Protection recovery, assists, R2 sharing, Dark Trooper stacks, Potency/Tenacity, and per-point derivatives.');

// Browser worker loads exactly the same kit library and mathematical engine.
const sandbox = vm.createContext({ self: {}, console, postMessage() {} });
for (const file of ['characterKits.js', 'conditionalUtility.js', 'characterMechanics.js', 'combatUtility.js']) vm.runInContext(fs.readFileSync('public/workers/' + file, 'utf8'), sandbox);
close(sandbox.self.CombatUtility.evaluate(stats, yoda).utility, yodaResult.utility);
assert.equal(sandbox.self.CombatUtility.kitRevision, combat.kitRevision);
sandbox.CombatUtility = sandbox.self.CombatUtility;
vm.runInContext(fs.readFileSync('public/workers/optimizer.js', 'utf8'), sandbox);
vm.runInContext('clearCache(); self.bonuses = setBonuses;', sandbox);
const character = { baseID: 'GLHONDO', playerValues: { baseStats: stats, equippedStats: stats, level: 85, gearLevel: 13 },
  optimizerSettings: { sliceMods: false, minimumModDots: 1, isLocked: false } };
const target = sandbox.deserializeTarget({ name: 'Combat Utility', combatModel: combat.forCharacter('GLHONDO'), targetStats: [],
  primaryStatRestrictions: {}, setRestrictions: {}, upgradeMods: true });
const slots = ['square', 'arrow', 'diamond', 'triangle', 'circle', 'cross'];
const mods = ['health', 'speed', 'offense'].flatMap((set, j) => slots.map((slot, i) => ({ id: set + i, slot,
  set: sandbox.self.bonuses[set], level: 15, pips: 6, tier: 1, primaryStat: sandbox.deserializeStat('Health %', '0%'),
  secondaryStats: [sandbox.deserializeStat('Speed', '+10')], characterID: j === 0 ? 'GLHONDO' : null })));
const settings = { modChangeThreshold: 0, lockUnselectedCharacters: false, forceCompleteSets: false };
const result = sandbox.optimizeMods(mods, { GLHONDO: character }, [{ id: 'GLHONDO', target }], null, settings);
assert.ok(result[0].assignedMods.length === 6);
const report = sandbox.buildOptimizationReport(mods, { GLHONDO: character }, [{ id: 'GLHONDO', target }], result, settings);
assert.equal(report.scoringVersion, 'combat-utility-v5-kits-15');
assert.equal(report.characters[0].after.score.combat.kitRevision, data.revision);
assert.ok(report.characters[0].after.score.combat.scenarios[0].self.kitCoverage.omittedEffects > 0);
assert.ok(report.characters[0].after.score.combat.scenarios[0].unresolvedStates.length > 0);
console.log('Worker parity, completed-set search, and exported kit coverage/assumptions passed.');
