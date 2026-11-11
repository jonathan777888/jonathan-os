// Build the existing full V52 app from its source fragments without replacing it.
const fs=require('node:fs'),path=require('node:path');
const root=__dirname,out=path.join(root,'dist');fs.mkdirSync(out,{recursive:true});
const dir=path.join(root,'source');
const parts=fs.readdirSync(dir).filter(x=>/^part-.*\.txt$/.test(x)).sort();
let html=parts.map(p=>fs.readFileSync(path.join(dir,p),'utf8')).join('');
if(!html.includes('</body></html>')||!html.includes('cloudSyncV52'))throw Error('Incomplete V52 app');
html=html.replace("const REDIRECT_URL='https://jonathan777888.github.io/jonathan-os/';","const REDIRECT_URL=location.origin+'/app.html';");
html=html.replace('</body></html>', '<script src="/spiritual-ladder.js" defer><\\/script></body></html>'.replace('<\\/script>','</script>'));
const gate=`<script>(function(){document.documentElement.style.visibility='hidden';const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';script.onload=async()=>{try{const client=window.supabase.createClient('https://wuhbalxjpcfemsxdnggp.supabase.co','sb_publishable_mPFAK_h6L8JjUQRuVx5RVg_odLPQNRn');const {data,error}=await client.auth.getSession();if(error||!data.session?.user){location.replace('/');return}document.documentElement.style.visibility='visible';client.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT'||!session)location.replace('/')})}catch(e){location.replace('/')}};script.onerror=()=>location.replace('/');document.head.appendChild(script)})();</script>`;
html=html.replace('</head>',gate+'</head>');
fs.writeFileSync(path.join(out,'index.html'),fs.readFileSync(path.join(root,'landing.html'),'utf8'));
fs.writeFileSync(path.join(out,'app.html'),html);
for(const file of ['challenge-40-days.js','spiritual-ladder.js'])fs.copyFileSync(path.join(root,file),path.join(out,file));
console.log('Built Second Cerveau V52:',parts.length,'parts,',html.length,'bytes');
