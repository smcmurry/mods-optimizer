import characterSettings from '../constants/characterSettings';
import isManagedMetaTarget from './isManagedMetaTarget';

// Refresh generated plans without sorting or rebuilding the player's selection.
export default function refreshLegacyMetaTargets(profile) {
  if (!profile) return profile;
  return profile.withSelectedCharacters(profile.selectedCharacters.map(selection => {
    const { id, target } = selection;
    if (!isManagedMetaTarget(target)) return selection;
    const settings = characterSettings[id];
    const targets = settings ? settings.targets : [];
    const current = targets.find(isManagedMetaTarget) || targets[0];
    return current ? { ...selection, target: current } : selection;
  }));
}
