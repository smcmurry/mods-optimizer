import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createFrontendLoader} from './lib/loadFrontend.mjs';
const load = createFrontendLoader();
const settings = load('src/constants/characterSettings.js').default;
const report = JSON.parse(fs.readFileSync('reports/roster-mode-comparison/414556856.json'));
const before = JSON.parse(fs.readFileSync('reports/roster-mode-comparison/414556856-before-full-review.json'));
// Review notes are judgments about this saved roster, not universal optimal builds.
const notes = Object.fromEntries(`GLLEIA|Health primaries and high Speed fit; retained.
GREATMOTHERS|Fast, durable support build; retained.
BAYLANSKOLL|Protection-heavy build fits tank role; confirm opening speed with intended squad.
CAPTAINDROGAN|Offense and critical damage fit damage role; retained.
R2D2_LEGENDARY|Potency weight raised 5 to 20; Health and both Offense weights remain 100. Same available build wins.
MORGANELSBETH|Durable Protection build; health-versus-protection balance depends on squad and battle recovery. No clear preset defect.
PADAWANOBIWAN|Offense arrow sacrifices speed for damage; reasonable damage focus, but review squad timing.
MASTERQUIGON|Health and Speed support build; retained.
CAPTAINREX|Previous Speed/survival correction retained.
SHINHATI|Damage primaries with Speed arrow fit; retained.
COMMANDERLUKESKYWALKER|Damage/control mix fits. Check Chewbacca Guard on the complete squad, including Han.
MARROK|Fast utility build; damage primaries alone do not establish a weight error.
GRANDADMIRALTHRAWN|Speed and durability fit turn passing/control; retained.
SEVENTHSISTER|Crit Damage triangle is a questionable survival tradeoff. Low Potency is not automatically wrong: special cannot be resisted and basic has Jedi exceptions. Matchup-dependent.
THEMANDALORIANBESKARARMOR|Offense fits; birds timing requires team-aware speed tuning, not a universal weight change.
DEATHTROOPERPERIDEA|Corrected zero Physical Offense weight: added Physical damage preset while retaining Crit Damage emphasis.
KELLERANBEQ|Protection-heavy build fits; retained.
ADMIRALRADDUS|Speed and durability remain appropriate; retained.
HERMITYODA|Pure Speed default lacks survival tie-breaking, but actual build is durable. Healing uses ally percentages, not his own Health. No forced change.
NIGHTTROOPER|Health/damage mix fits. Potency primary comes from meta restrictions despite zero Potency weight; watch rather than infer a bad weight.
C3POCHEWBACCA|Offense build fits; actual damage also depends on leader stat sharing.
SHAAKTI|Fast, durable support build; retained.
WAMPA|Health/Tenacity solo preset retained; matchup and omicron determine how much more Tenacity is useful.
CAPTAINENOCH|Health/Speed support build; retained.
EMPERORPALPATINE|Potency/control build fits; retained.
NIGHTSISTERSPIRIT|Damage primaries fit; speed loss is a tradeoff, not enough evidence for a correction.
SCOUTTROOPER_V3|Fast build with substantial Potency; no clear mismatch.
BOSSK|Tank build fits. Compare combat speed with Greef/Mando for the intended contract sequence.
CHEWBACCALEGENDARY|Tenacity retained for assists; verify Guard target after final squad assignments.
GRANDMASTERYODA|Speedy default is defensible for buff cycling; Offense preset may be better with frequent Jedi assists. Team-dependent, not changed globally.
FIFTHBROTHER|Protection/Speed build fits; retained.
ANAKINKNIGHT|Potency cross and limited damage warrant review for a specific lead. Padme and Qui-Gon builds have different priorities; no universal override.
4LOM|Uses generic Speed with survivability fallback, not a reviewed character-specific preset. Requires a separate kit-specific preset review; current stats alone cannot validate it.
BOBAFETT|Managed default changed from PvE to existing PvP preset. Build remains slow: restrictions and available mods still constrain it.
AHSOKATANO|Damage focus fits assist role; retained.
ZUCKUSS|Uses generic Speed with survivability fallback, not a reviewed character-specific preset. Slow durable result needs kit/squad-specific review.
FULCRUMAHSOKA|Offense/Crit Damage focus fits; mode and omicron matter.
PAZVIZSLA|Protection-heavy tank build; retained.
EIGHTHBROTHER|Mixed offense/survival; no clear weight error from current pool.
MACEWINDU|Revised toward Health/Protection and reduced Potency/Special Damage; Health supports both tanking and basic bonus damage.
GREEFKARGA|Durable support build, but slower than Mando in displayed stats. Check team turn order and in-battle bonuses.
THEMANDALORIAN|Defense cross is an inventory fallback; flag rather than treat as ideal. Contract timing needs squad-level constraints.
LOBOT|Support durability/Speed build; retained.
FENNECSHAND|Special Offense weighting is correct; her attacks deal Special damage despite the weapon animation.
NINTHSISTER|Durability weighting fits; no clear need to replace with a pure Health preset.
DENGAR|Potency/control build fits; retained.
GEONOSIANBROODALPHA|Durability and Speed fit support/tank role; retained.
OLDBENKENOBI|Crit Damage triangle is an inventory fallback, not an ideal tank primary.
SABINEWRENS3|Damage primaries reasonable, but preferred build unavailable. Verify remaining sets.
HERASYNDULLAS3|Durable support build; retained.
PRINCESSKNEESAA|Crit Chance emphasis and Health cross merit team-specific review; do not judge damage from speed alone.
CARADUNE|Crit Damage triangle is encouraged by Crit Damage weight 100 as well as relaxed restrictions. Clear tank/control concern under a Rebel leader; Scoundrel and Rebel behavior differ, so use a team-specific durable preset.
HOTHLEIA|Potency plus damage/control mix; no clear correction.
EZRABRIDGERS3|Damage focus fits; retained.
REY|This ID is Scavenger Rey, not Galactic Legend Rey. Tenacity cross is an inventory fallback; not an ideal damage primary.
SECONDSISTER|Special Offense/Crit Damage weights fit. Potency cross is driven by primary choices, not her zero Potency weight.
ADMIRALACKBAR|Durable support build; retained.
PRINCESSLEIA|Damage primaries fit; opening speed depends on intended team.
HOTHHAN|Support Health/Tenacity build; retained.
IG11|Health-heavy build fits; retained.
IG88|Damage primaries fit, but preferred set/primary constraints had to be dropped.
STORMTROOPERHAN|Potency 100 looks aggressive, but Bluff removes enemy turn meter, so Potency is not useless. Consider a tank-first alternative; not silently zeroed.
CHOPPERS3|Durable support build; speed loss should be judged in the intended squad.
KUIIL|Added shared-Offense value and more Health/Protection while preserving strong Speed priority.
CHIEFCHIRPA|Crit Damage triangle is a poor support primary despite satisfying meta rules. Weight changes alone may not overcome primary/set preference.
ADMINISTRATORLANDO|Crit Chance/damage fit; preferred build unavailable at this priority.
WICKET|Damage build fits; preferred build unavailable at this priority.
BIGGSDARKLIGHTER|Damage build fits; preferred build unavailable at this priority.
LUKESKYWALKER|Farmboy Luke damage build is reasonable, but preferred build unavailable.`.split('\n').map(line => line.split('|')));
const rows = report.modes.weights.rows;
assert.equal(rows.length,69);
assert.deepEqual(new Set(rows.map(r=>r.id)),new Set(Object.keys(notes)),'Every recommendation has an individual review');
const warnings = rows.filter(r=>r.messages.length);
const lines = ['# Full stat-weight recommendation review — 414556856', '',
'Reviewed all 69 selected characters using the same November 2 saved inventory and priority order. These are role-based judgments and projected stats, not battle simulations. No roster refresh or in-game changes were performed.', '',
'## Changes and measured results', '',
'R2 Potency is now 20 (was 5), below Health and both Offense weights of 100. Raw weights use different stat normalization scales. Boba now uses his existing PvP default. Mace uses Durable control; Kuiil uses Shared stats; Death Trooper (Peridea) now values Physical Offense rather than only Crit Damage. Legacy presets and custom plans are preserved.', '',
'| Character | Speed before → after | Health before → after | Protection before → after | Physical / Special Offense after | Potency before → after |',
'|---|---:|---:|---:|---:|---:|'];
for (const id of ['R2D2_LEGENDARY','BOBAFETT','MACEWINDU','KUIIL','DEATHTROOPERPERIDEA']) {
 const a=rows.find(r=>r.id===id).after.stats,b=before.modes.weights.rows.find(r=>r.id===id).after.stats;
 lines.push(`| ${id} | ${b.Speed} → ${a.Speed} | ${b.Health} → ${a.Health} | ${b.Protection} → ${a.Protection} | ${a['Physical Damage']} / ${a['Special Damage']} | ${b.Potency.toFixed(1)}% → ${a.Potency.toFixed(1)}% |`);
}
lines.push('', 'R2 and Boba select the same mods despite the corrected priorities. Higher stat weight is not a minimum stat requirement. Do not interpret these unchanged results as proof the weights are unused.', '',
'## Outstanding issues', '',
`- ${warnings.length} characters have optimizer warning messages; these builds must not be presented as ideal recommendations.`,
'- Inventory depletion: Mando Defense cross, Old Ben damage triangle and Scavenger Rey Tenacity cross are conspicuous compromises.',
'- Other preset concerns: Cara has excessive Crit Damage emphasis for a Rebel tank/control role; 4-LOM and Zuckuss still have generic fallback weights rather than character-specific presets.',
'- Primary/set preference: Chief Chirpa and Seventh Sister can get damage triangles despite support weights. Boba can remain slow even with a faster preset. The current meta-preference rules can dominate these choices.',
'- Squad tuning: Bossk/Greef/Mando turn order, Beskar Mando birds, and Chewbacca Guard need squad-aware checks. Raw displayed Speed alone cannot settle combat order.',
'- Context-dependent alternatives: GMY Offense, Anakin lead-specific builds, Kneesaa damage balance, and Stormtrooper Han tank-first weights merit explicit squad/mode choices rather than a universal override.', '',
'## All recommendations', '',
'| Priority | Character | Speed | Health | Protection | Review |', '|---:|---|---:|---:|---:|---|');
for (const row of rows) {
 const s=row.after.stats;
 lines.push(`| ${row.priority} | ${row.id} | ${s.Speed} | ${s.Health} | ${s.Protection} | ${notes[row.id]}${row.messages.length?' **Optimizer warning: '+row.messages.join(' ')+'**':''} |`);
}
lines.push('', '## Sources for investigated standouts', '',
...['r2-d2','boba-fett','mace-windu','kuiil','death-trooper-peridea','cara-dune','seventh-sister','stormtrooper-han','hermit-yoda','fennec-shand','grand-master-yoda','the-mandalorian','greef-karga','princess-kneesaa'].map(slug=>`- [${slug} kit](https://swgoh.gg/units/${slug}/)`), '',
'## Verification', '',
'All three optimizer modes completed with 69 complete builds and no duplicate assignments. GG-mode outputs remain unchanged. Preset migration/custom-plan preservation is covered by testTopTwoMeta.mjs.');
fs.writeFileSync('reports/roster-mode-comparison/414556856-full-review.md',lines.join('\n')+'\n');
console.log('Reviewed',rows.length,'characters;',warnings.length,'characters have optimizer warnings.');
for (const row of rows) console.log(row.id,settings[row.id].targets[0].name,JSON.stringify(Object.fromEntries(Object.entries(settings[row.id].targets[0]).filter(([key,value])=>key.startsWith('raw')&&value))));
