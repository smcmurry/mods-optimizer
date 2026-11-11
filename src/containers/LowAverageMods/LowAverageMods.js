import React from 'react';
import {connect} from 'react-redux';
import memoize from 'memoize-one';
import expectedSixAScore from '../../utils/expectedSixAScore';
import {formatGGScore, ggSlots, ggStatType} from '../../utils/ggScore';
import '../RecommendedSlices/RecommendedSlices.css';

const sets = {health:'Health',offense:'Offense',defense:'Defense',speed:'Speed',
  critchance:'Critical Chance',critdamage:'Critical Damage',potency:'Potency',tenacity:'Tenacity'};
const tiers = [5,6].reduce((all,dots) => all.concat('EDCBA'.split('').map(tier => `${dots}${tier}`)), []);
const tierName = mod => `${mod.pips}${'EDCBA'[mod.tier-1]}`;
const modSpeed = mod => [mod.primaryStat,...mod.secondaryStats]
  .filter(stat => stat && ggStatType(stat) === 'Speed').reduce((total,stat) => total + Number(stat.value),0);

export function filterLowAverageRows(rows, {unequippedOnly=false,excludeRecommended=false,tier='all',shape='all',set='all',minSpeed='',maxSpeed=''} = {}, modAssignments = []) {
  const recommendedIds = new Set((modAssignments || []).reduce((ids, assignment) =>
    assignment && assignment.assignedMods ? ids.concat(assignment.assignedMods) : ids, []));
  return rows.filter(({mod}) => (!unequippedOnly || !mod.characterID) &&
    (!excludeRecommended || !recommendedIds.has(mod.id)) &&
    (tier === 'all' || tierName(mod) === tier) &&
    (shape === 'all' || mod.slot === shape) &&
    (set === 'all' || (typeof mod.set === 'string' ? mod.set : mod.set.name) === set) &&
    (minSpeed === '' || modSpeed(mod) >= Number(minSpeed)) &&
    (maxSpeed === '' || modSpeed(mod) <= Number(maxSpeed)));
}

export function lowAverageMods(mods, cutoff = 40) {
  const forecasts = mods.map(mod => ({mod, forecast:expectedSixAScore(mod)}));
  return {
    unavailable: forecasts.filter(row => !row.forecast || !Number.isFinite(row.forecast.expectedScore)).length,
    rows: forecasts.filter(row => Number.isFinite(cutoff) && cutoff >= 0 && cutoff <= 100 &&
      row.forecast && Number.isFinite(row.forecast.expectedScore) && row.forecast.expectedScore <= cutoff)
      .sort((a,b) => a.forecast.expectedScore-b.forecast.expectedScore || String(a.mod.id).localeCompare(String(b.mod.id)))
  };
}

