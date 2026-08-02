function patchSimulatorSourceV17Controls(source){
  const runtime=`
  (function(){
    function byId(id){return document.getElementById(id)}
    function cloneButton(id){
      const old=byId(id);if(!old)return null;
      const n=old.cloneNode(true);old.replaceWith(n);return n;
    }
    function bindControls(){
      const start=cloneButton('v16Start');
      const resume=cloneButton('v16Resume');
      const scenario=cloneButton('v16Scenario');
      if(start)start.onclick=function(e){e.preventDefault();e.stopPropagation();if(window.v17StartNewShift)window.v17StartNewShift()};
      if(resume){
        const hasSave=!!localStorage.getItem('thorntonWtpV17Save');
        resume.disabled=!hasSave;
        resume.onclick=function(e){e.preventDefault();e.stopPropagation();if(window.v17ResumeShift)window.v17ResumeShift()};
      }
      if(scenario)scenario.onclick=function(e){e.preventDefault();e.stopPropagation();const p=byId('v16Scen');if(p)p.classList.toggle('show')};
      document.querySelectorAll('[data-v16s]').forEach(function(old){
        const n=old.cloneNode(true);old.replaceWith(n);
        n.onclick=function(e){e.preventDefault();e.stopPropagation();if(window.v17StartScenario)window.v17StartScenario(n.dataset.v16s)};
      });
    }
    setTimeout(bindControls,100);
    setTimeout(bindControls,800);
    window.addEventListener('load',function(){setTimeout(bindControls,150)},{once:true});
  })();
  `;
  source=source.replace('</body>','<script>'+runtime+'<\/script></body>');
  return source;
}
