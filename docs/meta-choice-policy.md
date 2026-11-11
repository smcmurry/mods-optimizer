# Most-common mod choices

Targets with ranked meta choices prefer the first complete set combination and
first primary for each slot except arrows, which retain both allowed primary choices. Rankings come from the saved popularity data.
The optimizer maximizes the saved target's value within each build choice first.
A less-common build displaces the top-ranked build only when it has BOTH higher
optimizer value and more than 10 additional total character Speed, including set
bonuses. A faster build with equal or lower value does not qualify. There is no
Speed-only search or minimum-Speed floor that can sacrifice the preferred
build's value. Exactly 10 extra Speed is insufficient.

Unavailable builds retain the existing restriction fallback behavior. Targets
without meta rankings retain their normal behavior.
Ship-preference improvements still cannot impose additional score loss.

Default weights come from the first legacy preset except explicitly reviewed
selections: Chewbacca uses Tenacity and Wampa uses Omicron. Both retain the same
meta set/primary restrictions. See `default-preset-audit.md` for the remaining
alignment candidates; those have not been switched automatically.

The shopping list always targets the first-ranked complete set combination and
first-ranked primary (either top primary for arrows), even when the optimizer chooses a faster alternative.
Slot placement minimizes replacements within that top combination, favoring mods
already failing the primary or GG score requirement. Every mod needs a current
GG score of at least 40, including Speed-primary arrows. This uses secondary
stats and primary fit, not projected 6A quality or a minimum Speed value.
Unavailable scores are flagged for review. Missing ranking data retains the
GG score/missing-mod checks rather than inventing a popularity ranking.

Checks: `node scripts/testTopTwoMeta.mjs`, `npm run optimizer:shopping-test`, and
`npm run optimizer:ship-test`.
