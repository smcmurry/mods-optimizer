import assert from 'node:assert/strict';
import { analyzeRoster, parseMeta, markdown } from './lib/gacRoster.mjs';

const characters = Object.fromEntries(['A', 'B', 'C', 'D', 'E', 'F'].map(id => [id, { name: id }]));
const profile = { characters: Object.keys(characters).map(baseId => ({ baseId, gearLevel: 13, relicTier: 7 })) };
const team = (name, mode, units, extra = {}) => ({ name, mode, units: units.map(n => ({ n })), offB: 0, defB: 1, ...extra });
const catalog = { bands: ['Top', 'Good'], teams: [
  team('Full', '5v5', ['A', 'B', 'C', 'D', 'E']),
  team('Trio', '3v3', ['A', 'B', 'C']), team('Overlap', '3v3', ['A', 'D', 'E']),
  team('Solo', '3v3', ['F'], { defB: null }),
  team('Missing', '3v3', ['A', 'B', 'Unknown']),
  team('Flex', '3v3', ['A', 'B'], { units: [{ n: 'A' }, { n: 'B' }, { flex: true }] }),
  team('Too many', '3v3', ['A', 'B', 'C', 'D']),
  team('Duplicate', '3v3', ['A', 'A', 'B'])
] };
let result = analyzeRoster(profile, catalog, characters);
assert.equal(result.relicCharacters[0].relic, 5, 'Raw tier 7 is R5, not R7');
assert.equal(result.sections['5v5-offense'].candidates.length, 1);
assert.deepEqual(result.sections['3v3-offense'].candidates.map(t => t.name), ['Overlap', 'Solo', 'Trio']);
assert.equal(result.sections['3v3-defense'].candidates.length, 2);
assert.deepEqual(result.sections['3v3-offense'].candidates.find(t => t.name === 'Trio').overlaps, ['Overlap']);
assert.equal(result.sections['3v3-offense'].excluded.length, 4);
profile.characters[0].relicTier = 2;
assert.equal(analyzeRoster(profile, catalog, characters).sections['5v5-offense'].candidates.length, 0, 'R0 excluded by default');
assert.equal(analyzeRoster(profile, catalog, characters, 0).sections['5v5-offense'].candidates.length, 1);
profile.characters[0].gearLevel = 12;
assert.equal(analyzeRoster(profile, catalog, characters, 0).sections['5v5-offense'].candidates.length, 0, 'G12 never relic eligible');
assert.throws(() => parseMeta('<html>Access denied</html>'), /format changed/);
assert.equal(parseMeta(`<script>const D = ${JSON.stringify(catalog)};</script>`).teams.length, 8);
assert.throws(() => parseMeta('<script>const D = {"bands":[],"teams":[]};</script>'), /missing 5v5/);
assert.throws(() => analyzeRoster({ characters: [profile.characters[0], profile.characters[0]] }, catalog, characters), /duplicate/);
assert.match(markdown({ ...result, player: 'Test', allyCode: '123456789', minRelic: 1, fetchedAt: 'test' }, 20), /not a combined deployment plan/);
console.log('GAC tests passed: relic enum, thresholds, modes, sides, overlaps, unknown/flex/duplicate/oversized lineups, and source validation.');
