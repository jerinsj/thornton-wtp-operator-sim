function patchSimulatorSourceV16SpeedRange(source){
  source=source
    .replace(/Thornton WTP Operator Simulator V16\.8 TEST[^<\n]*/g,'Thornton WTP Operator Simulator V16.9.1 TEST — Corrected Speed Range')
    .replace('THORNTON WTP // OPERATOR SIM V16.8 TEST','THORNTON WTP // OPERATOR SIM V16.9.1 TEST');

  const oldPanel=`<div class="control-head"><span>Simulation speed</span><span class="read" id="speedRead">30 sec/s</span></div>
<input id="speed" max="2" min="1" step="1" type="range" value="1"/>
<div class="hint">1 real second = 30 simulated seconds to 1 simulated minute.</div>`;
  const newPanel=`<div class="control-head"><span>Simulation speed</span><span class="read" id="speedRead">15 sec/s</span></div>
<input id="speed" max="4" min="1" step="1" type="range" value="1"/>
<div class="hint">1 real second = 15 simulated seconds to 1 simulated minute.</div>`;

  const oldIncrement='simMinuteAccumulator += (+controls.speed.value)*0.5;';
  const newIncrement='simMinuteAccumulator += (+controls.speed.value)*0.25;';
  const oldRead="$('speedRead').textContent=(+controls.speed.value===1?'30 sec/s':'1 min/s');";
  const newRead="$('speedRead').textContent=({1:'15 sec/s',2:'30 sec/s',3:'45 sec/s',4:'1 min/s'}[+controls.speed.value]||'15 sec/s');";

  if(!source.includes(oldPanel))throw new Error('V16.9.1 speed patch could not locate the existing speed panel.');
  if(!source.includes(oldIncrement))throw new Error('V16.9.1 speed patch could not locate the clock accumulator line.');
  if(!source.includes(oldRead))throw new Error('V16.9.1 speed patch could not locate the speed readout mapping.');

  source=source.replace(oldPanel,newPanel);
  source=source.replace(oldIncrement,newIncrement);
  source=source.replace(oldRead,newRead);
  return source;
}
