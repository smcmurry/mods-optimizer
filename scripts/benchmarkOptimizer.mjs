import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const combat = require('../src/domain/combatUtility');
const mechanics = require('../src/domain/characterMechanics');
let evaluations = 0;
const original = mechanics.evaluate;
mechanics.evaluate = (...args) => { evaluations++; return original(...args); };
const workerPath = process.env.OPTIMIZER_WORKER || 'public/workers/optimizer.js';
const context = vm.createContext({ self: {}, console, postMessage() {}, CombatUtility: combat });
vm.runInContext(fs.readFileSync(workerPath, 'utf8'), context);
vm.runInContext('self.bonuses = setBonuses;', context);
const stats = { health: 65000, protection: 70000, speed: 190, physDmg: 7000, specDmg: 5500,
  physCritChance: 55, specCritChance: 35, critDmg: 150, armor: 550, resistance: 400,
  potency: 80, tenacity: 90, accuracy: 0, critAvoid: 0, level: 85 };
const ids = (process.env.BENCH_CHARACTERS || 'GLHONDO').split(',');
const results = [];
for (const id of ids) {
  evaluations = 0;
  const model = combat.forCharacter(id);
  const team = combat.getKit(id).recommendedTeams[0] || [];
  model.leaderId = team[0] || id;
  model.team = team.filter(ally => ally !== id).slice(0, 4).map(ally => ({ id: ally, tags: [], physicalShare: 1, stats }));
  const character = { baseID: id, playerValues: { baseStats: stats, equippedStats: stats, level: 85, gearLevel: 13 },
    optimizerSettings: { sliceMods: false, minimumModDots: 1, isLocked: false } };
  const target = context.deserializeTarget({ name: 'Combat Utility', combatModel: model, targetStats: [],
    primaryStatRestrictions: {}, setRestrictions: {}, upgradeMods: true });
  const primaries = { square: ['Offense %', 'Offense'], arrow: ['Speed', 'Offense %'], diamond: ['Defense %', 'Defense'],
    triangle: ['Critical Damage %', 'Health %'], circle: ['Protection %', 'Health %'], cross: ['Offense %', 'Potency %'] };
  const amount = type => ({ 'Offense %': '8.5%', Offense: '+160', Speed: '+30', 'Defense %': '20%', Defense: '+20',
    'Critical Damage %': '42%', 'Health %': '16%', 'Protection %': '24%', 'Potency %': '30%' }[type]);
  const mods = Object.keys(context.self.bonuses).flatMap((set, si) => Object.entries(primaries).flatMap(([slot, types], sl) =>
    types.flatMap((type, pi) => [0, 1].map(variant => ({ id: `${set}-${slot}-${pi}-${variant}`, slot,
      set: context.self.bonuses[set], level: 15, pips: 6, tier: 1,
      primaryStat: context.deserializeStat(type, amount(type)),
      secondaryStats: [context.deserializeStat('Speed', '+' + (4 + (si * 3 + sl * 7 + pi * 5 + variant * 11) % 23)),
        context.deserializeStat('Health %', (1 + (si + variant) % 3) + '%'), context.deserializeStat('Offense %', (1 + (sl + pi) % 3) + '%')],
      characterID: si === 0 && pi === 0 && variant === 0 ? id : null })))));
  const started = performance.now();
  const result = context.optimizeMods(mods, { [id]: character }, [{ id, target }], null,
    { modChangeThreshold: 0, lockUnselectedCharacters: false, forceCompleteSets: false });
  const milliseconds = performance.now() - started;
  const audit = result[0].candidateAudit;
  results.push({ id, mods: mods.length, allies: model.team.length, milliseconds: Math.round(milliseconds),
    mechanicsEvaluations: evaluations, searchEvaluations: audit.evaluations,
    assignedMods: result[0].assignedMods, score: audit.recommendedCandidate.score.total,
    loadoutId: audit.recommendedCandidate.loadoutId,
    topCandidates: audit.topCandidates.map(candidate => ({ ids: candidate.modIds, score: candidate.score.total })) });
  console.log(JSON.stringify(results.at(-1)));
}
if (process.env.BENCH_OUTPUT) fs.writeFileSync(process.env.BENCH_OUTPUT, JSON.stringify(results, null, 2));
