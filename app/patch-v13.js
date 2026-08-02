function patchSimulatorSourceV13(source){
  const rep=(a,b,label)=>{if(!source.includes(a))throw new Error('V13 patch mismatch: '+label);source=source.replace(a,b);};

  source=source
    .replace('Thornton WTP Operator Simulator V12 — Randomized Shifts / Real-Time Pace','Thornton WTP Operator Simulator V13 — pH & Alkalinity')
    .replace('THORNTON WTP // OPERATOR SIM V12','THORNTON WTP // OPERATOR SIM V13');

  rep(
'rawTurb:3.2, rawTOC:3.0, odor:1.0, settled:0.48, filtered:0.07, finishCl:2.2, finishPH:8.2,',
'rawTurb:3.2, rawTOC:3.0, odor:1.0, rawPH:7.65, rawAlk:68, settledAlk:55, finishAlk:65, settled:0.48, filtered:0.07, finishCl:2.2, finishPH:8.05,',
'chemistry state');

  rep(
`<div class="feedcard">
<div class="feedhead"><b>FINISHED WATER pH</b><span>TRIM CONTROL</span></div>
<div class="feedrow"><small>pH target SP</small><b id="phTargetSP">8.20</b></div>
<div class="feedrow"><small>Finished pH PV</small><b id="chemPHStatus">8.20</b></div>
<div class="feedrow"><small>Trim pump output</small><b id="phPumpPct">30%</b></div>
<div class="feedrow"><small>Control mode</small><b>AUTO</b></div>
</div>`,
`<div class="feedcard">
<div class="feedhead"><b>CAUSTIC SODA / pH TRIM</b><span>FLOW-PACED TRIM</span></div>
<div class="feedrow"><small>Caustic dose SP</small><b id="causticDoseSP">8.0 mg/L</b></div>
<div class="feedrow"><small>Equivalent dose</small><b id="causticLbMG">66.7 lb/MG</b></div>
<div class="feedrow"><small>Calculated feed demand</small><b id="causticLbDay">934 lb/day</b></div>
<div class="feedrow"><small>Sim liquid feed</small><b id="causticGPH">6.1 gal/hr</b></div>
<div class="feedrow"><small>Metering pump output</small><b id="causticPumpPct">42%</b></div>
<div class="feedrow"><small>Raw alkalinity</small><b id="chemRawAlk">68 mg/L as CaCO₃</b></div>
<div class="feedrow"><small>Finished alkalinity</small><b id="chemFinishAlk">65 mg/L as CaCO₃</b></div>
<div class="feedrow"><small>Finished pH PV</small><b id="chemPHStatus">8.05</b></div>
</div>`,'caustic card');

  rep(
`<div class="control">
<div class="control-head"><span>Finished pH target</span><span class="read" id="phRead">8.20</span></div>
<input id="ph" max="9.2" min="7.2" step=".05" type="range" value="8.2"/>
<div class="hint">A simplified corrosion-control/stability variable.</div>
</div>`,
`<div class="control">
<div class="control-head"><span>Caustic dose</span><span class="read" id="causticRead">8.0 mg/L</span></div>
<input id="caustic" max="20" min="0" step=".5" type="range" value="8"/>
<div class="hint">Finished-water pH/alkalinity trim. Dose response depends on source alkalinity and upstream ferric demand.</div>
</div>`,'caustic control');

  rep(
`<div class="chemical-basis-note">
<b>Display basis:</b>`,
`<div class="ph-alk-panel">
<div><small>Raw water pH</small><b id="rawPHPV">7.65</b></div>
<div><small>Raw alkalinity</small><b id="rawAlkPV">68 mg/L as CaCO₃</b></div>
<div><small>Post-coag alkalinity</small><b id="settledAlkPV">55 mg/L as CaCO₃</b></div>
<div><small>Finished pH</small><b id="finishPHPV">8.05</b></div>
<div><small>Finished alkalinity</small><b id="finishAlkPV">65 mg/L as CaCO₃</b></div>
</div>
<div class="chemical-basis-note"><b>pH / alkalinity model:</b> source chemistry changes with blend and time; ferric coagulation consumes alkalinity and finished-water caustic adds alkalinity and raises pH. This is a simplified training model, not Thornton's control algorithm.</div>
<div class="chemical-basis-note">
<b>Display basis:</b>`,'chem panel');

  rep('</style>',
`  .ph-alk-panel{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;padding:0 14px 12px}
  .ph-alk-panel>div{background:#091927;border:1px solid #294963;border-radius:9px;padding:9px}
  .ph-alk-panel small{display:block;color:var(--muted);font-size:9px}.ph-alk-panel b{display:block;font-size:13px;margin-top:3px}
  @media(max-width:900px){.ph-alk-panel{grid-template-columns:repeat(2,1fr)}}@media(max-width:520px){.ph-alk-panel{grid-template-columns:1fr}}
</style>`,'chem css');

  rep("chlorine:$('chlorine'), ammonia:$('ammonia'), ph:$('ph'), speed:$('speed')",
      "chlorine:$('chlorine'), ammonia:$('ammonia'), caustic:$('caustic'), speed:$('speed')",'controls');

  rep(
`      {id:'coagfeed',name:'Coagulant feed-pump deviation',dur:75,msg:'Calculated coagulant demand and simulated delivered feed have diverged.',
       options:[
        ['Inspect the feed system, verify actual feed/process response, and use jar/process data to guide any correction.','correct'],
        ['Compensate by increasing chlorine.','wrong'],
        ['Backwash a filter to fix coagulation.','wrong']]},
      {id:'analyzer'`,
`      {id:'coagfeed',name:'Coagulant feed-pump deviation',dur:75,msg:'Calculated coagulant demand and simulated delivered feed have diverged.',
       options:[
        ['Inspect the feed system, verify actual feed/process response, and use jar/process data to guide any correction.','correct'],
        ['Compensate by increasing chlorine.','wrong'],
        ['Backwash a filter to fix coagulation.','wrong']]},
      {id:'alkshift',name:'Source alkalinity / pH shift',dur:105,msg:'Raw-water alkalinity and pH are trending lower, changing buffer capacity and downstream pH response.',
       options:[
        ['Verify pH and alkalinity with process/lab data, review ferric demand, and adjust caustic trim deliberately while monitoring finished-water response.','correct'],
        ['Increase caustic to maximum without checking alkalinity or pH.','wrong'],
        ['Increase chlorine because alkalinity has fallen.','wrong']]},
      {id:'causticfeed',name:'Caustic feed deviation',dur:80,msg:'Finished-water pH/alkalinity response is lower than expected for the caustic dose setpoint.',
       options:[
        ['Verify finished pH/alkalinity, compare caustic setpoint with feed response, and inspect the caustic feed system before making a large correction.','correct'],
        ['Increase coagulant to raise finished pH.','wrong'],
        ['Ignore it because pH will always self-correct.','wrong']]},
      {id:'analyzer'`,'events');

  rep(
"const flow=+controls.flow.value, blend=+controls.blend.value/100, coag=+controls.coag.value, ozone=+controls.ozone.value, chlorine=+controls.chlorine.value, ammonia=+controls.ammonia.value, ph=+controls.ph.value;",
"const flow=+controls.flow.value, blend=+controls.blend.value/100, coag=+controls.coag.value, ozone=+controls.ozone.value, chlorine=+controls.chlorine.value, ammonia=+controls.ammonia.value, caustic=+controls.caustic.value;",
'sim vars');

  rep(
"state.odor = .8 + (1-blend)*.4 + (state.event==='odor'?2.2:0);",
`state.odor = .8 + (1-blend)*.4 + (state.event==='odor'?2.2:0);
    const rawAlkTarget=58*blend+90*(1-blend)+Math.sin(state.minute/83)*4-(state.event==='alkshift'?24:0);
    const rawPHTarget=7.55*blend+7.86*(1-blend)+Math.sin(state.minute/111)*.06-(state.event==='alkshift'?.24:0);
    state.rawAlk += (rawAlkTarget-state.rawAlk)*.025;
    state.rawPH += (rawPHTarget-state.rawPH)*.025;`,'source chem');

  rep(
`    const effectiveCoag=coag*(state.event==='coagfeed'?.72:1);
    const coagErr=Math.abs(effectiveCoag-optimalCoag);
    const removal=Math.max(.55, .93 - coagErr*.018 - Math.max(0,flow-16)*.008);`,
`    const effectiveCoag=coag*(state.event==='coagfeed'?.72:1);
    const coagErr=Math.abs(effectiveCoag-optimalCoag);
    const coagAlkDemand=effectiveCoag*.80;
    state.settledAlk=Math.max(12,state.rawAlk-coagAlkDemand);
    const postCoagPH=state.rawPH-(effectiveCoag*.012)*Math.sqrt(65/Math.max(30,state.rawAlk));
    const coagPHpenalty=Math.max(0,6.7-postCoagPH)*.09+Math.max(0,postCoagPH-8.3)*.035;
    const removal=Math.max(.52, .93 - coagErr*.018 - Math.max(0,flow-16)*.008 - coagPHpenalty);`,'coag chem');

  rep(
`    state.finishCl += (clTarget-state.finishCl)*.06;
    state.finishPH += (ph-state.finishPH)*.08;`,
`    state.finishCl += (clTarget-state.finishCl)*.06;
    const effectiveCaustic=caustic*(state.event==='causticfeed'?.58:1);
    const finishAlkTarget=Math.max(12,state.settledAlk+effectiveCaustic*1.25);
    state.finishAlk += (finishAlkTarget-state.finishAlk)*.07;
    const bufferFactor=Math.pow(70/Math.max(30,state.settledAlk),.30);
    const finalPHTarget=postCoagPH+effectiveCaustic*.055*bufferFactor+Math.max(-.10,Math.min(.10,(state.finishAlk-60)*.002));
    state.finishPH += (finalPHTarget-state.finishPH)*.065;`,'caustic response');

  rep(
`    if(state.finishPH<7.5||state.finishPH>8.8)qPenalty+=.03;
    if(online.length<5 && flow>14)qPenalty+=.04;`,
`    if(state.finishPH<7.5||state.finishPH>8.8)qPenalty+=.03;
    if(state.finishAlk<44)qPenalty+=(44-state.finishAlk)*.0025;
    if(online.length<5 && flow>14)qPenalty+=.04;`,'alk score');

  rep(
`    if(state.finishCl>3.6) alarm('clhigh','med','Finished disinfectant high','Avoid unnecessary overfeed.');
    else if(state.finishCl<3.3) clearAlarm('clhigh',true);`,
`    if(state.finishCl>3.6) alarm('clhigh','med','Finished disinfectant high','Avoid unnecessary overfeed.');
    else if(state.finishCl<3.3) clearAlarm('clhigh',true);
    if(state.finishPH<7.55) alarm('phlow','med','Finished-water pH low','Verify pH and alkalinity, source conditions, ferric demand and caustic feed response.');
    else if(state.finishPH>7.70) clearAlarm('phlow',true);
    if(state.finishPH>8.90) alarm('phhigh','med','Finished-water pH high','Review caustic trim and confirm the pH result before further adjustment.');
    else if(state.finishPH<8.75) clearAlarm('phhigh',true);
    if(state.finishAlk<44) alarm('alklow','med','Finished-water alkalinity low','Verify alkalinity and pH and review caustic/ferric balance.');
    else if(state.finishAlk>48) clearAlarm('alklow',true);`,'chem alarms');

  rep(
`      <div class="labres"><span>Finished disinfectant</span><b>\${state.finishCl.toFixed(2)} mg/L</b></div>
      <div class="labres"><span>Finished pH</span><b>\${state.finishPH.toFixed(2)}</b></div>
      <div class="labres"><span>Sim free ammonia</span><b>\${freeAmmonia.toFixed(2)} mg/L</b></div>
      <div class="labres"><span>Raw TOC index</span><b>\${state.rawTOC.toFixed(1)}</b></div>`,
`      <div class="labres"><span>Finished disinfectant</span><b>\${state.finishCl.toFixed(2)} mg/L</b></div>
      <div class="labres"><span>Raw pH</span><b>\${state.rawPH.toFixed(2)}</b></div>
      <div class="labres"><span>Raw alkalinity</span><b>\${state.rawAlk.toFixed(0)} mg/L as CaCO₃</b></div>
      <div class="labres"><span>Post-coag alkalinity</span><b>\${state.settledAlk.toFixed(0)} mg/L as CaCO₃</b></div>
      <div class="labres"><span>Finished pH</span><b>\${state.finishPH.toFixed(2)}</b></div>
      <div class="labres"><span>Finished alkalinity</span><b>\${state.finishAlk.toFixed(0)} mg/L as CaCO₃</b></div>
      <div class="labres"><span>Caustic dose SP</span><b>\${(+controls.caustic.value).toFixed(1)} mg/L</b></div>
      <div class="labres"><span>Sim free ammonia</span><b>\${freeAmmonia.toFixed(2)} mg/L</b></div>
      <div class="labres"><span>Raw TOC index</span><b>\${state.rawTOC.toFixed(1)}</b></div>`,'lab');

  source=source
    .replace("if(state.event==='analyzer'||state.event==='clfeed') state.response=Math.min(100,state.response+1);",
             "if(['analyzer','clfeed','alkshift','causticfeed'].includes(state.event)) state.response=Math.min(100,state.response+1);")
    .replace("const phTarget=+controls.ph.value;","const causticDose=+controls.caustic.value;")
    .replace("const flow=+controls.flow.value, blend=+controls.blend.value, coag=+controls.coag.value, ozone=+controls.ozone.value, chlorine=+controls.chlorine.value, ammonia=+controls.ammonia.value, ph=+controls.ph.value;",
             "const flow=+controls.flow.value, blend=+controls.blend.value, coag=+controls.coag.value, ozone=+controls.ozone.value, chlorine=+controls.chlorine.value, ammonia=+controls.ammonia.value, caustic=+controls.caustic.value;")
    .replace("$('ozoneRead').textContent=ozone.toFixed(1)+' mg/L';$('chlorineRead').textContent=chlorine.toFixed(1)+' mg/L';$('ammoniaRead').textContent=ammonia.toFixed(2)+' mg/L';$('phRead').textContent=ph.toFixed(2);$('speedRead').textContent=(+controls.speed.value===1?'30 sec/s':'1 min/s');",
             "$('ozoneRead').textContent=ozone.toFixed(1)+' mg/L';$('chlorineRead').textContent=chlorine.toFixed(1)+' mg/L';$('ammoniaRead').textContent=ammonia.toFixed(2)+' mg/L';$('causticRead').textContent=caustic.toFixed(1)+' mg/L';$('speedRead').textContent=(+controls.speed.value===1?'30 sec/s':'1 min/s');");

  rep(
`    const ammoniaLbDay=toLbDay(ammoniaDose);

    $('ferricDoseSP')`,
`    const ammoniaLbDay=toLbDay(ammoniaDose);
    const causticLbDay=toLbDay(causticDose);
    const causticEquivalentLbPerGal=6.4;

    $('ferricDoseSP')`,'mass');

  rep(
`    $('phTargetSP').textContent=phTarget.toFixed(2);
    $('chemPHStatus').textContent=state.finishPH.toFixed(2);
    $('phPumpPct').textContent=Math.round(Math.min(100,15+Math.max(0,phTarget-7.2)*32))+'%';`,
`    $('causticDoseSP').textContent=causticDose.toFixed(1)+' mg/L';
    $('causticLbMG').textContent=toLbMG(causticDose).toFixed(1)+' lb/MG';
    $('causticLbDay').textContent=Math.round(causticLbDay).toLocaleString()+' lb/day';
    $('causticGPH').textContent=(causticLbDay/causticEquivalentLbPerGal/24).toFixed(1)+' gal/hr';
    $('causticPumpPct').textContent=Math.round(Math.min(100,8+causticDose/20*84))+'%';
    $('chemRawAlk').textContent=Math.round(state.rawAlk)+' mg/L as CaCO₃';
    $('chemFinishAlk').textContent=Math.round(state.finishAlk)+' mg/L as CaCO₃';
    $('chemPHStatus').textContent=state.finishPH.toFixed(2);
    $('rawPHPV').textContent=state.rawPH.toFixed(2);
    $('rawAlkPV').textContent=Math.round(state.rawAlk)+' mg/L as CaCO₃';
    $('settledAlkPV').textContent=Math.round(state.settledAlk)+' mg/L as CaCO₃';
    $('finishPHPV').textContent=state.finishPH.toFixed(2);
    $('finishAlkPV').textContent=Math.round(state.finishAlk)+' mg/L as CaCO₃';`,'chem display');

  source=source
    .replace("'storm','odor','ozfault','clfeed','coagfeed','analyzer'",
             "'storm','odor','ozfault','clfeed','coagfeed','alkshift','causticfeed','analyzer'")
    .replace("controls.ph.value=(Math.round(shiftRnd(7.8,8.5)*10)/10).toFixed(1);",
             "controls.caustic.value=(Math.round(shiftRnd(5,12.5)*2)/2).toFixed(1);")
    .replace("state.rawTurb=shiftRnd(2.0,5.8);state.rawTOC=shiftRnd(2.5,4.0);state.odor=shiftRnd(.7,1.4);",
             "state.rawTurb=shiftRnd(2.0,5.8);state.rawTOC=shiftRnd(2.5,4.0);state.odor=shiftRnd(.7,1.4);state.rawPH=shiftRnd(7.35,7.95);state.rawAlk=shiftRnd(48,98);state.settledAlk=Math.max(20,state.rawAlk-(+controls.coag.value)*.8);state.finishAlk=state.settledAlk+(+controls.caustic.value)*1.25;")
    .replace("state.settled=shiftRnd(.34,.78);state.filtered=shiftRnd(.045,.095);state.finishCl=shiftRnd(1.55,2.85);state.finishPH=shiftRnd(7.75,8.55);",
             "state.settled=shiftRnd(.34,.78);state.filtered=shiftRnd(.045,.095);state.finishCl=shiftRnd(1.55,2.85);state.finishPH=shiftRnd(7.75,8.35);")
    .replace("const inherited=shiftShuffle(['filter','bwbasin','chlorine','raw','storage','pfas']);",
             "const inherited=shiftShuffle(['filter','bwbasin','chlorine','raw','alkalinity','storage','pfas']);")
    .replace("if(x==='raw'){state.rawTurb=shiftRnd(5.8,8.8);log('Handoff: raw-water turbidity is elevated.');}",
             "if(x==='raw'){state.rawTurb=shiftRnd(5.8,8.8);log('Handoff: raw-water turbidity is elevated.');}if(x==='alkalinity'){state.rawAlk=shiftRnd(38,50);state.rawPH=shiftRnd(7.2,7.5);state.settledAlk=Math.max(18,state.rawAlk-(+controls.coag.value)*.8);state.finishAlk=state.settledAlk+(+controls.caustic.value)*1.25;log('Handoff: source alkalinity/pH begins lower than usual for this game shift.');}");

  source=source.replace(
    'Thornton WTP Operator Simulator V10 · SCADA-style training fiction.',
    'Thornton WTP Operator Simulator V13 · SCADA-style training fiction. Dynamic pH/alkalinity and caustic trim are generalized training models, not actual Thornton control logic.'
  );
  return source;
}
