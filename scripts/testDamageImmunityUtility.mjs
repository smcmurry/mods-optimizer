import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { createFrontendLoader } from './lib/loadFrontend.mjs';
const require = createRequire(import.meta.url);
const helper = require('../src/domain/damageImmunityUtility.js');
const effects = JSON.parse(fs.readFileSync('data/gameData-cache/effect.json')).data;
const abilities = JSON.parse(fs.readFileSync('data/gameData-cache/ability.json')).data;
const enums = JSON.parse(fs.readFileSync('data/gameData-cache/enums.json')).data;
const loc = JSON.parse(fs.readFileSync('data/gameData-cache/Loc_ENG_US.txt.json')).data;
assert.equal(enums.ConditionType.FULL_TURN_COMPLETE, 49);
assert.equal(enums.ConditionType.DEATH, 21);
assert.equal(enums.ConditionType.END_OF_ENCOUNTER, 24);
const ability = abilities.find(a => a.id === 'specialability_droideka02');
const tier = ability.tier.at(-1);
const effect = effects.find(e => e.id === 'generic_damage_immunity_self_2turn');
assert.equal(ability.cooldown, 3);
assert.equal(tier.cooldownMaxOverride, 3);
assert.match(loc[tier.descKey], /Damage Immunity .*2 turns/);
assert.ok(tier.effectReference.some(ref => ref.id === effect.id && !ref.contextIndex.length));
assert.equal(effect.expirationCondition.find(row => row.conditionType === 49).conditionValue, '2');
const decoded = helper.decode(ability, tier, effect);
assert.ok(decoded.supported);
assert.deepEqual(decoded.protectedChannels, ['physical', 'special']);
assert.equal(decoded.maximumFrequency, 0.25);
assert.equal(helper.coverage(decoded, 0.25), 0.5);
// Independent current-model expectation: one two-turn interval in a four-turn
// cycle blocks half ordinary incoming damage. With unchanged pool, EHP doubles.
assert.equal(100000 / (1 - helper.coverage(decoded, 0.25)), 200000);
assert.deepEqual(helper.ordinaryBlock(decoded, 0.25, { channel: 'physical', stat: 'physDmg' }), { covered: true, fraction: 0.5 });
for (const damage of [{ channel: 'true', stat: 'fixed' }, { channel: 'physical', stat: 'targetHealth' },
  { channel: 'physical', stat: 'physDmg', noModifyDamage: true }])
  assert.equal(helper.ordinaryBlock(decoded, 0.25, damage).covered, false);
assert.equal(helper.ordinaryBlock(decoded, 0.25, { channel: 'physical', stat: 'physDmg', protectionBypass: true }).covered, true,
  'Protection bypass routes damage through a pool; it is not evidence of bypassing Damage Immunity');
assert.equal(helper.decode(ability, tier, { ...effect, param: ['CONTEXTUAL_EXECUTE'] }).supported, false);
assert.equal(helper.decode(ability, tier, { ...effect, chance: 50 }).supported, false);
assert.equal(helper.decode(ability, tier, { ...effect, expirationCondition: [{ conditionType: 49, conditionValue: '4' }] }).supported, false);
assert.equal(helper.decode(ability, tier, { ...effect, effectedTag: [{ tag: 'physical_damage', exclude: false }] }).supported, false);
assert.throws(() => helper.coverage(decoded, 0.5));
const data = JSON.parse(fs.readFileSync('src/constants/generatedCombatPrograms.json'));
const helperHash = createHash('sha256').update(fs.readFileSync('src/domain/damageImmunityUtility.js')).digest('hex');
assert.equal(data.damageImmunityHelperHash, helperHash, 'Prepared immunity proof must match its compiler helper');
assert.equal(JSON.parse(fs.readFileSync('src/constants/generatedCharacterKits.json')).damageImmunityHelperHash, helperHash);
const kit = data.characters.DROIDEKA;
const special = kit.abilities.find(a => a.id === ability.id);
const index = special.operations.findIndex(op => op.kind === 'damageImmunity');
assert.ok(index >= 0);
const basic = kit.abilities.find(a => a.kind === 'basic');
const attackIndex = basic.operations.findIndex(op => op.id === 'basicability_droideka_damage_u06');
function production(enabled) {
  const chosen = { ...special, phases: { marker: [], state: [], stat: enabled ? [index] : [], turnMeter: [], assist: [], output: [] } };
  const attack = { ...basic, phases: { marker: [], state: [], stat: [], turnMeter: [], assist: [], output: [attackIndex] }, basicTurnMeter: [] };
  const context = vm.createContext({ self: { CharacterKitData: { ...data, characters: { ...data.characters,
    DROIDEKA: { ...kit, abilities: [attack, chosen] } } } } });
  vm.runInContext(fs.readFileSync('src/domain/conditionalUtility.js', 'utf8'), context);
  vm.runInContext(fs.readFileSync('src/domain/characterMechanics.js', 'utf8'), context);
  return context.self.CharacterMechanics;
}
const enabledEngine = production(true), disabledEngine = production(false);
const load = createFrontendLoader();
const combat = load('src/domain/combatUtility.js');
const model = { ...combat.forCharacter('DROIDEKA'), team: [], leaderId: 'OTHER', incomingControlLoss: 0, missingHealth: 0, missingProtection: 0 };
const stats = { health: 50000, protection: 50000, speed: 200, physDmg: 4000, specDmg: 3000,
  physCritChance: 0, specCritChance: 0, critDmg: 150, armor: 0, resistance: 0,
  potency: 0, tenacity: 0, accuracy: 0, critAvoid: 0, dodge: 0, level: 85 };
const enemy = { ...model.matchups[0], critChance: 0, dodge: 0, protectionBypass: 0 };
const near = (x, y) => assert.ok(Math.abs(x - y) < 1e-8, `${x} != ${y}`);
for (const matchup of [enemy, { ...enemy, physicalShare: 1, protectionBypass: 0.5 }, { ...enemy, physicalShare: 0 }]) {
  const protectedResult = enabledEngine.evaluate(stats, model, matchup);
  const ordinaryResult = disabledEngine.evaluate(stats, model, matchup);
  assert.ok(ordinaryResult.self.dps > 0);
  near(protectedResult.self.ehp / ordinaryResult.self.ehp, 2);
  near(protectedResult.self.dps, ordinaryResult.self.dps);
  near(protectedResult.self.incomingDamageImmunityCoverage, 0.5);
  assert.equal(protectedResult.self.statVector.incomingDamageMultiplier, 1);
  near(enabledEngine.evaluate(stats, model, matchup, true), protectedResult.utility);
  near(enabledEngine.evaluate(stats, model, matchup).utility, protectedResult.utility);
}
const edited = enabledEngine.evaluate({ ...stats, speed: 400 }, { ...model, horizonTurns: 20 }, enemy);
near(edited.self.incomingDamageImmunityCoverage, 0.5);
const audit = JSON.parse(fs.readFileSync('reports/characterKitAnalysis.json')).characters.DROIDEKA.abilities.find(a => a.id === ability.id);
assert.ok(audit.omitted.some(row => row.id === effect.id && /expiry|order/.test(row.reason)));
assert.ok(audit.omitted.some(row => row.id === effect.id && /True|no-modify/.test(row.reason)));
console.log('Pinned Droideka direct Damage Immunity shape, two-turn/four-turn coverage, finite EHP oracle and explicit damage-filter exclusions passed.');
