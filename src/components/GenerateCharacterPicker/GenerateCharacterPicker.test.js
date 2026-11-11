import React from 'react';
import ReactDOM from 'react-dom';
import {act,Simulate} from 'react-dom/test-utils';
import GenerateCharacterPicker from './GenerateCharacterPicker';

it('preserves choices through search and supports the current list and all-roster mode', () => {
  const container=document.createElement('div');
  const onChange=jest.fn();
  const characters=['A','B'].map(baseID=>({baseID,playerValues:{gearLevel:13}}));
  act(()=>{ReactDOM.render(<GenerateCharacterPicker characters={characters} gameSettings={{A:{name:'Alpha'},B:{name:'Beta'}}} selectedIDs={['B']} onChange={onChange}/>,container);});
  act(()=>{Simulate.change(container.querySelector('input[type=checkbox]'),{target:{checked:true}});});
  act(()=>{Simulate.click(Array.from(container.querySelectorAll('button')).find(b=>b.textContent==='Use current list'));});
  expect(onChange).toHaveBeenLastCalledWith(['B']);
  act(()=>{Simulate.change(container.querySelector('input[type=search]'),{target:{value:'Alpha'}});});
  expect(onChange).toHaveBeenLastCalledWith(['B']);
  const checks=container.querySelectorAll('input[type=checkbox]');
  act(()=>{Simulate.change(checks[1],{target:{checked:true}});});
  expect(onChange).toHaveBeenLastCalledWith(['B','A']);
  act(()=>{Simulate.change(checks[0],{target:{checked:false}});});
  expect(onChange).toHaveBeenLastCalledWith(null);
  act(()=>{ReactDOM.unmountComponentAtNode(container);});
});
