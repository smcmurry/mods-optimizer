import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { META_URL, PROFILE_URL, parseMeta, analyzeRoster, markdown } from './lib/gacRoster.mjs';
import { findVariants, variantRules } from './lib/gacVariants.mjs';
import { mergeTeamLists, planDeployment, deploymentMarkdown } from './lib/gacDeployment.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const help = `Usage: node scripts/findGacTeams.mjs [--ally-code 414556856] [--min-relic 0] [--top 1000]
  [--output directory] [--replay previous-run-directory] [--defense-5v5 count] [--defense-3v3 count]
Downloads a public roster and current AhnaldT101 team catalog. Writes raw sources,
SHA-256 provenance, normalized roster, integrated GAC lists, and non-overlapping deployment plans. Includes R0.
Replay uses saved sources without network access. Requires Node 20+. No account login needed.`;
async function main() {
  const args = process.argv.slice(2), opts = {};
  if (args.includes('--help')) { console.log(help); return; }
  for (let i = 0; i < args.length; i += 2) {
    if (!['--ally-code', '--min-relic', '--top', '--output', '--replay', '--defense-5v5', '--defense-3v3'].includes(args[i]) || !args[i + 1] || args[i + 1].startsWith('--')) throw new Error(help);
    opts[args[i].slice(2)] = args[i + 1];
  }
  const allyCode = (opts['ally-code'] || '414556856').replace(/[ -]/g, '');
  const minRelic = Number(opts['min-relic'] ?? 0), top = Number(opts.top ?? 1000);
  // User's current league: Bronzium. Explicit counts override this board size after promotion.
  const defenseCounts = Object.fromEntries(['5v5', '3v3'].map(mode => [mode, opts[`defense-${mode}`] === undefined ? (mode === '5v5' ? 5 : 7) : Number(opts[`defense-${mode}`])]));
  for (const count of Object.values(defenseCounts)) if (count !== null && (!Number.isInteger(count) || count < 0 || count > 50)) throw new Error('Defense counts must be integers from 0 to 50.');
  if (!/^\d{9}$/.test(allyCode)) throw new Error('Ally code must have nine digits.');
  if (!Number.isInteger(minRelic) || minRelic < 0 || minRelic > 10) throw new Error('--min-relic must be 0–10.');
  if (!Number.isInteger(top) || top < 1) throw new Error('--top must be a positive integer.');
  const fetchedAt = new Date().toISOString();
  const output = path.resolve(opts.output || path.join(root, 'reports/gac-roster', allyCode, fetchedAt.replace(/[:.]/g, '-')));
  // A fresh directory prevents accidentally overwriting a historical snapshot.
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.mkdir(output);
  const readJson = async file => JSON.parse(await fs.readFile(file, 'utf8'));
  const save = (file, data) => fs.writeFile(path.join(output, file), data);
  const hashes = {}, provenance = { allyCode, fetchedAt, mode: opts.replay ? 'replay' : 'live-fetch', sources: {}, hashes };
  async function source(filename, url, init = {}) {
    let raw;
    if (opts.replay) raw = await fs.readFile(path.resolve(opts.replay, filename), 'utf8');
    else {
      const response = await fetch(url, { ...init, signal: AbortSignal.timeout(120000) });
      if (!response.ok) throw new Error(`HTTP ${response.status} from ${url}; no stale fallback used.`);
      raw = await response.text();
      provenance.sources[filename] = { url, receivedAt: new Date().toISOString(), lastModified: response.headers.get('last-modified') };
    }
    hashes[filename] = createHash('sha256').update(raw).digest('hex');
    await save(filename, raw);
    return raw;
  }
  console.log(`Fetching roster ${allyCode} and team catalog…`);
  const raw = await source('roster-response.json', PROFILE_URL, {
    method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'getprofile', sessionId: null, payload: { allyCode } }) });
  const response = JSON.parse(raw);
  if (response.errorMessage) throw new Error(response.errorMessage);
  const profile = response.mods?.profiles?.find(p => String(p.allyCode) === allyCode);
  if (!profile) throw new Error('Provider did not return the requested ally code.');
  const catalog = parseMeta(await source('meta-source.html', META_URL));
  let kitsRaw;
  if (opts.replay) kitsRaw = await fs.readFile(path.resolve(opts.replay, 'character-names.json'), 'utf8');
  else {
    const kits = await readJson(path.join(root, 'src/constants/generatedCharacterKits.json'));
    kitsRaw = JSON.stringify(Object.fromEntries(Object.entries(kits.characters).map(([id, c]) => [id, { name: c.name }])));
  }
  await save('character-names.json', kitsRaw);
  hashes['character-names.json'] = createHash('sha256').update(kitsRaw).digest('hex');
  let snapshotTime = provenance.sources['roster-response.json']?.receivedAt;
  if (opts.replay) {
    const original = await readJson(path.resolve(opts.replay, 'source.json'));
    for (const [name, hash] of Object.entries(hashes)) if (original.hashes[name] !== hash) throw new Error(`Replay checksum mismatch: ${name}`);
    provenance.original = original;
    snapshotTime = original.rosterFetchedAt;
  }
  provenance.rosterFetchedAt = snapshotTime;
  const result = analyzeRoster(profile, catalog, JSON.parse(kitsRaw), minRelic);
  // Freeze all variant inputs separately so future replays retain the same rules and game examples.
  let variantInput, variantInputOrigin = 'current local game data and reviewed rules';
  if (opts.replay) {
    const original = await readJson(path.resolve(opts.replay, 'source.json'));
    if (original.hashes['variant-input.json']) {
      const saved = await fs.readFile(path.resolve(opts.replay, 'variant-input.json'), 'utf8');
      if (createHash('sha256').update(saved).digest('hex') !== original.hashes['variant-input.json']) throw new Error('Variant input checksum mismatch');
      variantInput = JSON.parse(saved);
      variantInputOrigin = 'frozen replay input';
    } else variantInputOrigin = 'legacy snapshot expanded with current local game data and reviewed rules';
  }
  if (!variantInput) {
    const kits = await readJson(path.join(root, 'src/constants/generatedCharacterKits.json'));
    variantInput = { rules: variantRules, kits: { source: kits.source, characters: Object.fromEntries(
      Object.entries(kits.characters).map(([id, c]) => [id, { name: c.name, categories: c.categories, recommendedTeams: c.recommendedTeams }])) } };
  }
  const variantRaw = JSON.stringify(variantInput);
  await save('variant-input.json', variantRaw);
  hashes['variant-input.json'] = createHash('sha256').update(variantRaw).digest('hex');
  provenance.variantInputOrigin = variantInputOrigin;
  const variants = findVariants(profile, variantInput.kits, result, variantInput.rules, minRelic);
  if (minRelic > 0) {
    const r0Exact = analyzeRoster(profile, catalog, JSON.parse(kitsRaw), 0);
    const r0 = findVariants(profile, variantInput.kits, r0Exact, variantInput.rules, 0);
    variants.r0Additional = r0.candidates.filter(t => t.members.some(m => m.relic < minRelic));
  }
  const report = { allyCode, player: profile.name, fetchedAt: snapshotTime, generatedAt: fetchedAt,
    minRelic, rankingSource: META_URL, ...result, variants };
  report.sections = mergeTeamLists(result, variants);
  report.deployment = Object.fromEntries(['5v5', '3v3'].map(mode => [mode, planDeployment(report.sections, mode, defenseCounts[mode])]));
  report.board = { league: 'Bronzium', defenseCounts, source: 'https://swgoh.wiki/wiki/Grand_Arena_Championship#Defense_Phase',
    note: 'Character squads only. Bronzium also requires one defense fleet; fleet selection is not included.' };
  await save('source.json', JSON.stringify(provenance, null, 2));
  await save('report.json', JSON.stringify(report, null, 2));
  await save('report.md', `# Bronzium GAC plan — ${profile.name}\n\n[Board requirements](${report.board.source}): 5 character defenses in 5v5; 7 in 3v3; one defense fleet (not planned here). Explicit count flags override these defaults.\n` + deploymentMarkdown(report.deployment) + markdown(report, top));
  for (const [key, value] of Object.entries(report.sections)) console.log(`${key}: ${value.candidates.length} relic-eligible teams`);
  console.log(`Additional builds: ${variants.candidates.length}; R0 additional options: ${variants.r0Additional?.length || 0}`);
  console.log(`Report: ${path.join(output, 'report.md')}`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
