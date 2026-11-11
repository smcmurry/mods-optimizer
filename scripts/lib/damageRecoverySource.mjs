// A damage result is a value returned by a particular earlier source reference,
// not a stat query or a proxy based on the recovering unit's Health.
export function compileDamageRecoveryContext(effect, reference, scope, effects, abilityId, abilityKind) {
  const indices = reference.contextIndex?.length ? reference.contextIndex : effect.contextIndex || [];
  if (effect.type !== 2 || !effect.param.some(param => ['HEALTH', 'SHIELD'].includes(param)) || !effect.contextMultiplierDecimal ||
      effect.param.includes('CONTEXT_MAX_MULTIPLIER')) return null;
  if (!indices.length) return null;
  if (!indices.some(index => effects[scope[index]?.id]?.type === 1)) return null;
  const cursor = scope.indexOf(reference);
  if (abilityKind !== 'special' || indices.some(index => !Number.isInteger(index) || index < 0 || index >= cursor || effects[scope[index]?.id]?.type !== 1))
    return { reason: 'Damage-result recovery requires earlier direct damage references in one active special ability' };
  return { context: indices.map(index => ({ kind: 'damageResult', abilityId, effectId: scope[index].id, sourceReferenceIndex: index, targets: [] })) };
}

export function missingRecoveryContext(effect, context) {
  return effect.type === 2 && effect.param.some(param => ['HEALTH', 'SHIELD'].includes(param)) &&
    effect.contextMultiplierDecimal !== 0 && !context.length;
}

// Normalize an already landed expected damage rate to a value per ability use.
// The caller owns hit/crit/defense/chance/recipient selection. Recovery then
// multiplies this result by its own ability-use rate once, avoiding chance².
export function damagePerAbilityUse(landedDamageRate, casterRate, rotationShare) {
  const uses = casterRate * rotationShare;
  return uses > 0 ? Math.max(0, landedDamageRate) / uses : 0;
}
