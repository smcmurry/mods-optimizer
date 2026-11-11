/* Source-tag classification only; current effect instances/order stay gaps. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DispelUtility = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  const controlTags = { paralysis_debuff: 'stun', stifle_debuff: 'abilityBlock', daze_debuff: 'daze' };
  const supportedParams = new Set(['UNRESISTABLE', 'DISPELL_ALL', 'CONTEXTUAL_EXECUTE', 'CONTEXTUAL_SKIP']);
  function decode(effect) {
    const issues = [];
    const tags = (effect.effectedTag || []).filter(t => !t.exclude).map(t => t.tag);
    const filters = (effect.effectedTag || []).filter(t => t.exclude);
    const unlimited = effect.param.includes('DISPELL_ALL') || Number(effect.additiveAmountDecimal) / 10000 >= 99;
    const simple = effect.type === 5 && unlimited && !Number(effect.multiplierAmountDecimal) &&
      !Number(effect.contextMultiplierDecimal) && effect.param.every(p => supportedParams.has(p)) && !filters.length;
    const controls = [];
    if (!simple) issues.push('Dispel filter/count/source semantics require active effect instance state');
    if (simple) {
      if (tags.includes('clearable_debuff')) controls.push('stun', 'abilityBlock', 'daze');
      tags.forEach(tag => { if (controlTags[tag]) controls.push(controlTags[tag]); });
    }
    if (tags.some(tag => /fear|special_(paralysis|stifle|daze)/.test(tag)))
      issues.push('Fear or special control removal lacks checked undispellable-effect bypass semantics');
    const clearsAllBuffs = simple && tags.includes('clearable_buff');
    const recognized = new Set(['clearable_buff', 'clearable_debuff', ...Object.keys(controlTags)]);
    if (tags.some(tag => !recognized.has(tag))) issues.push('Dispel of non-control buffs or custom markers requires explicit active effect state');
    if (controls.length) issues.push('Cleanse uses assumed ordinary clearable control variants; ordered removal and undispellable variants are not modeled');
    if (clearsAllBuffs) issues.push('Enemy clearable buff removal uses bounded buff-share proxy; individual buff lifetime and dispellability state are not modeled');
    return { controls: [...new Set(controls)], clearsAllBuffs, issues };
  }
  function coverage(rates, rate) {
    const denominator = Math.max(0.01, Number(rate) || 0);
    return Object.fromEntries(['stun', 'fear', 'daze', 'abilityBlock'].map(type => [type,
      Math.max(0, Math.min(1, (Number(rates[type]) || 0) / denominator))]));
  }
  return { decode, coverage };
}));
