# Kyber mod-investment list: roster relic adjustment

The auto-generate Kyber option still starts with the saved Kyber average
Speed-secondary investment for each owned character. It now multiplies that value
by `1 + min(0.20, 0.02 × roster relic level)`.

The roster stores R0 as relicTier 2, R1 as 3, and so on. Characters below gear 13,
or with missing/invalid relic data, receive no bonus. The multiplier is capped at
1.20, so unusually large or future relic levels cannot overwhelm the meta signal.
This is a priority policy, not an estimate of combat strength or resource costs.

- R5 → 1.10; R7 → 1.14: only a 3.6% relative difference.
- R0 → 1.00; R8 → 1.16: a 16% relative difference.
- Equal relic levels retain the original ordering.

Adjusted score sorts first, then the existing tie breakers: raw average secondary
Speed, Speed-secondary frequency, sample size, and roster GP. Minimum gear,
level-50 eligibility, owned-roster filtering, top-N limits, and append behavior are
unchanged. Existing selections retain their order when appending.

The adjustment is applied when generating the list, using the loaded roster.
It does not change character stat weights, mod GG scores, or already-saved list
order. Regenerate the list to apply it; refresh the roster first if relics changed.

Validation: `node scripts/testKyberRelicPriority.mjs` exercises the real action
callback with small and large gaps, equal relic levels, limits, and append behavior.
