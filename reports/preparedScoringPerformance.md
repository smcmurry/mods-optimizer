# Prepared scoring microbenchmark

Run `node scripts/benchmarkPreparedScoring.mjs` from the repository root. Add `--profile` to save a Chrome-compatible CPU profile in the OS temporary directory. `--iterations 3000` is the default. Avoid concurrent optimization and compare the same Node version, workload, source revision, and profiling mode.

This benchmark evaluates the production prepared interpreter for R2-D2, Hermit Yoda, Third Sister, and Ben Solo. It uses each kit's first recommended team, three matchup scenarios, and fixed teammate stats. It warms each scenario with a detailed evaluation, then evaluates 3,000 changing candidate stat vectors per character per scenario: 36,000 scalar evaluations total. Health, Speed, and Physical Damage vary at runtime. The output includes the workload identifier, Node version, revision, teammate IDs, scenario counts, elapsed time, and accumulated utility checksum.

It measures scoring cost. It does **not** import ally 297546974, use saved target settings, search for mod sets, or check whole-kit confidence. Use the local optimizer replay for actual search performance and the independent source/parity tests for correctness. Source confidence gaps remain unchanged.

On 2026-10-04, Windows / Node v24.13.0, kit revision `f7dedda42ffa403c`, identical 100-microsecond CPU-sampled workloads measured:

| Character | Before (ms) | After (ms) |
| --- | ---: | ---: |
| R2-D2 | 1,579 | 1,356 |
| Hermit Yoda | 10,127 | 6,259 |
| Third Sister | 5,988 | 3,772 |
| Ben Solo | 3,530 | 2,390 |
| Whole sampled interval | 21,251 | 13,803 |

Both runs produced accumulated utility `287860107138722780`. The measured interval fell about 35%; these are individual sampled runs, not a statistical performance guarantee. Future mechanic changes can legitimately change the checksum and workload cost.

The saved script's default, unprofiled 36,000-evaluation smoke run completed in 12,062 ms with the same checksum (R2-D2 1,269 ms; Hermit Yoda 5,538 ms; Third Sister 3,276 ms; Ben Solo 1,980 ms). This lower absolute time reflects a different profiling mode and must not be compared directly to the sampled baseline.

The baseline profile attributed about 28% of sampled self time to the stat callback/key loop, 9% to effect dispatch, 8% to event weighting, and 3% to preparation including model/target signatures. The change precomputes source-fixed channel-expanded stat keys and skips zero-uptime stat work only during scalar scoring. Candidate-dependent stat values, context queries, target gates, and uptime remain runtime calculations. Detailed evaluations retain their zero-valued audit keys and warnings. All 341 raw/prepared/full/scalar parity and cache checks passed, including changed stats and model invalidation.
