import React from 'react';
import ReactDOM from 'react-dom';
import {act, Simulate} from 'react-dom/test-utils';
import {RecommendedSlices} from './RecommendedSlices';
import Mod from '../../domain/Mod';
import Stat from '../../domain/Stat';

const mod = (id, level = 15, pips = 5) => new Mod(id, 'triangle', {name: 'speed'}, level, pips,
  new Stat('Critical Damage %', '36'), [new Stat('Speed', '20', 4), new Stat('Offense %', '.8', 2),
    new Stat('Health %', '.8', 1), new Stat('Protection %', '1.5', 1)], null, pips === 5 ? 5 : 1);

it('filters readiness and dots, and expands a long ranking', () => {
  const container = document.createElement('div');
  const mods = Array.from({length: 51}, (_, i) => mod(String(i).padStart(2, '0')));
  mods.push(mod('level-first', 12), mod('six-dot', 15, 6));
  act(() => { ReactDOM.render(<RecommendedSlices mods={mods} gameSettings={{}} />, container); });
  expect(container.textContent).toContain('Average at 6A');
  expect(container.textContent).toContain('Average at 5A');
  expect(container.textContent).toContain('Potential at 6A');
  expect(container.querySelectorAll('tbody tr').length).toBe(50);
  act(() => Simulate.click(Array.from(container.querySelectorAll('button')).find(button => button.textContent === 'Show 50 more')));
  expect(container.querySelectorAll('tbody tr').length).toBe(52);
  act(() => Simulate.change(container.querySelector('[aria-label="Mod dots"]'), {target: {value: '6'}}));
  expect(container.querySelectorAll('tbody tr').length).toBe(1);
  expect(container.textContent).toContain('six-dot');
  expect(container.textContent).toContain('Average at 5A: N/A — already 6-dot');
  act(() => Simulate.change(container.querySelector('[aria-label="Mod dots"]'), {target: {value: '5'}}));
  act(() => Simulate.change(container.querySelector('input'), {target: {checked: true}}));
  act(() => Simulate.click(Array.from(container.querySelectorAll('button')).find(button => button.textContent === 'Show 50 more')));
  expect(container.textContent).toContain('Level 12 → 15 first');
  expect(container.querySelectorAll('tbody tr').length).toBe(52);
  act(() => Simulate.click(Array.from(container.querySelectorAll('button')).find(button => button.textContent === 'Largest next-slice improvement')));
  expect(container.textContent).toContain('Average next-slice gain');
  expect(container.querySelectorAll('tbody tr').length).toBe(50);
  expect(container.querySelector('[aria-label="Mod dots"]').value).toBe('5');
  expect(container.querySelector('input').checked).toBe(true);
  expect(container.textContent).toContain('After slice:');
  act(() => Simulate.click(Array.from(container.querySelectorAll('button')).find(button => button.textContent === 'Largest next-slice improvement')));
  expect(container.textContent).toContain('Average at 6A');
  expect(container.textContent).toContain('Average next-slice gain');
  act(() => Simulate.click(Array.from(container.querySelectorAll('button')).find(button => button.textContent === 'Highest potential at 6A')));
  expect(container.textContent).toContain('Slice priority by highest potential at 6A');
  expect(container.querySelectorAll('[aria-pressed="true"]').length).toBe(1);
  expect(container.querySelector('[aria-label="Mod dots"]').value).toBe('5');
  expect(container.textContent).toContain('Potential at 6A');
  act(() => { ReactDOM.unmountComponentAtNode(container); });
});

it('explains an empty recommendation list', () => {
  const container = document.createElement('div');
  act(() => { ReactDOM.render(<RecommendedSlices mods={[]} gameSettings={{}} />, container); });
  expect(container.textContent).toContain('No eligible mods match these filters');
  expect(container.querySelector('table')).toBeNull();
  act(() => { ReactDOM.unmountComponentAtNode(container); });
});

