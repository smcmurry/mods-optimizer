import assert from 'node:assert/strict';
import fs from 'node:fs';
import { compileDamageRecoveryContext, missingRecoveryContext, damagePerAbilityUse } from './lib/damageRecoverySource.mjs';
const effects = Object.fromEntries(JSON.parse(fs.readFileSync('data/gameData-cache/effect.json', 'utf8')).data.map(effect => [effect.id, effect]));
const abilities = Object.fromEntries(JSON.parse(fs.readFileSync('data/gameData-cache/ability.json', 'utf8')).data.map(ability => [ability.id, ability]));
const ability = abilities.specialability_darthmalak02;
const scope = ability.tier.at(-1).effectReference;
const reference = scope.find(ref => ref.id === 'recover_health_context_self_INSTANT');
assert.deepEqual(reference.contextIndex, [0, 1, 2], 'Pinned Malak explicitly consumes all three earlier damage branch results');
const compiled = compileDamageRecoveryContext(effects[reference.id], reference, scope, effects, ability.id, 'special');
assert.deepEqual(compiled.context.map(query => query.effectId), [
  'specialability_darthmalak02_max_health_damage_u06',
  'specialability_darthmalak02_max_health_damage_health_resistant_u06',
  'specialability_darthmalak02_max_health_damage_raid_boss_u06'
]);
assert.equal(effects[reference.id].contextMultiplierDecimal, 10000, 'Malak recovers exactly 100% of the linked damage result');
assert.ok(compiled.context.every(query => query.abilityId === ability.id));
assert.equal(damagePerAbilityUse(100000 * 2 * 0.25, 2, 0.25), 100000);
assert.equal(damagePerAbilityUse(100000 * 0.7 * 0.5 * 2 * 0.25, 2, 0.25), 35000, 'Landed damage chance and incoming damage modifier are included once');
assert.equal(damagePerAbilityUse(0, 2, 0), 0);
assert.ok(compileDamageRecoveryContext(effects[reference.id], reference, scope, effects, ability.id, 'basic').reason,
  'Bonus-basic damage result provenance is not silently inferred from regular basic results');
assert.ok(compileDamageRecoveryContext(effects[reference.id], { ...reference, contextIndex: [4] }, [...scope, reference], effects, ability.id, 'special') == null,
  'Stat-result references remain the ordinary query path');
const consularRecovery = effects.specialability_jediknightconsular02_recover_health03;
assert.ok(missingRecoveryContext(consularRecovery, []), 'Consular implicit prior-damage result must be exposed as missing context until independently implemented');
assert.ok(!missingRecoveryContext(effects.generic_recover_health_self_30pct, []));
console.log('Pinned Malak damage-result provenance, per-use normalization, and missing recovery context checks passed.');
