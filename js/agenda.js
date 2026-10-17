/* Lilium · agenda, citas y servicios */
const HOUR_PX=56;
function dayRange(){const s=A.settings;let a=Number(s.dayStart??8),b=Number(s.dayEnd??21);
 A.appointments.forEach(x=>{const st=Math.floor(tmin(x.time)/60),en=Math.ceil((tmin(x.time)+apptDur(x))/60);if(st<a)a=st;if(en>b)b=en});
 return [Math.max(0,a),Math.min(24,Math.max(b,a+1))]}
function agendaPage(){
 const d=view.agendaDate,v=view.agendaView;
 let title;
 if(v==='day')title=cap(d.toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'}));
 else if(v==='week'){const s=monday(d),e=addDays(s,6);title=s.getMonth()===e.getMonth()?`${s.getDate()} – ${e.getDate()} de ${e.toLocaleDateString('es-ES',{month:'long',year:'numeric'})}`:`${s.getDate()} ${s.toLocaleDateString('es-ES',{month:'short'})} – ${e.getDate()} ${e.toLocaleDateString('es-ES',{month:'short',year:'numeric'})}`}
 else if(v==='month')title=cap(d.toLocaleDateString('es-ES',{month:'long',year:'numeric'}));
 else title='Todas las citas';
 const body=v==='week'?timeGrid(Array.from({length:7},(_,i)=>addDays(monday(d),i))):v==='day'?timeGrid([new Date(d)]):v==='month'?monthView(d):listView();
 const body2=`<div class="agenda-bar card slim">
  <div class="segtabs" role="tablist">${[['day','Día'],['week','Semana'],['month','Mes'],['list','Lista']].map(([k,l])=>`<button role="tab" aria-selected="${v===k}" class="${v===k?'on':''}" onclick="view.agendaView='${k}';render()">${l}</button>`).join('')}</div>
  ${v!=='list'?`<div class="agenda-nav"><button class="round-btn" aria-label="Anterior" onclick="agendaMove(-1)">${ic('left')}</button><button class="btn soft small" onclick="view.agendaDate=new Date();window.__scrolledNow=false;render()">Hoy</button><button class="round-btn" aria-label="Siguiente" onclick="agendaMove(1)">${ic('right')}</button><h2 class="agenda-title">${title}</h2></div>`:''}
  <button class="btn" onclick="openAppt()">${ic('plus')}Nueva cita</button>
 </div>
 <div class="agenda-layout ${v==='day'||v==='week'?'with-side':''}">${body}${v==='day'||v==='week'?sideUpcoming():''}</div>`;
 const all=A.appointments.filter(x=>x.date===todayKey()&&isActive(x)).length;
 return {head:pageHead('Agenda',all?`Hoy tienes ${plural(all,'cita','citas')}`:'Organiza tus citas y tu día',['ciruelo','puente']),body:body2};
}
function agendaMove(dir){const d=new Date(view.agendaDate);if(view.agendaView==='month'){d.setDate(1);d.setMonth(d.getMonth()+dir)}else d.setDate(d.getDate()+(view.agendaView==='day'?dir:dir*7));view.agendaDate=d;render()}
function layoutDay(list){ // columnas para citas que se solapan
 const items=list.map(a=>({a,s:tmin(a.time),e:tmin(a.time)+apptDur(a),col:0,cols:1}));
 const groups=[];let cur=[],end=-1;
 items.sort((x,y)=>x.s-y.s).forEach(it=>{if(it.s>=end&&cur.length){groups.push(cur);cur=[]}cur.push(it);end=Math.max(end,it.e)});if(cur.length)groups.push(cur);
 groups.forEach(g=>{const colsEnd=[];g.forEach(it=>{let c=colsEnd.findIndex(e=>e<=it.s);if(c<0){c=colsEnd.length;colsEnd.push(0)}colsEnd[c]=it.e;it.col=c});g.forEach(it=>it.cols=colsEnd.length)});
 return items;
}
function timeGrid(days){
 const [h0,h1]=dayRange(),hours=Array.from({length:h1-h0},(_,i)=>h0+i),H=(h1-h0)*HOUR_PX,tk=todayKey(),n=new Date(),nowMin=n.getHours()*60+n.getMinutes();
 const cols=days.map(d=>{const k=dateKey(d);const items=layoutDay(apptsOn(k));
  const blocks=items.map(({a,s,e,col,cols})=>{const top=(s-h0*60)/60*HOUR_PX,h=Math.max(26,(e-s)/60*HOUR_PX-3);
   const short=h<46;
   return `<button class="appt st-${a.status} ${short?'short':''}" title="${esc(a.client)} · ${a.time}–${mtime(e)} · ${esc(a.service)}" style="top:${top}px;height:${h}px;left:calc(${col/cols*100}% + 3px);width:calc(${100/cols}% - 6px)" onclick="event.stopPropagation();openAppt('${a.id}')">${short?`<b>${a.time} ${esc(a.client)}</b>`:`<b>${esc(a.client)}</b><span>${a.time}–${mtime(e)} · ${esc(a.service)}</span>${a.status!=='pending'&&h>70?`<em>${statusLabel(a.status)}</em>`:''}`}</button>`}).join('');
  const nowLine=k===tk&&nowMin>=h0*60&&nowMin<=h1*60?`<div class="now-line" style="top:${(nowMin-h0*60)/60*HOUR_PX}px"></div>`:'';
  return `<div class="daycol ${k===tk?'today':''}" style="height:${H}px" onclick="slotClick(event,'${k}',${h0})">${blocks}${nowLine}</div>`}).join('');
 const head=days.length>1?`<div class="tg-head" style="grid-template-columns:52px repeat(${days.length},minmax(92px,1fr))"><div></div>${days.map(d=>`<button class="tg-day ${dateKey(d)===tk?'today':''}" onclick="view.agendaDate=new Date(${d.getTime()});view.agendaView='day';render()"><span>${d.toLocaleDateString('es-ES',{weekday:'short'}).replace('.','')}</span><b>${d.getDate()}</b></button>`).join('')}</div>`:'';
 return `<div class="timegrid ${days.length>1?'week':'day'}"><div class="tg-scroll">${head}<div class="tg-body" style="grid-template-columns:52px repeat(${days.length},minmax(92px,1fr));height:${H}px"><div class="tg-hours">${hours.map(h=>`<div style="height:${HOUR_PX}px">${pad(h)}:00</div>`).join('')}</div>${cols}</div></div></div>`;
}
function slotClick(e,k,h0){const r=e.currentTarget.getBoundingClientRect();const min=h0*60+Math.floor(((e.clientY-r.top)/HOUR_PX*60)/15)*15;openAppt(null,k,'',mtime(min))}
function sideUpcoming(){const list=upcoming(6);return `<aside class="card side-up has-stamp">${stamp('puente','sticker')}<header class="card-head"><div class="ch-title"><h2>Próximas citas</h2></div></header>${list.length?`<ul class="remind">${list.map(a=>`<li onclick="openAppt('${a.id}')" class="clickable"><span class="num">${a.date===todayKey()?'Hoy':fmtShort(a.date)}<small>${a.time}</small></span><span><b>${esc(a.client)}</b><small>${esc(a.service)}</small></span></li>`).join('')}</ul>`:'<p class="muted">No hay citas próximas.</p>'}</aside>`}
function monthView(d){
 const first=new Date(d.getFullYear(),d.getMonth(),1),start=monday(first),tk=todayKey();
 const cells=Array.from({length:42},(_,i)=>addDays(start,i));
 return `<div class="month"><div class="m-head">${['lun','mar','mié','jue','vie','sáb','dom'].map(x=>`<span>${x}</span>`).join('')}</div><div class="m-grid">${cells.map(x=>{const k=dateKey(x),list=apptsOn(k).filter(a=>a.status!=='cancelled');return `<div class="m-cell ${x.getMonth()!==d.getMonth()?'muted':''} ${k===tk?'today':''}" onclick="view.agendaDate=new Date(${x.getTime()});view.agendaView='day';render()"><b>${x.getDate()}</b>${list.slice(0,3).map(a=>`<span class="m-appt st-${a.status}" onclick="event.stopPropagation();openAppt('${a.id}')">${a.time} ${esc(a.client.split(' ')[0])}</span>`).join('')}${list.length>3?`<small>+${list.length-3} más</small>`:''}${list.length?`<i class="m-dots">${'•'.repeat(Math.min(list.length,5))}</i>`:''}</div>`}).join('')}</div></div>`;
}
function listView(){
 const q=norm(view.apptQuery),st=view.apptStatus;
 const arr=A.appointments.filter(a=>(!q||norm(a.client).includes(q)||norm(a.service).includes(q)||a.date.includes(q))&&(st==='all'||(st==='unpaid'?(a.status==='completed'&&!isPaid(a)):a.status===st))).sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time));
 const groups={};arr.forEach(a=>{const m=a.date.slice(0,7);(groups[m]=groups[m]||[]).push(a)});
 return `<div class="list-view card"><div class="toolbar"><div class="field-pill grow">${ic('search')}<input value="${esc(view.apptQuery)}" placeholder="Clienta, servicio o fecha" oninput="view.apptQuery=this.value;clearTimeout(window.__lq);window.__lq=setTimeout(()=>{render();const i=document.querySelector('.list-view input');i.focus();i.setSelectionRange(i.value.length,i.value.length)},250)" aria-label="Buscar cita"></div>
  <div class="field-pill"><select onchange="view.apptStatus=this.value;render()" aria-label="Filtrar por estado">${[['all','Todas'],['pending','Pendientes'],['completed','Completadas'],['unpaid','Completadas sin cobrar'],['cancelled','Canceladas'],['noshow','No vino']].map(([v,l])=>`<option value="${v}" ${st===v?'selected':''}>${l}</option>`).join('')}</select></div></div>
  ${arr.length?Object.entries(groups).map(([m,list])=>`<h3 class="group-title">${cap(parseDate(m+'-01').toLocaleDateString('es-ES',{month:'long',year:'numeric'}))}<span class="sub">${plural(list.length,'cita','citas')} · ${money0(list.filter(a=>a.status==='completed').reduce((n,a)=>n+apptAmount(a),0))}</span></h3><ul class="rows">${list.map(a=>`<li onclick="openAppt('${a.id}')"><span class="num">${fmtShort(a.date)}<small>${a.time}</small></span><span><b>${esc(a.client)}</b><small>${esc(a.service)}</small></span><span class="pill st-${a.status}">${statusLabel(a.status)}</span><span class="r-pay ${isPaid(a)?'':'muted'}">${paymentLabel(a.payment)}</span><span class="num r-amt">${money0(apptAmount(a))}</span></li>`).join('')}</ul>`).join(''):`<p class="muted">${q||st!=='all'?'Ninguna cita coincide con la búsqueda.':'Todavía no hay citas.'}</p>`}
 </div>`;
}

