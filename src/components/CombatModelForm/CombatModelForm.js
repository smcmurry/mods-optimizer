import React from 'react';
import CombatUtility from '../../domain/combatUtility';

const fields = [
  ['physicalShare', 'Physical damage share (0–1)', 0, 1],
  ['physicalCoefficient', 'Physical damage multiplier', 0, 100], ['specialCoefficient', 'Special damage multiplier', 0, 100],
  ['healthDamageCoefficient', 'Damage per point of Max Health', 0, 100],
  ['debuffValue', 'Landed debuff value, in equivalent attacks', 0, 100], ['debuffProcChance', 'Resistible debuff attempt chance (0–1)', 0, 1],
  ['incomingControlLoss', 'Output lost to a landed enemy control effect (0–0.99)', 0, 0.99],
  ['bonusActionRate', 'Additional action-rate multiplier', 0.01, 100], ['turnMeterGain', 'Additional TM gained per action (0–0.95)', 0, 0.95],
  ['openingTurnValue', 'Extra output value for acting before the enemy', 0, 100]
];
const enemyFields = [
  ['level', 'Enemy level', 1, 100], ['armor', 'Enemy raw Armor', 0, 1000000], ['resistance', 'Enemy raw Resistance', 0, 1000000],
  ['tenacity', 'Enemy Tenacity (%)', 0, 10000], ['potency', 'Enemy Potency (%)', 0, 10000], ['speed', 'Enemy Speed', 0, 10000],
  ['critAvoid', 'Enemy Crit Avoidance (%)', 0, 1000], ['critChance', 'Incoming Crit Chance (%)', 0, 1000], ['critDmg', 'Incoming Crit Damage (%)', 100, 1000],
  ['physicalShare', 'Incoming physical damage share (0–1)', 0, 1], ['dodge', 'Enemy dodge chance (%)', 0, 100],
  ['outgoingPenetration', 'Your defense penetration fraction (0–1)', 0, 1], ['incomingPenetration', 'Enemy defense penetration fraction (0–1)', 0, 1],
  ['protectionBypass', 'Incoming Protection bypass fraction (0–1)', 0, 1], ['weight', 'Matchup weight', 0, 100000]
];
const kitFields = [
  ['horizonTurns', 'Battle horizon (enemy turns)', 1, 30], ['missingHealth', 'Expected missing Health (0–1)', 0, 1],
  ['missingProtection', 'Expected missing Protection (0–1)', 0, 1], ['targetDebuffedChance', 'Debuffed target probability (0–1)', 0, 1],
  ['targetBuffedChance', 'Buffed target probability (0–1)', 0, 1], ['alliedDefeatChance', 'Defeat-event probability (0–1)', 0, 1],
  ['enemyCount', 'Enemy count', 1, 5], ['ultimateUses', 'Unlocked extra ability uses during battle', 0, 5],
  ['advantageUptime', 'Advantage uptime (0–1)', 0, 1], ['enemyRecoveryFraction', 'Enemy Health recovery per turn (fraction)', 0, 1],
  ['enemySpecialShare', 'Enemy actions using specials (fraction)', 0, 1], ['enemyAssistRate', 'Enemy assists per action', 0, 1],
  ['enemyBonusTM', 'Enemy bonus TM per action (fraction)', 0, 0.8], ['enemyBuffStatFraction', 'Enemy stat benefit from buffs (fraction)', 0, 3]
];
const controlFields = [['stun', 'Stun'], ['fear', 'Fear'], ['daze', 'Daze'], ['abilityBlock', 'Ability Block']]
  .map(([key, name]) => [key, `${name} share of expected lost output`, 0, 100]);
const battleTypes = [['TERRITORY_TOURNAMENT_BATTLE', 'Grand Arena'], ['TERRITORY_WAR_BATTLE', 'Territory War'],
  ['TERRITORY_STRIKE_BATTLE', 'Territory Battle combat'], ['TERRITORY_COVERT_BATTLE', 'Territory Battle special mission'],
  ['EVENT', 'Event'], ['GALACTIC_CHALLENGE', 'Galactic Challenge'], ['CONQUEST_BATTLE', 'Conquest'],
  ['GUILD_RAID_BATTLE', 'Raid'], ['PVP_BATTLE', 'Squad Arena'], ['COLISEUM_BATTLE', 'Coliseum']];

