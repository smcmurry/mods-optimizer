import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createFrontendLoader } from './lib/loadFrontend.mjs';

// Fixed expectations below were read from pinned source effects/localized kits.
// They are intentionally independent of raw/prepared interpreter parity.
const load = createFrontendLoader();
const combat = load('src/domain/combatUtility.js');
const prepared = JSON.parse(fs.readFileSync('src/constants/generatedCombatPrograms.json', 'utf8'));
const effects = Object.fromEntries(JSON.parse(fs.readFileSync('data/gameData-cache/effect.json', 'utf8')).data.map(effect => [effect.id, effect]));
const stats = { health: 50000, protection: 50000, speed: 200, physDmg: 4000, specDmg: 3000,
  physCritChance: 0, specCritChance: 0, critDmg: 150, armor: 0, resistance: 0,
  potency: 100, tenacity: 0, accuracy: 0, critAvoid: 0, counterChance: 0, healthSteal: 0, level: 85 };
const baseModel = id => ({ ...combat.forCharacter(id), leaderId: 'OTHER', team: [], numberCrunch: false, incomingControlLoss: 0,
  missingHealth: 0.5, missingProtection: 0, targetDebuffedChance: 0, targetBuffedChance: 0,
  enemyCount: 1, physicalCoefficient: 1, specialCoefficient: 1 });
const enemy = { ...baseModel('KITFISTO').matchups[0], health: 100000, armor: 0, resistance: 0,
  dodge: 0, speed: 300, critChance: 0, critAvoid: 0, physicalShare: 1, outgoingPenetration: 0 };
const close = (actual, expected, label) => assert.ok(Math.abs(actual - expected) < 1e-8, `${label}: ${actual} != ${expected}`);
function isolate(choices) {
  const characters = { ...prepared.characters };
  for (const [id, selected] of Object.entries(choices)) {
    const kit = prepared.characters[id];
    const abilities = kit.abilities.flatMap(ability => {
      if (!selected[ability.id]) return [];
      const wanted = new Set(selected[ability.id]);
      const selectedIndices = ability.operations.map((op, index) => wanted.has(op.id) ? index : -1).filter(index => index >= 0);
      assert.equal(new Set(selectedIndices.map(index => ability.operations[index].id)).size, wanted.size, `All requested effects exist: ${id}/${ability.id}`);
      const remap = indices => (indices || []).filter(index => selectedIndices.includes(index)).map(index => selectedIndices.indexOf(index));
      return [{ ...ability, operations: selectedIndices.map(index => ability.operations[index]),
        phases: Object.fromEntries(Object.entries(ability.phases).map(([phase, indices]) => [phase, remap(indices)])),
        basicDamage: remap(ability.basicDamage), basicRecovery: remap(ability.basicRecovery), basicTurnMeter: remap(ability.basicTurnMeter) }];
    });
    characters[id] = { ...kit, abilities, defaultRotation: Object.fromEntries(abilities.filter(a => a.kind === 'basic' || a.kind === 'special').map(a => [a.id, 1])) };
  }
  const context = vm.createContext({ self: { CharacterKitData: { ...prepared, characters } } });
  vm.runInContext(fs.readFileSync('src/domain/conditionalUtility.js', 'utf8'), context);
  vm.runInContext(fs.readFileSync('src/domain/characterMechanics.js', 'utf8'), context);
  return context.self.CharacterMechanics;
}

