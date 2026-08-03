function patchSimulatorSourceV16SidebarScroll(source){
  const css=`
  /* V16.10.2 — independent vertical scrolling for the SCADA navigation rail. */
  .scada-nav{
    overflow-y:auto !important;
    overflow-x:hidden !important;
    overscroll-behavior:contain;
    scrollbar-gutter:stable;
    scrollbar-width:thin;
    scrollbar-color:#51616c #0b151c;
  }
  .scada-nav::-webkit-scrollbar{width:10px}
  .scada-nav::-webkit-scrollbar-track{background:#0b151c;border-left:1px solid #26343e}
  .scada-nav::-webkit-scrollbar-thumb{background:#51616c;border-radius:999px;border:2px solid #0b151c}
  .scada-nav::-webkit-scrollbar-thumb:hover{background:#70838f}
  `;
  return source.replace('</style>',css+'\n</style>');
}
