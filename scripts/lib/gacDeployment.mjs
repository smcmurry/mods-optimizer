const keyOf = t => `${t.members[0].id}:${t.members.slice(1).map(m => m.id).sort().join(',')}`;

export function mergeTeamLists(exact, variants) {
  const sections = structuredClone(exact.sections);
  for (const [key, section] of Object.entries(sections)) {
    for (const team of section.candidates) {
      team.evidence = 'Ranked catalog lineup';
      team.sources = [team.source];
      team.assignmentConfidence = 'Catalog supports this side; personal abilities still unverified.';
    }
    for (const variant of variants.candidates.filter(t => key.startsWith(t.mode))) {
      if (key.endsWith('defense') && variant.offenseOnly) continue;
      if (section.candidates.some(t => keyOf(t) === keyOf(variant))) continue;
      section.candidates.push({ ...variant, name: `${variant.members[0].name} variant`,
        leader: variant.members[0], source: variant.sources[0], band: null,
        recommendedOmicrons: [], undersized: variant.members.length < Number(variant.mode[0]), issues: [],
        assignmentConfidence: 'Available option on this side; suitability is an unverified planning judgment.' });
    }
    for (const team of section.candidates) team.overlaps = section.candidates.filter(t => t !== team &&
      t.members.some(m => team.members.some(n => n.id === m.id))).map(t => t.name);
  }
  return sections;
}

// Transparent planning preferences, not measured battle strength or source tiers.
// Keep Leia available to answer an opponent's strongest defense and use Great Mothers as the defensive anchor.
const preference = {
  GLLEIA: { side: 'offense', value: 90, reason: 'Keep your Galactic Legend available for the hardest opposing defense.' },
  GREATMOTHERS: { side: 'defense', value: 75, reason: 'Defensive anchor; preserves Leia for offense.' },
  WAMPA: { side: 'offense', value: 30, reason: 'Solo counter option; verify the omicron and target matchup.' },
  VADER: { side: 'offense', value: 24, reason: 'Situational solo counter; verify Merciless Massacre zeta and avoid unsuitable opponents.' },
  CAPTAINENOCH: { side: 'defense', value: 40, reason: 'Defensive remnant option; in 5v5 it competes with Great Mothers for troopers.' },
  HERASYNDULLAS3: { side: 'offense', value: 40, reason: 'Keep Phoenix under manual control; verify Captain Rex upgrades.' },
  KELLERANBEQ: { side: 'offense', value: 40, reason: 'Use this Jedi lineup under manual control; do not assume TW omicrons apply in GAC.' },
  THEMANDALORIANBESKARARMOR: { side: 'offense', value: 30, reason: 'Manual control for timing; R0 members make this a lower-confidence attack option.' },
  FIFTHBROTHER: { side: 'defense', value: 12, reason: 'Low-confidence filler only; this is the pre-Grand-Inquisitor lineup.' }
  ,BOSSK: { side: 'offense', value: 28, reason: 'Keep contract and disintegrate timing under manual control; inspect speeds.' }
  ,EMPERORPALPATINE: { side: 'offense', value: 30, reason: 'Reserve Empire control for a suitable counter; verify essential zetas.' }
  ,COMMANDERLUKESKYWALKER: { side: 'offense', value: 30, reason: 'Use the Rebel assist trio into a selected matchup; R0 Chewbacca is fragile.' }
  ,CHIEFCHIRPA: { side: 'defense', value: 20, reason: 'Reliced Ewok trio for secondary defense; ability upgrades remain unverified.' }
  ,ADMIRALACKBAR: { side: 'defense', value: 10, reason: 'Low-confidence back-wall filler; do not assume an omicron is present.' }
  ,ADMINISTRATORLANDO: { side: 'defense', value: 10, reason: 'Lower-priority back-wall filler that preserves core attack teams.' }
};
function value(team, side) {
  const policy = preference[team.members[0].id];
  const base = policy?.value ?? (team.band !== null && team.band !== undefined ? 65 - team.band * 10 : 10);
  const evidence = team.evidence.startsWith('Documented') ? 3 : team.evidence.startsWith('Suggested') ? 0 : team.evidence.startsWith('Game') ? -2 : 4;
  return base + evidence + (policy?.side === side ? 12 : 0);
}
export function planDeployment(sections, mode, requestedDefense = null) {
  // With unknown board size, this is explicitly a provisional two-defense-squad core, not a full-board claim.
  const defenseTarget = requestedDefense ?? 2;
  if (!Number.isInteger(defenseTarget) || defenseTarget < 0) throw new Error('Defense count must be a non-negative integer.');
  const groups = new Map();
  for (const side of ['offense', 'defense']) for (const team of sections[`${mode}-${side}`].candidates) {
    if (side === 'defense' && team.members.length !== Number(mode[0])) continue;
    const key = keyOf(team), entry = groups.get(key) || [];
    const policy = preference[team.members[0].id];
    entry.push({ side, team, value: value(team, side), reason: policy && policy.side !== side
      ? `Allocated to ${side} to meet the board requirement while preserving the other selected squads; lower-confidence placement. ${team.notes || ''}`
      : policy?.reason || 'Lower-confidence roster filler from the available source; inspect abilities and opponent before use.' });
    groups.set(key, entry);
  }
  let states = [{ used: new Set(), picks: [], defenseCount: 0, score: 0 }];
  // Bounded beam search jointly allocates both sides, rather than selecting each independently.
  for (const options of groups.values()) {
    const next = [...states];
    for (const state of states) for (const option of options) {
      if (option.side === 'defense' && state.defenseCount >= defenseTarget) continue;
      const ids = option.team.members.map(m => m.id);
      if (ids.some(id => state.used.has(id))) continue;
      next.push({ used: new Set([...state.used, ...ids]), picks: [...state.picks, option],
        defenseCount: state.defenseCount + Number(option.side === 'defense'), score: state.score + option.value });
    }
    const unique = new Map();
    for (const state of next) {
      const signature = `${state.defenseCount}:${[...state.used].sort().join(',')}`;
      if (!unique.has(signature) || unique.get(signature).score < state.score) unique.set(signature, state);
    }
    // Retain separate capacities so an early high-scoring attack doesn't erase all defensive solutions.
    states = [];
    for (let d = 0; d <= defenseTarget; d++) states.push(...[...unique.values()].filter(s => s.defenseCount === d)
      .sort((a, b) => b.score - a.score).slice(0, 250));
  }
  states.sort((a, b) => b.defenseCount - a.defenseCount || b.score - a.score);
  const chosen = states[0];
  const output = { mode, provisional: requestedDefense === null, defenseTarget,
    unfilledDefense: defenseTarget - chosen.defenseCount,
    method: 'Bounded heuristic search; preferences are planning judgments, not battle predictions or guaranteed optimal allocation.',
    defense: chosen.picks.filter(p => p.side === 'defense'), offense: chosen.picks.filter(p => p.side === 'offense') };
  output.offenseShortfall = Math.max(0, defenseTarget - output.offense.length);
  const used = output.defense.concat(output.offense).flatMap(p => p.team.members.map(m => m.id));
  if (new Set(used).size !== used.length) throw new Error('Deployment reused a character.');
  return output;
}

