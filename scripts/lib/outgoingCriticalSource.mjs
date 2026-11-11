// Reviewed defender interceptor: before receiving an effect from a Sith, each
// opposing defender receives both critical-negate sentinels; they expire after
// that same effect. This is attack-specific, not general defender avoidance.
export function compileOutgoingCriticalRestriction(effect, effects) {
  if (effect.id !== 'leaderability_darthnihilus_crit_avoidance_handler') return null;
  const event = effect.triggerCondition;
  const refs = effect.effectReference;
  const target = effect.target;
  const children = refs.map(ref => effects[ref.id]);
  const physical = 'ATTACK_CRITICAL_NEGATE_PERCENT_ADDITIVE';
  const special = 'ABILITY_CRITICAL_NEGATE_PERCENT_ADDITIVE';
  const supported = effect.type === 9 && effect.chance === 100 && effect.param.every(param => param === 'UNRESISTABLE') &&
    event.length === 1 && event[0].conditionType === 39 && event[0].conditionValue === 'profession_sith' &&
    target.length === 1 && target[0].battleSide === 3 && target[0].unitSelect === 1 && !target[0].category && !target[0].requiredCategory &&
    !target[0].forceAlignment.length && !target[0].statValue.length && !target[0].requiredActiveEffectTagCriteria.length &&
    target[0].activeEffectTagCriteria.every(tag => tag.exclude && tag.tag === effect.id) &&
    children.length === 2 && children.every(child => child?.type === 8 && child.chance === 100 && child.multiplierAmountDecimal === 0 && child.contextMultiplierDecimal === 0 &&
      Number(child.additiveAmountDecimal) >= 100000000 && child.param.every(param => [physical, special, 'UNRESISTABLE'].includes(param)) &&
      child.target.length === 1 && child.target[0].battleSide === 2 && child.target[0].unitSelect === 4 &&
      !child.target[0].activeEffectTagCriteria.length && !child.target[0].requiredActiveEffectTagCriteria.length &&
      !child.triggerCondition.length && !child.contextIndex.length && !child.effectReference.length &&
      child.expirationCondition.length === 1 && child.expirationCondition[0].conditionType === 41) &&
    children.some(child => child.param.includes(physical)) && children.some(child => child.param.includes(special));
  if (!supported) return { reason: 'Reviewed outgoing critical interceptor source shape changed' };
  return { actorCategory: 'profession_sith', recipientSide: 'enemy', channels: ['physical', 'special'],
    beforeEvent: 39, afterEvent: 41, sourceEffectIds: refs.map(ref => ref.id),
    affectsDefenderGeneralCritAvoidance: false, excludedActorCategories: [] };
}

export function sourceBlocksCritical(descriptor, categories, channel, recipientSide) {
  return descriptor && !descriptor.reason && descriptor.recipientSide === recipientSide && descriptor.channels.includes(channel) &&
    categories.includes(descriptor.actorCategory) && !descriptor.excludedActorCategories.some(category => categories.includes(category));
}
