import fs from 'node:fs/promises';
import path from 'node:path';
import { brotliDecompressSync } from 'node:zlib';
import { createHash } from 'node:crypto';

const directory = path.resolve('data/gameData-cache');
const repository = 'swgoh-utils/gamedata';
const headers = { 'User-Agent': 'mods-optimizer-kit-analysis' };
async function fetchBytes(url) {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(120000) });
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  return Buffer.from(await response.arrayBuffer());
}
await fs.mkdir(directory, { recursive: true });
const commit = JSON.parse((await fetchBytes(`https://api.github.com/repos/${repository}/commits/main`)).toString()).sha;
const files = ['ability.json', 'skill.json', 'effect.json.br', 'units.json.br', 'Loc_ENG_US.txt.json.br', 'enums.json', 'category.json', 'battleTargetingRule.json'];
const hashes = {};
await Promise.all(files.map(async file => {
  const bytes = await fetchBytes(`https://raw.githubusercontent.com/${repository}/${commit}/${file}`);
  const decoded = file.endsWith('.br') ? brotliDecompressSync(bytes) : bytes;
  JSON.parse(decoded.toString());
  await fs.writeFile(path.join(directory, file.replace(/\.br$/, '')), decoded);
  hashes[file] = createHash('sha256').update(bytes).digest('hex');
  console.log(`Saved ${file}: ${decoded.length} decoded bytes`);
}));
await fs.writeFile(path.join(directory, 'source.json'), JSON.stringify({ repository, commit,
  fetchedAt: new Date().toISOString(), url: `https://github.com/${repository}/tree/${commit}`, hashes }, null, 2));
console.log(`Pinned source revision ${commit}`);
