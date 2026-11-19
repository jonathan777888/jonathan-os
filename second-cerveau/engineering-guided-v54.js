(function guided(){
'use strict';
const KEY='second-brain-engineering-guided-v54';
const phases=[
['Comprendre le besoin','Décris le problème et les utilisateurs du logiciel.','Quel problème souhaites-tu résoudre et pour qui ?','Je comprends le besoin.'],
['Spécifier la première version','Définis une fonctionnalité prioritaire et un résultat mesurable.','Quelle fonctionnalité construiras-tu en premier, et comment vérifieras-tu son fonctionnement ?','J’ai un critère de réussite concret.'],
['Concevoir','Planifie les composants, les données et les interactions.','Quelle architecture simple utiliseras-tu ?','Je sais expliquer le rôle de chaque composant.'],
['Préparer le développement','Crée ton projet, prépare Git et les outils nécessaires.','Quels outils as-tu préparés et quelle commande démarre ton projet ?','Je peux démarrer mon projet localement.'],
['Coder une fonctionnalité','Écris et exécute du vrai code.','Qu’as-tu programmé et quel résultat as-tu obtenu ?','J’ai exécuté et vérifié mon code.'],
['Tester et corriger','Effectue des tests, reproduis les erreurs et corrige-les.','Quels tests as-tu exécutés et quelles erreurs as-tu corrigées ?','J’ai une preuve de test.'],
['Intégration continue (CI)','Automatise les tests et la compilation.','Quel pipeline as-tu exécuté et quel est son résultat ?','Mon pipeline a exécuté une vérification réelle.'],
['Déploiement (CD)','Publie ton logiciel et vérifie la version déployée.','Où ton application est-elle publiée et comment l’as-tu testée ?','J’ai vérifié la version déployée.'],
['Maintenance et amélioration','Surveille les erreurs et définis la prochaine itération.','Comment détecteras-tu les incidents et quelle amélioration réaliseras-tu ?','Je dispose d’un plan d’amélioration.']
];
const encouragements = [["Jacques 1:5","Quand tu as besoin de sagesse, tu peux la demander à Dieu."],["Proverbes 16:3","Confie ton travail à Jéhovah tout en faisant ta part avec soin."],["Luc 14:28","Avant de construire, prends le temps de prévoir ce qui sera nécessaire."],["Psaume 121:2","Ton secours vient de Jéhovah, le Créateur du ciel et de la terre."],["Philippiens 4:13","Tu peux trouver de la force grâce à celui qui te fortifie."],["Proverbes 24:16","Une difficulté ou une chute n’oblige pas à abandonner : relève-toi."],["1 Corinthiens 14:40","L’ordre et une bonne méthode t’aident à avancer avec clarté."],["Galates 6:9","Ne te lasse pas de faire ce qui est bien, même quand le progrès est lent."],["Colossiens 3:23","Travaille de tout cœur pour Jéhovah, et non pour rechercher la gloire des hommes."]];
// Courtes reformulations du sens des versets, et non des citations d'une traduction particulière.
function verse(ref,thought){const aside=document.createElement('aside');aside.className='sg-verse';aside.setAttribute('aria-label','Encouragement biblique');const label=document.createElement('strong');label.textContent='Pour t’encourager · '+ref;const p=document.createElement('p');p.textContent=thought;aside.append(label,p);return aside}
const css=document.createElement('style');css.textContent=`
#sg-v54{position:fixed;inset:0;z-index:100000;background:#0a1222;color:#eff4ff;font:15px/1.55 system-ui,sans-serif;overflow:auto}
#sg-v54[hidden]{display:none!important}#sg-v54 *{box-sizing:border-box}
#sg-v54 .sg-wrap{max-width:760px;margin:auto;padding:23px 14px 70px}
#sg-v54 .sg-head,#sg-v54 .sg-actions,#sg-v54 .sg-switch{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
#sg-v54 .sg-head{margin-bottom:25px}
#sg-v54 .sg-card{padding:23px;border:1px solid #314563;border-radius:20px;background:#15233b}
#sg-v54 h1{font-size:clamp(23px,4vw,32px);margin:7px 0 15px}
#sg-v54 .sg-sub{color:#a8bad6;font-size:13px}
#sg-v54 button{border:1px solid #4d5f82;border-radius:10px;background:#213450;color:#fff;padding:10px 13px;font:700 13px system-ui;cursor:pointer}
#sg-v54 button:disabled{opacity:.5;cursor:not-allowed}
#sg-v54 button.sg-main{background:#8d83ff;color:#0c1233;border-color:#8d83ff}
#sg-v54 label{display:block;font-weight:700;margin:18px 0 6px}
#sg-v54 input,#sg-v54 textarea,#sg-v54 select{width:100%;background:#0d1a30;color:#fff;border:1px solid #4c6081;border-radius:10px;padding:11px;font:14px system-ui}
#sg-v54 textarea{min-height:145px;resize:vertical}
#sg-v54 .sg-verse{margin:16px 0;padding:13px 16px;border-left:3px solid #bdb9f0;border-radius:10px;background:#17243d;color:#dce8fa}#sg-v54 .sg-verse strong{display:block;font-size:12px;color:#c7c5fa;font-weight:800}#sg-v54 .sg-verse p{font-size:14px;line-height:1.5;margin:6px 0 0}
#sg-v54 .sg-eli{padding:14px;margin:18px 0;background:#1d3855;border:1px solid #537d9c;border-radius:13px;display:flex;gap:12px}
#sg-v54 .sg-face{width:86px;height:86px;flex:0 0 86px;border-radius:14px;background:#f3ecdc;object-fit:cover;object-position:center;display:block}
#sg-v54 .sg-progress{height:8px;background:#273751;border-radius:20px;overflow:hidden;margin:9px 0 17px}
#sg-v54 .sg-progress div{height:100%;background:#73cfbd}
#sg-v54 .sg-actions{margin-top:20px}
#sg-v54 .sg-confirm{display:flex;gap:10px;align-items:flex-start;margin-top:17px}
#sg-v54 .sg-confirm input{width:20px;height:20px;margin:2px 0 0}
#sg-v54 .sg-project{border:1px solid #405578;border-radius:10px;padding:10px;margin:8px 0;display:flex;justify-content:space-between;align-items:center;gap:12px}
#sg-v54 .sg-save{font-size:12px;color:#a4d9c9;margin-top:9px}
#sg-v54-toggle{position:fixed;bottom:15px;right:15px;z-index:100001;background:#8d83ff;color:#10142f;border:0;border-radius:22px;padding:11px 16px;font:700 13px system-ui;cursor:pointer}

/* Eli is silent and clearly animated, while the beige background has moving waves. */
#sg-v54 .sg-face{width:118px;height:118px;flex:0 0 118px;display:block;object-fit:contain;object-position:center;transform-origin:center 80%;animation:eli-full-motion 2.4s ease-in-out infinite!important;transition:none!important;filter:drop-shadow(0 7px 6px rgba(93,59,33,.2));border-radius:17px}
@keyframes eli-full-motion{0%,100%{transform:translate3d(0,2px,0) rotate(-5deg) scale(1)}25%{transform:translate3d(6px,-12px,0) rotate(4deg) scale(1.07)}50%{transform:translate3d(0,-2px,0) rotate(-2deg) scale(.98)}75%{transform:translate3d(-6px,-13px,0) rotate(5deg) scale(1.08)}}
/* Decor manga sable / vagues vivantes, personnage Eli immobile et silencieux. */
#sg-v54{
  color:#392b24;
  background:radial-gradient(ellipse at 15% 18%,#fff8ec 0%,transparent 48%),
             radial-gradient(ellipse at 91% 38%,#edcfad 0%,transparent 48%),
             linear-gradient(155deg,#fbf1df 0%,#eee0cb 55%,#e4cba9 100%);
}
#sg-v54 .sg-wave-scene{position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:0}
#sg-v54 .sg-wave{position:absolute;left:-35%;width:170%;pointer-events:none;transform-origin:center}
#sg-v54 .sg-wave svg{width:100%;height:100%;display:block}
#sg-v54 .sg-wave-back{height:38vh;bottom:19%;opacity:.34;animation:sg-v54-surf 21s ease-in-out infinite alternate}
#sg-v54 .sg-wave-mid{height:37vh;bottom:6%;opacity:.44;animation:sg-v54-surf-reverse 16s ease-in-out infinite alternate}
#sg-v54 .sg-wave-front{height:41vh;bottom:-13%;opacity:.57;animation:sg-v54-surf 13s ease-in-out infinite alternate}
#sg-v54 .sg-ambient{position:absolute;border-radius:50%;filter:blur(24px);opacity:.28;background:#fff4d9;pointer-events:none}
#sg-v54 .sg-ambient-a{width:360px;height:360px;top:3%;left:-13%;animation:sg-v54-breathe 20s ease-in-out infinite alternate}
#sg-v54 .sg-ambient-b{width:320px;height:320px;top:47%;right:-12%;background:#f3d4ac;animation:sg-v54-breathe 17s ease-in-out infinite alternate-reverse}
#sg-v54 .sg-wrap{position:relative;z-index:2}
#sg-v54 .sg-head strong{color:#604536}
#sg-v54 .sg-sub{color:#856e5d}
#sg-v54 .sg-card{position:relative;overflow:hidden;color:#322922;background:rgba(255,252,245,.95);border:1px solid #d4b99d;box-shadow:0 16px 46px rgba(105,77,45,.13);animation:sg-v54-reveal .45s ease-out both}
#sg-v54 .sg-card:before{content:"";position:absolute;left:0;right:0;top:0;height:4px;background:linear-gradient(90deg,#aa8062,#eed5b3,#aa8062)}
#sg-v54 h1,#sg-v54 h2{color:#3e2f29}
#sg-v54 button{background:#fff8ec;color:#543a2e;border-color:#c6aa8c;box-shadow:0 2px 0 rgba(107,72,38,.07)}
#sg-v54 button.sg-main{color:#fffaf0;background:#815641;border-color:#815641}
#sg-v54 button:focus-visible,#sg-v54 input:focus-visible,#sg-v54 textarea:focus-visible,#sg-v54 select:focus-visible{outline:3px solid #ba9275;outline-offset:3px}
#sg-v54 input,#sg-v54 textarea,#sg-v54 select{color:#352a23;background:#fffcf6;border-color:#cab092}
#sg-v54 .sg-verse{background:#f6ead6;color:#59442f;border-left:3px solid #bd8953}
#sg-v54 .sg-verse strong{color:#8a562b}
#sg-v54 .sg-eli{background:#f8ead5;color:#453329;border:1px solid #d2ae84;align-items:center}
/* Eli is animated separately from the beige wave landscape. */
#sg-v54 .sg-face{animation:sg-v54-eli-enter .85s cubic-bezier(.2,1.3,.4,1) both,sg-v54-eli-live 3.1s 1s ease-in-out infinite;transform-origin:50% 85%;will-change:transform}
#sg-v54 .sg-eli:hover .sg-face{animation-play-state:paused;transform:translateY(-6px) rotate(-4deg) scale(1.04)}
@keyframes sg-v54-eli-enter{0%{opacity:0;transform:translateY(18px) scale(.82) rotate(-8deg)}70%{opacity:1;transform:translateY(-4px) scale(1.04) rotate(3deg)}100%{opacity:1;transform:translateY(0) scale(1) rotate(0)}}
@keyframes sg-v54-eli-live{0%,100%{transform:translateY(0) rotate(-2deg) scale(1)}25%{transform:translateY(-5px) rotate(1.7deg) scale(1.02)}50%{transform:translateY(-2px) rotate(0) scale(.99,1.02)}75%{transform:translateY(-6px) rotate(2deg) scale(1.02)}}

#sg-v54 .sg-project{color:#4c382c;border-color:#ceb093}
#sg-v54 .sg-save{color:#6a6b4c}
#sg-v54 .sg-progress{background:#e1d0bc}
#sg-v54 .sg-progress div{background:linear-gradient(90deg,#997454,#bc956d)}
#sg-v54-toggle{color:#fff7eb;background:#76503e}
@keyframes sg-v54-surf{0%{transform:translate3d(-4%,0,0) rotate(-1deg)}100%{transform:translate3d(5%,12px,0) rotate(1deg)}}
@keyframes sg-v54-surf-reverse{0%{transform:translate3d(5%,8px,0) rotate(1deg)}100%{transform:translate3d(-5%,-8px,0) rotate(-1deg)}}
@keyframes sg-v54-breathe{0%{transform:translate3d(0,0,0) scale(1)}100%{transform:translate3d(65px,-24px,0) scale(1.18)}}
@keyframes sg-v54-reveal{from{opacity:.75;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@media(max-width:560px){
  #sg-v54 .sg-card{padding:18px}
  #sg-v54 .sg-wave{width:210%;left:-65%}
  #sg-v54 .sg-wave-back{bottom:28%}
  #sg-v54 .sg-wave-front{bottom:-7%}
}
@media(prefers-reduced-motion:reduce){
  #sg-v54 .sg-wave,#sg-v54 .sg-ambient,#sg-v54 .sg-card{animation:none!important} #sg-v54 .sg-face{animation:eli-full-motion 2.4s ease-in-out infinite!important}
}

/* Strong independent animation: JS transforms the entire Eli stage. */
#sg-v54 .sg-eli{overflow:visible;min-height:200px}
#sg-v54 .sg-eli-stage{display:block;position:relative;width:180px;height:180px;flex:0 0 180px;transform-origin:50% 85%;will-change:transform;pointer-events:none}
#sg-v54 .sg-face{width:180px!important;height:180px!important;max-width:none!important;display:block;object-fit:contain;border-radius:16px;animation:none!important;transform:none!important;filter:drop-shadow(0 8px 6px rgba(120,84,51,.2))}
#sg-v54 .sg-eli:hover .sg-face{animation:none!important;transform:none!important}
@media(max-width:600px){
  #sg-v54 .sg-eli{min-height:150px}
  #sg-v54 .sg-eli-stage{width:124px;height:124px;flex:0 0 124px}
  #sg-v54 .sg-face{width:124px!important;height:124px!important}
}

#sg-v54 .sg-legacy-recovery{margin-top:22px;padding:16px;border-radius:15px;border:1px solid #cda981;background:rgba(253,242,225,.95);color:#4d3829}
#sg-v54 .sg-legacy-recovery h2{font-size:18px;margin:0 0 7px;color:#5c4130}
#sg-v54 .sg-legacy-recovery p{font-size:13px;line-height:1.6;margin:4px 0 12px}
#sg-v54 .sg-legacy-recovery button{display:inline-flex;margin:5px 7px 5px 0;font-size:12px}
#sg-v54 .sg-legacy-names{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:9px}
#sg-v54 .sg-legacy-name{font-size:12px;padding:3px 8px;border:1px solid #d7bfa5;background:#fff9ef;border-radius:99px}
`;document.head.append(css);
const overlay=document.createElement('div');overlay.id='sg-v54';overlay.innerHTML='<div class="sg-wrap"><div class="sg-head"><div><strong>Second Cerveau · Génie logiciel & DevOps</strong><div class="sg-sub">Un projet · Une étape visible à la fois</div></div><button type="button" id="sg-old">Atelier avancé ↗</button></div><div id="sg-content"></div><div class="sg-sub" style="margin-top:18px">Les données de ton ancien atelier restent intactes. Parcours sauvegardé localement et inclus dans la synchronisation Second Cerveau lorsque celle-ci fonctionne.</div></div>';
document.body.append(overlay);

const waves=document.createElement('div');
waves.className='sg-wave-scene';
waves.setAttribute('aria-hidden','true');
waves.innerHTML='<div class="sg-ambient sg-ambient-a"></div><div class="sg-ambient sg-ambient-b"></div>'+
'<div class="sg-wave sg-wave-back"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 300" preserveAspectRatio="none"><path fill="#d6ae83" d="M0,118 C150,16 330,212 500,113 S830,22 1020,121 S1150,172 1200,123 L1200,300 L0,300 Z"/></svg></div>'+
'<div class="sg-wave sg-wave-mid"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 300" preserveAspectRatio="none"><path fill="#d9ba98" d="M0,130 C160,238 270,27 440,122 S720,217 900,125 S1090,33 1200,134 L1200,300 L0,300 Z"/></svg></div>'+
'<div class="sg-wave sg-wave-front"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 300" preserveAspectRatio="none"><path fill="#be9169" d="M0,118 C150,7 280,217 455,111 S735,13 917,110 S1100,205 1200,118 L1200,300 L0,300 Z"/></svg></div>';
overlay.prepend(waves);

const toggle=document.createElement('button');toggle.id='sg-v54-toggle';toggle.textContent='Parcours guidé';document.body.append(toggle);
const root=overlay.querySelector('#sg-content');
const el=(tag,text,cls)=>{const a=document.createElement(tag);if(text!==null)a.textContent=text;if(cls)a.className=cls;return a};
const btn=(label,fn,cls)=>{const a=el('button',label,cls);a.type='button';a.onclick=fn;return a};
// Real animated character: separate authentic expressions, switched by JavaScript.

const ELI_STILLS=['./eli-neutre-v3.svg','./eli-sourire-v3.svg'];
ELI_STILLS.forEach(src=>{const preload=new Image();preload.src=src});
function eliPortrait(){
  const stage=el('span',null,'sg-eli-stage');
  const image=el('img',null,'sg-face');
  image.src=ELI_STILLS[0];
  image.dataset.expression='0';
  image.alt='Eli, mascotte animée aux expressions changeantes';
  image.width=180;
  image.height=180;
  image.loading='eager';
  stage.append(image);
  return stage;
}
// Move the CHARACTER, not the scenery. JS updates a separate stage,
// avoiding browser differences for animations inside SVG <img>.
function animateEli(time){
  if(!overlay.hidden){
    const seconds=time/1000;
    const expression=(seconds%6.4>3.8&&seconds%6.4<5.5)?1:0;
    for(const stage of overlay.querySelectorAll('.sg-eli-stage')){
      const img=stage.querySelector('img.sg-face');
      if(!img)continue;
      const x=Math.sin(seconds*1.4)*16;
      const y=-22*Math.abs(Math.sin(seconds*1.75));
      const turn=Math.sin(seconds*1.2)*8;
      const zoom=1+0.055*Math.abs(Math.sin(seconds*1.75));
      stage.style.transform='translate3d('+x.toFixed(1)+'px,'+y.toFixed(1)+'px,0) rotate('+turn.toFixed(1)+'deg) scale('+zoom.toFixed(3)+')';
      if(img.dataset.expression!==String(expression)){
        img.dataset.expression=String(expression);
        img.src=ELI_STILLS[expression];
      }
    }
  }
  window.requestAnimationFrame(animateEli);
}
window.requestAnimationFrame(animateEli);

// L'atelier historique utilise une clé différente : ne jamais écraser son contenu.
const LEGACY_KEY='second-cerveau-genie-logiciel-v1';
function legacyRead(){
  let source;try{source=localStorage.getItem(LEGACY_KEY)}catch{return {error:'Le stockage local est inaccessible.'}}
  if(!source)return null;
  try{
    const val=JSON.parse(source);
    if(!val||typeof val!=='object'||!Array.isArray(val.projects))return {error:'La sauvegarde de l’ancien atelier ne peut pas être affichée automatiquement.'};
    return {
      projectCount:val.projects.length,
      noteCount:Array.isArray(val.notes)?val.notes.length:0,
      taskCount:Array.isArray(val.tasks)?val.tasks.length:0,
      names:val.projects.slice(0,12).map(p=>String(p?.name||'Projet sans nom').slice(0,120))
    };
  }catch{return {error:'La sauvegarde locale de l’ancien atelier est illisible. Ne la supprime pas.'}}
}
function exportEngineeringData(){
  const bundle={kind:'second-cerveau-engineering-safety-export',exportedAt:new Date().toISOString(),origin:location.origin,keys:{}};
  for(const key of [KEY,LEGACY_KEY]){
    try{bundle.keys[key]=localStorage.getItem(key)}catch{bundle.keys[key]=null}
  }
  try{
    const blob=new Blob([JSON.stringify(bundle,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;
    a.download='second-cerveau-sauvegarde-genie-logiciel-'+new Date().toISOString().slice(0,10)+'.json';
    document.body.append(a);a.click();a.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),3000);
  }catch{alert('Export impossible sur cet appareil. Essaie depuis ton PC.')}
}
function appendLegacyRecovery(card){
  const legacy=legacyRead();
  const pane=el('div',null,'sg-legacy-recovery');
  const heading=el('h2',null);
  heading.textContent=legacy?'Retrouver mes anciens travaux':'Où sont mes anciens projets ?';
  pane.append(heading);
  if(legacy&&!legacy.error){
    pane.append(el('p','Un ancien atelier est enregistré dans ce navigateur : '+legacy.projectCount+' projet(s), '+legacy.noteCount+' note(s) et '+legacy.taskCount+' tâche(s). Ces données ne sont pas remplacées.'));
    const names=el('div',null,'sg-legacy-names');
    for(const name of legacy.names)names.append(el('span',name,'sg-legacy-name'));
    pane.append(names);
    pane.append(btn('Ouvrir mes anciens projets',()=>{
      show(false);
      const projectsBtn=document.querySelector('#sideNav [data-nav="projects"]');
      if(projectsBtn)projectsBtn.click();
    },'sg-main'));
  }else{
    pane.append(el('p',legacy?.error||'Ce navigateur ne contient pas de sauvegarde de l’ancien atelier. Si tu as écrit sur un autre appareil, retrouve le navigateur et le site d’origine.'));
    pane.append(btn('Ouvrir l’ancien atelier',()=>show(false)));
  }
  pane.append(btn('Exporter une copie de sécurité des deux espaces',exportEngineeringData));
  card.append(pane);
}
const fresh=()=>({version:1,projects:[],activeId:null});
function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||'null');return x&&Array.isArray(x.projects)?x:fresh()}catch{return fresh()}}
const state=load();
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));return true}catch{return false}}
function current(){return state.projects.find(x=>x.id===state.activeId)}
function show(on){overlay.hidden=!on;toggle.hidden=on}
function start(){
root.replaceChildren();
const card=el('section',null,'sg-card');card.append(el('div','NOUVEAU PROJET','sg-sub'),el('h1','Quel projet souhaites-tu réaliser ?'));
const eli=el('div',null,'sg-eli');eli.append(eliPortrait(),el('div','Eli · Je te guiderai à travers un projet réel, une étape à la fois.'));card.append(eli,verse('Proverbes 3:5-6','Fais confiance à Jéhovah et recherche sa direction pendant que tu prépares ton projet.'));
card.append(el('label','Nom du projet'));const input=el('input');input.maxLength=150;input.placeholder='Ex. Gestionnaire de parcelles';card.append(input);
card.append(el('label','Catégorie'));const type=el('select');['Application web','API / serveur','Automatisation DevOps','Autre logiciel'].forEach(t=>{const o=el('option',t);o.value=t;type.append(o)});card.append(type);
const action=el('div',null,'sg-actions');action.append(btn('Commencer →',()=>{const name=input.value.trim();if(!name){input.focus();return}const p={id:'project-'+Date.now(),name:name.slice(0,150),type:type.value,index:0,steps:{},createdAt:new Date().toISOString()};state.projects.push(p);state.activeId=p.id;if(!save())return alert('Sauvegarde impossible : vérifie le stockage local.');render()},'sg-main'));card.append(action);
if(state.projects.length){card.append(el('h2','Projets existants'));state.projects.slice().reverse().forEach(p=>{const row=el('div',null,'sg-project');row.append(el('span',p.name),btn('Reprendre',()=>{state.activeId=p.id;save();render()}));card.append(row)})}
appendLegacyRecovery(card);
root.append(card);
}
function render(){
const p=current();if(!p)return start();
const i=Math.max(0,Math.min(8,Number(p.index)||0));const phase=phases[i];p.steps[i]??={answer:'',checked:false};const record=p.steps[i];root.replaceChildren();
const head=el('div',null,'sg-switch');head.append(el('span',p.name,'sg-sub'),btn('Mes projets',()=>{state.activeId=null;save();start()}));root.append(head);
root.append(el('div','Étape '+(i+1)+'/9 — '+phase[0],'sg-sub'));
const progress=el('div',null,'sg-progress'),fill=el('div');fill.style.width=(100*i/9)+'%';progress.append(fill);root.append(progress);
const card=el('section',null,'sg-card');card.append(el('h1',phase[0]));
const eli=el('div',null,'sg-eli');eli.append(eliPortrait(),el('div','Eli · '+phase[1]));card.append(eli,verse(encouragements[i][0],encouragements[i][1]));
card.append(el('label',phase[2]));const txt=el('textarea');txt.value=record.answer||'';txt.placeholder='Décris les actions effectuées et leurs résultats…';card.append(txt);
const check=el('label',null,'sg-confirm'),cb=el('input');cb.type='checkbox';cb.checked=!!record.checked;check.append(cb,el('span',phase[3]));card.append(check);
const status=el('div','Sauvegarde automatique locale.','sg-save');card.append(status);
const actions=el('div',null,'sg-actions'),back=btn('← Précédent',()=>{if(i){p.index=i-1;save();render()}});back.disabled=i===0;actions.append(back);
const next=btn(i===8?'Terminer mon projet ✓':'Étape suivante →',()=>{store();if(!record.answer.trim()||!record.checked)return; if(i===8){p.finishedAt=new Date().toISOString();save();finish(p)}else{p.index=i+1;save();render()}},'sg-main');
next.disabled=!record.answer.trim()||!record.checked;actions.append(next);card.append(actions);
function store(){record.answer=txt.value.slice(0,15000);record.checked=cb.checked;p.updatedAt=new Date().toISOString();const ok=save();status.textContent=ok?'Réponse enregistrée sur cet appareil.':'Erreur de sauvegarde : exporte tes données avant de continuer.';next.disabled=!record.answer.trim()||!record.checked;}
txt.oninput=store;cb.onchange=store;root.append(card);
}
function finish(p){root.replaceChildren();const card=el('section',null,'sg-card');card.append(el('h1','Projet terminé !'),el('p','Tu as documenté les 9 étapes pour « '+p.name+' ». Vérifie que les livrables et les tests existent réellement.'));card.append(verse('Psaume 37:5','Continue de confier ta voie à Jéhovah, avec confiance, pour la suite du projet.'));card.append(btn('Revoir les étapes',()=>{p.index=0;save();render()},'sg-main'));root.append(card)}
overlay.querySelector('#sg-old').onclick=()=>show(false);
toggle.onclick=()=>{show(true);render()};
show(true);render();
})();
