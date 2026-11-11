import assert from 'node:assert/strict';
import {createFrontendLoader} from './lib/loadFrontend.mjs';
const load=createFrontendLoader();
const {default:recommend,materialCosts}=load('src/utils/materialSliceRecommendations.js');
const Mod=load('src/domain/Mod.js').default;
const Stat=load('src/domain/Stat.js').default;
const {ggScore}=load('src/utils/ggScore.js');
const make=(pips,tier)=> {
  const total=pips===5?tier+3:tier+7;
  const counts=[1,1,1,1];
  let left=total-4;
  for(let i=0;i<4;i++){const add=Math.min(4,left);counts[i]+=add;left-=add;}
  const types=['Speed','Offense %','Health %','Protection %'];
  const means=pips===5?[4.5,.42,.845,1.69]:[4.5,1.275,1.5,2.25];
  return new Mod(`${pips}-${tier}`,'triangle',{name:'speed'},15,pips,new Stat('Critical Damage %','36'),
    types.map((type,i)=>new Stat(type,String(means[i]*counts[i]+(pips===6&&i===0?1:0)),counts[i])),null,tier);
};
const mods=[1,2,3,4,5].flatMap(tier=>[make(5,tier),make(6,tier)]);
assert.deepEqual([1,2,3,4].map(tier=>materialCosts(make(5,tier)).remaining),[1150,1050,850,500]);
assert.deepEqual([1,2,3,4].map(tier=>materialCosts(make(5,tier)).next),[100,200,350,500]);
assert.deepEqual(materialCosts(make(5,5)),{material:'Mk 2',next:110,remaining:175,endpoint:'6A'});
assert.deepEqual([1,2,3,4].map(tier=>materialCosts(make(6,tier)).next),[0,10,20,35]);
assert.deepEqual([1,2,3,4].map(tier=>materialCosts(make(6,tier)).remaining),[65,65,55,35]);
const before=JSON.stringify(mods);
const mk1=recommend(mods,'Mk 1');
const mk2=recommend(mods,'Mk 2');
assert.equal(mk1.length,4);
assert.equal(mk2.length,5);
assert.ok(mk1.every(row=>row.mod.pips===5&&row.mod.tier<5&&row.endpoint==='6A'));
for(const row of mk1) {
  assert.equal(row.endpointScore,row.expectedScore);
  assert.ok(row.endpointScore>row.expectedFiveAScore);
  assert.equal(row.cost,materialCosts(row.mod).remaining,'Only remaining Mk 1 is charged');
  assert.equal(row.gainPerMaterial,row.expectedGain/row.cost);
}
assert.ok(mk2.some(row=>row.mod.pips===5&&row.mod.tier===5));
assert.ok(mk2.every(row=>row.endpoint==='6A'));
for(const rows of [mk1,mk2]) {
  rows.forEach(row=>assert.ok(Math.abs(row.expectedGain-(row.endpointScore-row.score))<.8,'Stage gain agrees with exact endpoint mean when current score is the replacement baseline'));
  for(let i=1;i<rows.length;i++) assert.ok(rows[i-1].gainPerMaterial>=rows[i].gainPerMaterial);
}
const next=recommend(mods,'Mk 2','next');
assert.equal(next[0].mod.id,'6-1');
assert.equal(next[0].cost,0);
assert.equal(next[0].freeGain,true);
assert.equal(next[0].gainPerMaterial,null);
const promotion=next.find(row=>row.mod.id==='5-5');
assert.ok(Math.abs(promotion.expectedGain-promotion.nextSliceImprovement)<1e-8,'Promotion is deterministic and does not add a random roll');
const nextFive=recommend(mods,'Mk 1','next');
for(const row of nextFive) assert.ok(Math.abs(row.expectedGain-row.nextSliceImprovement)<.4);
const done=make(6,5);
done.secondaryStats=[new Stat('Speed','31',5),new Stat('Offense %','8.5',5),new Stat('Health %','2',1),new Stat('Protection %','3',1)];
assert.equal(ggScore(done).score,100);
const blocked=recommend(Array.from({length:300},(_,i)=>({...done,id:`top-${i}`})).concat(mods),'Mk 2','next');
assert.ok(blocked.every(row=>row.expectedGain===0&&!row.freeGain),'Free but unable to improve top 300 gets no gain bonus');
assert.equal(recommend([{...make(5,1),level:12}],'Mk 1').length,0);
for (const [tier,material] of [[2,'Mk 1'],[5,'Mk 2']]) {
  const leveling=make(5,tier);
  leveling.level=9;
  leveling.secondaryStats[0].rolls--;
  leveling.secondaryStats[0].value-=4.5;
  assert.equal(recommend([leveling],material).length,0);
  for(const scope of ['stage','next']) {
    const included=recommend([leveling],material,scope,true);
    assert.equal(included.length,1);
    const row=included[0];
    assert.equal(row.needsLeveling,true);
    assert.ok(Math.abs(row.expectedGain-(row.endpointScore-row.score))<.8,'Include leveling rolls in both the cost-scope forecast and gain');
    assert.equal(row.cost,scope==='next'?materialCosts(leveling).next:materialCosts(leveling).remaining);
  }
}
assert.equal(JSON.stringify(mods),before);
assert.deepEqual(recommend([]),[]);
console.log('Passed material costs, stage membership, endpoint gains, next slices, free upgrades, top-300 cutoff, and immutable inventory.');
