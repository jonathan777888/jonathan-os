/* Synapse - carte neuronale integree au Second Cerveau.
 * Les idees proviennent de second-brain-current (navigateur de l'utilisateur).
 * Aucun contenu personnel n'est publie dans le depot.
 */
(() => {
'use strict';
const PAGE='synapse', STORE='second-brain-synapse-v5-progress', SOURCE='second-brain-current';
const COLORS=['#e38db9','#f1be74','#6bdfc8','#9cb3ff','#bba1ff','#6dcdf5'];
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=x=>Number.isFinite(x)?x:0;
let graph={nodes:[],edges:[]},nodes=new Map(),edges=new Map();
let xp={xp:0,returns:0,edge:null,t:.7,atCenter:false,away:true,furthest:0};
let camera={x:0,y:0,z:1},stage,svg,layer,tab,page,panel,status,drag,ready=false,chosen=null;
function tree(){
 try{const s=JSON.parse(localStorage.getItem(SOURCE)||'null');if(s?.tree?.children)return s.tree}catch{}
 try{if(typeof state!=='undefined'&&state?.tree?.children)return state.tree}catch{}
 return null;
}
function convert(root){
 const result={nodes:[{id:'centre',label:'Jéhovah',x:0,y:0,color:'#ffd48a',center:true,body:'Jéhovah au centre. Les liens symbolisent Jésus-Christ.'}],edges:[]};
 const used=new Set(['centre']),ox=num(root.x),oy=num(root.y);
 let k=0;
 function walk(n,parent,color,depth){
   if(result.nodes.length>400||depth>45)return;
   let id=String(n.id||'n'+(++k));if(used.has(id))id+='_'+(++k);used.add(id);
   result.nodes.push({id,label:String(n.title||'Idée'),x:num(n.x)-ox,y:num(n.y)-oy,color,center:false,body:String(n.body||''),link:String(n.link||'')});
   result.edges.push({id:parent+'-'+id,a:parent,b:id,color});
   (Array.isArray(n.children)?n.children:[]).forEach(c=>walk(c,id,color,depth+1));
 }
 (root.children||[]).forEach((c,i)=>walk(c,'centre',COLORS[i%COLORS.length],1));
 return result;
}
function loadXp(){try{const p=JSON.parse(localStorage.getItem(STORE)||'null');if(!p)return;
 xp.xp=Number.isSafeInteger(p.xp)&&p.xp>=0?p.xp:0;
 xp.returns=Number.isSafeInteger(p.returns)&&p.returns>=0?p.returns:0;
 xp.edge=typeof p.edge==='string'?p.edge:null;
 xp.t=Number.isFinite(p.t)?Math.min(1,Math.max(0,p.t)):.7;
 xp.atCenter=!!p.atCenter;xp.away=!!p.away;xp.furthest=num(p.furthest);
 }catch{}}
function save(){try{localStorage.setItem(STORE,JSON.stringify(xp))}catch{msg('Stockage bloqué : exporte une copie XP.')}}
function msg(s){if(status)status.textContent=s}
function w(){return Math.max(220,svg?.clientWidth||stage?.clientWidth||600)}
function h(){return Math.max(270,svg?.clientHeight||stage?.clientHeight||480)}
function refresh(){
 const r=tree();
 if(!r){graph={nodes:[],edges:[]};nodes=new Map();edges=new Map();draw();msg('Carte introuvable. Charge tes données dans l’onglet Carte.');return}
 graph=convert(r);nodes=new Map(graph.nodes.map(n=>[n.id,n]));edges=new Map(graph.edges.map(e=>[e.id,e]));
 if(!edges.has(xp.edge)){xp.edge=graph.edges[0]?.id||null;xp.t=.7;xp.atCenter=false;xp.away=true;xp.furthest=0}
 $('[data-count]',page).textContent=graph.nodes.length-1;$('[data-links]',page).textContent=graph.edges.length;
 if(!ready){home();ready=true}
 draw();save();msg('Vue synchronisée : connexions normales seulement.');
}
function coords(e){
 const a=nodes.get(e.a),b=nodes.get(e.b);if(!a||!b)return null;
 const dx=b.x-a.x,dy=b.y-a.y;
 return {a,b,c:{x:a.x+dx*.36-dy*.052,y:a.y+dy*.36+dx*.052},d:{x:a.x+dx*.64-dy*.052,y:a.y+dy*.64+dx*.052}};
}
function pos(e,t){
 const g=coords(e);if(!g)return{x:0,y:0};
 const v=1-t;
 return {x:v*v*v*g.a.x+3*v*v*t*g.c.x+3*v*t*t*g.d.x+t*t*t*g.b.x,y:v*v*v*g.a.y+3*v*v*t*g.c.y+3*v*t*t*g.d.y+t*t*t*g.b.y};
}
function path(e){const g=coords(e);return g?'M '+g.a.x+' '+g.a.y+' C '+g.c.x+' '+g.c.y+' '+g.d.x+' '+g.d.y+' '+g.b.x+' '+g.b.y:''}
function nearest(e,x,y){
 let best={d:Infinity,t:0};
 for(let i=0;i<=75;i++){const t=i/75,p=pos(e,t),d=(p.x-x)**2+(p.y-y)**2;if(d<best.d)best={d,t}}
 const left=Math.max(0,best.t-.014),right=Math.min(1,best.t+.014);
 for(let i=0;i<10;i++){const t=left+(right-left)*i/9,p=pos(e,t),d=(p.x-x)**2+(p.y-y)**2;if(d<best.d)best={d,t}}
 return best;
}
function draw(){
 if(!svg)return;svg.setAttribute('viewBox','0 0 '+w()+' '+h());
 if(!graph.nodes.length){layer.innerHTML='<text x="50%" y="50%" text-anchor="middle" fill="#bbcae8">Aucune carte disponible</text>';return}
 let html='<g transform="translate('+camera.x+' '+camera.y+') scale('+camera.z+')">';
 for(const e of graph.edges)html+='<path d="'+path(e)+'" stroke="'+e.color+'" stroke-width="2.8" stroke-linecap="round" opacity=".8" fill="none"/>';
 graph.nodes.forEach((n,i)=>{
  const r=n.center?41:26,lab=n.label.length>17?n.label.slice(0,16)+'…':n.label;
  html+='<g data-node="'+i+'" role="button" tabindex="0" style="cursor:pointer" aria-label="'+esc(n.label)+'"><circle cx="'+n.x+'" cy="'+n.y+'" r="'+(r+9)+'" fill="'+n.color+'" opacity=".1"/>'+
    '<circle cx="'+n.x+'" cy="'+n.y+'" r="'+r+'" fill="#111b31" stroke="'+n.color+'" stroke-width="'+(n.center?3:1.6)+'"/>'+
    '<text x="'+n.x+'" y="'+(n.y+4)+'" fill="#f5f7ff" font-size="'+(n.center?11:9)+'" font-weight="700" text-anchor="middle" pointer-events="none">'+esc(lab)+'</text></g>';
 });
 if(xp.edge&&edges.has(xp.edge)){
  const p=pos(edges.get(xp.edge),xp.t);
  html+='<g data-marble="1" aria-label="Bille Moi" style="cursor:grab"><circle cx="'+p.x+'" cy="'+p.y+'" r="22" fill="#af92ff" opacity=".16"/>'+
    '<circle cx="'+p.x+'" cy="'+p.y+'" r="12" fill="#f2e6ff" stroke="#9873e2" stroke-width="3"/>'+
    '<circle cx="'+(p.x-4)+'" cy="'+(p.y-4)+'" r="3" fill="#fff"/>'+
    '<text x="'+(p.x+17)+'" y="'+(p.y-11)+'" fill="#e9ddff" font-size="12" font-weight="800">Moi</text></g>';
 }
 layer.innerHTML=html+'</g>';
 $('[data-xp]',page).textContent=xp.xp+' XP';
 $('[data-level]',page).textContent='Niveau '+(1+Math.floor(xp.xp/100));
 $('[data-zoom]',page).textContent=Math.round(camera.z*100)+' %';
}
function home(){camera.z=w()<720?.67:.9;camera.x=w()/2;camera.y=h()/2;draw()}
function fit(){
 if(!graph.nodes.length)return;
 const xs=graph.nodes.map(n=>n.x),ys=graph.nodes.map(n=>n.y);
 const minx=Math.min(...xs)-100,maxx=Math.max(...xs)+100,miny=Math.min(...ys)-100,maxy=Math.max(...ys)+100;
 camera.z=Math.min(1.15,Math.max(.13,Math.min((w()-25)/(maxx-minx),(h()-25)/(maxy-miny))));
 camera.x=w()/2-(minx+maxx)/2*camera.z;camera.y=h()/2-(miny+maxy)/2*camera.z;draw();
}
function zoom(v){const cx=w()/2,cy=h()/2,z=camera.z;camera.z=Math.max(.17,Math.min(2.6,z*v));camera.x=cx-(cx-camera.x)*camera.z/z;camera.y=cy-(cy-camera.y)*camera.z/z;draw()}
function world(e){const r=svg.getBoundingClientRect();return{x:(e.clientX-r.left-camera.x)/camera.z,y:(e.clientY-r.top-camera.y)/camera.z}}
function score(){
 const e=edges.get(xp.edge);if(!e)return;const p=pos(e,xp.t),d=Math.hypot(p.x,p.y);
 xp.furthest=Math.max(xp.furthest||0,d);
 if(d>125){xp.away=true;xp.atCenter=false}
 if(d<42&&!xp.atCenter){
  if(xp.away&&xp.furthest>125){xp.xp+=10;xp.returns+=1;msg('Retour à Jéhovah par Jésus-Christ : +10 XP !')}
  xp.away=false;xp.atCenter=true;xp.furthest=0;
 }
}
function move(p){
 const e=edges.get(xp.edge);if(!e)return;
 const direct=nearest(e,p.x,p.y);
 let best={e,t:direct.t,d:direct.d};
 if(xp.t<.14||xp.t>.86){
  const node=xp.t<.14?e.a:e.b;
  graph.edges.filter(x=>x.a===node||x.b===node).forEach(x=>{
   const c=nearest(x,p.x,p.y);
   if(c.d<best.d*.8 || (x!==e&&c.d<380&&direct.d>740))best={e:x,t:c.t,d:c.d};
  });
 }
 xp.edge=best.e.id;xp.t=best.t<.04?0:best.t>.96?1:best.t;
 score();save();draw();
}
function inspect(n){
 if(!n)return;
 chosen=n.id;panel.replaceChildren();
 const title=document.createElement('h3');title.textContent=n.label;panel.append(title);
 const note=document.createElement('p');note.textContent=n.body||'Aucune note associée.';panel.append(note);
 if(n.link){try{const url=new URL(n.link);if(['http:','https:'].includes(url.protocol)){const a=document.createElement('a');a.href=url.href;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Ouvrir le lien associé';panel.append(a)}}catch{}}
 const btn=document.createElement('button');btn.type='button';btn.textContent='Modifier dans Carte';btn.onclick=()=>$('.tab[data-page="map"]')?.click();panel.append(btn);
 const close=document.createElement('button');close.type='button';close.textContent='Fermer';close.onclick=()=>{panel.hidden=true;chosen=null;draw()};panel.append(close);
 panel.hidden=false;draw();
}
function exportXp(){
 const b=new Blob([JSON.stringify({version:1,type:'synapse-progression',progress:xp,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'});
 const url=URL.createObjectURL(b),a=document.createElement('a');a.href=url;a.download='synapse-progression.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function install(){
 const nav=$('nav.tabs'),app=$('.app');if(!nav||!app||$('#page-'+PAGE))return;
 const css=document.createElement('style');css.id='synapse-v5-styles';
 css.textContent=[
 '#page-synapse{min-width:0;padding:10px;background:#0b1223;border:1px solid #293452;border-radius:19px;color:#edf3ff}',
 '#page-synapse .syn-h{display:flex;justify-content:space-between;align-items:center;gap:15px;flex-wrap:wrap;padding:9px 8px 13px}',
 '#page-synapse h2{color:#f4f4ff;margin:0;font-size:clamp(18px,2.3vw,24px)}',
 '#page-synapse p{line-height:1.5}',
 '#page-synapse .syn-h p{color:#aab9d6;margin:4px 0 0;font-size:12px}',
 '#page-synapse .syn-score{background:#182542;padding:11px 15px;border:1px solid #38486b;border-radius:15px;font-weight:800}',
 '#page-synapse .syn-score small{display:block;font-weight:400;color:#b6c5db}',
 '#page-synapse .syn-tools{display:flex;flex-wrap:wrap;gap:7px;padding:0 8px 9px;align-items:center}',
 '#page-synapse button{background:#1a2a48;border:1px solid #425579;border-radius:10px;padding:9px 12px;color:#eef4ff;cursor:pointer;font-weight:650}',
 '#page-synapse button:hover,#page-synapse button:focus-visible{background:#344a70}',
 '#page-synapse input{min-width:120px;max-width:270px;flex:1;background:#101b35;color:#fff;padding:10px;border:1px solid #425579;border-radius:10px}',
 '#page-synapse .syn-stage{height:min(70dvh,760px);min-height:455px;border-radius:16px;border:1px solid #253657;position:relative;overflow:hidden;background:radial-gradient(ellipse at 50% 49%,#202447,#091225 75%)}',
 '#page-synapse .syn-stage:before{content:"";position:absolute;inset:0;pointer-events:none;opacity:.22;background-image:radial-gradient(#a1b1e9 1px,transparent 1px);background-size:27px 27px}',
 '#page-synapse svg{width:100%;height:100%;display:block;touch-action:none;position:relative;cursor:grab}',
 '#page-synapse .syn-panel{position:absolute;bottom:12px;right:12px;max-height:58%;overflow:auto;background:#14213af2;border:1px solid #58658e;border-radius:14px;padding:15px;width:min(320px,calc(100% - 24px));box-shadow:0 14px 35px #0008}',
 '#page-synapse .syn-panel[hidden]{display:none}',
 '#page-synapse .syn-panel h3{margin:0 0 8px;color:#fff;font-size:16px}',
 '#page-synapse .syn-panel p{margin:0 0 8px;color:#dfe7fa;font-size:12px;white-space:pre-wrap}',
 '#page-synapse .syn-panel a{display:block;color:#bde3ff;overflow-wrap:anywhere;margin:8px 0}',
 '#page-synapse .syn-panel button{margin:7px 6px 0 0}',
 '#page-synapse .syn-foot{color:#b7c9df;font-size:12px;padding:9px 10px}',
 '#page-synapse .syn-status{color:#8fe5bb}',
 '@media(max-width:760px){#page-synapse{padding:5px}#page-synapse .syn-stage{min-height:420px;height:62dvh}#page-synapse button{padding:9px}#page-synapse .syn-tools{gap:5px}#page-synapse input{max-width:none}}'
 ].join('');document.head.append(css);
 tab=document.createElement('button');tab.type='button';tab.className='tab';tab.dataset.page=PAGE;tab.textContent='🧠 Synapse';
 const anchor=$('.tab[data-page="map"]',nav);anchor?anchor.insertAdjacentElement('afterend',tab):nav.append(tab);
 page=document.createElement('section');page.className='page';page.id='page-'+PAGE;
 page.innerHTML='<div class="syn-h"><div><h2>✦ SYNAPSE — Carte neuronale</h2><p>Jéhovah au centre · les connexions symbolisent Jésus-Christ · Moi voyage sur les liens normaux.</p></div><div class="syn-score"><span data-xp>0 XP</span><small data-level>Niveau 1</small></div></div>'+
 '<div class="syn-tools"><button data-do="home">◎ Centre</button><button data-do="fit">▣ Tout voir</button><button data-do="plus">＋</button><span data-zoom>100 %</span><button data-do="minus">－</button><button data-do="refresh">↻ Actualiser</button><input data-search type="search" placeholder="Rechercher une idée…" aria-label="Rechercher une idée"><button data-do="export">Exporter XP</button></div>'+
 '<div class="syn-stage"><svg role="img" aria-label="Carte neuronale et bille Moi à déplacer"><g class="syn-layer"></g></svg><aside class="syn-panel" hidden></aside></div>'+
 '<p class="syn-foot">Déplace la bille <strong>Moi</strong> le long des liens et reviens à Jéhovah pour +10 XP. Touche une bulle pour lire sa note. <span data-count>0</span> idées · <span data-links>0</span> connexions normales · interconnexions masquées. <span class="syn-status" role="status" aria-live="polite"></span></p>';
 app.append(page);stage=$('.syn-stage',page);svg=$('svg',stage);layer=$('.syn-layer',stage);panel=$('.syn-panel',stage);status=$('.syn-status',page);
 loadXp();
 page.addEventListener('click',e=>{const b=e.target.closest('button[data-do]');if(!b)return;
  const d=b.dataset.do;if(d==='home')home();if(d==='fit')fit();if(d==='plus')zoom(1.2);if(d==='minus')zoom(1/1.2);if(d==='refresh')refresh();if(d==='export')exportXp()});
 $('[data-search]',page).addEventListener('change',e=>{const s=e.target.value.trim().toLocaleLowerCase(),n=graph.nodes.find(x=>x.label.toLocaleLowerCase().includes(s));if(!s)return;if(!n){msg('Aucun résultat');return}
  camera.z=Math.max(camera.z,.83);camera.x=w()/2-n.x*camera.z;camera.y=h()/2-n.y*camera.z;inspect(n)});
 svg.addEventListener('pointerdown',e=>{if(e.button!==0&&e.pointerType==='mouse')return;
  const ball=e.target.closest('[data-marble]'),nd=e.target.closest('[data-node]');
  if(ball)drag={kind:'ball',id:e.pointerId};
  else if(nd){inspect(graph.nodes[+nd.dataset.node]);return}
  else drag={kind:'pan',id:e.pointerId,x:e.clientX,y:e.clientY,cx:camera.x,cy:camera.y};
  e.preventDefault();try{svg.setPointerCapture(e.pointerId)}catch{}});
 svg.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;
  if(drag.kind==='pan'){camera.x=drag.cx+e.clientX-drag.x;camera.y=drag.cy+e.clientY-drag.y;draw()}
  else move(world(e));});
 const release=e=>{if(drag&&drag.id===e.pointerId){drag=null;save()}};
 svg.addEventListener('pointerup',release);svg.addEventListener('pointercancel',release);
 svg.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY<0?1.1:1/1.1)},{passive:false});
 if('ResizeObserver' in window)new ResizeObserver(()=>{if(page.classList.contains('active'))draw()}).observe(stage);
 tab.addEventListener('click',()=>{$$('.tab').forEach(x=>x.classList.toggle('active',x===tab));$$('.page').forEach(x=>x.classList.toggle('active',x===page));requestAnimationFrame(()=>{refresh();window.scrollTo(0,0)})});
 const openHash=()=>{if(location.hash==='#synapse')tab.click()};window.addEventListener('hashchange',openHash);openHash();
 window.addEventListener('storage',e=>{if(e.key===SOURCE&&page.classList.contains('active'))refresh()});
 msg('Ouvre Synapse pour explorer ta carte.');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();