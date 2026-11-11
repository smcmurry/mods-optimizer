import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

const allyCode = process.argv[2] || '297546974';
if (!/^\d{9}$/.test(allyCode)) throw new Error('Supply a nine-digit ally code.');
const endpoint = 'https://api.mods-optimizer.swgoh.grandivory.com/hotutils-v2/';
const response = await fetch(endpoint, {
  method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'getprofile', sessionId: null, payload: { allyCode } }),
  signal: AbortSignal.timeout(120000)
});
if (!response.ok) throw new Error(`Profile fetch failed: HTTP ${response.status}`);
const data = await response.json();
if (data.errorMessage) throw new Error(data.errorMessage);
const profile = data.mods?.profiles?.[0];
if (!profile?.characters?.length || !profile?.mods?.length) throw new Error('The public profile response has no characters/mods.');
const directory = path.resolve('data/optimizer-fixtures', allyCode);
await fs.mkdir(directory, { recursive: true });
const raw = JSON.stringify(profile);
await fs.writeFile(path.join(directory, 'profile.json'), raw);
await fs.writeFile(path.join(directory, 'source.json'), JSON.stringify({ allyCode, endpoint,
  fetchedAt: new Date().toISOString(), sha256: createHash('sha256').update(raw).digest('hex'),
  inventoryScope: 'Public profile; may exclude unequipped mods. No HotUtils session used.',
  characters: profile.characters.length, mods: profile.mods.length }, null, 2));
console.log(`Cached ${profile.characters.length} characters and ${profile.mods.length} mods for ${allyCode}. Public inventory only; no game session or mod movement.`);
