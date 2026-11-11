import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const workerSource = fs.readFileSync('public/workers/exportOptimizationReport.js', 'utf8');
async function runWorker(report, failure) {
  const messages = [];
  let closed = false;
  let requestedCode;
  const database = {
    close() { closed = true; },
    transaction(stores, mode) {
      assert.deepEqual(Array.from(stores), ['lastRuns']);
      assert.equal(mode, 'readonly');
      return { objectStore() { return { get(code) {
        requestedCode = code;
        const request = {};
        queueMicrotask(() => {
          if (failure === 'read') { request.error = new Error('Read failed'); request.onerror(); }
          else { request.result = { optimizationReport: report }; request.onsuccess(); }
        });
        return request;
      } }; } };
    }
  };
  const context = vm.createContext({ Blob, self: { postMessage: data => messages.push(data) }, indexedDB: {
    open(name) {
      assert.equal(name, 'ModsOptimizer');
      const request = {};
      queueMicrotask(() => {
        if (failure === 'blocked') request.onblocked();
        else if (failure === 'open') { request.error = new Error('Open failed'); request.onerror(); }
        else { request.result = database; request.onsuccess(); }
      });
      return request;
    }
  } });
  vm.runInContext(workerSource, context);
  await context.self.onmessage({ data: { allyCode: '123456789', names: { CHARACTER0: 'Named character' } } });
  return { messages, closed, requestedCode };
}

// Exercise the large nested audits that made formatting on the UI thread costly.
const audit = Array.from({ length: 80 }, (_, index) => ({
  loadoutId: index === 0 ? '1-1-1' : `loadout${index}`,
  modIds: ['a', 'b', 'c', 'd', 'e', 'f'], score: { total: 100 + index / 7,
    combat: { scenarios: Array.from({ length: 3 }, () => ({ stats: { health: 50000, speed: 300 },
      warnings: ['Unresolved state retained for analysis'], effects: 'diagnostic '.repeat(100) })) } }
}));
const combat = { utility: 1234567, scenarios: [{ weight: 1, teamDps: 123, teamEhp: 456,
  assumptions: { battleContext: null, temporaryProtectionPolicy: 'bounded-capacity', incomingControlCleansePolicy: 'source-filtered', poolConversionPolicy: 'before-stat-buffs', incomingDamageImmunityPolicy: 'ordinary-channel-duration' },
  self: { id: 'CHARACTER0', dps: 123, ehp: 456, healingRate: 5, temporaryProtection: 10000, incomingControlCleanseCoverage: 0.75, incomingDamageImmunityCoverage: 0.5, statVector: { health: 50000 } },
  unresolvedStates: Array.from({ length: 50 }, (_, index) => `Warning ${index}`) }] };
const report = { schemaVersion: 3, generatedAt: '2026-10-04T12:34:56.000Z',
  scoringVersion: 'combat-utility-v4-kits-1', assumptions: { scoreComparison: 'Same upgrade assumptions' },
  summary: { characters: 341 }, characters: Array.from({ length: 341 }, (_, index) => ({
    id: `CHARACTER${index}`, target: { name: 'Combat Utility', combatModel: { leaderId: 'LEADER', matchups: [{ weight: 1 }] } },
    before: { stats: { speed: { value: 250 } }, sets: [{ name: 'health', count: 3 }], score: { total: 123.456789, combat } },
    beforeProjectedScore: { total: 130 },
    after: { stats: { speed: { value: 300 } }, score: { total: 154.33405614489035, combat, marginalUtilities: { health: 0.1, speed: 0.8 } },
      mods: [{ id: 'a', slot: 'square', primary: { type: 'Offense', value: 100 }, secondaryStats: audit }] },
    statChanges: { speed: { delta: 50 } }, scoreChange: { delta: 30.87726714489035 },
    candidateAudit: { evaluations: 1234, topCandidates: audit,
      bestByLoadout: Object.fromEntries(audit.map(candidate => [candidate.loadoutId, { bestEvaluated: candidate, bestFeasible: candidate }])),
      recommendedCandidate: audit[1], assignedCandidate: audit[0], retainedCurrentMods: true },
    messages: ['Check this result'], missedGoals: [{ stat: 'speed', minimum: 350 }]
  })) };
