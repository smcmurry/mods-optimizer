import {ggScore} from './ggScore';

// Use the whole inventory, including completed 6A and equipped mods.
export function sliceSellLine(mods, target = 'auto') {
  const scores = mods.map(mod => ggScore(mod).score).filter(Number.isFinite).sort((a, b) => b - a);
  const top = scores.slice(0, 300);
  const average = top.length ? top.reduce((sum, score) => sum + score, 0) / top.length : null;
  const cutoff = top.length === 300 ? top[299] : null;
  const goal = ['50', '55', '60', '65', '70'].includes(String(target)) ? Number(target) : average >= 65 ? 70 : average >= 60 ? 65 : 60;
  return {count: top.length, average, cutoff, goal,
    threshold: cutoff === null ? null : goal};
}

export function sellRecommendation(row, baseline) {
  if (!Number.isFinite(baseline.threshold) || !Number.isFinite(row.expectedScore) ||
    !Number.isFinite(row.potentialScore)) return null;
  if (row.expectedScore >= baseline.threshold) return 'keep';
  if (row.potentialScore < baseline.threshold) return 'sell';
  return row.targetChance >= 0.25 ? 'gamble' : 'consider';
}

export function isBelowSellLine(row, baseline) {
  return sellRecommendation(row, baseline) === 'sell';
}
