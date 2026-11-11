# Combat Utility V5 changes

V5 retains `U = team damage rate × team effective HP`, exact complete-loadout
evaluation and zero popularity priors. See [the underlying model](combat-utility-v4.md)
and [the local feedback workflow](local-optimizer.md).

Changes derived from the pinned source kits:

- Actual relic levels are imported from the game's RelicTier enum. The shared
  Galactic Legend passive adds 10% Health and Protection per relic level,
  rather than omitting the relic query or interpreting the context as flat HP.
- Supported incoming/outgoing damage modifiers use multiplicative damage
  factors. The shared Galactic Legend passive's 30% reduction therefore
  increases effective HP by `1 / 0.7`. Damage explicitly marked as unaffected
  by damage modifiers bypasses these factors. Selective modifiers remain gaps.
  Enemy multipliers also start at one: reducing enemy outgoing damage improves
  team effective HP, and enemy incoming reduction lowers the actor's damage.
- Flat and percentage armor/resistance penetration contribute to their own
  damage channels. Effective defense is bounded at zero.
- Buff/debuff aliases use source tags from reachable character effects. Their
  probabilities still use the model's explicit expected uptime assumptions.
  Ambiguous aliases and arbitrary markers remain unresolved.
- Unconditional installed passive markers are initialized only for matching
  recipients. Contextual/stat queries and unspecified counters remain dynamic
  or unresolved; they are not assumed present.
- Compound stat components inherit their buff/debuff class only when the
  source links their expiration to a required parent effect. Proven one-time
  installation guards are removed from the once-per-pass stat calculation.
- `BOTH_SIDES` targets include the aggregate enemy as well as allies. For
  example, Defense Down's resistance component now reaches the enemy. Critical
  events use the enemy's own action rate when that enemy is a recipient.
- Excluded state tags veto a match; their absence cannot substitute for a
  required positive tag. This prevents conditional effects from applying just
  because their exclusion marker is absent.
- Source filters for Stun, Fear, Daze and Ability Block immunity reduce only
  the corresponding assumed incoming loss. The editor exposes relative loss
  shares; the illustrative default gives each type one quarter. These shares
  describe lost output, not observed probabilities of those effects. Partial
  or unsupported immunity filters still count as omitted branches.
- Defeated-unit selectors and previous-target/reinforcement/support/summon
  selectors remain explicit unresolved conditions. They cannot silently match
  every living ally. Simple revival Health restoration uses the explicit
  defeat assumption; death-triggered restoration applies that probability
  once. Ordered revival follow-up actions still need a checked death state.
  Partially supported event groups retain
  their unsupported alternatives in the omission count.

Source event filters now remain attached to the actual event recipient. This
keeps ordinary damage-over-time, resistant targets and raid targets in their
separate source branches. Selected allies also obey the pinned ability's
targeting exclusions, including abilities that cannot select their caster.
Area control scales with the number of affected enemies. Ability Block removes
the assumed special-action share rather than all enemy actions.

An extra basic attack adds that basic's damage and direct Turn Meter effects.
It does not multiply the damage of the whole special rotation. Full Turn Meter
fills are bounded to one meter bar; ordered swaps and resets retain explicit
gaps. Dynamic recipient matches refresh when stats or action rates change.

The default closed-roster policy treats a source-defined marker as absent only
when no active ally kit can produce it. Unsupported producers still expose
their unresolved states. Enable the outside-effects option for scenarios with
unmodeled named enemy effects or external modifiers, or provide explicit state
assumptions. This scope is reported in the result.

Source percentages now use consistent units. A roster value of 80 Potency
becomes 0.8 inside a source query, so Boba's 50%-of-Potency Health bonus is
40%, rather than 40 times Health. Contextual percentage gains convert back
to percentage points. Independent checks also cover Sidious, Aphra, Raddus,
B1 and Vel sharing between allies with different critical stats.

Protection Up contributes a separate, bounded temporary Protection capacity
based on the recipient's Health, or an explicit caster-stat query when the
source supplies one. It contributes neither Health healing nor ordinary
Protection recovery. Depletion, refresh and stacking chronology remain gaps.
Physical and special avoidance remain separate, including Vulnerable and
Critical Hit Immunity. Noncritical attacks retain their noncritical behavior.

Direct healing and eligible Health Steal also run on assists and counters.
Health Steal can exceed 100% when the source grants it. Known source immunity
filters suppress their matching recovery and Turn Meter effects. Contextual
pool-recovery percentages multiply the correct recipient pool; explicit
caster-based healing keeps its own basis.

Children retain their ancestor's context gates. Mode-dependent branches use
the declared battle mode, squad size and event ID in the editor; unspecified
context remains unresolved. Omicrons remain disabled. Unsupported result
queries, probabilistic predicates and ordered state dependencies are recorded
as gaps rather than treated as unconditional effects.

The third stock opponent now has 15% evasion so Accuracy can matter. This is an
illustrative assumption. Exact old stock scenarios migrate; edited scenarios
are preserved. Accuracy can still have zero value for an unavoidable attack
or a character whose output does not depend on landing attacks.

Displayed priorities compare gains from explicit representative increments:
1,000 Health/Protection, 5 Speed, 100 Physical/Special Damage, 5 Crit Damage,
2 Crit Chance, 20 Armor/Resistance and 3 Potency/Tenacity/Accuracy/Crit Avoidance.
These increments are reported with their utility changes. Individual-mod
pruning still uses the exact per-point log-utility derivative multiplied by
each mod's actual gain. Finished sets still use exact complete-stat evaluation.

The UI and exports now report kit confidence, active-team omitted branches,
unresolved queries, team completeness and scenario count. Confidence describes
coverage of this model, not battle outcomes. The current roster remains low
confidence; unresolved mechanics must be checked and implemented before that
label can improve.

Restart the app and optimize again to use V5. No manual data-generation script
is required for normal use. The generated programs ship with the app, and
start/build synchronize the shared worker engine. The saved model format stays
compatible while the scoring version invalidates old optimization results.

## Source-linked recovery and initialization

Explicit earlier damage references now feed damage-linked recovery once, retaining landed damage and source probabilities. Malak normal, percent-Health-resistant and raid branches have independent numeric expectations. Consular's named single-packet 30% damage-dealt healing is also checked; generic implicit sequential results remain unresolved. Nihilus and Malak transfer each affected recipient's own Protection into Health once; the declared initialization policy applies this before kit stat buffs and retains ordering gaps. Nihilus's exact enemy interceptor prohibits Sith critical hits, including Malak, even with guaranteed critical hits or Vulnerable; general critical-event packet incidence still needs review.

Source-filtered cleansing restores only matching ordinary clearable control loss. Fear and special undispellable variants remain outside that subset. Protection Up is bounded temporary capacity; healing and Protection recovery are rates. The compact export retains these metrics and the associated scenario policies.

Finite direct self Damage Immunity now reduces ordinary incoming Physical/Special damage according to the source lifetime and declared rotation. Droideka and Beskar Mando pass this narrow proof; continuous immunity, other damage families and expiry ordering remain gaps. B1's exact permanent revive immunity blocks tagged revive recovery without blocking ordinary healing. These subsets do not certify their complete kits.
