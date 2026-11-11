import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createFrontendLoader} from './lib/loadFrontend.mjs';
const worker = vm.createContext({self:{},console,postMessage() {}});
vm.runInContext(fs.readFileSync('public/workers/optimizer.js','utf8'),worker);
vm.runInContext('self.bonuses = setBonuses;',worker);
const slots = ['square','arrow','diamond','triangle','circle','cross'];
const character = id => ({baseID:id,playerValues:{gearLevel:13},
  optimizerSettings:{highestGGMods:true,preferSixDotMods:true,minimumModDots:6,isLocked:false}});
const characters = {a:character('a'),b:character('b'),locked:character('locked')};
characters.locked.optimizerSettings.isLocked = true;
const target = {name:'Ignored',targetStats:[],setRestrictions:{speed:1},primaryStatRestrictions:{arrow:'Speed'}};
const make = (prefix,score,level=15,pips=5,characterID=null) => slots.map(slot => ({id:`${prefix}-${slot}`,
  slot,level,pips,characterID,currentGGScore:score,set:worker.self.bonuses.health,
  primaryStat:worker.deserializeStat('Health %','16%'),secondaryStats:[]}));
const mods = [...make('best',80),...make('second',60),...make('level14',99,14),
  ...make('locked',100,15,6,'locked'),...make('unknown',null)];
const order = ['a','b','locked'].map(id => ({id,target}));
const run = () => worker.optimizeMods(mods,characters,order,null,{forceCompleteSets:true,modChangeThreshold:100});
const result = run();
assert.deepEqual([...result[0].assignedMods],make('best',80).map(m=>m.id));
assert.deepEqual([...result[1].assignedMods],make('second',60).map(m=>m.id));
assert.equal(result[2],null);
const gg = worker.optimizeGGMods(mods,characters,order,{},{});
assert.deepEqual([...gg[0].assignedMods],[...result[0].assignedMods]);
assert.deepEqual([...gg[1].assignedMods],[...result[1].assignedMods]);
characters.a.playerValues.gearLevel = 11;
const lowGear = worker.highestGGAssignment([...make('six',99,15,6),...make('five',40)],characters.a,target);
assert.deepEqual([...lowGear.assignedMods],make('five',40).map(m=>m.id));
const missing = worker.highestGGAssignment([],characters.a,target);
assert.equal(missing.assignedMods.length,0);
assert.ok(missing.messages.some(message=>message.includes('Not enough')));
// Persistence and all immutable settings changes retain the option.
const {OptimizerSettings} = createFrontendLoader()('src/domain/CharacterDataClasses.js');
const settings = new OptimizerSettings(null,[],1,false,false).withHighestGGMods(true);
for (const changed of [settings.lock(),settings.unlock(),settings.withMinimumModDots(6),
  settings.withModSlicing(true),settings.withSixDotPreference(true),settings.withTargetOverrides([]),
  settings.withDeletedTarget('missing'),OptimizerSettings.deserialize(settings.serialize())]) {
  assert.equal(changed.highestGGMods,true);
}
assert.equal(OptimizerSettings.deserialize({targets:[]}).highestGGMods,false);
assert.equal(settings.withHighestGGMods(false).highestGGMods,false);
console.log('Highest GG: priority, level 15, locks, both optimizer modes, gear eligibility, shortage and persistence passed.');
