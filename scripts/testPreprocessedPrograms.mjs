import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { preprocessCombatPrograms } from './preprocessCombatPrograms.mjs';
const require = createRequire(import.meta.url);
const combat = require('../src/domain/combatUtility');
const mechanics = require('../src/domain/characterMechanics');
const reference = require('./fixtures/characterMechanicsReference.cjs');
const prepared = require('../src/constants/generatedCombatPrograms.json');
const raw = fs.readFileSync('src/constants/generatedCharacterKits.json', 'utf8');
const inputHash = crypto.createHash('sha256').update(raw).digest('hex');
const compilerHash = crypto.createHash('sha256').update(fs.readFileSync('scripts/preprocessCombatPrograms.mjs')).digest('hex');
assert.equal(prepared.preprocessing.inputHash, inputHash);
assert.equal(prepared.preprocessing.compilerHash, compilerHash);
assert.equal(JSON.stringify(preprocessCombatPrograms(JSON.parse(raw), inputHash, compilerHash)), JSON.stringify(prepared), 'Artifact must reproduce deterministically from its source');
assert.equal(prepared.preprocessing.operations, Object.values(JSON.parse(raw).characters).reduce((sum, kit) => sum + kit.abilities.reduce((total, ability) => total + ability.operations.length, 0), 0));
assert.equal(prepared.selectors.length, prepared.preprocessing.selectors);

const stats = { health: 65000, protection: 70000, speed: 190, physDmg: 7000, specDmg: 5500,
  physCritChance: 55, specCritChance: 35, critDmg: 150, armor: 550, resistance: 400,
  potency: 80, tenacity: 90, accuracy: 0, critAvoid: 0, level: 85 };
const assertSame = (input, model, enemy, label) => {
  const expected = reference.evaluate(input, model, enemy);
  // Score a cold program before creating diagnostics, then score again after
  // its fixed queries/recipients have been specialized for the chosen team.
  assert.equal(mechanics.evaluate(input, model, enemy, true), expected.utility, `Cold scalar mismatch: ${label}`);
  const actual = mechanics.evaluate(input, model, enemy);
  assert.equal(JSON.stringify(actual), JSON.stringify(expected), `Detailed mismatch: ${label}`);
  assert.equal(mechanics.evaluate(input, model, enemy, true), expected.utility, `Warm scalar mismatch: ${label}`);
};
for (const id of combat.characterIds()) {
  for (const variant of [0, 1]) {
    const model = combat.forCharacter(id);
    const team = combat.getKit(id).recommendedTeams[0] || [];
    model.leaderId = team[0] || id;
    if (variant) model.team = team.filter(ally => ally !== id && combat.getKit(ally)).slice(0, 4)
      .map(ally => ({ id: ally, tags: [], physicalShare: 1, stats: { ...stats, speed: 240 } }));
    const input = variant ? { ...stats, health: 95000, speed: 340, potency: 160, tenacity: 210, physCritChance: 110 } : stats;
    if (variant) {
      model.unitValues = Object.fromEntries([id, ...model.team.map(ally => ally.id)].map(memberId => [memberId, { relicLevel: 9 }]));
      model.ultimateUses = 1; model.advantageUptime = 0.4; model.missingHealth = 0.8;
      model.blackboards = Object.fromEntries([id, ...model.team.map(ally => ally.id)].map(memberId => [memberId,
        Object.fromEntries(combat.getKit(memberId).abilities.flatMap(ability => ability.operations)
          .flatMap(op => op.context.filter(query => query.kind === 'blackboard').map(query => [query.key, 2])))]));
    }
    model.matchups.forEach((enemy, index) => assertSame(input, model, enemy, `${id}/${variant}/${index}`));
  }
}
console.log(`All ${combat.characterIds().length} preprocessed kits exactly match the raw-kit reference interpreter: solo/teams, relic metadata, three matchups, cold/warm scores and full diagnostics.`);
const model = combat.forCharacter('HERMITYODA');
model.team = [{ id: 'R2D2_LEGENDARY', tags: [], physicalShare: 1, stats }, { id: 'JEDIKNIGHTREVAN', tags: [], physicalShare: 1, stats }];
model.leaderId = 'JEDIKNIGHTREVAN';
assertSame(stats, model, model.matchups[0], 'original team');
model.team[0].stats = { ...stats, health: 100000, speed: 320 };
model.leaderId = 'HERMITYODA'; model.missingHealth = 0.2; model.ultimateUses = 1;
model.matchups[0].categories = ['profession_jedi']; model.stateTags = { HERMITYODA: { attack_buff: 0.7 } };
assertSame({ ...stats, speed: 400 }, model, model.matchups[0], 'edited team/leader/assumptions/opponent');
const context = vm.createContext({ self: { CharacterKitData: { ...prepared, preprocessing: { ...prepared.preprocessing, kitRevision: 'stale' } } } });
vm.runInContext(fs.readFileSync('src/domain/conditionalUtility.js', 'utf8'), context);
assert.throws(() => vm.runInContext(fs.readFileSync('src/domain/characterMechanics.js', 'utf8'), context), /require preprocessing/);
assert.equal(fs.readFileSync('public/workers/characterMechanics.js', 'utf8'), fs.readFileSync('src/domain/characterMechanics.js', 'utf8'));
assert.equal(fs.readFileSync('public/workers/characterKits.js', 'utf8'), 'self.CharacterKitData=' + JSON.stringify(prepared) + ';\n');
console.log('Artifact freshness, deterministic generation, worker synchronization and edited model invalidation passed.');
