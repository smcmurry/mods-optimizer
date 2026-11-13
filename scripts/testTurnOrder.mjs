import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const worker = vm.createContext({self: {}, console, postMessage() {}});
vm.runInContext(fs.readFileSync('public/workers/optimizer.js', 'utf8'), worker);
vm.runInContext('self.bonuses = setBonuses;', worker);
const slots = ['square', 'arrow', 'diamond', 'triangle', 'circle', 'cross'];
const stats = {health:10000, protection:10000, speed:100, physicalDamage:1000,
  specialDamage:1000, armor:100, resistance:100, potency:0, tenacity:0,
  physicalCriticalChance:10, specialCriticalChance:10, criticalDamage:150, accuracy:0, criticalAvoidance:0};
const character = id => ({baseID:id, playerValues:{baseStats:stats,equippedStats:stats,gearLevel:13,level:85},
  optimizerSettings:{minimumModDots:1,sliceMods:false,isLocked:false}});
const target = {name:'Speed',speed:1,targetStats:[],primaryStatRestrictions:{},setRestrictions:{},upgradeMods:false};
const characters = {first:character('first'),second:character('second')};
const order = Object.keys(characters).map(id=>({id,target}));
const mods = [20,10].flatMap((speed,i)=>slots.map(slot=>({id:`${i}-${slot}`,slot,pips:6,level:15,tier:1,
  characterID:null,set:worker.self.bonuses.health,primaryStat:worker.deserializeStat('Health %','16%'),
  secondaryStats:[worker.deserializeStat('Speed',`+${speed}`)]})));
const settings = {forceTurnOrder:true,modChangeThreshold:0};
const before = JSON.stringify({characters,order});
const result = worker.optimizeMods(mods,characters,order,null,settings);
assert.equal(result.length,2);
assert.equal(new Set(result.flatMap(row=>row.assignedMods)).size,12);
assert.equal(JSON.stringify({characters,order}),before,'Do not persist generated restrictions or alter shortcuts');
assert.equal(result[1].target.targetStats.length,0);
const gg = {scores:Object.fromEntries(mods.map(m=>[m.id,50])),restrictions:{}};
assert.equal(worker.optimizeGGMods(mods,characters,order,settings,gg).length,2);
const tied = mods.map(mod=>({...mod,secondaryStats:[worker.deserializeStat('Speed','+10')]}));
assert.throws(()=>worker.optimizeMods(tied,characters,order,null,settings),/Could not enforce turn order/);
assert.throws(()=>worker.optimizeGGMods(tied,characters,order,settings,gg),/Could not enforce turn order/);
const locked = Object.fromEntries(Object.entries(characters).map(([id,char])=>[id,{...char,optimizerSettings:{...char.optimizerSettings,isLocked:true}}]));
const equipped = tied.map((mod,i)=>({...mod,characterID:i<6?'first':'second'}));
assert.throws(()=>worker.optimizeMods(equipped,locked,order,null,settings),/Could not enforce turn order/);
assert.throws(()=>worker.optimizeMods(mods,characters,[order[0],order[0]],null,settings),/only once/);
assert.equal(worker.optimizeMods(tied,characters,order,null,{...settings,forceTurnOrder:false}).length,2);
console.log('Passed forced turn order: standard/GG search, ties rejected, locked mods, duplicates, unchanged targets, and disabled setting.');
