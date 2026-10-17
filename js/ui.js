/* Lilium · interfaz común: marco, navegación, avisos, ventanas, menús */
const ic=(n,c)=>ART.icon(n,c);
const NAV=[['home','Inicio','house'],['agenda','Agenda','calendar'],['clients','Clientas','person'],['services','Servicios','wrench'],['finance','Finanzas','chartline'],['settings','Ajustes','cog']];
const CLIENT_ROUTE='client';
const view={agendaDate:new Date(),agendaView:window.innerWidth<760?'day':'week',clientQuery:'',clientFilter:'all',apptQuery:'',apptStatus:'all',serviceCat:'Todos',summaryRange:'day',financeMonth:null,clientTab:'data'};
let currentClientId=null,pendingRefresh=false;

function route(){return location.hash.slice(1)||'home'}
function isWizardRoute(){return route()===CLIENT_ROUTE}
function go(page){if(isWizardRoute()&&typeof captureWizard==='function'){captureWizard();save()}closeMenu();if(location.hash.slice(1)===page)render();else location.hash=page}

/* Avisos */
function toast(t,ms=2400){const x=document.getElementById('toast');if(!x)return;x.textContent=t;x.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>x.classList.remove('show'),ms)}

/* Ventanas */
let modalOnClose=null;
function openModal(html,{cls='',onClose=null}={}){
 closeMenu();modalOnClose=onClose;
 document.getElementById('modal-root').innerHTML=`<div class="modal" role="dialog" aria-modal="true" onmousedown="if(event.target===this)closeModal()"><div class="modal-card ${cls}"><button class="close" onclick="closeModal()" aria-label="Cerrar">${ic('close')}</button>${html}</div></div>`;
 const f=document.querySelector('.modal-card [autofocus],.modal-card input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=file])');if(f&&window.innerWidth>760)setTimeout(()=>f.focus(),40);
}
function modalOpen(){return !!document.querySelector('#modal-root .modal')}
function closeModal(){const cb=modalOnClose;modalOnClose=null;document.getElementById('modal-root').innerHTML='';if(cb)cb();if(pendingRefresh){pendingRefresh=false;render()}}
function ask({title='¿Seguro?',text='',ok='Aceptar',cancel='Cancelar',danger=false}={}){
 return new Promise(res=>{let done=false;const finish=v=>{if(done)return;done=true;res(v)};
  window.__askResolve=v=>{finish(v);closeModal()};
  openModal(`<h2 class="modal-title">${esc(title)}</h2>${text?`<p class="modal-text">${text}</p>`:''}<div class="modal-actions"><button class="btn ghost" onclick="__askResolve(false)">${esc(cancel)}</button><button class="btn ${danger?'danger':''}" autofocus onclick="__askResolve(true)">${esc(ok)}</button></div>`,{cls:'small',onClose:()=>finish(false)})});
}
async function confirmDelete(title,text){if(A.settings.security?.confirmDelete===false)return true;return ask({title,text,ok:'Eliminar',danger:true})}
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(document.querySelector('.popmenu'))closeMenu();else if(modalOpen())closeModal()}});

/* Menú contextual (los «···») */
function openMenu(ev,items){
 ev.stopPropagation();closeMenu();
 const r=ev.currentTarget.getBoundingClientRect();
 const m=document.createElement('div');m.className='popmenu';m.setAttribute('role','menu');
 m.innerHTML=items.filter(Boolean).map((it,i)=>it==='-'?'<hr>':`<button role="menuitem" class="${it.danger?'danger':''}" data-i="${i}">${it.icon?ic(it.icon):''}<span>${esc(it.label)}</span></button>`).join('');
 document.body.appendChild(m);
 const w=m.offsetWidth,h=m.offsetHeight;let x=r.right-w,y=r.bottom+6;if(x<8)x=8;if(y+h>innerHeight-8)y=r.top-h-6;
 m.style.left=x+'px';m.style.top=Math.max(8,y)+'px';
 const list=items.filter(Boolean);
 m.querySelectorAll('button').forEach(b=>b.onclick=e=>{e.stopPropagation();const it=list[+b.dataset.i];closeMenu();it.action?.()});
 m.querySelector('button')?.focus();
}
function closeMenu(){document.querySelectorAll('.popmenu').forEach(x=>x.remove())}
document.addEventListener('click',e=>{if(!e.target.closest('.popmenu'))closeMenu()});
window.addEventListener('scroll',closeMenu,true);

