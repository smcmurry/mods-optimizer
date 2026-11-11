# Reliced GAC team finder

## Import a saved SWGOH.GG tier-list response

```powershell
npm run gac:import -- --html "C:\path\to\saved-response.html"
```

This offline importer uses the latest completed saved roster for `414556856`. Use `--snapshot <run-directory>` to select a specific snapshot, or run `npm run gac:teams` first to refresh your roster. It verifies the saved roster checksums and writes a separate `swgoh-<timestamp>` report, preserving the original reports. `--ally-code`, `--min-relic`, and `--output` are also supported.

The importer reads only the provided page's mode, side, and season. A 5v5 offense page cannot supply 5v5 defense or 3v3 rankings. It extracts the rendered lineups, tier bands, Elo, displayed rates, and battle counts without running downloaded JavaScript. It uses jsdom from this repository's installed test dependencies. Verify with `node scripts/testSwgohTierList.mjs`.

Build counts link to Meta Explorer; they do not mean every variant is embedded in this HTML. Import results are ownership matches, not automatic recommendations: low-ranked entries can include ineffective solos or tiny samples. Additional saved pages are needed to cover other modes/sides or the variants shown by Meta Explorer.

## Download the expert catalog

All alternate builds now appear directly in the four main offense/defense lists. Reviewed rules cover Leia's flex slots and Enoch's developer-recommended lineup, plus explicitly labeled roster-building suggestions for Phoenix, Bounty Hunters, Rebels, Jedi, Empire and Inquisitors. Other exact five-member examples come from pinned game data. Three-member suggestions are explicitly specified, never automatically truncated from 5v5. This is an initial rules library, not exhaustive alternate-build coverage.

Evidence labels distinguish documented alternates (including community reports), untested substitutions and exact game example squads. Alternate builds receive no tier or win rate. Their presence among a side's available options does not establish performance on that side. Core members and relic thresholds are enforced. Offense-only solos never appear in defense options.

The report starts with exact recommended splits for both modes. The default board is the user's **Bronzium** league: five character defenses in 5v5 and seven in 3v3. One fleet is also required; fleets are not planned here. Override after promotion with `--defense-5v5 N --defense-3v3 N`. A bounded beam search jointly selects defense and offense with no character reuse within a mode. It prioritizes filling the requested defense slots, then uses transparent planning preferences in `scripts/lib/gacDeployment.mjs` (for example, Great Mothers on defense and Leia on offense). This is a heuristic, not a combat simulation or guaranteed optimum. It reports missing defense slots and insufficient offense depth rather than inventing teams. Ability upgrades, opponent counters and datacrons are not verified. Low-confidence filler is labeled in the plan.

`variant-input.json` freezes the rules, name/category mappings, game examples, and game-source revision. Its checksum is saved in `source.json`; replay verifies and reuses it. Older snapshots without this input are expanded using current local rules/data and explicitly marked as such in provenance. The analysis code itself is not frozen. Rules are maintained in `scripts/lib/gacVariants.mjs`; they do not refresh automatically from community pages.

The main script now defaults to **R0** to include all of the previously reported builds. Use `--min-relic 1` or higher for a stricter threshold. Low relic levels do not imply performance comparable to the published meta lineup. All integrated candidates are shown by default (up to 1,000); `--top` only limits candidate display, not allocation.

Run from the repository with Node 20 or newer:

```powershell
npm run gac:teams
npm run gac:teams -- --ally-code 414556856 --min-relic 5 --top 15
npm run gac:test
```

The default ally code is `414556856`. The main script's default minimum is R0. The separate HTML importer retains its R1 default. Raw HotUtils relic tiers are converted by subtracting two, with G13 required.

Each run creates a new timestamped directory under `reports/gac-roster/<ally-code>/` containing:

- `roster-response.json`: complete public provider response, including the returned characters and mods.
- `meta-source.html`: downloaded AhnaldT101 team catalog.
- `character-names.json`: frozen name-to-game-ID catalog used for matching.
- `source.json`: endpoints, fetch times, source headers when available, and SHA-256 checksums.
- `report.json`: all eligible teams, rejected teams and reasons, relic levels, omicron recommendations, and overlaps.
- `report.md`: four readable lists: 5v5 offense/defense and 3v3 offense/defense.

Reproduce an earlier snapshot without network calls:

```powershell
npm run gac:teams -- --replay reports/gac-roster/414556856/<timestamp> --min-relic 5
```

Supply `--ally-code` as well when replaying another player's snapshot. Replay verifies source checksums and preserves the original roster fetch time. `--output <new-directory>` changes the destination; an existing directory is rejected to protect snapshots. Failed runs may leave partial raw files, but do not write a completed report or silently use stale data.

## Ranking and scope

The script downloads [AhnaldT101's team catalog](https://ahnaldt101.com/swgoh/teams) on every live run. It uses the catalog's separate mode-specific offense/defense **tier bands**. Within a tier, teams are tied and sorted alphabetically. It does not use legacy numeric scores, which can disagree with the site's current tier bands. These are expert rankings, not SWGOH.GG battle statistics. No known publication timestamp is provided, so a download timestamp does not establish when rankings were revised.

All candidate members must meet the relic threshold. Unknown names, unresolved flex slots, duplicate members, and overfull squads are excluded. Reviewed substitution rules provide separate labeled candidates in the same lists. Undersized squads can qualify on offense; defense requires exactly three or five members. The first member is the leader. Recommended omicrons and source notes are included for manual review.

The four candidate lists can overlap. The recommended deployment at the start of the report and in `report.json.deployment` is the non-overlapping allocation to follow. `variant-input.json` freezes candidate-generation inputs; deployment preferences use the current script revision.

The saved response is an exact copy of the **public provider snapshot** at fetch time. The endpoint does not guarantee immediate in-game freshness, GAC-lock state, unequipped mods, or ability/omicron/datacron coverage. Relic eligibility alone does not guarantee the recommended team will perform as rated. No login, mod moves, or game writes are performed.
