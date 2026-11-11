import assert from 'node:assert/strict';
import { parseSwgohTierList } from './lib/swgohTierList.mjs';
const page = (side = 'Offense', mode = '5v5') => `<title>SWGOH GAC ${mode} Squad ${side} Tier List — Season 84 - SWGOH.GG</title>
<link rel="canonical" href="/tier-list/gac/">
<div data-tier><div data-tier-toggle>D tier</div><details data-search="a"><summary>
<img alt="A"><img alt="B"><img alt="C">Elo -381 ${side === 'Offense' ? 'Win' : 'Hold'} % -0.0% Battles 30 54 builds
</summary><a href="/units/a/meta/">Meta Explorer</a><img alt="Datacron only"></details></div>
<script>throw new Error('must never execute')</script>`;
const parsed = parseSwgohTierList(page());
assert.equal(parsed.teams.length, 1, 'Build count does not create phantom variants');
assert.equal(parsed.teams[0].stats.builds, 54);
assert.equal(parsed.teams[0].stats.elo, -381);
assert.deepEqual(parsed.teams[0].units.map(u => u.n), ['A', 'B', 'C'], 'Datacron units are not squad members');
assert.equal(parsed.teams[0].offB, 4);
assert.equal(parsed.teams[0].defB, null);
const defense = parseSwgohTierList(page('Defense', '3v3'));
assert.equal(defense.mode, '3v3');
assert.equal(defense.teams[0].offB, null);
assert.equal(defense.teams[0].defB, 4);
assert.throws(() => parseSwgohTierList('<title>Access denied</title>'), /Expected/);
assert.throws(() => parseSwgohTierList(page().replace('Elo -381', 'Rating unknown')), /format changed/);
console.log('SWGOH HTML importer tests passed.');
