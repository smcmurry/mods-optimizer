import assert from 'node:assert/strict';
import { mergeTeamLists, planDeployment } from './lib/gacDeployment.mjs';
const squad = (name, ids) => ({ name, members: ids.map(id => ({ id, name: id, relic: 0 })), tier: 'Master', band: 1, source: 'https://example.org' });
const exact = { sections: Object.fromEntries(['5v5-offense', '5v5-defense', '3v3-offense', '3v3-defense'].map(key => [key, { candidates: [] }])) };
exact.sections['5v5-offense'].candidates = [squad('A', ['A', 'B', 'C', 'D', 'E']), squad('Solo', ['WAMPA'])];
exact.sections['5v5-defense'].candidates = [squad('A', ['A', 'B', 'C', 'D', 'E'])];
const variants = { candidates: [{ mode: '5v5', members: ['F', 'G', 'H', 'I', 'J'].map(id => ({ id, name: id, relic: 0 })),
  evidence: 'Suggested substitution (untested)', sources: ['https://example.org'], notes: 'Test', tier: null },
{ mode: '5v5', offenseOnly: true, members: [{ id: 'VADER', name: 'Vader', relic: 5 }], evidence: 'Documented', sources: ['https://example.org'], notes: 'solo' }] };
const merged = mergeTeamLists(exact, variants);
assert.equal(merged['5v5-offense'].candidates.length, 4);
assert.equal(merged['5v5-defense'].candidates.length, 2);
assert.equal(merged['5v5-defense'].candidates[1].tier, null, 'Do not invent tier');
assert.equal(exact.sections['5v5-offense'].candidates.length, 2, 'Do not mutate source catalog');
const plan = planDeployment(merged, '5v5', 2);
assert.equal(plan.defense.length, 2);
assert.equal(plan.offense.length, 2);
assert.ok(plan.offense.some(p => p.team.members[0].id === 'WAMPA'));
assert.ok(plan.offense.some(p => p.team.members[0].id === 'VADER'));
const ids = [...plan.defense, ...plan.offense].flatMap(p => p.team.members.map(m => m.id));
assert.equal(ids.length, new Set(ids).size, 'No character reused across either side');
assert.equal(planDeployment(merged, '5v5', 3).unfilledDefense, 1);
assert.equal(planDeployment(merged, '5v5', 0).defense.length, 0);
assert.equal(planDeployment(merged, '3v3', 7).unfilledDefense, 7, 'Do not borrow teams from other mode');
assert.throws(() => planDeployment(merged, '5v5', -1));
console.log('Deployment tests passed: integrated lists, no fake tier, side/mode constraints, capacity, shortfalls and no reuse.');
