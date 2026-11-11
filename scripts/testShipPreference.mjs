import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const worker = vm.createContext({ self: {}, console, postMessage() {} });
vm.runInContext(fs.readFileSync('public/workers/optimizer.js', 'utf8'), worker);
vm.runInContext('self.bonuses = setBonuses;', worker);
const slots = ['square', 'arrow', 'diamond', 'triangle', 'circle', 'cross'];
const stats = { health: 10000, protection: 10000, speed: 100, physicalDamage: 1000,
  specialDamage: 1000, armor: 100, resistance: 100, potency: 0, tenacity: 0,
  physicalCriticalChance: 10, specialCriticalChance: 10, criticalDamage: 150, accuracy: 0, criticalAvoidance: 0 };
const character = (id, pilot = false) => ({ baseID: id,
  playerValues: { baseStats: stats, equippedStats: stats, gearLevel: 13, level: 85 },
  optimizerSettings: { minimumModDots: 1, sliceMods: false, isLocked: false, preferSixDotMods: pilot } });
const target = { name: 'Speed', speed: 1, targetStats: [], primaryStatRestrictions: {}, setRestrictions: {}, upgradeMods: false };
const mod = (id, slot, pips, speed, owner = null) => ({ id, slot, pips, level: 15, tier: 1,
  characterID: owner, set: worker.self.bonuses.health, primaryStat: worker.deserializeStat('Health %', '16%'),
  secondaryStats: [worker.deserializeStat('Speed', `+${speed}`)] });
const row = (id, mods, plan = target) => ({ id, target: plan, assignedMods: mods.map(m => m.id), messages: [], missedGoals: [] });
const characters = { pilot: character('pilot', true), donor: character('donor'), valuable: character('valuable'), locked: character('locked') };
characters.locked.optimizerSettings.isLocked = true;
const pilot = slots.map(slot => mod(`pilot-${slot}`, slot, 5, 9, 'pilot'));
const donor = slots.map(slot => mod(`donor-${slot}`, slot, 6, 10, 'donor'));
const valuable = slots.map(slot => mod(`valuable-${slot}`, slot, 6, 30, 'valuable'));
const locked = slots.map(slot => mod(`locked-${slot}`, slot, 6, 0, 'locked'));
const baseline = [row('pilot', pilot), row('donor', donor), row('valuable', valuable), null];
const allMods = [...pilot, ...donor, ...valuable, ...locked];
const run = (mods = allMods, config = characters, input = baseline, settings = {}) =>
  worker.assignShipMods(mods, config, input, settings);
const output = run();
const protectedGG = run(allMods,
  {...characters, donor:{...characters.donor,optimizerSettings:{...characters.donor.optimizerSettings,highestGGMods:true}}},
  baseline.map(row => row && row.id === 'donor' ? {...row,highestGGMods:true} : row));
assert.deepEqual([...protectedGG[1].assignedMods],donor.map(mod=>mod.id),
  'Ship assignment must not replace highest-GG selections');
assert.equal(new Set(protectedGG.filter(Boolean).flatMap(row=>row.assignedMods)).size,18);
const protectedLoadout = run(allMods,
  {...characters, donor:{...characters.donor,optimizerSettings:{...characters.donor.optimizerSettings,fullLoadoutOnly:true}}},
  baseline.map(row => row && row.id === 'donor' ? {...row,fullLoadoutOnly:true} : row));
assert.deepEqual([...protectedLoadout[1].assignedMods],donor.map(mod=>mod.id),
  'Ship assignment must preserve a full donor loadout');
assert.equal(new Set(protectedLoadout.filter(Boolean).flatMap(row=>row.assignedMods)).size,18);
assert.deepEqual([...output[0].assignedMods], donor.map(m => m.id), 'Take the least costly six-dot mods');
assert.deepEqual([...output[1].assignedMods], valuable.map(m => m.id), 'Higher-priority donor takes the best remaining mods from lower-priority characters');
assert.deepEqual([...output[2].assignedMods], pilot.map(m => m.id), 'Displacement cascades to the lower-priority character');
assert.equal(output[1].shipPreferenceImpact.loss, -120);
assert.equal(output[2].shipPreferenceImpact.loss, 126);
assert.equal(output[0].shipPreferenceImpact.loss, -6);
assert.equal(new Set(output.filter(Boolean).flatMap(r => r.assignedMods)).size, 18);
assert.equal(output[3], null);
const spare = slots.map(slot => mod(`spare-${slot}`, slot, 6, 0));
const zeroCost = run([...allMods, ...spare]);
assert.deepEqual([...zeroCost[0].assignedMods], spare.map(m => m.id));
assert.equal(zeroCost[1].shipPreferenceImpact.loss + zeroCost[2].shipPreferenceImpact.loss, 0);
const restrictedCharacters = JSON.parse(JSON.stringify(characters));
restrictedCharacters.donor.optimizerSettings.minimumModDots = 6;
restrictedCharacters.valuable.optimizerSettings.minimumModDots = 6;
const lowerPriority = run(allMods, restrictedCharacters);
assert.equal(lowerPriority[0].shipPreferenceImpact.sixDotCount, 6,
  'Lower-priority donor restrictions must not block the ship preference');
