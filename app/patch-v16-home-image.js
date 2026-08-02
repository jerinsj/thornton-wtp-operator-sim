function patchSimulatorSourceV16HomeImage(source){
  source=source
    .replace(/Thornton WTP Operator Simulator V16\.2[^<\n]*/g,'Thornton WTP Operator Simulator V16.3 — Local Home Image')
    .replace('THORNTON WTP // OPERATOR SIM V16.2','THORNTON WTP // OPERATOR SIM V16.3');

  const css=`
  /* V16.3 — normal repository JPEG, no base64/runtime reconstruction */
  .v16-photo{
    position:relative;
    overflow:hidden;
    min-height:360px;
    background:linear-gradient(145deg,#10171c,#1a252c 55%,#0f1519);
  }
  .v16-photo img{
    display:block;
    width:100%;
    height:100%;
    min-height:360px;
    object-fit:cover;
    object-position:center 45%;
  }
  .v16-photo.image-fallback{
    display:flex;
    align-items:center;
    justify-content:center;
    min-height:360px;
    background:
      radial-gradient(circle at 28% 30%,rgba(47,213,196,.12),transparent 34%),
      linear-gradient(145deg,#10171c,#1a252c 55%,#0f1519);
  }
  .v16-photo.image-fallback::before{
    content:'THORNTON WTP  •  OPERATOR SIMULATION';
    color:#8fa3ae;
    letter-spacing:.18em;
    font-size:12px;
    font-weight:700;
  }
  @media(max-width:850px){
    .v16-photo,.v16-photo img,.v16-photo.image-fallback{min-height:220px}
  }
  `;
  source=source.replace('</style>',css+'\n</style>');

  const oldImg='<img id="v16Photo" alt="Thornton Water Treatment Plant site view">';
  const newImg='<img id="v16Photo" src="assets/home/thornton-wtp-hero.jpg?v=1" alt="Thornton Water Treatment Plant aerial site view" loading="eager" decoding="async" onerror="const p=this.parentElement;this.remove();if(p)p.classList.add(\'image-fallback\')">';
  if(source.includes(oldImg)){
    source=source.replace(oldImg,newImg);
  }else{
    source=source.replace(/<img id="v16Photo"[^>]*>/,newImg);
  }
  return source;
}
