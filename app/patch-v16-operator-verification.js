function patchSimulatorSourceV16OperatorVerification(source){
  source=source
    .replace(/Thornton WTP Operator Simulator V16\.10\.3 TEST[^<\n]*/g,'Thornton WTP Operator Simulator V16.10.4.1 TEST — Operator Verification Scoring')
    .replace('THORNTON WTP // OPERATOR SIM V16.10.3 TEST','THORNTON WTP // OPERATOR SIM V16.10.4.1 TEST');

  const labLine='    const labScore=Math.min(100,state.sampleCount/requiredLabChecks*100);';
  if(!source.includes(labLine))throw new Error('V16.10.4.1 could not locate strict lab-score calculation.');
  source=source.replace(labLine,
`    const verifiedLabChecks=v16104LabVerificationCount();
    const labScore=Math.min(100,verifiedLabChecks/requiredLabChecks*100);
    const waterQualityScore=v16104OperatorWaterQualityScore();
    const distributionScore=v16104OperatorDistributionScore();`);

  if(!source.includes('      state.quality*.22 +')||!source.includes('      state.distribution*.16 +')){
    throw new Error('V16.10.4.1 could not locate strict weighted score inputs.');
  }
  source=source
    .replace('      state.quality*.22 +','      waterQualityScore*.22 +')
    .replace('      state.distribution*.16 +','      distributionScore*.16 +')
    .replace('    const criticalScores=[state.quality,state.response,state.distribution,state.routineScore,taskScore,labScore];',
             '    const criticalScores=[waterQualityScore,state.response,distributionScore,state.routineScore,taskScore,labScore];');

  source=source
    .replace('<div class="labres"><span>Water quality</span><b>${Math.round(state.quality)}</b></div>',
             '<div class="labres"><span>Water quality</span><b>${Math.round(waterQualityScore)}</b></div>')
    .replace('<div class="labres"><span>Distribution</span><b>${Math.round(state.distribution)}</b></div>',
             '<div class="labres"><span>Distribution</span><b>${Math.round(distributionScore)}</b></div>')
    .replace('<div class="labres"><span>Lab checks</span><b>${state.sampleCount}/${requiredLabChecks}</b></div>',
             '<div class="labres"><span>Lab checks</span><b>${verifiedLabChecks}/${requiredLabChecks}</b></div>');

  source=source.replace(
    'Final scoring uses a weakest-link penalty across water quality, alarm response, distribution, routine operations, task completion and lab checks; one weak critical area can sharply reduce the overall score.</p>',
    'Final scoring uses a weakest-link penalty across water quality, alarm response, distribution, routine operations, task completion and lab checks; one weak critical area can sharply reduce the overall score. Water Quality and Distribution also require operator verification, so automation alone cannot earn full credit.</p>'
  );

  const runtime=`

  // V16.10.4.1 — separate physical process condition from operator verification performance.
  function v16104EnsureVerification(){
    if(!state.operatorVerification||typeof state.operatorVerification!=='object'){
      state.operatorVerification={labWindows:[false,false,false,false],distWindows:[false,false]};
      // Legacy-resume compatibility: preserve up to the number of prior lab checks already recorded.
      const legacy=Math.min(4,Math.max(0,Math.floor(state.sampleCount||0)));
      for(let i=0;i<legacy;i++)state.operatorVerification.labWindows[i]=true;
    }
    if(!Array.isArray(state.operatorVerification.labWindows))state.operatorVerification.labWindows=[false,false,false,false];
    if(!Array.isArray(state.operatorVerification.distWindows))state.operatorVerification.distWindows=[false,false];
    while(state.operatorVerification.labWindows.length<4)state.operatorVerification.labWindows.push(false);
    while(state.operatorVerification.distWindows.length<2)state.operatorVerification.distWindows.push(false);
  }
  function v16104LabWindow(minute){return Math.max(0,Math.min(3,Math.floor((minute||0)/180)));}
  function v16104DistWindow(minute){return (minute||0)<360?0:1;}
  function v16104MarkLab(minute,label){
    v16104EnsureVerification();
    const w=v16104LabWindow(minute);
    if(!state.operatorVerification.labWindows[w]){
      state.operatorVerification.labWindows[w]=true;
      log('Water-quality verification credit recorded for shift quarter '+(w+1)+(label?' ('+label+')':'')+'.');
    }
  }
  function v16104MarkDistribution(minute,label){
    v16104EnsureVerification();
    const w=v16104DistWindow(minute);
    if(!state.operatorVerification.distWindows[w]){
      state.operatorVerification.distWindows[w]=true;
      log('Distribution/storage verification credit recorded for '+(w===0?'first':'second')+' half of shift'+(label?' ('+label+')':'')+'.');
    }
  }
  function v16104LabVerificationCount(){
    v16104EnsureVerification();
    const windows=state.operatorVerification.labWindows.slice(0,4).map(Boolean);
    ROUTINE_TASKS.filter(t=>t.type==='lab'&&t.completed).forEach(t=>{windows[v16104LabWindow(t.due)]=true;});
    return windows.filter(Boolean).length;
  }
  function v16104DistributionVerificationCount(){
    v16104EnsureVerification();
    const windows=state.operatorVerification.distWindows.slice(0,2).map(Boolean);
    ROUTINE_TASKS.filter(t=>t.type==='distribution'&&t.completed).forEach(t=>{windows[v16104DistWindow(t.due)]=true;});
    return windows.filter(Boolean).length;
  }
  function v16104OperatorWaterQualityScore(){
    const caps=[40,55,70,85,100];
    const cap=caps[Math.min(4,v16104LabVerificationCount())];
    return Math.max(0,Math.min(state.quality,cap));
  }
  function v16104OperatorDistributionScore(){
    const caps=[40,70,100];
    const cap=caps[Math.min(2,v16104DistributionVerificationCount())];
    return Math.max(0,Math.min(state.distribution,cap));
  }
  function v16104RenderOperatorScores(){
    const q=v16104OperatorWaterQualityScore();
    const d=v16104OperatorDistributionScore();
    const labs=v16104LabVerificationCount();
    const dist=v16104DistributionVerificationCount();
    if($('qScore')){$('qScore').textContent=Math.round(q);$('qScore').title='Operator Water Quality score: process condition capped by '+labs+'/4 verified lab periods.';}
    if($('qualityTop'))$('qualityTop').textContent=Math.round(q);
    if($('dScore')){$('dScore').textContent=Math.round(d);$('dScore').title='Operator Distribution score: hydraulic condition capped by '+dist+'/2 verified review periods.';}
    if($('qlDist'))$('qlDist').textContent=Math.round(d);
    if($('distTop'))$('distTop').textContent=Math.round(d);
    if($('samples'))$('samples').textContent=labs+'/4';
  }

  const v16104SampleBtn=$('sampleBtn');
  if(v16104SampleBtn&&typeof v16104SampleBtn.onclick==='function'){
    const v16104BaseSample=v16104SampleBtn.onclick;
    v16104SampleBtn.onclick=function(ev){v16104MarkLab(state.minute,'manual lab check');const r=v16104BaseSample.call(this,ev);v16104RenderOperatorScores();return r;};
  }
  const v16104DistBtn=$('distBtn');
  if(v16104DistBtn&&typeof v16104DistBtn.onclick==='function'){
    const v16104BaseDist=v16104DistBtn.onclick;
    v16104DistBtn.onclick=function(ev){v16104MarkDistribution(state.minute,'distribution check');const r=v16104BaseDist.call(this,ev);v16104RenderOperatorScores();return r;};
  }

  const v16104BaseInit=initializeRandomShift;
  initializeRandomShift=function(){
    const r=v16104BaseInit();
    state.operatorVerification={labWindows:[false,false,false,false],distWindows:[false,false]};
    v16104RenderOperatorScores();
    return r;
  };

  const v16104BaseRender=render;
  render=function(){const r=v16104BaseRender();v16104RenderOperatorScores();return r;};

  v16104EnsureVerification();
  v16104RenderOperatorScores();
  `;

  const marker='\n})();';
  const pos=source.lastIndexOf(marker);
  if(pos<0)throw new Error('V16.10.4.1 could not locate simulator IIFE closing marker.');
  source=source.slice(0,pos)+runtime+source.slice(pos);
  return source;
}