const started = performance.now();
const { messages, closed, requestedCode } = await runWorker(report);
const complete = messages.at(-1);
assert.equal(complete.type, 'complete');
assert.equal(complete.filename, 'optimization-analysis-2026-10-04T12-34-56-000Z.json');
assert.equal(complete.blob.type, 'application/json;charset=utf-8');
assert.equal(closed, true);
assert.equal(requestedCode, '123456789');
const exported = JSON.parse(await complete.blob.text());
assert.equal(exported.exportFormat, 'compact-analysis');
assert.equal(exported.sourceSchemaVersion, 3);
assert.deepEqual(exported.summary, report.summary);
assert.equal(exported.characters.length, report.characters.length);
exported.characters.forEach((row, index) => {
  const original = report.characters[index];
  assert.equal(row.name, index === 0 ? 'Named character' : original.id);
  for (const key of ['statChanges', 'scoreChange', 'target', 'messages', 'missedGoals']) assert.deepEqual(row[key], original[key]);
  assert.equal(row.beforeProjectedScore.total, original.beforeProjectedScore.total);
  for (const key of ['before', 'after']) {
    assert.deepEqual(row[key].stats, original[key].stats);
    assert.equal(row[key].score.total, original[key].score.total);
    assert.equal(row[key].score.combat.utility, combat.utility);
    const scenario = row[key].score.combat.scenarios[0];
    assert.equal(scenario.self.dps, combat.scenarios[0].self.dps);
    assert.equal(scenario.self.healingRate, 5);
    assert.equal(scenario.self.temporaryProtection, 10000);
    assert.equal(scenario.self.incomingControlCleanseCoverage, 0.75);
    assert.equal(scenario.self.incomingDamageImmunityCoverage, 0.5);
    assert.equal(scenario.assumptions.incomingDamageImmunityPolicy, 'ordinary-channel-duration');
    assert.equal(scenario.assumptions.temporaryProtectionPolicy, 'bounded-capacity');
    assert.equal(scenario.assumptions.incomingControlCleansePolicy, 'source-filtered');
    assert.equal(scenario.assumptions.poolConversionPolicy, 'before-stat-buffs');
    assert.equal(scenario.assumptions.battleContext, null);
    assert.equal(scenario.self.statVector, undefined);
    assert.equal(scenario.unresolvedStateCount, 50);
    assert.equal(scenario.unresolvedStateSample.length, 10);
  }
  assert.deepEqual(row.before.sets, original.before.sets);
  assert.deepEqual(row.after.score.marginalUtilities, original.after.score.marginalUtilities);
  assert.equal(row.candidateAudit.evaluations, 1234);
  assert.equal(row.candidateAudit.retainedCurrentMods, true);
  assert.equal(row.candidateAudit.topCandidates.length, 5);
  assert.equal(row.candidateAudit.recommendedCandidate.score.total, audit[1].score.total);
  assert.equal(row.candidateAudit.assignedCandidate.score.total, audit[0].score.total);
  assert.equal(row.candidateAudit.topCandidates[0].score.combat, undefined);
  assert.equal(row.candidateAudit.loadouts.length, 80);
  assert.equal(row.candidateAudit.loadouts[0].loadoutId, '1-1-1');
  row.candidateAudit.loadouts.forEach((loadout, candidateIndex) => {
    assert.equal(loadout.bestEvaluatedScore, audit[candidateIndex].score.total);
    assert.equal(loadout.bestFeasibleScore, audit[candidateIndex].score.total);
  });
  assert.equal(row.after.mods[0].secondaryStats, undefined);
});
// Estimate the old export size without allocating hundreds of MB of JSON.
const previousBytes = Buffer.byteLength(JSON.stringify(report.characters[0], null, 2)) * 341;
assert.ok(complete.blob.size < 5 * 1048576);
assert.ok(complete.blob.size < previousBytes / 50);
assert.equal(report.characters[0].candidateAudit.topCandidates.length, 80);
assert.ok(report.characters[0].candidateAudit.topCandidates[0].score.combat);
assert.ok(messages.filter(message => message.type === 'progress').length > 20);
console.log(`Compact report passed: 341 characters, estimated ${(previousBytes / 1048576).toFixed(1)} MB full export -> ${(complete.blob.size / 1048576).toFixed(2)} MB, ${Math.round(performance.now() - started)} ms. Stats, values, combat summaries and all loadout scores preserved; repeated diagnostics removed without changing saved data.`);

