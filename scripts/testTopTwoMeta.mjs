import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const worker = vm.createContext({ self: {}, postMessage() {} });
vm.runInContext(fs.readFileSync('public/workers/optimizer.js', 'utf8'), worker);
vm.runInContext('self.bonuses = setBonuses;', worker);
const stats = {health:30000,protection:40000,speed:150,physDmg:4000,specDmg:3000,physCritChance:30,specCritChance:20,critDmg:150,armor:300,resistance:200,potency:40,tenacity:40,accuracy:0,critAvoid:0};
const character = {baseID:'TEST',playerValues:{baseStats:stats,equippedStats:stats,level:85,gearLevel:13},optimizerSettings:{sliceMods:false,minimumModDots:5,isLocked:false}};
const slots=['square','arrow','diamond','triangle','circle','cross'];
const makeMods=(prefix,set,speed,primary='Health %')=>slots.map((slot,i)=>({id:prefix+i,slot,set:worker.self.bonuses[set],level:15,pips:5,tier:1,primaryStat:worker.deserializeStat(primary,'5%'),secondaryStats:[worker.deserializeStat('Speed','+'+speed)],characterID:null}));
const limits={primaries:Object.fromEntries(slots.map(slot=>[slot,['Health %','Protection %']])),setCombinations:[{health:3},{defense:3}]};
const target=worker.deserializeTarget({name:'Kyber Meta',speed:100,health:1,upgradeMods:false,primaryStatRestrictions:{},setRestrictions:{},targetStats:[],useOnlyFullSets:true,metaRestrictions:limits});
const mods=[...makeMods('health','health',5),...makeMods('defense','defense',10,'Protection %'),...makeMods('third-set','tenacity',100),...makeMods('third-primary','health',200,'Offense %')];
const best=worker.findBestModSetForCharacter(mods,character,target);
assert.equal(best.modSet.length,6);
assert.ok(best.modSet.every(mod=>mod.id.startsWith('defense')),'Choose higher-scoring second combination and second primary');
const relaxed = worker.findBestModSetForCharacter(makeMods('invalid','tenacity',100),character,target);
assert.equal(relaxed.modSet.length,6);
assert.equal(relaxed.effectiveTarget.metaRestrictions,null);
assert.match(relaxed.messages[0],/restrictions were dropped/);
assert.equal(worker.findBestModSetForCharacter(makeMods('invalid','health',100,'Offense %'),character,target).modSet.length,6);
assert.ok(worker.findBestModSetForCharacter(mods.filter(mod=>mod.slot!=='arrow'),character,target).restrictionMessages.length);
const old=makeMods('equipped','tenacity',500).map(mod=>({...mod,characterID:'TEST'}));
const assignments=worker.optimizeMods([...mods,...old],{TEST:character},[{id:'TEST',target}],null,{modChangeThreshold:1000,lockUnselectedCharacters:false,forceCompleteSets:false});
assert.ok(assignments[0].assignedMods.every(id=>id.startsWith('defense')),'An ineligible high-scoring equipped build must not bypass restrictions');
const raw=JSON.parse(fs.readFileSync('src/constants/metaProfiles.json'));
const generated=JSON.parse(fs.readFileSync('src/constants/generatedMetaTargets.json'));
const definitions={1:['health',2],2:['offense',4],3:['defense',2],4:['speed',4],5:['critchance',2],6:['critdamage',4],7:['potency',2],8:['tenacity',2]};
for(const [id,c] of Object.entries(generated.characters)) {
 const source=raw.characters[id];
 const expected=Object.values(source.loadouts).filter(l=>l.count>0&&l.setIds.reduce((n,id)=>n+definitions[id][1],0)===6).sort((a,b)=>b.count-a.count||String(a.id).localeCompare(String(b.id))).slice(0,2).map(l=>l.setIds.reduce((o,id)=>{const key=definitions[id][0];o[key]=(o[key]||0)+1;return o;},{}));
 assert.deepEqual(c.targets[0].metaRestrictions.setCombinations,expected,id);
 for(const t of c.targets) for(const choices of Object.values(t.metaRestrictions.primaries)) assert.ok(choices.length>=1&&choices.length<=2);
}
console.log('Passed: 333 character restrictions, real worker search, second choices, unavailable builds, and equipped-build enforcement.');
const primaryNames={5:'Speed',16:'Critical Damage %',17:'Potency %',18:'Tenacity %',48:'Offense %',49:'Defense %',52:'Accuracy %',53:'Critical Chance %',54:'Critical Avoidance %',55:'Health %',56:'Protection %'};
for(const [id,c] of Object.entries(generated.characters)) for(const [slot,data] of Object.entries(raw.characters[id].aggregate.primaries)) {
 const expected=Object.values(data.stats).filter(s=>primaryNames[s.statId]&&s.frequency>0).sort((a,b)=>b.frequency-a.frequency||a.statId-b.statId).slice(0,2).map(s=>primaryNames[s.statId]);
 if(expected.length) assert.deepEqual(c.targets[0].metaRestrictions.primaries[slot],expected,id+' '+slot);
}
const {createFrontendLoader}=await import('./lib/loadFrontend.mjs');
const load=createFrontendLoader();
const Plan=load('src/domain/OptimizationPlan.js').default;
const settings=load('src/constants/characterSettings.js').default;
const refresh=load('src/utils/refreshLegacyMetaTargets.js').default;
const ids=Object.keys(generated.characters).slice(0,3).reverse();
const custom=new Plan('Custom',0,0,100);
const profile={selectedCharacters:[{id:ids[0],target:new Plan('Combat Utility')},{id:ids[1],target:new Plan('Kyber Meta')},{id:ids[2],target:custom}],withSelectedCharacters(selectedCharacters){return {...this,selectedCharacters};}};
const updated=refresh(profile);
assert.deepEqual(updated.selectedCharacters.map(s=>s.id),ids,'Saved character order is preserved');
assert.equal(updated.selectedCharacters[2].target,custom,'Custom targets survive migration');
for(const entry of updated.selectedCharacters.slice(0,2)) {
 assert.equal(entry.target,settings[entry.id].targets[0]);
 assert.ok(entry.target.metaRestrictions);
 const saved=Plan.deserialize(entry.target.serialize());
 assert.ok(saved.equals(entry.target));
 assert.deepEqual(saved.rename('Copy').metaRestrictions,entry.target.metaRestrictions);
 assert.deepEqual(saved.withUpgradeMods(false).metaRestrictions,entry.target.metaRestrictions);
}
console.log('Passed: exact primary rankings, saved character order, target migration, and plan serialization.');
for(const [id,c] of Object.entries(settings)) {
 const first=c.targets[0];
 if(!first.metaRestrictions) continue;
 assert.ok(first.name.startsWith('Original weights ('), id+' restored legacy default');
 const original=c.targets.slice(1).find(plan => first.name === 'Original weights (' + plan.name + ')');
 assert.ok(original, id+' default must use an existing preset');
 for(const key of Object.keys(original).filter(key=>key.startsWith('raw'))) assert.equal(first[key],original[key],id+' '+key);
 assert.deepEqual(first.metaRestrictions,generated.characters[id].targets[0].metaRestrictions);
}
assert.equal(settings.AAYLASECURA.targets[0].rawPotency,75);
assert.equal(settings.CHEWBACCALEGENDARY.targets[0].name,'Original weights (Tenacity)');
assert.equal(settings.CHEWBACCALEGENDARY.targets[0].rawTenacity,80);
assert.equal(settings.WAMPA.targets[0].name,'Original weights (Omicron/Tenacity)');
assert.equal(settings.WAMPA.targets[0].rawHealth,30);
assert.equal(settings.WAMPA.targets[0].rawTenacity,100);
// Revised role presets refresh saved managed defaults, without replacing custom plans.
const roleDefaults = {
 selectedCharacters: ['R2D2_LEGENDARY','CAPTAINREX','BOBAFETT','MACEWINDU','KUIIL','DEATHTROOPERPERIDEA'].map(id => ({id,target:new Plan('Original weights (PvP)')})),
 withSelectedCharacters(selectedCharacters) { return {...this,selectedCharacters}; }
};
const refreshedRoles = refresh(roleDefaults);
assert.deepEqual(refreshedRoles.selectedCharacters.map(row => row.target.name),
 ['Original weights (Number Crunch)','Original weights (Speed and survival)','Original weights (PvP)',
  'Original weights (Durable control)','Original weights (Shared stats)','Original weights (Physical damage)']);
