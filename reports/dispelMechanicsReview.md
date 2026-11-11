# Source-filtered dispels and bounded control recovery

The old interpreter awarded every friendly dispel generic bonus basic-attack DPS based on the team's incoming-control loss. That included deleting Prepared, friendly buffs, Profit, VIP and arbitrary internal markers. The source did not justify those restored attacks.

`src/domain/dispelUtility.js` now classifies exact source `effectedTag` filters during compilation. It is not a runtime dependency. The compiled operation preserves `cleansedControls` and `clearsAllBuffs`; both the prepared and raw interpreters use these fields.

## Checked source examples

| Source ID | Exact affected tag | Checked contribution |
| --- | --- | --- |
| `generic_dispel_debuffs_self` | `clearable_debuff`, count100 | Ordinary clearable Stun, Ability Block and Daze shares only |
| `dispell_clearable_ally_all_INSTANT` | `clearable_debuff`, DISPELL_ALL | Same control shares, applied to each eligible recipient |
| `specialability_4lom02_dispel_debuff_all_ally` | `clearable_debuff`, DISPELL_ALL, allied Bounty Hunters | Same control shares only for source-eligible Bounty Hunters |
| `uniqueability_savageopress01_dispel_abilityblock` | `stifle_debuff` | Ability Block share only |
| `uniqueability_savageopress01_dispel_stun` | `paralysis_debuff` | Stun share only |
| `uniqueability_savageopress01_dispel_daze` | `daze_debuff` | Daze share only |
| `dispel_preparation_self` | `preparation` | No invented restoration of control/DPS |
| `generic_dispel_buffs_single` | `clearable_buff`, DISPELL_ALL | No friendly control recovery; enemy recipients use the existing bounded opponent buff-share proxy |

The pinned raw source independently declares `clearable_debuff` for all 239 ordinary `paralysis_debuff` instances, 169/171 `stifle_debuff` instances and 94/100 `daze_debuff` instances. The other instances and special tags demonstrate why the implementation explicitly assumes ordinary clearable variants rather than claiming every instance of a control type can be cleansed.

Only two of 50 raw `fear_debuff` instances declare `clearable_debuff`, and those two are Atollon event modifiers. Normal Fear instances do not. The 12 special Stun, eight special Ability Block and ten special Daze instances do not declare ordinary clearability. Generic cleansing therefore does not restore Fear share. Exact Fear/special-tag removal remains a gap until bypass and instance semantics are checked; DISPELL_ALL alone is not treated as proof of bypassing undispellability. These are whole-source counts, including ships/events, not character counts.

## Scoring policy

For each recipient and matched control type, accepted cleansing rate is divided by that recipient's turn rate and bounded to [0,1]. This is the current model's expected per-turn cleansing availability. It reduces only the matching existing incoming-control output loss, after control immunity and Tenacity, rather than adding invented bonus attacks. It cannot restore more than the existing assumed loss.

The reported `incomingControlCleanseCoverage` is the sum of this availability weighted by `incomingControlWeights`. The assumptions report declares `incomingControlCleansePolicy`. Clearing all ordinary clearable control under equal four-type weights covers 75%, not 100%, because Fear remains excluded.

Enemy `clearable_buff` removal contributes only to the existing bounded `enemyBuffStatFraction` proxy. Custom tags or unknown filters do not become arbitrary enemy damage reduction. Active buff identity and timing remain gaps.

## Independent verification and limits

`node scripts/testDispelUtility.mjs` checks exact source tags, ordinary clearability evidence, Fear exclusion, count/filter guards and per-recipient bounds. Its integrated production oracle isolates the real 4-LOM Bounty Hunter cleanse: assumed incoming loss0.2 with landing probability0.85 falls from0.17 to0.0425 under equal control shares, so output factor changes from0.83 to0.9575. There is no assist-DPS bonus. With Fear-only incoming loss, the cleanse changes nothing. Removing L3-37's Prepared changes neither control coverage nor DPS.

All 341-character raw/prepared/scalar/worker parity and freshness checks passed after synchronization. This verifies implementation consistency, not independent certification of every kit.

Every accepted control cleanse retains an explicit omission for the assumed ordinary clearable variants, undispellable variants and ordered removal state. Limited-count removals, excluded-tag filters, creator overrides and unknown count/context semantics are not granted generic recovery. Basic dispels on bonus attacks/counters retain a separate omission. Friendly buff/marker removal still needs explicit active-state interpretation even though its invented control benefit is now removed.
