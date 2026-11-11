import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createFrontendLoader } from './lib/loadFrontend.mjs';
const load = createFrontendLoader();
function loadMechanics(testContext) {
  vm.runInContext(fs.readFileSync('src/domain/conditionalUtility.js', 'utf8'), testContext);
  vm.runInContext(fs.readFileSync('src/domain/characterMechanics.js', 'utf8'), testContext);
}
const combat = load('src/domain/combatUtility.js');
const resolveTeam = load('src/utils/resolveCombatTeam.js').default;
const stats = { health: 50000, protection: 50000, speed: 200, physDmg: 4000, specDmg: 3000,
  physCritChance: 50, specCritChance: 25, critDmg: 150, armor: 637.5, resistance: 637.5,
  potency: 60, tenacity: 80, accuracy: 0, critAvoid: 0, level: 85 };
const model = { ...combat.forCharacter('GLREY'), leaderId: 'OTHER', incomingControlLoss: 0, missingHealth: 0, missingProtection: 0,
  unitValues: { GLREY: { relicLevel: 0 } } };
const prepared = load('src/constants/generatedCombatPrograms.json');
assert.equal(prepared.tagKinds.taunt_buff, 2);
assert.equal(prepared.tagKinds.vulnerable_debuff_part1, 1);
assert.equal(prepared.stateTagClasses.defense_down_part2, 1, 'A stat component tied to the removal of its required debuff inherits that source class');
assert.equal(prepared.stateTagClasses.vulnerable_debuff_part2, 1);
assert.equal(prepared.tagKinds.ignore_me, 0, 'Arbitrary markers must remain unresolved');
const kit = prepared.characters.GLREY;
const isolated = { ...prepared, characters: { ...prepared.characters, GLREY: { ...kit,
  abilities: kit.abilities.filter(ability => ability.id === 'uniqueability_galacticlegend01') } } };
const context = vm.createContext({ self: { CharacterKitData: isolated } });
loadMechanics( context);
const zero = context.self.CharacterMechanics.evaluate(stats, model, model.matchups[0]);
model.unitValues.GLREY.relicLevel = 10;
const ten = context.self.CharacterMechanics.evaluate(stats, model, model.matchups[0]);
// Independent expectation from the pinned localized kit: +10% Health and
// Protection per actual relic level, and 30% reduction to incoming damage.
assert.equal(zero.self.statVector.health, 50000);
assert.equal(ten.self.statVector.health, 100000);
assert.equal(ten.self.statVector.protection, 100000);
assert.equal(ten.self.statVector.incomingDamageMultiplier, 0.7);
assert.equal(ten.self.ehp / zero.self.ehp, 2);
assert.ok(!ten.unresolvedStates.some(reason => reason.includes('uniqueability_galacticlegend01_blackboard')));
assert.ok(!ten.unresolvedStates.some(reason => /uniqueability_galacticlegend01_(health|protection)_increase/.test(reason)), 'One-time passive installation guards are not unknown combat states');
const rawEhp = (stats.health + stats.protection) / (0.5 * 1.25);
assert.ok(Math.abs(zero.self.ehp - rawEhp / 0.7) < 1e-8);
assert.throws(() => combat.validate({ ...model, unitValues: { GLREY: { relicLevel: -1 } } }));
assert.throws(() => combat.validate({ ...model, battleContext: { type: 'TERRITORY_TOURNAMENT_BATTLE:3' } }));
assert.throws(() => combat.validate({ ...model, battleContext: { type: 'TERRITORY_TOURNAMENT_BATTLE', squadSize: 3.5 } }));
combat.validate({ ...model, battleContext: { type: 'TERRITORY_TOURNAMENT_BATTLE', squadSize: 3, eventId: null } });

