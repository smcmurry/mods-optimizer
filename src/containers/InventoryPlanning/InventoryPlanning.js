import React from 'react';
import {connect} from 'react-redux';
import memoize from 'memoize-one';
import modInventoryPlan, {inventorySetNames} from '../../utils/modInventoryPlan';
import {ggSlots,formatGGScore} from '../../utils/ggScore';
import generatedMetaTargets from '../../constants/generatedMetaTargets.json';
import '../RecommendedSlices/RecommendedSlices.css';
import './InventoryPlanning.css';

function Distribution({row,qualityTarget,scoreLabel}) {
  const max = Math.max(1,...row.bins,...row.curve);
  const x = score => 32+score*2.8;
  const y = count => 130-count/max*100;
  const points = row.curve.map((count,score) => `${x(score)},${y(count)}`).join(' ');
  return <svg viewBox="0 0 330 164" role="img" aria-label={`${row.scores.length} scored mods. ${scoreLabel} from 0 to 100. Average ${formatGGScore(row.average)}.`}>
    <title>{row.bins.map((count,i) => `${i*10}–${i===9 ? 100 : (i+1)*10}: ${count} mods`).join('; ')}</title>
    {[0,0.5,1].map(fraction => <g key={fraction}>
      <line x1="32" x2="312" y1={y(max*fraction)} y2={y(max*fraction)} className="inventory-gridline" />
      <text x="28" y={y(max*fraction)+4} textAnchor="end">{(max*fraction).toFixed(fraction ? 1 : 0)}</text>
    </g>)}
    {row.bins.map((count,i) => <rect key={i} x={x(i*10)+1} y={y(count)} width="26" height={130-y(count)} className="inventory-bar">
      <title>{i*10}–{(i+1)*10} GG: {count} mods</title>
    </rect>)}
    {row.scores.length > 0 && <polyline points={points} className="inventory-curve" />}
    <line x1={x(qualityTarget)} x2={x(qualityTarget)} y1="24" y2="130" className="inventory-target" />
    {[0,20,40,60,80,100].map(score => <text key={score} x={x(score)} y="146" textAnchor="middle">{score}</text>)}
    <text x="172" y="161" textAnchor="middle">{scoreLabel}</text>
    {!row.scores.length && <text x="172" y="80" textAnchor="middle">No scored mods</text>}
  </svg>;
}

