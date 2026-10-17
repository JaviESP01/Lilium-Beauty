/* Lilium · inicio */
function greetingSub(){const h=new Date().getHours();return h<14?'Que tengas un día bonito':h<21?'Que tengas una tarde bonita':'Que descanses, mañana más'}
function rangeKeys(range){
 const t=new Date();t.setHours(0,0,0,0);
 if(range==='week'){const s=monday(t);return [dateKey(s),dateKey(addDays(s,6))]}
 if(range==='month'){return [dateKey(new Date(t.getFullYear(),t.getMonth(),1)),dateKey(new Date(t.getFullYear(),t.getMonth()+1,0))]}
 return [dateKey(t),dateKey(t)];
}
function apptsBetween(a,b){return A.appointments.filter(x=>x.date>=a&&x.date<=b)}
function income(list){return list.filter(x=>x.status==='completed'||isPaid(x)).reduce((n,x)=>n+apptAmount(x),0)}
function home(){
 const s=A.settings,tk=todayKey(),today=apptsOn(tk),active=today.filter(isActive);
 const yk=dateKey(addDays(new Date(),-1));
 const incToday=income(today),incYest=income(apptsOn(yk));
 const cnt={pending:0,live:0,completed:0};active.forEach(a=>{const st=liveStatus(a);if(cnt[st]!=null)cnt[st]++});
 const pre=tk.slice(0,7);
 const newClients=A.clients.filter(c=>(c.createdAt||'').slice(0,7)===pre).length;
 const monthAppts=A.appointments.filter(a=>a.date.startsWith(pre)&&isActive(a));
 const counts={};monthAppts.forEach(a=>counts[a.service]=(counts[a.service]||0)+1);const star=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];
 const name=s.ownerName?.trim();
 const head=`<div class="head-wrap"><div><h1 class="page-title hello">¡Hola${name?', '+esc(name):''}! <span class="h-heart outline">${ic('heart')}</span></h1><p class="page-sub">${greetingSub()} <span class="h-mini">${ic('heart')}</span></p></div><div class="head-stamps" aria-hidden="true">${stamp('flores','hs hs0',-8)}${stamp('love','hs hs1',6)}</div></div>`;
 const stats=`<div class="stats">
  ${statCard('calendar','Citas de hoy',active.length,`${cnt.pending} pendiente${cnt.pending===1?'':'s'} · ${cnt.live} en curso · ${cnt.completed} completada${cnt.completed===1?'':'s'}`,"view.agendaDate=new Date();view.agendaView='day';go('agenda')")}
  ${statCard('coins','Ingresos de hoy',money(incToday),trend(pctChange(incToday,incYest),'que ayer')||'Cobrado o completado',"go('finance')")}
  ${statCard('users','Clientas totales',A.clients.length,`+${newClients} este mes`,"go('clients')")}
  ${statCard('heart','Servicio más popular',star?esc(star[0]):'—',star?`${star[1]} este mes`:'Aún sin citas este mes',"go('services')",'deco')}
 </div>`;
 const list=today.length?`<ul class="appt-list">${today.map(todayRow).join('')}</ul>`:`<div class="card-empty">${ART.bow()}<p>No tienes citas hoy.</p><button class="btn soft small" onclick="openAppt()">${ic('plus')}Crear una cita</button></div>`;
 const body=`${stats}
 <div class="home-grid">
  ${card('Citas de hoy','',list,{cls:'c-today',stamp:'nippon',action:`<button class="link" onclick="view.agendaDate=new Date();view.agendaView='day';go('agenda')">Ver agenda ${ic('arrow')}</button>`})}
  <div class="col">
   ${summaryCard()}
   ${weekCard()}
  </div>
  <div class="col">
   ${card('Accesos rápidos','',`<div class="quick">${[
     ['pluscircle','Nueva cita','openAppt()'],['userplus','Nueva clienta','openNewClient()'],['wrench','Añadir servicio','openService()'],
     ['card','Registrar pago','chargePicker()'],['receipt','Añadir gasto','openExpense()'],['calendar','Ver agenda',"go('agenda')"]].map(([i,l,a])=>`<button class="q-tile" onclick="${a}">${ic(i)}<span>${l}</span></button>`).join('')}</div>`,{stamp:'love',action:`<button class="icon-link" onclick="go('settings')" aria-label="Ajustes">${ic('arrow')}</button>`})}
   ${tasksCard()}
  </div>
 </div>
 ${typeof catalogHomeCard==='function'&&catalogHomeCard()?`<div class="web-new-wrap">${catalogHomeCard()}</div>`:''}
 <div class="home-grid two">
  ${tomorrowCard()}
  ${birthdayCard()}
 </div>`;
 return {head,body,clock:true};
}
function statCard(icon,label,value,sub,action,cls=''){return `<button class="stat ${cls}" onclick="${action}"><span class="stat-ic">${ic(icon)}</span><span class="stat-txt"><small>${label}</small><b>${value}</b><em>${sub}</em></span>${cls==='deco'?stamp('lirios','stat-stamp',8):''}</button>`}
function todayRow(a){
 const c=clientOf(a),st=liveStatus(a);
 const detail=[a.service,a.shape||a.design].filter(Boolean).map(esc).join(' - ');
 return `<li class="ar st-${st}"><span class="ar-time num">${a.time}</span><span class="ar-dot"></span><button class="ar-who" onclick="openAppt('${a.id}')">${avatarHtml(c||{name:a.client},'sm')}<span><b>${esc(a.client)}</b><small>${detail}</small></span></button>${statusPill(a)}<button class="icon-btn" aria-label="Opciones de la cita" onclick="apptMenu(event,'${a.id}')">${ic('more')}</button></li>`;
}
function apptMenu(ev,id){const a=A.appointments.find(x=>x.id===id);if(!a)return;const c=clientOf(a);openMenu(ev,[
 {label:'Editar cita',icon:'edit',action:()=>openAppt(id)},
 a.status!=='completed'?{label:'Cobrar y completar',icon:'coins',action:()=>quickCharge(id)}:null,
 c?.phone?{label:'Recordar por WhatsApp',icon:'whatsapp',action:()=>sendReminder(id)}:null,
 c?{label:'Ver ficha',icon:'person',action:()=>openClientFile(c.id)}:null,
 a.status==='pending'?{label:'Marcar como «no vino»',icon:'close',action:()=>setApptStatus(id,'noshow')}:null,
 a.status!=='cancelled'?{label:'Cancelar cita',icon:'close',action:()=>setApptStatus(id,'cancelled')}:{label:'Reactivar cita',icon:'refresh',action:()=>setApptStatus(id,'pending')},
 '-',{label:'Eliminar',icon:'trash2',danger:true,action:()=>deleteAppt(id)}])}
