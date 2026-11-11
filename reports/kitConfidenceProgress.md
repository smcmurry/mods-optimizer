# Checked kit coverage progress

The agreed goal is complete, checked coverage within the current bounded expected-utility model. Battle-outcome validation is outside that goal. **The all-character high-confidence goal has not been reached: all 330 selected targets still report low confidence.**

The pinned source contains 341 characters and 1,564 named abilities. Current revision `ed0a0fe3ce10e81e` has 11,551 prepared operations and 3,172 selectors. Scoring version is `combat-utility-v5-kits-15`. The [source backlog](kitCoverageBacklog.md) retains 1,247 gap groups and exact source examples across every character. Counts describe source branches, not gameplay fidelity.

## Completed source-checked subsets

- Recipient-based percentage recovery, caster-specific recovery, assist/counter basic recovery and source-filtered Health Steal.
- Correct percentage stat query units: 80 Potency becomes source 0.8; Boba's 50%-of-Potency Health bonus becomes 40%, not 40 times Health. Physical/Special query channels remain distinct.
- Malak explicit landed-damage recovery and Consular's named single-packet 30% damage-dealt healing. Generic implicit result ownership remains unresolved.
- Nihilus/Malak recipient-owned one-time Protection conversion and Nihilus's Sith critical prohibition, including guaranteed critical hits and Vulnerable. Initialization and general critical-event packet ordering remain gaps.
- Source-filtered ordinary cleansing and bounded temporary Protection capacity; neither creates imaginary bonus attacks or healing.
- Finite direct Damage Immunity for Droideka/Beskar Mando under the declared rotation; B1's exact permanent revive immunity suppresses matching revive recovery without suppressing ordinary healing.
- Explicit battle mode/size/event context, ancestor query gates, targeted ability guards, cooldown arithmetic and the source-proven CAT own-use reduction.
- Existing relic conversion, Galactic Legend pool/reduction, exact damage coefficients, stat sharing, source selectors, direct bonus-basic TM and channel penetration checks remain active.

Run `npm run kits:checked-test` for independent source expectations and production regressions. All named checks and the production build pass, including all 341 raw/prepared/full/scalar comparisons, edited-model cache invalidation, worker conversion, saved plans and compact export behavior. Final local reports share the current revision, scoring version and engine fingerprint. Parity is not independent whole-kit semantic certification.

## Saved ally-code feedback loop

Ally **297546974** uses a frozen public fixture with 333 characters and 1,997 mods, plus the actual saved 330-character order/settings. Public data can omit unequipped inventory. Player inputs/results are ignored by Git. See [local commands](../docs/local-optimizer.md).

- Four-character searches reproduced identical assignments, stats, scores and gaps in 30.9 and 31.7 seconds, with 24 unique assigned mods.
- The latest five-character search (Hondo, R2, Hermit Yoda, Reva, Ben) took 43.1 seconds; its results and a current-engine rescore of the preceding allocation are in `reports/local-optimizer/297546974/focus-source-reviewed.md`.
- Full equipped-roster coverage took 13.0 seconds. It counts 18,048 unresolved scenario occurrences before compaction. Frequent unresolved queries still concern defeated units, previous targets and absolute stat/blackboard filters.
- The historical full 330-character allocation took about 20 minutes under an older engine; it is not a current-engine validation. Focused searches plus full coverage remain the short feedback loop.

Current provisional sets: Hondo three Defense; R2 Offense + Health; Hermit Yoda Speed + Defense; Reva three Defense; Ben Health + two Defense. These reflect the current model and selected inventory, not certified character recommendations. Hondo still has 682 omitted active-team branches. No popularity preference or set bonus was added to force these allocations.

## Performance and export

Prepared model metadata now reuses packet membership and initial damage-result keys. Fixed channel stat expansion runs offline; scalar scoring skips zero-uptime stat work. An identical 36,000-evaluation sampled workload fell from 21.25 to 13.80 seconds (about 35%) with an unchanged checksum. This is a scoring microbenchmark, not a prediction for the ally-code search. [Reproduce and profile it](preparedScoringPerformance.md) with `npm run optimizer:scoring-benchmark`.

The synthetic 341-character export check shrinks an estimated 480.5 MB full representation to about 3.53 MB in 47 ms, retaining stats, values, loadout scores and important policies. Actual exports depend on their contents. The downloaded report remains compact and prepared off the main thread.

## Remaining work

Event and initialization order, bounded stack acquisition/consumption, per-ability critical packets, recurring/reset cooldown schedules, summon actors, unsupported native stats and Mastery conversions remain major gaps. Each in-model mechanic needs source proof and an independent expectation; a scope exclusion needs a checked explanation. A higher omission count can expose previously silent problems and must not be hidden to improve a label.

[Mastery/native review](nativeMasteryReview.md) records exact scalar effects and missing equipped inputs/conversion coefficients. The additional pinned-table download did not complete; source metadata remains unchanged. No equal-stat or role-name mapping was guessed. [Consular](consularRecoverySourceReview.md), [Damage Immunity](nextImmunityHandlers.md), and [B1 revive immunity](reviveImmunityReview.md) reviews describe the limits of the newly implemented subsets.
