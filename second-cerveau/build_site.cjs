// Build the existing full V52 app from its source fragments without replacing it.
const fs=require('node:fs'),path=require('node:path');
const root=__dirname,out=path.join(root,'dist');fs.mkdirSync(out,{recursive:true});
const dir=path.join(root,'source');
const parts=fs.readdirSync(dir).filter(x=>/^part-.*\.txt$/.test(x)).sort();
let html=parts.map(p=>fs.readFileSync(path.join(dir,p),'utf8')).join('');
if(!html.includes('</body></html>')||!html.includes('cloudSyncV52'))throw Error('Incomplete V52 app');
html=html.replace("const REDIRECT_URL='https://jonathan777888.github.io/jonathan-os/';","const REDIRECT_URL=location.origin+'/';");
html=html.replace('</body></html>', '<script src="/spiritual-ladder.js" defer><\\/script></body></html>'.replace('<\\/script>','</script>'));
// Keep the original V52 app as the home page, without any extra login gate.
fs.writeFileSync(path.join(out,'index.html'),html);
fs.writeFileSync(path.join(out,'app.html'),html);
fs.writeFileSync(path.join(out,'local.html'),html);
fs.copyFileSync(path.join(root,'transfer.html'),path.join(out,'transfer.html'));
for(const file of ['challenge-40-days.js','spiritual-ladder.js'])fs.copyFileSync(path.join(root,file),path.join(out,file));
console.log('Built original Second Cerveau V52:',parts.length,'parts,',html.length,'bytes');
