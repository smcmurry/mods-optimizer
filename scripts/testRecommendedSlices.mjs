import assert from 'node:assert/strict';
import {createFrontendLoader} from './lib/loadFrontend.mjs';
const load=createFrontendLoader();
const recommend=load('src/utils/recommendedSlices.js').default;
const Mod=load('src/domain/Mod.js').default;
const Stat=load('src/domain/Stat.js').default;
const make=(id,speed,pips=5,tier=5,level=15)=> {
  const total=pips===6?7+tier:tier+3;
  const counts=[Math.min(4,total-3),1,1,1];
  let extra=total-counts.reduce((a,b)=>a+b,0);
  for(let i=1;i<4;i++){const add=Math.min(4,extra);counts[i]+=add;extra-=add;}
  return new Mod(id,'triangle',{name:'speed'},level,pips,new Stat('Critical Damage %','36'),
    [new Stat('Speed',String(speed),counts[0]),new Stat('Offense %',String(.4*counts[1]),counts[1]),
      new Stat('Health %',String(.8*counts[2]),counts[2]),new Stat('Protection %',String(1.5*counts[3]),counts[3])],null,tier);
};
const low=make('low',12), high=make('high',24), done=make('done',25,6,5);
const input=[low,done,high];
const rows=recommend(input);
assert.deepEqual(rows.map(r=>r.mod.id),['high','low']);
assert.equal(rows[0].nextSlice,'5A → 6E');
assert.deepEqual(input,[low,done,high],'Do not mutate inventory');
for(let tier=1;tier<=5;tier++) {
  assert.equal(recommend([make('five',12,5,tier)]).length,1);
  assert.equal(recommend([make('six',12,6,tier)]).length,tier===5?0:1);
}
assert.equal(recommend([make('six',12,6,1)])[0].nextSlice,'6E → 6D');
assert.equal(recommend([make('four',12,4)]).length,0);
const leveling=make('leveling',24,5,2,12);
assert.equal(recommend([leveling]).length,0);
assert.equal(recommend([leveling],{includeLeveling:true})[0].needsLeveling,true);
assert.equal(recommend([low,make('six',12,6,1)],{dots:'6'}).length,1);
assert.equal(recommend([low,make('six',12,6,1)],{dots:'5'})[0].mod.id,'low');
assert.deepEqual(recommend([make('b',12),make('a',12)]).map(r=>r.mod.id),['a','b']);
assert.equal(recommend([make('bad',NaN)]).length,0);
assert.equal(recommend([make('badTier',12,5,0)]).length,0);
const penalty=make('penalty',24); penalty.primaryStat=new Stat('Defense %','20');
assert.ok(recommend([penalty,high])[0].mod.id==='high','Use score after primary fit');
assert.deepEqual(recommend([]),[]);
console.log('Passed slice recommendations: rank, fit, all tiers, eligibility, leveling, dots, invalid scores, ties, and immutable input.');