const sourceDamageCases = [
  ['DARTHMALGUS', 'specialability_darthmalgus02', 'specialability_darthmalgus02_damage_u07', 'health', 0.4, 'never', 40000],
  ['EMBO', 'specialability_embo01', 'specialability_embo01_damage_protection', 'protection', 0.35, 'never', 35000],
  ['KELLERANBEQ', 'specialability_kelleranbeq02', 'specialability_kelleranbeq02_protection_damage_u07', 'protection', 0.2, 'never', 20000],
  ['GRIEVOUS', 'specialability_grievous01', 'specialability_grievous01_damage_u06', 'health', 0.16, 'normal', 16000],
  ['DARTHMALAK', 'specialability_darthmalak02', 'specialability_darthmalak02_max_health_damage_u06', 'targetHealth', 1, 'never', 200000],
  ['GLHONDO', 'basicability_glhondo', 'basicability_glhondo_damage_BASE', 'physDmg', 3, 'normal', 24000],
  ['R2D2_LEGENDARY', 'basicability_r2d2_legendary', 'basicability_r2d2_legendary_damage_u05', 'physDmg', 2.023, 'normal', 16184]
];
for (const [id, abilityId, effectId, basis, coefficient, crit, expected] of sourceDamageCases) {
  assert.equal(Number(effects[effectId].multiplierAmountDecimal) / 10000, coefficient, `Pinned coefficient ${effectId}`);
  const operation = prepared.characters[id].abilities.find(a => a.id === abilityId).operations.find(o => o.id === effectId);
  assert.equal(operation.stat, basis); assert.equal(operation.crit, crit);
  const mechanics = isolate({ [id]: { [abilityId]: [effectId] } });
  close(mechanics.evaluate(stats, baseModel(id), enemy).self.dps, expected, effectId);
  if (crit === 'never') close(mechanics.evaluate({ ...stats, physCritChance: 100, specCritChance: 100, critDmg: 300 }, baseModel(id), enemy).self.dps, expected, `${effectId} cannot crit`);
}

const nihChoices = {
  DARTHNIHILUS: {
    basicability_darthnihilus: ['basicability_darthnihilus_damage_u06'],
    leaderability_darthnihilus: ['leaderability_darthnihilus_healthsteal_sith_u04', 'leaderability_darthnihilus_health_recovery_immunity']
  },
  HERMITYODA: { basicability_hermityoda: ['basicability_hermityoda_recover_health_u03'] }
};
assert.equal(effects.leaderability_darthnihilus_healthsteal_sith_u04.additiveAmountDecimal, '15000');
assert.ok(effects.leaderability_darthnihilus_health_recovery_immunity.effectedTag.some(tag => tag.tag === 'health_recovery' && !tag.exclude));
const nih = isolate(nihChoices);
const nihModel = { ...baseModel('DARTHNIHILUS'), leaderId: 'DARTHNIHILUS', team: [{ id: 'HERMITYODA', stats }] };
const nihResult = nih.evaluate(stats, nihModel, enemy);
close(nihResult.self.dps, 3000 * 1.562 * 2, 'Nihilus direct Special damage');
close(nihResult.self.healingRate, 3000 * 1.562 * 2 * 1.5 * 0.5, '150% Health Steal remains legal while normal healing is blocked');
const noNihLeader = nih.evaluate(stats, { ...nihModel, leaderId: 'OTHER' }, enemy);
close(noNihLeader.self.healingRate, 50000 * 0.1 * 2 * 0.5, 'Yoda normal healing restores Sith ally when immunity absent');

const padmeAbility = JSON.parse(fs.readFileSync('reports/characterKitAnalysis.json', 'utf8')).characters.PADMEAMIDALA.abilities.find(a => a.id === 'uniqueability_padmeamidala01');
assert.ok(padmeAbility.omitted.some(gap => gap.id === 'uniqueability_padmeamidala01_turnmeter_immunity'), 'Padme installation without source context remains an explicit gap');
const tmImmune = isolate({
  JEDIMASTERKENOBI: { leaderability_jedimasterkenobi: ['leaderability_jedimasterkenobi_enemy_and_ally_tm_gain_immunity'] },
  KITFISTO: { basicability_kitfisto: ['basicability_kitfisto_quicken', 'basicability_kitfisto_bonusmove_u02'] }
});
const tmModel = { ...baseModel('JEDIMASTERKENOBI'), leaderId: 'JEDIMASTERKENOBI', team: [{ id: 'KITFISTO', stats }], turnMeterGain: 0.5 };
const tmResult = tmImmune.evaluate(stats, tmModel, enemy);
close(tmResult.self.actionRate, 2, 'Kenobi leader blocks model-assumed bonus TM');
close(tmResult.allies[0].actionRate, 2, 'Kenobi leader blocks Kit Fisto regular and bonus basic TM');
close(tmImmune.evaluate(stats, { ...tmModel, turnMeterGain: -0.5 }, enemy).self.actionRate, 2, 'Source delay immunity blocks model-assumed negative TM');

