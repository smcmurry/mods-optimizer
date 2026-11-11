# B1's permanent revive immunity

The pinned highest-tier `uniqueability_b1battledroidv2_02` explicitly states that B1 cannot be revived. Its direct effect list includes `uniqueability_b1battledroidv2_revive_immunity_self`, a type6 IMMUNITY effect with only UNRESISTABLE, chance100, zero coefficients, no context/events/expiry and a self recipient. Its sole affected tag is `revive`; its descriptive marker is `b1_revive_immunity_self`.

The compiler accepts this exact source proof as permanent `reviveImmunity: 1` through the existing immunity stat phase. It does not accept unrelated enemy revive prevention or infer revive immunity from character names. Other filters, contextual/death execution and generic revive-prevention instances remain separate gaps.

Source-tagged type13 REVIVE operations now include `reviveImmunity` in their matched blocking flags. The existing `immunityAvailability` suppresses only that revive Health-restoration contribution. Ordinary Health healing keeps its own `healthRecoveryImmunity` flags; Protection recovery and ally DPS are unchanged by the revive-immunity flag. This work adds no arbitrary damage or EHP benefit against enemies with unknown revive schedules.

## Independent test

`scripts/testReviveImmunitySource.mjs` verifies both the localized B1 kit statement and exact source shape. It then isolates B1's new flag and Jawa Engineer's real `specialability_jawaengineer01_revive_BASE` operation.

The Jawa source selects a random defeated Droid ally, restoring1% Health. Its normal `revive_immunity` selector exclusion does not name B1's separate `b1_revive_immunity_self` marker, so actual action immunity must still be enforced. Under the existing dead-ally proxy, B1's actual Health1, caster rate2, cooldown4 and assumed defeat fraction0.25 otherwise yield `0.01 × 1 × 2/5 × 0.25 = 0.001` Health per second. Enabling B1's source flag reduces that contribution to zero. The test does not create a new dead actor; it uses the existing model's explicit defeat assumption and keeps the original source selector for audit.

Separate runs isolate Jawa Engineer's ordinary30% Health recovery and show positive unchanged recovery for both caster and B1 when enabling only the revive-immunity flag. These arithmetic tests intentionally isolate this flag from B1's separate healing/pool/Battalion mechanics; they do not claim B1's complete kit is modeled. Existing revival follow-up and ordered death-state omissions remain present.

The checked source test and all341-character raw/prepared/scalar/cache/worker-freshness comparisons passed after synchronization. The checked test runner now includes this oracle. No confidence promotion follows from this one handled branch.
