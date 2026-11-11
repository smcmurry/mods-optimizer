import assert from 'node:assert/strict';
import {createFrontendLoader} from './lib/loadFrontend.mjs';
const load=createFrontendLoader();
const {default:recommend,calibrationOptions}=load('src/utils/recommendedCalibrations.js');
const {ggScore}=load('src/utils/ggScore.js');
const Mod=load('src/domain/Mod.js').default;
const Stat=load('src/domain/Stat.js').default;
const close=(a,b,tolerance=1e-8)=>assert.ok(Math.abs(a-b)<tolerance,`${a} != ${b}`);
const make=()=>new Mod('sample','triangle',{name:'speed'},15,6,new Stat('Critical Damage %','42'),[
  new Stat('Speed','21',4),new Stat('Offense %','1.2',1),new Stat('Health %','5',5),new Stat('Protection %','2',1)
],null,4);
const mod=make(), original=JSON.stringify(mod);
const options=calibrationOptions(mod);
assert.equal(options[0].sourceType,'Health %');
assert.deepEqual(options.map(o=>o.sourceType).sort(),['Health %','Speed']);
const health=options[0];
assert.ok(health.targets.includes('Health %'),'Source becomes eligible after removal');
assert.equal(health.targets.length,4);
// Health donor removes 1% = .15 weight. Speed, offense, and health gains are
// always positive. Protection is uniform in [.125,.25] weight, so its retained
// gain averages integral_(.15)^(.25) (x-.15)/.125 dx = .04.
const expected=(.6+.1575+.075+.04)/4/7.6*100;
close(health.expectedGain,expected,.0001);
close(health.rawGain,(.6+.1575+.075+.0375)/4/7.6*100);
assert.ok(health.expectedGain>health.rawGain,'Revert is applied per outcome');
close(health.expectedScore,ggScore(mod).score+health.expectedGain);
// Best case for the selected health donor: remove its estimated 1% roll and add 6 speed.
close(health.potentialScore,ggScore(mod).score+(1-.15)/7.6*100);
assert.ok(health.potentialScore>=health.expectedScore);
const speed=options.find(o=>o.sourceType==='Speed');
assert.equal(speed.removedValue,5,'Speed bonus is not part of the removable roll');
assert.ok(!speed.targets.includes('Health %'),'Other five-roll stats cannot receive a roll');
assert.ok(speed.targets.includes('Speed'));
assert.equal(JSON.stringify(mod),original);
assert.equal(recommend([{...mod,pips:5}]).length,0);
assert.equal(recommend([{...mod,level:12}]).length,0);
assert.equal(recommend([{...mod,tier:1}]).length,0,'Reject inconsistent roll totals');
assert.equal(recommend([{...mod,secondaryStats:mod.secondaryStats.slice(1)}]).length,0);
const perfect=make();perfect.tier=5;perfect.secondaryStats=[new Stat('Speed','31',5),
  new Stat('Offense %','8.5',5),new Stat('Health %','2',1),new Stat('Protection %','3',1)];
assert.equal(ggScore(perfect).score,100);
assert.equal(recommend([perfect]).length,0,'No improvement from a perfect mod');
const sixA=make();sixA.tier=5;sixA.secondaryStats[3]=new Stat('Protection %','4',2);
assert.equal(recommend([sixA]).length,1,'Fully sliced 6A mods can still benefit from calibration');
const weaker=make();weaker.id='less-gain';weaker.secondaryStats[2]=new Stat('Health %','10',5);
const rows=recommend([weaker,mod]);
assert.equal(rows[0].mod.id,'sample');
assert.ok(rows.every((row,i)=>i===0||rows[i-1].expectedGain>=row.expectedGain));
assert.deepEqual(recommend([mod,{...mod,id:'aaa'}]).map(r=>r.mod.id),['aaa','sample']);
console.log('Passed calibration estimates: closed-form gain, keep/revert, donor and recipient caps, speed bonus, eligibility, perfect mods, stable ranking, and immutability.');
