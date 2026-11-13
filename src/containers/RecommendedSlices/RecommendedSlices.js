import React from 'react';
import {connect} from 'react-redux';
import memoize from 'memoize-one';
import recommendedSlices from '../../utils/recommendedSlices';
import {sliceSellLine, sellRecommendation} from '../../utils/sliceSellLine';
import sliceTargetForecast, {compareTargetChance} from '../../utils/sliceTargetForecast';
import materialSliceRecommendations from '../../utils/materialSliceRecommendations';
import {scoutingCandidates,scoutingForecast,compareScoutingPriority} from '../../utils/scoutingPriority';
import {formatGGScore, ggSlots, ggStatType} from '../../utils/ggScore';
import './RecommendedSlices.css';

const setNames = {health: 'Health', offense: 'Offense', defense: 'Defense', speed: 'Speed',
  critchance: 'Critical Chance', critdamage: 'Critical Damage', potency: 'Potency', tenacity: 'Tenacity'};
const decisionLabels = {keep: 'Priority investment', gamble: 'Selective gamble', consider: 'Consider selling', sell: 'Sell priority'};

export class RecommendedSlices extends React.PureComponent {
  state = {includeLeveling: false, dots: 'all', set: 'all', primary: 'all', shape: 'all', mode: 'chance', scope: 'stage', target: 'auto', decision: 'all', reverse: false, limit: 50,
    scoutingRows:[],scoutingBenchmark:null,scoutingBusy:false,scoutingProgress:0,scoutingError:null};
  scoutingGeneration = 0;
  componentDidUpdate(previousProps, previousState) {
    if (this.state.mode.startsWith('scout-') && (previousState.mode !== this.state.mode || previousProps.mods !== this.props.mods ||
      previousState.includeLeveling !== this.state.includeLeveling)) this.scoutingTask = this.calculateScouting();
    else if (previousState.mode.startsWith('scout-') && !this.state.mode.startsWith('scout-')) this.scoutingGeneration++;
  }
  componentWillUnmount() { this.scoutingGeneration++; }
  async calculateScouting() {
    const generation = ++this.scoutingGeneration;
    const {includeLeveling,mode} = this.state;
    const mods = this.props.mods;
    this.setState({scoutingBusy:true,scoutingProgress:0,scoutingRows:[],scoutingBenchmark:null,scoutingError:null});
    try {
      const candidates = scoutingCandidates(mods,mode==='scout-mk1'?'Mk 1':'Mk 2',includeLeveling);
      const benchmark = candidates.length ? Math.max(...candidates.map(row=>row.expectedScore)) : null;
      const rows = [];
      for(let offset=0;offset<candidates.length;offset+=20) {
        await new Promise(resolve => setTimeout(resolve,0));
        if(generation !== this.scoutingGeneration) return;
        candidates.slice(offset,offset+20).forEach(row => rows.push(scoutingForecast(row,benchmark)));
        this.setState({scoutingProgress:Math.min(offset+20,candidates.length)});
      }
      if(generation !== this.scoutingGeneration) return;
      rows.sort(compareScoutingPriority);
      this.setState({scoutingRows:rows,scoutingBenchmark:benchmark,scoutingBusy:false});
    } catch(error) {
      if(generation === this.scoutingGeneration) this.setState({scoutingBusy:false,scoutingError:'Could not calculate scouting recommendations. Try another mode and return.'});
    }
  }
  getMaterialRows = memoize(materialSliceRecommendations);
  getSellLine = memoize(sliceSellLine);
  getRecommendations = memoize((mods, includeLeveling, dots, mode) =>
    recommendedSlices(mods, {includeLeveling, dots, mode}));
  getTargetForecasts = memoize((rows, baseline, mode) => {
    const forecasts = rows.map(row => sliceTargetForecast(row, baseline));
    if (mode === 'chance') return forecasts.sort(compareTargetChance);
    return mode === 'goal' ? forecasts.sort((a, b) => b.gainPerSlice - a.gainPerSlice || b.expectedScore - a.expectedScore) : forecasts;
  });
  getPrimaries = memoize(mods => Array.from(new Set(mods
    .filter(mod => mod.primaryStat && typeof mod.primaryStat.type === 'string')
    .map(mod => ggStatType(mod.primaryStat)))).sort());

