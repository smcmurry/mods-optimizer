# Optimizer performance regression

The previous kit update repeatedly evaluated the unmodded normalization for every candidate, recalculated identical stat vectors, and evaluated candidates again for audit details. Each of four kit phases also traversed/matched operations belonging to other phases.

The worker now caches normalization, scalar scores and recent full results per model and baseline, reset between characters. The mechanics engine indexes operations by kind, interns equivalent target selectors, caches rotation preparation, reuses recipient/context queries within safe phases, and computes each member's basic damage once per scenario after final stats/rates are resolved. Candidate enumeration, refinement depth, constraints, native bonuses, and the utility formula are unchanged.

## Measured fixture

Windows/Node local worker benchmark, using three matchups, four actual example-squad allies with fixed synthetic stat snapshots, and 192 synthetic six-dot mods covering all eight sets, six slots, alternate primaries and secondary variations. This is a reproducible workload, not the user's imported roster. Timings are illustrative single-run wall-clock measurements and vary with machine load. The original measurement overlapped some development checks; operation counts are deterministic.

| Character | Previous elapsed | Updated elapsed | Previous mechanics evaluations | Updated mechanics evaluations |
|---|---:|---:|---:|---:|
| Pirate King Hondo | 239.8 s | 11.2 s | 38,676 | 6,498 |
| R2-D2 | — | 2.2 s | — | 5,145 |
| Hermit Yoda | — | 6.9 s | — | 6,240 |

Hondo's search evaluates the same 6,292 candidate visits. Assigned mod IDs, final score (`184.23141686072785`), loadout (`3-4`), and top ten candidates/scores exactly match the original benchmark. R2 and Hermit Yoda retain their recommended mods and scores through the optimization stages. No comparison against their original runtime is claimed.

## Verification

- Cache-enabled and cache-bypassed calculations produce identical serialized scenario results for all 341 characters, game example teams, three opponents, and two combinations of stats/conditional states (2,046 scenario comparisons).
- Worker checks verify a second mod combination with identical stats needs no new evaluation while both candidate identities remain in the audit.
- Changes to model assumptions, baseline stats, or character boundaries cannot reuse an inappropriate result.
- Character mechanics, combat math/application/migration/report, historical compatibility, and production build checks run independently.

Run `npm run optimizer:benchmark`. Optional environment variables: `BENCH_CHARACTERS` (comma-separated IDs), `BENCH_OUTPUT` (JSON output path), and `OPTIMIZER_WORKER` (worker source path for comparison). `npm run optimizer:performance-test` runs correctness checks without a hardware-dependent speed threshold.

## Preprocessed programs and numeric search evaluation

The fixed kit work now lives in `src/constants/generatedCombatPrograms.json`: operation phases, default rotations, stat mappings, and deduplicated target selectors with character eligibility bitsets. The startup/build synchronization checks source and compiler hashes and regenerates the file offline when necessary. No fresh game-data download is required.

Each chosen team's fixed recipients, event relationships, count queries, and active operation branches are prepared once per model/scenario. Candidate stat values, resistance, damage, healing, sharing, and turn rates still need calculation at runtime. Search and marginal calculations use a numeric-only evaluation; full diagnostics are produced on demand for the audit and export. Editing the model invalidates its prepared relationships.

Using the same fixture above, measured immediately before this preprocessing change versus the final implementation:

| Character | Cached interpreter before preprocessing | Preprocessed numeric evaluation |
|---|---:|---:|
| Pirate King Hondo | 10.152 s | 2.944 s |
| R2-D2 | 2.068 s | 1.381 s |
| Hermit Yoda | 6.001 s | 3.026 s |

Assigned mod IDs, final scores, loadout IDs, top ten candidates/scores, and search visit counts exactly match for all three characters. These single-run timings illustrate the improvement on this synthetic workload; they do not predict runtime for every imported roster.

`npm run optimizer:preprocessing-test` independently compares every character's prepared engine against the previous raw-kit interpreter, including solo and game example teams, three opponents, cold and warm numeric scores, full diagnostic output, and in-place model edits. It also verifies deterministic generation, artifact freshness, and worker synchronization. The cache correctness, character mechanics, combat utility, meta architecture checks, and production build pass.

## Further prepared metadata

The prepared model now caches critical-capable packet membership and initial damage-result keys, avoiding two complete kit scans per candidate evaluation. Bonus-basic Health Steal skips its recovery calculation when the attacker has no post-buff Health Steal; direct basic recovery remains active. All 341 raw/prepared comparisons and changed-model cache checks pass. These changes preserve search depth and exact scoring. A fresh local replay provides current workload timings; historical benchmark timings above precede the newer mechanics and cannot establish their performance.

Fixed stat-channel expansion also moved into preprocessing, and scalar evaluation skips zero-uptime stat work. An identical 36,000-evaluation sampled workload fell from 21.25 to 13.80 seconds with an unchanged accumulated utility checksum. See [the reproducible scoring benchmark](preparedScoringPerformance.md); these scoring timings are separate from the ally-code search.
