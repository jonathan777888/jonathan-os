/* Second Cerveau V53 — Google Drive appDataFolder (user-consented backup).
   Never put OAuth tokens into localStorage, GitHub, or Supabase. */
(() => {
  'use strict';
  const API='https://www.googleapis.com/drive/v3/files';
  const UPLOAD='https://www.googleapis.com/upload/drive/v3/files';
  const NAME='second-cerveau-backup-v53.json';
  const META='sbdrive-sync-meta-v53';
  let busy=false, timer=null;
  const bridge=()=>window.SecondBrainCloudV52;
  const $=id=>document.getElementById(id);
  const meta=()=>{try{return JSON.parse(localStorage.getItem(META)||'{}')}catch{return{}}};
  const saveMeta=x=>localStorage.setItem(META,JSON.stringify({...meta(),...x}));
  async function digest(value){
    const bytes=new TextEncoder().encode(value);
    const hash=await crypto.subtle.digest('SHA-256',bytes);
    return Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');
  }
  const status=(message,warn=false)=>{const e=$('sbDriveStatusV53');if(e){e.textContent=message;e.style.color=warn?'#a44820':'inherit'}};
  async function session(){
    const data=await bridge()?.getSession?.();
    return data||null;
  }
  async function access(){
    const s=await session();
    if(!s?.user)throw new Error('Connecte-toi avec Google dans le panneau de synchronisation.');
    if(!s.provider_token)throw new Error('Autorisation Drive absente ou expirée. Clique sur « Autoriser Google Drive » pour accorder l’accès.');
    return {token:s.provider_token,user:s.user};
  }
  async function request(url,token,options={}){
    const r=await fetch(url,{...options,headers:{Authorization:'Bearer '+token,...(options.headers||{})}});
    if(!r.ok){
      if(r.status===401||r.status===403)throw new Error('Google Drive refuse cette autorisation. Reconnecte Google et autorise l’accès aux données de l’application. '+r.status);
      throw new Error('Erreur Google Drive ('+r.status+'). Réessaie ou vérifie la configuration API Google Cloud.');
    }
    return r.status===204?null:r.json();
  }
  async function findFile(token){
    const p=new URLSearchParams({spaces:'appDataFolder',q:"name = '"+NAME+"' and trashed = false",fields:'nextPageToken,files(id,name,modifiedTime)',page_size:'100'});
    const result=await request(API+'?'+p,token);
    return (result.files||[]).sort((a,b)=>String(b.modifiedTime).localeCompare(String(a.modifiedTime)))[0]||null;
  }
  async function download(token,file){
    const payload=await request(API+'/'+encodeURIComponent(file.id)+'?alt=media',token);
    if(payload?.kind!=='second-cerveau-backup-v53'||typeof payload?.data!=='object'||!payload.data||Array.isArray(payload.data))throw new Error('Format de sauvegarde inconnu.');
    return payload;
  }
  async function upload(token,existing,data){
    const body=JSON.stringify({kind:'second-cerveau-backup-v53',savedAt:new Date().toISOString(),data});
    if(existing){
      return request(UPLOAD+'/'+encodeURIComponent(existing.id)+'?uploadType=media&fields=id,modifiedTime',token,{method:'PATCH',headers:{'Content-Type':'application/json'},body});
    }
    const boundary='sbdrive'+Math.random().toString(36).slice(2);
    const multipart='--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n'+JSON.stringify({name:NAME,parents:['appDataFolder'],mimeType:'application/json'})+'\r\n--'+boundary+'\r\nContent-Type: application/json\r\n\r\n'+body+'\r\n--'+boundary+'--';
    return request(UPLOAD+'?uploadType=multipart&fields=id,modifiedTime',token,{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body:multipart});
  }
  async function getContext(){
    const {token,user}=await access();
    const subject=user.id;
    if(meta().subject&&meta().subject!==subject)throw new Error('Cet appareil est associé à un autre compte. Vérifie les sauvegardes locales avant de changer de compte.');
    return {token,subject};
  }
  async function connect(){
    const s=await session();
    if(!s?.user){status('Connecte-toi d’abord avec Google dans le panneau principal.',true);return;}
    const consentReturned=sessionStorage.getItem('sbdrive-consent-request-v53')==='1';
    if(!consentReturned&&!meta().enabled){
      sessionStorage.setItem('sbdrive-consent-request-v53','1');
      status('Redirection vers Google pour autoriser uniquement le dossier privé de l’application.');
      try{await bridge().authorizeDrive()}catch(e){sessionStorage.removeItem('sbdrive-consent-request-v53');status(e.message||String(e),true)}
      return;
    }
    if(!s.provider_token){
      sessionStorage.removeItem('sbdrive-consent-request-v53');
      status('Autorisation Drive absente ou expirée. Clique à nouveau pour relancer Google.',true);
      return;
    }
    await sync(true);
  }
  async function sync(explicit=false){
    if(busy||!bridge())return;
    busy=true;
    try{
      const {token,subject}=await getContext();
      sessionStorage.removeItem('sbdrive-consent-request-v53');
      const local=bridge().snapshot();
      const localDigest=await digest(JSON.stringify(local));
      const file=await findFile(token);
      const m=meta();
      if(!file){
        if(!explicit){status('Drive disponible. Clique sur « Activer la sauvegarde Drive » pour créer la première sauvegarde.');return}
        if(!confirm('Créer une sauvegarde des données de cet appareil dans le Drive privé de ce compte Google ?'))return;
        const created=await upload(token,null,local);
        saveMeta({subject,fileId:created.id,remoteModifiedAt:created.modifiedTime,lastDigest:localDigest,enabled:true});
        status('Première sauvegarde créée dans ton Drive.');return;
      }
      const remote=await download(token,file);
      const remoteDigest=await digest(JSON.stringify(remote.data));
      const newAccount=m.subject!==subject||!m.enabled;
      if(newAccount){
        status('Une sauvegarde existe déjà dans ce Drive. Choisis comment la récupérer ou la remplacer.');
        if(!explicit)return;
        const wantRemote=confirm('Sauvegarde Drive trouvée. OK = restaurer Drive sur cet appareil. Annuler = ne rien modifier (aucune donnée écrasée).');
        if(!wantRemote)return;
        if(!confirm('Confirmer la restauration ? Une copie de tes données actuelles sera conservée localement avant remplacement.'))return;
        bridge().restoreExternalSnapshot(remote.data);
        saveMeta({subject,fileId:file.id,remoteModifiedAt:file.modifiedTime,lastDigest:remoteDigest,enabled:true});
        status('Sauvegarde Drive restaurée. Recharge la page pour afficher les données.');return;
      }
      const localChanged=m.lastDigest!==localDigest;
      const remoteChanged=m.remoteModifiedAt!==file.modifiedTime;
      if(remoteChanged&&localChanged){
        status('Conflit : cet appareil et Drive ont changé. Synchronisation arrêtée pour éviter toute perte. Utilise le bouton Drive pour choisir.',true);
        if(!explicit)return;
        const restore=confirm('Conflit de versions. OK = restaurer la version Drive ; Annuler = conserver les données actuelles sans écrire.');
        if(!restore)return;
        if(!confirm('Confirmer la restauration de Drive sur cet appareil ?'))return;
        bridge().restoreExternalSnapshot(remote.data);
        saveMeta({subject,fileId:file.id,remoteModifiedAt:file.modifiedTime,lastDigest:remoteDigest,enabled:true});
        status('Version Drive restaurée. Recharge la page.');return;
      }
      if(remoteChanged){
        if(!explicit){status('Une version plus récente existe sur Drive. Clique sur « Synchroniser Drive » pour la récupérer.');return}
        if(!confirm('Restaurer la version Drive ? Les données actuelles seront sauvegardées localement avant remplacement.'))return;
        bridge().restoreExternalSnapshot(remote.data);
        saveMeta({subject,fileId:file.id,remoteModifiedAt:file.modifiedTime,lastDigest:remoteDigest,enabled:true});
        status('Version Drive restaurée. Recharge la page.');return;
      }
      if(localChanged){
        const updated=await upload(token,file,local);
        saveMeta({subject,fileId:file.id,remoteModifiedAt:updated.modifiedTime,lastDigest:localDigest,enabled:true});
        status('Modifications enregistrées dans Google Drive.');
      }else status('Drive est à jour.');
    }catch(e){status(e.message||String(e),true)}
    finally{busy=false}
  }
  function install(){
    const host=$('page-backup');
    if(!host||$('sbDrivePanelV53'))return;
    const panel=document.createElement('section');
    panel.id='sbDrivePanelV53';panel.className='panel';
    panel.innerHTML='<h3>Google Drive personnel</h3><p>Sauvegarde privée dans l’espace de données de l’application. Aucun accès à tes autres fichiers Drive.</p><div class="actions"><button class="btn primary" type="button" id="sbDriveActionV53">Activer / synchroniser Google Drive</button></div><p id="sbDriveStatusV53" role="status">Connecte ton compte Google puis autorise Drive. Aucune sauvegarde Drive créée pour le moment.</p>';
    host.insertBefore(panel,host.firstChild);
    $('sbDriveActionV53').addEventListener('click',connect);
    window.addEventListener('secondbrain:auth-change',()=>{status('Compte Google modifié. Vérifie le compte et autorise Drive avant de synchroniser.');});
    timer=setInterval(()=>{if(!document.hidden&&meta().enabled)sync(false)},60000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  window.SecondBrainDriveV53={sync,connect};
})();