const profile = { mods: [], characters: { GLREY: { baseID: 'GLREY', playerValues: { equippedStats: stats, relicTier: 12 } } } };
const resolved = resolveTeam('GLREY', { combatModel: { ...model, autoTeam: false } }, profile, {});
assert.equal(resolved.unitValues.GLREY.relicLevel, 10, 'Game RelicTier enum is two greater than the actual relic level');
const confidence = combat.evaluate(stats, resolved).kitConfidence;
assert.equal(confidence.level, 'low');
assert.ok(confidence.omittedBranches > 0);
assert.ok(confidence.unresolvedStateCount > 0);
assert.ok(confidence.reasons.some(reason => reason.includes('omitted')));
assert.equal(confidence.members[0].id, 'GLREY');
assert.equal(confidence.members[0].activeAbilities, combat.getKit('GLREY').abilities.filter(a =>
  (a.kind !== 'leader' || resolved.leaderId === 'GLREY') && !a.requiresUnlock).length);

const simple = combat.defaults('TEST');
const stock = combat.forCharacter('GLREY');
assert.equal(stock.matchups[2].dodge, 15);
const legacy = { ...stock, scenarioVersion: undefined, matchups: stock.matchups.map(enemy => ({ ...enemy, dodge: 0 })) };
assert.equal(combat.upgradeModel(legacy, 'GLREY').matchups[2].dodge, 15);
const custom = { ...legacy, matchups: legacy.matchups.map(enemy => ({ ...enemy, speed: 123 })) };
assert.deepEqual(combat.upgradeModel(custom, 'GLREY').matchups, custom.matchups);
const evasive = { ...simple, matchups: [{ ...simple.matchups[0], dodge: 15 }] };
assert.ok(combat.marginals(stats, evasive).accuracy.marginalLogUtilityPerPoint > 0);
const marginals = combat.marginals(stats, simple);
const base = combat.utility(stats, simple);
for (const [key, row] of Object.entries(marginals)) {
  const derivative = (Math.log(combat.utility({ ...stats, [key]: stats[key] + row.step }, simple)) - Math.log(base)) / row.step;
  assert.equal(row.marginalLogUtilityPerPoint, derivative, `Exact derivative retained for ${key}`);
  const gain = combat.utility({ ...stats, [key]: stats[key] + row.priorityStep }, simple) / base - 1;
  assert.ok(Math.abs(row.priorityUtilityGain - gain) < 1e-12);
}
assert.ok(marginals.health.priority > 0, 'A meaningful Health increment must not be displayed as zero merely due to raw stat units');
// Isolate the real Consular basic so only attack mitigation changes. At level
// 85, 637.5 defense absorbs exactly half of incoming damage; cancelling that
// defense with flat penetration or 100% penetration must double attack damage.
const consular = prepared.characters.JEDIKNIGHTCONSULAR;
const basicOnly = { ...prepared, characters: { ...prepared.characters, JEDIKNIGHTCONSULAR: { ...consular,
  abilities: consular.abilities.filter(ability => ability.kind === 'basic') } } };
const attackContext = vm.createContext({ self: { CharacterKitData: basicOnly } });
loadMechanics( attackContext);
const attackModel = { ...combat.forCharacter('JEDIKNIGHTCONSULAR'), incomingControlLoss: 0, team: [], leaderId: 'OTHER' };
const enemy = { ...attackModel.matchups[0], dodge: 0, armor: 637.5, resistance: 637.5 };
const attack = vector => attackContext.self.CharacterMechanics.evaluate(vector, attackModel, enemy).self.dps;
const normalAttack = attack(stats);
assert.ok(normalAttack > 0);
assert.ok(Math.abs(attack({ ...stats, physPenetration: 637.5 }) / normalAttack - 2) < 1e-12);
assert.ok(Math.abs(attack({ ...stats, physPenetrationPercent: 100 }) / normalAttack - 2) < 1e-12);
assert.equal(attack({ ...stats, specPenetration: 637.5 }), normalAttack, 'Resistance penetration cannot change a physical attack');
assert.equal(attack({ ...stats, physPenetration: 100000 }), attack({ ...stats, physPenetration: 637.5 }), 'Penetration cannot make mitigation negative');
// The source explicitly makes Defense Down's resistance component target
// BOTH_SIDES. With the debuff present on the enemy only, 4-LOM must reduce
// enemy resistance by half and leave its own resistance unchanged. This is
// independent of the raw/preprocessed parity check, which shares selectors.
const fourLom = prepared.characters['4LOM'];
const fourLomBasic = fourLom.abilities.find(ability => ability.kind === 'basic');
const defenseContext = vm.createContext({ self: { CharacterKitData: { ...prepared, characters: { ...prepared.characters,
  '4LOM': { ...fourLom, abilities: [fourLomBasic], defaultRotation: { [fourLomBasic.id]: 1 } } } } } });