assert.deepEqual([...lowerPriority[0].assignedMods], donor.map(m => m.id),
  'Still choose the smallest score loss when ignoring lower-priority restrictions');
const mixedPriority = run(allMods, restrictedCharacters, [baseline[1], null, baseline[0], baseline[2]]);
assert.deepEqual([...mixedPriority[0].assignedMods], donor.map(m => m.id),
  'Protect the higher-priority donor even when it would cost less');
assert.deepEqual([...mixedPriority[2].assignedMods], valuable.map(m => m.id),
  'Use the lower-priority donor despite its dot restriction');
const shortage = run(allMods, restrictedCharacters, [baseline[1], baseline[2], baseline[0]])
  .filter(result => result.id === 'pilot');
assert.equal(shortage[0].shipPreferenceImpact.sixDotCount, 0);
assert.ok(shortage[0].messages[0].includes('0/6'));
assert.deepEqual([...shortage[0].assignedMods], pilot.map(m => m.id));
const secondPilot = slots.map(slot => mod(`second-${slot}`, slot, 5, 8, 'second'));
const twoPilots = { ...restrictedCharacters, second: character('second', true) };
const betweenPilots = run([...pilot, ...donor, ...locked, ...spare, ...secondPilot], twoPilots,
  [baseline[0], baseline[1], row('second', secondPilot)]);
assert.equal(betweenPilots[0].shipPreferenceImpact.sixDotCount, 6);
assert.equal(betweenPilots[2].shipPreferenceImpact.sixDotCount, 0,
  'Check priority against the actual recipient, not the first ship character');
const belowBothPilots = run([...pilot, ...donor, ...locked, ...spare, ...secondPilot], twoPilots,
  [baseline[0], row('second', secondPilot), baseline[1]]);
assert.equal(belowBothPilots[1].shipPreferenceImpact.sixDotCount, 6);
const unselected = spare.map(m => ({ ...m, characterID: 'valuable' }));
const isolated = run([...pilot, ...unselected], characters, [row('pilot', pilot)], { lockUnselectedCharacters: true });
assert.equal(isolated[0].shipPreferenceImpact.sixDotCount, 0);
const slicing = JSON.parse(JSON.stringify(characters));
slicing.pilot.optimizerSettings.sliceMods = true;
const fiveOnly = run(pilot, slicing, [row('pilot', pilot)]);
assert.equal(fiveOnly[0].shipPreferenceImpact.sixDotCount, 0, 'Slicing must not create six-dot supply');
const ignoredTarget = { ...target, setRestrictions: { speed: 1 }, primaryStatRestrictions: { arrow: 'Speed' },
  targetStats: [{ stat: 'Speed', minimum: 1000, maximum: 1100, optimizeForTarget: true }] };
const ignored = run([...allMods, ...spare], characters, [row('pilot', pilot, ignoredTarget), ...baseline.slice(1)]);
assert.equal(ignored[0].shipPreferenceImpact.sixDotCount, 6);
assert.equal(ignored[0].missedGoals.length, 0);
const lowGear = JSON.parse(JSON.stringify(characters));
lowGear.pilot.playerValues.gearLevel = 11;
assert.equal(run(allMods, lowGear)[0].shipPreferenceImpact.sixDotCount, 0);
// Exercise the actual entry point, including cache invalidation when disabling the feature.
const actual = worker.optimizeMods([...pilot, ...spare], { pilot: characters.pilot },
  [{ id: 'pilot', target }], null, { modChangeThreshold: 0, forceCompleteSets: false }, {});
assert.equal(actual[0].shipPreferenceImpact.sixDotCount, 6);
const off = { pilot: { ...characters.pilot, optimizerSettings: { ...characters.pilot.optimizerSettings, preferSixDotMods: false } } };
const offResult = worker.optimizeMods([...pilot, ...spare], off, [{ id: 'pilot', target }], null,
  { modChangeThreshold: 0, forceCompleteSets: false }, { characters });
