# Combat Utility V3

The default target is **Combat Utility**. Existing selected Kyber targets migrate automatically, including archetypes. Their generated weights, set priors, primary priors and inherited restrictions are removed. User-created linear targets remain available. A saved Combat Utility target retains its edited assumptions and explicit restrictions.

Click **Edit** on a character to set damage channels and coefficients, enemy stats, resistible effect values, turn-meter assumptions, an opening-speed threshold, and up to four teammates. Use **Add matchup** to compare multiple weighted enemies. Percent stats use percentage points (60 means 60%); shares, penetration and turn-meter inputs use fractions (0.5 means 50%).

## Objective

Each complete candidate includes projected primary and secondary stats and actual completed set bonuses, using the existing leveling/slicing rules. Physical and special damage are evaluated separately:

```
mitigation = defense / (defense + 7.5 × level)
effective CC = clamp((CC − enemy critical avoidance) / 100, 0, 1)
expected damage = offense × ability coefficient × (1 − mitigation)
                  × (1 + effective CC × (CD / 100 − 1))
resist chance = clamp(max(0.15, (Tenacity − Potency) / 100), 0, 1)
action rate = Speed / 100 × action multiplier / (1 − average TM gain)
EHP = (Health + Protection × (1 − bypass)) / incoming damage fraction
utility = damage per time × EHP
score = 100 × utility(candidate) / utility(unmodded character)
```

Incoming damage fraction includes weighted physical/special mitigation and expected enemy critical damage. Accuracy offsets configured enemy dodge. A Health-based damage coefficient adds explicit Max Health damage. Resistible effect value adds output in equivalent attacks, multiplied by proc and landing chances. Incoming control loss reduces output when the enemy effect lands. An optional opening value multiplies output only when Speed strictly exceeds enemy Speed.

Utility ratios use log utility internally. A 1% increase in damage and a 1% increase in EHP have equal first-order value. Crit Chance caps at effective 100%; Potency stops improving landing chance at the 15% resist floor. Tenacity gains depend on exceeding the enemy's Potency plus that floor. No Kyber frequency, primary preference or set preference enters this score.

Across matchups, the objective is the weighted arithmetic mean of scenario utilities. With teammates, each scenario uses pooled team damage per time multiplied by pooled team EHP. Teammates use their own damage channel and neutral basic-attack assumptions; the optimized character's coefficients and turn-meter gains do not affect their attacks.

## R2-D2 and scope

R2's optional max-level Number Crunch models his faction-dependent 10% stat increases and shares 10% of his resulting Health, Protection, physical/special Offense and Potency with qualifying allies. R2 counts himself for his own faction bonuses. Faction counts come from the selected team; ally stats are captured from their current equipped mods at run start. The run report records those exact snapshots. They are fixed while the optimizer assigns mods down the roster.

This is an analytical utility model, not a battle simulator. The neutral default uses basic-attack coefficients of 1, no valued debuffs or incoming control, no turn-meter gain, and no opening advantage. It does not automatically infer ability rotations, heals, taunts, summons, leader bonuses, immunity, fixed damage, or all characters' uniques. R2's Combat Analysis is not included. Coefficients, effect values and action multipliers are explicit editable assumptions; a full kit/turn simulator remains future work. Team pooling approximates contribution and does not simulate individual deaths or turn order.

The search evaluates whole loadouts and then refines primary alternatives with bounded coordinate improvements, retaining up to two candidate mods per slot/set/primary group. It explores the best feasible representative of each evaluated loadout for two refinement passes. This improves nonlinear selection while preserving explicit constraints, but is not an exhaustive guarantee of the global inventory optimum.

## Priorities and reporting

Displayed 0–100 priorities are finite differences of log utility at current stats. They are explanatory indicators; the optimizer never uses them as fixed weights. The largest positive increment receives 100. Increments are +1,000 Health, +2,000 Protection, +10 Speed, +100 physical/special Offense, +10 percentage points Crit Chance/Crit Damage/Potency/Tenacity, +50 raw Armor/Resistance, and +5 percentage points Accuracy/Crit Avoidance. These indicators depend on the listed increments and the assumptions.

After optimizing, **Export Run Report** downloads JSON for all roster characters, including mod donors. Schema 3 includes before/after stats and score changes, projected upgrades, complete assumptions, scenario damage/action rate/EHP/utility, numerical marginal utilities, and the evaluated candidate audit. A score of 100 is the same character's unmodded utility; scores across different characters are not additive measures of roster strength. Individual stat values in Review are isolated gains and are not additive components of the full-set score.

Kyber loadout frequencies appear only in diagnostic export fields to compare results against observations. They cannot alter candidate scores. The historical V2 corpus/compiler and its regression tests remain for compatibility and independent validation.

Restart with `npm start`, then optimize again. No data-generation scripts are needed; the shared engine is copied to the worker automatically before start/build. Run `npm run combat:test`, `npm run meta:test-v2`, and `npm run build` to check changes.

Mechanics references: [R2-D2 kit and Number Crunch](https://swgoh.gg/units/r2-d2/), [critical and resist mechanics](https://swgoh.wiki/wiki/Critical_Hit). Ability details can change; the max Number Crunch assumption is explicit in the editor and exported model.
