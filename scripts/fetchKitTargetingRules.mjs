import fs from 'node:fs/promises';
import { brotliDecompressSync } from 'node:zlib';
import { createHash } from 'node:crypto';

// Extend the already pinned snapshot; never silently refresh its revision.
const directory = 'data/gameData-cache';
const source = JSON.parse(await fs.readFile(`${directory}/source.json`, 'utf8'));
if (source.repository !== 'swgoh-utils/gamedata' || !/^[a-f0-9]{40}$/.test(source.commit)) throw new Error('Invalid pinned source.');
const headers = { 'User-Agent': 'mods-optimizer-kit-analysis' };
async function download(url) {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  return Buffer.from(await response.arrayBuffer());
}
const tree = JSON.parse((await download(`https://api.github.com/repos/${source.repository}/git/trees/${source.commit}`)).toString());
const file = tree.tree.find(row => row.type === 'blob' && /^battleTargetingRule\.json(?:\.br)?$/i.test(row.path));
if (!file) throw new Error(`Targeting table not found. Relevant paths: ${tree.tree.filter(row => /target/i.test(row.path)).map(row => row.path).join(', ')}`);
const bytes = await download(`https://raw.githubusercontent.com/${source.repository}/${source.commit}/${file.path}`);
const decoded = file.path.endsWith('.br') ? brotliDecompressSync(bytes) : bytes;
const table = JSON.parse(decoded.toString());
if (!Array.isArray(table.data)) throw new Error('Unexpected targeting table format.');
await fs.writeFile(`${directory}/battleTargetingRule.json`, decoded);
source.hashes[file.path] = createHash('sha256').update(bytes).digest('hex');
await fs.writeFile(`${directory}/source.json`, JSON.stringify(source, null, 2));
console.log(`Saved ${table.data.length} targeting rules from pinned revision ${source.commit}.`);
