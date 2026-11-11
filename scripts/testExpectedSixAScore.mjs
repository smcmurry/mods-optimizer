import assert from 'node:assert/strict';
import {createFrontendLoader} from './lib/loadFrontend.mjs';
const load=createFrontendLoader();
const {default:forecast,expectedRollCounts}=load('src/utils/expectedSixAScore.js');
const {ggScore}=load('src/utils/ggScore.js');
const recommend=load('src/utils/recommendedSlices.js').default;
const nextSlice=load('src/utils/expectedNextSlice.js').default;
const Mod=load('src/domain/Mod.js').default;
const Stat=load('src/domain/Stat.js').default;
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const make=(counts,values,pips=6,tier=4,level=15)=>new Mod('test','triangle',{name:'speed'},level,pips,
  new Stat('Critical Damage %','36'),['Speed','Offense %','Health %','Protection %'].map((t,i)=>new Stat(t,String(values[i]),counts[i])),null,tier);
// Capped stats leave the target pool; the other stats share the next roll.
assert.deepEqual(expectedRollCounts([5,5,1,1],0),[0,0,0,0]);
assert.deepEqual(expectedRollCounts([5,4,1,1],1),[0,1/3,1/3,1/3]);
const expected=expectedRollCounts([4,4,1,1],2);
// Exhaustively enumerate two roll targets independently of the DP.
const brute=[0,0,0,0];
for(let a=0;a<4;a++) {
  const counts=[4,4,1,1];counts[a]++;
  const choices=counts.map((c,i)=>c<5?i:-1).filter(i=>i>=0);
  choices.forEach(b=>{brute[a]+=1/4/choices.length;brute[b]+=1/4/choices.length;});
}
expected.forEach((n,i)=>close(n,brute[i]));
close(expectedRollCounts([1,1,1,1],8).reduce((a,b)=>a+b,0),8);
const mod=make([5,4,1,1],[26,5,1,2]);
const before=JSON.stringify(mod);
const prediction=forecast(mod);
assert.equal(prediction.remainingRolls,1);
// Score the three possible final mods at the assumed mean roll values.
const means=[4.5,(.85+1.7)/2,(1+2)/2,(1.5+3)/2];
let average=0;
for(const i of [1,2,3]) {
  const stats=mod.secondaryStats.map((s,j)=>j===i?new Stat(s.type,String(s.value+means[j]),s.rolls+1):s);
  average+=ggScore({...mod,tier:5,secondaryStats:stats}).score/3;
}
close(prediction.expectedScore,average);
// Best remaining roll cannot go to capped speed; offense is the next best weight.
const bestStats=mod.secondaryStats.map((s,i)=>i===1?new Stat(s.type,String(s.value+1.7),s.rolls+1):s);
close(prediction.potentialScore,ggScore({...mod,secondaryStats:bestStats}).score);
assert.ok(prediction.potentialScore>prediction.expectedScore);
assert.equal(JSON.stringify(mod),before);
const five=make([2,2,1,1],[10,.8,.8,1.5],5,3);
assert.equal(forecast(five).remainingRolls,6);
const gold=make([4,2,1,1],[20,.8,.8,1.5],5,5);
close(forecast(gold).expectedFiveAScore,ggScore(gold).score);
assert.equal(forecast(gold.slice()).expectedFiveAScore,null);
// Enumerate the one remaining 5B-to-5A roll, using unscaled five-dot ranges.
const fiveB=make([4,1,1,1],[20,.4,.8,1.5],5,4);
const fiveAForecastMeans=[4.5,(.28+.56)/2,(.56+1.13)/2,(1.13+2.25)/2];
let fiveAverage=0;
for(let i=0;i<4;i++) {
  const stats=fiveB.secondaryStats.map((s,j)=>i===j?new Stat(s.type,String(s.value+fiveAForecastMeans[j]),s.rolls+1):s);
  fiveAverage+=ggScore({...fiveB,tier:5,secondaryStats:stats}).score/4;
}
close(forecast(fiveB).expectedFiveAScore,fiveAverage);
assert.ok(forecast(fiveB).expectedFiveAScore<forecast(fiveB).expectedScore);
close(forecast(gold).expectedScore,forecast(gold.slice()).expectedScore);
close(forecast(gold).potentialScore,forecast(gold.slice()).potentialScore);
const complete=make([5,5,1,1],[26,6,1,2],6,5);
close(forecast(complete).expectedScore,ggScore(complete).score);
close(forecast(complete).potentialScore,ggScore(complete).score);
assert.equal(forecast({...five,secondaryStats:five.secondaryStats.slice(1)}),null);
assert.equal(forecast({...five,tier:1}),null);
// A weaker mod now can be the better final investment.
const young=make([1,1,1,1],[5,.5,1,2],5,1); young.id='young';
const old=make([5,4,1,1],[16,3.5,1,1.5],6,4); old.id='old';
assert.ok(ggScore(young).score<ggScore(old).score);
assert.ok(forecast(young).expectedScore>forecast(old).expectedScore);
assert.equal(recommend([old,young])[0].mod.id,'young');
const byPotential=recommend([old,young,gold],{mode:'potential'});
assert.ok(byPotential.every((row,i)=>i===0||byPotential[i-1].potentialScore>=row.potentialScore));
console.log('Passed expected 6A: cap-aware probability paths, stage means, slicing equivalence, remaining rolls, completion, invalid data, and ranking reversal.');
close(nextSlice(mod).nextSliceScore,average);
close(nextSlice(mod).nextSliceImprovement,average-ggScore(mod).score);
close(nextSlice(gold).nextSliceScore,ggScore(gold.slice()).score);
close(nextSlice(gold).nextSliceImprovement,ggScore(gold.slice()).score-ggScore(gold).score);
assert.equal(recommend([mod,young])[0].mod.id,'test');
assert.equal(recommend([mod,young],{mode:'nextSlice'})[0].mod.id,'young');
// Level 9 5A has one leveling roll before the slice. Average each outcome's
// slice delta, rather than attributing the leveling roll's gain to slicing.
const needsLevel=make([4,1,1,1],[20,.4,.8,1.5],5,5,9);
let delta=0, after=0;
const fiveMeans=[4.5,(.28+.56)/2,(.56+1.13)/2,(1.13+2.25)/2];
for(let i=0;i<4;i++) {
  const leveled=make([4,1,1,1].map((n,j)=>n+(j===i?1:0)),[20,.4,.8,1.5].map((n,j)=>n+(j===i?fiveMeans[i]:0)),5,5);
  after+=ggScore(leveled.slice()).score/4;
  delta+=(ggScore(leveled.slice()).score-ggScore(leveled).score)/4;
}
close(nextSlice(needsLevel).nextSliceImprovement,delta);
close(nextSlice(needsLevel).nextSliceScore,after);
assert.equal(JSON.stringify(mod),before);
console.log('Passed next-slice mode: exact 5A slice, capped target averaging, mode ordering reversal, prerequisite leveling separation, and immutability.');
