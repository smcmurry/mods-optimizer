import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const worker = vm.createContext({ self: {}, postMessage() {} });
vm.runInContext(fs.readFileSync('public/workers/optimizer.js', 'utf8'), worker);
const slots = ['square', 'arrow', 'diamond', 'triangle', 'circle', 'cross'];
const character = { baseID: 'A', playerValues: { gearLevel: 13 }, optimizerSettings: { minimumModDots: 5 } };
const limits = { primaries: { arrow: ['Speed', 'Health %'] }, setCombinations: [{ speed: 1, health: 1 }, { health: 3 }] };
const scores = {};
const mods = slots.flatMap((slot, i) => ['speed', 'health'].map(set => {
  const id = set + i;
  scores[id] = set === 'speed' ? 50 + i : 60 - i;
  return { id, slot, set: { name: set }, primaryStat: { type: slot === 'arrow' ? 'Speed' : 'Health %' }, pips: 5 };
}));
const result = worker.findBestGGSet(mods, character, limits, scores);
assert.equal(result.length, 6);
assert.equal(result.filter(mod => mod.set.name === 'speed').length, 4);
// Brute force every slot's two choices as an independent reference.
let maximum = -Infinity;
for (let mask = 0; mask < 64; mask++) {
  const picked = slots.map((_, i) => mods[2 * i + ((mask >> i) & 1)]);
  if (picked.filter(mod => mod.set.name === 'speed').length === 4)
    maximum = Math.max(maximum, picked.reduce((sum, mod) => sum + scores[mod.id], 0));
}
assert.equal(result.reduce((sum, mod) => sum + scores[mod.id], 0), maximum);
const invalid = { ...mods[2], id: 'invalid', primaryStat: { type: 'Health %' } };
scores.invalid = 100;
assert.ok(!worker.findBestGGSet([...mods, invalid], character, limits, scores).some(mod => mod.id === 'invalid'));
assert.equal(worker.findBestGGSet(mods.filter(mod => mod.slot !== 'arrow'), character, limits, scores), null);
assert.equal(worker.findBestGGSet(mods.map(mod => ({ ...mod, pips: 6 })), { ...character, playerValues: { gearLevel: 11 } }, limits, scores), null);
assert.equal(worker.findBestGGSet(mods, character, null, scores), null);
const other = { ...character, baseID: 'B' };
const order = [{ id: 'A', target: {} }, { id: 'B', target: {} }];
const gg = { scores, restrictions: { A: limits, B: limits } };
const rows = worker.optimizeGGMods(mods, { A: character, B: other }, order, {}, gg);
assert.equal(rows[0].assignedMods.length, 6);
assert.ok(rows[1].assignedMods.every(id => !rows[0].assignedMods.includes(id)));
assert.equal(rows[0].ggOptimization, true);
const locked = { ...other, optimizerSettings: { ...other.optimizerSettings, isLocked: true } };
const owned = mods.map(mod => ({ ...mod, characterID: 'B' }));
assert.equal(worker.optimizeGGMods(owned, { A: character, B: locked }, order, {}, gg)[0].assignedMods.length, 0);
assert.equal(worker.optimizeGGMods(owned, { A: character, B: other }, order.slice(0, 1), { lockUnselectedCharacters: true }, gg)[0].assignedMods.length, 0);
const fallback = worker.optimizeGGMods(owned, { B: other }, [order[1]], {}, { scores, restrictions: {} });
assert.equal(fallback[0].assignedMods.length, 6);
assert.match(fallback[0].messages[0], /other complete sets/);
assert.match(fs.readFileSync('public/workers/optimizer.js', 'utf8'), /!previousRun.modAssignments\[index\].ggOptimization/);
console.log('Passed GG optimizer: exact maximum, strict top choices, gear eligibility, locks, priority, fallback and cache mode guard.');
