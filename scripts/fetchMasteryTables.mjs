import fs from 'node:fs/promises';
import { brotliDecompressSync } from 'node:zlib';
import { createHash } from 'node:crypto';

// Extend the source snapshot at its existing commit, without refreshing it.
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
const relevant = tree.tree.filter(row => row.type === 'blob' && /(?:relic|statProgression|statDef|statTable)/i.test(row.path));
if (process.argv.includes('--discover')) {
  console.log(JSON.stringify(relevant.map(row => ({ path: row.path, bytes: row.size })), null, 2));
} else {
  const wanted = ['relicTierDefinition', 'statProgression'];
  const selected = wanted.map(name => {
    const file = tree.tree.find(row => row.type === 'blob' && new RegExp(`^${name}\\.json(?:\\.br)?$`, 'i').test(row.path));
    if (!file) throw new Error(`Missing ${name}. Relevant source files: ${relevant.map(row => row.path).join(', ')}`);
    return file;
  });
  for (const file of selected) {
    const bytes = await download(`https://raw.githubusercontent.com/${source.repository}/${source.commit}/${file.path}`);
    const blobHash = createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
    if (blobHash !== file.sha) throw new Error(`Pinned Git blob mismatch: ${file.path}`);
    const decoded = file.path.endsWith('.br') ? brotliDecompressSync(bytes) : bytes;
    const table = JSON.parse(decoded.toString());
    if (!Array.isArray(table.data)) throw new Error(`Unexpected source table format: ${file.path}`);
    await fs.writeFile(`${directory}/${file.path.replace(/\.br$/, '')}`, decoded);
    source.hashes[file.path] = createHash('sha256').update(bytes).digest('hex');
    console.log(`Saved ${file.path}: ${table.data.length} records, ${decoded.length} decoded bytes.`);
  }
  await fs.writeFile(`${directory}/source.json`, JSON.stringify(source, null, 2));
  console.log(`Extended pinned source ${source.commit}; no source refresh.`);
}