for (const {id,target} of refreshedRoles.selectedCharacters) {
 assert.equal(target,settings[id].targets[0]);
 assert.ok(settings[id].targets.some(plan => plan.name === 'PvP'),'Legacy preset remains selectable');
 assert.ok(Plan.deserialize(target.serialize()).equals(target));
}
const customRole = refresh({...roleDefaults,selectedCharacters:[{id:'R2D2_LEGENDARY',target:custom}]});
assert.equal(customRole.selectedCharacters[0].target,custom);
const oldDefaults={selectedCharacters:['CHEWBACCALEGENDARY','WAMPA'].map(id=>({id,target:new Plan('Original weights (PvP)')})),
  withSelectedCharacters(selectedCharacters){return {...this,selectedCharacters};}};
const refreshedDefaults=refresh(oldDefaults);
const revertedDefaults=refresh({...oldDefaults,selectedCharacters:[
 {id:'MERRIN',target:new Plan('Set-aligned weights (PvP)')},
 {id:'FINN',target:new Plan('Original weights (Tanky)')},
 {id:'JAWA',target:custom}
]});
assert.equal(revertedDefaults.selectedCharacters[0].target,settings.MERRIN.targets[0]);
assert.equal(revertedDefaults.selectedCharacters[0].target.name,'Original weights (PvP)');
assert.equal(revertedDefaults.selectedCharacters[1].target.name,'Original weights (PvP)');
assert.equal(revertedDefaults.selectedCharacters[2].target,custom);
assert.deepEqual(refreshedDefaults.selectedCharacters.map(row=>row.target.name),['Original weights (Tenacity)','Original weights (Omicron/Tenacity)']);
assert.equal(settings.AAYLASECURA.targets[0].rawCritChance,100);
const Character=load('src/domain/Character.js').default;
const aayla=new Character('AAYLASECURA');
assert.equal(aayla.defaultTarget(),settings.AAYLASECURA.targets[0]);
assert.equal(aayla.defaultTarget().rawPotency,75);
console.log('Passed: original preset weights for every generated default and original-weight default selection.');