function setApptStatus(id,st){const a=A.appointments.find(x=>x.id===id);if(!a)return;a.status=st;save();render();toast(`Cita: ${statusLabel(st).toLowerCase()}`)}
function summaryCard(){
 const r=view.summaryRange,[a,b]=rangeKeys(r),list=apptsBetween(a,b),act=list.filter(isActive);
 const pend=act.filter(x=>x.status==='pending').length,cl=new Set(act.map(x=>x.clientId||norm(x.client))).size;
 const sel=`<label class="mini-select"><select onchange="view.summaryRange=this.value;render()" aria-label="Periodo">${[['day','Hoy'],['week','Semana'],['month','Mes']].map(([v,l])=>`<option value="${v}" ${r===v?'selected':''}>${l}</option>`).join('')}</select></label>`;
 return card('Resumen rápido','',`<div class="sum-tiles">${[['calendar',act.length,'Citas'],['coins',money(income(list)),'Ingresos'],['clock',pend,'Pendientes'],['users',cl,'Clientas']].map(([i,v,l],k)=>`<div class="sum-tile ${k===1?'hi':''}">${ic(i)}<b class="num">${v}</b><small>${l}</small></div>`).join('')}</div>`,{action:sel});
}
function weekCard(){
 const s=monday(new Date()),days=[],labels=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
 for(let i=0;i<7;i++){const k=dateKey(addDays(s,i));days.push({l:labels[i],v:income(apptsOn(k)),today:k===todayKey()})}
 const total=days.reduce((n,d)=>n+d.v,0),prevS=addDays(s,-7),prev=income(apptsBetween(dateKey(prevS),dateKey(addDays(prevS,6))));
 const max=Math.max(1,...days.map(d=>d.v));
 return card('Ganancias de la semana','',`<div class="week"><div class="bars">${days.map(d=>`<div class="bar ${d.today?'cur':''}" title="${d.l}: ${money(d.v)}"><i style="height:${Math.max(4,Math.round(d.v/max*100))}%"></i><span>${d.l}</span></div>`).join('')}</div><div class="week-total"><small>Total</small><b class="num">${money(total)}</b>${trend(pctChange(total,prev),'')}</div></div>`,{stamp:'fresas',action:`<button class="icon-link" onclick="go('finance')" aria-label="Ver finanzas">${ic('arrow')}</button>`});
}

