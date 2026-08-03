function patchSimulatorSourceV16BreakpointChemistry(source){
  source=source
    .replace(/Thornton WTP Operator Simulator V16\.10\.4\.1 TEST[^<\n]*/g,'Thornton WTP Operator Simulator V16.11 TEST — Dynamic Chloramination Chemistry')
    .replace('THORNTON WTP // OPERATOR SIM V16.10.4.1 TEST','THORNTON WTP // OPERATOR SIM V16.11 TEST');

  const css=`
  /* V16.11 — generalized dynamic chloramination / breakpoint chemistry. */
  .v1611-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;padding:14px}
  .v1611-stat{background:#10181e;border:1px solid #35434d;border-radius:10px;padding:10px}
  .v1611-stat small{display:block;color:#8fa0aa;font-size:9px;letter-spacing:.03em}
  .v1611-stat b{display:block;font-size:17px;margin-top:4px}.v1611-stat span{display:block;color:#8fa1ad;font-size:8.5px;margin-top:3px;line-height:1.35}
  .v1611-region{margin:0 14px 14px;padding:11px 12px;border:1px solid #3b4c56;border-radius:10px;background:#111b21;font-size:10px;line-height:1.5;color:#a7b8c1}
  .v1611-region b{color:#e8f1f4}.v1611-region.good{border-color:#315b49}.v1611-region.watch{border-color:#80672c}.v1611-region.bad{border-color:#88404a;background:#24161a}
  @media(max-width:950px){.v1611-grid{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:560px){.v1611-grid{grid-template-columns:1fr}}
  `;
  source=source.replace('</style>',css+'\n</style>');

  const runtime=`

  // V16.11 — generalized post-DCC chloramination model.
  // This is educational chemistry, not Thornton's actual operating targets or control algorithm.
  const V1611_MONO_STOICH=5.07;     // generalized Cl2:N mass-ratio chemistry basis
  const V1611_BREAKPOINT=7.60;      // generalized theoretical breakpoint reference

  function v1611Clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function v1611Inputs(){
    const dcc=(state.ct&&Number.isFinite(state.ct.freeCl))?state.ct.freeCl:Math.max(.05,(+controls.chlorine.value)-(.55+state.rawTOC*.18+state.filtered*2.2));
    const ammonia=Math.max(.01,+controls.ammonia.value);
    const ph=Number.isFinite(state.finishPH)?state.finishPH:8.0;
    const temp=(state.ct&&Number.isFinite(state.ct.tempC))?state.ct.tempC:10;
    return {dcc:v1611Clamp(dcc,0,5),ammonia,ph,temp,ratio:dcc/ammonia};
  }
  function v1611TargetChemistry(){
    const x=v1611Inputs();
    const C=x.dcc,N=x.ammonia,r=x.ratio;
    const acid=v1611Clamp((7.9-x.ph)/1.25,0,1);
    let freeAmmonia=0,mono=0,other=0,freeCl=0,region='MONOCHLORAMINE REGION';

    if(r<V1611_MONO_STOICH){
      const nReact=Math.min(N,C/V1611_MONO_STOICH);
      freeAmmonia=Math.max(0,N-nReact);
      const combined=Math.max(0,C*.96);
      const otherFrac=v1611Clamp(.025+acid*.18+Math.max(0,r-4.2)*.035,.02,.28);
      other=combined*otherFrac;
      mono=Math.max(0,combined-other);
      freeCl=Math.min(.03,C*.01);
      region=r<3.2?'AMMONIA EXCESS':r<4.2?'LOW CHLORINE-TO-N RATIO':'MONOCHLORAMINE REGION';
    }else if(r<V1611_BREAKPOINT){
      const f=v1611Clamp((r-V1611_MONO_STOICH)/(V1611_BREAKPOINT-V1611_MONO_STOICH),0,1);
      const peakOther=Math.sin(Math.PI*f);
      const combined0=V1611_MONO_STOICH*N;
      const combined=combined0*(1-.84*f);
      const otherFrac=v1611Clamp(.12+.38*peakOther+.22*acid,.10,.72);
      other=combined*otherFrac;
      mono=Math.max(0,combined-other);
      freeAmmonia=Math.max(0,N*(.035*(1-f)));
      freeCl=Math.max(.01,C*.018*f);
      region=f<.35?'HIGH CHLORINE-TO-N RATIO':'BREAKPOINT APPROACH';
    }else{
      const excess=Math.max(0,C-V1611_BREAKPOINT*N);
      const tail=Math.exp(-(r-V1611_BREAKPOINT)/1.8);
      const combined=Math.max(.015,V1611_MONO_STOICH*N*.12*tail);
      other=combined*v1611Clamp(.35+.18*acid,.30,.60);
      mono=Math.max(0,combined-other);
      freeAmmonia=Math.max(0,N*.008*tail);
      freeCl=Math.max(.02,excess+C*.012);
      region='BREAKPOINT EXCEEDED / FREE CHLORINE';
    }

    const totalCl=Math.max(0,mono+other+freeCl);
    return {...x,freeAmmoniaN:freeAmmonia,monochloramine:mono,otherCombined:other,finishedFreeCl:freeCl,totalCl,region};
  }
  function v1611Alpha(target){
    const tempFactor=v1611Clamp(.55+(target.temp-5)/15*.45,.45,1.05);
    const phFactor=v1611Clamp(.82+(target.ph-7.0)*.08,.75,1.05);
    const base=target.region==='BREAKPOINT APPROACH'?.035:target.region==='BREAKPOINT EXCEEDED / FREE CHLORINE'?.055:.095;
    return v1611Clamp(base*tempFactor*phFactor,.015,.12);
  }
  function v1611EnsureChem(){
    if(state.disinfectionChem&&Number.isFinite(state.disinfectionChem.totalCl))return;
    const t=v1611TargetChemistry();
    state.disinfectionChem={...t,lastRegion:t.region};
  }
  function v1611UpdateChemistry(){
    const target=v1611TargetChemistry();
    if(!state.disinfectionChem||!Number.isFinite(state.disinfectionChem.totalCl)){
      state.disinfectionChem={...target,lastRegion:target.region};
    }else{
      const c=state.disinfectionChem,a=v1611Alpha(target);
      ['freeAmmoniaN','monochloramine','otherCombined','finishedFreeCl','totalCl'].forEach(k=>{c[k]+=(target[k]-c[k])*a;});
      c.dcc=target.dcc;c.ammonia=target.ammonia;c.ph=target.ph;c.temp=target.temp;c.ratio=target.ratio;c.region=target.region;
      if(c.lastRegion!==target.region){
        log('Chloramination chemistry shifted to '+target.region.toLowerCase()+'.');
        c.lastRegion=target.region;
      }
    }

    const c=state.disinfectionChem;
    // Operator-performance consequences from sustained poor chloramination chemistry.
    let chemPenalty=0;
    if(c.freeAmmoniaN>.18)chemPenalty+=(c.freeAmmoniaN-.18)*.010;
    if(c.finishedFreeCl>.20)chemPenalty+=(c.finishedFreeCl-.20)*.022;
    if(c.otherCombined>.35)chemPenalty+=(c.otherCombined-.35)*.010;
    if(c.ratio>5.8&&c.ratio<V1611_BREAKPOINT)chemPenalty+=(c.ratio-5.8)*.0025;
    state.quality=Math.max(0,state.quality-chemPenalty);

    if(c.ratio<3.2&&c.freeAmmoniaN>.15){
      alarm('v1611_lowratio','med','Chloramine ratio low','Generalized training chemistry indicates excess free ammonia / low chlorine-to-nitrogen ratio. Verify chlorine, ammonia, pH and residual species.');
    }else if(c.ratio>3.6)clearAlarm('v1611_lowratio',true);

    if(c.ratio>=5.8&&c.ratio<V1611_BREAKPOINT){
      alarm('v1611_breakapproach','med','Chloramination approaching breakpoint','Generalized training chemistry indicates chloramine destruction / mixed combined-chlorine behavior as the chlorine-to-nitrogen ratio approaches breakpoint.');
    }else clearAlarm('v1611_breakapproach',true);

    if(c.ratio>=V1611_BREAKPOINT&&c.finishedFreeCl>.15){
      alarm('v1611_breakexceeded','hi','Breakpoint exceeded — free chlorine carryover','Generalized training chemistry indicates ammonia is nearly exhausted and free chlorine is carrying into finished water. Review chlorine and ammonia feed balance.');
    }else if(c.ratio<7.2||c.finishedFreeCl<.08)clearAlarm('v1611_breakexceeded',true);

    if(c.otherCombined>.45){
      alarm('v1611_combined','lo','Other combined chlorine elevated','Generalized chemistry indicates elevated non-monochloramine combined chlorine. Review pH and chlorine-to-ammonia balance.');
    }else if(c.otherCombined<.30)clearAlarm('v1611_combined',true);
  }
  function v1611RegionClass(region){
    if(region==='MONOCHLORAMINE REGION')return 'good';
    if(region==='AMMONIA EXCESS'||region==='BREAKPOINT EXCEEDED / FREE CHLORINE')return 'bad';
    return 'watch';
  }
  function v1611EnsurePanel(){
    if($('v1611ChemPanel'))return;
    const page=document.querySelector('.scada-page[data-page-id="chemicals"]');
    if(!page)return;
    const card=document.createElement('div');
    card.className='card scada-card';card.id='v1611ChemPanel';
    card.innerHTML='<div class="section-title">CHLORAMINATION / BREAKPOINT CHEMISTRY</div><div class="page-inline-note">Generalized post-DCC chemistry model. Values are training estimates, not Thornton operating targets.</div><div class="v1611-grid">'
      +'<div class="v1611-stat"><small>DCC OUTLET FREE CHLORINE</small><b id="v1611Dcc">--</b><span>before ammonia addition</span></div>'
      +'<div class="v1611-stat"><small>AMMONIA FEED</small><b id="v1611NH3Feed">--</b><span>modeled as mg/L as N</span></div>'
      +'<div class="v1611-stat"><small>Cl₂ : N MASS RATIO</small><b id="v1611Ratio">--</b><span>generalized chemistry indicator</span></div>'
      +'<div class="v1611-stat"><small>FREE AMMONIA</small><b id="v1611FreeNH3">--</b><span>mg/L as N</span></div>'
      +'<div class="v1611-stat"><small>MONOCHLORAMINE</small><b id="v1611Mono">--</b><span>mg/L as Cl₂ equivalent</span></div>'
      +'<div class="v1611-stat"><small>OTHER COMBINED CHLORINE</small><b id="v1611Other">--</b><span>simplified mixed-species estimate</span></div>'
      +'<div class="v1611-stat"><small>FINISHED FREE CHLORINE</small><b id="v1611FreeCl">--</b><span>free chlorine after chloramination</span></div>'
      +'<div class="v1611-stat"><small>TOTAL CHLORINE</small><b id="v1611Total">--</b><span>modeled finished disinfectant residual</span></div>'
      +'</div><div class="v1611-region" id="v1611Region"><b>CHEMISTRY STATE:</b> --</div>';
    page.appendChild(card);
  }
  function v1611RenderChemistry(){
    v1611EnsureChem();v1611EnsurePanel();
    const c=state.disinfectionChem;if(!c)return;
    const set=(id,text)=>{const e=$(id);if(e)e.textContent=text;};
    set('v1611Dcc',c.dcc.toFixed(2)+' mg/L');
    set('v1611NH3Feed',c.ammonia.toFixed(2)+' mg/L as N');
    set('v1611Ratio',c.ratio.toFixed(1)+':1');
    set('v1611FreeNH3',c.freeAmmoniaN.toFixed(2)+' mg/L');
    set('v1611Mono',c.monochloramine.toFixed(2)+' mg/L');
    set('v1611Other',c.otherCombined.toFixed(2)+' mg/L');
    set('v1611FreeCl',c.finishedFreeCl.toFixed(2)+' mg/L');
    set('v1611Total',c.totalCl.toFixed(2)+' mg/L');
    const reg=$('v1611Region');if(reg){reg.className='v1611-region '+v1611RegionClass(c.region);reg.innerHTML='<b>CHEMISTRY STATE:</b> '+c.region+' · '+c.temp.toFixed(1)+' °C · pH '+c.ph.toFixed(2);}

    // Override operator-facing finished-disinfectant displays with modeled total chlorine.
    set('finishCl',c.totalCl.toFixed(2)+' mg/L');
    set('clStage',c.totalCl.toFixed(1)+' mg/L');
    set('chemClStatus',c.totalCl.toFixed(2)+' mg/L');
    const bar=$('clBar');if(bar)bar.style.width=Math.min(100,c.totalCl/4.5*100)+'%';
    const finish=$('finishStage');if(finish)finish.textContent=(state.filtered<.15&&c.totalCl>1.0&&c.finishedFreeCl<.25&&c.freeAmmoniaN<.22)?'STABLE':'CHECK';
  }
  function v1611EnhanceLabModal(){
    v1611EnsureChem();const c=state.disinfectionChem;
    const box=$('modalBox');if(!box||!box.querySelector('.labgrid'))return;
    const grid=box.querySelector('.labgrid');
    [...grid.querySelectorAll('.labres')].forEach(cell=>{
      const label=cell.querySelector('span'),val=cell.querySelector('b');if(!label||!val)return;
      if(label.textContent.trim()==='Finished disinfectant'){label.textContent='Finished total chlorine';val.textContent=c.totalCl.toFixed(2)+' mg/L';}
      if(label.textContent.trim()==='Sim free ammonia'){label.textContent='Free ammonia (as N)';val.textContent=c.freeAmmoniaN.toFixed(2)+' mg/L';}
    });
    const rows=[
      ['DCC outlet free chlorine',c.dcc.toFixed(2)+' mg/L'],
      ['Ammonia feed',c.ammonia.toFixed(2)+' mg/L as N'],
      ['Cl₂ : N ratio',c.ratio.toFixed(1)+':1'],
      ['Monochloramine',c.monochloramine.toFixed(2)+' mg/L as Cl₂'],
      ['Other combined chlorine',c.otherCombined.toFixed(2)+' mg/L as Cl₂'],
      ['Finished free chlorine',c.finishedFreeCl.toFixed(2)+' mg/L'],
      ['Chloramination state',c.region]
    ];
    rows.forEach(([label,value])=>{const d=document.createElement('div');d.className='labres';d.innerHTML='<span>'+label+'</span><b>'+value+'</b>';grid.appendChild(d);});
    const note=box.querySelector('p');if(note)note.innerHTML='These values are generated by the game model. Breakpoint/chloramine speciation is generalized for training and does not reproduce Thornton operating targets.';
  }

  const v1611BaseSimulateMinute=simulateMinute;
  simulateMinute=function(){const r=v1611BaseSimulateMinute();v1611UpdateChemistry();return r;};

  const v1611BaseRender=render;
  render=function(){const r=v1611BaseRender();v1611RenderChemistry();return r;};

  const v1611Sample=$('sampleBtn');
  if(v1611Sample&&typeof v1611Sample.onclick==='function'){
    const v1611BaseSample=v1611Sample.onclick;
    v1611Sample.onclick=function(ev){const r=v1611BaseSample.call(this,ev);v1611EnhanceLabModal();v1611RenderChemistry();return r;};
  }

  const v1611BaseInit=initializeRandomShift;
  initializeRandomShift=function(){const r=v1611BaseInit();state.disinfectionChem=null;v1611EnsureChem();v1611RenderChemistry();return r;};

  v1611EnsureChem();
  v1611RenderChemistry();
  `;

  const marker='\n})();';
  const pos=source.lastIndexOf(marker);
  if(pos<0)throw new Error('V16.11 chemistry patch could not locate simulator IIFE closing marker.');
  source=source.slice(0,pos)+runtime+source.slice(pos);
  return source;
}