export function deploymentMarkdown(plans) {
  let out = '\n## Recommended deployment\n\nEach mode is a separate plan. Within a mode, every character is used at most once across offense and defense. These are roster-based planning recommendations, not opponent-specific counter guarantees. Verify omicrons, zetas and datacrons before locking defense. Fleets are outside this report.\n\n';
  for (const plan of Object.values(plans)) {
    out += `### ${plan.mode}\n\n`;
    if (plan.provisional) out += '**Provisional board size:** two defense squads assumed because your defense-slot count is unknown. This is a core split, not a complete board. Pass the actual defense count to generate the full allocation.\n\n';
    if (plan.unfilledDefense) out += `**Shortfall:** ${plan.unfilledDefense} defense slots cannot be filled from the available eligible team library without reuse.\n\n`;
    if (plan.offenseShortfall) out += `**Offense depth:** ${plan.offenseShortfall} fewer attack squads than opposing character defenses. No full-clear claim; expand the library or use lower-gear teams to cover the gap.\n\n`;
    for (const side of ['defense', 'offense']) {
      out += `**${side === 'defense' ? 'Place on defense' : 'Reserve for offense'}**\n\n`;
      if (!plan[side].length) out += 'No eligible non-overlapping squad available.\n\n';
      plan[side].forEach((p, i) => {
        out += `${i + 1}. **${p.team.members.map(m => `${m.name} R${m.relic}`).join(' · ')}** — ${p.reason} Evidence: ${p.team.evidence}.\n`;
      });
      out += '\n';
    }
  }
  return out;
}
