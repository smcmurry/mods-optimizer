import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createFrontendLoader } from './lib/loadFrontend.mjs';
const load = createFrontendLoader();
const combat = load('src/domain/combatUtility.js');
const data = JSON.parse(fs.readFileSync('src/constants/generatedCombatPrograms.json'));
const raw = JSON.parse(fs.readFileSync('data/gameData-cache/effect.json')).data;
const near = (x, y) => assert.ok(Math.abs(x - y) < 1e-8, `${x} != ${y}`);
const stats = { health: 100000, protection: 5000, speed: 200, physDmg: 4000, specDmg: 3000,
  physCritChance: 0, specCritChance: 0, critDmg: 150, armor: 0, resistance: 0,
  potency: 0, tenacity: 100, accuracy: 0, critAvoid: 0, dodge: 0, level: 85 };
function isolated(characterId, abilityId, operationId) {
  const kit = data.characters[characterId];
  const ability = kit.abilities.find(a => a.id === abilityId);
  const index = ability.operations.findIndex(op => op.id === operationId);
  assert.ok(index >= 0, `${operationId} must be compiled`);
  const chosen = { ...ability, phases: { marker: [], state: [], stat: [], turnMeter: [], assist: [], output: [index] },
    basicDamage: [], basicRecovery: ability.kind === 'basic' ? [index] : [], basicTurnMeter: [] };
  const characters = Object.fromEntries(Object.entries(data.characters).map(([id, row]) => [id, { ...row, abilities: [], defaultRotation: {} }]));
  characters[characterId] = { ...kit, abilities: [chosen], defaultRotation: { [chosen.id]: 1 } };
  const context = vm.createContext({ self: { CharacterKitData: { ...data, characters } } });
  vm.runInContext(fs.readFileSync('src/domain/conditionalUtility.js', 'utf8'), context);
  vm.runInContext(fs.readFileSync('src/domain/characterMechanics.js', 'utf8'), context);
  return { mechanics: context.self.CharacterMechanics, operation: ability.operations[index] };
}
const sourceShield = raw.find(e => e.id === 'specialability_admiralraddus01_protectionup50pct');
assert.equal(sourceShield.type, 18);
assert.equal(sourceShield.multiplierAmountDecimal, 5000);
assert.ok(sourceShield.param.includes('MAX_HEALTH'));
assert.ok(sourceShield.expirationCondition.some(e => e.conditionType === 49 && e.conditionValue === '2'));
const shield = isolated('ADMIRALRADDUS', 'specialability_admiralraddus01', sourceShield.id);
assert.equal(shield.operation.stat, 'protection');
assert.equal(shield.operation.basisStat, 'health');
assert.equal(shield.operation.fromCaster, false);
const model = { ...combat.forCharacter('ADMIRALRADDUS'), leaderId: 'OTHER', incomingControlLoss: 0,
  missingHealth: 0, missingProtection: 0, horizonTurns: 5,
  team: [{ id: 'LUKESKYWALKER', stats: { ...stats, health: 20000 } }] };
