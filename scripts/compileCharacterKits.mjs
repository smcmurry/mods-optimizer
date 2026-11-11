import fs from 'node:fs';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
const conditional = createRequire(import.meta.url)('../src/domain/conditionalUtility.js');
import cooldownUtility from '../src/domain/cooldownUtility.js';
import dispelUtility from '../src/domain/dispelUtility.js';
import damageImmunityUtility from '../src/domain/damageImmunityUtility.js';
import { compileDamageRecoveryContext, missingRecoveryContext } from './lib/damageRecoverySource.mjs';
import { compilePoolConversion } from './lib/poolConversionSource.mjs';
import { compileOutgoingCriticalRestriction } from './lib/outgoingCriticalSource.mjs';
import { proveConsularRecovery } from './lib/consularRecoverySource.mjs';
const directory = 'data/gameData-cache';
const read = name => JSON.parse(fs.readFileSync(`${directory}/${name}.json`, 'utf8'));
const source = read('source'), unitsFile = read('units');
const index = rows => Object.fromEntries(rows.map(row => [row.id, row]));
const skills = index(read('skill').data), abilities = index(read('ability').data), effects = index(read('effect').data);
const targetingRules = index(read('battleTargetingRule').data);
const loc = read('Loc_ENG_US.txt').data, enums = read('enums').data;
const plain = text => (text || '').replace(/\[c\]|\[\/c\]|\[-\]|\[[a-fA-F0-9]{6}\]/g, '').replace(/\\n/g, '\n');
const statMap = { MAX_HEALTH: 'health', HEALTH: 'health', MAX_SHIELD: 'protection', SHIELD: 'protection', SPEED: 'speed',
  ATTACK_DAMAGE: 'physDmg', ABILITY_POWER: 'specDmg', OFFENSE: 'offense', DEFENSE: 'defense', ARMOR: 'armor', SUPPRESSION: 'resistance', ACCURACY: 'potency', RESISTANCE: 'tenacity',
  CRITICAL_DAMAGE: 'critDmg', ATTACK_CRITICAL_PERCENT_ADDITIVE: 'physCritChance', ABILITY_CRITICAL_PERCENT_ADDITIVE: 'specCritChance',
  ATTACK_CRITICAL_RATING: 'physCritRating', ABILITY_CRITICAL_RATING: 'specCritRating',
  ATTACK_CRITICAL_NEGATE_PERCENT_ADDITIVE: 'critAvoid', ABILITY_CRITICAL_NEGATE_PERCENT_ADDITIVE: 'critAvoid',
  CRITICAL_NEGATE_CHANCE_PERCENT_ADDITIVE: 'critAvoid', DODGE_NEGATE_PERCENT_ADDITIVE: 'accuracy', DEFLECTION_NEGATE_PERCENT_ADDITIVE: 'accuracy',
  EVASION_NEGATE_PERCENT_ADDITIVE: 'accuracy', DODGE_PERCENT_ADDITIVE: 'dodge', DEFLECTION_PERCENT_ADDITIVE: 'dodge',
  HEALTH_STEAL: 'healthSteal', COUNTER_ATTACK_RATING: 'counterChance', SPEED_PERCENT_ADDITIVE: 'speed',
  ARMOR_PENETRATION: 'physPenetration', SUPPRESSION_PENETRATION: 'specPenetration',
  ARMOR_PENETRATION_PERCENT_ADDITIVE: 'physPenetrationPercent', SUPPRESSION_PENETRATION_PERCENT_ADDITIVE: 'specPenetrationPercent',
  EVASION_PERCENT_ADDITIVE: 'dodge',
  OFFENSE_PERCENT_ADDITIVE: 'offense', DEFENSE_PERCENT_ADDITIVE: 'defense', CRITICAL_CHANCE_PERCENT_ADDITIVE: 'critChance' };
const percentStats = new Set(['potency', 'tenacity', 'critDmg', 'physCritChance', 'specCritChance', 'critAvoid', 'accuracy', 'dodge', 'healthSteal', 'counterChance', 'critChance', 'physPenetrationPercent', 'specPenetrationPercent']);
const immunityStats = { paralysis_debuff: 'stunImmunity', special_paralysis_debuff: 'stunImmunity',
  fear_debuff: 'fearImmunity', stifle_debuff: 'abilityBlockImmunity', special_stifle_debuff: 'abilityBlockImmunity',
  daze_debuff: 'dazeImmunity', special_daze_debuff: 'dazeImmunity', sepcial_daze_debuff: 'dazeImmunity',
  speed_recovery: 'turnMeterGainImmunity', delay: 'turnMeterRemovalImmunity', health_recovery: 'healthRecoveryImmunity' };
const supportedEvents = { 4: 'start', 7: 'start', 8: 'crit', 9: 'receiveCrit', 10: 'action', 11: 'attack', 13: 'receiveDamage',
  19: 'enemyDefeat', 20: 'allyDefeat', 21: 'death', 25: 'turn', 28: 'buff', 29: 'buff', 32: 'turn',
  35: 'action', 36: 'attack', 37: 'special', 48: 'receiveDamage', 49: 'action', 58: 'damage', 71: 'damage' };