/* Refresco seguro: no pisa lo que se está escribiendo */
function safeRefresh(){const ae=document.activeElement;if(modalOpen()||(ae&&/INPUT|TEXTAREA|SELECT/.test(ae.tagName)&&ae.id!=='globalSearch')){pendingRefresh=true;return}render()}
document.addEventListener('focusout',()=>{setTimeout(()=>{if(pendingRefresh&&!modalOpen()){const ae=document.activeElement;if(!(ae&&/INPUT|TEXTAREA|SELECT/.test(ae.tagName))){pendingRefresh=false;render()}}},200)});

/* Estado de la nube */
function syncLabel(){
 if(!sb)return ['local','Solo en este dispositivo'];
 if(!cloudUser)return ['local','Nube sin conectar'];
 if(syncState==='busy')return ['busy','Sincronizando…'];
 if(syncState==='offline')return ['warn','Sin conexión · guardado aquí'];
 if(syncState==='error')return ['warn','No se pudo sincronizar'];
 const last=lsGet(K.lastSync);if(!last)return ['ok','Nube conectada'];
 const mins=Math.round((Date.now()-new Date(last).getTime())/60000);
 return ['ok',mins<1?'Sincronizado ahora':mins<60?`Sincronizado hace ${mins} min`:'Sincronizado a las '+new Date(last).toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})];
}
function syncPillHtml(){const [s,l]=syncLabel();return `<span class="dot ${s}"></span><span>${esc(l)}</span>`}
function updateSyncPill(){document.querySelectorAll('.sync-pill').forEach(el=>el.innerHTML=syncPillHtml())}
setInterval(updateSyncPill,60000);

/* Avatares */
function avatarHtml(c,cls=''){const src=c?.avatar?photoUrl(c.avatar):'';return `<span class="avatar ${cls}">${src||c?.avatar?.storagePath?`<img data-photo="${esc(c.avatar.storagePath||'')}" src="${esc(src)}" alt="">`:`<i>${initials(c?.name||'?')}</i>`}</span>`}
function ownerAvatar(){const s=A.settings;return `<span class="avatar sm">${s.ownerPhoto?`<img src="${esc(s.ownerPhoto)}" alt="">`:`<i>${initials(s.ownerName||s.name)}</i>`}</span>`}
function logoHtml(){const s=A.settings;if(s.brandLogo)return `<img class="logo-img custom" src="${esc(s.brandLogo)}" alt="${esc(s.name)}">`;return `<img class="logo-img only-light" src="assets/art/logo.webp" alt="${esc(s.name||'Lilium Beauty')}"><img class="logo-img only-dark" src="assets/art/logo-dark.webp" alt="">`}
function isDark(){return document.documentElement.dataset.theme==='dark'}
function toggleTheme(){A.settings.theme=isDark()?'light':'dark';save();applySettings()}

