# Material-efficiency ranking buttons

These modes are buttons inside Recommended Slices, not separate navigation tabs.
They share its set, primary, shape, recommendation, and reverse-order controls.
The dot control is disabled because each material mode defines its own stage.
The leveling checkbox includes lower-level mods with four revealed secondaries
and consistent roll data. Their forecasts include prerequisite leveling gains,
including in next-slice scope. Leveling credits are not included in material cost.

5-dot gain / Mk 1 includes level-15 5E–5B mods and measures gain through 6A.
6-dot gain / Mk 2 includes level-15 5A and 6E–6B mods and measures gain through 6A.
Both require four revealed secondaries and consistent roll data. Completed 6A
mods are excluded from candidates but included in the inventory baseline.

Player-supplied next-slice costs:

| Current tier | Material | Next slice cost | Remaining stage cost |
|---|---|---:|---:|
| 5E | Mk 1 | 100 | 1150 |
| 5D | Mk 1 | 200 | 1050 |
| 5C | Mk 1 | 350 | 850 |
| 5B | Mk 1 | 500 | 500 |
| 5A | Mk 2 | 110 | 175 |
| 6E | Mk 2 | 0 | 65 |
| 6D | Mk 2 | 10 | 65 |
| 6C | Mk 2 | 20 | 55 |
| 6B | Mk 2 | 35 | 35 |

The default numerator is expected top-300 gain at 6A for both material groups.
The denominator is only the remaining cost of the selected material: Mk 1 through
5A, or Mk 2 through 6A. The Mk 1 ranking assumes the later 175 Mk 2 investment will
be funded separately; it is a material-allocation ranking, not total-cost efficiency.
Next slice only remains an alternative using immediate gain and that slice's cost.
The 5A promotion is deterministic, scales existing stats, adds Speed's single +1,
and adds no secondary roll.

Expected positive top-300 total gain averages 1,024 fixed-seed simulations against
the greater of current mod score and the current 300th score. If fewer than 300
scored mods exist, the cutoff is zero. Dividing total gain by 300 gives its effect
on a 300-slot average including empty slots. Baseline ignores screen filters.
Simulation assumptions match target-chance forecasts: equal eligible stat
probabilities, uniform continuous non-Speed ranges, integer Speed rolls 3–6,
and five-roll caps. Estimates are independent, not additive portfolio guarantees.

Rank by expected total gain divided by material cost. In next-slice scope, free
upgrades with positive gain rank ahead of paid ones; free zero-gain upgrades
receive no special priority. No infinity is displayed. Zero-gain rows remain
visible, and current scores above a target are not filtered out.

Only supplied Mk 1/Mk 2 costs are charged. Credits, other resources, calibration,
and leveling are not priced. Run `node scripts/testMaterialSlices.mjs` and the
RecommendedSlices screen tests for validation.
