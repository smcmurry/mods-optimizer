import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createFrontendLoader} from './lib/loadFrontend.mjs';
const load=createFrontendLoader();
const ranges=load('src/constants/statRoll.js').default;
const Stat=load('src/domain/Stat.js').default;
const {ggMaxValue,ggScore}=load('src/utils/ggScore.js');
const supplied={
  Speed:[3,6,3,6], 'Health %':[.56,1.13,1,2], Health:[214.3,428.6,270,540],
  'Offense %':[.28,.56,.85,1.7], Offense:[22.8,45.6,25,50],
  'Defense %':[.85,1.7,2,4], Defense:[4.9,9.8,8,16],
  'Protection %':[1.13,2.25,1.5,3], Protection:[415.3,830.6,460,920],
  'Critical Chance %':[1.13,2.25,1.18,2.35], 'Potency %':[1.13,2.25,1.5,3],
  'Tenacity %':[1.13,2.25,1.5,3]
};
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const worker=vm.createContext({self:{},console,postMessage(){}});
vm.runInContext(fs.readFileSync('public/workers/optimizer.js','utf8'),worker);
const workerFactors=vm.runInContext('statSlicingUpgradeFactors',worker);
for(const [type,[min5,max5,min6,max6]] of Object.entries(supplied)) {
  assert.deepEqual(ranges[type][5],{min:min5,max:max5});
  assert.deepEqual(ranges[type][6],{min:min6,max:max6});
  for(let rolls=1;rolls<=5;rolls++) {
    for(const fraction of [.6,.75,1]) {
      const stat=new Stat(type,String(max5*rolls*fraction),rolls);
      const sliced=stat.upgradeSecondary();
      close(sliced.value,type==='Speed'?stat.value+1:max6*rolls*fraction);
      assert.equal(sliced.rolls,rolls);
    }
    close(ggMaxValue(type,rolls),max6*rolls+(type==='Speed'?1:0));
  }
  if(type!=='Speed') {
    const workerType=['Potency %','Tenacity %','Critical Chance %'].includes(type)?type.slice(0,-2):type;
    close(workerFactors[workerType],max6/max5);
    close(Stat.secondaryUpgradeFactors[type],workerFactors[workerType]);
  }
}
// Independent example: speed set ideal weight = 5 + 5*.41 + .30 + .25 = 7.6.
// 6A: max speed x5, offense% x5, health% x1, protection% x1 is exactly perfect.
const perfect={set:{name:'speed'},slot:'triangle',pips:6,tier:5,level:15,
  primaryStat:new Stat('Critical Damage %','42'),secondaryStats:[
    new Stat('Speed','31',5),new Stat('Offense %','8.5',5),
    new Stat('Health %','2',1),new Stat('Protection %','3',1)]};
assert.equal(ggScore(perfect).score,100);
perfect.secondaryStats[2]=new Stat('Health %','1.5',1);
close(ggScore(perfect).score,(5+5*.41+.75*.30+.25)/7.6*100);
console.log('Passed all supplied ranges, slice scaling for 1–5 rolls, speed +1, worker/frontend parity, and independent score examples.');
