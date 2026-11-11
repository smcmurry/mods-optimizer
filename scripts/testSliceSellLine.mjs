import assert from 'node:assert/strict';
import {createFrontendLoader} from './lib/loadFrontend.mjs';
const load = createFrontendLoader();
const {sliceSellLine, isBelowSellLine, sellRecommendation} = load('src/utils/sliceSellLine.js');
const {ggScore} = load('src/utils/ggScore.js');
const Mod = load('src/domain/Mod.js').default;
const Stat = load('src/domain/Stat.js').default;
const make = (id, speed = 31) => new Mod(id, 'triangle', {name: 'speed'}, 15, 6,
  new Stat('Critical Damage %', '42'), [new Stat('Speed', String(speed), 5),
    new Stat('Offense %', '8.5', 5), new Stat('Health %', '2', 1),
    new Stat('Protection %', '3', 1)], 'equipped', 5);
const perfect = Array.from({length: 300}, (_, i) => make(String(i)));
assert.equal(ggScore(perfect[0]).score, 100);
assert.deepEqual(sliceSellLine(perfect), {count: 300, average: 100, cutoff: 100, goal: 70, threshold: 70});
assert.equal(sliceSellLine(perfect.slice(1)).threshold, null);
assert.equal(sliceSellLine([]).average, null);
const weaker = make('weak', 1);
const input = perfect.slice(1).concat(weaker);
const baseline = sliceSellLine(input);
assert.equal(baseline.cutoff, ggScore(weaker).score);
assert.equal(baseline.threshold, 70);
assert.equal(sliceSellLine(perfect, '60').threshold, 60);
assert.equal(sliceSellLine(perfect, '50').threshold, 50);
assert.equal(sliceSellLine(perfect, '55').threshold, 55);
assert.deepEqual(sliceSellLine(perfect.concat(weaker, {primaryStat: null})), sliceSellLine(perfect));
assert.equal(input[299], weaker, 'Do not sort the input inventory');
const line = {threshold: 60};
for (const mod of [{characterID: 'equipped'}, {}]) {
  const protectedRow = {mod, score: 45};
  const baseline = {threshold: 60, cutoff: 40};
  assert.equal(sellRecommendation({...protectedRow, expectedScore: 60, potentialScore: 70}, baseline), 'keep');
  assert.equal(sellRecommendation({...protectedRow, expectedScore: 55, potentialScore: 70, targetChance: .25}, baseline), 'gamble');
  assert.equal(sellRecommendation({...protectedRow, expectedScore: 55, potentialScore: 70, targetChance: .1}, baseline), 'consider');
  assert.equal(sellRecommendation({...protectedRow, expectedScore: 50, potentialScore: 59}, baseline), 'sell');
}
assert.equal(sellRecommendation({expectedScore: 59, potentialScore: 80, targetChance: .25}, line), 'gamble');
assert.equal(sellRecommendation({expectedScore: 59, potentialScore: 80, targetChance: .249}, line), 'consider');
assert.equal(sellRecommendation({mod: {characterID: 'equipped'}, score: 20, expectedScore: 30, potentialScore: 40}, line), 'sell');
assert.equal(sellRecommendation({mod: {}, score: 40, expectedScore: 45, potentialScore: 50}, {threshold: 60, cutoff: 40}), 'sell');
assert.equal(sellRecommendation({expectedScore: 60, potentialScore: 70}, line), 'keep');
assert.equal(sellRecommendation({expectedScore: 70, potentialScore: 80}, line), 'keep');
assert.equal(sellRecommendation({expectedScore: 59, potentialScore: 60}, line), 'consider');
assert.equal(sellRecommendation({expectedScore: 59, potentialScore: 80}, line), 'consider');
assert.equal(sellRecommendation({expectedScore: 59, potentialScore: 59.99}, line), 'sell');
assert.equal(sellRecommendation({expectedScore: 59, potentialScore: NaN}, line), null);
assert.equal(sellRecommendation({expectedScore: 59, potentialScore: 80}, {threshold: null}), null);
assert.equal(isBelowSellLine({expectedScore: 50, potentialScore: 59.99}, line), true);
for (const row of [{expectedScore: 50, potentialScore: 60}, {expectedScore: 50, potentialScore: 70},
  {expectedScore: 60, potentialScore: 59}, {expectedScore: null, potentialScore: 50}]) {
  assert.equal(isBelowSellLine(row, line), false);
}
assert.equal(isBelowSellLine({expectedScore: 0, potentialScore: 0}, {threshold: null}), false);
console.log('Passed sell line: top 300, completed/equipped mods, average threshold, boundaries, invalid data, small inventories.');



