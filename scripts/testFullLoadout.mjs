import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const worker = vm.createContext({ self: {}, console, postMessage() {} });
vm.runInContext(fs.readFileSync('public/workers/optimizer.js', 'utf8'), worker);
vm.runInContext('self.bonuses = setBonuses;', worker);
const slots = ['square', 'arrow', 'diamond', 'triangle', 'circle', 'cross'];
const stats = { health: 10000, protection: 10000, speed: 100, physicalDamage: 1000,
  specialDamage: 1000, armor: 100, resistance: 100, potency: 0, tenacity: 0,
  physicalCriticalChance: 10, specialCriticalChance: 10, criticalDamage: 150, accuracy: 0, criticalAvoidance: 0 };
const character = (id, pilot = false) => ({ baseID: id,
  playerValues: { baseStats: stats, equippedStats: stats, gearLevel: 13, level: 85 },
  optimizerSettings: { minimumModDots: 1, sliceMods: false, isLocked: false, preferSixDotMods: pilot } });
const target = { name: 'Speed', speed: 1, targetStats: [], primaryStatRestrictions: {}, setRestrictions: {}, upgradeMods: false };
const mod = (id, slot, pips, speed, owner = null) => ({ id, slot, pips, level: 15, tier: 1,
  characterID: owner, set: worker.self.bonuses.health, primaryStat: worker.deserializeStat('Health %', '16%'),
  secondaryStats: [worker.deserializeStat('Speed', `+${speed}`)] });

const characters = Object.fromEntries(['a','b','donor','locked'].map(id => [id,character(id)]));
characters.a.optimizerSettings.fullLoadoutOnly = true;
characters.b.optimizerSettings.fullLoadoutOnly = true;
characters.locked.optimizerSettings.isLocked = true;
const make = (owner,speed,pips=5) => slots.map(slot => ({...mod(`${owner}-${slot}`,slot,pips,speed,owner),currentGGScore:speed}));
const mods = [...make('a',1),...make('b',2),...make('donor',20),...make('locked',99),
  ...slots.map(slot => mod(`loose-${slot}`,slot,5,100))];
const order = ['a','b'].map(id=>({id,target}));
const settings = {modChangeThreshold:0,forceCompleteSets:false};
const run = (pool=mods,config=settings) => worker.optimizeMods(pool,characters,order,null,config);
let result = run();
assert.deepEqual([...result[0].assignedMods],make('donor',20).map(m=>m.id));
assert.deepEqual([...result[1].assignedMods],make('b',2).map(m=>m.id));
assert.deepEqual([...run(mods,{...settings,lockUnselectedCharacters:true})[0].assignedMods],make('b',2).map(m=>m.id));
assert.deepEqual([...run(mods.filter(m=>m.id!=='donor-cross'))[0].assignedMods],make('b',2).map(m=>m.id));
characters.a.playerValues.gearLevel=11;
assert.deepEqual([...run([...mods.filter(m=>m.characterID!=='donor'),...make('donor',20,6)])[0].assignedMods],make('b',2).map(m=>m.id));
characters.a.playerValues.gearLevel=13;
const gg = {scores:Object.fromEntries(mods.map(m=>[m.id,m.currentGGScore])),restrictions:{}};
result=worker.optimizeGGMods(mods,characters,order,settings,gg);
assert.deepEqual([...result[0].assignedMods],make('donor',20).map(m=>m.id));
characters.a.optimizerSettings.minimumModDots=6;
characters.a.optimizerSettings.highestGGMods=true;
characters.a.optimizerSettings.preferSixDotMods=true;
characters.a.optimizerSettings.sliceMods=true;
const restrictedTarget = {...target,upgradeMods:true,useOnlyFullSets:true,
  primaryStatRestrictions:{arrow:'Speed'},setRestrictions:{speed:1},
  metaRestrictions:{primaries:{arrow:['Speed']},setCombinations:[{speed:1}]},
  targetStats:[{stat:'Speed',minimum:9999,maximum:10000,optimizeForTarget:true,relativeCharacterId:'missing'}]};
const unrestrictedPool=mods.filter(m=>m.characterID!=='locked').map(m=>
  m.characterID==='donor' ? {...m,level:12,currentGGScore:0,
    set:m.slot==='cross' ? worker.self.bonuses.speed : m.set} : m);
const restricted = worker.fullLoadoutAssignment(unrestrictedPool,characters.a,
  restrictedTarget,{...settings,forceCompleteSets:true});
assert.deepEqual([...restricted.assignedMods],make('donor',20).map(m=>m.id));
assert.equal(restricted.missedGoals.length,0);
const restrictedOrder=[{id:'a',target:restrictedTarget}];
assert.deepEqual([...worker.optimizeMods(unrestrictedPool,characters,restrictedOrder,null,
  {...settings,forceCompleteSets:true})[0].assignedMods],make('donor',20).map(m=>m.id));
assert.deepEqual([...worker.optimizeGGMods(unrestrictedPool,characters,restrictedOrder,
  {...settings,forceCompleteSets:true},{...gg,restrictions:{a:restrictedTarget.metaRestrictions}})[0].assignedMods],
  make('donor',20).map(m=>m.id));
const shortage=run(mods.filter(m=>!m.characterID))[0];
assert.equal(shortage.assignedMods.length,0);
assert.ok(shortage.messages[0].includes('No intact'));
const {createFrontendLoader}=await import('./lib/loadFrontend.mjs');
const {OptimizerSettings}=createFrontendLoader()('src/domain/CharacterDataClasses.js');
const saved=new OptimizerSettings(null,[],1,false,false).withFullLoadoutOnly(true);
for(const changed of [saved.lock(),saved.unlock(),saved.withMinimumModDots(6),saved.withModSlicing(true),
  saved.withSixDotPreference(true),saved.withHighestGGMods(true),saved.withTargetOverrides([]),
  saved.withDeletedTarget('missing'),OptimizerSettings.deserialize(saved.serialize())]) assert.equal(changed.fullLoadoutOnly,true);
assert.equal(OptimizerSettings.deserialize({targets:[]}).fullLoadoutOnly,false);
console.log('Full loadouts: whole donors, priority, locks, gear, missing slots, GG modes, shortage and persistence passed.');