loadMechanics( defenseContext);
const defenseModel = { ...combat.forCharacter('4LOM'), team: [], leaderId: 'OTHER', incomingControlLoss: 0,
  stateTags: { '4LOM': { armor_debuff_part1: 0 }, opponent: { armor_debuff_part1: 0 } } };
const withoutDefenseDown = defenseContext.self.CharacterMechanics.evaluate(stats, defenseModel, enemy);
defenseModel.stateTags.opponent.armor_debuff_part1 = 1;
const withDefenseDown = defenseContext.self.CharacterMechanics.evaluate(stats, defenseModel, enemy);
assert.equal(withDefenseDown.opponentStatChanges.resistance, -637.5 / 2);
assert.equal(withDefenseDown.self.statVector.resistance, stats.resistance);
assert.ok(Math.abs(withDefenseDown.self.dps / withoutDefenseDown.self.dps - 4 / 3) < 1e-12);
// Check the real penetration component's inclusion/exclusion truth table.
// Having no exclusion marker cannot substitute for the required parent buff.
const appo = prepared.characters.APPO;
const appoBasic = appo.abilities.find(ability => ability.kind === 'basic');
const penIndex = appoBasic.operations.findIndex(op => op.id === 'generic_defense_penetration_up_part2of2');
assert.ok(penIndex >= 0);
const tagContext = vm.createContext({ self: { CharacterKitData: { ...prepared, characters: { ...prepared.characters,
  APPO: { ...appo, abilities: [{ ...appoBasic, phases: { marker: [], state: [], stat: [penIndex], turnMeter: [], output: [] } }],
    defaultRotation: { [appoBasic.id]: 1 } } } } } });
loadMechanics( tagContext);
for (const [parentPresent, alreadyInstalled, expectedPenetration] of [[0, 0, 0], [1, 0, 150], [1, 1, 0], [0, 1, 0]]) {
  const tagModel = { ...combat.forCharacter('APPO'), team: [], incomingControlLoss: 0, leaderId: 'OTHER',
    stateTags: { APPO: { defense_penetration_up_part1: parentPresent, defense_penetration_up_part2: alreadyInstalled },
      opponent: { defense_penetration_up_part1: 0, defense_penetration_up_part2: 0 } } };
  const result = tagContext.self.CharacterMechanics.evaluate(stats, tagModel, enemy);
  assert.equal(result.self.statVector.specPenetration || 0, expectedPenetration);
}
const emperor = prepared.characters.SITHPALPATINE;
const linkedAbility = emperor.abilities.find(ability => ability.operations.some(op => op.id === 'uniqueability_sithpalpatine01_linked_dampen_outgoing_damage_reapplication_CE'));
const linkedIndex = linkedAbility.operations.findIndex(op => op.id === 'uniqueability_sithpalpatine01_linked_dampen_outgoing_damage_reapplication_CE');
const linkedContext = vm.createContext({ self: { CharacterKitData: { ...prepared, characters: { ...prepared.characters,
  SITHPALPATINE: { ...emperor, abilities: [{ ...linkedAbility,
    phases: { marker: [], state: [], stat: [linkedIndex], turnMeter: [], output: [] } }] } } } } });
loadMechanics( linkedContext);
const linkedModel = { ...combat.forCharacter('SITHPALPATINE'), team: [], leaderId: 'OTHER', incomingControlLoss: 0,
  stateTags: { opponent: { linked_effect: 0 } } };
