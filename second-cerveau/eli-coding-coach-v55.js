(function eliCodingCoachV55(){
'use strict';
const STORAGE='second-brain-eli-coding-v55';
const GUIDE='second-brain-engineering-guided-v54';
const css=document.createElement('style');
css.textContent=`
#sg-v54 .eli-code-box{margin-top:24px;padding:18px;background:linear-gradient(135deg,#fff8ec,#f2dec4);border:1px solid #b99168;border-radius:16px;color:#483426;box-shadow:0 8px 20px #805b351c}
#sg-v54 .eli-code-box h3{margin:0 0 5px;font-size:20px;color:#513724}
#sg-v54 .eli-code-box .eli-sub{font-size:13px;line-height:1.55;color:#715640;margin:4px 0 10px}
#sg-v54 .eli-code-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px}
#sg-v54 .eli-code-box .eli-controls{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:12px 0}
#sg-v54 .eli-code-box label{margin:8px 0;font-weight:750}
#sg-v54 .eli-code-box select{max-width:260px;background:#fffaf3;border-color:#b99477}
#sg-v54 .eli-code-box .eli-edit{width:100%;box-sizing:border-box;min-height:260px;resize:vertical;display:block;background:#1d2833!important;color:#edf5fa!important;font:13px/1.5 ui-monospace,SFMono-Regular,Consolas,monospace!important;white-space:pre;tab-size:2;border:1px solid #5d6670;border-radius:10px;padding:12px}
#sg-v54 .eli-code-box .eli-preview{width:100%;height:260px;border:1px solid #c4a782;border-radius:10px;background:#fff;display:block}
#sg-v54 .eli-code-box .eli-feedback{white-space:pre-wrap;min-height:46px;padding:10px 12px;border-radius:10px;background:#faf1e0;color:#6a4b33;border:1px solid #ddbf9c;font:13px/1.5 system-ui}
#sg-v54 .eli-code-box .eli-feedback.good{border-color:#62956b;background:#edf6e9;color:#305238}
#sg-v54 .eli-code-box .eli-feedback.bad{border-color:#ba735f;background:#fff0eb;color:#6e3427}
#sg-v54 .eli-code-box button{padding:9px 13px;font-size:12px}
#sg-v54 .eli-code-box button.eli-run{background:#75503c;color:#fffdf8;border-color:#75503c}
#sg-v54 .eli-code-box .eli-help{padding:11px 13px;background:#f8e8cf;border:1px solid #d0ad84;border-radius:10px;margin:10px 0}
#sg-v54 .eli-code-box .eli-example{font:12px/1.45 ui-monospace,monospace;white-space:pre-wrap;word-break:break-word}
#sg-v54 .eli-code-box .eli-minor{font-size:11px;color:#7a6554}
#sg-v54 .eli-code-box details>summary{cursor:pointer;font-weight:760;padding:4px 0}
@media(max-width:720px){#sg-v54 .eli-code-grid{grid-template-columns:1fr}#sg-v54 .eli-code-box{padding:12px}#sg-v54 .eli-code-box .eli-edit{min-height:230px}}
`;
document.head.appendChild(css);
const root=document.getElementById('sg-content');
if(!root)return;
const DEFAULTS={
 html:'<main>\n  <h1>Mon application</h1>\n  <button id="actionButton">Clique ici</button>\n  <p id="resultat">En attente…</p>\n</main>',
 css:'body { font: 16px system-ui; padding: 24px; background: #fbf3e7; color: #352b23; }\nbutton { padding: 12px 16px; cursor: pointer; }',
 js:'const bouton = document.getElementById("actionButton");\nconst resultat = document.getElementById("resultat");\n\n// Mission : quand on clique, modifie le texte de resultat.\n// Indice : bouton.addEventListener("click", () => { ... });',
 yaml:'name: Tests automatiques\non: [push, pull_request]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      # Ajoute ici une étape qui exécute une vraie commande de test.',
};
const hints=[
'Dans JavaScript, un clic se détecte avec addEventListener("click", ...).',
'Commence par : bouton.addEventListener("click", () => { ... });',
'À l’intérieur des accolades, écris : resultat.textContent = "Bravo, mon bouton fonctionne !";',
];
const create=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n};
const makeBtn=(label,callback,cls)=>{const x=create('button',cls,label);x.type='button';x.onclick=callback;return x};
function readData(){try{const obj=JSON.parse(localStorage.getItem(STORAGE)||'null');return obj&&typeof obj==='object'&&!Array.isArray(obj)?obj:{version:1,projects:{}}}catch{return{version:1,projects:{}}}}
let data=readData(); if(!data.projects||typeof data.projects!=='object'||Array.isArray(data.projects))data.projects={};
function writeData(){try{localStorage.setItem(STORAGE,JSON.stringify(data));return true}catch{return false}}
function guideState(){try{return JSON.parse(localStorage.getItem(GUIDE)||'{}')}catch{return{}}}
function currentId(){return guideState().activeId||'eli-exercice-libre'}
function projectData(id){const v=data.projects[id];if(!v||typeof v!=='object'){data.projects[id]={files:{...DEFAULTS},mode:'js',hints:0,lastTest:false};writeData()}const p=data.projects[id];if(!p.files)p.files={...DEFAULTS};return p}
function archiveCode(id){
 const p=projectData(id);
 const text=JSON.stringify({format:'eli-coding-workspace-v55',exportedAt:new Date().toISOString(),projectId:id,files:p.files},null,2);
 const blob=new Blob([text],{type:'application/json'});
 const href=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=href;a.download='eli-mon-code-'+new Date().toISOString().slice(0,10)+'.json';document.body.append(a);a.click();a.remove();
 window.setTimeout(()=>URL.revokeObjectURL(href),3000);
}
function cspDocument(files,token,withTest){
 const JS=String(files.js||'').replace(/<\/script/gi,'<\\/script').slice(0,20000);
 const CSS=String(files.css||'').replace(/<\/style/gi,'<\\/style').slice(0,20000);
 const HTML=String(files.html||'').slice(0,20000);
 const send="window.parent.postMessage({__eliCodeV55:true, token:"+JSON.stringify(token)+",kind:";
 const bootstrap='<script>window.addEventListener("error",function(e){'+send+'"error",message:String(e.message||"Erreur JavaScript").slice(0,300)}, "*");});<\/script>';
 const test='<script>window.setTimeout(function(){var b=document.getElementById("actionButton");var r=document.getElementById("resultat");if(!b){'+send+'"test",ok:false,message:"Il manque le bouton id=actionButton."},"*");return}if(!r){'+send+'"test",ok:false,message:"Il manque le paragraphe id=resultat."},"*");return}var before=r.textContent;b.click();window.setTimeout(function(){var ok=!!r.textContent.trim()&&r.textContent!==before;'+send+'"test",ok:ok,message:ok?"Mission réussie : ton bouton modifie vraiment le texte !":"Le clic ne change pas encore le texte. Vérifie ton écouteur click et resultat.textContent."},"*")},150)},150);<\/script>';
 return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'unsafe-inline\'; style-src \'unsafe-inline\'; img-src data: blob:; connect-src \'none\'; form-action \'none\'; base-uri \'none\';"><style>'+CSS+'</style></head><body>'+HTML+bootstrap+'<script>'+JS+'<\/script>'+(withTest?test:'')+'</body></html>';
}
let activeRun=null;
window.addEventListener('message',(event)=>{
 if(!activeRun||event.source!==activeRun.frame.contentWindow)return;
 const d=event.data;if(!d||d.__eliCodeV55!==true||d.token!==activeRun.token)return;
 const session=activeRun;
 if(!document.body.contains(session.frame))return;
 if(d.kind==='error'){session.feedback.className='eli-feedback bad';session.feedback.textContent='Erreur JavaScript : '+String(d.message).slice(0,300)+'\nConseil d’Eli : vérifie les noms de variables, les parenthèses et les accolades.';session.p.lastTest=false;writeData()}
 if(d.kind==='test'){
   session.p.lastTest=!!d.ok;
   writeData();
   session.feedback.className='eli-feedback '+(d.ok?'good':'bad');
   session.feedback.textContent=(d.ok?'✓ ':'À corriger : ')+String(d.message||'').slice(0,600);
 }
});
function reportFeedback(area,message,kind){
 area.className='eli-feedback'+(kind?' '+kind:'');
 area.textContent=message;
}
function mount(){
 const card=root.querySelector('section.sg-card');if(!card||card.querySelector('#eli-code-coach-v55'))return;
 const id=currentId(),p=projectData(id);
 const panel=create('section','eli-code-box');panel.id='eli-code-coach-v55';
 const heading=create('h3',null,'Coder avec Eli — mission pratique');
 const desc=create('p','eli-sub','Écris du code toi-même. Eli te propose un exercice, un indice et un test réel. Le code reste enregistré dans ton navigateur.');
 panel.append(heading,desc);
 const details=create('details');const summary=create('summary',null,'🎯 Objectif de cette mission');
 details.append(summary,create('p','eli-sub','Programmation : rendre un bouton HTML fonctionnel avec JavaScript. Test : après le clic, le texte « En attente… » doit changer. DevOps : préparer un workflow GitHub Actions, puis le tester dans GitHub.'));
 details.open=true;panel.append(details);
 const ctr=create('div','eli-controls');
 const select=create('select');
 const modes=[['html','HTML'],['css','CSS'],['js','JavaScript'],['yaml','GitHub Actions (DevOps)']];
 for(const [key,label]of modes){const opt=create('option',null,label);opt.value=key;select.append(opt)}
 select.value=p.mode||'js';
 ctr.append(create('label',null,'Fichier à modifier :'),select);
 const hint=makeBtn('Indice d’Eli',()=>{const n=Math.min(p.hints||0,2);const message=select.value==='yaml'?'Un workflow doit déclarer jobs, runs-on et steps. Ajoute aussi une étape « run » qui lance une véritable commande.':hints[n];reportFeedback(feedback,message);p.hints=(n+1)%3;writeData()},'');
 ctr.append(hint);
 panel.append(ctr);
 const grid=create('div','eli-code-grid');
 const left=create('div'),right=create('div');
 const editor=create('textarea','eli-edit');editor.spellcheck=false;editor.setAttribute('aria-label','Éditeur de code Eli');editor.autocomplete='off';editor.value=String(p.files[select.value]||'');
 const editorTip=create('div','eli-minor','Modifications sauvegardées automatiquement dans ce navigateur.');
 left.append(editor,editorTip);
 const previewLabel=create('div','eli-sub','Résultat réel du navigateur (HTML, CSS, JavaScript)');
 const frame=create('iframe','eli-preview');
 frame.title='Prévisualisation sécurisée du code';
 frame.setAttribute('sandbox','allow-scripts');
 frame.setAttribute('referrerpolicy','no-referrer');
 frame.srcdoc='<!doctype html><html lang="fr"><body style="font:14px system-ui;color:#555;padding:18px">Clique sur « Exécuter mon code » pour voir le résultat ici.</body></html>';
 right.append(previewLabel,frame);
 grid.append(left,right);panel.append(grid);
 const buttons=create('div','eli-controls');
 const run=makeBtn('▶ Exécuter mon code',()=>execute(false),'eli-run');
 const test=makeBtn('✓ Tester ma mission',()=>execute(true),'eli-run');
 const exportBtn=makeBtn('Exporter mon code',()=>archiveCode(id));
 buttons.append(run,test,exportBtn);panel.append(buttons);
 const feedback=create('div','eli-feedback','Eli : commence par ouvrir JavaScript. Ajoute un écouteur click, puis exécute et teste ton code.');
 feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');panel.append(feedback);
 const foot=create('p','eli-minor','Les projets JavaScript/HTML/CSS sont exécutés dans un aperçu isolé. Les workflows DevOps sont vérifiés localement, mais exécutés uniquement dans GitHub. Eli ne génère pas de corrections par IA à cette étape.');
 panel.append(foot);
 function store(){
  p.files[select.value]=editor.value.slice(0,20000);p.mode=select.value;p.lastTest=false;
  if(!writeData())reportFeedback(feedback,'Impossible de sauvegarder : stockage plein. Exporte ton code.','bad');
 }
 select.addEventListener('change',()=>{p.mode=select.value;editor.value=String(p.files[select.value]||'');writeData();reportFeedback(feedback,select.value==='yaml'?'Écris ton workflow. Eli peut vérifier sa structure, mais GitHub doit réellement exécuter les tests.':'Modifier le code puis cliquer sur Exécuter ou Tester.');});
 editor.addEventListener('input',store);
 function execute(check){
   store();
   if(select.value==='yaml'){
     const y=String(p.files.yaml||'');
     const conditions=[/^name\s*:/m.test(y),/^(on|"on"|'on')\s*:/m.test(y),/^jobs\s*:/m.test(y),/runs-on\s*:/m.test(y),/steps\s*:/m.test(y),/^\s*-\s*run\s*:/m.test(y)];
     const titles=['name','on','jobs','runs-on','steps','- run'];
     const missing=titles.filter((_,i)=>!conditions[i]);
     reportFeedback(feedback,missing.length?'Eli : il manque '+missing.join(', ')+'. Essaie d’ajouter les sections manquantes.':'Structure de base détectée. Pour exécuter ce workflow réellement, place-le dans .github/workflows/ et vérifie les résultats sur GitHub Actions.',missing.length?'bad':'good');
     p.lastTest=false;writeData();return;
   }
   const token='eli-'+Date.now()+'-'+Math.random().toString(36).slice(2);
   activeRun={token,frame,feedback,p};
   frame.srcdoc=cspDocument(p.files,token,check);
   reportFeedback(feedback,check?'Eli vérifie automatiquement le clic sur le bouton…':'Code exécuté dans l’aperçu isolé. Clique sur le bouton pour observer le résultat.');
 }
 card.append(panel);
}
new MutationObserver(mount).observe(root,{childList:true});
mount();
})();
