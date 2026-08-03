function patchSimulatorSourceV16LabCoverage(source){
  // V16.12.3.3 — make all four lab-verification periods achievable from the task board
  // and provide a Treatment-page proxy to the already-working shift lab check.

  if(!source.includes("{id:'labq2'")){
    const q2Anchor="    {id:'filterreview',due:315,duration:10,priority:'NORMAL',title:'Filter condition review',desc:'Review six filter runs, turbidity/headloss trends, backwash basin condition and whether any filter actually needs attention.',type:'filters'},";
    if(!source.includes(q2Anchor))throw new Error('V16.12.3.3 could not locate the Q2 lab-task insertion point.');
    const q2="    {id:'labq2',due:270,duration:15,priority:'NORMAL',title:'Late-morning process / lab check',desc:'Repeat routine bench/grab verification during the second 3-hour lab period and compare results with online indications.',type:'lab'},\n";
    source=source.replace(q2Anchor,q2+q2Anchor);
  }

  if(!source.includes("{id:'labq4'")){
    const q4Anchor="    {id:'round2',due:620,duration:18,priority:'NORMAL',title:'Final plant round & inventories',desc:'Walk the plant again, verify equipment condition and note anything the next shift must know.',type:'round'},";
    if(!source.includes(q4Anchor))throw new Error('V16.12.3.3 could not locate the Q4 lab-task insertion point.');
    const q4="    {id:'labq4',due:570,duration:15,priority:'NORMAL',title:'Late-shift process / lab check',desc:'Complete the fourth-period routine water-quality verification before final rounds and turnover preparation.',type:'lab'},\n";
    source=source.replace(q4Anchor,q4+q4Anchor);
  }

  if(!source.includes('id="treatmentLabProxy"')){
    const treatmentAnchor='<div class="page-inline-note">Use System Overview for live whole-plant indicators; use this page for production and clarification control.</div>\n</div><div class="card scada-card"><div class="section-title">TREATMENT CONTROL</div>';
    if(!source.includes(treatmentAnchor))throw new Error('V16.12.3.3 could not locate the Treatment-page action insertion point.');
    const treatmentReplacement='<div class="page-inline-note">Use System Overview for live whole-plant indicators; use this page for production and clarification control.</div>\n</div><div class="card scada-card"><div class="section-title">TREATMENT OPERATOR ACTIONS</div><div class="actions"><button class="btn" id="treatmentLabProxy">Run process lab check</button></div><div class="page-inline-note">Credits the current 3-hour lab-verification period once. Repeating a check in the same period does not add another verification credit.</div></div><div class="card scada-card"><div class="section-title">TREATMENT CONTROL</div>';
    source=source.replace(treatmentAnchor,treatmentReplacement);
  }

  const proxyAnchor="  $('distCheckProxy').onclick=()=>$('distBtn').click();";
  if(!source.includes("$('treatmentLabProxy').onclick") && source.includes(proxyAnchor)){
    source=source.replace(proxyAnchor,"  $('treatmentLabProxy').onclick=()=>$('sampleBtn').click();\n"+proxyAnchor);
  }else if(!source.includes("$('treatmentLabProxy').onclick")){
    throw new Error('V16.12.3.3 could not locate the operator-action proxy wiring.');
  }

  source=source.replace('<div class="scorebox"><small>Samples</small><b id="samples">0</b></div>','<div class="scorebox"><small>Lab checks</small><b id="samples">0/4</b></div>');

  return source;
}
