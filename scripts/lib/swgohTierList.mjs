import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
// jsdom is supplied by this repository's existing react-scripts test dependencies.
// Default settings neither execute scripts nor load remote resources.
const { JSDOM } = require('jsdom');

export function parseSwgohTierList(html) {
  const dom = new JSDOM(html);
  try {
    const doc = dom.window.document;
    const title = doc.title.match(/GAC (5v5|3v3) Squad (Offense|Defense) Tier List.*Season (\d+)/i);
    if (!title) throw new Error('Expected a SWGOH.GG GAC squad tier-list page with mode, side, and season.');
    const mode = title[1], side = title[2].toLowerCase(), season = Number(title[3]);
    const source = new URL(doc.querySelector('link[rel="canonical"]')?.getAttribute('href') ||
      (mode === '5v5' ? '/tier-list/gac/' : '/tier-list/3v3/'), 'https://swgoh.gg');
    if (source.hostname !== 'swgoh.gg') throw new Error('Unexpected tier-list source host.');
    source.searchParams.set('season', String(season));
    source.searchParams.set('side', side);
    const bands = ['S', 'A', 'B', 'C', 'D'];
    const teams = [], seen = new Set();
    for (const row of doc.querySelectorAll('[data-tier] details[data-search]')) {
      const tier = row.closest('[data-tier]').querySelector('[data-tier-toggle]')?.textContent.trim().match(/^([SABCD])\b/)?.[1];
      const summary = row.querySelector('summary');
      const units = [...(summary?.querySelectorAll('img') || [])].map(img => ({ n: img.alt.trim() }));
      const text = summary?.textContent.replace(/\s+/g, ' ') || '';
      const elo = Number(text.match(/Elo\s+(-?[\d.]+)/)?.[1]);
      const winRate = Number(text.match(/(?:Win|Hold)\s*%\s+(-?[\d.]+)%/)?.[1]);
      const battlesDisplayed = text.match(/Battles\s+([\d.,]+[KM]?)/)?.[1];
      if (!tier || !units.length || units.some(u => !u.n) || !Number.isFinite(elo) || !Number.isFinite(winRate) || !battlesDisplayed) {
        throw new Error('Tier-list row format changed; refusing incomplete import.');
      }
      const identity = JSON.stringify(units.map(u => u.n));
      if (seen.has(identity)) continue;
      seen.add(identity);
      const metaLink = row.querySelector('a[href*="/meta/"]')?.getAttribute('href');
      const explorerUrl = metaLink ? new URL(metaLink, source).href : null;
      teams.push({ name: `${units[0].n} — entry ${teams.length + 1}`, mode, units,
        offB: side === 'offense' ? bands.indexOf(tier) : null,
        defB: side === 'defense' ? bands.indexOf(tier) : null,
        stats: { tier, elo, winRate, battlesDisplayed, builds: Number(text.match(/(\d+) builds/)?.[1] || 1), explorerUrl },
        note: `Elo ${elo}; ${side === 'offense' ? 'win' : 'hold'} ${winRate}%; battles ${battlesDisplayed}. Datacrons and ability upgrades not verified.` });
    }
    if (!teams.length) throw new Error('No ranked squads found; this may be a block/login page.');
    const leagueLink = [...doc.querySelectorAll('a')].find(a => a.textContent.trim() === 'Kyber — default');
    // Preserve the supplied page's filters in the raw HTML; do not infer missing league filters.
    return { bands, teams, mode, side, season, source: source.href,
      title: doc.title, league: leagueLink?.className.includes('border-primary') ? 'Kyber' : 'See imported HTML filters' };
  } finally { dom.window.close(); }
}