const notLinked = linkedContext.self.CharacterMechanics.evaluate(stats, linkedModel, enemy);
linkedModel.stateTags.opponent.linked_effect = 1;
const linked = linkedContext.self.CharacterMechanics.evaluate(stats, linkedModel, enemy);
assert.equal(linked.opponentStatChanges.outgoingDamageMultiplier, -0.25, 'Linked reduces outgoing damage by 25%, from a neutral multiplier of one');
assert.ok(Math.abs(linked.self.ehp / notLinked.self.ehp - 4 / 3) < 1e-12, 'The reduced enemy damage must improve actor EHP');

const ahsoka = prepared.characters.GLAHSOKATANO;
const wisdomAbility = ahsoka.abilities.find(ability => ability.kind === 'unique' && ability.operations.some(op => op.id === 'morais_wisdom_part2'));
const wisdomIndex = wisdomAbility.operations.findIndex(op => op.id === 'morais_wisdom_part2');
const ahsokaBasic = ahsoka.abilities.find(ability => ability.kind === 'basic');
const wisdomContext = vm.createContext({ self: { CharacterKitData: { ...prepared, characters: { ...prepared.characters,
  GLAHSOKATANO: { ...ahsoka, abilities: [{ ...ahsokaBasic, phases: { marker: [], state: [], stat: [], turnMeter: [],
    output: ahsokaBasic.phases.output.filter(index => ahsokaBasic.operations[index].kind === 'damage') } },
    { ...wisdomAbility, phases: { marker: [], state: [], stat: [wisdomIndex], turnMeter: [], output: [] } }],
    defaultRotation: { [ahsokaBasic.id]: 1 } } } } } });
loadMechanics( wisdomContext);
const wisdomModel = { ...combat.forCharacter('GLAHSOKATANO'), team: [], leaderId: 'OTHER', incomingControlLoss: 0,
  stateTags: { GLAHSOKATANO: { morais_wisdom_part1: 0 }, opponent: { morais_wisdom_part1: 0 } } };
const noWisdom = wisdomContext.self.CharacterMechanics.evaluate(stats, wisdomModel, enemy);
wisdomModel.stateTags.opponent.morais_wisdom_part1 = 1;
const enemyWisdom = wisdomContext.self.CharacterMechanics.evaluate(stats, wisdomModel, enemy);
assert.ok(noWisdom.self.dps > 0);
assert.ok(Math.abs(enemyWisdom.opponentStatChanges.incomingDamageMultiplier + 0.1) < 1e-12);
assert.ok(Math.abs(enemyWisdom.self.dps / noWisdom.self.dps - 0.9) < 1e-12, 'Enemy Morai’s Wisdom absorbs 10%, rather than making it immune to all damage');
// Check the shared Galactic Legend Stun/Fear immunity against an explicitly
// specified loss mix. Keep the real basic and shared passive; exclude the
// character-specific mechanics so no other effect changes this expectation.
const immuneBasic = kit.abilities.find(ability => ability.kind === 'basic');
const immunityContext = vm.createContext({ self: { CharacterKitData: { ...prepared, characters: { ...prepared.characters,
  GLREY: { ...kit, abilities: kit.abilities.filter(ability => ability === immuneBasic || ability.id === 'uniqueability_galacticlegend01'),
    defaultRotation: { [immuneBasic.id]: 1 } } } } } });
loadMechanics( immunityContext);
const immuneModel = { ...combat.forCharacter('GLREY'), leaderId: 'OTHER', team: [], missingHealth: 0, missingProtection: 0,
  unitValues: { GLREY: { relicLevel: 0 } }, incomingControlLoss: 0 };
