function patchSimulatorSourceV14(source){
  source=source
    .replace(/Thornton WTP Operator Simulator V1[23][^<\n]*/g,'Thornton WTP Operator Simulator V14 — Modern SCADA Theme')
    .replace(/THORNTON WTP \/\/ OPERATOR SIM V1[23]/g,'THORNTON WTP // OPERATOR SIM V14')
    .replace(/Thornton WTP Operator Simulator V1[23] · SCADA-style training fiction\./g,'Thornton WTP Operator Simulator V14 · SCADA-style training fiction.');

  const themeCSS=`
  /* V14 Modern SCADA theme */
  :root{
    --bg:#11161b;
    --panel:#181e24;
    --panel2:#212931;
    --line:#313c47;
    --text:#eef2f5;
    --muted:#9ea9b3;
    --good:#42d07d;
    --warn:#ffc857;
    --bad:#ff6b6b;
    --blue:#5fb4ff;
    --accent:#2fd5c4;
    --shadow:0 10px 24px rgba(0,0,0,.28)
  }
  html{background:var(--bg)}
  body{
    font-family:"Segoe UI Variable Text","Inter","Segoe UI",Roboto,Arial,sans-serif;
    background:
      radial-gradient(circle at top right, rgba(47,213,196,.08), transparent 20%),
      radial-gradient(circle at top left, rgba(95,180,255,.05), transparent 22%),
      linear-gradient(180deg,#0f1418 0%,#13191f 55%,#101419 100%);
    color:var(--text);
    letter-spacing:.01em;
  }
  .topbar{
    background:rgba(18,23,28,.9);
    backdrop-filter:blur(8px);
    border-bottom:1px solid var(--line);
    box-shadow:0 4px 18px rgba(0,0,0,.22);
  }
  .brand{
    font-family:"Segoe UI Variable Display","Inter","Segoe UI",Roboto,Arial,sans-serif;
    letter-spacing:.03em;
    font-weight:700;
  }
  .brand small{color:#7eb7df}
  .card,.filter,.labres,.pfas-lab,.pfas-stat,.task-summary>div,.routine-guidance-grid>div,.pfas-concept-grid>div,.incident-context,.incident-result,.bw-step,.perm,.actuator,.bw-fault-panel,.page-inline-note,.chemical-basis-note{
    background:linear-gradient(180deg,rgba(34,41,49,.98),rgba(23,29,35,.98));
    border-color:var(--line);
    box-shadow:none;
  }
  .card{border-radius:12px;box-shadow:var(--shadow)}
  .topbar,.card,.filter,.labres,.pfas-lab,.pfas-stat,.task-summary>div,.bw-step,.perm,.actuator,.routine-task,.nav-btn,.btn{border-radius:10px}
  .nav-btn{
    background:#141a20;
    color:#dbe4ea;
    border-left:3px solid transparent;
    font-weight:600;
  }
  .nav-btn:hover{background:#1a2128}
  .nav-btn.active{
    background:linear-gradient(90deg, rgba(47,213,196,.18), rgba(47,213,196,.04) 75%);
    border-left-color:var(--accent);
    color:#f2f6f8;
  }
  .nav-btn span{
    background:#10151a;
    border:1px solid #303945;
    color:#bfc9cf;
    border-radius:999px;
    padding:2px 7px;
    font-size:10px;
  }
  .section-title{color:#dce7ee;letter-spacing:.08em;font-size:10px}
  .k{color:var(--muted)}
  .badge,.chip,.handoff-head span,.bw-seq-head span,.task-score-box,.nav-task-btn i{
    background:#10161b !important;
    border:1px solid var(--line) !important;
    color:#d7e6ee !important;
  }
  .btn{
    background:#242d35;
    border:1px solid #36424e;
    color:#edf3f7;
    font-weight:600;
  }
  .btn:hover{background:#2a353e}
  .btn.good{background:#173929;border-color:#296a48;color:#d9f7e6}
  .btn.danger{background:#402126;border-color:#814047;color:#ffe1e1}
  .alarm{background:linear-gradient(180deg,#222930,#1a2026);border:1px solid var(--line)}
  .sev.lo{box-shadow:0 0 0 2px rgba(95,180,255,.16)}
  .sev.med{box-shadow:0 0 0 2px rgba(255,200,87,.18)}
  .sev.hi{box-shadow:0 0 0 2px rgba(255,107,107,.18)}
  .control input[type="range"]{accent-color:#2fd5c4}
  .quicklook>div,.process .stage,.zone,.tank,.station,.labres,.filter-grid,.chemical-grid,.pfas-flow>div{
    background:#141a20;
    border:1px solid var(--line);
    border-radius:10px;
  }
  .process .stage{box-shadow:inset 0 1px 0 rgba(255,255,255,.02)}
  .stage .v,.metric .v,.labres b,.filter-grid b,.kpi b,.pfas-stat b,.pfas-lab b,.task-summary b,.bw-seq-status b,.quicklook b,.read,#routineScore{
    font-family:"Bahnschrift","Roboto Mono","SFMono-Regular",Consolas,"Liberation Mono",monospace;
    font-variant-numeric:tabular-nums;
    letter-spacing:.02em;
  }
  .control-head span:last-child,.labres b,.quicklook b{color:#f3f7fa}
  .modal-card,.modal #modalBox{
    background:linear-gradient(180deg,#212931,#1b2229);
    border:1px solid var(--line);
    border-radius:12px;
    box-shadow:0 18px 40px rgba(0,0,0,.36);
  }
  .footer{color:#98a7b2}
`;

  source=source.replace('</style>', themeCSS+'\n</style>');
  return source;
}
