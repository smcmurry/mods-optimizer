import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const combat = require('../src/domain/combatUtility');
const mechanics = require('../src/domain/characterMechanics');
const data = require('../src/constants/generatedCombatPrograms.json');
const source = fs.readFileSync('src/domain/characterMechanics.js', 'utf8');
// Run the same calculator without memoized returns. All queries and recipients
// are recomputed, including stat sharing and rates changing between phases.
const guards = ['if (byCaster.has(caster)) return byCaster.get(caster);',
  'if (basicDamageCache.has(member)) return basicDamageCache.get(member);'];
let uncached = source;
guards.forEach(guard => { assert.ok(uncached.includes(guard)); uncached = uncached.replaceAll(guard, ''); });
const reference = vm.createContext({ self: { CharacterKitData: data } });
vm.runInContext(fs.readFileSync('src/domain/conditionalUtility.js', 'utf8'), reference);
vm.runInContext(uncached, reference);
const stats = { health: 65000, protection: 70000, speed: 190, physDmg: 7000, specDmg: 5500,
  physCritChance: 55, specCritChance: 35, critDmg: 150, armor: 550, resistance: 400,
  potency: 80, tenacity: 90, accuracy: 0, critAvoid: 0, level: 85 };
for (const id of combat.characterIds()) {
  for (const variant of [0, 1]) {
    const model = combat.forCharacter(id);
    const team = combat.getKit(id).recommendedTeams[0] || [];
    model.leaderId = team[0] || id;
    model.team = team.filter(ally => ally !== id && combat.getKit(ally)).slice(0, 4)
      .map(ally => ({ id: ally, tags: [], physicalShare: 1, stats: { ...stats, speed: 240 } }));
    const input = variant ? { ...stats, health: 95000, speed: 340, potency: 160, tenacity: 210, physCritChance: 110 } : stats;
    if (variant) {
      model.ultimateUses = 1; model.advantageUptime = 0.4; model.missingHealth = 0.8;
      model.blackboards = Object.fromEntries([id, ...model.team.map(ally => ally.id)].map(memberId => [memberId,
        Object.fromEntries(combat.getKit(memberId).abilities.flatMap(ability => ability.operations)
          .flatMap(op => op.context.filter(query => query.kind === 'blackboard').map(query => [query.key, 2])))]));
    }
    for (const enemy of model.matchups) {
      const actual = mechanics.evaluate(input, model, enemy);
      const expected = reference.self.CharacterMechanics.evaluate(input, model, enemy);
      assert.equal(JSON.stringify(actual), JSON.stringify(expected), `Memoization changed ${id}, variant ${variant}`);
      assert.equal(mechanics.evaluate(input, model, enemy, true), actual.utility, `Prepared scalar score changed ${id}, variant ${variant}`);
    }
  }
}
console.log('Cached/uncached mechanics are identical for all 341 kits, real teams, three opponents, and changed stats/states.');

let evaluations = 0;
const originalEvaluate = mechanics.evaluate;
mechanics.evaluate = (...args) => { evaluations++; return originalEvaluate(...args); };
const worker = vm.createContext({ self: {}, console, postMessage() {}, CombatUtility: combat });
vm.runInContext(fs.readFileSync('public/workers/optimizer.js', 'utf8'), worker);
vm.runInContext('clearCache(); self.bonuses = setBonuses;', worker);
const character = { baseID: 'GLHONDO', playerValues: { baseStats: stats, equippedStats: stats, level: 85, gearLevel: 13 },
  optimizerSettings: { sliceMods: false, minimumModDots: 1, isLocked: false } };
const target = worker.deserializeTarget({ name: 'Combat Utility', combatModel: combat.forCharacter('GLHONDO'),
  targetStats: [], primaryStatRestrictions: {}, setRestrictions: {}, upgradeMods: true });
const slots = ['square', 'arrow', 'diamond', 'triangle', 'circle', 'cross'];
const makeMods = prefix => slots.map((slot, i) => ({ id: prefix + i, slot, set: worker.self.bonuses.health,
  level: 15, pips: 6, tier: 1, primaryStat: worker.deserializeStat('Health %', '16%'),
  secondaryStats: [worker.deserializeStat('Speed', '+10')], characterID: null }));
const first = makeMods('first'), equivalent = makeMods('other');
[...first, ...equivalent].forEach(mod => worker.getFlatStatsFromMod(mod, character, target));
const score = worker.scoreModSet(first, character, target);
assert.equal(evaluations, 6, 'First score evaluates candidate and reference across three scenarios');
assert.equal(worker.scoreModSet(equivalent, character, target), score);
worker.getCombatSetResult(first, character, target, true);
assert.equal(evaluations, 9, 'Detailed metrics are generated on demand, not for every search candidate');
worker.getCombatSetResult(equivalent, character, target, true);
assert.equal(evaluations, 9, 'Equivalent totals and requested audit details reuse the computed result');
worker.activeAudit = worker.createCandidateAudit(target);
vm.runInContext('activeCandidateAudit = activeAudit;', worker);
worker.scoreModSet(first, character, target);
worker.scoreModSet(equivalent, character, target);
assert.equal(worker.activeAudit.completeEvaluations, 2, 'Cache hits must still record both candidate identities');
assert.equal(worker.activeAudit.topCandidates.length, 2);
const changedCharacter = { ...character, playerValues: { ...character.playerValues, equippedStats: { ...stats, health: stats.health + 10000 } } };
const changedScore = worker.scoreModSet(first, changedCharacter, target);
const changedStats = combat.addStats({ ...changedCharacter.playerValues.equippedStats, level: 85 }, worker.getFlatStatsFromModSet(first, changedCharacter, target));
assert.equal(changedScore, combat.score(changedStats, { ...changedCharacter.playerValues.equippedStats, level: 85 }, target.combatModel).total);
const otherModel = { ...target, combatModel: { ...target.combatModel, incomingControlLoss: 0.7 } };
assert.notEqual(worker.scoreModSet(first, character, otherModel), score, 'New assumptions cannot reuse another model’s cached score');
vm.runInContext('clearCache(); activeCandidateAudit = null;', worker);
first.forEach(mod => worker.getFlatStatsFromMod(mod, character, target));
const beforeReset = evaluations;
assert.equal(worker.scoreModSet(first, character, target), score);
assert.equal(evaluations - beforeReset, 6, 'Starting another character clears candidate and normalization caches');
mechanics.evaluate = originalEvaluate;
console.log('Worker cache checks passed: exact scores, equivalent totals, audit identities, changed baselines/models, and per-character reset.');
