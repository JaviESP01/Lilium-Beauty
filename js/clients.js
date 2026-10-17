/* Lilium · clientas y ficha */
const FINGERS=['Pulgar','Índice','Medio','Anular','Meñique'];
const FINGER_POS={left:{'Meñique':[24,33],'Anular':[37.6,11.7],'Medio':[50.1,5.1],'Índice':[66.8,11.7],'Pulgar':[84.7,54.2]},right:{'Pulgar':[18.2,54.2],'Índice':[35.5,11.7],'Medio':[50.8,5.1],'Anular':[63.2,11.7],'Meñique':[78.2,34.3]}};
const CLIENT_TABS=[['data','Datos de la clienta','person'],['hands','Manos y tallas','hand'],['notes','Observaciones','note'],['designs','Diseños habituales','heart'],['photos','Fotos de trabajos','image'],['spend','Gasto total','bars']];
const PREF_CHIPS=['Almendra','Cuadrada','Nude','Francesa','Diseños','Brillos','Piedras','Colores vivos','Minimalista','Uñas cortas','Uñas largas'];
const NOTE_TAGS=['Uñas frágiles','Piel sensible','Tendencia a levantar','Mucha curvatura','Alergia a productos','Cutículas sensibles','Manos secas','Onicofagia','Puntual','Suele llegar tarde','Prefiere WhatsApp'];

function clientStats(c){
 const list=clientAppointments(c).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)),now=nowStamp();
 const next=list.find(a=>isActive(a)&&a.date+'T'+a.time>=now);
 const past=list.filter(a=>a.date+'T'+a.time<now).reverse();
 const done=list.filter(a=>a.status==='completed');
 const spent=done.reduce((n,a)=>n+apptAmount(a),0);
 return {list,next,past,done,spent,last:past.find(a=>a.status==='completed')||past[0]};
}
function clientState(c,st=clientStats(c)){
 if(c.state&&c.state!=='auto')return c.state;
 const lim=dateKey(addDays(new Date(),-180)),recent=st.done.filter(a=>a.date>=lim).length;
 if(recent>=4)return 'frecuente';
 const since=c.createdAt||st.list[0]?.date||'';
 if(st.done.length<=1&&(!since||since>=dateKey(addDays(new Date(),-60))))return 'nueva';
 if(st.last&&st.last.date<dateKey(addDays(new Date(),-120)))return 'inactiva';
 return '';
}
const STATE_LABEL={frecuente:'Clienta frecuente',nueva:'Clienta nueva',inactiva:'Inactiva'};
function stateBadge(s){return s?`<span class="badge b-${s}">${ic(s==='frecuente'?'crown':s==='nueva'?'sparkles':'clock')}${STATE_LABEL[s]}</span>`:''}

