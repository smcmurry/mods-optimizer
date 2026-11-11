import { ggScore } from './ggScore';
import expectedSixAScore from './expectedSixAScore';
import expectedNextSlice from './expectedNextSlice';

const tiers = ['E', 'D', 'C', 'B', 'A'];

// Rank by average final quality after all remaining upgrades to 6A.
export default function recommendedSlices(mods, {includeLeveling = false, dots = 'all', mode = 'sixA'} = {}) {
  return mods.reduce((rows, mod) => {
    if (![5, 6].includes(mod.pips) || !Number.isInteger(mod.tier) || mod.tier < 1 || mod.tier > 5 ||
      !Number.isInteger(mod.level) || mod.level < 1 || mod.level > 15 ||
      (mod.pips === 6 && mod.tier === 5) ||
      (!includeLeveling && mod.level < 15) || (dots !== 'all' && mod.pips !== Number(dots))) return rows;
    const result = ggScore(mod);
    const forecast = expectedSixAScore(mod);
    if (result.score === null || forecast === null) return rows;
    const from = `${mod.pips}${tiers[mod.tier - 1]}`;
    const to = mod.tier === 5 ? '6E' : `${mod.pips}${tiers[mod.tier]}`;
    rows.push({mod, score: result.score, ...forecast, ...expectedNextSlice(mod), primaryFit: result.primaryFit,
      nextSlice: `${from} → ${to}`, needsLeveling: mod.level < 15});
    return rows;
  }, []).sort((a, b) => (mode === 'nextSlice' ? b.nextSliceImprovement - a.nextSliceImprovement : 0) ||
    (mode === 'potential' ? b.potentialScore - a.potentialScore : 0) ||
    b.expectedScore - a.expectedScore || b.score - a.score ||
    String(a.mod.id).localeCompare(String(b.mod.id)));
}