const enemy = { ...model.matchups[0], critChance: 0, dodge: 0, physicalShare: 1, protectionBypass: 0 };
const result = shield.mechanics.evaluate(stats, model, enemy);
near(result.self.healingRate, 0);
near(result.self.protectionRecoveryRate, 0);
near(result.self.temporaryProtection, 50000);
near(result.allies[0].temporaryProtection, 10000);
near(result.self.ehp, 155000);
near(result.allies[0].ehp, 35000);
const injured = shield.mechanics.evaluate(stats, { ...model, missingHealth: 1, missingProtection: 1 }, enemy);
near(injured.self.temporaryProtection, result.self.temporaryProtection);
near(injured.allies[0].temporaryProtection, result.allies[0].temporaryProtection);
near(injured.self.healingRate, 0);
const bypassed = shield.mechanics.evaluate(stats, model, { ...enemy, protectionBypass: 0.25 });
near(bypassed.allies[0].ehp, 31250);
assert.equal(result.assumptions.temporaryProtectionPolicy, 'bounded-capacity');
// Nebit's explicit source query deliberately uses HIS Max Health rather than
// the recipient's. The general receiver-basis correction must retain it.
const nebit = isolated('CHIEFNEBIT', 'basicability_chiefnebit', 'basicability_chiefnebit_protection_buff_u03');
assert.equal(nebit.operation.contextMultiplier, 0.2);
const excludedTags = nebit.operation.targets.flatMap(index => data.selectors[index].tags).map(tag => tag.id);
const absent = Object.fromEntries(excludedTags.map(tag => [tag, 0]));
const nebitModel = { ...model, characterId: 'CHIEFNEBIT', stateTags: { CHIEFNEBIT: absent, LUKESKYWALKER: absent } };
const nebitResult = nebit.mechanics.evaluate(stats, nebitModel, enemy);
near(nebitResult.allies[0].temporaryProtection, 20000);
near(nebitResult.self.healingRate, 0);
const kitAudit = JSON.parse(fs.readFileSync('reports/characterKitAnalysis.json'));
const raddus = kitAudit.characters.ADMIRALRADDUS.abilities.find(a => a.id === 'specialability_admiralraddus01');
assert.ok(raddus.omitted.some(row => row.id === sourceShield.id && /depletion|expiry|stack/i.test(row.reason)));
for (const id of ['BARRISSOFFEE', 'CHIRRUTIMWE', 'GEONOSIANBROODALPHA']) {
  const omissions = kitAudit.characters[id].abilities.flatMap(a => a.omitted);
  assert.ok(omissions.some(row => /redistribution|equalization/i.test(row.reason)), `${id} equalization must be visible as a gap`);
}
const sourceNoKill = raw.find(e => e.id === 'specialability_brutus01_damage_leader');
assert.ok(sourceNoKill.param.includes('NO_KILL'));
assert.ok(kitAudit.characters.BRUTUS.abilities.flatMap(a => a.omitted).some(row => row.id === sourceNoKill.id && /lethal|NO_KILL|defeat/i.test(row.reason)));
// Independently isolate the source's channel/sentinel coefficients. Recipient
// predicates are deliberately fixed here; their source selection is covered
// by the separate selector tests, not claimed proven by this arithmetic test.
const lom = data.characters['4LOM'];
const attackAbility = lom.abilities.find(a => a.id === 'specialability_4lom01');
const originalDamage = attackAbility.operations.find(o => o.kind === 'damage');
const vulnerable = attackAbility.operations.find(o => o.id === 'specialabilty_4lom01_vulnerable_debuff_attack_all_mental_2turn_CE');
assert.equal(raw.find(e => e.id === vulnerable.id).additiveAmountDecimal, '-50000000');
assert.equal(vulnerable.channel, 'physical');
function channelDamage(statOperation, channel, critPolicy = 'normal', incomingPhysicalShare = 0.1) {
  const attack = { ...originalDamage, channel, crit: critPolicy, stat: channel === 'physical' ? 'physDmg' : 'specDmg' };
  const operations = statOperation ? [{ ...statOperation, targets: originalDamage.targets, context: [], conditions: [], when: [],
    gate: null, chance: 1, resistible: false, duration: 2 }, attack] : [attack];
  const chosen = { ...attackAbility, operations, phases: { marker: [], state: [], stat: statOperation ? [0] : [], turnMeter: [], assist: [], output: [operations.length - 1] } };
  const context = vm.createContext({ self: { CharacterKitData: { ...data, characters: { ...data.characters,
    '4LOM': { ...lom, abilities: [chosen], defaultRotation: { [chosen.id]: 1 } } } } } });
  vm.runInContext(fs.readFileSync('src/domain/conditionalUtility.js', 'utf8'), context);
  vm.runInContext(fs.readFileSync('src/domain/characterMechanics.js', 'utf8'), context);
  const m = { ...combat.forCharacter('4LOM'), team: [], leaderId: 'OTHER', incomingControlLoss: 0, missingHealth: 0, missingProtection: 0 };
  return context.self.CharacterMechanics.evaluate(stats, m, { ...m.matchups[0], armor: 0, resistance: 0, critAvoid: 0, dodge: 0,
    physicalShare: incomingPhysicalShare }).self.dps;
}
near(channelDamage(vulnerable, 'physical') / channelDamage(null, 'physical'), 1.5);
near(channelDamage(vulnerable, 'special') / channelDamage(null, 'special'), 1);
near(channelDamage(vulnerable, 'physical', 'never') / channelDamage(null, 'physical', 'never'), 1);
near(channelDamage(vulnerable, 'physical', 'normal', 0.9) / channelDamage(vulnerable, 'physical', 'normal', 0.1), 1);
const immuneKit = data.characters.AHSOKATANO;
const immune = immuneKit.abilities.flatMap(a => a.operations).find(o => o.id === 'uniqueability_ahsokatano01_attack_crit_avoidance_CE');
assert.ok(immune && immune.additive > 1000);
// Physical critical immunity is not universal immunity. A guaranteed special
// critical attack still crits; the physical attack does not.
near(channelDamage(immune, 'physical', 'always') / channelDamage(null, 'physical', 'always'), 2 / 3);
near(channelDamage(immune, 'special', 'always') / channelDamage(null, 'special', 'always'), 1);
const physicalDodge = immuneKit.abilities.flatMap(a => a.operations).find(o => o.id === 'leaderability_ahsokatano_dodge_u04');
assert.equal(raw.find(e => e.id === physicalDodge.id).param[0], 'DODGE_PERCENT_ADDITIVE');
near(channelDamage(physicalDodge, 'physical') / channelDamage(null, 'physical'), 0.86);
near(channelDamage(physicalDodge, 'special') / channelDamage(null, 'special'), 1);
console.log('Source Protection Up receiver basis, separate capacity, pool bypass, missing-pool independence and explicit accepted-mechanics gaps passed.');