const unimpeded = immunityContext.self.CharacterMechanics.evaluate(stats, immuneModel, enemy);
assert.ok(unimpeded.self.dps > 0);
assert.equal(unimpeded.self.statVector.stunImmunity, 1);
assert.equal(unimpeded.self.statVector.fearImmunity, 1);
for (const [shares, expectedFactor] of [[{ stun: 1 }, 1], [{ fear: 10 }, 1], [{ stun: 1e-20 }, 1],
  [{ abilityBlock: 1 }, 1 - 0.2 * 0.85], [{ stun: 1, fear: 1, daze: 1, abilityBlock: 1 }, 1 - 0.2 * 0.5 * 0.85]]) {
  const result = immunityContext.self.CharacterMechanics.evaluate(stats, { ...immuneModel, incomingControlLoss: 0.2, incomingControlWeights: shares }, enemy);
  assert.ok(Math.abs(result.self.dps / unimpeded.self.dps - expectedFactor) < 1e-12);
}
assert.throws(() => combat.validate({ ...immuneModel, incomingControlWeights: { stun: -1 } }));
assert.throws(() => combat.validate({ ...immuneModel, incomingControlWeights: { stun: 0 } }));
assert.throws(() => combat.validate({ ...immuneModel, incomingControlWeights: { typo: 1 } }));
assert.throws(() => combat.validate({ ...immuneModel, incomingControlWeights: { stun: 1e308, fear: 1e308 } }));
// These source selectors need a dead-unit or previous-target binding. Until
// those states are implemented, they must be visible gaps, never broadened to
// every living ally (which fabricates assists and stat sharing).
const elder = prepared.characters.EWOKELDER;
const elderSpecial = elder.abilities.find(ability => ability.id === 'specialability_ewokelder02');
const elderContext = vm.createContext({ self: { CharacterKitData: { ...prepared, characters: { ...prepared.characters,
  EWOKELDER: { ...elder, abilities: [elderSpecial], defaultRotation: { [elderSpecial.id]: 1 } } } } } });
loadMechanics( elderContext);
const elderModel = { ...combat.forCharacter('EWOKELDER'), leaderId: 'OTHER', team: [], incomingControlLoss: 0 };
const elderResult = elderContext.self.CharacterMechanics.evaluate(stats, elderModel, enemy);
assert.ok(elderSpecial.omissionReasons['Revival follow-up actions and ordered death state are not modeled'] > 0);
assert.ok(elderResult.unresolvedStates.includes('Context-dependent unit selection: 5'));
assert.equal(elderResult.self.assistDamageRate, 0);
assert.equal(elderResult.self.healingRate, 0);
assert.ok(Math.abs(elderContext.self.CharacterMechanics.evaluate(stats, elderModel, enemy, true) / elderResult.utility - 1) < 1e-12);
// Jolee's source explicitly restores 80% Health to all defeated Jedi. Under
// a 25% defeat assumption and two casts per time unit, a 100,000-Health Jedi
// receives 40,000 expected Health per time unit. The living caster and a
// non-Jedi cannot be recipients. Isolate the operation to avoid other heals.
const jolee = prepared.characters.JOLEEBINDO;
const joleeAbility = jolee.abilities.find(ability => ability.id === 'specialability_joleebindo02');
const reviveIndex = joleeAbility.operations.findIndex(op => op.id === 'specialability_joleebindo02_revive');
const reviveOp = joleeAbility.operations[reviveIndex];
assert.equal(reviveOp.multiplier, 0.8);
assert.equal(reviveOp.revivalHealthRecovery, true);
assert.equal(reviveOp.sourceTargets[0].alive, false);
const revivalContext = vm.createContext({ self: { CharacterKitData: { ...prepared, characters: { ...prepared.characters,
  JOLEEBINDO: { ...jolee, abilities: [{ ...joleeAbility,
    phases: { marker: [], state: [], stat: [], turnMeter: [], output: [reviveIndex] } }],
    defaultRotation: { [joleeAbility.id]: 1 } },
  JEDIKNIGHTCONSULAR: { ...prepared.characters.JEDIKNIGHTCONSULAR, abilities: [] },
  EWOKSCOUT: { ...prepared.characters.EWOKSCOUT, abilities: [] } } } } });
loadMechanics( revivalContext);
const revivalModel = { ...combat.forCharacter('JOLEEBINDO'), leaderId: 'OTHER', incomingControlLoss: 0,
  alliedDefeatChance: 0.25, missingHealth: 0, missingProtection: 0,
  team: [{ id: 'JEDIKNIGHTCONSULAR', stats: { ...stats, health: 100000 } }, { id: 'EWOKSCOUT', stats }] };
