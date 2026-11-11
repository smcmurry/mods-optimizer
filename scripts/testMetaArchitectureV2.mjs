import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const sandbox = vm.createContext({ self: {}, console });
vm.runInContext(fs.readFileSync('public/workers/optimizer.js', 'utf8'), sandbox);
const generated = JSON.parse(fs.readFileSync('src/constants/generatedMetaTargets.json', 'utf8'));
const r2 = generated.characters.R2D2_LEGENDARY.targets[0];
assert.deepEqual([r2.health, r2.speed, r2.offense, r2.potency], [26, 100, 29, 31]);
assert.deepEqual(r2.primaryStatRestrictions, {});
assert.equal(generated.characters.BADBATCHHUNTER.targets[0].primaryStatRestrictions.arrow, 'Speed');
const primary = sandbox.deserializeStat('Potency %', '24%');
assert.equal(primary.isPercent, false);
assert.equal(sandbox.primaryPreference({ slot: 'cross', primaryStat: primary }, {
  cross: { probabilities: { 'Potency %': 0.8, 'Health %': 0.2 }, confidence: 1 }
}, 12, 0.001), 0);
const makeSet = names => ['square', 'arrow', 'diamond', 'triangle', 'circle', 'cross'].map((slot, i) => ({
  id: slot, slot, set: sandbox.setBonusesForTest[names[i]], primaryStat: sandbox.deserializeStat('Health %', '5.88%')
}));
// Lexical constants are exposed explicitly only inside this test VM.
vm.runInContext('self.setBonuses = setBonuses', sandbox);
sandbox.setBonusesForTest = sandbox.self.setBonuses;
const healthOffense = makeSet(['health', 'health', 'offense', 'offense', 'offense', 'offense']);
const speedPotency = makeSet(['speed', 'speed', 'speed', 'speed', 'potency', 'potency']);
const tripleHealth = makeSet(Array(6).fill('health'));
const target = JSON.parse(JSON.stringify(r2));
target.metaPreferences.primaryStrength = 0;
const best = sandbox.metaModSetPrior(healthOffense, target);
assert.equal(best, 0);
assert.ok(sandbox.metaModSetPrior(speedPotency, target) < best);
assert.ok(sandbox.metaModSetPrior(tripleHealth, target) < sandbox.metaModSetPrior(speedPotency, target));
assert.equal(sandbox.metaModSetPrior(healthOffense.slice(0, 5), target), 0);
assert.equal(sandbox.metaModSetPrior([...healthOffense.slice(0, 5), healthOffense[0]], target), 0);
assert.equal(sandbox.metaModSetPrior(healthOffense, {}), 0);
assert.equal(sandbox.metaCandidatePrior(healthOffense[0], {}), 0);
const custom = { metaPreferences: { version: 2, epsilon: 0.001, confidence: 1, setStrength: 30,
  primaryStrength: 12, candidatePrimaryStrength: 3,
  primaries: { circle: { probabilities: { 'Health %': 0.2, 'Protection %': 0.8 }, confidence: 1 } },
  loadouts: { '1-2': { probability: 1, primaries: { circle: { probabilities: { 'Health %': 0.9, 'Protection %': 0.1 }, confidence: 1 } } } }
} };
assert.ok(sandbox.metaCandidatePrior(healthOffense[4], custom) < 0);
assert.equal(sandbox.metaModSetPrior(healthOffense, custom), 0); // Conditional evidence overrides aggregate.
// Verify a better stat score can overcome the soft set penalty, and that final
// scoring does not add the candidate primary nudge a second time.
sandbox.getFlatStatsFromMod = mod => [{ displayType: 'Speed', value: mod.set.name === 'speed' ? 5 : 0 }];
const scoringTarget = { ...target, speed: 5 };
assert.ok(sandbox.scoreModSet(speedPotency, {}, scoringTarget) > sandbox.scoreModSet(healthOffense, {}, scoringTarget));
sandbox.getFlatStatsFromMod = () => [];
assert.equal(sandbox.scoreModSet(healthOffense, {}, custom), 0);
const planContext = vm.createContext({ TargetStat: class {}, Stat: {} });
vm.runInContext(fs.readFileSync('src/utils/areObjectsEquivalent.js', 'utf8').replace('export default ', ''), planContext);
vm.runInContext(fs.readFileSync('src/domain/OptimizationPlan.js', 'utf8').replace(/^import .*;$/gm, '').replace('export default OptimizationPlan;', 'this.Plan = OptimizationPlan;'), planContext);
const plan = vm.runInContext(`Plan.deserialize(${JSON.stringify({ name: 'Meta', metaPreferences: r2.metaPreferences })})`, planContext);
assert.equal(plan.rename('Renamed').metaPreferences, plan.metaPreferences);
assert.equal(plan.withUpgradeMods(false).metaPreferences, plan.metaPreferences);
planContext.plan = plan;
assert.ok(vm.runInContext('plan.equals(Plan.deserialize(JSON.parse(JSON.stringify(plan.serialize()))))', planContext));
assert.ok(!plan.equals(planContext.Plan.deserialize({ name: 'Meta' })));
assert.equal(planContext.Plan.deserialize({ name: 'Legacy' }).metaPreferences, null);
console.log('V2 regression checks passed: priors, percentage primaries, complete sets, scoring, and saved-plan compatibility.');

