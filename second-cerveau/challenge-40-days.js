/* Second Cerveau — 40 jours d'épreuve et concentration en cycles de 3 jours.
   Ajout progressif au calendrier existant des Jours de combat, sans modifier ses coches. */
(() => {
  'use strict';
  const STORE = 'second-brain-40days-focus-v1';
  const COMBAT = 'second-brain-combat-days-v1';
  const DEFAULT_START = '2026-10-27';
  const TOTAL = 40;
  const MONTHS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  const $ = id => document.getElementById(id);
  const validIso = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value + 'T00:00:00Z'));
  const day = iso => {
    const parts = iso.split('-').map(Number);
    return Math.floor(Date.UTC(parts[0], parts[1]-1, parts[2]) / 86400000);
  };
  const iso = dayNo => new Date(dayNo * 86400000).toISOString().slice(0,10);
  const dateToday = () => {
    const d = new Date();
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  };
  const pretty = value => new Date(value+'T12:00:00').toLocaleDateString('fr-CA',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  function load(){
    try {
      const obj = JSON.parse(localStorage.getItem(STORE) || '{}');
      return {
        start: validIso(obj.start) ? obj.start : DEFAULT_START,
        focus: obj.focus && typeof obj.focus === 'object' && !Array.isArray(obj.focus) ? obj.focus : {}
      };
    } catch(e) { return { start: DEFAULT_START, focus: {} }; }
  }
  function combatData(){
    try { const v = JSON.parse(localStorage.getItem(COMBAT) || '{}'); return v && typeof v === 'object' ? v : {}; }
    catch(e) { return {}; }
  }
  const config = load();
  function save(){ try { localStorage.setItem(STORE, JSON.stringify(config)); } catch(e) {} }
  function install(){
    const card = $('combatDaysCard');
    const calendar = $('combatGrid');
    const month = $('combatMonthLabel');
    if(!card || !calendar || !month || $('fortyDaysProgram')) return;
    const style = document.createElement('style');
    style.id = 'fortyDaysStyle';
    style.textContent =
      '#fortyDaysProgram{margin:14px 0 2px;padding:14px;border:1px solid #cddfce;border-radius:16px;background:#f7faf5;line-height:1.5}' +
      '#fortyDaysProgram .program-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px}' +
      '#fortyDaysProgram h3{margin:0;font-size:17px}' +
      '#fortyDaysProgram .program-badge{border-radius:999px;background:#e4f1df;color:#35643a;font-weight:900;padding:6px 10px;font-size:12px}' +
      '#fortyDaysProgram .program-line{margin:9px 0 0;color:#526052;font-size:12px}' +
      '#fortyDaysProgram .program-controls{margin-top:10px;display:flex;gap:12px;flex-wrap:wrap;align-items:center}' +
      '#fortyDaysProgram .program-controls label{font-size:12px;font-weight:800}' +
      '#fortyDaysProgram input[type=date]{margin-left:7px;min-height:38px;border:1px solid #cbd9cb;background:white;border-radius:9px;padding:6px}' +
      '#fortyDaysProgram .program-cycle{margin:14px 0 0;border-top:1px solid #dbe6d7;padding-top:12px}' +
      '#fortyDaysProgram .program-cycle strong{font-size:13px}' +
      '#fortyDaysProgram .program-focus-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:9px}' +
      '#fortyDaysProgram .program-focus-item{display:flex;gap:7px;align-items:flex-start;border:1px solid #d9e4d5;background:#fff;border-radius:10px;padding:9px;font-size:12px;cursor:pointer}' +
      '#fortyDaysProgram .program-focus-item input{margin:3px 0 0;accent-color:#5c8954}' +
      '#fortyDaysProgram .program-focus-item small{display:block;color:#657365;margin-top:3px}' +
      '#combatDaysCard .combat-day.program-day{min-height:73px;padding:4px;gap:2px;justify-content:center}' +
      '#combatDaysCard .combat-day .program-label{display:block;font-size:9px;line-height:1.1;font-weight:800;color:#47684c;text-align:center}' +
      '#combatDaysCard .combat-day .program-focus-label{display:block;font-size:9px;line-height:1.1;color:#71599b;text-align:center}' +
      '#combatDaysCard .combat-day .program-focus-label.done{color:#32683e;font-weight:900}' +
      '@media(max-width:700px){#fortyDaysProgram{padding:11px}#fortyDaysProgram .program-focus-list{grid-template-columns:1fr}#combatDaysCard .combat-day.program-day{min-height:72px;padding:2px}#combatDaysCard .combat-day .program-label,#combatDaysCard .combat-day .program-focus-label{font-size:8px}}';
    document.head.appendChild(style);
    const program = document.createElement('section');
    program.id = 'fortyDaysProgram';
    program.setAttribute('aria-label', "Épreuve de 40 jours et concentration");
    program.innerHTML =
      '<div class="program-head"><h3>40 jours d’épreuve + concentration</h3><span class="program-badge" id="programDayStatus"></span></div>' +
      '<p class="program-line" id="programDates"></p>' +
      '<p class="program-line" id="programProgress"></p>' +
      '<div class="program-controls"><label>Début <input type="date" id="programStart" aria-label="Date de début des 40 jours"></label></div>' +
      '<div class="program-cycle"><strong id="programCycleHeading"></strong>' +
      '<p class="program-line">Le cycle de concentration recommence tous les 3 jours. Les cases des « Jours de combat » restent indépendantes.</p>' +
      '<div class="program-focus-list" id="programFocusList"></div></div>';
    const nav = card.querySelector('.combat-month');
    if(nav) nav.insertAdjacentElement('beforebegin',program); else card.appendChild(program);

    function decorate(){
      const label = month.textContent.toLowerCase().trim();
      const yearMatch = label.match(/\b(20\d{2})\b/);
      const monthNo = MONTHS.findIndex(m => label.includes(m));
      if(!yearMatch || monthNo < 0) return;
      const year = Number(yearMatch[1]);
      const start = day(config.start), end = start + TOTAL - 1;
      calendar.querySelectorAll('button.combat-day').forEach(button => {
        button.querySelectorAll('.program-label,.program-focus-label').forEach(el => el.remove());
        button.classList.remove('program-day');
        const numberEl = button.querySelector('span');
        const number = Number(numberEl && numberEl.textContent);
        if(!number || number < 1 || number > 31) return;
        const current = Math.floor(Date.UTC(year,monthNo,number)/86400000);
        if(current < start || current > end) return;
        const offset = current - start;
        const date = iso(current);
        const concentration = offset % 3 + 1;
        button.classList.add('program-day');
        const challenge = document.createElement('span');
        challenge.className='program-label';
        challenge.textContent='Épreuve '+(offset+1)+'/40';
        const focus = document.createElement('span');
        focus.className='program-focus-label'+(config.focus[date]?' done':'');
        focus.textContent='Concentration '+concentration+(config.focus[date]?' ✓':'');
        button.append(challenge,focus);
        button.title='Épreuve : jour '+(offset+1)+'/40 · Concentration : jour '+concentration+'/3';
      });
    }

    function render(){
      const start = day(config.start);
      const end = start + TOTAL - 1;
      const today = day(dateToday());
      const current = today-start;
      const completed = combatData();
      let combatCount = 0, focusCount = 0;
      for(let d=start;d<=end;d++){
        const date = iso(d);
        if(completed[date] && d<=today) combatCount++;
        if(config.focus[date] && d<=today) focusCount++;
      }
      $('programStart').value = config.start;
      $('programDates').textContent='Du '+pretty(config.start)+' au '+pretty(iso(end))+' inclus.';
      $('programProgress').textContent='Jours de combat cochés : '+combatCount+'/40 · Concentration réalisée : '+focusCount+'/40. Aucun jour n’est validé automatiquement.';
      $('programDayStatus').textContent=current<0?'Début dans '+(-current)+' jour(s)':current>=TOTAL?'40 jours écoulés':'Jour '+(current+1)+'/40';
      const cycleOffset=Math.min(TOTAL-1,Math.max(0,Math.floor(Math.max(0,current)/3)*3));
      const cycleStart=start+cycleOffset;
      const cycleEnd=Math.min(end,cycleStart+2);
      $('programCycleHeading').textContent='Cycle de concentration · '+pretty(iso(cycleStart))+' au '+pretty(iso(cycleEnd));
      const list=$('programFocusList');
      list.replaceChildren();
      for(let d=cycleStart;d<=cycleEnd;d++){
        const date=iso(d), focusDay=(d-start)%3+1;
        const label=document.createElement('label');
        label.className='program-focus-item';
        const checkbox=document.createElement('input');
        checkbox.type='checkbox';
        checkbox.checked=!!config.focus[date];
        checkbox.disabled=d>today;
        checkbox.setAttribute('aria-label','Concentration jour '+focusDay+' le '+pretty(date));
        checkbox.addEventListener('change',()=>{
          if(checkbox.checked) config.focus[date]=true; else delete config.focus[date];
          save(); render();
        });
        const description=document.createElement('span');
        const main=document.createElement('strong');
        main.textContent='Concentration · Jour '+focusDay;
        const sub=document.createElement('small');
        sub.textContent=pretty(date)+(d>today?' · à venir':'');
        description.append(main,sub);
        label.append(checkbox,description);
        list.appendChild(label);
      }
      decorate();
    }
    $('programStart').addEventListener('change',e=>{
      if(!validIso(e.target.value)) return;
      config.start=e.target.value;
      save();render();
    });
    new MutationObserver(decorate).observe(calendar,{childList:true});
    window.addEventListener('storage',event=>{
      if(event.key===COMBAT || event.key===STORE){
        if(event.key===STORE) {
          const next=load();config.start=next.start;config.focus=next.focus;
        }
        render();
      }
    });
    render();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();