it('separates scouting material groups, preserves the benchmark across filters, and cancels stale work', async () => {
  const container=document.createElement('div');
  const five=mod('five-b'); five.tier=4; five.secondaryStats[1]=new Stat('Offense %','.4',1);
  const mods=[five,mod('promotion'),mod('free',15,6)];
  let screen;
  act(()=>{screen=ReactDOM.render(<RecommendedSlices mods={mods} gameSettings={{}} />,container);});
  const choose=label=>act(()=>Simulate.click(Array.from(container.querySelectorAll('[aria-label="Ranking mode"] button')).find(button=>button.textContent===label)));
  const ids=()=>Array.from(container.querySelectorAll('tbody small')).map(el=>el.textContent);
  choose('5-dot scouting / Mk 1');
  await act(async()=>{await screen.scoutingTask;});
  expect(ids()).toEqual(['five-b']);
  expect(container.textContent).toContain('Chance to beat benchmark');
  expect(container.textContent).toContain('Next-slice cost: 500 Mk 1');
  expect(container.querySelector('[aria-label="Recommendation"]').disabled).toBe(true);
  expect(container.querySelector('[aria-label="Mod dots"]').disabled).toBe(true);
  expect(container.querySelector('[aria-label="Mk 1 planning budget"]')).toBeNull();
  const benchmark=screen.state.scoutingBenchmark;
  act(()=>Simulate.change(container.querySelector('[aria-label="Set"]'),{target:{value:'health'}}));
  expect(ids()).toEqual([]);
  expect(screen.state.scoutingBenchmark).toBe(benchmark);
  act(()=>Simulate.change(container.querySelector('[aria-label="Set"]'),{target:{value:'all'}}));
  choose('6-dot scouting / Mk 2');
  await act(async()=>{await screen.scoutingTask;});
  expect(ids().sort()).toEqual(['free','promotion']);
  expect(container.textContent).not.toContain('Infinity');
  expect(container.textContent).toContain('Next-slice cost: 110 Mk 2');
  expect(container.textContent).toContain('5A → 6D');
  expect(container.textContent).toContain('including the free 6E → 6D roll');
  choose('5-dot scouting / Mk 1');
  const pending=screen.scoutingTask;
  choose('Expected score at 6A');
  await act(async()=>{await pending;});
  expect(container.querySelector('caption').textContent).toContain('expected GG-style score at 6A');
  expect(container.querySelector('[aria-label="Recommendation"]').disabled).toBe(false);
  act(()=>{ReactDOM.unmountComponentAtNode(container);});
});
it('offers material rankings in the same buttons and retains shared filters', () => {
  const container = document.createElement('div');
  const fiveB = mod('five-b');
  fiveB.tier = 4;
  fiveB.secondaryStats[1] = new Stat('Offense %', '.4', 1);
  const mods = [fiveB, mod('promotion'), mod('free', 15, 6)];
  const leveling = mod('leveling-promotion', 9);
  leveling.secondaryStats[0] = new Stat('Speed', '15', 3);
  mods.push(leveling);
  act(() => { ReactDOM.render(<RecommendedSlices mods={mods} gameSettings={{}} />, container); });
  const choose = label => act(() => Simulate.click(Array.from(container.querySelectorAll('[aria-label="Ranking mode"] button')).find(button => button.textContent === label)));
  const ids = () => Array.from(container.querySelectorAll('tbody small')).map(el => el.textContent);
  act(() => Simulate.change(container.querySelector('[aria-label="Set"]'), {target:{value:'speed'}}));
  choose('5-dot gain / Mk 1');
  expect(ids()).toEqual(['five-b']);
  expect(container.textContent).toContain('Cost: 500 Mk 1');
  expect(container.textContent).toContain('Expected top-300 total gain to 6A');
  expect(container.textContent).toContain('Future Mk 2 upgrades are assumed funded');
  expect(container.querySelector('[aria-label="Mod dots"]').disabled).toBe(true);
  choose('6-dot gain / Mk 2');
  expect(ids().sort()).toEqual(['free','promotion']);
  expect(container.textContent).toContain('Cost: 175 Mk 2');
  expect(container.querySelector('input[type="checkbox"]').disabled).toBe(false);
  act(() => Simulate.change(container.querySelector('input[type="checkbox"]'), {target:{checked:true}}));
  expect(ids()).toContain('leveling-promotion');
  expect(container.textContent).toContain('Level 9 → 15 first');
  act(() => Simulate.change(container.querySelector('input[type="checkbox"]'), {target:{checked:false}}));
  expect(ids()).not.toContain('leveling-promotion');
  expect(container.querySelector('[aria-label="Set"]').value).toBe('speed');
  act(() => Simulate.change(container.querySelector('[aria-label="Cost scope"]'), {target:{value:'next'}}));
  expect(ids()[0]).toBe('free');
  expect(container.textContent).toContain('Free · positive gain');
  expect(container.textContent).toContain('Cost: 110 Mk 2');
  act(() => Simulate.change(container.querySelector('[aria-label="Set"]'), {target:{value:'health'}}));
  expect(ids()).toEqual([]);
  choose('Expected score at 6A');
  expect(container.querySelector('[aria-label="Cost scope"]')).toBeNull();
  expect(container.querySelector('[aria-label="Mod dots"]').disabled).toBe(false);
  expect(container.querySelector('[aria-label="Set"]').value).toBe('health');
  act(() => { ReactDOM.unmountComponentAtNode(container); });
});