/* Lista */
function clientsPage(){
 const q=norm(view.clientQuery),f=view.clientFilter;
 const rows=A.clients.map(c=>{const st=clientStats(c);return {c,st,state:clientState(c,st)}})
  .filter(({c,state})=>(!q||norm(c.name).includes(q)||String(c.phone||'').replace(/\s/g,'').includes(q.replace(/\s/g,''))||norm(c.instagram).includes(q))&&(f==='all'||state===f))
  .sort((a,b)=>a.c.name.localeCompare(b.c.name,'es'));
 const counts={all:A.clients.length};A.clients.forEach(c=>{const s=clientState(c);counts[s]=(counts[s]||0)+1});
 const body=A.clients.length?`<div class="toolbar">
   <div class="field-pill grow">${ic('search')}<input value="${esc(view.clientQuery)}" placeholder="Buscar por nombre, teléfono o Instagram" oninput="view.clientQuery=this.value;renderClientList()" aria-label="Buscar clienta"></div>
   <div class="chips-row">${[['all','Todas'],['frecuente','Frecuentes'],['nueva','Nuevas'],['inactiva','Inactivas']].map(([k,l])=>`<button class="fchip ${f===k?'on':''}" onclick="view.clientFilter='${k}';render()">${l}<span>${counts[k]||0}</span></button>`).join('')}</div>
   <button class="btn" onclick="openNewClient()">${ic('userplus')}Nueva clienta</button></div>
  <div class="client-grid" id="clientGrid">${rows.map(({c,st,state},i)=>`<button class="client-card" onclick="openClientFile('${c.id}')">${i%3===0?stamp(STAMPS[(i/3*5+4)%STAMPS.length],'sticker mini'):''}${avatarHtml(c,'md')}<span class="cc-body"><b>${esc(c.name)}${state==='frecuente'?` <span class="h-mini">${ic('heartfill')}</span>`:''}</b><small>${ic('phone')}${esc(c.phone||'Sin teléfono')}</small><small class="cc-next">${st.next?`Próxima cita: ${fmtShort(st.next.date)}, ${st.next.time}`:st.last?`Última visita: ${fmtShort(st.last.date)}`:'Sin citas todavía'}</small></span><span class="cc-side">${stateBadge(state)}<span class="cc-count"><b class="num">${st.done.length}</b> visitas</span></span></button>`).join('')||`<p class="muted">Ninguna clienta coincide.</p>`}</div>`
 :card('','',emptyState('Todavía no hay clientas','Crea la primera ficha para guardar sus datos, sus manos y sus diseños favoritos.',`<button class="btn" onclick="openNewClient()">${ic('userplus')}Nueva clienta</button>`));
 return {head:pageHead('Clientas',A.clients.length?`${plural(A.clients.length,'clienta','clientas')} en tu agenda`:'Aquí guardarás las fichas de tus clientas',['gato','rosa']),body,searchPh:'Buscar clienta por nombre, teléfono o nota…'};
}
function renderClientList(){const g=document.getElementById('clientGrid');if(!g)return render();const tmp=document.createElement('div');tmp.innerHTML=clientsPage().body;g.innerHTML=tmp.querySelector('#clientGrid')?.innerHTML||'';ensurePhotoUrls()}
function openNewClient(prefill=''){
 openModal(`<h2 class="modal-title">Nueva clienta</h2><form onsubmit="event.preventDefault();createClient()"><div class="field"><label for="m_name">Nombre completo</label><input id="m_name" value="${esc(prefill)}" placeholder="María García" autocomplete="off" required></div><div class="grid-2"><div class="field"><label for="m_phone">Teléfono</label><input id="m_phone" type="tel" placeholder="600 000 000"></div><div class="field"><label for="m_email">Correo</label><input id="m_email" type="email" placeholder="opcional"></div></div><div class="modal-actions"><button type="button" class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn">Crear ficha</button></div></form>`,{cls:'small'});
}
function newClient(name,phone='',email=''){return {id:uid('c'),name,phone,email,birth:'',address:'',source:'',instagram:'',facebook:'',emergency:'',music:'',snack:'',contactNotes:'',state:'auto',medical:{conditions:[],skin:'',nail:'',notes:''},hands:{left:{size:'Medio',fingers:{}},right:{size:'Medio',fingers:{}}},sizeHistory:[],shape:'',length:'',prefs:[],observations:'',tags:[],photos:[],notes:[],createdAt:new Date().toISOString()}}
function createClient(){
 const name=document.getElementById('m_name').value.trim();if(!name)return toast('Escribe el nombre');
 const dup=A.clients.find(c=>norm(c.name)===norm(name));
 if(dup){toast('Ya existe una ficha con ese nombre');closeModal();return openClientFile(dup.id)}
 const c=newClient(name,document.getElementById('m_phone').value.trim(),document.getElementById('m_email').value.trim());
 A.clients.push(c);save();closeModal();openClientFile(c.id);toast('Ficha creada');
}
function openClientFile(id,tab='data'){if(isWizardRoute())captureWizard();currentClientId=id;view.clientTab=tab;if(location.hash.slice(1)===CLIENT_ROUTE)render();else location.hash=CLIENT_ROUTE}
function currentClient(){return clientById(currentClientId)}
function setClientTab(t){captureWizard();save();view.clientTab=t;render();document.querySelector('.ftabs')?.scrollIntoView({block:'nearest'})}
async function deleteClient(id){
 const c=clientById(id);if(!c)return;const appts=clientAppointments(c);
 if(!await confirmDelete(`¿Enviar la ficha de ${c.name} a la papelera?`,appts.length?`También se moverán ${plural(appts.length,'cita','citas')}. Puedes recuperarlas desde Ajustes › Copia de seguridad › Papelera.`:'Puedes recuperarla desde la papelera.'))return;
 moveToTrash('clients',c);A.clients=A.clients.filter(x=>x.id!==id);
 A.appointments=A.appointments.filter(a=>{if(appts.includes(a)){moveToTrash('appointments',a);return false}return true});
 save();currentClientId=null;location.hash='clients';toast('Ficha enviada a la papelera');
}

