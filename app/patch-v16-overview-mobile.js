function patchSimulatorSourceV16OverviewMobile(source){
  const css=`
  @media(max-width:720px){
    html,body{max-width:100%;overflow-x:hidden}
    .scada-workspace,.scada-page,.card,.overview{min-width:0;max-width:100%}
    .process{display:grid;grid-template-columns:repeat(2,minmax(0,1fr)) !important;gap:8px;width:100%;max-width:100%;overflow:visible}
    .process .stage{min-width:0 !important;width:auto;max-width:100%}
    .process .stage:after{display:none !important}
    .quicklook,.meters{grid-template-columns:repeat(2,minmax(0,1fr)) !important;min-width:0}
    .quicklook>*,.meters>*{min-width:0}
  }
  @media(max-width:430px){.process,.quicklook,.meters{grid-template-columns:1fr !important}}
  `;
  if(!source.includes('</style>'))throw new Error('Mobile overview patch could not locate stylesheet closing tag.');
  return source.replace('</style>',css+'\n</style>');
}
