import statRoll from '../constants/statRoll';
import { ggWeights, ggPrimaryFit, ggGradeThresholds } from '../constants/ggScoreCalibration';

export const ggSlots = ['square', 'arrow', 'diamond', 'triangle', 'circle', 'cross'];
const grades = ['SSS', 'SS', 'S', 'A', 'B', 'C'];
export function ggStatType(stat) {
  const type = stat.type.trim();
  return type.endsWith('%') ? type :
    (stat.displayModifier === '%' || ['Potency', 'Tenacity', 'Critical Chance', 'Critical Damage',
      'Critical Avoidance', 'Accuracy'].includes(type) ? `${type} %` : type);
}

// One fixed six-dot yardstick. No level/tier-dependent denominator and no
// projection of future rolls. Slicing only increases the numerator.
export function ggMaxValue(type, rolls) {
  return type === 'Speed' ? 6 * rolls + 1 :
    statRoll[type][6].max * rolls;
}

export function formatGGScore(score) {
  if (score === null || !Number.isFinite(score)) return '—';
  return score === 100 ? '100' : Math.min(99.9, Math.round(score * 10) / 10).toFixed(1);
}

export function ggScore(mod, thresholds = ggGradeThresholds) {
  const unavailable = {score: null, grade: null, primaryFit: null, cohort: null};
  if (!mod || !mod.primaryStat || !Array.isArray(mod.secondaryStats)) return unavailable;
  const set = typeof mod.set === 'string' ? mod.set : mod.set && mod.set.name;
  const weights = ggWeights[set];
  const primary = ggStatType(mod.primaryStat);
  const fit = ggPrimaryFit[mod.slot] && ggPrimaryFit[mod.slot][set];
  if (!weights || !fit || fit[primary] === undefined) return unavailable;
  const best = Object.keys(weights).sort((a, b) => weights[b] - weights[a]);
  const cohort = `${set}:${mod.slot}${primary === best[0] ? `:${primary}` : ''}`;
  const eligible = best.filter(type => type !== primary);
  // Four distinct secondaries, twelve rolls total, at most five per stat.
  // The best allocation is 5 / 5 / 1 / 1, excluding the primary stat.
  const ideal = eligible.slice(0, 4).reduce((sum, type, i) => sum + weights[type] * (i < 2 ? 5 : 1), 0);
  let value = 0;
  let rollCount = 0;
  let maxed = mod.secondaryStats.length === 4;
  const seen = new Set();
  for (const stat of mod.secondaryStats) {
    const type = ggStatType(stat);
    const rolls = Number(stat.rolls);
    if (!weights[type] || type === primary || seen.has(type) || !Number.isInteger(rolls) ||
      rolls < 1 || rolls > 5 || !Number.isFinite(stat.value) || stat.value < 0) return unavailable;
    seen.add(type);
    rollCount += rolls;
    const maximum = ggMaxValue(type, rolls);
    // Speed receives a single +1 on the five-to-six-dot slice.
    const units = type === 'Speed' ? Math.max(0, stat.value - (mod.pips === 6 ? 1 : 0)) / 6 :
      stat.value / ggMaxValue(type, 1);
    value += weights[type] * Math.min(rolls, units);
    maxed = maxed && Math.abs(stat.value - maximum) < 1e-9;
  }
  if (seen.size > 4 || rollCount > 12) return unavailable;
  const primaryFit = fit[primary]; // Already softened and floored; don't apply sqrt again.
  const perfect = maxed && rollCount === 12 && primaryFit === 1 && Math.abs(value - ideal) < 1e-9;
  const score = perfect ? 100 : Math.min(99.999999, Math.max(0, value / ideal * 100 * primaryFit));
  const cutoffs = thresholds[cohort];
  const grade = cutoffs && grades.every(g => Number.isFinite(cutoffs[g])) ?
    grades.find(g => score >= cutoffs[g]) || 'D' : null;
  return {score, grade, primaryFit, cohort};
}

export function characterGGScore(mods) {
  let total = 0;
  for (const slot of ggSlots) {
    const matching = mods.filter(mod => mod.slot === slot);
    if (matching.length > 1) return null;
    if (!matching.length) continue;
    const result = ggScore(matching[0]);
    if (result.score === null) return null;
    total += result.score;
  }
  return total / 6;
}