const revived = revivalContext.self.CharacterMechanics.evaluate(stats, revivalModel, enemy);
assert.equal(revived.self.healingRate, 0);
assert.equal(revived.allies[0].healingRate, 40000);
assert.equal(revived.allies[1].healingRate, 0);
assert.equal(revivalContext.self.CharacterMechanics.evaluate(stats, { ...revivalModel, alliedDefeatChance: 0 }, enemy).allies[0].healingRate, 0);
assert.equal(revivalContext.self.CharacterMechanics.evaluate(stats, { ...revivalModel, alliedDefeatChance: 1 }, enemy).allies[0].healingRate, 160000);
// The generic opponent has no kit/Datacron state provider. A source-defined
// Wat trigger is absent without Wat; adding Wat makes its unresolved lifecycle
// visible again. Source inventory includes unsupported branches, so this rule
// cannot conceal a tag just because its producer failed to compile.
const mechanics = load('src/domain/characterMechanics.js');
const shamanModel = { ...combat.forCharacter('TUSKENSHAMAN'), team: [], leaderId: 'TUSKENSHAMAN' };
const openShaman = mechanics.evaluate(stats, { ...shamanModel, externalStatePolicy: 'unspecified' }, enemy);
const closedShaman = mechanics.evaluate(stats, shamanModel, enemy);
assert.ok(openShaman.unresolvedStates.includes('Unspecified state tag: wattambor_trigger_dots'));
assert.ok(!closedShaman.unresolvedStates.includes('Unspecified state tag: wattambor_trigger_dots'));
assert.equal(closedShaman.utility, openShaman.utility);
const withWat = mechanics.evaluate(stats, { ...shamanModel, team: [{ id: 'WATTAMBOR', stats }] }, enemy);
assert.ok(withWat.unresolvedStates.includes('Unspecified state tag: wattambor_trigger_dots'));
const explicitState = mechanics.evaluate(stats, { ...shamanModel, stateTags: { opponent: { wattambor_trigger_dots: 1, percent_health_resistant: 1 } } }, enemy);
assert.ok(!explicitState.unresolvedStates.includes('Unspecified state tag: wattambor_trigger_dots'));
assert.ok(explicitState.utility !== closedShaman.utility, 'An explicit external state must still affect the source branch');
assert.throws(() => combat.validate({ ...shamanModel, externalStatePolicy: 'silently-ignore' }));
// Source DOT branches are mutually selected by recipient filters: 5% Health
// normally, 0.1% for percent-Health-resistant targets, and 0.01% for raid
// bosses. At enemy rate 3 with 60% landing, exactly one branch contributes.
const shaman = prepared.characters.TUSKENSHAMAN;
const shamanBasic = shaman.abilities.find(ability => ability.kind === 'basic');
// The basic applies two DOTs; isolate one copy of each alternative here.
const dotIndices = ['basic_dot_damage', 'basic_dot_damage_raidboss', 'basic_dot_damage_percenthealthresistant']
  .map(id => shamanBasic.operations.findIndex(op => op.id === id));
assert.ok(dotIndices.every(index => index >= 0));
const dotContext = vm.createContext({ self: { CharacterKitData: { ...prepared, characters: { ...prepared.characters,
  TUSKENSHAMAN: { ...shaman, abilities: [{ ...shamanBasic,
    phases: { marker: [], state: [], stat: [], turnMeter: [], output: dotIndices } }],
    defaultRotation: { [shamanBasic.id]: 1 } } } } } });
loadMechanics( dotContext);
const dotModel = { ...shamanModel, incomingControlLoss: 0,
  stateTags: { opponent: { percent_health_resistant: 0, wattambor_trigger_dots: 0 } } };
