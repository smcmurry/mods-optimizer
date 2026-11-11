# Next source-checked immunity subset

This began as a read-only proposal during replay testing. The narrow incoming-damage subset below is now integrated; broader source filters remain gaps.

## Narrow direct Damage Immunity

`specialability_droideka02` has base and highest-tier cooldown3. Its highest-tier text independently says Droideka gains Damage Immunity for two turns, and its direct effect-reference list contains `generic_damage_immunity_self_2turn` with no context indexes. The source effect has chance100, applyType1, zero amounts, no context/trigger/child effects, UNRESISTABLE, one living self target and the exact generic damage-tag filter set.

Lifetime enum49 is `FULL_TURN_COMPLETE`; the value is2. The other expiry enums on this effect are21 `DEATH` and24 `END_OF_ENCOUNTER`. They are not generic dispel conditions. Hostile dispels/refresh and action chronology still require state.

The checked effect filters explicitly include physical_damage, special_damage, unmitigable_damage, a_plague, effect_damage, bonds_of_weakness_damage and massive_damage. The proposed initial subset represents ordinary physical/special damage only. Other named damage families, true and percent-Health damage, reflection, no-modify flags, bypass effects and destroy effects remain explicit omissions until their precedence and source classification are checked. NO_MODIFY_DAMAGE is not automatically interpreted as an immunity bypass or as proof that immunity should apply.

`src/domain/damageImmunityUtility.js` checks this exact raw-source shape without guessing from names. It rejects context-driven, event-driven, probabilistic, alternate recipient, unlock/blocked ability, excluded/partial filter and non-finite-coverage shapes. `scripts/testDamageImmunityUtility.mjs` independently verifies the pinned ability, source description, exact duration enums and numeric expectations. Tests pass.

## Expected-value integration proposal

For this direct self interval the receiver and caster turn rates are identical. The current model's special frequency is `1/(3+1)=0.25`; two recipient turns per application therefore give expected active coverage0.5. Ordinary incoming physical/special damage is multiplied by0.5. With unchanged pools, baseline effective health100000 becomes200000 before the existing denominator floor.

The compiler emits a distinct `damageImmunity` operation and preserves duration, channels and policy, rather than setting a permanent `incomingDamageMultiplier=0`. Its initial integration adjusts only the model's ordinary incoming physical/special mixture in EHP. It does not suppress the protected ally's own basic DPS. Outgoing damage targeting protected opponents still needs source-matched opponent immunity and other filter semantics, which are not certified by this subset.

The helper rejects any direct interval whose maximum rotation frequency times lifetime reaches one. This keeps its proposed initial subset finite without inventing an arbitrary uptime probability or confidence-promoting epsilon. The existing engine's0.01 denominator floor is still an explicit bounded-model policy for extreme mitigation combinations; it may prevent an exact2x EHP ratio there. Fully continuous immunity needs a separate horizon/survival policy rather than a new permanent finite-stat assertion.

Expiry, enemy cleansing, overlap, incoming attack timing, interruption and action order remain an explicit model approximation/gap even for accepted direct intervals. This work does not make Droideka's entire kit high confidence.

The same exact source-shape guard admits Beskar Armor Mandalorian's direct one-turn self immunity at frequency0.2. Other recipients, predicates, locked abilities and full-uptime intervals remain rejected. The helper's SHA256 is recorded as `damageImmunityHelperHash` in source/prepared metadata and checked against the current helper; local engine fingerprints include it. The checked test runner includes the source/integrated test.

Integrated source tests isolate Droideka's actual direct immunity operation and an actual nonzero basic attack. Compared with the disabled immunity operation, ordinary incoming EHP doubles while DPS stays unchanged. The same expectation passes all-physical, all-special and50% Protection bypass cases. Protection bypass changes pool routing, not immunity coverage. Warm/scalar results agree with detail results, and edits to Speed and model horizon retain the source two-turn coverage. All341 raw/prepared/scalar/cache/freshness checks passed after synchronization.

## Remaining immunity backlog findings

The largest IMMUNITY groups are still `derp` marker filters, not protection from damage or control. For example,878 omitted occurrences with UNRESISTABLE+derp span242 characters;410 contextual-execute+derp occurrences span109. They require marker installation, lifetime and conditional state handling, not a blanket immunity bonus.

Other useful future exact-filter subsets include `revive` immunity (B1's permanent self flag and defeat-target flags), and FORCE_DEBUFF immunity against `speed_recovery` (Pinned/Undermined prevent bonus Turn Meter). Existing generic control-name inference does not cover these filters. Revive immunity should suppress only matching revive Health restoration; it must not suppress ordinary healing or invent extra damage against a generic opponent with no modeled revive schedule. Bonus-TM blocking on enemy recipients needs the explicit enemy bonus-TM assumption and source uptime, not a generic stun-like loss of all enemy actions.
