import fs from 'node:fs';
import path from 'node:path';
const filename = process.argv[2];
const allyCode = process.argv[3] || '297546974';
if (!/^\d{9}$/.test(allyCode)) throw new Error('Supply a nine-digit ally code.');
if (!filename) throw new Error('Supply an existing optimization report to import its order, targets and settings.');
const report = JSON.parse(fs.readFileSync(filename, 'utf8'));
const characters = report.characters.filter(row => row.priority != null).sort((a, b) => a.priority - b.priority);
if (!characters.length) throw new Error('This report has no optimization priorities.');
if (new Set(characters.map(row => row.id)).size !== characters.length || characters.some(row => !row.id || !row.target)) {
  throw new Error('The report must contain unique character IDs with targets.');
}
const config = { sourceReport: path.basename(filename), globalSettings: report.globalSettings,
  characters: characters.map(row => ({ id: row.id, target: row.target, optimizerSettings: row.optimizerSettings })) };
const directory = path.resolve('data/optimizer-fixtures', allyCode);
fs.mkdirSync(directory, { recursive: true });
fs.writeFileSync(path.join(directory, 'run-settings.json'), JSON.stringify(config));
console.log(`Imported ${characters.length} ordered character targets; roster/mod data and browser saves are unchanged.`);