const dotEnemy = { ...enemy, health: 100000, speed: 300, tenacity: 100 };
const dot = (model, opponent) => dotContext.self.CharacterMechanics.evaluate(stats, model, opponent).self.dps;
assert.equal(dot(dotModel, dotEnemy), 9000);
assert.ok(Math.abs(dot({ ...dotModel, stateTags: { opponent: { percent_health_resistant: 1, wattambor_trigger_dots: 0 } } }, dotEnemy) - 180) < 1e-9);
assert.ok(Math.abs(dot(dotModel, { ...dotEnemy, categories: ['role_raidboss'] }) - 18) < 1e-9);
// Ability Block removes the configured special share, not every action.
// Palpatine's normal 70% AOE Stun reaches all five enemies, rather than one
// fifth of that team. Isolate the exact source effects for arithmetic checks.
function isolatedEffect(characterId, abilityId, effectId, phase = 'output', inertAllies = []) {
  const character = prepared.characters[characterId];
  const ability = character.abilities.find(row => row.id === abilityId);
  const index = ability.operations.findIndex(op => op.id === effectId);
  assert.ok(index >= 0, effectId);
  const isolatedContext = vm.createContext({ self: { CharacterKitData: { ...prepared, characters: { ...prepared.characters,
    ...Object.fromEntries(inertAllies.map(id => [id, { ...prepared.characters[id], abilities: [] }])),
    [characterId]: { ...character, abilities: [{ ...ability, phases: { marker: [], state: [], stat: [], turnMeter: [], output: [], [phase]: [index] } }],
      defaultRotation: { [ability.id]: 1 } } } } } });
  loadMechanics( isolatedContext);
  return isolatedContext.self.CharacterMechanics;
}
const abilityBlock = isolatedEffect('LUMINARAUNDULI', 'specialability_luminaraunduli01', 'specialability_luminaraunduli_suppress_u02');
const blockModel = { ...combat.forCharacter('LUMINARAUNDULI'), leaderId: 'OTHER', team: [], incomingControlLoss: 0,
  enemySpecialShare: 0.5, enemyCount: 5 };
const blockResult = abilityBlock.evaluate(stats, blockModel, dotEnemy);
assert.ok(Math.abs(blockResult.controlReduction - 0.04) < 1e-12);
assert.equal(abilityBlock.evaluate(stats, { ...blockModel, enemySpecialShare: 0 }, dotEnemy).controlReduction, 0);
const aoeStun = isolatedEffect('EMPERORPALPATINE', 'specialability_emperorpalpatine01', 'specialability_emperorpalpatine01_stun_u02');
const stunModel = { ...combat.forCharacter('EMPERORPALPATINE'), leaderId: 'OTHER', team: [], incomingControlLoss: 0, enemyCount: 5, targetDebuffedChance: 0 };
const stunResult = aoeStun.evaluate(stats, stunModel, dotEnemy);
assert.ok(Math.abs(stunResult.controlReduction - 0.28) < 1e-12);
assert.ok(Math.abs(aoeStun.evaluate(stats, { ...stunModel, enemyCount: 1 }, dotEnemy).controlReduction - 0.28) < 1e-12);
// Kit Fisto's 30% repeat belongs to his basic attack. It must not amplify
// the five-target special. Exclude TM/stat passives to isolate this arithmetic.
const fisto = prepared.characters.KITFISTO;
const fistoBasic = fisto.abilities.find(ability => ability.kind === 'basic');
const fistoSpecial = fisto.abilities.find(ability => ability.kind === 'special');
const repeatContext = vm.createContext({ self: { CharacterKitData: { ...prepared, characters: { ...prepared.characters,
  KITFISTO: { ...fisto, abilities: [fistoBasic, fistoSpecial].map(ability => ({ ...ability,
    phases: { marker: [], state: [], stat: [], turnMeter: [], output: ability.phases.output } })),
    defaultRotation: { [fistoBasic.id]: 0.75, [fistoSpecial.id]: 0.25 } } } } } });
