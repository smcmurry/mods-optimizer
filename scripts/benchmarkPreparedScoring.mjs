import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import inspector from 'node:inspector';
import { createRequire } from 'node:module';

// Production prepared interpreter, warmed with detailed evaluations. This
// measures candidate scoring, not mod search, roster import, or kit accuracy.
// Character IDs match the local replay; teammates use kit-recommended teams,
// not the ally fixture's saved settings. Every candidate stat stays runtime.
const require = createRequire(import.meta.url);
const combat = require('../src/domain/combatUtility');
const mechanics = require('../src/domain/characterMechanics');
const args = process.argv.slice(2);
const iterations = args.includes('--iterations') ? Number(args[args.indexOf('--iterations') + 1]) : 3000;
if (!Number.isInteger(iterations) || iterations < 1) throw new Error('--iterations must be a positive integer');
const stats = { health: 65000, protection: 70000, speed: 190, physDmg: 7000, specDmg: 5500,
  physCritChance: 55, specCritChance: 35, critDmg: 150, armor: 550, resistance: 400,
  potency: 80, tenacity: 90, accuracy: 0, critAvoid: 0, level: 85 };
const ids = ['R2D2_LEGENDARY', 'HERMITYODA', 'THIRDSISTER', 'BENSOLO'];
const models = ids.map(id => {
  const model = combat.forCharacter(id), team = combat.getKit(id).recommendedTeams[0] || [];
  model.leaderId = team[0] || id;
  model.team = team.filter(ally => ally !== id && combat.getKit(ally)).slice(0, 4)
    .map(id => ({ id, stats: { ...stats, speed: 240 } }));
  return model;
});
for (const model of models) for (const enemy of model.matchups) mechanics.evaluate(stats, model, enemy);

// Optional profiles stay in the OS temporary directory. Sampling adds overhead;
// compare runs with the same profiling mode and avoid concurrent optimization.
let session, post;
if (args.includes('--profile')) {
  session = new inspector.Session(); session.connect();
  post = (method, params) => new Promise((resolve, reject) => session.post(method, params,
    (error, result) => error ? reject(error) : resolve(result)));
  await post('Profiler.enable');
  await post('Profiler.setSamplingInterval', { interval: 100 });
  await post('Profiler.start');
}
const timings = [], started = performance.now();
let checksum = 0;
for (const model of models) {
  const characterStarted = performance.now();
  for (let index = 0; index < iterations; index++) for (const enemy of model.matchups) {
    checksum += mechanics.evaluate({ ...stats, speed: 190 + index % 170,
      health: 65000 + index % 100 * 100, physDmg: 7000 + index % 40 * 10 }, model, enemy, true);
  }
  timings.push({ id: model.characterId, milliseconds: Math.round(performance.now() - characterStarted),
    evaluations: iterations * model.matchups.length, allies: model.team.map(ally => ally.id),
    scenarios: model.matchups.length, modelBytes: JSON.stringify(model).length });
}
const milliseconds = Math.round(performance.now() - started);
let profilePath;
if (session) {
  const { profile } = await post('Profiler.stop'); session.disconnect();
  profilePath = path.join(os.tmpdir(), `prepared-scoring-${process.pid}.cpuprofile`);
  fs.writeFileSync(profilePath, JSON.stringify(profile));
}
console.log(JSON.stringify({ workload: 'warm-prepared-scalar-recommended-teams-v1',
  nodeVersion: process.version, platform: process.platform, kitRevision: mechanics.revision,
  profiling: !!session, iterations, evaluations: timings.reduce((sum, row) => sum + row.evaluations, 0),
  milliseconds, checksum, timings, ...(profilePath ? { profilePath } : {}) }, null, 2));
