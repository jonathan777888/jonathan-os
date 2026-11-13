'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const {webcrypto}=require('node:crypto');
const root=path.resolve(__dirname,'..');
const cloud=fs.readFileSync(path.join(root,'source/part-06.txt'),'utf8').match(/<script id="cloudSyncV52">([\s\S]*?)<\/script>/)[1];
const drive=fs.readFileSync(path.join(root,'google-drive-sync-v53.js'),'utf8');
const CLOUD_META='second-brain-sync-meta-v52', DRIVE_META='sbdrive-sync-meta-v53', DATA='second-brain-learning-v33';
const clone=x=>x===undefined?undefined:JSON.parse(JSON.stringify(x));
const session=(id='A')=>({user:{id,email:id.toLowerCase()+'@example.test'},provider_token:'fixture-token-'+id});
const tick=async()=>{for(let i=0;i<12;i++)await new Promise(setImmediate)};
function driveServer(){
  let seq=0;
  const accounts=new Map(),calls=[];
  const files=id=>{if(!accounts.has(id))accounts.set(id,new Map());return accounts.get(id)};
  const server={accounts,calls,pageSize:100,hook:null,status:200};
  server.seed=(id,data,parents=[],extra={})=>{
    const n=++seq,file={id:'file-'+n,name:'second-cerveau-backup-v53.json',modifiedTime:new Date(1800000000000+n).toISOString(),version:'1',appProperties:Object.fromEntries(parents.map((p,i)=>['sbP'+i,p]))};
    files(id).set(file.id,{file,payload:{kind:'second-cerveau-backup-v53',subject:id,data:clone(data),...extra}});return clone(file);
  };
  server.fetch=async(url,opts)=>{
    const u=new URL(url),method=opts.method||'GET',id=opts.headers.Authorization.replace('Bearer fixture-token-','');
    calls.push({method,url,account:id});if(server.hook)await server.hook({url:u,opts,account:id});
    if(server.status!==200)return {ok:false,status:server.status,json:async()=>({})};
    assert.ok(['GET','POST'].includes(method),'No existing Drive file may be modified or deleted');
    if(method==='POST'){
      assert.equal(u.origin,'https://www.googleapis.com');assert.equal(u.pathname,'/upload/drive/v3/files');
      const sections=opts.body.split('\r\n\r\n');
      const header=JSON.parse(sections[1].split('\r\n--')[0]);
      const payload=JSON.parse(sections[2].split('\r\n--')[0]);
      assert.deepEqual(header.parents,['appDataFolder']);assert.equal(header.name,'second-cerveau-backup-v53.json');
      const f=server.seed(id,payload.data,[],payload);files(id).get(f.id).file.appProperties=clone(header.appProperties);
      return {ok:true,status:200,json:async()=>clone(files(id).get(f.id).file)};
    }
    if(u.searchParams.get('alt')==='media'){
      const f=files(id).get(decodeURIComponent(u.pathname.split('/').at(-1)));
      return {ok:!!f,status:f?200:404,json:async()=>clone(f?.payload)};
    }
    assert.equal(u.searchParams.get('spaces'),'appDataFolder');assert.equal(u.searchParams.get('pageSize'),'100');assert.equal(u.searchParams.has('page_size'),false);
    const all=[...files(id).values()].map(x=>x.file),offset=Number(u.searchParams.get('pageToken')||0);
    const end=offset+server.pageSize,result={files:clone(all.slice(offset,end))};if(end<all.length)result.nextPageToken=String(end);
    return {ok:true,status:200,json:async()=>result};
  };
  return server;
}
async function harness({id='A',initial={},server=driveServer(),remote=null,loadDrive=true}={}){
  const elements=new Map(),events=new Map(),timers=new Map(),intervals=[],writes=[],oauth=[];
  let clock=0,reloads=0,authChange,options,current=session(id),readHook=null,writeHook=null;
  const remoteRows=new Map();if(remote)remoteRows.set(id,clone(remote));
  class Store{
    constructor(data={}){this.data=new Map(Object.entries(data));this.fail=null}
    get length(){return this.data.size}key(i){return [...this.data.keys()][i]??null}
    getItem(k){return this.data.get(String(k))??null}
    setItem(k,v){if(this.fail?.(String(k),String(v)))throw new Error('QuotaExceededError');this.data.set(String(k),String(v))}
    removeItem(k){this.data.delete(String(k))}
  }
  class El{
    constructor(){this.style={};this.children=[];this.handlers={};this.hidden=false;this.disabled=false;this._value='';this.textContent=''}
    set id(v){this._id=v;elements.set(v,this)}get id(){return this._id}
    set innerHTML(v){this.html=v;for(const tag of v.matchAll(/<[^>]+\bid="([^"]+)"[^>]*>/g)){const e=new El();e.id=tag[1];e.hidden=/\bhidden\b/.test(tag[0]);e.disabled=/\bdisabled\b/.test(tag[0])}}
    appendChild(e){this.children.push(e);return e}insertBefore(e){this.children.unshift(e)}
    replaceChildren(){this.children=[];this._value=''}
    get value(){return this._value||this.children[0]?.value||''}set value(v){this._value=v}
    addEventListener(name,fn){this.handlers[name]=fn}
  }
  const localStorage=new Store(initial),sessionStorage=new Store();
  const document={readyState:'complete',hidden:false,title:'',getElementById:id=>elements.get(id)||null,createElement:()=>new El(),querySelector:()=>null,head:new El(),addEventListener(){}};
  const host=new El();host.id='page-backup';
  const query=()=>({
    mode:'read',filters:[],row:null,select(){return this},eq(k,v){this.filters.push([k,v]);return this},
    update(row){this.mode='update';this.row=clone(row);return this},insert(row){this.mode='insert';this.row=clone(row);return this},
    async maybeSingle(){return this.execute()},async single(){return this.execute()},
    async execute(){
      if(this.mode==='read'){if(readHook)await readHook();return {data:clone(remoteRows.get(this.filters.find(([k])=>k==='user_id')?.[1]))||null,error:null}}
      if(writeHook)await writeHook(this);
      const id=this.row.user_id,existing=remoteRows.get(id);
      if(this.mode==='insert'&&existing)return {data:null,error:{code:'23505'}};
      if(this.mode==='update'&&(!existing||existing.updated_at!==this.filters.find(([k])=>k==='updated_at')?.[1]))return {data:null,error:null};
      writes.push(clone(this.row));const value={...this.row,updated_at:new Date(1800000000000+(++clock)).toISOString()};remoteRows.set(id,value);return {data:{updated_at:value.updated_at},error:null};
    }
  });
  const context={Storage:Store,localStorage,sessionStorage,document,navigator:{platform:'fixture'},location:{origin:'https://example.test',pathname:'/preview/',reload(){++reloads}},crypto:webcrypto,TextEncoder,URL,URLSearchParams,console,
    Event:class{constructor(type){this.type=type}},
    confirm:()=>true,fetch:server.fetch,
    setTimeout(fn,ms){const n=++clock;timers.set(n,{fn,ms});return n},clearTimeout(n){timers.delete(n)},setInterval(fn){intervals.push(fn);return intervals.length},
    addEventListener(name,fn){if(!events.has(name))events.set(name,[]);events.get(name).push(fn)},dispatchEvent(e){for(const fn of events.get(e.type)||[])fn(e)},
    supabase:{createClient(url,key,opts){options=opts;return {auth:{
      getSession:async()=>({data:{session:clone(current)},error:null}),
      onAuthStateChange(fn){authChange=fn;return {data:{subscription:{unsubscribe(){}}}}},
      signInWithOAuth:async x=>{oauth.push(clone(x));return {error:null}},
      signOut:async()=>{current=null;authChange('SIGNED_OUT',null);return {error:null}}
    },from:query}}}
  };
  context.window=context;vm.createContext(context);vm.runInContext(cloud,context);if(loadDrive)vm.runInContext(drive,context);await tick();
  const h={ctx:context,bridge:context.SecondBrainCloudV52,drive:context.SecondBrainDriveV53,localStorage,sessionStorage,server,elements,writes,oauth,remoteRows,intervals,timers,
    get reloads(){return reloads},get authOptions(){return options},get current(){return current},
    emit(next,event='SIGNED_IN'){current=clone(next);authChange(event,current)},
    readHook(fn){readHook=fn},writeHook(fn){writeHook=fn},
    async timersRun(){const pending=[...timers.entries()];timers.clear();for(const [,t]of pending)await t.fn();await tick()},
    async intervalRun(){for(const fn of intervals)await fn();await tick()},
    status(){return elements.get('sbDriveStatusV53')?.textContent||''},cloudStatus(){return elements.get('cloudStatusV52')?.textContent||''},
    meta(){return JSON.parse(localStorage.getItem(DRIVE_META)||'{}')},cloudMeta(){return JSON.parse(localStorage.getItem(CLOUD_META)||'{}')}
  };return h;
}
const fixture=()=>({[DATA]:JSON.stringify({topic:'Données de test'})});

test('first sign-in, edits and background checks never authorize the first upload',async()=>{
  const h=await harness({initial:fixture()});assert.equal(h.writes.length,0);
  h.localStorage.setItem(DATA,'edited');await h.timersRun();await h.intervalRun();assert.equal(h.writes.length,0);
  await h.bridge.manualSync();assert.equal(h.writes.length,1);assert.equal(h.writes[0].user_id,'A');
});
test('declining first Supabase and Drive backup leaves both servers untouched',async()=>{
  const h=await harness({initial:fixture()});h.ctx.confirm=()=>false;await h.bridge.manualSync();await h.drive.sync(true);
  assert.equal(h.writes.length,0);assert.equal(h.server.calls.filter(x=>x.method==='POST').length,0);assert.equal(h.meta().enabled,undefined);
});
test('Drive authorization requests only drive.appdata in addition to normal Google sign-in',async()=>{
  const h=await harness();h.bridge.clearDriveToken();await h.drive.connect();assert.equal(h.oauth.length,1);
  assert.equal(h.oauth[0].options.scopes,'https://www.googleapis.com/auth/drive.appdata');assert.equal(h.oauth[0].options.redirectTo,'https://example.test/preview/');
});
test('initial Drive backup excludes keys, sessions, tokens and local-only spiritual journal',async()=>{
  const initial={...fixture(),'second-brain-verify-token-v43':'fixture-secret','second-brain-api-key':'fixture-key','second-brain-session':'fixture-jwt','spiritual-ladder-local-v1':'private journal','sb-project-auth-token':'fixture-auth'};
  const h=await harness({initial});await h.drive.sync(true);assert.equal(h.meta().enabled,true);
  const saved=[...h.server.accounts.get('A').values()][0].payload;
  assert.deepEqual(saved.data,fixture());assert.equal(saved.subject,'A');assert.equal(saved.checksum.length,64);assert.equal(h.cloudMeta().userId,'A');
});
test('subsequent Drive backups append snapshots and preserve the previous data',async()=>{
  const h=await harness({initial:fixture()});await h.drive.sync(true);const old=[...h.server.accounts.get('A').values()][0];
  h.localStorage.setItem(DATA,'modified');await h.drive.sync();const all=[...h.server.accounts.get('A').values()];assert.equal(all.length,2);
  assert.deepEqual(old.payload.data,fixture());assert.equal(all[1].file.appProperties.sbP0,old.file.id);assert.equal(all[1].payload.data[DATA],'modified');
});
test('restore preserves a recovery copy and secrets, pauses sync and reloads the app',async()=>{
  const server=driveServer(),remote={ [DATA]:'from Drive'};server.seed('A',remote);
  const h=await harness({server,initial:{...fixture(),'second-brain-verify-token-v43':'local-only'}});await h.drive.sync(true);
  assert.equal(h.localStorage.getItem(DATA),'from Drive');assert.equal(h.localStorage.getItem('second-brain-verify-token-v43'),'local-only');assert.equal(h.reloads,1);assert.equal(h.bridge.isRestorePending(),true);
  const copies=[...h.localStorage.data].filter(([k])=>k.startsWith('sbdrive-before-restore-v53-'));
  assert.equal(copies.length,1);assert.deepEqual(JSON.parse(copies[0][1]).data,fixture());
  await h.timersRun();await h.intervalRun();assert.equal(h.writes.length,0);
});
test('restore cancellation keeps data and metadata unchanged',async()=>{
  const server=driveServer();server.seed('A',{[DATA]:'remote'});const h=await harness({server,initial:fixture()});h.ctx.confirm=()=>false;
  await h.drive.sync(true);assert.equal(h.localStorage.getItem(DATA),fixture()[DATA]);assert.deepEqual(h.meta(),{});assert.equal(h.reloads,0);
});
test('malformed snapshots, secret keys, another owner and checksum corruption are rejected',async t=>{
  for(const [name,data,extra]of [['array',[],{}],['secret',{'second-brain-api-key':'forbidden'},{}],['owner',fixture(),{subject:'B'}],['checksum',fixture(),{checksum:'bad'}]]){
    await t.test(name,async()=>{const server=driveServer();server.seed('A',data,[],extra);const h=await harness({server,initial:fixture()});await h.drive.sync(true);assert.equal(h.reloads,0);assert.equal(h.localStorage.getItem(DATA),fixture()[DATA]);assert.deepEqual(h.meta(),{})});
  }
});
test('recovery-copy quota failure aborts before data or sync metadata changes',async()=>{
  const server=driveServer();server.seed('A',{[DATA]:'remote'});const h=await harness({server,initial:fixture()});
  const before=h.localStorage.getItem(CLOUD_META);h.localStorage.fail=k=>k.startsWith('sbdrive-before-restore');await h.drive.sync(true);
  assert.equal(h.localStorage.getItem(DATA),fixture()[DATA]);assert.equal(h.localStorage.getItem(CLOUD_META),before);assert.deepEqual(h.meta(),{});assert.equal(h.reloads,0);
});
test('failure during replacement rolls back current data and metadata',async()=>{
  const server=driveServer();server.seed('A',{[DATA]:'remote'});const h=await harness({server,initial:fixture()});let fail=true;
  h.localStorage.fail=(k,v)=>{if(k===DATA&&v==='remote'&&fail){fail=false;return true}return false};
  await h.drive.sync(true);assert.equal(h.localStorage.getItem(DATA),fixture()[DATA]);assert.deepEqual(h.meta(),{});assert.equal(h.bridge.isRestorePending(),false);assert.equal(h.reloads,0);
});
test('failure saving Drive restore metadata also rolls back the restored data',async()=>{
  const server=driveServer();server.seed('A',{[DATA]:'remote'});const h=await harness({server,initial:fixture()});h.localStorage.fail=k=>k===DRIVE_META;
  await h.drive.sync(true);assert.equal(h.localStorage.getItem(DATA),fixture()[DATA]);assert.deepEqual(h.meta(),{});assert.equal(h.reloads,0);
});
test('all pages of Drive history are read with the v3 pageSize parameter',async()=>{
  const server=driveServer();server.pageSize=1;const f=server.seed('A',fixture());server.seed('A',{[DATA]:'latest'},[f.id]);
  const h=await harness({server,initial:fixture()});await h.drive.sync(true);assert.equal(h.localStorage.getItem(DATA),'latest');
  assert.ok(server.calls.some(x=>new URL(x.url).searchParams.get('pageToken')==='1'));
});
test('two concurrent Drive writers retain both versions and report a conflict',async()=>{
  const server=driveServer(),h1=await harness({server,initial:fixture()});await h1.drive.sync(true);
  const shared={...fixture(),[CLOUD_META]:h1.localStorage.getItem(CLOUD_META),[DRIVE_META]:h1.localStorage.getItem(DRIVE_META)};
  const h2=await harness({server,initial:shared});h1.localStorage.setItem(DATA,'device one');h2.localStorage.setItem(DATA,'device two');
  let waiting=0,release;const gate=new Promise(resolve=>release=resolve);
  server.hook=async({opts})=>{if(opts.method==='POST'){if(++waiting===2)release();await gate}};
  await Promise.all([h1.drive.sync(),h2.drive.sync()]);server.hook=null;
  const all=[...server.accounts.get('A').values()];assert.equal(all.length,3);assert.ok(all.some(x=>x.payload.data[DATA]==='device one'));assert.ok(all.some(x=>x.payload.data[DATA]==='device two'));
  await h1.drive.sync();assert.match(h1.status(),/Conflit/);assert.equal(server.accounts.get('A').size,3);
});
test('concurrent first backups cannot delete either initial version',async()=>{
  const server=driveServer(),h1=await harness({server,initial:{[DATA]:'one'}}),h2=await harness({server,initial:{[DATA]:'two'}});
  let waiting=0,release;const gate=new Promise(resolve=>release=resolve);server.hook=async({opts})=>{if(opts.method==='POST'){if(++waiting===2)release();await gate}};
  await Promise.all([h1.drive.sync(true),h2.drive.sync(true)]);server.hook=null;assert.equal(server.accounts.get('A').size,2);
  await h1.drive.sync();assert.match(h1.status(),/Conflit/);
});
test('selecting a conflict version can be restored and merged without deleting other versions',async()=>{
  const server=driveServer(),one=server.seed('A',{[DATA]:'one'});server.seed('A',{[DATA]:'two'});
  const h=await harness({server,initial:fixture()});await h.drive.sync(true);assert.match(h.status(),/Conflit/);
  h.elements.get('sbDriveVersionsV53').value=one.id;await h.drive.restoreSelected();assert.equal(h.localStorage.getItem(DATA),'one');
  const h2=await harness({server,initial:Object.fromEntries(h.localStorage.data)});await h2.drive.sync(true);
  assert.equal(server.accounts.get('A').size,3);const merged=[...server.accounts.get('A').values()].at(-1);assert.equal(Object.keys(merged.file.appProperties).filter(k=>/^sbP/.test(k)).length,2);
  await h2.drive.sync();assert.doesNotMatch(h2.status(),/Conflit/);
});
test('different local and remote changes require an explicit restore decision',async()=>{
  const h=await harness({initial:fixture()});await h.drive.sync(true);const base=h.meta().fileId;h.server.seed('A',{[DATA]:'remote change'},[base]);h.localStorage.setItem(DATA,'local change');
  await h.drive.sync();assert.match(h.status(),/Conflit/);assert.equal(h.localStorage.getItem(DATA),'local change');assert.equal(h.server.accounts.get('A').size,2);
});
test('a missing previously enabled backup is never silently recreated',async()=>{
  const h=await harness({initial:fixture()});await h.drive.sync(true);h.server.accounts.get('A').clear();h.localStorage.setItem(DATA,'changed');await h.drive.sync(true);
  assert.equal(h.server.accounts.get('A').size,0);assert.match(h.status(),/absente/);
});
test('expired Google API tokens are invalidated and next click reconnects',async()=>{
  const h=await harness({initial:fixture()});h.server.status=401;await h.drive.sync(true);assert.match(h.status(),/expirée/);
  await h.drive.connect();assert.equal(h.oauth.length,1);assert.equal(h.oauth[0].options.scopes,'https://www.googleapis.com/auth/drive.appdata');assert.equal(h.meta().enabled,undefined);
});
test('403 and network errors never write data or enable automatic backup',async()=>{
  const h=await harness({initial:fixture()});h.server.status=403;await h.drive.sync(true);assert.match(h.status(),/API/);assert.deepEqual(h.meta(),{});assert.equal(h.reloads,0);
  h.ctx.fetch=async()=>{throw new Error('network offline')};h.emit({...session(),provider_token:'fresh-fixture-token'});await h.drive.sync(true);assert.match(h.status(),/offline/);assert.deepEqual(h.meta(),{});
});
test('account switch blocks Drive and Supabase operations without relabeling owner data',async()=>{
  const h=await harness({initial:{...fixture(),[CLOUD_META]:JSON.stringify({userId:'A',initialized:true,lastRemoteUpdatedAt:'old'})}});
  h.emit(session('B'));assert.throws(()=>h.localStorage.setItem(DATA,'A modified locally'),/Recharge/);await h.bridge.manualSync();await h.timersRun();await h.drive.sync(true);
  assert.equal(h.cloudMeta().userId,'A');assert.equal(h.writes.length,0);assert.equal(h.server.calls.length,0);assert.match(h.status(),/Compte/);
  assert.throws(()=>h.bridge.restoreExternalSnapshot({[DATA]:'B data'}),/Compte/);
});
test('an account switch while a Drive response is in flight cannot restore or upload',async()=>{
  const server=driveServer();server.seed('A',{[DATA]:'remote A'});const h=await harness({server,initial:fixture()});let once=true;
  server.hook=async()=>{if(once){once=false;h.emit(session('B'))}};await h.drive.sync(true);assert.equal(h.reloads,0);assert.equal(h.localStorage.getItem(DATA),fixture()[DATA]);assert.equal(server.calls.filter(x=>x.method==='POST').length,0);
});
test('an account switch while a Supabase read is in flight cannot apply the old response',async()=>{
  const h=await harness({initial:fixture(),remote:{payload:{[DATA]:'remote A'},updated_at:'r1'}});h.readHook(async()=>h.emit(session('B')));await h.bridge.manualSync();
  assert.equal(h.reloads,0);assert.equal(h.localStorage.getItem(DATA),fixture()[DATA]);assert.equal(h.writes.length,0);
});
test('Supabase conditional update detects concurrent writes instead of overwriting',async()=>{
  const initial={...fixture(),[CLOUD_META]:JSON.stringify({userId:'A',initialized:true,lastRemoteUpdatedAt:'r1'})};
  const h=await harness({initial,remote:{payload:fixture(),updated_at:'r1'}});h.localStorage.setItem(DATA,'local edit');
  h.writeHook(async()=>h.remoteRows.set('A',{payload:{[DATA]:'other device'},updated_at:'r2'}));await h.bridge.manualSync();
  assert.equal(h.writes.length,0);assert.equal(h.remoteRows.get('A').payload[DATA],'other device');assert.equal(h.elements.get('cloudConflictV52').hidden,false);
});
test('Supabase edits made during upload remain dirty for the next sync',async()=>{
  const h=await harness({initial:fixture()});await h.bridge.manualSync();h.localStorage.setItem(DATA,'first edit');
  h.writeHook(async()=>{h.localStorage.setItem(DATA,'second edit');h.writeHook(null)});await h.bridge.manualSync();
  assert.notEqual(h.cloudMeta().localRevision,h.cloudMeta().lastSyncedRevision);await h.bridge.manualSync();assert.equal(h.writes.at(-1).payload[DATA],'second edit');
});
test('Google API tokens are removed from persistent Supabase session records',async()=>{
  const h=await harness(),storage=h.authOptions.auth.storage;storage.setItem('sb-fixture-auth-token',JSON.stringify({...session(),provider_refresh_token:'fixture-refresh',refresh_token:'supabase-session'}));
  const persisted=JSON.parse(h.localStorage.getItem('sb-fixture-auth-token'));assert.equal(persisted.provider_token,undefined);assert.equal(persisted.provider_refresh_token,undefined);assert.equal(persisted.refresh_token,'supabase-session');
  assert.equal((await h.bridge.getSession()).provider_token,'fixture-token-A');h.bridge.clearDriveToken();assert.equal((await h.bridge.getSession()).provider_token,null);
});
test('legacy persisted Google tokens are scrubbed and are not reused',async()=>{
  const h=await harness({initial:{'sb-fixture-auth-token':JSON.stringify(session())}});const raw=h.authOptions.auth.storage.getItem('sb-fixture-auth-token');assert.equal(JSON.parse(raw).provider_token,undefined);
  assert.equal(JSON.parse(h.localStorage.getItem('sb-fixture-auth-token')).provider_token,undefined);
});
test('storage changes from another tab pause all cloud writes',async()=>{
  const h=await harness({initial:fixture()});h.ctx.dispatchEvent({type:'storage',storageArea:h.localStorage,key:CLOUD_META});
  assert.equal(h.bridge.isRestorePending(),true);await h.bridge.manualSync();await h.drive.sync(true);assert.equal(h.writes.length,0);assert.equal(h.server.calls.length,0);
});

test('a stale tab cannot overwrite or remove restored local data',async()=>{
  const h=await harness({initial:fixture()});h.ctx.dispatchEvent({type:'storage',storageArea:h.localStorage,key:CLOUD_META});
  assert.throws(()=>h.localStorage.setItem(DATA,'stale autosave'),/Recharge/);assert.throws(()=>h.localStorage.removeItem(DATA),/Recharge/);
  assert.equal(h.localStorage.getItem(DATA),fixture()[DATA]);
});
test('a failed local metadata write pauses sync while preserving the new local edit',async()=>{
  const h=await harness({initial:fixture()});h.localStorage.fail=k=>k===CLOUD_META;h.localStorage.setItem(DATA,'new local edit');
  assert.equal(h.bridge.isRestorePending(),true);assert.equal(h.localStorage.getItem(DATA),'new local edit');await h.bridge.manualSync();assert.equal(h.writes.length,0);
});
