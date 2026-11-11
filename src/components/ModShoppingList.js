import React from 'react';
import {shoppingGGThreshold} from '../utils/buildModShoppingList';

export function shoppingSetTotals(items) {
  const counts = items.slice(0, 100).reduce((totals, item) => {
    totals[item.desiredSet] = (totals[item.desiredSet] || 0) + 1;
    return totals;
  }, {});
  return Object.entries(counts).sort(([left, a], [right, b]) => b - a || left.localeCompare(right));
}

export default function ModShoppingList({ items }) {
  const totals = shoppingSetTotals(items);
  return <section className="mod-shopping-list" aria-label="Priority mod shopping list">
    <h2>Priority mod shopping list</h2>
    {items.length > 0 && <div className="shopping-set-summary">
      <h3>Set totals — first {Math.min(items.length, 100)} shopping items</h3>
      <p>Individual mods to buy or upgrade, grouped by the recommended set.</p>
      <ul>{totals.map(([set, count]) => <li key={set}><strong>{set}</strong>: {count}</li>)}</ul>
    </div>}
    <p>In optimization order, from your highest-priority character down. Aim for the most common primary in each slot (either top choice for arrows),
      the most common complete set combination, and a GG score of {shoppingGGThreshold}+ per mod.
      Slot choices below complete that top-ranked combination with the fewest replacements, even if a faster alternative was optimized.
      GG score uses current secondary stats and primary fit, including for Speed-primary arrows; it is not a future 6A forecast.</p>
    {items.length === 0 ? <p>All optimized mods meet the shopping requirements.</p> :
      <div className="shopping-table-scroll"><table>
        <thead><tr><th>Priority</th><th>Character</th><th>Slot</th><th>Current mod</th><th>Buy / upgrade to</th><th>Reason</th></tr></thead>
        <tbody>{items.map(item => <tr key={item.characterId + '-' + item.slot}>
          <td>{item.priority}</td><td>{item.characterPriority}. {item.characterName}</td><td>{item.slot}</td>
          <td>{item.current}</td><td>{item.desiredSet} · {item.desiredPrimaries.join(' or ')} · GG score {shoppingGGThreshold}+
            {!item.hasMeta && <small> No meta data; checked GG score and missing slots only.</small>}</td>
          <td>{item.reasons.join('; ')}</td>
        </tr>)}</tbody>
      </table></div>}
  </section>;
}
