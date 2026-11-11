import fs from 'node:fs';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const tagKind = id => /^(clearable_debuff|countable.*debuff|topple_debuff)$/.test(id) ? 1 :
  /^(clearable_buff|countable_buff)$/.test(id) ? 2 : /masterstraining/.test(id) ? 3 :
  /paralysis|daze|no_assist/.test(id) ? 4 : /myturn_marker/.test(id) ? 5 : /advantage/.test(id) ? 6 :
  /burning|shock|target_lock|expose|buff_immunity|health_recovery/.test(id) ? 1 :
  /stealth|foresight|advantage|offense_up|defense_up/.test(id) ? 2 : 0;

export function preprocessCombatPrograms(input, inputHash, compilerHash) {
  const classifyTag = id => {
    const special = tagKind(id);
    return [3, 4, 5, 6].includes(special) ? special : input.stateTagClasses?.[id] || special;
  };
  const characters = JSON.parse(JSON.stringify(input.characters));
  const characterIds = Object.keys(characters);
  const characterIndex = Object.fromEntries(characterIds.map((id, index) => [id, index]));
  const selectors = [], selectorIds = new Map(), tagKinds = {};
  function selector(target) {
    const key = JSON.stringify(target);
    if (selectorIds.has(key)) return selectorIds.get(key);
    const selectionCriteria = target.selectionCriteria ? selector(target.selectionCriteria) : undefined;
    const id = selectors.length;
    selectorIds.set(key, id);
    const positive = target.categories.filter(row => !row.exclude).map(row => row.id);
    const excluded = target.categories.filter(row => row.exclude).map(row => row.id);
    const eligibleWords = Array(Math.ceil(characterIds.length / 32)).fill(0);
    characterIds.forEach((characterId, index) => {
      const kit = characters[characterId], cats = kit.categories;
      if ((!positive.length || positive.some(category => cats.includes(category))) &&
          !excluded.some(category => cats.includes(category)) && target.requiredCategories.every(category => cats.includes(category)) &&
          (!target.alignment.length || target.alignment.includes(kit.alignment))) {
        const word = index >>> 5;
        eligibleWords[word] = (eligibleWords[word] | (1 << (index & 31))) >>> 0;
      }
    });
    [...target.tags, ...target.requiredTags].forEach(tag => { tagKinds[tag.id] = classifyTag(tag.id); });
    selectors.push({ ...target, selectionCriteria, eligibleWords,
      dynamic: [...target.tags, ...target.requiredTags].some(tag => tagKinds[tag.id] === 3) ||
        (selectionCriteria !== undefined && selectors[selectionCriteria].dynamic) });
    return id;
  }
  const selectorsFor = targets => targets.map(selector);
  for (const kit of Object.values(characters)) {
    kit.abilities.forEach(ability => {
      ability.effectiveCooldown = ability.cooldown + ability.operations.filter(op => op.kind === 'cooldown')
        .reduce((sum, op) => sum + op.delta, 0);
    });
    kit.basicId = kit.abilities.find(ability => ability.kind === 'basic')?.id;
    kit.defaultRotation = {};
    const specials = kit.abilities.filter(ability => ability.kind === 'special' && !ability.requiresUnlock);
    const weights = specials.map(ability => 1 / Math.max(2, ability.effectiveCooldown + 1));
    const sum = weights.reduce((total, weight) => total + weight, 0);
    const scale = sum > 0.85 ? 0.85 / sum : 1;
    specials.forEach((ability, index) => { kit.defaultRotation[ability.id] = weights[index] * scale; });
    if (kit.basicId) kit.defaultRotation[kit.basicId] = Math.max(0, 1 - Math.min(0.85, sum));
    kit.abilities.forEach(ability => {
      ability.numberCrunch = kit.id === 'R2D2_LEGENDARY' && /uniqueability_r2d2_legendary02/.test(ability.id);
      ability.phases = { criticalRestriction: [], marker: [], state: [], poolConversion: [], stat: [], turnMeter: [], assist: [], output: [] };
      ability.basicDamage = []; ability.basicRecovery = []; ability.basicTurnMeter = [];
      ability.operations.forEach((op, index) => {
        op.targets = selectorsFor(op.targets);
        if (op.receiverCriteria) op.receiverCriteria = selectorsFor(op.receiverCriteria);
        const prepareQuery = query => {
          if (query.targets) query.targets = selectorsFor(query.targets);
          query.statKey = query.stat === 'offense' ? 'physDmg' : query.stat === 'defense' ? 'armor' : query.stat;
          if (query.channel && ['critAvoid', 'accuracy', 'dodge'].includes(query.statKey)) query.statKey = query.channel + query.statKey[0].toUpperCase() + query.statKey.slice(1);
          query.gateContext?.forEach(prepareQuery);
        };
        op.context.forEach(prepareQuery);
        op.conditions?.forEach(condition => condition.context.forEach(prepareQuery));
        op.when.forEach(group => {
          group.targets = selectorsFor(group.targets);
          group.constantMembers = group.targets.every(id => !selectors[id].dynamic);
          group.events.forEach(event => { if (event.event === 'buff') tagKinds[event.tag] = classifyTag(event.tag); });
        });
        op.contextFromStat = op.context.some(query => query.kind === 'stat');
        op.constantCount = op.context.length > 0 && op.context.every(query => !query.gate && query.kind === 'count' && query.targets.every(id => !selectors[id].dynamic));
        op.initialState = op.kind === 'state' && op.when.every(group => group.events.every(event => event.event === 'start'));
        op.scoringOutput = ['damage', 'recover', 'shield', 'revive', 'assist', 'execute', 'control', 'dispel'].includes(op.kind) ||
          (op.kind === 'debuff' && /fear|ability.?block|daze|shock|heal.*immunity|buff.*immunity/.test(op.control));
        if (op.kind === 'stat') {
          op.statKeys = op.stat === 'offense' ? ['physDmg', 'specDmg'] : op.stat === 'defense' ? ['armor', 'resistance'] :
            op.stat === 'critChance' ? ['physCritChance', 'specCritChance'] : op.stat === 'physCritRating' ? ['physCritChance'] :
              op.stat === 'specCritRating' ? ['specCritChance'] : [op.stat];
          // Channels are source metadata, independent of candidate stats.
          // Expand once instead of allocating a flatMap for every stat effect.
          op.expandedStatKeys = op.statKeys.flatMap(key => ['critAvoid', 'accuracy', 'dodge'].includes(key) ?
            (op.channel ? [op.channel] : ['physical', 'special']).map(channel => channel + key[0].toUpperCase() + key.slice(1)) : [key]);
          op.ratingDivisor = op.stat.endsWith('CritRating') ? 24 : 1;
          op.boundedMultiplier = Math.max(-1, Math.min(3, op.multiplier));
          op.changesStat = !!(op.boundedMultiplier || op.additive || op.contextMultiplier);
        }
        if (['immunity', 'damageImmunity'].includes(op.kind)) { op.changesStat = true; ability.phases.stat.push(index); }
        if (ability.phases[op.kind] && op.kind !== 'output') ability.phases[op.kind].push(index);
        if (!['stat', 'turnMeter', 'immunity', 'damageImmunity', 'cooldown', 'poolConversion', 'criticalRestriction'].includes(op.kind)) ability.phases.output.push(index);
        if (op.kind === 'damage') {
          op.damageTargets = op.targets.filter(id => selectors[id].side === 'enemy');
          ability.basicDamage.push(index);
        }
        if (['recover', 'shield'].includes(op.kind)) ability.basicRecovery.push(index);
        if (op.kind === 'turnMeter' && !op.when.length) ability.basicTurnMeter.push(index);
      });
    });
  }
  return { ...input, characters, selectors, tagKinds, characterIndex,
    preprocessing: { version: 1, inputHash, compilerHash, kitRevision: input.revision, selectors: selectors.length,
      operations: Object.values(characters).reduce((sum, kit) => sum + kit.abilities.reduce((sum, ability) => sum + ability.operations.length, 0), 0) } };
}

export function ensureCombatPrograms() {
  const source = fs.readFileSync('src/constants/generatedCharacterKits.json', 'utf8');
  const inputHash = crypto.createHash('sha256').update(source).digest('hex');
  const compilerHash = crypto.createHash('sha256').update(fs.readFileSync(new URL(import.meta.url))).digest('hex');
  const output = 'src/constants/generatedCombatPrograms.json';
  if (fs.existsSync(output)) {
    const previous = JSON.parse(fs.readFileSync(output, 'utf8'));
    if (previous.preprocessing?.version === 1 && previous.preprocessing.inputHash === inputHash && previous.preprocessing.compilerHash === compilerHash) return previous;
  }
  const prepared = preprocessCombatPrograms(JSON.parse(source), inputHash, compilerHash);
  fs.writeFileSync(output, JSON.stringify(prepared));
  console.log(`Preprocessed ${Object.keys(prepared.characters).length} kits into ${prepared.selectors.length} selectors and ${prepared.preprocessing.operations} operations.`);
  return prepared;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) ensureCombatPrograms();
