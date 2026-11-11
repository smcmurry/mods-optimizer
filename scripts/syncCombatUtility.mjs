import fs from 'node:fs/promises';
import { ensureCombatPrograms } from './preprocessCombatPrograms.mjs';
ensureCombatPrograms();
await fs.copyFile('src/domain/conditionalUtility.js', 'public/workers/conditionalUtility.js');
await fs.copyFile('src/domain/combatUtility.js', 'public/workers/combatUtility.js');
await fs.copyFile('src/domain/characterMechanics.js', 'public/workers/characterMechanics.js');
await fs.writeFile('public/workers/characterKits.js', `self.CharacterKitData=${await fs.readFile('src/constants/generatedCombatPrograms.json', 'utf8')};\n`);
