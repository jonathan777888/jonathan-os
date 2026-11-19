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
#sg-v54 .sg-verse{margin:16px 0;padding:13px 16px;border-left:3px solid #bdb9f0;border-radius:10px;background:#17243d;color:#dce8fa}.sg-verse strong{display:block;font-size:12px;color:#c7c5fa;font-weight:800}.sg-verse p{font-size:14px;line-height:1.5;margin:6px 0 0}
#sg-v54 .sg-eli{padding:14px;margin:18px 0;background:#1d3855;border:1px solid #537d9c;border-radius:13px;display:flex;gap:12px}
#sg-v54 .sg-face{width:42px;height:42px;flex:0 0 42px;border-radius:12px;background:#4a668a;display:grid;place-items:center;font-weight:850}
#sg-v54 .sg-progress{height:8px;background:#273751;border-radius:20px;overflow:hidden;margin:9px 0 17px}
#sg-v54 .sg-progress div{height:100%;background:#73cfbd}
#sg-v54 .sg-actions{margin-top:20px}
#sg-v54 .sg-confirm{display:flex;gap:10px;align-items:flex-start;margin-top:17px}
#sg-v54 .sg-confirm input{width:20px;height:20px;margin:2px 0 0}
#sg-v54 .sg-project{border:1px solid #405578;border-radius:10px;padding:10px;margin:8px 0;display:flex;justify-content:space-between;align-items:center;gap:12px}
#sg-v54 .sg-save{font-size:12px;color:#a4d9c9;margin-top:9px}
#sg-v54-toggle{position:fixed;bottom:15px;right:15px;z-index:100001;background:#8d83ff;color:#10142f;border:0;border-radius:22px;padding:11px 16px;font:700 13px system-ui;cursor:pointer}
`;document.head.append(css);
const overlay=document.createElement('div');overlay.id='sg-v54';overlay.innerHTML='<div class="sg-wrap"><div class="sg-head"><div><strong>Second Cerveau · Génie logiciel & DevOps</strong><div class="sg-sub">Un projet · Une étape visible à la fois</div></div><button type="button" id="sg-old">Atelier avancé ↗</button></div><div id="sg-content"></div><div class="sg-sub" style="margin-top:18px">Les données de ton ancien atelier restent intactes. Parcours sauvegardé localement et inclus dans la synchronisation Second Cerveau lorsque celle-ci fonctionne.</div></div>';
document.body.append(overlay);
const toggle=document.createElement('button');toggle.id='sg-v54-toggle';toggle.textContent='Parcours guidé';document.body.append(toggle);
const root=overlay.querySelector('#sg-content');
const el=(tag,text,cls)=>{const a=document.createElement(tag);if(text!==null)a.textContent=text;if(cls)a.className=cls;return a};
const btn=(label,fn,cls)=>{const a=el('button',label,cls);a.type='button';a.onclick=fn;return a};
const fresh=()=>({version:1,projects:[],activeId:null});
function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||'null');return x&&Array.isArray(x.projects)?x:fresh()}catch{return fresh()}}
const state=load();
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));return true}catch{return false}}
function current(){return state.projects.find(x=>x.id===state.activeId)}
function show(on){overlay.hidden=!on;toggle.hidden=on}
function start(){
root.replaceChildren();
const card=el('section',null,'sg-card');card.append(el('div','NOUVEAU PROJET','sg-sub'),el('h1','Quel projet souhaites-tu réaliser ?'));
const eli=el('div',null,'sg-eli');eli.append(el('div','E','sg-face'),el('div','Eli · Je te guiderai à travers un projet réel, une étape à la fois.'));card.append(eli,verse('Proverbes 3:5-6','Fais confiance à Jéhovah et recherche sa direction pendant que tu prépares ton projet.'));
card.append(el('label','Nom du projet'));const input=el('input');input.maxLength=150;input.placeholder='Ex. Gestionnaire de parcelles';card.append(input);
card.append(el('label','Catégorie'));const type=el('select');['Application web','API / serveur','Automatisation DevOps','Autre logiciel'].forEach(t=>{const o=el('option',t);o.value=t;type.append(o)});card.append(type);
const action=el('div',null,'sg-actions');action.append(btn('Commencer →',()=>{const name=input.value.trim();if(!name){input.focus();return}const p={id:'project-'+Date.now(),name:name.slice(0,150),type:type.value,index:0,steps:{},createdAt:new Date().toISOString()};state.projects.push(p);state.activeId=p.id;if(!save())return alert('Sauvegarde impossible : vérifie le stockage local.');render()},'sg-main'));card.append(action);
if(state.projects.length){card.append(el('h2','Projets existants'));state.projects.slice().reverse().forEach(p=>{const row=el('div',null,'sg-project');row.append(el('span',p.name),btn('Reprendre',()=>{state.activeId=p.id;save();render()}));card.append(row)})}
root.append(card);
}
function render(){
const p=current();if(!p)return start();
const i=Math.max(0,Math.min(8,Number(p.index)||0));const phase=phases[i];p.steps[i]??={answer:'',checked:false};const record=p.steps[i];root.replaceChildren();
const head=el('div',null,'sg-switch');head.append(el('span',p.name,'sg-sub'),btn('Mes projets',()=>{state.activeId=null;save();start()}));root.append(head);
root.append(el('div','Étape '+(i+1)+'/9 — '+phase[0],'sg-sub'));
const progress=el('div',null,'sg-progress'),fill=el('div');fill.style.width=(100*i/9)+'%';progress.append(fill);root.append(progress);
const card=el('section',null,'sg-card');card.append(el('h1',phase[0]));
const eli=el('div',null,'sg-eli');eli.append(el('div','E','sg-face'),el('div','Eli · '+phase[1]));card.append(eli,verse(encouragements[i][0],encouragements[i][1]));
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
