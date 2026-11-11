import recommendedSlices from './recommendedSlices';
import expectedSixAScore from './expectedSixAScore';
import {materialCosts} from './materialSliceRecommendations';
import {ggStatType} from './ggScore';
import statRoll from '../constants/statRoll';
import Stat from '../domain/Stat';

const cache = new WeakMap();
const EPSILON = 1e-9;

// An outcome is either a point or a uniform interval of updated 6A expectations.
// The expectation is linear in a valid next-roll magnitude for fixed roll counts.
export function scoutingImprovement(outcomes, benchmark) {
  let improvement=0,chance=0;
  outcomes.forEach(({low,high,probability})=> {
    const width=high-low;
    if(high<=benchmark+EPSILON) return;
    if(width<EPSILON) {
      improvement+=probability*(low-benchmark);
      chance+=probability;
    } else if(low>=benchmark) {
      improvement+=probability*((low+high)/2-benchmark);
      chance+=probability;
    } else {
      improvement+=probability*Math.pow(high-benchmark,2)/(2*width);
      chance+=probability*(high-benchmark)/width;
    }
  });
  return {scoutingGain:Math.max(0,improvement),scoutingChance:Math.min(1,chance)};
}

export function nextExpectationOutcomes(mod) {
  if(cache.has(mod)) return cache.get(mod);
  const levelingRolls=mod.pips===5?4-Math.min(4,Math.floor(mod.level/3)):0;
  const trials=levelingRolls?64:1;
  let seed=123456789;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const outcomes=[];
  for(let trial=0;trial<trials;trial++) {
    const stats=mod.secondaryStats.map(stat=>({...stat,type:ggStatType(stat),rolls:Number(stat.rolls)}));
    for(let roll=0;roll<levelingRolls;roll++) {
      const choices=stats.map((stat,i)=>stat.rolls<5?i:-1).filter(i=>i>=0);
      const stat=stats[choices[Math.floor(random()*choices.length)]];
      const range=statRoll[stat.type][5];
      stat.value+=stat.type==='Speed'?3+Math.floor(random()*4):range.min+random()*(range.max-range.min);
      stat.rolls++;
    }
    const working={...mod,level:15,secondaryStats:stats};
    if(mod.pips===5&&mod.tier===5) {
      const promoted={...working,pips:6,tier:1,secondaryStats:stats.map(stat=>({...stat,
        value:stat.type==='Speed'?stat.value+1:stat.value*Stat.secondaryUpgradeFactors[stat.type]}))};
      const score=expectedSixAScore(promoted).expectedScore;
      outcomes.push({low:score,high:score,probability:1/trials});
      continue;
    }
    const choices=stats.map((stat,i)=>stat.rolls<5?i:-1).filter(i=>i>=0);
    choices.forEach(i=> {
      const range=statRoll[stats[i].type][mod.pips];
      const evaluate=value=>expectedSixAScore({...working,tier:mod.tier+1,
        secondaryStats:stats.map((stat,j)=>i===j?{...stat,rolls:stat.rolls+1,value:stat.value+value}:stat)}).expectedScore;
      if(stats[i].type==='Speed') {
        for(let value=3;value<=6;value++) {
          const score=evaluate(value);
          outcomes.push({low:score,high:score,probability:1/(trials*choices.length*4)});
        }
      } else outcomes.push({low:evaluate(range.min),high:evaluate(range.max),probability:1/(trials*choices.length)});
    });
  }
  cache.set(mod,outcomes);
  return outcomes;
}

export function scoutingCandidates(mods,material,includeLeveling=false) {
  return recommendedSlices(mods,{includeLeveling}).filter(row=>materialCosts(row.mod).material===material);
}

export function scoutingForecast(row,benchmark) {
  const result=scoutingImprovement(nextExpectationOutcomes(row.mod),benchmark);
  const cost=materialCosts(row.mod).next;
  return {...row,...result,scoutingBenchmark:benchmark,scoutingCost:cost,
    scoutingEfficiency:cost?result.scoutingGain/cost:0,
    scoutingFree:cost===0&&result.scoutingGain>EPSILON};
}

export function compareScoutingPriority(a,b) {
  return Number(b.scoutingFree)-Number(a.scoutingFree)||b.scoutingEfficiency-a.scoutingEfficiency||
    b.scoutingGain-a.scoutingGain||b.expectedScore-a.expectedScore||String(a.mod.id).localeCompare(String(b.mod.id));
}

export default function scoutingPriority(mods,material='Mk 1',includeLeveling=false) {
  const rows=scoutingCandidates(mods,material,includeLeveling);
  const benchmark=rows.length?Math.max(...rows.map(row=>row.expectedScore)):null;
  return rows.map(row=>scoutingForecast(row,benchmark)).sort(compareScoutingPriority);
}
