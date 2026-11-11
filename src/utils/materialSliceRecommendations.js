import recommendedSlices from './recommendedSlices';
import {sliceSellLine} from './sliceSellLine';
import {finalScoreSamples} from './sliceTargetForecast';

// Costs supplied by the player, indexed by the tier being sliced.
export const mk1Costs = [100, 200, 350, 500];
export const mk2Costs = [0, 10, 20, 35];
export function materialCosts(mod) {
  if (mod.pips === 5 && mod.tier < 5) return {
    material: 'Mk 1', next: mk1Costs[mod.tier - 1],
    remaining: mk1Costs.slice(mod.tier - 1).reduce((a, b) => a + b, 0), endpoint: '5A'};
  if (mod.pips === 5 && mod.tier === 5) return {material: 'Mk 2', next: 110, remaining: 175, endpoint: '6A'};
  return {material: 'Mk 2', next: mk2Costs[mod.tier - 1],
    remaining: mk2Costs.slice(mod.tier - 1).reduce((a, b) => a + b, 0), endpoint: '6A'};
}

export default function materialSliceRecommendations(mods, material = 'Mk 1', scope = 'stage', includeLeveling = false) {
  const baseline = sliceSellLine(mods);
  return recommendedSlices(mods, {includeLeveling}).filter(row => materialCosts(row.mod).material === material).map(row => {
    const costs = materialCosts(row.mod);
    const next = scope === 'next';
    const levelingRolls = row.mod.pips === 5 ? 4 - Math.min(4, Math.floor(row.mod.level / 3)) : 0;
    const rolls = next ? levelingRolls + (row.mod.pips === 5 && row.mod.tier === 5 ? 0 : 1) :
      row.remainingRolls;
    const samples = finalScoreSamples(row.mod, rolls, next ? 'next' : 'sixA');
    const replacementScore = Math.max(row.score, baseline.cutoff || 0);
    const expectedGain = samples.reduce((sum, score) => sum + Math.max(0, score - replacementScore), 0) / samples.length;
    const cost = next ? costs.next : costs.remaining;
    return {...row, costs, cost, expectedGain, gainPerMaterial: cost ? expectedGain / cost : null,
      freeGain: cost === 0 && expectedGain > 0,
      endpoint: next ? row.nextSlice.split(' → ')[1] : '6A',
      endpointScore: next ? row.nextSliceScore : row.expectedScore};
  }).sort((a, b) => Number(b.freeGain) - Number(a.freeGain) ||
    (b.gainPerMaterial || 0) - (a.gainPerMaterial || 0) || b.expectedGain - a.expectedGain ||
    b.endpointScore - a.endpointScore || String(a.mod.id).localeCompare(String(b.mod.id)));
}
