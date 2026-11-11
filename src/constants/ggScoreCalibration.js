// User-supplied GG tables, captured 2026-10-28. Displayed precision only.
const sets = ['health', 'offense', 'defense', 'speed', 'critchance', 'critdamage', 'potency', 'tenacity'];
const stats = ['Speed', 'Offense %', 'Health %', 'Protection %', 'Defense %', 'Potency %',
  'Critical Chance %', 'Tenacity %', 'Offense', 'Health', 'Protection', 'Defense'];
const rows = [
  [1,.51,.43,.26,.19,.03,.03,.03,.21,.14,.12,.03],
  [1,.81,.30,.20,.09,.08,.20,.03,.34,.10,.09,.03],
  [1,.42,.42,.48,.62,.08,.03,.12,.18,.13,.22,.03],
  [1,.41,.30,.25,.14,.10,.03,.03,.17,.10,.11,.03],
  [1,.72,.19,.14,.06,.11,.38,.03,.30,.06,.06,.03],
  [1,.74,.23,.18,.07,.10,.31,.03,.31,.07,.08,.03],
  [1,.47,.22,.19,.07,.55,.04,.03,.20,.07,.09,.03],
  [1,.39,.25,.29,.19,.06,.03,.54,.16,.08,.13,.03]
];
const fitRows = {
  arrow: {
    Speed: [1,1,1,1,1,1,1,1],
    'Offense %': [1,1,.75,.75,1,.94,.82,.80],
    'Defense %': [.75,.75,.96,.75,.75,.75,.75,.75],
    'Health %': [1,.82,1,.82,.75,.75,.75,.94],
    'Protection %': [1,.76,1,.91,.75,.75,.90,1],
    'Accuracy %': [.75,.75,.75,.75,.75,.75,.75,.75],
    'Critical Avoidance %': [.91,.75,.76,.79,.75,.75,.75,1]
  },
  triangle: {
    'Critical Damage %': [1,1,1,1,1,1,1,1],
    'Critical Chance %': [.82,.75,.75,.75,.82,.75,.80,.79],
    'Offense %': [1,1,.82,1,1,1,1,.98],
    'Defense %': [.88,.75,.88,.80,.75,.75,.82,.83],
    'Health %': [1,.79,1,1,.75,.75,.89,.97],
    'Protection %': [1,.82,1,1,.80,.75,1,1]
  },
  circle: {
    'Health %': [1,1,1,1,1,1,1,.98],
    'Protection %': [1,.97,1,1,.98,.99,1,1]
  },
  cross: {
    'Offense %': [1,1,.88,1,1,1,1,1],
    'Defense %': [.86,.75,.99,.79,.75,.75,.77,.84],
    'Health %': [1,.93,1,1,.91,.88,.82,.96],
    'Protection %': [.96,.82,1,1,.82,.84,.89,.92],
    'Potency %': [.96,.83,.85,.95,.92,.93,1,.86],
    'Tenacity %': [.88,.75,.76,.86,.78,.81,.77,1]
  },
  square: {'Offense %': [1,1,1,1,1,1,1,1]},
  diamond: {'Defense %': [1,1,1,1,1,1,1,1]}
};
export const ggWeights = sets.reduce((result, set, i) => {
  result[set] = Object.freeze(stats.reduce((weights, stat, j) => {
    weights[stat] = rows[i][j];
    return weights;
  }, {}));
  return result;
}, {});
export const ggPrimaryFit = Object.keys(fitRows).reduce((result, slot) => {
  result[slot] = sets.reduce((bySet, set, i) => {
    bySet[set] = Object.keys(fitRows[slot]).reduce((byPrimary, primary) => {
      byPrimary[primary] = fitRows[slot][primary][i];
      return byPrimary;
    }, {});
    return bySet;
  }, {});
  return result;
}, {});
// Never infer percentile cutoffs from the user's changing inventory.
export const ggGradeThresholds = Object.freeze({});
