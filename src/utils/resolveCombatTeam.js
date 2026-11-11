import CombatUtility from '../domain/combatUtility';
import ModSet from '../domain/ModSet';
import characterSettings from '../constants/characterSettings';

// Use the game's example squads and the player's actual roster. No usage
// frequencies, invented allies, or neutral basic attacks enter team utility.
export default function resolveCombatTeam(id, target, profile, gameSettings) {
  const model = CombatUtility.upgradeModel(target.combatModel, id);
  const allyLimit = Math.min(4, ((model.battleContext && model.battleContext.squadSize) || 5) - 1);
  let ids = model.teamIds, leaderId = model.leaderId || id;
  let teamSource = 'manual';
  if (model.kitEnabled && model.autoTeam !== false && !ids.length) {
    const candidates = CombatUtility.characterIds().flatMap(key => CombatUtility.getKit(key).recommendedTeams)
      .filter(team => team.includes(id));
    candidates.sort((a, b) => {
      const available = team => team.filter(key => profile.characters[key]).length;
      const gl = team => CombatUtility.getKit(team[0])?.categories.includes('galactic_legend') ? 1 : 0;
      return available(b) - available(a) || gl(b) - gl(a);
    });
    if (candidates.length) {
      const chosen = candidates[0];
      ids = chosen.filter(key => key !== id && profile.characters[key]).slice(0, allyLimit);
      leaderId = profile.characters[chosen[0]] ? chosen[0] : id;
      teamSource = 'game-example-squad';
    } else teamSource = 'no-example-squad';
  }
  const team = ids.map(allyId => {
    if (allyId === id) throw new Error('A character cannot also be selected as its own teammate.');
    const ally = profile.characters[allyId];
    if (!ally || !ally.playerValues.equippedStats) throw new Error('Selected teammate is missing from the roster: ' + allyId);
    const summary = new ModSet(profile.mods.filter(mod => mod.characterID === allyId)).getSummary(ally, target, false);
    return { id: allyId, tags: gameSettings[allyId] ? gameSettings[allyId].tags : [],
      physicalShare: characterSettings[allyId] ? characterSettings[allyId].damageType : 1,
      stats: CombatUtility.addStats({ ...ally.playerValues.equippedStats, level: ally.playerValues.level }, Object.values(summary).filter(Boolean)) };
  });
  if (leaderId !== id && !ids.includes(leaderId)) leaderId = id;
  const unitValues = {};
  [id, ...ids].forEach(memberId => {
    const values = profile.characters[memberId].playerValues;
    // RelicTier is the game's enum: locked=1, unlocked/R0=2, R1=3.
    unitValues[memberId] = { relicLevel: Math.max(0, Number(values.relicTier || 1) - 2) };
  });
  return CombatUtility.validate({ ...model, team, resolvedTeamIds: ids, leaderId, teamSource, unitValues });
}
