# Native stat and Mastery review

Pinned source commit: `8d86d7002e8cab5839f04540d93ac303db078517`. This review records remaining input and conversion gaps, not completed Mastery support.

The public fixture provides Physical/Special critical ratings under display keys named Critical Chance. `CharacterStats` retains those ratings and derives chance as rating / 24 + 10. Synthetic snapshots that omit rating fields must retain the native-query warning.

The public response does not supply native Mastery, Health Steal or penetration. Unit base stats alone do not establish equipped/relic values. For example, the pinned SEE base Health Steal stat is 50%, and JKL base Armor Penetration is 195; equipment and relic contributions still require their source progression. Treating missing native fields as checked zero would conceal this limitation.

The source MASTERY enum is 61. The reviewed effects include Rey +40%, JMK +25%, SEE Sith +50%, Hondo additive 10 and SEE's current-Mastery doubling. At an explicitly declared scalar Mastery of 100 their independent amounts are 140, 125, 150, 110 and 200. These amounts do not establish which Health, Offense, avoidance or other dimensions change per recipient. Exact per-character source dimensions and conversion coefficients, plus equipped native inputs, are required before integrating their utility effects.

The exact reviewed source IDs are `leaderability_glrey_mastery_u01`, `leaderability_jedimasterkenobi_mastery_increase`, `leaderability_sithpalpatine_mastery_increase_sith`, `specialability_glhondo01_all_pirates_gain_mastery`, and `ultimateability_sithpalpatine_mastery_double`. Self-Mastery query definitions are `generic_query_current_mastery_self` and `uniqueability_galacticlegend01_mastery_query` (type 12). These effects establish scalar amounts and selectors, not stat conversion coefficients.

`scripts/fetchMasteryTables.mjs` is prepared to discover and download relevant tables at the existing pinned commit and verify their Git blob hashes. It never refreshes the source revision. The discovery request failed with a sandbox network restriction; its escalated retry was interrupted while waiting for approval. No tree result or table download was returned. Inspection afterward confirmed no relic/stat-progression cache files or corresponding source hashes were added, and the pinned commit remained unchanged. Exact file names and per-character conversion coefficients therefore remain unverified. No further download retry was made.

The current engine retains unresolved Mastery branches; no equal-stat or role-name guess has been added. Completing Mastery support still requires the source conversion tables and equipped native values, followed by independent checks of recipient-specific stat changes.