const fallbackAssignments=worker.optimizeMods(old,{TEST:character},[{id:'TEST',target}],null,{modChangeThreshold:1000,lockUnselectedCharacters:false,forceCompleteSets:false});
assert.equal(fallbackAssignments[0].assignedMods.length,6);
assert.ok(fallbackAssignments[0].messages.some(message=>message.includes('restrictions were dropped')));
assert.ok(!fallbackAssignments[0].messages.some(message=>message.includes('Could not find a new mod set')));
assert.equal(target.metaRestrictions,limits,'Fallback must not permanently remove the saved requirements');
console.log('Passed: fallback completes and preserves the warning when equipped mods are retained.');
const topBuild = makeMods('top-', 'health', 10);
const tenFaster = makeMods('ten-', 'defense', 10, 'Protection %');
tenFaster[0].secondaryStats = [worker.deserializeStat('Speed', '+20')];
const topAtBoundary = worker.findBestModSetForCharacter([...topBuild, ...tenFaster], character, target);
assert.ok(topAtBoundary.modSet.every(mod => mod.id.startsWith('top-')), 'Prefer top choices at exactly 10 total Speed lost');
const elevenFaster = makeMods('eleven-', 'defense', 10, 'Protection %');
elevenFaster[0].secondaryStats = [worker.deserializeStat('Speed', '+21')];
const alternative = worker.findBestModSetForCharacter([...topBuild, ...elevenFaster], character, target);
assert.ok(alternative.modSet.every(mod => mod.id.startsWith('eleven-')), 'Use the alternative above the 10 Speed limit');
const equippedSecond = tenFaster.map(mod => ({ ...mod, characterID: 'TEST' }));
const changed = worker.optimizeMods([...topBuild, ...equippedSecond], {TEST:character}, [{id:'TEST',target}], null,
  {modChangeThreshold:1000,lockUnselectedCharacters:false,forceCompleteSets:false});
assert.ok(changed[0].assignedMods.every(id => id.startsWith('top-')), 'Equipped score and change threshold cannot override popularity policy');
const oldRun = {characters:{TEST:character},selectedCharacters:[{id:'TEST',target}],mods:[...topBuild,...equippedSecond],
  globalSettings:{modChangeThreshold:1000,lockUnselectedCharacters:false,forceCompleteSets:false},
  modAssignments:[{id:'TEST',target,assignedMods:equippedSecond.map(mod=>mod.id),messages:[],missedGoals:[]}]};
