import React from 'react';
import ReactDOM from 'react-dom';
import {act,Simulate} from 'react-dom/test-utils';
import {RecommendedCalibrations} from './RecommendedCalibrations';
import Mod from '../../domain/Mod';
import Stat from '../../domain/Stat';
const mod=id=>new Mod(id,'triangle',{name:'speed'},15,6,new Stat('Critical Damage %','42'),[
  new Stat('Speed','21',4),new Stat('Offense %','1.2',1),new Stat('Health %','5',5),new Stat('Protection %','2',1)
],null,4);
it('shows the best donor, estimates, eligibility caveat, filters and pagination',()=>{
  const container=document.createElement('div');
  act(()=>{ReactDOM.render(<RecommendedCalibrations mods={Array.from({length:51},(_,i)=>mod(String(i)))} gameSettings={{}}/>,container);});
  expect(container.querySelectorAll('tbody tr').length).toBe(50);
  expect(container.querySelector('tbody tr').textContent).toContain('Health %');
  expect(container.textContent).toContain('Remaining attempts unknown');
  expect(container.textContent).toContain('Average after keep/revert');
  expect(container.textContent).toContain('Estimated potential after attempt');
  act(()=>Simulate.click(container.querySelector('button')));
  expect(container.querySelectorAll('tbody tr').length).toBe(51);
  act(()=>Simulate.change(container.querySelector('[aria-label="Set"]'),{target:{value:'health'}}));
  expect(container.querySelector('table')).toBeNull();
  act(()=>Simulate.change(container.querySelector('[aria-label="Set"]'),{target:{value:'speed'}}));
  expect(container.querySelectorAll('tbody tr').length).toBe(50);
  act(()=>Simulate.change(container.querySelector('[aria-label="Shape"]'),{target:{value:'arrow'}}));
  expect(container.textContent).toContain('No calibration candidates');
  act(()=>{ReactDOM.unmountComponentAtNode(container);});
});
