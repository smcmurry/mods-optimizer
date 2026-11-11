import assert from 'node:assert/strict';
import {createFrontendLoader} from './lib/loadFrontend.mjs';
const load = createFrontendLoader();
const forecast = load('src/utils/sliceTargetForecast.js').default;
const {finalScoreSamples, compareTargetChance} = load('src/utils/sliceTargetForecast.js');
const ranked = [
  {mod:{id:'lower-chance'},targetChance:.8,remainingSlices:1,expectedScore:90},
  {mod:{id:'more-slices'},targetChance:.9,remainingSlices:5,expectedScore:90},
  {mod:{id:'lower-average'},targetChance:.9,remainingSlices:2,expectedScore:65},
  {mod:{id:'best'},targetChance:.9,remainingSlices:2,expectedScore:70}
].sort(compareTargetChance);
assert.deepEqual(ranked.map(row=>row.mod.id), ['best','lower-average','more-slices','lower-chance']);
const expected = load('src/utils/expectedSixAScore.js').default;
const {ggScore} = load('src/utils/ggScore.js');
const {sliceSellLine} = load('src/utils/sliceSellLine.js');
const Mod = load('src/domain/Mod.js').default;
const Stat = load('src/domain/Stat.js').default;
const make = () => new Mod('test', 'triangle', {name: 'speed'}, 15, 6,
  new Stat('Critical Damage %', '42'), [new Stat('Speed', '31', 5),
    new Stat('Offense %', '6.8', 4), new Stat('Health %', '2', 1),
    new Stat('Protection %', '3', 1)], null, 4);
const mod = make();
const row = {mod, score: ggScore(mod).score, ...expected(mod)};
const samples = finalScoreSamples(mod, row.remainingRolls);
assert.equal(samples.length, 1024);
assert.deepEqual(finalScoreSamples(make(), 1), samples, 'Repeatable independent of object identity');
assert.ok(samples.every(score => score >= row.score && score <= row.potentialScore + 1e-8));
assert.ok(Math.abs(samples.reduce((a,b) => a+b,0)/samples.length-row.expectedScore) < .2, 'Simulation matches exact expectation');
const impossible = forecast(row, {threshold: row.potentialScore + 1, cutoff: 40});
assert.equal(impossible.targetChance, 0);
assert.equal(forecast(row, {goal: row.potentialScore + 1, threshold: null, cutoff: null}).targetChance, 0,
  'Incomplete inventories still forecast against the selected goal');
const certain = forecast(row, {threshold: row.score, cutoff: 40});
assert.equal(certain.targetChance, 1);
assert.equal(certain.remainingSlices, 1);
assert.equal(certain.gainPerSlice, certain.expectedTop300Gain);
assert.ok(Math.abs(certain.expectedTop300Gain-(row.expectedScore-row.score)) < .2, 'Top-300 member improves its own slot');
const outside = forecast(row, {threshold: 95, cutoff: row.potentialScore});
assert.equal(outside.expectedTop300Gain, 0, 'Cannot replace a stronger cutoff');
for (const [average, target] of [[59.9,60],[60.1,65],[65.1,70],[75,70]]) {
  const leader = make();
  const factor = average / ggScore(leader).score;
  leader.secondaryStats.forEach(stat => {stat.value = stat.type === 'Speed' ? (stat.value-1)*factor+1 : stat.value*factor;});
  assert.equal(sliceSellLine(Array(300).fill(leader)).goal, target);
}
const five = new Mod('five', 'triangle', {name:'speed'},15,5,new Stat('Critical Damage %','36'),
  [new Stat('Speed','20',4),new Stat('Offense %','.8',2),new Stat('Health %','.8',1),new Stat('Protection %','1.5',1)],null,5);
const fiveRow = {mod:five,score:ggScore(five).score,...expected(five)};
assert.equal(forecast(fiveRow,{threshold:60,cutoff:40}).remainingSlices,5,'Include the 5A to 6E conversion');
const fiveSamples=finalScoreSamples(five,4);
assert.ok(Math.abs(fiveSamples.reduce((a,b)=>a+b,0)/1024-fiveRow.expectedScore)<.6);
const early = new Mod('early', 'triangle', {name:'speed'},15,5,new Stat('Critical Damage %','36'),
  [new Stat('Speed','5',1),new Stat('Offense %','.4',1),new Stat('Health %','.8',1),new Stat('Protection %','1.5',1)],null,1);
const earlyForecast=expected(early);
const earlySamples=finalScoreSamples(early,8);
assert.ok(earlySamples.every(score=>score<=earlyForecast.potentialScore+1e-8));
assert.ok(Math.abs(earlySamples.reduce((a,b)=>a+b,0)/1024-earlyForecast.expectedScore)<.8,'Five-dot future rolls scale before six-dot slicing');
console.log('Passed target simulations, expected gains, milestones, repeatability, ceilings, and remaining slice steps.');