// Counter basics recover for all eligible allies before any output metrics are
// finalized. Actual Yoda basic is non-damaging and grants 10% ally Health.
const counterYoda = isolate({ HERMITYODA: { basicability_hermityoda: ['basicability_hermityoda_recover_health_u03'] }, DARTHNIHILUS: {} });
const counterResult = counterYoda.evaluate(stats, { ...baseModel('DARTHNIHILUS'), team: [{ id: 'HERMITYODA', stats: { ...stats, counterChance: 100 } }] }, enemy);
close(counterResult.self.healingRate, 50000 * 0.1 * (2 + 3 / 2) * 0.5, 'Counter recovery reaches previously listed roster member');

const counterNih = nih.evaluate({ ...stats, counterChance: 100 }, nihModel, enemy);
close(counterNih.self.healingRate, 3000 * 1.562 * (2 + 3 / 2) * 1.5 * 0.5, 'Counter source Health Steal');
const noSteal = isolate({ MANDALORBOKATAN: { basicability_mandalorbokatan: ['basicability_mandalorbokatan_true_damage'] } });
assert.ok(effects.basicability_mandalorbokatan_true_damage.param.includes('NO_HEALTH_STEAL'));
const noStealResult = noSteal.evaluate({ ...stats, counterChance: 100, healthSteal: 150 }, baseModel('MANDALORBOKATAN'), enemy);
close(noStealResult.self.dps, 4000 * 2.4 * (2 + 3), 'True basic counter damage');
close(noStealResult.self.healingRate, 0, 'NO_HEALTH_STEAL applies to regular and counter basics');
const assistedYoda = isolate({
  AAYLASECURA: { basicability_aaylasecura: ['basicability_aaylasecura_bonusmove_u03'] },
  HERMITYODA: { basicability_hermityoda: ['basicability_hermityoda_recover_health_u03'] }
});
const assistedResult = assistedYoda.evaluate(stats, { ...baseModel('AAYLASECURA'), team: [{ id: 'HERMITYODA', stats }] }, enemy);
close(assistedResult.self.healingRate, 50000 * 0.1 * (2 + 2 * 0.35) * 0.5, 'Aayla real 35% assist calls non-damaging Yoda basic recovery');

// Different caster/recipient pools distinguish own-pool percentages from an
// explicitly queried caster pool. No damage/recovery parity oracle is used.
assert.equal(Object.values(effects).filter(effect => [2, 10].includes(effect.type) && effect.param.some(param => ['MAX_HEALTH', 'MAX_SHIELD'].includes(param))).length, 0,
  'Pinned RECOVER/DISTRIBUTE_RECOVERY never use MAX_*; those are shield parameters');