/* Ficha */
function clientFile(){
 const c=currentClient(),st=clientStats(c),state=clientState(c,st),tab=view.clientTab;
 const since=c.createdAt?parseDate(c.createdAt.slice(0,10)).toLocaleDateString('es-ES',{month:'long',year:'numeric'}):st.list[0]?parseDate(st.list[0].date).toLocaleDateString('es-ES',{month:'long',year:'numeric'}):'';
 const head=`<button class="back-btn" onclick="go('clients')">${ic('arrowleft')}Volver a clientas</button>`;
 const bodies={data:tabData,hands:tabHands,notes:tabNotes,designs:tabDesigns,photos:tabPhotos,spend:tabSpend};
 const body=`<section class="card profile has-stamp">${stamp('gato','sticker')}
  <label class="pf-photo" title="Cambiar foto de perfil">${avatarHtml(c,'xl')}<span class="cam">${ic('camera')}</span><input type="file" accept="image/*" hidden onchange="avatarAdded(this)"></label>
  <div class="pf-main">
   <div class="pf-name-row"><h1>${esc(c.name)} <span class="h-heart">${ic('heartfill')}</span></h1>${stateBadge(state)}</div>
   <div class="pf-facts">${c.phone?`<span>${ic('phone')}${esc(c.phone)}</span>`:''}${c.email?`<span>${ic('mail')}${esc(c.email)}</span>`:''}${c.birth?`<span>${ic('calendar')}${esc(birthText(c.birth))}</span>`:''}${c.address?`<span>${ic('pin')}${esc(c.address)}</span>`:''}${c.instagram?`<span>${ic('insta')}${esc(c.instagram)}</span>`:''}</div>
   <p class="pf-meta">${since?`Desde ${since}`:''}${since&&st.last?' · ':''}${st.last?`Última cita: ${fmtDate(parseDate(st.last.date))}`:''}</p>
  </div>
  <div class="pf-actions"><button class="btn" onclick="setClientTab('data');setTimeout(()=>document.getElementById('cli_name')?.focus(),50)">${ic('edit')}Editar</button><button class="btn soft square" aria-label="Más opciones" onclick="clientMenu(event)">${ic('more')}</button></div>
  <div class="pf-stats"><div class="mini-stat">${ic('calendar')}<b class="num">${st.list.filter(isActive).length}</b><small>Citas totales</small></div><div class="mini-stat">${ic('coins')}<b class="num">${money(st.spent)}</b><small>Total gastado</small></div></div>
 </section>
 <nav class="ftabs" role="tablist">${CLIENT_TABS.map(([k,l,i])=>`<button role="tab" aria-selected="${tab===k}" class="${tab===k?'on':''}" onclick="setClientTab('${k}')">${ic(i)}<span>${l}</span></button>`).join('')}</nav>
 <div class="file-body" data-tab="${tab}">${(bodies[tab]||tabData)(c,st,state)}</div>`;
 return {head,body,searchPh:'Buscar clienta por nombre, teléfono o nota…'};
}
function birthText(b){const p=parseBirthday(b);if(!p)return b;const y=(String(b).match(/(\d{4})/)||[])[1];return `${p.d} de ${new Date(2000,p.m-1,1).toLocaleDateString('es-ES',{month:'long'})}${y?' de '+y:''}`}
function clientMenu(ev){const c=currentClient();openMenu(ev,[
 {label:'Nueva cita',icon:'pluscircle',action:()=>openAppt(null,'',c.id)},
 c.phone?{label:'Escribir por WhatsApp',icon:'whatsapp',action:()=>openWhatsApp(c.phone,`Hola ${c.name.split(' ')[0]} 🌸`)}:null,
 c.phone?{label:'Llamar',icon:'phone',action:()=>{location.href='tel:'+c.phone.replace(/\s/g,'')}}:null,
 '-',{label:'Eliminar ficha',icon:'trash2',danger:true,action:()=>deleteClient(c.id)}])}
function scriptTitle(t,sub=''){return `<div class="script-head"><span class="sh-star">${ART.sparkle?'':''}✦</span><h2 class="script">${t}</h2>${sub?`<p class="muted">${sub}</p>`:''}<span class="sh-deco">${ART.sprig()}</span></div>`}

