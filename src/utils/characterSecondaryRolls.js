const groups = { Health: 'health', Protection: 'protection', Offense: 'offense', Defense: 'defense',
  Speed: 'speed', Potency: 'potency', Tenacity: 'tenacity', 'Critical Chance': 'critChance' };

export default function characterSecondaryRolls(mod) {
  const result = {};
  for (const stat of mod.secondaryStats) {
    const key = groups[stat.type.replace(/\s*%$/, '')];
    if (key && Number.isInteger(stat.rolls) && stat.rolls > 0)
      result[key] = (result[key] || 0) + stat.rolls;
  }
  return result;
}
