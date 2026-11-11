/* Narrow source proof for direct, finite, self Damage Immunity intervals. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DamageImmunityUtility = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  const damageTags = ['physical_damage', 'special_damage', 'unmitigable_damage', 'a_plague', 'effect_damage', 'bonds_of_weakness_damage', 'massive_damage'];
  function decode(ability, tier, effect) {
    const fail = reason => ({ supported: false, reason });
    if (!ability.id.startsWith('specialability_') || ability.requiresUnlock || ability.triggerCondition.length || ability.blockingEffectId || tier.blockingEffectId)
      return fail('Only ordinary direct unblocked special abilities have a checked finite rotation');
    const refs = tier.effectReference || ability.effectReference || [];
    const ref = refs.find(ref => ref.id === effect.id);
    if (!ref || refs.filter(ref => ref.id === effect.id).length !== 1 || ref.contextIndex.length) return fail('Damage Immunity is not an unconditional single direct ability reference');
    if (effect.type !== 6 || effect.chance !== 100 || effect.applyType !== 1 ||
      effect.param.some(param => param !== 'UNRESISTABLE') || effect.contextIndex.length || effect.triggerCondition.length || effect.effectReference.length ||
      Number(effect.multiplierAmountDecimal) || Number(effect.contextMultiplierDecimal) || Number(effect.additiveAmountDecimal))
      return fail('Conditional, event-driven, probabilistic or amount-bearing immunity requires separate state');
    const tags = effect.effectedTag;
    if (tags.length !== damageTags.length || tags.some(tag => tag.exclude || !damageTags.includes(tag.tag)) || new Set(tags.map(tag => tag.tag)).size !== damageTags.length)
      return fail('Damage Immunity filter does not exactly match the checked generic damage tag set');
    const targets = effect.target;
    if (targets.length !== 1) return fail('Only one direct self recipient is checked');
    const target = targets[0];
    if (target.battleSide !== 2 || target.unitSelect !== 4 || target.healthState !== 2 || target.excludeSelf || target.excludeSelectedTarget ||
      target.category || target.requiredCategory || target.unitClass.length || target.forceAlignment.length || target.statValue.length ||
      target.activeEffectTagCriteria.length || target.requiredActiveEffectTagCriteria.length)
      return fail('Damage Immunity recipient depends on targeting or effect state');
    const lifetime = effect.expirationCondition.filter(condition => condition.conditionType === 49);
    if (lifetime.length !== 1 || effect.expirationCondition.some(condition => ![21, 24, 49].includes(condition.conditionType)))
      return fail('Damage Immunity lifetime has unmodeled expiry conditions');
    const durationTurns = Number(lifetime[0].conditionValue);
    const cooldown = tier.cooldownMaxOverride || ability.cooldown || 0;
    const maximumFrequency = 1 / Math.max(2, cooldown + 1);
    if (!Number.isInteger(durationTurns) || durationTurns <= 0 || durationTurns * maximumFrequency >= 1)
      return fail('Full-uptime immunity has no finite EHP scaling in the current rate model');
    return { supported: true, kind: 'damageImmunity', durationTurns, cooldown, maximumFrequency,
      protectedChannels: ['physical', 'special'],
      unresolvedDamageTags: damageTags.filter(tag => !['physical_damage', 'special_damage'].includes(tag)),
      policy: 'Expected self-turn immunity coverage below one; ordinary Physical/Special damage only',
      issues: ['Damage Immunity expiry, hostile dispels and action order use expected lifetime rather than battle simulation',
        'True, percent-Health, massive, reflected and no-modify/bypass damage need exact source filter precedence'] };
  }
  function coverage(decoded, frequency) {
    if (!decoded.supported || !Number.isFinite(frequency) || frequency < 0 || frequency > decoded.maximumFrequency + 1e-12)
      throw new Error('Immunity coverage requires the checked direct cooldown rotation');
    return frequency * decoded.durationTurns;
  }
  function ordinaryBlock(decoded, frequency, damage) {
    if (!decoded.protectedChannels.includes(damage.channel) || damage.noModifyDamage ||
      !['physDmg', 'specDmg'].includes(damage.stat)) return { covered: false, reason: 'Damage filter or bypass precedence is outside the checked ordinary-damage subset' };
    return { covered: true, fraction: coverage(decoded, frequency) };
  }
  return { decode, coverage, ordinaryBlock };
}));
