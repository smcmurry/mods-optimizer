import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { parseSwgohTierList } from './lib/swgohTierList.mjs';
import { analyzeRoster } from './lib/gacRoster.mjs';

async function main() {
  const opts = {}, args = process.argv.slice(2);
  for (let i = 0; i < args.length; i += 2) {
    if (!['--html', '--snapshot', '--ally-code', '--min-relic', '--output'].includes(args[i]) || !args[i + 1])
      throw new Error('Usage: npm run gac:import -- --html <saved-response.html> [--snapshot <run-directory>] [--ally-code 414556856] [--min-relic 1]');
    opts[args[i].slice(2)] = args[i + 1];
  }
  if (!opts.html) throw new Error('--html is required.');
  const allyCode = opts['ally-code'] || '414556856';
  if (!/^\d{9}$/.test(allyCode)) throw new Error('Invalid ally code.');
  const minRelic = Number(opts['min-relic'] ?? 1);
  if (!Number.isInteger(minRelic) || minRelic < 0 || minRelic > 10) throw new Error('Minimum relic must be 0–10.');
  const root = fileURLToPath(new URL('../', import.meta.url));
  const base = path.join(root, 'reports/gac-roster', allyCode);
  let snapshot = opts.snapshot;
  if (!snapshot) {
    const runs = (await fs.readdir(base, { withFileTypes: true })).filter(x => x.isDirectory() && /^\d{4}-/.test(x.name)).map(x => x.name).sort().reverse();
    for (const run of runs) {
      try { await fs.access(path.join(base, run, 'source.json')); snapshot = path.join(base, run); break; } catch {}
    }
  }
  if (!snapshot) throw new Error('No saved roster found. Run npm run gac:teams first.');
  const read = file => fs.readFile(path.join(snapshot, file), 'utf8');
  const provenance = JSON.parse(await read('source.json'));
  const rawRoster = await read('roster-response.json'), rawNames = await read('character-names.json');
  const hash = value => createHash('sha256').update(value).digest('hex');
  for (const [file, raw] of [['roster-response.json', rawRoster], ['character-names.json', rawNames]])
    if (hash(raw) !== provenance.hashes[file]) throw new Error(`Snapshot checksum mismatch: ${file}`);
  const profile = JSON.parse(rawRoster).mods?.profiles?.find(p => String(p.allyCode) === allyCode);
  if (!profile) throw new Error('Roster does not match requested ally code.');
  const html = await fs.readFile(opts.html, 'utf8'), catalog = parseSwgohTierList(html);
  const section = analyzeRoster(profile, catalog, JSON.parse(rawNames), minRelic).sections[`${catalog.mode}-${catalog.side}`];
  for (const row of [...section.candidates, ...section.excluded]) {
    const original = catalog.teams.find(t => t.name === row.name);
    row.source = original.stats.explorerUrl || catalog.source;
    row.stats = original.stats;
  }
  section.candidates.sort((a, b) => a.band - b.band || b.stats.elo - a.stats.elo);
  const importedAt = new Date().toISOString();
  const output = path.resolve(opts.output || path.join(base, `swgoh-${importedAt.replace(/[:.]/g, '-')}`));
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.mkdir(output);
  const report = { allyCode, player: profile.name, minRelic, importedAt, rosterFetchedAt: provenance.rosterFetchedAt,
    snapshot: path.resolve(snapshot), source: catalog.source, sourceTitle: catalog.title, mode: catalog.mode,
    side: catalog.side, season: catalog.season, league: catalog.league, htmlSha256: hash(html), totalEntries: catalog.teams.length, ...section };
  const clean = s => String(s).replace(/\|/g, '\\|').replace(/[\r\n]+/g, ' ');
  let md = `# ${catalog.mode} ${catalog.side} — ${clean(profile.name)}\n\nSource: [SWGOH.GG Season ${catalog.season}](${catalog.source}); ${catalog.league}. Imported ${importedAt}. Source download time unknown.\n\n`;
  md += `Roster ${allyCode}, fetched ${report.rosterFetchedAt}; minimum R${minRelic}. ${section.candidates.length} of ${catalog.teams.length} supplied lineups qualify.\n\n`;
  md += 'This saved page contains representative lineups, not all builds advertised by its build counts. Other modes/sides are not included. Ranked by source tier, then Elo. Rates reflect the source population, not a prediction for your roster. Datacrons, abilities, and GAC-lock state are unverified. Overlapping teams are alternatives. First member is leader.\n\n';
  md += '## Roster matches (not automatic recommendations)\n\nZero-win entries and tiny samples can appear in the source. A match only confirms relic ownership; in particular, the Hermit Yoda solo entry is not a viable attack recommendation.\n\n';
  md += '| Tier | Leader | Elo | Rate | Battles | Reliced lineup |\n| --- | --- | ---: | ---: | ---: | --- |\n';
  for (const row of section.candidates) md += `| ${row.tier} | [${clean(row.leader.name)}](${row.source}) | ${row.stats.elo} | ${row.stats.winRate}% | ${row.stats.battlesDisplayed} | ${clean(row.members.map(m => `${m.name} R${m.relic}`).join(', '))} |\n`;
  md += '\n## Excluded entries\n\n';
  for (const row of section.excluded) md += `- ${clean(row.name)} (${row.tier}): ${clean(row.issues.join('; '))}\n`;
  await fs.writeFile(path.join(output, 'meta-source.html'), html);
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
  await fs.writeFile(path.join(output, 'report.md'), md);
  console.log(JSON.stringify({ report: path.join(output, 'report.md'), total: catalog.teams.length,
    eligible: section.candidates.map(t => ({ leader: t.leader.name, tier: t.tier, elo: t.stats.elo })) }, null, 2));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
