import assert from 'node:assert/strict';
import fs from 'node:fs';
import { compileOutgoingCriticalRestriction, sourceBlocksCritical } from './lib/outgoingCriticalSource.mjs';
const effects = Object.fromEntries(JSON.parse(fs.readFileSync('data/gameData-cache/effect.json', 'utf8')).data.map(effect => [effect.id, effect]));
const descriptor = compileOutgoingCriticalRestriction(effects.leaderability_darthnihilus_crit_avoidance_handler, effects);
assert.deepEqual(descriptor.channels, ['physical', 'special']);
assert.equal(descriptor.beforeEvent, 39);
assert.equal(descriptor.afterEvent, 41);
assert.deepEqual(descriptor.excludedActorCategories, [], 'Source critical restriction does not exclude Malak, unlike pool conversion');
for (const channel of descriptor.channels) {
  assert.equal(sourceBlocksCritical(descriptor, ['profession_sith'], channel, 'enemy'), true);
  assert.equal(sourceBlocksCritical(descriptor, ['profession_sith', 'selftag_darthmalak'], channel, 'enemy'), true);
  assert.equal(sourceBlocksCritical(descriptor, ['profession_jedi'], channel, 'enemy'), false);
  assert.equal(sourceBlocksCritical(descriptor, ['profession_sith'], channel, 'ally'), false, 'Interceptor is installed on the opposing side');
}
assert.equal(descriptor.affectsDefenderGeneralCritAvoidance, false, 'Non-Sith attackers must not inherit a permanently immune defender');
const changed = { ...effects, leaderability_darthnihilus_ability_crit_avoidance: {
  ...effects.leaderability_darthnihilus_ability_crit_avoidance, expirationCondition: []
} };
assert.ok(compileOutgoingCriticalRestriction(effects.leaderability_darthnihilus_crit_avoidance_handler, changed).reason, 'Temporal proof is required');
assert.ok(compileOutgoingCriticalRestriction({ ...effects.leaderability_darthnihilus_crit_avoidance_handler, chance: '50' }, effects).reason, 'Restriction requires deterministic installation');
console.log('Nihilus source Sith physical/Special critical interceptor, Malak inclusion, opponent-only scope and expiry proof passed.');
