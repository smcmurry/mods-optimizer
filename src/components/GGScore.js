import React from 'react';
import { connect } from 'react-redux';
import memoize from 'memoize-one';
import { ggScore, characterGGScore, formatGGScore } from '../utils/ggScore';

export function GGScore({mod}) {
  const result = ggScore(mod);
  return <div className="gg-score" style={{margin: '.4em 0', fontSize: '.85em'}}>
    <strong>GG-style score: {formatGGScore(result.score)}{result.score !== null && ' / 100'}</strong>
    {result.primaryFit !== null && result.primaryFit < 1 &&
      <div>Primary fit ×{result.primaryFit.toFixed(2)}</div>}
    <details onDoubleClick={event => event.stopPropagation()}>
      <summary>{result.grade || 'Grade uncalibrated'}</summary>
      <p>Uses the supplied GG weights and primary-fit tables. Scores are approximate because
        the published weights are rounded and roll maxima use this app’s data.
        Twelve maxed secondary rolls define the ceiling for the same set and primary.
        Only a perfect mod displays 100.</p>
      <p>Grades need frozen cutoffs for each set and slot, with speed-primary arrows
        ranked separately. No cutoffs have been supplied yet.</p>
      {result.score === null && <p>This mod has unsupported or incomplete stat data.</p>}
    </details>
  </div>;
}

export function CharacterGGScoreLabel({score}) {
  return <div style={{fontSize: '.8em'}} title="GG-style average of the six equipped slots; empty slots count as zero. Uses rounded published weights. An em dash means invalid mod data.">
    GG-style score: {formatGGScore(score)}
  </div>;
}
const scoresByCharacter = memoize(mods => {
  const grouped = new Map();
  mods.forEach(mod => {
    if (!mod.characterID) return;
    if (!grouped.has(mod.characterID)) grouped.set(mod.characterID, []);
    grouped.get(mod.characterID).push(mod);
  });
  const scores = new Map();
  grouped.forEach((equipped, id) => scores.set(id, characterGGScore(equipped)));
  return scores;
});
export const CharacterGGScore = connect((state, {characterId}) => {
  const scores = scoresByCharacter(state.profile.mods);
  return {score: scores.has(characterId) ? scores.get(characterId) : 0};
})(CharacterGGScoreLabel);
