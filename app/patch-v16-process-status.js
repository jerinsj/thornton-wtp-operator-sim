function patchSimulatorSourceV16ProcessStatus(source){
  source=source
    .replace(/Thornton WTP Operator Simulator V16\.7 TEST[^<\n]*/g,'Thornton WTP Operator Simulator V16.8 TEST — Live Process Status')
    .replace('THORNTON WTP // OPERATOR SIM V16.7 TEST','THORNTON WTP // OPERATOR SIM V16.8 TEST');

  const css=`
  /* V16.8 — live process-unit state styling for the Treatment schematic. */
  .s16-svg .unit.s16-proc{transition:fill .25s,stroke .25s,filter .25s}
  .s16-svg .unit.s16-proc.running{fill:#1c3327;stroke:#45d17d;stroke-width:2.8}
  .s16-svg .unit.s16-proc.noflow{fill:#202a31;stroke:#7c8b95;stroke-width:2.4}
  .s16-svg .unit.s16-proc.degraded{fill:#403619;stroke:#ffc857;stroke-width:2.8}
  .s16-svg .unit.s16-proc.alarm{fill:#432026;stroke:#ff6b6b;stroke-width:3;animation:s16pulse .55s infinite alternate}
  .s16-svg .s16-proc-status{font-size:8px;font-weight:800;letter-spacing:.06em}
  .s16-svg .s16-proc-status.running{fill:#6ee79c}
  .s16-svg .s16-proc-status.noflow{fill:#a8b4bb}
  .s16-svg .s16-proc-status.degraded{fill:#ffd879}
  .s16-svg .s16-proc-status.alarm{fill:#ff8f8f}
  `;
  source=source.replace('</style>',css+'\n</style>');

  const runtime=`

  // V16.8 TEST — treatment-unit status follows modeled flow and process condition.
  function s168EnsureProcessStatus(){
    const svg=document.querySelector('.scada-page[data-page-id="treatment"] .s16-card .s16-svg');
    if(!svg)return null;
    const units=[...svg.querySelectorAll('rect.unit')].slice(0,5);
    if(units.length<5)return null;
    const names=['raw','floc','settling','ozone','filters'];
    const xs=[70,272,490,682,867];
    const ys=[147,150,150,147,150];
    units.forEach((u,i)=>{
      u.classList.add('s16-proc');
      u.dataset.s16proc=names[i];
      let t=svg.querySelector('[data-s16procstatus="'+names[i]+'"]');
      if(!t){
        t=document.createElementNS('http://www.w3.org/2000/svg','text');
        t.setAttribute('x',xs[i]);t.setAttribute('y',ys[i]);
        t.setAttribute('class','s16-proc-status');
        t.dataset.s16procstatus=names[i];
        t.textContent='--';
        svg.appendChild(t);
      }
    });
    return {svg,units};
  }

  function s168SetProcessState(name,stateName,label){
    const page=document.querySelector('.scada-page[data-page-id="treatment"] .s16-card');
    if(!page)return;
    const unit=page.querySelector('[data-s16proc="'+name+'"]');
    const text=page.querySelector('[data-s16procstatus="'+name+'"]');
    if(!unit||!text)return;
    unit.classList.remove('running','noflow','degraded','alarm');
    text.classList.remove('running','noflow','degraded','alarm');
    unit.classList.add(stateName);text.classList.add(stateName);text.textContent=label;
  }

  function s168RenderProcessStatus(){
    if(!s168EnsureProcessStatus())return;
    const requested=+controls.flow.value;
    let rawValve='OPEN',finishValve='OPEN';
    try{rawValve=s16ValveState('tr_raw');finishValve=s16ValveState('tr_finish')}catch(e){}

    const rawNoFlow=requested<=0||rawValve==='CLOSED';
    const rawMoving=rawValve==='MOVING';
    const finishBlocked=finishValve==='CLOSED';
    const finishMoving=finishValve==='MOVING';
    const throughputFactor=typeof s16ValveFlowFactor==='function'?s16ValveFlowFactor():1;
    const downstreamCurtail=throughputFactor<.5||finishBlocked||finishMoving;

    const coag=+controls.coag.value;
    const optimal=12.5+state.rawTurb*.52+state.rawTOC*.55-state.jarBonus;
    const coagErr=Math.abs(coag-optimal);
    const ozoneDose=+controls.ozone.value;

    // RAW / intake condition.
    if(state.event==='sourcepump')s168SetProcessState('raw','alarm','ALARM');
    else if(rawNoFlow)s168SetProcessState('raw','noflow','NO FLOW');
    else if(rawMoving)s168SetProcessState('raw','degraded','MOVING');
    else s168SetProcessState('raw','running','RUNNING');

    // Coagulation/flocculation.
    if(rawNoFlow)s168SetProcessState('floc','noflow','NO FLOW');
    else if(state.event==='coagfeed')s168SetProcessState('floc','alarm','ALARM');
    else if(rawMoving||downstreamCurtail||coagErr>=4)s168SetProcessState('floc','degraded','DEGRADED');
    else s168SetProcessState('floc','running','RUNNING');

    // Settling.
    if(rawNoFlow)s168SetProcessState('settling','noflow','NO FLOW');
    else if(state.event==='sludge'||state.settled>1.2)s168SetProcessState('settling','alarm','ALARM');
    else if(rawMoving||downstreamCurtail||state.settled>.8)s168SetProcessState('settling','degraded','DEGRADED');
    else s168SetProcessState('settling','running','RUNNING');

    // Ozone.
    if(rawNoFlow)s168SetProcessState('ozone','noflow','NO FLOW');
    else if(state.event==='ozfault')s168SetProcessState('ozone','alarm','ALARM');
    else if(rawMoving||downstreamCurtail||ozoneDose<.2)s168SetProcessState('ozone','degraded','DEGRADED');
    else s168SetProcessState('ozone','running','RUNNING');

    // Filters / outlet.
    if(rawNoFlow||finishBlocked)s168SetProcessState('filters','noflow','NO FLOW');
    else if(state.event==='filterbreak'||state.filtered>.30)s168SetProcessState('filters','alarm','ALARM');
    else if(finishMoving||throughputFactor<.5||state.filtered>.15)s168SetProcessState('filters','degraded','DEGRADED');
    else s168SetProcessState('filters','running','RUNNING');
  }

  // Keep the status layer synchronized with the existing SVG renderer and page navigation.
  const s168OldRender=render;
  render=function(){const r=s168OldRender();setTimeout(s168RenderProcessStatus,0);return r};
  setInterval(s168RenderProcessStatus,250);
  setTimeout(s168RenderProcessStatus,250);
  setTimeout(s168RenderProcessStatus,1000);
  `;

  const marker='\n})();';
  const pos=source.lastIndexOf(marker);
  if(pos<0)throw new Error('V16.8 could not locate the simulator IIFE closing marker.');
  source=source.slice(0,pos)+runtime+source.slice(pos);
  return source;
}