export class LowAverageMods extends React.PureComponent {
  state = {cutoff:'40',unequippedOnly:false,excludeRecommended:true,limit:50,tier:'all',shape:'all',set:'all',minSpeed:'',maxSpeed:''};
  getRows = memoize(lowAverageMods);
  render() {
    const {cutoff,unequippedOnly,excludeRecommended,limit,tier,shape,set,minSpeed,maxSpeed} = this.state;
    const threshold = cutoff === '' ? NaN : Number(cutoff);
    const validCutoff = Number.isFinite(threshold) && threshold >= 0 && threshold <= 100;
    const result = this.getRows(this.props.mods,threshold);
    const rows = filterLowAverageRows(result.rows,this.state,this.props.modAssignments);
    const hasRecommendations = (this.props.modAssignments || []).some(assignment =>
      assignment && assignment.assignedMods && assignment.assignedMods.length > 0);
    return <section className="recommended-slices">
      <h2>Average at 6A cutoff</h2>
      <p>All mods with an estimated average at 6A at or below your cutoff, lowest first. Includes equipped mods,
        mods that need leveling, and finished 6A mods. Estimates do not include calibration.</p>
      <div className="slice-controls">
        <label>Maximum average at 6A{' '}<input aria-label="Maximum average at 6A" type="number" min="0" max="100" step="0.1" value={cutoff}
          onChange={event => this.setState({cutoff:event.target.value,limit:50})} /></label>
        {[40,45,50].map(value => <button key={value} type="button" aria-pressed={threshold === value}
          onClick={() => this.setState({cutoff:String(value),limit:50})}>{value} or below</button>)}
      </div>
      {!validCutoff && <p role="alert">Enter a cutoff from 0 to 100.</p>}
      <label><input type="checkbox" checked={unequippedOnly}
        onChange={event => this.setState({unequippedOnly:event.target.checked,limit:50})} /> Unequipped only</label>
      <div><label><input type="checkbox" checked={excludeRecommended}
        onChange={event => this.setState({excludeRecommended:event.target.checked,limit:50})} /> Exclude recommended mods</label></div>
      {excludeRecommended && <p>{hasRecommendations
        ? 'Excludes mods assigned to characters in your latest optimization results, including mods recommended to stay equipped.'
        : 'No optimization recommendations available. Run optimization first to exclude recommended mods.'}</p>}
      <div className="slice-controls">
        <label>Tier{' '}<select aria-label="Tier" value={tier} onChange={event => this.setState({tier:event.target.value,limit:50})}>
          <option value="all">All tiers</option>{tiers.map(value => <option key={value} value={value}>{value}</option>)}
        </select></label>
        <label>Shape{' '}<select aria-label="Shape" value={shape} onChange={event => this.setState({shape:event.target.value,limit:50})}>
          <option value="all">All shapes</option>{ggSlots.map(value => <option key={value} value={value}>{value[0].toUpperCase()+value.slice(1)}</option>)}
        </select></label>
        <label>Set{' '}<select aria-label="Set" value={set} onChange={event => this.setState({set:event.target.value,limit:50})}>
          <option value="all">All sets</option>{Object.keys(sets).map(value => <option key={value} value={value}>{sets[value]}</option>)}
        </select></label>
        <label>Minimum Speed{' '}<input aria-label="Minimum Speed" type="number" min="0" step="1" placeholder="Any" value={minSpeed}
          onChange={event => this.setState({minSpeed:event.target.value,limit:50})} /></label>
        <label>Maximum Speed{' '}<input aria-label="Maximum Speed" type="number" min="0" step="1" placeholder="Any" value={maxSpeed}
          onChange={event => this.setState({maxSpeed:event.target.value,limit:50})} /></label>
        <button type="button" onClick={() => this.setState({unequippedOnly:false,excludeRecommended:true,tier:'all',shape:'all',set:'all',minSpeed:'',maxSpeed:'',limit:50})}>Clear filters</button>
      </div>
      <p>Speed uses the mod’s current value, including a Speed primary on arrows. Mods without Speed count as 0.</p>
      {result.unavailable > 0 && <p>{result.unavailable} mods have no supported 6A forecast and are not included.</p>}
      <p role="status">{rows.length ? `Showing ${Math.min(limit,rows.length)} of ${rows.length} mods.` : 'No mods match.'}</p>
      {rows.length > 0 && <div className="slice-table-scroll"><table>
        <caption>Mods with average at 6A ≤ {threshold}</caption>
        <thead><tr><th scope="col">Mod</th><th scope="col">Average at 6A</th>
          <th scope="col">Potential at 6A</th><th scope="col">Level / tier</th><th scope="col">Speed</th>
          <th scope="col">Secondary stats</th><th scope="col">Equipped to</th></tr></thead>
        <tbody>{rows.slice(0,limit).map(({mod,forecast}) => {
          const set = typeof mod.set === 'string' ? mod.set : mod.set.name;
          const owner = this.props.gameSettings[mod.characterID];
          return <tr key={mod.id}>
            <td><strong>{sets[set] || set} · {mod.slot}</strong><div>{mod.primaryStat.show()}</div><small>{mod.id}</small></td>
            <td>{formatGGScore(forecast.expectedScore)} / 100</td>
            <td>{formatGGScore(forecast.potentialScore)} / 100</td>
            <td>Level {mod.level} · {mod.pips}{'EDCBA'[mod.tier-1]}</td>
            <td>{modSpeed(mod)}</td>
            <td><ul>{mod.secondaryStats.map(stat => <li key={stat.type}>({stat.rolls}) {stat.show()}</li>)}</ul></td>
            <td>{mod.characterID ? (owner ? owner.name : mod.characterID) : 'Unequipped'}</td>
          </tr>;
        })}</tbody>
      </table></div>}
      {rows.length > limit && <button type="button" onClick={() => this.setState({limit:limit+50})}>Show 50 more</button>}
    </section>;
  }
}

export default connect(state => ({mods:state.profile.mods,modAssignments:state.profile.modAssignments,gameSettings:state.gameSettings}))(LowAverageMods);
