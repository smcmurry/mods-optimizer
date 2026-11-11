import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import { createFrontendLoader } from './lib/loadFrontend.mjs';
const require = createRequire(import.meta.url);
const dispel = require('../src/domain/dispelUtility.js');
const effects = JSON.parse(fs.readFileSync('data/gameData-cache/effect.json')).data;
const find = id => { const row = effects.find(e => e.id === id); assert.ok(row, id); return row; };
const hasTag = (row, tag) => row.descriptiveTag.some(t => !t.exclude && t.tag === tag);
// Independent source proof: ordinary stun/ability block/daze examples declare
// clearable_debuff; fear and special variants are not silently covered.
for (const tag of ['paralysis_debuff', 'stifle_debuff', 'daze_debuff']) {
  assert.ok(effects.some(e => e.type !== 5 && hasTag(e, tag) && hasTag(e, 'clearable_debuff')));
}
assert.ok(effects.some(e => e.type !== 5 && hasTag(e, 'fear_debuff') && !hasTag(e, 'clearable_debuff')));
assert.ok(effects.some(e => e.type !== 5 && hasTag(e, 'special_paralysis_debuff') && !hasTag(e, 'clearable_debuff')));
assert.deepEqual(dispel.decode(find('generic_dispel_debuffs_self')).controls, ['stun', 'abilityBlock', 'daze']);
assert.deepEqual(dispel.decode(find('dispell_clearable_ally_all_INSTANT')).controls, ['stun', 'abilityBlock', 'daze']);
assert.deepEqual(dispel.decode(find('dispel_preparation_self')).controls, []);
assert.deepEqual(dispel.decode(find('generic_dispel_buffs_single')).controls, []);
assert.equal(dispel.decode(find('generic_dispel_buffs_single')).clearsAllBuffs, true);
assert.deepEqual(dispel.decode(find('uniqueability_savageopress01_dispel_abilityblock')).controls, ['abilityBlock']);
assert.deepEqual(dispel.decode(find('uniqueability_savageopress01_dispel_stun')).controls, ['stun']);
assert.deepEqual(dispel.decode(find('uniqueability_savageopress01_dispel_daze')).controls, ['daze']);
const fear = dispel.decode(find('leaderability_raccoon01_dispel_cc'));
assert.ok(!fear.controls.includes('fear'));
assert.ok(fear.issues.some(issue => /undispellable/.test(issue)));
assert.deepEqual(dispel.decode({ ...find('generic_dispel_debuffs_self'), additiveAmountDecimal: '10000' }).controls, []);
assert.deepEqual(dispel.decode({ ...find('generic_dispel_debuffs_self'), effectedTag: [{ tag: 'paralysis_debuff', exclude: true }] }).controls, []);
assert.deepEqual(dispel.coverage({ stun: 1, daze: 20, abilityBlock: -2 }, 2), { stun: 0.5, fear: 0, daze: 1, abilityBlock: 0 });
const load = createFrontendLoader();
const combat = load('src/domain/combatUtility.js');
const data = JSON.parse(fs.readFileSync('src/constants/generatedCombatPrograms.json'));
const stats = { health: 50000, protection: 50000, speed: 200, physDmg: 4000, specDmg: 3000,
  physCritChance: 0, specCritChance: 0, critDmg: 150, armor: 0, resistance: 0,
  potency: 0, tenacity: 0, accuracy: 0, critAvoid: 0, dodge: 0, level: 85 };
const near = (x, y) => assert.ok(Math.abs(x - y) < 1e-10, `${x} != ${y}`);
function sourceRun(id, dispelId, weights, enabled = true) {
  const kit = data.characters[id];
  const basic = kit.abilities.find(a => a.kind === 'basic');
  const damage = { ...basic, phases: { marker: [], state: [], stat: [], turnMeter: [], assist: [],
    output: basic.operations.map((op, i) => op.kind === 'damage' && !op.when.length ? i : -1).filter(i => i >= 0) } };
  const owner = kit.abilities.find(a => a.operations.some(op => op.id === dispelId));
  const index = owner.operations.findIndex(op => op.id === dispelId);
  assert.ok(index >= 0);
  const clearing = { ...owner, phases: { marker: [], state: [], stat: [], turnMeter: [], assist: [], output: enabled ? [index] : [] } };
  const characters = Object.fromEntries(Object.entries(data.characters).map(([id, row]) => [id, { ...row, abilities: [], defaultRotation: {} }]));
  characters[id] = { ...kit, abilities: [damage, clearing], defaultRotation: { [basic.id]: 1, [owner.id]: 1 } };
  const context = vm.createContext({ self: { CharacterKitData: { ...data, characters } } });
  vm.runInContext(fs.readFileSync('src/domain/conditionalUtility.js', 'utf8'), context);
  vm.runInContext(fs.readFileSync('src/domain/characterMechanics.js', 'utf8'), context);
  const model = { ...combat.forCharacter(id), team: [{ id: 'BOSSK', stats }], leaderId: 'OTHER', incomingControlLoss: 0.2,
    missingHealth: 0, missingProtection: 0, incomingControlWeights: weights };
  const enemy = { ...model.matchups[0], armor: 0, resistance: 0, potency: 100, dodge: 0, critChance: 0 };
  return context.self.CharacterMechanics.evaluate(stats, model, enemy);
}
const weights = { stun: 0.25, fear: 0.25, daze: 0.25, abilityBlock: 0.25 };
const cleared = sourceRun('4LOM', 'specialability_4lom02_dispel_debuff_all_ally', weights);
const uncleared = sourceRun('4LOM', 'specialability_4lom02_dispel_debuff_all_ally', weights, false);
near(uncleared.self.incomingControlLostOutput, 0.17);
near(cleared.self.incomingControlCleanseCoverage, 0.75);
near(cleared.allies[0].incomingControlCleanseCoverage, 0.75);
near(cleared.self.incomingControlLostOutput, 0.0425);
near(cleared.self.dps / uncleared.self.dps, 0.9575 / 0.83);
near(cleared.self.assistDamageRate, 0);
const fearOnly = { stun: 0, fear: 1, daze: 0, abilityBlock: 0 };
near(sourceRun('4LOM', 'specialability_4lom02_dispel_debuff_all_ally', fearOnly).self.incomingControlLostOutput, 0.17);
// Removing Prepared is a friendly dispel but cannot cure control or create DPS.
const markerCleared = sourceRun('L3_37', 'dispel_preparation_self', weights);
const markerUncleared = sourceRun('L3_37', 'dispel_preparation_self', weights, false);
near(markerCleared.self.incomingControlCleanseCoverage, 0);
near(markerCleared.self.dps, markerUncleared.self.dps);
near(markerCleared.self.assistDamageRate, 0);
console.log('Source-filtered dispel scopes, known clearable control evidence, Fear exclusion and per-recipient bounds passed.');