export class InventoryPlanning extends React.PureComponent {
  state = {set:'all',shape:'all',primary:'all',sort:'quality',requiredOnly:false,qualityTarget:40,limit:24,useSixAAverage:false};
  getPlan = memoize(modInventoryPlan);
  render() {
    const {set,shape,primary,sort,requiredOnly,qualityTarget,limit,useSixAAverage} = this.state;
    const plan = this.getPlan(this.props.mods,this.props.gameSettings,generatedMetaTargets.characters,useSixAAverage);
    const scoreLabel = useSixAAverage ? 'Average GG at 6A' : 'Current GG score';
    const name = id => this.props.gameSettings[id] ? this.props.gameSettings[id].name :
      generatedMetaTargets.characters[id] ? generatedMetaTargets.characters[id].name : id;
    const enriched = plan.rows.map(row => ({...row,good:row.scores.filter(score => score >= qualityTarget).length}));
    const rows = enriched.filter(row => (set === 'all' || row.set === set) &&
      (shape === 'all' || row.shape === shape) && (primary === 'all' || row.primary === primary) && (!requiredOnly || row.required > 0))
      .sort((a,b) => (sort === 'quality' ? Math.max(0,b.required-b.good)-Math.max(0,a.required-a.good) :
        sort === 'most-quality' ? b.good-a.good : sort === 'least-quality' ? a.good-b.good :
        sort === 'surplus' ? b.surplus-a.surplus :
        sort === 'shortage' ? b.shortage-a.shortage : sort === 'required' ? b.required-a.required :
        sort === 'average' ? (a.average === null ? Infinity : a.average)-(b.average === null ? Infinity : b.average) : 0) ||
        a.key.localeCompare(b.key));
    const update = (field,value) => this.setState({[field]:value,limit:24});
    const shortage = plan.rows.reduce((sum,row) => sum+row.shortage,0);
    const qualityShortage = enriched.reduce((sum,row) => sum+Math.max(0,row.required-row.good),0);
    return <section className="recommended-slices inventory-planning">
      <h2>Mod inventory planning</h2>
      <label><input type="checkbox" checked={useSixAAverage}
        onChange={event => update('useSixAAverage',event.target.checked)} /> Show average at 6A instead of current GG</label>
      <p>{scoreLabel} grouped by set, primary, and shape. Bars count mods in 10-point ranges; the blue line smooths the
        distribution. Small samples may have uneven curves. Includes equipped and unequipped mods at every level.</p>
      {useSixAAverage && <p>Graphs, averages, quality counts, and score-based sorting use each mod’s expected GG score at 6A, without calibration.
        Mods without a supported forecast remain in owned counts but are excluded from graphs and quality counts. Required counts stay the same.</p>}
      <div className="inventory-summary">
        <strong>{plan.plannedCount} characters planned · {plan.plannedCount*6} mods required</strong>
        <span>{shortage} missing mods by type · {qualityShortage} needed at GG {qualityTarget}+ (including missing mods)</span>
      </div>
      <p>Required counts use the first-choice set combination and first-choice primary for every character in the game's character catalog,
        including characters you have not unlocked. Set pieces can move between shapes, so these counts are one valid planning
        allocation, favoring types you own and then their GG scores. Counts may shift as your inventory changes; this is not a
        guaranteed minimum shopping list. This long-term plan assumes characters can eventually equip all mod dots and ignores locks.</p>
      <p>Top-build data: {generatedMetaTargets.generatedAt.slice(0,10)}. Quality target changes the gap display, not the required allocation.</p>
      {plan.skipped.length > 0 && <details><summary>{plan.skipped.length} of {plan.characterCount} game characters lack complete top-build data and are excluded from required counts</summary>
        <p>{plan.skipped.map(name).join(', ')}</p></details>}
      {plan.unclassified > 0 && <p>{plan.unclassified} mods could not be classified because their type data is missing.</p>}
      <div className="slice-controls">
        <label>Set{' '}<select value={set} onChange={event => update('set',event.target.value)}>
          <option value="all">All sets</option>{Object.entries(inventorySetNames).map(([value,label]) => <option key={value} value={value}>{label}</option>)}
        </select></label>
        <label>Shape{' '}<select value={shape} onChange={event => update('shape',event.target.value)}>
          <option value="all">All shapes</option>{ggSlots.map(value => <option key={value} value={value}>{value}</option>)}
        </select></label>
        <label>Primary{' '}<select value={primary} onChange={event => update('primary',event.target.value)}>
          <option value="all">All primaries</option>{Array.from(new Set(plan.rows.map(row => row.primary))).sort().map(value => <option key={value}>{value}</option>)}
        </select></label>
        <label>Sort{' '}<select value={sort} onChange={event => update('sort',event.target.value)}>
          <option value="quality">Largest quality gap</option><option value="shortage">Most missing mods</option>
          <option value="most-quality">Most mods at or above quality target</option>
          <option value="least-quality">Fewest mods at or above quality target</option>
          <option value="surplus">Most above requirement</option>
          <option value="required">Most required</option><option value="average">Lowest average GG</option><option value="type">Mod type</option>
        </select></label>
        <label>Quality target{' '}<select value={qualityTarget} onChange={event => update('qualityTarget',Number(event.target.value))}>
          {[40,45,50,55,60,65,70].map(value => <option key={value} value={value}>GG {value}+</option>)}
        </select></label>
        <label><input type="checkbox" checked={requiredOnly} onChange={event => update('requiredOnly',event.target.checked)} /> Required types only</label>
      </div>
      <p role="status">Showing {Math.min(limit,rows.length)} of {rows.length} mod types. Chart heights scale independently; compare the counts alongside each graph.</p>
      <div className="inventory-charts">{rows.slice(0,limit).map(row => <article key={row.key} className="inventory-card">
        <h3>{inventorySetNames[row.set] || row.set} · {row.shape}<span>{row.primary}</span></h3>
        <div className="inventory-chart-body">
          <Distribution row={row} qualityTarget={qualityTarget} scoreLabel={scoreLabel} />
          <dl>
            <dt>Required</dt><dd className="inventory-required">{row.required}</dd>
            <dt>Owned</dt><dd>{row.owned}</dd>
            <dt>Missing</dt><dd>{row.shortage}</dd>
            <dt>Above requirement</dt><dd>{row.surplus}</dd>
            <dt>GG {qualityTarget}+</dt><dd>{row.good} / {row.required} needed</dd>
            <dt>Quality gap</dt><dd>{Math.max(0,row.required-row.good)}</dd>
            <dt>{useSixAAverage ? 'Mean GG at 6A' : 'Average GG'}</dt><dd>{formatGGScore(row.average)}</dd>
          </dl>
        </div>
        {row.unknown > 0 && <p>{row.unknown} owned mods have no supported {useSixAAverage ? '6A forecast' : 'GG score'} and are omitted from the graph.</p>}
        {row.required > 0 && <details><summary>Characters needing this type ({row.required})</summary><p>{row.characters.map(name).join(', ')}</p></details>}
      </article>)}</div>
      {!rows.length && <p>No mod types match these filters.</p>}
      {rows.length > limit && <button type="button" onClick={() => this.setState({limit:limit+24})}>Show 24 more</button>}
    </section>;
  }
}

export default connect(state => ({mods:state.profile.mods,gameSettings:state.gameSettings}))(InventoryPlanning);
