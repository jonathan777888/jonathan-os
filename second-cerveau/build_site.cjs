// Use the same complete app and modules for local checks and GitHub Pages.
const fs=require('node:fs'),path=require('node:path');
const root=__dirname,out=process.argv[2]?path.resolve(process.argv[2]):path.join(root,'dist');
fs.mkdirSync(out,{recursive:true});
const dir=path.join(root,'source');
const parts=fs.readdirSync(dir).filter(x=>/^part-.*\.txt$/.test(x)).sort();
let html=parts.map(p=>fs.readFileSync(path.join(dir,p),'utf8')).join('');
if(!html.includes('</body></html>')||!html.includes('cloudSyncV52'))throw Error('Incomplete app');
html=html.replace('<script src="challenge-40-days.js" defer></script>','');
let modules='';
for(const file of ['challenge-40-days.js','spiritual-ladder.js','google-drive-sync-v53.js']){
  const code=fs.readFileSync(path.join(root,file),'utf8');
  if(code.includes('</script'))throw Error('Unsafe inline module: '+file);
  modules+='<script>\n'+code+'\n</script>\n';
}
const closing=html.lastIndexOf('</body></html>');
html=html.slice(0,closing)+modules+html.slice(closing);
for(const file of ['index.html','app.html','local.html'])fs.writeFileSync(path.join(out,file),html);
fs.copyFileSync(path.join(root,'transfer.html'),path.join(out,'transfer.html'));
// Preserve the existing software engineering workspace from V52.
for(const file of ['atelier-genie-logiciel.html','software-engineering-entry.js']){
  if(!fs.existsSync(path.join(root,file))) throw Error('Required software engineering module missing: '+file);
  fs.copyFileSync(path.join(root,file),path.join(out,file));
}
{
  for(const file of ['index.html','app.html','local.html']){
    const target=path.join(out,file);
    const page=fs.readFileSync(target,'utf8');
    const closingTag=page.lastIndexOf('</body></html>');
    if(closingTag<0)throw Error('Missing final HTML closing tag: '+file);
    fs.writeFileSync(target,page.slice(0,closingTag)+'<script src="./software-engineering-entry.js" defer></script>'+page.slice(closingTag));
  }
}

const guidedPath=path.join(root,'engineering-guided-v54.js');
if(!fs.existsSync(guidedPath))throw Error('Required guided engineering module missing');
fs.copyFileSync(guidedPath,path.join(out,'engineering-guided-v54.js'));
const atelierPath=path.join(out,'atelier-genie-logiciel.html');
let atelierHtml=fs.readFileSync(atelierPath,'utf8');
const atelierClose=atelierHtml.lastIndexOf('</body>');
if(atelierClose<0)throw Error('Engineering atelier lacks closing body');
atelierHtml=atelierHtml.slice(0,atelierClose)+'<script src="./engineering-guided-v54.js" defer></script>'+atelierHtml.slice(atelierClose);
fs.writeFileSync(atelierPath,atelierHtml);
console.log('Built Second Cerveau V53:',parts.length,'parts,',html.length,'bytes');
