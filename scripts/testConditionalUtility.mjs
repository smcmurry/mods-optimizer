import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
const require = createRequire(import.meta.url);
const utility = require('../src/domain/conditionalUtility.js');
const effects = JSON.parse(fs.readFileSync('data/gameData-cache/effect.json', 'utf8')).data;
const source = Object.fromEntries(effects.map(row => [row.id, row]));
assert.deepEqual([...utility.battleTypes].sort(), [...new Set(effects.filter(row => row.type === 32)
  .flatMap(row => row.effectedTag.map(tag => tag.tag.split(':')[0])))].sort());
const query = id => utility.compileBattleQuery(source[id]);
const context = (type, squadSize, eventId) => utility.normalizeBattleContext({ type, squadSize, eventId });
const gac3 = context('TERRITORY_TOURNAMENT_BATTLE', 3);
const gac5 = context('TERRITORY_TOURNAMENT_BATTLE', 5);
assert.deepEqual(source.query_battle_type_grandarena_3v3.effectedTag,
  [{ tag: 'TERRITORY_TOURNAMENT_BATTLE:3', exclude: false }]);
assert.equal(utility.battleQueryValue(query('query_battle_type_grandarena_3v3'), gac3), 1);
assert.equal(utility.battleQueryValue(query('query_battle_type_grandarena_3v3'), gac5), 0);
assert.equal(utility.battleQueryValue(query('query_battle_type_grandarena'), gac5), 1);
assert.equal(utility.battleQueryValue(query('query_battle_type_exclude_grandarena_3v3_CS'), gac3), 0);
assert.equal(utility.battleQueryValue(query('query_battle_type_exclude_grandarena_3v3_CS'), gac5), 1);
const either = query('query_battle_type_grandarena_or_galacticchallenge_3v3');
assert.equal(utility.battleQueryValue(either, gac3), 1);
assert.equal(utility.battleQueryValue(either, context('GALACTIC_CHALLENGE', 3)), 1);
assert.equal(utility.battleQueryValue(either, context('GALACTIC_CHALLENGE', 5)), 0);
assert.equal(utility.battleQueryValue(query('query_battle_type_territorybattle_both'), context('TERRITORY_STRIKE_BATTLE')), 1);
assert.equal(utility.battleQueryValue(query('query_battle_type_territorybattle_both'), context('TERRITORY_COVERT_BATTLE')), 1);
assert.equal(utility.battleQueryValue(query('query_battle_type_dashmarquee'), context('EVENT', undefined, 'EVENT_MARQUEE_DASHRENDAR')), 1);
assert.equal(utility.battleQueryValue(query('query_battle_type_dashmarquee'), context('EVENT', undefined, 'EVENT_MARQUEE_MARAJADE')), 0);
assert.equal(utility.battleQueryValue(query('query_battle_type_dashmarquee'), context('EVENT')), null);
assert.equal(utility.battleQueryValue(query('query_battle_type_grandarena_3v3'), context('TERRITORY_TOURNAMENT_BATTLE')), null);
assert.equal(utility.battleQueryValue(query('query_battle_type_grandarena_3v3'), null), null);
assert.equal(utility.contextualGate('zero', null), null);
assert.equal(utility.contextualGate('positive', null), null);
assert.equal(utility.contextualGate('zero', 0), true);
assert.equal(utility.contextualGate('positive', 1), true);
const parent = source.leader_stormtrooperluke_ability_block_handler_CE;
assert.ok(parent.param.includes('CONTEXTUAL_EXECUTE'));
assert.deepEqual(parent.effectReference.map(row => row.id), ['leader_stormtrooperluke_ability_block']);
const sourceScope = source.leader_stormtrooperluke_leader_all_handler_CE.effectReference;
const handlerIndex = sourceScope.findIndex(row => row.id === parent.id);
assert.equal(sourceScope[handlerIndex - 1].id, 'query_battle_type_grandarena_3v3');
const conditions = utility.appendCondition([], { id: parent.id, gate: 'positive',
  context: [query('query_battle_type_grandarena_3v3')] });