const smallCaster = { ...stats, health: 10000, protection: 20000 };
const largeRecipient = { ...stats, health: 100000, protection: 180000 };
const tusken = isolate({
  TUSKENSHAMAN: { specialability_tuskenshaman01: ['specialability_tuskenshaman01_heal_u05', 'specialability_tuskenshaman01_heal_scaling_u01'] },
  EWOKSCOUT: {}
});
assert.ok(effects.specialability_tuskenshaman01_heal_scaling_u01.param.includes('CONTEXT_MAX_MULTIPLIER'));
const tuskenModel = { ...baseModel('TUSKENSHAMAN'), targetDebuffedChance: 1, team: [{ id: 'EWOKSCOUT', stats: largeRecipient }] };
const tuskenOne = tusken.evaluate(smallCaster, tuskenModel, enemy);
close(tuskenOne.self.healingRate, 10000 * 0.3 * 2 * 0.5, 'Tusken 20% + 10% per debuffed enemy uses own caster recipient Health');
close(tuskenOne.allies[0].healingRate, 100000 * 0.3 * 2 * 0.5, 'Tusken teammate healing uses different recipient Health');
const tuskenFive = tusken.evaluate(smallCaster, { ...tuskenModel, enemyCount: 5 }, enemy);
close(tuskenFive.allies[0].healingRate, 100000 * 0.7 * 2 * 0.5, 'Five debuffed enemies add 50% own-recipient Health');
const tuskenNone = tusken.evaluate(smallCaster, { ...tuskenModel, targetDebuffedChance: 0 }, enemy);
close(tuskenNone.allies[0].healingRate, 100000 * 0.2 * 2 * 0.5, 'No debuffed enemies retains 20% base recovery');
const luminara = isolate({
  LUMINARAUNDULI: { specialability_luminaraunduli02: ['specialability_luminaraunduli02_recover_health_u03'] }, EWOKSCOUT: {}
});
const luminaraResult = luminara.evaluate(smallCaster, { ...baseModel('LUMINARAUNDULI'), team: [{ id: 'EWOKSCOUT', stats: largeRecipient }] }, enemy);
close(luminaraResult.self.healingRate, 10000 * 0.45 * 2 * 0.5, 'Luminara heal explicitly queries caster Max Health');
close(luminaraResult.allies[0].healingRate, 10000 * 0.45 * 2 * 0.5, 'Luminara larger recipient still receives caster-based heal');
const yodaPools = isolate({
  HERMITYODA: { basicability_hermityoda: ['basicability_hermityoda_recover_health_u03', 'basicability_hermityoda_recover_protection_u03'] }, EWOKSCOUT: {}
});
const yodaPoolResult = yodaPools.evaluate(smallCaster, { ...baseModel('HERMITYODA'), missingProtection: 0.5, team: [{ id: 'EWOKSCOUT', stats: largeRecipient }] }, enemy);
close(yodaPoolResult.allies[0].healingRate, 100000 * 0.1 * 2 * 0.5, 'Yoda Health recovery uses recipient Health');
close(yodaPoolResult.allies[0].protectionRecoveryRate, 180000 * 0.05 * 2 * 0.5, 'Yoda Protection recovery uses recipient base Protection');
close(yodaPoolResult.allies[0].temporaryProtection, 0, 'Protection recovery is distinct from temporary Protection Up capacity');
const malakEffects = ['specialability_darthmalak02_max_health_damage_u06',
  'specialability_darthmalak02_max_health_damage_health_resistant_u06',
  'specialability_darthmalak02_max_health_damage_raid_boss_u06', 'recover_health_context_self_INSTANT'];
