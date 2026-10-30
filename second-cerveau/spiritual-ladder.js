/* Second Cerveau — Échelle de progression spirituelle et personnelle.
   Module indépendant : n'altère ni les jours de combat ni les 40 jours.
   Le journal et les validations restent dans le stockage local du navigateur. */
(() => {
  'use strict';
  const KEY = 'spiritual-ladder-local-v1';
  const LEVELS = [
    {id:'N',name:'Nul',label:'Reprendre à la base',color:'#937469'},
    {id:'M',name:'Médiocre',label:'Faire ses premiers efforts réguliers',color:'#9b8159'},
    {id:'B',name:'Bon',label:'Ancrer les bonnes habitudes',color:'#56816a'},
    {id:'T',name:'Très bon',label:'Devenir stable dans les difficultés',color:'#387d73'},
    {id:'E',name:'Excellent',label:'Persévérer avec humilité',color:'#297550'}
  ];
  const PHASES = [
    [
      ['Point de départ','Observer ce que je vis sans me condamner.','Note ce que tu observes, sans chercher à tout corriger le même jour.'],
      ['Prise de conscience','Nommer les difficultés avec précision.','Relève une situation réelle et ce que tu aimerais changer.'],
      ['Décision','Choisir un premier changement réaliste.','Écris une décision concrète et réalisable.'],
      ['Première action','Faire un premier pas observable.','Réalise une action, même toute petite.'],
      ['Premières répétitions','Recommencer après le premier essai.','Répète l’action à plusieurs occasions distinctes.']
    ],
    [
      ['Premier palier','Oser agir malgré une régularité encore fragile.','Réalise cet exercice une première fois et décris ton ressenti.'],
      ['Deuxième tentative','Revenir à l’action après le premier essai.','Répète cet exercice à deux occasions différentes.'],
      ['Trois occasions','Rendre le geste moins exceptionnel.','Pratique cet exercice à trois occasions distinctes.'],
      ['Quatre occasions','Reprendre après une difficulté.','Pratique à quatre occasions ; si tu oublies, reprends sans honte.'],
      ['Bilan d’une semaine','Repérer les progrès et les obstacles.','Essaie sur une semaine, puis écris un bilan honnête, même imparfait.']
    ],
    [
      ['Habitude émergente','Installer une pratique raisonnablement régulière.','Pratique cet exercice à cinq occasions sur une semaine adaptée à ton rythme.'],
      ['Organisation','Préparer les conditions de la régularité.','Planifie les occasions de pratique et tiens-en compte dans ton bilan.'],
      ['Après une interruption','Apprendre à reprendre plutôt qu’abandonner.','Après un oubli ou un imprévu, reprends cet exercice à la prochaine occasion.'],
      ['Dans un autre contexte','Transférer la bonne habitude ailleurs.','Mets en pratique dans une situation inhabituelle ou plus difficile.'],
      ['Bilan sur deux semaines','Vérifier la constance sans perfectionnisme.','Observe deux semaines et relève tes réussites, corrections et besoins.']
    ],
    [
      ['Même dans la difficulté','Rester fidèle à ses convictions sous pression.','Mets cet exercice en pratique dans une situation inconfortable.'],
      ['Ancrage','Préserver une bonne habitude durablement.','Pratique régulièrement durant deux semaines et note ce qui t’aide.'],
      ['Attention aux autres','Faire du bien sans rechercher une récompense.','Applique cette qualité en tenant compte des besoins d’une personne.'],
      ['Souplesse','Adapter ses méthodes sans abandonner ses valeurs.','Adapte cet exercice à un imprévu, puis observe ce que tu apprends.'],
      ['Bilan et correction','Corriger ce qui reste fragile.','Relis tes observations et choisis une amélioration concrète.']
    ],
    [
      ['Persévérance','Chercher la fidélité plutôt que l’apparence de perfection.','Maintiens cet exercice plusieurs semaines et identifie tes appuis réels.'],
      ['Discrétion','Vivre ses valeurs même sans regard extérieur.','Mets en pratique sans chercher à être remarqué ou félicité.'],
      ['Humilité','Aider autrui sans supériorité.','Pratique cette qualité dans une relation en écoutant avant d’agir.'],
      ['Équilibre','Allier constance, repos et responsabilité.','Adapte l’exercice à tes limites sans abandonner l’essentiel.'],
      ['Entretien à long terme','Continuer à apprendre et à se corriger.','Fais un bilan, remercie Jéhovah et définis une pratique à entretenir.']
    ]
  ];
  // Pour chaque critère : nom, point N0, exercices N0-N4,
  // puis repère + exercice propres aux niveaux M, B, T et E.
  const CRITERIA = [
    {
      name:"Relation avec Jéhovah par Jésus-Christ",
      base:"Je néglige ma relation avec Jéhovah et je ne cherche presque pas à la nourrir par Jésus-Christ.",
      n:[
        "Écris simplement comment tu décrirais aujourd’hui ta relation avec Jéhovah.",
        "Nomme une chose qui t’éloigne actuellement de Jéhovah.",
        "Choisis un court passage biblique à méditer.",
        "Lis Jean 15:5 et relève une idée pour te rapprocher de Jéhovah.",
        "Relis un passage biblique à plusieurs occasions et applique une idée."
      ],
      tiers:[
        ["Je cherche parfois à me rapprocher de Jéhovah, mais je reste irrégulier.","Prends un court moment pour méditer un passage biblique et réfléchir à une décision."],
        ["J’accorde régulièrement du temps à ma relation avec Jéhovah.","Lis un passage biblique, formule une application concrète et reviens-y."],
        ["Je prends en compte les principes bibliques même lorsque mes décisions sont difficiles.","Examine une décision délicate à la lumière d’un enseignement de Jésus."],
        ["Je cherche durablement la direction de Jéhovah avec humilité, même dans les épreuves.","Choisis une décision importante et explique comment la foi et l’amour guident ton choix."]
      ],
      verse:"Jean 15:5"
    },
    {
      name:"Stabilité personnelle",
      base:"Je suis instable dans mes décisions et j’abandonne facilement mes bonnes habitudes.",
      n:[
        "Note un exemple concret d’engagement que tu as abandonné.",
        "Repère une situation qui te fait changer fréquemment de direction.",
        "Choisis un engagement suffisamment petit pour être maintenu.",
        "Respecte cet engagement une première fois.",
        "Reviens au même engagement lors de plusieurs occasions."
      ],
      tiers:[
        ["Je tiens parfois mes engagements, mais mes décisions restent changeantes.","Maintiens une petite décision malgré une distraction."],
        ["Je respecte la majorité de mes engagements et j’apprends à gérer les imprévus.","Planifie un engagement réaliste et respecte-le."],
        ["Je demeure constant dans mes principes en adaptant mes méthodes.","Poursuis un engagement malgré un imprévu en adaptant ton organisation."],
        ["Je garde mes principes durablement tout en reconnaissant mes limites.","Réexamine un engagement important et ajuste sa mise en œuvre sans trahir tes valeurs."]
      ],
      verse:"Jacques 1:8"
    },
    {
      name:"Fruit de l’esprit",
      base:"Mes réactions manifestent souvent des œuvres de la chair plutôt que le fruit de l’esprit.",
      n:[
        "Repère une réaction où la colère, l’impatience ou le manque de maîtrise a dominé.",
        "Identifie une qualité de Galates 5:22-23 que tu veux développer.",
        "Choisis une occasion de pratiquer cette qualité.",
        "Dans une situation réelle, marque une pause et agis avec cette qualité.",
        "Reprends ce geste dans plusieurs interactions."
      ],
      tiers:[
        ["Je manifeste parfois les qualités du fruit de l’esprit, sans constance.","Choisis l’amour, la patience ou la douceur dans une interaction réelle."],
        ["Je manifeste régulièrement plusieurs qualités du fruit de l’esprit.","Avant une réponse difficile, ralentis et choisis une attitude paisible."],
        ["Je manifeste le fruit de l’esprit même dans des situations tendues.","Dans un désaccord, écoute puis réponds avec douceur et maîtrise."],
        ["Je laisse les qualités du fruit de l’esprit guider durablement ma conduite.","Dans une situation éprouvante, privilégie la patience, la bonté et la maîtrise de soi."]
      ],
      verse:"Galates 5:22-23"
    },
    {
      name:"Discipline",
      base:"Je ne maintiens presque aucune habitude utile et je néglige mes routines.",
      n:[
        "Note une habitude importante que tu as interrompue.",
        "Identifie le moment où cette habitude devient difficile.",
        "Choisis une routine simple de deux minutes.",
        "Réalise cette routine une première fois.",
        "Répète cette routine à plusieurs occasions, même brièvement."
      ],
      tiers:[
        ["Je commence de bonnes habitudes, mais je les interromps souvent.","Réalise une mini-routine prévue à l’avance."],
        ["Je respecte généralement mes routines et je reprends après un oubli.","Planifie une routine réaliste, avec une place pour le repos."],
        ["Je reste discipliné même lorsque la motivation diminue.","Exécute une habitude importante à un moment peu motivant, sans te surcharger."],
        ["Ma discipline devient durable, équilibrée et fidèle à mes priorités.","Maintiens une routine importante tout en préservant repos et souplesse."]
      ],
      verse:"1 Corinthiens 9:25"
    },
    {
      name:"Intégrité : mon oui et mon non",
      base:"Je dis oui alors que je pense non, et mes paroles ne correspondent pas toujours à mes intentions.",
      n:[
        "Rappelle-toi un moment où tu as accepté quelque chose contre ton intention.",
        "Identifie ce qui t’empêchait de dire non.",
        "Prépare une phrase respectueuse pour refuser ou accepter sincèrement.",
        "Utilise un oui ou un non sincère dans une situation adaptée.",
        "Répète une réponse honnête dans plusieurs conversations."
      ],
      tiers:[
        ["Je veux être sincère, mais je cède encore parfois à la pression.","Exprime un oui ou un non qui correspond réellement à ta décision."],
        ["Je suis généralement sincère et je clarifie mes engagements.","Avant de promettre quelque chose, vérifie si tu peux véritablement le faire."],
        ["Je reste sincère même lorsque la réponse est difficile.","Explique avec respect un refus ou une limite dans une situation inconfortable."],
        ["Mes paroles et mes actes restent cohérents, même sans témoin.","Reconnais et corrige honnêtement un décalage entre une promesse et tes actes."]
      ],
      verse:"Matthieu 5:37"
    },
    {
      name:"Concentration",
      base:"Je me disperse dans plusieurs activités et je ne termine pas mes priorités.",
      n:[
        "Note les trois distractions qui détournent le plus souvent ton attention.",
        "Identifie une tâche importante régulièrement repoussée.",
        "Choisis une seule tâche comme priorité.",
        "Travaille dix minutes sur cette tâche sans changer d’activité.",
        "Répète une courte séance de concentration sur la même priorité."
      ],
      tiers:[
        ["Je parviens parfois à me concentrer, mais la dispersion revient souvent.","Travaille sur une seule priorité pendant un court bloc sans interruption volontaire."],
        ["Je choisis mes priorités et je les accomplis généralement.","Définis le résultat attendu avant ta séance de travail et vérifie-le à la fin."],
        ["Je protège mon attention même lorsque les distractions se multiplient.","Prépare un environnement calme et termine une priorité malgré une tentation de te disperser."],
        ["J’accorde durablement mon attention à l’essentiel, avec des pauses adaptées.","Achève une priorité importante avant de commencer une nouvelle activité facultative."]
      ],
      verse:"Philippiens 3:13"
    },
    {
      name:"Excellence et qualité",
      base:"Je néglige la qualité de mes actions et je laisse souvent mes réalisations inachevées.",
      n:[
        "Choisis une tâche récente que tu aurais pu mieux soigner.",
        "Identifie une erreur ou un détail important négligé.",
        "Définis deux exigences simples pour une petite tâche.",
        "Termine une réalisation et vérifie-la avant de la déclarer achevée.",
        "Corrige ou améliore plusieurs réalisations à partir de critères simples."
      ],
      tiers:[
        ["Je cherche parfois à bien faire, mais je travaille encore irrégulièrement.","Termine une tâche puis vérifie un point précis de qualité."],
        ["Je produis généralement un travail satisfaisant et vérifié.","Utilise une petite liste de contrôle avant de terminer une réalisation."],
        ["Je fournis un travail soigné et je corrige mes erreurs avec méthode.","Demande un retour utile ou compare ton résultat à des critères explicites."],
        ["Je recherche une qualité durable avec rigueur et humilité, sans perfectionnisme.","Améliore une réalisation en justifiant ce qui apporte réellement de la valeur."]
      ],
      verse:"Colossiens 3:23"
    },
    {
      name:"Amour et respect du prochain",
      base:"Je ne traite pas suffisamment les autres avec le respect et l’amour que je souhaite recevoir.",
      n:[
        "Décris une situation où tu n’as pas suffisamment considéré une personne.",
        "Identifie le besoin ou le sentiment de cette personne que tu as négligé.",
        "Choisis un geste de respect, d’écoute ou de bienveillance.",
        "Écoute ou aide concrètement une personne aujourd’hui.",
        "Répète plusieurs gestes de respect dans des situations différentes."
      ],
      tiers:[
        ["Je montre parfois du respect, mais je manque encore de patience.","Écoute une personne sans l’interrompre et prends en compte son point de vue."],
        ["Je respecte habituellement les autres et je considère leurs besoins.","Pose un geste de bonté envers quelqu’un sans rien attendre en retour."],
        ["Je traite les autres avec empathie, même en cas de désaccord.","Manifeste du respect à une personne dont le point de vue est différent du tien."],
        ["Je manifeste un amour constant, humble et compatissant dans mes relations.","Aide ou encourage une personne avec discrétion, en respectant ses limites."]
      ],
      verse:"Marc 12:31"
    },
    {
      name:"Accomplissement des engagements",
      base:"Je ne termine pas les responsabilités que je me fixe.",
      n:[
        "Note une responsabilité que tu as laissée inachevée.",
        "Repère ce qui a empêché son achèvement.",
        "Choisis une tâche réalisable en dix minutes.",
        "Termine entièrement cette tâche.",
        "Termine plusieurs petites responsabilités sans en ajouter trop."
      ],
      tiers:[
        ["Je termine certaines tâches, mais beaucoup restent en attente.","Achève une petite responsabilité avant d’en commencer une nouvelle."],
        ["Je termine la majorité de mes engagements raisonnables.","Planifie une tâche avec une fin précise, puis accomplis-la."],
        ["Je remplis mes responsabilités avec fiabilité et je communique mes limites.","Tiens un engagement malgré un imprévu ou annonce clairement un ajustement nécessaire."],
        ["Je mène mes responsabilités avec constance et honnêteté sur mes capacités.","Achève une tâche importante et fais un bilan des résultats et de tes limites."]
      ],
      verse:"Jacques 1:22"
    },
    {
      name:"Communication avec Jéhovah par Jésus-Christ",
      base:"Je ne prie presque jamais Jéhovah au nom de Jésus-Christ et je ne lui confie pas mes préoccupations.",
      n:[
        "Reconnais sincèrement quelle place la prière occupe dans ta journée.",
        "Identifie un moment où tu pourrais parler à Jéhovah.",
        "Décide de prendre une minute pour une prière personnelle.",
        "Adresse à Jéhovah une prière sincère au nom de Jésus-Christ.",
        "Renouvelle la prière à plusieurs moments, sans récitation mécanique."
      ],
      tiers:[
        ["Je prie de temps à autre, mais sans rythme régulier.","Parle à Jéhovah au nom de Jésus-Christ de ce que tu vis réellement."],
        ["Je prie régulièrement et je prends aussi le temps de remercier Jéhovah.","Prie le matin, dans la journée ou le soir, puis exprime une gratitude sincère."],
        ["Je maintiens une communication quotidienne et personnelle avec Jéhovah.","Prie en suivant ton cycle : personnel, intercession pour quelqu’un, gratitude."],
        ["Je garde un dialogue sincère avec Jéhovah dans les joies, les décisions et les épreuves.","Parle à Jéhovah avec reconnaissance et confiance, même lorsque rien d’urgent ne te préoccupe."]
      ],
      verse:"1 Thessaloniciens 5:17"
    },
    {
      name:"Imitation de Jésus-Christ",
      base:"Mes attitudes et mes actions reflètent rarement l’exemple de Jésus-Christ.",
      n:[
        "Décris une attitude que tu voudrais changer pour mieux ressembler à Jésus.",
        "Identifie une qualité de Jésus que tu admires.",
        "Choisis une situation où tu pourrais appliquer cette qualité.",
        "Manifeste cette qualité dans une action réelle.",
        "Reprends cette même qualité dans plusieurs interactions."
      ],
      tiers:[
        ["Je pense parfois à l’exemple de Jésus, mais je peine à l’appliquer.","Choisis un enseignement de Jésus et traduis-le en un geste concret."],
        ["Je cherche régulièrement à imiter Jésus dans mes paroles et mes choix.","Avant une décision relationnelle, demande-toi comment agir avec humilité et amour."],
        ["Je manifeste souvent l’humilité, la compassion et la patience de Jésus.","Dans une situation difficile, réponds avec une qualité que Jésus a montrée."],
        ["Je fais durablement de Jésus mon modèle, en reconnaissant mes imperfections.","Prends une décision exigeante en privilégiant l’amour, l’humilité et le service."]
      ],
      verse:"1 Pierre 2:21"
    }
  ];
  const STAGES = LEVELS.flatMap((level, levelIndex) => PHASES[levelIndex].map((phase, step) => ({
    id: level.id + step,
    name: level.name,
    levelIndex,
    step,
    title: phase[0],
    aim: phase[1],
    instruction: phase[2],
    color: level.color
  })));
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const load = () => {
    let raw;
    try { raw = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { raw = {}; }
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) raw = {};
    const current = Number.isInteger(raw.current) ? Math.min(24, Math.max(0,raw.current)) : 0;
    return {current, checks: raw.checks && typeof raw.checks==='object' ? raw.checks : {},
      notes: raw.notes && typeof raw.notes==='object' ? raw.notes : {},
      history: Array.isArray(raw.history) ? raw.history : [],
      finished: !!raw.finished};
  };
  const state = load();
  let canStore = true;
  function save() {
    try { localStorage.setItem(KEY,JSON.stringify(state)); }
    catch (e) { canStore=false; if ($('ladderPrivacy')) $('ladderPrivacy').textContent='Stockage inaccessible : exporte ton bilan pour ne pas le perdre.'; }
  }
  function detailsFor(stage,criterion) {
    if (stage.levelIndex===0) {
      const repere = [
        criterion.base,
        'Je prends conscience de cette difficulté et je l’identifie clairement.',
        'Je choisis une décision simple et réaliste dans ce domaine.',
        'Je fais une première action concrète dans ce domaine.',
        'Je répète mes premiers efforts, même si je reste irrégulier.'
      ][stage.step];
      return {repere,exercise:criterion.n[stage.step]};
    }
    const pair=criterion.tiers[stage.levelIndex-1];
    return {repere:pair[0],exercise:pair[1]+' '+stage.instruction};
  }
  function stageChecked(index) {
    const current=state.checks[String(index)];
    return Array.isArray(current) ? current : [];
  }
  function countChecked(index) { return CRITERIA.filter((c,i)=>stageChecked(index)[i]===true).length; }
  function updateOverview() {
    const current=STAGES[state.current];
    const count=countChecked(state.current);
    $('ladderCurrent').textContent=current.id+' — '+current.name;
    $('ladderNext').textContent=state.finished ? 'Parcours terminé : continue à entretenir tes progrès.' :
      (state.current<24 ? 'Prochaine marche : '+STAGES[state.current+1].id : 'Dernière marche : entretien à long terme');
    $('ladderProgressText').textContent=(state.finished?25:state.current)+'/25 marches validées';
    $('ladderProgressFill').style.width=((state.finished?25:state.current)/25*100)+'%';
    $('ladderCount').textContent=count+'/11 critères accomplis à la marche actuelle';
    $('ladderCountFill').style.width=(count/11*100)+'%';
    $('ladderStatus').textContent=state.finished ? 'Parcours complété — continue sans chercher la perfection.' : '';
  }
  function renderStage() {
    const selected=Number($('ladderStageSelect').value);
    if (!Number.isInteger(selected) || selected<0 || selected>=STAGES.length) return;
    const stage=STAGES[selected];
    const editable=selected===state.current && !state.finished;
    $('ladderStageTitle').textContent=stage.id+' — '+stage.title;
    $('ladderStageAim').textContent=stage.aim;
    $('ladderStageMode').textContent=editable?'Marche active':(selected>state.current?'Aperçu — marche à venir':'Historique — lecture seule');
    $('ladderStageMode').style.background=editable?'#e5f3e8':'#f2efe6';
    const list=$('ladderCriteria');
    list.replaceChildren();
    const checks=stageChecked(selected);
    CRITERIA.forEach((criterion,i)=>{
      const info=detailsFor(stage,criterion);
      const item=document.createElement('details');
      item.className='ladder-item';
      if (editable && i===CRITERIA.findIndex((c,j)=>checks[j]!==true)) item.open=true;
      const summary=document.createElement('summary');
      summary.innerHTML='<span class="ladder-number">'+(i+1)+'</span><span>'+esc(criterion.name)+'</span><span class="ladder-indicator">'+(checks[i]===true?'✓':'○')+'</span>';
      item.appendChild(summary);
      const body=document.createElement('div');body.className='ladder-item-body';
      const marker=document.createElement('p');
      marker.innerHTML='<strong>Repère :</strong> '+esc(info.repere);
      const practice=document.createElement('p');
      practice.innerHTML='<strong>Exercice :</strong> '+esc(info.exercise);
      const ref=document.createElement('p');ref.className='ladder-ref';ref.textContent='Référence biblique : '+criterion.verse;
      const label=document.createElement('label');label.className='ladder-check';
      const box=document.createElement('input');box.type='checkbox';box.checked=checks[i]===true;box.disabled=!editable;
      const labelText=document.createElement('span');labelText.textContent='J’ai réellement pratiqué cet exercice.';
      label.append(box,labelText);
      box.addEventListener('change',()=>{
        const next=stageChecked(selected).slice(0,11);
        next[i]=box.checked;
        state.checks[String(selected)]=next;save();
        summary.querySelector('.ladder-indicator').textContent=box.checked?'✓':'○';
        updateOverview();updateValidation();
      });
      body.append(marker,practice,ref,label);
      item.appendChild(body);list.appendChild(item);
    });
    const note=$('ladderNote');
    note.value=String(state.notes[String(selected)]||'');
    note.disabled=!editable;
    $('ladderNoteHint').textContent=editable?'Tu peux noter ce qui a changé et ce qui reste difficile.':'Cette marche est en lecture seule.';
    $('ladderFinish').hidden=!editable;
    updateOverview();updateValidation();
  }
  function updateValidation() {
    if (state.finished) return;
    const ready=countChecked(state.current)===11;
    $('ladderFinish').disabled=!ready;
    $('ladderFinish').textContent=ready?
      (state.current===24?'Valider E4 et terminer le parcours':'Valider la marche '+STAGES[state.current].id+' et monter') :
      'Encore '+(11-countChecked(state.current))+' exercice(s) à pratiquer';
  }
  function exportProgress() {
    const blob=new Blob([JSON.stringify({format:'Second Cerveau - Échelle personnelle v1',exportedAt:new Date().toISOString(),progress:state},null,2)],
      {type:'application/json'});
    const url=URL.createObjectURL(blob);
    const link=document.createElement('a');link.href=url;link.download='echelle-progression-personnelle.json';
    document.body.appendChild(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function install() {
    if ($('spiritualLadderCard')) return true;
    const combat=$('combatDaysCard');
    if (!combat) return false;
    const style=document.createElement('style');
    style.textContent=[
      '#spiritualLadderCard{margin-top:16px;padding:18px;overflow:hidden}',
      '#spiritualLadderCard .ladder-head{display:flex;gap:14px;align-items:flex-start;justify-content:space-between;flex-wrap:wrap}',
      '#spiritualLadderCard h2{margin:0;font-size:23px;line-height:1.25}',
      '#spiritualLadderCard .ladder-sub{margin:6px 0 0;color:var(--muted,#657365);font-size:13px;line-height:1.55;max-width:750px}',
      '#spiritualLadderCard .ladder-label{font-size:11px;text-transform:uppercase;letter-spacing:.06em;font-weight:900;color:var(--muted,#657365)}',
      '#spiritualLadderCard .ladder-overview{background:var(--soft,#f8f8f3);border:1px solid var(--line,#dbe0d6);padding:14px;border-radius:15px;margin-top:14px}',
      '#spiritualLadderCard .ladder-overview strong{display:block;margin:5px 0;font-size:20px}',
      '#spiritualLadderCard .ladder-muted{color:var(--muted,#657365);font-size:12px;line-height:1.55}',
      '#spiritualLadderCard .ladder-track{height:8px;background:#e5ebe3;border-radius:99px;overflow:hidden;margin:8px 0 5px}',
      '#spiritualLadderCard .ladder-fill{height:100%;width:0;background:#397e63;transition:width .2s}',
      '#spiritualLadderCard .ladder-levels{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px;margin-top:14px}',
      '#spiritualLadderCard .ladder-level{padding:9px 4px;text-align:center;background:#f0f3ee;border-radius:8px;min-width:0}',
      '#spiritualLadderCard .ladder-level strong{font-size:12px;display:block;overflow-wrap:anywhere}',
      '#spiritualLadderCard .ladder-level small{font-size:11px;color:var(--muted,#657365)}',
      '#spiritualLadderCard .ladder-level.active{background:#e1efe4;outline:2px solid #397e63}',
      '#spiritualLadderCard .ladder-section{margin-top:18px}',
      '#spiritualLadderCard .ladder-select{margin-top:6px;display:block;width:100%;max-width:560px;padding:11px 12px;border:1px solid #b9c8b9;border-radius:11px;background:#fff;color:#26362b;font:inherit}',
      '#spiritualLadderCard .ladder-stage-title{font-size:19px;font-weight:900;margin:14px 0 5px}',
      '#spiritualLadderCard .ladder-mode{display:inline-block;padding:5px 9px;border-radius:20px;font-size:11px;font-weight:800;margin-top:8px}',
      '#spiritualLadderCard .ladder-item{border:1px solid var(--line,#dbe0d6);background:#fff;border-radius:12px;margin-top:8px;overflow:hidden}',
      '#spiritualLadderCard .ladder-item summary{list-style:none;display:flex;gap:10px;align-items:center;cursor:pointer;min-height:48px;padding:10px 12px;font-size:13px;font-weight:800}',
      '#spiritualLadderCard .ladder-item summary::-webkit-details-marker{display:none}',
      '#spiritualLadderCard .ladder-item[open]{border-color:#9ebfa5;background:#fbfdfb}',
      '#spiritualLadderCard .ladder-number{flex:0 0 25px;height:25px;line-height:25px;text-align:center;background:#eaf1e9;border-radius:7px;font-size:11px}',
      '#spiritualLadderCard .ladder-indicator{margin-left:auto;color:#378364;font-size:20px}',
      '#spiritualLadderCard .ladder-item-body{border-top:1px solid #e5eae2;padding:4px 13px 14px;font-size:13px;line-height:1.55}',
      '#spiritualLadderCard .ladder-item-body p{margin:9px 0}',
      '#spiritualLadderCard .ladder-ref{color:var(--muted,#657365);font-size:12px}',
      '#spiritualLadderCard .ladder-check{display:flex;align-items:center;gap:10px;margin-top:12px;padding:10px;background:#edf7ee;border-radius:9px;cursor:pointer;font-weight:700}',
      '#spiritualLadderCard .ladder-check input{width:18px;height:18px;accent-color:#398365}',
      '#spiritualLadderCard .ladder-check:has(input:disabled){opacity:.65;cursor:default}',
      '#spiritualLadderCard textarea{width:100%;min-height:84px;resize:vertical;padding:10px 12px;border:1px solid #c7d4c8;border-radius:10px;background:#fff;color:#20251f;font:inherit}',
      '#spiritualLadderCard .ladder-controls{display:flex;gap:9px;flex-wrap:wrap;margin-top:12px}',
      '#spiritualLadderCard .ladder-primary{background:#285c43;color:#fff;border:0;border-radius:11px;font-weight:800;padding:11px 14px;cursor:pointer}',
      '#spiritualLadderCard .ladder-primary:disabled{opacity:.55;cursor:not-allowed}',
      '#spiritualLadderCard .ladder-secondary{border:1px solid #bdcbbd;background:#fff;border-radius:11px;font-weight:700;padding:10px 13px;cursor:pointer}',
      '#spiritualLadderCard .ladder-footer{margin:14px 0 0;border-left:3px solid #658c6a;padding:7px 10px;font-size:12px;color:#536958;line-height:1.6}',
      '@media(max-width:640px){#spiritualLadderCard{padding:13px}#spiritualLadderCard h2{font-size:20px}#spiritualLadderCard .ladder-level strong{font-size:10px}#spiritualLadderCard .ladder-item summary{font-size:12px}}'
    ].join('');
    document.head.appendChild(style);
    const card=document.createElement('section');card.id='spiritualLadderCard';card.className='card section-card';
    card.setAttribute('aria-label','Échelle de progression spirituelle et personnelle');
    card.innerHTML=
      '<div class="ladder-head"><div><h2>Échelle de progression spirituelle et personnelle</h2>'+
      '<p class="ladder-sub">Une grande échelle de 25 marches. À chaque marche, les mêmes 11 critères et un exercice concret pour chacun. Un progrès se construit étape par étape.</p></div></div>'+
      '<div class="ladder-overview"><div class="ladder-label">Marche actuelle</div><strong id="ladderCurrent">N0</strong>'+
      '<div class="ladder-muted" id="ladderNext"></div><div class="ladder-track"><div class="ladder-fill" id="ladderProgressFill"></div></div>'+
      '<div class="ladder-muted" id="ladderProgressText"></div><div class="ladder-levels" id="ladderLevelBars"></div>'+
      '<div style="margin-top:14px" class="ladder-label">Avancement de cette marche</div>'+
      '<div class="ladder-track"><div class="ladder-fill" id="ladderCountFill"></div></div><div class="ladder-muted" id="ladderCount"></div></div>'+
      '<div class="ladder-section"><label class="ladder-label" for="ladderStageSelect">Explorer les marches</label>'+
      '<select id="ladderStageSelect" class="ladder-select"></select><span id="ladderStageMode" class="ladder-mode"></span>'+
      '<div id="ladderStageTitle" class="ladder-stage-title"></div><p id="ladderStageAim" class="ladder-muted"></p>'+
      '<div id="ladderCriteria"></div></div>'+
      '<div class="ladder-section"><label class="ladder-label" for="ladderNote">Mon journal personnel (facultatif)</label>'+
      '<textarea id="ladderNote" placeholder="Qu’ai-je vécu ? Quel pas m’a aidé ?"></textarea>'+
      '<div class="ladder-muted" id="ladderNoteHint"></div></div>'+
      '<div class="ladder-controls"><button type="button" class="ladder-primary" id="ladderFinish"></button>'+
      '<button type="button" class="ladder-secondary" id="ladderExport">Exporter mon suivi (JSON)</button></div>'+
      '<div id="ladderStatus" role="status" class="ladder-muted" style="margin-top:8px"></div>'+
      '<p class="ladder-footer" id="ladderPrivacy">Données privées : ce suivi reste dans le navigateur de cet appareil, hors synchronisation cloud. Exporte-le avant de changer d’appareil ou d’effacer ses données. Les niveaux décrivent tes habitudes, jamais ta valeur devant Jéhovah. Une pause n’efface pas les progrès.</p>';
    combat.insertAdjacentElement('afterend',card);
    const select=$('ladderStageSelect');
    STAGES.forEach((stage,index)=>{
      const option=document.createElement('option');
      option.value=String(index);option.textContent=stage.id+' — '+stage.name+' · '+stage.title;
      select.appendChild(option);
    });
    const bars=$('ladderLevelBars');
    LEVELS.forEach((level,index)=>{
      const b=document.createElement('div');b.className='ladder-level'+(index===Math.floor(state.current/5)?' active':'');
      b.innerHTML='<strong>'+esc(level.name)+'</strong><small>'+level.id+'0–'+level.id+'4</small>';
      bars.appendChild(b);
    });
    select.value=String(state.current);
    select.addEventListener('change',renderStage);
    $('ladderNote').addEventListener('input',(event)=>{
      if(Number(select.value)!==state.current||state.finished)return;
      state.notes[String(state.current)]=event.target.value.slice(0,6000);save();
    });
    $('ladderFinish').addEventListener('click',()=>{
      if(state.finished||Number(select.value)!==state.current||countChecked(state.current)!==11)return;
      const stage=STAGES[state.current];
      state.history.push({stage:stage.id,at:new Date().toISOString()});
      if(state.current===24)state.finished=true;
      else state.current++;
      save();
      select.value=String(state.current);
      [...bars.children].forEach((b,i)=>b.classList.toggle('active',i===Math.floor(state.current/5)));
      renderStage();
      $('ladderStatus').textContent='Marche '+stage.id+' validée volontairement. Tu peux avancer à ton rythme.';
      card.scrollIntoView({behavior:'smooth',block:'start'});
    });
    $('ladderExport').addEventListener('click',exportProgress);
    renderStage();
    if (!canStore) $('ladderPrivacy').textContent='Le stockage local est inaccessible. Exporte régulièrement tes données.';
    return true;
  }
  function start() {
    if (install()) return;
    const watch=new MutationObserver(()=>{
      if (install())watch.disconnect();
    });
    watch.observe(document.body,{childList:true,subtree:true});
    setTimeout(()=>watch.disconnect(),20000);
  }
  if (document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();