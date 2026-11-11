# Kit coverage backlog

Source revision: ed0a0fe3ce10e81e. 341 characters checked for source gaps.

Source gap inventory. All named abilities included, irrespective of a selected team/leader. Branch counts do not measure gameplay fidelity.

| Gap and source parameters | Characters | Branches |
|---|---:|---:|
| Unmodeled operation IMMUNITY: UNRESISTABLE | 251 | 971 |
| Unmodeled operation MODIFY_STAT: TAUNT, UNRESISTABLE | 141 | 273 |
| Event-dependent branch requires stateful simulation: (no parameters) | 119 | 361 |
| Dispel of non-control buffs or custom markers requires explicit active effect state: UNRESISTABLE | 119 | 319 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: CONTEXTUAL_EXECUTE | 118 | 189 |
| Unmodeled operation IMMUNITY: CONTEXTUAL_EXECUTE | 113 | 428 |
| Unmodeled operation IMMUNITY: (no parameters) | 112 | 381 |
| Unmodeled operation IMMUNITY: UNRESISTABLE, CONTEXTUAL_EXECUTE | 106 | 332 |
| Enemy clearable buff removal uses bounded buff-share proxy; individual buff lifetime and dispellability state are not modeled: UNRESISTABLE, DISPELL_ALL | 100 | 112 |
| Dispel of non-control buffs or custom markers requires explicit active effect state: UNRESISTABLE, DISPELL_ALL | 96 | 221 |
| Dispel of non-control buffs or custom markers requires explicit active effect state: DISPELL_ALL | 92 | 276 |
| Cleanse uses assumed ordinary clearable control variants; ordered removal and undispellable variants are not modeled: UNRESISTABLE | 92 | 140 |
| Event-dependent branch requires stateful simulation: SPEED_FILL | 89 | 161 |
| Unmodeled operation IMMUNITY: UNRESISTABLE, CONDITIONAL_FILTER | 78 | 134 |
| Cooldown reset, event, recipient or execution ordering needs explicit state: ABILITY_COOLDOWN, RECOVER_ABILITIES_TAG | 77 | 111 |
| Event-dependent branch requires stateful simulation: HEALTH | 72 | 157 |
| Event-dependent branch requires stateful simulation: CONTEXTUAL_EXECUTE | 65 | 151 |
| Cooldown reset, event, recipient or execution ordering needs explicit state: ABILITY_COOLDOWN, CONTEXTUAL_EXECUTE, RECOVER_ABILITIES_TAG | 64 | 100 |
| Event-dependent branch requires stateful simulation: BLACKBOARD_OVERRIDE | 60 | 241 |
| Dispel of non-control buffs or custom markers requires explicit active effect state: (no parameters) | 60 | 148 |
| Unsupported alternatives in a partially modeled event group: UNRESISTABLE | 60 | 89 |
| Temporary Protection uses bounded active capacity; depletion, expiry and stacking chronology are not modeled: MAX_HEALTH, UNRESISTABLE | 58 | 91 |
| Event-dependent branch requires stateful simulation: SHIELD | 57 | 105 |
| Event-dependent branch requires stateful simulation: UNRESISTABLE | 56 | 109 |
| Unsupported alternatives in a partially modeled event group: DISPELL_ALL | 54 | 92 |
| Unsupported alternatives in a partially modeled event group: (no parameters) | 49 | 64 |
| Unmodeled operation MODIFY_STAT: TAUNT, UNRESISTABLE, CONTEXTUAL_EXECUTE | 44 | 72 |
| Event-dependent branch requires stateful simulation: DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL | 43 | 324 |
| Event-dependent branch requires stateful simulation: UNRESISTABLE, DISPELL_ALL | 43 | 86 |
| Dispel of non-control buffs or custom markers requires explicit active effect state: DISPELL_ALL, CONTEXTUAL_EXECUTE, UNRESISTABLE | 42 | 70 |
| Event-dependent branch requires stateful simulation: DISPELL_ALL | 41 | 97 |
| Unmodeled operation IMMUNITY: CONTEXTUAL_SKIP | 41 | 89 |
| Unsupported alternatives in a partially modeled event group: DISPELL_ALL, UNRESISTABLE | 39 | 55 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: SPEED_FILL, CONTEXTUAL_EXECUTE | 39 | 49 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: FORCE_DEBUFF, CONTEXTUAL_EXECUTE | 36 | 52 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ABILITY_POWER, UNRESISTABLE, CONTEXTUAL_EXECUTE | 36 | 44 |
| Basic follow-up event/TM propagation on bonus attacks or counters is not modeled: CONTEXTUAL_EXECUTE | 36 | 42 |
| Event-dependent branch requires stateful simulation: ATTACK_DAMAGE, UNRESISTABLE | 35 | 52 |
| Unsupported alternatives in a partially modeled event group: BLACKBOARD_OVERRIDE | 34 | 65 |
| Event-dependent branch requires stateful simulation: ATTACK_DAMAGE | 34 | 51 |
| Dispel of non-control buffs or custom markers requires explicit active effect state: DISPELL_ALL, CONTEXTUAL_SKIP | 33 | 64 |
| Event-dependent branch requires stateful simulation: ATTACK_CRITICAL_PERCENT_ADDITIVE, UNRESISTABLE | 33 | 46 |
| Basic follow-up event/TM propagation on bonus attacks or counters is not modeled: DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL | 32 | 124 |
| Dispel of non-control buffs or custom markers requires explicit active effect state: CONTEXTUAL_EXECUTE | 32 | 113 |
| Event-dependent branch requires stateful simulation: ABILITY_POWER, UNRESISTABLE | 32 | 50 |
| Event-dependent branch requires stateful simulation: ABILITY_POWER | 32 | 44 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: SHIELD, CONTEXTUAL_EXECUTE | 32 | 40 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ATTACK_DAMAGE, UNRESISTABLE, CONTEXTUAL_EXECUTE | 32 | 39 |
| Immunity/custom debuff requires effect-specific state: UNRESISTABLE, FORCE_DEBUFF, CONTEXTUAL_EXECUTE | 31 | 94 |
| Event-dependent branch requires stateful simulation: MAX_HEALTH, UNRESISTABLE | 31 | 53 |
| Event-dependent branch requires stateful simulation: MAX_HEALTH | 31 | 50 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: OFFENSE_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 31 | 41 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: DISPELL_ALL, UNRESISTABLE, CONTEXTUAL_EXECUTE | 31 | 36 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ATTACK_DAMAGE, CONTEXTUAL_EXECUTE | 30 | 52 |
| Event-dependent branch requires stateful simulation: ABILITY_CRITICAL_PERCENT_ADDITIVE, UNRESISTABLE | 30 | 45 |
| Event-dependent branch requires stateful simulation: SPEED | 29 | 42 |
| Unmodeled operation IMMUNITY: UNRESISTABLE, CONTEXTUAL_SKIP | 28 | 39 |
| Contextual gate has no source query: DEFLECTION_PERCENT_ADDITIVE, UNRESISTABLE, CONTEXTUAL_EXECUTE | 28 | 38 |
| Cleanse uses assumed ordinary clearable control variants; ordered removal and undispellable variants are not modeled: UNRESISTABLE, DISPELL_ALL | 28 | 36 |
| Multiplicative or contextual cooldown amount requires ordered cooldown state: ABILITY_COOLDOWN, RECOVER_ABILITIES_TAG | 28 | 28 |
| Event-dependent branch requires stateful simulation: CONTEXTUAL_SKIP | 27 | 59 |
| Dispel of non-control buffs or custom markers requires explicit active effect state: DISPELL_ALL, CONTEXTUAL_EXECUTE | 27 | 56 |
| Event-dependent branch requires stateful simulation: SPEED_FILL, PRIORITY | 27 | 43 |
| Immunity/custom debuff requires effect-specific state: FORCE_DEBUFF | 26 | 50 |
| Event-dependent branch requires stateful simulation: SUPPRESSION, UNRESISTABLE | 26 | 39 |
| Cleanse uses assumed ordinary clearable control variants; ordered removal and undispellable variants are not modeled: DISPELL_ALL | 26 | 31 |
| Dispel of non-control buffs or custom markers requires explicit active effect state: UNRESISTABLE, DISPELL_ALL, CONTEXTUAL_SKIP | 25 | 76 |
| Event-dependent branch requires stateful simulation: RESISTANCE, UNRESISTABLE | 25 | 40 |
| Event-dependent branch requires stateful simulation: ARMOR | 25 | 32 |
| Dispel of non-control buffs or custom markers requires explicit active effect state: UNRESISTABLE, CONTEXTUAL_EXECUTE | 24 | 56 |
| Event-dependent branch requires stateful simulation: SPEED, UNRESISTABLE | 24 | 41 |
| Event-dependent branch requires stateful simulation: SUPPRESSION | 24 | 31 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL | 23 | 129 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: HEALTH, CONTEXTUAL_EXECUTE | 23 | 37 |
| Dispel of non-control buffs or custom markers requires explicit active effect state: UNRESISTABLE, CONTEXTUAL_SKIP | 23 | 30 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: UNRESISTABLE, CONTEXTUAL_EXECUTE | 22 | 34 |
| Event-dependent branch requires stateful simulation: SHIELD, CONTEXTUAL_EXECUTE | 22 | 33 |
| Unmodeled operation HEALTH_LIMIT: MIN_HEALTH_LIMIT, MAX_HEALTH | 22 | 29 |
| Basic dispel effect state on bonus attacks and counters is not modeled: UNRESISTABLE, DISPELL_ALL | 22 | 26 |
| Unmodeled operation MODIFY_STAT: TAUNT, CONTEXTUAL_EXECUTE | 21 | 48 |
| Event-dependent branch requires stateful simulation: ABILITY_POWER, CONTEXTUAL_EXECUTE | 21 | 44 |
| Event-dependent branch requires stateful simulation: ATTACK_DAMAGE, CONTEXTUAL_EXECUTE | 21 | 42 |
| Event-dependent branch requires stateful simulation: ARMOR, UNRESISTABLE | 21 | 36 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: DISPELL_ALL, CONTEXTUAL_SKIP | 21 | 32 |
| Event-dependent branch requires stateful simulation: UNRESISTABLE, COUNTER_ATTACK_RATING | 21 | 30 |
| Enemy clearable buff removal uses bounded buff-share proxy; individual buff lifetime and dispellability state are not modeled: UNRESISTABLE, CONTEXTUAL_EXECUTE, DISPELL_ALL | 21 | 30 |
| Event-dependent branch requires stateful simulation: DISPELL_ALL, CONTEXTUAL_EXECUTE | 20 | 44 |
| Event-dependent branch requires stateful simulation: DISPELL_ALL, UNRESISTABLE, CONTEXTUAL_EXECUTE | 20 | 37 |
| Dispel filter/count/source semantics require active effect instance state: (no parameters) | 20 | 33 |
| Contextual gate has no source query: ABILITY_POWER, UNRESISTABLE, CONTEXTUAL_EXECUTE | 20 | 26 |
| Source conditional filter semantics are not equivalent to context execution gates: CONTEXTUAL_FILTER, SUPPRESSION, UNRESISTABLE | 20 | 24 |
| Event-dependent branch requires stateful simulation: HEALTH, CONTEXTUAL_EXECUTE | 20 | 24 |
| NO_KILL lethal floor requires current remaining Health and defeat state: DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, NO_KILL, NO_HEALTH_STEAL, CONTEXTUAL_EXECUTE | 19 | 159 |
| Dispel filter/count/source semantics require active effect instance state: CONTEXTUAL_EXECUTE | 19 | 58 |
| Event-dependent branch requires stateful simulation: CRITICAL_DAMAGE | 19 | 49 |
| Event-dependent branch requires stateful simulation: ATTACK_CRITICAL_PERCENT_ADDITIVE | 19 | 47 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: UNRESISTABLE, DEFLECTION_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 19 | 26 |
| Event-dependent branch requires stateful simulation: UNRESISTABLE, SPEED_FILL | 18 | 38 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ABILITY_POWER, CONTEXTUAL_EXECUTE | 18 | 29 |
| Event-dependent branch requires stateful simulation: ABILITY_POWER, CONTEXTUAL_EXECUTE, UNRESISTABLE | 18 | 26 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: CONTEXTUAL_SKIP | 18 | 26 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ARMOR, CONTEXTUAL_EXECUTE | 18 | 23 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: CONTEXTUAL_EXECUTE, UNRESISTABLE, SUPPRESSION | 18 | 19 |
| Event-dependent branch requires stateful simulation: SPEED_FILL, CONTEXTUAL_EXECUTE | 17 | 29 |
| Temporary Protection uses bounded active capacity; depletion, expiry and stacking chronology are not modeled: MAX_HEALTH | 17 | 27 |
| Event-dependent branch requires stateful simulation: CRITICAL_DAMAGE, UNRESISTABLE | 17 | 26 |
| Additional immunity filters are outside the supported control types: (no parameters) | 17 | 23 |
| Event-dependent branch requires stateful simulation: DODGE_PERCENT_ADDITIVE, UNRESISTABLE | 17 | 22 |
| Revival requires death state or default pool semantics: (no parameters) | 17 | 21 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: RESISTANCE, UNRESISTABLE, CONTEXTUAL_EXECUTE | 17 | 20 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: SPEED, UNRESISTABLE, CONTEXTUAL_EXECUTE | 17 | 20 |
| Revival follow-up actions and ordered death state are not modeled: (no parameters) | 17 | 18 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: SPEED_FILL | 17 | 17 |
| Event-dependent branch requires stateful simulation: ABILITY_CRITICAL_PERCENT_ADDITIVE | 16 | 41 |
| Immunity/custom debuff requires effect-specific state: FORCE_DEBUFF, CONTEXTUAL_EXECUTE | 16 | 29 |
| Event-dependent branch requires stateful simulation: RESISTANCE | 16 | 28 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: UNRESISTABLE, COUNTER_ATTACK_RATING, CONTEXTUAL_EXECUTE | 16 | 25 |
| Cleanse uses assumed ordinary clearable control variants; ordered removal and undispellable variants are not modeled: UNRESISTABLE, CONTEXTUAL_EXECUTE | 16 | 21 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ATTACK_CRITICAL_NEGATE_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 16 | 20 |
| Immunity/custom debuff requires effect-specific state: UNRESISTABLE, FORCE_DEBUFF | 15 | 48 |
| Unmodeled operation MODIFY_STAT: UNRESISTABLE, SHIELD_PENETRATION | 15 | 38 |
| Dispel of non-control buffs or custom markers requires explicit active effect state: CONTEXTUAL_SKIP | 15 | 25 |
| Event-dependent branch requires stateful simulation: DISPELL_ALL, CONTEXTUAL_SKIP | 15 | 25 |
| Event-dependent branch requires stateful simulation: ACCURACY | 15 | 24 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: CRITICAL_DAMAGE, CONTEXTUAL_EXECUTE | 15 | 24 |
| Basic dispel effect state on bonus attacks and counters is not modeled: UNRESISTABLE, CONTEXTUAL_EXECUTE, DISPELL_ALL | 15 | 16 |
| Unmodeled operation HEALTH_LIMIT: CONTEXTUAL_EXECUTE, MIN_HEALTH_LIMIT, MAX_HEALTH | 14 | 32 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ATTACK_DAMAGE, CONTEXTUAL_EXECUTE, NO_COUNTER_ATTACK | 14 | 31 |
| Event-dependent branch requires stateful simulation: ACCURACY, UNRESISTABLE | 14 | 25 |
| Unmodeled operation IMMUNITY: UNRESISTABLE, CONDITIONAL_FILTER, CONTEXTUAL_EXECUTE | 14 | 25 |
| Event-dependent branch requires stateful simulation: DEFLECTION_PERCENT_ADDITIVE, UNRESISTABLE, CONTEXTUAL_EXECUTE | 14 | 18 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: DISPELL_ALL, CONTEXTUAL_EXECUTE | 14 | 18 |
| Contextual gate has no source query: CONTEXTUAL_EXECUTE, UNRESISTABLE, SUPPRESSION | 14 | 18 |
| Basic follow-up event/TM propagation on bonus attacks or counters is not modeled: (no parameters) | 14 | 16 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: SPEED, CONTEXTUAL_EXECUTE | 14 | 16 |
| Source conditional filter semantics are not equivalent to context execution gates: ABILITY_POWER, UNRESISTABLE, CONTEXTUAL_FILTER | 14 | 16 |
| Event-dependent branch requires stateful simulation: BLACKBOARD_OVERRIDE, CONTEXTUAL_EXECUTE | 13 | 30 |
| Event-dependent branch requires stateful simulation: MAX_SHIELD | 13 | 29 |
| Temporary Protection uses bounded active capacity; depletion, expiry and stacking chronology are not modeled: MAX_HEALTH, UNRESISTABLE, CONTEXTUAL_EXECUTE | 13 | 28 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: CONTEXTUAL_EXECUTE, MAX_HEALTH, UNRESISTABLE | 13 | 21 |
| Event-dependent branch requires stateful simulation: ARMOR, CONTEXTUAL_EXECUTE | 13 | 20 |
| Unmodeled operation MODIFY_STAT: UNRESISTABLE, SHIELD_PENETRATION, CONTEXTUAL_EXECUTE | 13 | 20 |
| Event-dependent branch requires stateful simulation: ATTACK_DAMAGE, CONTEXTUAL_EXECUTE, UNRESISTABLE | 13 | 19 |
| Health/Protection equalization or redistribution needs current pool state: HEALTH | 13 | 18 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: SPEED_FILL, PRIORITY, CONTEXTUAL_EXECUTE | 13 | 15 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ARMOR, CONTEXTUAL_EXECUTE, UNRESISTABLE | 13 | 15 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: MAX_HEALTH, CONTEXTUAL_EXECUTE | 13 | 14 |
| Unmodeled operation MODIFY_STAT: MASTERY | 12 | 39 |
| Unmodeled operation MODIFY_ULTIMATE_CHARGE: (no parameters) | 12 | 34 |
| Unsupported context query: (no parameters) | 12 | 24 |
| Unsupported alternatives in a partially modeled event group: CONTEXTUAL_SKIP | 12 | 22 |
| Event-dependent branch requires stateful simulation: UNRESISTABLE, ABILITY_CRITICAL_NEGATE_PERCENT_ADDITIVE | 12 | 20 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: SPEED_FILL, UNRESISTABLE, CONTEXTUAL_EXECUTE | 12 | 19 |
| Cleanse uses assumed ordinary clearable control variants; ordered removal and undispellable variants are not modeled: DISPELL_ALL, CONTEXTUAL_EXECUTE | 12 | 19 |
| Event-dependent branch requires stateful simulation: OFFENSE_PERCENT_ADDITIVE | 12 | 18 |
| Event-dependent branch requires stateful simulation: SPEED, CONTEXTUAL_EXECUTE | 12 | 16 |
| Cooldown reset, event, recipient or execution ordering needs explicit state: ABILITY_COOLDOWN, RECOVER_ABILITIES_TAG, CONTEXTUAL_SKIP | 12 | 15 |
| Contextual gate has no source query: CONTEXTUAL_EXECUTE | 12 | 13 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, CONTEXTUAL_EXECUTE, NO_HEALTH_STEAL, NO_KILL | 11 | 50 |
| Unsupported alternatives in a partially modeled event group: CONTEXTUAL_EXECUTE | 11 | 40 |
| Unsupported alternatives in a partially modeled event group: CRITICAL_DAMAGE | 11 | 31 |
| Unmodeled operation BLACKBOARD_LIMIT: MAX_STAT_LIMIT | 11 | 24 |
| Event-dependent branch requires stateful simulation: SUPPRESSION, CONTEXTUAL_EXECUTE | 11 | 22 |
| Unsupported context query: CONTEXTUAL_EXECUTE | 11 | 22 |
| Unmodeled operation GRANT_ABILITY: UNRESISTABLE | 11 | 21 |
| Event-dependent branch requires stateful simulation: ATTACK_CRITICAL_NEGATE_PERCENT_ADDITIVE, UNRESISTABLE | 11 | 19 |
| Event-dependent branch requires stateful simulation: HEALTH_STEAL, UNRESISTABLE | 11 | 19 |
| Event-dependent branch requires stateful simulation: ATTACK_CRITICAL_NEGATE_PERCENT_ADDITIVE | 11 | 15 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: UNRESISTABLE, CONTEXTUAL_SKIP | 11 | 14 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: CONTEXTUAL_EXECUTE, OFFENSE_PERCENT_ADDITIVE, UNRESISTABLE | 11 | 14 |
| Unsupported alternatives in a partially modeled event group: ATTACK_CRITICAL_PERCENT_ADDITIVE | 10 | 30 |
| Unsupported alternatives in a partially modeled event group: ABILITY_CRITICAL_PERCENT_ADDITIVE | 10 | 30 |
| Unmodeled operation MODIFY_ULTIMATE_CHARGE: CONTEXTUAL_EXECUTE | 10 | 24 |
| Event-dependent branch requires stateful simulation: SPEED_FILL, PRIORITY, CONTEXTUAL_EXECUTE | 10 | 22 |
| Immunity/custom debuff requires effect-specific state: FORCE_DEBUFF, CONTEXTUAL_EXECUTE, UNRESISTABLE, SOURCE_OVERRIDE_CREATOR | 10 | 21 |
| Event-dependent branch requires stateful simulation: UNRESISTABLE, DISPELL_ALL, CONTEXTUAL_SKIP | 10 | 18 |
| Event-dependent branch requires stateful simulation: MAX_SHIELD, UNRESISTABLE | 10 | 17 |
| Additional immunity filters are outside the supported control types: CONTEXTUAL_EXECUTE | 10 | 16 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: UNRESISTABLE, DODGE_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 10 | 16 |
| Basic dispel effect state on bonus attacks and counters is not modeled: DISPELL_ALL | 10 | 15 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: CONTEXTUAL_SKIP, ATTACK_DAMAGE | 10 | 15 |
| Event-dependent branch requires stateful simulation: CONTEXTUAL_EXECUTE, UNRESISTABLE | 10 | 15 |
| Event-dependent branch requires stateful simulation: ABILITY_CRITICAL_NEGATE_PERCENT_ADDITIVE | 10 | 14 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: CONTEXTUAL_EXECUTE, ABILITY_CRITICAL_PERCENT_ADDITIVE, UNRESISTABLE | 10 | 13 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: CRITICAL_DAMAGE, UNRESISTABLE, CONTEXTUAL_EXECUTE | 10 | 12 |
| Event-dependent branch requires stateful simulation: UNRESISTABLE, CONTEXTUAL_SKIP | 10 | 11 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: HEALTH | 10 | 11 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: (no parameters) | 10 | 11 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: CONTEXTUAL_EXECUTE, DODGE_PERCENT_ADDITIVE | 10 | 11 |
| Unsupported alternatives in a partially modeled event group: SPEED_FILL | 10 | 11 |
| Unmodeled operation MODIFY_STAT: TAUNT, CONTEXTUAL_SKIP | 10 | 11 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ATTACK_CRITICAL_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 10 | 10 |
| Event-dependent branch requires stateful simulation: DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, NO_KILL, NO_HEALTH_STEAL, CONTEXTUAL_EXECUTE | 9 | 79 |
| Cooldown reset, event, recipient or execution ordering needs explicit state: ABILITY_COOLDOWN | 9 | 22 |
| Event-dependent branch requires stateful simulation: ACCURACY, CONTEXTUAL_EXECUTE | 9 | 18 |
| NO_KILL lethal floor requires current remaining Health and defeat state: ATTACK_DAMAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, CONDITIONAL_FILTER, NO_KILL | 9 | 16 |
| Source conditional filter semantics are not equivalent to context execution gates: ATTACK_DAMAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, CONDITIONAL_FILTER, NO_KILL | 9 | 16 |
| Event-dependent branch requires stateful simulation: CRITICAL_DAMAGE, CONTEXTUAL_EXECUTE | 9 | 15 |
| Unmodeled operation STAT_LIMIT: TAUNT, SUPPRESS_VISUALS, MAX_STAT_LIMIT, CONTEXTUAL_EXECUTE | 9 | 14 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: SUPPRESSION, CONTEXTUAL_EXECUTE | 9 | 13 |
| Unmodeled operation GRANT_ABILITY: (no parameters) | 9 | 12 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: BLACKBOARD_OVERRIDE, CONTEXTUAL_EXECUTE | 9 | 11 |
| Revival requires death state or default pool semantics: CONTEXTUAL_EXECUTE | 9 | 11 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: CONTEXTUAL_EXECUTE, ATTACK_CRITICAL_PERCENT_ADDITIVE, UNRESISTABLE | 9 | 10 |
| Full Turn Meter set/reset timing requires ordered action state: SPEED_FILL, PRIORITY | 9 | 9 |
| Unmodeled operation MODIFY_STAT: TAUNT, UNRESISTABLE, CONTEXTUAL_SKIP | 9 | 9 |
| Unsupported ancestor context query: DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL | 8 | 63 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, CONTEXTUAL_EXECUTE | 8 | 28 |
| Unmodeled operation SUMMON_UNIT: CONTEXTUAL_EXECUTE | 8 | 18 |
| Event-dependent branch requires stateful simulation: SPEED_FILL, UNRESISTABLE, CONTEXTUAL_EXECUTE | 8 | 16 |
| Temporary Protection uses bounded active capacity; depletion, expiry and stacking chronology are not modeled: MAX_HEALTH, CONTEXTUAL_EXECUTE | 8 | 16 |
| Event-dependent branch requires stateful simulation: ATTACK_DAMAGE, CONTEXT_MAX_MULTIPLIER | 8 | 13 |
| Event-dependent branch requires stateful simulation: ABILITY_POWER, CONTEXT_MAX_MULTIPLIER | 8 | 13 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: FORCE_DEBUFF, UNRESISTABLE, CONTEXTUAL_EXECUTE | 8 | 13 |
| Event-dependent branch requires stateful simulation: SUPPRESSION, UNRESISTABLE, CONTEXTUAL_EXECUTE | 8 | 12 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: DISPELL_ALL, CONTEXTUAL_SKIP, UNRESISTABLE | 8 | 11 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: CONTEXTUAL_EXECUTE, ABILITY_CRITICAL_NEGATE_PERCENT_ADDITIVE, UNRESISTABLE | 8 | 11 |
| Event-dependent branch requires stateful simulation: ARMOR, CONTEXT_MAX_MULTIPLIER | 8 | 10 |
| Event-dependent branch requires stateful simulation: SUPPRESSION, CONTEXT_MAX_MULTIPLIER | 8 | 10 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: SHIELD, UNRESISTABLE, CONTEXTUAL_EXECUTE | 8 | 9 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: EVASION_NEGATE_PERCENT_ADDITIVE, FORCE_DEBUFF, CONTEXTUAL_EXECUTE | 8 | 9 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: (no parameters) | 8 | 9 |
| Source conditional filter semantics are not equivalent to context execution gates: ABILITY_CRITICAL_PERCENT_ADDITIVE, UNRESISTABLE, CONTEXTUAL_FILTER | 8 | 9 |
| Unmodeled operation COPY_EFFECT: COPY_DEFINITION, UNRESISTABLE, CONTEXTUAL_EXECUTE | 8 | 9 |
| Event-dependent branch requires stateful simulation: MAX_HEALTH, CONTEXTUAL_EXECUTE | 8 | 8 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: OFFENSE_PERCENT_ADDITIVE, CONTEXTUAL_SKIP | 8 | 8 |
| Dispel filter/count/source semantics require active effect instance state: UNRESISTABLE | 7 | 38 |
| Event-dependent branch requires stateful simulation: RESISTANCE, CONTEXTUAL_EXECUTE | 7 | 13 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ACCURACY, CONTEXTUAL_EXECUTE | 7 | 12 |
| Event-dependent branch requires stateful simulation: ATTACK_DAMAGE, UNRESISTABLE, CONTEXT_MAX_MULTIPLIER | 7 | 12 |
| Unmodeled operation MODIFY_STAT: TAUNT | 7 | 12 |
| Basic dispel effect state on bonus attacks and counters is not modeled: UNRESISTABLE | 7 | 11 |
| Event-dependent branch requires stateful simulation: BLACKBOARD_OVERRIDE, CONTEXTUAL_SKIP | 7 | 11 |
| Event-dependent branch requires stateful simulation: ABILITY_CRITICAL_NEGATE_PERCENT_ADDITIVE, UNRESISTABLE, CONTEXTUAL_EXECUTE | 7 | 11 |
| Unsupported alternatives in a partially modeled event group: ATTACK_DAMAGE | 7 | 10 |
| Unsupported alternatives in a partially modeled event group: ATTACK_DAMAGE, CONTEXT_MAX_MULTIPLIER | 7 | 10 |
| Unmodeled operation QUERY_UNIT_VALUE: SHIELD, CURRENT_NUMERICAL | 7 | 10 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: HEALTH | 7 | 9 |
| Contextual gate has no source query: CONTEXTUAL_EXECUTE, ABILITY_CRITICAL_PERCENT_ADDITIVE, UNRESISTABLE | 7 | 9 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ATTACK_DAMAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, CONTEXTUAL_EXECUTE | 7 | 9 |
| Basic dispel effect state on bonus attacks and counters is not modeled: UNRESISTABLE, CONTEXTUAL_EXECUTE | 7 | 9 |
| Unmodeled operation STAT_LIMIT: UNRESISTABLE, SPEED, MAX_STAT_LIMIT, CONTEXTUAL_EXECUTE | 7 | 9 |
| Event-dependent branch requires stateful simulation: ARMOR, UNRESISTABLE, CONTEXTUAL_EXECUTE | 7 | 9 |
| Cooldown reset, event, recipient or execution ordering needs explicit state: ABILITY_COOLDOWN, RECOVER_ABILITIES_TAG, UNRESISTABLE | 7 | 8 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: SPEED_FILL, CONTEXTUAL_SKIP | 7 | 8 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: HEALTH_STEAL, CONTEXTUAL_EXECUTE, UNRESISTABLE | 7 | 8 |
| Unsupported alternatives in a partially modeled event group: UNRESISTABLE, CONTEXTUAL_SKIP, DISPELL_ALL | 7 | 8 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: SHIELD | 7 | 8 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ATTACK_CRITICAL_PERCENT_ADDITIVE, UNRESISTABLE | 7 | 8 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ABILITY_CRITICAL_PERCENT_ADDITIVE, UNRESISTABLE | 7 | 8 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ARMOR_PENETRATION, CONTEXTUAL_EXECUTE | 7 | 8 |
| Unsupported alternatives in a partially modeled event group: SPEED | 7 | 7 |
| Unsupported alternatives in a partially modeled event group: UNRESISTABLE, ATTACK_CRITICAL_PERCENT_ADDITIVE | 7 | 7 |
| Unsupported alternatives in a partially modeled event group: UNRESISTABLE, DODGE_PERCENT_ADDITIVE | 7 | 7 |
| Unsupported alternatives in a partially modeled event group: UNRESISTABLE, DEFLECTION_PERCENT_ADDITIVE | 7 | 7 |
| Unsupported context query: SPEED, CONTEXTUAL_EXECUTE, UNRESISTABLE | 7 | 7 |
| Dispel filter/count/source semantics require active effect instance state: UNRESISTABLE, CONTEXTUAL_EXECUTE | 6 | 26 |
| NO_KILL lethal floor requires current remaining Health and defeat state: DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, NO_KILL | 6 | 21 |
| Unmodeled operation MODIFY_STAT: SHIELD_PENETRATION | 6 | 18 |
| Unsupported context query: UNRESISTABLE, CONTEXTUAL_EXECUTE, COUNTER_ATTACK_RATING | 6 | 14 |
| Event-dependent branch requires stateful simulation: FORCE_DEBUFF, UNRESISTABLE | 6 | 13 |
| Event-dependent branch requires stateful simulation: MAX_HEALTH, CONTEXT_MAX_MULTIPLIER | 6 | 13 |
| Event-dependent branch requires stateful simulation: CONTEXTUAL_EXECUTE, MAX_HEALTH, UNRESISTABLE | 6 | 12 |
| Unsupported context query: DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, CONTEXTUAL_SKIP | 6 | 12 |
| Cooldown reset, event, recipient or execution ordering needs explicit state: ABILITY_COOLDOWN, CONTEXTUAL_EXECUTE | 6 | 11 |
| Health/Protection equalization or redistribution needs current pool state: SHIELD | 6 | 11 |
| Immunity/custom debuff requires effect-specific state: FORCE_DEBUFF, UNRESISTABLE, CONTEXTUAL_SKIP | 6 | 11 |
| Event-dependent branch requires stateful simulation: SPEED, CONTEXTUAL_EXECUTE, UNRESISTABLE | 6 | 10 |
| Event-dependent branch requires stateful simulation: UNRESISTABLE, SHIELD | 6 | 10 |
| Unmodeled operation BLACKBOARD_LIMIT: MAX_STAT_LIMIT, CONTEXTUAL_EXECUTE | 6 | 10 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: DISPELL_ALL | 6 | 10 |
| Event-dependent branch requires stateful simulation: COUNTER_ATTACK_RATING, UNRESISTABLE, CONTEXTUAL_EXECUTE | 6 | 10 |
| Contextual gate has no source query: CONTEXTUAL_EXECUTE, COUNTER_ATTACK_RATING, UNRESISTABLE | 6 | 10 |
| Cooldown reset, event, recipient or execution ordering needs explicit state: ABILITY_COOLDOWN, UNRESISTABLE, CONTEXTUAL_EXECUTE, RECOVER_ABILITIES_TAG | 6 | 10 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: SHIELD | 6 | 9 |
| Unsupported context query: ATTACK_DAMAGE, CONTEXTUAL_EXECUTE | 6 | 9 |
| Unsupported context query: ABILITY_POWER, CONTEXTUAL_EXECUTE | 6 | 9 |
| Unsupported alternatives in a partially modeled event group: ABILITY_POWER, CONTEXT_MAX_MULTIPLIER | 6 | 9 |
| Event-dependent branch requires stateful simulation: FORCE_DEBUFF | 6 | 8 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: SUPPRESSION_PENETRATION, UNRESISTABLE, CONTEXTUAL_EXECUTE | 6 | 8 |
| Event-dependent branch requires stateful simulation: UNRESISTABLE, DEFLECTION_PERCENT_ADDITIVE | 6 | 8 |
| Unsupported alternatives in a partially modeled event group: SPEED, CONTEXT_MAX_MULTIPLIER | 6 | 8 |
| Unsupported alternatives in a partially modeled event group: RESISTANCE | 6 | 8 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ATTACK_DAMAGE, CONTEXTUAL_SKIP, NO_COUNTER_ATTACK | 6 | 8 |
| Event-dependent branch requires stateful simulation: ABILITY_CRITICAL_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 6 | 8 |
| Ability tags without RECOVER_ABILITIES_TAG have unverified semantics: ABILITY_COOLDOWN | 6 | 8 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: ATTACK_DAMAGE, UNRESISTABLE | 6 | 8 |
| Event-dependent branch requires stateful simulation: SPEED_FILL, PRIORITY, CONTEXTUAL_SKIP | 6 | 7 |
| Fear or special control removal lacks checked undispellable-effect bypass semantics: DISPELL_ALL, CONTEXTUAL_EXECUTE | 6 | 7 |
| Unmodeled operation STAT_LIMIT: UNRESISTABLE, SPEED, MAX_STAT_LIMIT | 6 | 7 |
| Unsupported context query: UNRESISTABLE, DISPELL_ALL, CONTEXTUAL_EXECUTE | 6 | 7 |
| Event-dependent branch requires stateful simulation: ATTACK_CRITICAL_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 6 | 7 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: SPEED_FILL, UNRESISTABLE | 6 | 7 |
| Unsupported context query: HEALTH, CONTEXTUAL_EXECUTE | 6 | 7 |
| Event-dependent branch requires stateful simulation: MAX_HEALTH, CONTEXTUAL_SKIP | 6 | 7 |
| Unsupported ancestor context query: (no parameters) | 6 | 7 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: FORCE_DEBUFF | 6 | 6 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ABILITY_CRITICAL_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 6 | 6 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: FORCE_DEBUFF, CONTEXTUAL_SKIP | 6 | 6 |
| Enemy clearable buff removal uses bounded buff-share proxy; individual buff lifetime and dispellability state are not modeled: DISPELL_ALL, CONTEXTUAL_EXECUTE | 6 | 6 |
| Unsupported alternatives in a partially modeled event group: SUPPRESSION, UNRESISTABLE | 6 | 6 |
| Event-dependent branch requires stateful simulation: OFFENSE_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 6 | 6 |
| Event-dependent branch requires stateful simulation: ARMOR_PENETRATION | 6 | 6 |
| Unmodeled operation FLEE: CONTEXTUAL_SKIP | 6 | 6 |
| Unsupported alternatives in a partially modeled event group: UNRESISTABLE, CONTEXTUAL_EXECUTE | 6 | 6 |
| Unsupported alternatives in a partially modeled event group: UNRESISTABLE, CONTEXTUAL_EXECUTE, DISPELL_ALL | 6 | 6 |
| Event-dependent branch requires stateful simulation: ATTACK_DAMAGE, CONTEXTUAL_SKIP | 6 | 6 |
| Unsupported alternatives in a partially modeled event group: ATTACK_DAMAGE, UNRESISTABLE | 6 | 6 |
| Unsupported alternatives in a partially modeled event group: DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL | 5 | 18 |
| Event-dependent branch requires stateful simulation: UNRESISTABLE, HEALTH | 5 | 9 |
| Event-dependent branch requires stateful simulation: COUNTER_ATTACK_RATING | 5 | 9 |
| Event-dependent branch requires stateful simulation: ATTACK_CRITICAL_NEGATE_PERCENT_ADDITIVE, UNRESISTABLE, CONTEXTUAL_EXECUTE | 5 | 9 |
| Cleanse uses assumed ordinary clearable control variants; ordered removal and undispellable variants are not modeled: DISPELL_ALL, UNRESISTABLE, CONTEXTUAL_EXECUTE | 5 | 8 |
| Basic dispel effect state on bonus attacks and counters is not modeled: CONTEXTUAL_EXECUTE | 5 | 8 |
| Event-dependent branch requires stateful simulation: ABILITY_CRITICAL_PERCENT_ADDITIVE, UNRESISTABLE, CONTEXTUAL_EXECUTE | 5 | 7 |
| Source conditional filter semantics are not equivalent to context execution gates: CRITICAL_DAMAGE, UNRESISTABLE, CONDITIONAL_FILTER | 5 | 7 |
| Unmodeled operation COPY_EFFECT: COPY_DEFINITION, UNRESISTABLE, CONTEXTUAL_SKIP | 5 | 7 |
| Immunity/custom debuff requires effect-specific state: CONTEXTUAL_SKIP, FORCE_DEBUFF | 5 | 7 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: UNRESISTABLE, DISPELL_ALL | 5 | 7 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: CONTEXTUAL_EXECUTE | 5 | 6 |
| Unsupported alternatives in a partially modeled event group: ATTACK_CRITICAL_NEGATE_PERCENT_ADDITIVE, UNRESISTABLE | 5 | 6 |
| Unsupported alternatives in a partially modeled event group: ABILITY_CRITICAL_NEGATE_PERCENT_ADDITIVE, UNRESISTABLE | 5 | 6 |
| Basic follow-up event/TM propagation on bonus attacks or counters is not modeled: CONTEXTUAL_SKIP | 5 | 6 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ACCURACY, UNRESISTABLE, CONTEXTUAL_EXECUTE | 5 | 6 |
| Unsupported alternatives in a partially modeled event group: ARMOR, UNRESISTABLE | 5 | 6 |
| Unmodeled operation STAT_LIMIT: FORCE_DEBUFF, MAX_SHIELD, MAX_STAT_LIMIT, UNRESISTABLE | 5 | 6 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: SPEED, CONTEXTUAL_SKIP | 5 | 6 |
| Unsupported alternatives in a partially modeled event group: CRITICAL_DAMAGE, UNRESISTABLE | 5 | 6 |
| Temporary Protection uses bounded active capacity; depletion, expiry and stacking chronology are not modeled: MAX_HEALTH, CONTEXTUAL_SKIP | 5 | 6 |
| Unsupported context query: BLACKBOARD_OVERRIDE | 5 | 6 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: SUPPRESSION_PENETRATION, CONTEXTUAL_EXECUTE | 5 | 6 |
| Event-dependent branch requires stateful simulation: ATTACK_CRITICAL_NEGATE_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 5 | 6 |
| Event-dependent branch requires stateful simulation: ABILITY_CRITICAL_NEGATE_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 5 | 6 |
| Temporary Protection uses bounded active capacity; depletion, expiry and stacking chronology are not modeled: MAX_HEALTH, UNRESISTABLE, CONTEXT_MAX_MULTIPLIER | 5 | 6 |
| Temporary Protection uses bounded active capacity; depletion, expiry and stacking chronology are not modeled: MAX_HEALTH, UNRESISTABLE, CONTEXTUAL_SKIP | 5 | 6 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: ATTACK_CRITICAL_PERCENT_ADDITIVE, UNRESISTABLE | 5 | 5 |
| Unsupported alternatives in a partially modeled event group: ABILITY_POWER | 5 | 5 |
| Event-dependent branch requires stateful simulation: ABILITY_POWER, UNRESISTABLE, CONTEXT_MAX_MULTIPLIER | 5 | 5 |
| Unsupported alternatives in a partially modeled event group: UNRESISTABLE, ABILITY_CRITICAL_PERCENT_ADDITIVE | 5 | 5 |
| Event-dependent branch requires stateful simulation: HEALTH_STEAL | 5 | 5 |
| Full Turn Meter set/reset timing requires ordered action state: SPEED_FILL, PRIORITY, CONTEXTUAL_SKIP | 5 | 5 |
| Contextual gate has no source query: SUPPRESSION_PENETRATION, CONTEXTUAL_EXECUTE, UNRESISTABLE | 5 | 5 |
| Full Turn Meter set/reset timing requires ordered action state: SPEED_FILL, UNRESISTABLE, PRIORITY | 5 | 5 |
| Event-dependent branch requires stateful simulation: SUPPRESSION_PENETRATION | 5 | 5 |
| Unsupported alternatives in a partially modeled event group: SPEED_FILL, UNRESISTABLE, CONTEXTUAL_EXECUTE | 5 | 5 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: UNRESISTABLE, ABILITY_POWER | 5 | 5 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: EVASION_NEGATE_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 5 | 5 |
| Basic follow-up event/TM propagation on bonus attacks or counters is not modeled: SPEED_FILL, UNRESISTABLE | 5 | 5 |
| Unsupported alternatives in a partially modeled event group: ARMOR | 5 | 5 |
| Unsupported alternatives in a partially modeled event group: SUPPRESSION | 5 | 5 |
| Cleanse uses assumed ordinary clearable control variants; ordered removal and undispellable variants are not modeled: CONTEXTUAL_EXECUTE | 5 | 5 |
| Event-dependent branch requires stateful simulation: DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, CONTEXTUAL_EXECUTE | 4 | 24 |
| Event-dependent branch requires stateful simulation: ABILITY_POWER, DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL | 4 | 18 |
| NO_KILL lethal floor requires current remaining Health and defeat state: ATTACK_DAMAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, NO_KILL, CONTEXTUAL_EXECUTE | 4 | 17 |
| Unmodeled operation SCRIPT_COMPONENT: PLAY_CUTSCENE | 4 | 17 |
| Basic follow-up event/TM propagation on bonus attacks or counters is not modeled: DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, CONTEXTUAL_EXECUTE | 4 | 15 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL | 4 | 15 |
| Unsupported alternatives in a partially modeled event group: SPEED_FILL, CONTEXTUAL_EXECUTE | 4 | 12 |
| Unmodeled operation GRANT_ABILITY: CONTEXTUAL_EXECUTE | 4 | 11 |
| Contextual gate has no source query: CONTEXTUAL_EXECUTE, FORCE_DEBUFF | 4 | 9 |
| Contextual gate has no source query: ABILITY_POWER, CONTEXTUAL_EXECUTE | 4 | 8 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: RESISTANCE, CONTEXTUAL_EXECUTE | 4 | 8 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ARMOR, UNRESISTABLE, FORCE_DEBUFF, CONTEXTUAL_EXECUTE | 4 | 8 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: SUPPRESSION, UNRESISTABLE, FORCE_DEBUFF, CONTEXTUAL_EXECUTE | 4 | 8 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ABILITY_CRITICAL_NEGATE_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 4 | 8 |
| Unmodeled operation IMMUNITY: CONTEXTUAL_FILTER | 4 | 8 |
| Unsupported alternatives in a partially modeled event group: SPEED, UNRESISTABLE | 4 | 7 |
| NO_KILL lethal floor requires current remaining Health and defeat state: ATTACK_DAMAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, NO_KILL | 4 | 7 |
| Event-dependent branch requires stateful simulation: ARMOR_PENETRATION_PERCENT_ADDITIVE, UNRESISTABLE | 4 | 7 |
| Unmodeled operation QUERY_UNIT_VALUE: SPEED_FILL, CURRENT_PERCENTAGE, CONTEXTUAL_EXECUTE | 4 | 7 |
| Basic dispel effect state on bonus attacks and counters is not modeled: DISPELL_ALL, CONTEXTUAL_SKIP | 4 | 7 |
| Basic dispel effect state on bonus attacks and counters is not modeled: CONTEXTUAL_EXECUTE, DISPELL_ALL | 4 | 7 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: UNRESISTABLE, CONTEXTUAL_SKIP, ATTACK_DAMAGE | 4 | 7 |
| Contextual gate has no source query: ARMOR, CONTEXTUAL_EXECUTE | 4 | 6 |
| Forced ability needs explicit rotation/target state: (no parameters) | 4 | 6 |
| Unmodeled operation HEALTH_LIMIT: MIN_HEALTH_LIMIT, MAX_HEALTH, CONTEXTUAL_SKIP | 4 | 6 |
| Unsupported alternatives in a partially modeled event group: SPEED_FILL, UNRESISTABLE | 4 | 6 |
| Event-dependent branch requires stateful simulation: CRITICAL_CHANCE_PERCENT_ADDITIVE | 4 | 6 |
| Event-dependent branch requires stateful simulation: ARMOR, CONTEXTUAL_SKIP | 4 | 6 |
| Additional immunity filters are outside the supported control types: CONTEXTUAL_SKIP | 4 | 6 |
| Unsupported context query: FORCE_DEBUFF, CONTEXTUAL_EXECUTE, UNRESISTABLE | 4 | 6 |
| Contextual gate has no source query: SUPPRESSION, CONTEXTUAL_EXECUTE | 4 | 5 |
| Unsupported alternatives in a partially modeled event group: SPEED, UNRESISTABLE, CONTEXTUAL_EXECUTE | 4 | 5 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ARMOR, UNRESISTABLE, CONTEXTUAL_SKIP | 4 | 5 |
| Unsupported alternatives in a partially modeled event group: COUNTER_ATTACK_RATING, UNRESISTABLE | 4 | 5 |
| Unmodeled operation IMMUNITY: CONTEXTUAL_FILTER, UNRESISTABLE | 4 | 5 |
| Unsupported alternatives in a partially modeled event group: MAX_HEALTH, CONTEXT_MAX_MULTIPLIER | 4 | 5 |
| Unsupported context query: UNRESISTABLE, CRITICAL_DAMAGE, CONTEXTUAL_EXECUTE | 4 | 5 |
| Event-dependent branch requires stateful simulation: CONTEXTUAL_EXECUTE, RESISTANCE, UNRESISTABLE | 4 | 5 |
| Event-dependent branch requires stateful simulation: UNRESISTABLE, FORCE_DEBUFF, SUPPRESS_VISUALS | 4 | 4 |
| Unsupported alternatives in a partially modeled event group: RESISTANCE, UNRESISTABLE | 4 | 4 |
| Multiplicative or contextual cooldown amount requires ordered cooldown state: ABILITY_COOLDOWN, RECOVER_ABILITIES_TAG, UNRESISTABLE | 4 | 4 |
| Unsupported alternatives in a partially modeled event group: HEALTH | 4 | 4 |
| Unsupported alternatives in a partially modeled event group: SHIELD | 4 | 4 |
| Unsupported alternatives in a partially modeled event group: UNRESISTABLE, DODGE_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 4 | 4 |
| Unsupported alternatives in a partially modeled event group: UNRESISTABLE, DEFLECTION_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 4 | 4 |
| Contextual gate has no source query: CONTEXTUAL_EXECUTE, ABILITY_CRITICAL_PERCENT_ADDITIVE | 4 | 4 |
| Contextual gate has no source query: EVASION_NEGATE_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 4 | 4 |
| Contextual gate has no source query: CRITICAL_DAMAGE, CONTEXTUAL_EXECUTE | 4 | 4 |
| Event-dependent branch requires stateful simulation: ARMOR_PENETRATION, UNRESISTABLE | 4 | 4 |
| Event-dependent branch requires stateful simulation: MAX_SHIELD, CONTEXTUAL_EXECUTE | 4 | 4 |
| Unsupported context query: PRIORITY, CONTEXTUAL_EXECUTE, SPEED_FILL | 4 | 4 |
| Contextual gate has no source query: DISPELL_ALL, UNRESISTABLE, CONTEXTUAL_EXECUTE | 4 | 4 |
| Event-dependent branch requires stateful simulation: DODGE_PERCENT_ADDITIVE | 4 | 4 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: ATTACK_DAMAGE | 4 | 4 |
| Contextual gate has no source query: SPEED_FILL, CONTEXTUAL_EXECUTE | 4 | 4 |
| Unsupported context query: SPEED, CONTEXTUAL_EXECUTE | 4 | 4 |
| Unsupported alternatives in a partially modeled event group: UNRESISTABLE, CONTEXTUAL_SKIP | 4 | 4 |
| Unsupported alternatives in a partially modeled event group: ARMOR, UNRESISTABLE, CONTEXTUAL_EXECUTE | 4 | 4 |
| Unsupported context query: UNRESISTABLE, CONTEXTUAL_EXECUTE | 4 | 4 |
| Event-dependent branch requires stateful simulation: ATTACK_DAMAGE, NO_COUNTER_ATTACK | 4 | 4 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: SPEED_FILL, PRIORITY, CONTEXTUAL_SKIP | 4 | 4 |
| Unsupported context query: SPEED_FILL, CONTEXTUAL_EXECUTE | 4 | 4 |
| Event-dependent branch requires stateful simulation: ARMOR, UNRESISTABLE, CONTEXT_MAX_MULTIPLIER | 4 | 4 |
| Unmodeled operation SUMMON_UNIT: TRANSFORM | 4 | 4 |
| Unsupported alternatives in a partially modeled event group: MAX_HEALTH, CONTEXTUAL_EXECUTE | 4 | 4 |
| Unsupported alternatives in a partially modeled event group: MAX_HEALTH, UNRESISTABLE, CONTEXTUAL_EXECUTE | 4 | 4 |
| Event-dependent branch requires stateful simulation: ABILITY_POWER, CONTEXTUAL_SKIP | 4 | 4 |
| Event-dependent branch requires stateful simulation: SHIELD, CONTEXT_MAX_MULTIPLIER | 4 | 4 |
| Unsupported alternatives in a partially modeled event group: ABILITY_POWER, UNRESISTABLE | 4 | 4 |
| Event-dependent branch requires stateful simulation: DODGE_PERCENT_ADDITIVE, UNRESISTABLE, FORCE_DEBUFF, CONTEXTUAL_EXECUTE | 3 | 24 |
| Event-dependent branch requires stateful simulation: DEFLECTION_PERCENT_ADDITIVE, UNRESISTABLE, FORCE_DEBUFF, CONTEXTUAL_EXECUTE | 3 | 24 |
| Event-dependent branch requires stateful simulation: RESISTANCE, UNRESISTABLE, FORCE_DEBUFF, CONTEXTUAL_EXECUTE | 3 | 24 |
| Event-dependent branch requires stateful simulation: ATTACK_DAMAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, NO_KILL, CONTEXTUAL_EXECUTE | 3 | 16 |
| Unsupported context query: UNRESISTABLE, DISPELL_ALL, CONTEXTUAL_SKIP | 3 | 13 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ABILITY_POWER, DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL | 3 | 12 |
| Basic follow-up event/TM propagation on bonus attacks or counters is not modeled: ABILITY_POWER, DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL | 3 | 12 |
| Event-dependent branch requires stateful simulation: DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, NO_KILL | 3 | 10 |
| Unmodeled operation MODIFY_RECOVER: INCOMING, SHIELD | 3 | 10 |
| Event-dependent branch requires stateful simulation: ACCURACY, CONTEXTUAL_EXECUTE, UNRESISTABLE | 3 | 8 |
| Recovery context has no explicit source query or damage result: HEALTH | 3 | 8 |
| Source conditional filter semantics are not equivalent to context execution gates: DEFLECTION_PERCENT_ADDITIVE, UNRESISTABLE, FORCE_DEBUFF, CONTEXTUAL_FILTER | 3 | 8 |
| Source conditional filter semantics are not equivalent to context execution gates: RESISTANCE, UNRESISTABLE, FORCE_DEBUFF, CONTEXTUAL_FILTER | 3 | 8 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: BLACKBOARD_OVERRIDE | 3 | 7 |
| Unmodeled operation IMMUNITY: FORCE_BUFF, CONTEXTUAL_EXECUTE | 3 | 7 |
| Event-dependent branch requires stateful simulation: ATTACK_DAMAGE, UNRESISTABLE, CONTEXTUAL_SKIP | 3 | 7 |
| Cleanse uses assumed ordinary clearable control variants; ordered removal and undispellable variants are not modeled: (no parameters) | 3 | 7 |
| Event-dependent branch requires stateful simulation: OFFENSE_PERCENT_ADDITIVE, UNRESISTABLE, CONTEXTUAL_EXECUTE | 3 | 6 |
| Event-dependent branch requires stateful simulation: SUPPRESSION_PENETRATION_PERCENT_ADDITIVE, UNRESISTABLE | 3 | 6 |
| Unmodeled operation QUERY_UNIT_VALUE: SPEED_FILL, CURRENT_PERCENTAGE | 3 | 6 |
| Unmodeled operation QUERY_UNIT_VALUE: SPEED_FILL, CURRENT_PERCENTAGE, CONTEXTUAL_SKIP | 3 | 6 |
| Unmodeled operation BLACKBOARD_COMPARE: LESS_THAN | 3 | 6 |
| Event-dependent branch requires stateful simulation: UNRESISTABLE, FORCE_DEBUFF, ATTACK_CRITICAL_NEGATE_PERCENT_ADDITIVE | 3 | 6 |
| Event-dependent branch requires stateful simulation: UNRESISTABLE, FORCE_DEBUFF, ABILITY_CRITICAL_NEGATE_PERCENT_ADDITIVE | 3 | 6 |
| Event-dependent branch requires stateful simulation: UNRESISTABLE, FORCE_DEBUFF, ATTACK_CRITICAL_PERCENT_ADDITIVE | 3 | 6 |
| Event-dependent branch requires stateful simulation: UNRESISTABLE, FORCE_DEBUFF, ABILITY_CRITICAL_PERCENT_ADDITIVE | 3 | 6 |
| Event-dependent branch requires stateful simulation: FORCE_DEBUFF, SUPPRESS_VISUALS | 3 | 6 |
| Unmodeled operation MODIFY_STAT: CONTEXTUAL_EXECUTE, MASTERY | 3 | 6 |
| Cleanse uses assumed ordinary clearable control variants; ordered removal and undispellable variants are not modeled: UNRESISTABLE, DISPELL_ALL, CONTEXTUAL_SKIP | 3 | 6 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: COUNTER_ATTACK_RATING, CONTEXTUAL_SKIP | 3 | 5 |
| Event-dependent branch requires stateful simulation: ATTACK_DAMAGE, NO_HEALTH_STEAL | 3 | 5 |
| Source conditional filter semantics are not equivalent to context execution gates: HEALTH_STEAL, UNRESISTABLE, CONDITIONAL_FILTER | 3 | 5 |
| Event-dependent branch requires stateful simulation: HEALTH_STEAL, UNRESISTABLE, CONTEXTUAL_EXECUTE | 3 | 5 |
| Event-dependent branch requires stateful simulation: HEALTH_STEAL, CONTEXTUAL_EXECUTE | 3 | 5 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: COUNTER_ATTACK_RATING, CONTEXTUAL_EXECUTE | 3 | 5 |
| Unmodeled operation BLACKBOARD_LIMIT: MAX_STAT_LIMIT, UNRESISTABLE | 3 | 5 |
| Event-dependent branch requires stateful simulation: SUPPRESSION, CONTEXTUAL_SKIP | 3 | 5 |
| Unmodeled operation MODIFY_CATEGORY: CONTEXTUAL_EXECUTE | 3 | 4 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: HEALTH, UNRESISTABLE, CONTEXTUAL_EXECUTE | 3 | 4 |
| Event-dependent branch requires stateful simulation: SHIELD, UNRESISTABLE, CONTEXTUAL_EXECUTE | 3 | 4 |
| Unmodeled operation SQUAD_BLACKBOARD_MODIFY: CONTEXTUAL_EXECUTE | 3 | 4 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ARMOR_PENETRATION, UNRESISTABLE, CONTEXTUAL_EXECUTE | 3 | 4 |
| Event-dependent branch requires stateful simulation: SPEED, CONTEXTUAL_SKIP | 3 | 4 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: UNRESISTABLE | 3 | 4 |
| Source conditional filter semantics are not equivalent to context execution gates: SPEED, CONTEXTUAL_FILTER, UNRESISTABLE | 3 | 4 |
| Source conditional filter semantics are not equivalent to context execution gates: SPEED_FILL, CONTEXTUAL_FILTER | 3 | 4 |
| Event-dependent branch requires stateful simulation: SUPPRESSION_PENETRATION, CONTEXTUAL_EXECUTE | 3 | 4 |
| Event-dependent branch requires stateful simulation: DODGE_PERCENT_ADDITIVE, UNRESISTABLE, CONTEXTUAL_EXECUTE | 3 | 4 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: MAX_HEALTH, CONTEXTUAL_SKIP | 3 | 4 |
| Source conditional filter semantics are not equivalent to context execution gates: ATTACK_DAMAGE, CONTEXTUAL_FILTER, UNRESISTABLE | 3 | 4 |
| Unmodeled operation COPY_EFFECT: COPY_DEFINITION, UNRESISTABLE | 3 | 4 |
| Event-dependent branch requires stateful simulation: EVASION_NEGATE_PERCENT_ADDITIVE | 3 | 4 |
| Cooldown reset, event, recipient or execution ordering needs explicit state: ABILITY_COOLDOWN, UNRESISTABLE | 3 | 4 |
| Unsupported alternatives in a partially modeled event group: ARMOR, CONTEXT_MAX_MULTIPLIER | 3 | 4 |
| Unsupported alternatives in a partially modeled event group: SUPPRESSION, CONTEXT_MAX_MULTIPLIER | 3 | 4 |
| Unsupported alternatives in a partially modeled event group: ACCURACY | 3 | 4 |
| Basic follow-up event/TM propagation on bonus attacks or counters is not modeled: DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, CONTEXTUAL_SKIP | 3 | 4 |
| Source conditional filter semantics are not equivalent to context execution gates: UNRESISTABLE, CONTEXTUAL_FILTER | 3 | 4 |
| Immunity/custom debuff requires effect-specific state: UNRESISTABLE, FORCE_DEBUFF, CONTEXTUAL_FILTER | 3 | 4 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: CONTEXTUAL_EXECUTE, ATTACK_CRITICAL_NEGATE_PERCENT_ADDITIVE, UNRESISTABLE | 3 | 4 |
| Event-dependent branch requires stateful simulation: UNRESISTABLE, CRITICAL_DAMAGE, CONTEXTUAL_EXECUTE | 3 | 4 |
| Additional immunity filters are outside the supported control types: UNRESISTABLE | 3 | 4 |
| Unmodeled operation MODIFY_STAT: MASTERY, CONTEXT_MAX_MULTIPLIER | 3 | 4 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: CONTEXTUAL_SKIP, SHIELD | 3 | 4 |
| Unsupported ancestor context query: CONTEXTUAL_EXECUTE | 3 | 4 |
| Unsupported context query: SPEED_FILL, UNRESISTABLE, CONTEXTUAL_EXECUTE | 3 | 4 |
| Unmodeled operation GRANT_ABILITY: UNRESISTABLE, CONTEXTUAL_EXECUTE | 3 | 4 |
| Event-dependent branch requires stateful simulation: SPEED, CONTEXT_MAX_MULTIPLIER | 3 | 4 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: ABILITY_CRITICAL_PERCENT_ADDITIVE, UNRESISTABLE | 3 | 3 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: DISPELL_ALL | 3 | 3 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: CRITICAL_CHANCE_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE, UNRESISTABLE | 3 | 3 |
| Contextual gate has no source query: ATTACK_DAMAGE, UNRESISTABLE, CONTEXTUAL_EXECUTE | 3 | 3 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: CRITICAL_DAMAGE, CONTEXTUAL_EXECUTE | 3 | 3 |
| Unsupported alternatives in a partially modeled event group: CONTEXTUAL_EXECUTE, ABILITY_CRITICAL_NEGATE_PERCENT_ADDITIVE, UNRESISTABLE | 3 | 3 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: MAX_HEALTH, UNRESISTABLE | 3 | 3 |
| Contextual gate has no source query: MAX_HEALTH, CONTEXTUAL_EXECUTE | 3 | 3 |
| Unsupported ancestor context query: SHIELD | 3 | 3 |
| Ability tags without RECOVER_ABILITIES_TAG have unverified semantics: ABILITY_COOLDOWN, CONTEXTUAL_EXECUTE | 3 | 3 |
| Unsupported context query: SHIELD, CONTEXTUAL_EXECUTE | 3 | 3 |
| Contextual gate has no source query: CONTEXTUAL_EXECUTE, DODGE_PERCENT_ADDITIVE | 3 | 3 |
| Event-dependent branch requires stateful simulation: SUPPRESSION_PENETRATION, UNRESISTABLE | 3 | 3 |
| Unsupported alternatives in a partially modeled event group: ARMOR, CONTEXTUAL_EXECUTE, CONTEXT_MAX_MULTIPLIER | 3 | 3 |
| Unsupported alternatives in a partially modeled event group: SUPPRESSION, CONTEXTUAL_EXECUTE, CONTEXT_MAX_MULTIPLIER | 3 | 3 |
| Unsupported context query: ARMOR, CONTEXTUAL_SKIP | 3 | 3 |
| Event-dependent branch requires stateful simulation: ARMOR_PENETRATION, CONTEXTUAL_EXECUTE | 3 | 3 |
| Unsupported alternatives in a partially modeled event group: COUNTER_ATTACK_RATING | 3 | 3 |
| Basic follow-up event/TM propagation on bonus attacks or counters is not modeled: SPEED_FILL | 3 | 3 |
| Event-dependent branch requires stateful simulation: DEFLECTION_PERCENT_ADDITIVE | 3 | 3 |
| Unsupported alternatives in a partially modeled event group: COUNTER_ATTACK_RATING, UNRESISTABLE, CONTEXTUAL_EXECUTE | 3 | 3 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: FORCE_DEBUFF, CONTEXTUAL_SKIP, UNRESISTABLE | 3 | 3 |
| Unmodeled operation BLACKBOARD_LIMIT: MIN_STAT_LIMIT | 3 | 3 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: ATTACK_CRITICAL_PERCENT_ADDITIVE | 3 | 3 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: ABILITY_CRITICAL_PERCENT_ADDITIVE | 3 | 3 |
| Full Turn Meter set/reset timing requires ordered action state: SPEED_FILL, PRIORITY, CONTEXTUAL_EXECUTE | 3 | 3 |
| Unsupported alternatives in a partially modeled event group: SUPPRESSION, UNRESISTABLE, CONTEXTUAL_EXECUTE | 3 | 3 |
| Source conditional filter semantics are not equivalent to context execution gates: CONTEXTUAL_FILTER, ARMOR, UNRESISTABLE | 3 | 3 |
| Unmodeled operation BLACKBOARD_LOOP: (no parameters) | 3 | 3 |
| Basic dispel effect state on bonus attacks and counters is not modeled: (no parameters) | 3 | 3 |
| Event-dependent branch requires stateful simulation: SUPPRESSION, UNRESISTABLE, CONTEXT_MAX_MULTIPLIER | 3 | 3 |
| Event-dependent branch requires stateful simulation: HEALTH, CONTEXT_MAX_MULTIPLIER | 3 | 3 |
| Source conditional filter semantics are not equivalent to context execution gates: ATTACK_CRITICAL_PERCENT_ADDITIVE, UNRESISTABLE, CONTEXTUAL_FILTER | 3 | 3 |
| Unsupported alternatives in a partially modeled event group: CONTEXTUAL_EXECUTE, ATTACK_CRITICAL_PERCENT_ADDITIVE | 3 | 3 |
| Unsupported alternatives in a partially modeled event group: CONTEXTUAL_EXECUTE, ABILITY_CRITICAL_PERCENT_ADDITIVE | 3 | 3 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: SUPPRESSION_PENETRATION_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 3 | 3 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ATTACK_CRITICAL_PERCENT_ADDITIVE, CONTEXTUAL_SKIP | 3 | 3 |
| Unsupported alternatives in a partially modeled event group: CONTEXTUAL_EXECUTE, SPEED | 3 | 3 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: HEALTH, CONTEXTUAL_EXECUTE | 3 | 3 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: SHIELD, CONTEXTUAL_EXECUTE | 3 | 3 |
| Unsupported context query: ABILITY_POWER, UNRESISTABLE, CONTEXTUAL_EXECUTE | 3 | 3 |
| Unsupported alternatives in a partially modeled event group: SHIELD, CONTEXTUAL_EXECUTE, UNRESISTABLE | 3 | 3 |
| Event-dependent branch requires stateful simulation: DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, CONTEXTUAL_SKIP | 2 | 12 |
| Unmodeled operation STAT_LIMIT: TAUNT, UNRESISTABLE, SUPPRESS_VISUALS, MAX_STAT_LIMIT, CONTEXTUAL_EXECUTE | 2 | 10 |
| Source conditional filter semantics are not equivalent to context execution gates: DAMAGE_HEALTH_PERCENTAGE, CONDITIONAL_FILTER, NO_COUNTER_ATTACK, NO_HEALTH_STEAL | 2 | 9 |
| Unsupported alternatives in a partially modeled event group: DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, NO_KILL | 2 | 9 |
| Unmodeled operation MODIFY_RECOVER: INCOMING, HEALTH | 2 | 9 |
| Unmodeled operation QUERY_COOLDOWN: (no parameters) | 2 | 8 |
| Unsupported alternatives in a partially modeled event group: ACCURACY, UNRESISTABLE | 2 | 7 |
| Unmodeled operation HEALTH_LIMIT: MAX_HEALTH, MAX_HEALTH_LIMIT | 2 | 7 |
| Unsupported ancestor context query: HEALTH | 2 | 7 |
| Unsupported ancestor context query: DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, CONTEXTUAL_EXECUTE | 2 | 6 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ATTACK_DAMAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, CONDITIONAL_FILTER, NO_KILL | 2 | 6 |
| Event-dependent branch requires stateful simulation: ABILITY_POWER, UNRESISTABLE, CONTEXTUAL_SKIP | 2 | 6 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, CONTEXTUAL_SKIP | 2 | 6 |
| Event-dependent branch requires stateful simulation: CRITICAL_NEGATE_CHANCE_PERCENT_ADDITIVE, UNRESISTABLE | 2 | 6 |
| Source conditional filter semantics are not equivalent to context execution gates: DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, CONTEXTUAL_FILTER | 2 | 6 |
| Basic follow-up event/TM propagation on bonus attacks or counters is not modeled: DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, CONTEXTUAL_EXECUTE, NO_HEALTH_STEAL, NO_KILL | 2 | 6 |
| Event-dependent branch requires stateful simulation: CONTEXTUAL_EXECUTE, FORCE_DEBUFF | 2 | 6 |
| Unsupported alternatives in a partially modeled event group: ATTACK_DAMAGE, CONTEXTUAL_EXECUTE | 2 | 6 |
| Unsupported alternatives in a partially modeled event group: ABILITY_POWER, CONTEXTUAL_EXECUTE | 2 | 6 |
| Event-dependent branch requires stateful simulation: ARMOR, FORCE_BUFF, CONTEXTUAL_EXECUTE | 2 | 6 |
| Unsupported context query: SPEED_FILL | 2 | 5 |
| Event-dependent branch requires stateful simulation: EVASION_NEGATE_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 2 | 5 |
| Event-dependent branch requires stateful simulation: DEFLECTION_PERCENT_ADDITIVE, UNRESISTABLE, FORCE_DEBUFF, CONTEXTUAL_FILTER | 2 | 5 |
| Event-dependent branch requires stateful simulation: RESISTANCE, UNRESISTABLE, FORCE_DEBUFF, CONTEXTUAL_FILTER | 2 | 5 |
| Dispel filter/count/source semantics require active effect instance state: CONTEXTUAL_SKIP | 2 | 5 |
| Event-dependent branch requires stateful simulation: CONTEXTUAL_SKIP, SPEED_FILL | 2 | 5 |
| Event-dependent branch requires stateful simulation: OFFENSE_PERCENT_ADDITIVE, CONTEXTUAL_SKIP | 2 | 5 |
| Event-dependent branch requires stateful simulation: MAX_SHIELD, CONTEXT_MAX_MULTIPLIER | 2 | 5 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ACCURACY, UNRESISTABLE, CONTEXTUAL_SKIP | 2 | 4 |
| Unmodeled operation STAT_LIMIT: UNRESISTABLE, TAUNT, MAX_STAT_LIMIT | 2 | 4 |
| Source conditional filter semantics are not equivalent to context execution gates: ATTACK_DAMAGE, CONDITIONAL_FILTER, NO_COUNTER_ATTACK, NO_HEALTH_STEAL | 2 | 4 |
| Event-dependent branch requires stateful simulation: ATTACK_DAMAGE, NO_HEALTH_STEAL, NO_COUNTER_ATTACK | 2 | 4 |
| Event-dependent branch requires stateful simulation: HEALTH, CONTEXTUAL_SKIP | 2 | 4 |
| Source conditional filter semantics are not equivalent to context execution gates: SPEED, CONDITIONAL_FILTER | 2 | 4 |
| Event-dependent branch requires stateful simulation: FORCE_DEBUFF, COUNTER_ATTACK_RATING | 2 | 4 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: ATTACK_CRITICAL_NEGATE_PERCENT_ADDITIVE, UNRESISTABLE | 2 | 4 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: UNRESISTABLE, CONTEXTUAL_SKIP, ABILITY_POWER | 2 | 4 |
| Unmodeled operation IMMUNITY: CONDITIONAL_FILTER | 2 | 4 |
| Unmodeled operation IMMUNITY: UNRESISTABLE, SOURCE_OVERRIDE_CREATOR | 2 | 4 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: NO_COUNTER_ATTACK, MAX_HEALTH, CONTEXTUAL_EXECUTE, NO_HEALTH_STEAL | 2 | 4 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: SPEED, UNRESISTABLE | 2 | 4 |
| Unmodeled operation QUERY_UNIT_VALUE: SPEED_FILL, CURRENT_NUMERICAL | 2 | 4 |
| Contextual gate has no source query: ABILITY_CRITICAL_NEGATE_PERCENT_ADDITIVE, UNRESISTABLE, CONTEXTUAL_EXECUTE | 2 | 4 |
| Unmodeled operation QUERY_UNIT_VALUE: HEALTH, CURRENT_PERCENTAGE | 2 | 4 |
| NO_KILL lethal floor requires current remaining Health and defeat state: DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, SHIELD_PENETRATION, NO_KILL | 2 | 4 |
| Outgoing Protection bypass requires separate damage-to-pool state: DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, SHIELD_PENETRATION, NO_KILL | 2 | 4 |
| Event-dependent branch requires stateful simulation: UNRESISTABLE, SPEED_FILL, PRIORITY | 2 | 3 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: UNRESISTABLE | 2 | 3 |
| Event-dependent branch requires stateful simulation: ATTACK_CRITICAL_PERCENT_ADDITIVE, UNRESISTABLE, CONTEXTUAL_EXECUTE | 2 | 3 |
| Source conditional filter semantics are not equivalent to context execution gates: COUNTER_ATTACK_RATING, CONTEXTUAL_FILTER, UNRESISTABLE | 2 | 3 |
| Basic follow-up event/TM propagation on bonus attacks or counters is not modeled: SPEED_FILL, UNRESISTABLE, CONTEXTUAL_EXECUTE | 2 | 3 |
| Event-dependent branch requires stateful simulation: ATTACK_DAMAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, NO_KILL | 2 | 3 |
| Contextual gate has no source query: CONTEXTUAL_EXECUTE, ATTACK_DAMAGE | 2 | 3 |
| Unsupported ancestor context query: DISPELL_ALL | 2 | 3 |
| Unmodeled operation QUERY_UNIT_VALUE: SHIELD, CURRENT_PERCENTAGE | 2 | 3 |
| Event-dependent branch requires stateful simulation: UNRESISTABLE, FORCE_DEBUFF, CONTEXTUAL_EXECUTE | 2 | 3 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ABILITY_POWER, CONTEXTUAL_EXECUTE, NO_COUNTER_ATTACK | 2 | 3 |
| Unsupported context query: UNRESISTABLE, DODGE_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 2 | 3 |
| Unsupported context query: UNRESISTABLE, DEFLECTION_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 2 | 3 |
| Immunity/custom debuff requires effect-specific state: FORCE_DEBUFF, UNRESISTABLE, CONDITIONAL_FILTER | 2 | 3 |
| Fear or special control removal lacks checked undispellable-effect bypass semantics: UNRESISTABLE, DISPELL_ALL | 2 | 3 |
| Unsupported alternatives in a partially modeled event group: ARMOR, UNRESISTABLE, CONTEXT_MAX_MULTIPLIER | 2 | 3 |
| Unsupported alternatives in a partially modeled event group: SUPPRESSION, UNRESISTABLE, CONTEXT_MAX_MULTIPLIER | 2 | 3 |
| Temporary Protection uses bounded active capacity; depletion, expiry and stacking chronology are not modeled: MAX_HEALTH, CONTEXT_MAX_MULTIPLIER | 2 | 3 |
| Unsupported context query: MAX_HEALTH, CONTEXTUAL_EXECUTE | 2 | 3 |
| Unmodeled operation IMMUNITY: CONDITIONAL_FILTER, CONTEXTUAL_EXECUTE | 2 | 3 |
| Source creator override needs explicit effect ownership state: CRITICAL_DAMAGE, UNRESISTABLE, SOURCE_OVERRIDE_CREATOR | 2 | 3 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: HEALTH_STEAL, CONTEXTUAL_EXECUTE | 2 | 3 |
| Unsupported ancestor context query: COUNTER_ATTACK_RATING, UNRESISTABLE, CONTEXTUAL_EXECUTE | 2 | 3 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: SPEED_FILL, CONTEXTUAL_EXECUTE | 2 | 3 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: DISPELL_ALL, UNRESISTABLE | 2 | 3 |
| Dispel filter/count/source semantics require active effect instance state: UNRESISTABLE, CONTEXTUAL_FILTER | 2 | 3 |
| Dispel of non-control buffs or custom markers requires explicit active effect state: UNRESISTABLE, CONTEXTUAL_FILTER | 2 | 3 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: ARMOR, UNRESISTABLE, FORCE_DEBUFF | 2 | 3 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: SUPPRESSION, UNRESISTABLE, FORCE_DEBUFF | 2 | 3 |
| Source conditional filter semantics are not equivalent to context execution gates: DODGE_PERCENT_ADDITIVE, UNRESISTABLE, CONTEXTUAL_FILTER | 2 | 3 |
| Unmodeled operation MODIFY_STAT: FORCE_BUFF, TAUNT, SUPPRESS_VISUALS | 2 | 3 |
| Unsupported alternatives in a partially modeled event group: SHIELD, CONTEXTUAL_SKIP | 2 | 3 |
| Unmodeled operation MODIFY_STAT: CONTEXTUAL_EXECUTE, DEFENSE_PENETRATION_TARGET_PERCENT_ADDITIVE | 2 | 3 |
| Unmodeled operation MODIFY_DAMAGE: FORCE_BUFF, INCOMING, UNRESISTABLE | 2 | 3 |
| Unmodeled operation MODIFY_STAT: UNRESISTABLE, MASTERY | 2 | 3 |
| Unsupported alternatives in a partially modeled event group: ATTACK_DAMAGE, CONTEXTUAL_EXECUTE, UNRESISTABLE | 2 | 3 |
| Unsupported alternatives in a partially modeled event group: ABILITY_POWER, CONTEXTUAL_EXECUTE, UNRESISTABLE | 2 | 3 |
| Unsupported alternatives in a partially modeled event group: SHIELD, CONTEXTUAL_EXECUTE | 2 | 3 |
| Unsupported context query: SPEED_FILL, CONTEXT_MAX_MULTIPLIER, UNRESISTABLE | 2 | 3 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: CRITICAL_DAMAGE, CONTEXTUAL_SKIP | 2 | 3 |
| Source conditional filter semantics are not equivalent to context execution gates: RESISTANCE, UNRESISTABLE, CONDITIONAL_FILTER | 2 | 3 |
| Event-dependent branch requires stateful simulation: RESISTANCE, UNRESISTABLE, CONDITIONAL_FILTER | 2 | 3 |
| Unmodeled operation MODIFY_DAMAGE: INCOMING, FORCE_BUFF | 2 | 3 |
| Event-dependent branch requires stateful simulation: CONTEXTUAL_EXECUTE, CONTEXT_MAX_MULTIPLIER, HEALTH | 2 | 3 |
| Event-dependent branch requires stateful simulation: CONTEXTUAL_EXECUTE, CONTEXT_MAX_MULTIPLIER, SHIELD | 2 | 3 |
| Unmodeled operation MODIFY_STAT: MASTERY, CONTEXTUAL_FILTER | 2 | 3 |
| Unsupported ancestor context query: UNRESISTABLE | 2 | 3 |
| Event-dependent branch requires stateful simulation: ACCURACY, FORCE_BUFF, CONTEXTUAL_SKIP | 2 | 3 |
| Unsupported context query: ATTACK_DAMAGE, UNRESISTABLE, CONTEXTUAL_EXECUTE | 2 | 3 |
| Unsupported alternatives in a partially modeled event group: MAX_SHIELD | 2 | 3 |
| Recovery context has no explicit source query or damage result: HEALTH, CONTEXT_MAX_MULTIPLIER | 2 | 2 |
| Enemy clearable buff removal uses bounded buff-share proxy; individual buff lifetime and dispellability state are not modeled: UNRESISTABLE | 2 | 2 |
| Unsupported alternatives in a partially modeled event group: ACCURACY, CONTEXTUAL_EXECUTE | 2 | 2 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: EVASION_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 2 | 2 |
| Unsupported alternatives in a partially modeled event group: CONTEXTUAL_EXECUTE, ATTACK_CRITICAL_NEGATE_PERCENT_ADDITIVE, UNRESISTABLE | 2 | 2 |
| Contextual gate has no source query: ATTACK_CRITICAL_NEGATE_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 2 | 2 |
| Contextual gate has no source query: ABILITY_CRITICAL_NEGATE_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 2 | 2 |
| Basic follow-up event/TM propagation on bonus attacks or counters is not modeled: ATTACK_DAMAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, CONDITIONAL_FILTER, NO_KILL | 2 | 2 |
| Unmodeled operation SQUAD_BLACKBOARD_QUERY: EQUAL | 2 | 2 |
| Unmodeled operation SQUAD_BLACKBOARD_LIMIT: MAX_STAT_LIMIT | 2 | 2 |
| Source conditional filter semantics are not equivalent to context execution gates: UNRESISTABLE, SPEED_FILL, CONDITIONAL_FILTER | 2 | 2 |
| Unsupported alternatives in a partially modeled event group: UNRESISTABLE, ATTACK_CRITICAL_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 2 | 2 |
| Unsupported alternatives in a partially modeled event group: UNRESISTABLE, ABILITY_CRITICAL_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 2 | 2 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: OFFENSE_PERCENT_ADDITIVE | 2 | 2 |
| Event-dependent branch requires stateful simulation: ABILITY_POWER, UNRESISTABLE, CONTEXTUAL_FILTER | 2 | 2 |
| Event-dependent branch requires stateful simulation: CRITICAL_DAMAGE, UNRESISTABLE, CONDITIONAL_FILTER | 2 | 2 |
| Source conditional filter semantics are not equivalent to context execution gates: DEFLECTION_PERCENT_ADDITIVE, UNRESISTABLE, CONTEXTUAL_FILTER | 2 | 2 |
| Unsupported alternatives in a partially modeled event group: DODGE_PERCENT_ADDITIVE | 2 | 2 |
| Unsupported alternatives in a partially modeled event group: DEFLECTION_PERCENT_ADDITIVE | 2 | 2 |
| Contextual gate has no source query: CONTEXTUAL_EXECUTE, RESISTANCE, UNRESISTABLE | 2 | 2 |
| Contextual gate has no source query: CONTEXTUAL_EXECUTE, ATTACK_CRITICAL_PERCENT_ADDITIVE | 2 | 2 |
| Contextual gate has no source query: CONTEXTUAL_EXECUTE, SPEED | 2 | 2 |
| Enemy clearable buff removal uses bounded buff-share proxy; individual buff lifetime and dispellability state are not modeled: UNRESISTABLE, CONTEXTUAL_SKIP, DISPELL_ALL | 2 | 2 |
| Unmodeled operation MODIFY_STAT: CONTEXTUAL_FILTER, TAUNT | 2 | 2 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ATTACK_DAMAGE, CONTEXT_MAX_MULTIPLIER, UNRESISTABLE, CONTEXTUAL_EXECUTE | 2 | 2 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ABILITY_POWER, CONTEXT_MAX_MULTIPLIER, UNRESISTABLE, CONTEXTUAL_EXECUTE | 2 | 2 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: DEFLECTION_PERCENT_ADDITIVE, UNRESISTABLE, FORCE_DEBUFF, CONTEXTUAL_FILTER | 2 | 2 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: RESISTANCE, UNRESISTABLE, FORCE_DEBUFF, CONTEXTUAL_FILTER | 2 | 2 |
| Unsupported alternatives in a partially modeled event group: ABILITY_CRITICAL_PERCENT_ADDITIVE, UNRESISTABLE, CONTEXTUAL_FILTER | 2 | 2 |
| Unmodeled operation REPLACE_EFFECT: UNRESISTABLE | 2 | 2 |
| Fear or special control removal lacks checked undispellable-effect bypass semantics: DISPELL_ALL | 2 | 2 |
| Unsupported alternatives in a partially modeled event group: OFFENSE_PERCENT_ADDITIVE | 2 | 2 |
| Unsupported context query: ATTACK_CRITICAL_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 2 | 2 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: ARMOR | 2 | 2 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: UNRESISTABLE, SUPPRESSION | 2 | 2 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: SPEED | 2 | 2 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: FORCE_DEBUFF, COUNTER_ATTACK_RATING, CONTEXTUAL_EXECUTE | 2 | 2 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ATTACK_CRITICAL_NEGATE_PERCENT_ADDITIVE, FORCE_DEBUFF, CONTEXTUAL_EXECUTE | 2 | 2 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ABILITY_CRITICAL_NEGATE_PERCENT_ADDITIVE, FORCE_DEBUFF, CONTEXTUAL_EXECUTE | 2 | 2 |
| Event-dependent branch requires stateful simulation: INCOMING, CONTEXTUAL_SKIP | 2 | 2 |
| Fear or special control removal lacks checked undispellable-effect bypass semantics: UNRESISTABLE, DISPELL_ALL, CONTEXTUAL_SKIP | 2 | 2 |
| Event-dependent branch requires stateful simulation: SPEED, CONDITIONAL_FILTER | 2 | 2 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: CONTEXTUAL_EXECUTE, EVASION_NEGATE_PERCENT_ADDITIVE, UNRESISTABLE | 2 | 2 |
| Unmodeled operation MODIFY_STAT: TAUNT, UNRESISTABLE, CONTEXTUAL_FILTER | 2 | 2 |
| Unmodeled operation MODIFY_STAT: TAUNT, SUPPRESS_VISUALS | 2 | 2 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: DEFLECTION_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 2 | 2 |
| Pool conversion uses before-kit-stat-buffs policy; ordering with other kit stat changes is not independently verified: UNRESISTABLE | 2 | 2 |
| Unsupported alternatives in a partially modeled event group: RESISTANCE, CONTEXTUAL_EXECUTE, UNRESISTABLE | 2 | 2 |
| Unsupported alternatives in a partially modeled event group: DISPELL_ALL, CONTEXTUAL_SKIP | 2 | 2 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: CONTEXTUAL_EXECUTE, CONTEXT_MAX_MULTIPLIER, HEALTH | 2 | 2 |
| Contextual gate has no source query: ACCURACY, UNRESISTABLE, CONTEXTUAL_EXECUTE | 2 | 2 |
| Unsupported context query: EVASION_NEGATE_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 2 | 2 |
| Unsupported context query: CRITICAL_DAMAGE, CONTEXTUAL_EXECUTE | 2 | 2 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ATTACK_CRITICAL_NEGATE_PERCENT_ADDITIVE, FORCE_BUFF, CONTEXTUAL_EXECUTE | 2 | 2 |
| Source conditional filter semantics are not equivalent to context execution gates: HEALTH_STEAL, UNRESISTABLE, CONTEXTUAL_FILTER | 2 | 2 |
| Source conditional filter semantics are not equivalent to context execution gates: RESISTANCE, UNRESISTABLE, CONTEXTUAL_FILTER | 2 | 2 |
| Source conditional filter semantics are not equivalent to context execution gates: MAX_HEALTH, UNRESISTABLE, CONTEXTUAL_FILTER | 2 | 2 |
| Source conditional filter semantics are not equivalent to context execution gates: ACCURACY, UNRESISTABLE, CONTEXTUAL_FILTER | 2 | 2 |
| Source conditional filter semantics are not equivalent to context execution gates: EVASION_NEGATE_PERCENT_ADDITIVE, UNRESISTABLE, CONTEXTUAL_FILTER | 2 | 2 |
| Source conditional filter semantics are not equivalent to context execution gates: CRITICAL_DAMAGE, UNRESISTABLE, CONTEXTUAL_FILTER | 2 | 2 |
| Source conditional filter semantics are not equivalent to context execution gates: ABILITY_CRITICAL_NEGATE_PERCENT_ADDITIVE, UNRESISTABLE, CONTEXTUAL_FILTER | 2 | 2 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ARMOR_PENETRATION_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 2 | 2 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: CONTEXTUAL_SKIP, HEALTH | 2 | 2 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: BLACKBOARD_OVERRIDE | 2 | 2 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: CRITICAL_DAMAGE | 2 | 2 |
| Unsupported alternatives in a partially modeled event group: DISPELL_ALL, CONTEXTUAL_EXECUTE | 2 | 2 |
| Event-dependent branch requires stateful simulation: INCOMING, CONTEXTUAL_EXECUTE | 2 | 2 |
| Unsupported ancestor context query: ATTACK_CRITICAL_PERCENT_ADDITIVE, UNRESISTABLE | 2 | 2 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ARMOR_PENETRATION, CONTEXTUAL_SKIP | 2 | 2 |
| Unsupported alternatives in a partially modeled event group: ABILITY_CRITICAL_NEGATE_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 2 | 2 |
| Event-dependent branch requires stateful simulation: MAX_HEALTH, CONTEXT_MAX_MULTIPLIER, UNRESISTABLE | 2 | 2 |
| Source conditional filter semantics are not equivalent to context execution gates: SPEED_FILL, CONDITIONAL_FILTER | 2 | 2 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: MAX_SHIELD, CONTEXTUAL_EXECUTE | 2 | 2 |
| Unsupported alternatives in a partially modeled event group: MAX_HEALTH, CONTEXTUAL_SKIP | 2 | 2 |
| Unsupported alternatives in a partially modeled event group: MAX_HEALTH, UNRESISTABLE, CONTEXTUAL_SKIP | 2 | 2 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: MAX_HEALTH, UNRESISTABLE, CONTEXTUAL_SKIP | 2 | 2 |
| Unmodeled operation HEALTH_LIMIT: MIN_HEALTH_LIMIT, MAX_HEALTH, UNRESISTABLE, CONTEXTUAL_EXECUTE | 2 | 2 |
| Context delta requires ordered prior-value state; absolute context is approximate: CONTEXTUAL_EXECUTE, CRITICAL_DAMAGE, DELTA_CONTEXT_VALUE | 2 | 2 |
| Dispel filter/count/source semantics require active effect instance state: CONTEXTUAL_FILTER, DISPELL_ALL, UNRESISTABLE | 2 | 2 |
| Dispel of non-control buffs or custom markers requires explicit active effect state: CONTEXTUAL_FILTER, DISPELL_ALL, UNRESISTABLE | 2 | 2 |
| Source conditional filter semantics are not equivalent to context execution gates: CONTEXTUAL_FILTER, DISPELL_ALL, UNRESISTABLE | 2 | 2 |
| Source conditional filter semantics are not equivalent to context execution gates: UNRESISTABLE, ATTACK_CRITICAL_NEGATE_PERCENT_ADDITIVE, CONTEXTUAL_FILTER | 2 | 2 |
| Unsupported alternatives in a partially modeled event group: CRITICAL_DAMAGE, CONTEXTUAL_EXECUTE | 2 | 2 |
| Unsupported alternatives in a partially modeled event group: ARMOR, CONTEXTUAL_EXECUTE | 2 | 2 |
| Unsupported alternatives in a partially modeled event group: SUPPRESSION, CONTEXTUAL_EXECUTE | 2 | 2 |
| Unsupported context query: COUNTER_ATTACK_RATING, CONTEXTUAL_EXECUTE | 2 | 2 |
| Unsupported context query: MAX_HEALTH | 2 | 2 |
| Event-dependent branch requires stateful simulation: SPEED, UNRESISTABLE, CONTEXTUAL_SKIP | 2 | 2 |
| Contextual gate has no source query: UNRESISTABLE, FORCE_DEBUFF, CONTEXTUAL_EXECUTE | 2 | 2 |
| Unsupported ancestor context query: UNRESISTABLE, CONTEXTUAL_SKIP | 2 | 2 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: DODGE_PERCENT_ADDITIVE, UNRESISTABLE, CONTEXTUAL_SKIP | 2 | 2 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ABILITY_POWER, CONTEXTUAL_SKIP | 2 | 2 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ABILITY_POWER, CONTEXTUAL_EXECUTE, CONTEXT_MAX_MULTIPLIER | 2 | 2 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: ATTACK_DAMAGE, CONTEXTUAL_EXECUTE | 2 | 2 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: ABILITY_POWER, CONTEXTUAL_EXECUTE | 2 | 2 |
| Contextual gate has no source query: CRITICAL_DAMAGE, UNRESISTABLE, CONTEXTUAL_EXECUTE | 2 | 2 |
| Event-dependent branch requires stateful simulation: CRITICAL_NEGATE_CHANCE_PERCENT_ADDITIVE | 2 | 2 |
| Event-dependent branch requires stateful simulation: EVASION_NEGATE_PERCENT_ADDITIVE, UNRESISTABLE | 2 | 2 |
| Unmodeled operation MODIFY_DAMAGE: INCOMING, FORCE_BUFF, CONTEXTUAL_EXECUTE | 2 | 2 |
| Unsupported alternatives in a partially modeled event group: ATTACK_CRITICAL_NEGATE_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE, FORCE_BUFF | 2 | 2 |
| Event-dependent branch requires stateful simulation: ATTACK_CRITICAL_NEGATE_PERCENT_ADDITIVE, FORCE_BUFF, CONTEXTUAL_EXECUTE | 2 | 2 |
| Event-dependent branch requires stateful simulation: SPEED_FILL, CONTEXT_MAX_MULTIPLIER | 2 | 2 |
| Unsupported alternatives in a partially modeled event group: MAX_SHIELD, UNRESISTABLE | 2 | 2 |
| Unsupported alternatives in a partially modeled event group: ATTACK_DAMAGE, CONTEXT_MAX_MULTIPLIER, UNRESISTABLE | 2 | 2 |
| Unsupported alternatives in a partially modeled event group: ABILITY_POWER, CONTEXT_MAX_MULTIPLIER, UNRESISTABLE | 2 | 2 |
| Dispel filter/count/source semantics require active effect instance state: SOURCE_OVERRIDE_CREATOR | 1 | 30 |
| Dispel of non-control buffs or custom markers requires explicit active effect state: SOURCE_OVERRIDE_CREATOR | 1 | 30 |
| Source creator override needs explicit effect ownership state: SOURCE_OVERRIDE_CREATOR | 1 | 30 |
| Contextual gate has no source query: CONTEXTUAL_EXECUTE, DAMAGE_HEALTH_PERCENTAGE, NO_KILL, NO_COUNTER_ATTACK, NO_HEALTH_STEAL | 1 | 15 |
| Unsupported context query: CONTEXTUAL_EXECUTE, DAMAGE_HEALTH_PERCENTAGE, NO_KILL, NO_COUNTER_ATTACK, NO_HEALTH_STEAL | 1 | 15 |
| Event-dependent branch requires stateful simulation: SOURCE_OVERRIDE_CREATOR | 1 | 15 |
| Unsupported context query: DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, CONTEXTUAL_EXECUTE | 1 | 15 |
| Immunity/custom debuff requires effect-specific state: UNRESISTABLE, FORCE_DEBUFF, CONTEXTUAL_EXECUTE, CONTEXTUAL_FILTER, SOURCE_OVERRIDE_CREATOR | 1 | 12 |
| Unmodeled operation IMMUNITY: UNRESISTABLE, CONTEXTUAL_EXECUTE, CONTEXTUAL_FILTER | 1 | 8 |
| Multiplicative or contextual cooldown amount requires ordered cooldown state: ABILITY_COOLDOWN, RECOVER_ABILITIES_TAG, UNRESISTABLE, CONTEXTUAL_EXECUTE | 1 | 7 |
| Source creator override needs explicit effect ownership state: CONTEXTUAL_EXECUTE, SOURCE_OVERRIDE_CREATOR | 1 | 6 |
| Revival requires death state or default pool semantics: CONTEXTUAL_EXECUTE, SOURCE_OVERRIDE_CREATOR | 1 | 6 |
| NO_KILL lethal floor requires current remaining Health and defeat state: DAMAGE_HEALTH_PERCENTAGE, CONTEXTUAL_SKIP, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, NO_KILL | 1 | 6 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: DAMAGE_HEALTH_PERCENTAGE, CONTEXTUAL_SKIP, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, NO_KILL | 1 | 6 |
| Source conditional filter semantics are not equivalent to context execution gates: UNRESISTABLE, FORCE_DEBUFF, CONTEXTUAL_FILTER | 1 | 6 |
| Event-dependent branch requires stateful simulation: DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, CONDITIONAL_FILTER | 1 | 6 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: ARMOR, UNRESISTABLE, FORCE_DEBUFF, CONTEXTUAL_SKIP | 1 | 6 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: SUPPRESSION, UNRESISTABLE, FORCE_DEBUFF, CONTEXTUAL_SKIP | 1 | 6 |
| Unsupported context query: SPEED_FILL, PRIORITY, CONTEXTUAL_SKIP | 1 | 5 |
| Unmodeled operation HEALTH_LIMIT: MIN_HEALTH_LIMIT, MAX_HEALTH, UNRESISTABLE | 1 | 5 |
| Unsupported context query: CONTEXTUAL_EXECUTE, ARMOR_PENETRATION | 1 | 5 |
| Unsupported context query: CONTEXTUAL_EXECUTE, SUPPRESSION_PENETRATION | 1 | 5 |
| Unsupported context query: CONTEXTUAL_EXECUTE, ACCURACY | 1 | 5 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ARMOR, FORCE_BUFF, CONTEXTUAL_EXECUTE | 1 | 5 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: SUPPRESSION, FORCE_BUFF, CONTEXTUAL_EXECUTE | 1 | 5 |
| Unsupported alternatives in a partially modeled event group: ARMOR_PENETRATION_PERCENT_ADDITIVE, UNRESISTABLE | 1 | 4 |
| Unsupported alternatives in a partially modeled event group: SUPPRESSION_PENETRATION_PERCENT_ADDITIVE, UNRESISTABLE | 1 | 4 |
| Unsupported context query: MAX_SHIELD, UNRESISTABLE, CONTEXTUAL_EXECUTE | 1 | 4 |
| Unsupported context query: ATTACK_DAMAGE, CONTEXTUAL_EXECUTE, NO_COUNTER_ATTACK | 1 | 4 |
| Unmodeled operation BLACKBOARD_LIMIT: MAX_STAT_LIMIT, CONTEXTUAL_SKIP | 1 | 4 |
| NO_KILL lethal floor requires current remaining Health and defeat state: MAX_HEALTH, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, NO_KILL | 1 | 4 |
| Unsupported ancestor context query: UNRESISTABLE, DISPELL_ALL | 1 | 4 |
| Source conditional filter semantics are not equivalent to context execution gates: UNRESISTABLE, ARMOR, CONTEXTUAL_SKIP, CONDITIONAL_FILTER | 1 | 4 |
| Source conditional filter semantics are not equivalent to context execution gates: UNRESISTABLE, SUPPRESSION, CONTEXTUAL_SKIP, CONDITIONAL_FILTER | 1 | 4 |
| Unmodeled operation MODIFY_STAT: MASTERY, CONTEXTUAL_EXECUTE, UNRESISTABLE | 1 | 4 |
| Unmodeled operation STAT_LIMIT: MAX_HEALTH, MAX_STAT_LIMIT | 1 | 4 |
| Unmodeled operation STAT_LIMIT: MAX_SHIELD, MAX_STAT_LIMIT | 1 | 4 |
| Event-dependent branch requires stateful simulation: DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, CONTEXTUAL_FILTER | 1 | 3 |
| Unsupported context query: FORCE_DEBUFF, CONTEXTUAL_EXECUTE | 1 | 3 |
| NO_KILL lethal floor requires current remaining Health and defeat state: DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, NO_KILL, CONTEXTUAL_FILTER | 1 | 3 |
| Source conditional filter semantics are not equivalent to context execution gates: DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, NO_KILL, CONTEXTUAL_FILTER | 1 | 3 |
| Unsupported alternatives in a partially modeled event group: DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, NO_KILL, CONTEXTUAL_FILTER | 1 | 3 |
| Source conditional filter semantics are not equivalent to context execution gates: DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, CONTEXTUAL_EXECUTE, CONDITIONAL_FILTER | 1 | 3 |
| Unsupported alternatives in a partially modeled event group: DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, CONTEXTUAL_EXECUTE, CONDITIONAL_FILTER | 1 | 3 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, CONTEXTUAL_EXECUTE, CONDITIONAL_FILTER | 1 | 3 |
| Event-dependent branch requires stateful simulation: DODGE_PERCENT_ADDITIVE, UNRESISTABLE, FORCE_DEBUFF | 1 | 3 |
| Source creator override needs explicit effect ownership state: ABILITY_POWER, DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, SOURCE_OVERRIDE_CREATOR | 1 | 3 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: MAX_HEALTH, NO_HEALTH_STEAL, NO_COUNTER_ATTACK, CONTEXTUAL_SKIP | 1 | 3 |
| Unsupported context query: UNRESISTABLE, ARMOR, CONTEXTUAL_SKIP, CONDITIONAL_FILTER | 1 | 3 |
| Unsupported context query: UNRESISTABLE, SUPPRESSION, CONTEXTUAL_SKIP, CONDITIONAL_FILTER | 1 | 3 |
| Dispel filter/count/source semantics require active effect instance state: CONTEXTUAL_FILTER, CONTEXTUAL_EXECUTE, DISPELL_ALL, UNRESISTABLE | 1 | 3 |
| Dispel of non-control buffs or custom markers requires explicit active effect state: CONTEXTUAL_FILTER, CONTEXTUAL_EXECUTE, DISPELL_ALL, UNRESISTABLE | 1 | 3 |
| Source conditional filter semantics are not equivalent to context execution gates: CONTEXTUAL_FILTER, CONTEXTUAL_EXECUTE, DISPELL_ALL, UNRESISTABLE | 1 | 3 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: CONTEXTUAL_FILTER, CONTEXTUAL_EXECUTE, DISPELL_ALL, UNRESISTABLE | 1 | 3 |
| Unsupported alternatives in a partially modeled event group: BLACKBOARD_OVERRIDE, CONTEXTUAL_EXECUTE | 1 | 3 |
| Event-dependent branch requires stateful simulation: SUPPRESSION, FORCE_BUFF, CONTEXTUAL_EXECUTE | 1 | 3 |
| Contextual gate has no source query: SPEED, UNRESISTABLE, CONTEXTUAL_SKIP | 1 | 3 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: DAMAGE_HEALTH_PERCENTAGE, CONTEXTUAL_EXECUTE, NO_COUNTER_ATTACK | 1 | 3 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: ATTACK_CRITICAL_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 1 | 2 |
| Event-dependent branch requires stateful simulation: HEALTH, UNRESISTABLE, CONTEXTUAL_EXECUTE | 1 | 2 |
| Unmodeled operation STAT_LIMIT: FORCE_DEBUFF, MAX_SHIELD, MAX_STAT_LIMIT | 1 | 2 |
| Source conditional filter semantics are not equivalent to context execution gates: UNRESISTABLE, HEALTH, CONDITIONAL_FILTER | 1 | 2 |
| Event-dependent branch requires stateful simulation: UNRESISTABLE, HEALTH, CONDITIONAL_FILTER | 1 | 2 |
| Source conditional filter semantics are not equivalent to context execution gates: UNRESISTABLE, SHIELD, CONDITIONAL_FILTER | 1 | 2 |
| Event-dependent branch requires stateful simulation: UNRESISTABLE, SHIELD, CONDITIONAL_FILTER | 1 | 2 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: COUNTER_ATTACK_RATING, UNRESISTABLE, CONTEXTUAL_SKIP | 1 | 2 |
| Selected ally requires an unsupported ability targeting rule: DISPELL_ALL, UNRESISTABLE, CONTEXTUAL_EXECUTE | 1 | 2 |
| Event-dependent branch requires stateful simulation: ATTACK_DAMAGE, CONDITIONAL_FILTER, NO_COUNTER_ATTACK, NO_HEALTH_STEAL | 1 | 2 |
| Dispel filter/count/source semantics require active effect instance state: UNRESISTABLE, CONDITIONAL_FILTER, DISPELL_ALL | 1 | 2 |
| Dispel of non-control buffs or custom markers requires explicit active effect state: UNRESISTABLE, CONDITIONAL_FILTER, DISPELL_ALL | 1 | 2 |
| Source conditional filter semantics are not equivalent to context execution gates: UNRESISTABLE, CONDITIONAL_FILTER, DISPELL_ALL | 1 | 2 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: UNRESISTABLE, CONDITIONAL_FILTER, DISPELL_ALL | 1 | 2 |
| Unmodeled operation SCRIPT_COMPONENT: CONTEXTUAL_EXECUTE, PLAY_UNIT_TIMELINE | 1 | 2 |
| Unsupported context query: ABILITY_POWER, CONTEXTUAL_FILTER, UNRESISTABLE | 1 | 2 |
| Unmodeled operation SQUAD_BLACKBOARD_QUERY: LESS_THAN | 1 | 2 |
| Source conditional filter semantics are not equivalent to context execution gates: DODGE_PERCENT_ADDITIVE, UNRESISTABLE, FORCE_DEBUFF, CONDITIONAL_FILTER | 1 | 2 |
| Event-dependent branch requires stateful simulation: DODGE_PERCENT_ADDITIVE, UNRESISTABLE, FORCE_DEBUFF, CONDITIONAL_FILTER | 1 | 2 |
| Immunity/custom debuff requires effect-specific state: CONDITIONAL_FILTER, FORCE_DEBUFF | 1 | 2 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: SPEED, CONDITIONAL_FILTER | 1 | 2 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: CONTEXTUAL_EXECUTE, UNRESISTABLE, DISPELL_ALL | 1 | 2 |
| Unsupported alternatives in a partially modeled event group: SPEED_FILL, PRIORITY | 1 | 2 |
| Event-dependent branch requires stateful simulation: CRITICAL_DAMAGE, UNRESISTABLE, SOURCE_OVERRIDE_CREATOR | 1 | 2 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: UNRESISTABLE, FORCE_DEBUFF, CONTEXTUAL_SKIP, SUPPRESS_VISUALS | 1 | 2 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: UNRESISTABLE, FORCE_DEBUFF, CONTEXTUAL_EXECUTE, SUPPRESS_VISUALS | 1 | 2 |
| Damage-result recovery has ambiguous or event-dependent source ownership: HEALTH, CONTEXTUAL_EXECUTE | 1 | 2 |
| Source conditional filter semantics are not equivalent to context execution gates: ARMOR, CONDITIONAL_FILTER | 1 | 2 |
| Unsupported context query: ARMOR, UNRESISTABLE, FORCE_DEBUFF, CONTEXTUAL_EXECUTE | 1 | 2 |
| Unsupported context query: SUPPRESSION, UNRESISTABLE, FORCE_DEBUFF, CONTEXTUAL_EXECUTE | 1 | 2 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: MAX_HEALTH, CONTEXT_MAX_MULTIPLIER, CONTEXTUAL_EXECUTE | 1 | 2 |
| Unsupported context query: RESISTANCE, CONTEXTUAL_EXECUTE | 1 | 2 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: DODGE_PERCENT_ADDITIVE, UNRESISTABLE | 1 | 2 |
| Event-dependent branch requires stateful simulation: SUPPRESS_VISUALS | 1 | 2 |
| Fear or special control removal lacks checked undispellable-effect bypass semantics: (no parameters) | 1 | 2 |
| Enemy clearable buff removal uses bounded buff-share proxy; individual buff lifetime and dispellability state are not modeled: (no parameters) | 1 | 2 |
| Unmodeled operation SCRIPT_COMPONENT: PLAY_CUTSCENE, CONTEXTUAL_EXECUTE | 1 | 2 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: CONTEXTUAL_EXECUTE, OUTGOING | 1 | 2 |
| Unsupported alternatives in a partially modeled event group: ATTACK_DAMAGE, CONTEXTUAL_SKIP, UNRESISTABLE | 1 | 2 |
| Unsupported alternatives in a partially modeled event group: ABILITY_POWER, CONTEXTUAL_SKIP, UNRESISTABLE | 1 | 2 |
| Forced ability needs explicit rotation/target state: CONTEXTUAL_EXECUTE | 1 | 2 |
| Event-dependent branch requires stateful simulation: MAX_HEALTH, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, NO_KILL | 1 | 2 |
| Event-dependent branch requires stateful simulation: DODGE_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 1 | 2 |
| Event-dependent branch requires stateful simulation: DEFLECTION_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 1 | 2 |
| Own-side control requires explicit action restriction state: UNRESISTABLE | 1 | 2 |
| Immunity/custom debuff requires effect-specific state: FORCE_DEBUFF, CONTEXTUAL_EXECUTE, CONTEXTUAL_FILTER | 1 | 2 |
| Event-dependent branch requires stateful simulation: ATTACK_DAMAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, CONTEXTUAL_EXECUTE | 1 | 2 |
| Unsupported context query: UNRESISTABLE, FORCE_DEBUFF, CONTEXTUAL_EXECUTE, SUPPRESS_VISUALS | 1 | 2 |
| Multiplicative or contextual cooldown amount requires ordered cooldown state: ABILITY_COOLDOWN, RECOVER_ABILITIES_TAG, CONTEXTUAL_EXECUTE | 1 | 2 |
| Event-dependent branch requires stateful simulation: MAX_SHIELD, UNRESISTABLE, CONTEXTUAL_EXECUTE | 1 | 2 |
| Unmodeled operation MODIFY_ULTIMATE_CHARGE: CONTEXTUAL_SKIP | 1 | 2 |
| Selected ally requires an unsupported ability targeting rule: UNRESISTABLE | 1 | 2 |
| Unmodeled operation MODIFY_STAT: SHIELD_PENETRATION, CONTEXTUAL_EXECUTE | 1 | 2 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: FORCE_DEBUFF, COUNTER_ATTACK_RATING, CONTEXTUAL_EXECUTE, UNRESISTABLE | 1 | 2 |
| Unmodeled operation IMMUNITY: CONTEXTUAL_EXECUTE, SOURCE_OVERRIDE_CREATOR | 1 | 2 |
| Unsupported alternatives in a partially modeled event group: EVASION_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 1 | 2 |
| Event-dependent branch requires stateful simulation: CRITICAL_NEGATE_CHANCE_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 1 | 2 |
| Unmodeled operation MODIFY_DAMAGE: OUTGOING, CONTEXTUAL_EXECUTE, UNRESISTABLE | 1 | 2 |
| Temporary Protection uses bounded active capacity; depletion, expiry and stacking chronology are not modeled: MAX_SHIELD, UNRESISTABLE | 1 | 2 |
| Source conditional filter semantics are not equivalent to context execution gates: CONTEXTUAL_FILTER, SHIELD | 1 | 2 |
| Cleanse uses assumed ordinary clearable control variants; ordered removal and undispellable variants are not modeled: CONTEXTUAL_SKIP | 1 | 2 |
| Source conditional filter semantics are not equivalent to context execution gates: CONTEXTUAL_FILTER | 1 | 2 |
| Source creator override needs explicit effect ownership state: UNRESISTABLE, SOURCE_OVERRIDE_CREATOR | 1 | 2 |
| Event-dependent branch requires stateful simulation: UNRESISTABLE, SOURCE_OVERRIDE_CREATOR | 1 | 2 |
| Source conditional filter semantics are not equivalent to context execution gates: SUPPRESSION, CONTEXT_MAX_MULTIPLIER, UNRESISTABLE, CONTEXTUAL_FILTER | 1 | 2 |
| Selected ally requires an unsupported ability targeting rule: ATTACK_CRITICAL_PERCENT_ADDITIVE, UNRESISTABLE | 1 | 2 |
| Selected ally requires an unsupported ability targeting rule: ABILITY_CRITICAL_PERCENT_ADDITIVE, UNRESISTABLE | 1 | 2 |
| Unmodeled operation BLACKBOARD_COMPARE: EQUAL, CONTEXTUAL_EXECUTE | 1 | 2 |
| Selected ally requires an unsupported ability targeting rule: ACCURACY, UNRESISTABLE | 1 | 2 |
| Event-dependent branch requires stateful simulation: CRITICAL_CHANCE_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 1 | 2 |
| Contextual gate has no source query: ATTACK_DAMAGE, CONTEXTUAL_SKIP | 1 | 2 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ATTACK_DAMAGE, CONTEXT_MAX_MULTIPLIER | 1 | 2 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ABILITY_POWER, CONTEXT_MAX_MULTIPLIER | 1 | 2 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ACCURACY | 1 | 2 |
| Contextual gate has no source query: SPEED_FILL, UNRESISTABLE, CONTEXTUAL_EXECUTE | 1 | 2 |
| Unmodeled operation MODIFY_STAT: MASTERY, CONTEXT_MAX_MULTIPLIER, CONTEXTUAL_EXECUTE, DELTA_CONTEXT_VALUE | 1 | 2 |
| Event-dependent branch requires stateful simulation: SHIELD, CONTEXTUAL_SKIP | 1 | 2 |
| Source creator override needs explicit effect ownership state: UNRESISTABLE, FORCE_DEBUFF, CONTEXTUAL_EXECUTE, SOURCE_OVERRIDE_CREATOR | 1 | 2 |
| Event-dependent branch requires stateful simulation: UNRESISTABLE, FORCE_DEBUFF, CONTEXTUAL_EXECUTE, SOURCE_OVERRIDE_CREATOR | 1 | 2 |
| Source creator override needs explicit effect ownership state: SPEED_FILL, PRIORITY, CONTEXTUAL_EXECUTE, SOURCE_OVERRIDE_CREATOR | 1 | 2 |
| Event-dependent branch requires stateful simulation: SPEED_FILL, PRIORITY, CONTEXTUAL_EXECUTE, SOURCE_OVERRIDE_CREATOR | 1 | 2 |
| Unmodeled operation IMMUNITY: FORCE_BUFF | 1 | 2 |
| Event-dependent branch requires stateful simulation: ARMOR, FORCE_BUFF | 1 | 2 |
| Contextual gate has no source query: SPEED_FILL, PRIORITY, UNRESISTABLE, CONTEXTUAL_SKIP | 1 | 2 |
| Dispel filter/count/source semantics require active effect instance state: UNRESISTABLE, CONDITIONAL_FILTER | 1 | 1 |
| Dispel of non-control buffs or custom markers requires explicit active effect state: UNRESISTABLE, CONDITIONAL_FILTER | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: UNRESISTABLE, CONDITIONAL_FILTER | 1 | 1 |
| Event-dependent branch requires stateful simulation: UNRESISTABLE, CONDITIONAL_FILTER | 1 | 1 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: ARMOR, UNRESISTABLE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: SUPPRESSION, UNRESISTABLE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: EVASION_NEGATE_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: RESISTANCE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Source creator override needs explicit effect ownership state: FORCE_DEBUFF, UNRESISTABLE, SOURCE_OVERRIDE_CREATOR | 1 | 1 |
| Event-dependent branch requires stateful simulation: FORCE_DEBUFF, UNRESISTABLE, SOURCE_OVERRIDE_CREATOR | 1 | 1 |
| Unsupported context query: OFFENSE_PERCENT_ADDITIVE, UNRESISTABLE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Unsupported ancestor context query: SPEED_FILL, PRIORITY | 1 | 1 |
| Contextual gate has no source query: COUNTER_ATTACK_RATING, CONTEXTUAL_EXECUTE | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ATTACK_DAMAGE, NO_COUNTER_ATTACK | 1 | 1 |
| Basic follow-up event/TM propagation on bonus attacks or counters is not modeled: ATTACK_DAMAGE, NO_COUNTER_ATTACK | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: BLACKBOARD_OVERRIDE, CONTEXTUAL_SKIP | 1 | 1 |
| Event-dependent branch requires stateful simulation: DODGE_NEGATE_PERCENT_ADDITIVE | 1 | 1 |
| Event-dependent branch requires stateful simulation: DEFLECTION_NEGATE_PERCENT_ADDITIVE | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ABILITY_POWER, CONTEXTUAL_EXECUTE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: ATTACK_DAMAGE, UNRESISTABLE, CONDITIONAL_FILTER | 1 | 1 |
| Event-dependent branch requires stateful simulation: ATTACK_DAMAGE, UNRESISTABLE, CONDITIONAL_FILTER | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: DODGE_PERCENT_ADDITIVE, UNRESISTABLE, CONDITIONAL_FILTER | 1 | 1 |
| Event-dependent branch requires stateful simulation: DODGE_PERCENT_ADDITIVE, UNRESISTABLE, CONDITIONAL_FILTER | 1 | 1 |
| Event-dependent branch requires stateful simulation: DEFLECTION_PERCENT_ADDITIVE, UNRESISTABLE, CONTEXTUAL_FILTER | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: SPEED, UNRESISTABLE, CONDITIONAL_FILTER | 1 | 1 |
| Event-dependent branch requires stateful simulation: SPEED, UNRESISTABLE, CONDITIONAL_FILTER | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: ABILITY_POWER, CONTEXTUAL_FILTER | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: DEFLECTION_PERCENT_ADDITIVE, CONTEXTUAL_FILTER | 1 | 1 |
| Event-dependent branch requires stateful simulation: EVASION_NEGATE_PERCENT_ADDITIVE, FORCE_DEBUFF, UNRESISTABLE | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: CRITICAL_NEGATE_CHANCE_PERCENT_ADDITIVE | 1 | 1 |
| Event-dependent branch requires stateful simulation: ATTACK_DAMAGE, NO_HEALTH_STEAL, NO_COUNTER_ATTACK, NO_KILL, CONDITIONAL_FILTER | 1 | 1 |
| Contextual gate has no source query: HEALTH_STEAL, CONTEXTUAL_EXECUTE | 1 | 1 |
| Contextual gate has no source query: ACCURACY, CONTEXTUAL_EXECUTE | 1 | 1 |
| Contextual gate has no source query: ARMOR_PENETRATION, CONTEXTUAL_EXECUTE | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: SPEED_FILL, CONTEXTUAL_EXECUTE, CONTEXT_MAX_MULTIPLIER | 1 | 1 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: CRITICAL_DAMAGE, UNRESISTABLE | 1 | 1 |
| Selected ally requires an unsupported ability targeting rule: UNRESISTABLE, DISPELL_ALL | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: DODGE_PERCENT_ADDITIVE, FORCE_DEBUFF, CONTEXTUAL_EXECUTE, CONTEXTUAL_FILTER | 1 | 1 |
| Selected ally requires an unsupported ability targeting rule: DODGE_PERCENT_ADDITIVE, FORCE_DEBUFF, CONTEXTUAL_EXECUTE, CONTEXTUAL_FILTER | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: DODGE_PERCENT_ADDITIVE, FORCE_DEBUFF, CONTEXTUAL_EXECUTE, CONTEXTUAL_FILTER | 1 | 1 |
| Selected ally requires an unsupported ability targeting rule: UNRESISTABLE, DEFLECTION_PERCENT_ADDITIVE | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: DODGE_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE, CONDITIONAL_FILTER | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: DODGE_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE, CONDITIONAL_FILTER | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: DODGE_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE, CONDITIONAL_FILTER | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: ATTACK_DAMAGE, CONTEXT_MAX_MULTIPLIER, UNRESISTABLE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: ABILITY_POWER, CONTEXT_MAX_MULTIPLIER, UNRESISTABLE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Event-dependent branch requires stateful simulation: CRITICAL_DAMAGE, UNRESISTABLE, CONTEXTUAL_SKIP | 1 | 1 |
| Unmodeled operation CURSE: FORCE_DEBUFF, CONTEXTUAL_EXECUTE, CONDITIONAL_FILTER | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: DODGE_PERCENT_ADDITIVE, UNRESISTABLE, FORCE_DEBUFF, CONTEXTUAL_EXECUTE, CONDITIONAL_FILTER | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: DODGE_PERCENT_ADDITIVE, UNRESISTABLE, FORCE_DEBUFF, CONTEXTUAL_EXECUTE, CONDITIONAL_FILTER | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: DODGE_PERCENT_ADDITIVE, UNRESISTABLE, FORCE_DEBUFF, CONTEXTUAL_EXECUTE, CONDITIONAL_FILTER | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: DEFLECTION_PERCENT_ADDITIVE, UNRESISTABLE, FORCE_DEBUFF, CONTEXTUAL_FILTER | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: RESISTANCE, UNRESISTABLE, FORCE_DEBUFF, CONTEXTUAL_FILTER | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: SUPPRESSION, UNRESISTABLE, CONTEXTUAL_FILTER | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: SPEED, CONTEXTUAL_FILTER, UNRESISTABLE | 1 | 1 |
| Unmodeled operation SUMMON_UNIT: CONTEXTUAL_SKIP | 1 | 1 |
| Unsupported context query: ACCURACY | 1 | 1 |
| Contextual gate has no source query: MAX_SHIELD, CONTEXTUAL_EXECUTE | 1 | 1 |
| Contextual gate has no source query: SUPPRESSION_PENETRATION, CONTEXTUAL_EXECUTE | 1 | 1 |
| Unsupported context query: ABILITY_CRITICAL_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE, UNRESISTABLE | 1 | 1 |
| Unsupported context query: UNRESISTABLE, COUNTER_ATTACK_RATING | 1 | 1 |
| Contextual gate has no source query: SHIELD, CONTEXTUAL_SKIP | 1 | 1 |
| Unsupported context query: HEALTH, CONTEXTUAL_SKIP | 1 | 1 |
| Unsupported context query: CONTEXTUAL_EXECUTE, DISPELL_ALL | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: UNRESISTABLE, CONDITIONAL_FILTER, DISPELL_ALL | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: ATTACK_DAMAGE, CONTEXTUAL_FILTER, UNRESISTABLE | 1 | 1 |
| Unsupported context query: SPEED_FILL, CONTEXT_MAX_MULTIPLIER, CONTEXTUAL_EXECUTE | 1 | 1 |
| Unsupported context query: HEALTH_STEAL, UNRESISTABLE, CONTEXTUAL_SKIP | 1 | 1 |
| Event-dependent branch requires stateful simulation: DODGE_PERCENT_ADDITIVE, CONTEXTUAL_SKIP | 1 | 1 |
| Event-dependent branch requires stateful simulation: DEFLECTION_PERCENT_ADDITIVE, CONTEXTUAL_SKIP | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: DODGE_PERCENT_ADDITIVE, UNRESISTABLE, FORCE_DEBUFF, CONTEXTUAL_EXECUTE | 1 | 1 |
| Selected ally requires an unsupported ability targeting rule: SPEED | 1 | 1 |
| Selected ally requires an unsupported ability targeting rule: HEALTH | 1 | 1 |
| Selected ally requires an unsupported ability targeting rule: SHIELD | 1 | 1 |
| Event-dependent branch requires stateful simulation: SUPPRESSION_PENETRATION_PERCENT_ADDITIVE | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: CONTEXTUAL_SKIP, ATTACK_CRITICAL_PERCENT_ADDITIVE, UNRESISTABLE | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: OFFENSE_PERCENT_ADDITIVE, UNRESISTABLE | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: EVASION_NEGATE_PERCENT_ADDITIVE | 1 | 1 |
| Unsupported context query: SUPPRESSION, CONTEXTUAL_SKIP | 1 | 1 |
| Unsupported context query: CONTEXTUAL_EXECUTE, OFFENSE_PERCENT_ADDITIVE | 1 | 1 |
| Unsupported context query: MAX_SHIELD, CONTEXTUAL_EXECUTE | 1 | 1 |
| Event-dependent branch requires stateful simulation: FORCE_DEBUFF, UNRESISTABLE, SUPPRESS_VISUALS, CONTEXTUAL_EXECUTE | 1 | 1 |
| Unmodeled operation STAT_LIMIT: MAX_HEALTH, MAX_STAT_LIMIT, STAT_LIMIT_CONTEXT_ADDITIVE | 1 | 1 |
| Unmodeled operation STAT_LIMIT: MAX_SHIELD, MAX_STAT_LIMIT, STAT_LIMIT_CONTEXT_ADDITIVE | 1 | 1 |
| Context delta requires ordered prior-value state; absolute context is approximate: MAX_HEALTH, CONTEXTUAL_EXECUTE, DELTA_CONTEXT_VALUE, CONTEXT_MAX_MULTIPLIER | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: SPEED, CONTEXTUAL_SKIP, UNRESISTABLE | 1 | 1 |
| Temporary Protection uses bounded active capacity; depletion, expiry and stacking chronology are not modeled: MAX_HEALTH, CONTEXTUAL_FILTER | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: MAX_HEALTH, CONTEXTUAL_FILTER | 1 | 1 |
| Context delta requires ordered prior-value state; absolute context is approximate: MAX_SHIELD, CONTEXTUAL_EXECUTE, DELTA_CONTEXT_VALUE, CONTEXT_MAX_MULTIPLIER | 1 | 1 |
| Unmodeled operation CURSE: FORCE_DEBUFF, UNRESISTABLE, CONDITIONAL_FILTER | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: FORCE_DEBUFF, UNRESISTABLE, CONDITIONAL_FILTER | 1 | 1 |
| Unmodeled operation MODIFY_STAT: CONTEXTUAL_EXECUTE, DEFENSE_PENETRATION_TARGET_PERCENT_ADDITIVE, UNRESISTABLE | 1 | 1 |
| Unmodeled operation MODIFY_STAT: CONTEXTUAL_SKIP, DEFENSE_PENETRATION_TARGET_PERCENT_ADDITIVE, UNRESISTABLE | 1 | 1 |
| Contextual gate has no source query: SPEED_FILL, CONTEXTUAL_SKIP | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: MAX_SHIELD, UNRESISTABLE, CONTEXTUAL_EXECUTE | 1 | 1 |
| NO_KILL lethal floor requires current remaining Health and defeat state: DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, SHIELD_PENETRATION, NO_KILL, CONTEXTUAL_EXECUTE | 1 | 1 |
| Outgoing Protection bypass requires separate damage-to-pool state: DAMAGE_HEALTH_PERCENTAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, SHIELD_PENETRATION, NO_KILL, CONTEXTUAL_EXECUTE | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: MAX_HEALTH | 1 | 1 |
| Event-dependent branch requires stateful simulation: ARMOR, CONDITIONAL_FILTER | 1 | 1 |
| Event-dependent branch requires stateful simulation: SUPPRESSION, CONTEXTUAL_FILTER, UNRESISTABLE | 1 | 1 |
| Event-dependent branch requires stateful simulation: ARMOR, CONTEXTUAL_SKIP, FORCE_DEBUFF | 1 | 1 |
| Event-dependent branch requires stateful simulation: CONTEXTUAL_EXECUTE, SUPPRESSION, FORCE_DEBUFF | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: SPEED, UNRESISTABLE, CONTEXTUAL_SKIP | 1 | 1 |
| Context delta requires ordered prior-value state; absolute context is approximate: ACCURACY, CONTEXTUAL_EXECUTE, DELTA_CONTEXT_VALUE | 1 | 1 |
| Damage Immunity expiry, hostile dispels and action order use expected lifetime rather than battle simulation: UNRESISTABLE | 1 | 1 |
| True, percent-Health, massive, reflected and no-modify/bypass damage need exact source filter precedence: UNRESISTABLE | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: DODGE_PERCENT_ADDITIVE, CONTEXTUAL_SKIP | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: DEFLECTION_PERCENT_ADDITIVE, CONTEXTUAL_SKIP | 1 | 1 |
| Event-dependent branch requires stateful simulation: EVASION_NEGATE_PERCENT_ADDITIVE, FORCE_DEBUFF | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: CRITICAL_CHANCE_PERCENT_ADDITIVE, CONTEXTUAL_SKIP | 1 | 1 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: UNRESISTABLE, SPEED_FILL, PRIORITY | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: SPEED, UNRESISTABLE | 1 | 1 |
| Contextual gate has no source query: CONTEXTUAL_EXECUTE, BLACKBOARD_OVERRIDE | 1 | 1 |
| Unsupported context query: ARMOR_PENETRATION_PERCENT_ADDITIVE, UNRESISTABLE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: MAX_SHIELD, CONTEXT_MAX_MULTIPLIER | 1 | 1 |
| Event-dependent branch requires stateful simulation: HEALTH_STEAL, UNRESISTABLE, CONDITIONAL_FILTER | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: UNRESISTABLE, HEALTH, CONTEXTUAL_SKIP | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: UNRESISTABLE, HEALTH, CONTEXTUAL_SKIP | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: UNRESISTABLE, SHIELD, CONTEXTUAL_SKIP | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: UNRESISTABLE, SHIELD, CONTEXTUAL_SKIP | 1 | 1 |
| Event-dependent branch requires stateful simulation: UNRESISTABLE, SPEED_FILL, CONTEXT_MAX_MULTIPLIER | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: SPEED_FILL, CONTEXT_MAX_MULTIPLIER, CONDITIONAL_FILTER | 1 | 1 |
| Event-dependent branch requires stateful simulation: SPEED_FILL, CONTEXT_MAX_MULTIPLIER, CONDITIONAL_FILTER | 1 | 1 |
| Contextual gate has no source query: SPEED, CONTEXTUAL_SKIP | 1 | 1 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: ABILITY_CRITICAL_NEGATE_PERCENT_ADDITIVE, UNRESISTABLE | 1 | 1 |
| Unsupported context query: SUPPRESSION_PENETRATION, UNRESISTABLE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Unsupported context query: ABILITY_CRITICAL_NEGATE_PERCENT_ADDITIVE, UNRESISTABLE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Unsupported ancestor context query: UNRESISTABLE, CRITICAL_DAMAGE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: ATTACK_CRITICAL_NEGATE_PERCENT_ADDITIVE, FORCE_BUFF, CONTEXTUAL_FILTER | 1 | 1 |
| Unmodeled operation SCRIPT_COMPONENT: PLAY_CUTSCENE, CONTEXTUAL_SKIP | 1 | 1 |
| Unsupported cooldown parameters: CONDITIONAL_FILTER: ABILITY_COOLDOWN, CONDITIONAL_FILTER, RECOVER_ABILITIES_TAG | 1 | 1 |
| Dispel filter/count/source semantics require active effect instance state: DISPELL_ALL, CONTEXTUAL_FILTER | 1 | 1 |
| Dispel of non-control buffs or custom markers requires explicit active effect state: DISPELL_ALL, CONTEXTUAL_FILTER | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: DISPELL_ALL, CONTEXTUAL_FILTER | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: ARMOR_PENETRATION_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: SUPPRESSION_PENETRATION_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Enemy clearable buff removal uses bounded buff-share proxy; individual buff lifetime and dispellability state are not modeled: CONTEXTUAL_EXECUTE, UNRESISTABLE | 1 | 1 |
| Unmodeled operation SCRIPT_COMPONENT: PLAY_UNIT_TIMELINE | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: INCOMING, CONTEXTUAL_EXECUTE | 1 | 1 |
| Unmodeled operation MODIFY_DAMAGE: OUTGOING, UNRESISTABLE | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: SPEED_FILL, PRIORITY, CONDITIONAL_FILTER, CONTEXTUAL_EXECUTE | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: SPEED_FILL, PRIORITY, CONDITIONAL_FILTER, CONTEXTUAL_EXECUTE | 1 | 1 |
| Health/Protection equalization or redistribution needs current pool state: CONTEXTUAL_EXECUTE, HEALTH | 1 | 1 |
| Health/Protection equalization or redistribution needs current pool state: SHIELD, CONTEXTUAL_EXECUTE | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: CONTEXTUAL_EXECUTE, OUTGOING | 1 | 1 |
| Unsupported context query: OUTGOING, UNRESISTABLE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Additional immunity filters are outside the supported control types: UNRESISTABLE, CONTEXTUAL_SKIP | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: COUNTER_ATTACK_RATING, CONTEXTUAL_SKIP, SUPPRESS_VISUALS | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: INCOMING, CONTEXTUAL_SKIP | 1 | 1 |
| Forced ability needs explicit rotation/target state: CONTEXTUAL_SKIP | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: SPEED, SUPPRESS_VISUALS, CONTEXTUAL_SKIP | 1 | 1 |
| Unmodeled operation MODIFY_DAMAGE: CONTEXTUAL_SKIP, INCOMING, FORCE_BUFF | 1 | 1 |
| Unmodeled operation STAT_LIMIT: SPEED, MIN_STAT_LIMIT, CONTEXTUAL_EXECUTE | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: ATTACK_DAMAGE, NO_COUNTER_ATTACK, CONTEXTUAL_FILTER | 1 | 1 |
| Event-dependent branch requires stateful simulation: ATTACK_DAMAGE, NO_COUNTER_ATTACK, CONTEXTUAL_FILTER | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ABILITY_CRITICAL_NEGATE_PERCENT_ADDITIVE, FORCE_BUFF, CONTEXTUAL_EXECUTE | 1 | 1 |
| Source creator override needs explicit effect ownership state: ARMOR, UNRESISTABLE, SOURCE_OVERRIDE_CREATOR | 1 | 1 |
| Event-dependent branch requires stateful simulation: ARMOR, UNRESISTABLE, SOURCE_OVERRIDE_CREATOR | 1 | 1 |
| Event-dependent branch requires stateful simulation: CONTEXTUAL_EXECUTE, SUPPRESSION, CONTEXT_MAX_MULTIPLIER | 1 | 1 |
| Unsupported context query: SPEED_FILL, CONTEXT_MAX_MULTIPLIER, UNRESISTABLE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Source creator override needs explicit effect ownership state: ATTACK_DAMAGE, UNRESISTABLE, SOURCE_OVERRIDE_CREATOR | 1 | 1 |
| Source creator override needs explicit effect ownership state: HEALTH_STEAL, SOURCE_OVERRIDE_CREATOR, UNRESISTABLE | 1 | 1 |
| Source creator override needs explicit effect ownership state: ATTACK_CRITICAL_PERCENT_ADDITIVE, SOURCE_OVERRIDE_CREATOR, UNRESISTABLE | 1 | 1 |
| Source creator override needs explicit effect ownership state: ARMOR_PENETRATION, UNRESISTABLE, SOURCE_OVERRIDE_CREATOR | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: COUNTER_ATTACK_RATING, CONTEXTUAL_EXECUTE | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: ATTACK_CRITICAL_NEGATE_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: ACCURACY, CONDITIONAL_FILTER | 1 | 1 |
| Temporary Protection uses bounded active capacity; depletion, expiry and stacking chronology are not modeled: MAX_SHIELD | 1 | 1 |
| Full Turn Meter set/reset timing requires ordered action state: SPEED_FILL | 1 | 1 |
| Contextual gate has no source query: DEFLECTION_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Event-dependent branch requires stateful simulation: MAX_HEALTH, CONTEXT_MAX_MULTIPLIER, CONTEXTUAL_EXECUTE | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ARMOR, CONTEXTUAL_SKIP | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: SUPPRESSION, CONTEXTUAL_SKIP | 1 | 1 |
| Event-dependent branch requires stateful simulation: DODGE_NEGATE_PERCENT_ADDITIVE, UNRESISTABLE | 1 | 1 |
| Event-dependent branch requires stateful simulation: DEFLECTION_NEGATE_PERCENT_ADDITIVE, UNRESISTABLE | 1 | 1 |
| Ability tags without RECOVER_ABILITIES_TAG have unverified semantics: ABILITY_COOLDOWN, CONTEXTUAL_SKIP | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: OFFENSE_PERCENT_ADDITIVE, UNRESISTABLE, CONTEXTUAL_SKIP | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ATTACK_DAMAGE, UNRESISTABLE | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ABILITY_POWER, UNRESISTABLE | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: SPEED_FILL | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: ATTACK_CRITICAL_PERCENT_ADDITIVE, UNRESISTABLE, CONTEXTUAL_FILTER | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: FORCE_DEBUFF, CONTEXTUAL_EXECUTE | 1 | 1 |
| Temporary Protection uses bounded active capacity; depletion, expiry and stacking chronology are not modeled: MAX_SHIELD, CONTEXTUAL_EXECUTE, UNRESISTABLE | 1 | 1 |
| Unsupported ancestor context query: ARMOR, UNRESISTABLE | 1 | 1 |
| Unsupported ancestor context query: SUPPRESSION, UNRESISTABLE | 1 | 1 |
| Unsupported ancestor context query: ACCURACY, UNRESISTABLE | 1 | 1 |
| Unsupported ancestor context query: ATTACK_DAMAGE | 1 | 1 |
| Unsupported ancestor context query: ABILITY_POWER | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: ARMOR, CONTEXTUAL_FILTER | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: SUPPRESSION, CONTEXTUAL_FILTER | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: FORCE_DEBUFF | 1 | 1 |
| Unsupported context query: SUPPRESSION, UNRESISTABLE, CONTEXTUAL_SKIP | 1 | 1 |
| Unsupported context query: CONTEXTUAL_SKIP | 1 | 1 |
| Dispel filter/count/source semantics require active effect instance state: UNRESISTABLE, CONTEXTUAL_SKIP | 1 | 1 |
| Unsupported ancestor context query: OFFENSE_PERCENT_ADDITIVE | 1 | 1 |
| Unsupported context query: ATTACK_CRITICAL_NEGATE_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Unsupported ancestor context query: ARMOR_PENETRATION, UNRESISTABLE | 1 | 1 |
| Unsupported ancestor context query: SUPPRESSION_PENETRATION, CONTEXTUAL_EXECUTE, UNRESISTABLE | 1 | 1 |
| Unsupported ancestor context query: SPEED, UNRESISTABLE | 1 | 1 |
| Unsupported ancestor context query: ABILITY_CRITICAL_PERCENT_ADDITIVE, UNRESISTABLE | 1 | 1 |
| Unmodeled operation QUERY_UNIT_VALUE: ULTIMATE_CHARGE, CURRENT_NUMERICAL | 1 | 1 |
| Unsupported context query: DODGE_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Unmodeled operation CURSE: UNRESISTABLE, CONTEXTUAL_FILTER | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: UNRESISTABLE, FORCE_DEBUFF, EVASION_NEGATE_PERCENT_ADDITIVE, CONTEXTUAL_FILTER | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: UNRESISTABLE, FORCE_DEBUFF, ATTACK_CRITICAL_NEGATE_PERCENT_ADDITIVE, CONTEXTUAL_FILTER | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: UNRESISTABLE, FORCE_DEBUFF, COUNTER_ATTACK_RATING, CONTEXTUAL_FILTER | 1 | 1 |
| Event-dependent branch requires stateful simulation: EVASION_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: SPEED, CONTEXTUAL_FILTER | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: ATTACK_CRITICAL_PERCENT_ADDITIVE, CONTEXTUAL_SKIP | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: ABILITY_CRITICAL_PERCENT_ADDITIVE, CONTEXTUAL_SKIP | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: HEALTH, CONTEXTUAL_SKIP | 1 | 1 |
| Per-attack probabilistic penetration and ordering use an expected stat proxy, not independently modeled damage branches: SUPPRESSION_PENETRATION_PERCENT_ADDITIVE, UNRESISTABLE | 1 | 1 |
| Event-dependent branch requires stateful simulation: MAX_HEALTH, UNRESISTABLE, CONTEXT_MAX_MULTIPLIER, CONTEXTUAL_EXECUTE | 1 | 1 |
| Event-dependent branch requires stateful simulation: MAX_SHIELD, UNRESISTABLE, CONTEXT_MAX_MULTIPLIER, CONTEXTUAL_EXECUTE | 1 | 1 |
| Unmodeled operation STAT_LIMIT: UNRESISTABLE, SPEED, MAX_STAT_LIMIT, STAT_LIMIT_CONTEXT_ADDITIVE | 1 | 1 |
| Unmodeled operation QUERY_UNIT_VALUE: STAMINA, CURRENT_NUMERICAL | 1 | 1 |
| Unmodeled operation GRANT_ABILITY: UNRESISTABLE, CONTEXTUAL_SKIP | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: COUNTER_ATTACK_RATING, UNRESISTABLE | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: EVASION_NEGATE_PERCENT_ADDITIVE, FORCE_DEBUFF, CONTEXTUAL_EXECUTE | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: FORCE_DEBUFF, ATTACK_DAMAGE | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: MAX_HEALTH, UNRESISTABLE | 1 | 1 |
| Event-dependent branch requires stateful simulation: FORCE_DEBUFF, ATTACK_DAMAGE | 1 | 1 |
| Ability tags without RECOVER_ABILITIES_TAG have unverified semantics: ABILITY_COOLDOWN, UNRESISTABLE | 1 | 1 |
| Forced ability needs explicit rotation/target state: UNRESISTABLE | 1 | 1 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: ACCURACY, UNRESISTABLE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Unmodeled operation QUERY_UNIT_VALUE: HEALTH, CURRENT_NUMERICAL | 1 | 1 |
| Unsupported context query: MAX_SHIELD | 1 | 1 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: DISPELL_ALL, CONTEXTUAL_EXECUTE | 1 | 1 |
| Selected ally requires an unsupported ability targeting rule: ATTACK_DAMAGE | 1 | 1 |
| Selected ally requires an unsupported ability targeting rule: ABILITY_POWER | 1 | 1 |
| Selected ally requires an unsupported ability targeting rule: ACCURACY | 1 | 1 |
| Selected ally requires an unsupported ability targeting rule: CONTEXTUAL_EXECUTE | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: MAX_HEALTH, UNRESISTABLE, CONTEXT_MAX_MULTIPLIER, CONTEXTUAL_EXECUTE | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: ARMOR, CONTEXTUAL_EXECUTE, CONDITIONAL_FILTER | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: ARMOR, CONTEXTUAL_EXECUTE, CONDITIONAL_FILTER | 1 | 1 |
| Unsupported context query: BLACKBOARD_OVERRIDE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Unsupported context query: CONTEXTUAL_EXECUTE, RESISTANCE, UNRESISTABLE | 1 | 1 |
| Unmodeled operation BLACKBOARD_LOOP: CONTEXTUAL_EXECUTE | 1 | 1 |
| Unmodeled operation MODIFY_RECOVER: INCOMING, SHIELD, UNRESISTABLE | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: SPEED_PERCENT_ADDITIVE, UNRESISTABLE | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: FORCE_DEBUFF, SUPPRESS_VISUALS, CONTEXTUAL_EXECUTE | 1 | 1 |
| Full Turn Meter set/reset timing requires ordered action state: SPEED_FILL, UNRESISTABLE, PRIORITY, CONTEXTUAL_EXECUTE | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: SPEED_FILL, UNRESISTABLE, PRIORITY, CONTEXTUAL_EXECUTE | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: CONTEXTUAL_EXECUTE, EVASION_NEGATE_PERCENT_ADDITIVE, FORCE_DEBUFF, UNRESISTABLE | 1 | 1 |
| Unmodeled operation STAT_LIMIT: TAUNT, SUPPRESS_VISUALS, MAX_STAT_LIMIT, CONTEXTUAL_SKIP | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: ABILITY_POWER, CONTEXTUAL_EXECUTE, CONTEXT_MAX_MULTIPLIER | 1 | 1 |
| Unsupported context query: ATTACK_DAMAGE | 1 | 1 |
| Unsupported context query: ABILITY_POWER | 1 | 1 |
| Unsupported ancestor context query: OFFENSE_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: OFFENSE_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Event-dependent branch requires stateful simulation: UNRESISTABLE, CONTEXTUAL_FILTER | 1 | 1 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: UNRESISTABLE, CONTEXTUAL_FILTER | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: SHIELD, UNRESISTABLE | 1 | 1 |
| Unsupported ancestor context query: UNRESISTABLE, ATTACK_DAMAGE | 1 | 1 |
| Unsupported ancestor context query: UNRESISTABLE, ABILITY_POWER | 1 | 1 |
| Unmodeled operation MODIFY_STAT: TAUNT, UNRESISTABLE, CONTEXTUAL_EXECUTE, CONTEXTUAL_FILTER | 1 | 1 |
| Revival requires death state or default pool semantics: CONTEXTUAL_SKIP | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: COUNTER_ATTACK_RATING, UNRESISTABLE, CONTEXTUAL_EXECUTE, CONTEXTUAL_FILTER | 1 | 1 |
| Unmodeled operation SUMMON_UNIT: (no parameters) | 1 | 1 |
| Unmodeled operation STAT_LIMIT: TAUNT, SUPPRESS_VISUALS, MAX_STAT_LIMIT | 1 | 1 |
| Unsupported context query: CONTEXTUAL_FILTER | 1 | 1 |
| Event-dependent branch requires stateful simulation: CONTEXTUAL_FILTER | 1 | 1 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: ARMOR, UNRESISTABLE | 1 | 1 |
| Unmodeled operation STAT_LIMIT: SPEED, MAX_STAT_LIMIT | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: UNRESISTABLE, ARMOR, CONDITIONAL_FILTER | 1 | 1 |
| Contextual gate has no source query: UNRESISTABLE, ARMOR, CONTEXTUAL_SKIP, CONDITIONAL_FILTER | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: UNRESISTABLE, SUPPRESSION, CONDITIONAL_FILTER | 1 | 1 |
| Contextual gate has no source query: UNRESISTABLE, SUPPRESSION, CONTEXTUAL_SKIP, CONDITIONAL_FILTER | 1 | 1 |
| Unsupported context query: CONTEXTUAL_FILTER, SUPPRESSION, UNRESISTABLE | 1 | 1 |
| Immunity/custom debuff requires effect-specific state: FORCE_DEBUFF, CONTEXTUAL_EXECUTE, SOURCE_OVERRIDE_CREATOR | 1 | 1 |
| Contextual gate has no source query: ATTACK_CRITICAL_NEGATE_PERCENT_ADDITIVE, UNRESISTABLE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Event-dependent branch requires stateful simulation: ACCURACY, CONTEXT_MAX_MULTIPLIER | 1 | 1 |
| Contextual gate has no source query: ATTACK_CRITICAL_NEGATE_PERCENT_ADDITIVE, FORCE_BUFF, CONTEXTUAL_SKIP | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: UNRESISTABLE, FORCE_DEBUFF | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: CRITICAL_NEGATE_CHANCE_PERCENT_ADDITIVE, CONTEXTUAL_FILTER | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: RESISTANCE, CONTEXTUAL_FILTER | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: CRITICAL_NEGATE_CHANCE_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Unsupported ancestor context query: MAX_HEALTH, UNRESISTABLE, CONTEXTUAL_SKIP | 1 | 1 |
| Event-dependent branch requires stateful simulation: ATTACK_DAMAGE, CONTEXTUAL_SKIP, FORCE_DEBUFF | 1 | 1 |
| Contextual gate has no source query: ARMOR, UNRESISTABLE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: UNRESISTABLE, COUNTER_ATTACK_RATING | 1 | 1 |
| Unsupported context query: ARMOR_PENETRATION, UNRESISTABLE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: SUPPRESSION_PENETRATION, UNRESISTABLE, CONTEXTUAL_FILTER | 1 | 1 |
| Event-dependent branch requires stateful simulation: ACCURACY, UNRESISTABLE, CONTEXTUAL_SKIP | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: ATTACK_DAMAGE, UNRESISTABLE, CONTEXTUAL_EXECUTE, CONDITIONAL_FILTER | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: ABILITY_POWER, UNRESISTABLE, CONTEXTUAL_EXECUTE, CONDITIONAL_FILTER | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: ARMOR, UNRESISTABLE, CONTEXTUAL_EXECUTE, CONDITIONAL_FILTER | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: SUPPRESSION, UNRESISTABLE, CONTEXTUAL_EXECUTE, CONDITIONAL_FILTER | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: CRITICAL_DAMAGE, UNRESISTABLE, CONTEXTUAL_EXECUTE, CONDITIONAL_FILTER | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: CONTEXTUAL_EXECUTE, CONDITIONAL_FILTER | 1 | 1 |
| Immunity/custom debuff requires effect-specific state: CONTEXTUAL_EXECUTE, CONDITIONAL_FILTER, UNRESISTABLE, FORCE_DEBUFF | 1 | 1 |
| Basic dispel effect state on bonus attacks and counters is not modeled: CONTEXTUAL_FILTER, CONTEXTUAL_EXECUTE, DISPELL_ALL, UNRESISTABLE | 1 | 1 |
| Temporary Protection uses bounded active capacity; depletion, expiry and stacking chronology are not modeled: ARMOR, UNRESISTABLE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: EVASION_NEGATE_PERCENT_ADDITIVE, FORCE_DEBUFF, CONTEXTUAL_SKIP | 1 | 1 |
| Selected ally requires an unsupported ability targeting rule: DODGE_PERCENT_ADDITIVE, UNRESISTABLE | 1 | 1 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: UNRESISTABLE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Cooldown reset, event, recipient or execution ordering needs explicit state: ABILITY_COOLDOWN, CONTEXTUAL_SKIP, UNRESISTABLE | 1 | 1 |
| Unsupported context query: ARMOR, UNRESISTABLE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Selected ally requires an unsupported ability targeting rule: ATTACK_DAMAGE, UNRESISTABLE | 1 | 1 |
| Selected ally requires an unsupported ability targeting rule: ARMOR, UNRESISTABLE | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: MAX_HEALTH, CONTEXTUAL_EXECUTE, CONTEXT_MAX_MULTIPLIER | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: MAX_SHIELD, UNRESISTABLE, CONTEXTUAL_EXECUTE, CONTEXT_MAX_MULTIPLIER | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: EVASION_NEGATE_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE, CONDITIONAL_FILTER | 1 | 1 |
| Event-dependent branch requires stateful simulation: EVASION_NEGATE_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE, CONDITIONAL_FILTER | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ATTACK_CRITICAL_NEGATE_PERCENT_ADDITIVE, CONTEXTUAL_SKIP | 1 | 1 |
| Unsupported ancestor context query: FORCE_DEBUFF, UNRESISTABLE | 1 | 1 |
| Unsupported ancestor context query: UNRESISTABLE, COUNTER_ATTACK_RATING | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: FORCE_DEBUFF, CONDITIONAL_FILTER | 1 | 1 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: FORCE_DEBUFF, CONDITIONAL_FILTER | 1 | 1 |
| Unsupported ancestor context query: SPEED_FILL, UNRESISTABLE | 1 | 1 |
| Contextual gate has no source query: CONTEXTUAL_EXECUTE, UNRESISTABLE, DODGE_PERCENT_ADDITIVE | 1 | 1 |
| Contextual gate has no source query: EVASION_NEGATE_PERCENT_ADDITIVE, FORCE_DEBUFF, CONTEXTUAL_EXECUTE | 1 | 1 |
| Contextual gate has no source query: RESISTANCE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Contextual gate has no source query: FORCE_DEBUFF, COUNTER_ATTACK_RATING, CONTEXTUAL_EXECUTE | 1 | 1 |
| Contextual gate has no source query: ATTACK_CRITICAL_NEGATE_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE, FORCE_DEBUFF | 1 | 1 |
| Unmodeled operation GRANT_ABILITY: CONTEXTUAL_SKIP | 1 | 1 |
| Unsupported context query: CONTEXT_MAX_MULTIPLIER, HEALTH | 1 | 1 |
| Unsupported context query: CONTEXT_MAX_MULTIPLIER, SPEED_FILL | 1 | 1 |
| Unsupported context query: EVASION_NEGATE_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE, UNRESISTABLE | 1 | 1 |
| Cooldown reset, event, recipient or execution ordering needs explicit state: ABILITY_COOLDOWN, CONTEXTUAL_EXECUTE, UNRESISTABLE | 1 | 1 |
| Event-dependent branch requires stateful simulation: HEALTH, CONTEXT_MAX_MULTIPLIER, UNRESISTABLE | 1 | 1 |
| Unmodeled operation STAT_LIMIT: TAUNT, UNRESISTABLE, SUPPRESS_VISUALS, MAX_STAT_LIMIT | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: CRITICAL_CHANCE_PERCENT_ADDITIVE, UNRESISTABLE, CONDITIONAL_FILTER | 1 | 1 |
| Event-dependent branch requires stateful simulation: CRITICAL_CHANCE_PERCENT_ADDITIVE, UNRESISTABLE, CONDITIONAL_FILTER | 1 | 1 |
| Unmodeled operation MODIFY_DAMAGE: OUTGOING, UNRESISTABLE, CONDITIONAL_FILTER | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: CRITICAL_CHANCE_PERCENT_ADDITIVE, UNRESISTABLE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: OUTGOING, UNRESISTABLE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: CONTEXTUAL_SKIP | 1 | 1 |
| NO_KILL lethal floor requires current remaining Health and defeat state: CONTEXTUAL_EXECUTE, CONDITIONAL_FILTER, ATTACK_DAMAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, NO_KILL | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: CONTEXTUAL_EXECUTE, CONDITIONAL_FILTER, ATTACK_DAMAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, NO_KILL | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: CONTEXTUAL_EXECUTE, CONDITIONAL_FILTER, ATTACK_DAMAGE, NO_COUNTER_ATTACK, NO_HEALTH_STEAL, NO_KILL | 1 | 1 |
| Unsupported ancestor context query: SPEED_FILL | 1 | 1 |
| Event-dependent branch requires stateful simulation: CRITICAL_CHANCE_PERCENT_ADDITIVE, UNRESISTABLE | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: CONDITIONAL_FILTER, CONTEXTUAL_EXECUTE, SPEED, UNRESISTABLE | 1 | 1 |
| Event-dependent branch requires stateful simulation: CONDITIONAL_FILTER, CONTEXTUAL_EXECUTE, SPEED, UNRESISTABLE | 1 | 1 |
| Unmodeled operation STAT_LIMIT: FORCE_DEBUFF, MAX_SHIELD, MAX_STAT_LIMIT, CONDITIONAL_FILTER, CONTEXTUAL_EXECUTE, UNRESISTABLE | 1 | 1 |
| Contextual gate has no source query: NO_COUNTER_ATTACK, MAX_HEALTH, CONTEXTUAL_SKIP, NO_HEALTH_STEAL | 1 | 1 |
| Contextual gate has no source query: HEALTH, CONTEXTUAL_EXECUTE | 1 | 1 |
| Source conditional filter semantics are not equivalent to context execution gates: CRITICAL_DAMAGE, CONTEXTUAL_FILTER | 1 | 1 |
| Event-dependent branch requires stateful simulation: ARMOR, UNRESISTABLE, CONTEXTUAL_SKIP | 1 | 1 |
| Event-dependent branch requires stateful simulation: SUPPRESSION, UNRESISTABLE, CONTEXTUAL_SKIP | 1 | 1 |
| Damage Immunity expiry, hostile dispels and action order use expected lifetime rather than battle simulation: (no parameters) | 1 | 1 |
| True, percent-Health, massive, reflected and no-modify/bypass damage need exact source filter precedence: (no parameters) | 1 | 1 |
| Event-dependent branch requires stateful simulation: ATTACK_DAMAGE, NO_COUNTER_ATTACK, CONTEXTUAL_EXECUTE | 1 | 1 |
| Event-dependent branch requires stateful simulation: ATTACK_DAMAGE, NO_COUNTER_ATTACK, CONTEXTUAL_SKIP | 1 | 1 |
| Context delta requires ordered prior-value state; absolute context is approximate: CONTEXTUAL_EXECUTE, CRITICAL_DAMAGE, DELTA_CONTEXT_VALUE, UNRESISTABLE | 1 | 1 |
| Event-dependent branch requires stateful simulation: ATTACK_CRITICAL_PERCENT_ADDITIVE, CONTEXTUAL_SKIP | 1 | 1 |
| Event-dependent branch requires stateful simulation: ABILITY_CRITICAL_PERCENT_ADDITIVE, CONTEXTUAL_SKIP | 1 | 1 |
| Critical-event incidence uses an action/channel proxy; actual damage packet and ability critical rates are not independently modeled: RESISTANCE, UNRESISTABLE | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: SPEED_FILL, CONTEXTUAL_SKIP | 1 | 1 |
| Unsupported context query: ATTACK_CRITICAL_PERCENT_ADDITIVE, UNRESISTABLE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Unsupported context query: MAX_HEALTH, UNRESISTABLE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: HEALTH, UNRESISTABLE | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: DEFLECTION_NEGATE_PERCENT_ADDITIVE, CONTEXTUAL_EXECUTE, UNRESISTABLE | 1 | 1 |
| Unmodeled operation COPY_EFFECT: COPY_CURRENT, UNRESISTABLE | 1 | 1 |
| Unsupported context query: MAX_HEALTH, UNRESISTABLE, CONTEXTUAL_SKIP | 1 | 1 |
| Unsupported context query: ATTACK_CRITICAL_NEGATE_PERCENT_ADDITIVE, FORCE_BUFF, CONTEXTUAL_SKIP | 1 | 1 |
| Unsupported context query: ABILITY_CRITICAL_NEGATE_PERCENT_ADDITIVE, FORCE_BUFF, CONTEXTUAL_SKIP | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ATTACK_DAMAGE, CONTEXTUAL_SKIP, FORCE_DEBUFF | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ATTACK_DAMAGE, CONTEXTUAL_EXECUTE, FORCE_DEBUFF | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ABILITY_CRITICAL_PERCENT_ADDITIVE, CONTEXTUAL_SKIP | 1 | 1 |
| Contextual predicate requires joint state probability; expected-count gate is approximate: ATTACK_DAMAGE, CONTEXTUAL_EXECUTE, CONTEXT_MAX_MULTIPLIER | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: HEALTH, UNRESISTABLE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Context delta requires ordered prior-value state; absolute context is approximate: ARMOR, CONTEXTUAL_EXECUTE, DELTA_CONTEXT_VALUE, CONTEXT_MAX_MULTIPLIER | 1 | 1 |
| Context delta requires ordered prior-value state; absolute context is approximate: SUPPRESSION, CONTEXTUAL_EXECUTE, DELTA_CONTEXT_VALUE, CONTEXT_MAX_MULTIPLIER | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: OFFENSE_PERCENT_ADDITIVE, UNRESISTABLE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Unmodeled operation MODIFY_RECOVER: INCOMING, SHIELD, CONTEXTUAL_EXECUTE | 1 | 1 |
| Unmodeled operation MODIFY_RECOVER: INCOMING, HEALTH, CONTEXTUAL_EXECUTE | 1 | 1 |
| Unsupported alternatives in a partially modeled event group: HEALTH_STEAL, CONTEXTUAL_EXECUTE | 1 | 1 |
| Unsupported context query: MAX_HEALTH, NO_COUNTER_ATTACK | 1 | 1 |
| Contextual gate has no source query: OFFENSE_PERCENT_ADDITIVE, UNRESISTABLE, CONTEXTUAL_SKIP | 1 | 1 |
| Contextual gate has no source query: UNRESISTABLE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Additional immunity filters are outside the supported control types: UNRESISTABLE, CONTEXTUAL_EXECUTE | 1 | 1 |
| Basic follow-up event/TM propagation on bonus attacks or counters is not modeled: SPEED_FILL, CONTEXT_MAX_MULTIPLIER | 1 | 1 |