const drain = isolate({ DARTHMALAK: { specialability_darthmalak02: malakEffects } });
const drainModel = baseModel('DARTHMALAK');
const drained = drain.evaluate(smallCaster, drainModel, enemy);
close(drained.self.dps, 200000, 'Malak real normal-target damage');
close(drained.self.healingRate, 100000, 'Malak recovers damage dealt, not caster Max Health');
close(drain.evaluate(largeRecipient, drainModel, enemy).self.healingRate, 100000, 'Own Health does not change damage-result recovery');
close(drain.evaluate(smallCaster, drainModel, { ...enemy, health: 50000 }).self.healingRate, 50000, 'Target Health scales damage-result recovery');
close(drain.evaluate({ ...smallCaster, outgoingDamageMultiplier: 0.5 }, drainModel, enemy).self.healingRate, 50000, 'Landed damage modifier scales linked recovery once');
close(drain.evaluate(smallCaster, drainModel, { ...enemy, armor: 100000, resistance: 100000, dodge: 100 }).self.healingRate, 100000, 'Source true unavoidable damage bypasses defense and evasion');
const resistedDrain = drain.evaluate(smallCaster, { ...drainModel, stateTags: { opponent: { percent_health_resistant: 1 } } }, enemy);
close(resistedDrain.self.healingRate, 2000, 'Source percent-Health-resistant damage result');
const raidDrain = drain.evaluate(smallCaster, drainModel, { ...enemy, categories: ['role_raidboss'] });
close(raidDrain.self.healingRate, 200, 'Source raid boss damage result');
const mixedDrain = drain.evaluate(smallCaster, { ...drainModel, stateTags: { opponent: { percent_health_resistant: 0.5 } } }, enemy);
close(mixedDrain.self.healingRate, 51000, 'Source branch probability enters damage-result healing once');
const missingDamage = isolate({ DARTHMALAK: { specialability_darthmalak02: ['recover_health_context_self_INSTANT'] } });
const missingResult = missingDamage.evaluate(smallCaster, drainModel, enemy);
close(missingResult.self.healingRate, 0, 'Missing source result cannot become invented Health-based recovery');
assert.ok(missingResult.unresolvedStates.some(reason => reason.includes('Missing source damage result')), 'Missing source result remains explicit');
const consularAbility = JSON.parse(fs.readFileSync('reports/characterKitAnalysis.json', 'utf8')).characters.JEDIKNIGHTCONSULAR.abilities.find(a => a.id === 'specialability_jediknightconsular02');
assert.ok(consularAbility.operations.some(op => op.id === 'specialability_jediknightconsular02_recover_health03' && op.context[0]?.kind === 'damageResult'), 'Named ordered source/localization proves Consular recovery identity');
assert.ok(consularAbility.omitted.some(gap => gap.reason.includes('probabilistic penetration')), 'Consular per-attack ignore-defense precision gap remains visible');
const consular = isolate({ JEDIKNIGHTCONSULAR: { specialability_jediknightconsular02:
  ['specialability_jediknightconsular02_damage_u03', 'specialability_jediknightconsular02_recover_health03'] } });