for (const [input, failure, expected] of [
  [null, null, 'Run an optimization'], [{ characters: null }, null, 'no character results'],
  [report, 'open', 'Open failed'], [report, 'read', 'Read failed'], [report, 'blocked', 'blocked']
]) {
  const result = await runWorker(input, failure);
  assert.equal(result.messages.at(-1).type, 'error');
  assert.ok(result.messages.at(-1).message.includes(expected));
  if (failure !== 'open' && failure !== 'blocked') assert.equal(result.closed, true);
}
const empty = await runWorker({ generatedAt: 'now', characters: [] });
const emptyReport = JSON.parse(await empty.messages.at(-1).blob.text());
assert.equal(emptyReport.generatedAt, 'now');
assert.deepEqual(emptyReport.characters, []);
const legacy = await runWorker({ characters: [{ id: 'LOCKED', status: 'locked', before: { score: null }, after: { score: null } }] });
const legacyRow = JSON.parse(await legacy.messages.at(-1).blob.text()).characters[0];
assert.equal(legacyRow.before.score, null);
assert.equal(legacyRow.after.score, null);
assert.equal(legacyRow.candidateAudit, null);

// Exercise the UI-facing adapter's progress, failure and cleanup paths.
const adapterSource = fs.readFileSync('src/utils/exportOptimizationReport.js', 'utf8')
  .replace('export default function', 'function') + '\nself.prepare = prepareOptimizationReport;';
let activeWorker;
let timerCallback;
let timerCleared;
class MockWorker {
  constructor(url) { assert.equal(url, '/workers/exportOptimizationReport.js'); activeWorker = this; }
  postMessage(data) { this.input = data; }
  terminate() { this.terminated = true; }
}
const adapter = vm.createContext({ self: {}, Worker: MockWorker, process: { env: {} },
  setTimeout(callback) { timerCallback = callback; timerCleared = false; return 1; },
  clearTimeout() { timerCleared = true; }
});
vm.runInContext(adapterSource, adapter);
const progress = [];
const success = adapter.self.prepare('123', { A: 'Name' }, value => progress.push(value));
assert.equal(activeWorker.input.allyCode, '123');
activeWorker.onmessage({ data: { type: 'progress', message: 'Preparing' } });
activeWorker.onmessage({ data: complete });
assert.equal((await success).blob, complete.blob);
assert.deepEqual(progress, ['Preparing']);
assert.equal(activeWorker.terminated, true);
assert.equal(timerCleared, true);
for (const fail of [
  () => activeWorker.onmessage({ data: { type: 'error', message: 'Database failed' } }),
  () => activeWorker.onerror({ message: 'Worker failed' }),
  () => activeWorker.onmessageerror(),
  () => timerCallback()
]) {
  const pending = adapter.self.prepare('123', {});
  fail();
  await assert.rejects(pending);
  assert.equal(activeWorker.terminated, true);
  assert.equal(timerCleared, true);
}
console.log('Export progress, empty/missing reports, storage errors, blocked storage, worker errors and timeout cleanup passed.');
