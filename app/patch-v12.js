function patchSimulatorSource(source){
  source=source
    .replace('Thornton WTP Operator Simulator V10 — Routine Shift Work','Thornton WTP Operator Simulator V12 — Randomized Shifts / Real-Time Pace')
    .replace('THORNTON WTP // OPERATOR SIM V10','THORNTON WTP // OPERATOR SIM V12')
    .replace(
`<div class="control-head"><span>Simulation speed</span><span class="read" id="speedRead">4×</span></div>
<input id="speed" max="10" min="1" step="1" type="range" value="4"/>
<div class="hint">1 real second = 1–10 simulated minutes.</div>`,
`<div class="control-head"><span>Simulation speed</span><span class="read" id="speedRead">30 sec/s</span></div>
<input id="speed" max="2" min="1" step="1" type="range" value="1"/>
<div class="hint">1 real second = 30 simulated seconds to 1 simulated minute.</div>`)
    .replace(
`  function step(){
    if(state.ended)return;
    const n=+controls.speed.value;
    for(let z=0;z<n;z++) simulateMinute();
    render();
  }`,
`  let simMinuteAccumulator=0;
  function step(){
    if(state.ended)return;
    simMinuteAccumulator += (+controls.speed.value)*0.5;
    while(simMinuteAccumulator>=1 && !state.ended){simulateMinute();simMinuteAccumulator-=1;}
    render();
  }`)
    .replace("$('speedRead').textContent=controls.speed.value+'×';","$('speedRead').textContent=(+controls.speed.value===1?'30 sec/s':'1 min/s');")
    .replace(
"    const e=choices[Math.floor(Math.random()*choices.length)];",
`    const eligible=choices.filter(x=>shiftIssueRemaining.includes(x.id));
    if(!eligible.length)return;
    const e=eligible[Math.floor(Math.random()*eligible.length)];
    shiftIssueRemaining=shiftIssueRemaining.filter(id=>id!==e.id);`);

  const randomShiftCode=`  let shiftIssueRemaining=[];
  let shiftIssueIds=[];
  const shiftRnd=(a,b)=>a+Math.random()*(b-a);
  const shiftPick=a=>a[Math.floor(Math.random()*a.length)];
  function shiftShuffle(a){const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]];}return x;}
  function initializeRandomShift(){
    const all=['storm','odor','ozfault','clfeed','coagfeed','analyzer','filterbreak','sludge','sourcepump','scadacomm','inventory','pfashl','pfasbreak','pfasload','demand','fireflow','mainbreak','pumptrip','prvfault','power'];
    shiftIssueIds=shiftShuffle(all).slice(0,8+Math.floor(Math.random()*4));
    shiftIssueRemaining=[...shiftIssueIds];
    controls.flow.value=(Math.round(shiftRnd(11.5,17.5)*2)/2).toFixed(1);
    controls.blend.value=Math.round(shiftRnd(42,82));
    controls.coag.value=(Math.round(shiftRnd(14,22)*2)/2).toFixed(1);
    controls.ozone.value=(Math.round(shiftRnd(.9,1.9)*10)/10).toFixed(1);
    controls.chlorine.value=(Math.round(shiftRnd(2.2,3.3)*10)/10).toFixed(1);
    controls.ammonia.value=(Math.round(shiftRnd(.35,.65)*100)/100).toFixed(2);
    controls.ph.value=(Math.round(shiftRnd(7.8,8.5)*10)/10).toFixed(1);
    state.rawTurb=shiftRnd(2.0,5.8);state.rawTOC=shiftRnd(2.5,4.0);state.odor=shiftRnd(.7,1.4);
    state.settled=shiftRnd(.34,.78);state.filtered=shiftRnd(.045,.095);state.finishCl=shiftRnd(1.55,2.85);state.finishPH=shiftRnd(7.75,8.55);
    state.otherSupply=shiftRnd(14,22);state.cityDemand=shiftRnd(27,35);state.demand=state.cityDemand;state.bwBasin=shiftRnd(.62,.96);
    state.tanks.forEach(t=>t.level=shiftRnd(48,82));
    if(Math.random()<.35){const t=shiftPick(state.tanks);t.level=shiftRnd(38,47);log('Handoff: '+t.id+' begins lower than the other storage tanks.');}
    state.zones.forEach(z=>z.pressure=z.base+shiftRnd(-4,3));
    const ages=shiftShuffle([shiftRnd(12,55),shiftRnd(55,100),shiftRnd(95,145),shiftRnd(140,195),shiftRnd(190,240),shiftRnd(235,282)]);
    state.filters.forEach((f,i)=>{f.run=ages[i];f.head=2+f.run/58+shiftRnd(-.25,.45);f.turb=.038+Math.max(0,f.run-120)*.00013+shiftRnd(.002,.014);f.status='RUN';f.bw=0;});
    state.pfas.headloss=shiftRnd(1.8,3.4);state.pfas.mediaRemaining=shiftRnd(.34,.84);state.pfas.sampleAgeDays=2+Math.floor(Math.random()*15);
    const inherited=shiftShuffle(['filter','bwbasin','chlorine','raw','storage','pfas']);
    const count=Math.random()<.18?0:(Math.random()<.30?2:1);
    for(let n=0;n<count;n++){
      const x=inherited[n];
      if(x==='filter'){const f=shiftPick(state.filters);f.run=shiftRnd(246,284);f.head=shiftRnd(6.9,8.2);f.turb=shiftRnd(.070,.105);log('Handoff: Filter '+f.id+' already needs review.');}
      if(x==='bwbasin'){state.bwBasin=shiftRnd(.54,.70);log('Handoff: backwash supply basin is still recovering.');}
      if(x==='chlorine'){state.finishCl=shiftRnd(1.18,1.45);log('Handoff: finished disinfectant residual is near the low side of the game range.');}
      if(x==='raw'){state.rawTurb=shiftRnd(5.8,8.8);log('Handoff: raw-water turbidity is elevated.');}
      if(x==='storage'){const t=shiftPick(state.tanks);t.level=shiftRnd(36,44);log('Handoff: '+t.id+' begins with reduced storage.');}
      if(x==='pfas'){state.pfas.mediaRemaining=shiftRnd(.23,.34);log('Handoff: future-state PFAS GAC media begins in WATCH territory.');}
    }
    let total=0;state.tanks.forEach(t=>total+=t.cap*t.level/100);state.storageMG=total;
    state.historyT=[state.filtered,state.filtered];state.historyC=[state.finishCl,state.finishCl];
  }

`;
  source=source.replace("  Object.values(controls).forEach(c=>c.addEventListener('input',render));",randomShiftCode+"  Object.values(controls).forEach(c=>c.addEventListener('input',render));");
  source=source.replace("  log('Oncoming shift started. Review prior-shift turnover, alarms and operating status.');","  initializeRandomShift();\n  log('Oncoming shift started with randomized handoff conditions and '+shiftIssueIds.length+' possible incident types.');");
  source=source.replace("  state.historyT=[.07,.07];state.historyC=[2.2,2.2];\n  render();","  if(Math.random()<.28){triggerEvent();if(state.eventMeta)log('Turnover includes an active incident: '+state.eventMeta.name+'.');}\n  render();");
  return source;
}
