// Recognize reverted set-aligned plans so saved profiles return to legacy defaults.
export default function isManagedMetaTarget(target) {
  return Boolean(target && (target.name.startsWith('Original weights (') ||
    target.name.startsWith('Set-aligned weights (') || target.name.startsWith('Kyber Meta') ||
    target.name === 'Combat Utility' || target.combatModel));
}