it('hides current scores at or above the target only in chance mode', () => {
  const container = document.createElement('div');
  let screen;
  act(() => { screen = ReactDOM.render(<RecommendedSlices mods={[]} gameSettings={{}} />, container); });
  const forecasts = [59.99, 60, 61].map(score => ({mod: mod(String(score)), score,
    expectedScore: 75, potentialScore: 85, targetChance: .9, remainingRolls: 4,
    expectedTop300Gain: 10, gainPerSlice: 2, remainingSlices: 5, primaryFit: 1}));
  screen.getRecommendations = () => forecasts;
  screen.getTargetForecasts = rows => rows;
  act(() => { screen.forceUpdate(); });
  const ids = () => Array.from(container.querySelectorAll('tbody small')).map(el => el.textContent);
  expect(ids()).toEqual(['59.99']);
  act(() => Simulate.click(Array.from(container.querySelectorAll('button')).find(button => button.textContent === 'Expected score at 6A')));
  expect(ids()).toEqual(['59.99', '60', '61']);
  act(() => Simulate.click(Array.from(container.querySelectorAll('button')).find(button => button.textContent === 'Chance of reaching GG target')));
  act(() => Simulate.change(container.querySelector('[aria-label="GG target"]'), {target: {value: '65'}}));
  expect(ids()).toEqual(['59.99', '60', '61']);
  act(() => { ReactDOM.unmountComponentAtNode(container); });
});

