import fs from 'node:fs';
const load = name => JSON.parse(fs.readFileSync(`data/gameData-cache/${name}.json`, 'utf8')).data;
const units = load('units'), skills = load('skill'), abilities = load('ability'), effects = load('effect'), loc = load('Loc_ENG_US.txt');
const index = rows => Object.fromEntries(rows.map(row => [row.id, row]));
const skillMap = index(skills), abilityMap = index(abilities), effectMap = index(effects);
const ids = process.argv.slice(2);
const selected = units.filter(unit => unit.obtainable && unit.combatType === 1 && unit.rarity === 7 && (!ids.length || ids.includes(unit.baseId)));
console.log('Playable characters:', new Set(units.filter(unit => unit.obtainable && unit.combatType === 1).map(unit => unit.baseId)).size);
function compact(effect) {
  return Object.fromEntries(Object.entries(effect).filter(([key, value]) => ['id', 'type', 'chance', 'param', 'multiplierAmountDecimal', 'contextMultiplierDecimal', 'additiveAmountDecimal', 'applyType', 'damageType', 'target', 'triggerCondition', 'expirationCondition', 'effectReference', 'effectDefinition', 'contextIndex', 'triggerOnApplication'].includes(key) &&
    !(Array.isArray(value) && !value.length)).map(([key, value]) => [key, key === 'target' ? value.map(target => Object.fromEntries(Object.entries(target).filter(([, value]) => value && (!Array.isArray(value) || value.length)))) : value]));
}
for (const unit of selected) {
  console.log('\nCHARACTER', unit.baseId, loc[unit.nameKey]);
  for (const ref of unit.skillReference) {
    const skill = skillMap[ref.skillId], ability = abilityMap[skill?.abilityReference];
    if (!ability) continue;
    const tier = ability.tier.at(-1) || ability;
    console.log('\nABILITY', ability.id, loc[ability.nameKey], 'COOLDOWN', tier.cooldownMaxOverride || ability.cooldown);
    console.log(loc[tier.descKey] || loc[ability.descKey]);
    const seen = new Set();
    function visit(id, depth) {
      if (seen.has(id) || depth > 2) return;
      seen.add(id);
      const effect = effectMap[id];
      if (!effect) return;
      console.log(' '.repeat(depth), JSON.stringify(compact(effect)));
      for (const child of [...effect.effectReference, ...effect.effectDefinition]) visit(child.id, depth + 1);
    }
    (tier.effectReference || ability.effectReference).forEach(ref => visit(ref.id, 0));
  }
}
