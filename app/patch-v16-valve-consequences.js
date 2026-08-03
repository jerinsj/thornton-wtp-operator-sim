function patchSimulatorSourceV16ValveConsequences(source){
  source=source
    .replace(/Thornton WTP Operator Simulator V16\.5 TEST[^<\n]*/g,'Thornton WTP Operator Simulator V16.6 TEST — Valve Consequences')
    .replace('THORNTON WTP // OPERATOR SIM V16.5 TEST','THORNTON WTP // OPERATOR SIM V16.6 TEST');

  // Use effective modeled throughput everywhere the base simulator derives process flow.
  // The operator's flow slider remains the requested setpoint; valve isolation reduces actual flow.
  source=source.replace(/const flow=\+controls\.flow\.value/g,'const flow=(+controls.flow.value)*s16ValveFlowFactor()');
  source=source.replace('const flowNow=+controls.flow.value;','const flowNow=(+controls.flow.value)*s16ValveFlowFactor();');
  source=source.replace('${(+controls.flow.value).toFixed(1)}','${((+controls.flow.value)*s16ValveFlowFactor()).toFixed(1)}');

  const runtime=`

  // V16.6 TEST — consequences for operator-clickable generalized valves.
  // This remains generalized training logic and is not Thornton PLC/interlock logic.
  function s16ValveFlowFactor(){
    const m=(state&&state.hmiManualValves)||{};
    let factor=1;
    if(m.tr_raw==='CLOSED') factor=Math.min(factor,.08);
    if(m.tr_finish==='CLOSED') factor=Math.min(factor,.10);
    if(m.pfas_in==='CLOSED') factor=Math.min(factor,.15);
    if(m.pfas_out==='CLOSED') factor=Math.min(factor,.15);
    if(m.dist_isolation==='CLOSED') factor=Math.min(factor,.12);
    return factor;
  }

  const S16_VALVE_EFFECTS={
    tr_raw:{
      alarmKey:'s16v_tr_raw',sev:'hi',label:'RWB to Floc valve',
      title:'RWB TO FLOCCULATION VALVE CLOSED',
      detail:'Raw-water feed path is isolated. Modeled treatment throughput is severely reduced. ACK will command this training valve OPEN.',
      recovery:'raw-water feed and modeled treatment throughput restored'
    },
    tr_finish:{
      alarmKey:'s16v_tr_finish',sev:'hi',label:'Filtered-water outlet valve',
      title:'FILTERED-WATER OUTLET VALVE CLOSED',
      detail:'Post-filter outlet path is isolated. Modeled plant throughput is severely reduced. ACK will command this training valve OPEN.',
      recovery:'filtered-water outlet path and modeled throughput restored'
    },
    pfas_in:{
      alarmKey:'s16v_pfas_in',sev:'med',label:'PFAS GAC inlet valve',
      title:'PFAS GAC INLET VALVE CLOSED',
      detail:'Future-state GAC inlet path is isolated. Modeled treatment throughput is reduced while this training valve remains closed. ACK will command it OPEN.',
      recovery:'GAC inlet path and modeled throughput restored'
    },
    pfas_out:{
      alarmKey:'s16v_pfas_out',sev:'med',label:'PFAS GAC outlet valve',
      title:'PFAS GAC OUTLET VALVE CLOSED',
      detail:'Future-state GAC outlet path is isolated. Modeled treatment throughput is reduced while this training valve remains closed. ACK will command it OPEN.',
      recovery:'GAC outlet path and modeled throughput restored'
    },
    dist_isolation:{
      alarmKey:'s16v_dist_isolation',sev:'hi',label:'TWTP distribution isolation valve',
      title:'TWTP DISTRIBUTION ISOLATION VALVE CLOSED',
      detail:'TWTP delivery path to the modeled distribution system is isolated. Effective plant delivery is severely reduced. ACK will command this training valve OPEN.',
      recovery:'TWTP distribution delivery path restored'
    }
  };

  state.s16ValveCommandSeen=state.s16ValveCommandSeen||{};

  function s16ValveFriendlyCommandLog(key){
    const c=S16_VALVE_EFFECTS[key];
    const t=state.hmiValveTransitions&&state.hmiValveTransitions[key];
    if(!c||!t)return;
    const sig=t.target+':'+t.until;
    if(state.s16ValveCommandSeen[key]===sig)return;
    state.s16ValveCommandSeen[key]=sig;
    log(c.label+': '+t.target+' command issued.');
  }

  function s16ValveConsequenceTick(){
    Object.entries(S16_VALVE_EFFECTS).forEach(([key,c])=>{
      s16ValveFriendlyCommandLog(key);
      let s='OPEN';
      try{s=s16ValveState(key)}catch(e){return}
      const manual=(state.hmiManualValves||{})[key];

      if(manual==='CLOSED'){
        if(!activeAlarms.has(c.alarmKey)){
          alarm(c.alarmKey,c.sev,c.title,c.detail,false);
        }
      }else if(s==='OPEN'&&activeAlarms.has(c.alarmKey)){
        clearAlarm(c.alarmKey,false);
        log('Recovery verified: '+c.label+' OPEN; '+c.recovery+'.');
      }
    });
  }

  // Preserve the normal alarm page, but make ACK corrective for these five valve alarms.
  const s16ValveBaseRenderAlarms=renderAlarms;
  renderAlarms=function(){
    s16ValveBaseRenderAlarms();
    Object.entries(S16_VALVE_EFFECTS).forEach(([key,c])=>{
      if(!activeAlarms.has(c.alarmKey))return;
      const btn=document.querySelector('[data-ack="'+c.alarmKey+'"]');
      if(!btn||btn.disabled)return;
      btn.title='Acknowledge and command the affected generalized training valve OPEN';
      btn.onclick=()=>{
        const a=activeAlarms.get(c.alarmKey);
        if(!a)return;
        a.acked=true;
        state.response=Math.min(100,state.response+.5);
        log('Acknowledged: '+a.title+'. Corrective OPEN command initiated.');
        const until=Date.now()+1200;
        state.hmiValveTransitions[key]={target:'OPEN',until};
        state.s16ValveCommandSeen[key]='OPEN:'+until;
        log(c.label+': OPEN command issued from alarm ACK.');
        renderAlarms();
        try{s16Render()}catch(e){}
      };
    });
  };

  // Poll quickly enough to recognize valve feedback transitions and alarm/recovery states.
  setInterval(s16ValveConsequenceTick,250);
  setTimeout(s16ValveConsequenceTick,300);
  `;

  const marker='\n})();';
  const pos=source.lastIndexOf(marker);
  if(pos<0)throw new Error('V16.6 could not locate the simulator IIFE closing marker.');
  source=source.slice(0,pos)+runtime+source.slice(pos);
  return source;
}
