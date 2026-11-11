export const META_URL = 'https://ahnaldt101.com/swgoh/teams';
export const PROFILE_URL = 'https://api.mods-optimizer.swgoh.grandivory.com/hotutils-v2/';

// Parse data only. Never execute JavaScript downloaded from the ranking site.
export function parseMeta(html) {
  const match = html.match(/\bconst D\s*=\s*(\{[^\r\n]*\});?\s*<\/script>/);
  if (!match) throw new Error('Team source format changed: embedded JSON catalog not found.');
  const data = JSON.parse(match[1]);
  if (!Array.isArray(data.teams) || !Array.isArray(data.bands)) throw new Error('Invalid team catalog.');
  for (const mode of ['5v5', '3v3']) {
    if (!data.teams.some(t => t.mode === mode)) throw new Error(`Catalog missing ${mode}; refusing partial report.`);
  }
  return data;
}

const nameKey = s => s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
export function analyzeRoster(profile, catalog, characters, minRelic = 1) {
  if (!Array.isArray(profile.characters) || !profile.characters.length) throw new Error('Empty or invalid roster.');
  const roster = new Map();
  for (const unit of profile.characters) {
    if (!unit.baseId || roster.has(unit.baseId)) throw new Error('Missing or duplicate roster character ID.');
    // HotUtils uses the game enum: 2 = R0, 3 = R1, ... 12 = R10.
    const relic = unit.gearLevel === 13 && Number.isInteger(unit.relicTier) && unit.relicTier >= 2
      ? unit.relicTier - 2 : null;
    roster.set(unit.baseId, { id: unit.baseId, name: characters[unit.baseId]?.name || unit.baseId,
      gear: unit.gearLevel, relic });
  }
  const names = new Map();
  for (const [id, c] of Object.entries(characters)) {
    const key = nameKey(c.name);
    names.set(key, names.has(key) ? null : id); // Ambiguous names must never silently select a character.
  }
  const sections = {};
  for (const mode of ['5v5', '3v3']) for (const side of ['offense', 'defense']) {
    const prefix = side === 'offense' ? 'off' : 'def';
    const candidates = [], excluded = [];
    for (const team of catalog.teams.filter(t => t.mode === mode)) {
      const band = team[`${prefix}B`];
      if (!Number.isInteger(band) || band < 0 || band >= catalog.bands.length) continue;
      if (!Array.isArray(team.units) || !team.units.length) throw new Error(`Invalid lineup: ${team.name}`);
      const members = team.units.map(u => {
        const id = u.n && !u.flex ? names.get(nameKey(u.n)) : null;
        const owned = id && roster.get(id);
        return { id: id || null, name: u.n || 'Flex slot', relic: owned?.relic ?? null,
          reason: u.flex || !u.n ? 'unspecified flex slot' : !id ? 'unmapped/ambiguous character name'
            : !owned ? 'not unlocked' : owned.relic === null || owned.relic < minRelic ? `below R${minRelic}` : null };
      });
      const issues = members.filter(m => m.reason).map(m => `${m.name}: ${m.reason}`);
      const size = Number(mode[0]);
      if (members.length > size) issues.push(`source lists ${members.length} members for ${mode}; manual lineup selection required`);
      if (side === 'defense' && members.length !== size) issues.push('defense requires a full squad');
      const ids = members.map(m => m.id).filter(Boolean);
      if (new Set(ids).size !== ids.length) issues.push('duplicate character in source lineup');
      const groups = mode === '3v3' ? team.omi3Groups : team.omiGroups;
      const row = { name: team.name, band, tier: catalog.bands[band], members,
        leader: members[0], undersized: members.length < size,
        source: `${META_URL}?t=${encodeURIComponent(team.name)}&m=${mode}`,
        notes: team.note || '', recommendedOmicrons: (groups || []).flatMap(g => g[1].map(a => `${a.c}: ${a.a}`)),
        issues };
      (issues.length ? excluded : candidates).push(row);
    }
    // Tier is the source's current rating. Legacy numeric scores can disagree, so do not mix them in.
    candidates.sort((a, b) => a.band - b.band || a.name.localeCompare(b.name));
    excluded.sort((a, b) => a.issues.length - b.issues.length || a.band - b.band || a.name.localeCompare(b.name));
    for (const team of candidates) team.overlaps = candidates.filter(other => other !== team &&
      other.members.some(m => team.members.some(n => n.id === m.id))).map(t => t.name);
    sections[`${mode}-${side}`] = { candidates, excluded };
  }
  return { relicCharacters: [...roster.values()].filter(u => u.relic !== null && u.relic >= minRelic), sections };
}

const cell = value => String(value).replace(/\|/g, '\\|').replace(/[\r\n]+/g, ' ');
export function markdown(report, top) {
  let out = `# Reliced GAC teams — ${cell(report.player)} (${report.allyCode})\n\n`;
  out += `Fetched: ${report.fetchedAt}. Minimum: R${report.minRelic}. Eligible characters: ${report.relicCharacters.length}.\n\n`;
  out += `[Catalog source](${META_URL}): expert tiers, not measured win rates. Alternate builds and game examples are included in the same lists with evidence labels and no inherited tier. Their presence in a side's options is not proof of that side's performance. Source publication date is unknown; fetch time is not publication time.\n\n`;
  out += `This is the exact public-provider response saved at fetch time, not a guaranteed live or GAC-lock roster. Ability upgrades, datacrons, and matchup readiness are not verified. Public mods may exclude unequipped mods.\n\n`;
  out += `The four lists are independent options, not a combined deployment plan. Characters cannot be reused between offense and defense in the same round. Undersized offense entries retain the source lineup.\n\n`;
  for (const [key, section] of Object.entries(report.sections)) {
    out += `## ${key}\n\n${section.candidates.length} eligible teams; showing up to ${top}. First member is the source leader.\n\n`;
    out += '| Tier / evidence | Team | Members | Notes |\n| --- | --- | --- | --- |\n';
    for (const t of section.candidates.slice(0, top)) {
      const notes = [t.undersized ? 'Undersized offense' : '', t.notes,
        t.overlaps.length ? `Overlaps: ${t.overlaps.join(', ')}` : '',
        t.recommendedOmicrons.length ? `Verify omicrons: ${t.recommendedOmicrons.join('; ')}` : ''].filter(Boolean).join('; ');
      out += `| ${cell(t.tier || t.evidence || 'Unrated')} | [${cell(t.name)}](${t.source}) | ${cell(t.members.map(m => `${m.name} R${m.relic}`).join(', '))} | ${cell(notes)} |\n`;
    }
    out += '\nClosest excluded teams (fewest issues first):\n\n';
    for (const t of section.excluded.slice(0, 10)) out += `- ${cell(t.name)} (${t.tier}): ${cell(t.issues.join('; '))}\n`;
    out += '\n';
  }
  return out;
}
