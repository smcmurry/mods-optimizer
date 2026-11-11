import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

// One offline command for source expectations and production-engine checks.
// These checks verify their named mechanics, not whole-kit certification.
const checks = ['syncCombatUtility', 'testCooldownUtility', 'testConditionalUtility', 'testContextUnits',
  'testDamageRecoverySource', 'testConsularRecoverySource', 'testPoolConversionSource', 'testOutgoingCriticalSource', 'testDispelUtility', 'testDamageImmunityUtility', 'testReviveImmunitySource', 'testKitSemanticReview', 'testAcceptedMechanicsAudit', 'testKitConfidence', 'testCharacterMechanics',
  'testPreprocessedPrograms', 'testOptimizerPerformance', 'testCombatUtility',
  'testMetaArchitectureV2', 'testReportExport'];
for (const check of checks) {
  const script = `scripts/${check}.mjs`;
  if (!fs.existsSync(script)) throw new Error(`Missing required checked-kit test: ${script}`);
  const result = spawnSync(process.execPath, [script], { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log('Source expectations and production checks passed. See the coverage report for remaining gaps.');