  render() {
    const {includeLeveling, dots, set, primary, shape, mode, scope, target, decision, reverse, limit} = this.state;
    const material = mode === 'mk1' ? 'Mk 1' : mode === 'mk2' ? 'Mk 2' : null;
    const scoutingMode = mode.startsWith('scout-');
    const scoutingMaterial = mode==='scout-mk1'?'Mk 1':'Mk 2';
    const baseline = this.getSellLine(this.props.mods, target);
    const nextMode = mode === 'nextSlice';
    const potentialMode = mode === 'potential';
    const candidates = scoutingMode ? this.state.scoutingRows : material ? this.getMaterialRows(this.props.mods, material, scope, includeLeveling) :
      this.getRecommendations(this.props.mods, includeLeveling, dots, mode);
    const matching = this.getTargetForecasts(candidates, baseline, mode).filter(({mod}) =>
      (set === 'all' || set === (typeof mod.set === 'string' ? mod.set : mod.set.name)) &&
      (primary === 'all' || primary === ggStatType(mod.primaryStat)) &&
      (shape === 'all' || shape === mod.slot)).filter(row => mode !== 'chance' || row.score < baseline.goal);
    const groups = {keep: [], gamble: [], consider: [], sell: [], unrated: []};
    matching.forEach(row => groups[sellRecommendation(row, baseline) || 'unrated'].push(row));
    const rankedRows = scoutingMode || decision === 'all' ? matching : groups[decision];
    const rows = reverse ? rankedRows.slice().reverse() : rankedRows;
    return <section className="recommended-slices">
      <h2>Recommended slices</h2>
      <div role="group" aria-label="Ranking mode">
        <button type="button" aria-pressed={mode==='scout-mk1'} onClick={() => this.setState({mode:'scout-mk1',limit:50})}>5-dot scouting / Mk 1</button>
        <button type="button" aria-pressed={mode==='scout-mk2'} onClick={() => this.setState({mode:'scout-mk2',limit:50})}>6-dot scouting / Mk 2</button>
        <button type="button" aria-pressed={mode === 'chance'} onClick={() => this.setState({mode: 'chance', limit: 50})}>Chance of reaching GG target</button>
        <button type="button" aria-pressed={mode === 'goal'} onClick={() => this.setState({mode: 'goal', limit: 50})}>Top-300 gain per slice</button>
        <button type="button" aria-pressed={mode === 'sixA'} onClick={() => this.setState({mode: 'sixA', limit: 50})}>Expected score at 6A</button>
        <button type="button" aria-pressed={nextMode} onClick={() => this.setState({mode: 'nextSlice', limit: 50})}>Largest next-slice improvement</button>
        <button type="button" aria-pressed={potentialMode} onClick={() => this.setState({mode: 'potential', limit: 50})}>Highest potential at 6A</button>
        <button type="button" aria-pressed={mode === 'mk1'} onClick={() => this.setState({mode: 'mk1', limit: 50})}>5-dot gain / Mk 1</button>
        <button type="button" aria-pressed={mode === 'mk2'} onClick={() => this.setState({mode: 'mk2', limit: 50})}>6-dot gain / Mk 2</button>
      </div>
      <label>Priority order{' '}
        <select aria-label="Priority order" value={reverse ? 'sell' : 'slice'}
          onChange={event => this.setState({reverse: event.target.value === 'sell', limit: 50})}>
          <option value="slice">Slice priorities — highest first</option>
          <option value="sell">Sell priorities — lowest first</option>
        </select>
      </label>
      <p>{scoutingMode ? `Ranked by expected improvement over this group's best average at 6A per next-slice ${scoutingMaterial}` : material ? `Ranked by expected top-300 total gain per ${material}` : mode === 'chance' ? 'Ranked by estimated chance of reaching the selected GG target at 6A' : mode === 'goal' ? 'Ranked by estimated improvement to your top-300 total per remaining slice' : nextMode ? 'Ranked by average GG-style score gain from the next slice' :
        potentialMode ? 'Ranked by best-case GG-style score at 6A if every remaining roll lands optimally and maxes' :
        'Ranked by average expected GG-style score after leveling and slicing all the way to 6A'}
        {reverse ? ', lowest first.' : ', highest first.'}
        {mode === 'chance' && ' Equal chances favor fewer remaining slices, then higher average at 6A; reverse order reverses tie-breakers too.'}
        {' '}Recommendation labels do not override the ranking.
        {mode === 'chance' && ' Mods already at or above the target in current GG score are excluded.'}
        {' '}Primary fit is included. Current score is shown for comparison.</p>
      {scoutingMode && <div className="slice-sell-summary">
        <h3>Scout once, then reassess</h3>
        <p>Best current average at 6A in this {scoutingMaterial} group: <strong>{formatGGScore(this.state.scoutingBenchmark)}</strong>.</p>
        <p>Priority = average of max(updated average at 6A − group benchmark, 0) ÷ next-slice cost.
          Bad outcomes earn zero improvement credit but still incur the slice cost. The current leader’s
          own upside is evaluated too. This measures discovering a stronger candidate, not immediate top-300 gain.</p>
        <p>Mk 1 compares 5E–5B mods only. Mk 2 compares 5A promotion and 6E–6B mods only.
          Set, primary, and shape filters do not change the group benchmark. Fixed GG-target sell labels
          do not control this mode. Zero-opportunity candidates remain visible.</p>
        <p>All next-roll stat targets are evaluated with their actual roll caps. Speed uses integer rolls
          3–6; other roll values are modeled uniformly and integrated across their range. Prerequisite
          leveling uses 64 repeatable sampled paths when needed and costs no materials here.
          These distributions are assumptions, not measured game odds.</p>
        <p>Free slices with positive opportunity rank first. Every 5A mod is evaluated through 6D,
          including the free 6E → 6D roll, for a total cost of 110 Mk 2.
          After each real slice, refresh and rerank.
          Nothing is automatically sliced or sold.</p>
      </div>}
      {material && <React.Fragment>
        <label>Cost scope{' '}<select aria-label="Cost scope" value={scope} onChange={event => this.setState({scope:event.target.value,limit:50})}>
          <option value="stage">6A gain / remaining {material} cost</option>
          <option value="next">Next slice only</option>
        </select></label>
        <p>{mode === 'mk1' ? '5E–5B mods: expected gain at 6A divided by remaining Mk 1 cost through 5A. Future Mk 2 upgrades are assumed funded and are not charged in this ranking.' : '5A promotion and 6E–6B mods: expected gain at 6A divided by remaining Mk 2 cost.'}
          {' '}Next slice only instead compares immediate gain with that slice’s cost.
          {' '}Enable “Include mods needing leveling” to add eligible lower-level mods. Their forecasts include
          prerequisite leveling gains, but the cost only includes slicing materials, not leveling credits.
          The dot control does not apply because each material mode defines its own stage.
          In next-slice mode, free upgrades with positive gain rank first; zero-gain free upgrades get no bonus.</p>
        <details><summary>Material costs</summary><p>5E: 100 Mk 1; 5D: 200; 5C: 350; 5B: 500.
          5A: 110 Mk 2; 6E: free; 6D: 10; 6C: 20; 6B: 35. Remaining cost sums only the selected material.
          Credits, other resources, and calibration are excluded. Expected gains use 1,024 repeatable simulations
          against the full inventory’s top-300 cutoff. Total gain divided by 300 is the change in a 300-slot average.</p></details>
      </React.Fragment>}
      <details><summary>How the forecast works</summary>
        <p>Each future roll is equally likely to hit any secondary below five rolls. We average
          over those allocation paths using the midpoint of each stat’s roll range, and include
          the 5A → 6E stat increases. Scores are estimates, not guaranteed outcomes.
          Calibration rerolls and material costs are not included. All four secondaries must
          be revealed before a mod can be forecast. Next-slice improvement excludes gains from
          prerequisite leveling; 5A → 6E uses its guaranteed stat increases instead of a random roll.</p>
        <p>Potential at 6A preserves existing rolls and places only future rolls on the highest-value
          available secondaries at their maximum values, respecting the five-roll cap. It is a
          best-case ceiling, not the average or a guaranteed result.</p></details>
      {!scoutingMode && <div className="slice-sell-summary" aria-label="Sell line summary">
        <h3>Sell line</h3>
        <label>GG target{' '}
          <select aria-label="GG target" value={target} onChange={event => this.setState({target: event.target.value, limit: 50})}>
            <option value="auto">Automatic: 60 → 65 → 70</option>
            {[50, 55, 60, 65, 70].map(value => <option key={value} value={String(value)}>{value}+</option>)}
          </select>
        </label>
        {baseline.threshold === null ? <p>Sell recommendations need at least 300 mods with valid GG scores.
          {' '}{baseline.count} available{baseline.average !== null && `, averaging ${formatGGScore(baseline.average)}` }.</p> :
          <React.Fragment>
            <p>Current top-300 average: <strong>{formatGGScore(baseline.average)}</strong> ·
              {' '}300th mod: <strong>{formatGGScore(baseline.cutoff)}</strong> ·
              {' '}Sell threshold: <strong>{baseline.threshold.toFixed(2)}</strong></p>
            <p>Invest when average at 6A reaches {baseline.goal}. Below-target averages are selective gambles only
              with at least a 25% estimated chance of reaching the target. Sell priority means even potential
              cannot reach it; consider selling other long shots. The same rules apply to equipped and current top-300 mods.
              Calculated from the full inventory, including equipped and fully sliced mods; filters do not change it.</p>
            <p>{groups.keep.length} priority investments · {groups.gamble.length} selective gambles ·
              {' '}{groups.consider.length} consider selling · {groups.sell.length} sell priorities
              {' '}match these filters. All mods follow the selected ranking mode.
              Review character needs before selling; GG score does not measure character fit or calibration potential.
              Equipped candidates are marked for review. Nothing is sold automatically.</p>
            <p>Target chance uses 1,024 repeatable simulations with equal chances among uncapped secondaries,
              uniform stat ranges, and integer Speed rolls. These are estimates, not measured game odds.
              The 25% cutoff is a policy choice. Gain per slice uses remaining slice steps as a cost proxy;
              it does not price materials, credits, or prerequisite leveling. Automatic targets rise at top-300
              averages of 60 and 65. Each candidate’s gain is evaluated independently against the current inventory.</p>
          </React.Fragment>}
      </div>}
      <div className="slice-controls">
        <label>Mod dots{' '}
          <select aria-label="Mod dots" disabled={Boolean(material)||scoutingMode} value={dots} onChange={event => this.setState({dots: event.target.value, limit: 50})}>
            <option value="all">5 and 6 dots</option>
            <option value="5">5 dots</option>
            <option value="6">6 dots</option>
          </select>
        </label>
        <label>Set{' '}
          <select aria-label="Set" value={set} onChange={event => this.setState({set: event.target.value, limit: 50})}>
            <option value="all">All sets</option>
            {Object.keys(setNames).map(name => <option key={name} value={name}>{setNames[name]}</option>)}
          </select>
        </label>
        <label>Primary stat{' '}
          <select aria-label="Primary stat" value={primary} onChange={event => this.setState({primary: event.target.value, limit: 50})}>
            <option value="all">All primaries</option>
            {this.getPrimaries(this.props.mods).map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>
        <label>Shape{' '}
          <select aria-label="Shape" value={shape} onChange={event => this.setState({shape: event.target.value, limit: 50})}>
            <option value="all">All shapes</option>
            {ggSlots.map(slot => <option key={slot} value={slot}>{slot[0].toUpperCase() + slot.slice(1)}</option>)}
          </select>
        </label>
        <label>Recommendation{' '}
          <select aria-label="Recommendation" disabled={scoutingMode} value={decision}
            onChange={event => this.setState({decision: event.target.value, limit: 50})}>
            <option value="all">All recommendations</option>
            {Object.keys(decisionLabels).map(key => <option key={key} value={key}>{decisionLabels[key]}</option>)}
          </select>
        </label>
        <label><input type="checkbox" checked={includeLeveling}
          onChange={event => this.setState({includeLeveling: event.target.checked, limit: 50})} />
          Include mods needing leveling
        </label>
      </div>
      <p role="status">{scoutingMode && this.state.scoutingBusy ? `Calculating next-roll outcomes… ${this.state.scoutingProgress} mods evaluated.` : rows.length ? `Showing ${Math.min(limit, rows.length)} of ${rows.length} recommendations.` :
        'No eligible mods match these filters.'} Fully sliced 6A mods, mods below 5 dots,
        and mods with unrevealed secondaries or inconsistent roll data are excluded.</p>
      {scoutingMode && this.state.scoutingError && <p role="alert">{this.state.scoutingError}</p>}
      {rows.length > 0 && <div className="slice-table-scroll">
        <table>
          <caption>{scoutingMode ? `Scouting / ${scoutingMaterial}${reverse ? ' — reversed' : ''}` : material ? `Top-300 gain per ${material} — ${scope === 'next' ? 'next slice' : '6A gain / remaining material'}${reverse ? ', reversed' : ''}` : reverse ? 'Sell priority — reversed order by selected ranking' : mode === 'chance' ? 'Slice priority by chance of reaching GG target' : mode === 'goal' ? 'Slice priority by top-300 gain per remaining slice' : nextMode ? 'Slice priority by average next-slice improvement' : potentialMode ? 'Slice priority by highest potential at 6A' : 'Slice priority by expected GG-style score at 6A'}</caption>
          <thead><tr><th scope="col">Rank</th><th scope="col">Mod</th><th scope="col">{nextMode ? 'Average next-slice gain' : 'Average and potential at 6A'}</th><th scope="col">Current</th>
            <th scope="col">Next step</th><th scope="col">Secondary stats</th><th scope="col">Equipped to</th></tr></thead>
          <tbody>{rows.slice(0, limit).map((row, index) => {
            const {mod} = row;
            const set = typeof mod.set === 'string' ? mod.set : mod.set.name;
            const owner = this.props.gameSettings[mod.characterID];
            const recommendation = scoutingMode ? null : sellRecommendation(row, baseline);
            const below = recommendation === 'sell';
            return <React.Fragment key={mod.id}>
              <tr className={below ? 'slice-sell-candidate' : undefined}>
              <td>{index + 1}</td>
              <td><strong>{setNames[set]} · {mod.slot}</strong>
                <div>{mod.primaryStat.show()}</div><small title="Mod ID">{mod.id}</small>
                {recommendation && <strong className="slice-sell-label">{decisionLabels[recommendation]}
                  {recommendation !== 'keep' && mod.characterID ? ' · equipped, review first' : ''}</strong>}</td>
              <td>{nextMode ? <React.Fragment>
                <strong>{row.nextSliceImprovement >= 0 ? '+' : ''}{row.nextSliceImprovement.toFixed(2)} points</strong>
                <div>After slice: {formatGGScore(row.nextSliceScore)} / 100</div>
              </React.Fragment> : null}
                {scoutingMode && <React.Fragment>
                  <div><strong>Scouting gain / {scoutingMaterial}: {row.scoutingCost===0 ? row.scoutingFree ? 'Free opportunity' : 'Free · no opportunity' : row.scoutingEfficiency.toFixed(5)}</strong></div>
                  <div>Expected improvement above benchmark: +{row.scoutingGain.toFixed(3)}</div>
                  <div>Chance to beat benchmark: {(row.scoutingChance*100).toFixed(1)}%</div>
                  <div>Next-slice cost: {row.scoutingCost} {scoutingMaterial}</div>
                  <div>{row.scoutingGain>0 ? 'Slice once, then refresh and rerank' : 'No opportunity to beat the current group benchmark'}</div>
                </React.Fragment>}
                {material && <React.Fragment>
                  <div><strong>Gain / {material}: {row.cost === 0 ? row.freeGain ? 'Free · positive gain' : 'Free · no gain' : row.gainPerMaterial.toFixed(4)}</strong></div>
                  <div>Expected top-300 total gain to {row.endpoint}: +{row.expectedGain.toFixed(3)}</div>
                  <div>Cost: {row.cost} {material} · Next: {row.costs.next === 0 ? 'Free' : `${row.costs.next} ${material}`}</div>
                </React.Fragment>}
                <div><strong>Average at 5A: {mod.pips === 6 ? 'N/A — already 6-dot' : formatGGScore(row.expectedFiveAScore)}</strong>{mod.pips === 5 ? ' / 100' : ''}</div>
                <div><strong>Average at 6A: {formatGGScore(row.expectedScore)}</strong> / 100</div>
                <div><strong>Potential at 6A: {formatGGScore(row.potentialScore)}</strong> / 100</div>
                <div>Estimated chance of {baseline.goal}+: {(row.targetChance * 100).toFixed(1)}%</div>
                <div>Expected top-300 total gain: +{row.expectedTop300Gain.toFixed(2)}</div>
                <div>Gain per remaining slice: {row.gainPerSlice.toFixed(2)} · {row.remainingSlices} slices</div>
                <div>{row.remainingRolls} rolls remaining</div>
                {row.primaryFit < 1 && <div>Primary fit ×{row.primaryFit.toFixed(2)}</div>}</td>
              <td>{formatGGScore(row.score)} / 100</td>
              <td>{row.needsLeveling && <div>Level {mod.level} → 15 first</div>}
                <strong>{row.nextSlice}</strong></td>
              <td><ul>{mod.secondaryStats.map(stat =>
                <li key={stat.type}>({stat.rolls}) {stat.show()}</li>)}</ul></td>
              <td>{mod.characterID ? (owner ? owner.name : mod.characterID) : 'Unequipped'}</td>
            </tr></React.Fragment>;
          })}</tbody>
        </table>
      </div>}
      {rows.length > limit && <button type="button" onClick={() => this.setState({limit: limit + 50})}>Show 50 more</button>}
    </section>;
  }
}

export default connect(state => ({mods: state.profile.mods, gameSettings: state.gameSettings}))(RecommendedSlices);



