function patchSimulatorSourceV16Tasks(source){
  source=source.replace(/Working Home Controls/g,'');

  const css=`
  .routine-task-list{min-height:60px}
  .routine-task{display:grid!important}
  .routine-task .task-action .btn{cursor:pointer}
  .routine-task .task-action .btn:disabled{cursor:not-allowed}
  `;
  source=source.replace('</style>',css+'\n</style>');

  const runtime=`

  // V16.2 routine-task board repair — runs inside the main simulator IIFE.
  function v162EnsureTaskContainer(){
    let box=$('routineTasks');
    if(box)return box;
    const page=document.querySelector('.scada-page[data-page-id="tasks"]');
    if(!page)return null;
    const board=[...page.querySelectorAll('.card')].find(c=>c.textContent.includes('SHIFT TASK BOARD'));
    if(!board)return null;
    box=document.createElement('div');
    box.id='routineTasks';
    box.className='routine-task-list';
    board.appendChild(box);
    return box;
  }

  function v162RenderRoutineTasks(){
    const box=v162EnsureTaskContainer();
    if(!box)return;
    box.innerHTML='';
    let completed=0,due=0,overdue=0;

    ROUTINE_TASKS.forEach(t=>{
      if(t.completed)completed++;
      const late=state.minute-t.due;
      const available=state.minute>=t.due-45;
      if(!t.completed&&available)due++;
      if(!t.completed&&late>0)overdue++;
      const cls=t.completed?'done':late>0?'overdue':available?'due':'future';
      const status=t.completed?('DONE '+shiftClock(t.completedAt)):late>0?(late+' MIN OVERDUE'):available?'DUE WINDOW':'UPCOMING';
      const d=document.createElement('div');
      d.className='routine-task '+cls;
      d.innerHTML='<div class="task-time"><small>SCHEDULE</small><b>'+shiftClock(t.due)+'</b></div>'+
        '<div class="task-main"><b>'+t.title+'</b><span>'+t.desc+'</span><em>'+t.priority+' PRIORITY · '+t.duration+' MIN</em></div>'+
        '<div class="task-action"><button class="btn '+(late>0?'danger':'')+'" data-v162-task="'+t.id+'" '+((t.completed||!available)?'disabled':'')+'>'+(t.completed?'Completed':'Perform task')+'</button><small>'+status+'</small></div>';
      box.appendChild(d);
    });

    box.querySelectorAll('[data-v162-task]').forEach(b=>{
      b.onclick=()=>{
        const id=b.dataset.v162Task;
        completeRoutineTask(id);
        setTimeout(v162RenderRoutineTasks,0);
        setTimeout(v162RenderRoutineTasks,250);
      };
    });

    if($('routineScore'))$('routineScore').textContent=Math.round(state.routineScore);
    if($('tasksCompleted'))$('tasksCompleted').textContent=completed+'/'+ROUTINE_TASKS.length;
    if($('tasksDue'))$('tasksDue').textContent=due;
    if($('tasksOverdue'))$('tasksOverdue').textContent=overdue;
    const next=ROUTINE_TASKS.filter(t=>!t.completed).sort((a,b)=>a.due-b.due)[0];
    if($('nextTask'))$('nextTask').textContent=next?(shiftClock(next.due)+' · '+next.title):'ALL COMPLETE';
    if($('navTaskCount'))$('navTaskCount').textContent=overdue?(overdue+'!'):due;
    if($('qlTasks'))$('qlTasks').textContent=overdue?(overdue+' OVERDUE'):due;
  }

  renderRoutineTasks=v162RenderRoutineTasks;

  const v162OldSetPage=setPage;
  setPage=function(id){
    v162OldSetPage(id);
    if(id==='tasks')setTimeout(v162RenderRoutineTasks,0);
  };

  setTimeout(v162RenderRoutineTasks,50);
  setTimeout(v162RenderRoutineTasks,500);
  setInterval(v162RenderRoutineTasks,1000);
  `;

  const marker='\n})();';
  const pos=source.lastIndexOf(marker);
  if(pos<0)throw new Error('V16.2 could not locate the simulator IIFE closing marker.');
  source=source.slice(0,pos)+runtime+source.slice(pos);
  return source;
}
