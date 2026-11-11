import generatedMetaTargets from '../constants/generatedMetaTargets.json';
import setBonuses from '../constants/setbonuses';
import {ggScore, formatGGScore} from './ggScore';

const slots = ['square', 'arrow', 'diamond', 'triangle', 'circle', 'cross'];
export const shoppingSetNames = {health:'Health', defense:'Defense', critdamage:'Critical Damage', critchance:'Critical Chance', tenacity:'Tenacity', offense:'Offense', potency:'Potency', speed:'Speed'};

export const shoppingGGThreshold = 40;

// Place the top complete combination into slots requiring the fewest purchases.
// Prefer replacing mods already failing the primary/GG score checks.
function chooseSets(mods, needsUpgrade, combinations) {
  let best = null;
  combinations.forEach(combination => {
    const counts = {};
    for (const [name, count] of Object.entries(combination)) {
      if (setBonuses[name]) counts[name] = count * setBonuses[name].numberOfModsRequired;
    }
    if (Object.values(counts).reduce((sum, count) => sum + count, 0) !== 6) return;
    function visit(index, desired, purchases, mismatches) {
      if (index === slots.length) {
        if (!best || purchases < best.purchases || (purchases === best.purchases && mismatches < best.mismatches)) {
          best = { desired: desired.slice(), purchases, mismatches };
        }
        return;
      }
      for (const name of Object.keys(counts)) {
        if (!counts[name]) continue;
        const mismatch = !mods[index] || mods[index].set.name !== name;
        counts[name]--;
        visit(index + 1, desired.concat(name), purchases + Number(needsUpgrade[index] || mismatch), mismatches + Number(mismatch));
        counts[name]++;
      }
    }
    visit(0, [], 0, 0);
  });
  return best ? best.desired : mods.map(mod => mod ? mod.set.name : null);
}

export default function buildModShoppingList(assignments, gameSettings = {}) {
  const items = [];
  assignments.forEach(({ id, target, assignedMods }, characterIndex) => {
    const generated = generatedMetaTargets.characters[id];
    const limits = (target && target.metaRestrictions) || (generated && generated.targets[0].metaRestrictions);
    const primaries = limits ? Object.fromEntries(Object.entries(limits.primaries)
      .map(([slot, choices]) => [slot, slot === 'arrow' ? choices : choices.slice(0, 1)])) : {};
    const mods = slots.map(slot => assignedMods.find(mod => mod.slot === slot));
    const primaryMismatch = mods.map(mod => Boolean(mod && primaries[mod.slot] && !primaries[mod.slot].includes(mod.primaryStat.type)));
    const scores = mods.map(mod => ggScore(mod).score);
    const needsUpgrade = mods.map((mod, index) => !mod || primaryMismatch[index] ||
      scores[index] === null || scores[index] < shoppingGGThreshold);
    const desiredSets = chooseSets(mods, needsUpgrade, limits ? limits.setCombinations.slice(0, 1) : []);
    mods.forEach((mod, index) => {
      const reasons = [];
      if (!mod) reasons.push('Missing mod');
      else {
        if (primaryMismatch[index]) reasons.push(mod.slot === 'arrow' ? 'Primary outside top choices' : 'Primary is not the most common choice');
        if (desiredSets[index] && mod.set.name !== desiredSets[index]) reasons.push('Set combination needs replacement');
        if (scores[index] === null) reasons.push('GG score unavailable — review mod data');
        else if (scores[index] < shoppingGGThreshold) reasons.push('GG score below ' + shoppingGGThreshold);
      }
      if (!reasons.length) return;
      items.push({ priority: items.length + 1, characterPriority: characterIndex + 1, characterId: id,
        characterName: gameSettings[id] ? gameSettings[id].name : id, slot: slots[index],
        current: mod ? (shoppingSetNames[mod.set.name] || mod.set.name) + ' / ' + mod.primaryStat.type + ' / GG ' + formatGGScore(scores[index]) : 'Empty slot',
        desiredSet: shoppingSetNames[desiredSets[index]] || 'Any set',
        desiredPrimaries: primaries[slots[index]] || (slots[index] === 'square' ? ['Offense'] : slots[index] === 'diamond' ? ['Defense'] : mod ? [mod.primaryStat.type] : ['Any valid primary']),
        reasons, hasMeta: Boolean(limits) });
    });
  });
  return items;
}