const hondo = generated.characters.GLHONDO.targets[0];
const stale = { id: 'GLHONDO', target: { name: 'Kyber Meta', health: 60, speed: 100 } };
// Exercise the real worker entry point with stale IndexedDB data and a current
// in-memory selection. Verify both the database key and the plan used to score.
const requests = {};
const transaction = { objectStore(name) { return { get(key) { assert.equal(key, '123'); return requests[name] = {}; } }; } };
const openRequest = {};
let sentSelections;
const entryContext = vm.createContext({ self: { close() {} }, postMessage() {}, indexedDB: { open() { return openRequest; } } });
vm.runInContext(fs.readFileSync('public/workers/optimizer.js', 'utf8'), entryContext);
entryContext.optimizeMods = (mods, characters, selections) => { sentSelections = selections; return []; };
entryContext.self.onmessage({ data: { allyCode: '123', selectedCharacters: [{ id: 'GLHONDO', target: hondo }] } });
openRequest.onsuccess({ target: { result: { transaction() { return transaction; } } } });
requests.profiles.onsuccess({ target: { result: { mods: [], characters: {}, selectedCharacters: [stale], modAssignments: [] } } });
requests.lastRuns.onsuccess({ target: { result: null } });
transaction.oncomplete();
assert.equal(sentSelections[0].target.health, 27 / 2000);
assert.equal(sentSelections[0].target.metaPreferences.version, 2);
console.log('The worker scores the current selection instead of stale IndexedDB data.');