/* Pestaña: datos */
function tabData(c,st,state){
 const f=(k,l,t='text',ph='',req=false)=>`<div class="frow"><label for="cli_${k}">${l}${req?' <i class="req">*</i>':''}</label><input id="cli_${k}" type="${t}" value="${esc(c[k]||'')}" ${ph?`placeholder="${ph}"`:''}></div>`;
 const tasks=A.tasks.filter(t=>t.clientId===c.id&&!t.done);
 const prefs=c.prefs||[];
 return `<div class="file-grid">
 <section class="card form-card">${scriptTitle('Datos de la clienta')}<span class="corner-note">Información personal</span>
  <div class="data-cols"><div class="frows">
   ${f('name','Nombre','text','',true)}${f('phone','Teléfono','tel','600 000 000',true)}${f('email','Correo electrónico','email')}${f('birth','Fecha de nacimiento','text','dd/mm/aaaa')}${f('address','Dirección')}
   <div class="frow"><label for="cli_source">Cómo nos conoció</label><select id="cli_source"><option value="">Sin indicar</option>${['Instagram','TikTok','Recomendación','Google','Pasaba por aquí','Otro'].map(o=>`<option ${c.source===o?'selected':''}>${o}</option>`).join('')}</select></div>
   ${f('instagram','Instagram','text','@usuario')}${f('emergency','Teléfono de emergencia','tel')}${f('music','Música favorita')}${f('snack','Bebida o snack')}
  </div>
  <div class="data-side">
   <div class="frow col"><span class="lbl">Foto de perfil</span><label class="pf-photo center" title="Cambiar foto">${avatarHtml(c,'lg')}<span class="cam">${ic('camera')}</span><input type="file" accept="image/*" hidden onchange="avatarAdded(this)"></label>${c.avatar?`<button class="link small" onclick="removeAvatar()">Quitar foto</button>`:''}</div>
   <div class="frow col"><label for="cli_contactNotes">Notas de contacto</label><textarea id="cli_contactNotes" rows="5" placeholder="Prefiere WhatsApp, horario en el que contesta…">${esc(c.contactNotes||'')}</textarea></div>
   <button class="btn wide" onclick="captureWizard();save();render();toast('Cambios guardados')">${ic('save')}Guardar cambios</button>
  </div></div>
 </section>
 <aside class="side-stack">
  ${card('Información adicional','sparkles',`
   <div class="sub-card"><h3>Estado de la clienta</h3><div class="state-seg">${[['frecuente','Frecuente','crown'],['nueva','Nueva',''],['inactiva','Inactiva','']].map(([k,l,i])=>`<button class="${state===k?'on':''}" onclick="setClientState('${k}')">${i?ic(i):''}${l}</button>`).join('')}</div>${c.state&&c.state!=='auto'?`<button class="link small" onclick="setClientState('auto')">Calcular automáticamente</button>`:'<p class="hint">Se calcula solo según sus visitas.</p>'}</div>
   <div class="sub-card"><h3>Recordatorios</h3>${tasks.map(t=>`<div class="mini-task"><button class="check-btn" onclick="toggleTask('${t.id}')" aria-label="Hecho">${ic('checkbox')}</button><span>${esc(t.text)}${t.due?`<small>${fmtShort(t.due)}</small>`:''}</span><button class="icon-btn tiny" aria-label="Eliminar" onclick="deleteTask('${t.id}')">${ic('close')}</button></div>`).join('')}<form class="add-line" onsubmit="event.preventDefault();addTask(this.t.value,'${c.id}');this.reset()"><span>${ic('plus')}</span><input name="t" placeholder="Añadir recordatorio" aria-label="Nuevo recordatorio"></form></div>
   <div class="sub-card"><h3>Preferencias rápidas <button class="icon-btn tiny" aria-label="Editar preferencias" onclick="editPrefs()">${ic('edit')}</button></h3><div class="pref-chips">${prefs.length?prefs.map(p=>`<span class="pchip">${ic('heartfill')}${esc(p)}</span>`).join(''):'<p class="hint">Toca el lápiz para añadir sus gustos.</p>'}</div></div>
   <div class="sub-card"><h3>Alergias o sensibilidades</h3><textarea id="cli_allergies" class="soft-input" rows="2" placeholder="No tiene alergias conocidas.">${esc(c.medical.notes||'')}</textarea></div>
  `,{cls:'info-card',stamp:'love'})}
 </aside></div>`;
}
function setClientState(s){const c=currentClient();captureWizard();c.state=s;save();render()}
function editPrefs(){const c=currentClient();captureWizard();const all=[...new Set([...PREF_CHIPS,...(c.prefs||[])])];
 openModal(`<h2 class="modal-title">Preferencias de ${esc(c.name.split(' ')[0])}</h2><div class="chips" id="prefChips">${all.map(p=>`<button type="button" class="chip ${(c.prefs||[]).includes(p)?'on':''}" data-v="${esc(p)}" onclick="this.classList.toggle('on')">${esc(p)}</button>`).join('')}</div><form class="add-line boxed" onsubmit="event.preventDefault();addPrefChip(this)"><span>${ic('plus')}</span><input name="p" placeholder="Otra preferencia"></form><div class="modal-actions"><button class="btn" onclick="savePrefs()">Guardar</button></div>`,{cls:'small'})}
function addPrefChip(f){const v=f.p.value.trim();if(!v)return;const b=document.createElement('button');b.type='button';b.className='chip on';b.dataset.v=v;b.textContent=v;b.onclick=()=>b.classList.toggle('on');document.getElementById('prefChips').appendChild(b);f.reset()}
function savePrefs(){const c=currentClient();c.prefs=[...document.querySelectorAll('#prefChips .chip.on')].map(b=>b.dataset.v);save();closeModal();render()}