const consularModel = baseModel('JEDIKNIGHTCONSULAR');
const consularDamage = 3000 * 1.424 * 2;
close(consular.evaluate(smallCaster, consularModel, enemy).self.dps, consularDamage, 'Consular source 1.424 Special damage with defense zero');
close(consular.evaluate(smallCaster, consularModel, enemy).self.healingRate, consularDamage * 0.3 * 0.5, 'Consular source 30% landed-damage recovery');
close(consular.evaluate(largeRecipient, consularModel, enemy).self.healingRate, consularDamage * 0.3 * 0.5, 'Consular recovery independent of caster Max Health');
close(consular.evaluate({ ...smallCaster, specDmg: 6000 }, consularModel, enemy).self.healingRate, consularDamage * 2 * 0.3 * 0.5, 'Changed candidate Special Damage changes Consular recovery');
close(consular.evaluate(smallCaster, consularModel, { ...enemy, dodge: 50 }).self.healingRate, consularDamage * 0.5 * 0.3 * 0.5, 'Half-landed damage enters Consular healing once, not chance squared');
close(consular.evaluate({ ...smallCaster, outgoingDamageMultiplier: 0.5 }, consularModel, enemy).self.healingRate, consularDamage * 0.5 * 0.3 * 0.5, 'Consular linked recovery follows actual damage modifier');
close(consular.evaluate({ ...smallCaster, healthRecoveryImmunity: 1 }, consularModel, enemy).self.healingRate, 0, 'Health recovery immunity blocks Consular direct damage-linked heal');
close(consular.evaluate({ ...smallCaster, healthRecoveryImmunity: 1, healthSteal: 150 }, consularModel, enemy).self.healingRate, consularDamage * 1.5 * 0.5, 'Consular source-default Health Steal is separate from blocked direct healing');
const poolConversion = isolate({
  DARTHNIHILUS: { leaderability_darthnihilus: ['leaderability_darthnihilus_health_handler'] },
  VADER: {}, DARTHMALAK: { uniqueability_darthmalak02: ['uniqueability_darthmalak02_health_handler'] }, EWOKSCOUT: {}
});
const convertedModel = { ...baseModel('DARTHNIHILUS'), leaderId: 'DARTHNIHILUS', team: [
  { id: 'VADER', stats: { ...stats, health: 40000, protection: 80000 } },
  { id: 'DARTHMALAK', stats: { ...stats, health: 50000, protection: 70000 } },
  { id: 'EWOKSCOUT', stats: { ...stats, health: 50000, protection: 25000 } }
] };
const converted = poolConversion.evaluate(smallCaster, convertedModel, enemy);
close(converted.self.statVector.health, 30000, 'Nihilus converts own 20k Protection into own 10k Health');
close(converted.self.statVector.protection, 0, 'Nihilus loses all Protection');
close(converted.allies[0].statVector.health, 120000, 'Vader converts own 80k Protection, not leader 20k Protection');
close(converted.allies[0].statVector.protection, 0, 'Eligible Sith loses own Protection');
close(converted.allies[1].statVector.health, 120000, 'Malak is excluded from Nihilus conversion and receives own start conversion once');
close(converted.allies[1].statVector.protection, 0, 'Malak own start conversion');
close(converted.allies[2].statVector.health, 50000, 'Non-Sith Health unchanged');
close(converted.allies[2].statVector.protection, 25000, 'Non-Sith Protection unchanged');
close(poolConversion.evaluate(smallCaster, convertedModel, enemy).allies[0].statVector.health, 120000, 'Warm evaluation cannot accumulate repeated conversion');
const conversionDisabled = poolConversion.evaluate(smallCaster, { ...convertedModel, leaderId: 'OTHER' }, enemy);
close(conversionDisabled.allies[0].statVector.health, 40000, 'Nihilus conversion requires active leader');
close(conversionDisabled.allies[1].statVector.health, 120000, 'Malak own conversion is independent of leader');
assert.equal(converted.assumptions.poolConversionPolicy, 'own-recipient-before-kit-stat-buffs');
// The reviewed enemy-side interceptor applies per Sith damage effect. It must
// run before critical event weighting, without prohibiting non-Sith attacks.
const criticalChoices = {
  DARTHNIHILUS: {
    leaderability_darthnihilus: ['leaderability_darthnihilus_crit_avoidance_handler'],
    basicability_darthnihilus: ['basicability_darthnihilus_damage_u06']
  },
  DARTHMALAK: { basicability_darthmalak: ['basicability_darthmalak_damage_u06'] },
  DARTHBANE: { basicability_darthbane: ['basicability_darthbane_damage_u06'] },
  KITFISTO: { basicability_kitfisto: ['basicability_kitfisto_damage_u04'] },
  SAVAGEOPRESS: { basicability_savageopress: ['basicability_savageopress_damage_u07', 'modifystat_attack_negative_moderate_enemy_single_physical'] },
  JEDIMASTERKENOBI: { specialability_jedimasterkenobi01: ['generic_vulnerable_debuff_attack_physical_unresistable_undispellable_2turns', 'generic_vulnerable_abilitypower_debuff'] }
};
const critical = isolate(criticalChoices);
const criticalStats = { ...stats, physCritChance: 100, specCritChance: 100, critDmg: 300, guaranteedCritUptime: 1 };
const criticalModel = { ...baseModel('DARTHNIHILUS'), leaderId: 'DARTHNIHILUS', team:
  ['DARTHMALAK', 'DARTHBANE', 'KITFISTO', 'SAVAGEOPRESS', 'JEDIMASTERKENOBI'].map(id => ({ id, stats: criticalStats })) };
