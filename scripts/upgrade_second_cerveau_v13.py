from pathlib import Path
import re

root = Path('second-cerveau/source')

def load(name):
    return (root / name).read_text(encoding='utf-8')

def save(name, text):
    (root / name).write_text(text, encoding='utf-8')

def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected 1 match, found {count}')
    return text.replace(old, new, 1)

p = load('part-00.txt')
p = replace_once(p, '<title>Second Cerveau IA — V12</title>', '<title>Second Cerveau IA — V13</title>', 'title')
p = replace_once(p, ".canvas-wrap{overflow:auto;border:1px solid #edf0e9;border-radius:18px;background:linear-gradient(180deg,#fdfdfb,#f9f7f1)}.canvas{position:relative;width:1300px;height:920px;min-width:100%}", ".canvas-wrap{overflow:auto;height:72vh;min-height:620px;border:1px solid #edf0e9;border-radius:18px;background:linear-gradient(180deg,#fdfdfb,#f9f7f1);overscroll-behavior:contain;scroll-behavior:smooth}.canvas{position:relative;width:6000px;height:4000px;min-width:6000px;min-height:4000px;background-image:linear-gradient(rgba(92,137,84,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(92,137,84,.055) 1px,transparent 1px);background-size:40px 40px}", 'canvas css')
p = replace_once(p, ".three{grid-template-columns:1fr}.canvas{height:980px}", ".three{grid-template-columns:1fr}", 'mobile override')
save('part-00.txt', p)

p = load('part-01.txt')
p = replace_once(p, 'Second Cerveau IA — V12</span>', 'Second Cerveau IA — V13</span>', 'pill')
p = replace_once(p, 'V12 hérite directement de V11 : toutes les corrections précédentes sont conservées, avec récupération des anciens liens Internet.', 'V13 hérite directement de V12 : toutes les fonctions précédentes sont conservées, avec une carte extensible qui grandit automatiquement.', 'status')
p = replace_once(p, 'Déplace les blocs. Ajoute des racines, des sous-racines et des relations entre blocs.', 'Déplace les blocs librement. La carte s’agrandit automatiquement quand tu approches des bords : tu peux continuer à écrire et créer des branches sans limite pratique.', 'help')
p = replace_once(p, '<button class="btn" id="fitMap">Tout afficher</button>', '<button class="btn" id="fitMap">Recentrer sur Jésus</button>', 'button')
p = replace_once(p, '<svg id="lines" class="lines" viewBox="0 0 1300 920" preserveAspectRatio="none"></svg>', '<svg id="lines" class="lines" preserveAspectRatio="none"></svg>', 'svg')
save('part-01.txt', p)

p = load('part-02.txt')
p = replace_once(p, 'V12 recherche les liens enregistrés dans les anciennes versions et sauvegardes encore accessibles dans ce navigateur.', 'V13 conserve la récupération des liens enregistrés dans les anciennes versions et sauvegardes encore accessibles dans ce navigateur.', 'legacy text')
p = replace_once(p, "const APP_VERSION='12.0.0', SCHEMA_VERSION=12", "const APP_VERSION='13.0.0', SCHEMA_VERSION=13", 'version')
p = replace_once(p, "const backupKey='second-brain-pre-upgrade-v12'", "const backupKey='second-brain-pre-upgrade-v13'", 'backup key')
save('part-02.txt', p)

