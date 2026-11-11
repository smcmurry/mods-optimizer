import assert from 'node:assert/strict';
import {createFrontendLoader} from './lib/loadFrontend.mjs';
const load = createFrontendLoader();
const {default:planInventory,scoreDistribution} = load('src/utils/modInventoryPlan.js');
const meta = load('src/constants/generatedMetaTargets.json');
const {default:setBonuses} = load('src/constants/setbonuses.js');
const slots = ['square','arrow','diamond','triangle','circle','cross'];
const primary = {square:'Offense %',arrow:'Speed',diamond:'Defense %',triangle:'Critical Damage %',circle:'Health %',cross:'Potency %'};
const character = id => ({baseID:id,playerValues:{level:1}});
const build = combination => ({targets:[{metaRestrictions:{primaries:Object.fromEntries(Object.entries(primary).map(([slot,value])=>[slot,[value]])),setCombinations:[combination,{health:3}]}}]});
const fixture = {A:build({speed:1,health:1}),B:build({speed:1,health:1})};
const mods = slots.map((slot,index)=>({id:slot,pips:5,slot,set:index<4?'speed':'health',
  primaryStat:{type:primary[slot]},secondaryStats:[]}));
// Both equipped and unequipped inventory count, including zero GG scores.
mods[0].characterID = 'A';
const plan = planInventory(mods,{A:character('A'),missing:{baseID:'missing'}},fixture);
assert.equal(plan.plannedCount,2);
assert.equal(plan.characterCount,3);
assert.ok(plan.allocations.some(row=>row.id==='B'),'Include unowned characters from full meta catalog');
assert.deepEqual([...plan.skipped],['missing']);
assert.equal(plan.rows.reduce((sum,row)=>sum+row.required,0),12);
assert.equal(plan.rows.reduce((sum,row)=>sum+row.owned,0),6);
assert.equal(plan.rows.reduce((sum,row)=>sum+row.shortage,0),6);
assert.ok(plan.rows.filter(row=>row.owned).every(row=>row.scores.length===1 && row.average===0));
assert.ok(plan.rows.some(row=>row.required>row.owned));
const extras = planInventory(Array.from({length:4},(_,index)=>({...mods[0],id:String(index)})),{},fixture);
const extraSquare = extras.rows.find(row=>row.set==='speed'&&row.shape==='square');
assert.equal(extraSquare.surplus,2);
assert.equal(extraSquare.shortage,0);
assert.ok(plan.rows.every(row=>row.surplus>=0));
for (const allocation of plan.allocations) {
  const types = allocation.types.map(key=>plan.rows.find(row=>row.key===key));
  assert.equal(new Set(types.map(row=>row.shape)).size,6);
  assert.equal(types.filter(row=>row.set==='speed').length,4);
  assert.equal(types.filter(row=>row.set==='health').length,2);
  assert.ok(types.every(row=>row.primary===primary[row.shape]));
}
const unknown = planInventory([{...mods[0],secondaryStats:[{type:'Speed',rolls:0,value:5}]}],{},fixture);
assert.equal(unknown.rows.reduce((sum,row)=>sum+row.unknown,0),1);
assert.equal(unknown.rows.reduce((sum,row)=>sum+row.scores.length,0),0);
const dist = scoreDistribution([0,9.99,10,99.99,100]);
assert.equal(dist.bins.reduce((a,b)=>a+b,0),5);
assert.equal(dist.bins[0],2);
assert.equal(dist.bins[1],1);
assert.equal(dist.bins[9],2);
assert.ok(dist.curve.every(value=>Number.isFinite(value)&&value>=0));
assert.ok(scoreDistribution([]).curve.every(value=>value===0));
const growing = {...mods[0],level:15,tier:1,secondaryStats:[
  {type:'Speed',rolls:1,value:5},{type:'Health %',rolls:1,value:1},
  {type:'Potency %',rolls:1,value:2},{type:'Protection %',rolls:1,value:2}]};
const current = planInventory([growing,mods[1]],{},fixture);
const forecast = planInventory([growing,mods[1]],{},fixture,true);
const currentSquare = current.rows.find(row=>row.set==='speed'&&row.shape==='square');
const forecastSquare = forecast.rows.find(row=>row.set==='speed'&&row.shape==='square');
assert.ok(forecastSquare.average > currentSquare.average,'Use future roll expectations in 6A mode');
assert.deepEqual(forecast.rows.map(row=>row.required),current.rows.map(row=>row.required),'Changing score basis preserves requirements');
assert.deepEqual(forecast.rows.map(row=>row.owned),current.rows.map(row=>row.owned),'Unsupported forecasts still count as owned');
assert.equal(forecast.rows.reduce((sum,row)=>sum+row.scores.length,0),1);
assert.equal(forecast.rows.reduce((sum,row)=>sum+row.unknown,0),1);
// Check every supported character: all six slots and exact top-set piece counts.
const all = planInventory([],{});
assert.equal(all.rows.reduce((sum,row)=>sum+row.required,0),all.plannedCount*6);
assert.ok(all.plannedCount>200);
for (const allocation of all.allocations) {
  const actual = {};
  allocation.types.forEach(key=>{const set=key.split('|')[0]; actual[set]=(actual[set]||0)+1;});
  const desired = meta.characters[allocation.id].targets[0].metaRestrictions.setCombinations[0];
  assert.deepEqual(actual,Object.fromEntries(Object.entries(desired).map(([set,count])=>[set,count*setBonuses[set].numberOfModsRequired])));
}
console.log(`Inventory plan passed: ownership, no double counting, top sets/primaries, missing data, score boundaries, empty curves; ${all.plannedCount} complete character builds verified.`);
