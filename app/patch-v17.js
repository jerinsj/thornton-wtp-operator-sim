function patchSimulatorSourceV17(source){
  source=source
    .replace(/Thornton WTP Operator Simulator V16[^<\n]*/g,'Thornton WTP Operator Simulator V17 — Reliable Home Controls')
    .replace('THORNTON WTP // OPERATOR SIM V16','THORNTON WTP // OPERATOR SIM V17')
    .replace('<div class="v16-photo"><img id="v16Photo" alt="Thornton Water Treatment Plant site view"></div>','');

  const css=`
  /* V17 reliable home screen */
  .v16-home{
    background:
      linear-gradient(180deg,rgba(7,11,14,.58),rgba(7,11,14,.86)),
      url('https://www.thorntonco.gov/sites/default/files/styles/16_9/public/2024-06/twtp.jpg?h=1db926b0&itok=vTQjzoNT') center center / cover no-repeat fixed !important;
  }
  .v16-photo{display:none!important}
  .v16-panel{
    width:min(1040px,94vw)!important;
    grid-template-columns:1fr!important;
    background:rgba(17,23,28,.90)!important;
    border:1px solid rgba(122,151,169,.42)!important;
    backdrop-filter:blur(12px);
    box-shadow:0 24px 70px rgba(0,0,0,.55)!important;
  }
  .v16-copy{padding:34px!important}
  .v16-copy h1{font-size:38px!important;margin:8px 0 10px!important}
  .v16-copy p{max-width:850px;color:#c2ccd3!important}
  .v16-actions .btn{min-height:50px;font-size:14px}
  .v16-scen.show{margin-top:10px}
  .v17-home-status{margin-top:10px;padding:9px 11px;border:1px solid #34414b;border-radius:9px;background:rgba(10,15,19,.72);color:#aab9c3;font-size:11px}
  .v17-home-status b{color:#eef4f7}
  @media(max-width:850px){.v16-copy{padding:20px!important}.v16-copy h1{font-size:30px!important}}
  `;
  source=source.replace('</style>',css+'\n</style>');

  const runtime=`
  (function(){
    const SAVE_KEY='thorntonWtpV17Save';
    const AUTO_SAVE_MS=4000;

    function el(id){return document.getElementById(id)}
    function logSafe(msg){try{if(typeof log==='function')log(msg)}catch(e){}}
    function renderSafe(){try{if(typeof render==='function')render()}catch(e){}try{if(typeof renderAlarms==='function')renderAlarms()}catch(e){}}

    function snapshot(){
      const controlValues={};
      try{Object.keys(controls).forEach(k=>{const c=controls[k];if(c&&'value' in c)controlValues[k]=c.value})}catch(e){}
      const alarms=[];try{activeAlarms.forEach((v,k)=>alarms.push([k,v]))}catch(e){}
      const tasks=[];try{ROUTINE_TASKS.forEach(t=>tasks.push({id:t.id,completed:t.completed,completedAt:t.completedAt,overdueHits:t.overdueHits,finding:t.finding}))}catch(e){}
      return {savedAt:Date.now(),state:JSON.parse(JSON.stringify(state)),controls:controlValues,alarms,tasks};
    }

    function saveShift(){
      try{
        if(state.homePaused||state.ended)return;
        localStorage.setItem(SAVE_KEY,JSON.stringify(snapshot()));
        updateResumeButton();
      }catch(e){console.warn('Shift save failed',e)}
    }

    function restoreShift(){
      try{
        const raw=localStorage.getItem(SAVE_KEY);if(!raw)return false;
        const saved=JSON.parse(raw);if(!saved||!saved.state)return false;
        Object.assign(state,saved.state);
        if(saved.controls){Object.entries(saved.controls).forEach(([k,v])=>{if(controls[k])controls[k].value=v})}
        try{activeAlarms.clear();(saved.alarms||[]).forEach(([k,v])=>activeAlarms.set(k,v))}catch(e){}
        try{(saved.tasks||[]).forEach(st=>{const t=ROUTINE_TASKS.find(x=>x.id===st.id);if(t)Object.assign(t,st)})}catch(e){}
        state.homePaused=false;
        hideHome();
        try{if(typeof setPage==='function')setPage('overview')}catch(e){}
        renderSafe();
        logSafe('Saved shift resumed from browser storage.');
        return true;
      }catch(e){console.warn('Resume failed',e);return false}
    }

    function hideHome(){const h=el('v16Home');if(h)h.classList.add('hidden')}
    function showStatus(text){
      let s=el('v17HomeStatus');
      if(!s){s=document.createElement('div');s.id='v17HomeStatus';s.className='v17-home-status';const copy=document.querySelector('.v16-copy');if(copy)copy.appendChild(s)}
      if(s)s.innerHTML=text;
    }
    function updateResumeButton(){
      const b=el('v16Resume');if(!b)return;
      const has=!!localStorage.getItem(SAVE_KEY);
      b.disabled=!has;b.title=has?'Resume the last browser-saved shift':'No saved V17 shift is available yet';
    }

    function startNewShift(){
      try{localStorage.removeItem(SAVE_KEY)}catch(e){}
      state.homePaused=false;
      hideHome();
      try{if(typeof setPage==='function')setPage('overview')}catch(e){}
      renderSafe();
      logSafe('New randomized shift entered from Home screen.');
      setTimeout(saveShift,500);
    }

    function scenarioIds(kind){
      const sets={
        source:['storm','odor','sourcepump','coagfeed','sludge','analyzer'],
        chemical:['clfeed','coagfeed','analyzer','ozfault','inventory','power'],
        filter:['filterbreak','sludge','scadacomm','power','coagfeed'],
        distribution:['demand','fireflow','mainbreak','pumptrip','prvfault'],
        pfas:['pfashl','pfasbreak','pfasload','analyzer','power']
      };
      return sets[kind]||null;
    }

    function startScenario(kind){
      if(kind==='random'){startNewShift();return}
      try{localStorage.removeItem(SAVE_KEY)}catch(e){}
      const ids=scenarioIds(kind);
      if(ids){state.shiftIssueIds=[...ids];state.shiftIssueRemaining=[...ids]}
      state.event=null;state.eventMeta=null;state.eventResponded=false;state.eventTimer=0;state.eventPump=null;state.eventZone=null;state.eventFilter=null;
      try{if(typeof clearAlarm==='function')clearAlarm('event',true)}catch(e){}
      if(kind==='source'){
        state.rawTurb=Math.max(state.rawTurb,6.2);state.rawTOC=Math.max(state.rawTOC,3.5);
        if(state.shiftProfile)state.shiftProfile.name='Source-water challenge';
      }
      if(kind==='chemical'){
        if(state.shiftProfile)state.shiftProfile.name='Chemical / analyzer challenge';
      }
      if(kind==='filter'){
        const f=[...state.filters].sort((a,b)=>b.run-a.run)[0];if(f){f.run=Math.max(f.run,250);f.head=Math.max(f.head,7.0)}
        if(state.shiftProfile)state.shiftProfile.name='Filter / backwash challenge';
      }
      if(kind==='distribution'){
        state.cityDemand=Math.max(state.cityDemand,34);const t=[...state.tanks].sort((a,b)=>a.level-b.level)[0];if(t)t.level=Math.min(t.level,43);
        if(state.shiftProfile)state.shiftProfile.name='Distribution challenge';
      }
      if(kind==='pfas'){
        state.pfas.mediaRemaining=Math.min(state.pfas.mediaRemaining,.30);state.pfas.headloss=Math.max(state.pfas.headloss,3.5);
        if(state.shiftProfile)state.shiftProfile.name='PFAS GAC challenge';
      }
      state.homePaused=false;hideHome();
      try{if(typeof setPage==='function')setPage(kind==='pfas'?'pfas':'overview')}catch(e){}
      try{if(typeof triggerEvent==='function')triggerEvent()}catch(e){}
      renderSafe();logSafe('Training scenario started: '+kind+'.');setTimeout(saveShift,500);
    }

    function toggleScenario(){const p=el('v16Scen');if(p)p.classList.toggle('show')}

    function cleanClone(id){
      const old=el(id);if(!old)return null;
      const n=old.cloneNode(true);old.replaceWith(n);return n;
    }

    function bindHome(){
      const start=cleanClone('v16Start'),resume=cleanClone('v16Resume'),scen=cleanClone('v16Scenario');
      if(start)start.onclick=(e)=>{e.preventDefault();startNewShift()};
      if(resume)resume.onclick=(e)=>{e.preventDefault();if(!restoreShift())showStatus('<b>No saved shift found.</b> Start a new shift first; V17 saves automatically while you play.')};
      if(scen)scen.onclick=(e)=>{e.preventDefault();toggleScenario()};
      document.querySelectorAll('[data-v16s]').forEach(old=>{
        const n=old.cloneNode(true);old.replaceWith(n);n.onclick=(e)=>{e.preventDefault();startScenario(n.dataset.v16s)};
      });
      updateResumeButton();
      showStatus(localStorage.getItem(SAVE_KEY)?'<b>Saved shift available.</b> Resume will restore your last V17 browser save.':'<b>No saved shift yet.</b> Start New Shift or choose a Scenario. The game will autosave while you play.');
    }

    window.v17StartNewShift=startNewShift;
    window.v17ResumeShift=restoreShift;
    window.v17StartScenario=startScenario;
    window.v17SaveShift=saveShift;

    state.homePaused=true;
    setTimeout(bindHome,0);
    setInterval(saveShift,AUTO_SAVE_MS);
    window.addEventListener('beforeunload',saveShift);
  })();
  `;

  source=source.replace('</body>','<script>'+runtime+'<\/script></body>');
  return source;
}
