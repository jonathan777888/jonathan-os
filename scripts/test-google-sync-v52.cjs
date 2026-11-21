/* Test navigateur pour la V52. Les appels Google sont simulés : aucun compte personnel n'est utilisé. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const GOOGLE_ID='123456789012-abcdefghijklmnop.apps.googleusercontent.com';
const authHeaders={
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Headers':'authorization,content-type',
  'Access-Control-Allow-Methods':'GET,POST,PATCH,OPTIONS'
};
const cloud={file:null,data:null,version:0,uploads:0};
function reply(route,body,status=200){
  return route.fulfill({status,contentType:'application/json',headers:authHeaders,body:JSON.stringify(body)});
}
async function connectMock(page){
  await page.addInitScript(()=>{
    window.google={accounts:{oauth2:{
      initTokenClient({callback}){
        return {requestAccessToken(){
          setTimeout(()=>callback({
            access_token:'mock-oauth-token',
            scope:'https://www.googleapis.com/auth/drive.appdata',
            expires_in:3600
          }),20);
        }};
      }
    }}};
  });
  await page.route('https://www.googleapis.com/**',async route=>{
    const r=route.request();
    const u=new URL(r.url());
    if(r.method()==='OPTIONS')return route.fulfill({status:204,headers:authHeaders,body:''});
    if(u.pathname==='/drive/v3/about')return reply(route,{user:{emailAddress:'test-user@example.com',displayName:'Compte de test'}});
    if(u.pathname==='/drive/v3/files'&&r.method()==='GET')return reply(route,{files:cloud.file?[cloud.file]:[]});
    if(u.pathname.includes('/drive/v3/files/file-test')&&u.searchParams.get('alt')==='media'){
      if(!cloud.data)return reply(route,{error:{message:'File not found'}},404);
      return reply(route,cloud.data);
    }
    if(u.pathname==='/upload/drive/v3/files'&&r.method()==='POST'){
      const body=r.postData()||'';
      const start=body.indexOf('{"format":"jonathan-second-cerveau"');
      const end=body.indexOf('\r\n--',start);
      assert.ok(start>=0&&end>start,'Multipart appData file content missing');
      cloud.data=JSON.parse(body.slice(start,end));
      cloud.version+=1;
      cloud.uploads+=1;
      cloud.file={id:'file-test',name:'jonathan-second-cerveau-v52.json',modifiedTime:new Date(Date.now()+cloud.version*1000).toISOString(),version:String(cloud.version)};
      return reply(route,cloud.file);
    }
    if(u.pathname==='/upload/drive/v3/files/file-test'&&r.method()==='PATCH'){
      cloud.data=JSON.parse(r.postData()||'{}');
      cloud.version+=1;cloud.uploads+=1;
      cloud.file={...cloud.file,modifiedTime:new Date(Date.now()+cloud.version*1000).toISOString(),version:String(cloud.version)};
      return reply(route,cloud.file);
    }
    console.error('Unexpected Google API request',r.method(),r.url());
    return reply(route,{error:{message:'Unexpected Google endpoint'}},404);
  });
}
async function openApp(browser,width){
  const context=await browser.newContext({viewport:{width,height:820},isMobile:width<760,hasTouch:width<760,acceptDownloads:true});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await connectMock(page);
  await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
  await page.locator('#googleSyncV52').waitFor({state:'attached',timeout:15000});
  const tabs=page.locator('button.tab[data-page="backup"]');
  await tabs.click();
  await page.locator('#g52ClientId').fill(GOOGLE_ID);
  await page.locator('#g52SaveConfig').click();
  await page.locator('#g52Connect').click();
  await page.waitForFunction(()=>document.querySelector('#g52Account')?.textContent.includes('test-user@example.com'),null,{timeout:15000});
  if(errors.length)console.warn('UI console errors: '+errors.slice(0,3).join(' | '));
  return {context,page,errors};
}
async function run(){
  const browser=await chromium.launch({headless:true});
  try{
    const A=await openApp(browser,1280);
    assert.equal(await A.page.locator('#g52Load').isEnabled(),false,'No restore on empty Drive');
    await A.page.evaluate(()=>{
      localStorage.setItem('second-brain-demo-v52',JSON.stringify({topic:'Cours agricoles',notes:'Toutes mes notes synchronisées'}));
      localStorage.setItem('second-brain-verify-token-v43','secret-which-must-not-be-uploaded');
    });
    await A.page.locator('#g52Upload').click();
    await A.page.waitForFunction(()=>document.querySelector('#g52Status')?.textContent.includes('Sauvegardé'),null,{timeout:15000});
    assert.equal(cloud.uploads,1,'Initial cloud upload did not occur');
    assert.equal(JSON.parse(cloud.data.entries['second-brain-demo-v52']).topic,'Cours agricoles');
    assert.equal(cloud.data.entries['second-brain-verify-token-v43'],undefined,'Sensitive access token was copied into cloud');
    assert.equal(cloud.data.entries['second-brain-google-v52-client-id'],undefined,'OAuth settings should not be cloud-synced');
    console.log('PASS: Desktop->Google backup; secrets excluded');

    const B=await openApp(browser,390);
    assert.ok(await B.page.locator('#g52Load').isEnabled(),'Restore button not enabled on second device');
    B.page.on('dialog',d=>d.accept());
    await B.page.locator('#g52Load').click();
    await B.page.waitForFunction(()=>localStorage.getItem('second-brain-demo-v52')!==null,null,{timeout:15000});
    const restored=await B.page.evaluate(()=>JSON.parse(localStorage.getItem('second-brain-demo-v52')));
    assert.equal(restored.notes,'Toutes mes notes synchronisées');
    assert.equal(await B.page.evaluate(()=>localStorage.getItem('second-brain-verify-token-v43')),null,'Sensitive token unexpectedly restored');
    console.log('PASS: Google->mobile restore, data integrity preserved');

    // Restoration reloads the app and intentionally clears the ephemeral OAuth access token.
    await B.page.reload({waitUntil:'domcontentloaded'});
    await B.page.locator('#googleSyncV52').waitFor();
    await B.page.locator('button.tab[data-page="backup"]').click();
    await B.page.locator('#g52Connect').click();
    await B.page.waitForFunction(()=>document.querySelector('#g52Account')?.textContent.includes('test-user@example.com'));
    await B.page.evaluate(()=>localStorage.setItem('second-brain-demo-v52',JSON.stringify({topic:'Cours agricoles',notes:'Mise à jour sur téléphone'})));
    await B.page.locator('#g52Upload').click();
    await B.page.waitForFunction(()=>document.querySelector('#g52Status')?.textContent.includes('Sauvegardé'));
    assert.equal(cloud.version,2,'Mobile cloud save did not update remote revision');
    console.log('PASS: Mobile->Google update');

    // Old desktop must not erase newer mobile work silently.
    await A.page.evaluate(()=>localStorage.setItem('second-brain-demo-v52',JSON.stringify({topic:'Cours agricoles',notes:'Version locale différente sur ordinateur'})));
    const dialog=A.page.waitForEvent('dialog');
    const click=A.page.locator('#g52Upload').click();
    const prompt=await dialog;
    assert.match(prompt.message(),/sauvegarde Google existe déjà/);
    await prompt.dismiss();
    await click;
    assert.equal(cloud.version,2,'Conflict must not overwrite remote after confirmation denied');
    assert.equal(JSON.parse(cloud.data.entries['second-brain-demo-v52']).notes,'Mise à jour sur téléphone');
    console.log('PASS: Conflict protection prevents silent overwrite');

    const keyChecks=await A.page.evaluate(()=>({
      privateToken:window.SecondBrainGoogleSyncV52.isDataKey('second-brain-verify-token-v43'),
      userData:window.SecondBrainGoogleSyncV52.isDataKey('second-brain-learning-v33'),
      config:window.SecondBrainGoogleSyncV52.isDataKey('second-brain-google-v52-client-id')
    }));
    assert.deepEqual(keyChecks,{privateToken:false,userData:true,config:false});
    console.log('PASS: Local-data allow/deny filter');
    await B.context.close();await A.context.close();
  }finally{await browser.close();}
}
run().catch(e=>{console.error(e);process.exit(1);});
