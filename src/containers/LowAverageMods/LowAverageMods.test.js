import {lowAverageMods,filterLowAverageRows} from './LowAverageMods';
import expectedSixAScore from '../../utils/expectedSixAScore';

jest.mock('../../utils/expectedSixAScore', () => jest.fn());

it('excludes latest recommended assignments independently of current equipment and can be switched off', () => {
  const rows = [{mod:{id:'move'}},{mod:{id:'stay',characterID:'WAMPA'}},
    {mod:{id:'unused-equipped',characterID:'CLS'}},{mod:{id:'unused'}}];
  const assignments = [null,{id:'WAMPA',assignedMods:['move','stay']},{id:'CLS'}];
  const ids = result => result.map(row => row.mod.id);
  expect(ids(filterLowAverageRows(rows,{excludeRecommended:true},assignments)))
    .toEqual(['unused-equipped','unused']);
  expect(ids(filterLowAverageRows(rows,{excludeRecommended:true,unequippedOnly:true},assignments)))
    .toEqual(['unused']);
  expect(filterLowAverageRows(rows,{excludeRecommended:false},assignments)).toEqual(rows);
  expect(filterLowAverageRows(rows,{excludeRecommended:true},null)).toEqual(rows);
  expect(ids(filterLowAverageRows(rows,{excludeRecommended:true},[{assignedMods:['unused']}])))
    .toEqual(['move','stay','unused-equipped']);
});

it('includes the exact cutoff, equipped and finished mods, but excludes unknown and above-cutoff forecasts', () => {
  const mods = [
    {id:'boundary',pips:6,tier:5,level:15,characterID:'R2D2_LEGENDARY',average:40},
    {id:'above',average:40.001},
    {id:'leveling',pips:5,tier:1,level:12,average:25},
    {id:'unknown',average:null},
    {id:'invalid',average:NaN}
  ];
  expectedSixAScore.mockImplementation(mod => mod.average === null ? null : {expectedScore:mod.average});
  const result = lowAverageMods(mods);
  expect(result.rows.map(row => row.mod.id)).toEqual(['leveling','boundary']);
  expect(result.unavailable).toBe(2);
  expect(mods[0].id).toBe('boundary');
});

it('combines tier, shape, set, ownership and inclusive current-Speed bounds', () => {
  const mod={pips:5,tier:1,slot:'diamond',set:{name:'health'},primaryStat:{type:'Defense %',value:9.5},secondaryStats:[{type:'Speed',value:5}]};
  const rows=[{mod:{...mod,id:'match'}},{mod:{...mod,id:'equipped',characterID:'R2'}},
    {mod:{...mod,id:'other-tier',tier:2}},{mod:{...mod,id:'other-set',set:'offense'}},
    {mod:{...mod,id:'no-speed',secondaryStats:[]}},
    {mod:{...mod,id:'arrow',slot:'arrow',primaryStat:{type:'Speed',value:30},secondaryStats:[]}}];
  expect(filterLowAverageRows(rows,{tier:'5E',shape:'diamond',set:'health',minSpeed:'5',maxSpeed:'5',unequippedOnly:true})
    .map(row=>row.mod.id)).toEqual(['match']);
  expect(filterLowAverageRows(rows,{maxSpeed:'0'}).map(row=>row.mod.id)).toEqual(['no-speed']);
  expect(filterLowAverageRows(rows,{minSpeed:'30'}).map(row=>row.mod.id)).toEqual(['arrow']);
  expect(filterLowAverageRows(rows)).toHaveLength(rows.length);
});

it('includes exact adjustable cutoffs without rounding above-cutoff mods into the list', () => {
  expectedSixAScore.mockImplementation(mod => ({expectedScore:mod.average}));
  const mods=[40,45,45.001,50,50.001].map(average=>({id:String(average),average}));
  expect(lowAverageMods(mods,45).rows.map(row=>row.mod.average)).toEqual([40,45]);
  expect(lowAverageMods(mods,50).rows.map(row=>row.mod.average)).toEqual([40,45,45.001,50]);
  expect(lowAverageMods(mods,NaN).rows).toEqual([]);
  expect(lowAverageMods(mods,101).rows).toEqual([]);
});
