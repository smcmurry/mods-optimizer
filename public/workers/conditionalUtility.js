/* global globalThis */
/* eslint-disable strict */
/* Exact source mode predicates. Unknown context is deliberately not false: a
 * CONTEXTUAL_SKIP branch must not execute merely because its mode is unknown. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ConditionalUtility = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  // Unique prefixes of effectedTag in the 29 pinned QUERY_BATTLE_TYPE effects.
  // Update this list with the pinned source snapshot, never from display names.
  const battleTypes = Object.freeze(['TERRITORY_TOURNAMENT_BATTLE', 'EVENT', 'GALACTIC_CHALLENGE',
    'TERRITORY_WAR_BATTLE', 'TERRITORY_STRIKE_BATTLE', 'TERRITORY_COVERT_BATTLE',
    'CONQUEST_BATTLE', 'GUILD_RAID_BATTLE', 'PVP_BATTLE', 'COLISEUM_BATTLE']);
  const percentageStats = Object.freeze(['potency', 'tenacity', 'critDmg', 'physCritChance', 'specCritChance',
    'critAvoid', 'accuracy', 'dodge', 'healthSteal', 'counterChance', 'critChance',
    'physPenetrationPercent', 'specPenetrationPercent']);
  const percentageSet = new Set(percentageStats);
  function sourceStatValue(amount, stat) { return amount * (percentageSet.has(stat) ? 0.01 : 1); }
  function statQueryKey(query) {
    const key = query.stat === 'offense' ? 'physDmg' : query.stat === 'defense' ? 'armor' : query.stat;
    return query.channel && ['critAvoid', 'accuracy', 'dodge'].includes(key)
      ? query.channel + key[0].toUpperCase() + key.slice(1) : key;
  }
  function contextualStatAmount(operation, recipientStat, sourceContext) {
    // Percentage-additive source stats have a unit maximum of one, represented
    // as 100 percentage points here. Other stat maxima use recipient units.
    const scale = percentageSet.has(operation.stat) ? 100 : 1;
    const basis = operation.contextAsMultiplier ? (scale === 100 ? 100 : recipientStat) : scale;
    return operation.contextMultiplier * sourceContext * basis;
  }
  function compileBattleQuery(effect) {
    if (!effect || effect.type !== 32) return null;
    const criteria = effect.effectedTag;
    if (!Array.isArray(criteria) || !criteria.length || criteria.some(row =>
      !row || typeof row.tag !== 'string' || !row.tag || typeof row.exclude !== 'boolean')) return null;
    return { kind: 'battleType', id: effect.id,
      criteria: criteria.map(row => ({ tag: row.tag, exclude: row.exclude })) };
  }
  function normalizeBattleContext(context) {
    if (context == null) return null;
    if (typeof context !== 'object' || Array.isArray(context) ||
      typeof context.type !== 'string' || !battleTypes.includes(context.type))
      throw new TypeError('battleContext.type must be a source battle type');
    if (context.squadSize != null && (!Number.isInteger(context.squadSize) || context.squadSize < 1))
      throw new TypeError('battleContext.squadSize must be a positive integer');
    if (context.eventId != null && (typeof context.eventId !== 'string' || !context.eventId))
      throw new TypeError('battleContext.eventId must be a nonempty string');
    return { type: context.type, squadSize: context.squadSize ?? null, eventId: context.eventId ?? null };
  }
  function matchBattleTag(tag, context) {
    const separator = tag.indexOf(':');
    const type = separator < 0 ? tag : tag.slice(0, separator);
    if (type !== context.type) return false;
    if (separator < 0) return true;
    const qualifier = tag.slice(separator + 1);
    if (type === 'EVENT') return context.eventId == null ? null : qualifier === context.eventId;
    if (/^[1-9]\d*$/.test(qualifier))
      return context.squadSize == null ? null : Number(qualifier) === context.squadSize;
    return null;
  }
  function battleQueryValue(query, context) {
    if (!context) return null;
    // Positive entries are alternatives; matching exclusions veto. Preserve
    // indeterminate qualifiers until all alternatives have been examined.
    let positive = false, hasPositive = false, unknownPositive = false, unknownExclusion = false;
    for (const row of query.criteria) {
      const match = matchBattleTag(row.tag, context);
      if (row.exclude) {
        if (match === true) return 0;
        if (match === null) unknownExclusion = true;
      } else {
        hasPositive = true;
        if (match === true) positive = true;
        if (match === null) unknownPositive = true;
      }
    }
    if (hasPositive && !positive && !unknownPositive) return 0;
    if (unknownExclusion || (hasPositive && !positive && unknownPositive)) return null;
    return 1;
  }
  function contextualGate(gate, contextValue) {
    if (contextValue == null) return null;
    if (gate === 'positive') return contextValue > 0;
    if (gate === 'zero') return contextValue <= 0;
    return true;
  }
  function appendCondition(ancestors, source) {
    if (!source.gate) return ancestors;
    // Keep the source query object, not a precomputed value: candidate mods can
    // change stat comparisons, and state initialization changes counters.
    return [...ancestors, { id: source.id, gate: source.gate, context: source.context }];
  }
  function conditionsValue(conditions, evaluate) {
    let unknown = false;
    for (const condition of conditions || []) {
      const enabled = contextualGate(condition.gate, evaluate(condition));
      if (enabled === false) return false;
      if (enabled == null) unknown = true;
    }
    return unknown ? null : true;
  }
  function compileSourceQuery(reference, scope, effects, compileLeaf, stack = []) {
    const effect = reference && effects[reference.id];
    if (!effect || stack.includes(effect.id)) return { kind: 'unknown', id: reference?.id, type: 'Missing or recursive query dependency' };
    const result = compileLeaf(effect);
    if (!result || result.kind === 'unknown') return result || { kind: 'unknown', id: effect.id, type: 'Unsupported query' };
    const gate = effect.param.includes('CONTEXTUAL_EXECUTE') ? 'positive' : effect.param.includes('CONTEXTUAL_SKIP') ? 'zero' : null;
    if (!gate) return result;
    const indices = reference.contextIndex?.length ? reference.contextIndex : effect.contextIndex;
    let dependencies;
    if (indices?.length) dependencies = indices.map(index => scope[index]);
    else {
      const previous = scope.slice(0, scope.indexOf(reference)).reverse()
        .find(row => [11, 12, 22, 26, 32].includes(effects[row.id]?.type));
      dependencies = previous ? [previous] : [];
    }
    if (!dependencies.length) return { kind: 'unknown', id: effect.id, type: 'Conditional query has no source dependency' };
    const gateContext = dependencies.map(row => compileSourceQuery(row, scope, effects, compileLeaf, [...stack, effect.id]));
    if (gateContext.some(row => row.kind === 'unknown')) return { kind: 'unknown', id: effect.id, type: 'Unsupported conditional query dependency', gateContext };
    return { ...result, gate, gateContext };
  }
  function guardQueryTargets(query, guardTargets) {
    return { ...query, ...(query.targets ? { targets: guardTargets(query.targets) } : {}),
      ...(query.gateContext ? { gateContext: query.gateContext.map(child => guardQueryTargets(child, guardTargets)) } : {}) };
  }
  return { battleTypes, percentageStats, sourceStatValue, statQueryKey, contextualStatAmount, compileBattleQuery, normalizeBattleContext, battleQueryValue, contextualGate,
    appendCondition, conditionsValue, compileSourceQuery, guardQueryTargets };
}));
