function patchSimulatorSourceV16SeasonalTemp(source){
  source=source
    .replace(/Thornton WTP Operator Simulator V16\.10\.2 TEST[^<\n]*/g,'Thornton WTP Operator Simulator V16.10.3 TEST — Seasonal Water Temperature')
    .replace('THORNTON WTP // OPERATOR SIM V16.10.2 TEST','THORNTON WTP // OPERATOR SIM V16.10.3 TEST');

  const css=`
  /* V16.10.3 — seasonal source-water temperature displayed on System Overview. */
  .v16103-temp small{display:block}
  .v16103-temp b{display:block}
  .v16103-temp span{display:block;margin-top:3px;color:#8fa1ad;font-size:9px;letter-spacing:.04em}
  `;
  source=source.replace('</style>',css+'\n</style>');

  const runtime=`

  // V16.10.3 — use the same temperature state as the CT page.
  const V16103_SEASONS=[
    {name:'WINTER',min:5,max:8},
    {name:'SPRING',min:8,max:13},
    {name:'SUMMER',min:15,max:20},
    {name:'AUTUMN',min:10,max:15}
  ];

  function v16103InferSeason(temp){
    if(temp<8)return 'WINTER';
    if(temp<12)return 'SPRING';
    if(temp<15.5)return 'AUTUMN';
    return 'SUMMER';
  }
  function v16103RandomizeSeason(){
    if(!state.ct) return;
    const profile=V16103_SEASONS[Math.floor(Math.random()*V16103_SEASONS.length)];
    const temp=profile.min+Math.random()*(profile.max-profile.min);
    state.ct.season=profile.name;
    state.ct.tempBase=temp;
    state.ct.tempC=temp;
    if(Array.isArray(state.ct.history)){
      state.ct.history.length=0;
      if(typeof v1610CalcCT==='function'){
        const c=v1610CalcCT();
        state.ct.history.push({m:state.minute,ct:c.achieved,req:c.required,ratio:c.ratio});
      }
    }
    log('Seasonal source-water condition: '+profile.name.toLowerCase()+' profile, '+temp.toFixed(1)+' °C at shift start.');
  }
  function v16103EnsureCard(){
    let card=$('qlWaterTemp');
    if(card)return card;
    const ql=document.querySelector('.scada-page[data-page-id="overview"] .quicklook');
    if(!ql)return null;
    const box=document.createElement('div');
    box.className='v16103-temp';
    box.innerHTML='<small>Water temperature</small><b id="qlWaterTemp">-- °C</b><span id="qlSeason">SEASONAL PROFILE</span>';
    ql.appendChild(box);
    return $('qlWaterTemp');
  }
  function v16103RenderWaterTemp(){
    const out=v16103EnsureCard();
    if(!out||!state.ct||!Number.isFinite(state.ct.tempC))return;
    const c=state.ct.tempC;
    const f=c*9/5+32;
    out.textContent=c.toFixed(1)+' °C / '+f.toFixed(1)+' °F';
    const season=$('qlSeason');
    if(season)season.textContent=(state.ct.season||v16103InferSeason(c))+' PROFILE';
  }

  const v16103BaseInit=initializeRandomShift;
  initializeRandomShift=function(){
    const r=v16103BaseInit();
    v16103RandomizeSeason();
    v16103RenderWaterTemp();
    if(typeof v1610RenderCT==='function')v1610RenderCT();
    return r;
  };

  const v16103BaseRender=render;
  render=function(){
    const r=v16103BaseRender();
    v16103RenderWaterTemp();
    return r;
  };

  if(state.ct&&Number.isFinite(state.ct.tempC)&&!state.ct.season){
    state.ct.season=v16103InferSeason(state.ct.tempC);
  }
  v16103RenderWaterTemp();
  `;

  const marker='\n})();';
  const pos=source.lastIndexOf(marker);
  if(pos<0)throw new Error('V16.10.3 seasonal temperature patch could not locate simulator IIFE closing marker.');
  source=source.slice(0,pos)+runtime+source.slice(pos);
  return source;
}
