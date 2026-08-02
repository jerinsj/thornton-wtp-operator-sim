/* Thornton WTP Operator Simulator V11 — randomized shift patch.
   Training fiction: random values and incident frequencies are not City of Thornton operating data. */
(() => {
  const ALL_ISSUE_IDS=[
    'storm','odor','ozfault','clfeed','coagfeed','analyzer','filterbreak','sludge','sourcepump','scadacomm','inventory',
    'pfashl','pfasbreak','pfasload','demand','fireflow','mainbreak','pumptrip','prvfault','power'
  ];
  const ISSUE_GROUPS={
    process:['storm','odor','coagfeed','filterbreak','sludge','sourcepump'],
    equipment:['ozfault','clfeed','analyzer','scadacomm','inventory','power'],
    distribution:['demand','fireflow','mainbreak','pumptrip','prvfault'],
    pfas:['pfashl','pfasbreak','pfasload']
  };
  const rnd=(a,b)=>a+Math.random()*(b-a);
  const rndInt=(a,b)=>Math.floor(rnd(a,b+1));
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const shuffle=a=>{
    const x=[...a];
    for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]];}
    return x;
  };

  function selectShiftIssues(){
    const ids=[];
    const take=(group,n)=>shuffle(ISSUE_GROUPS[group]).slice(0,n).forEach(x=>{if(!ids.includes(x))ids.push(x);});
    take('process',rndInt(2,3));
    take('equipment',rndInt(2,3));
    take('distribution',rndInt(2,3));
    take('pfas',rndInt(1,2));
    const target=rndInt(8,11);
    shuffle(ALL_ISSUE_IDS).forEach(x=>{if(ids.length<target&&!ids.includes(x))ids.push(x);});
    state.shiftIssueIds=shuffle(ids);
    state.shiftIssueRemaining=[...state.shiftIssueIds];
  }

  function installHandoffPanel(){
    if(document.getElementById('shiftProfileName'))return;
    const overview=document.querySelector('.scada-page[data-page-id="overview"]');
    const quick=overview?.querySelector('.quicklook');
    if(!quick)return;
    const wrap=document.createElement('div');
    wrap.className='shift-handoff card';
    wrap.innerHTML=`<div class="handoff-head"><div><small>RANDOMIZED SHIFT HANDOFF</small><b id="shiftProfileName">Loading shift profile…</b></div><span id="shiftIssueCount">—</span></div>
      <div class="handoff-grid">
        <div><small>Starting condition</small><b id="shiftCondition">—</b></div>
        <div><small>Source / production</small><b id="shiftSource">—</b></div>
        <div><small>Storage / distribution</small><b id="shiftStorage">—</b></div>
        <div><small>Filter situation</small><b id="shiftFilters">—</b></div>
      </div>
      <div class="page-inline-note" id="shiftHandoffNote">Each reload creates a different shift profile. Not every shift begins perfectly.</div>`;
    quick.insertAdjacentElement('afterend',wrap);
    const s=document.createElement('style');
    s.textContent=`.shift-handoff{margin-top:12px;overflow:hidden}.handoff-head{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:11px 13px;border-bottom:1px solid #294963;background:#0b1d2c}.handoff-head small{display:block;color:#7598ad;font-size:8px;letter-spacing:.8px}.handoff-head b{display:block;font-size:13px;margin-top:2px}.handoff-head span{font-size:9px;color:#c5eaff;border:1px solid #35617e;background:#102a40;border-radius:99px;padding:4px 8px}.handoff-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;padding:11px 13px}.handoff-grid>div{background:#091927;border:1px solid #294963;border-radius:8px;padding:8px}.handoff-grid small{display:block;color:#708da1;font-size:8px}.handoff-grid b{display:block;font-size:10px;margin-top:3px;line-height:1.35}@media(max-width:850px){.handoff-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:560px){.handoff-grid{grid-template-columns:1fr}}`;
    document.head.appendChild(s);
  }

  function initializeRandomShift(){
    const profiles=[
      ['Routine summer day','Normal demand with ordinary operating variability.'],
      ['Warm high-demand day','Storage and distribution demand require closer attention.'],
      ['Changing source-water day','Source blend and raw-water conditions are less settled than usual.'],
      ['Maintenance-heavy handoff','Several routine equipment observations need follow-up.'],
      ['Recovery shift','The prior shift left the plant stable but not fully normalized.'],
      ['Quiet-looking shift','Conditions begin mostly stable, but the incident set is still randomized.']
    ];
    const p=pick(profiles);
    state.shiftProfile={name:p[0],description:p[1]};
    state.shiftStartingNotes=[];
    selectShiftIssues();

    controls.flow.value=(Math.round(rnd(11.5,17.5)*2)/2).toFixed(1);
    controls.blend.value=Math.round(rnd(42,82));
    controls.coag.value=(Math.round(rnd(14,22)*2)/2).toFixed(1);
    controls.ozone.value=(Math.round(rnd(.9,1.9)*10)/10).toFixed(1);
    controls.chlorine.value=(Math.round(rnd(2.2,3.3)*10)/10).toFixed(1);
    controls.ammonia.value=(Math.round(rnd(.35,.65)*100)/100).toFixed(2);
    controls.ph.value=(Math.round(rnd(7.8,8.5)*10)/10).toFixed(1);

    state.rawTurb=rnd(2.0,5.8);
    state.rawTOC=rnd(2.5,4.0);
    state.odor=rnd(.7,1.4);
    state.settled=rnd(.34,.78);
    state.filtered=rnd(.045,.095);
    state.finishCl=rnd(1.55,2.85);
    state.finishPH=rnd(7.75,8.55);
    state.otherSupply=rnd(14,22);
    state.cityDemand=rnd(27,35);
    state.demand=state.cityDemand;
    state.bwBasin=rnd(.62,.96);
    state.bwMakeupMGD=0;

    state.tanks.forEach(t=>t.level=rnd(48,82));
    if(Math.random()<.35){
      const t=pick(state.tanks);t.level=rnd(38,47);
      state.shiftStartingNotes.push(`${t.id} begins lower than the other storage tanks.`);
    }
    state.zones.forEach(z=>z.pressure=z.base+rnd(-4,3));

    const ages=shuffle([rnd(12,55),rnd(55,100),rnd(95,145),rnd(140,195),rnd(190,240),rnd(235,282)]);
    state.filters.forEach((f,i)=>{
      f.run=ages[i];
      f.head=2.0+f.run/58+rnd(-.25,.45);
      f.turb=.038+Math.max(0,f.run-120)*.00013+rnd(.002,.014);
      f.status='RUN';f.bw=0;
    });

    state.pfas.headloss=rnd(1.8,3.4);
    state.pfas.mediaRemaining=rnd(.34,.84);
    state.pfas.sampleAgeDays=rndInt(2,16);
    state.pfas.labPFOA=rnd(.15,.75);
    state.pfas.labPFOS=rnd(.10,.65);

    const inherited=shuffle(['filter','bwbasin','chlorine','raw','storage','pfas','none']);
    const count=Math.random()<.18?0:(Math.random()<.30?2:1);
    for(let n=0;n<count;n++){
      const issue=inherited[n];
      if(issue==='filter'){
        const f=pick(state.filters);f.run=rnd(246,284);f.head=rnd(6.9,8.2);f.turb=rnd(.070,.105);
        state.shiftStartingNotes.push(`Filter ${f.id} is already in REVIEW territory at turnover.`);
      }else if(issue==='bwbasin'){
        state.bwBasin=rnd(.54,.70);
        state.shiftStartingNotes.push('Backwash supply basin is still recovering from prior activity.');
      }else if(issue==='chlorine'){
        state.finishCl=rnd(1.18,1.45);
        state.shiftStartingNotes.push('Finished disinfectant residual starts near the low side of the game operating range.');
      }else if(issue==='raw'){
        state.rawTurb=rnd(5.8,8.8);
        state.shiftStartingNotes.push('Raw-water turbidity is elevated at shift change.');
      }else if(issue==='storage'){
        const t=pick(state.tanks);t.level=rnd(36,44);
        state.shiftStartingNotes.push(`${t.id} begins with reduced storage.`);
      }else if(issue==='pfas'){
        state.pfas.mediaRemaining=rnd(.23,.34);
        state.shiftStartingNotes.push('Future-state PFAS GAC media service begins in WATCH territory.');
      }
    }
    if(!state.shiftStartingNotes.length)state.shiftStartingNotes.push('No significant inherited abnormality; normal process variability still applies.');

    let total=0;
    state.tanks.forEach(t=>total+=t.cap*t.level/100);
    state.storageMG=total;
    state.historyT=[state.filtered,state.filtered];
    state.historyC=[state.finishCl,state.finishCl];
  }

  function renderShiftHandoff(){
    if(!state.shiftProfile)return;
    document.getElementById('shiftProfileName').textContent=state.shiftProfile.name;
    document.getElementById('shiftIssueCount').textContent=`${state.shiftIssueIds.length} POSSIBLE INCIDENT TYPES`;
    const condition=state.shiftStartingNotes.length>1?'MULTIPLE HANDOFF ITEMS':state.shiftStartingNotes[0].startsWith('No significant')?'MOSTLY STABLE':'IMPERFECT HANDOFF';
    document.getElementById('shiftCondition').textContent=condition;
    document.getElementById('shiftSource').textContent=`Raw ${state.rawTurb.toFixed(1)} NTU · Flow ${(+controls.flow.value).toFixed(1)} MGD · Blend ${controls.blend.value}%`;
    const lowTank=[...state.tanks].sort((a,b)=>a.level-b.level)[0];
    const lowZone=[...state.zones].sort((a,b)=>a.pressure-b.pressure)[0];
    document.getElementById('shiftStorage').textContent=`Low ${lowTank.id} ${lowTank.level.toFixed(0)}% · Z${lowZone.id} ${lowZone.pressure.toFixed(0)} psi`;
    const attention=[...state.filters].sort((a,b)=>(b.run+b.head*18+b.turb*300)-(a.run+a.head*18+a.turb*300))[0];
    document.getElementById('shiftFilters').textContent=`F${attention.id}: ${attention.run.toFixed(0)} hr · ${attention.head.toFixed(1)} ft · ${attention.turb.toFixed(3)} NTU`;
    document.getElementById('shiftHandoffNote').textContent=state.shiftStartingNotes.join(' ');
  }

  // Wrap the existing V10 incident generator. Its incident catalog is in the same
  // order as ALL_ISSUE_IDS; only the first Math.random call is steered so the
  // rest of the event still randomizes its affected pump/zone normally.
  const v10TriggerEvent=triggerEvent;
  triggerEvent=function(){
    if(state.event||!state.shiftIssueRemaining?.length)return;
    const id=pick(state.shiftIssueRemaining);
    const index=ALL_ISSUE_IDS.indexOf(id);
    if(index<0)return;
    const realRandom=Math.random;
    let first=true;
    Math.random=()=>{
      if(first){first=false;return (index+.25)/ALL_ISSUE_IDS.length;}
      return realRandom();
    };
    try{v10TriggerEvent();}
    finally{Math.random=realRandom;}
    if(state.event===id)state.shiftIssueRemaining=state.shiftIssueRemaining.filter(x=>x!==id);
  };

  // Reset the just-loaded V10 baseline into a randomized turnover.
  activeAlarms.clear();
  state.unresolved=0;
  state.event=null;state.eventTimer=0;state.eventPump=null;state.eventZone=null;state.eventFilter=null;state.eventMeta=null;state.eventResponded=false;
  state.minute=0;state.ended=false;state.bwCount=0;
  state.bwSeq={active:false,filterId:null,step:0,stepElapsed:0,totalElapsed:0,paused:false,fault:null,faultAtStep:null,faultInjected:false};
  ROUTINE_TASKS.forEach(t=>{t.completed=false;t.completedAt=null;t.overdueHits=0;t.finding=null;});
  initializeRandomShift();
  installHandoffPanel();

  document.title='Thornton WTP Operator Simulator V11 — Randomized Shifts';
  const brand=document.querySelector('.brand');
  if(brand&&brand.childNodes.length)brand.childNodes[0].nodeValue='THORNTON WTP // OPERATOR SIM V11';
  const footer=document.querySelector('.footer');
  if(footer)footer.textContent='Thornton WTP Operator Simulator V11 · SCADA-style training fiction. Each 12-hour shift begins with randomized operating conditions and a shift-specific incident pool. Exact Thornton operating conditions, alarm frequencies, setpoints and SOPs are not reproduced.';

  const logBox=document.getElementById('log');
  if(logBox)logBox.innerHTML='';
  log(`Oncoming shift started — ${state.shiftProfile.name}. Review prior-shift turnover, alarms and operating status.`);
  log(`Shift-specific incident pool loaded: ${state.shiftIssueIds.length} possible incident types for this shift.`);
  state.shiftStartingNotes.forEach(n=>log('Handoff: '+n));
  log('Routine workload, treatment, distribution, PFAS and detailed filter-backwash simulation are active.');

  if(Math.random()<.28){
    triggerEvent();
    if(state.eventMeta)log('Turnover includes an active incident: '+state.eventMeta.name+'.');
  }
  render();
  renderShiftHandoff();
})();