/* Pendientes */
function tasksCard(){
 const list=A.tasks.filter(t=>!t.done).sort((a,b)=>(a.due||'9999').localeCompare(b.due||'9999')).slice(0,4);
 return card('Próximos pendientes','',`${list.length?`<ul class="tasks">${list.map(taskRow).join('')}</ul>`:'<p class="muted pad">Nada pendiente. ¡Bien hecho!</p>'}<form class="task-add" onsubmit="event.preventDefault();addTask(this.t.value);this.reset()"><input name="t" placeholder="Añadir pendiente…" aria-label="Nuevo pendiente"><button class="icon-btn" aria-label="Añadir">${ic('plus')}</button></form>`,{stamp:'botanical',action:`<button class="link" onclick="openTasks()">Ver todos ${ic('arrow')}</button>`});
}
function taskIcon(t){const x=norm(t.text);return /esmalte|gel|tips|comprar|reponer|pedido/.test(x)?'bottle':/limpi|desinfect|esteril/.test(x)?'sparkles':t.clientId?'person':'clipboard'}
function taskRow(t){const c=t.clientId?clientById(t.clientId):null;return `<li class="task ${t.done?'done':''}"><span class="t-ic">${ic(taskIcon(t))}</span><span class="t-txt">${esc(t.text)}${c||t.due?`<small>${c?esc(c.name):''}${c&&t.due?' · ':''}${t.due?fmtShort(t.due):''}</small>`:''}</span><button class="check-btn" role="checkbox" aria-checked="${!!t.done}" aria-label="Marcar como hecho" onclick="toggleTask('${t.id}')">${ic(t.done?'checked':'checkbox')}</button><button class="icon-btn" aria-label="Opciones" onclick="taskMenu(event,'${t.id}')">${ic('more')}</button></li>`}
function addTask(text,clientId='',due=''){text=String(text||'').trim();if(!text)return;A.tasks.push({id:uid('t'),text,done:false,clientId,due,createdAt:new Date().toISOString()});save();if(modalOpen()&&document.querySelector('.tasks-modal'))openTasks();else render();toast('Pendiente añadido')}
function toggleTask(id){const t=A.tasks.find(x=>x.id===id);if(!t)return;t.done=!t.done;t.doneAt=t.done?new Date().toISOString():'';save();if(document.querySelector('.tasks-modal'))openTasks();else render()}
function taskMenu(ev,id){openMenu(ev,[{label:'Editar',icon:'edit',action:()=>editTask(id)},{label:'Eliminar',icon:'trash2',danger:true,action:()=>deleteTask(id)}])}
async function editTask(id){const t=A.tasks.find(x=>x.id===id);if(!t)return;openModal(`<h2 class="modal-title">Editar pendiente</h2><form onsubmit="event.preventDefault();saveTask('${id}')"><div class="field"><label for="tk_text">Pendiente</label><input id="tk_text" value="${esc(t.text)}"></div><div class="field"><label for="tk_due">Fecha (opcional)</label><input id="tk_due" type="date" value="${esc(t.due||'')}"></div><div class="modal-actions"><button type="button" class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn">Guardar</button></div></form>`,{cls:'small'})}
function saveTask(id){const t=A.tasks.find(x=>x.id===id);t.text=document.getElementById('tk_text').value.trim()||t.text;t.due=document.getElementById('tk_due').value;save();closeModal();render()}
function deleteTask(id){A.tasks=A.tasks.filter(x=>x.id!==id);markRemoved(id);save();if(document.querySelector('.tasks-modal'))openTasks();else render();toast('Pendiente eliminado')}
function openTasks(){
 const open=A.tasks.filter(t=>!t.done),done=A.tasks.filter(t=>t.done).slice(-10).reverse();
 openModal(`<h2 class="modal-title">Pendientes</h2><form class="task-add big" onsubmit="event.preventDefault();addTask(this.t.value);this.reset()"><input name="t" placeholder="Escribe un pendiente y pulsa Intro" aria-label="Nuevo pendiente" autofocus><button class="btn small">${ic('plus')}Añadir</button></form>
 ${open.length?`<ul class="tasks">${open.map(taskRow).join('')}</ul>`:'<p class="muted">No tienes nada pendiente.</p>'}
 ${done.length?`<h3 class="sub-title">Hechos</h3><ul class="tasks">${done.map(taskRow).join('')}</ul>`:''}`,{cls:'tasks-modal'});
}