assert.equal(offResult[0].shipPreferenceImpact, undefined);
assert.deepEqual([...offResult[0].assignedMods], pilot.map(m => m.id));
// Regression: Leia at priority #1 must replace donated sixes using mods from
// lower-priority characters, not the grey +4 Speed mods released by the pilot.
const priorityCharacters = { leia: character('leia'), lower: character('lower'), ship: character('ship', true) };
const leiaMods = slots.map(slot => mod(`leia-${slot}`, slot, 6, 30, 'leia'));
const lowerMods = slots.map(slot => ({ ...mod(`lower-${slot}`, slot, 5, 25, 'lower'), tier: 5 }));
const greyMods = slots.map(slot => mod(`grey-${slot}`, slot, 5, 4, 'ship'));
const priorityMods = [...leiaMods, ...lowerMods, ...greyMods];
const priorityOrder = ['leia', 'lower', 'ship'].map(id => ({ id, target: { ...target } }));
const priorityResult = worker.optimizeMods(priorityMods, priorityCharacters, priorityOrder, null,
  { modChangeThreshold: 0, forceCompleteSets: false }, {});
assert.deepEqual([...priorityResult[0].assignedMods], lowerMods.map(m => m.id),
  'Leia gets the best non-reserved mods, including those previously allocated below her');
assert.deepEqual([...priorityResult[1].assignedMods], greyMods.map(m => m.id),
  'Lower-priority character is reoptimized after Leia takes its previous mods');
assert.deepEqual([...priorityResult[2].assignedMods], leiaMods.map(m => m.id));
assert.equal(priorityResult[0].shipPreferenceImpact.before, 180);
assert.equal(priorityResult[0].shipPreferenceImpact.after, 150);
assert.equal(priorityResult[0].shipPreferenceImpact.loss, 30);
assert.equal(priorityResult[1].shipPreferenceImpact.loss, 126);
assert.equal(new Set(priorityResult.flatMap(r => r.assignedMods)).size, 18,
  'Reoptimization cannot reuse reserved or higher-priority mods');
// Compare against an independent normal search with exactly the ship's sixes removed.
const expectedRemaining = worker.optimizeModsBase([...lowerMods, ...greyMods], priorityCharacters,
  priorityOrder.slice(0, 2), null, { modChangeThreshold: 0, forceCompleteSets: false }, {});
assert.deepEqual([...priorityResult[0].assignedMods], [...expectedRemaining[0].assignedMods]);
assert.deepEqual([...priorityResult[1].assignedMods], [...expectedRemaining[1].assignedMods]);
// Ship sets and primaries are secondary preferences with no additional score cost.
const healthTarget = { ...target, setRestrictions: { health: 3 },
  primaryStatRestrictions: { circle: 'Protection %' } };
const plainHealthTarget = { ...target, setRestrictions: { health: 3 } };
const wrongSixes = slots.map(slot => ({ ...mod(`wrong-${slot}`, slot, 6, 10), set: worker.self.bonuses.defense }));
const matchingSixes = slots.map(slot => ({ ...mod(`matching-${slot}`, slot, 6, 10),
  primaryStat: worker.deserializeStat(slot === 'circle' ? 'Protection %' : 'Health %', slot === 'circle' ? '24%' : '16%') }));
const matching = run([...pilot, ...wrongSixes, ...matchingSixes], characters, [row('pilot', pilot, healthTarget)]);
assert.deepEqual([...matching[0].assignedMods].sort(), matchingSixes.map(m => m.id).sort(),
  'Prefer a complete correct set and matching primary when spare sixes have equal value');
assert.equal(matching[0].shipPreferenceImpact.after, 60);
assert.equal(matching[0].shipPreferenceImpact.sixDotCount, 6);
const costlyMatches = matchingSixes.map(m => ({ ...m, characterID: 'donor',
  secondaryStats: [worker.deserializeStat('Speed', '+30')] }));
const costly = run([...pilot, ...wrongSixes, ...costlyMatches], characters,
  [row('donor', costlyMatches), row('pilot', pilot, healthTarget)]);
assert.deepEqual([...costly[0].assignedMods], costlyMatches.map(m => m.id),
  'Matching pilot preferences cannot cost donor value');
assert.deepEqual([...costly[1].assignedMods], wrongSixes.map(m => m.id));
const equalDonor = matchingSixes.map(m => ({ ...m, characterID: 'donor' }));
const neutralExchange = run([...pilot, ...wrongSixes, ...equalDonor], characters,
  [row('donor', equalDonor), row('pilot', pilot, healthTarget)]);
assert.deepEqual([...neutralExchange[1].assignedMods].sort(), equalDonor.map(m => m.id).sort(),
  'Allow exchanges that improve ship preferences without reducing donor score');
