/* Second Cerveau V53 — private, append-only Google Drive backups.
   No PATCH/DELETE: concurrent writers always keep both snapshots. */
(() => {
  'use strict';
  const API='https://www.googleapis.com/drive/v3/files';
  const UPLOAD='https://www.googleapis.com/upload/drive/v3/files';
  const NAME='second-cerveau-backup-v53.json', META='sbdrive-sync-meta-v53', CONSENT='sbdrive-consent-request-v53';
  const FIELDS='id,name,modifiedTime,version,appProperties';
  let busy=false,authEpoch=0,verifiedToken=null;
  const bridge=()=>window.SecondBrainCloudV52, $=id=>document.getElementById(id);
  const meta=()=>{try{const m=JSON.parse(localStorage.getItem(META)||'{}');return m&&typeof m==='object'&&!Array.isArray(m)?m:{}}catch{return{}}};
  const saveMeta=x=>localStorage.setItem(META,JSON.stringify({...meta(),...x}));
  const canonical=data=>JSON.stringify(Object.fromEntries(Object.keys(data).sort().map(k=>[k,data[k]])));
  async function digest(data){const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(canonical(data)));return Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('')}
  const status=(message,warn=false)=>{const e=$('sbDriveStatusV53');if(e){e.textContent=message;e.style.color=warn?'#a44820':'inherit'}};
  const stamp=files=>files.map(f=>f.id+':'+(f.version||f.modifiedTime||'')).sort().join('|');
  function assertContext(ctx){
    if(authEpoch!==ctx.epoch||bridge()?.getAccountId()!==ctx.subject||bridge()?.hasOtherAccountData()||bridge()?.isRestorePending())throw new Error('Compte ou données modifiés. Recharge la page avant de synchroniser.');
  }
  async function context(requireToken=true){
    const version=authEpoch,s=await bridge()?.getSession();
    if(!s?.user)throw new Error('Connecte-toi avec Google dans le panneau principal.');
    const ctx={token:s.provider_token,subject:s.user.id,epoch:version};assertContext(ctx);
    if(meta().subject&&meta().subject!==ctx.subject)throw new Error('Cet appareil est associé à un autre compte. Utilise un profil de navigateur distinct.');
    if(requireToken&&!ctx.token)throw new Error('Autorisation Drive absente ou expirée. Clique sur « Activer / synchroniser Google Drive ».');
    return ctx;
  }
  async function request(ctx,url,options={}){
    assertContext(ctx);
    const r=await fetch(url,{cache:'no-store',credentials:'omit',redirect:'error',...options,headers:{Authorization:'Bearer '+ctx.token,...options.headers}});
    assertContext(ctx);
    if(!r.ok){
      if(r.status===401){bridge().clearDriveToken();throw new Error('Autorisation Google Drive expirée. Clique sur le bouton Drive pour te reconnecter.');}
      if(r.status===403){bridge().clearDriveToken();throw new Error('Accès Drive refusé : vérifie Google Drive API et l’autorisation drive.appdata, puis reconnecte Drive.');}
      throw new Error('Google Drive est indisponible ('+r.status+'). Aucune donnée existante n’a été écrasée.');
    }
    const value=await r.json();assertContext(ctx);return value;
  }
  async function listFiles(ctx){
    const files=[],seen=new Set();let pageToken='';
    do{
      const p=new URLSearchParams({spaces:'appDataFolder',q:"name = '"+NAME+"' and trashed = false",fields:'nextPageToken,files('+FIELDS+')',pageSize:'100'});
      if(pageToken)p.set('pageToken',pageToken);
      const result=await request(ctx,API+'?'+p);
      if(!Array.isArray(result.files))throw new Error('Réponse Drive incomplète. Synchronisation arrêtée.');
      files.push(...result.files);pageToken=result.nextPageToken||'';
      if(seen.has(pageToken)||files.length>10000)throw new Error('Historique Drive trop volumineux ou pagination invalide. Aucune écriture effectuée.');
      if(pageToken)seen.add(pageToken);
    }while(pageToken);
    if(new Set(files.map(f=>f.id)).size!==files.length||files.some(f=>!f.id))throw new Error('Liste Drive incohérente. Réessaie.');
    verifiedToken=ctx.token;sessionStorage.removeItem(CONSENT);
    return files;
  }
  function heads(files){
    const parents=new Set(files.flatMap(f=>Object.entries(f.appProperties||{}).filter(([k])=>/^sbP\d+$/.test(k)).map(([,v])=>v)));
    const out=files.filter(f=>!parents.has(f.id));
    if(files.length&&!out.length)throw new Error('Historique Drive incohérent. Aucune version sélectionnée automatiquement.');
    return out;
  }
  function renderVersions(files){
    const select=$('sbDriveVersionsV53');if(!select)return;
    const previous=select.value;select.replaceChildren();
    for(const f of [...files].sort((a,b)=>String(b.modifiedTime).localeCompare(String(a.modifiedTime)))){
      const option=document.createElement('option');option.value=f.id;option.textContent=(f.modifiedTime?new Date(f.modifiedTime).toLocaleString('fr-CA'):'Date inconnue')+' · '+f.id.slice(-8);select.appendChild(option);
    }
    if(files.some(f=>f.id===previous))select.value=previous;
    $('sbDriveRestoreV53').disabled=!files.length;
  }
  async function download(ctx,file){
    const payload=await request(ctx,API+'/'+encodeURIComponent(file.id)+'?alt=media');
    if(payload?.kind!=='second-cerveau-backup-v53')throw new Error('Format de sauvegarde inconnu.');
    bridge().validateSnapshot(payload.data);
    if(payload.subject&&payload.subject!==ctx.subject)throw new Error('Cette sauvegarde appartient à un autre compte. Restauration refusée.');
    const checksum=await digest(payload.data);assertContext(ctx);
    if(payload.checksum&&payload.checksum!==checksum)throw new Error('La sauvegarde est corrompue. Tes données locales sont conservées.');
    return {data:payload.data,checksum};
  }
  async function upload(ctx,parents,data,checksum){
    // Each parent uses one private property. Drive allows 30 per application.
    if(parents.length>28)throw new Error('Trop de versions concurrentes. Exporte les copies avant de continuer.');
    bridge().validateSnapshot(data);assertContext(ctx);bridge().claimLocalData(ctx.subject);
    const appProperties={sbFormat:'v53',...Object.fromEntries(parents.map((f,i)=>['sbP'+i,f.id]))};
    const header={name:NAME,parents:['appDataFolder'],mimeType:'application/json',appProperties};
    const payload={kind:'second-cerveau-backup-v53',subject:ctx.subject,savedAt:new Date().toISOString(),checksum,data};
    const boundary='sbdrive'+crypto.randomUUID().replaceAll('-','');
    const body='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify(header)+'\r\n--'+boundary+'\r\nContent-Type: application/json\r\n\r\n'+JSON.stringify(payload)+'\r\n--'+boundary+'--';
    return request(ctx,UPLOAD+'?uploadType=multipart&fields='+encodeURIComponent(FIELDS),{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body});
  }
  function remember(ctx,file,files,checksum){assertContext(ctx);saveMeta({subject:ctx.subject,fileId:file.id,remoteStamp:stamp(files),lastDigest:checksum,enabled:true,restoredHeads:null})}
  async function restore(ctx,file,files){
    const baseline=canonical(bridge().snapshot()),before=stamp(files);
    const remote=await download(ctx,file);assertContext(ctx);
    if(canonical(bridge().snapshot())!==baseline)throw new Error('Les données locales ont changé. Relance la restauration.');
    if(!confirm('Restaurer cette sauvegarde Drive sur cet appareil ? Une copie locale des données actuelles sera conservée avant remplacement.'))return;
    // Reject new remote writes or local edits while a confirmation dialog was open.
    const current=await listFiles(ctx);
    if(stamp(current)!==before||canonical(bridge().snapshot())!==baseline)throw new Error('Les données ont changé pendant la restauration. Relance la vérification.');
    assertContext(ctx);
    bridge().restoreExternalSnapshot(remote.data,()=>saveMeta({subject:ctx.subject,fileId:file.id,remoteStamp:stamp(current),restoredHeads:stamp(current),lastDigest:remote.checksum,enabled:true}));
    status('Sauvegarde Drive restaurée. Rechargement…');bridge().reloadAfterRestore();
  }
  async function connect(){
    if(busy)return;
    try{
      const ctx=await context(false);
      let consent=null;try{consent=JSON.parse(sessionStorage.getItem(CONSENT)||'null')}catch{}
      const returned=consent?.subject===ctx.subject&&Date.now()-consent.at<10*60*1000;
      if(!ctx.token||(verifiedToken!==ctx.token&&!returned)){
        sessionStorage.setItem(CONSENT,JSON.stringify({subject:ctx.subject,at:Date.now()}));
        status('Ouverture de Google pour autoriser le dossier privé de l’application.');
        try{await bridge().authorizeDrive()}catch(e){sessionStorage.removeItem(CONSENT);throw e}
        return;
      }
      await sync(true);
    }catch(e){status(e.message||String(e),true)}
  }
  async function sync(explicit=false){
    if(busy||!bridge()||(!explicit&&!meta().enabled))return;
    busy=true;
    try{
      const ctx=await context(),m=meta(),data=bridge().snapshot(),localHash=await digest(data);assertContext(ctx);
      const files=await listFiles(ctx);renderVersions(files);const tips=heads(files);
      if(!files.length){
        if(m.enabled){status('La sauvegarde attendue est absente de Drive. Aucune nouvelle copie créée automatiquement.',true);return}
        if(!explicit||!confirm('Créer une sauvegarde privée des données de cet appareil dans le Drive du compte Google affiché ?'))return;
        const check=await listFiles(ctx);if(check.length)throw new Error('Une autre sauvegarde vient d’être créée. Relance la vérification.');
        const created=await upload(ctx,[],data,localHash);remember(ctx,created,[created],localHash);renderVersions([created]);status('Première sauvegarde créée dans ton Drive.');return;
      }
      const restored=m.restoredHeads===stamp(files)&&files.some(f=>f.id===m.fileId);
      if(tips.length>1&&!restored){status('Conflit : plusieurs appareils ont enregistré des versions différentes. Toutes les copies sont conservées. Sélectionne la version à restaurer.',true);return}
      const file=restored?files.find(f=>f.id===m.fileId):tips[0],remote=await download(ctx,file);
      if(!m.enabled||m.subject!==ctx.subject){
        status('Une sauvegarde Drive existe. Vérifie la version avant de la restaurer.');
        if(explicit)await restore(ctx,file,files);return;
      }
      const localChanged=m.lastDigest!==localHash,remoteChanged=m.remoteStamp!==stamp(files);
      if(remoteChanged){
        if(remote.checksum===localHash){remember(ctx,file,files,localHash);status('Drive est à jour.');return}
        status(localChanged?'Conflit : Drive et cet appareil ont changé. Les deux versions sont conservées. Choisis une restauration.':'Une nouvelle version Drive est disponible. Clique sur le bouton Drive pour la restaurer.',true);
        if(explicit)await restore(ctx,file,files);return;
      }
      if(!localChanged&&(!restored||!explicit)){status(restored?'Version restaurée sur cet appareil. Synchronise pour enregistrer ce choix sur Drive.':'Drive est à jour.');return}
      const latest=await listFiles(ctx);if(stamp(latest)!==stamp(files))throw new Error('Drive a changé pendant la sauvegarde. Aucune copie écrasée. Relance la vérification.');
      const updated=await upload(ctx,tips,data,localHash);remember(ctx,updated,[...files,updated],localHash);renderVersions([...files,updated]);status('Nouvelle sauvegarde enregistrée dans Google Drive. Les versions précédentes sont conservées.');
    }catch(e){status(e.message||String(e),true)}finally{busy=false}
  }
  async function restoreSelected(){
    if(busy)return;busy=true;
    try{
      const ctx=await context(),files=await listFiles(ctx),file=files.find(f=>f.id===$('sbDriveVersionsV53')?.value);
      if(!file)throw new Error('Vérifie d’abord les sauvegardes Drive puis sélectionne une version.');
      await restore(ctx,file,files);
    }catch(e){status(e.message||String(e),true)}finally{busy=false}
  }
  function install(){
    const host=$('page-backup');if(!host||$('sbDrivePanelV53'))return;
    const panel=document.createElement('section');panel.id='sbDrivePanelV53';panel.className='panel';
    panel.innerHTML='<h3>Google Drive personnel</h3><p>Sauvegarde privée dans le dossier de l’application. Aucun accès à tes autres fichiers Drive. Les anciennes versions sont conservées.</p><div class="actions"><button class="btn primary" type="button" id="sbDriveActionV53">Activer / synchroniser Google Drive</button><label>Version à restaurer <select id="sbDriveVersionsV53" aria-label="Version Drive à restaurer"></select></label><button class="btn" type="button" id="sbDriveRestoreV53" disabled>Restaurer la version sélectionnée</button></div><p id="sbDriveStatusV53" role="status">Connecte Google puis active Drive. Le premier envoi demande ton accord. Après un rechargement ou une expiration, autorise à nouveau Drive.</p>';
    host.insertBefore(panel,host.firstChild);$('sbDriveActionV53').addEventListener('click',connect);$('sbDriveRestoreV53').addEventListener('click',restoreSelected);
    window.addEventListener('secondbrain:auth-change',()=>{++authEpoch;renderVersions([]);status('Compte Google actualisé. Vérifie le compte avant de synchroniser Drive.');});
    setInterval(()=>{if(!document.hidden&&meta().enabled)sync()},60000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  window.SecondBrainDriveV53={sync,connect,restoreSelected};
})();