const migrated = worker.optimizeMods([...topBuild,...equippedSecond],{TEST:character},[{id:'TEST',target}],null,oldRun.globalSettings,oldRun);
assert.ok(migrated[0].assignedMods.every(id=>id.startsWith('top-')), 'Older saved recommendations must be recalculated');
const speedLimits={primaries:limits.primaries,setCombinations:[{health:3},{speed:1,health:1}]};
const speedPlan={...target,metaRestrictions:speedLimits};
const bonusBuild=makeMods('bonus-','speed',10).map((mod,index)=>({...mod,set:worker.self.bonuses[index<4?'speed':'health']}));
const withBonus=worker.findBestModSetForCharacter([...topBuild,...bonusBuild],character,speedPlan);
assert.ok(withBonus.modSet.filter(mod=>mod.set.name==='speed').length===4, 'Include the 15 Speed set bonus in the threshold');
console.log('Passed: top-rank preference at 10 Speed, alternative at 11, set bonuses, equipped override, and cached-run migration.');

const secondArrow={...topBuild[1],id:'second-arrow',primaryStat:worker.deserializeStat('Protection %','5%'),
  secondaryStats:[worker.deserializeStat('Speed','+15')]};
const arrowResult=worker.findBestModSetForCharacter([...topBuild,secondArrow],character,target);
assert.equal(arrowResult.modSet.find(mod=>mod.slot==='arrow').id,'second-arrow',
  'Arrow can use the second primary even when its Speed advantage is below ten');
const secondTriangle={...secondArrow,id:'second-triangle',slot:'triangle'};
const triangleResult=worker.findBestModSetForCharacter([...topBuild,secondTriangle],character,target);
assert.equal(triangleResult.modSet.find(mod=>mod.slot==='triangle').id,topBuild[3].id,
  'Non-arrow primaries still prefer rank one within ten Speed');
const versionOne={...oldRun,mods:[...topBuild,secondArrow],
 modAssignments:[{id:'TEST',target,assignedMods:topBuild.map(mod=>mod.id),messages:[],missedGoals:[],metaPreferenceVersion:1}]};
const refreshedArrow=worker.optimizeMods([...topBuild,secondArrow],{TEST:character},[{id:'TEST',target}],null,oldRun.globalSettings,versionOne);
assert.ok(refreshedArrow[0].assignedMods.includes('second-arrow'),'Recalculate recommendations saved before the arrow exemption');
console.log('Passed: arrow-only primary exemption and saved-run migration.');
// Value must never be sacrificed merely to stay near the fastest loadout.
const valueTarget={...target,health:1,speed:0.01};
const fastLowValue=makeMods('fast-low-value-','defense',40,'Protection %');
const valueFirst=worker.findBestModSetForCharacter([...topBuild,...fastLowValue],character,valueTarget);
assert.ok(valueFirst.modSet.every(mod=>mod.id.startsWith('top-')),
  'A much faster alternative cannot displace a higher-value top build');
const fastSameChoices=makeMods('fast-same-choices-','health',40).map(mod=>({...mod,
 primaryStat:worker.deserializeStat('Health %','1%')}));
const preserveTopValue=worker.findBestModSetForCharacter([...topBuild,...fastSameChoices],character,valueTarget);
assert.ok(preserveTopValue.modSet.every(mod=>mod.id.startsWith('top-')),
  'Do not replace valuable mods inside the preferred build to satisfy a Speed floor');
const equalValueTarget={...target,health:0,speed:0};
const equalValue=worker.findBestModSetForCharacter([...topBuild,...fastLowValue],character,equalValueTarget);
assert.ok(equalValue.modSet.every(mod=>mod.id.startsWith('top-')),
  'Equal value does not justify a less-common build even with a large Speed gain');
const staleSpeedRun={...oldRun,mods:[...topBuild,...fastLowValue],selectedCharacters:[{id:'TEST',target:valueTarget}],
 modAssignments:[{id:'TEST',target:valueTarget,assignedMods:fastLowValue.map(mod=>mod.id),messages:[],missedGoals:[],metaPreferenceVersion:2}]};
const valueRefresh=worker.optimizeMods([...topBuild,...fastLowValue],{TEST:character},[{id:'TEST',target:valueTarget}],null,oldRun.globalSettings,staleSpeedRun);
assert.ok(valueRefresh[0].assignedMods.every(id=>id.startsWith('top-')),
  'Recalculate results saved under the former Speed-floor policy');
console.log('Passed: higher-value preferred builds, value within preferred choices, equal-value ties, and Speed-policy migration.');