export default class CombatModelForm extends React.Component {
  constructor(props) {
    super(props);
    this.inputs = {};
    this.nextKey = props.model.matchups.length;
    this.state = { scenarios: props.model.matchups.map((enemy, key) => ({ enemy, key })) };
  }

  read() {
    const model = { ...this.props.model, team: [] };
    fields.forEach(([key]) => { if (this.inputs[key]) model[key] = this.inputs[key].valueAsNumber; });
    kitFields.forEach(([key]) => { if (this.inputs[key]) model[key] = this.inputs[key].valueAsNumber; });
    if (this.inputs['control-stun']) model.incomingControlWeights = Object.fromEntries(controlFields.map(([key]) => [key, this.inputs['control-' + key].valueAsNumber]));
    model.matchups = this.state.scenarios.map(scenario => {
      const enemy = { ...scenario.enemy };
      enemyFields.forEach(([key]) => { enemy[key] = this.inputs['enemy-' + scenario.key + '-' + key].valueAsNumber; });
      return enemy;
    });
    model.teamIds = Array.from(this.team.selectedOptions).map(option => option.value);
    model.numberCrunch = this.numberCrunch ? this.numberCrunch.checked : false;
    if (this.kitEnabled) model.kitEnabled = this.kitEnabled.checked;
    if (this.autoTeam) model.autoTeam = this.autoTeam.checked;
    if (this.leader) model.leaderId = this.leader.value;
    if (this.externalStates) model.externalStatePolicy = this.externalStates.checked ? 'unspecified' : 'closed-roster';
    if (this.battleType) model.battleContext = this.battleType.value ? { type: this.battleType.value,
      squadSize: this.squadSize.value === '' ? null : this.squadSize.valueAsNumber,
      eventId: this.eventId.value.trim() || null } : null;
    if (this.states) {
      const state = JSON.parse(this.states.value || '{}');
      model.blackboards = state.blackboards || {};
      model.stateTags = state.stateTags || {};
    }
    return CombatUtility.validate(model);
  }

