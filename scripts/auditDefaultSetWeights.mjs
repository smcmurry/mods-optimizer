import {createFrontendLoader} from './lib/loadFrontend.mjs';
const load = createFrontendLoader();
const settings = load('src/constants/characterSettings.js').default;
const setWeights = {health:['rawHealth'], defense:['rawArmor','rawResistance'], speed:['rawSpeed'],
  offense:['rawPhysDmg','rawSpecDmg'], critchance:['rawCritChance'], critdamage:['rawCritDmg'],
  potency:['rawPotency'], tenacity:['rawTenacity']};
const zeroWeightSets = [];
for (const [id, character] of Object.entries(settings)) {
  const target = character.targets[0];
  const top = target.metaRestrictions && target.metaRestrictions.setCombinations[0];
  if (!top) continue;
  const zero = Object.keys(top).filter(set => setWeights[set] && setWeights[set].every(key => !target[key]));
  if (zero.length) zeroWeightSets.push({id, top, zeroWeightSets:zero});
}
const examples = ['CHEWBACCALEGENDARY','WAMPA'].map(id => ({id,
  topSets:settings[id].targets[0].metaRestrictions.setCombinations,
  primaries:settings[id].targets[0].metaRestrictions.primaries,
  presets:settings[id].targets.map(target=>({name:target.name,
    weights:Object.fromEntries(Object.entries(target).filter(([key,value])=>key.startsWith('raw') && value))}))
}));
if (process.argv.includes('--alternatives')) {
  for (const row of zeroWeightSets) {
    const presets = settings[row.id].targets.slice(1);
    const candidates = presets.slice(1).filter(target => row.zeroWeightSets.some(set =>
      setWeights[set].some(key => target[key] > 0)));
    if (!candidates.length) continue;
    const describe = target => ({name:target.name, weights:Object.fromEntries(
      Object.entries(target).filter(([key,value])=>key.startsWith('raw') && value))});
    console.log(JSON.stringify({...row, current:describe(presets[0]), alternatives:candidates.map(describe)}));
  }
} else console.log(JSON.stringify({examples, zeroWeightSetCount:zeroWeightSets.length, zeroWeightSets},null,2));
