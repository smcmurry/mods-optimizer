import {ggScore, ggStatType} from './ggScore';
import {ggWeights} from '../constants/ggScoreCalibration';
import statRoll from '../constants/statRoll';
import Stat from '../domain/Stat';

const cache = new WeakMap();
// Fixed-seed simulations: stable across sorting/filtering, not measured game odds.
export function finalScoreSamples(mod, remainingRolls, stage = 'sixA') {
  const key = `${stage}:${remainingRolls}`;
  if (cache.has(mod) && cache.get(mod).has(key)) return cache.get(mod).get(key);
  const promote = mod.pips === 5 && (stage === 'sixA' || (stage === 'next' && mod.tier === 5));
  const weights = ggWeights[typeof mod.set === 'string' ? mod.set : mod.set.name];
  const ideal = Object.keys(weights).filter(type => type !== ggStatType(mod.primaryStat))
    .sort((a, b) => weights[b] - weights[a]).slice(0, 4)
    .reduce((sum, type, i) => sum + weights[type] * (i < 2 ? 5 : 1), 0);
  const stats = mod.secondaryStats.map(stat => ({...stat, type: ggStatType(stat),
    value: promote ? (ggStatType(stat) === 'Speed' ? stat.value + 1 :
      stat.value * Stat.secondaryUpgradeFactors[ggStatType(stat)]) : stat.value}));
  const result = ggScore({...mod, pips: promote ? 6 : mod.pips, secondaryStats: stats});
  const fiveRolls = mod.pips === 5 ? 8 - stats.reduce((sum, stat) => sum + Number(stat.rolls), 0) : 0;
  let seed = 123456789;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const samples = [];
  for (let trial = 0; trial < 1024; trial++) {
    const counts = stats.map(stat => Number(stat.rolls));
    let score = result.score;
    for (let roll = 0; roll < remainingRolls; roll++) {
      const eligible = counts.map((count, i) => count < 5 ? i : -1).filter(i => i >= 0);
      const i = eligible[Math.floor(random() * eligible.length)];
      const type = stats[i].type;
      const range = statRoll[type][roll < fiveRolls ? 5 : 6];
      const value = type === 'Speed' ? 3 + Math.floor(random() * 4) :
        (range.min + random() * (range.max - range.min)) *
        (roll < fiveRolls && promote ? Stat.secondaryUpgradeFactors[type] : 1);
      score += value / statRoll[type][6].max * weights[type] / ideal * 100 * result.primaryFit;
      counts[i]++;
    }
    samples.push(Math.min(100, score));
  }
  if (!cache.has(mod)) cache.set(mod, new Map());
  cache.get(mod).set(key, samples);
  return samples;
}

export default function sliceTargetForecast(row, baseline) {
  const samples = finalScoreSamples(row.mod, row.remainingRolls);
  const replacement = Math.max(row.score, baseline.cutoff || 0);
  const expectedTop300Gain = samples.reduce((sum, score) => sum + Math.max(0, score - replacement), 0) / samples.length;
  const remainingSlices = row.mod.pips === 5 ? 10 - row.mod.tier : 5 - row.mod.tier;
  const target = baseline.goal || baseline.threshold;
  const targetChance = row.potentialScore < target ? 0 :
    samples.filter(score => score >= target).length / samples.length;
  return {...row, targetChance, expectedTop300Gain, remainingSlices,
    gainPerSlice: expectedTop300Gain / Math.max(1, remainingSlices)};
}

export function compareTargetChance(a, b) {
  return b.targetChance - a.targetChance || a.remainingSlices - b.remainingSlices ||
    b.expectedScore - a.expectedScore || String(a.mod.id).localeCompare(String(b.mod.id));
}
