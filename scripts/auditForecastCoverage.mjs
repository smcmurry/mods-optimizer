import fs from 'node:fs';
import {createFrontendLoader} from './lib/loadFrontend.mjs';
const load=createFrontendLoader();
const Profile=load('src/domain/PlayerProfile.js').default;
const forecast=load('src/utils/expectedSixAScore.js').default;
const {ggScore}=load('src/utils/ggScore.js');
const data=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const profile=Profile.deserialize(data.profiles.find(p=>String(p.allyCode)==='414556856'));
const counts={};
const examples=[];
for(const mod of profile.mods) {
 if(forecast(mod)) continue;
 let reason;
 if(![5,6].includes(mod.pips)) reason='Below five dots';
 else if(mod.secondaryStats.length!==4) reason='Fewer than four revealed secondaries';
 else if(ggScore(mod).score===null) reason='Invalid or unsupported scoring data';
 else reason='Roll counts, level or tier inconsistent';
 counts[reason]=(counts[reason]||0)+1;
 if(examples.length<8) examples.push({id:mod.id,level:mod.level,pips:mod.pips,tier:mod.tier,secondaries:mod.secondaryStats.length,reason});
}
console.log(JSON.stringify({mods:profile.mods.length,excluded:Object.values(counts).reduce((a,b)=>a+b,0),counts,examples},null,2));
