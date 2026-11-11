# GG-style scoring

The mod detail shows a separate GG-style score, and Explore can sort by it.
Character cards show the average of six equipped slots, counting empty slots as zero.
The existing star rating and optimizer objectives are unchanged.

Weights and final primary-fit multipliers are transcribed from the tables supplied
on 2026-10-28 in `src/constants/ggScoreCalibration.js`. No square root is applied
again. These are rounded published values, not the original full-precision data.

The implementation assumes a perfect mod has four distinct secondaries, twelve
rolls, and a maximum of five per secondary: allocate 5/5/1/1 to the four highest
weights allowed by its primary. This interpretation needs verification against
real GG examples; the description alone does not supply an exact equation.
Divide weighted max-roll equivalents by that ideal and multiply by primary fit.
The primary itself contributes no points.

Five- and six-dot ranges use the user's supplied table from 2026-10-28 in
`statRoll.js`. Six-dot score maxima come directly from that table. Non-speed
slicing multiplies all existing rolls by `sixDotMax / fiveDotMax`, preserving
their fraction of the maximum. This is proportional scaling, not interpolation
between rounded minimum/maximum endpoints; it avoids inventing a roll-quality
change from their slight rounding differences. The optimizer worker uses matching
ratios. Speed is six per roll plus a single six-dot slicing bonus of one; that
bonus is excluded from roll-equivalent scoring. No tier or level normalization
is applied, so leveling and slicing do not reduce the score. Only four maxed
secondaries with twelve optimally allocated rolls and fit 1 can display 100.
Other values round to one decimal, capped at 99.9 for display.

Exact parity is not yet claimed: GG's internal precision, precise max-roll data,
and denominator convention need sample-score validation. The supplied text's
claim that speed-primary arrows have a lower physical ceiling is in tension
with its same-primary perfect-mod definition; this implementation follows the
latter. A confirmed GG equation or example scores can resolve that distinction.

Grades remain “Grade uncalibrated” until frozen score cutoffs are supplied.
`ggGradeThresholds` accepts keys `set:slot`, or `set:slot:Speed` for speed-primary
arrows, with numeric SSS/SS/S/A/B/C lower bounds. D is below C. Never recompute
cutoffs from the current inventory. The advertised percentile rarities cannot
be recovered from the weight and primary-fit tables alone.

Run `node scripts/testGGScore.mjs` and `npm run build` to verify.

## Recommended slices

The Recommended slices navigation tab ranks eligible mods by average expected
GG-style score at 6A after primary fit, descending. Ties use current score, then mod ID.
It includes five-dot E–A and six-dot E–B mods; six-dot A is already fully sliced.
By default only level-15 mods appear. The leveling checkbox adds lower-level
candidates with all four secondaries revealed and marks the prerequisite explicitly. Dot filters let you compare
five- and six-dot investments separately. Each row shows the exact next tier,
secondary rolls, primary, owner, and mod ID. Results expand in batches of 50.
Set, primary-stat, and shape filters can be combined with the dot and leveling
controls. Matching mods retain the selected ranking mode; changing a filter
resets the displayed batch to 50. Primary choices come from the inventory.

The ranking toggle defaults to chance of reaching the selected GG target. Expected score at 6A is still available, alongside a mode ranked by
average score improvement from the next slice, using expected 6A score as the
first tie-breaker. That mode shows the point gain and average post-slice score.
For 5A→6E it computes the guaranteed stat increases; other tiers average one
roll over uncapped secondary targets using midpoint roll values. If leveling is
required, it averages over those prerequisite roll paths but measures the slice
gain against the leveled mod, excluding leveling gains. Switching modes retains
all filters and resets the visible batch to 50.

A third mode, Highest potential at 6A, ranks the best possible final score from
remaining rolls. Existing stat values stay unchanged except the 5→6-dot scale;
future max rolls fill the highest-weight available secondaries up to five each.
Average at 5A is also shown for five-dot mods, averaging only the remaining
leveling and slicing rolls through 5A with five-dot ranges, before promotion.
An existing level-15 5A mod shows its current score. Six-dot mods show N/A because
their historical 5A rolls are not available. This value does not affect ranking.
Average and potential 6A scores are shown in every ranking mode. Potential is
a ceiling for future slicing, not an assumed replacement of existing weak rolls.

The sell strategy uses the top 300 current valid GG scores across the whole inventory.
Automatic targets are 60 below an average of 60, 65 from 60 to below 65, and 70
thereafter. Users may select a fixed target. Selling stays disabled below 300 scored mods.

Priority investments average at least the target at 6A. The same rules apply to
equipped and current top-300 mods. Below-target mods are selective gambles with at least a 25% target chance, sell priorities
if potential is below target, and consider-selling candidates otherwise.

Target chances use 1,024 fixed-seed simulations with equally likely uncapped stats,
uniform continuous non-Speed magnitudes and uniform integer Speed rolls from 3 to 6.
Five-dot rolls convert on promotion; Speed gets its single +1 bonus. These are model
assumptions, not measured game odds. Estimates near the 25% policy cutoff are subject
to sampling error. Existing average and maximum forecasts retain their exact calculations.

An alternative ranking is expected positive top-300 total gain per remaining slice.
Each simulated final score is compared with the greater of current mod score and
300th score (zero for an incomplete inventory). Positive gains are averaged and
divided by remaining slice steps, including 5A to 6E. Steps are a cost proxy, not
material/credit prices; prerequisite leveling is not priced. Candidate gains are
independent estimates, not additive portfolio guarantees.

Groups appear as priority investments, selective gambles, consider
selling, and sell priorities. Ranking stays within groups; reverse order reverses
groups and rows before pagination. Filters do not affect the inventory baseline.
No mods are sold automatically. Character fit and calibration remain outside the
model. Run `node scripts/testSliceSellLine.mjs` and
`node scripts/testSliceTargetForecast.mjs` for policy and simulation checks.
The forecast uses a deterministic dynamic program over secondary roll counts.
Each roll has equal probability among secondaries below five rolls; a capped
secondary is removed from subsequent choices. It averages every allocation path
through twelve total rolls. Five-dot rolls bring the total to eight, the 5A→6E
slice increases existing stat values without adding a roll, and six-dot rolls
bring the total to twelve. Leveling rolls are included when needed.

Roll magnitudes use the midpoint of the stored min/max range for the appropriate
dot count. Five-dot roll gains receive the same range-derived six-dot slice factor;
speed receives its single +1 slice bonus. Equal target probabilities and midpoint
roll magnitudes are model assumptions; actual game roll distributions have not
been fitted. This is an estimated expectation, not a guaranteed final score.

Current and expected scores appear separately. Calibration rerolls, character-specific
gains, and return per material are not modeled. Inventory and assignments are
unchanged. Unrevealed secondaries and roll totals inconsistent with tier/level
are excluded rather than guessing missing data.
Run `node scripts/testRecommendedSlices.mjs` for ranking and eligibility tests.
Run `node scripts/testExpectedSixAScore.mjs` for the allocation expectation and
an explicit case where the lower current score ranks higher by expected 6A score.
Run `node scripts/testSecondaryRanges.mjs` to check every supplied range, proportional
slice conversions, the one-time speed bonus, and frontend/worker consistency.