## Per-character source inventory

| Character | Abilities | Compiled operations | Omitted branches |
|---|---:|---:|---:|
| 4-LOM (4LOM) | 6 | 34 | 34 |
| 50R-T (50RT) | 5 | 44 | 44 |
| Aayla Secura (AAYLASECURA) | 5 | 33 | 45 |
| Lando Calrissian (ADMINISTRATORLANDO) | 4 | 7 | 3 |
| Admiral Ackbar (ADMIRALACKBAR) | 4 | 10 | 10 |
| Admiral Piett (ADMIRALPIETT) | 5 | 67 | 106 |
| Admiral Raddus (ADMIRALRADDUS) | 5 | 62 | 136 |
| Ahsoka Tano (Snips) (AHSOKATANO) | 4 | 31 | 26 |
| Amilyn Holdo (AMILYNHOLDO) | 4 | 19 | 14 |
| Jedi Knight Anakin (ANAKINKNIGHT) | 4 | 17 | 12 |
| CC-1119 "Appo" (APPO) | 5 | 36 | 35 |
| ARC Trooper (ARCTROOPER501ST) | 4 | 9 | 6 |
| The Armorer (ARMORER) | 5 | 18 | 32 |
| Asajj Ventress (Dark Disciple) (ASAJJDARKDISCIPLE) | 6 | 50 | 78 |
| Asajj Ventress (ASAJVENTRESS) | 5 | 17 | 7 |
| Aurra Sing (AURRA_SING) | 6 | 20 | 32 |
| B1 Battle Droid (B1BATTLEDROIDV2) | 4 | 42 | 22 |
| B2 Super Battle Droid (B2SUPERBATTLEDROID) | 4 | 17 | 22 |
| Echo (BADBATCHECHO) | 4 | 20 | 28 |
| Hunter (BADBATCHHUNTER) | 4 | 28 | 17 |
| Omega (BADBATCHOMEGA) | 4 | 44 | 58 |
| Tech (BADBATCHTECH) | 4 | 28 | 32 |
| Wrecker (BADBATCHWRECKER) | 4 | 21 | 18 |
| Barriss Offee (BARRISSOFFEE) | 4 | 16 | 5 |
| Bastila Shan (BASTILASHAN) | 6 | 40 | 27 |
| Bastila Shan (Fallen) (BASTILASHANDARK) | 6 | 39 | 65 |
| Batcher (BATCHERS3) | 4 | 40 | 110 |
| Baylan Skoll (BAYLANSKOLL) | 6 | 61 | 61 |
| Baze Malbus (BAZEMALBUS) | 5 | 33 | 93 |
| BB-8 (BB8) | 5 | 26 | 19 |
| Ben Solo (BENSOLO) | 5 | 25 | 21 |
| Biggs Darklighter (BIGGSDARKLIGHTER) | 3 | 14 | 3 |
| Colonel Ward (BISHOP) | 4 | 29 | 66 |
| Bistan (BISTAN) | 4 | 13 | 13 |
| Boba Fett (BOBAFETT) | 6 | 30 | 38 |
| Boba Fett, Scion of Jango (BOBAFETTSCION) | 6 | 43 | 65 |
| Bodhi Rook (BODHIROOK) | 4 | 20 | 8 |
| Bo-Katan Kryze (BOKATAN) | 4 | 19 | 25 |
| Gungan Boomadier (BOOMADIER) | 4 | 26 | 18 |
| Bossk (BOSSK) | 6 | 35 | 35 |
| Boss Nass (BOSSNASS) | 6 | 43 | 43 |
| Boushh (Leia Organa) (BOUSHH) | 6 | 66 | 71 |
| Brutus (BRUTUS) | 4 | 98 | 187 |
| BT-1 (BT1) | 4 | 29 | 30 |
| Threepio & Chewie (C3POCHEWBACCA) | 4 | 23 | 81 |
| C-3PO (C3POLEGENDARY) | 7 | 37 | 86 |
| Cad Bane (CADBANE) | 5 | 19 | 41 |
| Cal Kestis (CALKESTIS) | 4 | 43 | 57 |
| Canderous Ordo (CANDEROUSORDO) | 4 | 25 | 22 |
| Captain Drogan (CAPTAINDROGAN) | 4 | 40 | 36 |
| Captain Enoch (CAPTAINENOCH) | 4 | 37 | 78 |
| Captain Rex (CAPTAINREX) | 4 | 24 | 61 |
| Captain Silvo (CAPTAINSILVO) | 5 | 71 | 64 |
| Captain Tarpals (CAPTAINTARPALS) | 4 | 28 | 27 |
| Cara Dune (CARADUNE) | 4 | 18 | 13 |
| Captain Carson Teva (CARSONTEVA) | 4 | 38 | 137 |
| Carth Onasi (CARTHONASI) | 4 | 18 | 16 |
| Cassian Andor (CASSIANANDOR) | 4 | 74 | 65 |
| Cassian Andor (Undercover) (CASSIANUNDERCOVER) | 5 | 103 | 98 |
| CC-2224 "Cody" (CC2224) | 4 | 23 | 13 |
| Cere Junda (CEREJUNDA) | 5 | 41 | 15 |
| Chewbacca (CHEWBACCALEGENDARY) | 5 | 23 | 36 |
| Chief Chirpa (CHIEFCHIRPA) | 4 | 13 | 7 |
| Chief Nebit (CHIEFNEBIT) | 4 | 8 | 11 |
| Chirrut Îmwe (CHIRRUTIMWE) | 5 | 23 | 45 |
| Chopper (CHOPPERS3) | 4 | 14 | 15 |
| Cinta Kaz (CINTA) | 4 | 41 | 67 |
| Clone Sergeant - Phase I (CLONESERGEANTPHASEI) | 3 | 11 | 10 |
| Clone Wars Chewbacca (CLONEWARSCHEWBACCA) | 4 | 11 | 4 |
| Cobb Vanth (COBBVANTH) | 6 | 81 | 134 |
| Colonel Starck (COLONELSTARCK) | 4 | 18 | 7 |
| Commander Ahsoka Tano (COMMANDERAHSOKA) | 4 | 45 | 52 |
| Commander Luke Skywalker (COMMANDERLUKESKYWALKER) | 6 | 43 | 23 |
| Coruscant Underworld Police (CORUSCANTUNDERWORLDPOLICE) | 3 | 8 | 1 |
| Count Dooku (COUNTDOOKU) | 5 | 25 | 20 |
| Crosshair (Scarred) (CROSSHAIRS3) | 4 | 28 | 73 |
| CT-21-0408 "Echo" (CT210408) | 4 | 17 | 28 |
| CT-5555 "Fives" (CT5555) | 5 | 23 | 22 |
| CT-7567 "Rex" (CT7567) | 5 | 22 | 11 |
| Old Daka (DAKA) | 4 | 12 | 15 |
| Rey (Dark Side Vision) (DARKREY) | 5 | 53 | 98 |
| Dark Trooper (DARKTROOPER) | 4 | 24 | 27 |
| Darth Bane (DARTHBANE) | 5 | 79 | 34 |
| Darth Jar Jar (DARTHJARJAR) | 5 | 68 | 120 |
| Darth Malak (DARTHMALAK) | 5 | 36 | 54 |
| Darth Malgus (DARTHMALGUS) | 5 | 32 | 41 |
| Darth Nihilus (DARTHNIHILUS) | 5 | 19 | 25 |
| Darth Revan (DARTHREVAN) | 6 | 82 | 100 |
| Darth Sidious (DARTHSIDIOUS) | 4 | 23 | 15 |
| Darth Sion (DARTHSION) | 5 | 30 | 34 |
| Darth Talon (DARTHTALON) | 5 | 36 | 74 |
| Darth Traya (DARTHTRAYA) | 5 | 106 | 374 |
| Dash Rendar (DASHRENDAR) | 5 | 38 | 35 |
| Dathcha (DATHCHA) | 4 | 11 | 12 |
| Death Trooper (DEATHTROOPER) | 4 | 19 | 19 |
| Death Trooper (Peridea) (DEATHTROOPERPERIDEA) | 4 | 39 | 33 |
| Dedra Meero (DEDRAMEERO) | 5 | 39 | 89 |
| Dengar (DENGAR) | 6 | 48 | 70 |
| Depa Billaba (DEPABILLABA) | 4 | 34 | 37 |
| Director Krennic (DIRECTORKRENNIC) | 6 | 31 | 29 |
| Disguised Clone Trooper (DISGUISEDCLONETROOPER) | 4 | 66 | 35 |
| Doctor Aphra (DOCTORAPHRA) | 6 | 47 | 50 |
| Droideka (DROIDEKA) | 4 | 18 | 18 |
| Eeth Koth (EETHKOTH) | 4 | 13 | 2 |
| Eighth Brother (EIGHTHBROTHER) | 7 | 35 | 60 |
| Embo (EMBO) | 5 | 20 | 19 |
| Embo & Keibu (EMBOANDKEIBU) | 7 | 74 | 131 |
| Emperor Palpatine (EMPERORPALPATINE) | 5 | 35 | 40 |
| Enfys Nest (ENFYSNEST) | 4 | 18 | 17 |
| Resistance Hero Finn (EPIXFINN) | 4 | 24 | 14 |
| Resistance Hero Poe (EPIXPOE) | 4 | 25 | 28 |
| Ewok Elder (EWOKELDER) | 3 | 8 | 6 |
| Ewok Scout (EWOKSCOUT) | 3 | 9 | 7 |
| Ezra Bridger (EZRABRIDGERS3) | 4 | 31 | 35 |
| Ezra Bridger (Exile) (EZRAEXILE) | 5 | 72 | 90 |
| Fennec Shand (FENNECSHAND) | 5 | 36 | 29 |
| Fifth Brother (FIFTHBROTHER) | 7 | 30 | 67 |
| Finn (FINN) | 4 | 28 | 18 |
| First Order Executioner (FIRSTORDEREXECUTIONER) | 3 | 11 | 9 |
| First Order Officer (FIRSTORDEROFFICERMALE) | 3 | 14 | 6 |
| First Order SF TIE Pilot (FIRSTORDERSPECIALFORCESPILOT) | 3 | 9 | 9 |
| First Order TIE Pilot (FIRSTORDERTIEPILOT) | 3 | 10 | 19 |
| First Order Stormtrooper (FIRSTORDERTROOPER) | 3 | 15 | 12 |
| Sith Trooper (FOSITHTROOPER) | 5 | 13 | 21 |
| Ahsoka Tano (Fulcrum) (FULCRUMAHSOKA) | 4 | 75 | 116 |
| Gamorrean Guard (GAMORREANGUARD) | 4 | 27 | 22 |
| Gar Saxon (GARSAXON) | 4 | 10 | 2 |
| General Hux (GENERALHUX) | 5 | 19 | 33 |
| General Kenobi (GENERALKENOBI) | 5 | 79 | 73 |
| General Skywalker (GENERALSKYWALKER) | 6 | 34 | 163 |
| General Syndulla (GENERALSYNDULLA) | 5 | 71 | 77 |
| Geonosian Brood Alpha (GEONOSIANBROODALPHA) | 6 | 32 | 25 |
| Geonosian Soldier (GEONOSIANSOLDIER) | 3 | 14 | 16 |
| Geonosian Spy (GEONOSIANSPY) | 4 | 11 | 20 |
| Ahsoka Tano (GLAHSOKATANO) | 7 | 82 | 99 |
| Pirate King Hondo Ohnaka (GLHONDO) | 7 | 135 | 324 |
| Leia Organa (GLLEIA) | 7 | 106 | 178 |
| Rey (GLREY) | 7 | 42 | 94 |
| Grogu & Anzellans (GOPHERANTS) | 5 | 64 | 220 |
| Grand Admiral Thrawn (GRANDADMIRALTHRAWN) | 5 | 22 | 24 |
| Grand Inquisitor (GRANDINQUISITOR) | 7 | 60 | 73 |
| Jedi Master Luke Skywalker (GRANDMASTERLUKE) | 7 | 70 | 90 |
| Grand Master Yoda (GRANDMASTERYODA) | 5 | 80 | 79 |
| Grand Moff Tarkin (GRANDMOFFTARKIN) | 5 | 24 | 27 |
| Great Mothers (GREATMOTHERS) | 5 | 49 | 74 |
| Greedo (GREEDO) | 6 | 25 | 26 |
| Greef Karga (GREEFKARGA) | 6 | 47 | 38 |
| General Grievous (GRIEVOUS) | 5 | 36 | 35 |
| Gungan Phalanx (GUNGANPHALANX) | 4 | 43 | 65 |
| Han Solo (HANSOLO) | 4 | 23 | 12 |
| Hera Syndulla (HERASYNDULLAS3) | 4 | 15 | 11 |
| Hermit Yoda (HERMITYODA) | 5 | 29 | 14 |
| HK-47 (HK47) | 6 | 47 | 27 |
| Hondo Ohnaka (HONDO) | 5 | 61 | 51 |
| Captain Han Solo (HOTHHAN) | 5 | 23 | 7 |
| Rebel Officer Leia Organa (HOTHLEIA) | 4 | 22 | 11 |
| Hoth Rebel Scout (HOTHREBELSCOUT) | 3 | 7 | 3 |
| Hoth Rebel Soldier (HOTHREBELSOLDIER) | 3 | 10 | 4 |
| Mob Enforcer (HUMANTHUG) | 3 | 26 | 27 |
| Hunter (Mercenary) (HUNTERS3) | 5 | 59 | 184 |
| Huyang (HUYANG) | 4 | 64 | 70 |
| Iden Versio (IDENVERSIOEMPIRE) | 5 | 49 | 37 |
| IG-11 (IG11) | 4 | 20 | 20 |
| IG-12 & Grogu (IG12) | 4 | 24 | 21 |
| IG-86 Sentinel Droid (IG86SENTINELDROID) | 3 | 10 | 6 |
| IG-88 (IG88) | 5 | 18 | 41 |
| IG-90 (IG90) | 5 | 62 | 96 |
| Ima-Gun Di (IMAGUNDI) | 4 | 13 | 5 |
| Imperial Probe Droid (IMPERIALPROBEDROID) | 5 | 30 | 39 |
| Imperial Super Commando (IMPERIALSUPERCOMMANDO) | 4 | 26 | 53 |
| Inquisitor Barriss (INQUISITORBARRISS) | 7 | 30 | 52 |
| Captain Ithano (ITHANO) | 5 | 57 | 103 |
| Jabba the Hutt (JABBATHEHUTT) | 9 | 84 | 103 |
| Jango Fett (JANGOFETT) | 6 | 43 | 34 |
| Jar Jar Binks (JARJARBINKS) | 5 | 116 | 176 |
| Jawa (JAWA) | 3 | 8 | 6 |
| Jawa Engineer (JAWAENGINEER) | 4 | 14 | 7 |
| Jawa Scavenger (JAWASCAVENGER) | 4 | 10 | 16 |
| Jaxxon (JAXXON) | 4 | 44 | 48 |
| Jedi Knight Cal Kestis (JEDIKNIGHTCAL) | 6 | 65 | 60 |
| Jedi Consular (JEDIKNIGHTCONSULAR) | 3 | 9 | 5 |
| Jedi Knight Guardian (JEDIKNIGHTGUARDIAN) | 3 | 8 | 4 |
| Jedi Knight Luke Skywalker (JEDIKNIGHTLUKE) | 5 | 50 | 63 |
| Jedi Knight Revan (JEDIKNIGHTREVAN) | 6 | 92 | 90 |
| Jedi Master Kenobi (JEDIMASTERKENOBI) | 7 | 68 | 130 |
| Jedi Master Mace Windu (JEDIMASTERMACEWINDU) | 5 | 63 | 144 |
| Jocasta Nu (JOCASTANU) | 5 | 39 | 75 |
| Jolee Bindo (JOLEEBINDO) | 5 | 19 | 11 |
| Juhani (JUHANI) | 4 | 9 | 12 |
| Jyn Erso (JYNERSO) | 5 | 14 | 18 |
| K-2SO (K2SO) | 4 | 12 | 8 |
| Kanan Jarrus (KANANJARRUSS3) | 5 | 19 | 20 |
| Kelleran Beq (KELLERANBEQ) | 5 | 73 | 47 |
| Ki-Adi-Mundi (KIADIMUNDI) | 5 | 31 | 35 |
| Kit Fisto (KITFISTO) | 4 | 10 | 1 |
| Kix (KIX) | 4 | 42 | 138 |
| Kleya Marki (KLEYA) | 4 | 40 | 55 |
| Krrsantan (KRRSANTAN) | 6 | 44 | 33 |
| Kuiil (KUIIL) | 4 | 44 | 46 |
| KX Security Droid (KXSECURITYDROID) | 4 | 36 | 54 |
| Kyle Katarn (KYLEKATARN) | 4 | 53 | 82 |
| Kylo Ren (KYLOREN) | 4 | 17 | 10 |
| Kylo Ren (Unmasked) (KYLORENUNMASKED) | 5 | 15 | 8 |
| L3-37 (L3_37) | 4 | 15 | 28 |
| Leia (Jedi Training) (LEIAJEDITRAINING) | 5 | 50 | 57 |
| Lobot (LOBOT) | 5 | 32 | 43 |
| Logray (LOGRAY) | 4 | 19 | 15 |
| Lord Vader (LORDVADER) | 7 | 77 | 100 |
| Luke Skywalker (Farmboy) (LUKESKYWALKER) | 4 | 13 | 15 |
| Starkiller (Luke Concept) (LUKESTARKILLER) | 4 | 31 | 66 |
| Luminara Unduli (LUMINARAUNDULI) | 4 | 16 | 4 |
| Luthen Rael (LUTHENRAEL) | 5 | 25 | 39 |
| Mace Windu (MACEWINDU) | 6 | 51 | 125 |
| Magmatrooper (MAGMATROOPER) | 3 | 9 | 5 |
| IG-100 MagnaGuard (MAGNAGUARD) | 4 | 19 | 32 |
| Major Partagaz (MAJORPARTAGAZ) | 5 | 42 | 118 |
| Bo-Katan (Mand'alor) (MANDALORBOKATAN) | 5 | 40 | 52 |
| Mara Jade, The Emperor's Hand (MARAJADE) | 4 | 34 | 27 |
| Mara Jade Skywalker (MARAJADESKYWALKER) | 4 | 35 | 36 |
| Marrok (MARROK) | 6 | 43 | 80 |
| Master Qui-Gon (MASTERQUIGON) | 4 | 47 | 37 |
| Darth Maul (MAUL) | 4 | 19 | 18 |
| Maul (Hate-Fueled) (MAULHATEFUELED) | 6 | 95 | 100 |
| Maul (MAULS7) | 5 | 49 | 83 |
| Maz Kanata (MAZKANATA) | 5 | 47 | 222 |
| Merrin (MERRIN) | 5 | 38 | 110 |
| Mission Vao (MISSIONVAO) | 4 | 22 | 9 |
| Moff Gideon (MOFFGIDEONS1) | 6 | 31 | 50 |
| Dark Trooper Moff Gideon (MOFFGIDEONS3) | 5 | 34 | 48 |
| Mon Mothma (MONMOTHMA) | 7 | 29 | 47 |
| Morgan Elsbeth (MORGANELSBETH) | 4 | 43 | 41 |
| Mother Talzin (MOTHERTALZIN) | 5 | 21 | 29 |
| Nightsister Acolyte (NIGHTSISTERACOLYTE) | 3 | 10 | 6 |
| Nightsister Initiate (NIGHTSISTERINITIATE) | 4 | 15 | 13 |
| Nightsister Spirit (NIGHTSISTERSPIRIT) | 3 | 12 | 3 |
| Nightsister Zombie (NIGHTSISTERZOMBIE) | 4 | 19 | 25 |
| Night Trooper (NIGHTTROOPER) | 4 | 30 | 53 |
| Ninth Sister (NINTHSISTER) | 7 | 36 | 60 |
| Nute Gunray (NUTEGUNRAY) | 5 | 17 | 48 |
| Obi-Wan Kenobi (Old Ben) (OLDBENKENOBI) | 5 | 19 | 5 |
| Omega (Fugitive) (OMEGAS3) | 5 | 32 | 132 |
| CX-2 (OPERATIVE) | 4 | 31 | 72 |
| Padawan Obi-Wan (PADAWANOBIWAN) | 4 | 40 | 34 |
| Padawan Sabine Wren (PADAWANSABINE) | 5 | 58 | 47 |
| Padmé Amidala (PADMEAMIDALA) | 5 | 31 | 83 |
| Pao (PAO) | 4 | 10 | 4 |
| Paploo (PAPLOO) | 4 | 14 | 10 |
| Paz Vizsla (PAZVIZSLA) | 4 | 161 | 56 |
| Captain Phasma (PHASMA) | 4 | 18 | 33 |
| Plo Koon (PLOKOON) | 4 | 10 | 8 |
| Poe Dameron (POE) | 4 | 12 | 8 |
| Poggle the Lesser (POGGLETHELESSER) | 4 | 22 | 12 |
| Princess Kneesaa (PRINCESSKNEESAA) | 4 | 39 | 59 |
| Princess Leia (PRINCESSLEIA) | 4 | 21 | 10 |
| Qi'ra (QIRA) | 5 | 36 | 46 |
| Queen Amidala (QUEENAMIDALA) | 6 | 67 | 87 |
| Quiggold (QUIGGOLD) | 4 | 58 | 157 |
| Qui-Gon Jinn (QUIGONJINN) | 4 | 16 | 10 |
| R2-D2 (R2D2_LEGENDARY) | 5 | 29 | 23 |
| R5-D4 (R5D4) | 4 | 29 | 71 |
| Rotta the Hutt (RACCOON) | 6 | 58 | 116 |
| Zeb Orrelios (New Republic Pilot) (RANGERZEB) | 4 | 52 | 51 |
| Range Trooper (RANGETROOPER) | 3 | 11 | 4 |
| Snowtrooper Commander (REMNANTSNOWCOMMANDER) | 5 | 28 | 51 |
| Resistance Pilot (RESISTANCEPILOT) | 3 | 11 | 5 |
| Resistance Trooper (RESISTANCETROOPER) | 3 | 9 | 8 |
| Rey (Scavenger) (REY) | 4 | 15 | 9 |
| Rey (Jedi Training) (REYJEDITRAINING) | 6 | 30 | 32 |
| Rose Tico (ROSETICO) | 4 | 12 | 10 |
| Royal Guard (ROYALGUARD) | 3 | 12 | 5 |
| Sabine Wren (SABINEWRENS3) | 4 | 45 | 24 |
| Sana Starros (SANASTARROS) | 5 | 41 | 50 |
| Satele Shan (SATELESHAN) | 5 | 62 | 70 |
| Savage Opress (SAVAGEOPRESS) | 4 | 61 | 101 |
| Saw Gerrera (SAWGERRERA) | 4 | 28 | 120 |
| Scarif Rebel Pathfinder (SCARIFREBEL) | 3 | 9 | 9 |
| RC-1262 "Scorch" (SCORCH) | 4 | 52 | 79 |
| Scout Trooper (SCOUTTROOPER_V3) | 4 | 50 | 88 |
| Second Sister (SECONDSISTER) | 7 | 32 | 36 |
| Seventh Sister (SEVENTHSISTER) | 7 | 36 | 37 |
| Shaak Ti (SHAAKTI) | 5 | 35 | 18 |
| Shin Hati (SHINHATI) | 5 | 39 | 26 |
| Shoretrooper (SHORETROOPER) | 3 | 8 | 10 |
| Sith Assassin (SITHASSASSIN) | 3 | 13 | 10 |
| Sith Marauder (SITHMARAUDER) | 3 | 13 | 10 |
| Sith Eternal Emperor (SITHPALPATINE) | 7 | 46 | 120 |
| Sith Empire Trooper (SITHTROOPER) | 3 | 15 | 16 |
| SM-33 (SM33) | 4 | 54 | 72 |
| Veteran Smuggler Chewbacca (SMUGGLERCHEWBACCA) | 4 | 16 | 4 |
| Veteran Smuggler Han Solo (SMUGGLERHAN) | 4 | 15 | 14 |
| Snowtrooper (SNOWTROOPER) | 3 | 8 | 4 |
| STAP (STAP) | 4 | 41 | 33 |
| Starkiller (STARKILLER) | 5 | 60 | 78 |
| Stormtrooper (STORMTROOPER) | 3 | 14 | 20 |
| Stormtrooper (Concept) (STORMTROOPERCONCEPT) | 3 | 20 | 25 |
| Stormtrooper Han (STORMTROOPERHAN) | 4 | 13 | 6 |
| Stormtrooper Luke (STORMTROOPERLUKE) | 5 | 48 | 45 |
| The Stranger (STRANGER) | 5 | 57 | 87 |
| Sun Fac (SUNFAC) | 4 | 18 | 18 |
| Supreme Leader Kylo Ren (SUPREMELEADERKYLOREN) | 7 | 49 | 135 |
| T3-M4 (T3_M4) | 5 | 33 | 13 |
| Talia (TALIA) | 4 | 18 | 8 |
| Tarfful (TARFFUL) | 5 | 51 | 51 |
| Taron Malicos (TARONMALICOS) | 5 | 51 | 50 |
| Teebo (TEEBO) | 4 | 6 | 6 |
| The Mandalorian (THEMANDALORIAN) | 5 | 21 | 26 |
| The Mandalorian (Beskar Armor) (THEMANDALORIANBESKARARMOR) | 6 | 38 | 56 |
| The Ronin (THERONIN) | 4 | 40 | 49 |
| Third Sister (THIRDSISTER) | 7 | 40 | 93 |
| TIE Fighter Pilot (TIEFIGHTERPILOT) | 3 | 6 | 6 |
| Admiral Trench (TRENCH) | 4 | 34 | 44 |
| 0-0-0 (TRIPLEZERO) | 4 | 18 | 61 |
| Tusken Chieftain (TUSKENCHIEFTAIN) | 4 | 6 | 87 |
| Tusken Warrior (TUSKENHUNTRESS) | 4 | 30 | 37 |
| Tusken Raider (TUSKENRAIDER) | 3 | 9 | 6 |
| Tusken Shaman (TUSKENSHAMAN) | 3 | 12 | 6 |
| Ugnaught (UGNAUGHT) | 3 | 8 | 6 |
| Skiff Guard (Lando Calrissian) (UNDERCOVERLANDO) | 4 | 60 | 34 |
| URoRRuR'R'R (URORRURRR) | 4 | 9 | 1 |
| Darth Vader (VADER) | 6 | 46 | 32 |
| Darth Vader (Duel's End) (VADERDUELSEND) | 5 | 56 | 78 |
| Vane (VANE) | 4 | 48 | 97 |
| Temple Guard (VANGUARDTEMPLEGUARD) | 4 | 27 | 29 |
| General Veers (VEERS) | 4 | 19 | 5 |
| Vel Sartha (VEL) | 4 | 64 | 59 |
| Visas Marr (VISASMARR) | 4 | 14 | 11 |
| Wampa (WAMPA) | 6 | 24 | 15 |
| Wat Tambor (WATTAMBOR) | 4 | 23 | 45 |
| Wedge Antilles (WEDGEANTILLES) | 4 | 16 | 45 |
| Wicket (WICKET) | 4 | 18 | 14 |
| Wrecker (Mercenary) (WRECKERS3) | 5 | 48 | 108 |
| Yoda & Chewie (YODACHEWBACCA) | 4 | 24 | 77 |
| Yoda (Dark Side Vision) (YODADSV) | 5 | 54 | 90 |
| Vandor Chewbacca (YOUNGCHEWBACCA) | 4 | 14 | 29 |
| Young Han Solo (YOUNGHAN) | 4 | 15 | 21 |
| Young Lando Calrissian (YOUNGLANDO) | 4 | 13 | 12 |
| Zaalbar (ZAALBAR) | 4 | 20 | 16 |
| Zam Wesell (ZAMWESELL) | 6 | 36 | 14 |
| Garazeb "Zeb" Orrelios (ZEBS3) | 4 | 23 | 16 |
| Zorii Bliss (ZORIIBLISS_V2) | 5 | 50 | 92 |
| Zuckuss (ZUCKUSS) | 6 | 27 | 47 |
