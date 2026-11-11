import React from 'react';
import {connect} from 'react-redux';
import memoize from 'memoize-one';
import {ggScore, formatGGScore} from '../../utils/ggScore';
import '../RecommendedSlices/RecommendedSlices.css';
import './CurrentGGMods.css';

const sets = {health:'Health',offense:'Offense',defense:'Defense',speed:'Speed',
  critchance:'Critical Chance',critdamage:'Critical Damage',potency:'Potency',tenacity:'Tenacity'};

export function currentGGRows(mods, unequippedOnly = false, order = 'highest') {
  return mods.filter(mod => !unequippedOnly || !mod.characterID)
    .map(mod => ({mod, score:ggScore(mod).score}))
    .sort((a,b) => {
      const aValid = Number.isFinite(a.score);
      const bValid = Number.isFinite(b.score);
      if (aValid !== bValid) return aValid ? -1 : 1;
      return (aValid ? (order === 'lowest' ? a.score-b.score : b.score-a.score) : 0) ||
        String(a.mod.id).localeCompare(String(b.mod.id));
    });
}

export class CurrentGGMods extends React.PureComponent {
  state = {unequippedOnly:false,order:'highest',limit:50};
  getRows = memoize(currentGGRows);
  getAverages = memoize((mods, unequippedOnly) => {
    const scores = currentGGRows(mods, unequippedOnly)
      .map(row => row.score).filter(Number.isFinite);
    let total = 0;
    return Array.from({length:15}, (_, index) => {
      const count = (index + 1) * 30;
      for (let i = count - 30; i < Math.min(count, scores.length); i++) total += scores[i];
      return {count, average:scores.length >= count ? total / count : null};
    });
  });

  render() {
    const {unequippedOnly,order,limit} = this.state;
    const rows = this.getRows(this.props.mods,unequippedOnly,order);
    return <section className="recommended-slices">
      <h2>Current GG Score</h2>
      <div className="current-gg-averages" role="group" aria-label="Top mods current GG averages">
        {this.getAverages(this.props.mods, unequippedOnly).map(({count,average}) =>
          <div className="current-gg-average" key={count}>
            <span>Top {count} average</span>
            <strong>{average === null ? 'Unavailable' : `${formatGGScore(average)} / 100`}</strong>
          </div>)}
      </div>
      <p>Averages of the highest-scoring {unequippedOnly ? 'unequipped ' : ''}mods, excluding unavailable scores.
        {' '}Each average requires the full number of mods.</p>
      <p>Mods ranked by their current GG score. Mods without a supported score appear last.</p>
      <div className="slice-controls">
        <label><input type="checkbox" checked={unequippedOnly}
          onChange={event => this.setState({unequippedOnly:event.target.checked,limit:50})} /> Unequipped only</label>
        <label>Score order{' '}<select value={order}
          onChange={event => this.setState({order:event.target.value,limit:50})}>
          <option value="highest">Highest first</option>
          <option value="lowest">Lowest first</option>
        </select></label>
      </div>
      <p role="status">{rows.length ? `Showing ${Math.min(limit,rows.length)} of ${rows.length} mods.` : 'No mods match.'}</p>
      {rows.length > 0 && <div className="slice-table-scroll"><table>
        <caption>Current GG score · {order === 'highest' ? 'highest first' : 'lowest first'}</caption>
        <thead><tr><th scope="col">Mod</th><th scope="col">Current GG score</th>
          <th scope="col">Level / tier</th><th scope="col">Secondary stats</th><th scope="col">Equipped to</th></tr></thead>
        <tbody>{rows.slice(0,limit).map(({mod,score}) => {
          const set = typeof mod.set === 'string' ? mod.set : mod.set.name;
          const owner = this.props.gameSettings[mod.characterID];
          return <tr key={mod.id}>
            <td><strong>{sets[set] || set} · {mod.slot}</strong><div>{mod.primaryStat.show()}</div><small>{mod.id}</small></td>
            <td>{Number.isFinite(score) ? `${formatGGScore(score)} / 100` : 'Unavailable'}</td>
            <td>Level {mod.level} · {mod.pips}{'EDCBA'[mod.tier-1]}</td>
            <td><ul>{mod.secondaryStats.map(stat => <li key={stat.type}>({stat.rolls}) {stat.show()}</li>)}</ul></td>
            <td>{mod.characterID ? (owner ? owner.name : mod.characterID) : 'Unequipped'}</td>
          </tr>;
        })}</tbody>
      </table></div>}
      {rows.length > limit && <button type="button" onClick={() => this.setState({limit:limit+50})}>Show 50 more</button>}
    </section>;
  }
}

export default connect(state => ({mods:state.profile.mods,gameSettings:state.gameSettings}))(CurrentGGMods);
