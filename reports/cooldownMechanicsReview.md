# Source-checked cooldown utility

Reviewed against pinned game-data cache commit `8d86d7002e8cab5839f04540d93ac303db078517`. This implements arithmetic and an explicit expected-rotation approximation; it does not establish full character coverage.

## Verified source semantics

Ordinary turn cooldown changes are `RECOVER` (type 2) with `ABILITY_COOLDOWN`. The `MODIFY_COOLDOWN` enum (37) appears only once in this source, in a Krayt raid `SPEED_BASED` modifier, which this handler rejects. There are 759 raw `ABILITY_COOLDOWN` rows across the entire game source, including ships, raids, events and datacrons. These counts must not be described as 759 character mechanics.

The signed flat amount is `additiveAmountDecimal / 10000`: negative reduces remaining cooldown and positive increases it. `RECOVER_ABILITIES_TAG` matches the source ability's `descriptiveTag`, not its name or a guessed ability ID. Positive tags use union membership; explicit negative tags veto. Exact source misspellings remain exact strings.

| Source effect | Amount | Independent source check |
| --- | ---: | --- |
| `specialability_commanderahsoka01_shien_cooldown_reduction` | -1 | Shien description explicitly reduces Force Leap by one when its owner evades or attacks out of turn. Target is Commander Ahsoka and affected ability tag is `specialability_commanderahsoka02`. |
| `specialability_commanderahsoka02_cooldown_reduction` | -4 | Force Leap description says reduce this ability's cooldown by four. Source base and highest-tier cooldown both equal eight. |
| `specialability_hondo02_delay_cooldown_enemies_all_1turn_CE` | +1 | Exact source `character_special` selector and positive amount; source execution is contextual and unresistable. Target marker eligibility must still be resolved by the caller. |
| `specialability_jedimasterkenobi02_recover_cooldown_full` | -99 | Highest-tier description says reset target other Galactic Republic ally's cooldowns, excluding granted abilities. A large decrement clamps remaining cooldown to zero; it is not a recurring 99-turn clock gain. |

The decoder currently accepts 546 source rows for flat arithmetic; 154 multiplicative/contextual amounts, 55 tag filters lacking `RECOVER_ABILITIES_TAG`, three unsupported conditional/contextual parameter rows and one tagged row with no tag remain rejected. Accepted decoding is not proof of event or target coverage.

## API and integration requirements

`src/domain/cooldownUtility.js` is standalone UMD (`require(...)` in Node, `CooldownUtility` browser/worker global). The source test is `node scripts/testCooldownUtility.mjs`; it passes in both Node and a worker-like VM context.

1. Preserve `ability.tags = ability.descriptiveTag.filter(tag => !tag.exclude).map(tag => tag.tag)` when compiling named abilities; do not synthesize tags from IDs. Copy these through preprocessing.
2. Recognize type-2 `ABILITY_COOLDOWN` before Health/Protection recovery, preserving exact selectors, event ancestry, contexts, chance and the decoder's `delta`, `abilityTags` and `allAbilities` fields. Unsupported decoder reasons remain omissions.
3. `decode(rawEffect)` handles source amount/filter arithmetic only. `requiresContext` is a warning to the caller to use existing context/event gates; it is not permission to apply context effects unconditionally.
4. `matches(ability, op)` handles ability filters. Resolve unit recipients independently through source selectors. Cooldown changes are their own phase, not healing or a generic percentage damage buff.
5. A proven once-after-use effect targeting its own ability can be represented as `{ ...op, mode: 'perUse', sourceAbilityId }`. This requires the ability's own unconditional operation with no alternate event/context ancestry. Force Leap's eight-turn base minus four yields four waiting turns, so the existing model's frequency changes from `1/9` to `1/5`.
6. An independently resolved recurring effect can be passed as `{ ...op, mode: 'perTurn', rate }`, with rate expressed per recipient turn. For cross-character effects, event frequency per unit time must be divided by recipient turn rate. Do not pass application probability as event rate, count parent events twice, or treat permanent marker installation as a recurring action.
7. `expectedRotation(abilities, changes)` uses net countdown clock `r = 1 - sum(rate * signedDelta)` and frequency `1 / max(2, 1 + cooldown / r)` for positive `r`; nonpositive clocks produce zero special frequency. It preserves the existing total special cap 0.85 and gives remaining turns to the basic. The two-turn floor and share cap are current model assumptions, not game rules.
8. If recurring event rates depend on the resulting special rotation, solve that dependence with bounded iteration and report nonconvergence. Do not claim a single old-rotation pass fully resolves the coupled rates. Ultimate/unlock abilities deliberately stay outside this helper and must retain the current horizon policy.
9. Add the helper to worker synchronization and import it before `characterMechanics.js`; include it in engine fingerprints. Update the independent raw reference rather than having it call the compiled interpreter.

## Ordered semantics and remaining gaps

`applyRemaining(remaining, delta)` exactly applies a signed decrement/increment to a nonnegative remaining cooldown. Reset then increase produces a different result from increase then reset: `5 -> 0 -> 2` versus `5 -> 7 -> 0`. Tests explicitly prove this distinction.

The expected-rotation helper refuses reset-sized reductions and unproven post-use ordering, returning `issues` while retaining the unadjusted frequency for that change. Multiplicative effects, full resets, one-shot initial cooldowns, locked/granted abilities, enemy cooldown immunity, conditional ability availability, event ordering, and remaining-cooldown distributions require additional state or explicit assumptions. Enemy `enemySpecialShare` alone does not specify cooldown distribution or the damage of enemy specials versus basics, so Hondo's enemy cooldown increases cannot defensibly become a flat damage-reduction bonus. Until enemy ability schedules are represented, retain this gap.

CAT's first Force Leap execute, subsequent special damage, starting cooldown, stacking Shien damage, and out-of-turn event schedule remain distinct mechanics. Checking the four-turn arithmetic does not make CAT's complete kit high confidence.

## Integrated safe subset

The compiler and both interpreters now apply the proven own-use subset. Only CAT's direct top-level four-turn Force Leap reduction passes: exact own-ability tags, unconditional source selector, chance one, no event/context/gate/ancestor, no resistance and a standalone source sentence independently specifying the reduction. The raw cooldown remains eight; preprocessing adds `effectiveCooldown: 4`, and the raw reference independently derives four from the accepted operation. Prepared default rotation and public rotation both produce Force Leap frequency `1/5`.

L3-37's raw cooldown operation has no execution gate even though its highest-tier kit sentence explicitly conditions it on other allies being Prepared. It is deliberately rejected through the independent sentence proof. Ki-Adi-Mundi's stance-change +99 cooldown set is also rejected. No generic recurring cooldown rates, full resets or initial cooldowns are currently integrated. Helper `expectedRotation` is a tested available approximation, not an automatically active battle mechanic.

`scripts/testCooldownUtility.mjs` now checks the real compiled/prepared CAT operation, exact frequency in both interpreters, and rejection of L3 and Ki-Adi-Mundi. All 341-character preprocessing/reference/scalar/worker-freshness comparisons passed after synchronization. Scoring version was advanced to `combat-utility-v5-kits-11`; both local runner and report analyzer fingerprint lists include the helper. Runtime worker imports do not need the helper because proven constant own-use changes are resolved into the prepared program.
