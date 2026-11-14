'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const source=fs.readdirSync(path.join(root,'source')).filter(p=>/^part-.*\.txt$/.test(p)).sort().map(p=>fs.readFileSync(path.join(root,'source',p),'utf8')).join('');
const start=source.indexOf("const APP_VERSION='13.0.0'");
const end=source.indexOf("let state=migrate(),selected='jesus'",start);
assert.ok(start>=0&&end>start,'Core V13 migration boundaries are present');
const functions=source.slice(start,end);
const copy=x=>JSON.parse(JSON.stringify(x));
function migrateBackup(backup){
  const raw=JSON.stringify(backup),storage=new Map([['second-brain-current',raw]]);
  const ctx={localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},document:{getElementById:()=>null}};
  vm.createContext(ctx);
  vm.runInContext(functions+'\nthis.core={migrate,prepareInfiniteCanvas};',ctx);
  const migrated=ctx.core.migrate();ctx.core.prepareInfiniteCanvas(migrated);
  return {migrated:copy(migrated),storage,raw};
}
function fixture(){return {meta:{appVersion:'13.0.0',schemaVersion:13,infiniteCanvasV13:true,canvasWidth:6000,canvasHeight:4000},tree:{id:'jesus',title:'Jésus-Christ',body:'Texte fictif',link:'https://example.test',tags:['test'],x:3050,y:1930,children:[{id:'child-test',title:'Test',body:'Exemple',x:3400,y:2100,children:[]}]},relations:[{id:'r-test',from:'jesus',to:'child-test',label:'Test'}],reviews:{'2026-11-14':{worked:'Test',notWorked:'',improve:'',updatedAt:'2026-11-14'}},memories:[{id:'m-test',text:'Test'}],tasks:[{id:'t-test',title:'Test'}],linkArchive:[{id:'l-test',url:'https://example.test'}],updatedAt:'2026-11-14T00:00:00Z'};}
function checkCompatibility(backup){
  const {migrated,storage,raw}=migrateBackup(backup);
  for(const key of ['tree','relations','reviews','memories','tasks','linkArchive','updatedAt'])assert.deepEqual(migrated[key],backup[key],key+' preserved');
  assert.equal(migrated.meta.schemaVersion,13);
  assert.equal(migrated.meta.infiniteCanvasV13,true);
  assert.equal(storage.get('second-brain-current'),raw,'original raw data was not rewritten');
  assert.deepEqual(JSON.parse(storage.get('second-brain-pre-upgrade-v13')).state,backup,'recovery copy preserves the entire V13 state');
}
test('V53 retains V13 branches, positions, links, reviews, tasks and metadata',()=>checkCompatibility(fixture()));
test('repeated V13 canvas preparation does not shift existing branches',()=>{
  const b=fixture(),first=migrateBackup(b).migrated,second=migrateBackup(first).migrated;
  assert.deepEqual(second.tree,b.tree);
});
// Optional private read: never commit a personal backup or print its contents.
test('the explicitly supplied private V13 backup is compatible',{skip:!process.env.SECOND_BRAIN_V13_BACKUP},()=>{
  checkCompatibility(JSON.parse(fs.readFileSync(process.env.SECOND_BRAIN_V13_BACKUP,'utf8')));
});
