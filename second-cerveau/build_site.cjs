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
console.log('Built Second Cerveau V53:',parts.length,'parts,',html.length,'bytes');