const restricted = critical.evaluate(criticalStats, criticalModel, enemy);
close(restricted.self.dps, 3000 * 1.562 * 2, 'Nihilus Special guaranteed critical cannot bypass restriction');
close(restricted.allies[0].dps, 4000 * 2 * 2, 'Malak Physical attack is included in Sith critical restriction');
const baneOp = prepared.characters.DARTHBANE.abilities.find(a => a.kind === 'basic').operations.find(o => o.id === 'basicability_darthbane_damage_u06');
assert.equal(baneOp.crit, 'always', 'Bane source proves guaranteed-critical operation precedence');
close(restricted.allies[1].dps, criticalStats[baneOp.stat] * baneOp.multiplier * 2, 'Source always-critical Bane attack cannot bypass restriction');
close(restricted.allies[2].dps, 4000 * 1.468 * 2 * 3, 'Non-Sith Physical attack still crits against same opponent');
const noCritChance = { ...criticalStats, physCritChance: 0, specCritChance: 0, guaranteedCritUptime: 0 };
const vulnerable = critical.evaluate(noCritChance, { ...criticalModel, team: criticalModel.team.map(row => ({ ...row, stats: noCritChance })) }, enemy);
close(vulnerable.self.dps, restricted.self.dps, 'Source Special Vulnerable cannot bypass Sith restriction');
close(vulnerable.allies[0].dps, restricted.allies[0].dps, 'Source Physical Vulnerable cannot bypass Sith restriction');
assert.ok(vulnerable.allies[2].dps > 4000 * 1.468 * 2, 'Real source Vulnerable still raises non-Sith critical damage');
const withoutCriticalEvent = isolate({ ...criticalChoices, SAVAGEOPRESS: { basicability_savageopress: ['basicability_savageopress_damage_u07'] } });
close(restricted.self.ehp, withoutCriticalEvent.evaluate(criticalStats, criticalModel, enemy).self.ehp, 'Prohibited Sith critical event cannot apply Savage Offense Down before stat phase');
const inactiveCriticalModel = { ...criticalModel, leaderId: 'OTHER' };
assert.ok(critical.evaluate(criticalStats, inactiveCriticalModel, enemy).self.ehp > withoutCriticalEvent.evaluate(criticalStats, inactiveCriticalModel, enemy).self.ehp, 'Savage real critical event is reachable without restriction');
for (const actorStats of [{ ...criticalStats, neverCrit: true }, criticalStats]) {
  const noPacket = isolate({ SAVAGEOPRESS: { basicability_savageopress: ['modifystat_attack_negative_moderate_enemy_single_physical'] } });
  const inert = isolate({ SAVAGEOPRESS: {} });
  close(noPacket.evaluate(actorStats, baseModel('SAVAGEOPRESS'), enemy).self.ehp, inert.evaluate(actorStats, baseModel('SAVAGEOPRESS'), enemy).self.ehp,
    'No damage packet or neverCrit actor cannot manufacture critical event stats');
}
const neverCritModel = { ...inactiveCriticalModel, team: inactiveCriticalModel.team.map(row => row.id === 'SAVAGEOPRESS' ? { ...row, stats: { ...criticalStats, neverCrit: true } } : row) };
close(critical.evaluate(criticalStats, neverCritModel, enemy).self.ehp, withoutCriticalEvent.evaluate(criticalStats, neverCritModel, enemy).self.ehp, 'neverCrit damage actor has zero outgoing critical event weight');
console.log(`Checked ${sourceDamageCases.length} source damage cases, Health Steal/immunity, assist/counter recovery, recipient/caster pools, contextual percentages, linked damage healing and recipient-owned conversion. Unsupported installation, result and ordering gaps retained.`);