assert.equal(neutralExchange[0].shipPreferenceImpact.loss, 0);
assert.equal(new Set(neutralExchange.flatMap(r => r.assignedMods)).size, 12);
// Even a free inventory mod cannot improve preferences at a greater overall loss.
const weakerMatches = matchingSixes.map(m => ({ ...m, secondaryStats: [worker.deserializeStat('Speed', '+1')] }));
const noExtraLoss = run([...pilot, ...wrongSixes, ...weakerMatches], characters,
  [row('pilot', pilot, healthTarget)]);
assert.deepEqual([...noExtraLoss[0].assignedMods], wrongSixes.map(m => m.id));
// Meta target alternatives participate in the tie-breaker too.
const metaTarget = { ...target, metaRestrictions: {
  primaries: { circle: ['Protection %'] }, setCombinations: [{ health: 3 }] } };
const metaMatching = run([...pilot, ...wrongSixes, ...matchingSixes], characters,
  [row('pilot', pilot, metaTarget)]);
assert.deepEqual([...metaMatching[0].assignedMods].sort(), matchingSixes.map(m => m.id).sort());
// A higher-priority donor's requested sets remain protected even at equal score.
const defenseTarget = { ...target, setRestrictions: { health: 3 } };
const protectedExchange = run([...pilot, ...wrongSixes, ...equalDonor], characters,
  [row('donor', equalDonor, defenseTarget), row('pilot', pilot, plainHealthTarget)]);
assert.deepEqual([...protectedExchange[0].assignedMods], equalDonor.map(m => m.id));
assert.deepEqual([...protectedExchange[1].assignedMods], wrongSixes.map(m => m.id));
// Individually neutral exchanges must also be safe when applied together.
const defenseFives = pilot.map(m => ({ ...m, set: worker.self.bonuses.defense,
  secondaryStats: [worker.deserializeStat('Speed', '+0')] }));
const mixedDonor = slots.map((slot, index) => ({ ...mod(`mixed-${slot}`, slot, 6, 10, 'donor'),
  set: index < 3 ? worker.self.bonuses.health : worker.self.bonuses.defense }));
const healthScoring = { ...target, health: 1 };
const combinedSafety = run([...defenseFives, ...wrongSixes, ...mixedDonor], characters,
  [row('donor', mixedDonor, healthScoring), row('pilot', defenseFives, { ...target, setRestrictions: { health: 1 } })]);
assert.equal(combinedSafety[0].shipPreferenceImpact.loss, 0,
  'Multiple individually neutral swaps must not jointly destroy a donor set bonus');
assert.deepEqual([...combinedSafety[1].assignedMods], wrongSixes.map(m => m.id));
console.log('Ship preference: priority-sensitive restrictions, least-cost replacements, spare mods, locks, shortage, restrictions, real dots, report costs and toggle-off recalculation passed.');

const { createFrontendLoader } = await import('./lib/loadFrontend.mjs');
const load = createFrontendLoader();
const { OptimizerSettings } = load('src/domain/CharacterDataClasses.js');
let settings = new OptimizerSettings(null, [], 1, true, false).withSixDotPreference(true);
for (const changed of [settings.lock(), settings.lock().unlock(), settings.withMinimumModDots(5),
  settings.withModSlicing(false), settings.withTargetOverrides([]), settings.withDeletedTarget('missing')]) {
  assert.equal(changed.preferSixDotMods, true, 'Other settings must preserve ship preference');
}
assert.equal(OptimizerSettings.deserialize(settings.serialize()).preferSixDotMods, true);
assert.equal(OptimizerSettings.deserialize({ targets: [], minimumModDots: 1 }).preferSixDotMods, false);
const { default: Mod } = load('src/domain/Mod.js');
assert.equal(Mod.prototype.shouldSlice.call({ pips: 5, level: 15 }, characters.pilot, target), false);
const { default: React } = await import('react');
const { default: ReactDOMServer } = await import('react-dom/server.js');
const Impact = load('src/components/ShipPreferenceImpact.js').default;
const html = ReactDOMServer.renderToStaticMarkup(React.createElement(Impact, { assignments: output, gameSettings: {} }));
assert.ok(html.includes('Overall value lost:'));
assert.ok(html.includes('Value lost for each character (3)'));
assert.ok(html.includes('pilot (ship: 6/6)'));
assert.equal(ReactDOMServer.renderToStaticMarkup(React.createElement(Impact, { assignments: [null], gameSettings: {} })), '');
console.log('Ship preference persistence, legacy defaults and rendered review breakdown passed.');