p = load('part-03.txt')
marker = "let state=migrate(),selected='jesus';"
helpers = """const MAP_MIN_W=6000, MAP_MIN_H=4000, MAP_GROW=2400, MAP_MARGIN=600;\nfunction walkWorldNodes(root,fn){if(!root)return;fn(root);(root.children||[]).forEach(c=>walkWorldNodes(c,fn))}\nfunction prepareInfiniteCanvas(s){s.meta=s.meta||{};if(!s.meta.infiniteCanvasV13){walkWorldNodes(s.tree,n=>{n.x=(Number.isFinite(n.x)?n.x:650)+2400;n.y=(Number.isFinite(n.y)?n.y:430)+1500});s.meta.canvasWidth=MAP_MIN_W;s.meta.canvasHeight=MAP_MIN_H;s.meta.infiniteCanvasV13=true;s.meta.infiniteCanvasMigratedAt=new Date().toISOString()}else{s.meta.canvasWidth=Math.max(MAP_MIN_W,Number(s.meta.canvasWidth)||0);s.meta.canvasHeight=Math.max(MAP_MIN_H,Number(s.meta.canvasHeight)||0)}}\nfunction updateCanvasSize(){const c=$('canvas'),svg=$('lines');if(!c||!svg)return;const w=Math.max(MAP_MIN_W,Number(state.meta?.canvasWidth)||MAP_MIN_W),h=Math.max(MAP_MIN_H,Number(state.meta?.canvasHeight)||MAP_MIN_H);state.meta.canvasWidth=w;state.meta.canvasHeight=h;c.style.width=w+'px';c.style.height=h+'px';c.style.minWidth=w+'px';c.style.minHeight=h+'px';svg.setAttribute('viewBox',`0 0 ${w} ${h}`)}\nfunction growCanvasForAll(){const nodes=[];walkWorldNodes(state.tree,n=>nodes.push(n));if(!nodes.length)return;state.meta.canvasWidth=Math.max(MAP_MIN_W,Number(state.meta.canvasWidth)||MAP_MIN_W);state.meta.canvasHeight=Math.max(MAP_MIN_H,Number(state.meta.canvasHeight)||MAP_MIN_H);let minX=Math.min(...nodes.map(n=>Number(n.x)||0)),minY=Math.min(...nodes.map(n=>Number(n.y)||0)),maxX=Math.max(...nodes.map(n=>Number(n.x)||0)),maxY=Math.max(...nodes.map(n=>Number(n.y)||0)),shiftX=0,shiftY=0;while(minX+shiftX<MAP_MARGIN){shiftX+=MAP_GROW;state.meta.canvasWidth+=MAP_GROW}while(minY+shiftY<MAP_MARGIN){shiftY+=MAP_GROW;state.meta.canvasHeight+=MAP_GROW}if(shiftX||shiftY){nodes.forEach(n=>{n.x=(Number(n.x)||0)+shiftX;n.y=(Number(n.y)||0)+shiftY});maxX+=shiftX;maxY+=shiftY}while(maxX>state.meta.canvasWidth-MAP_MARGIN)state.meta.canvasWidth+=MAP_GROW;while(maxY>state.meta.canvasHeight-MAP_MARGIN)state.meta.canvasHeight+=MAP_GROW;updateCanvasSize();if(shiftX||shiftY){const wrap=$('canvasWrap');requestAnimationFrame(()=>{wrap.scrollLeft+=shiftX;wrap.scrollTop+=shiftY})}}\nfunction centerOnNode(id='jesus',behavior='smooth'){const n=findNode(id),wrap=$('canvasWrap');if(!n||!wrap)return;wrap.scrollTo({left:Math.max(0,(Number(n.x)||0)-wrap.clientWidth/2),top:Math.max(0,(Number(n.y)||0)-wrap.clientHeight/2),behavior})}\n"""
if marker not in p:
    raise SystemExit('state marker not found')
p = p.replace(marker, helpers + marker + 'prepareInfiniteCanvas(state);', 1)
p = replace_once(p, "function renderMap(){const canvas=$('canvas'),svg=$('lines');", "function renderMap(){updateCanvasSize();const canvas=$('canvas'),svg=$('lines');", 'renderMap')

pattern = re.compile(r"function enableDrag\(el,node\)\{.*?\}\nfunction renderLinesOnly", re.S)
replacement = """function enableDrag(el,node){let active=false,moved=false,startX=0,startY=0,startNodeX=0,startNodeY=0;el.addEventListener('pointerdown',e=>{if(e.target.closest('.node-delete'))return;if(e.button!==undefined&&e.button!==0)return;active=true;moved=false;startX=e.clientX;startY=e.clientY;startNodeX=Number.isFinite(node.x)?node.x:650;startNodeY=Number.isFinite(node.y)?node.y:430;el.setPointerCapture?.(e.pointerId)});el.addEventListener('pointermove',e=>{if(!active)return;const dx=e.clientX-startX,dy=e.clientY-startY;if(!moved&&Math.hypot(dx,dy)<6)return;moved=true;el.classList.add('dragging');const maxX=Math.max(180,(Number(state.meta?.canvasWidth)||MAP_MIN_W)-90),maxY=Math.max(140,(Number(state.meta?.canvasHeight)||MAP_MIN_H)-70);node.x=Math.max(90,Math.min(maxX,startNodeX+dx));node.y=Math.max(70,Math.min(maxY,startNodeY+dy));el.style.left=node.x+'px';el.style.top=node.y+'px';renderLinesOnly()});el.addEventListener('pointerup',e=>{if(!active)return;active=false;el.releasePointerCapture?.(e.pointerId);el.classList.remove('dragging');if(moved){growCanvasForAll();save();renderMap()}else{selected=node.id;renderMap()}});el.addEventListener('pointercancel',()=>{active=false;moved=false;el.classList.remove('dragging')})}\nfunction renderLinesOnly"""
p, n = pattern.subn(replacement, p, count=1)
if n != 1:
    raise SystemExit(f'drag replace failed: {n}')

