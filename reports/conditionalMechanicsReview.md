# Conditional source predicates

Pinned source: `8d86d7002e8cab5839f04540d93ac303db078517`, game version `0.40.6:Oq-TxiewST69Ow5E1gLW3g`.

`src/domain/conditionalUtility.js` implements exact battle-type predicates and ancestor contextual gate retention. `node scripts/testConditionalUtility.mjs` checks all 29 pinned `QUERY_BATTLE_TYPE` records, actual 3v3 and 5v5 source tokens, Grand Arena/Galactic Challenge alternatives, excluded modes, Territory Battle variants, exact marquee event IDs, browser UMD loading and unresolved context. These are source predicate checks, not full character kit certifications.

The source uses `effect.effectedTag` to identify mode, for example `TERRITORY_TOURNAMENT_BATTLE:3`; ability and effect names are not the authority. Multiple positive tags are alternatives, while matching exclusions veto. A known different battle type gives zero even when its irrelevant qualifier is absent. A matching type with an undeclared required qualifier stays unresolved. Mode queries are global scalar values, never multiplied by roster size or aggregated through unit selectors.

The compiler currently discards ancestor `CONTEXTUAL_EXECUTE`/`CONTEXTUAL_SKIP` gates while recursing through `effectReference`. For example the pinned `leader_stormtrooperluke_ability_block_handler_CE` is a contextual handler whose unconditional child is `leader_stormtrooperluke_ability_block`. Its child must inherit the handler's condition. Supporting only the leaf's context can incorrectly activate this effect. This applies to stat/count/counter queries as well as mode predicates.

## Implemented integration

The compiler, preprocessor, prepared engine and independent raw interpreter now retain ancestor conditions and conditional query dependencies. The helper is synchronized into workers and included in the local engine fingerprint. All 341 characters matched the raw reference exactly across solo and team inputs, three scenarios, cold and warm scalar evaluation and full diagnostics after regeneration at revision `ab938f9472458d5b` (11,642 operations and 3,183 selectors). Later work may change this revision. Unknown mode predicates disable their dependent operation and retain a source-ID warning, including `CONTEXTUAL_SKIP` paths. The model validation and user-facing mode selection are integration work owned by the main task.

`compileSourceQuery` resolves dependencies from the exact reference-level context indices or the preceding query in the source scope. A query with an unsupported operation-result dependency remains unknown. The pinned Fives sacrifice Health query has `contextIndex: [2]` pointing at a DISPEL operation; its result is explicitly unsupported rather than treated as a count or unconditional stat read.

The numeric tests below are source predicate checks. General gates on probabilistic tag counts retain the explicit omission `Contextual predicate requires joint state probability; expected-count gate is approximate`, because checking an expected count greater than zero is not the probability that the branch executes.

Follow-up integration at revision `481235cd2476c753` recursively applies ability targeting-rule guards throughout nested `gateContext` queries and ancestor condition trees. The emitted artifact has two nested selected-ally queries; both receive source targeting criteria. Kleya's unsupported ability targeting rule remains an explicit source gap. The helper now validates battle type against the ten exact unique prefixes in the 29 pinned source definitions; an arbitrary unknown type is rejected instead of making every predicate false. Tests check that the exported list exactly matches the pinned source, a nonsense mode throws, and selected-ally exclusions reach three nested query levels without mutating their source objects. All 341 raw/prepared comparison checks passed after this change.

The integration design used for the changes follows:

1. Import the CommonJS module in the source compiler through `createRequire`; compile type 32 through `compileBattleQuery(effect)`. Retain its criteria without unit targets. Exclude type 32 from unmodeled-operation warnings only after context evaluation is integrated. A query with its own contextual gate depends on preceding source queries; keep that dependency explicit or unresolved rather than dropping it.
2. Extend `visit` with an inherited condition array. Store it on every leaf operation as `conditions`. Before visiting children call `appendCondition(conditions, base)`. Each condition retains its exact source ID, gate and query array. The leaf's own gate remains separate so it is evaluated once. Do not omit a descendant's unknown ancestor query silently: add an explicit source omission and skip that branch.
3. Preprocess conditions' context queries with the same stat-key and selector interning as the leaf's context. Guard selected-ally selectors in condition queries as in ordinary context queries. Do not treat a condition with dynamic stat or blackboard input as a constant-count cache entry.
4. Normalize an optional explicit `battleContext` containing `type`, optional `squadSize`, and optional `eventId`. Its absence remains unresolved. Team size does not establish battle mode; roster composition does not distinguish Grand Arena, Arena, Territory War, events or other modes. Report the declared context in diagnostics/exports and preserve it in cache keys and snapshots.
5. In `contextValue`, a `battleType` query contributes `battleQueryValue(query, battleContext)` once. If it returns null, warn with source query ID and mark the result unresolved. Do not coerce null to zero: that would enable `CONTEXTUAL_SKIP`. Reject the whole gated operation when its context is unresolved, while retaining the confidence warning.
6. Before every operation path, evaluate all `conditions` through `conditionsValue(conditions, predicate => contextValue(predicate, caster))`. A false ancestor disables its descendants; unresolved ancestors warn and disable them conservatively. This must include `operationWeight`, basic damage on assists/counters, basic Turn Meter propagation and manually evaluated recovery follow-ups. A helper used by all those paths reduces inconsistent behavior.
7. Load the UMD helper before character mechanics in workers and the local VM, sync its worker copy and include its bytes in local engine fingerprints. Update the independent raw reference interpreter with equivalent source predicates; then regenerate, verify source numerical oracles and run raw/prepared/candidate-cache parity.

## Boundaries

Ancestor event recipient binding and ancestor target eligibility are separate from contextual queries. Their filters need preservation too, especially when a contextual handler selects a particular receiver. Do not claim general ordered condition execution merely because its mode predicate is known. Unsupported query-level operation results, ordered blackboard writes, mixed unsupported event groups, missing battle mode, missing event identity, ability unlocks and Omicron availability remain explicit gaps until their own source semantics are supported. This module does not infer missing game state or award high confidence.

`conditionsValue` has three results: true, false, or null. Known false dominates an unknown ancestor, because the full conjunction cannot execute. A true result requires every ancestor known true.

## Source and display units

Percentage stats in roster snapshots use percentage points: 80 Potency means
80%, while the source's stat query returns the fraction 0.8. Queries now
convert percentage points to source fractions before applying coefficients.
Conversely, a contextual percentage-stat gain converts its source fraction
back to percentage points. `CONTEXT_MAX_MULTIPLIER` on such a stat uses a
100-point unit basis; Health, Protection and damage stats retain their own
numeric pool basis. Physical and special query channels remain separate.
Absent native query stats are reported as unresolved rather than silently
appearing checked.

`scripts/testContextUnits.mjs` independently checks Boba's 50%-of-Potency
Health bonus, Sidious and Aphra Health scaling, Raddus's 12-point Potency gain,
B1's half-point avoidance per stack and Vel's sharing between allies with
different critical stats. At 80% Potency, Boba's bonus is 40% Health, not
40 times Health. These checks verify units and coefficients, not every
character's event or state coverage.