/* Pestaña: manos y tallas */
function tabHands(c){
 const sizes=['','0','1','2','3','4','5','6','7','8','9','10','11'];
 const hand=h=>`<div class="hand-wrap"><h3>Mano ${h==='left'?'izquierda':'derecha'}</h3><div class="hand-pic"><img src="assets/${h==='left'?'hand_left_panel.jpg':'hand_right_panel.jpg'}" alt="Mano ${h==='left'?'izquierda':'derecha'}">${FINGERS.map(f=>{const [x,y]=FINGER_POS[h][f];const v=(c.hands[h].fingers[f]||{}).size||'';return `<label class="size-badge ${v?'set':''}" style="left:${x}%;top:${y}%" title="${f}"><span class="sb-name">${f}</span><select data-hand="${h}" data-finger="${esc(f)}" data-kind="size" aria-label="Talla ${f} ${h==='left'?'izquierda':'derecha'}" onchange="this.parentElement.classList.toggle('set',!!this.value)">${sizes.map(o=>`<option value="${o}" ${v===o?'selected':''}>${o||'–'}</option>`).join('')}</select>${ic('down')}</label>`}).join('')}</div></div>`;
 const hist=(c.sizeHistory||[]).slice().reverse();
 const row=(l,arr)=>`<div class="sz-row">${arr.map(v=>`<span>${esc(v||'–')}</span>`).join('')}</div>`;
 const cur={left:[...FINGERS].reverse().map(f=>(c.hands.left.fingers[f]||{}).size),right:FINGERS.map(f=>(c.hands.right.fingers[f]||{}).size)};
 const conditions=['Alergias (cosméticos)','Piel sensible','Dermatitis','Psoriasis','Hongos o bacterias','Diabetes','Toma algún medicamento','Embarazo'];
 const goods=['Sin enfermedades crónicas','No toma medicación','Buena salud general'];
 return `<div class="file-grid">
 <section class="card">${scriptTitle('Manos y tallas','Registra las tallas de cada uña y guarda medidas personalizadas.')}
  <div class="hands-pair">${hand('left')}${hand('right')}</div>
  <div class="center-actions"><button class="btn" onclick="saveSizes()">${ic('save')}Guardar tallas</button><button class="btn ghost" onclick="clearSizes()">${ic('trash2')}Limpiar</button></div>
  <details class="more"><summary>Forma y piel de cada dedo</summary>${['left','right'].map(h=>{const fs=h==='left'?[...FINGERS].reverse():FINGERS;return `<h4>Mano ${h==='left'?'izquierda':'derecha'}</h4><div class="table-scroll"><table class="finger-table"><thead><tr><th></th>${fs.map(f=>`<th>${f}</th>`).join('')}</tr></thead><tbody>${[['shape','Forma',['Redonda','Cuadrada','Coffin','Almond','Stiletto']],['skin','Piel',['Normal','Seca','Sensible','Grasa']]].map(([k,l,opts])=>`<tr><th>${l}</th>${fs.map(f=>{const v=(c.hands[h].fingers[f]||{})[k]||'';return `<td><select data-hand="${h}" data-finger="${esc(f)}" data-kind="${k}" aria-label="${l} ${f}"><option value="">—</option>${opts.map(o=>`<option ${v===o?'selected':''}>${o}</option>`).join('')}</select></td>`}).join('')}</tr>`).join('')}</tbody></table></div>`}).join('')}</details>
 </section>
 <aside class="side-stack">
  ${card('Tallas guardadas','crown',`${[{label:'Talla actual',date:todayKey(),left:cur.left,right:cur.right,current:true},...hist].slice(0,5).map((h,i)=>`<div class="sz-item ${h.current?'cur':''}"><div class="sz-when"><b>${h.current?'Talla actual':i===1?'Talla anterior':'Guardada'}</b><small>${fmtDate(parseDate(h.date))}</small></div><div class="sz-hands"><small>Izquierda</small>${row('',h.left)}<small>Derecha</small>${row('',h.right)}</div>${h.current?'':`<button class="icon-btn" aria-label="Opciones" onclick="sizeMenu(event,${hist.length-i})">${ic('morev')}</button>`}</div>`).join('')}`,{stamp:'nippon',action:`<button class="btn soft small" onclick="saveSizes()">${ic('plus')}Guardar como plantilla</button>`})}
  ${card('Historial médico','medical',`<div class="med-cols"><div><h4>${ic('plus')}Enfermedades frecuentes</h4>${conditions.map(o=>`<label class="check"><input data-medical type="checkbox" value="${esc(o)}" ${c.medical.conditions.includes(o)?'checked':''}><span>${esc(o)}</span></label>`).join('')}</div><div><h4>${ic('heart')}Saludable</h4>${goods.map(o=>`<label class="check"><input data-medical type="checkbox" value="${esc(o)}" ${c.medical.conditions.includes(o)?'checked':''}><span>${esc(o)}</span></label>`).join('')}<div class="field"><label for="skinType">Tipo de piel</label><select id="skinType"><option value="">Sin indicar</option>${['Normal','Seca','Mixta','Sensible','Madura','Hiperhidrosis'].map(o=>`<option ${c.medical.skin===o?'selected':''}>${o}</option>`).join('')}</select></div><div class="field"><label for="nailType">Tipo de uña</label><select id="nailType"><option value="">Sin indicar</option>${['Sana','Frágil','Micosis','Onicomicosis','Amarillas','Estriada','Oleosa'].map(o=>`<option ${c.medical.nail===o?'selected':''}>${o}</option>`).join('')}</select></div></div></div>`)}
  ${card('Observaciones rápidas','clipboard',`<form onsubmit="event.preventDefault();quickNote(this.n.value);this.reset()"><input name="n" class="soft-input" placeholder="Añadir observación… (Intro para guardar)" aria-label="Observación rápida"></form>${(c.notes||[]).slice(-3).reverse().map(n=>`<p class="qnote"><small>${n.date?fmtShort(n.date):''}</small>${esc(n.text)}</p>`).join('')}`)}
 </aside></div>`;
}
function saveSizes(){const c=currentClient();captureWizard();const snap={date:todayKey(),left:[...FINGERS].reverse().map(f=>(c.hands.left.fingers[f]||{}).size||''),right:FINGERS.map(f=>(c.hands.right.fingers[f]||{}).size||'')};if(![...snap.left,...snap.right].some(Boolean))return toast('Elige primero alguna talla');c.sizeHistory=c.sizeHistory||[];const last=c.sizeHistory[c.sizeHistory.length-1];if(last&&JSON.stringify([last.left,last.right])===JSON.stringify([snap.left,snap.right]))return toast('Estas tallas ya están guardadas');c.sizeHistory.push(snap);save();render();toast('Tallas guardadas')}
async function clearSizes(){if(!await ask({title:'¿Limpiar las tallas actuales?',text:'Las tallas guardadas en el historial no se borran.',ok:'Limpiar'}))return;const c=currentClient();['left','right'].forEach(h=>FINGERS.forEach(f=>{if(c.hands[h].fingers[f])c.hands[h].fingers[f].size=''}));save();render()}
function sizeMenu(ev,idx){const c=currentClient();const h=c.sizeHistory[idx];if(!h)return;openMenu(ev,[{label:'Usar estas tallas',icon:'refresh',action:()=>{[...FINGERS].reverse().forEach((f,i)=>{c.hands.left.fingers[f]={...(c.hands.left.fingers[f]||{}),size:h.left[i]}});FINGERS.forEach((f,i)=>{c.hands.right.fingers[f]={...(c.hands.right.fingers[f]||{}),size:h.right[i]}});save();render();toast('Tallas restauradas')}},{label:'Eliminar',icon:'trash2',danger:true,action:()=>{c.sizeHistory.splice(idx,1);save();render()}}])}
function quickNote(t){t=String(t||'').trim();if(!t)return;const c=currentClient();captureWizard();c.notes.push({date:todayKey(),text:t});save();render();toast('Observación guardada')}