  render() {
    const { model, characterId, characters, gameSettings } = this.props;
    this.inputs = this.inputs || {};
    const numeric = (items, prefix, values) => items.map(([key, label, min, max]) => <label key={prefix + key} style={{ display: 'block', margin: '8px 0' }}>
      {label}{' '}<input type="number" min={min} max={max} step="any" required defaultValue={values[key]}
        ref={input => { this.inputs[prefix + key] = input; }} style={{ width: '90px' }} />
    </label>);
    return <div className="combat-model-form">
      <h3>Combat Utility V5</h3>
      <p>Scores projected damage per time × effective HP. Set bonuses count as actual stats. Matchup and kit assumptions determine the value of each stat.</p>
      <p>Character kits supply attack coefficients, recovery, turn meter, assists, control, buffs, and team effects. Three enemy scenarios are used by default. This is an expected-value model; conditional counters and battle events need assumptions.</p>
      {CombatUtility.getKit(characterId) && <details open><summary>Character mechanics</summary>
        <label><input type="checkbox" defaultChecked={model.kitEnabled} ref={input => { this.kitEnabled = input; }} /> Use this character’s kit</label>
        <p>Uses maximum ability levels without Omicrons. Extra unlock-dependent abilities are disabled unless uses are entered below.</p>
        {numeric(kitFields, '', model)}
        <details><summary>Battle mode</summary>
          <p>Choose the mode for mode-dependent kit effects. An unspecified mode leaves those conditions unresolved. Omicrons remain disabled.</p>
          <label>Mode <select defaultValue={model.battleContext ? model.battleContext.type : ''} ref={input => { this.battleType = input; }}>
            <option value="">Unspecified</option>{battleTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select></label>
          <label style={{ display: 'block' }}>Squad size <input type="number" min="1" max="5" step="1"
            defaultValue={model.battleContext && model.battleContext.squadSize != null ? model.battleContext.squadSize : ''}
            ref={input => { this.squadSize = input; }} /></label>
          <label style={{ display: 'block' }}>Event ID, when required <input type="text"
            defaultValue={model.battleContext ? model.battleContext.eventId || '' : ''} ref={input => { this.eventId = input; }} /></label>
        </details>
        <details><summary>Incoming control and kit immunities</summary>
          <p>Split the assumed lost output between these control effects. Shares are normalized to a total of one; equal shares are illustrative defaults. Kit immunities remove the matching portion of the loss, while Tenacity affects the remainder.</p>
          {numeric(controlFields, 'control-', model.incomingControlWeights || { stun: 0.25, fear: 0.25, daze: 0.25, abilityBlock: 0.25 })}
        </details>
        <p>{CombatUtility.getKit(characterId).abilities.map(ability => ability.name).join(', ')}</p>
        <p>{CombatUtility.getKit(characterId).abilities.reduce((sum, ability) => sum + ability.omittedCount, 0)} effect branches require additional state or are unsupported. These and unresolved assumptions are recorded in the analysis and run exports.</p>
        <details><summary>Conditional counters and effect probabilities</summary>
          <label><input type="checkbox" defaultChecked={model.externalStatePolicy === 'unspecified'} ref={input => { this.externalStates = input; }} /> Allow unspecified effects from outside this roster</label>
          <p>By default, source-defined special states that no active ally kit can create are absent. Enemy scenarios supply stats and ordinary buff/debuff assumptions, without additional enemy kits or Datacrons. Possible states from active kits still need checked values. Explicit probabilities below override this rule.</p>
          <p>Enter explicit assumptions for counters such as Profit and conditional effects. Keys are listed as unresolved states in the run export. Counter values are counts; effect probabilities range from 0 to 1.</p>
          <textarea rows="6" style={{ width: '100%' }} defaultValue={JSON.stringify({ blackboards: model.blackboards || {}, stateTags: model.stateTags || {} }, null, 2)} ref={input => { this.states = input; }} />
        </details>
      </details>}
      <details><summary>Damage and action overrides</summary>{numeric(model.kitEnabled ? fields.filter(([key]) => ['physicalCoefficient', 'specialCoefficient', 'incomingControlLoss', 'bonusActionRate', 'turnMeterGain'].includes(key)) : fields, '', model)}</details>
      <details><summary>Enemy matchups</summary>
        <p>Each matchup has a weight. Higher weights contribute more to the comparison.</p>
        {this.state.scenarios.map((scenario, index) => <div key={scenario.key}>
          <h4>Matchup {index + 1}</h4>{numeric(enemyFields, 'enemy-' + scenario.key + '-', scenario.enemy)}
          {this.state.scenarios.length > 1 && <button type="button" onClick={() => this.setState(state => ({ scenarios: state.scenarios.filter(row => row.key !== scenario.key) }))}>Remove matchup</button>}
        </div>)}
        <button type="button" onClick={() => {
          const key = this.nextKey++;
          const enemy = CombatUtility.defaults().matchups[0];
          this.setState(state => ({ scenarios: [...state.scenarios, { key, enemy }] }));
        }}>Add matchup</button>
      </details>
      <label style={{ display: 'block' }}>Teammates (up to four; current roster stats are captured when optimizing)
        <select multiple defaultValue={model.teamIds} ref={element => { this.team = element; }} style={{ display: 'block', width: '100%', height: '120px' }}>
          {Object.keys(characters).filter(id => id !== characterId).sort().map(id => <option key={id} value={id}>{gameSettings[id] ? gameSettings[id].name : id}</option>)}
        </select>
      </label>
      <label style={{ display: 'block' }}><input type="checkbox" defaultChecked={model.autoTeam !== false} ref={input => { this.autoTeam = input; }} /> When no teammates are selected, use a game example squad from my roster</label>
      <label>Leader <select defaultValue={model.leaderId || characterId} ref={input => { this.leader = input; }}>
        {Object.keys(characters).map(id => <option key={id} value={id}>{gameSettings[id] ? gameSettings[id].name : id}</option>)}
      </select></label>
      {characterId === 'R2D2_LEGENDARY' && <label style={{ display: 'block' }}>
        <input type="checkbox" defaultChecked={model.numberCrunch} ref={input => { this.numberCrunch = input; }} /> Assume max Number Crunch: faction bonuses and 10% stat sharing
      </label>}
    </div>;
  }
}
