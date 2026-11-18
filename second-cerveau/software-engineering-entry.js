/*
 * Second Cerveau OS · Espace Génie logiciel / DevOps
 * Adds an isolated workspace to the existing tab navigation without changing
 * the main knowledge map, OAuth, backup or cloud sync handlers.
 */
(() => {
  'use strict';
  const PAGE = 'software-engineering';
  const MODULE_URL = new URL('./atelier-genie-logiciel.html', document.baseURI).href;

  function install() {
    const nav = document.querySelector('nav.tabs');
    const app = document.querySelector('.app');
    if (!nav || !app || document.getElementById('page-' + PAGE)) return;

    const style = document.createElement('style');
    style.id = 'sb-software-engineering-styles';
    style.textContent = `
      #page-software-engineering { width: 100%; }
      #page-software-engineering .sb-lab-intro {
        display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;
        gap:15px;padding:20px 22px;margin-bottom:14px;
        background:linear-gradient(120deg,#172b48,#24375b);color:#f5f7ff;
        border:1px solid #465a81;border-radius:18px;
      }
      #page-software-engineering .sb-lab-intro h2 {
        margin:0 0 7px;font-size:clamp(22px,3vw,28px);color:#fff;
      }
      #page-software-engineering .sb-lab-intro p {
        margin:0;color:#d4def2;max-width:650px;font-size:13px;line-height:1.6;
      }
      #page-software-engineering .sb-lab-link {
        display:inline-flex;align-items:center;justify-content:center;
        min-height:42px;padding:10px 14px;border-radius:11px;text-decoration:none;
        background:#e4ebff;color:#182543;font-size:13px;font-weight:800;
      }
      #page-software-engineering .sb-lab-note {
        margin:0 0 13px;color:var(--muted,#68747e);font-size:12px;line-height:1.5;
      }
      #page-software-engineering .sb-lab-frame {
        width:100%;height:max(730px,calc(100dvh - 135px));display:block;
        border:1px solid #354760;border-radius:17px;background:#0b1221;
      }
      @media(max-width:760px) {
        #page-software-engineering .sb-lab-intro {padding:17px 15px;}
        #page-software-engineering .sb-lab-link {width:100%;}
        #page-software-engineering .sb-lab-frame {height:max(720px,calc(100dvh - 155px));border-radius:12px;}
      }
    `;
    document.head.appendChild(style);

    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'tab';
    tab.dataset.page = PAGE;
    tab.textContent = 'Génie logiciel & DevOps';
    tab.setAttribute('aria-controls', 'page-' + PAGE);
    const anchor = nav.querySelector('.tab[data-page="learning"]')
      || nav.querySelector('.tab[data-page="agent-ia"]');
    if (anchor) anchor.insertAdjacentElement('afterend', tab);
    else nav.appendChild(tab);

    const section = document.createElement('section');
    section.className = 'page';
    section.id = 'page-' + PAGE;
    section.setAttribute('aria-label', 'Atelier de génie logiciel et DevOps');

    const intro = document.createElement('div');
    intro.className = 'sb-lab-intro';
    const titleAndText = document.createElement('div');
    const heading = document.createElement('h2');
    heading.textContent = 'Atelier de génie logiciel & DevOps';
    const description = document.createElement('p');
    description.textContent =
      'Réalise des missions, programme, teste, corrige les erreurs et organise tes vrais projets. Apprentissage actif : faire, tester, corriger, livrer.';
    titleAndText.append(heading, description);

    const openLink = document.createElement('a');
    openLink.className = 'sb-lab-link';
    openLink.href = MODULE_URL;
    openLink.target = '_blank';
    openLink.rel = 'noopener noreferrer';
    openLink.textContent = 'Ouvrir en plein écran ↗';
    intro.append(titleAndText, openLink);

    const note = document.createElement('p');
    note.className = 'sb-lab-note';
    note.textContent =
      'Les missions et projets sont enregistrés localement dans un espace distinct. Exporte une sauvegarde JSON depuis l’atelier ; ils ne sont pas encore synchronisés avec Google Drive.';

    const frame = document.createElement('iframe');
    frame.className = 'sb-lab-frame';
    frame.title = 'Second Cerveau — Atelier pratique Software Engineering et DevOps';
    frame.loading = 'lazy';
    frame.src = MODULE_URL;
    frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-downloads');

    section.append(intro, note, frame);
    app.appendChild(section);

    tab.onclick = () => {
      document.querySelectorAll('.tab').forEach(button => {
        button.classList.toggle('active', button === tab);
      });
      document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
      });
      section.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
