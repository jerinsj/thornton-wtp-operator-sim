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
  (function(){
    const SAVE_KEY='thorntonWtpV16StableSave';
    const LEGACY_KEY='thorntonWtpV16Save';
    const AUTOSAVE_MS=5000;

    function byId(id){return document.getElementById(id)}
    function safeLog(msg){try{if(typeof log==='function')log(msg)}catch(e){}}
    function safeRender(){
      try{if(typeof render==='function')render()}catch(e){}
      try{if(typeof renderAlarms==='function')renderAlarms()}catch(e){}
      try{if(typeof renderRoutineTasks==='function')renderRoutineTasks()}catch(e){}
      try{if(typeof updateScadaChrome==='function')updateScadaChrome()}catch(e){}
    }
    function hideHome(){const h=byId('v16Home');if(h)h.classList.add('hidden')}

    function getSavedRaw(){
      return localStorage.getItem(SAVE_KEY)||localStorage.getItem(LEGACY_KEY);
    }

    function status(text){
      let s=byId('v161Status');
      if(!s){
        s=document.createElement('div');
        s.id='v161Status';
        s.className='v161-status';
        const copy=document.querySelector('.v16-copy');
        if(copy)copy.appendChild(s);
      }
      if(s)s.innerHTML=text;
    }

    function snapshot(){
      const controlValues={};
      try{Object.keys(controls).forEach(k=>{const c=controls[k];if(c&&'value' in c)controlValues[k]=c.value})}catch(e){}
      const alarms=[];
      try{activeAlarms.forEach((v,k)=>alarms.push([k,v]))}catch(e){}
      const tasks=[];
      try{ROUTINE_TASKS.forEach(t=>tasks.push({id:t.id,completed:t.completed,completedAt:t.completedAt,overdueHits:t.overdueHits,finding:t.finding}))}catch(e){}
      return {version:'16.1',savedAt:Date.now(),state:JSON.parse(JSON.stringify(state)),controls:controlValues,alarms,tasks};
    }

    function saveShift(){
      try{
        if(!state||state.homePaused||state.ended)return;
        localStorage.setItem(SAVE_KEY,JSON.stringify(snapshot()));
        updateResumeButton();
      }catch(e){console.warn('V16.1 autosave failed',e)}
    }

    function resetRoutineTasks(){
      try{ROUTINE_TASKS.forEach(t=>{t.completed=false;t.completedAt=null;t.overdueHits=0;t.finding=null})}catch(e){}
    }

    function resetForFreshShift(){
      try{activeAlarms.clear()}catch(e){}
      resetRoutineTasks();
      try{
        state.minute=0;state.score=0;state.quality=100;state.efficiency=100;state.response=100;state.distribution=100;state.routineScore=100;state.sampleCount=0;
        state.ended=false;state.event=null;state.eventMeta=null;state.eventResponded=false;state.eventTimer=0;state.eventPump=null;state.eventZone=null;state.eventFilter=null;
        state.unresolved=0;state.jarBonus=0;state.bwCount=0;state.prv.abnormal=0;
        if(state.bwSeq)state.bwSeq={active:false,filterId:null,step:0,stepElapsed:0,totalElapsed:0,paused:false,fault:null,faultAtStep:null,faultInjected:false};
        if(Array.isArray(state.pumps))state.pumps.forEach(p=>{p.trip=false;p.mode='AUTO'});
        if(typeof initializeRandomShift==='function')initializeRandomShift();
      }catch(e){console.error('Fresh shift reset failed',e)}
    }

    function enterShift(page){
      state.homePaused=false;
      hideHome();
      try{if(typeof setPage==='function')setPage(page||'overview')}catch(e){}
      safeRender();
      setTimeout(saveShift,250);
    }

    function startNewShift(){
      try{localStorage.removeItem(SAVE_KEY);localStorage.removeItem(LEGACY_KEY)}catch(e){}
      resetForFreshShift();
      enterShift('overview');
      safeLog('Started a new randomized shift from the Home screen.');
    }

    function applySaved(saved){
      const savedState=saved&&saved.state?saved.state:saved;
      if(!savedState||typeof savedState!=='object')return false;
      Object.assign(state,savedState);
      try{
        if(saved.controls)Object.entries(saved.controls).forEach(([k,v])=>{if(controls[k])controls[k].value=v});
      }catch(e){}
      try{
        activeAlarms.clear();
        (saved.alarms||[]).forEach(([k,v])=>activeAlarms.set(k,v));
      }catch(e){}
      try{
        (saved.tasks||[]).forEach(st=>{const t=ROUTINE_TASKS.find(x=>x.id===st.id);if(t)Object.assign(t,st)});
      }catch(e){}
      state.homePaused=false;
      return true;
    }

    function resumeShift(){
      try{
        const raw=getSavedRaw();
        if(!raw){status('<b>No saved shift found.</b> Start a new shift first; the simulator autosaves every few seconds.');return}
        const saved=JSON.parse(raw);
        if(!applySaved(saved))throw new Error('Saved data format is not compatible.');
        hideHome();
        try{if(typeof setPage==='function')setPage('overview')}catch(e){}
        safeRender();
        safeLog('Resumed a saved shift from browser storage.');
        status('<b>Saved shift restored.</b>');
      }catch(e){
        console.error(e);
        status('<b>Resume failed.</b> The saved shift could not be restored. Start a new shift to create a fresh save.');
      }
    }

    function setScenarioPool(kind){
      const pools={
        source:['storm','odor','sourcepump','coagfeed','sludge','analyzer'],
        chemical:['clfeed','coagfeed','analyzer','ozfault','inventory','power'],
        filter:['filterbreak','sludge','scadacomm','power','coagfeed'],
        distribution:['demand','fireflow','mainbreak','pumptrip','prvfault'],
        pfas:['pfashl','pfasbreak','pfasload','analyzer','power']
      };
      const ids=pools[kind];
      if(ids){state.shiftIssueIds=[...ids];state.shiftIssueRemaining=[...ids]}
    }

    function startScenario(kind){
      if(kind==='random'){startNewShift();return}
      try{localStorage.removeItem(SAVE_KEY);localStorage.removeItem(LEGACY_KEY)}catch(e){}
      resetForFreshShift();
      setScenarioPool(kind);
      if(kind==='source'){
        state.rawTurb=Math.max(state.rawTurb,6.2);state.rawTOC=Math.max(state.rawTOC,3.5);
        if(state.shiftProfile)state.shiftProfile.name='Source-water challenge';
      }
      if(kind==='chemical'){
        if(state.shiftProfile)state.shiftProfile.name='Chemical / analyzer challenge';
      }
      if(kind==='filter'){
        const f=[...state.filters].sort((a,b)=>b.run-a.run)[0];
        if(f){f.run=Math.max(f.run,250);f.head=Math.max(f.head,7.0);f.turb=Math.max(f.turb,.075)}
        if(state.shiftProfile)state.shiftProfile.name='Filter / backwash challenge';
      }
      if(kind==='distribution'){
        state.cityDemand=Math.max(state.cityDemand,34);
        const t=[...state.tanks].sort((a,b)=>a.level-b.level)[0];if(t)t.level=Math.min(t.level,43);
        if(state.shiftProfile)state.shiftProfile.name='Distribution challenge';
      }
      if(kind==='pfas'){
        state.pfas.mediaRemaining=Math.min(state.pfas.mediaRemaining,.30);state.pfas.headloss=Math.max(state.pfas.headloss,3.5);
        if(state.shiftProfile)state.shiftProfile.name='PFAS GAC challenge';
      }
      enterShift(kind==='pfas'?'pfas':'overview');
      try{if(typeof triggerEvent==='function')triggerEvent()}catch(e){}
      safeRender();
      safeLog('Started training scenario: '+kind+'.');
    }

    function toggleScenarios(){
      const p=byId('v16Scen');
      if(p)p.classList.toggle('show');
    }

    function cloneButton(id){
      const old=byId(id);if(!old)return null;
      const n=old.cloneNode(true);old.replaceWith(n);return n;
    }

    function updateResumeButton(){
      const b=byId('v16Resume');if(!b)return;
      const has=!!getSavedRaw();
      b.disabled=!has;
      b.title=has?'Resume the last saved shift':'No saved shift is available yet';
    }

    function bindControls(){
      const start=cloneButton('v16Start');
      const resume=cloneButton('v16Resume');
      const scenario=cloneButton('v16Scenario');
      if(start)start.onclick=function(e){e.preventDefault();startNewShift()};
      if(resume)resume.onclick=function(e){e.preventDefault();resumeShift()};
      if(scenario)scenario.onclick=function(e){e.preventDefault();toggleScenarios()};

      document.querySelectorAll('[data-v16s]').forEach(old=>{
        const n=old.cloneNode(true);old.replaceWith(n);
        n.onclick=function(e){e.preventDefault();startScenario(n.dataset.v16s)};
      });
      updateResumeButton();
      status(getSavedRaw()?'<b>Saved shift available.</b> Resume will restore the last browser-saved shift.':'<b>No saved shift yet.</b> Start New Shift or choose Scenario. The simulator will autosave while the shift runs.');
    }

    window.v161StartNewShift=startNewShift;
    window.v161ResumeShift=resumeShift;
    window.v161StartScenario=startScenario;
    window.v161SaveShift=saveShift;

    state.homePaused=true;
    setTimeout(bindControls,250);
    setTimeout(bindControls,1000);
    setInterval(saveShift,AUTOSAVE_MS);
    window.addEventListener('beforeunload',saveShift);
  })();
  `;

  source=source.replace('</body>','<script>'+runtime+'<\\/script></body>');
  return source;
}
