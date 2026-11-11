import fs from 'node:fs';
const r=JSON.parse(fs.readFileSync('reports/roster-mode-comparison/414556856.json'));
const prefs=JSON.parse(fs.readFileSync('src/constants/generatedCharacterSecondaryPreferences.json')).characters;
const raw=JSON.parse(fs.readFileSync(process.argv[2])).profiles.find(p=>String(p.allyCode)==='414556856');
const meta=JSON.parse(fs.readFileSync('src/constants/generatedMetaTargets.json')).characters;
const best=p=>Object.entries(p.weights).sort((a,b)=>b[1]-a[1])[0][0];
console.log('Top preference',Object.values(prefs).reduce((a,p)=>(a[best(p)]=(a[best(p)]||0)+1,a),{}));
for(const id of ['WAMPA','CHEWBACCALEGENDARY','GLLEIA','GREATMOTHERS'])console.log(id,prefs[id]);
for(const [mode,run] of Object.entries(r.modes)) {
 const rows=run.rows;
 console.log(mode,{averageSpeed:rows.reduce((s,x)=>s+x.after.stats.Speed,0)/rows.length,
   below15:rows.flatMap(x=>x.after.mods).filter(m=>m.level<15).length,
   zero:rows.filter(x=>x.after.mods.length===0).length,
   lostSlots:rows.filter(x=>x.after.mods.length<x.before.mods.length).length,
   speedLoss20:rows.filter(x=>x.after.stats.Speed<x.before.stats.Speed-20).length,
   below5:rows.flatMap(x=>x.after.mods).filter(m=>m.pips<5).length});
}
const complete=r.modes.gg.rows.filter(x=>x.after.mods.length===6&&x.strictFit).map(x=>x.id);
for(const [mode,run] of Object.entries(r.modes)) {
 const rows=run.rows.filter(x=>complete.includes(x.id));
 console.log('41 strict builds',mode,{gg:rows.reduce((s,x)=>s+x.after.gg,0)/rows.length,speed:rows.reduce((s,x)=>s+x.after.stats.Speed,0)/rows.length});
}
console.log('Changed GG to character',r.modes.character.rows.filter((x,i)=>x.after.mods.map(m=>m.id).sort().join()!==r.modes.gg.rows[i].after.mods.map(m=>m.id).sort().join()).length);
for(const id of ['R2D2_LEGENDARY','MORGANELSBETH','WAMPA','CHEWBACCALEGENDARY','CAPTAINREX']) {
 console.log('DETAIL',id,Object.fromEntries(Object.entries(r.modes).map(([mode,run])=>{
  const row=run.rows.find(x=>x.id===id);return [mode,{gg:row.after.gg,stats:row.after.stats,mods:row.after.mods.map(m=>[m.slot,m.set,m.primary,m.gg])}];
 })));
}
// Diagnose first failure against the actual sequentially depleted pool.
let available=raw.mods.slice();
for(const row of r.modes.gg.rows){
 if(row.messages.some(m=>m.includes('could not form'))) {
  const limits=meta[row.id].targets[0].metaRestrictions;
  const combination=limits.setCombinations[0];
  const eligible=pool=>pool.filter(m=>combination[m.set.toLowerCase().replace(' ','')]&&m.pips>=raw.characters[row.id].optimizerSettings.minimumModDots&&
    (!limits.primaries[m.slot.toLowerCase()]||m.primaryBonusType===limits.primaries[m.slot.toLowerCase()][0]));
  const count=pool=>Object.fromEntries(['square','arrow','diamond','triangle','circle','cross'].map(slot=>[slot,eligible(pool).filter(m=>m.slot.toLowerCase()===slot).length]));
  console.log('FAIL',row.id,{sets:combination,remaining:count(available),fullInventory:count(raw.mods),remainingSlots:row.after.mods.length});
 }
 const assigned=new Set(row.after.mods.map(m=>m.id));available=available.filter(m=>!assigned.has(m.mod_uid));
}