pattern = re.compile(r"\$\('addRoot'\)\.onclick=.*?\$\('fitMap'\)\.onclick=.*?;\nfunction localDate", re.S)
replacement = """$('addRoot').onclick=()=>{const wrap=$('canvasWrap'),cx=wrap.scrollLeft+wrap.clientWidth/2,cy=wrap.scrollTop+wrap.clientHeight/2;const n={id:uid(),title:'Nouvelle racine',body:'',link:'',tags:[],x:Math.max(120,cx+Math.round(Math.random()*360-180)),y:Math.max(100,cy+Math.round(Math.random()*300-150)),children:[]};state.tree.children.push(n);selected=n.id;growCanvasForAll();save(true);renderMap()};$('addChild').onclick=()=>{const p=findNode(selected);if(!p)return;const n={id:uid(),title:'Nouvelle sous-racine',body:'',link:'',tags:[],x:(Number(p.x)||650)+190,y:(Number(p.y)||430)+140,children:[]};p.children=p.children||[];p.children.push(n);selected=n.id;growCanvasForAll();save(true);renderMap()};$('saveNode').onclick=()=>{const n=findNode(selected);if(!n)return;n.title=$('nodeTitle').value.trim()||'Sans titre';n.body=$('nodeBody').value.trim();n.link=$('nodeLink').value.trim();n.tags=$('nodeTags').value.split(',').map(x=>x.trim()).filter(Boolean);save();$('mapStatus').textContent='Bloc enregistré.';renderMap()};$('deleteNode').onclick=()=>deleteBlock(selected);$('addRelation').onclick=()=>{const to=$('relationTarget').value;if(!to||to===selected)return;state.relations.push({id:uid(),from:selected,to,label:$('relationLabel').value.trim()});$('relationLabel').value='';save();renderMap()};$('saveNow').onclick=()=>{save(true);$('mapStatus').textContent='Sauvegarde créée.'};$('fitMap').onclick=()=>centerOnNode('jesus');\nfunction localDate"""
p, n = pattern.subn(replacement, p, count=1)
if n != 1:
    raise SystemExit(f'controls replace failed: {n}')
save('part-03.txt', p)

p = load('part-04.txt')
p = replace_once(p, "a.download='second-cerveau-v12-'", "a.download='second-cerveau-v13-'", 'export')
p = replace_once(p, "state=normalize(obj,false);state.meta=state.meta||{};", "state=normalize(obj,false);prepareInfiniteCanvas(state);state.meta=state.meta||{};", 'import')
p = replace_once(p, "'second-brain-pre-upgrade-v11','second-brain-pre-upgrade-v12'", "'second-brain-pre-upgrade-v11','second-brain-pre-upgrade-v12','second-brain-pre-upgrade-v13'", 'keys')
save('part-04.txt', p)

p = load('part-05.txt')
p = replace_once(p, "const RELEASES=[\n{v:'V12'", "const RELEASES=[\n{v:'V13',note:'V13 part directement de V12 : carte extensible, grand espace de travail, recentrage sur Jésus et agrandissement automatique lorsque les blocs approchent des bords.'},\n{v:'V12'", 'release')
p = replace_once(p, "Version actuelle V12 · données schema ${SCHEMA_VERSION} · cette version hérite directement de V11.", "Version actuelle V13 · données schema ${SCHEMA_VERSION} · cette version hérite directement de V12.", 'version line')
p = replace_once(p, "renderHistory();renderLegacyLinks();renderVersions();renderMap();if(recoveredLinksOnStart", "renderHistory();renderLegacyLinks();renderVersions();renderMap();requestAnimationFrame(()=>centerOnNode('jesus','auto'));if(recoveredLinksOnStart", 'center')
save('part-05.txt', p)

assembled = ''.join((root / f'part-0{i}.txt').read_text(encoding='utf-8') for i in range(7))
checks = {
    'title': 'Second Cerveau IA — V13' in assembled,
    'version': "APP_VERSION='13.0.0'" in assembled,
    'schema': 'SCHEMA_VERSION=13' in assembled,
    'helper': 'growCanvasForAll' in assembled,
    'viewbox': "svg.setAttribute('viewBox'" in assembled,
    'old_fixed_canvas_removed': 'width:1300px;height:920px' not in assembled,
}
failed = [k for k, v in checks.items() if not v]
if failed:
    raise SystemExit('validation failed: ' + ', '.join(failed))
print('V13 upgrade validated')