const evaluate = mode => utility.conditionsValue(conditions, condition => utility.battleQueryValue(condition.context[0], mode));
assert.equal(evaluate(gac3), true);
assert.equal(evaluate(gac5), false);
assert.equal(evaluate(null), null);
// An unconditional child cannot escape its parent's contextual restriction.
assert.equal(utility.appendCondition(conditions, { gate: null }), conditions);
const nested = utility.appendCondition(conditions, { id: 'nested', gate: 'zero', context: [] });
assert.equal(utility.conditionsValue(nested, condition => condition.id === 'nested' ? 1 : 1), false);
assert.equal(utility.conditionsValue(nested, condition => condition.id === 'nested' ? 1 : null), false);
const sacrificeScope = source.uniqueability_ct555502_no_defeat_effect_dispel_handler_u07.effectReference;
const sacrificeQuery = sacrificeScope.find(row => row.id === 'fives_query_health_self_INSTANT');
assert.deepEqual(sacrificeQuery.contextIndex, [2]);
assert.equal(source[sacrificeScope[2].id].type, 5);
const leaf = effect => effect.type === 12 ? { kind: 'stat', id: effect.id, stat: 'health' } :
  effect.type === 11 ? { kind: 'count', id: effect.id } : utility.compileBattleQuery(effect);
assert.equal(utility.compileSourceQuery(sacrificeQuery, sacrificeScope, source, leaf).kind, 'unknown');
const plainModeRef = sourceScope[handlerIndex - 1];
assert.equal(utility.compileSourceQuery(plainModeRef, sourceScope, source, leaf).kind, 'battleType');
assert.throws(() => context('TERRITORY_TOURNAMENT_BATTLE:3'));
assert.throws(() => context('NOT_A_REAL_BATTLE_TYPE'));
assert.throws(() => context('TERRITORY_TOURNAMENT_BATTLE', 3.5));
for (const effect of effects.filter(row => row.type === 32)) assert.ok(utility.compileBattleQuery(effect), effect.id);
const browser = {};
vm.runInNewContext(fs.readFileSync('src/domain/conditionalUtility.js', 'utf8'), browser);
assert.equal(browser.ConditionalUtility.battleQueryValue(either, gac3), 1);
const nestedSelectors = { kind: 'stat', targets: [{ side: 'ally', select: 2 }],
  gateContext: [{ kind: 'count', targets: [{ side: 'ally', select: 2 }],
    gateContext: [{ kind: 'count', targets: [{ side: 'ally', select: 2 }] }] }] };
const targetRule = JSON.parse(fs.readFileSync('data/gameData-cache/battleTargetingRule.json', 'utf8')).data
  .find(rule => rule.id === 'target_lowest_ally_exclude_self');
assert.equal(targetRule.excludeSelf, true);
const guarded = utility.guardQueryTargets(nestedSelectors, targets => targets.map(target =>
  ({ ...target, selectionCriteria: { sourceTargetingRuleId: targetRule.id, excludeSelf: targetRule.excludeSelf } })));
assert.equal(guarded.targets[0].selectionCriteria.excludeSelf, true);
assert.equal(guarded.gateContext[0].targets[0].selectionCriteria.excludeSelf, true);
assert.equal(guarded.gateContext[0].gateContext[0].targets[0].selectionCriteria.excludeSelf, true);
assert.equal(nestedSelectors.targets[0].selectionCriteria, undefined);
assert.equal(utility.guardQueryTargets(either, () => { throw new Error('Global query has no unit targets'); }).kind, 'battleType');
console.log(`Conditional mode predicates passed against all ${effects.filter(row => row.type === 32).length} pinned source queries; 3v3/5v5, OR, exclusion, event IDs and unknown context checked.`);
