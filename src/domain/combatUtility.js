/* Shared by the app and the standalone optimization worker. */
/* eslint-disable no-restricted-globals */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./characterMechanics'));
  else root.CombatUtility = factory(root.CharacterMechanics);
}(typeof self !== 'undefined' ? self : this, function (mechanics) {
  const VERSION = 3;
  const clamp = (x, low, high) => Math.max(low, Math.min(high, x));
  const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const positive = value => Math.max(1e-12, value);
  const steps = { health: 1, protection: 1, speed: 1, physDmg: 1, specDmg: 1,
    critDmg: 0.1, physCritChance: 0.1, specCritChance: 0.1, armor: 1, resistance: 1, potency: 0.1, tenacity: 0.1, accuracy: 0.1, critAvoid: 0.1 };
  const statKeys = { Health: 'health', Protection: 'protection', Speed: 'speed', 'Physical Damage': 'physDmg',
    'Special Damage': 'specDmg', 'Physical Critical Chance': 'physCritChance', 'Special Critical Chance': 'specCritChance',
    'Critical Damage': 'critDmg', Armor: 'armor', Resistance: 'resistance', Potency: 'potency', Tenacity: 'tenacity', Accuracy: 'accuracy', 'Critical Avoidance': 'critAvoid' };

  function defaults(id, physicalShare = 1) {
    return { version: VERSION, physicalShare, physicalCoefficient: 1, specialCoefficient: 1,
      healthDamageCoefficient: 0, debuffValue: 0, debuffProcChance: 1, incomingControlLoss: 0,
      bonusActionRate: 1, turnMeterGain: 0, openingTurnValue: 0,
      numberCrunch: id === 'R2D2_LEGENDARY', teamIds: [], team: [],
      matchups: [{ weight: 1, level: 85, armor: 637.5, resistance: 637.5, critAvoid: 0,
        tenacity: 100, potency: 100, speed: 300, physicalShare: 0.5, critChance: 50, critDmg: 150,
        dodge: 0, outgoingPenetration: 0, incomingPenetration: 0, protectionBypass: 0 }] };
  }

  function validate(model) {
    if (!model || model.version !== VERSION) throw new Error('Unsupported combat model version.');
    Object.values(model.unitValues || {}).forEach(unit => {
      if (!unit || !Number.isFinite(unit.relicLevel) || unit.relicLevel < 0 || unit.relicLevel > 50) throw new Error('Invalid unit relic level.');
    });
    if (model.kitEnabled) {
      // Normalize and validate the optional source battle context without
      // evaluating a kit or inferring a mode from its selected team.
      if (model.battleContext != null) mechanics.assumptions(model);
      if (model.externalStatePolicy !== undefined && !['closed-roster', 'unspecified'].includes(model.externalStatePolicy)) throw new Error('Invalid external effect-state policy.');
      if (!mechanics.get(model.characterId)) throw new Error('No compiled kit is available for this character.');
      if (model.incomingControlWeights !== undefined) {
        const weights = model.incomingControlWeights;
        const keys = Object.keys(mechanics.controlLossWeights);
        const total = weights && typeof weights === 'object' ? Object.values(weights).reduce((sum, weight) => sum + weight, 0) : 0;
        if (!weights || Array.isArray(weights) || typeof weights !== 'object' ||
          Object.entries(weights).some(([key, weight]) => !keys.includes(key) || !Number.isFinite(weight) || weight < 0) ||
          !Number.isFinite(total) || total <= 0) throw new Error('Incoming control shares must be nonnegative and have a positive total.');
      }
      const kitRanges = { horizonTurns: [1, 30], missingHealth: [0, 1], missingProtection: [0, 1], targetDebuffedChance: [0, 1],
        targetBuffedChance: [0, 1], alliedDefeatChance: [0, 1], enemyCount: [1, 5], ultimateUses: [0, 5], advantageUptime: [0, 1],
        enemyRecoveryFraction: [0, 1], enemySpecialShare: [0, 1], enemyAssistRate: [0, 1], enemyBonusTM: [0, 0.8], enemyBuffStatFraction: [0, 3] };
      Object.entries(kitRanges).forEach(([key, range]) => {
        if (!Number.isFinite(model[key]) || model[key] < range[0] || model[key] > range[1]) throw new Error(`Invalid kit assumption: ${key}.`);
      });
      for (const key of ['blackboards', 'stateTags']) {
        const states = model[key] || {};
        if (!states || Array.isArray(states) || typeof states !== 'object') throw new Error(`Invalid kit state: ${key}.`);
        Object.values(states).forEach(values => {
          if (!values || Array.isArray(values) || typeof values !== 'object' || Object.values(values).some(value => !Number.isFinite(value) || value < 0 || (key === 'stateTags' && value > 1))) throw new Error(`Invalid kit state: ${key}.`);
        });
      }
    }
    const ranges = { physicalShare: [0, 1], physicalCoefficient: [0, 100], specialCoefficient: [0, 100],
      healthDamageCoefficient: [0, 100], debuffValue: [0, 100], debuffProcChance: [0, 1], incomingControlLoss: [0, 0.99],
      bonusActionRate: [0.01, 100], turnMeterGain: [0, 0.95], openingTurnValue: [0, 100] };
    for (const [key, range] of Object.entries(ranges)) {
      if (typeof model[key] !== 'number' || !Number.isFinite(model[key]) || model[key] < range[0] || model[key] > range[1]) throw new Error(`Invalid combat assumption: ${key}.`);
    }
    if (!Array.isArray(model.matchups) || !model.matchups.length) throw new Error('At least one matchup is required.');
    let weight = 0;
    model.matchups.forEach(enemy => {
      for (const [key, range] of Object.entries({ weight: [0, 100000], level: [1, 100], armor: [0, 1000000], resistance: [0, 1000000], critAvoid: [0, 1000],
        tenacity: [0, 10000], potency: [0, 10000], speed: [0, 10000], physicalShare: [0, 1], critChance: [0, 1000], critDmg: [100, 1000],
        dodge: [0, 100], outgoingPenetration: [0, 1], incomingPenetration: [0, 1], protectionBypass: [0, 1] })) {
        if (typeof enemy[key] !== 'number' || !Number.isFinite(enemy[key]) || enemy[key] < range[0] || enemy[key] > range[1]) throw new Error(`Invalid matchup assumption: ${key}.`);
      }
      weight += enemy.weight;
    });
    if (weight <= 0) throw new Error('Matchup weights must have a positive sum.');
    if (!Array.isArray(model.teamIds) || model.teamIds.length > 4 || new Set(model.teamIds).size !== model.teamIds.length) throw new Error('Select up to four different teammates.');
    if (model.teamIds.some(id => typeof id !== 'string' || !id)) throw new Error('Invalid teammate ID.');
    if (typeof model.numberCrunch !== 'boolean') throw new Error('Number Crunch must be enabled or disabled.');
    if (!Array.isArray(model.team) || model.team.length > 4) throw new Error('Combat team must contain at most four allies.');
    if (model.kitEnabled && model.battleContext && model.battleContext.squadSize != null) {
      const size = model.battleContext.squadSize;
      if (size > 5 || model.team.length >= size || model.teamIds.length >= size) throw new Error('Selected allies exceed the declared squad size.');
    }
    model.team.forEach(ally => {
      if (!ally || !ally.stats || !Array.isArray(ally.tags) || !Number.isFinite(ally.physicalShare) || ally.physicalShare < 0 || ally.physicalShare > 1) throw new Error('Invalid teammate snapshot.');
    });
    return model;
  }

  function forCharacter(id, physicalShare = 1) {
    const model = defaults(id, physicalShare);
    return { ...model, characterId: id, kitEnabled: !!mechanics.get(id), mechanicsVersion: 4, kitRevision: mechanics.revision,
      autoTeam: true, leaderId: id, scenarioVersion: 2, horizonTurns: 5, missingHealth: 0.5, missingProtection: 0.5,
      targetDebuffedChance: 0.5, targetBuffedChance: 0.5, alliedDefeatChance: 0.25, enemyCount: 5,
      ultimateUses: 0, advantageUptime: 0, incomingControlLoss: 0.15,
      incomingControlWeights: { ...mechanics.controlLossWeights },
      externalStatePolicy: 'closed-roster',
      enemyRecoveryFraction: 0.05, enemySpecialShare: 0.5, enemyAssistRate: 0.2, enemyBonusTM: 0.1, enemyBuffStatFraction: 0.25,
      matchups: [model.matchups[0], { ...model.matchups[0], tenacity: 180, potency: 180, armor: 1000, resistance: 1000, speed: 350 },
        { ...model.matchups[0], tenacity: 80, potency: 80, armor: 400, resistance: 400, speed: 250, protectionBypass: 0.5, dodge: 15 }] };
  }

  function refreshDefaultScenarios(updated, original, id, physicalShare) {
    const current = forCharacter(id, physicalShare).matchups;
    const previous = current.map(enemy => ({ ...enemy, dodge: 0 }));
    const matches = original.matchups?.length === previous.length && original.matchups.every((enemy, index) =>
      Object.keys(enemy).length === Object.keys(previous[index]).length && Object.keys(previous[index]).every(key => enemy[key] === previous[index][key]));
    if (!original.scenarioVersion && matches) updated.matchups = current;
    return updated;
  }

  function upgradeModel(model, id, physicalShare = 1) {
    if (!model) return forCharacter(id, physicalShare);
    if (model.mechanicsVersion === 4) return refreshDefaultScenarios({ ...forCharacter(id, physicalShare), ...model, characterId: id, kitRevision: mechanics.revision }, model, id, physicalShare);
    const updated = { ...forCharacter(id, physicalShare), ...model, characterId: id, mechanicsVersion: 4, kitRevision: mechanics.revision };
    if (JSON.stringify(model.matchups) === JSON.stringify(defaults(id, physicalShare).matchups)) updated.matchups = forCharacter(id, physicalShare).matchups;
    if (!model.incomingControlLoss) updated.incomingControlLoss = 0.15;
    return updated;
  }

  function addStats(baseline, stats) {
    const result = { ...baseline };
    stats.forEach(stat => {
      const key = statKeys[stat.displayType];
      if (key) result[key] = number(result[key]) + number(stat.value);
    });
    return result;
  }

  function resist(tenacity, potency) { return clamp(Math.max(0.15, (tenacity - potency) / 100), 0, 1); }
  function mitigation(defense, level = 85, penetration = 0) {
    const effective = Math.max(0, defense * (1 - penetration));
    return effective / (effective + 7.5 * level);
  }
  function individual(stats, model, enemy) {
    const crit = chance => 1 + clamp((number(chance) - enemy.critAvoid) / 100, 0, 1) * Math.max(0, number(stats.critDmg, 150) / 100 - 1);
    const physical = Math.max(0, number(stats.physDmg)) * model.physicalCoefficient * (1 - mitigation(enemy.armor, enemy.level, enemy.outgoingPenetration)) * crit(stats.physCritChance);
    const special = Math.max(0, number(stats.specDmg)) * model.specialCoefficient * (1 - mitigation(enemy.resistance, enemy.level, enemy.outgoingPenetration)) * crit(stats.specCritChance);
    const hitChance = clamp(1 - Math.max(0, enemy.dodge - number(stats.accuracy)) / 100, 0, 1);
    const damage = (physical * model.physicalShare + special * (1 - model.physicalShare) + Math.max(0, number(stats.health)) * model.healthDamageCoefficient) * hitChance;
    const debuffSuccess = 1 - resist(enemy.tenacity, number(stats.potency));
    const incomingDebuffSuccess = 1 - resist(number(stats.tenacity), enemy.potency);
    const actions = Math.max(0, number(stats.speed)) / 100 * model.bonusActionRate / (1 - model.turnMeterGain);
    const openingMultiplier = 1 + (number(stats.speed) > enemy.speed ? model.openingTurnValue : 0);
    const dps = damage * actions * (1 + model.debuffValue * model.debuffProcChance * debuffSuccess) * openingMultiplier *
      (1 - model.incomingControlLoss * incomingDebuffSuccess);
    const incomingMitigation = enemy.physicalShare * (1 - mitigation(number(stats.armor), number(stats.level, 85), enemy.incomingPenetration)) +
      (1 - enemy.physicalShare) * (1 - mitigation(number(stats.resistance), number(stats.level, 85), enemy.incomingPenetration));
    const incomingCrit = 1 + clamp((enemy.critChance - number(stats.critAvoid)) / 100, 0, 1) * (enemy.critDmg / 100 - 1);
    const pool = Math.max(0, number(stats.health)) + Math.max(0, number(stats.protection)) * (1 - enemy.protectionBypass);
    const ehp = pool / positive(incomingMitigation * incomingCrit);
    return { expectedDamage: damage, actionRate: actions, dps, ehp, debuffSuccess, incomingDebuffSuccess, hitChance, openingMultiplier };
  }

  function evaluate(stats, model) {
    if (model.kitEnabled && mechanics.get(model.characterId)) {
      const scenarios = model.matchups.map(enemy => ({ weight: enemy.weight, ...mechanics.evaluate(stats, model, enemy) }));
      const utility = scenarios.reduce((sum, scenario) => sum + scenario.weight * scenario.utility, 0) / scenarios.reduce((sum, scenario) => sum + scenario.weight, 0);
      const result = { utility, logUtility: Math.log(positive(utility)), scenarios, kitRevision: mechanics.revision,
        numberCrunchSharedStats: scenarios[0].numberCrunchSharedStats };
      result.kitConfidence = kitConfidence(result, model);
      return result;
    }
    const own = { ...stats };
    const allies = model.team.map(ally => ({ ...ally, stats: { ...ally.stats } }));
    const shared = {};
    if (model.numberCrunch) {
      const factions = { health: 'Rebel', protection: 'Droid', physDmg: 'Galactic Republic', specDmg: 'Galactic Republic', potency: 'Resistance' };
      for (const [key, tag] of Object.entries(factions)) {
        // R2 counts as an ally of each of these factions for his own bonuses.
        const count = 1 + allies.filter(ally => (ally.tags || []).includes(tag)).length;
        own[key] = number(own[key]) * (1 + 0.1 * count);
        shared[key] = own[key] * 0.1;
      }
      allies.forEach(ally => {
        if ((ally.tags || []).some(tag => ['Droid', 'Galactic Republic', 'Rebel', 'Resistance'].includes(tag))) {
          Object.keys(shared).forEach(key => { ally.stats[key] = number(ally.stats[key]) + shared[key]; });
        }
      });
    }
    let utility = 0, totalWeight = 0;
    const scenarios = model.matchups.map(enemy => {
      const selfMetrics = individual(own, model, enemy);
      const allyMetrics = allies.map(ally => individual(ally.stats, { ...defaults(ally.id, number(ally.physicalShare, 1)), numberCrunch: false,
        debuffValue: number(ally.debuffValue), incomingControlLoss: number(ally.incomingControlLoss), openingTurnValue: 0 }, enemy));
      const teamDps = selfMetrics.dps + allyMetrics.reduce((sum, ally) => sum + ally.dps, 0);
      const teamEhp = selfMetrics.ehp + allyMetrics.reduce((sum, ally) => sum + ally.ehp, 0);
      const scenarioUtility = positive(teamDps) * positive(teamEhp);
      utility += enemy.weight * scenarioUtility;
      totalWeight += enemy.weight;
      return { weight: enemy.weight, self: selfMetrics, allies: allyMetrics, teamDps, teamEhp, utility: scenarioUtility };
    });
    utility /= totalWeight;
    return { utility, logUtility: Math.log(positive(utility)), scenarios, numberCrunchSharedStats: shared };
  }

  function score(stats, baseline, model) {
    const combat = evaluate(stats, model);
    const reference = evaluate(baseline, model);
    const ratio = Math.exp(clamp(combat.logUtility - reference.logUtility, -100, 100));
    return { total: 100 * ratio, utilityRatio: ratio, combat, reference };
  }

  function utility(stats, model) {
    if (!model.kitEnabled || !mechanics.get(model.characterId)) return evaluate(stats, model).utility;
    let total = 0, weight = 0;
    model.matchups.forEach(enemy => {
      total += enemy.weight * mechanics.evaluate(stats, model, enemy, true);
      weight += enemy.weight;
    });
    return total / weight;
  }

  // Priorities compare useful mod-sized increments. The exact per-point
  // derivatives remain separate and continue to drive individual-mod pruning.
  const prioritySteps = { health: 1000, protection: 1000, speed: 5, physDmg: 100, specDmg: 100,
    critDmg: 5, physCritChance: 2, specCritChance: 2, armor: 20, resistance: 20,
    potency: 3, tenacity: 3, accuracy: 3, critAvoid: 3 };
  function kitConfidence(result, model) {
    const ids = [model.characterId, ...(model.team || []).map(ally => ally.id)];
    const members = ids.map(id => {
      const kit = mechanics.get(id);
      const abilities = (kit?.abilities || []).filter(ability =>
        (ability.kind !== 'leader' || id === model.leaderId) && (!ability.requiresUnlock || model.ultimateUses > 0));
      const omissionReasons = {};
      abilities.forEach(ability => Object.entries(ability.omissionReasons || {}).forEach(([reason, count]) => {
        omissionReasons[reason] = number(omissionReasons[reason]) + count;
      }));
      return { id, activeAbilities: abilities.length,
        compiledOperations: abilities.reduce((sum, ability) => sum + ability.operations.length, 0),
        omittedBranches: abilities.reduce((sum, ability) => sum + ability.omittedCount, 0), omissionReasons };
    });
    const unresolved = [...new Set(result.scenarios.flatMap(scenario => scenario.unresolvedStates || []))];
    const omitted = members.reduce((sum, member) => sum + member.omittedBranches, 0);
    const compiled = members.reduce((sum, member) => sum + member.compiledOperations, 0);
    const exampleSize = mechanics.get(model.characterId)?.recommendedTeams.reduce((max, team) => Math.max(max, Math.min(5, team.length)), 1) || 1;
    const expected = Math.min(exampleSize, (model.battleContext && model.battleContext.squadSize) || 5);
    const completeTeam = ids.length >= expected;
    const reasons = [];
    if (omitted) reasons.push(`${omitted} omitted branches across the active team kits`);
    if (unresolved.length) reasons.push(`${unresolved.length} unresolved state/query conditions`);
    if (!completeTeam) reasons.push(`Team incomplete: ${ids.length}/${expected} members`);
    if (result.scenarios.length < 3) reasons.push('Fewer than three matchup scenarios');
    const coverage = compiled + omitted ? compiled / (compiled + omitted) : 0;
    const level = !reasons.length ? 'high' : coverage >= 0.9 && unresolved.length <= 5 && completeTeam ? 'medium' : 'low';
    return { version: 1, level, definition: 'Coverage of the bounded expected-utility model, not battle-outcome validation.',
      compiledOperations: compiled, omittedBranches: omitted, compiledBranchFraction: coverage,
      unresolvedStateCount: unresolved.length, expectedTeamMembers: expected, teamMembers: ids.length,
      scenarioCount: result.scenarios.length, members, reasons,
      limitations: ['Cooldown-weighted rotation; no ability AI or stateful battle simulation', 'Max non-Omicron ability tiers; actual skill unlocks are not imported'] };
  }
  function marginals(stats, model, includePriorities = true) {
    const reference = Math.log(positive(utility(stats, model)));
    const result = {};
    let max = 0;
    for (const [key, step] of Object.entries(steps)) {
      const gain = Math.log(positive(utility({ ...stats, [key]: number(stats[key]) + step }, model))) - reference;
      const priorityStep = prioritySteps[key];
      const priorityLogGain = includePriorities ? Math.log(positive(utility({ ...stats, [key]: number(stats[key]) + priorityStep }, model))) - reference : 0;
      const priorityUtilityGain = Math.expm1(priorityLogGain);
      result[key] = { step, logUtilityGain: gain, marginalLogUtilityPerPoint: gain / step,
        priorityStep, priorityUtilityGain, priority: 0 };
      max = Math.max(max, priorityUtilityGain);
    }
    Object.values(result).forEach(row => { row.priority = max > 0 ? Math.round(100 * Math.max(0, row.priorityUtilityGain) / max) : 0; });
    return result;
  }
  return { VERSION, defaults, forCharacter, upgradeModel, validate, addStats, resist, mitigation, evaluate, utility, score, marginals, statKeys, steps, prioritySteps, kitConfidence,
    getKit: mechanics.get, kitRevision: mechanics.revision, kitSource: mechanics.source, characterIds: mechanics.characters,
    preprocessing: mechanics.preprocessing };
}));
