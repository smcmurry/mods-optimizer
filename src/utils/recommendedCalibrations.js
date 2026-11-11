import {ggScore, ggStatType} from './ggScore';
import statRoll from '../constants/statRoll';

// Individual historical rolls are not imported: estimate the removed roll by
// its secondary's mean (excluding speed's permanent six-dot +1).
// Average KEEP/REVERT per outcome, not after averaging the candidate scores.
export function calibrationOptions(mod) {
  if (mod.pips !== 6 || mod.level !== 15 || !Number.isInteger(mod.tier) ||
    mod.tier < 1 || mod.tier > 5 || mod.secondaryStats.length !== 4) return [];
  const {score:currentScore, primaryFit} = ggScore(mod);
  if (currentScore === null || mod.secondaryStats.reduce((sum,s) => sum + Number(s.rolls),0) !== 7 + mod.tier) return [];
  return mod.secondaryStats.reduce((options, source, sourceIndex) => {
    const rolls = Number(source.rolls);
    if (rolls <= 1) return options;
    const sourceType = ggStatType(source);
    const removedValue = (source.value - (sourceType === 'Speed' ? 1 : 0)) / rolls;
    if (removedValue <= 0) return options;
    const reduced = mod.secondaryStats.map((stat,i) => i === sourceIndex ?
      {...stat, value: stat.value - removedValue, rolls: rolls - 1} : stat);
    const targets = reduced.map((stat,i) => Number(stat.rolls) < 5 ? i : -1).filter(i => i >= 0);
    let expectedGain = 0;
    let rawGain = 0;
    let improvementChance = 0;
    let potentialScore = currentScore;
    targets.forEach(targetIndex => {
      const target = reduced[targetIndex];
      const type = ggStatType(target);
      const range = statRoll[type][6];
      const bestStats = reduced.map((stat,i) => i === targetIndex ?
        {...stat, value:stat.value + range.max, rolls:Number(stat.rolls) + 1} : stat);
      potentialScore = Math.max(potentialScore, ggScore({...mod,secondaryStats:bestStats}).score);
      // Deterministic uniform quadrature for continuous ranges; integer speed
      // outcomes are enumerated directly. No random sampling or unstable ranks.
      const samples = type === 'Speed' ? [3,4,5,6] : Array.from({length:32}, (_,i) =>
        range.min + (i + .5) / 32 * (range.max - range.min));
      samples.forEach(value => {
        const secondaryStats = reduced.map((stat,i) => i === targetIndex ?
          {...stat, value: stat.value + value, rolls: Number(stat.rolls) + 1} : stat);
        const delta = ggScore({...mod, secondaryStats}).score - currentScore;
        const probability = 1 / targets.length / samples.length;
        expectedGain += Math.max(0, delta) * probability;
        rawGain += delta * probability;
        if (delta > 1e-9) improvementChance += probability;
      });
    });
    options.push({sourceType, sourceIndex, removedValue, expectedGain, rawGain,
      improvementChance, expectedScore: currentScore + expectedGain, potentialScore, currentScore, primaryFit,
      targets: targets.map(i => ggStatType(reduced[i]))});
    return options;
  }, []).sort((a,b) => b.expectedGain - a.expectedGain || a.sourceIndex - b.sourceIndex);
}

export default function recommendedCalibrations(mods) {
  return mods.reduce((rows,mod) => {
    const options = calibrationOptions(mod);
    if (options.length && options[0].expectedGain > 1e-9) rows.push({mod, ...options[0], options});
    return rows;
  }, []).sort((a,b) => b.expectedGain - a.expectedGain || b.currentScore - a.currentScore ||
    String(a.mod.id).localeCompare(String(b.mod.id)));
}
