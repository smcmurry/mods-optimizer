# Recommended calibrations

The tab ranks six-dot, level-15 mods by estimated retained GG-style score gain
from one calibration attempt. It evaluates each secondary with at least two
rolls and recommends the best donor. Ties use current score, then mod ID. Filters
for set, primary and shape preserve ranking; results expand in batches of 50.

The model follows the developer's calibration announcement (archived original):
https://devtrackers.gg/swgoh/p/d4595b15-title-update-9-14-2022

Remove one roll, then select uniformly among secondaries below five rolls,
including the donor after removal. Keep the better of original and calibrated
GG scores for each outcome before averaging. The original secondary types,
primary, set, and total rolls do not change. Speed's six-dot +1 stays intact.

The import stores stat totals and counts, not historical individual roll values.
The removed roll is therefore approximated by the donor's average; for speed,
subtract the permanent +1 before dividing by roll count. New roll sizes assume
a uniform distribution over the supplied six-dot ranges. Integer speed outcomes
3/4/5/6 are enumerated; other ranges use 32 deterministic midpoint samples.
This estimates the positive part of gain rather than taking the positive part
of the mean gain, so reverting bad outcomes is reflected in the ranking.
Unknown donor-roll variance means this is not an exact in-game probability.

Each row shows average retained score and estimated potential after the selected
calibration. Potential uses the best receiving secondary and maximum new roll,
with the same average-removed-roll assumption as the expectation. It is not a
ceiling over unknown individual removal values or over repeated attempts.

Calibration attempts used and costs are not imported. The UI explicitly labels
remaining attempts unknown, and candidates may have exhausted their attempts.
Check eligibility in-game. The ranking is gain per attempt, not per material.
No attempts are spent and no inventory changes are made. Five-dot mods, incomplete
or inconsistent roll totals, and candidates without positive estimated gain are
excluded. Six-dot A mods are included, unlike the slicing recommendations.

Validation: `node scripts/testRecommendedCalibrations.mjs`, the component's Jest
test, and `npm run build`. The calculation test checks a closed-form expectation
against the numerical estimate, keep/revert behavior, source/target caps, speed,
eligibility, ranking, and a perfect mod with no possible gain.
