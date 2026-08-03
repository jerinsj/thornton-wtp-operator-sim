function patchSimulatorSourceV16OverviewMobile(source){
  const css=`
  /* V16.12.3 — keep the Overview process train inside its card at every viewport width. */
  .scada-page[data-page-id="overview"] .process{
    display:grid;
    grid-template-columns:repeat(8,minmax(0,1fr)) !important;
    gap:8px;
    width:100%;
    max-width:100%;
    min-width:0;
    overflow:visible;
  }
  .scada-page[data-page-id="overview"] .process .stage{
    min-width:0 !important;
    width:auto;
    max-width:100%;
    overflow-wrap:anywhere;
  }

  /* Medium desktop / tablet: wrap eight process stages into two rows instead of overflowing. */
  @media(max-width:1300px) and (min-width:721px){
    .scada-page[data-page-id="overview"] .process{
      grid-template-columns:repeat(4,minmax(0,1fr)) !important;
    }
    .scada-page[data-page-id="overview"] .process .stage:after{display:none !important}
  }

  @media(max-width:720px){
    html,body{max-width:100%;overflow-x:hidden}
    .scada-workspace,.scada-page,.card,.overview{min-width:0;max-width:100%}

    /* Mobile SCADA navigation: override the desktop vertical-scroll rail. */
    .scada-nav{
      position:sticky;
      top:58px;
      height:auto !important;
      width:100%;
      max-width:100vw;
      min-width:0;
      display:flex;
      flex-direction:row !important;
      flex-wrap:nowrap !important;
      overflow-x:auto !important;
      overflow-y:hidden !important;
      overscroll-behavior-x:contain;
      overscroll-behavior-y:auto;
      -webkit-overflow-scrolling:touch;
      touch-action:pan-x;
      scrollbar-gutter:auto;
      scrollbar-width:thin;
    }
    .scada-nav .nav-btn{flex:0 0 auto;min-width:max-content;white-space:nowrap}
    .scada-nav::-webkit-scrollbar{height:6px;width:auto}
    .scada-nav::-webkit-scrollbar-track{background:#0b151c;border:0}
    .scada-nav::-webkit-scrollbar-thumb{background:#51616c;border-radius:999px;border:1px solid #0b151c}

    .scada-page[data-page-id="overview"] .process{grid-template-columns:repeat(2,minmax(0,1fr)) !important}
    .scada-page[data-page-id="overview"] .process .stage:after{display:none !important}
    .quicklook,.meters{grid-template-columns:repeat(2,minmax(0,1fr)) !important;min-width:0}
    .quicklook>*,.meters>*{min-width:0}
  }
  @media(max-width:430px){
    .scada-page[data-page-id="overview"] .process,.quicklook,.meters{grid-template-columns:1fr !important}
  }
  `;
  if(!source.includes('</style>'))throw new Error('Overview responsive patch could not locate stylesheet closing tag.');
  return source.replace('</style>',css+'\n</style>');
}
