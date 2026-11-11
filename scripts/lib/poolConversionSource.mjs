const reviewed = new Set(['leaderability_darthnihilus_health_handler', 'uniqueability_darthmalak02_health_handler']);
const self = effect => effect?.target.length === 1 && effect.target.every(target => target.battleSide === 2 && target.unitSelect === 4 &&
  !target.activeEffectTagCriteria.length && !target.requiredActiveEffectTagCriteria.length && !target.statValue.length &&
  !target.excludeSelf && !target.category && !target.requiredCategory);
export function compilePoolConversion(effect, scope, effects) {
  if (!reviewed.has(effect.id)) return null;
  const refs = effect.effectReference;
  const [query, addition, removal] = refs.map(ref => effects[ref.id]);
  const basic = effect.type === 9 && effect.param.every(param => param === 'UNRESISTABLE') && refs.length === 3 &&
    query?.type === 12 && query.param.join(',') === 'MAX_SHIELD' &&
    addition?.type === 8 && addition.param.includes('MAX_HEALTH') && addition.multiplierAmountDecimal === 0 && addition.contextMultiplierDecimal === 10000 && Number(addition.additiveAmountDecimal) === 0 &&
    removal?.type === 8 && removal.param.includes('MAX_SHIELD') && removal.multiplierAmountDecimal <= -10000 && removal.contextMultiplierDecimal === 0 && Number(removal.additiveAmountDecimal) <= 0 &&
    [query, addition, removal].every(child => self(child) && !child.triggerCondition.length && !child.effectReference.length && !child.contextIndex.length) &&
    effect.triggerCondition.length === 1;
  if (!basic) return { reason: 'Reviewed pool conversion source shape changed' };
  const event = effect.triggerCondition[0];
  let markerId;
  if (event.conditionType === 50) {
    const marker = scope.map(ref => effects[ref.id]).find(candidate => candidate?.descriptiveTag.some(tag => !tag.exclude && tag.tag === event.conditionValue));
    if (!marker || marker.type !== 6 || marker.maxBonusMoves !== 1 || marker.triggerCondition.length || marker.contextIndex.length ||
        !marker.effectedTag.every(tag => !tag.exclude && tag.tag === 'derp')) return { reason: 'Initial conversion marker is not independently installed once' };
    markerId = marker.id;
  } else if (event.conditionType !== 7 || !self(effect)) return { reason: 'Pool conversion has unsupported installation timing' };
  return { fromStat: 'protection', toStat: 'health', contextOwner: 'affected-recipient',
    sourceEffectIds: refs.map(ref => ref.id), markerId, policy: 'before-kit-stat-buffs' };
}
export function convertedPools(stats) {
  const protection = Number.isFinite(stats.protection) ? Math.max(0, stats.protection) : 0;
  return { ...stats, health: Math.max(0, stats.health) + protection, protection: 0 };
}
