// Roster relicTier uses 2 for R0, 3 for R1, etc. Below G13 is unreliced.
// Bounded, modest adjustment: close relic levels remain close in priority.
export function relicInvestmentMultiplier(playerValues = {}) {
  const tier = Number(playerValues && playerValues.relicTier);
  const gear = Number(playerValues && playerValues.gearLevel);
  if (!Number.isFinite(gear) || gear < 13 || !Number.isFinite(tier) || tier < 2) return 1;
  const level = Math.max(0, Math.floor(tier) - 2);
  return 1 + Math.min(0.20, level * 0.02);
}

export default function kyberRelicPriority(averageSecondarySpeed, playerValues) {
  return averageSecondarySpeed * relicInvestmentMultiplier(playerValues);
}