const typeNames = Object.fromEntries(Object.entries(enums.EffectType).map(([name, value]) => [value, name]));
// Discover aliases from the source's own buff/debuff tags. Do not guess the
// meaning of arbitrary character markers from their names.
const tagClasses = new Map();
const classifiedEffects = new Set();
function classifyEffectTags(effect) {
  if (classifiedEffects.has(effect.id)) return;
  classifiedEffects.add(effect.id);
  const tags = effect.descriptiveTag.filter(row => !row.exclude).map(row => row.tag);
  const debuff = tags.some(tag => /^(clearable|countable)(?:_special)?_debuff$/.test(tag));
  const buff = tags.some(tag => /^(clearable|countable)(?:_special)?_buff$/.test(tag));
  if (debuff === buff) return;
  tags.forEach(tag => {
    if (!tagClasses.has(tag)) tagClasses.set(tag, new Set());
    tagClasses.get(tag).add(debuff ? 1 : 2);
  });
}
function classifyLinkedStatTags() {
  // A stat component that explicitly expires when its required parent buff
  // disappears shares that buff's class. Restrict this to reachable stat
  // effects with a positive parent selector; names alone are not evidence.
  let changed;
  do {
    changed = false;
    classifiedEffects.forEach(id => {
      const effect = effects[id];
      if (effect.type !== 8) return;
      const required = new Set(effect.target.flatMap(selector => [...selector.activeEffectTagCriteria,
        ...selector.requiredActiveEffectTagCriteria].filter(tag => !tag.exclude).map(tag => tag.tag)));
      const classes = effect.expirationCondition.filter(condition => [29, 51].includes(condition.conditionType) && required.has(condition.conditionValue))
        .flatMap(condition => [...(tagClasses.get(condition.conditionValue) || [])]);
      if (!classes.length || new Set(classes).size !== 1) return;
      effect.descriptiveTag.filter(tag => !tag.exclude).forEach(tag => {
        if (!tagClasses.has(tag.tag)) tagClasses.set(tag.tag, new Set());
        const values = tagClasses.get(tag.tag);
        if (!values.has(classes[0])) { values.add(classes[0]); changed = true; }
      });
    });
  } while (changed);
}
function target(raw = {}) {
  const category = raw.category || {};
  return { side: raw.battleSide === 3 || raw.battleSide === 5 ? 'enemy' : 'ally', select: raw.unitSelect || 1,
    excludeSelf: Boolean(raw.excludeSelf), categories: [...(category.categoryId || []).map(id => ({ id, exclude: Boolean(category.exclude) })),
      ...(category.category || []).map(row => ({ id: row.categoryId, exclude: row.exclude }))],
    requiredCategories: [...(raw.requiredCategory?.categoryId || []), ...(raw.requiredCategory?.category || []).filter(row => !row.exclude).map(row => row.categoryId)],
    tags: (raw.activeEffectTagCriteria || []).map(row => ({ id: row.tag, exclude: row.exclude })),
    requiredTags: (raw.requiredActiveEffectTagCriteria || []).map(row => ({ id: row.tag, exclude: row.exclude })),
    alignment: raw.forceAlignment || [], alive: raw.healthState !== 3, healthChecks: raw.statValue || [] };
}
function targets(rows) {
  // The pinned enum defines 1 as BOTH_SIDES. The aggregate opponent can
  // represent all-enemy targets; self selections still match only the caster.
  return rows.flatMap(raw => raw.battleSide === 1 && [1, 4].includes(raw.unitSelect)
    ? [{ ...target(raw), side: 'ally' }, { ...target(raw), side: 'enemy' }]
    : [{ ...target(raw), ...(raw.battleSide === 1 ? { unsupportedSelection: true } : {}) }]);
}
function queryLeaf(effect) {
  const id = effect?.id;
  if (!effect) return { kind: 'unknown', id };
  const recipients = targets(effect.target);
  if (recipients.some(selector => selector.unsupportedSelection)) return { kind: 'unknown', id, type: 'Unsupported both-side selection' };
  if (effect.type === 11) return { kind: 'count', targets: recipients };
  if (effect.type === 12) {
    const stat = statMap[effect.param.find(param => statMap[param])];
    const channel = effect.param.some(param => /^ATTACK_CRITICAL_NEGATE|^DODGE_(NEGATE_)?PERCENT/.test(param)) ? 'physical' :
      effect.param.some(param => /^ABILITY_CRITICAL_NEGATE|^DEFLECTION_(NEGATE_)?PERCENT/.test(param)) ? 'special' : null;
    return stat ? { kind: 'stat', stat, channel, sourceScale: conditional.percentageStats.includes(stat) ? 0.01 : 1, targets: recipients } : { kind: 'unknown', id, type: 'Unsupported stat query' };
  }
  if (effect.type === 26 && effect.param.includes('RELIC_LEVEL')) return { kind: 'unitValue', key: 'relicLevel', targets: recipients };
  if (effect.type === 22) return { kind: 'blackboard', key: effect.blackboardName,
    compare: effect.param.find(param => ['GREATER_THAN', 'LESS_THAN', 'EQUAL_TO'].includes(param)), threshold: Number(effect.additiveAmountDecimal) / 10000,
    targets: recipients };
  if (effect.type === 32) return conditional.compileBattleQuery(effect);
  return { kind: 'unknown', id, type: typeNames[effect.type] };
}
function query(ref, scope) { return conditional.compileSourceQuery(ref, scope, effects, queryLeaf); }
function compileAbility(ability, skill) {
  const maxIndex = Math.min(ability.tier.length - 1, (skill?.tier.length || ability.tier.length) - 1);
  let index = maxIndex;
  // Omicrons are mode/unlock dependent; keep their text in the audit, but do not
  // silently assume the player owns them or that every game mode enables them.
  while (index > 0 && skill?.tier[index]?.isOmicronTier) index--;
  const tier = ability.tier[index] || ability;
  const description = plain(loc[tier.descKey] || loc[ability.descKey]);
  const kind = ability.id.startsWith('basic') ? 'basic' : ability.id.startsWith('leader') ? 'leader' :
    ability.abilityType === 8 || ability.id.startsWith('unique') ? 'unique' : 'special';
  const cooldown = tier.cooldownMaxOverride || ability.cooldown || 0;
  const abilityTags = ability.descriptiveTag.filter(tag => !tag.exclude).map(tag => tag.tag);
  const operations = [], omitted = [], visited = new Set();
  const consumedInitialMarkers = new Set();
  const consularRecovery = tier === ability.tier.at(-1) ? proveConsularRecovery(ability, effects, loc) : null;
  if (consularRecovery?.context) omitted.push({ id: tier.effectReference[0].id,
    reason: 'Per-attack probabilistic penetration and ordering use an expected stat proxy, not independently modeled damage branches' });
  function visit(ref, scope, parents, inheritedChance, stack, inheritedResistible = false, conditions = [], inheritedContext = []) {
    const effect = effects[ref.id];
    if (!effect) { omitted.push({ id: ref.id, reason: 'Missing effect definition' }); return; }
    classifyEffectTags(effect);
    visited.add(ref.id);
    if (consumedInitialMarkers.has(ref.id)) return;
    if (stack.includes(ref.id)) { omitted.push({ id: ref.id, reason: 'Recursive effect loop requires stateful simulation' }); return; }
    const params = effect.param;
    const chance = inheritedChance * effect.chance / 100;
    const events = effect.triggerCondition.map(row => ({ event: supportedEvents[row.conditionType] || 'unsupported',
      conditionType: row.conditionType, tag: row.conditionValue }));
    let when = [...parents, ...(events.length ? [{ events, targets: targets(effect.target) }] : [])];
    const indices = ref.contextIndex?.length ? ref.contextIndex : effect.contextIndex;
    const previousQuery = scope.slice(0, scope.indexOf(ref)).reverse().find(row => [11, 12, 22, 26, 32].includes(effects[row.id]?.type));
    let context = indices.length ? indices.map(i => query(scope[i], scope)) :
      (effect.contextMultiplierDecimal || params.some(p => /CONTEXTUAL_(EXECUTE|SKIP)/.test(p))) && previousQuery ? [query(previousQuery, scope)] : [];
    const damageContext = compileDamageRecoveryContext(effect, ref, scope, effects, ability.id, kind);
    if (damageContext) context = damageContext.context || [{ kind: 'unknown', id: effect.id, type: damageContext.reason }];
    // One reviewed named kit has empty result indices but explicit damage-dealt
    // wording and a unique adjacent direct packet. Never infer this generally.
    if (!context.length && consularRecovery?.context && ref.id === consularRecovery.recoveryEffectId &&
        scope === tier.effectReference && !stack.length && !parents.length && !conditions.length)
      context = consularRecovery.context;
    if (!context.length && params.some(p => /CONTEXTUAL_(EXECUTE|SKIP)/.test(p))) context = inheritedContext;
    const duration = effect.expirationCondition.find(row => [49, 25, 32].includes(row.conditionType));
    const base = { id: effect.id, chance, conditions, targets: targets(effect.target), when, context,
      multiplier: effect.multiplierAmountDecimal / 10000, contextMultiplier: effect.contextMultiplierDecimal / 10000,
      additive: Number(effect.additiveAmountDecimal) / 10000, duration: duration ? Number(duration.conditionValue) || 1 : null,
      resistible: inheritedResistible || (!params.includes('UNRESISTABLE') && effect.applyType !== 1),
      gate: params.includes('CONTEXTUAL_EXECUTE') ? 'positive' : params.includes('CONTEXTUAL_SKIP') ? 'zero' : null,
      blockedByImmunity: [...new Set(effect.descriptiveTag.filter(tag => !tag.exclude && ['speed_recovery', 'delay', 'health_recovery'].includes(tag.tag)).map(tag => immunityStats[tag.tag]))] };
    let operation;
    const conversion = compilePoolConversion(effect, scope, effects);
    if (conversion?.fromStat && !conditions.length && !base.gate && !base.context.length) {
      when = []; base.when = [];
      operation = { ...base, kind: 'poolConversion', ...conversion };
      conversion.sourceEffectIds.forEach(id => { visited.add(id); classifyEffectTags(effects[id]); });
      if (conversion.markerId) consumedInitialMarkers.add(conversion.markerId);
      omitted.push({ id: ref.id, reason: 'Pool conversion uses before-kit-stat-buffs policy; ordering with other kit stat changes is not independently verified' });
    }
    const criticalRestriction = compileOutgoingCriticalRestriction(effect, effects);
    if (criticalRestriction?.actorCategory && !conditions.length && !base.gate && !base.context.length) {
      when = []; base.when = [];
      operation = { ...base, kind: 'criticalRestriction', ...criticalRestriction, sourceTargets: base.targets,
        targets: [{ side: 'ally', select: 1, excludeSelf: false, categories: [{ id: criticalRestriction.actorCategory, exclude: false }],
          requiredCategories: [], tags: [], requiredTags: [], alignment: [], alive: true, healthChecks: [] }] };
      criticalRestriction.sourceEffectIds.forEach(id => { visited.add(id); classifyEffectTags(effects[id]); });
    }
    const plainSelector = selector => [1, 4, 9].includes(selector.select) && !selector.tags.length && !selector.requiredTags.length && !selector.healthChecks.length;
    const markerWhen = effect.type === 9 ? parents : when;
    const initialMarker = ['unique', 'leader'].includes(kind) && !conditions.length && !base.gate && !base.context.length &&
      base.targets.every(plainSelector) && markerWhen.every(group => group.events.every(event => event.event === 'start') && group.targets.every(plainSelector));
    const stat = statMap[params.find(param => statMap[param])];
    if (operation) { /* Reviewed initial handler replaces its source children. */ }
    else if (effect.type === 1) {
      operation = { ...base, kind: 'damage', resistible: inheritedResistible, stat: params.includes('DAMAGE_HEALTH_PERCENTAGE') ? 'targetHealth' : stat ||
        (effect.damageType === 2 ? 'physDmg' : effect.damageType === 3 ? 'specDmg' : 'fixed'),
        channel: effect.damageType === 2 ? 'physical' : effect.damageType === 3 ? 'special' : 'true',
        crit: /can't critically hit unless .{0,30}Advantage/i.test(description) ? 'advantage' :
          effect.damageType === 1 || /(?:can(?:not|'t)|does not) (?:critically hit|score critical hits)(?! unless)/i.test(description) ? 'never' :
          /This attack will critically hit if able|This ability will always critically hit|This attack always critically hits/i.test(description) ? 'always' : 'normal',
        unavoidable: effect.applyType === 1, healthSteal: !params.includes('NO_HEALTH_STEAL'), noKill: params.includes('NO_KILL'),
        noModifyDamage: params.includes('NO_MODIFY_DAMAGE') || effect.descriptiveTag.some(tag => tag.tag === 'no_modify_damage' && !tag.exclude) };
    } else if (effect.type === 2 && params.includes('SPEED_FILL')) {
      operation = { ...base, kind: 'turnMeter' };
      if (Math.abs(base.multiplier) > 1 || Math.abs(base.additive) > 1)
        omitted.push({ id: ref.id, reason: 'Full Turn Meter set/reset timing requires ordered action state' });
    }
    else if (effect.type === 2 && params.includes('ABILITY_COOLDOWN')) {
      const decoded = cooldownUtility.decode(effect);
      // Some source effects lack a contextual execution flag despite their
      // localized kit sentence being conditional (L3-37 Prepared). Require an
      // explicit standalone own-use reduction sentence as independent proof.
      const describedOwnReduction = decoded.delta < 0 && new RegExp(`(?:^|[.!?]\\s+)Reduce this ability's cooldown by ${-decoded.delta}\\.`, 'm').test(description);
      const selfTarget = base.targets.length === 1 && base.targets.every(selector =>
        selector.side === 'ally' && selector.select === 4 && !selector.excludeSelf && selector.alive &&
        !selector.tags.length && !selector.requiredTags.length && !selector.categories.length &&
        !selector.requiredCategories.length && !selector.alignment.length && !selector.healthChecks.length);
      const ownPerUse = decoded.supported && kind === 'special' && !stack.length && !base.when.length && !base.context.length &&
        !base.gate && !base.duration && base.chance === 1 && !base.resistible && selfTarget &&
        describedOwnReduction && cooldownUtility.matches({ tags: abilityTags }, decoded) && decoded.delta > -cooldown;
      if (ownPerUse) operation = { ...base, kind: 'cooldown', delta: decoded.delta, mode: 'perUse', sourceAbilityId: ability.id };
      else omitted.push({ id: ref.id, reason: decoded.supported ? 'Cooldown reset, event, recipient or execution ordering needs explicit state' : decoded.reason });
    }
    else if (effect.type === 21) operation = { ...base, kind: 'state', key: effect.blackboardName };
    else if (effect.type === 10) omitted.push({ id: ref.id, reason: 'Health/Protection equalization or redistribution needs current pool state' });
    else if (effect.type === 18 && stat) {
      operation = { ...base, kind: 'shield', stat: 'protection', basisStat: stat, fromCaster: false,
        contextAsMultiplier: params.includes('CONTEXT_MAX_MULTIPLIER') };
      omitted.push({ id: ref.id, reason: 'Temporary Protection uses bounded active capacity; depletion, expiry and stacking chronology are not modeled' });
    }
    else if (effect.type === 2 && stat) operation = { ...base, kind: 'recover', stat, fromCaster: false,
      contextAsMultiplier: params.includes('CONTEXT_MAX_MULTIPLIER') };
    else if (effect.type === 7) operation = { ...base, kind: 'assist' };
    else if (effect.type === 30) omitted.push({ id: ref.id, reason: 'Forced ability needs explicit rotation/target state' });
    else if (effect.type === 8 && stat) {
      const percentAdditive = params.some(param => /PERCENT_ADDITIVE$/.test(param)) && !percentStats.has(stat);
      operation = { ...base, kind: 'stat', stat, multiplier: base.multiplier + (percentAdditive ? base.additive : 0),
        additive: percentAdditive ? 0 : base.additive * (percentStats.has(stat) ? 100 : 1),
        contextAsMultiplier: params.includes('CONTEXT_MAX_MULTIPLIER'), contextStatScale: percentStats.has(stat) ? 100 : 1,
        channel: params.some(param => /^ATTACK_CRITICAL_NEGATE|^DODGE_(NEGATE_)?PERCENT/.test(param)) ? 'physical' :
          params.some(param => /^ABILITY_CRITICAL_NEGATE|^DEFLECTION_(NEGATE_)?PERCENT/.test(param)) ? 'special' : null };
    }
    else if (effect.type === 29 && params.some(param => ['INCOMING', 'OUTGOING'].includes(param)) &&
      params.every(param => ['INCOMING', 'OUTGOING', 'UNRESISTABLE', 'CONTEXTUAL_EXECUTE', 'CONTEXTUAL_SKIP'].includes(param)) &&
      effect.effectedTag.every(tag => tag.tag === 'no_modify_damage' && tag.exclude)) {
      operation = { ...base, kind: 'stat', stat: params.includes('INCOMING') ? 'incomingDamageMultiplier' : 'outgoingDamageMultiplier' };
    }
    else if (effect.type === 3) operation = { ...base, kind: 'control', control: 'stun' };
    else if (effect.type === 4 && params.every(param => ['FORCE_DEBUFF', 'UNRESISTABLE', 'CONTEXTUAL_EXECUTE', 'CONTEXTUAL_SKIP'].includes(param)))
      operation = { ...base, kind: 'debuff', control: 'ability_block' };
    else if (effect.type === 5) {
      const scope = dispelUtility.decode(effect);
      operation = { ...base, kind: 'dispel', hostile: base.targets.some(row => row.side === 'enemy'),
        cleansedControls: scope.controls, clearsAllBuffs: scope.clearsAllBuffs };
      scope.issues.forEach(reason => omitted.push({ id: ref.id, reason }));
    }
    else if (effect.type === 13) operation = { ...base, kind: 'revive', stat: 'health',
      blockedByImmunity: [...base.blockedByImmunity, ...(effect.descriptiveTag.some(tag => !tag.exclude && tag.tag === 'revive') ? ['reviveImmunity'] : [])] };
    else if (effect.type === 16) operation = { ...base, kind: 'execute' };
    else if ((effect.type === 9 || (effect.type === 6 && effect.effectedTag.length > 0 && effect.effectedTag.every(tag => tag.tag === 'derp'))) &&
      initialMarker && effect.descriptiveTag.some(tag => !tag.exclude)) {
      operation = { ...base, kind: 'marker', when: markerWhen, tags: effect.descriptiveTag.filter(tag => !tag.exclude).map(tag => tag.tag) };
    }
    else if (effect.type === 6 && effect.id === 'uniqueability_b1battledroidv2_revive_immunity_self' &&
      kind === 'unique' && !stack.length && !base.when.length && !base.context.length && !base.gate && !base.conditions.length &&
      base.chance === 1 && !base.resistible && !base.multiplier && !base.contextMultiplier && !base.additive &&
      !effect.expirationCondition.length && params.every(param => param === 'UNRESISTABLE') &&
      effect.effectedTag.length === 1 && effect.effectedTag[0].tag === 'revive' && !effect.effectedTag[0].exclude &&
      base.targets.length === 1 && base.targets.every(selector => selector.side === 'ally' && selector.select === 4 &&
        !selector.excludeSelf && !selector.tags.length && !selector.requiredTags.length && !selector.healthChecks.length &&
        !selector.categories.length && !selector.requiredCategories.length && !selector.alignment.length) &&
      /can(?:not|'t)[^.]*be revived/i.test(description)) {
      operation = { ...base, kind: 'immunity', immunities: ['reviveImmunity'], sourceProof: "B1's pinned unique kit explicitly forbids being revived" };
    }
    else if (effect.type === 6 && effect.effectedTag.some(tag => !tag.exclude && tag.tag === 'physical_damage') &&
      !stack.length && !base.when.length && !base.context.length && !base.gate && !base.conditions.length &&
      damageImmunityUtility.decode(ability, tier, effect).supported) {
      const decoded = damageImmunityUtility.decode(ability, tier, effect);
      operation = { ...base, kind: 'damageImmunity', protectedChannels: decoded.protectedChannels,
        maximumFrequency: decoded.maximumFrequency, immunityPolicy: decoded.policy };
      decoded.issues.forEach(reason => omitted.push({ id: ref.id, reason }));
    }
    else if (effect.type === 6 && params.includes('FORCE_DEBUFF')) {
      // Daze and ability block prevent actions/assists; the exact contribution
      // is evaluated against explicit incoming-action assumptions at runtime.
      const control = /daze|abilityblock|ability_block|fear|shock|heal.*immunity|buff.*immunity|target_lock|burning/.exec(effect.id)?.[0];
      if (control) operation = { ...base, kind: 'debuff', control };
      else omitted.push({ id: ref.id, reason: 'Immunity/custom debuff requires effect-specific state' });
    } else if (effect.type === 6 && effect.effectedTag.length && effect.effectedTag.every(tag => !tag.exclude) &&
      !base.multiplier && !base.additive && !base.contextMultiplier &&
      params.every(param => ['UNRESISTABLE', 'FORCE_BUFF', 'CONTEXTUAL_EXECUTE', 'CONTEXTUAL_SKIP'].includes(param)) &&
      effect.effectedTag.some(tag => immunityStats[tag.tag])) {
      operation = { ...base, kind: 'immunity', immunities: [...new Set(effect.effectedTag.map(tag => immunityStats[tag.tag]).filter(Boolean))] };
      if (effect.effectedTag.some(tag => !immunityStats[tag.tag])) omitted.push({ id: ref.id, reason: 'Additional immunity filters are outside the supported control types' });
    } else if (![9, 11, 12, 22, 32].includes(effect.type) && !(effect.type === 26 && params.includes('RELIC_LEVEL'))) omitted.push({ id: ref.id, reason: `Unmodeled operation ${typeNames[effect.type] || effect.type}` });
    if (operation) {
      if (operation.kind === 'damage' && params.includes('NO_KILL')) omitted.push({ id: ref.id, reason: 'NO_KILL lethal floor requires current remaining Health and defeat state' });
      if (operation.kind === 'damage' && params.includes('SHIELD_PENETRATION')) omitted.push({ id: ref.id, reason: 'Outgoing Protection bypass requires separate damage-to-pool state' });
      if (params.includes('SOURCE_OVERRIDE_CREATOR')) omitted.push({ id: ref.id, reason: 'Source creator override needs explicit effect ownership state' });
      if (params.some(param => ['CONDITIONAL_FILTER', 'CONTEXTUAL_FILTER'].includes(param))) omitted.push({ id: ref.id, reason: 'Source conditional filter semantics are not equivalent to context execution gates' });
      if (operation.kind === 'stat' && !effect.triggerCondition.length && !effect.effectReference.length) {
        const tags = effect.descriptiveTag.filter(tag => !tag.exclude).map(tag => tag.tag);
        const linkedParents = effect.expirationCondition.filter(condition => [29, 51].includes(condition.conditionType)).map(condition => condition.conditionValue);
        const oncePassive = ['unique', 'leader'].includes(kind) && effect.maxBonusMoves === 1 &&
          !effect.expirationCondition.length && tags.includes(effect.stackingLineOverride) &&
          parents.every(group => group.events.every(event => event.event === 'start'));
        operation.targets = operation.targets.map(selector => {
          const linkedStat = [...selector.tags, ...selector.requiredTags].some(tag => !tag.exclude && linkedParents.includes(tag.id));
          // These exclusions prevent installing the same stat component twice.
          // The expected-stat pass evaluates it once from original stats, so
          // its own installation guard is not an independent uptime condition.
          const guard = tag => tag.exclude && ((linkedStat && tags.includes(tag.id)) || (oncePassive && tag.id === effect.stackingLineOverride));
          return { ...selector, tags: selector.tags.filter(tag => !guard(tag)), requiredTags: selector.requiredTags.filter(tag => !guard(tag)) };
        });
      }
      if (operation.targets.some(selector => selector.unsupportedSelection) || when.some(group => group.targets.some(selector => selector.unsupportedSelection))) omitted.push({ id: ref.id, reason: 'Unsupported both-side target selection' });
      else if (when.some(group => group.events.every(event => event.event === 'unsupported'))) omitted.push({ id: ref.id, reason: 'Event-dependent branch requires stateful simulation' });
      else if (conditions.some(condition => (condition.gate && !condition.context.length) || condition.context.some(row => row.kind === 'unknown'))) omitted.push({ id: ref.id, reason: 'Unsupported ancestor context query' });
      else if (base.gate && !base.context.length) omitted.push({ id: ref.id, reason: 'Contextual gate has no source query' });
      else if (missingRecoveryContext(effect, context)) omitted.push({ id: ref.id, reason: 'Recovery context has no explicit source query or damage result' });
      else if (context.some(row => row.kind === 'unknown')) omitted.push({ id: ref.id, reason: 'Unsupported context query' });
      else {
        if (when.some(group => group.events.some(event => event.event === 'unsupported'))) {
          omitted.push({ id: ref.id, reason: 'Unsupported alternatives in a partially modeled event group' });
        }
        if (when.some(group => group.events.some(event => event.event === 'crit')))
          omitted.push({ id: ref.id, reason: 'Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled' });
        const binding = [...when].reverse().find(group => group.targets.some(target => target.select !== 4));
        if (binding && base.targets.every(target => target.select === 4)) {
          operation.receiverCriteria = operation.targets;
          operation.targets = binding.targets;
          operation.receiverBound = true;
          operation.receiverGroupIndex = when.indexOf(binding);
        }
        const allyRule = targetingRules[ability.allyTargetingRuleId];
        const guardTargets = rows => rows.map(selector => {
          if (selector.side !== 'ally' || selector.select !== 2) return selector;
          if (!allyRule || ![2, 4].includes(allyRule.battleSide) || allyRule.excludeSelectedTarget ||
            allyRule.unitClass.some(unitClass => unitClass !== 6) || ![1, 2].includes(allyRule.battleDeploymentState)) {
            omitted.push({ id: ref.id, reason: 'Selected ally requires an unsupported ability targeting rule' });
            return selector;
          }
          // UI/AI preferences do not prescribe the player's choice. The
          // bounded model averages over eligible targets, preserving the
          // rule's exact exclusions/factions/effect predicates.
          return { ...selector, selectionCriteria: { ...target(allyRule), sourceTargetingRuleId: allyRule.id, select: 1 } };
        });
        operation.targets = guardTargets(operation.targets);
        operation.context = operation.context.map(query => conditional.guardQueryTargets(query, guardTargets));
        operation.conditions = conditions.map(condition => ({ ...condition, context: condition.context.map(query => conditional.guardQueryTargets(query, guardTargets)) }));
        operation.when = operation.when.map(group => ({ ...group, targets: guardTargets(group.targets) }));
        if ((operation.kind === 'control' || (operation.kind === 'debuff' && operation.control === 'ability_block')) &&
          operation.targets.some(selector => selector.side === 'ally')) {
          omitted.push({ id: ref.id, reason: 'Own-side control requires explicit action restriction state' });
        }
        // A normal ability can restore Health to an eligible defeated ally.
        // Evaluate that explicit pool coefficient under the existing defeat
        // assumption, without letting the living caster revive itself. Keep
        // the exact original selector for audit. Ordered follow-up actions,
        // death passives and default (zero-coefficient) revives still need a
        // separate stateful handler and must remain coverage gaps.
        if (operation.kind === 'revive') {
          const simpleRecovery = ['basic', 'special'].includes(kind) && !operation.when.length &&
            !operation.context.length && operation.multiplier > 0 && !operation.additive &&
            operation.targets.every(selector => selector.side === 'ally' && !selector.alive &&
              [1, 2, 3].includes(selector.select) && !selector.healthChecks.length);
          const deathRecovery = ['unique', 'leader'].includes(kind) && !operation.receiverCriteria &&
            !operation.context.length && operation.multiplier > 0 && !operation.additive &&
            operation.when.some(group => group.events.some(event => event.event === 'death')) &&
            operation.when.every(group => (group.events.every(event => event.event === 'start') || group.events.every(event => event.event === 'death')) &&
              group.targets.every(selector => selector.side === 'ally' && selector.select === 4 && !selector.healthChecks.length)) &&
            operation.targets.every(selector => selector.side === 'ally' && !selector.alive && selector.select === 4 && !selector.healthChecks.length);
          if (simpleRecovery || deathRecovery) {
            operation.revivalHealthRecovery = true;
            operation.revivalUsesDeathEvent = deathRecovery;
            operation.sourceTargets = operation.targets;
            operation.targets = operation.targets.map(selector => ({ ...selector, alive: true, excludeSelf: simpleRecovery || selector.excludeSelf,
              ...(selector.selectionCriteria ? { selectionCriteria: { ...selector.selectionCriteria, alive: true } } : {}) }));
            omitted.push({ id: ref.id, reason: 'Revival follow-up actions and ordered death state are not modeled' });
          } else omitted.push({ id: ref.id, reason: 'Revival requires death state or default pool semantics' });
        }
        if (params.includes('DELTA_CONTEXT_VALUE')) omitted.push({ id: ref.id, reason: 'Context delta requires ordered prior-value state; absolute context is approximate' });
        const probabilisticPredicate = condition => condition.gate && condition.context.some(q =>
          q.targets?.some(selector => selector.tags.length || selector.requiredTags.length || selector.healthChecks.length) ||
          q.gateContext?.some(nested => nested.targets?.some(selector => selector.tags.length || selector.requiredTags.length || selector.healthChecks.length)));
        if (probabilisticPredicate(operation) || operation.conditions.some(probabilisticPredicate))
          omitted.push({ id: ref.id, reason: 'Contextual predicate requires joint state probability; expected-count gate is approximate' });
        operations.push(operation);
        if (operation.kind === 'immunity' && initialMarker && effect.descriptiveTag.some(tag => !tag.exclude)) {
          operations.push({ ...base, kind: 'marker', when: markerWhen,
            tags: effect.descriptiveTag.filter(tag => !tag.exclude).map(tag => tag.tag) });
        }
      }
    }
    const children = ['poolConversion', 'criticalRestriction'].includes(operation?.kind) ? [] : effect.effectReference;
    const hostileApplication = [3, 4, 6, 9].includes(effect.type) && effect.target.some(row => [3, 5].includes(row.battleSide)) && base.resistible;
    children.forEach(child => visit(child, children, when, chance, [...stack, ref.id], inheritedResistible || hostileApplication, conditional.appendCondition(conditions, base), context.length ? context : inheritedContext));
  }
  const refs = tier.effectReference || ability.effectReference;
  refs.forEach(ref => visit(ref, refs, [], 1, []));
  // Explicit earlier DAMAGE references provide returned values per use of this
  // ability. Require unique direct source operations; event/bonus-basic result
  // ownership needs a separate ordered model and remains a visible omission.
  const invalidDamageRecovery = [];
  operations.forEach((operation, index) => {
    const links = operation.context.filter(q => q.kind === 'damageResult');
    if (!links.length) return;
    const sources = links.map(link => operations.filter((candidate, sourceIndex) => sourceIndex < index && candidate.kind === 'damage' && candidate.id === link.effectId));
    if (operation.kind !== 'recover' || operation.when.length || operation.conditions.length ||
        sources.some(matches => matches.length !== 1 || matches[0].when.length || matches[0].conditions.length)) {
      omitted.push({ id: operation.id, reason: 'Damage-result recovery has ambiguous or event-dependent source ownership' });
      invalidDamageRecovery.push(operation); return;
    }
    sources.forEach(matches => { matches[0].damageResultKey = `${ability.id}:${matches[0].id}`; });
  });
  invalidDamageRecovery.forEach(operation => operations.splice(operations.indexOf(operation), 1));
  if (kind === 'basic') {
    operations.filter(op => op.kind === 'dispel').forEach(op => omitted.push({ id: op.id, reason: 'Basic dispel effect state on bonus attacks and counters is not modeled' }));
    operations.filter(op => (['damage', 'turnMeter'].includes(op.kind) && op.when.length) || op.kind === 'assist')
      .forEach(op => omitted.push({ id: op.id, reason: 'Basic follow-up event/TM propagation on bonus attacks or counters is not modeled' }));
  }
  // Multiple reductions cannot be treated as a commutative total once any
  // ordering clamps to zero. Keep such sequences out of the rotation model.
  const cooldownChanges = operations.filter(op => op.kind === 'cooldown');
  if (cooldown + cooldownChanges.reduce((sum, op) => sum + op.delta, 0) <= 0) {
    cooldownChanges.forEach(op => omitted.push({ id: op.id, reason: 'Combined own-use cooldown changes require ordered remaining cooldown state' }));
    cooldownChanges.forEach(op => operations.splice(operations.indexOf(op), 1));
  }
  return { id: ability.id, name: plain(loc[ability.nameKey]), kind, cooldown, tags: abilityTags, level: index + 2, description,
    maxDescription: plain(loc[ability.tier[maxIndex]?.descKey] || description), omicronExcluded: index !== maxIndex,
    operations, omitted, visitedEffects: visited.size,
    producedStateTags: [...new Set([...visited].flatMap(id => effects[id].descriptiveTag
      .filter(tag => !tag.exclude).map(tag => tag.tag)))].sort() };
}
const roster = {};
for (const unit of unitsFile.data.filter(unit => unit.obtainable && unit.combatType === 1)) {
  if (roster[unit.baseId]?.rarity >= unit.rarity) continue;
  const compiled = unit.skillReference.map(ref => {
    const skill = skills[ref.skillId], ability = abilities[skill?.abilityReference];
    return ability && compileAbility(ability, skill);
  }).filter(Boolean);
  const seenAbilities = new Set(compiled.map(ability => ability.id));
  for (const ref of [...unit.limitBreakRef, ...unit.uniqueAbilityRef]) {
    if (!seenAbilities.has(ref.abilityId) && abilities[ref.abilityId]) {
      const extra = compileAbility(abilities[ref.abilityId]);
      if (!extra.name || extra.name === 'Placeholder') continue;
      extra.requiresUnlock = true;
      compiled.push(extra);
      seenAbilities.add(ref.abilityId);
    }
  }
  roster[unit.baseId] = { id: unit.baseId, name: plain(loc[unit.nameKey]), rarity: unit.rarity,
    role: unit.categoryId.find(id => id.startsWith('role_'))?.slice(5), alignment: unit.forceAlignment, categories: unit.categoryId,
    recommendedTeams: unit.exampleSquad.map(squad => squad.unitDefId).filter(team => team.length > 1), abilities: compiled };
  // The SPEED_FILL blackboard expression uses internal speed units. The kit
  // text explicitly specifies 10% per stack; retain this translation for audit.
  if (unit.baseId === 'DARKTROOPER') {
    compiled.flatMap(ability => ability.operations).filter(op => op.id === 'specialability_darktrooper02_recover_speed_u07')
      .forEach(op => { op.contextMultiplier = 0.1; op.unitTranslation = '10% TM per Dark Trooper Squad stack, from localized kit'; });
    roster[unit.baseId].basePoolMultiplier = 0.25;
  }
}
const characters = Object.fromEntries(Object.entries(roster).sort(([a], [b]) => a.localeCompare(b)));
classifyLinkedStatTags();
const stateTagClasses = Object.fromEntries([...tagClasses].filter(([, classes]) => classes.size === 1).map(([tag, classes]) => [tag, [...classes][0]]));
const sourceStateTags = [...new Set(Object.values(effects).flatMap(effect => effect.descriptiveTag.filter(tag => !tag.exclude).map(tag => tag.tag)))].sort();
const hash = crypto.createHash('sha256').update(JSON.stringify({ characters, stateTagClasses, sourceStateTags })).digest('hex').slice(0, 16);
const metadata = { schemaVersion: 1, revision: hash, gameVersion: unitsFile.version, source, stateTagClasses, sourceStateTags,
  damageImmunityHelperHash: crypto.createHash('sha256').update(fs.readFileSync('src/domain/damageImmunityUtility.js')).digest('hex'),
  assumptions: { abilityLevels: 'Max non-Omicron tier; unlock-dependent extra abilities disabled by default', rotation: 'Cooldown-weighted expected actions; no ability AI/turn simulation',
    conditionalState: 'Conditions and omissions retained for audit; explicit model assumptions determine event rates' } };
fs.mkdirSync('reports', { recursive: true });
fs.writeFileSync('reports/characterKitAnalysis.json', JSON.stringify({ ...metadata, characters }, null, 2));
const runtime = Object.fromEntries(Object.entries(characters).map(([id, kit]) => [id, { ...kit, rarity: undefined,
  abilities: kit.abilities.map(ability => ({ ...ability, description: undefined, maxDescription: undefined,
    omitted: undefined, omittedCount: ability.omitted.length,
    omissionReasons: ability.omitted.reduce((counts, row) => { counts[row.reason] = (counts[row.reason] || 0) + 1; return counts; }, {}),
    visitedEffects: undefined })) }]));
fs.writeFileSync('src/constants/generatedCharacterKits.json', JSON.stringify({ ...metadata, characters: runtime }));
let markdown = `# Character kit analysis\n\nSource: [pinned game-data snapshot](${source.url})\n\nGame version: ${unitsFile.version}; compiled revision: ${hash}.\n\nEvery obtainable character and every referenced ability is traversed. Numeric coefficients come from effects, not usage data. Unsupported branches are listed in the JSON report rather than assigned invented values.\n\n`;
markdown += '| Character | Abilities | Effect nodes read | Compiled operations | Omitted branches |\n|---|---:|---:|---:|---:|\n';
for (const kit of Object.values(characters)) markdown += `| ${kit.name} (${kit.id}) | ${kit.abilities.length} | ${kit.abilities.reduce((sum, a) => sum + a.visitedEffects, 0)} | ${kit.abilities.reduce((sum, a) => sum + a.operations.length, 0)} | ${kit.abilities.reduce((sum, a) => sum + a.omitted.length, 0)} |\n`;
fs.writeFileSync('reports/characterKitAnalysis.md', markdown);
console.log(`Read ${Object.keys(characters).length} character kits, ${Object.values(characters).reduce((sum, kit) => sum + kit.abilities.length, 0)} abilities; revision ${hash}.`);
