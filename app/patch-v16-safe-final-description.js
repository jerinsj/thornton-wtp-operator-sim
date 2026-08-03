function patchSimulatorSourceV16SafeFinalDescription(source){
  // V16.12.3.2 — wording-only update. Keep all existing runtime/control wrappers untouched.
  source=source
    .replaceAll("'Needs improvement'","'Disaster'")
    .replaceAll("'NEEDS IMPROVEMENT'","'DISASTER'");

  const methodology=' Final scoring uses a weakest-link penalty across water quality, alarm response, distribution, routine operations, task completion and lab checks; one weak critical area can sharply reduce the overall score. Water Quality and Distribution also require operator verification, so automation alone cannot earn full credit.</p>';
  if(!source.includes(methodology))throw new Error('V16.12.3.2 could not locate the existing end-of-shift methodology text.');
  source=source.replace(methodology,'</p>');

  const oldLine="      note.innerHTML='<strong>Chemical Control:</strong> '+Math.round(result.chem)+'/100. '+result.cap.reason+' Chemical Control is a critical weakest-link category; serious sustained dose/process failures can cap the final grade regardless of other completed duties.';";
  if(!source.includes(oldLine))throw new Error('V16.12.3.2 could not locate the existing final Chemical Control description.');

  const newBlock=`      const completedTasks=ROUTINE_TASKS.filter(t=>t.completed).length;
      const taskScore=ROUTINE_TASKS.length?completedTasks/ROUTINE_TASKS.length*100:100;
      const labScore=Math.min(100,v16104LabVerificationCount()/4*100);
      const categories=[
        {name:'Water quality',score:v16104OperatorWaterQualityScore()},
        {name:'Alarm response',score:state.response},
        {name:'Distribution',score:v16104OperatorDistributionScore()},
        {name:'Routine operations',score:state.routineScore},
        {name:'Routine tasks',score:taskScore},
        {name:'Lab checks',score:labScore},
        {name:'Chemical control',score:result.chem}
      ].sort((a,b)=>a.score-b.score);
      const lowest=categories[0];
      let assessmentTitle='DISASTER';
      let assessmentText='Critical duties or process control failed badly. This is the worst shift outcome and indicates unacceptable operating performance.';
      if(result.score>=90){assessmentTitle='EXCELLENT SHIFT';assessmentText='Excellent overall performance. Critical operating areas were handled consistently and the shift met a high standard.';}
      else if(result.score>=80){assessmentTitle='GOOD SHIFT';assessmentText='Good overall performance. The plant was operated well, but one or more areas kept the shift from an A-level result.';}
      else if(result.score>=70){assessmentTitle='ACCEPTABLE SHIFT';assessmentText='Acceptable overall performance, but important weaknesses should be corrected before this would be considered a strong shift.';}
      else if(result.score>=60){assessmentTitle='POOR SHIFT';assessmentText='Significant weaknesses reduced overall performance. The shift was completed, but the result is below a good operating standard.';}
      const capText=result.cap.maxScore<100?' '+result.cap.reason:'';
      note.innerHTML='<strong>'+assessmentTitle+'</strong> Final score '+result.score+'/100 ('+result.grade+'). '+assessmentText+' Lowest critical area: '+lowest.name+' '+Math.round(lowest.score)+'/100.'+capText;`;
  source=source.replace(oldLine,newBlock);
  return source;
}
