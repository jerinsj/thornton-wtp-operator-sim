function patchSimulatorSourceV16ChemicalControl(source){
  source=source
    .replace(/Thornton WTP Operator Simulator V16\.11\.1 TEST[^<\n]*/g,'Thornton WTP Operator Simulator V16.12 TEST — Critical Chemical Control Scoring')
    .replace('THORNTON WTP // OPERATOR SIM V16.11.1 TEST','THORNTON WTP // OPERATOR SIM V16.12 TEST');

  const css=`
  /* V16.12 — live chemical-control score and grade-cap status. */
  .v1612-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:0 14px 14px}
  .v1612-box{background:#10181e;border:1px solid #35434d;border-radius:10px;padding:10px}
  .v1612-box small{display:block;color:#8fa0aa;font-size:9px}.v1612-box b{display:block;font-size:17px;margin-top:4px}.v1612-box span{display:block;color:#91a4ae;font-size:8.5px;margin-top:3px;line-height:1.35}
  .v1612-state.normal{color:#45d17d}.v1612-state.watch{color:#ffc857}.v1612-state.serious{color:#ff9f43}.v1612-state.critical{color:#ff6b6b}
  .v1612-final{margin-top:12px;padding:10px 12px;border:1px solid #35434d;border-radius:10px;background:#10181e;color:#9fb2bc;font-size:11px;line-height:1.45}
  .v1612-final strong{color:#eef4f6}.v1612-final.bad{border-color:#88404a;background:#24161a}
  @media(max-width:900px){.v1612-summary{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:560px){.v1612-summary{grid-template-columns:1fr}}
  `;
  if(!source.includes('</style>'))throw new Error('V16.12 chemical-control patch could not locate stylesheet closing tag.');
  source=source.replace('</style>',css+'\n</style>');

  const runtime=`

  // V16.12 — critical Chemical Control scoring.
  // Thresholds below are generalized game assumptions, not Thornton operating limits.
  function v1612EnsureChemicalControl(){
    if(state.chemicalControl&&Number.isFinite(state.chemicalControl.score))return;
    state.chemicalControl={score:100,penalty:0,currentSeverity:0,currentLabel:'NORMAL',currentIssues:[],criticalStreak:0,seriousStreak:0,maxCriticalStreak:0,maxSeriousStreak:0,criticalTotal:0,seriousTotal:0,watchTotal:0};
  }
  function v1612Snapshot(){
    v1611EnsureChem();
    const c=state.disinfectionChem;
    let ct=null;try{ct=v1610CalcCT()}catch(e){}
    const effectiveCoag=(+controls.coag.value)*(state.event==='coagfeed'?.72:1);
    const coagOpt=12.5+state.rawTurb*.52+state.rawTOC*.55-state.jarBonus;
    const coagErr=Math.abs(effectiveCoag-coagOpt);
    const ozoneEff=(+controls.ozone.value)*(state.event==='ozfault'?.55:1);
    const ozoneNeed=.55+state.rawTOC*.22+state.odor*.25;
    const ozoneRatio=ozoneEff/Math.max(.1,ozoneNeed);
    const issues=[];let severity=0;
    const add=(sev,label)=>{severity=Math.max(severity,sev);issues.push({sev,label})};

    // Chlorination / chloramination.
    if(c.ratio>=V1611_BREAKPOINT&&c.finishedFreeCl>.15)add(3,'breakpoint exceeded with finished free-chlorine carryover');
    else if(c.region==='BREAKPOINT APPROACH'||c.ratio>=5.8)add(2,'chloramination approaching breakpoint / high Cl₂:N ratio');
    else if(c.region==='AMMONIA EXCESS'&&c.freeAmmoniaN>.25)add(2,'excess free ammonia / chlorine-to-nitrogen ratio too low');
    else if(c.region!=='MONOCHLORAMINE REGION')add(1,'chloramination outside preferred modeled region');
    if(c.otherCombined>.55)add(2,'other combined chlorine elevated');
    else if(c.otherCombined>.35)add(1,'other combined chlorine above preferred modeled range');
    if(c.freeAmmoniaN>.35)add(2,'free ammonia high');
    else if(c.freeAmmoniaN>.18)add(1,'free ammonia elevated');
    if(c.totalCl<.50)add(3,'finished total chlorine critically low');
    else if(c.totalCl<.80)add(2,'finished total chlorine low');
    if(c.finishedFreeCl>.30)add(3,'finished free chlorine carryover high');
    else if(c.finishedFreeCl>.15)add(2,'finished free chlorine carryover');

    // DCC chlorine / CT condition. The CT ratio remains a generalized game benchmark, not a compliance determination.
    if(ct&&ct.valid){
      if(c.dcc<.35||ct.ratio<.25)add(3,'DCC chlorine/CT severely low versus game benchmark');
      else if(c.dcc<.60||ct.ratio<.45)add(2,'DCC chlorine/CT low versus game benchmark');
      else if(ct.ratio<.65)add(1,'DCC CT margin reduced versus game benchmark');
    }

    // Coagulation dose is compared with the game model's live raw-water demand.
    if(coagErr>12)add(3,'coagulant dose grossly mismatched to modeled raw-water demand');
    else if(coagErr>8)add(2,'coagulant dose substantially mismatched to modeled demand');
    else if(coagErr>4)add(1,'coagulant dose outside preferred modeled band');

    // Ozone is compared with the live oxidation-demand model rather than a fixed setpoint.
    if(ozoneRatio<.30||ozoneRatio>2.10)add(2,'ozone dose grossly mismatched to modeled oxidation demand');
    else if(ozoneRatio<.55||ozoneRatio>1.65)add(1,'ozone dose outside preferred modeled demand band');

    // Finished pH / alkalinity indicate caustic-control performance.
    if(state.finishPH<7.20||state.finishPH>9.20)add(3,'finished pH critically outside modeled stability range');
    else if(state.finishPH<7.50||state.finishPH>8.90)add(2,'finished pH outside modeled operating range');
    else if(state.finishPH<7.65||state.finishPH>8.70)add(1,'finished pH approaching modeled limit');
    if(state.finishAlk<35)add(2,'finished alkalinity very low');
    else if(state.finishAlk<45)add(1,'finished alkalinity low');

    const label=severity===3?'CRITICAL':severity===2?'SERIOUS':severity===1?'WATCH':'NORMAL';
    return {severity,label,issues,c,ct,coagOpt,coagErr,ozoneRatio};
  }
  function v1612UpdateChemicalControl(){
    v1612EnsureChemicalControl();
    const s=state.chemicalControl,snap=v1612Snapshot();
    s.currentSeverity=snap.severity;s.currentLabel=snap.label;s.currentIssues=snap.issues.map(x=>x.label);

    // Allow a short takeover period before sustained-exposure scoring starts.
    if(state.minute<=15)return;

    if(snap.severity===3){
      s.criticalStreak++;s.seriousStreak++;s.criticalTotal++;
      s.maxCriticalStreak=Math.max(s.maxCriticalStreak,s.criticalStreak);
      s.maxSeriousStreak=Math.max(s.maxSeriousStreak,s.seriousStreak);
      const n=Math.max(1,snap.issues.filter(x=>x.sev===3).length);
      s.penalty+=.70+.10*(n-1);
    }else if(snap.severity===2){
      s.criticalStreak=0;s.seriousStreak++;s.seriousTotal++;
      s.maxSeriousStreak=Math.max(s.maxSeriousStreak,s.seriousStreak);
      const n=Math.max(1,snap.issues.filter(x=>x.sev===2).length);
      s.penalty+=.22+.04*(n-1);
    }else if(snap.severity===1){
      s.criticalStreak=0;s.seriousStreak=0;s.watchTotal++;
      s.penalty+=.025;
    }else{
      s.criticalStreak=0;s.seriousStreak=0;
    }
    s.score=Math.max(0,Math.min(100,100-s.penalty));
  }
  function v1612GradeCap(){
    v1612EnsureChemicalControl();
    const s=state.chemicalControl,snap=v1612Snapshot();
    let maxScore=100,reason='No chemical-control grade cap active.';
    const cap=(score,text)=>{if(score<maxScore){maxScore=score;reason=text;}};

    if(snap.severity>=3)cap(59,'Shift ended with a CRITICAL chemical/disinfection condition unresolved.');
    else if(snap.severity===2)cap(69,'Shift ended with a SERIOUS chemical-control condition unresolved.');

    if(s.maxCriticalStreak>=60)cap(59,'A critical chemical condition persisted for at least 60 simulated minutes.');
    else if(s.maxCriticalStreak>=30)cap(69,'A critical chemical condition persisted for at least 30 simulated minutes.');
    else if(s.maxCriticalStreak>=15)cap(79,'A critical chemical condition persisted for at least 15 simulated minutes.');

    if(s.maxSeriousStreak>=60)cap(69,'A serious chemical condition persisted for at least 60 simulated minutes.');
    else if(s.maxSeriousStreak>=30)cap(79,'A serious chemical condition persisted for at least 30 simulated minutes.');

    if(s.score<40)cap(59,'Chemical Control score fell below 40.');
    else if(s.score<60)cap(69,'Chemical Control score fell below 60.');
    return {maxScore,reason,snap};
  }
  function v1612FinalScore(){
    v1612EnsureChemicalControl();
    const completedTasks=ROUTINE_TASKS.filter(t=>t.completed).length;
    const taskScore=ROUTINE_TASKS.length?completedTasks/ROUTINE_TASKS.length*100:100;
    const labScore=Math.min(100,v16104LabVerificationCount()/4*100);
    const q=v16104OperatorWaterQualityScore();
    const d=v16104OperatorDistributionScore();
    const chem=state.chemicalControl.score;
    const weightedBase=q*.18+d*.13+state.efficiency*.06+state.response*.14+state.routineScore*.11+taskScore*.10+labScore*.08+chem*.20;
    const critical=[q,state.response,d,state.routineScore,taskScore,labScore,chem];
    const weakest=Math.max(0,Math.min(100,...critical));
    let score=Math.max(0,Math.min(100,Math.round(weightedBase*Math.pow(weakest/100,1.35))));
    const cap=v1612GradeCap();score=Math.min(score,cap.maxScore);
    const grade=score>=90?'A':score>=80?'B':score>=70?'C':score>=60?'D':'Needs improvement';
    return {score,grade,weakest,chem,cap};
  }
  function v1612EnsureUI(){
    const dist=$('distTop');
    if(dist&&!$('chemTop')){
      const pill=document.createElement('div');pill.className='pill';pill.title='Chemical Control score: dynamic dose/process performance.';
      pill.innerHTML='CHEM <b id="chemTop">100</b>';
      dist.parentElement.insertAdjacentElement('afterend',pill);
    }
    if($('qScore')&&!$('chemScore')){
      const row=$('qScore').closest('.score-row');
      if(row){const box=document.createElement('div');box.className='scorebox';box.innerHTML='<small>Chemical control</small><b id="chemScore">100</b>';row.appendChild(box);}
    }
    const panel=$('v1611ChemPanel');
    if(panel&&!$('v1612Summary')){
      const d=document.createElement('div');d.className='v1612-summary';d.id='v1612Summary';
      d.innerHTML='<div class="v1612-box"><small>CHEMICAL CONTROL SCORE</small><b id="v1612Score">100</b><span>cumulative operator-performance score</span></div>'+
        '<div class="v1612-box"><small>CURRENT CONDITION</small><b class="v1612-state normal" id="v1612State">NORMAL</b><span id="v1612Issue">all modeled chemical conditions acceptable</span></div>'+
        '<div class="v1612-box"><small>WORST SUSTAINED CONDITION</small><b id="v1612Streak">0 min</b><span>critical / serious continuous exposure</span></div>'+
        '<div class="v1612-box"><small>GRADE-CAP FORECAST</small><b id="v1612Cap">NONE</b><span id="v1612CapReason">No chemical-control grade cap active.</span></div>';
      const reg=$('v1611Region');if(reg)reg.insertAdjacentElement('afterend',d);else panel.appendChild(d);
    }
  }
  function v1612RenderChemicalControl(){
    v1612EnsureChemicalControl();v1612EnsureUI();
    const s=state.chemicalControl,cap=v1612GradeCap();
    const set=(id,text)=>{const e=$(id);if(e)e.textContent=text;};
    set('chemTop',Math.round(s.score));set('chemScore',Math.round(s.score));set('v1612Score',Math.round(s.score));
    const st=$('v1612State');if(st){st.textContent=s.currentLabel;st.className='v1612-state '+s.currentLabel.toLowerCase();}
    set('v1612Issue',s.currentIssues.length?s.currentIssues.slice(0,2).join(' · '):'all modeled chemical conditions acceptable');
    const worst=Math.max(s.maxCriticalStreak,s.maxSeriousStreak);set('v1612Streak',worst+' min');
    const capText=cap.maxScore===100?'NONE':cap.maxScore===79?'MAX C':cap.maxScore===69?'MAX D':'NEEDS IMPROVEMENT';
    set('v1612Cap',capText);set('v1612CapReason',cap.reason);
  }
  function v1612ApplyFinalSummary(){
    const result=v1612FinalScore();state.score=result.score;
    const box=$('modalBox');if(!box)return;
    [...box.querySelectorAll('.labres')].forEach(cell=>{
      const label=cell.querySelector('span'),val=cell.querySelector('b');if(!label||!val)return;
      const t=label.textContent.trim();
      if(t==='Final score')val.textContent=result.score;
      if(t==='Grade')val.textContent=result.grade;
      if(t==='Weakest critical area')val.textContent=Math.round(result.weakest);
    });
    const grid=box.querySelector('.labgrid');
    if(grid&&!box.querySelector('[data-v1612-final]')){
      const chem=document.createElement('div');chem.className='labres';chem.dataset.v1612Final='1';chem.innerHTML='<span>Chemical control</span><b>'+Math.round(result.chem)+'</b>';grid.appendChild(chem);
      const capCell=document.createElement('div');capCell.className='labres';capCell.dataset.v1612Final='1';capCell.innerHTML='<span>Chemical grade cap</span><b>'+(result.cap.maxScore===100?'None':result.cap.maxScore===79?'Maximum C':result.cap.maxScore===69?'Maximum D':'Needs improvement')+'</b>';grid.appendChild(capCell);
    }
    const row=box.querySelector('.row');
    if(row&&!box.querySelector('.v1612-final')){
      const note=document.createElement('div');note.className='v1612-final '+(result.cap.maxScore<100?'bad':'');
      note.innerHTML='<strong>Chemical Control:</strong> '+Math.round(result.chem)+'/100. '+result.cap.reason+' Chemical Control is a critical weakest-link category; serious sustained dose/process failures can cap the final grade regardless of other completed duties.';
      row.insertAdjacentElement('beforebegin',note);
    }
    if($('scoreTop'))$('scoreTop').textContent=result.score;
  }

  const v1612BaseSimulateMinute=simulateMinute;
  simulateMinute=function(){const r=v1612BaseSimulateMinute();v1612UpdateChemicalControl();return r;};

  const v1612BaseRender=render;
  render=function(){const r=v1612BaseRender();v1612RenderChemicalControl();return r;};

  const v1612BaseInit=initializeRandomShift;
  initializeRandomShift=function(){const r=v1612BaseInit();state.chemicalControl=null;v1612EnsureChemicalControl();v1612RenderChemicalControl();return r;};

  const v1612BaseEndShift=endShift;
  endShift=function(){
    v1612EnsureChemicalControl();
    const r=v1612BaseEndShift();
    v1612ApplyFinalSummary();
    return r;
  };

  v1612EnsureChemicalControl();
  v1612RenderChemicalControl();
  `;

  const marker='\n})();';
  const pos=source.lastIndexOf(marker);
  if(pos<0)throw new Error('V16.12 chemical-control patch could not locate simulator IIFE closing marker.');
  source=source.slice(0,pos)+runtime+source.slice(pos);
  return source;
}
