/* Add email account access to existing Second Cerveau OS without replacing
   its login, local data, Google OAuth or cloud synchronization handlers. */
(() => {
  'use strict';
  function install() {
    const nav=document.querySelector('nav.tabs'), app=document.querySelector('.app');
    if(!nav || !app || document.getElementById('page-email-account')) return;
    const tab=document.createElement('button');
    tab.type='button'; tab.className='tab';
    tab.dataset.page='email-account';tab.textContent='Mon compte';
    tab.setAttribute('aria-controls','page-email-account');

    const backup=nav.querySelector('[data-page="backup"]');
    if(backup) nav.insertBefore(tab,backup);
    else nav.append(tab);

    const section=document.createElement('section');
    section.className='page';section.id='page-email-account';
    section.setAttribute('aria-label','Compte Second Cerveau');

    const frame=document.createElement('iframe');
    frame.id='sbEmailAccountFrame';
    frame.title='Connexion par e-mail à Second Cerveau';
    frame.src=new URL('./compte.html',document.baseURI).href;
    frame.loading='lazy';
    frame.setAttribute('sandbox','allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation-by-user-activation');
    frame.style.cssText='display:block;border:0;border-radius:16px;width:100%;min-height:750px;background:#f2f5ee';

    const fallback=document.createElement('p');
    fallback.style.cssText='padding:12px 3px;font-size:13px;color:var(--muted,#66786b)';
    fallback.append('Tu peux aussi ');
    const link=document.createElement('a');
    link.href=new URL('./compte.html',document.baseURI).href;
    link.textContent='ouvrir Mon compte dans une page entière';
    link.target='_blank';link.rel='noopener noreferrer';
    fallback.append(link,'. Cette connexion ne remplace pas tes notes.');
    section.append(frame,fallback);app.append(section);

    tab.onclick=()=>{
      document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x===tab));
      document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
      section.classList.add('active');
      window.scrollTo({top:0,behavior:'smooth'});
    };
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