// Regression for the actual imbalance: at high base Health, legacy bonus
// scoring makes triple Health win even when all six mods have identical stats.
// Exercise the real flattening/bonus/scoring functions rather than stubbing them.
const bonusContext = vm.createContext({ self: {}, console });
vm.runInContext(fs.readFileSync('public/workers/optimizer.js', 'utf8'), bonusContext);
vm.runInContext('self.setBonuses = setBonuses; clearCache();', bonusContext);
const character = { baseID: 'GLHONDO', playerValues: { baseStats: { health: 300000, speed: 365 } }, optimizerSettings: { sliceMods: false } };
const hondoTarget = bonusContext.deserializeTarget({ ...hondo, physDmg: 0, specDmg: hondo.offense, armor: 12, resistance: 12, targetStats: [], upgradeMods: true });
hondoTarget.metaPreferences = { ...hondoTarget.metaPreferences, primaryStrength: 0, candidatePrimaryStrength: 0 };
const slots = ['square', 'arrow', 'diamond', 'triangle', 'circle', 'cross'];
function fixtureSets(names, prefix) {
  return names.map((name, i) => ({ id: prefix + i, slot: slots[i], set: bonusContext.self.setBonuses[name], level: 15, pips: 6,
    primaryStat: bonusContext.deserializeStat('Health %', '0%'), secondaryStats: [] }));
}
const hondoSpeedHealth = fixtureSets(['speed', 'speed', 'speed', 'speed', 'health', 'health'], 'speed');
const hondoTripleHealth = fixtureSets(Array(6).fill('health'), 'health');
const cacheFixture = mods => mods.forEach(mod => bonusContext.getFlatStatsFromMod(mod, character, hondoTarget));
cacheFixture([...hondoSpeedHealth, ...hondoTripleHealth]);
const legacyHondo = { ...hondoTarget, metaPreferences: null };
assert.ok(bonusContext.scoreModSet(hondoTripleHealth, character, legacyHondo) > bonusContext.scoreModSet(hondoSpeedHealth, character, legacyHondo));
assert.ok(bonusContext.scoreModSet(hondoSpeedHealth, character, hondoTarget) > bonusContext.scoreModSet(hondoTripleHealth, character, hondoTarget));
const finalHealth = bonusContext.getFlatStatsFromModSet(hondoTripleHealth, character, hondoTarget).find(stat => stat.displayType === 'Health').value;
assert.equal(finalHealth, 90000); // Reporting still includes all three set bonuses.
// Soft evidence remains defeasible when the triple-Health mods are better.
hondoTripleHealth.forEach(mod => { mod.secondaryStats = [bonusContext.deserializeStat('Speed', '+30')]; });
vm.runInContext('clearCache()', bonusContext);
cacheFixture([...hondoSpeedHealth, ...hondoTripleHealth]);
assert.ok(bonusContext.scoreModSet(hondoTripleHealth, character, hondoTarget) > bonusContext.scoreModSet(hondoSpeedHealth, character, hondoTarget));
console.log('High-Health Hondo regression passed: equal-quality mods prefer Health + Speed, better mods can override it, and final set bonuses remain intact.');

// Export captures the whole roster and applies moves to donor characters too.
const reportMods = [...hondoTripleHealth.map(mod => ({ ...mod, characterID: 'GLHONDO', secondaryStats: [] })),
  ...hondoSpeedHealth.map(mod => ({ ...mod, characterID: 'DONOR', secondaryStats: [] }))];
const reportCharacter = { ...character, playerValues: { ...character.playerValues, level: 85,
  equippedStats: { health: 300000, speed: 365, potency: 0, armor: 500 },
  baseStats: { health: 300000, speed: 365, potency: 0, armor: 500 } } };
const donor = { ...reportCharacter, baseID: 'DONOR', playerValues: { ...reportCharacter.playerValues,
  baseStats: { health: 50000, speed: 200, potency: 0, armor: 500 },
  equippedStats: { health: 50000, speed: 200, potency: 0, armor: 500 } } };
const assignment = { id: 'GLHONDO', target: hondoTarget, assignedMods: hondoSpeedHealth.map(mod => mod.id), messages: ['Example warning'], missedGoals: [] };
const snapshot = JSON.stringify({ reportMods, hondoTarget });
const report = bonusContext.buildOptimizationReport(reportMods, { GLHONDO: reportCharacter, DONOR: donor }, [{ id: 'GLHONDO', target: hondoTarget }], [assignment], {});
assert.equal(report.summary.characters, 2);
assert.equal(report.summary.modDonors, 1);
const hondoReport = report.characters.find(row => row.id === 'GLHONDO');
const donorReport = report.characters.find(row => row.id === 'DONOR');
assert.equal(hondoReport.before.stats.health.value, 390000);
assert.equal(hondoReport.after.stats.health.value, 330000);
assert.equal(hondoReport.statChanges.health.delta, -60000);
assert.equal(hondoReport.statChanges.potency.relativeChangePercent, null);
assert.equal(hondoReport.target.weights.health, 27);
assert.equal(hondoReport.after.score.loadoutId, '1-4');
assert.ok(hondoReport.scoreChange.delta > 0);
assert.equal(hondoReport.messages[0], 'Example warning');
assert.equal(donorReport.after.mods.length, 0);
assert.equal(donorReport.statChanges.speed.delta, -20);
assert.equal(donorReport.after.score, null);
assert.equal(JSON.stringify({ reportMods, hondoTarget }), snapshot);
assert.ok(!JSON.stringify(report).includes('NaN'));
console.log('Run export regression passed: exact before/after stats, score breakdown, warnings, zero baselines, donor losses, and unchanged input data.');

