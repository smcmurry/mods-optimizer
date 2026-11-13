import assert from 'node:assert/strict';
import {createFrontendLoader} from './lib/loadFrontend.mjs';
const load=createFrontendLoader();
const {default:recommend,scoutingImprovement,nextExpectationOutcomes,scoutingForecast}=load('src/utils/scoutingPriority.js');
const basic=load('src/utils/recommendedSlices.js').default;
const Mod=load('src/domain/Mod.js').default;
const Stat=load('src/domain/Stat.js').default;
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const points=values=>values.map(value=>({low:value,high:value,probability:1/values.length}));
const e=scoutingImprovement(points([52,53,54,64]),56);
const d=scoutingImprovement(points([54,55,57,58]),56);
close(e.scoutingGain,2);close(d.scoutingGain,.75);
close(e.scoutingChance,.25);assert.ok(e.scoutingGain/100>d.scoutingGain/200);
const uniform=scoutingImprovement([{low:50,high:70,probability:1}],60);
close(uniform.scoutingGain,2.5);close(uniform.scoutingChance,.5);
assert.equal(scoutingImprovement(points([56,56]),56).scoutingGain,0);
const make=(id,pips=5,tier=1)=> {
  const total=pips===5?tier+3:tier+7;
  const counts=[1,1,1,1];let left=total-4;
  for(let i=0;i<4;i++){const n=Math.min(4,left);counts[i]+=n;left-=n;}
  const means=pips===5?[4.5,.42,.845,1.69]:[4.5,1.275,1.5,2.25];
  return new Mod(id,'triangle',{name:'speed'},15,pips,new Stat('Critical Damage %','36'),
    ['Speed','Offense %','Health %','Protection %'].map((type,i)=>new Stat(type,String(means[i]*counts[i]+(pips===6&&i===0?1:0)),counts[i])),null,tier);
};
const mods=[make('e'),make('d',5,2),make('promotion',5,5),make('free',6,1)];
const before=JSON.stringify(mods);
for(const mod of mods) {
  const row=basic([mod])[0],outcomes=nextExpectationOutcomes(mod);
  close(outcomes.reduce((sum,outcome)=>sum+outcome.probability,0),1);
  close(outcomes.reduce((sum,outcome)=>sum+(outcome.low+outcome.high)/2*outcome.probability,0),row.expectedScore);
}
const mk1=recommend(mods,'Mk 1'),mk2=recommend(mods,'Mk 2');
assert.equal(mk1.length,2);assert.equal(mk2.length,2);
assert.ok(mk1.every(row=>['e','d'].includes(row.mod.id)));
close(mk1[0].scoutingBenchmark,Math.max(...basic(mods).filter(row=>['e','d'].includes(row.mod.id)).map(row=>row.expectedScore)));
const promoted={...mods[2],pips:6,tier:1,secondaryStats:mods[2].secondaryStats.map(stat=>({...stat,
  value:stat.type==='Speed'?stat.value+1:stat.value*Stat.secondaryUpgradeFactors[stat.type]}))};
assert.deepEqual(nextExpectationOutcomes(mods[2]),nextExpectationOutcomes(promoted));
const promotion=recommend([mods[2]],'Mk 2')[0];
assert.ok(promotion.scoutingGain>0,'5A scouting includes the free roll through 6D');
close(promotion.scoutingEfficiency,promotion.scoutingGain/110);
assert.equal(promotion.scoutingFree,false);
assert.equal(promotion.nextSlice,'5A → 6D');
assert.equal(mk2.find(row=>row.mod.id==='promotion').scoutingCost,110);
const free=recommend([mods[3]],'Mk 2')[0];
assert.equal(free.scoutingCost,0);assert.ok(free.scoutingFree);
const capped=make('capped',6,4);
assert.equal(nextExpectationOutcomes(capped).length,3,'Capped Speed is excluded; three non-Speed targets remain');
const alone=recommend([mods[0]],'Mk 1')[0];
assert.ok(alone.scoutingGain>0,'Current leader gets credit for its own upside');
assert.equal(scoutingForecast(basic([mods[0]])[0],100).scoutingGain,0);
const leveling=make('level',5,2);leveling.level=9;leveling.secondaryStats[0].rolls--;leveling.secondaryStats[0].value-=4.5;
assert.equal(recommend([leveling],'Mk 1').length,0);
assert.equal(recommend([leveling],'Mk 1',true).length,1);
close(nextExpectationOutcomes(leveling).reduce((sum,outcome)=>sum+outcome.probability,0),1);
assert.equal(JSON.stringify(mods),before);
assert.deepEqual(recommend([]),[]);
console.log('Passed user scouting example, continuous integration, group separation, leader upside, promotion, free rolls, caps, leveling, and immutable data.');
