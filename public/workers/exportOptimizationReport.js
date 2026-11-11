/* Read and format large reports away from the UI thread. No scoring is rerun. */
function pick(source, keys) {
  if (!source) return null;
  const result = {};
  keys.forEach(key => { if (source[key] !== undefined) result[key] = source[key]; });
  return result;
}

function compactMetrics(metrics) {
  return pick(metrics, ['id', 'expectedDamage', 'actionRate', 'dps', 'ehp', 'healingRate',
    'protectionRecoveryRate', 'temporaryProtection', 'assistDamageRate', 'debuffSuccess', 'incomingDebuffSuccess',
    'incomingControlImmunityCoverage', 'incomingDamageImmunityCoverage', 'incomingControlCleanseCoverage', 'incomingControlLostOutput', 'kitCoverage']);
}

function compactCombat(combat) {
  if (!combat) return null;
  return {
    ...pick(combat, ['utility', 'logUtility', 'numberCrunchSharedStats', 'kitConfidence']),
    scenarios: (combat.scenarios || []).map(scenario => ({
      ...pick(scenario, ['weight', 'utility', 'teamDps', 'teamEhp', 'controlReduction',
        'healingImmunityUptime', 'enemyRecoveryPreventedRate', 'opponentStatChanges']),
      assumptions: pick(scenario.assumptions, ['battleContext', 'externalStatePolicy',
        'temporaryProtectionPolicy', 'incomingDamageImmunityPolicy', 'incomingControlCleansePolicy', 'poolConversionPolicy', 'incomingControlWeights']),
      self: compactMetrics(scenario.self), allies: (scenario.allies || []).map(compactMetrics),
      unresolvedStateCount: (scenario.unresolvedStates || []).length,
      unresolvedStateSample: (scenario.unresolvedStates || []).slice(0, 10)
    }))
  };
}

function compactScore(score, includeCombat = false) {
  if (!score) return null;
  const result = pick(score, ['total', 'statUtility', 'setPrior', 'primaryPrior', 'loadoutId',
    'observedLoadoutProbability', 'utilityRatio', 'marginalUtilities']);
  if (includeCombat) result.combat = compactCombat(score.combat);
  return result;
}

function compactCandidate(candidate) {
  if (!candidate) return null;
  return { ...pick(candidate, ['modIds', 'loadoutId', 'primaries', 'observedLoadoutProbability',
    'satisfiesOriginalRestrictions']), score: compactScore(candidate.score) };
}

function compactAudit(audit) {
  if (!audit) return null;
  return {
    ...pick(audit, ['version', 'source', 'evaluations', 'completeEvaluations', 'retainedCurrentMods']),
    recommendedCandidate: compactCandidate(audit.recommendedCandidate),
    assignedCandidate: compactCandidate(audit.assignedCandidate),
    topCandidates: (audit.topCandidates || []).slice(0, 5).map(compactCandidate),
    // Keep every evaluated set alternative, including three Health sets, but
    // omit repeated per-candidate team diagnostics and target snapshots.
    loadouts: Object.entries(audit.bestByLoadout || {}).map(([loadoutId, bucket]) => ({
      loadoutId, bestEvaluatedScore: bucket.bestEvaluated ? bucket.bestEvaluated.score.total : null,
      bestFeasibleScore: bucket.bestFeasible ? bucket.bestFeasible.score.total : null
    })),
    topObservedLoadouts: (audit.topObservedLoadouts || []).slice(0, 10),
    loadoutComparisons: audit.loadoutComparisons || []
  };
}

function compactBuild(build) {
  if (!build) return null;
  return { stats: build.stats, sets: build.sets, score: compactScore(build.score, true),
    mods: (build.mods || []).map(mod => pick(mod, ['id', 'slot', 'set', 'level', 'pips', 'primary'])) };
}

function compactCharacter(character, name) {
  return {
    ...pick(character, ['id', 'priority', 'status', 'changed', 'baseStats', 'unmoddedStats',
      'optimizerSettings', 'statChanges', 'scoreChange']), name,
    target: pick(character.target, ['name', 'weights', 'primaryStatRestrictions', 'setRestrictions',
      'targetStats', 'useOnlyFullSets', 'upgradeMods', 'scoringModel', 'combatModel']),
    before: compactBuild(character.before), beforeProjectedScore: compactScore(character.beforeProjectedScore),
    after: compactBuild(character.after), candidateAudit: compactAudit(character.candidateAudit),
    messages: (character.messages || []).slice(0, 20), missedGoals: (character.missedGoals || []).slice(0, 20)
  };
}

self.onmessage = async ({ data }) => {
  let database;
  try {
    self.postMessage({ type: 'progress', message: 'Loading saved report…' });
    database = await new Promise((resolve, reject) => {
      const request = indexedDB.open('ModsOptimizer');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('The saved report database is blocked. Close other optimizer tabs and try again.'));
    });
    const report = await new Promise((resolve, reject) => {
      const transaction = database.transaction(['lastRuns'], 'readonly');
      const request = transaction.objectStore('lastRuns').get(data.allyCode);
      request.onsuccess = () => resolve(request.result && request.result.optimizationReport);
      request.onerror = () => reject(request.error);
      transaction.onabort = () => reject(transaction.error || new Error('Reading the saved report was interrupted.'));
    });
    if (!report) throw new Error('Run an optimization with this version first, then export its report.');
    if (!Array.isArray(report.characters)) throw new Error('The saved report has no character results. Run another optimization to create a new report.');
    database.close();
    database = null;

    // Serialize each row separately instead of allocating a second, deeply
    // indented copy of the entire run and one enormous JSON string.
    const { characters } = report;
    const header = { ...pick(report, ['generatedAt', 'scoringVersion', 'candidateAuditVersion',
      'kitRevision', 'kitSource', 'preprocessing', 'assumptions', 'globalSettings', 'summary']),
      exportFormat: 'compact-analysis', exportVersion: 1, sourceSchemaVersion: report.schemaVersion,
      exportNotes: 'Includes all roster stats and value changes, before/after combat summaries, five top candidates and scores for all evaluated loadouts. Omits repeated reference/team stat vectors, per-candidate combat diagnostics, full state traces, secondary mod details and duplicate target snapshots. Unresolved states are limited to ten samples per scenario; messages and missed goals to twenty per character. Scores from different character targets are not directly comparable.' };
    const parts = [JSON.stringify(header, null, 2).slice(0, -1), ',\n"characters": [\n'];
    for (let index = 0; index < characters.length; index++) {
      const character = characters[index];
      const name = data.names[character.id] || character.id;
      // One compact JSON row per character makes the file readable without
      // multiplying its size with indentation on deeply nested diagnostics.
      parts.push(JSON.stringify(compactCharacter(character, name)));
      if (index < characters.length - 1) parts.push(',\n');
      if (index % 8 === 0 || index === characters.length - 1) {
        self.postMessage({ type: 'progress', message: `Preparing report: ${index + 1}/${characters.length} characters…` });
      }
    }
    parts.push('\n]\n}\n');
    self.postMessage({ type: 'progress', message: 'Preparing download…' });
    const blob = new Blob(parts, { type: 'application/json;charset=utf-8' });
    const timestamp = String(report.generatedAt || new Date().toISOString()).replace(/[:.]/g, '-');
    self.postMessage({ type: 'complete', blob, filename: `optimization-analysis-${timestamp}.json` });
  } catch (error) {
    self.postMessage({ type: 'error', message: error.message || String(error) });
  } finally {
    if (database) database.close();
  }
};
