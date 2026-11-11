import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync('src/state/actions/data.js','utf8');
const action=source.slice(source.indexOf('export function fetchCharacterList('),source.indexOf('//***********************/',source.indexOf('export function fetchCharacterList('))).replace('export function','function');
let request,updated;
const profile={selectedCharacters:[{id:'A',target:{name:'Custom'}}],characters:Object.fromEntries(['A','B','C'].map(id=>[id,{defaultTarget:()=>({name:id})}])),withSelectedCharacters(selectedCharacters){return {...this,selectedCharacters};}};
const context=vm.createContext({
 post:async (url,body)=>{request=body;return ['C','B','A'];},
 filterObject:(obj,predicate)=>Object.fromEntries(Object.entries(obj).filter(([k,v])=>predicate(k,v))),
 updateProfile:callback=>({apply:callback}),setIsBusy:()=>({}),showError:message=>{throw new Error(message);}
});
vm.runInContext(action,context);
const dispatch=action=>{if(action.apply) updated=action.apply(profile);};
await context.fetchCharacterList('',true,'414556856',{includedCharacterIDs:['A','B'],top:1})(dispatch);
assert.deepEqual(Array.from(updated.selectedCharacters,x=>x.id),['B']);
assert.equal(request.parameters.includedCharacterIDs,undefined);
assert.equal(request.parameters.top,undefined,'Remote limit must not discard selected characters before local filtering');
await context.fetchCharacterList('','false','414556856',{includedCharacterIDs:['B']})(dispatch);
assert.deepEqual(Array.from(updated.selectedCharacters,x=>x.id),['A','B']);
assert.equal(updated.selectedCharacters[0].target.name,'Custom');
await context.fetchCharacterList('',true,'414556856',{includedCharacterIDs:[]})(dispatch);
assert.equal(updated.selectedCharacters.length,0);
console.log('Passed remote selection, ordering, limit after selection, append/custom targets, and empty selection.');
