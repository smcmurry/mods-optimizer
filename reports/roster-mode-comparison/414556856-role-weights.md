# Focused character weight revisions

Compared against `414556856-before-role-weights.json`, using the same November 2 saved roster, priority order and settings. Results are optimizer projections, not battle simulations.

Only R2-D2 and Captain Rex defaults changed. Legacy PvP presets remain selectable and custom targets are preserved. Fixed mod GG weights and both GG optimization modes are unchanged.

R2-D2's Number Crunch preset values Health, Protection and both damage stats for sharing, while keeping Speed meaningful and reducing Potency. Raw weights: Health 100, Protection 25, Speed 150, Physical/Special Damage 100 each, Potency/Tenacity 5 each. Raw numbers use different per-stat normalization scales, so equal numbers do not imply equal gains per stat point.

Captain Rex's Speed and survival preset uses Health 40, Protection 10, Speed 100, Potency 20, Tenacity 10 and Critical Chance 15. This reduces the old Potency 60/Critical Chance 100 emphasis while retaining value for debuffs and critical hits.

| Character/stat | Previous recommendation | Revised recommendation |
| --- | ---: | ---: |
| R2 Health | 71,457 | 76,402 |
| R2 Physical Damage | 6,529 | 7,294 |
| R2 Special Damage | 10,357 | 11,546 |
| R2 Protection | 39,749 | 40,198 |
| R2 Speed | 302 | 276 |
| R2 Potency | 107.939% | 59.795% |
| Rex Speed | 272 | 290 |
| Rex Health | 72,175 | 80,435 |
| Rex Protection | 62,219 | 64,583 |

The R2 tradeoff is deliberate: approximately 7% more Health and 12% more Offense, with 26 fewer Speed. Exact weights are judgment-based defaults, not measured optimal combat weights. Existing set/primary preference rules still apply. Other roster recommendations can change as shared mods are reassigned.

All 69 selected characters received six mods with no duplicate assignments. Preset migration, serialization and normal optimizer regression checks passed; the development app compiled successfully.

Kit references: [R2-D2](https://swgoh.gg/units/r2-d2/) and [Captain Rex](https://swgoh.gg/units/captain-rex/).
