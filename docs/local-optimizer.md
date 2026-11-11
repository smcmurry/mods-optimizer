# Repeatable local optimization

The local runner uses the same roster/mod conversion, team resolution, search,
native set bonuses and compact report formatter as the app. It does not move
mods or change browser saves. The default ally code is **297546974**.

## Freeze the inputs

Run `npm run optimizer:fetch-fixture` once to download the public profile.
The cached response contains 333 characters and 1,997 mods in the current
fixture. A public profile can omit unequipped inventory. Source metadata and a
SHA-256 hash identify the response; subsequent tests run offline against it.
Refreshing this fixture changes the comparison baseline.

To reproduce a saved run's order, targets and settings:

```text
npm run optimizer:import-run -- "path/to/optimization-analysis.json"
```

The current local configuration imports the 330 ordered targets from the
October 4 analysis export. Without imported settings, the runner uses all
available characters in alphabetical order with default Combat Utility plans.
Character order matters because each earlier selection consumes mods.

Cached player data and generated local reports are ignored by Git. They live
under `data/optimizer-fixtures/297546974/` and
`reports/local-optimizer/297546974/` respectively.

## Run the short feedback loop

Check the implemented mechanics and shared engines offline before searching:

```text
npm run kits:checked-test
```

This runs independent source expectations plus roster-wide interpreter,
cache, worker, model and export checks. Passing tests do not certify mechanics
that are still listed as omitted or unresolved in the coverage report.

```text
npm run optimizer:coverage
npm run optimizer:local -- --characters GLHONDO,R2D2_LEGENDARY,HERMITYODA
npm run optimizer:analyze
```

Coverage mode checks the equipped roster and resolved teams against all
matchups, including confidence, omitted branches, unresolved conditions and
stat priorities. Recent checks took roughly 6–10 seconds on the current fixture and do
**not** search for new mods. A focused search is useful for a mechanics change;
its allocation differs from a full roster run because earlier characters are
absent. Select IDs explicitly and preserve their order between comparisons.

## Run and compare the complete selection

```text
npm run optimizer:local -- --output reports/local-optimizer/297546974/baseline.json
npm run optimizer:local -- --output reports/local-optimizer/297546974/updated.json
npm run optimizer:analyze -- reports/local-optimizer/297546974/updated.json reports/local-optimizer/297546974/baseline.json
```

Run the baseline before changing the engine. Full searches can take many
minutes; equipped-roster coverage checks are much faster. Each result records
the fixture hash, settings/selection hash, scoring version, kit revision and
engine hash. The analyzer refuses comparisons with different or unidentified
fixture/settings inputs. Identical inputs are necessary for attributing a
change to the calculator. The kit and engine hashes can differ deliberately.
When the new report matches the currently loaded calculator, the analyzer also
rescores both allocations under that same model. It uses raw defense ratings
and actual roster levels, preserves fixed teammates, and reports individual
utility changes. It does not subtract scores from different calculator versions
or sum character scores into a roster-strength estimate.

Results contain compact before/after stats and value changes for the roster,
recommended loadouts, candidate scores and model assumptions. Full unresolved
condition frequencies are counted before diagnostics are compacted, allowing
the next handler to be selected from actual recurrence rather than examples
alone. A Markdown analysis is written beside the JSON.

## Check the calculator

Use `npm run kits:confidence-test` for independent arithmetic expectations
(actual relic levels, pool bonuses, damage reduction and penetration) and
priority/scenario migration checks. `npm run optimizer:preprocessing-test`
compares all 341 prepared kits with the raw-kit reference interpreter, including
changed teams and states. That parity check validates preprocessing; it does
not independently establish that every source mechanic is interpreted correctly.

`npm run optimizer:performance-test`, `npm run kits:test`, `npm run combat:test`,
`npm run meta:test-v2` and `npm run optimizer:export-test` check caches,
representative kits, worker scoring, saved plans and compact export behavior.
With the local fixture present, `npm run optimizer:replay-test` runs four real
searches twice and verifies identical allocations, stats, scores and gaps,
including that no mod is assigned to two optimized characters.

## Confidence standard

The goal is complete, checked coverage within the bounded expected-utility
model. It does not require validation against battle outcomes. High confidence
currently requires no omitted active-team branches, no unresolved conditions,
a complete example team and at least three scenarios. Branch counts are not
percentages of gameplay fidelity, and parity/finite-number checks alone cannot
make confidence high.

The current 330-target coverage check reports **330 low-confidence targets**.
Event-dependent effects, immunities, mastery, cooldown changes and conditional
states still need implementation or a checked decision about model scope.
The runner and the visible confidence field expose these gaps; they do not
hide them to meet a confidence threshold.

`npm run kits:coverage-audit` groups gaps across all 341 source kits by exact
effect parameters and retains source examples with ability descriptions. Its
reports are `reports/kitCoverageBacklog.json` and `.md`. This source inventory
includes every named ability; the local run report separately identifies the
abilities active for its selected leader, team and unlock assumptions.

## Profile scoring separately

Run `npm run optimizer:scoring-benchmark` for a repeatable warm scalar-scoring workload. Add `-- --profile` to save a CPU profile in the OS temporary directory. It uses recommended teams and synthetic stat snapshots; the local replay remains the test for the saved ally-code search. See [the measured workload](../reports/preparedScoringPerformance.md). Avoid overlapping benchmarks with builds or other searches.
