import {ggScore, ggStatType, ggMaxValue} from './ggScore';
import {ggWeights} from '../constants/ggScoreCalibration';
import statRoll from '../constants/statRoll';
import Stat from '../domain/Stat';

// Exact allocation expectation under equal chances among uncapped secondaries.
// Cache count states, not mod values, so inventories share this small state space.
const cache = new Map();
export function expectedRollCounts(counts, rolls) {
  const key = `${counts.join(',')}:${rolls}`;
  if (cache.has(key)) return cache.get(key);
  if (!rolls) return counts.map(() => 0);
  const eligible = counts.map((count, i) => count < 5 ? i : -1).filter(i => i >= 0);
  const result = counts.map(() => 0);
  eligible.forEach(i => {
    const next = counts.slice(); next[i]++;
    const future = expectedRollCounts(next, rolls - 1);
    result.forEach((_, j) => { result[j] += (future[j] + (i === j ? 1 : 0)) / eligible.length; });
  });
  cache.set(key, result);
  return result;
}

export default function expectedSixAScore(mod) {
  const current = ggScore(mod);
  if (current.score === null || mod.secondaryStats.length !== 4 || ![5,6].includes(mod.pips) ||
    !Number.isInteger(mod.tier) || mod.tier < 1 || mod.tier > 5 ||
    !Number.isInteger(mod.level) || mod.level < 1 || mod.level > 15) return null;
  const counts = mod.secondaryStats.map(stat => Number(stat.rolls));
  const total = counts.reduce((a,b) => a+b, 0);
  const expectedTotal = mod.pips === 6 ? 7 + mod.tier : mod.tier - 1 + Math.min(4, Math.floor(mod.level / 3));
  if (total !== expectedTotal || (mod.pips === 6 && mod.level !== 15)) return null;
  const fiveRolls = mod.pips === 5 ? 8 - total : 0;
  const remaining = 12 - total;
  const allExpected = expectedRollCounts(counts, remaining);
  const fiveExpected = expectedRollCounts(counts, fiveRolls);
  const stats = mod.secondaryStats.map(stat => {
    const type = ggStatType(stat);
    return {...stat, type, value: mod.pips === 5 ?
      (type === 'Speed' ? stat.value + 1 : stat.value * Stat.secondaryUpgradeFactors[type]) : stat.value};
  });
  const base = ggScore({...mod, pips: 6, secondaryStats: stats}).score;
  const weights = ggWeights[typeof mod.set === 'string' ? mod.set : mod.set.name];
  const ideal = Object.keys(weights).filter(type => type !== ggStatType(mod.primaryStat))
    .sort((a,b) => weights[b]-weights[a]).slice(0,4)
    .reduce((sum,type,i) => sum + weights[type] * (i < 2 ? 5 : 1), 0);
  // Stop at 5A before promotion: no six-dot scaling or Speed +1 bonus.
  // Already-six-dot mods cannot reconstruct their historical 5A rolls.
  const expectedFiveAScore = mod.pips === 5 ? current.score + stats.reduce((sum, stat, i) => {
    const range = statRoll[stat.type][5];
    return sum + weights[stat.type] / statRoll[stat.type][6].max *
      fiveExpected[i] * (range.min + range.max) / 2;
  }, 0) / ideal * 100 * current.primaryFit : null;
  const gain = stats.reduce((sum, stat, i) => {
    const type = stat.type;
    const factor = type === 'Speed' ? 1 : Stat.secondaryUpgradeFactors[type];
    const maximum = type === 'Speed' ? 6 : ggMaxValue(type, 1);
    const fiveMean = (statRoll[type][5].min + statRoll[type][5].max) / 2 * factor;
    const sixMean = (statRoll[type][6].min + statRoll[type][6].max) / 2;
    return sum + weights[type] / maximum * (fiveExpected[i] * fiveMean +
      (allExpected[i] - fiveExpected[i]) * sixMean);
  }, 0) / ideal * 100 * current.primaryFit;
  // Every future max roll is worth its stat's weight, after conversion to six
  // dots. Spend the remaining rolls on the highest weights with capacity.
  const bestStats = stats.map(stat => ({...stat, rolls:Number(stat.rolls)}));
  const priority = bestStats.map((stat,i) => i).sort((a,b) =>
    weights[bestStats[b].type] - weights[bestStats[a].type]);
  let left = remaining;
  for (const i of priority) {
    const added = Math.min(left, 5 - bestStats[i].rolls);
    bestStats[i].value += added * statRoll[bestStats[i].type][6].max;
    bestStats[i].rolls += added;
    left -= added;
  }
  const potentialScore = ggScore({...mod, pips:6, tier:5, level:15, secondaryStats:bestStats}).score;
  return {expectedScore: Math.min(100, base + gain), expectedFiveAScore, potentialScore, remainingRolls: remaining};
}
