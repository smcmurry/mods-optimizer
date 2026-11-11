import assert from 'node:assert/strict';
import {createFrontendLoader} from './lib/loadFrontend.mjs';
const load = createFrontendLoader();
const {ggScore, ggMaxValue, formatGGScore, characterGGScore} = load('src/utils/ggScore.js');
const {ggWeights, ggPrimaryFit} = load('src/constants/ggScoreCalibration.js');
const Stat = load('src/domain/Stat.js').default;
const Mod = load('src/domain/Mod.js').default;
function perfect(set = 'health', slot = 'triangle', primary = 'Critical Damage %') {
  const types = Object.keys(ggWeights[set]).filter(t => t !== primary).sort((a,b) => ggWeights[set][b]-ggWeights[set][a]).slice(0,4);
  return new Mod('test', slot, {name:set}, 15, 6, new Stat(primary, '10'), types.map((t,i) => {
    const rolls = i < 2 ? 5 : 1;
    return new Stat(t, String(ggMaxValue(t,rolls)), rolls);
  }), 'CHAR', 5);
}
for (const set of Object.keys(ggWeights)) {
  for (const slot of Object.keys(ggPrimaryFit)) {
    for (const primary of Object.keys(ggPrimaryFit[slot][set])) {
      const mod = perfect(set, slot, primary);
      const result = ggScore(mod);
      assert.ok(Math.abs(result.score - 100*ggPrimaryFit[slot][set][primary]) < 1e-8);
      assert.equal(result.grade, null);
      assert.equal(result.cohort, `${set}:${slot}${primary === 'Speed' ? ':Speed' : ''}`);
      assert.equal(result.score, ggScore(mod.equip('OTHER')).score);
    }
  }
}
const full = perfect();
assert.equal(ggScore(full).score, 100);
assert.equal(formatGGScore(99.99999), '99.9');
assert.equal(formatGGScore(100), '100');
const near = perfect(); near.secondaryStats[0].value -= .0001;
assert.ok(ggScore(near).score < 100);
assert.equal(formatGGScore(ggScore(near).score), '99.9');
const five = new Mod('five','triangle',{name:'health'},1,5,new Stat('Critical Damage %','5'),[
  new Stat('Speed','25',5),new Stat('Offense %','1.126',2),new Stat('Health %','1',1),new Stat('Defense','4',1)
], 'CHAR',5);
assert.equal(ggScore(five).score,ggScore(five.levelUp()).score);
assert.ok(ggScore(five.slice()).score >= ggScore(five).score);
assert.deepEqual(five.slice().secondaryStats.map(s=>s.rolls),five.secondaryStats.map(s=>s.rolls));
assert.equal(characterGGScore([]),0);
assert.equal(characterGGScore([full]),100/6);
assert.equal(characterGGScore([full,full]),null);
const invalid = perfect(); invalid.secondaryStats[0].value = NaN;
assert.equal(ggScore(invalid).score,null);
assert.equal(characterGGScore([invalid]),null);
const empty = perfect(); empty.secondaryStats=[];
assert.equal(ggScore(empty).score,0);
const cutoff = {SSS:100,SS:95,S:90,A:80,B:65,C:40};
assert.equal(ggScore(full,{[ggScore(full).cohort]:cutoff}).grade,'SSS');
assert.equal(ggScore(empty,{[ggScore(empty).cohort]:cutoff}).grade,'D');
const React = load('node_modules/react/index.js');
const {renderToStaticMarkup} = load('node_modules/react-dom/server.js');
const {GGScore,CharacterGGScoreLabel} = load('src/components/GGScore.js');
const html=renderToStaticMarkup(React.createElement(GGScore,{mod:perfect('speed','arrow','Offense %')}));
assert.ok(html.includes('75.0') && html.includes('Primary fit ×0.75') && html.includes('Grade uncalibrated'));
assert.ok(renderToStaticMarkup(React.createElement(CharacterGGScoreLabel,{score:100/6})).includes('16.7'));
console.log('Passed GG scoring: all supplied set/slot/primary fits, perfect ceilings, rounding, cohorts, grades, slicing, character averages, invalid data, and rendered labels.');