it('filters labels without overriding the selected global ranking', () => {
  const container = document.createElement('div');
  const mods = Array.from({length: 300}, (_, i) => mod(`baseline-${i}`));
  let screen;
  act(() => { screen = ReactDOM.render(<RecommendedSlices mods={mods} gameSettings={{}} />, container); });
  const threshold = screen.getSellLine(mods).threshold;
  const row = (id, expectedScore, potentialScore) => ({mod: mod(id), expectedScore, potentialScore,
    score: 20, targetChance: .1, expectedTop300Gain: 1, gainPerSlice: .2, remainingSlices: 5, remainingRolls: 4, primaryFit: 1, nextSlice: '5A → 6E'});
  screen.getTargetForecasts = rows => rows;
  // Supply ranked forecasts to isolate grouping from the forecast calculation.
  screen.getRecommendations = () => [row('sell', threshold - 2, threshold - 1),
    row('long-shot', threshold - 1, threshold), row('keep-first', threshold, threshold + 2),
    row('keep-second', threshold, threshold + 1)];
  act(() => { screen.forceUpdate(); });
  const ids = () => Array.from(container.querySelectorAll('tbody small')).map(el => el.textContent);
  expect(ids()).toEqual(['sell', 'long-shot', 'keep-first', 'keep-second']);
  expect(container.querySelectorAll('.slice-group-divider').length).toBe(0);
  act(() => { screen.setState({limit: 100}); });
  act(() => Simulate.change(container.querySelector('[aria-label="Priority order"]'), {target: {value: 'sell'}}));
  expect(ids()).toEqual(['keep-second', 'keep-first', 'long-shot', 'sell']);
  expect(screen.state.limit).toBe(50);
  expect(container.querySelector('caption').textContent).toContain('Sell priority');
  act(() => Simulate.change(container.querySelector('[aria-label="Recommendation"]'), {target: {value: 'consider'}}));
  expect(ids()).toEqual(['long-shot']);
  expect(container.textContent).toContain('Consider selling');
  act(() => Simulate.change(container.querySelector('[aria-label="Recommendation"]'), {target: {value: 'keep'}}));
  expect(ids()).toEqual(['keep-second', 'keep-first']);
  act(() => Simulate.click(Array.from(container.querySelectorAll('button')).find(button => button.textContent === 'Highest potential at 6A')));
  expect(container.querySelector('[aria-label="Priority order"]').value).toBe('sell');
  expect(ids()).toEqual(['keep-second', 'keep-first']);
  act(() => Simulate.change(container.querySelector('[aria-label="Priority order"]'), {target: {value: 'slice'}}));
  expect(ids()).toEqual(['keep-first', 'keep-second']);
  act(() => { ReactDOM.unmountComponentAtNode(container); });
});

it('shows sell candidates and keeps the inventory baseline fixed across filters and ranking modes', () => {
  const container = document.createElement('div');
  const leaders = Array.from({length: 300}, (_, i) => new Mod(`leader-${i}`, 'triangle', {name: 'speed'}, 15, 6,
    new Stat('Critical Damage %', '42'), [new Stat('Speed', '31', 5), new Stat('Offense %', '8.5', 5),
      new Stat('Health %', '2', 1), new Stat('Protection %', '3', 1)], null, 5));
  const candidate = mod('sell-me');
  candidate.secondaryStats[0] = new Stat('Speed', '8', 4);
  candidate.characterID = 'owner';
  act(() => { ReactDOM.render(<RecommendedSlices mods={leaders.concat(candidate)} gameSettings={{}} />, container); });
  const summary = container.querySelector('[aria-label="Sell line summary"]');
  expect(summary.textContent).toContain('Sell threshold: 70.00');
  act(() => Simulate.change(container.querySelector('[aria-label="GG target"]'), {target: {value: '60'}}));
  expect(summary.textContent).toContain('Sell threshold: 60.00');
  expect(summary.textContent).toContain('Current top-300 average: 100');
  act(() => Simulate.change(container.querySelector('[aria-label="GG target"]'), {target: {value: 'auto'}}));
  expect(container.querySelectorAll('.slice-sell-candidate').length).toBe(1);
  expect(container.textContent).toContain('Sell priority · equipped, review first');
  expect(container.textContent).not.toContain('Replace first');
  expect(container.querySelector('[aria-label="Recommendation"] option[value="replace"]')).toBeNull();
  expect(container.textContent).toContain('Estimated chance of 70+');
  act(() => Simulate.change(container.querySelector('[aria-label="Recommendation"]'), {target: {value: 'keep'}}));
  expect(container.querySelector('table')).toBeNull();
  act(() => Simulate.change(container.querySelector('[aria-label="Recommendation"]'), {target: {value: 'sell'}}));
  act(() => Simulate.click(Array.from(container.querySelectorAll('button')).find(button => button.textContent === 'Highest potential at 6A')));
  expect(container.querySelectorAll('tbody small').length).toBe(1);
  act(() => Simulate.change(container.querySelector('[aria-label="Set"]'), {target: {value: 'health'}}));
  expect(container.querySelector('table')).toBeNull();
  expect(summary.textContent).toContain('Sell threshold: 70.00');
  act(() => { ReactDOM.unmountComponentAtNode(container); });
});






