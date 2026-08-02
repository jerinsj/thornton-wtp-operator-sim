function patchSimulatorSourceV16ScadaInit(source){
  source=source
    .replace(/Thornton WTP Operator Simulator V16\.3[^<\n]*/g,'Thornton WTP Operator Simulator V16.4 — Interactive SCADA Restored')
    .replace('THORNTON WTP // OPERATOR SIM V16.3','THORNTON WTP // OPERATOR SIM V16.4');

  const runtime=`

  // V16.4 — reliably initialize the existing V16 interactive SCADA layer.
  function v164InitScada(){
    try{
      v16AddCards();
      v16Bind();
      v16Render();
    }catch(e){
      console.error('V16.4 SCADA initialization failed',e);
    }
  }

  // document.write() can finish after the original window-load listener has already
  // become unreliable. Run several harmless passes; v16AddCards prevents duplicates.
  setTimeout(v164InitScada,0);
  setTimeout(v164InitScada,250);
  setTimeout(v164InitScada,900);
  setTimeout(v164InitScada,1800);

  // Refresh the HMI whenever navigation changes pages as well.
  const v164OriginalSetPage=setPage;
  setPage=function(id){
    const result=v164OriginalSetPage(id);
    setTimeout(v164InitScada,0);
    return result;
  };
  `;

  const marker='\n})();';
  const pos=source.lastIndexOf(marker);
  if(pos<0)throw new Error('V16.4 could not locate the simulator IIFE closing marker.');
  source=source.slice(0,pos)+runtime+source.slice(pos);
  return source;
}
