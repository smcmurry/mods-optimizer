import React from 'react';
import {connect} from 'react-redux';
import memoize from 'memoize-one';
import recommendedCalibrations from '../../utils/recommendedCalibrations';
import {formatGGScore, ggSlots, ggStatType} from '../../utils/ggScore';
import '../RecommendedSlices/RecommendedSlices.css';

const sets = {health:'Health',offense:'Offense',defense:'Defense',speed:'Speed',
  critchance:'Critical Chance',critdamage:'Critical Damage',potency:'Potency',tenacity:'Tenacity'};

export class RecommendedCalibrations extends React.PureComponent {
  state = {set:'all',primary:'all',shape:'all',limit:50};
  getRows = memoize(mods => recommendedCalibrations(mods));
  getPrimaries = memoize(mods => Array.from(new Set(mods.filter(mod => mod.primaryStat)
    .map(mod => ggStatType(mod.primaryStat)))).sort());
  render() {
    const {set,primary,shape,limit} = this.state;
    const rows = this.getRows(this.props.mods).filter(({mod}) =>
      (set === 'all' || set === (typeof mod.set === 'string' ? mod.set : mod.set.name)) &&
      (shape === 'all' || shape === mod.slot) && (primary === 'all' || primary === ggStatType(mod.primaryStat)));
    return <section className="recommended-slices">
      <h2>Recommended calibrations</h2>
      <p>Ranked by estimated average GG-style score gain from one calibration attempt.
        Each mod shows the best secondary to select, assuming you keep improvements and revert worse results.</p>
      <p><strong>Remaining attempts unknown:</strong> calibration history is not imported.
        Check that the mod has an attempt available in-game. This ranks gain per attempt, not per material.</p>
      <details><summary>How calibration estimates work</summary>
        <p>Only six-dot, level-15 mods with complete roll data are included. A selected secondary
          must have at least two rolls. One roll is removed, then a new roll can land equally on
          any secondary below five rolls, including the selected stat. Stat types stay unchanged.</p>
        <p>Individual roll values are unavailable, so the removed roll is estimated from the selected
          stat’s average. Speed’s permanent +1 is preserved. New roll values use the supplied six-dot
          ranges with a uniform distribution. We average the gain after keeping or reverting each
          outcome. Potential uses the best receiving stat and a maximum new roll for the recommended
          choice, assuming the same average removed roll. Unknown individual roll values can change
          that ceiling. Actual probabilities and gains may differ; these are estimates, not guarantees.</p>
      </details>
      <div className="slice-controls">
        <label>Set{' '}<select aria-label="Set" value={set} onChange={e => this.setState({set:e.target.value,limit:50})}>
          <option value="all">All sets</option>{Object.keys(sets).map(key => <option key={key} value={key}>{sets[key]}</option>)}
        </select></label>
        <label>Primary stat{' '}<select aria-label="Primary stat" value={primary} onChange={e => this.setState({primary:e.target.value,limit:50})}>
          <option value="all">All primaries</option>{this.getPrimaries(this.props.mods).map(type => <option key={type} value={type}>{type}</option>)}
        </select></label>
        <label>Shape{' '}<select aria-label="Shape" value={shape} onChange={e => this.setState({shape:e.target.value,limit:50})}>
          <option value="all">All shapes</option>{ggSlots.map(slot => <option key={slot} value={slot}>{slot[0].toUpperCase()+slot.slice(1)}</option>)}
        </select></label>
      </div>
      <p role="status">{rows.length ? `Showing ${Math.min(limit,rows.length)} of ${rows.length} recommendations.` :
        'No calibration candidates with positive estimated gain match these filters.'}</p>
      {rows.length > 0 && <div className="slice-table-scroll"><table>
        <caption>Calibration priority by average retained score improvement</caption>
        <thead><tr><th scope="col">Rank</th><th scope="col">Mod</th><th scope="col">Calibrate</th>
          <th scope="col">Average gain</th><th scope="col">Current</th><th scope="col">Secondary stats</th><th scope="col">Equipped to</th></tr></thead>
        <tbody>{rows.slice(0,limit).map((row,index) => {
          const {mod} = row;
          const setName = typeof mod.set === 'string' ? mod.set : mod.set.name;
          const owner = this.props.gameSettings[mod.characterID];
          return <tr key={mod.id}>
            <td>{index+1}</td>
            <td><strong>{sets[setName]} · {mod.slot}</strong><div>{mod.primaryStat.show()}</div><small>{mod.id}</small></td>
            <td><strong>{row.sourceType}</strong><details><summary>Other choices</summary><ul>
              {row.options.map(option => <li key={option.sourceType}>{option.sourceType}: +{option.expectedGain.toFixed(2)} points</li>)}
            </ul></details></td>
            <td><strong>+{row.expectedGain.toFixed(2)} points</strong><div>Average after keep/revert: {formatGGScore(row.expectedScore)} / 100</div>
              <div>Estimated potential after attempt: {formatGGScore(row.potentialScore)} / 100</div>
              <div>Est. improvement chance: {(row.improvementChance*100).toFixed(1)}%</div></td>
            <td>{formatGGScore(row.currentScore)} / 100
              {row.primaryFit < 1 && <div>Primary fit ×{row.primaryFit.toFixed(2)}</div>}</td>
            <td><ul>{mod.secondaryStats.map(stat => <li key={stat.type}>({stat.rolls}) {stat.show()}</li>)}</ul></td>
            <td>{mod.characterID ? (owner ? owner.name : mod.characterID) : 'Unequipped'}</td>
          </tr>;
        })}</tbody>
      </table></div>}
      {rows.length > limit && <button type="button" onClick={() => this.setState({limit:limit+50})}>Show 50 more</button>}
    </section>;
  }
}
export default connect(state => ({mods:state.profile.mods,gameSettings:state.gameSettings}))(RecommendedCalibrations);
