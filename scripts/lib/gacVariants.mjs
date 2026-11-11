// Explicit cores only: never infer essential members from faction membership alone.
export const variantRules = [
  { id: 'leia', mode: '5v5', core: ['GLLEIA', 'CAPTAINDROGAN', 'R2D2_LEGENDARY'],
    pool: ['CAPTAINREX', 'C3POCHEWBACCA', 'HOTHHAN', 'FULCRUMAHSOKA', 'MONMOTHMA', 'OLDBENKENOBI', 'KANANJARRUSS3'],
    category: 'affiliation_rebels',
    documented: [['CAPTAINREX', 'C3POCHEWBACCA']],
    sources: ['https://www.reddit.com/r/SWGOH/comments/1ufz5kx/gl_leia_team/', 'https://www.reddit.com/r/SWGalaxyOfHeroes/comments/1hgqfyw/can_someone_dumb_down_this_kit_to_me_how_do_i/'],
    note: 'Community-reported core and flex choices. Mixed flex pairs are suggestions, not tested matchups. Captain Rex and Threepio & Chewie may be needed by Phoenix/CLS.' },
  { id: 'enoch', mode: '5v5', core: ['CAPTAINENOCH', 'NIGHTTROOPER', 'DEATHTROOPERPERIDEA'],
    pool: ['STORMTROOPER', 'SCOUTTROOPER_V3'], category: 'affiliation_imperialremnant',
    documented: [['STORMTROOPER', 'SCOUTTROOPER_V3']],
    sources: ['https://forums.ea.com/blog/swgoh-game-info-hub-en/captain-enoch---question-and-answers/4955656/replies/4955683'],
    note: 'Developer-recommended allies; no measured GAC ranking. Night Trooper and Death Trooper (Peridea) conflict with Great Mothers.' }
];

// Manually reviewed roster-building suggestions. These exact mode-specific lineups are
// hypotheses based on the local kits, not claimed to be published or battle-validated teams.
const planningLineups = [
  ['5v5', 'rebel-fill', ['ADMINISTRATORLANDO', 'HOTHLEIA', 'HOTHHAN', 'STORMTROOPERHAN', 'PRINCESSLEIA'], 'Low-confidence Rebel back-wall filler preserving Phoenix, Leia core and attack squads.'],
  ['5v5', 'phoenix', ['HERASYNDULLAS3', 'CAPTAINREX', 'SABINEWRENS3', 'CHOPPERS3', 'EZRABRIDGERS3'], 'Phoenix faction sharing with Captain Rex; verify his GAC upgrades.'],
  ['5v5', 'hunters', ['BOSSK', 'GREEFKARGA', 'THEMANDALORIAN', 'DENGAR', 'IG88'], 'Bounty Hunter contract core; Dengar and IG-88 preserve Boba/Fennec for another squad. R0 makes this low-confidence.'],
  ['3v3', 'ewoks', ['CHIEFCHIRPA', 'PRINCESSKNEESAA', 'WICKET'], 'Ewok trio; verify Chirpa leader and Kneesaa upgrades.'],
  ['3v3', 'cls', ['COMMANDERLUKESKYWALKER', 'CHEWBACCALEGENDARY', 'C3POCHEWBACCA'], 'Rebel assist trio with R0 Chewbacca; missing Han reduces control compared with the standard trio.'],
  ['3v3', 'ackbar', ['ADMIRALACKBAR', 'PRINCESSLEIA', 'STORMTROOPERHAN'], 'Low-confidence Rebel filler; no Ackbar omicron assumed.'],
  ['3v3', 'jedi', ['KELLERANBEQ', 'MASTERQUIGON', 'PADAWANOBIWAN'], 'Galactic Republic Jedi trio; TW-only omicrons do not apply in GAC.'],
  ['3v3', 'shaak', ['SHAAKTI', 'CT7567', 'AHSOKATANO'], 'Low-confidence mixed trio with clone support; reserve for weaker targets.'],
  ['3v3', 'beskar', ['THEMANDALORIANBESKARARMOR', 'KUIIL', 'IG11'], 'Scoundrel core; all R0, so avoid treating it as a top meta counter.'],
  ['3v3', 'hunters', ['BOSSK', 'GREEFKARGA', 'THEMANDALORIAN'], 'Contract-focused attack trio; inspect speed and contract feasibility.'],
  ['3v3', 'empire', ['EMPERORPALPATINE', 'VADER', 'GRANDADMIRALTHRAWN'], 'Empire control trio; verify Vader Merciless Massacre and Palpatine leader zetas.'],
  ['3v3', 'inquisitors', ['FIFTHBROTHER', 'NINTHSISTER', 'SEVENTHSISTER'], 'Pre-Grand-Inquisitor R0 filler; weak-team option, not a meta claim.'],
  ['3v3', 'lando', ['ADMINISTRATORLANDO', 'HOTHLEIA', 'HOTHHAN'], 'Low-confidence Rebel filler; Captain Han provides recovery.']
];
for (const [mode, id, core, note] of planningLineups) variantRules.push({ id, mode, core, pool: [], documented: [],
  sources: ['https://github.com/swgoh-utils/gamedata'], note: `Roster-building judgment from game kits (not source-validated lineup). ${note}` });
