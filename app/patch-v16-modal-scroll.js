function patchSimulatorSourceV16ModalScroll(source){
  source=source
    .replace(/Thornton WTP Operator Simulator V16\.11 TEST[^<\n]*/g,'Thornton WTP Operator Simulator V16.11.1 TEST — Scrollable Dialogs')
    .replace('THORNTON WTP // OPERATOR SIM V16.11 TEST','THORNTON WTP // OPERATOR SIM V16.11.1 TEST');

  const css=`
  /* V16.11.1 — keep long lab/incident dialogs inside the viewport. */
  .modalbox{
    max-height:calc(100vh - 32px);
    overflow-y:auto;
    overscroll-behavior:contain;
    scrollbar-width:thin;
    scrollbar-color:#536775 #18232b;
  }
  .modalbox::-webkit-scrollbar{width:9px}
  .modalbox::-webkit-scrollbar-track{background:#18232b;border-radius:10px}
  .modalbox::-webkit-scrollbar-thumb{background:#536775;border-radius:10px;border:2px solid #18232b}
  .modalbox::-webkit-scrollbar-thumb:hover{background:#6d8494}
  `;

  if(!source.includes('</style>'))throw new Error('V16.11.1 modal-scroll patch could not locate stylesheet closing tag.');
  source=source.replace('</style>',css+'\n</style>');
  return source;
}
