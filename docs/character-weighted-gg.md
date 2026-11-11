# Character-weighted GG optimization

Select **Character-weighted GG — top primaries and sets** in Optimize → Actions.
Both GG modes compare the top two set combinations and primary choices. A complete
first-choice build is preferred when its ranking value is within 3% of the best
top-two build. Locks, minimum dots, gear eligibility and character priority apply.
If popular sets are unavailable, search other complete sets with preferred primaries,
then other primaries. Broken sets are a last resort only when global settings permit
them. Alternatives are reported. An available equipped build is retained if it meets
stat requirements and is over 5% stronger than the proposed build.

Slot-wise matching protects eligible supply for later characters' gear/minimum-dot
requirements. This protects slot completion, not every later character's preferred
set or stat target. Infeasible constraints still produce an explicit warning and
missed-goal report. Required stat minima/maxima and relative targets are respected;
goal-only targets remain advisory. No automatic role-specific stat floors are invented.

Ranking value = current GG × (0.8 + 0.4 × roll-weighted preference).
Roll-weighted preference is the sum of each grouped secondary's roll count times
its preference, divided by total secondary rolls. Flat and percentage rolls for
Health, Protection, Offense, and Defense share a preference. The multiplier bounds
are tuning choices. They are not learned player preferences. Displayed GG scores
and slicing/selling recommendations are unchanged.

`npm run meta:compile-secondaries` regenerates the compact preferences from saved
metaProfiles and generatedMetaTargets. It also runs in `npm run meta:compile`.
For the top set combination, each stat's signal is its equipped frequency relative
to the population frequency, times the square root of its average value relative
to the population average (value ratio limited to 0.5–1.5). Frequencies use eligible
mod slots: exclude primary-blocked slots, including fixed squares and diamonds.
Each signal is limited to 0.5–2, then flat and percent signals are averaged. The
preference is 0.5 + log2(signal)/2, bounded to 0–1. Population-average behavior is
neutral, rather than giving Speed a universal maximum. Samples below 100 builds
blend toward neutral 0.5. Missing character data uses plain GG.

These are inferred equipped-mod preferences. Existing aggregates have values and
frequencies, not observed calibration decisions or secondary roll counts. They
also do not isolate builds by exact primary combination. Actual roll counts on
the player's candidate mods are used during optimization. No new roster fetch
is necessary. Neither legacy stat presets nor the original GG formula changes.

Without required stat targets, the set-count search is exact within each candidate
combination before the first-choice preference and equipped-build guard. Required
stat targets use the existing constrained optimizer with GG as its scoring function;
results are rechecked and rejected if the existing solver relaxed required stats.
The 3%/5% thresholds are policy choices, not measured player behavior.