/* Pestaña: observaciones */
function tabNotes(c){
 const notes=c.notes.length?c.notes:[{date:todayKey(),text:''}];
 return `<div class="file-grid even">
 <section class="card">${scriptTitle('Observaciones')}<div class="field"><label for="obs">Observaciones generales</label><textarea id="obs" rows="8" maxlength="2000" placeholder="Lo que conviene recordar para la próxima vez…">${esc(c.observations||'')}</textarea></div>
  <h3 class="sub-title">Etiquetas</h3><div class="chips tagchips">${[...new Set([...NOTE_TAGS,...c.tags])].map(x=>`<button type="button" class="chip ${c.tags.includes(x)?'on':''}" data-tag="${esc(x)}" aria-pressed="${c.tags.includes(x)}" onclick="this.classList.toggle('on');captureWizard();save()">${esc(x)}</button>`).join('')}</div></section>
 ${card('Notas por fecha','note',`<div id="notesBox">${notes.map(noteRow).join('')}</div><button class="btn soft small" onclick="addNoteRow()">${ic('plus')}Añadir nota</button>`,{stamp:'botanical'})}
 </div>`;
}
function noteRow(n){return `<div class="note-row"><input class="note-date" type="date" value="${esc(n.date||'')}" aria-label="Fecha"><input class="note-text" placeholder="Escribe una nota…" value="${esc(n.text||'')}" aria-label="Nota"><button class="icon-btn tiny" aria-label="Borrar nota" onclick="this.parentElement.remove();captureWizard();save()">${ic('close')}</button></div>`}
function addNoteRow(){document.getElementById('notesBox').insertAdjacentHTML('beforeend',noteRow({date:todayKey()}));document.querySelector('#notesBox .note-row:last-child .note-text')?.focus()}

/* Pestaña: diseños habituales */
function tabDesigns(c,st){
 const shapes=[['Redonda','round'],['Cuadrada','square'],['Coffin','coffin'],['Almond','almond'],['Stiletto','stiletto']];
 const lens=[['#1','Extra corto','~1 mm'],['#2','Corto','~3–4 mm'],['#3','Medio','~6–8 mm'],['#4','Medio-largo','~10–13 mm'],['#5','Largo','16 mm o más']];
 const designs=st.list.filter(a=>a.design||a.shape||a.length).reverse().slice(0,10);
 return `<div class="file-grid even">
 <section class="card">${scriptTitle('Diseños habituales','Su forma y largo preferidos se proponen solos al crear una cita.')}
  <h3 class="sub-title">Forma</h3><div class="pick-grid">${shapes.map(([s,f])=>`<button class="pick ${c.shape===s?'on':''}" aria-pressed="${c.shape===s}" onclick="chooseShape('${s}')"><img src="assets/shape_${f}.png" alt=""><span>${s}</span></button>`).join('')}</div>
  <h3 class="sub-title">Largo</h3><div class="pick-grid">${lens.map(([k,n,m])=>`<button class="pick ${c.length===k?'on':''}" aria-pressed="${c.length===k}" onclick="chooseLength('${k}')"><img src="assets/len${k.slice(1)}.png" alt=""><span>${k} · ${n}</span><small>${m}</small></button>`).join('')}</div></section>
 ${card('Diseños anteriores','heart',designs.length?`<ul class="hist">${designs.map(a=>`<li onclick="openAppt('${a.id}')"><span class="num">${fmtDate(parseDate(a.date))}</span><span><b>${esc(a.design||a.service)}</b><small>${[a.service,a.shape,a.length].filter(Boolean).map(esc).join(' · ')}</small></span>${ic('arrow')}</li>`).join('')}</ul>`:'<p class="muted">Cuando anotes el diseño en sus citas, aparecerá aquí.</p>',{stamp:'lirios'})}
 </div>`;
}
function chooseShape(v){const c=currentClient();captureWizard();c.shape=c.shape===v?'':v;save();render()}
function chooseLength(v){const c=currentClient();captureWizard();c.length=c.length===v?'':v;save();render()}

