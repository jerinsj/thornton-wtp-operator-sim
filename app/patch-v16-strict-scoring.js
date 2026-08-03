function patchSimulatorSourceV16StrictScoring(source){
  source=source
    .replace(/Thornton WTP Operator Simulator V16\.6 TEST[^<\n]*/g,'Thornton WTP Operator Simulator V16.7 TEST — Strict Shift Scoring')
    .replace('THORNTON WTP // OPERATOR SIM V16.6 TEST','THORNTON WTP // OPERATOR SIM V16.7 TEST');

  const oldScore=`    state.score=Math.max(0,Math.round(state.quality*.34+state.distribution*.22+state.efficiency*.14+state.response*.18+state.routineScore*.12 + state.sampleCount*1.2));\n    const grade=state.score>=90?'A':state.score>=80?'B':state.score>=70?'C':'Needs improvement';`;

  const newScore=`    const taskScore=ROUTINE_TASKS.length?completedTasks/ROUTINE_TASKS.length*100:100;\n    const requiredLabChecks=4;\n    const labScore=Math.min(100,state.sampleCount/requiredLabChecks*100);\n\n    // V16.7 strict scoring: strong categories cannot hide a weak critical category.\n    // Efficiency still matters, but the six critical operator-performance categories below\n    // control the weakest-link multiplier.\n    const weightedBase=\n      state.quality*.22 +\n      state.distribution*.16 +\n      state.efficiency*.08 +\n      state.response*.18 +\n      state.routineScore*.14 +\n      taskScore*.12 +\n      labScore*.10;\n\n    const criticalScores=[state.quality,state.response,state.distribution,state.routineScore,taskScore,labScore];\n    const weakestCritical=Math.max(0,Math.min(100,...criticalScores));\n    const weakestFactor=Math.pow(weakestCritical/100,1.35);\n    state.score=Math.max(0,Math.min(100,Math.round(weightedBase*weakestFactor)));\n\n    const grade=state.score>=90?'A':state.score>=80?'B':state.score>=70?'C':state.score>=60?'D':'Needs improvement';`;

  if(!source.includes(oldScore))throw new Error('V16.7 could not locate the end-of-shift scoring formula.');
  source=source.replace(oldScore,newScore);

  source=source.replace(
    `<div class="labres"><span>Lab checks</span><b>\${state.sampleCount}</b></div></div>`,
    `<div class="labres"><span>Lab checks</span><b>\${state.sampleCount}/\${requiredLabChecks}</b></div><div class="labres"><span>Weakest critical area</span><b>\${Math.round(weakestCritical)}</b></div></div>`
  );

  source=source.replace(
    `<p>\${unfinished.length?\`<b>\${unfinished.length} routine task(s) were left incomplete.</b> A strong shift includes both process control and ordinary operating work.\`:'All scheduled routine tasks were completed.'}</p>`,
    `<p>\${unfinished.length?\`<b>\${unfinished.length} routine task(s) were left incomplete.</b>\`:'All scheduled routine tasks were completed.'} Final scoring uses a weakest-link penalty across water quality, alarm response, distribution, routine operations, task completion and lab checks; one weak critical area can sharply reduce the overall score.</p>`
  );

  return source;
}
