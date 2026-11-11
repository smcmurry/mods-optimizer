import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createFrontendLoader } from './lib/loadFrontend.mjs';
const data = JSON.parse(fs.readFileSync('src/constants/generatedCombatPrograms.json'));
const effects = JSON.parse(fs.readFileSync('data/gameData-cache/effect.json')).data;
const abilities = JSON.parse(fs.readFileSync('data/gameData-cache/ability.json')).data;
const loc = JSON.parse(fs.readFileSync('data/gameData-cache/Loc_ENG_US.txt.json')).data;
const source = effects.find(e => e.id === 'uniqueability_b1battledroidv2_revive_immunity_self');
const uniqueSource = abilities.find(a => a.id === 'uniqueability_b1battledroidv2_02');
assert.equal(source.type, 6);
assert.deepEqual(source.effectedTag, [{ tag: 'revive', exclude: false }]);
assert.equal(source.chance, 100);
assert.equal(source.expirationCondition.length, 0);
assert.equal(source.triggerCondition.length, 0);
assert.ok(uniqueSource.tier.at(-1).effectReference.some(ref => ref.id === source.id && !ref.contextIndex.length));
assert.match(loc[uniqueSource.tier.at(-1).descKey], /can't score critical hits or be revived/i);
const rawRevive = effects.find(e => e.id === 'specialability_jawaengineer01_revive_BASE');
assert.equal(rawRevive.type, 13);
assert.equal(rawRevive.multiplierAmountDecimal, 100);
assert.ok(rawRevive.descriptiveTag.some(tag => !tag.exclude && tag.tag === 'revive'));
assert.equal(rawRevive.target[0].healthState, 3);
assert.ok(rawRevive.target[0].category.category.some(category => category.categoryId === 'species_droid'));
const b1 = data.characters.B1BATTLEDROIDV2;
const unique = b1.abilities.find(a => a.id === uniqueSource.id);
const flagIndex = unique.operations.findIndex(op => op.kind === 'immunity' && op.immunities.includes('reviveImmunity'));
assert.ok(flagIndex >= 0);
const jawa = data.characters.JAWAENGINEER;
const special = jawa.abilities.find(a => a.id === 'specialability_jawaengineer01');
const reviveIndex = special.operations.findIndex(op => op.id === rawRevive.id);
const healIndex = special.operations.findIndex(op => op.id === 'specialability_jawaengineer01_heal_u06');
assert.ok(special.operations[reviveIndex].blockedByImmunity.includes('reviveImmunity'));
assert.ok(!special.operations[healIndex].blockedByImmunity.includes('reviveImmunity'));
function engine(immune, revive = true, heal = false) {
  const context = vm.createContext({ self: { CharacterKitData: { ...data, characters: { ...data.characters,
    JAWAENGINEER: { ...jawa, abilities: [{ ...special, phases: { marker: [], state: [], stat: [], turnMeter: [], assist: [], output: [
      ...(revive ? [reviveIndex] : []), ...(heal ? [healIndex] : [])] } }] },
    B1BATTLEDROIDV2: { ...b1, abilities: [{ ...unique, phases: { marker: [], state: [], stat: immune ? [flagIndex] : [], turnMeter: [], assist: [], output: [] } }] }
  } } } });
  vm.runInContext(fs.readFileSync('src/domain/conditionalUtility.js', 'utf8'), context);
  vm.runInContext(fs.readFileSync('src/domain/characterMechanics.js', 'utf8'), context);
  return context.self.CharacterMechanics;
}
const combat = createFrontendLoader()('src/domain/combatUtility.js');
const stats = { health: 50000, protection: 50000, speed: 200, physDmg: 4000, specDmg: 3000,
  physCritChance: 0, specCritChance: 0, critDmg: 150, armor: 0, resistance: 0,
  potency: 0, tenacity: 0, accuracy: 0, critAvoid: 0, dodge: 0, level: 85 };
const model = { ...combat.forCharacter('JAWAENGINEER'), leaderId: 'OTHER', incomingControlLoss: 0, missingHealth: 0.5,
  alliedDefeatChance: 0.25, team: [{ id: 'B1BATTLEDROIDV2', stats: { ...stats, health: 1, protection: 0 } }],
  stateTags: { B1BATTLEDROIDV2: { revive_immunity: 0 } } };
const enemy = { ...model.matchups[0], critChance: 0, dodge: 0 };
const run = (immune, revive = true, heal = false) => engine(immune, revive, heal).evaluate(stats, model, enemy);
const near = (x, y) => assert.ok(Math.abs(x - y) < 1e-10, `${x} != ${y}`);
const ordinary = run(false), prevented = run(true);
// Existing mean-field dead-ally proxy: 1% of actual B1 Health1, caster rate2,
// source cooldown4 means frequency1/5, defeat fraction1/4 =>0.001 Health/sec.
near(ordinary.allies[0].healingRate, 0.01 * 1 * 2 / 5 * 0.25);
near(prevented.allies[0].healingRate, 0);
assert.equal(prevented.allies[0].statVector.reviveImmunity, 1);
const healing = run(false, false, true), healingWithReviveImmunity = run(true, false, true);
assert.ok(healing.self.healingRate > 0 && healing.allies[0].healingRate > 0);
near(healingWithReviveImmunity.self.healingRate, healing.self.healingRate);
near(healingWithReviveImmunity.allies[0].healingRate, healing.allies[0].healingRate);
const audit = JSON.parse(fs.readFileSync('reports/characterKitAnalysis.json'));
assert.ok(audit.characters.JAWAENGINEER.abilities.find(a => a.id === special.id).omitted.some(row => /ordered death|Revival follow-up/.test(row.reason)));
console.log('Pinned B1 permanent revive immunity blocks actual Jawa Engineer revive recovery proxy and leaves ordinary healing unchanged.');