/* Pestaña: fotos */
function tabPhotos(c){
 const slots=['Mano izquierda','Mano derecha','Referencia diseño','Otros'];const photos=c.photos||[];
 const gallery=photos.filter(p=>!slots.includes(p.label));
 return `<div class="file-grid even">
 <section class="card">${scriptTitle('Fotos de trabajos')}<div class="gallery">${gallery.map(p=>photoFig(c,p)).join('')}<label class="g-add">${ic('camera')}<span>Añadir foto</span><input type="file" accept="image/*" multiple hidden onchange="photoAdded(this,'Galería')"></label></div></section>
 ${card('Manos y referencias','image',`<div class="photo-slots">${slots.map(x=>{const ph=photos.slice().reverse().find(p=>p.label===x);return `<label class="slot ${ph?'has':''}">${ph?`<img data-photo="${esc(ph.storagePath||'')}" src="${esc(photoUrl(ph))}" alt="${esc(x)}"><button type="button" class="icon-btn tiny solid" aria-label="Quitar foto" onclick="event.preventDefault();event.stopPropagation();removePhoto('${ph.id}')">${ic('close')}</button>`:ic('camera')}<span>${x}</span><input type="file" accept="image/*" hidden onchange="photoAdded(this,'${x}')"></label>`}).join('')}</div>`)}
 </div>`;
}
function photoFig(c,p){return `<figure><button class="g-img" onclick="viewPhoto('${c.id}','${p.id}')"><img data-photo="${esc(p.storagePath||'')}" src="${esc(photoUrl(p))}" alt="${esc(p.label||'Foto')}" loading="lazy"></button><figcaption><span>${p.date?fmtShort(p.date):''}</span><button class="icon-btn tiny" aria-label="Eliminar foto" onclick="removePhoto('${p.id}')">${ic('trash2')}</button></figcaption></figure>`}
function viewPhoto(cid,pid){const c=clientById(cid);const p=c?.photos?.find(x=>x.id===pid);if(!p)return;openModal(`<img class="photo-full" data-photo="${esc(p.storagePath||'')}" src="${esc(photoUrl(p))}" alt="${esc(p.label||'Foto')}"><p class="muted center">${esc(p.label||'Foto')}${p.date?' · '+fmtLong(p.date):''}</p>`,{cls:'photo-modal'});ensurePhotoUrls()}
async function photoAdded(input,label){
 const files=[...(input.files||[])].filter(f=>f.type.startsWith('image/'));if(!files.length)return toast('Elige una imagen');
 toast('Guardando foto…');captureWizard();const c=currentClient();if(!c)return;
 const slots=['Mano izquierda','Mano derecha','Referencia diseño','Otros'];
 for(const file of files){const data=await compressImage(file);
  if(slots.includes(label)){c.photos.filter(p=>p.label===label).forEach(removeCloudPhoto);c.photos=c.photos.filter(p=>p.label!==label)}
  c.photos.push({id:uid('p'),label,data,date:todayKey()})}
 save();render();toast(files.length>1?`${files.length} fotos guardadas`:'Foto guardada');
}
async function removePhoto(pid){const c=currentClient();const p=c?.photos?.find(x=>x.id===pid);if(!p)return;if(!await confirmDelete('¿Eliminar esta foto?','Se borrará de la ficha y de la nube.'))return;c.photos=c.photos.filter(x=>x.id!==pid);removeCloudPhoto(p);save();render();toast('Foto eliminada')}
async function avatarAdded(input){const f=input.files?.[0];if(!f)return;captureWizard();const c=currentClient();const data=await compressImage(f,480,.86);if(c.avatar)removeCloudPhoto(c.avatar);c.avatar={id:uid('p'),data,date:todayKey()};save();render();toast('Foto de perfil actualizada')}
function removeAvatar(){const c=currentClient();if(!c.avatar)return;removeCloudPhoto(c.avatar);delete c.avatar;save();render()}