/* Ventana de cita */
function openAppt(id=null,date='',clientId='',time=''){
 const a=id?A.appointments.find(x=>x.id===id):null;
 if(id&&!a)return toast('No se encontró la cita');
 const pre=clientId?clientById(clientId):null;
 const svc=a?serviceOf(a):A.services[0];
 const v={client:a?.client||pre?.name||'',date:a?.date||date||dateKey(view.agendaDate),time:a?.time||time||'10:00',serviceId:svc?.id||'',dur:a?apptDur(a):(svc?.dur||60),amount:a?apptAmount(a):(svc?.price||0),status:a?.status||'pending',payment:a?.payment||'pending',shape:a?.shape||pre?.shape||'',length:a?.length||pre?.length||'',design:a?.design||'',notes:a?.notes||''};
 const c=a?clientOf(a):pre;
 openModal(`<h2 class="modal-title">${a?'Editar cita':'Nueva cita'}</h2>
 <div class="field"><label for="a_client">Clienta</label><input id="a_client" list="clientList" value="${esc(v.client)}" placeholder="Escribe el nombre" autocomplete="off" oninput="apptHint()"><datalist id="clientList">${A.clients.map(x=>`<option value="${esc(x.name)}">`).join('')}</datalist><small class="field-hint" id="clientHint"></small></div>
 <div class="grid-3"><div class="field"><label for="a_date">Fecha</label><input id="a_date" type="date" value="${v.date}" onchange="apptHint()"></div><div class="field"><label for="a_time">Hora</label><input id="a_time" type="time" step="300" value="${v.time}" onchange="apptHint()"></div><div class="field"><label for="a_dur">Duración (min)</label><input id="a_dur" type="number" min="5" step="5" value="${v.dur}" oninput="apptHint()"></div></div>
 <div class="grid-2"><div class="field"><label for="a_service">Servicio</label><select id="a_service" onchange="serviceChanged()">${A.services.map(s=>`<option value="${s.id}" ${v.serviceId===s.id?'selected':''}>${esc(s.name)} · ${money0(s.price)}</option>`).join('')}${a&&!svc?`<option value="" selected>${esc(a.service)}</option>`:''}</select></div><div class="field"><label for="a_amount">Precio (€)</label><input id="a_amount" type="number" min="0" step="0.5" value="${v.amount}"></div></div>
 <p class="overlap" id="overlapHint" role="status"></p>
 <div class="field"><span class="label">Estado</span>${seg('a_status',STATUS,v.status)}</div>
 <div class="field"><span class="label">Pago</span>${seg('a_payment',PAYMENT,v.payment)}</div>
 <details class="more" ${v.shape||v.length||v.design||v.notes?'open':''}><summary>Diseño y notas</summary>
  <div class="grid-3"><div class="field"><label for="a_shape">Forma</label><input id="a_shape" list="shapeList" value="${esc(v.shape)}" placeholder="Almond"><datalist id="shapeList">${['Redonda','Cuadrada','Coffin','Almond','Stiletto'].map(x=>`<option value="${x}">`).join('')}</datalist></div><div class="field"><label for="a_length">Largo</label><input id="a_length" value="${esc(v.length)}" placeholder="#3"></div><div class="field"><label for="a_design">Color o diseño</label><input id="a_design" value="${esc(v.design)}" placeholder="Francesa nude"></div></div>
  <div class="field"><label for="a_notes">Notas de la cita</label><textarea id="a_notes" rows="2">${esc(v.notes)}</textarea></div>
 </details>
 <div class="modal-actions split">
  <div>${a?`<button class="icon-btn danger" title="Eliminar cita" aria-label="Eliminar cita" onclick="deleteAppt('${a.id}')">${ic('trash2')}</button>`:''}${a&&c?.phone?`<button class="btn ghost small" onclick="sendReminder('${a.id}')">${ic('whatsapp')}Recordar</button>`:''}${a&&a.status==='completed'&&c?.phone?`<button class="btn ghost small" onclick="openWhatsApp('${jsq(c.phone)}',fillTemplate(A.settings.messages.thanks,A.appointments.find(x=>x.id==='${a.id}'),clientById('${c.id}')))">${ic('message')}Agradecer</button>`:''}</div>
  <div><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="saveAppt('${id||''}')">${a?'Guardar cambios':'Crear cita'}</button></div>
 </div>`,{cls:'appt-modal'});
 window.__apptId=id||'';apptHint();
}
function serviceChanged(){const s=A.services.find(x=>x.id===document.getElementById('a_service').value);if(!s)return;document.getElementById('a_amount').value=s.price;document.getElementById('a_dur').value=s.dur;apptHint()}
function apptHint(){
 const name=document.getElementById('a_client')?.value.trim()||'';const ch=document.getElementById('clientHint');
 if(ch)ch.textContent=name&&!A.clients.some(c=>norm(c.name)===norm(name))?'Es una clienta nueva: se creará su ficha al guardar.':'';
 const date=document.getElementById('a_date')?.value,time=document.getElementById('a_time')?.value,dur=Number(document.getElementById('a_dur')?.value||60);
 const el=document.getElementById('overlapHint');if(!el)return;
 const ov=validDateKey(date)&&validTime(time)?overlapsFor(date,time,dur,window.__apptId):[];
 el.innerHTML=ov.length?`${ic('clock')}Se solapa con ${ov.map(o=>`${esc(o.client)} (${o.time}–${mtime(tmin(o.time)+apptDur(o))})`).join(' y ')}`:'';el.classList.toggle('show',!!ov.length);
}
async function saveAppt(id){
 const g=x=>document.getElementById(x);
 const clientName=g('a_client').value.trim(),date=g('a_date').value,time=g('a_time').value;
 if(!clientName||!date||!time)return toast('Completa clienta, fecha y hora');
 if(!validDateKey(date)||!validTime(time))return toast('Revisa la fecha y la hora');
 const s=A.services.find(x=>x.id===g('a_service').value);
 const dur=Math.max(5,Number(g('a_dur').value)||s?.dur||60),amount=Math.max(0,Number(g('a_amount').value)||0);
 const ov=overlapsFor(date,time,dur,id);
 if(ov.length&&!await ask({title:'Esta cita se solapa',text:`Coincide con ${ov.map(o=>`${esc(o.client)} a las ${o.time}`).join(' y ')}. ¿La guardo igualmente?`,ok:'Guardar igualmente'}))return;
 let c=A.clients.find(x=>norm(x.name)===norm(clientName));
 if(!c){c=newClient(clientName);A.clients.push(c)}
 const data={client:c.name,clientId:c.id,date,time,dur,amount,service:s?.name||A.appointments.find(x=>x.id===id)?.service||'',serviceId:s?.id||'',status:segVal('a_status')||'pending',payment:segVal('a_payment')||'pending',shape:g('a_shape').value.trim(),length:g('a_length').value.trim(),design:g('a_design').value.trim(),notes:g('a_notes').value.trim()};
 if(data.payment!=='pending'&&data.status==='pending')data.status='completed';
 if(id){const t=A.appointments.find(x=>x.id===id);if(!t)return toast('No se encontró la cita');Object.assign(t,data)}else A.appointments.push({id:uid('a'),...data});
 if(data.shape&&!c.shape)c.shape=data.shape;if(data.length&&!c.length)c.length=data.length;
 save();closeModal();render();toast(id?'Cita guardada':'Cita creada');
}
async function deleteAppt(id){const a=A.appointments.find(x=>x.id===id);if(!a)return;if(!await confirmDelete(`¿Enviar la cita de ${a.client} a la papelera?`,`${cap(fmtLong(a.date))} a las ${a.time}.`))return;moveToTrash('appointments',a);A.appointments=A.appointments.filter(x=>x.id!==id);save();closeModal();render();toast('Cita enviada a la papelera')}

