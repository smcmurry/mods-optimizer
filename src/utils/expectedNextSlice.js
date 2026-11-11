import {ggScore, ggStatType} from './ggScore';
import statRoll from '../constants/statRoll';
import Stat from '../domain/Stat';

// Input has already passed the recommendation forecast's eligibility validation.
export default function expectedNextSlice(mod) {
  const rollOnce = (working, evaluate) => {
    const eligible = working.secondaryStats.map((stat, i) => stat.rolls < 5 ? i : -1).filter(i => i >= 0);
    return eligible.reduce((sum, index) => {
      const stats = working.secondaryStats.map((stat, i) => {
        if (i !== index) return stat;
        const type = ggStatType(stat);
        const range = statRoll[type][working.pips];
        const mean = (range.min + range.max) / 2;
        return {...stat, value: stat.value + mean, rolls: Number(stat.rolls) + 1};
      });
      return sum + evaluate({...working, secondaryStats: stats}) / eligible.length;
    }, 0);
  };
  const afterSlice = working => {
    if (working.pips === 5 && working.tier === 5) {
      return ggScore({...working, pips: 6, tier: 1, secondaryStats: working.secondaryStats.map(stat => {
        const type = ggStatType(stat);
        return {...stat, type, value: type === 'Speed' ? stat.value + 1 : stat.value * Stat.secondaryUpgradeFactors[type]};
      })}).score;
    }
    return rollOnce(working, outcome => ggScore({...outcome, tier: working.tier + 1}).score);
  };
  // Include prerequisite leveling in the forecast, but do not credit its gains
  // to the slice itself. Average the slice delta over the leveling outcomes.
  const levelingRolls = mod.pips === 5 ? 4 - Math.min(4, Math.floor(mod.level / 3)) : 0;
  const average = (working, remaining, evaluate) => remaining ?
    rollOnce(working, next => average(next, remaining - 1, evaluate)) : evaluate({...working, level: 15});
  const before = average(mod, levelingRolls, working => ggScore(working).score);
  const after = average(mod, levelingRolls, afterSlice);
  return {nextSliceScore: after, nextSliceImprovement: after - before};
}
