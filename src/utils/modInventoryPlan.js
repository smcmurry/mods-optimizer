import generatedMetaTargets from '../constants/generatedMetaTargets.json';
import setBonuses from '../constants/setbonuses';
import {ggPrimaryFit} from '../constants/ggScoreCalibration';
import {ggScore, ggStatType, ggSlots} from './ggScore';
import expectedSixAScore from './expectedSixAScore';

export const inventorySetNames = {health:'Health',offense:'Offense',defense:'Defense',speed:'Speed',
  critchance:'Critical Chance',critdamage:'Critical Damage',potency:'Potency',tenacity:'Tenacity'};
const typeKey = (set, primary, shape) => `${set}|${primary}|${shape}`;

// Enumerate legal placements of the first-choice complete set combination.
function layoutsFor(combination) {
  const counts = Object.fromEntries(Object.entries(combination || {}).map(([set,count]) =>
    [set, setBonuses[set] ? count * setBonuses[set].numberOfModsRequired : NaN]));
  if (Object.values(counts).some(count => !Number.isInteger(count) || count < 0) ||
      Object.values(counts).reduce((sum,count) => sum+count,0) !== 6) return [];
  const layouts = [];
  function visit(sets) {
    if (sets.length === 6) { layouts.push(sets); return; }
    Object.keys(counts).sort().forEach(set => {
      if (counts[set] > 0) { counts[set]--; visit(sets.concat(set)); counts[set]++; }
    });
  }
  visit([]);
  return layouts;
}

export function scoreDistribution(scores) {
  const bins = Array(10).fill(0);
  scores.forEach(score => { bins[Math.min(9,Math.floor(score/10))]++; });
  // A reflected Gaussian kernel keeps the smoothing inside the 0–100 range.
  // Scale to expected count per ten-score bin, matching the histogram axis.
  const bandwidth = 5;
  const curve = Array.from({length:101},(_,x) => scores.reduce((sum,score) => sum +
    [score,-score,200-score].reduce((density,center) => density +
      Math.exp(-0.5 * ((x-center)/bandwidth) ** 2),0),0) * 10 / (bandwidth*Math.sqrt(2*Math.PI)));
  return {bins,curve};
}

export default function modInventoryPlan(mods, characterCatalog = {}, meta = generatedMetaTargets.characters, useSixAAverage = false) {
  const groups = new Map();
  function group(set,primary,shape) {
    const key = typeKey(set,primary,shape);
    if (!groups.has(key)) groups.set(key,{key,set,primary,shape,scores:[],currentScores:[],owned:0,unknown:0,required:0,characters:[]});
    return groups.get(key);
  }
  Object.entries(ggPrimaryFit).forEach(([shape,sets]) => Object.entries(sets).forEach(([set,primaries]) =>
    Object.keys(primaries).forEach(primary => group(set,primary,shape))));
  let unclassified = 0;
  mods.forEach(mod => {
    const set = typeof mod.set === 'string' ? mod.set : mod.set && mod.set.name;
    if (!set || !mod.primaryStat || !ggSlots.includes(mod.slot)) { unclassified++; return; }
    const row = group(set,ggStatType(mod.primaryStat),mod.slot);
    row.owned++;
    const currentScore = ggScore(mod).score;
    if (Number.isFinite(currentScore)) row.currentScores.push(currentScore);
    const forecast = useSixAAverage ? expectedSixAScore(mod) : null;
    const score = useSixAAverage ? forecast && forecast.expectedScore : currentScore;
    if (Number.isFinite(score)) row.scores.push(score); else row.unknown++;
  });
  groups.forEach(row => {
    row.scores.sort((a,b) => b-a);
    row.currentScores.sort((a,b) => b-a);
  });
  const skipped = [], plans = [];
  // Include locked/unowned characters and retain meta characters even when the
  // downloaded character catalog is older than the bundled build data.
  const characterIds = Array.from(new Set([...Object.keys(characterCatalog),...Object.keys(meta)]));
  characterIds.forEach(id => {
    const data = meta[id];
    const limits = data && data.targets && data.targets[0] && data.targets[0].metaRestrictions;
    const primaries = ggSlots.map(shape => shape === 'square' ? 'Offense %' : shape === 'diamond' ? 'Defense %' :
      limits && limits.primaries && limits.primaries[shape] && limits.primaries[shape][0]);
    const layouts = layoutsFor(limits && limits.setCombinations && limits.setCombinations[0]);
    if (primaries.some(primary => !primary) || !layouts.length) { skipped.push(id); return; }
    plans.push({id,primaries,layouts});
  });
  // Allocate the least flexible characters first, then stable character ID order.
  // Each counted requirement is one slot in an actual valid six-mod layout.
  plans.sort((a,b) => a.layouts.length-b.layouts.length || a.id.localeCompare(b.id));
  const allocations = [];
  plans.forEach(plan => {
    let best;
    plan.layouts.forEach(layout => {
      const rows = layout.map((set,index) => group(set,plan.primaries[index],ggSlots[index]));
      const covered = rows.reduce((sum,row) => sum+Number(row.owned > row.required),0);
      // Switching the chart's score basis must not change required type counts.
      const quality = rows.reduce((sum,row) => sum+(row.currentScores[row.required] || 0),0);
      if (!best || covered > best.covered || (covered === best.covered && quality > best.quality)) best = {rows,covered,quality};
    });
    best.rows.forEach(row => { row.required++; row.characters.push(plan.id); });
    allocations.push({id:plan.id,types:best.rows.map(row => row.key)});
  });
  const rows = Array.from(groups.values()).map(row => ({...row,
    shortage:Math.max(0,row.required-row.owned),
    surplus:Math.max(0,row.owned-row.required),
    average:row.scores.length ? row.scores.reduce((a,b) => a+b,0)/row.scores.length : null,
    ...scoreDistribution(row.scores)}));
  return {rows,allocations,skipped,characterCount:characterIds.length,plannedCount:plans.length,unclassified};
}
