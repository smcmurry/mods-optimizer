import fs from 'node:fs';

// Describe every remaining source gap without treating compilation as review.
// Group exact effect IDs and parameters so common handlers can be implemented
// and checked once, then applied to every reachable character kit.
const analysis = JSON.parse(fs.readFileSync('reports/characterKitAnalysis.json', 'utf8'));
const effects = Object.fromEntries(JSON.parse(fs.readFileSync('data/gameData-cache/effect.json', 'utf8')).data.map(effect => [effect.id, effect]));
const categories = new Map();
const characters = Object.entries(analysis.characters).map(([id, kit]) => {
  const reasons = {};
  let compiled = 0, omitted = 0;
  kit.abilities.forEach(ability => {
    compiled += ability.operations.length;
    omitted += ability.omitted.length;
    ability.omitted.forEach(gap => {
      reasons[gap.reason] = (reasons[gap.reason] || 0) + 1;
      const effect = effects[gap.id];
      const params = effect?.param || [];
      const key = `${gap.reason}: ${params.slice().sort().join(', ') || '(no parameters)'}`;
      if (!categories.has(key)) categories.set(key, { reason: gap.reason, params, branches: 0, effects: new Set(), characters: new Set(), examples: [] });
      const category = categories.get(key);
      category.branches++;
      category.effects.add(gap.id);
      category.characters.add(id);
      if (category.examples.length < 5 && !category.examples.some(example => example.effectId === gap.id)) {
        category.examples.push({ characterId: id, abilityId: ability.id, effectId: gap.id,
          description: ability.description, effect });
      }
    });
  });
  return { id, name: kit.name, abilities: kit.abilities.length, compiled, omitted, reasons };
});
const report = { kitRevision: analysis.revision, source: analysis.source,
  definition: 'Source gap inventory. All named abilities included, irrespective of a selected team/leader. Branch counts do not measure gameplay fidelity.',
  characters,
  categories: [...categories.values()].sort((a, b) => b.characters.size - a.characters.size || b.branches - a.branches)
    .map(category => ({ ...category, effects: [...category.effects].sort(), characters: [...category.characters].sort() })) };
fs.writeFileSync('reports/kitCoverageBacklog.json', JSON.stringify(report, null, 2));
let markdown = `# Kit coverage backlog\n\nSource revision: ${report.kitRevision}. ${characters.length} characters checked for source gaps.\n\n${report.definition}\n\n`;
markdown += '| Gap and source parameters | Characters | Branches |\n|---|---:|---:|\n';
report.categories.forEach(category => { markdown += `| ${category.reason}: ${category.params.join(', ') || '(no parameters)'} | ${category.characters.length} | ${category.branches} |\n`; });
markdown += '\n## Per-character source inventory\n\n| Character | Abilities | Compiled operations | Omitted branches |\n|---|---:|---:|---:|\n';
characters.forEach(character => { markdown += `| ${character.name} (${character.id}) | ${character.abilities} | ${character.compiled} | ${character.omitted} |\n`; });
fs.writeFileSync('reports/kitCoverageBacklog.md', markdown);
console.log(`Inventoried ${characters.length} characters and ${report.categories.length} gap groups; source examples written to reports/kitCoverageBacklog.json.`);
