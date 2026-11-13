// Build a disposable real-OAuth test page from the V53 modules.
// No personal Supabase rows are read or written. Drive uses a dedicated filename.
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const run='20261113-v53-726399c';
const fixtureKey='second-brain-e2e-fixture-v53';
const cloud=fs.readFileSync(path.join(root,'source/part-06.txt'),'utf8').match(/<script id="cloudSyncV52">([\s\S]*?)<\/script>/)[1];
const drive=fs.readFileSync(path.join(root,'google-drive-sync-v53.js'),'utf8')
  .replace("NAME='second-cerveau-backup-v53.json'",`NAME='second-cerveau-e2e-${run}.json'`)
  .replace("META='sbdrive-sync-meta-v53'",`META='sbdrive-sync-meta-v53-e2e-${run}'`)
  .replace("CONSENT='sbdrive-consent-request-v53'",`CONSENT='sbdrive-consent-request-v53-e2e-${run}'`);
const sourceDigest=require('node:crypto').createHash('sha256').update(cloud+drive).digest('hex').slice(0,12);
if(drive.includes("NAME='second-cerveau-backup-v53.json'"))throw Error('Production filename was not isolated');
const init=`(() => {
'use strict';
const realCreate=window.supabase.createClient.bind(window.supabase);
window.supabase={createClient:(url,key,options)=>{
  const client=realCreate(url,key,{...options,auth:{...options.auth,storageKey:'sb-e2e-${run}-auth-token'}});
  return {auth:client.auth,from:()=>{throw new Error('Essai isolé : synchronisation des données personnelles désactivée.')}};
}};
const KEY='${fixtureKey}',marker='${run}';
if(localStorage.getItem(KEY)===null)localStorage.setItem(KEY,JSON.stringify({marker,version:'originale',note:'Données fictives de validation V53'}));
function render(){
  let data;try{data=JSON.parse(localStorage.getItem(KEY))}catch{data={erreur:'Données de test invalides'}}
  document.getElementById('fixture').textContent=JSON.stringify(data,null,2);
  const copies=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith('sbdrive-before-restore-v53-'))copies.push(k)}
  document.getElementById('recovery').textContent='Copies locales de secours : '+copies.length;
}
document.getElementById('changeFixture').onclick=()=>{localStorage.setItem(KEY,JSON.stringify({marker,version:'modifiée sur cet appareil',note:'Données fictives de validation V53'}));render()};
setInterval(render,500);render();
})();`;
const html=`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>Second Cerveau — essai Drive V53</title><style>
:root{font:16px system-ui;color:#17362b;background:#edf3ed;--green:#225d48;--green2:#e2efe7}body{max-width:850px;margin:24px auto;padding:0 16px}.panel,header{background:#fff;border:1px solid #ccd9cf;border-radius:14px;padding:18px;margin:16px 0}h1{font-size:25px}button,select{font:inherit;padding:10px;border:1px solid #a9bcb0;border-radius:8px;background:white;margin:5px 5px 5px 0;max-width:100%}.primary,.google-btn-v52{background:#225d48;color:white}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#f2f5f2;padding:14px;border-radius:8px}.actions{display:flex;flex-wrap:wrap;align-items:center;gap:8px}label{display:flex;flex-direction:column;max-width:100%}#cloudSyncNowV52,#cloudUseCloudV52,#cloudUseDeviceV52,#cloudConflictV52,#cloudStatusV52{display:none!important}[hidden]{display:none!important}
</style><script defer src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.0/dist/umd/supabase.js"></script><script defer src="fixture.js"></script><script defer src="cloud-v53.js"></script><script defer src="drive-v53.js"></script></head><body><header><h1>Essai isolé Google Drive — V53</h1><p>Cette page utilise uniquement un jeu de données fictives. Elle ne synchronise pas tes données personnelles Supabase.</p><p>La sauvegarde de test a un nom distinct et ses versions sont conservées.</p><ol><li>Connecte le compte Google autorisé pour les essais.</li><li>Active Drive et confirme la création de la sauvegarde de test.</li><li>Modifie les données fictives puis restaure la première version.</li></ol></header><main><section id="page-backup"></section><section class="panel"><h2>Données fictives sur cet appareil</h2><pre id="fixture"></pre><button id="changeFixture">Modifier les données de test</button><p id="recovery"></p><p>Modules V53 : ${sourceDigest}. Fichier Drive : second-cerveau-e2e-${run}.json.</p></section></main></body></html>`;
for(const [name,code]of [['cloud-v53.js',cloud],['drive-v53.js',drive],['fixture.js',init]])new vm.Script(code,{filename:name});
const files=[{path:'index.html',content:html},{path:'cloud-v53.js',content:cloud},{path:'drive-v53.js',content:drive},{path:'fixture.js',content:init}];
process.stdout.write(JSON.stringify(files));