variantRules.push({ id: 'vader-solo', mode: '5v5', size: 1, offenseOnly: true, core: ['VADER'], pool: [], documented: [[]],
  sources: ['https://swgoh.gg/tier-list/gac/?season=84&side=offense'],
  note: 'Solo observed in the user-supplied Season 84 offense HTML. No rates inherited. Situational counter only; requires matchup selection and Merciless Massacre zeta.' });

function combinations(items, count) {
  if (count === 0) return [[]];
  return items.flatMap((item, i) => combinations(items.slice(i + 1), count - 1).map(rest => [item, ...rest]));
}
const identity = ids => `${ids[0]}:${ids.slice(1).sort().join(',')}`;
export function findVariants(profile, kits, exact, rules = variantRules, minRelic = 1) {
  const eligible = new Set(profile.characters.filter(u => u.gearLevel === 13 &&
    Number.isInteger(u.relicTier) && u.relicTier >= minRelic + 2).map(u => u.baseId));
  const relic = new Map(profile.characters.map(u => [u.baseId, u.relicTier - 2]));
  const candidates = [], blocked = [], seen = new Set();
  const exactKeys = new Set(Object.entries(exact.sections).flatMap(([section, value]) =>
    value.candidates.map(t => `${section.slice(0, 3)}:${identity(t.members.map(m => m.id))}`)));
  function add(ids, mode, evidence, sources, notes, family, offenseOnly = false) {
    if ((!offenseOnly && ids.length !== Number(mode[0])) || ids.length > Number(mode[0]) || !ids.length || new Set(ids).size !== ids.length || ids.some(id => !kits.characters[id])) return;
    const key = `${mode}:${identity(ids)}`;
    if (seen.has(key) || exactKeys.has(key)) return;
    if (ids.some(id => !eligible.has(id))) return;
    seen.add(key);
    candidates.push({ family, mode, evidence, sources, notes, offenseOnly, tier: null, winRate: null,
      suitability: 'Offense/defense suitability unverified; choose by matchup and abilities.',
      members: ids.map(id => ({ id, name: kits.characters[id].name, relic: relic.get(id) })) });
  }
  for (const rule of rules) {
    const unknown = [...rule.core, ...rule.pool].filter(id => !kits.characters[id]);
    if (unknown.length) throw new Error(`Unknown IDs in variant rule ${rule.id}: ${unknown.join(', ')}`);
    const missingCore = rule.core.filter(id => !eligible.has(id));
    const pool = rule.pool.filter(id => eligible.has(id) && !rule.core.includes(id) &&
      (!rule.category || kits.characters[id].categories.includes(rule.category)));
    const count = (rule.size ?? Number(rule.mode[0])) - rule.core.length;
    if (count < 0 || new Set(rule.core).size !== rule.core.length) throw new Error(`Invalid core: ${rule.id}`);
    if (missingCore.length || pool.length < count) {
      blocked.push({ family: rule.id, mode: rule.mode, missingCore,
        eligibleFlex: pool, neededFlex: count, notes: rule.note });
      continue;
    }
    for (const flex of combinations(pool, count)) {
      const documented = rule.documented.some(pair => [...pair].sort().join(',') === [...flex].sort().join(','));
      add([...rule.core, ...flex], rule.mode, documented ? 'Documented alternate (not battle-validated)' : 'Suggested substitution (untested)',
        rule.sources, rule.note, rule.id, rule.offenseOnly);
    }
  }
  // These are general game examples, not GAC tiers. Never truncate 5-unit examples into invented 3v3 squads.
  for (const character of Object.values(kits.characters)) for (const ids of character.recommendedTeams || []) {
    if (ids.length === 5) add(ids, '5v5', 'Game example squad (GAC suitability unverified)',
      [kits.source.url], 'Exact example from the pinned game data; may be dated or intended for other modes.', ids[0]);
  }
  const priority = t => t.evidence.startsWith('Documented') ? 0 : t.evidence.startsWith('Suggested') ? 1 : 2;
  candidates.sort((a, b) => priority(a) - priority(b) || a.family.localeCompare(b.family) || identity(a.members.map(m => m.id)).localeCompare(identity(b.members.map(m => m.id))));
  for (const candidate of candidates) {
    const ids = new Set(candidate.members.map(m => m.id));
    candidate.conflicts = Object.entries(exact.sections).filter(([key]) => key.startsWith(candidate.mode)).flatMap(([key, section]) =>
      section.candidates.filter(t => t.members.some(m => ids.has(m.id))).map(t => ({ section: key, team: t.name,
        shared: t.members.filter(m => ids.has(m.id)).map(m => m.name) })));
    candidate.overlappingVariants = candidates.filter(other => other !== candidate && other.mode === candidate.mode &&
      other.members.some(m => ids.has(m.id))).map(other => other.members.map(m => m.id));
  }
  return { minRelic, candidates, blocked, gameDataSource: kits.source, rules };
}

