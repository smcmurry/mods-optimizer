/* Raw-kit interpreter, maintained separately from the prepared/scalar paths. */
/* eslint-disable no-restricted-globals */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('../../src/constants/generatedCharacterKits.json'), require('../../src/domain/conditionalUtility'));
  else root.CharacterMechanics = factory(root.CharacterKitData, root.ConditionalUtility || globalThis.ConditionalUtility);
}(typeof self !== 'undefined' ? self : this, function (data, conditional) {
  if (!conditional) throw new Error('Conditional utility helper must be loaded before character mechanics');
  const kits = (data && data.characters) || {};
  const knownStateTags = new Set(data.sourceStateTags || []);
  const operationGroups = new WeakMap();
  // Effect graphs repeat the same selectors thousands of times. Intern equal
  // immutable selectors so phase caches can reuse their recipient matches.
  const selectors = new Map();
  function intern(targets) {
    return targets.map(target => {
      const key = JSON.stringify(target);
      if (!selectors.has(key)) selectors.set(key, target);
      return selectors.get(key);
    });
  }
  Object.values(kits).forEach(kit => kit.abilities.forEach(ability => {
    const groups = { output: [] };
    ability.operations.forEach(operation => {
      operation.targets = intern(operation.targets);
      if (operation.receiverCriteria) operation.receiverCriteria = intern(operation.receiverCriteria);
      const internQuery = query => {
        if (query.targets) query.targets = intern(query.targets);
        query.gateContext?.forEach(internQuery);
      };
      operation.context.forEach(internQuery);
      operation.conditions?.forEach(condition => condition.context.forEach(internQuery));
      operation.when.forEach(group => { group.targets = intern(group.targets); });
      const phase = ['immunity', 'damageImmunity'].includes(operation.kind) ? 'stat' : operation.kind;
      if (!groups[phase]) groups[phase] = [];
      groups[phase].push(operation);
      if (!['stat', 'turnMeter', 'immunity', 'damageImmunity', 'cooldown', 'poolConversion', 'criticalRestriction'].includes(operation.kind)) groups.output.push(operation);
    });
    operationGroups.set(ability, groups);
  }));
  const clamp = (x, low, high) => Math.max(low, Math.min(high, x));
  const value = (x, fallback = 0) => Number.isFinite(Number(x)) ? Number(x) : fallback;
  const resist = (tenacity, potency) => clamp(Math.max(0.15, (tenacity - potency) / 100), 0, 1);
  const mitigation = (defense, level, penetration) => Math.max(0, defense * (1 - penetration)) / (Math.max(0, defense * (1 - penetration)) + 7.5 * level);
  function get(id) { return kits[id] || null; }
  const controlLossWeights = Object.freeze({ stun: 0.25, fear: 0.25, daze: 0.25, abilityBlock: 0.25 });
  function assumptions(model) {
    const weights = model.incomingControlWeights || controlLossWeights;
    const sum = Object.keys(controlLossWeights).reduce((total, type) => total + value(weights[type]), 0);
    const total = sum > 0 ? sum : 1;
    return { battleContext: conditional.normalizeBattleContext(model.battleContext), externalStatePolicy: model.externalStatePolicy || 'unspecified', temporaryProtectionPolicy: 'bounded-capacity', poolConversionPolicy: 'own-recipient-before-kit-stat-buffs', incomingDamageImmunityPolicy: 'Finite direct self-turn Physical/Special incoming damage coverage; true/no-modify/other damage and expiry order remain gaps', incomingControlCleansePolicy: 'Source-filtered ordinary clearable control variants, bounded per recipient turn; Fear and special undispellable variants excluded', horizonTurns: value(model.horizonTurns, 5), missingHealth: value(model.missingHealth, 0.5),
      missingProtection: value(model.missingProtection, 0.5), targetDebuffedChance: value(model.targetDebuffedChance, 0.5),
      targetBuffedChance: value(model.targetBuffedChance, 0.5), alliedDefeatChance: value(model.alliedDefeatChance, 0.25),
      enemyCount: value(model.enemyCount, 5), ultimateUses: value(model.ultimateUses, 1), enemyRecoveryFraction: value(model.enemyRecoveryFraction, 0.05),
      enemySpecialShare: value(model.enemySpecialShare, 0.5), enemyAssistRate: value(model.enemyAssistRate, 0.2),
      enemyBonusTM: value(model.enemyBonusTM, 0.1), enemyBuffStatFraction: value(model.enemyBuffStatFraction, 0.25),
      incomingControlWeights: Object.fromEntries(Object.keys(controlLossWeights).map(type => [type, value(weights[type]) / total])) };
  }
  function rotation(kit, model) {
    const available = kit.abilities.filter(a => a.kind === 'basic' || a.kind === 'special');
    const specials = available.filter(a => a.kind === 'special' && (!a.requiresUnlock || model.ultimateUses > 0));
    const weighted = specials.map(a => {
      const cooldown = a.cooldown + a.operations.filter(op => op.kind === 'cooldown').reduce((sum, op) => sum + op.delta, 0);
      return [a, a.requiresUnlock ? value(model.ultimateUses, 1) / value(model.horizonTurns, 5) : 1 / Math.max(2, cooldown + 1)];
    });
    const sum = weighted.reduce((total, row) => total + row[1], 0);
    const scale = sum > 0.85 ? 0.85 / sum : 1;
    const frequencies = Object.fromEntries(weighted.map(([a, weight]) => [a.id, weight * scale]));
    const basic = available.find(a => a.kind === 'basic');
    if (basic) frequencies[basic.id] = Math.max(0, 1 - Math.min(0.85, sum));
    return frequencies;
  }
  const rotations = new WeakMap();
  function preparedRotation(kit, model) {
    let choices = rotations.get(kit);
    if (!choices) { choices = new Map(); rotations.set(kit, choices); }
    const key = `${model.ultimateUses}|${model.horizonTurns}`;
    if (!choices.has(key)) {
      if (choices.size >= 16) choices.delete(choices.keys().next().value);
      choices.set(key, rotation(kit, model));
    }
    return choices.get(key);
  }
  function evaluate(inputStats, model, inputEnemy) {
    const enemy = { ...inputEnemy };
    const options = assumptions(model), duration = options.horizonTurns / Math.max(0.01, enemy.speed / 100);
    const actorKit = get(model.characterId);
    if (!actorKit) return null;
    const members = [{ id: model.characterId, stats: { ...inputStats }, kit: actorKit },
      ...(model.team || []).map(ally => ({ ...ally, stats: { ...ally.stats }, kit: get(ally.id) }))];
    members.forEach(member => { member.categories = member.kit ? member.kit.categories : member.categories || [];
      if (member.kit?.basePoolMultiplier) {
        member.stats.health *= member.kit.basePoolMultiplier; member.stats.protection *= member.kit.basePoolMultiplier;
      }
      member.stats.incomingDamageMultiplier = value(member.stats.incomingDamageMultiplier, 1);
      member.stats.outgoingDamageMultiplier = value(member.stats.outgoingDamageMultiplier, 1);
      member.original = { ...member.stats }; member.rotation = member.kit ? preparedRotation(member.kit, model) : {};
      member.hasCriticalPacket = !!member.kit?.abilities.some(ability => (ability.kind !== 'leader' || member.id === model.leaderId) && (!ability.requiresUnlock || model.ultimateUses > 0) && ability.operations.some(op => op.kind === 'damage' && op.crit !== 'never' && op.channel !== 'true'));
      member.rate = Math.max(0, member.stats.speed / 100); member.recovery = 0; member.assists = 0;
      member.initialTags = {};
      member.blackboards = { ...((model.blackboards || {})[member.id] || {}) }; });
    const damageResults = new Map();
    members.forEach(member => member.kit?.abilities.forEach(ability => ability.operations.forEach(op => {
      if (op.damageResultKey) damageResults.set(`${member.index}:${op.damageResultKey}`, 0);
    })));
    const opponents = { id: 'opponent', categories: enemy.categories || [], alignment: enemy.alignment,
      stats: { health: value(enemy.health, 100000), protection: value(enemy.protection, 100000), speed: enemy.speed,
        armor: enemy.armor, resistance: enemy.resistance, potency: enemy.potency, tenacity: enemy.tenacity,
        critAvoid: enemy.critAvoid, dodge: enemy.dodge, physDmg: value(enemy.physDmg, 10000), specDmg: value(enemy.specDmg, 10000),
        physCritChance: enemy.critChance, specCritChance: enemy.critChance, critDmg: enemy.critDmg, level: enemy.level,
        incomingDamageMultiplier: 1, outgoingDamageMultiplier: 1 } };
    const opponentOriginal = { ...opponents.stats };
    let control = 0, hostileTm = 0, hostileRecoveryBlock = 0, hostileBuffBlock = 0;
    const unresolved = new Set();
    const potentialStateTags = new Set(members.flatMap(member => (member.kit?.abilities || [])
      .filter(ability => !(ability.kind === 'leader' && member.id !== model.leaderId) && !(ability.requiresUnlock && !(model.ultimateUses > 0)))
      .flatMap(ability => ability.producedStateTags || [])));
    let recipientCache = new WeakMap(), contextCache = null;
    // State initialization changes query values within a pass, so it is not
    // memoized. Buffs/sharing change stats; TM changes rates and tag uptime.
    // Clear the relevant cache at each boundary instead of carrying stale data.
    function resetPhaseCaches(resetRecipients = false) {
      recipientCache = new WeakMap();
      contextCache = new WeakMap();
    }
    function tagProbability(id, recipient) {
      const overrides = model.stateTags && model.stateTags[recipient.id];
      if (overrides && Object.prototype.hasOwnProperty.call(overrides, id)) return value(overrides[id]);
      if (Object.prototype.hasOwnProperty.call(recipient.initialTags || {}, id)) return recipient.initialTags[id];
      if (/^(clearable_debuff|countable.*debuff|topple_debuff)$/.test(id)) return options.targetDebuffedChance;
      if (/^(clearable_buff|countable_buff)$/.test(id)) return options.targetBuffedChance;
      if (/masterstraining/.test(id)) return clamp(duration * (members.find(m => m.id === 'HERMITYODA')?.rate || 0) / 4 / Math.max(1, members.length - 1), 0, 1);
      if (/paralysis|daze|no_assist/.test(id)) return 0;
      if (/myturn_marker/.test(id)) return 1;
      if (/advantage/.test(id)) return value(model.advantageUptime, 0);
      if (data.stateTagClasses?.[id] === 1) return options.targetDebuffedChance;
      if (data.stateTagClasses?.[id] === 2) return options.targetBuffedChance;
      if (/burning|shock|target_lock|expose|buff_immunity|health_recovery/.test(id)) return options.targetDebuffedChance;
      if (/stealth|foresight|advantage|offense_up|defense_up/.test(id)) return options.targetBuffedChance;
      if (model.externalStatePolicy === 'closed-roster' && knownStateTags.has(id) && !potentialStateTags.has(id)) return 0;
      unresolved.add(`Unspecified state tag: ${id}`);
      return value(model.stateTags && model.stateTags[recipient.id] && model.stateTags[recipient.id][id]);
    }
    function match(target, recipient, caster) {
      if (!target.alive) { unresolved.add('Defeated-unit selection requires revival/death state'); return 0; }
      if ([5, 6, 10, 11].includes(target.select)) { unresolved.add('Context-dependent unit selection: ' + target.select); return 0; }
      if (target.excludeSelf && recipient === caster) return 0;
      if (target.select === 4 && recipient !== caster) return 0;
      if (target.select === 9 && recipient.id !== model.leaderId) return 0;
      const cats = recipient.categories || [];
      const positive = target.categories.filter(row => !row.exclude);
      if (positive.length && !positive.some(row => cats.includes(row.id))) return 0;
      if (target.categories.some(row => row.exclude && cats.includes(row.id))) return 0;
      if (!target.requiredCategories.every(id => cats.includes(id))) return 0;
      if (target.alignment.length && !target.alignment.includes(recipient.kit?.alignment || recipient.alignment)) return 0;
      let chance = 1;
      if (target.selectionCriteria) chance *= match(target.selectionCriteria, recipient, caster);
      const includedTags = target.tags.filter(tag => !tag.exclude);
      if (includedTags.length) chance *= Math.max(...includedTags.map(tag => tagProbability(tag.id, recipient)));
      target.tags.filter(tag => tag.exclude).forEach(tag => { chance *= 1 - tagProbability(tag.id, recipient); });
      target.requiredTags.forEach(tag => { chance *= tag.exclude ? 1 - tagProbability(tag.id, recipient) : tagProbability(tag.id, recipient); });
      for (const check of target.healthChecks) {
        if (check.battleStat === 3) {
          const fraction = recipient === opponents ? 1 - options.missingHealth : 1 - options.missingHealth;
          if ((check.min && fraction < check.min.value / 1000000) || (check.max && fraction > check.max.value / 1000000)) return 0;
        } else { unresolved.add('Absolute stat/blackboard target filter'); return 0; }
      }
      return chance;
    }
    function recipients(target, caster) {
      let byCaster = recipientCache.get(target);
      if (!byCaster) { byCaster = new Map(); recipientCache.set(target, byCaster); }
      if (byCaster.has(caster)) return byCaster.get(caster);
      if (target.side === 'enemy') {
        const rows = [{ member: opponents, count: target.select === 1 ? options.enemyCount : 1, chance: match(target, opponents, caster) }];
        byCaster.set(caster, rows); return rows;
      }
      const rows = members.map(member => ({ member, count: 1, chance: match(target, member, caster) })).filter(row => row.chance > 0);
      if ([2, 3, 7, 8].includes(target.select) && rows.length) {
        const sum = rows.reduce((sum, row) => sum + row.chance, 0);
        rows.forEach(row => { row.chance /= sum; });
      }
      byCaster.set(caster, rows); return rows;
    }
    function contextValue(operation, caster) {
      if (!operation.context.length) return 0;
      let byCaster;
      if (contextCache) {
        byCaster = contextCache.get(operation);
        if (!byCaster) { byCaster = new Map(); contextCache.set(operation, byCaster); }
        if (byCaster.has(caster)) return byCaster.get(caster);
      }
      const result = sumContext(operation.context, caster);
      if (byCaster) byCaster.set(caster, result);
      return result;
    }
    function queryStatValue(query, member) {
      const key = conditional.statQueryKey(query);
      if (!Object.prototype.hasOwnProperty.call(member.stats, key)) unresolved.add(`Unspecified native stat: ${member.id}:${key}`);
      return conditional.sourceStatValue(value(member.stats[key]), query.stat);
    }
    function sumContext(queries, caster) {
      let sum = 0;
      for (const q of queries) {
        if (q.gate) {
          const enabled = conditional.contextualGate(q.gate, sumContext(q.gateContext, caster));
          if (enabled == null) return null;
          if (!enabled) continue;
        }
        if (q.kind === 'damageResult') {
          const key = `${caster.index}:${q.abilityId}:${q.effectId}`;
          if (!damageResults.has(key)) { warn(`Missing source damage result: ${q.abilityId}:${q.effectId}`); return null; }
          sum += damageResults.get(key); continue;
        }
        if (q.kind === 'battleType') {
          const amount = conditional.battleQueryValue(q, options.battleContext);
          if (amount == null) { unresolved.add(`Unspecified battle context: ${q.id}`); return null; }
          sum += amount; continue;
        }
        sum += q.targets.reduce((total, target) => total + recipients(target, caster).reduce((total, row) =>
          total + row.chance * row.count * (q.kind === 'stat' ? queryStatValue(q, row.member) :
            q.kind === 'blackboard' ? blackboardQuery(q, row.member) : q.kind === 'unitValue' ? unitValueQuery(q, row.member) : 1), 0), 0);
      }
      return sum;
    }
    function enabledConditions(op, caster) {
      return conditional.conditionsValue(op.conditions, condition => contextValue(condition, caster)) === true;
    }
    function unitValueQuery(query, member) {
      const unit = model.unitValues && model.unitValues[member.id];
      if (!unit || !Object.prototype.hasOwnProperty.call(unit, query.key)) unresolved.add(`Unspecified unit value: ${member.id}:${query.key}`);
      return value(unit && unit[query.key]);
    }
    function blackboardQuery(query, member) {
      if (!Object.prototype.hasOwnProperty.call(member.blackboards || {}, query.key)) unresolved.add(`Unspecified counter: ${query.key}`);
      const number = value(member.blackboards && member.blackboards[query.key]);
      if (query.compare === 'GREATER_THAN') return number > query.threshold ? 1 : 0;
      if (query.compare === 'LESS_THAN') return number < query.threshold ? 1 : 0;
      if (query.compare === 'EQUAL_TO') return number === query.threshold ? 1 : 0;
      return number;
    }
    function eventWeight(operation, caster, ability, staticPhase, receiver) {
      let factor = 1;
      for (const [groupIndex, group] of operation.when.entries()) {
        const eventMembers = operation.receiverBound && receiver && groupIndex === operation.receiverGroupIndex ? [receiver] : group.targets.flatMap(target => recipients(target, caster).filter(row => row.chance > 0).map(row => row.member));
        const eventRate = eventMembers.reduce((sum, member) => sum + (member === opponents ? enemy.speed / 100 : member.rate), 0) / Math.max(0.01, caster.rate);
        const weights = group.events.map(event => {
          switch (event.event) {
            case 'start': return eventMembers.length ? (staticPhase || operation.revivalUsesDeathEvent ? 1 : 1 / Math.max(0.01, caster.rate * duration)) : 0;
            case 'turn': case 'action': case 'attack': case 'damage': return eventRate;
            case 'special': return 1 - value(caster.rotation[caster.kit.abilities.find(a => a.kind === 'basic')?.id]);
            case 'buff': return Math.max(0, ...eventMembers.map(member => tagProbability(event.tag, member)));
            case 'crit': return eventMembers.reduce((sum, member) => sum + (member.stats.neverCrit || member.stats.outgoingCritProhibited || (member !== opponents && !member.hasCriticalPacket) ? 0 : (member === opponents ? enemy.speed / 100 : member.rate) * clamp(Math.max(value(member.stats.physCritChance), value(member.stats.specCritChance)) / 100, 0, 1)), 0) / Math.max(0.01, caster.rate);
            case 'receiveDamage': return enemy.speed / 100 / Math.max(0.01, caster.rate) * eventMembers.length / members.length;
            case 'receiveCrit': return enemy.speed / 100 / Math.max(0.01, caster.rate) * eventMembers.length / members.length * clamp((enemy.critChance - value(receiver?.stats.critAvoid)) / 100, 0, 1);
            case 'allyDefeat': case 'enemyDefeat': case 'death': return options.alliedDefeatChance / Math.max(0.01, caster.rate * duration);
            default: return 0;
          }
        });
        factor *= Math.max(...weights, 0);
      }
      if (ability.kind === 'unique' || ability.kind === 'leader') return operation.when.length || staticPhase ? factor : 1 / Math.max(0.01, caster.rate * duration);
      return factor * value(caster.rotation[ability.id]);
    }
    function operationWeight(operation, caster, ability, row, staticPhase) {
      const context = contextValue(operation, caster);
      if (!enabledConditions(operation, caster) || context == null || (operation.gate === 'positive' && context <= 0) || (operation.gate === 'zero' && context > 0)) return 0;
      const landing = operation.resistible && row.member === opponents ? 1 - resist(opponents.stats.tenacity, caster.stats.potency) : 1;
      return operation.chance * row.chance * landing * eventWeight(operation, caster, ability, staticPhase, row.member);
    }
    function eachOperation(callback, kind) {
      members.forEach(caster => {
        if (!caster.kit) return;
        caster.kit.abilities.forEach(ability => {
          if (ability.kind === 'leader' && caster.id !== model.leaderId) return;
          if (ability.requiresUnlock && !(model.ultimateUses > 0)) return;
          // Number Crunch is handled explicitly once for every R2 in the team.
          if (caster.id === 'R2D2_LEGENDARY' && /uniqueability_r2d2_legendary02/.test(ability.id)) return;
          (operationGroups.get(ability)[kind || 'output'] || []).forEach(operation => {
            operation.targets.forEach(target => recipients(target, caster).forEach(row => {
              if (!enabledConditions(operation, caster)) return;
              if (operation.receiverCriteria) {
                const chance = Math.max(0, ...operation.receiverCriteria.map(criteria => match(criteria, row.member, row.member)));
                if (!chance) return;
                row = { ...row, chance: row.chance * chance };
              }
              callback(operation, caster, ability, row);
            }));
          });
        });
      });
    }
    eachOperation((op, caster, ability, row) => {
      if (row.member !== opponents && operationWeight(op, caster, ability, row, true) > 0.999) row.member.stats.outgoingCritProhibited = true;
    }, 'criticalRestriction');
    resetPhaseCaches(true);
    eachOperation((op, caster, ability, row) => {
      if (row.member === opponents) return;
      const chance = operationWeight(op, caster, ability, row, true);
      op.tags.forEach(tag => { row.member.initialTags[tag] = Math.max(value(row.member.initialTags[tag]), chance); });
    }, 'marker');
    resetPhaseCaches(true);
    eachOperation((op, caster, ability, row) => {
      if (op.kind !== 'state' || row.member === opponents || op.when.some(group => group.events.some(event => event.event !== 'start'))) return;
      const weight = operationWeight(op, caster, ability, row, true);
      if (weight && !Object.prototype.hasOwnProperty.call(row.member.blackboards, op.key)) row.member.blackboards[op.key] = op.additive + op.contextMultiplier * contextValue(op, caster);
    }, 'state');
    resetPhaseCaches();
    eachOperation((op, caster, ability, row) => {
      if (row.member === opponents) return;
      const fraction = clamp(operationWeight(op, caster, ability, row, true), 0, 1);
      const transferred = Math.max(0, value(row.member.stats[op.fromStat])) * fraction;
      row.member.stats[op.toStat] = value(row.member.stats[op.toStat]) + transferred;
      row.member.stats[op.fromStat] = Math.max(0, value(row.member.stats[op.fromStat]) - transferred);
    }, 'poolConversion');
    resetPhaseCaches(true);
    // Expected stat-buff uptime, including passive/leader boosts. Compute each
    // change from the original stat vector so iterative feedback cannot stack.
    const splitKeys = (key, channel) => ['critAvoid', 'accuracy', 'dodge'].includes(key) ?
      (channel ? [channel] : ['physical', 'special']).map(type => type + key[0].toUpperCase() + key.slice(1)) : [key];
    members.concat(opponents).forEach(member => ['critAvoid', 'accuracy', 'dodge'].forEach(key => {
      splitKeys(key).forEach(split => { member.stats[split] = value(member.stats[key]); });
    }));
    const deltas = new Map(members.concat(opponents).map(member => [member, {}]));
    eachOperation((op, caster, ability, row) => {
      if (op.kind !== 'stat' && op.kind !== 'immunity' && op.kind !== 'damageImmunity') return;
      const weight = operationWeight(op, caster, ability, row, true);
      const permanent = ability.kind === 'unique' || ability.kind === 'leader';
      const uptime = permanent ? weight : Math.min(1, weight * caster.rate * (op.duration || options.horizonTurns) / Math.max(0.01, row.member.stats.speed / 100));
      if (op.kind === 'damageImmunity') {
        op.protectedChannels.forEach(channel => {
          const key = channel + 'DamageImmunity';
          row.member.stats[key] = Math.max(value(row.member.stats[key]), clamp(uptime, 0, op.maximumFrequency * op.duration));
        });
        return;
      }
      if (op.kind === 'immunity') {
        op.immunities.forEach(key => { row.member.stats[key] = Math.max(value(row.member.stats[key]), clamp(uptime, 0, 1)); });
        return;
      }
      const keys = op.stat === 'offense' ? ['physDmg', 'specDmg'] : op.stat === 'defense' ? ['armor', 'resistance'] : op.stat === 'critChance' ? ['physCritChance', 'specCritChance'] :
        op.stat === 'physCritRating' ? ['physCritChance'] : op.stat === 'specCritRating' ? ['specCritChance'] : [op.stat];
      keys.flatMap(key => splitKeys(key, op.channel)).forEach(key => {
        let additive = op.additive;
        // Foresight/Advantage use huge internal sentinel values. They mean one
        // avoided/critical attack, not millions of permanent percentage points.
        if (Math.abs(additive) > 1000 && ['physCritChance', 'specCritChance'].includes(key)) {
          if (ability.kind === 'unique' && additive < 0 && uptime > 0.99) row.member.stats.neverCrit = true;
          if (additive > 0) row.member.stats.guaranteedCritUptime = Math.max(value(row.member.stats.guaranteedCritUptime), uptime);
          return;
        }
        if (Math.abs(additive) > 1000 && /CritAvoid$/.test(key)) {
          const type = key.startsWith('physical') ? 'physical' : 'special';
          const flag = type + (additive < 0 ? 'VulnerableUptime' : 'CritImmunityUptime');
          row.member.stats[flag] = Math.max(value(row.member.stats[flag]), clamp(uptime, 0, 1));
          return;
        }
        if (Math.abs(additive) > 1000 && /Dodge$/.test(key)) additive = Math.sign(additive) * 100;
        if (op.stat.endsWith('CritRating')) additive /= 24;
        const channelWeight = 1;
        const contextual = conditional.contextualStatAmount(op, value(row.member.stats[key]), contextValue(op, caster));
        const delta = (value(row.member.stats[key]) * clamp(op.multiplier, -1, 3) + additive + contextual) * uptime * channelWeight;
        const bucket = deltas.get(row.member); bucket[key] = value(bucket[key]) + delta;
      });
    }, 'stat');
    members.concat(opponents).forEach(member => Object.entries(deltas.get(member)).forEach(([key, delta]) => { member.stats[key] = Math.max(0, value(member.stats[key]) + delta); }));
    members.concat(opponents).forEach(member => ['critAvoid', 'accuracy', 'dodge'].forEach(key => {
      const suffix = key[0].toUpperCase() + key.slice(1);
      member.stats[key] = enemy.physicalShare * member.stats['physical' + suffix] + (1 - enemy.physicalShare) * member.stats['special' + suffix];
    }));
    Object.assign(enemy, { speed: opponents.stats.speed, potency: opponents.stats.potency, tenacity: opponents.stats.tenacity,
      critChance: enemy.physicalShare * opponents.stats.physCritChance + (1 - enemy.physicalShare) * opponents.stats.specCritChance,
      critDmg: opponents.stats.critDmg });
    const sharing = {};
    members.filter(member => member.id === 'R2D2_LEGENDARY' && (member !== members[0] || model.numberCrunch !== false)).forEach(r2 => {
      const factions = { health: 'affiliation_rebels', protection: 'species_droid', physDmg: 'affiliation_republic', specDmg: 'affiliation_republic', potency: 'affiliation_resistance' };
      const shares = {};
      Object.entries(factions).forEach(([key, category]) => {
        r2.stats[key] = value(r2.stats[key]) * (1 + 0.1 * members.filter(member => member.categories.includes(category)).length);
        shares[key] = 0.1 * r2.stats[key];
      });
      members.filter(member => member !== r2 && Object.values(factions).some(category => member.categories.includes(category))).forEach(member =>
        Object.entries(shares).forEach(([key, share]) => { member.stats[key] = value(member.stats[key]) + share; }));
      sharing[r2.id] = shares;
    });
    resetPhaseCaches();
    members.forEach(member => { member.rate = Math.max(0, member.stats.speed / 100); });
    const tm = new Map(members.map(member => [member, { self: 0, incoming: 0 }]));
    const immunityAvailability = (op, member) => (op.blockedByImmunity || []).reduce((fraction, key) => fraction * (1 - clamp(value(member.stats[key]), 0, 1)), 1);
    eachOperation((op, caster, ability, row) => {
      if (op.kind !== 'turnMeter') return;
      const amount = clamp(op.multiplier + op.contextMultiplier * contextValue(op, caster) + op.additive, -1, 1);
      const gain = amount * operationWeight(op, caster, ability, row, false) * immunityAvailability(op, row.member);
      if (row.member === opponents) { hostileTm += Math.max(0, -gain) * caster.rate * row.count; return; }
      const bucket = tm.get(row.member);
      if (row.member === caster) bucket.self += gain;
      else bucket.incoming += gain * caster.rate;
    }, 'turnMeter');
    function basicTurnMeter(member, casts, ownWeight = 0) {
      if (!casts && !ownWeight) return;
      const basic = member.kit?.abilities.find(ability => ability.kind === 'basic');
      (basic?.operations || []).filter(op => op.kind === 'turnMeter' && !op.when.length).forEach(op => {
        const context = contextValue(op, member);
        if (!enabledConditions(op, member) || context == null || (op.gate === 'positive' && context <= 0) || (op.gate === 'zero' && context > 0)) return;
        const amount = clamp(op.multiplier + op.contextMultiplier * context + op.additive, -1, 1);
        op.targets.forEach(target => recipients(target, member).forEach(row => {
          const landing = op.resistible && row.member === opponents ? 1 - resist(opponents.stats.tenacity, member.stats.potency) : 1;
          const gain = amount * op.chance * row.chance * landing * immunityAvailability(op, row.member);
          if (row.member === opponents) { hostileTm += Math.max(0, -gain) * casts * row.count; return; }
          const bucket = tm.get(row.member);
          if (row.member === member && ownWeight) bucket.self += gain * ownWeight;
          else bucket.incoming += gain * casts;
        }));
      });
    }
    eachOperation((op, caster, ability, row) => {
      if (row.member === opponents) return;
      const weight = operationWeight(op, caster, ability, row, false) * Math.max(0, op.additive || 1);
      basicTurnMeter(row.member, weight * caster.rate, row.member === caster ? weight : 0);
    }, 'assist');
    members.forEach(member => basicTurnMeter(member, enemy.speed / 100 / members.length * clamp(value(member.stats.counterChance) / 100, 0, 1)));
    members.forEach(member => { const gains = tm.get(member);
      const extra = member === members[0] ? value(model.turnMeterGain) * (1 - clamp(value(member.stats[value(model.turnMeterGain) < 0 ? 'turnMeterRemovalImmunity' : 'turnMeterGainImmunity']), 0, 1)) : 0;
      member.rate = (member.stats.speed / 100 + gains.incoming) / (1 - clamp(gains.self + extra, -0.95, 0.8));
      if (member === members[0]) member.rate *= value(model.bonusActionRate, 1); });
    resetPhaseCaches(true);
    function targetCriticalChance(recipient, channel, chance) {
      const vulnerable = clamp(value(recipient.stats[channel + 'VulnerableUptime']), 0, 1);
      const immune = clamp(value(recipient.stats[channel + 'CritImmunityUptime']), 0, 1);
      return (chance * (1 - vulnerable) + vulnerable) * (1 - immune);
    }
    function damage(op, caster, recipient) {
      const basis = op.stat === 'targetHealth' ? recipient.stats.health : op.stat === 'fixed' ? 0 : value(caster.stats[op.stat]);
      const context = contextValue(op, caster);
      const fromStat = op.context.some(query => query.kind === 'stat');
      const amount = Math.max(0, fromStat ? basis * op.multiplier + op.additive + op.contextMultiplier * context :
        (basis * op.multiplier + op.additive) * (1 + op.contextMultiplier * context));
      const channel = op.channel;
      const penetrationKey = channel === 'physical' ? 'physPenetration' : 'specPenetration';
      const fraction = clamp(value(enemy.outgoingPenetration) + value(caster.stats[penetrationKey + 'Percent']) / 100, 0, 1);
      const effectiveDefense = Math.max(0, value(recipient.stats[channel === 'physical' ? 'armor' : 'resistance']) * (1 - fraction) - value(caster.stats[penetrationKey]));
      const reduction = channel === 'true' ? 0 : mitigation(effectiveDefense, value(enemy.level, 85), 0);
      const avoidanceChannel = channel === 'physical' ? 'physical' : 'special';
      const normal = clamp((value(caster.stats[channel === 'physical' ? 'physCritChance' : 'specCritChance']) - value(recipient.stats[avoidanceChannel + 'CritAvoid'])) / 100, 0, 1);
      const guaranteed = clamp(value(caster.stats.guaranteedCritUptime), 0, 1);
      const chance = caster.stats.neverCrit || op.crit === 'never' ? 0 : op.crit === 'always' ? 1 : op.crit === 'advantage' ? value(model.advantageUptime) : normal * (1 - guaranteed) + guaranteed;
      const effectiveChance = caster.stats.neverCrit || op.crit === 'never' || (recipient === opponents && caster.stats.outgoingCritProhibited) ? 0 : targetCriticalChance(recipient, avoidanceChannel, chance);
      const critical = 1 + effectiveChance * Math.max(0, value(caster.stats.critDmg, 150) / 100 - 1);
      const hit = op.unavoidable ? 1 : clamp(1 - Math.max(0, value(recipient.stats[avoidanceChannel + 'Dodge']) - value(caster.stats[avoidanceChannel + 'Accuracy'])) / 100, 0, 1);
      const multiplier = caster === members[0] ? value(model[channel === 'special' ? 'specialCoefficient' : 'physicalCoefficient'], 1) : 1;
      const modifiers = op.noModifyDamage ? 1 : Math.max(0, value(caster.stats.outgoingDamageMultiplier, 1)) * Math.max(0, value(recipient.stats.incomingDamageMultiplier, 1));
      return amount * (1 - reduction) * critical * hit * multiplier * modifiers;
    }
    const basicDamageCache = new Map();
    function basicDamage(member) {
      if (basicDamageCache.has(member)) return basicDamageCache.get(member);
      const basic = member.kit?.abilities.find(a => a.kind === 'basic');
      if (!basic) {
        const fallback = value(member.stats.physDmg) * 1.25 * 0.5;
        basicDamageCache.set(member, fallback); return fallback;
      }
      const result = basic.operations.filter(op => op.kind === 'damage' && !op.when.length).reduce((sum, op) => sum + op.targets.filter(target => target.side === 'enemy').reduce((total, target) =>
        total + recipients(target, member).reduce((total, row) => {
          const context = contextValue(op, member);
          if (!enabledConditions(op, member) || context == null || (op.gate === 'positive' && context <= 0) || (op.gate === 'zero' && context > 0)) return total;
          return total + damage(op, member, opponents) * op.chance * row.chance * row.count;
        }, 0), 0), 0);
      basicDamageCache.set(member, result); return result;
    }
    const output = new Map(members.map(member => [member, { dps: 0, heal: 0, protectionRecovery: 0, temporaryProtection: 0, cleanseRates: { stun: 0, fear: 0, daze: 0, abilityBlock: 0 }, assistDps: 0, harmfulDamage: 0, bonusTurns: 0 }]));
    // Bonus basics execute direct recovery and eligible Health Steal once per
    // actual bonus attack. Ordered triggers and recursive attacks stay omitted.
    function bonusBasicRecovery(member, casts) {
      if (!casts) return;
      const basic = member.kit?.abilities.find(item => item.kind === 'basic');
      if (!basic) return;
      basic.operations.filter(item => item.kind === 'damage').filter(item => !item.when.length && item.healthSteal).forEach(item => {
        const context = contextValue(item, member);
        if (!enabledConditions(item, member) || context == null || (item.gate === 'positive' && context <= 0) || (item.gate === 'zero' && context > 0)) return;
        item.targets.forEach(target => recipients(target, member).filter(row => row.member === opponents).forEach(row => {
          output.get(member).heal += damage(item, member, opponents) * casts * item.chance * row.chance * row.count * Math.max(0, value(member.stats.healthSteal) / 100) * options.missingHealth;
        }));
      });
      basic.operations.filter(item => ['recover', 'shield'].includes(item.kind)).filter(item => !item.when.length).forEach(item => {
        const context = contextValue(item, member);
        if (!enabledConditions(item, member) || context == null || (item.gate === 'positive' && context <= 0) || (item.gate === 'zero' && context > 0)) return;
        item.targets.forEach(target => recipients(target, member).filter(row => row.member !== opponents).forEach(row => {
          const basis = item.fromCaster ? value(member.stats[item.basisStat || item.stat]) : value(row.member.stats[item.basisStat || item.stat]);
          const fraction = item.kind === 'shield' ? 1 : item.stat === 'health' ? options.missingHealth : options.missingProtection;
          const amount = Math.max(0, basis * item.multiplier + item.contextMultiplier * context * (item.contextAsMultiplier ? basis : 1) + item.additive);
          if (item.kind === 'shield') output.get(row.member).temporaryProtection += amount * Math.min(1, casts * item.chance * row.chance * (item.duration || options.horizonTurns) / Math.max(0.01, row.member.rate));
          else output.get(row.member)[item.stat === 'health' ? 'heal' : 'protectionRecovery'] += amount * casts * item.chance * row.chance * fraction * immunityAvailability(item, row.member);
        }));
      });
    }
    eachOperation((op, caster, ability, row) => {
      if (op.kind === 'stat' || op.kind === 'turnMeter') return;
      const weight = operationWeight(op, caster, ability, row, false), casts = weight * caster.rate;
      if (!casts) return;
      const own = output.get(caster);
      if (op.kind === 'damage') {
        const amount = damage(op, caster, row.member) * casts * row.count;
        if (op.damageResultKey) {
          const uses = caster.rate * value(caster.rotation[ability.id]);
          if (uses > 0) {
            const key = `${caster.index}:${op.damageResultKey}`;
            damageResults.set(key, value(damageResults.get(key)) + amount / uses);
          }
        }
        if (row.member === opponents) own.dps += amount;
        else output.get(row.member).harmfulDamage += amount;
        if (row.member === opponents && op.healthSteal) own.heal += amount * Math.max(0, value(caster.stats.healthSteal) / 100) * options.missingHealth;
      } else if (['recover', 'shield', 'revive'].includes(op.kind) && row.member !== opponents) {
        const basis = op.fromCaster ? value(caster.stats[op.basisStat || op.stat]) : value(row.member.stats[op.basisStat || op.stat]);
        const fraction = op.kind === 'shield' ? 1 : op.kind === 'revive' ? (op.revivalUsesDeathEvent ? 1 : options.alliedDefeatChance) : op.stat === 'health' ? options.missingHealth : options.missingProtection;
        const recovery = Math.max(0, basis * op.multiplier + op.contextMultiplier * contextValue(op, caster) * (op.contextAsMultiplier ? basis : 1) + op.additive) * casts * fraction * immunityAvailability(op, row.member);
        if (op.kind === 'shield') {
          const amount = Math.max(0, basis * op.multiplier + op.contextMultiplier * contextValue(op, caster) * (op.contextAsMultiplier ? basis : 1) + op.additive);
          output.get(row.member).temporaryProtection += amount * Math.min(1, casts * (op.duration || options.horizonTurns) / Math.max(0.01, row.member.rate));
        } else output.get(row.member)[op.stat === 'health' ? 'heal' : 'protectionRecovery'] += recovery;
      } else if (op.kind === 'assist' && row.member !== opponents) {
        const bonusCasts = casts * Math.max(0, op.additive || 1);
        own.assistDps += basicDamage(row.member) * bonusCasts;
        bonusBasicRecovery(row.member, bonusCasts);
      } else if (op.kind === 'execute' && row.member === opponents) own.dps += opponents.stats.health * casts;
      else if (['control', 'debuff'].includes(op.kind) && row.member === opponents) {
        const uptime = casts * row.count * (op.duration || 1) / Math.max(0.01, enemy.speed / 100);
        const effect = op.control;
        const lostActions = op.kind === 'control' || /fear/.test(effect) ? 1 : /ability.?block/.test(effect) ? options.enemySpecialShare :
          /daze/.test(effect) ? options.enemyAssistRate + options.enemyBonusTM : /shock/.test(effect) ? options.enemyBonusTM : 0;
        control += uptime * lostActions / options.enemyCount;
        if (/heal.*immunity|shock/.test(effect)) hostileRecoveryBlock += uptime / options.enemyCount;
        if (/buff.*immunity|shock/.test(effect)) hostileBuffBlock += uptime / options.enemyCount;
      } else if (op.kind === 'dispel') {
        // Only source-matched ordinary clearable control contributes. Restore
        // the recipient's existing lost output instead of inventing bonus DPS.
        if (row.member !== opponents) {
          (op.cleansedControls || []).forEach(type => { output.get(row.member).cleanseRates[type] += casts; });
        } else if (op.clearsAllBuffs) {
          hostileBuffBlock += casts * row.count / Math.max(0.01, enemy.speed / 100) / options.enemyCount;
        }
      }
    });
    members.forEach(member => {
      const casts = enemy.speed / 100 / members.length * clamp(value(member.stats.counterChance) / 100, 0, 1);
      if (casts) { output.get(member).assistDps += basicDamage(member) * casts; bonusBasicRecovery(member, casts); }
    });
    const metrics = members.map(member => {
      const result = output.get(member);
      const bonus = Math.min(result.bonusTurns, member.rate);
      const immunityCoverage = Object.entries(options.incomingControlWeights).reduce((sum, [type, share]) => sum + share * clamp(value(member.stats[type + 'Immunity']), 0, 1), 0);
      const cleanseCoverage = Object.fromEntries(Object.keys(options.incomingControlWeights).map(type =>
        [type, clamp(value(result.cleanseRates[type]) / Math.max(0.01, member.rate), 0, 1)]));
      const cleanseShare = Object.entries(options.incomingControlWeights).reduce((sum, [type, share]) => sum + share * cleanseCoverage[type], 0);
      const remainingControlShare = Object.entries(options.incomingControlWeights).reduce((sum, [type, share]) =>
        sum + share * (1 - clamp(value(member.stats[type + 'Immunity']), 0, 1)) * (1 - cleanseCoverage[type]), 0);
      const lostOutput = value(model.incomingControlLoss, 0.15) * remainingControlShare * (1 - resist(member.stats.tenacity, opponents.stats.potency));
      const availableOutput = 1 - lostOutput;
      const dps = (result.dps * (1 + bonus / Math.max(0.01, member.rate)) + result.assistDps) * availableOutput;
      const defenseAfterPenetration = (stat, penetration) => Math.max(0, value(member.stats[stat]) *
        (1 - clamp(value(enemy.incomingPenetration) + value(opponents.stats[penetration + 'Percent']) / 100, 0, 1)) - value(opponents.stats[penetration]));
      const damageImmunityCoverage = enemy.physicalShare * value(member.stats.physicalDamageImmunity) + (1 - enemy.physicalShare) * value(member.stats.specialDamageImmunity);
      const incoming = enemy.physicalShare * (1 - value(member.stats.physicalDamageImmunity)) * (1 - mitigation(defenseAfterPenetration('armor', 'physPenetration'), value(member.stats.level, 85), 0)) +
        (1 - enemy.physicalShare) * (1 - value(member.stats.specialDamageImmunity)) * (1 - mitigation(defenseAfterPenetration('resistance', 'specPenetration'), value(member.stats.level, 85), 0));
      const physicalCrit = targetCriticalChance(member, 'physical', clamp((opponents.stats.physCritChance - value(member.stats.physicalCritAvoid)) / 100, 0, 1));
      const specialCrit = targetCriticalChance(member, 'special', clamp((opponents.stats.specCritChance - value(member.stats.specialCritAvoid)) / 100, 0, 1));
      const crit = 1 + (enemy.physicalShare * physicalCrit + (1 - enemy.physicalShare) * specialCrit) * (enemy.critDmg / 100 - 1);
      const dodge = clamp(value(member.stats.dodge) / 100, 0, 0.8);
      const pool = member.stats.health + (member.stats.protection + result.temporaryProtection) * (1 - enemy.protectionBypass) + duration * (result.heal + result.protectionRecovery * (1 - enemy.protectionBypass) - result.harmfulDamage);
      const rawIncoming = enemy.physicalShare * opponents.stats.physDmg + (1 - enemy.physicalShare) * opponents.stats.specDmg;
      const referenceIncoming = enemy.physicalShare * opponentOriginal.physDmg + (1 - enemy.physicalShare) * opponentOriginal.specDmg;
      const damageRatio = rawIncoming / Math.max(1, referenceIncoming);
      const ehp = Math.max(0, pool) / Math.max(0.01, incoming * crit * (1 - dodge) * damageRatio *
        value(opponents.stats.outgoingDamageMultiplier, 1) * value(member.stats.incomingDamageMultiplier, 1));
      return { id: member.id, expectedDamage: result.dps / Math.max(0.01, member.rate), actionRate: member.rate + bonus,
        dps, ehp, healingRate: result.heal, protectionRecoveryRate: result.protectionRecovery, temporaryProtection: result.temporaryProtection, assistDamageRate: result.assistDps,
        debuffSuccess: 1 - resist(opponents.stats.tenacity, member.stats.potency), incomingDebuffSuccess: 1 - resist(member.stats.tenacity, opponents.stats.potency),
        incomingDamageImmunityCoverage: damageImmunityCoverage, incomingControlImmunityCoverage: immunityCoverage, incomingControlCleanseCoverage: cleanseShare, incomingControlLostOutput: lostOutput,
        kitRevision: data.revision, statVector: member.stats, kitCoverage: { abilities: member.kit?.abilities.length || 0,
          omittedEffects: member.kit?.abilities.reduce((sum, ability) => sum + ability.omittedCount, 0) || 0 } };
    });
    const incomingControl = 1 - clamp(control + hostileTm / Math.max(0.01, enemy.speed / 100) / options.enemyCount +
      clamp(hostileBuffBlock, 0, 1) * options.enemyBuffStatFraction / (1 + options.enemyBuffStatFraction), 0, 0.8);
    const recoveryPrevented = clamp(hostileRecoveryBlock, 0, 1) * opponents.stats.health * options.enemyRecoveryFraction * enemy.speed / 100 * options.enemyCount;
    const teamDps = metrics.reduce((sum, member) => sum + member.dps, 0) + recoveryPrevented;
    const teamEhp = metrics.reduce((sum, member) => sum + member.ehp, 0) / incomingControl;
    return { self: metrics[0], allies: metrics.slice(1), teamDps, teamEhp,
      utility: Math.max(1e-12, teamDps) * Math.max(1e-12, teamEhp), numberCrunchSharedStats: sharing.R2D2_LEGENDARY || {},
      assumptions: options, controlReduction: 1 - incomingControl, healingImmunityUptime: clamp(hostileRecoveryBlock, 0, 1),
      enemyRecoveryPreventedRate: recoveryPrevented,
      unresolvedStates: [...unresolved], opponentStatChanges: Object.fromEntries(Object.keys(opponentOriginal).filter(key => opponents.stats[key] !== opponentOriginal[key]).map(key => [key, opponents.stats[key] - opponentOriginal[key]])) };
  }
  return { revision: data && data.revision, source: data && data.source, get, evaluate, rotation, assumptions,
    characters: () => Object.keys(kits) };
}));