/* Marco de la aplicación */
function layout(pg,active){
 const s=A.settings;
 const nav=NAV.map(([k,l,i])=>`<button class="${active===k?'active':''}" onclick="go('${k}')" ${active===k?'aria-current="page"':''}>${ic(i)}<span>${l}</span></button>`).join('');
 const now=new Date();
 return `<div class="app">
 <aside class="sidebar">
  <div class="side-chain">${ART.chain(560)}</div>
  <button class="logo" onclick="go('home')" aria-label="Ir al inicio">${logoHtml()}</button>
  <nav class="nav" aria-label="Principal">${nav}</nav>
  <div class="side-foot"><button class="sync-pill" onclick="openCloud()">${syncPillHtml()}</button></div>
  <div class="side-swan" aria-hidden="true"></div>
 </aside>
 <main class="main">
  <header class="topbar">
   <div class="tb-title">${pg.head||''}</div>
   <div class="search" role="search">${ic('search')}<input id="globalSearch" autocomplete="off" placeholder="${pg.searchPh||'Buscar clienta, cita o servicio…'}" oninput="globalSearch(this.value)" onkeydown="searchKey(event)" onfocus="globalSearch(this.value)" aria-label="Buscar"><div class="search-results" id="searchResults"></div></div>
   <div class="tb-right">
    <div class="tb-row">
     <button class="theme-toggle" onclick="toggleTheme()" aria-label="Cambiar modo claro u oscuro"><span class="tt-sun">${ic('sun')}</span><span class="tt-moon">${ic('moon')}</span></button>
     <button class="round-btn news-bell ${lsGet(K.whatsnew)!==APP_VERSION?'has-news':''}" title="Novedades" aria-label="Novedades" onclick="showWhatsNew()">${ic('bellr')}</button>
     <button class="acct" onclick="profileMenu(event)" aria-label="Menú de la cuenta">${ownerAvatar()}<span class="pf-name">${esc(s.name||'Lilium Beauty')}</span>${ic('down')}</button>
    </div>
    ${pg.clock?`<div class="tb-date"><span>${cap(now.toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long',year:'numeric'}))}</span><b class="clock" id="clock">${pad(now.getHours())}:${pad(now.getMinutes())}</b></div>`:''}
   </div>
  </header>
  <div class="view">${pg.body}</div>
 </main>
 <nav class="tabbar" aria-label="Principal">${nav}</nav>
</div>`;
}
setInterval(()=>{const c=document.getElementById('clock');if(c){const n=new Date();c.textContent=pad(n.getHours())+':'+pad(n.getMinutes())}},15000);
function profileMenu(ev){openMenu(ev,[
 {label:cloudUser?'Cuenta y nube':'Iniciar sesión en la nube',icon:'cloud',action:openCloud},
 {label:'Ajustes',icon:'cog',action:()=>go('settings')},
 {label:'Novedades',icon:'sparkles',action:showWhatsNew},
 A.settings.pinEnabled?{label:'Bloquear',icon:'lock',action:lockApp}:null,
 cloudUser?'-':null,
 cloudUser?{label:'Cerrar sesión',icon:'logout',action:cloudLogout}:null])}
function pageHead(title,sub='',stamps=[]){return `<div class="head-wrap"><div><h1 class="page-title">${title} <span class="h-heart">${ic('heartfill')}</span></h1>${sub?`<p class="page-sub">${sub}</p>`:''}</div>${stamps.length?`<div class="head-stamps" aria-hidden="true">${stamps.map((n,i)=>stamp(n,'hs hs'+i,[-8,6,-3][i])).join('')}</div>`:''}</div>`}
const STAMPS=['flores','botanical','shillings','love','gato','cisne','dama','danmark','nippon','mariposa','ciruelo','rosa','lirios','puente','fresas','avion'];
function stampRot(n){let h=0;for(const ch of n)h=(h*31+ch.charCodeAt(0))|0;return ((Math.abs(h)%13)-6)}
function stamp(n,cls='',rot=null){return `<img class="stamp ${cls}" src="assets/stamps/${n}.webp" alt="" aria-hidden="true" loading="lazy" style="--r:${rot??stampRot(n)}deg">`}
function card(title,iconName,body,{cls='',action='',sub='',stamp:st=''}={}){return `<section class="card ${cls} ${st?'has-stamp':''}">${st?stamp(st,'sticker'):''}${title?`<header class="card-head"><div class="ch-title">${iconName?`<span class="ch-ic">${ic(iconName)}</span>`:''}<div><h2>${title}</h2>${sub?`<p class="ch-sub">${sub}</p>`:''}</div></div>${action}</header>`:''}${body}</section>`}
function emptyState(title,text,action=''){return `<div class="empty"><div class="empty-stamps">${stamp('cisne','',-6)}${stamp('love','',5)}</div><p class="empty-title">${title}</p><p class="muted">${text}</p>${action}</div>`}

function render(){
 const p=route();
 const pages={home,clients:clientsPage,agenda:agendaPage,services:servicesPage,finance:financePage,settings:settingsPage};
 const app=document.getElementById('app');
 closeMenu();
 if(needsLogin())return showLogin();
 if(p===CLIENT_ROUTE){
  if(!currentClientId||!clientById(currentClientId)){location.replace('#clients');return}
  app.innerHTML=layout(clientFile(),'clients');
 }else{const key=pages[p]?p:'home';app.innerHTML=layout(pages[key](),key)}
 document.title=(A.settings.name||'Lilium Beauty')+' · Tu espacio de uñas';
 ensurePhotoUrls();afterRender();
}
function afterRender(){const now=document.querySelector('.now-line');if(now&&!window.__scrolledNow){window.__scrolledNow=true;const sc=now.closest('.tg-scroll');if(sc)sc.scrollTop=Math.max(0,now.offsetTop-160)}}
window.addEventListener('hashchange',()=>{window.__scrolledNow=false;render();window.scrollTo(0,0)});

/* Búsqueda global */
let searchSel=0;
function searchItems(v){
 const q=norm(v);if(q.length<1)return [];
 const cl=A.clients.filter(c=>norm(c.name).includes(q)||String(c.phone||'').replace(/\s/g,'').includes(q.replace(/\s/g,''))||norm(c.contactNotes).includes(q)).slice(0,6).map(c=>({kind:'c',id:c.id,title:c.name,sub:c.phone||'Ficha de clienta'}));
 const sv=A.services.filter(s=>norm(s.name).includes(q)).slice(0,3).map(s=>({kind:'s',id:s.id,title:s.name,sub:`${s.cat} · ${money0(s.price)}`}));
 const ap=A.appointments.filter(a=>norm(a.client).includes(q)||norm(a.service).includes(q)).sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time)).slice(0,4).map(a=>({kind:'a',id:a.id,title:`${a.client} · ${a.service}`,sub:`${fmtShort(a.date)}, ${a.time}`}));
 return [...cl,...ap,...sv];
}
function globalSearch(v){
 const box=document.getElementById('searchResults');if(!box)return;const items=searchItems(v);searchSel=0;
 if(!v.trim()){box.classList.remove('open');box.innerHTML='';return}
 box.innerHTML=items.length?items.map((it,i)=>`<button class="sr-item ${i===0?'sel':''}" onmousedown="event.preventDefault();pickSearch('${it.kind}','${it.id}')">${ic(it.kind==='c'?'person':it.kind==='s'?'wrench':'calendar')}<span><b>${esc(it.title)}</b><small>${esc(it.sub)}</small></span></button>`).join(''):`<div class="sr-empty">Nada coincide con «${esc(v)}»</div>`;
 box.classList.add('open');
}
function searchKey(e){
 const box=document.getElementById('searchResults');const items=[...box.querySelectorAll('.sr-item')];
 if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();if(!items.length)return;searchSel=(searchSel+(e.key==='ArrowDown'?1:-1)+items.length)%items.length;items.forEach((x,i)=>x.classList.toggle('sel',i===searchSel))}
 else if(e.key==='Enter'){items[searchSel]?.dispatchEvent(new MouseEvent('mousedown'))}
 else if(e.key==='Escape'){e.target.value='';globalSearch('');e.target.blur()}
}
document.addEventListener('focusout',e=>{if(e.target?.id==='globalSearch')setTimeout(()=>document.getElementById('searchResults')?.classList.remove('open'),150)});
function pickSearch(kind,id){document.getElementById('searchResults')?.classList.remove('open');if(kind==='c')openClientFile(id);else if(kind==='s')openService(id);else openAppt(id)}

/* Imágenes: comprimir antes de guardar */
function compressImage(file,max=1600,q=.84){
 return new Promise((res,rej)=>{const r=new FileReader();r.onerror=rej;r.onload=()=>{const img=new Image();img.onerror=()=>res(r.result);img.onload=()=>{
  const k=Math.min(1,max/Math.max(img.width,img.height));const w=Math.round(img.width*k),h=Math.round(img.height*k);
  const cv=document.createElement('canvas');cv.width=w;cv.height=h;const cx=cv.getContext('2d');cx.fillStyle='#fff';cx.fillRect(0,0,w,h);cx.drawImage(img,0,0,w,h);
  try{res(cv.toDataURL('image/jpeg',q))}catch{res(r.result)}};img.src=r.result};r.readAsDataURL(file)});
}

/* Selector segmentado */
function seg(name,opts,val,onchange=''){return `<div class="seg" role="radiogroup">${opts.map(([v,l])=>`<label class="${String(val)===String(v)?'on':''}"><input type="radio" name="${name}" value="${esc(v)}" ${String(val)===String(v)?'checked':''} onchange="this.closest('.seg').querySelectorAll('label').forEach(x=>x.classList.toggle('on',x.contains(this)));${onchange}">${l}</label>`).join('')}</div>`}
function segVal(name){return document.querySelector(`input[name="${name}"]:checked`)?.value}
const STATUS=[['pending','Pendiente'],['completed','Completada'],['cancelled','Cancelada'],['noshow','No vino']];
const PAYMENT=[['pending','Sin cobrar'],['cash','Efectivo'],['card','Tarjeta'],['bizum','Bizum']];
function statusLabel(s){return (STATUS.find(x=>x[0]===s)||STATUS[0])[1]}
function paymentLabel(p){return (PAYMENT.find(x=>x[0]===p)||PAYMENT[0])[1]}
function liveStatus(a){if(a.status!=='pending')return a.status;const n=new Date(),k=todayKey();if(a.date!==k)return 'pending';const m=n.getHours()*60+n.getMinutes(),s=tmin(a.time);return m>=s&&m<s+apptDur(a)?'live':'pending'}
const LIVE_LABEL={pending:'Pendiente',live:'En curso',completed:'Completada',cancelled:'Cancelada',noshow:'No vino'};
function statusPill(a){const s=liveStatus(a);return `<span class="pill st-${s}"><i></i>${LIVE_LABEL[s]}</span>`}
function pctChange(cur,prev){if(!prev)return null;return Math.round((cur-prev)/prev*100)}
function trend(p,suffix){if(p===null||!isFinite(p))return '';return `<span class="trend ${p>=0?'up':'down'}">${ic(p>=0?'arrowup':'arrowdown')}${p>=0?'+':''}${p}% ${suffix}</span>`}
