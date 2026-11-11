import React from 'react';

const format = value => Number.isFinite(value) ? value.toLocaleString(undefined,
  { maximumFractionDigits: 2 }) : 'Unavailable';

export default function ShipPreferenceImpact({ assignments, gameSettings }) {
  const rows = assignments.filter(row => row && row.shipPreferenceImpact);
  if (!rows.length) return null;
  const total = rows.reduce((sum, row) => sum + row.shipPreferenceImpact.loss, 0);
  const others = rows.filter(row => !row.shipPreferenceImpact.shipFocused)
    .reduce((sum, row) => sum + row.shipPreferenceImpact.loss, 0);
  return <section className="ship-preference-impact" aria-label="Ship mod preference cost">
    <h3>6-dot ship preference cost</h3>
    <p>Overall value lost: <strong>{format(total)}</strong>. Other characters: <strong>{format(others)}</strong>.</p>
    <p>Compared with a fresh optimization with ship preference off. Values use each character's
      saved scoring target; negative losses are gains. The total is a sum of optimizer scores,
      not a measure of roster strength. Assignments use the lowest-cost legal replacements
      found by a local search.</p>
    <details>
      <summary>Value lost for each character ({rows.length})</summary>
      <table>
        <thead><tr><th>Character</th><th>Preference off</th><th>Preference on</th><th>Value lost</th></tr></thead>
        <tbody>{rows.map((row, index) => {
          const impact = row.shipPreferenceImpact;
          return <tr key={index}>
            <td>{(gameSettings[row.id] || {}).name || row.id}
              {impact.shipFocused ? ` (ship: ${impact.sixDotCount}/6)` : ''}</td>
            <td>{format(impact.before)}</td><td>{format(impact.after)}</td><td>{format(impact.loss)}</td>
          </tr>;
        })}</tbody>
      </table>
    </details>
  </section>;
}
