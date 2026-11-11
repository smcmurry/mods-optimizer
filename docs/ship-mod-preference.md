# Prefer 6-dot mods for ships

Enable **Prefer 6-dot mods for ship** on a selected character. The setting is saved
with that character and is available at gear 12 or higher. Locked characters are
not changed. Turning it off restores normal optimization using the saved target.

The worker first runs a fresh normal optimization as the comparison baseline.
It releases the ship-focused characters' allocations, assigns existing spare
6-dot mods, and then checks donor/replacement pairs for missing slots. Each step
chooses the pair with the smallest reduction in the donor's optimizer score.
The donor's minimum dots, sets, primaries, and hard stat restrictions are checked
only when the donor is above the receiving ship character in the selection's
priority order. Lower-priority donors may violate those restrictions; their
score loss still determines which reservation is chosen. Locks always apply.

Those replacement pairs are temporary cost estimates, not the final assignments.
Once the ship's existing six-dot mods are reserved, the optimizer reruns its full
mod-set search for normal characters in priority order. The highest-priority
character can take any non-reserved, unlocked mod, including mods previously
allocated to lower-priority characters. Each subsequent character searches the
remaining pool. The change threshold is zero for this pass so it seeks the best
available build rather than retaining an inferior equipped build. Only after
normal characters are assigned are empty ship slots filled with remaining mods.
Review scores are calculated from these final assignments, including all
cascading changes to lower-priority characters.
After allocation, ship sets and primaries (including meta alternatives) are
secondary preferences. The optimizer tries matching spare mods and value-neutral
exchanges, accepting improvements only when neither the pilot nor any other
character loses additional optimizer score and the pilot keeps at least as many
six-dot mods. Higher-priority restrictions and locks remain protected. This is
a best-effort tie-breaker, not a requirement to match at any cost.
Only actual 6-dot inventory counts; slicing is not recommended for these characters.
When no legal pair is available, lower-dot mods fill remaining slots and the
review warns how many existing 6-dot mods were assigned.

This deterministic local search does not guarantee a global minimum: it does
not exhaustively search simultaneous exchanges across several characters.
Multiple ship-focused characters receive available mods in selection order.
A preference run recalculates the whole selection, including incremental runs,
because changing one ship allocation can affect earlier characters.

Review displays the toggle-off and toggle-on score for every unlocked selected
character, their difference, the overall sum, and a separate sum for non-ship
characters. Negative losses represent gains. The overall score uses the existing
sum-of-target-scores convention, not a calibrated measure of roster strength.
Ship characters' own value changes are reported even though their scores do not
control the initial six-dot reservations. Optional set/primary improvements
also protect those scores against additional loss. The comparison is saved with the assignment results.

Validation: `npm run optimizer:ship-test`.