let downloaded;
let storedReport = report;
const errors = [];
const exportContext = vm.createContext({ Blob,
  prepareOptimizationReport: async (allyCode, names) => {
    assert.equal(allyCode, '123');
    if (!storedReport) throw new Error('Run an optimization with this version first, then export its report.');
    return { blob: new Blob([JSON.stringify({ ...storedReport, characters: storedReport.characters.map(row => ({ ...row, name: names[row.id] || row.id })) })]), filename: 'optimization-analysis-test.json' };
  },
  saveAs: (blob, filename) => { downloaded = { blob, filename }; },
  showError: message => ({ error: message })
});
vm.runInContext(fs.readFileSync('src/state/actions/review.js', 'utf8')
  .replace(/^import .*;$/gm, '').replace(/export (const|function)/g, '$1'), exportContext);
await exportContext.exportOptimizationReport()(action => errors.push(action), () => ({ allyCode: '123', gameSettings: { GLHONDO: { name: 'Pirate King Hondo Ohnaka' } } }));
const exported = JSON.parse(await downloaded.blob.text());
assert.equal(exported.characters.find(row => row.id === 'GLHONDO').name, 'Pirate King Hondo Ohnaka');
assert.ok(downloaded.filename.startsWith('optimization-analysis-'));
assert.ok(downloaded.filename.endsWith('.json'));
assert.equal(exported.characters.find(row => row.id === 'DONOR').statChanges.speed.delta, -20);
storedReport = null;
await assert.rejects(exportContext.exportOptimizationReport()(action => errors.push(action), () => ({ allyCode: '123' })));
assert.equal(errors.length, 1);
assert.ok(errors[0].error.includes('Run an optimization'));
console.log('Report download checks passed: saved snapshot, character names, JSON filename, and guidance for older runs.');

// Run the real search with auditing, then repeat with recording disabled to
// prove the instrumentation does not change its selected mod IDs.
bonusContext.postMessage = () => {};
const searchCharacter = { ...reportCharacter, playerValues: { ...reportCharacter.playerValues, gearLevel: 13 },
  optimizerSettings: { ...reportCharacter.optimizerSettings, minimumModDots: 1, isLocked: false } };
