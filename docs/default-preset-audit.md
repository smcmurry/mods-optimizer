# Default preset alignment review — November 1, 2026

This reviews the repository's saved meta set rankings against its existing preset
weights. It is not a fresh live-meta survey or a character-kit evaluation.

## Applied changes

| Character | Top set combination | New default source | Relevant weights |
|---|---|---|---|
| Chewbacca | 3 Tenacity | Tenacity | Tenacity 80, Health 25, Protection 25, Speed 100 |
| Wampa | 2 Health + 1 Tenacity | Omicron | Health 100, Tenacity 75, Speed 75, Physical Damage 50 |

The default wrapper still takes sets and primaries from the saved meta data.
Original presets remain available. Existing generated/default plans refresh through
the normal profile-loading migration; user-created custom plans are preserved.

## Other candidates, not applied

Initially 92 characters gave zero weight to at least one stat represented by their
top set combination. After the two changes, 90 remain. Of these, 19 have an alternate
existing preset that adds positive weight to a missing stat; 71 do not. This is a
screening rule, not proof a preset is wrong: a secondary set need not dictate the
character's entire stat priority. Positive weights are not interchangeable in value.

| Character | Top sets | Existing alternate(s) | Assessment from saved presets |
|---|---|---|---|
| Merrin | 3 Tenacity | Tenacity | Strong alignment candidate: Tenacity 0 → 60, preserves Health 15 and zero Speed. |
| Commander Luke Skywalker | Offense + Tenacity | Chewpio | Strong alignment candidate: Tenacity 0 → 50 and Physical Damage 25 → 50; team-specific name should be reviewed. |
| Imperial Probe Droid | Speed + Potency | Nuke | Adds Potency 25 while preserving Health 50, Protection 50, Speed 100. Closest improvement to current Tanky weights. |
| Finn | 3 Health | Tanky | Adds Health 30 and Protection 100; also changes Speed 10 → 100. Better defensive alignment but a substantial role change. |
| Jawa | 3 Health | Detonator | Adds Health/Protection 100 and Armor 80, drops Speed and damage; suitable candidate for the named defensive role. |
| Dathcha | 3 Health | Detonator | Same defensive change as Jawa; requires role review. |
| Jedi Knight Revan | Speed + Health | Health | Adds Health 10, retains Speed 100 and Special Damage 10, removes Crit Damage 50. |
| Grand Master Yoda | Speed + Health | Health | Adds Health 20, retains Speed 100, but reduces Special Damage 80 → 20. Not an automatic upgrade. |
| Cassian Andor | Offense + Potency | AdRad | Adds Special Damage 10 and Health 10, but reduces Potency 50 → 25; team-dependent. |
| ARC Trooper | Offense + Health | KAM / KAM/CA | Adds Health 10; explicitly encounter-specific presets, not general default replacements. |
| Echo (CT210408) | Offense + Crit Chance | Nuke / KAM / KAM/CA | Adds Crit Chance 25–50, lowers Speed 100 → 50; role-dependent. |
| Sith Trooper (FOSITHTROOPER) | Offense + Health | Tanky | Adds Health 40 but reduces Physical Damage 80 → 50 and raises Speed 25 → 100. |
| Ahsoka Tano (Fulcrum) | Offense + Health | Omicron | Adds Health 10, boosts Physical Damage 50 → 75, lowers Speed, introduces Tenacity −30; requires intended-use review. |
| Pao | Offense + Tenacity | Mothma Lead | Adds Tenacity 5 and raises Physical Damage 50 → 100; named-team specialization. |
| Han Solo | Crit Damage + Crit Chance | Non-relic / Chex Mix | Adds Crit Chance 50, but alternatives explicitly target non-relic or a specialized encounter. |
| Dengar | Crit Damage + Crit Chance | hSTR Phase 3 | Adds Crit Damage 50 but removes Speed and Potency emphasis; raid-specific. |
| Embo | Crit Damage + Crit Chance | hSTR Phase 3 | Adds Crit Damage 25 and Crit Chance 100; raid-specific. |
| Ewok Scout | Crit Damage + Crit Chance | hSTR Phase 2 | Adds Crit Damage 100, reduces Speed and removes Health/Potency; raid-specific. |
| R2-D2 | Offense + Health | hSTR Phase 1 | Adds Physical Damage 25, but introduces negative Protection and a raid-specific role. |

Do not automatically pick whichever preset maximizes the matching set weights:
that can discard role, damage-type, speed, or survivability priorities. The remaining
71 flags require reviewing weights or the character's role, not simply selecting an
already available alternate that fills the zero-weight stat.

Reproduce the candidate scan with `node scripts/auditDefaultSetWeights.mjs --alternatives`.
Run `node scripts/testTopTwoMeta.mjs` to validate the selected defaults, restrictions,
serialization, and migration without changing custom plans.
