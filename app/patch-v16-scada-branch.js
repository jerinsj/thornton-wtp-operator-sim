function patchSimulatorSourceV16ScadaBranch(source){
  source=source
    .replace(/Thornton WTP Operator Simulator V16\.4[^<\n]*/g,'Thornton WTP Operator Simulator V16.5 TEST — Scoped Interactive SCADA')
    .replace('THORNTON WTP // OPERATOR SIM V16.4','THORNTON WTP // OPERATOR SIM V16.5 TEST');

  const css=`
  .s16-card{margin:0 0 16px;background:#141b21;border:1px solid #35424c;border-radius:12px;overflow:hidden;box-shadow:0 8px 24px rgba(0,0,0,.22)}
  .s16-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:12px 14px 8px}
  .s16-head b{font-size:12px;letter-spacing:.07em;color:#eef4f7}.s16-head span{font-size:10px;color:#8fa1ad;line-height:1.4;text-align:right}
  .s16-wrap{padding:6px 12px 12px}.s16-svg{display:block;width:100%;height:auto;background:#0f151a;border:1px solid #2d3942;border-radius:10px}
  .s16-svg .pipe{stroke:#2fd5c4;stroke-width:6;fill:none;stroke-linecap:round}.s16-svg .pipe.dim{stroke:#42535e;stroke-width:4}
  .s16-svg .unit{fill:#202a31;stroke:#52636f;stroke-width:2}.s16-svg .filter{fill:#233329}.s16-svg .gac{fill:#313826}.s16-svg .zone{fill:#252d34}.s16-svg .tank-shell{fill:#202a31;stroke:#52636f;stroke-width:2}
  .s16-svg text{font-family:"Segoe UI",Arial,sans-serif;text-anchor:middle;dominant-baseline:middle;fill:#e9eff2}.s16-svg .label{font-size:12px;font-weight:700}.s16-svg .sub{font-size:9px;fill:#95a5af}.s16-svg .status{font-size:8px;font-weight:700}
  .s16-fill{fill:#2d92c4;opacity:.62;transition:y .6s,height .6s}
  .s16-v{cursor:pointer}.s16-v circle{fill:#262f36;stroke:#7c8b95;stroke-width:2.3;transition:.3s}.s16-v path{stroke:#eef3f5;stroke-width:2.2;transform-box:fill-box;transform-origin:center;transition:.4s}.s16-v .status{fill:#9fb0ba}
  .s16-v.open circle{fill:#173b29;stroke:#45d17d}.s16-v.open path{transform:rotate(90deg)}.s16-v.open .status{fill:#6ee79c}
  .s16-v.moving circle{fill:#4b3d17;stroke:#ffc857;animation:s16pulse .55s infinite alternate}.s16-v.moving .status{fill:#ffd879}
  .s16-v.fault circle{fill:#4b2026;stroke:#ff6b6b;animation:s16pulse .45s infinite alternate}.s16-v.fault .status{fill:#ff8f8f}
  .s16-p circle{fill:#252e35;stroke:#758590;stroke-width:2.3}.s16-p .status{fill:#9fb0ba}.s16-p.run circle{fill:#173b29;stroke:#45d17d;animation:s16pulse 1s infinite alternate}.s16-p.run .status{fill:#6ee79c}.s16-p.trip circle{fill:#4b2026;stroke:#ff6b6b;animation:s16pulse .45s infinite alternate}.s16-p.trip .status{fill:#ff8f8f}
  .s16-legend{display:flex;gap:12px;flex-wrap:wrap;padding:0 14px 12px;font-size:9px;color:#93a4ae}.s16-legend i{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:4px}.s16-legend .g{background:#45d17d}.s16-legend .n{background:#7c8b95}.s16-legend .y{background:#ffc857}.s16-legend .r{background:#ff6b6b}
  .s16-test-banner{padding:8px 12px;background:#17252b;border-bottom:1px solid #2d4c55;color:#8ed9d1;font-size:10px;letter-spacing:.08em;font-weight:700}
  @keyframes s16pulse{to{filter:brightness(1.35)}}
  `;
  source=source.replace('</style>',css+'\n</style>');

  // Remove the original V16 runtime that was appended after the simulator IIFE.
  // It cannot see state/controls and is the root cause of the missing SCADA layer.
  const deadStart=source.indexOf('\n  state.homePaused=true;state.hmiManualValves=');
  const scriptEnd=source.lastIndexOf('</script>');
  if(deadStart>0 && scriptEnd>deadStart){
    source=source.slice(0,deadStart)+'\n  // V16 legacy out-of-scope runtime removed by branch test patch.\n'+source.slice(scriptEnd);
  }

  const runtime=`

  // V16.5 TEST — interactive SCADA lives inside the simulator IIFE.
  state.hmiManualValves=state.hmiManualValves||{};
  state.hmiValveTransitions=state.hmiValveTransitions||{};

  const s16Valve=(key,x,y,manual=false)=>\`<g class="s16-v" data-s16v="\${key}" data-manual="\${manual?1:0}" transform="translate(\${x} \${y})"><circle r="16"/><path d="M-10 -10 L10 10 M10 -10 L-10 10"/><text class="status" y="27">--</text></g>\`;
  const s16Pump=(key,x,y,label='P')=>\`<g class="s16-p" data-s16p="\${key}" transform="translate(\${x} \${y})"><circle r="20"/><text class="label">\${label}</text><text class="status" y="31">OFF</text></g>\`;
  const s16Card=(title,note,svg)=>\`<div class="s16-card"><div class="s16-test-banner">BRANCH TEST — INTERACTIVE SCADA</div><div class="s16-head"><b>\${title}</b><span>\${note}</span></div><div class="s16-wrap">\${svg}</div><div class="s16-legend"><span><i class="g"></i>OPEN / RUN</span><span><i class="n"></i>CLOSED / OFF</span><span><i class="y"></i>MOVING</span><span><i class="r"></i>FAULT / TRIP</span><span>Generalized training graphics only.</span></div></div>\`;

  function s16Treatment(){
    return \`<svg class="s16-svg" viewBox="0 0 1050 230"><line class="pipe" x1="55" y1="115" x2="995" y2="115"/><rect class="unit" x="20" y="70" width="100" height="90" rx="10"/><text class="label" x="70" y="105">RAW</text>\${s16Valve('tr_raw',155,115,true)}<rect class="unit" x="205" y="55" width="135" height="120" rx="10"/><text class="label" x="272" y="102">COAG / FLOC</text>\${s16Valve('tr_settle',380,115,false)}<rect class="unit" x="425" y="55" width="130" height="120" rx="10"/><text class="label" x="490" y="102">SETTLING</text>\${s16Valve('tr_ozone',595,115,false)}<rect class="unit" x="635" y="65" width="95" height="100" rx="42"/><text class="label" x="682" y="105">OZONE</text>\${s16Valve('tr_filter',770,115,false)}<rect class="unit filter" x="810" y="55" width="115" height="120" rx="10"/><text class="label" x="867" y="102">FILTERS</text>\${s16Valve('tr_finish',965,115,true)}</svg>\`;
  }
  function s16Filters(){
    let boxes='';for(let i=0;i<6;i++){const x=35+i*145;boxes+=\`<rect class="unit filter" x="\${x}" y="70" width="110" height="85" rx="8"/><text class="label" x="\${x+55}" y="103">F\${i+1}</text><text class="sub" x="\${x+55}" y="128" data-s16filter="\${i}">--</text>\`;}
    return \`<svg class="s16-svg" viewBox="0 0 1050 250"><line class="pipe" x1="30" y1="40" x2="1000" y2="40"/><line class="pipe dim" x1="30" y1="205" x2="1000" y2="205"/>\${boxes}\${s16Valve('bw_influent',920,40,false)}\${s16Valve('bw_effluent',860,205,false)}\${s16Valve('bw_waste',925,205,false)}\${s16Valve('bw_air',990,115,false)}<text class="sub" x="990" y="155">BW SEQUENCE</text></svg>\`;
  }
  function s16Pfas(){
    return \`<svg class="s16-svg" viewBox="0 0 1050 230"><line class="pipe" x1="50" y1="115" x2="995" y2="115"/><rect class="unit filter" x="20" y="75" width="105" height="80" rx="10"/><text class="sub" x="72" y="115">FILTERED</text>\${s16Valve('pfas_in',165,115,true)}<rect class="unit gac" x="220" y="45" width="120" height="140" rx="48"/><text class="label" x="280" y="105">GAC A</text>\${s16Valve('pfas_mid1',385,115,false)}<rect class="unit gac" x="440" y="45" width="120" height="140" rx="48"/><text class="label" x="500" y="105">GAC B</text>\${s16Valve('pfas_mid2',605,115,false)}<rect class="unit gac" x="660" y="45" width="120" height="140" rx="48"/><text class="label" x="720" y="105">GAC C</text>\${s16Valve('pfas_out',825,115,true)}<rect class="unit" x="870" y="75" width="130" height="80" rx="10"/><text class="sub" x="935" y="105">TO</text><text class="label" x="935" y="125">DISINFECTION</text></svg>\`;
  }
  function s16Chemicals(){
    const chem=[['ferric','FERRIC',120],['ozone','OZONE',310],['chlorine','CHLORINE',500],['ammonia','AMMONIA',690],['caustic','CAUSTIC',880]];
    let x='<line class="pipe" x1="55" y1="200" x2="995" y2="200"/>';
    chem.forEach(([k,l,p])=>{x+=\`<rect class="unit" x="\${p-55}" y="35" width="110" height="85" rx="10"/><text class="sub" x="\${p}" y="77">\${l}</text>\${s16Pump('chem_'+k,p,155,'P')}\`;});
    return \`<svg class="s16-svg" viewBox="0 0 1050 240">\${x}</svg>\`;
  }
  function s16Distribution(){
    return \`<svg class="s16-svg" viewBox="0 0 1050 250"><line class="pipe" x1="50" y1="125" x2="995" y2="125"/><rect class="unit" x="20" y="80" width="110" height="90" rx="10"/><text class="label" x="75" y="115">TWTP</text>\${s16Pump('dist_main',185,125,'P')}\${s16Valve('dist_isolation',255,125,true)}<rect class="tank-shell" x="340" y="35" width="95" height="110" rx="14"/><rect class="s16-fill" data-s16fill="0" data-base="141" data-max="100" x="344" y="91" width="87" height="50"/><text class="sub" x="387" y="165" data-s16tl="0">T1 --%</text><rect class="tank-shell" x="500" y="105" width="95" height="110" rx="14"/><rect class="s16-fill" data-s16fill="1" data-base="211" data-max="100" x="504" y="161" width="87" height="50"/><text class="sub" x="547" y="230" data-s16tl="1">T2 --%</text>\${s16Valve('dist_prv',675,125,false)}<rect class="unit zone" x="750" y="75" width="230" height="100" rx="12"/><text class="label" x="865" y="112">PRESSURE ZONES</text><text class="sub" x="865" y="140">DEMAND / STORAGE / PRVs</text></svg>\`;
  }
  function s16Tanks(){
    let x='';for(let i=0;i<9;i++){const px=18+i*113;x+=\`<g><rect class="tank-shell" x="\${px}" y="35" width="82" height="145" rx="13"/><rect class="s16-fill" data-s16fill="\${i}" data-base="176" data-max="133" x="\${px+4}" y="110" width="74" height="66"/><text class="label" x="\${px+41}" y="59">T\${i+1}</text><text class="sub" x="\${px+41}" y="201" data-s16tl="\${i}">--%</text></g>\`;}
    return \`<svg class="s16-svg" viewBox="0 0 1050 225">\${x}</svg>\`;
  }
  function s16Pumps(){
    let x='<line class="pipe" x1="45" y1="120" x2="1005" y2="120"/>';
    for(let i=0;i<7;i++){const px=95+i*140;x+=s16Pump('ps_'+i,px,120,'P'+(i+1));if(i<6)x+=s16Valve('psv_'+i,px+70,120,false);}
    return \`<svg class="s16-svg" viewBox="0 0 1050 240">\${x}</svg>\`;
  }

  function s16Install(){
    const defs={
      treatment:['INTERACTIVE PROCESS SCHEMATIC','Live generalized process path; click selected training valves.',s16Treatment],
      filters:['FILTER / BACKWASH SCHEMATIC','Filter condition and backwash valve states follow the simulation.',s16Filters],
      pfas:['PFAS GAC SCHEMATIC','Future-state GAC mode and generalized valve indication.',s16Pfas],
      chemicals:['CHEMICAL FEED SCHEMATIC','Pump symbols follow simulated feed availability and dose demand.',s16Chemicals],
      distribution:['DISTRIBUTION SCHEMATIC','Live storage, pumping and PRV condition.',s16Distribution],
      tanks:['LIVE STORAGE SCHEMATIC','Nine modeled tank levels update continuously.',s16Tanks],
      pumps:['PUMP STATION SCHEMATIC','Seven modeled station run/off/trip states.',s16Pumps]
    };
    Object.entries(defs).forEach(([id,d])=>{
      const page=document.querySelector('.scada-page[data-page-id="'+id+'"]');
      if(page&&!page.querySelector('.s16-card'))page.insertAdjacentHTML('afterbegin',s16Card(d[0],d[1],d[2]()));
    });
  }

  function s16ValveState(k){
    const t=state.hmiValveTransitions[k];
    if(t&&Date.now()<t.until)return 'MOVING';
    if(t){state.hmiManualValves[k]=t.target;delete state.hmiValveTransitions[k]}
    if(state.hmiManualValves[k])return state.hmiManualValves[k];
    if(k.startsWith('bw_')){
      try{
        const a=typeof bwActuatorStates==='function'?bwActuatorStates():[];
        const m={bw_influent:0,bw_effluent:1,bw_waste:2,bw_air:3};const q=a[m[k]];
        if(!q)return state.bwSeq&&state.bwSeq.active?'MOVING':'CLOSED';
        if(q.status==='fault')return 'FAULT';if(q.status==='moving')return 'MOVING';return q.feedback==='OPEN'?'OPEN':'CLOSED';
      }catch(e){return 'CLOSED'}
    }
    if(k.startsWith('pfas_'))return state.pfas&&state.pfas.mode==='ONLINE'?'OPEN':'CLOSED';
    if(k==='dist_prv')return state.prv&&state.prv.abnormal?'FAULT':'OPEN';
    if(k.startsWith('psv_')){const p=state.pumps[+k.split('_')[1]];return p&&p.trip?'FAULT':p&&p.run?'OPEN':'CLOSED'}
    return +controls.flow.value>0?'OPEN':'CLOSED';
  }

  function s16PumpState(k){
    if(k.startsWith('chem_')){
      const id=k.slice(5);const c=controls[id];const value=c?+c.value:0;
      if((id==='ferric'&&state.event==='coagfeed')||(id==='ozone'&&state.event==='ozfault')||(id==='chlorine'&&state.event==='clfeed')||(id==='caustic'&&state.event==='causticfeed'))return 'TRIP';
      return value>0?'RUN':'OFF';
    }
    if(k==='dist_main')return state.pumps.some(p=>p.run)?'RUN':'OFF';
    if(k.startsWith('ps_')){const p=state.pumps[+k.split('_')[1]];return p&&p.trip?'TRIP':p&&p.run?'RUN':'OFF'}
    return 'OFF';
  }

  function s16Render(){
    document.querySelectorAll('[data-s16v]').forEach(g=>{const s=s16ValveState(g.dataset.s16v);g.classList.remove('open','closed','moving','fault');g.classList.add(s.toLowerCase());const t=g.querySelector('.status');if(t)t.textContent=s});
    document.querySelectorAll('[data-s16p]').forEach(g=>{const s=s16PumpState(g.dataset.s16p);g.classList.remove('run','trip');if(s==='RUN')g.classList.add('run');if(s==='TRIP')g.classList.add('trip');const t=g.querySelector('.status');if(t)t.textContent=s});
    document.querySelectorAll('[data-s16fill]').forEach(r=>{const i=+r.dataset.s16fill;const t=state.tanks[i];if(!t)return;const pct=Math.max(0,Math.min(100,t.level));const max=+r.dataset.max,base=+r.dataset.base,h=max*pct/100;r.setAttribute('y',base-h);r.setAttribute('height',h);document.querySelectorAll('[data-s16tl="'+i+'"]').forEach(l=>l.textContent='T'+(i+1)+' '+Math.round(pct)+'%')});
    document.querySelectorAll('[data-s16filter]').forEach((l,i)=>{const f=state.filters[i];if(f)l.textContent=(f.status==='BW'?'BACKWASH':Math.round(f.run)+' h')});
  }

  function s16Bind(){
    document.querySelectorAll('[data-s16v]:not([data-s16bound])').forEach(g=>{
      g.dataset.s16bound='1';
      g.onclick=()=>{
        const key=g.dataset.s16v,s=s16ValveState(key),manual=g.dataset.manual==='1';
        if(!manual){showModal('Valve Status',\`<p><b>\${key.toUpperCase()}</b>: <b>\${s}</b></p><p>This generalized valve follows automatic simulator state.</p>\`);return}
        const target=s==='OPEN'?'CLOSED':'OPEN';
        showModal('Generalized Valve Command',\`<p><b>\${key.toUpperCase()}</b> is <b>\${s}</b>.</p><p>Command <b>\${target}</b> for this training schematic?</p><p>This is not a real Thornton valve tag or operating procedure.</p><div class="row"><button class="btn good" id="s16Cmd">Command \${target}</button></div>\`);
        setTimeout(()=>{const b=$('s16Cmd');if(b)b.onclick=()=>{state.hmiValveTransitions[key]={target,until:Date.now()+1200};log('Generalized SCADA valve '+key+' commanded '+target+'.');$('modal').classList.remove('show');s16Render()}},0);
      };
    });
  }

  function s16Refresh(){s16Install();s16Bind();s16Render()}
  s16Refresh();
  setTimeout(s16Refresh,100);setTimeout(s16Refresh,500);setTimeout(s16Refresh,1200);
  setInterval(s16Render,600);

  const s16OldSetPage=setPage;
  setPage=function(id){const r=s16OldSetPage(id);setTimeout(s16Refresh,0);return r};
  const s16OldRender=render;
  render=function(){s16OldRender();s16Render()};
  `;

  const marker='\n})();';
  const pos=source.lastIndexOf(marker);
  if(pos<0)throw new Error('V16.5 TEST could not find simulator IIFE close.');
  source=source.slice(0,pos)+runtime+source.slice(pos);
  return source;
}
