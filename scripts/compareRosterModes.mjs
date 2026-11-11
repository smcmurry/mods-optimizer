import fs from 'node:fs';
import vm from 'node:vm';
import {createFrontendLoader} from './lib/loadFrontend.mjs';
const snapshot = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const raw = snapshot.profiles.find(p => String(p.allyCode) === '414556856');
if (!raw) throw new Error('Requested roster missing');
const load=createFrontendLoader();
const Profile=load('src/domain/PlayerProfile.js').default;
const refresh=load('src/utils/refreshLegacyMetaTargets.js').default;
const {ggScore,characterGGScore}=load('src/utils/ggScore.js');
const groupRolls=load('src/utils/characterSecondaryRolls.js').default;
const profile=refresh(Profile.deserialize(raw));
const meta=JSON.parse(fs.readFileSync('src/constants/generatedMetaTargets.json'));
const prefs=JSON.parse(fs.readFileSync('src/constants/generatedCharacterSecondaryPreferences.json')).characters;
const gg={scores:Object.fromEntries(profile.mods.map(m=>[m.id,ggScore(m).score])),
 rolls:Object.fromEntries(profile.mods.map(m=>[m.id,groupRolls(m)])),preferences:prefs,
 restrictions:Object.fromEntries(profile.selectedCharacters.map(({id})=>[id,meta.characters[id]?.targets[0].metaRestrictions]))};
const output={allyCode:raw.allyCode,mods:profile.mods.length,selected:profile.selectedCharacters.length,
 globalSettings:profile.globalSettings,order:profile.selectedCharacters.map(r=>r.id),modes:{}};
for (const mode of ['weights','gg','character']) {
 const worker=vm.createContext({self:{},postMessage(){}});
 vm.runInContext(fs.readFileSync('public/workers/optimizer.js','utf8'),worker);
 const mods=profile.mods.map(m=>worker.deserializeMod(m.serialize()));
 const chars=Object.fromEntries(Object.entries(profile.characters).map(([id,c])=>[id,c.serialize()]));
 const targets=profile.selectedCharacters.map(({id,target})=>({id,target:worker.deserializeTarget(target.serialize())}));
 console.log('Starting '+mode);
 const start=Date.now();
 const results=mode==='weights'?worker.optimizeMods(mods,chars,targets,null,profile.globalSettings):
   worker.optimizeGGMods(mods,chars,targets,profile.globalSettings,{...gg,characterWeighted:mode==='character'});
 const rows=targets.map(({id,target},index)=>{
   const result=results[index];
   const selected=result?mods.filter(m=>result.assignedMods.includes(m.id)):mods.filter(m=>m.characterID===id);
   const original=mods.filter(m=>m.characterID===id);
   const summarize=chosen=>{
     worker.clearCache();
     chosen.forEach(m=>worker.getFlatStatsFromMod(m,chars[id],target));
     const stats=Object.fromEntries(['Speed','Health','Protection','Physical Damage','Special Damage','Potency','Tenacity','Critical Damage'].map(stat=>[stat,worker.getStatValueForCharacterWithMods(chosen,chars[id],stat,target)]));
     return {gg:characterGGScore(chosen.map(m=>profile.mods.find(x=>x.id===m.id))),
       characterValue:chosen.reduce((n,m)=>n+(worker.characterGGValue(gg.scores[m.id],gg.rolls[m.id],prefs[id]?.weights)||0),0)/6,
       weightValue:worker.scoreModSet(chosen,chars[id],target),stats,
       mods:chosen.map(m=>({id:m.id,slot:m.slot,set:m.set.name,primary:m.primaryStat.type,level:m.level,pips:m.pips,owner:m.characterID,gg:gg.scores[m.id],rolls:gg.rolls[m.id]}))};
   };
   const limits=gg.restrictions[id];
   const strict=limits?{metaRestrictions:{setCombinations:limits.setCombinations.slice(0,1),primaries:Object.fromEntries(Object.entries(limits.primaries).map(([s,p])=>[s,p.slice(0,1)]))}}:null;
   return {id,priority:index+1,locked:chars[id].optimizerSettings.isLocked,settings:chars[id].optimizerSettings,
     before:summarize(original),after:summarize(selected),strictFit:strict?worker.modSetFulfillsMetaRestrictions(selected,strict):false,
     messages:result?.messages||[]};
 });
 const assigned=rows.flatMap(r=>r.after.mods.map(m=>m.id));
 const active=rows.filter(r=>!r.locked);
 const avg=(list,key)=>list.reduce((s,r)=>s+(r.after[key]||0),0)/list.length;
 output.modes[mode]={ms:Date.now()-start,summary:{active:active.length,gg:avg(active,'gg'),characterValue:avg(active,'characterValue'),
   first20GG:avg(active.slice(0,20),'gg'),complete:active.filter(r=>r.after.mods.length===6).length,
   strictFit:active.filter(r=>r.strictFit).length,duplicateAssignments:assigned.length-new Set(assigned).size,
   moved:active.reduce((n,r)=>n+r.after.mods.filter(m=>m.owner!==r.id).length,0),
   fallback:active.filter(r=>r.messages.some(m=>/could not form/.test(m))).map(r=>r.id)},rows};
 console.log(mode,JSON.stringify(output.modes[mode].summary));
 fs.mkdirSync('reports/roster-mode-comparison',{recursive:true});
 fs.writeFileSync('reports/roster-mode-comparison/414556856.json',JSON.stringify(output,null,2));
}
