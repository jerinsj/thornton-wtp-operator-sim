function patchSimulatorSourceV16Controls(source){
  source=source
    .replace(/Thornton WTP Operator Simulator V16[^<\n]*/g,'Thornton WTP Operator Simulator V16.1 — Working Home Controls')
    .replace('THORNTON WTP // OPERATOR SIM V16','THORNTON WTP // OPERATOR SIM V16.1');

  const css=`
  .v161-status{margin-top:10px;padding:9px 11px;border:1px solid #34414b;border-radius:9px;background:rgba(10,15,19,.78);color:#aab9c3;font-size:11px;line-height:1.4}
  .v161-status b{color:#eef4f7}
  .v16-actions .btn:disabled{opacity:.45;cursor:not-allowed}
  `;
  source=source.replace('</style>',css+'\n</style>');

  const runtime=`

  // V16.1 reliable Home controls — deliberately inside the main simulator IIFE.
  const V161_SAVE='thorntonWtpV16StableSave';
  const V161_LEGACY_SAVE='thorntonWtpV16Save';

  function v161SavedRaw(){
    try{return localStorage.getItem(V161_SAVE)||localStorage.getItem(V161_LEGACY_SAVE)}catch(e){return null}
  }
  function v161Status(text){
    let s=$('v161Status');
    if(!s){s=document.createElement('div');s.id='v161Status';s.className='v161-status';const c=document.querySelector('.v16-copy');if(c)c.appendChild(s)}
    if(s)s.innerHTML=text;
  }
  function v161HideHome(){const h=$('v16Home');if(h)h.classList.add('hidden')}
  function v161Snapshot(){
    const controlValues={};
    Object.keys(controls).forEach(k=>{const c=controls[k];if(c&&'value' in c)controlValues[k]=c.value});
    const alarms=[];activeAlarms.forEach((v,k)=>alarms.push([k,v]));
    const tasks=ROUTINE_TASKS.map(t=>({id:t.id,completed:t.completed,completedAt:t.completedAt,overdueHits:t.overdueHits,finding:t.finding}));
    return {version:'16.1',savedAt:Date.now(),state:JSON.parse(JSON.stringify(state)),controls:controlValues,alarms,tasks};
  }
  function v161Save(){
    try{
      if(state.homePaused||state.ended)return;
      localStorage.setItem(V161_SAVE,JSON.stringify(v161Snapshot()));
      v161UpdateResume();
    }catch(e){console.warn('V16.1 autosave failed',e)}
  }
  function v161ResetTasks(){ROUTINE_TASKS.forEach(t=>{t.completed=false;t.completedAt=null;t.overdueHits=0;t.finding=null})}
  function v161FreshState(){
    activeAlarms.clear();v161ResetTasks();
    state.minute=0;state.score=0;state.quality=100;state.efficiency=100;state.response=100;state.distribution=100;state.routineScore=100;state.sampleCount=0;
    state.ended=false;state.event=null;state.eventMeta=null;state.eventResponded=false;state.eventTimer=0;state.eventPump=null;state.eventZone=null;state.eventFilter=null;
    state.unresolved=0;state.jarBonus=0;state.bwCount=0;state.prv.abnormal=0;
    state.bwSeq={active:false,filterId:null,step:0,stepElapsed:0,totalElapsed:0,paused:false,fault:null,faultAtStep:null,faultInjected:false};
    state.pumps.forEach(p=>{p.trip=false;p.mode='AUTO'});
    initializeRandomShift();
  }
  function v161Enter(page='overview'){
    state.homePaused=false;v161HideHome();setPage(page);render();
    log('Entered operator simulation from Home screen.');
    setTimeout(v161Save,300);
  }
  function v161StartNew(){
    try{localStorage.removeItem(V161_SAVE);localStorage.removeItem(V161_LEGACY_SAVE)}catch(e){}
    v161FreshState();v161Enter('overview');
    log('Started a new randomized shift.');
  }
  function v161Restore(saved){
    const ss=saved&&saved.state?saved.state:saved;
    if(!ss||typeof ss!=='object')return false;
    Object.assign(state,ss);
    if(saved.controls)Object.entries(saved.controls).forEach(([k,v])=>{if(controls[k])controls[k].value=v});
    activeAlarms.clear();(saved.alarms||[]).forEach(([k,v])=>activeAlarms.set(k,v));
    (saved.tasks||[]).forEach(st=>{const t=ROUTINE_TASKS.find(x=>x.id===st.id);if(t)Object.assign(t,st)});
    state.homePaused=false;return true;
  }
  function v161Resume(){
    try{
      const raw=v161SavedRaw();
      if(!raw){v161Status('<b>No saved shift found.</b> Start a shift first; V16.1 autosaves every 5 seconds.');return}
      if(!v161Restore(JSON.parse(raw)))throw new Error('Incompatible save');
      v161HideHome();setPage('overview');render();log('Resumed saved shift from browser storage.');
    }catch(e){console.error(e);v161Status('<b>Resume failed.</b> Start a new shift to create a fresh compatible save.')}
  }
  function v161ScenarioPool(kind){
    const pools={
      source:['storm','odor','sourcepump','coagfeed','sludge','analyzer'],
      chemical:['clfeed','coagfeed','analyzer','ozfault','inventory','power'],
      filter:['filterbreak','sludge','scadacomm','power','coagfeed'],
      distribution:['demand','fireflow','mainbreak','pumptrip','prvfault'],
      pfas:['pfashl','pfasbreak','pfasload','analyzer','power']
    };
    return pools[kind]||null;
  }
  function v161StartScenario(kind){
    if(kind==='random'){v161StartNew();return}
    try{localStorage.removeItem(V161_SAVE);localStorage.removeItem(V161_LEGACY_SAVE)}catch(e){}
    v161FreshState();
    const ids=v161ScenarioPool(kind);if(ids){state.shiftIssueIds=[...ids];state.shiftIssueRemaining=[...ids]}
    if(kind==='source'){
      state.rawTurb=Math.max(state.rawTurb,6.2);state.rawTOC=Math.max(state.rawTOC,3.5);if(state.shiftProfile)state.shiftProfile.name='Source-water challenge';
    }else if(kind==='chemical'){
      if(state.shiftProfile)state.shiftProfile.name='Chemical / analyzer challenge';
    }else if(kind==='filter'){
      const f=[...state.filters].sort((a,b)=>b.run-a.run)[0];if(f){f.run=Math.max(f.run,250);f.head=Math.max(f.head,7.0);f.turb=Math.max(f.turb,.075)};if(state.shiftProfile)state.shiftProfile.name='Filter / backwash challenge';
    }else if(kind==='distribution'){
      state.cityDemand=Math.max(state.cityDemand,34);const t=[...state.tanks].sort((a,b)=>a.level-b.level)[0];if(t)t.level=Math.min(t.level,43);if(state.shiftProfile)state.shiftProfile.name='Distribution challenge';
    }else if(kind==='pfas'){
      state.pfas.mediaRemaining=Math.min(state.pfas.mediaRemaining,.30);state.pfas.headloss=Math.max(state.pfas.headloss,3.5);if(state.shiftProfile)state.shiftProfile.name='PFAS GAC challenge';
    }
    v161Enter(kind==='pfas'?'pfas':'overview');
    triggerEvent();render();log('Started training scenario: '+kind+'.');
  }
  function v161ToggleScenarios(){const p=$('v16Scen');if(p)p.classList.toggle('show')}
  function v161Clone(id){const old=$(id);if(!old)return null;const n=old.cloneNode(true);old.replaceWith(n);return n}
  function v161UpdateResume(){const b=$('v16Resume');if(b){const has=!!v161SavedRaw();b.disabled=!has;b.title=has?'Resume the last saved shift':'No saved shift is available yet'}}
  function v161BindHome(){
    const start=v161Clone('v16Start'),resume=v161Clone('v16Resume'),scenario=v161Clone('v16Scenario');
    if(start)start.onclick=e=>{e.preventDefault();v161StartNew()};
    if(resume)resume.onclick=e=>{e.preventDefault();v161Resume()};
    if(scenario)scenario.onclick=e=>{e.preventDefault();v161ToggleScenarios()};
    document.querySelectorAll('[data-v16s]').forEach(old=>{const n=old.cloneNode(true);old.replaceWith(n);n.onclick=e=>{e.preventDefault();v161StartScenario(n.dataset.v16s)}});
    v161UpdateResume();
    v161Status(v161SavedRaw()?'<b>Saved shift available.</b> Resume will restore the last saved shift.':'<b>No saved shift yet.</b> Start New Shift or choose Scenario. Autosave begins once the shift starts.');
  }
  state.homePaused=true;
  setTimeout(v161BindHome,100);
  setTimeout(v161BindHome,700);
  setInterval(v161Save,5000);
  window.addEventListener('beforeunload',v161Save);
  `;

  const marker='\n})();';
  const pos=source.lastIndexOf(marker);
  if(pos<0)throw new Error('V16.1 could not locate the simulator IIFE closing marker.');
  source=source.slice(0,pos)+runtime+source.slice(pos);
  return source;
}
