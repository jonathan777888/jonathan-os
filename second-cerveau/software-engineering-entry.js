/*
 * Second Cerveau OS — atelier intégré Génie logiciel & DevOps.
 * Ne modifie ni les données ni la navigation des autres espaces.
 */
(() => {
  'use strict';
  const PAGE = 'software-engineering';
  const MODULE_URL = new URL('./atelier-genie-logiciel.html', document.baseURI);
  MODULE_URL.searchParams.set('v', 'eli-manga-integre-20261119');
  const HASH = '#genie-logiciel';

  function install() {
    const nav = document.querySelector('nav.tabs');
    const app = document.querySelector('.app');
    if (!nav || !app || document.getElementById('page-' + PAGE)) return;

    const style = document.createElement('style');
    style.id = 'sb-software-engineering-styles';
    style.textContent = `
      #page-software-engineering {
        width: 100%;
        min-width: 0;
        background: linear-gradient(145deg, #faf2e4 0%, #e8cfaf 100%);
        border: 1px solid #dec5a7;
        border-radius: 20px;
        padding: 12px;
        box-shadow: 0 12px 40px rgba(95,65,36,.09);
      }
      #page-software-engineering .sb-lab-intro {
        background: rgba(255,250,239,.9);
        border: 1px solid #e1c9a7;
        border-radius: 14px;
        margin-bottom: 10px;
        padding: 12px 17px;
        display:flex;
        justify-content:space-between;
        align-items:center;
        flex-wrap:wrap;
        gap:8px;
        color:#463325;
      }
      #page-software-engineering .sb-lab-intro h2 {
        margin:0;
        font-size:clamp(17px,2.5vw,22px);
        color:#463325;
      }
      #page-software-engineering .sb-lab-intro p {
        margin:4px 0 0;
        font-size:13px;
        line-height:1.45;
        color:#70533d;
      }
      #page-software-engineering .sb-lab-frame {
        display:block;
        width:100%;
        height:max(740px,calc(100dvh - 190px));
        min-height:740px;
        border:1px solid #d2b595;
        border-radius:15px;
        background:#f6eddf;
      }
      #page-software-engineering .sb-lab-privacy {
        margin:9px 4px 2px;
        font-size:11px;
        color:#786756;
      }
      @media(max-width:760px) {
        #page-software-engineering{padding:6px;border-radius:14px}
        #page-software-engineering .sb-lab-intro{padding:10px 11px;margin-bottom:5px}
        #page-software-engineering .sb-lab-frame{
          height:max(710px,calc(100dvh - 145px));
          min-height:710px;
          border-radius:11px;
        }
      }
    `;
    document.head.appendChild(style);

    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'tab';
    tab.dataset.page = PAGE;
    tab.textContent = 'Génie logiciel & DevOps';
    tab.setAttribute('aria-controls', 'page-' + PAGE);
    tab.title = 'Atelier animé avec Eli : un projet, une mission à la fois';
    const anchor = nav.querySelector('.tab[data-page="learning"]') ||
                   nav.querySelector('.tab[data-page="agent-ia"]');
    if (anchor) anchor.insertAdjacentElement('afterend', tab);
    else nav.appendChild(tab);

    const section = document.createElement('section');
    section.className = 'page';
    section.id = 'page-' + PAGE;
    section.setAttribute('aria-label', 'Atelier animé de génie logiciel et DevOps');

    const intro = document.createElement('div');
    intro.className = 'sb-lab-intro';
    const headingGroup = document.createElement('div');
    const title = document.createElement('h2');
    title.textContent = 'Mon atelier Génie logiciel & DevOps';
    const description = document.createElement('p');
    description.textContent = 'Eli, les vagues beige animées, des encouragements bibliques et une seule mission à la fois.';
    headingGroup.append(title, description);
    intro.append(headingGroup);

    const frame = document.createElement('iframe');
    frame.className = 'sb-lab-frame';
    frame.title = 'Atelier animé : Eli et parcours de réalisation de projets';
    frame.loading = 'eager';
    frame.src = MODULE_URL.href;
    frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-downloads');
    frame.setAttribute('referrerpolicy', 'same-origin');

    const note = document.createElement('p');
    note.className = 'sb-lab-privacy';
    note.textContent = 'Les projets de cet atelier utilisent leur stockage local distinct. Garde une sauvegarde de tes travaux.';

    section.append(intro, frame, note);
    app.appendChild(section);

    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(button => {
        button.classList.toggle('active', button === tab);
      });
      document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
      section.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'instant' });
    });

    // Permet d'ouvrir directement cet onglet depuis le lien principal Second Cerveau.
    const openFromHash = () => {
      if (window.location.hash === HASH) tab.click();
    };
    window.addEventListener('hashchange', openFromHash);
    openFromHash();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once:true });
  } else {
    install();
  }
})();
