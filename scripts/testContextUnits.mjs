import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const conditional = require('../src/domain/conditionalUtility.js');
const combat = require('../src/domain/combatUtility.js');
const prepared = require('../src/constants/generatedCombatPrograms.json');
const source = Object.fromEntries(JSON.parse(fs.readFileSync('data/gameData-cache/effect.json')).data.map(row => [row.id, row]));
const stats = { health: 50000, protection: 50000, speed: 200, physDmg: 4000, specDmg: 3000,
  physCritChance: 35, specCritChance: 35, critDmg: 150, armor: 400, resistance: 300,
  potency: 80, tenacity: 50, accuracy: 0, critAvoid: 0, dodge: 0, level: 85 };
const close = (actual, expected, label) => assert.ok(Math.abs(actual - expected) < 1e-8, `${label}: ${actual} != ${expected}`);
function isolate(id, effectIds, inertAllies = []) {
  const characters = { ...prepared.characters };
  for (const ally of inertAllies) characters[ally] = { ...characters[ally], abilities: [] };
  const kit = characters[id], wanted = new Set(effectIds);
  const found = new Set();
  const abilities = kit.abilities.flatMap(ability => {
    // Keep the first passive application of repeated refresh effects. This
    // oracle checks source amount units, not ordered refresh event state.
    const operations = ability.operations.filter(op => wanted.has(op.id) && !found.has(op.id) && (found.add(op.id), true));
    if (!operations.length) return [];
    return [{ ...ability, operations, phases: { stat: operations.map((_, index) => index), marker: [], state: [], turnMeter: [], assist: [], output: [] },
      basicDamage: [], basicRecovery: [], basicTurnMeter: [] }];
  });
  assert.equal(found.size, wanted.size, `${id}: requested source effects exist`);
  characters[id] = { ...kit, abilities };
  const context = vm.createContext({ self: { CharacterKitData: { ...prepared, characters } } });
  vm.runInContext(fs.readFileSync('src/domain/conditionalUtility.js', 'utf8'), context);
  vm.runInContext(fs.readFileSync('src/domain/characterMechanics.js', 'utf8'), context);
  return context.self.CharacterMechanics;
}
function evaluate(engine, id, extra = {}, input = stats) {
  const model = { ...combat.forCharacter(id), leaderId: id, team: [], numberCrunch: false, ...extra };
  return engine.evaluate(input, model, model.matchups[0]);
}
for (const [id, effectId, coefficient, expected] of [
  ['BOBAFETT', 'leaderability_bobafett_health', 0.5, 70000],
  ['DARTHSIDIOUS', 'uniqueability_darthsidious01_health', 1, 90000],
  ['DOCTORAPHRA', 'leaderability_doctoraphra_max_health_SOB_increase_u01_CE', 0.3, 62000]
]) {
  assert.ok(source[effectId].param.includes('CONTEXT_MAX_MULTIPLIER'));
  assert.equal(source[effectId].contextMultiplierDecimal / 10000, coefficient);
  close(evaluate(isolate(id, [effectId]), id).self.statVector.health, expected, `${id}: 80% Potency source fraction`);
}
const raddusEffect = 'leaderability_admiralraddus_potency_buff_u06';
assert.equal(source[raddusEffect].contextMultiplierDecimal, 1200);
close(evaluate(isolate('ADMIRALRADDUS', [raddusEffect]), 'ADMIRALRADDUS').self.statVector.potency, 92, 'Raddus: +12 percentage points per Rogue One ally');
const b1Effect = 'uniqueability_b1battledroidv2_02_mechanical_menace_attack_crit_avoidance';
assert.equal(source[b1Effect].contextMultiplierDecimal, 50);
close(evaluate(isolate('B1BATTLEDROIDV2', [b1Effect]), 'B1BATTLEDROIDV2',
  { blackboards: { B1BATTLEDROIDV2: { b1_battle_droid_revive_stock: 80 } } }).self.statVector.physicalCritAvoid, 40, 'B1: +0.5 percentage points per stack');
const velEffects = ['uniqueability_vel01_rebel_fighter_attack_crit_chance', 'uniqueability_vel01_rebel_fighter_ability_crit_chance', 'uniqueability_vel01_rebel_fighter_crit_damage'];
for (const id of velEffects) assert.equal(source[id].contextMultiplierDecimal, 800);
const vel = evaluate(isolate('VEL', velEffects, ['CINTA']), 'VEL',
  { team: [{ id: 'CINTA', stats: { ...stats, physCritChance: 10, specCritChance: 70, critDmg: 200 } }] });
close(vel.allies[0].statVector.physCritChance, 12.8, 'Vel: 8% of physical Critical Chance');
close(vel.allies[0].statVector.specCritChance, 72.8, 'Vel: percentage additive maximum is 100 points');
close(vel.allies[0].statVector.critDmg, 212, 'Vel: 8% of 150% Critical Damage is 12 points');
assert.equal(conditional.statQueryKey({ stat: 'critAvoid', channel: 'physical' }), 'physicalCritAvoid');
assert.equal(conditional.statQueryKey({ stat: 'dodge', channel: 'special' }), 'specialDodge');
close(conditional.sourceStatValue(35, 'critAvoid'), 0.35, 'Percentage query conversion');
assert.equal(conditional.sourceStatValue(4000, 'physDmg'), 4000);
console.log('Source context units passed: Boba, Sidious, Aphra percentage-to-Health; Raddus/B1 percentage-point gains; asymmetric Vel sharing and channel query keys.');