loadMechanics( repeatContext);
const repeatModel = { ...combat.forCharacter('KITFISTO'), team: [], leaderId: 'OTHER', incomingControlLoss: 0 };
const repeated = repeatContext.self.CharacterMechanics.evaluate(stats, repeatModel, enemy);
assert.ok(Math.abs(repeated.self.assistDamageRate - 1651.5) < 1e-9);
assert.ok(Math.abs(repeated.self.dps - 15219) < 1e-9);
// The same repeated basic also gets its source-defined 50% chance of 15% TM.
// That extra TM belongs to the basic frequency, not to the special's damage.
const repeatTmContext = vm.createContext({ self: { CharacterKitData: { ...prepared, characters: { ...prepared.characters,
  KITFISTO: { ...fisto, abilities: [fistoBasic, fistoSpecial].map(ability => ({ ...ability,
    phases: { marker: [], state: [], stat: [], turnMeter: ability === fistoBasic ? ability.phases.turnMeter : [],
      assist: ability === fistoBasic ? ability.phases.assist : [], output: ability.phases.output } })),
    defaultRotation: { [fistoBasic.id]: 0.75, [fistoSpecial.id]: 0.25 } } } } } });
loadMechanics( repeatTmContext);
const repeatedTm = repeatTmContext.self.CharacterMechanics.evaluate(stats, repeatModel, enemy);
assert.ok(Math.abs(repeatedTm.self.actionRate - 2 / (1 - 0.5 * 0.15 * 0.75 * 1.3)) < 1e-12);
// Nute's first-death revival restores his full Health once in the horizon.
// The death event already supplies its probability: applying it again would
// incorrectly square that probability and undervalue the restored pool.
const nuteRevival = isolatedEffect('NUTEGUNRAY', 'uniqueability_nutegunray01', 'generic_revive_self_full');
const nuteModel = { ...combat.forCharacter('NUTEGUNRAY'), leaderId: 'OTHER', team: [], incomingControlLoss: 0,
  alliedDefeatChance: 0.25, horizonTurns: 5, missingHealth: 0, missingProtection: 0 };
assert.ok(Math.abs(nuteRevival.evaluate(stats, nuteModel, dotEnemy).self.healingRate - 7500) < 1e-9);
assert.equal(nuteRevival.evaluate(stats, { ...nuteModel, alliedDefeatChance: 0 }, dotEnemy).self.healingRate, 0);
assert.ok(Math.abs(nuteRevival.evaluate(stats, { ...nuteModel, alliedDefeatChance: 1 }, dotEnemy).self.healingRate - 30000) < 1e-9);
// The pinned ability targeting rule excludes Thrawn from his selected ally.
// Its internal full-fill value is five, not five additional meter bars. This
// isolates that component; the complete ordered swap remains a visible gap.
const thrawnAbility = prepared.characters.GRANDADMIRALTHRAWN.abilities.find(ability => ability.id === 'specialability_grandadmiralthrawn02');
const fullFill = thrawnAbility.operations.find(op => op.id === 'specialability_grandadmiralthrawn02_quicken_ally_target');
assert.equal(fullFill.multiplier, 5);
const selectedRule = prepared.selectors[prepared.selectors[fullFill.targets[0]].selectionCriteria];
assert.equal(selectedRule.sourceTargetingRuleId, 'target_lowest_ally_exclude_self');
assert.equal(selectedRule.excludeSelf, true);
const fill = isolatedEffect('GRANDADMIRALTHRAWN', thrawnAbility.id, fullFill.id, 'turnMeter', ['JEDIKNIGHTCONSULAR']);
const fillModel = { ...combat.forCharacter('GRANDADMIRALTHRAWN'), leaderId: 'OTHER', incomingControlLoss: 0,
  team: [{ id: 'JEDIKNIGHTCONSULAR', stats }] };
const filled = fill.evaluate(stats, fillModel, enemy);
assert.equal(filled.self.actionRate, 2);
assert.equal(filled.allies[0].actionRate, 4);
assert.equal(fill.evaluate(stats, { ...fillModel, team: [] }, enemy).self.actionRate, 2);
console.log('Pinned-kit expectations passed: actual relic levels, multiplicative pool bonuses, 30% damage reduction, unchanged derivatives, mod-sized displayed priorities and conservative confidence.');
