// Deliberately named/ability-local proof. Empty contextIndex alone does not
// prove "previous damage" for arbitrary effects. Pinned localization supplies
// the missing semantics, and a single adjacent direct DAMAGE supplies identity.
export function proveConsularRecovery(ability, effects, localization) {
  if (ability.id !== 'specialability_jediknightconsular02') return null;
  const tier = ability.tier.at(-1), refs = tier.effectReference;
  const expected = ['specialability_jediknightconsular02_suppression_penetration_u01',
    'specialability_jediknightconsular02_damage_u03', 'specialability_jediknightconsular02_recover_health03'];
  const fail = reason => ({ reason });
  if (refs.length !== 3 || refs.some((ref, index) => ref.id !== expected[index] || ref.contextIndex.length))
    return fail('Reviewed Consular ordered reference graph changed');
  const damage = effects[refs[1].id], recover = effects[refs[2].id], penetration = effects[refs[0].id];
  const direct = effect => effect && !effect.effectReference.length && !effect.triggerCondition.length && !effect.contextIndex.length;
  const target = (effect, side, selection) => effect.target.length === 1 && effect.target[0].battleSide === side &&
    effect.target[0].unitSelect === selection && !effect.target[0].category && !effect.target[0].requiredCategory &&
    !effect.target[0].statValue.length && !effect.target[0].unitClass.length && !effect.target[0].forceAlignment.length &&
    !effect.target[0].activeEffectTagCriteria.length && !effect.target[0].requiredActiveEffectTagCriteria.length &&
    !effect.target[0].excludeSelf && !effect.target[0].excludeSelectedTarget;
  if (!direct(damage) || damage.type !== 1 || damage.chance !== 100 || damage.param.length !== 1 || damage.param[0] !== 'ABILITY_POWER' ||
      damage.contextMultiplierDecimal !== 0 || !target(damage, 3, 2)) return fail('Consular preceding damage is not one direct selected-enemy Special packet');
  if (!direct(recover) || recover.type !== 2 || recover.chance !== 100 || recover.param.length !== 1 || recover.param[0] !== 'HEALTH' ||
      recover.contextMultiplierDecimal !== 3000 || recover.multiplierAmountDecimal !== 0 || Number(recover.additiveAmountDecimal) !== 0 ||
      !target(recover, 2, 4)) return fail('Consular recovery is not a direct 30% context-based self Health heal');
  if (!direct(penetration) || penetration.type !== 8 || !penetration.param.includes('SUPPRESSION_PENETRATION_PERCENT_ADDITIVE'))
    return fail('Consular earlier reference is not the reviewed penetration modifier');
  const text = localization[tier.descKey];
  if (typeof text !== 'string' || !text.includes('recover Health equal to 30% of the damage dealt'))
    return fail('Localized source does not prove damage-dealt recovery basis');
  return { abilityId: ability.id, recoveryEffectId: recover.id, fraction: recover.contextMultiplierDecimal / 10000,
    context: [{ kind: 'damageResult', abilityId: ability.id, effectId: damage.id, sourceReferenceIndex: 1, targets: [] }],
    proof: { descriptionKey: tier.descKey, directDamageCount: 1, recoveryReferenceIndex: 2, explicitContextIndices: false },
    limitations: ['Narrow named source/localization proof, not a general implicit-context rule',
      'Per-attack probabilistic penetration and ordering remain separate mechanics'] };
}