export function variantsMarkdown(result, top = 20) {
  const clean = s => String(s).replace(/\|/g, '\\|').replace(/[\r\n]+/g, ' ');
  let out = '\n## Additional roster-compatible builds\n\nThese are supplemental options, not tier-ranked recommendations. No source tier or win rate is inherited. Offense/defense suitability, required ability upgrades, and datacrons need review. The generator uses explicit cores and allowlisted flex characters, not arbitrary faction combinations. Game examples retain their original five members and leader.\n\n';
  out += `${result.candidates.length} additional builds at R${result.minRelic}+, showing up to ${top}. Variants overlap and cannot all be deployed together; all overlaps and sources are in report.json.\n\n`;
  out += '| Mode | Evidence | Lineup (leader first) | Notes / sources |\n| --- | --- | --- | --- |\n';
  for (const t of result.candidates.slice(0, top)) out += `| ${t.mode} | ${t.evidence} | ${clean(t.members.map(m => `${m.name} R${m.relic}`).join(', '))} | ${clean(t.notes)} ${t.sources.map((url, i) => `[Source ${i + 1}](${url})`).join(' ')} ${t.conflicts.length ? `Conflicts with catalog teams: ${clean([...new Set(t.conflicts.map(c => c.team))].join(', '))}.` : ''} |\n`;
  if (result.r0Additional) out += `\nIncluding G13/R0 would add ${result.r0Additional.length} more supplemental builds. These are not included in the R${result.minRelic}+ list. Use --min-relic 0 to review them; the exact catalog lists will also be recalculated.\n`;
  return out;
}