const searchTarget = { ...hondoTarget, primaryStatRestrictions: {}, targetStats: [] };
const searchMods = reportMods.map(mod => ({ ...mod, characterID: mod.characterID === 'GLHONDO' ? 'GLHONDO' : null }));
const settings = { modChangeThreshold: 0, lockUnselectedCharacters: false, forceCompleteSets: false };
const auditedResult = bonusContext.optimizeMods(searchMods, { GLHONDO: searchCharacter }, [{ id: 'GLHONDO', target: searchTarget }], null, settings);
const audit = auditedResult[0].candidateAudit;
assert.equal(audit.version, 1);
assert.equal(audit.recommendedCandidate.loadoutId, '1-4');
assert.ok(audit.topCandidates.length > 0 && audit.topCandidates.length <= 10);
assert.ok(audit.bestByLoadout['1-1-1']);
assert.ok(audit.bestByLoadout['1-4'].bestFeasible);
assert.equal(audit.retainedCurrentMods, false);
assert.ok(audit.topObservedLoadouts.some(loadout => !loadout.evaluated));
for (const candidate of audit.topCandidates) {
  assert.ok(Math.abs(candidate.score.total - candidate.score.statUtility - candidate.score.setPrior - candidate.score.primaryPrior) < 1e-9);
}
const record = bonusContext.recordCandidateScore;
bonusContext.recordCandidateScore = () => {};
const plainResult = bonusContext.optimizeMods(searchMods, { GLHONDO: searchCharacter }, [{ id: 'GLHONDO', target: searchTarget }], null, settings);
assert.equal(JSON.stringify(auditedResult[0].assignedMods), JSON.stringify(plainResult[0].assignedMods));
bonusContext.recordCandidateScore = record;
const bounded = bonusContext.createCandidateAudit(searchTarget);
for (let i = 0; i < 25; i++) {
  const mods = reportMods.slice(0, 6).map(mod => ({ ...mod, id: mod.id + '-' + i }));
  bonusContext.recordCandidateScore(bounded, mods, searchCharacter, searchTarget, i, i);
  bonusContext.recordCandidateScore(bounded, mods, searchCharacter, searchTarget, i, i);
}
assert.equal(bounded.topCandidates.length, 10);
assert.equal(bounded.topCandidates[0].score.total, 24);
assert.equal(bounded.bestByLoadout['1-1-1'].bestEvaluated.score.total, 24);
assert.equal(bounded.completeEvaluations, 50);
const auditedReport = bonusContext.buildOptimizationReport(searchMods, { GLHONDO: searchCharacter }, [{ id: 'GLHONDO', target: searchTarget }], auditedResult, settings);
assert.equal(auditedReport.schemaVersion, 3);
assert.equal(auditedReport.characters[0].candidateAudit.topCandidates.length, audit.topCandidates.length);
console.log('Candidate audit checks passed: real search, score decomposition, unchanged selections, bounded storage, deduplication, alternatives, and report export.');

const strongHealth = searchMods.map(mod => mod.set.name === 'health' ? { ...mod, secondaryStats: [bonusContext.deserializeStat('Speed', '+30')] } : mod);
const strongResult = bonusContext.optimizeMods(strongHealth, { GLHONDO: searchCharacter }, [{ id: 'GLHONDO', target: searchTarget }], null, settings);
const strongAudit = strongResult[0].candidateAudit;
assert.equal(strongAudit.recommendedCandidate.loadoutId, '1-1-1');
const calibration = strongAudit.loadoutComparisons.find(row => row.loadoutId === '1-4');
assert.ok(calibration.setStrengthToTieRecommended > searchTarget.metaPreferences.setStrength);
const common = strongAudit.bestByLoadout['1-4'].bestFeasible.score;
const winner = strongAudit.recommendedCandidate.score;
const fixedUtility = candidate => candidate.statUtility + candidate.primaryPrior + candidate.setPrior * calibration.setStrengthToTieRecommended / searchTarget.metaPreferences.setStrength;
assert.ok(Math.abs(fixedUtility(common) - fixedUtility(winner)) < 1e-8);
const retained = bonusContext.optimizeMods(searchMods, { GLHONDO: searchCharacter }, [{ id: 'GLHONDO', target: searchTarget }], null, { ...settings, modChangeThreshold: 10000 });
assert.ok(retained[0].candidateAudit.retainedCurrentMods);
assert.equal(retained[0].candidateAudit.recommendedCandidate.loadoutId, '1-4');
assert.equal(retained[0].candidateAudit.assignedCandidate.loadoutId, '1-1-1');
const reused = bonusContext.optimizeMods(searchMods, { GLHONDO: searchCharacter }, [{ id: 'GLHONDO', target: searchTarget }], null, settings, {
  scoringVersion: 'combat-utility-v5-kits-15', candidateAuditVersion: 1, globalSettings: settings,
  mods: searchMods, characters: { GLHONDO: searchCharacter }, selectedCharacters: [{ id: 'GLHONDO', target: searchTarget }], modAssignments: auditedResult
});
assert.equal(reused[0].candidateAudit.source, 'reused-unchanged-previous-run');
console.log('Audit calibration checks passed: exact break-even strength, retained-current-mods distinction, and labeled cache reuse.');