/* Mañana y cumpleaños */
function tomorrowCard(){
 const list=apptsOn(dateKey(addDays(new Date(),1))).filter(isActive);
 return card('Recordatorios de mañana','whatsapp',list.length?`<ul class="remind">${list.map(a=>{const c=clientOf(a);return `<li><span class="num">${a.time}</span>${avatarHtml(c||{name:a.client},'xs')}<span><b>${esc(a.client)}</b><small>${esc(a.service)}${a.reminded?' · recordada ✓':''}</small></span>${c?.phone?`<button class="btn soft small" onclick="sendReminder('${a.id}')">${ic('whatsapp')}Recordar</button>`:`<span class="muted small">Sin teléfono</span>`}</li>`}).join('')}</ul>`:'<p class="muted pad">Mañana no tienes citas.</p>',{stamp:'cisne',sub:list.length?`${plural(list.length,'cita','citas')} · envía el recordatorio con un toque`:''});
}
function sendReminder(id){const a=A.appointments.find(x=>x.id===id);if(!a)return;const c=clientOf(a);a.reminded=new Date().toISOString();save();openWhatsApp(c?.phone,fillTemplate(A.settings.messages.reminder,a,c))}
function birthdayCard(){
 const today=new Date();today.setHours(0,0,0,0);const list=[];
 A.clients.forEach(c=>{const b=parseBirthday(c.birth);if(!b)return;let d=new Date(today.getFullYear(),b.m-1,b.d);if(d<today)d=new Date(today.getFullYear()+1,b.m-1,b.d);const days=Math.round((d-today)/864e5);if(days<=30)list.push({c,d,days})});
 list.sort((a,b)=>a.days-b.days);
 return card('Cumpleaños','gift',list.length?`<ul class="remind">${list.slice(0,5).map(({c,d,days})=>`<li><span class="num">${d.getDate()} ${d.toLocaleDateString('es-ES',{month:'short'}).replace('.','')}</span>${avatarHtml(c,'xs')}<span><b>${esc(c.name)}</b><small>${days===0?'¡Es hoy!':days===1?'Mañana':`En ${days} días`}</small></span>${c.phone?`<button class="btn soft small" onclick="openWhatsApp('${jsq(c.phone)}',fillTemplate(A.settings.messages.birthday,null,clientById('${c.id}')))">${ic('gift')}Felicitar</button>`:''}</li>`).join('')}</ul>`:'<p class="muted pad">Ningún cumpleaños en los próximos 30 días.</p>',{stamp:'mariposa',sub:'Próximos 30 días'});
}

/* Cobros */
function chargePicker(){
 const list=A.appointments.filter(a=>isActive(a)&&!isPaid(a)&&a.date<=todayKey()).sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time)).slice(0,12);
 openModal(`<h2 class="modal-title">Registrar pago</h2><p class="modal-text">Elige la cita que te han pagado.</p>${list.length?`<ul class="pick-list">${list.map(a=>`<li><button onclick="quickCharge('${a.id}')"><span class="num">${a.date===todayKey()?'Hoy':fmtShort(a.date)} · ${a.time}</span><span><b>${esc(a.client)}</b><small>${esc(a.service)}</small></span><b class="num">${money(apptAmount(a))}</b></button></li>`).join('')}</ul>`:'<p class="muted">No hay citas pendientes de cobro.</p>'}`,{cls:'small'});
}
function quickCharge(id){
 const a=A.appointments.find(x=>x.id===id);if(!a)return;
 openModal(`<h2 class="modal-title">Cobrar a ${esc(a.client)}</h2><p class="modal-text">${esc(a.service)}</p><div class="field"><label for="qc_amt">Importe (€)</label><input id="qc_amt" type="number" min="0" step="0.5" value="${apptAmount(a)}"></div><div class="pay-grid">${PAYMENT.slice(1).map(([v,l])=>`<button class="pay-btn" onclick="doCharge('${a.id}','${v}')">${ic(v==='cash'?'coins':v==='card'?'card':'phone')}${l}</button>`).join('')}</div><p class="hint">La cita quedará como completada.</p>`,{cls:'small'});
}
function doCharge(id,method){const a=A.appointments.find(x=>x.id===id);if(!a)return;const v=Number(document.getElementById('qc_amt')?.value);if(!isNaN(v))a.amount=v;a.payment=method;a.status='completed';save();closeModal();render();toast(`Cobrado: ${money(apptAmount(a))} en ${paymentLabel(method).toLowerCase()}`)}