/* Servicios */
function servicesPage(){
 const cats=['Todos',...categories().filter(c=>A.services.some(s=>s.cat===c))],cat=cats.includes(view.serviceCat)?view.serviceCat:'Todos';
 const list=A.services.filter(s=>cat==='Todos'||s.cat===cat);
 const count={};A.appointments.forEach(a=>{if(a.serviceId)count[a.serviceId]=(count[a.serviceId]||0)+1});
 const icons={'Uñas':'sparkles','Manicura':'hand','Pedicura':'heart','Extras':'star5','Packs':'gift'};
 const body=A.services.length?`<div class="toolbar"><div class="chips-row">${cats.map(c=>`<button class="fchip ${cat===c?'on':''}" onclick="view.serviceCat='${jsq(c)}';render()">${esc(c)}</button>`).join('')}</div><button class="btn" onclick="openService()">${ic('plus')}Añadir servicio</button></div>
 <div class="svc-grid">${list.map((s,i)=>`<div class="svc-card" onclick="openService('${s.id}')">${i%3===0?stamp(['botanical','flores','rosa','lirios','nippon','fresas'][(i/3)%6],'sticker mini'):''}<span class="stat-ic">${ic(icons[s.cat]||'bottle')}</span><div class="svc-body"><b>${esc(s.name)}</b><small>${esc(s.cat)} · ${durText(s.dur)}${count[s.id]?` · ${plural(count[s.id],'cita','citas')}`:''}</small></div><b class="svc-price num">${money(s.price)}</b><button class="icon-btn" aria-label="Opciones de ${esc(s.name)}" onclick="event.stopPropagation();openMenu(event,[{label:'Editar',icon:'edit',action:()=>openService('${s.id}')},{label:'Eliminar',icon:'trash2',danger:true,action:()=>deleteService('${s.id}')}])">${ic('more')}</button></div>`).join('')}</div>`:card('','',emptyState('Sin servicios','Añade tus servicios con su precio y duración.',`<button class="btn" onclick="openService()">${ic('plus')}Añadir servicio</button>`));
 return {head:pageHead('Servicios','Precios y duraciones que se rellenan solos al crear una cita',['botanical','mariposa']),body};
}
function openService(id=null){
 const s=id?A.services.find(x=>x.id===id):null;
 openModal(`<h2 class="modal-title">${s?'Editar servicio':'Nuevo servicio'}</h2><div class="field"><label for="s_name">Nombre</label><input id="s_name" value="${esc(s?.name||'')}" placeholder="Uñas de gel"></div>
 <div class="grid-3"><div class="field"><label for="s_cat">Categoría</label><input id="s_cat" list="catList" value="${esc(s?.cat||'Uñas')}"><datalist id="catList">${categories().map(c=>`<option value="${esc(c)}">`).join('')}</datalist></div><div class="field"><label for="s_price">Precio (€)</label><input id="s_price" type="number" min="0" step="0.5" value="${s?.price??30}"></div><div class="field"><label for="s_dur">Duración (min)</label><input id="s_dur" type="number" min="5" step="5" value="${s?.dur??60}"></div></div>
 <div class="modal-actions"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="saveService('${id||''}')">Guardar servicio</button></div>`,{cls:'small'});
}
function saveService(id){
 const name=document.getElementById('s_name').value.trim();if(!name)return toast('Escribe el nombre del servicio');
 const data={name,cat:document.getElementById('s_cat').value.trim()||'Uñas',price:Math.max(0,Number(document.getElementById('s_price').value)||0),dur:Math.max(5,Number(document.getElementById('s_dur').value)||60)};
 if(id){const s=A.services.find(x=>x.id===id);const old=s.name;Object.assign(s,data);if(old!==name)A.appointments.forEach(a=>{if(a.serviceId===id)a.service=name})}else A.services.push({id:uid('s'),...data});
 save();closeModal();render();toast('Servicio guardado');
}
async function deleteService(id){const s=A.services.find(x=>x.id===id);if(!s)return;if(!await confirmDelete(`¿Enviar «${s.name}» a la papelera?`,'Las citas ya creadas conservan su servicio y precio.'))return;moveToTrash('services',s);A.services=A.services.filter(x=>x.id!==id);save();render();toast('Servicio enviado a la papelera')}