/* Pestaña: gasto total */
function tabSpend(c,st){
 const done=st.done,avg=done.length?st.spent/done.length:0;
 const months=[];const now=new Date();for(let i=11;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);const pre=`${d.getFullYear()}-${pad(d.getMonth()+1)}`;months.push({l:cap(d.toLocaleDateString('es-ES',{month:'short'}).replace('.','')),v:done.filter(a=>a.date.startsWith(pre)).reduce((n,a)=>n+apptAmount(a),0)})}
 const max=Math.max(1,...months.map(m=>m.v));
 const bySvc={};done.forEach(a=>bySvc[a.service]=(bySvc[a.service]||0)+1);const top=Object.entries(bySvc).sort((a,b)=>b[1]-a[1]).slice(0,4);const topMax=Math.max(1,...top.map(x=>x[1]));
 const byCat={};done.forEach(a=>{const cat=serviceOf(a)?.cat||'Otros';byCat[cat]=(byCat[cat]||0)+apptAmount(a)});
 return `<div class="spend-grid">
 ${card('Resumen de gasto','coins',`<div class="big-sum"><b class="num">${money(st.spent)}</b><span>Gasto total de la clienta</span></div><div class="sum-pair"><div>${ic('calendar')}<span><b class="num">${done.length}</b><small>Citas realizadas</small></span></div><div>${ic('coins')}<span><b class="num">${money(avg)}</b><small>Gasto medio por cita</small></span></div></div>`)}
 ${card('Historial de citas y gastos','calendar',done.length?`<div class="table-scroll"><table class="tbl"><thead><tr><th>Fecha</th><th>Servicio</th><th class="r">Importe</th><th></th></tr></thead><tbody>${done.slice().reverse().slice(0,12).map(a=>`<tr><td class="num">${fmtDate(parseDate(a.date))}</td><td>${esc(a.design?`${a.service} · ${a.design}`:a.service)}</td><td class="r num">${money(apptAmount(a))}</td><td><button class="icon-btn tiny" aria-label="Abrir cita" onclick="openAppt('${a.id}')">${ic('morev')}</button></td></tr>`).join('')}</tbody></table></div>`:'<p class="muted">Todavía no hay citas completadas.</p>',{cls:'span-rows'})}
 ${card('Gráfico de gasto','bars',`<div class="vbars">${months.map((m,i)=>`<div class="bar ${i===11?'cur':''}" title="${m.l}: ${money(m.v)}"><i style="height:${Math.max(2,m.v/max*100)}%"></i><span>${m.l}</span></div>`).join('')}</div>`,{sub:'Últimos 12 meses'})}
 ${card('Servicios más realizados','star5',top.length?top.map(([n,v])=>`<div class="hbar"><span>${esc(n)}</span><i><em style="width:${v/topMax*100}%"></em></i><b class="num">${v}</b></div>`).join(''):'<p class="muted">Sin datos todavía.</p>')}
 ${card('Gasto por tipo de servicio','pie',donut(byCat,money(st.spent)),{stamp:'fresas'})}
 </div>`;
}

/* Guardado de la ficha */
function captureWizard(){
 const c=currentClient();if(!c||!document.querySelector('.file-body'))return;
 const oldName=c.name;
 ['name','email','phone','birth','address','instagram','emergency','music','snack','contactNotes'].forEach(k=>{const e=document.getElementById('cli_'+k);if(e)c[k]=e.value.trim()});
 const src=document.getElementById('cli_source');if(src)c.source=src.value;
 const al=document.getElementById('cli_allergies');if(al)c.medical.notes=al.value;
 if(!c.name)c.name=oldName||'Sin nombre';
 if(c.name!==oldName)A.appointments.forEach(a=>{if(a.clientId===c.id||(!a.clientId&&norm(a.client)===norm(oldName))){a.client=c.name;a.clientId=c.id}});
 if(document.querySelector('input[data-medical]'))c.medical.conditions=[...document.querySelectorAll('input[data-medical]:checked')].map(e=>e.value);
 const sk=document.getElementById('skinType');if(sk)c.medical.skin=sk.value;const nt=document.getElementById('nailType');if(nt)c.medical.nail=nt.value;
 document.querySelectorAll('select[data-hand][data-finger]').forEach(e=>{const h=e.dataset.hand,f=e.dataset.finger;c.hands[h].fingers[f]={...(c.hands[h].fingers[f]||{}),[e.dataset.kind]:e.value}});
 const o=document.getElementById('obs');if(o)c.observations=o.value;
 if(document.querySelector('.tagchips'))c.tags=[...document.querySelectorAll('.tagchips .chip.on')].map(e=>e.dataset.tag);
 if(document.getElementById('notesBox'))c.notes=[...document.querySelectorAll('.note-row')].map(r=>({date:r.querySelector('.note-date')?.value||'',text:r.querySelector('.note-text')?.value||''})).filter(n=>n.date||n.text.trim());
}
document.addEventListener('input',e=>{if(isWizardRoute()&&e.target.closest('.file-body')&&!e.target.closest('form')){clearTimeout(window.__autoSave);window.__autoSave=setTimeout(()=>{captureWizard();save()},600)}});
document.addEventListener('change',e=>{if(isWizardRoute()&&e.target.closest('.file-body')&&!e.target.matches('input[type=file]')&&!e.target.closest('form')){captureWizard();save()}});
