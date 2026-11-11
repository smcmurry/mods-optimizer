/* Source cooldown arithmetic and explicitly bounded expected rotations. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CooldownUtility = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  const scalar = x => Number(x || 0) / 10000;
  const allowed = new Set(['ABILITY_COOLDOWN', 'RECOVER_ABILITIES_TAG', 'UNRESISTABLE', 'CONTEXTUAL_EXECUTE', 'CONTEXTUAL_SKIP']);
  function decode(effect) {
    if (effect.type !== 2 || !effect.param.includes('ABILITY_COOLDOWN')) return { supported: false, reason: 'Not a turn-based RECOVER cooldown effect' };
    const extra = effect.param.filter(p => !allowed.has(p));
    if (extra.length) return { supported: false, reason: `Unsupported cooldown parameters: ${extra.join(', ')}` };
    if (scalar(effect.multiplierAmountDecimal) !== 0 || scalar(effect.contextMultiplierDecimal) !== 0) return { supported: false, reason: 'Multiplicative or contextual cooldown amount requires ordered cooldown state' };
    const delta = scalar(effect.additiveAmountDecimal);
    if (!Number.isFinite(delta)) return { supported: false, reason: 'Invalid cooldown amount' };
    const tags = (effect.effectedTag || []).map(t => ({ id: t.tag, exclude: Boolean(t.exclude) }));
    if (effect.param.includes('RECOVER_ABILITIES_TAG') && !tags.length) return { supported: false, reason: 'Tagged cooldown effect has no ability selector' };
    if (!effect.param.includes('RECOVER_ABILITIES_TAG') && tags.length) return { supported: false, reason: 'Ability tags without RECOVER_ABILITIES_TAG have unverified semantics' };
    return { supported: true, kind: 'cooldown', delta, abilityTags: tags,
      allAbilities: !effect.param.includes('RECOVER_ABILITIES_TAG'), unresistable: effect.param.includes('UNRESISTABLE'),
      requiresContext: effect.param.some(p => p === 'CONTEXTUAL_EXECUTE' || p === 'CONTEXTUAL_SKIP') };
  }
  function matches(ability, operation) {
    if (operation.allAbilities) return true;
    // No ID/name fallback: source misspellings are deliberate exact tag IDs.
    const tags = new Set(ability.tags || []);
    const included = operation.abilityTags.filter(t => !t.exclude);
    const excluded = operation.abilityTags.filter(t => t.exclude);
    return (!included.length || included.some(t => tags.has(t.id))) && !excluded.some(t => tags.has(t.id));
  }
  function applyRemaining(remaining, delta) {
    if (!Number.isFinite(remaining) || remaining < 0 || !Number.isFinite(delta)) throw new Error('Cooldown state and delta must be finite; state cannot be negative');
    return Math.max(0, remaining + delta);
  }
  function expectedRotation(abilities, changes = [], options = {}) {
    const cap = options.specialShareCap === undefined ? 0.85 : options.specialShareCap;
    if (!(cap >= 0 && cap <= 1)) throw new Error('Invalid special share cap');
    const issues = abilities.filter(a => a.kind === 'special' && a.requiresUnlock)
      .map(a => ({ abilityId: a.id, reason: 'Unlock/ultimate ability requires separate horizon rotation policy' }));
    const specials = abilities.filter(a => a.kind === 'special' && !a.requiresUnlock);
    const weights = specials.map(ability => {
      let cooldown = Math.max(0, Number(ability.cooldown || 0)), clock = 1;
      for (const change of changes) {
        if (!matches(ability, change)) continue;
        if (!Number.isFinite(change.delta)) throw new Error('Invalid cooldown delta');
        if (change.mode === 'perUse') {
          // Caller must prove this effect fires once after THIS ability is used.
          if (change.sourceAbilityId !== ability.id || change.delta <= -cooldown) {
            issues.push({ abilityId: ability.id, reason: 'Reset or unproven post-use cooldown ordering' }); continue;
          }
          cooldown = applyRemaining(cooldown, change.delta);
        } else if (change.mode === 'perTurn') {
          if (!(change.rate >= 0) || !Number.isFinite(change.rate)) throw new Error('Invalid cooldown event rate');
          if (change.delta <= -Math.max(1, ability.cooldown)) {
            issues.push({ abilityId: ability.id, reason: 'Reset requires remaining-cooldown distribution and event order' }); continue;
          }
          clock -= change.delta * change.rate;
        } else issues.push({ abilityId: ability.id, reason: 'One-shot, contextual or unordered cooldown change' });
      }
      // Waiting time is cooldown / net countdown rate; one activation turn is
      // retained. The two-turn floor preserves the current model's policy.
      const weight = clock > 0 ? 1 / Math.max(2, 1 + cooldown / clock) : 0;
      return [ability.id, weight];
    });
    const sum = weights.reduce((total, row) => total + row[1], 0);
    const scale = sum > cap ? cap / sum : 1;
    const frequencies = Object.fromEntries(weights.map(([id, weight]) => [id, weight * scale]));
    const basic = abilities.find(a => a.kind === 'basic');
    if (basic) frequencies[basic.id] = 1 - Math.min(cap, sum);
    return { frequencies, issues, approximation: 'Expected countdown rate with existing special-share and two-turn policy; no battle sequence simulation' };
  }
  return { decode, matches, applyRemaining, expectedRotation };
}));
