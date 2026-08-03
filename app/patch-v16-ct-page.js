function patchSimulatorSourceV16CTPage(source){
  source=source
    .replace(/Thornton WTP Operator Simulator V16\.9\.1 TEST[^<\n]*/g,'Thornton WTP Operator Simulator V16.10 TEST — Dynamic CT Page')
    .replace('THORNTON WTP // OPERATOR SIM V16.9.1 TEST','THORNTON WTP // OPERATOR SIM V16.10 TEST');

  const css=`
  /* V16.10 — dynamic chlorine-contact CT page. Public Thornton layout facts + generalized training assumptions. */
  .ct10-banner{display:flex;justify-content:space-between;gap:18px;align-items:center;padding:13px 15px;background:#14232a;border-bottom:1px solid #31505a}
  .ct10-banner b{font-size:12px;letter-spacing:.08em}.ct10-banner span{font-size:10px;color:#93a8b3;text-align:right;line-height:1.4}
  .ct10-route{display:grid;grid-template-columns:1fr auto 1.15fr auto 1fr auto 1.1fr;gap:8px;align-items:center;padding:15px}
  .ct10-unit{min-height:82px;border:1px solid #40505a;background:#182128;border-radius:11px;padding:11px;display:flex;flex-direction:column;justify-content:center;text-align:center}
  .ct10-unit small{font-size:8px;color:#899ba6;letter-spacing:.08em}.ct10-unit b{font-size:12px;margin-top:4px}.ct10-unit em{font-size:9px;color:#a9bac3;font-style:normal;margin-top:4px}.ct10-arrow{color:#42d8c8;font-weight:800;font-size:18px;text-align:center}
  .ct10-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;padding:14px}.ct10-stat{background:#10181e;border:1px solid #35434d;border-radius:11px;padding:11px}.ct10-stat small{display:block;color:#8fa0aa;font-size:9px}.ct10-stat b{display:block;font-size:20px;margin-top:4px}.ct10-stat span{display:block;color:#92a5af;font-size:9px;margin-top:3px;line-height:1.35}
  .ct10-status{display:inline-flex;align-items:center;gap:7px;font-weight:800}.ct10-dot{width:9px;height:9px;border-radius:50%;background:#7d8b94}.ct10-status.good .ct10-dot{background:#45d17d}.ct10-status.watch .ct10-dot{background:#ffc857}.ct10-status.low .ct10-dot{background:#ff6b6b}.ct10-status.off .ct10-dot{background:#7d8b94}
  .ct10-two{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:0 14px 14px}.ct10-panel{background:#10181e;border:1px solid #35434d;border-radius:11px;padding:12px}.ct10-panel h3{font-size:11px;letter-spacing:.06em;margin:0 0 10px}.ct10-formula{display:grid;grid-template-columns:1fr auto;gap:6px 12px;font-size:10px;line-height:1.5}.ct10-formula span{color:#91a4ae}.ct10-formula b{text-align:right}.ct10-note{font-size:10px;color:#92a5af;line-height:1.5}.ct10-note strong{color:#dce8ed}
  .ct10-trend{height:150px;margin:0 14px 14px;border:1px solid #35434d;border-radius:11px;background:#0d1419;padding:8px}.ct10-trend svg{width:100%;height:100%;display:block}
  .ct10-bar{height:8px;background:#0b1115;border-radius:99px;overflow:hidden;margin-top:8px}.ct10-bar i{display:block;height:100%;width:0;background:#45d17d;transition:width .3s}
  @media(max-width:980px){.ct10-grid{grid-template-columns:repeat(2,1fr)}.ct10-route{grid-template-columns:1fr}.ct10-arrow{transform:rotate(90deg)}.ct10-two{grid-template-columns:1fr}}
  @media(max-width:620px){.ct10-grid{grid-template-columns:1fr}.ct10-banner{align-items:flex-start;flex-direction:column}.ct10-banner span{text-align:left}}
  `;
  source=source.replace('</style>',css+'\n</style>');

  const oldChemNav='<button class="nav-btn" data-page="chemicals"><span>06</span> Ozone / Chemicals</button>';
  const newChemNav=oldChemNav+'\n<button class="nav-btn" data-page="ct"><span>07</span> CT / Disinfection</button>';
  if(!source.includes(oldChemNav))throw new Error('V16.10 CT page could not locate the Chemicals navigation button.');
  source=source.replace(oldChemNav,newChemNav);
  source=source
    .replace('<button class="nav-btn" data-page="distribution"><span>07</span> Distribution</button>','<button class="nav-btn" data-page="distribution"><span>08</span> Distribution</button>')
    .replace('<button class="nav-btn" data-page="tanks"><span>08</span> Tanks</button>','<button class="nav-btn" data-page="tanks"><span>09</span> Tanks</button>')
    .replace('<button class="nav-btn" data-page="pumps"><span>09</span> Pump Stations</button>','<button class="nav-btn" data-page="pumps"><span>10</span> Pump Stations</button>')
    .replace('<button class="nav-btn nav-alarm-btn" data-page="alarms"><span>10</span> Alarm Summary <i id="navAlarmCount">0</i></button>','<button class="nav-btn nav-alarm-btn" data-page="alarms"><span>11</span> Alarm Summary <i id="navAlarmCount">0</i></button>')
    .replace('<button class="nav-btn" data-page="log"><span>11</span> Operator Log</button>','<button class="nav-btn" data-page="log"><span>12</span> Operator Log</button>');

  const ctPage=`<section class="scada-page" data-page-id="ct">
<div class="card scada-card">
  <div class="ct10-banner"><b>CHLORINE CONTACT / CT MONITOR</b><span>Thornton-like training structure using the publicly described DCC. Live values are simulator calculations, not actual Thornton operating data.</span></div>
  <div class="ct10-route">
    <div class="ct10-unit"><small>FILTER EFFLUENT</small><b id="ct10RouteFlow">-- MGD</b><em>after modeled BW makeup diversion</em></div><div class="ct10-arrow">→</div>
    <div class="ct10-unit"><small>DCC INLET</small><b>FREE CHLORINE ADDED</b><em id="ct10Dose">dose SP -- mg/L</em></div><div class="ct10-arrow">→</div>
    <div class="ct10-unit"><small>CONTACT CHAMBER</small><b>1.09 MG DCC</b><em>serpentine contact · public plant description</em></div><div class="ct10-arrow">→</div>
    <div class="ct10-unit"><small>DCC OUTLET</small><b id="ct10OutletCl">-- mg/L FREE Cl</b><em>CT endpoint before modeled chloramination</em></div>
  </div>
</div>
<div class="card scada-card">
  <div class="section-title">LIVE CT CALCULATION</div>
  <div class="page-inline-note">C × T calculation follows standard surface-water disinfection concepts. The baffling factor and total plant regulatory credits are deliberately generalized.</div>
  <div class="ct10-grid">
    <div class="ct10-stat"><small>DCC FLOW</small><b id="ct10Flow">-- MGD</b><span>effective modeled flow entering chlorine contact</span></div>
    <div class="ct10-stat"><small>OUTLET FREE CHLORINE — C</small><b id="ct10C">-- mg/L</b><span>modeled residual before ammonia addition</span></div>
    <div class="ct10-stat"><small>CONTACT WATER pH</small><b id="ct10PH">--</b><span>modeled pH at chlorine contact stage</span></div>
    <div class="ct10-stat"><small>WATER TEMPERATURE</small><b id="ct10Temp">-- °C</b><span>shift-varying training value</span></div>
    <div class="ct10-stat"><small>THEORETICAL DETENTION</small><b id="ct10Theo">-- min</b><span>1.09 MG ÷ flow × 1440</span></div>
    <div class="ct10-stat"><small>EFFECTIVE T10</small><b id="ct10T10">-- min</b><span>theoretical time × training baffling factor</span></div>
    <div class="ct10-stat"><small>CT ACHIEVED</small><b id="ct10Achieved">--</b><span>mg·min/L = outlet free Cl × T10</span></div>
    <div class="ct10-stat"><small>FULL 3-LOG REFERENCE CT</small><b id="ct10Required">--</b><span>free-chlorine Giardia reference interpolated for C, pH and temperature</span></div>
    <div class="ct10-stat"><small>REFERENCE RATIO</small><b id="ct10Ratio">--</b><span>CT achieved ÷ full 3-log reference</span><div class="ct10-bar"><i id="ct10RatioBar"></i></div></div>
    <div class="ct10-stat"><small>CHLORINE-STAGE LOG INDEX</small><b id="ct10Log">-- log</b><span>training equivalent against the full 3-log reference</span></div>
    <div class="ct10-stat"><small>CT STATUS</small><b class="ct10-status off" id="ct10Status"><i class="ct10-dot"></i><span>--</span></b><span id="ct10StatusNote">waiting for valid process flow</span></div>
    <div class="ct10-stat"><small>BAFFLING FACTOR</small><b id="ct10BF">0.70</b><span>fictionalized training value; not Thornton's approved tracer-study factor</span></div>
  </div>
</div>
<div class="card scada-card">
  <div class="section-title">CT TREND — LAST MODELED PERIOD</div>
  <div class="ct10-trend"><svg id="ct10Trend" preserveAspectRatio="none" viewBox="0 0 900 130"></svg></div>
</div>
<div class="card scada-card">
  <div class="section-title">HOW THIS PAGE CALCULATES CT</div>
  <div class="ct10-two">
    <div class="ct10-panel"><h3>CALCULATION PATH</h3><div class="ct10-formula">
      <span>Chamber volume</span><b>1.09 MG</b>
      <span>Theoretical detention</span><b>V ÷ Q × 1440</b>
      <span>Training T10</span><b>detention × 0.70</b>
      <span>CTcalc</span><b>C × T10</b>
      <span>Reference ratio</span><b>CTcalc ÷ CT99.9</b>
    </div></div>
    <div class="ct10-panel"><h3>DYNAMIC INPUTS</h3><div class="ct10-note"><strong>Flow:</strong> plant flow, valve consequences and backwash-basin makeup change DCC flow and contact time.<br><strong>Free chlorine:</strong> chlorine dose, modeled chlorine demand, feed deviations and power conditions change the DCC outlet residual.<br><strong>pH:</strong> source chemistry and coagulation change the modeled pH entering disinfection.<br><strong>Temperature:</strong> the shift has a slowly varying source-water temperature; colder water raises the full-reference CT requirement.</div></div>
    <div class="ct10-panel"><h3>THORNTON-LIKE FEATURES</h3><div class="ct10-note">Public Thornton information describes filtered water being diverted to the backwash supply basin <strong>before disinfectant addition</strong>, with most filtered water then entering a <strong>1.09-million-gallon DCC</strong>. Disinfectant is added at the DCC beginning and converted to chloramines at the end. This game follows that sequence.</div></div>
    <div class="ct10-panel"><h3>IMPORTANT TRAINING LIMIT</h3><div class="ct10-note">The displayed CT99.9 comparison is a <strong>full 3-log free-chlorine benchmark</strong>, not Thornton's actual required chlorine credit. Thornton uses multiple treatment barriers. Actual approved baffling factors, tracer-study results, UV/ozone credits, compliance setpoints and operating procedures are not reproduced.</div></div>
  </div>
</div>
</section>`;

  const distributionMarker='</section><section class="scada-page" data-page-id="distribution">';
  if(!source.includes(distributionMarker))throw new Error('V16.10 CT page could not locate the Distribution page insertion point.');
  source=source.replace(distributionMarker,'</section>'+ctPage+'<section class="scada-page" data-page-id="distribution">');

  const chemMeta="    chemicals:['SCADA / CHEMICALS','Ozone / Chemicals','Dose setpoints, caustic pH/alkalinity trim, equivalent lb/MG, calculated lb/day demand, feed delivery and process response.'],";
  const ctMeta=chemMeta+"\n    ct:['SCADA / DISINFECTION','CT / Contact Time','Dynamic chlorine-contact CT using modeled DCC flow, outlet free chlorine residual, contact pH and water temperature.'],";
  if(!source.includes(chemMeta))throw new Error('V16.10 CT page could not locate page metadata.');
  source=source.replace(chemMeta,ctMeta);

  const runtime=`

  // V16.10 TEST — dynamic CT calculation. Uses public DCC volume/layout and generalized training assumptions.
  const V1610_DCC_MG=1.09;
  const V1610_BAFFLE=.70; // deliberately fictionalized; not Thornton's approved tracer-study factor.
  const V1610_PHS=[6.5,7.0,7.5,8.0,8.5];
  const V1610_CS=[.4,1.0,2.0,3.0];
  const V1610_CT_TABLES={
    5:[ [117,139,166,198,236],[125,149,179,216,260],[138,165,200,243,294],[151,182,221,268,324] ],
    10:[[88,104,125,149,177],[94,112,134,162,195],[104,124,150,182,221],[113,137,166,201,243]],
    15:[[59,70,83,99,118],[63,75,90,108,130],[69,83,100,122,147],[76,91,111,134,162]],
    20:[[44,52,62,74,89],[47,56,67,81,98],[52,62,75,91,110],[57,68,83,101,122]]
  };

  function v1610Clamp(v,a,b){return Math.max(a,Math.min(b,v))}
  function v1610Interp(xs,ys,x){
    x=v1610Clamp(x,xs[0],xs[xs.length-1]);
    for(let i=0;i<xs.length-1;i++){
      if(x<=xs[i+1]){const f=(x-xs[i])/(xs[i+1]-xs[i]);return ys[i]+(ys[i+1]-ys[i])*f;}
    }
    return ys[ys.length-1];
  }
  function v1610ReferenceAtTemp(tempKey,c,ph){
    const table=V1610_CT_TABLES[tempKey];
    const byC=table.map(row=>v1610Interp(V1610_PHS,row,ph));
    return v1610Interp(V1610_CS,byC,c);
  }
  function v1610RequiredCT(c,ph,temp){
    const temps=[5,10,15,20];temp=v1610Clamp(temp,5,20);
    for(let i=0;i<temps.length-1;i++){
      if(temp<=temps[i+1]){
        const lo=temps[i],hi=temps[i+1],f=(temp-lo)/(hi-lo);
        const a=v1610ReferenceAtTemp(lo,c,ph),b=v1610ReferenceAtTemp(hi,c,ph);
        return a+(b-a)*f;
      }
    }
    return v1610ReferenceAtTemp(20,c,ph);
  }
  function v1610ContactPH(){
    const effectiveCoag=(+controls.coag.value)*(state.event==='coagfeed'?.72:1);
    const ph=state.rawPH-(effectiveCoag*.012)*Math.sqrt(65/Math.max(30,state.rawAlk))+.03;
    return v1610Clamp(ph,6.3,8.8);
  }
  function v1610FreeClTarget(){
    let dose=(+controls.chlorine.value)*(state.event==='clfeed'?.75:1);
    const demand=.55+state.rawTOC*.18+state.filtered*2.2;
    let target=Math.max(.05,dose-demand);
    if(state.event==='power')target*=.82;
    return v1610Clamp(target,.05,3.6);
  }
  function v1610DccFlow(){
    const requested=+controls.flow.value;
    const factor=typeof s16ValveFlowFactor==='function'?s16ValveFlowFactor():1;
    return Math.max(0,requested*factor-(state.bwMakeupMGD||0));
  }
  function v1610FlowValid(flow){
    const m=state.hmiManualValves||{};
    if(m.tr_raw==='CLOSED'||m.tr_finish==='CLOSED'||m.pfas_in==='CLOSED'||m.pfas_out==='CLOSED')return false;
    return flow>=.5;
  }
  function v1610ResetCT(){
    const warm=state.shiftProfile&&/Warm/i.test(state.shiftProfile.name);
    const start=warm?14+Math.random()*4:5.5+Math.random()*10.5;
    state.ct={tempBase:v1610Clamp(start,5,19),tempC:v1610Clamp(start,5,19),freeCl:v1610FreeClTarget(),history:[]};
    const c=v1610CalcCT();state.ct.history.push({m:state.minute,ct:c.achieved,req:c.required,ratio:c.ratio});
  }
  function v1610EnsureCT(){if(!state.ct||!Number.isFinite(state.ct.tempC)||!Number.isFinite(state.ct.freeCl))v1610ResetCT()}
  function v1610CalcCT(){
    v1610EnsureCT();
    const flow=v1610DccFlow();
    const valid=v1610FlowValid(flow);
    const ph=v1610ContactPH();
    const temp=v1610Clamp(state.ct.tempC,5,20);
    const c=v1610Clamp(state.ct.freeCl,.01,4);
    const theoretical=valid?(V1610_DCC_MG/flow)*1440:0;
    const t10=theoretical*V1610_BAFFLE;
    const achieved=valid?c*t10:0;
    const required=v1610RequiredCT(c,ph,temp);
    const ratio=required>0?achieved/required:0;
    const logIndex=v1610Clamp(ratio*3,0,3);
    return {flow,valid,ph,temp,c,theoretical,t10,achieved,required,ratio,logIndex};
  }
  function v1610UpdateCTMinute(){
    v1610EnsureCT();
    const blend=+controls.blend.value/100;
    const tempTarget=v1610Clamp(state.ct.tempBase+(1-blend)*.7+Math.sin(state.minute/155)*.35,5,20);
    state.ct.tempC+=(tempTarget-state.ct.tempC)*.018;
    const targetCl=v1610FreeClTarget();
    state.ct.freeCl+=(targetCl-state.ct.freeCl)*.09;
    if(state.minute%5===0){
      const c=v1610CalcCT();state.ct.history.push({m:state.minute,ct:c.achieved,req:c.required,ratio:c.ratio});
      if(state.ct.history.length>144)state.ct.history.shift();
    }
  }
  function v1610DrawTrend(calc){
    const svg=$('ct10Trend');if(!svg)return;
    const h=(state.ct&&state.ct.history)||[];
    const rows=h.length?h:[{m:state.minute,ct:calc.achieved,req:calc.required}];
    if(rows.length<2){svg.innerHTML='<text x="450" y="65" text-anchor="middle" fill="#81949f" font-size="11">CT trend begins as simulated time advances.</text>';return}
    const max=Math.max(50,...rows.map(x=>Math.max(x.ct,x.req)))*1.12;
    const n=rows.length-1;
    const pts=(key)=>rows.map((r,i)=>((i/n)*880+10)+','+(120-(Math.min(max,r[key])/max)*105)).join(' ');
    svg.innerHTML='<line x1="10" y1="120" x2="890" y2="120" stroke="#33424b"/><polyline points="'+pts("req")+'" fill="none" stroke="#ffc857" stroke-width="2" stroke-dasharray="6 5"/><polyline points="'+pts("ct")+'" fill="none" stroke="#45d17d" stroke-width="2.6"/><text x="82" y="13" fill="#45d17d" font-size="9">CT achieved</text><text x="210" y="13" fill="#ffc857" font-size="9">full-reference CT</text>';
  }
  function v1610RenderCT(){
    if(!$('ct10Flow'))return;
    const c=v1610CalcCT();
    $('ct10RouteFlow').textContent=c.flow.toFixed(1)+' MGD';
    $('ct10Dose').textContent='dose SP '+(+controls.chlorine.value).toFixed(1)+' mg/L';
    $('ct10OutletCl').textContent=c.c.toFixed(2)+' mg/L FREE Cl';
    $('ct10Flow').textContent=c.flow.toFixed(1)+' MGD';
    $('ct10C').textContent=c.c.toFixed(2)+' mg/L';
    $('ct10PH').textContent=c.ph.toFixed(2);
    $('ct10Temp').textContent=c.temp.toFixed(1)+' °C';
    $('ct10Theo').textContent=c.valid?c.theoretical.toFixed(1)+' min':'—';
    $('ct10T10').textContent=c.valid?c.t10.toFixed(1)+' min':'—';
    $('ct10Achieved').textContent=c.valid?c.achieved.toFixed(0)+' mg·min/L':'—';
    $('ct10Required').textContent=c.required.toFixed(0)+' mg·min/L';
    $('ct10Ratio').textContent=c.valid?c.ratio.toFixed(2):'—';
    $('ct10Log').textContent=c.valid?c.logIndex.toFixed(2)+' log':'—';
    $('ct10BF').textContent=V1610_BAFFLE.toFixed(2);
    const bar=$('ct10RatioBar');if(bar)bar.style.width=(c.valid?Math.min(100,c.ratio*100):0)+'%';
    const st=$('ct10Status');const note=$('ct10StatusNote');
    st.classList.remove('good','watch','low','off');
    if(!c.valid){st.classList.add('off');st.querySelector('span').textContent='NO VALID THROUGH-FLOW';note.textContent='An isolation or very low modeled DCC flow makes the flowing-water CT calculation unavailable.';}
    else if(c.ratio>=1){st.classList.add('good');st.querySelector('span').textContent='ABOVE FULL BENCHMARK';note.textContent='Chlorine-stage CT is at or above the displayed full 3-log free-chlorine reference.';}
    else if(c.ratio>=.65){st.classList.add('watch');st.querySelector('span').textContent='PARTIAL vs FULL BENCHMARK';note.textContent='This does not indicate Thornton noncompliance; the displayed benchmark intentionally ignores other approved treatment credits.';}
    else{st.classList.add('low');st.querySelector('span').textContent='LOW vs FULL BENCHMARK';note.textContent='Review modeled flow, free-chlorine residual, pH and temperature. Full-plant regulatory credit is not modeled here.';}
    v1610DrawTrend(c);
  }

  const v1610BaseSimulateMinute=simulateMinute;
  simulateMinute=function(){const r=v1610BaseSimulateMinute();v1610UpdateCTMinute();return r};
  const v1610BaseRender=render;
  render=function(){const r=v1610BaseRender();v1610RenderCT();return r};
  const v1610BaseInit=initializeRandomShift;
  initializeRandomShift=function(){const r=v1610BaseInit();v1610ResetCT();return r};
  const v1610BaseSetPage=setPage;
  setPage=function(id){const r=v1610BaseSetPage(id);if(id==='ct')v1610RenderCT();return r};

  v1610ResetCT();
  setTimeout(v1610RenderCT,250);
  `;

  const marker='\n})();';
  const pos=source.lastIndexOf(marker);
  if(pos<0)throw new Error('V16.10 CT page could not locate the simulator IIFE closing marker.');
  source=source.slice(0,pos)+runtime+source.slice(pos);
  return source;
}
