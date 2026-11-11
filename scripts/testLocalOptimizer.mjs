import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

// Exercise real searches twice against the frozen public roster. This checks
// reproducibility of allocation, conversion and reports, not kit correctness.
const directory = path.resolve('reports/local-optimizer/297546974');
fs.mkdirSync(directory, { recursive: true });
const reports = [1, 2].map(index => {
  const filename = path.join(directory, `replay-test-${index}.json`);
  const result = spawnSync(process.execPath, ['scripts/runLocalOptimizer.mjs', '--characters',
    'R2D2_LEGENDARY,HERMITYODA,THIRDSISTER,BENSOLO', '--output', filename], { stdio: 'inherit' });
  assert.equal(result.status, 0, 'Local optimization must complete successfully');
  return JSON.parse(fs.readFileSync(filename, 'utf8'));
});
const [first, second] = reports;
for (const key of ['source', 'settingsHash', 'engineHash', 'engineHashVersion', 'kitRevision', 'scoringVersion', 'order', 'globalSettings']) {
  assert.deepEqual(second[key], first[key], `Replay inputs changed: ${key}`);
}
assert.deepEqual(second.characters, first.characters, 'Identical frozen inputs must reproduce every allocation, stat and score');
assert.deepEqual(second.unresolvedStates, first.unresolvedStates);
assert.equal(first.order.length, 4);
const allAssigned = first.characters.filter(row => first.order.includes(row.id)).flatMap(row => row.after.mods.map(mod => mod.id));
assert.equal(new Set(allAssigned).size, allAssigned.length, 'A mod cannot be allocated to two optimized characters');
assert.equal(allAssigned.length, 24, 'All four optimized characters must receive six mods');
const analysis = spawnSync(process.execPath, ['scripts/analyzeLocalOptimizer.mjs', path.join(directory, 'replay-test-2.json'),
  path.join(directory, 'replay-test-1.json')], { stdio: 'inherit' });
assert.equal(analysis.status, 0);
const markdown = fs.readFileSync(path.join(directory, 'replay-test-2.md'), 'utf8');
assert.ok(markdown.includes('Allocation comparison under the current model'));
assert.equal((markdown.match(/\| 0\.0000 \|/g) || []).length, 4, 'Identical allocations must have zero change when rescored under one calculator');
const incompatible = path.join(directory, 'replay-test-incompatible.json');
fs.writeFileSync(incompatible, JSON.stringify({ ...first, settingsHash: 'different-selection' }));
const rejected = spawnSync(process.execPath, ['scripts/analyzeLocalOptimizer.mjs', path.join(directory, 'replay-test-2.json'), incompatible], { encoding: 'utf8' });
assert.notEqual(rejected.status, 0, 'Different settings cannot support attributing a change to the calculator');
assert.ok(rejected.stderr.includes('Cannot attribute changes to the engine'));
console.log('Frozen-roster replay passed: identical allocations, stats, scores and gaps; no duplicate mod assignments.');
