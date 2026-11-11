# Individual next-slice scouting

The green 5-dot scouting / Mk 1 and 6-dot scouting / Mk 2 buttons replace the
previous mixed-material Adaptive investment mode. There are no budget conversion
inputs and no batch optimization or stop/continue policy search.

Mk 1 candidates are 5E–5B. Mk 2 candidates are 5A promotion and 6E–6B. Each group
has its own benchmark B: the highest current expected 6A score among eligible
candidates in that group. Completed 6A mods are not candidates. Set, primary, and
shape display filters do not alter B. The leveling option changes eligibility and
therefore can change B. Mod-dot and fixed-GG recommendation controls are disabled
in scouting mode; the buttons choose the material group explicitly.

For every candidate, evaluate the updated expected 6A score after the next slice:

`priority = E[max(updated expected 6A score − B, 0)] / next-slice material cost`

The current leader's own next-slice upside is included. Poor outcomes earn no
improvement credit but incur the same material cost. This measures the value of
discovering a better candidate, not direct top-300 gain. A mod can be a good
finishing investment while having zero scouting opportunity.

Example at B=56: equally likely outcomes 52, 53, 54, 64 give an expected improvement
of 2. Dividing by 100 Mk 1 yields .020. Outcomes 54, 55, 57, 58 give .75; dividing
by 200 yields .00375. The cheaper high-upside candidate ranks first. Having more
identical candidates gives more opportunities without multiplying any individual's
score. Refresh after each actual slice to rerank against the new benchmark.

For level-15 mods, all eligible stat targets are enumerated. Speed rolls 3–6 are
discrete and equally likely. Other magnitudes are uniform; their expected 6A
scores are linear over the roll interval, allowing exact positive-part integration
under this model. Future expectations respect the five-roll cap. These are model
assumptions, not measured game roll distributions.

For included lower-level mods with four revealed secondaries, prerequisite rolls
are sampled over 64 fixed-seed paths before integrating the next slice. Their gains
are included; leveling credits are not charged. The result is approximate only for
this prerequisite sampling. No unrevealed secondary is guessed.

Free 6E slices with positive opportunity rank first and display Free opportunity.
Free slices with zero opportunity receive no bonus. Deterministic 5A promotion
normally leaves the expected 6A score unchanged, so it has zero scouting value.
Zero-opportunity rows remain visible; no fallback silently changes the objective.

Outcome distributions are cached independently of B. A roster update recomputes
the benchmark. Cancellable calculation batches keep screen controls responsive.
Tests: `node scripts/testScoutingPriority.mjs` and RecommendedSlices screen tests.
