/* Privacidad, RGPD y cookies (Reglamento UE 2016/679, LOPDGDD 3/2018 y LSSI 34/2002) */
const PRIVACY_VERSION='2026-10';
const TRASH_DAYS=30, INACTIVE_YEARS=2;

function legalData(){
 const p=(typeof CAT!=='undefined'&&CAT.profile)||{},s=A.settings;
 return {name:p.legal_name||s.ownerName||'',nif:p.legal_id||'',addr:p.legal_address||'',email:p.email||s.email||'',biz:p.business||s.name||'Lilium Beauty',city:p.city||''};
}
function legalWho(){const l=legalData();return `${l.name||l.biz}${l.nif?' (NIF '+l.nif+')':''}`}

/* ---------- Consentimiento de cada clienta ---------- */
function consentCard(c){
 const k=c.consent;
 if(k)return `<div class="sub-card consent ok"><h3>Protección de datos</h3><p class="ok-line">${ic('check')}<span>Permiso dado el ${fmtDate(new Date(k.at))}${k.health?'<br><small>Incluye alergias y datos de salud</small>':''}</span></p><button class="link small" onclick="withdrawConsent()">Retirar el permiso</button></div>`;
 return `<div class="sub-card consent"><h3>Protección de datos</h3><p class="hint">Antes de guardar sus datos (sobre todo alergias, que son datos de salud) la ley pide que la informes y te dé su permiso.</p><div class="consent-btns"><button class="btn soft small" onclick="sendPrivacyText()">${ic(c.phone?'whatsapp':'send')}Enviarle el aviso</button><button class="btn small" onclick="recordConsent()">${ic('check')}Ya me dio su permiso</button></div></div>`;
}
function clientPrivacyText(c){
 const l=legalData();const first=(c?.name||'').split(' ')[0];
 return `Hola${first?' '+first:''} 🌸 Antes de nada, un aviso de privacidad:

Para atenderte guardo en mi agenda tus datos de contacto, tus medidas de uñas, fotos de los diseños y, si me lo cuentas, alergias o sensibilidades.

• Responsable: ${legalWho()} · ${l.biz}${l.email?' · '+l.email:''}
• Para qué: gestionar tus citas y pedidos y avisarte de ellos.
• Base legal: tu consentimiento, que puedes retirar cuando quieras.
• No se los doy a nadie. Se guardan cifrados en servidores de la Unión Europea.
• Los guardo mientras seas clienta y hasta ${INACTIVE_YEARS} años después de tu último servicio.
• Puedes pedirme verlos, corregirlos, borrarlos o llevártelos escribiéndome por aquí${l.email?' o a '+l.email:''}. También puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).

¿Me das tu permiso para guardarlos, incluidas tus alergias si las hay? Responde «Sí, acepto» 💕`;
}
function sendPrivacyText(){
 const c=currentClient();const txt=clientPrivacyText(c);
 if(c?.phone&&openWhatsApp(c.phone,txt))return;
 (navigator.clipboard?.writeText(txt)||Promise.reject()).then(()=>toast('Aviso copiado: pégalo donde le escribas')).catch(()=>openModal(`<h2 class="modal-title">Aviso de privacidad</h2><textarea class="soft-input" rows="14" readonly>${esc(txt)}</textarea>`));
}
async function recordConsent(){
 const c=currentClient();if(!c)return;captureWizard();
 openModal(`<h2 class="modal-title">Registrar su permiso</h2><p class="modal-text">Marca solo lo que ${esc(c.name.split(' ')[0])} te haya aceptado (por ejemplo, respondiendo «Sí, acepto» a tu aviso).</p>
  <label class="check-row"><input type="checkbox" id="cs_basic" checked><span>Guardar sus datos de contacto, medidas, fotos y citas</span></label>
  <label class="check-row"><input type="checkbox" id="cs_health" ${c.medical?.notes?'checked':''}><span>Guardar alergias y datos de salud</span></label>
  <div class="field"><label for="cs_how">Cómo te lo dio</label><select id="cs_how">${['Por WhatsApp','En persona','Por Instagram','Por email','Desde el catálogo'].map(o=>`<option>${o}</option>`).join('')}</select></div>
  <div class="modal-actions"><button class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn" onclick="saveConsent()">${ic('check')}Guardar</button></div>`);
}
function saveConsent(){
 const c=currentClient();if(!c)return;
 if(!document.getElementById('cs_basic').checked)return toast('Sin su permiso básico no deberías guardar su ficha');
 c.consent={at:new Date().toISOString(),health:document.getElementById('cs_health').checked,how:document.getElementById('cs_how').value,version:PRIVACY_VERSION};
 if(!c.consent.health&&c.medical?.notes){c.medical.notes=''}
 c.updatedAt=new Date().toISOString();save();closeModal();render();toast('Permiso guardado');
}
async function withdrawConsent(){
 const c=currentClient();if(!c)return;captureWizard();
 if(!await ask({title:'¿Retirar su permiso?',text:'Se borrarán sus alergias y datos de salud. Si quiere que borres todo, usa «Borrar todo para siempre» en el menú de su ficha.',ok:'Retirar',danger:true}))return;
 c.consent=null;if(c.medical)c.medical.notes='';c.updatedAt=new Date().toISOString();save();render();toast('Permiso retirado y datos de salud borrados');
}

/* ---------- Derechos: acceso/portabilidad y supresión ---------- */
function exportClientData(id){
 const c=clientById(id);if(!c)return;
 const appts=clientAppointments(c).map(a=>({fecha:a.date,hora:a.time,servicio:a.service,precio:a.price,estado:a.status,notas:a.notes}));
 const clean=JSON.parse(JSON.stringify(c));(clean.photos||[]).forEach(p=>{delete p.data;delete p.url});if(clean.avatar){delete clean.avatar.data;delete clean.avatar.url}
 const payload={responsable:legalWho(),negocio:legalData().biz,generado:new Date().toISOString(),clienta:clean,citas:appts};
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`datos-${(c.name||'clienta').toLowerCase().replace(/[^a-z0-9áéíóúñ]+/gi,'-')}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
 toast('Datos descargados: puedes enviárselos');
}
async function eraseClientForever(id,silent=false){
 const c=clientById(id)||A.trash.clients.find(x=>x.id===id);if(!c)return false;
 if(!silent&&!await ask({title:`¿Borrar a ${c.name} para siempre?`,text:'Se eliminan su ficha, citas, fotos y recordatorios de este dispositivo y de la nube, también de la papelera. No se puede deshacer.',ok:'Borrar para siempre',danger:true}))return false;
 const now=new Date().toISOString();
 const appts=[...A.appointments,...A.trash.appointments].filter(a=>a.clientId===c.id||(!a.clientId&&norm(a.client)===norm(c.name)));
 const ids=new Set([c.id,...appts.map(a=>a.id)]);
 [c.avatar,...(c.photos||[])].filter(Boolean).forEach(p=>removeCloudPhoto(p));
 A.clients=A.clients.filter(x=>x.id!==c.id);
 A.appointments=A.appointments.filter(a=>!ids.has(a.id));
 A.tasks=A.tasks.filter(t=>{if(t.clientId===c.id){A.trash.removed[t.id]=now;return false}return true});
 ['clients','services','appointments'].forEach(k=>A.trash[k]=A.trash[k].filter(x=>!ids.has(x.id)));
 ids.forEach(i=>{A.trash.removed[i]=now;A.trash.erased[i]=now});
 save();
 if(!silent){if(currentClientId===c.id){currentClientId=null;location.hash='clients'}else render();toast('Datos borrados para siempre');if(cloudUser)syncCloud('smart',true)}
 return true;
}

/* ---------- Conservación limitada ---------- */
function purgeTrash(){
 const lim=new Date(Date.now()-TRASH_DAYS*864e5).toISOString();let n=0;const now=new Date().toISOString();
 ['clients','services','appointments'].forEach(k=>{A.trash[k]=A.trash[k].filter(x=>{if((x.deletedAt||'')<lim){A.trash.erased[x.id]=now;n++;return false}return true})});
 const old=new Date(Date.now()-3*365*864e5).toISOString();Object.keys(A.trash.erased).forEach(k=>{if(A.trash.erased[k]<old)delete A.trash.erased[k]});
 if(n)save();
}
function lastServiceDate(c){const d=clientAppointments(c).map(a=>a.date).sort().pop();return d||(c.createdAt||'').slice(0,10)}
function inactiveClients(){const lim=new Date();lim.setFullYear(lim.getFullYear()-INACTIVE_YEARS);const k=todayKeyOf(lim);return A.clients.filter(c=>{const d=lastServiceDate(c);return d&&d<k})}
function todayKeyOf(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function openInactive(){
 const list=inactiveClients();
 openModal(`<h2 class="modal-title">Clientas sin venir hace más de ${INACTIVE_YEARS} años</h2><p class="modal-text">La ley pide no guardar datos más tiempo del necesario. Borra las que ya no vayan a volver.</p>
 ${list.length?`<div class="inactive-list">${list.map(c=>`<div class="inactive-row"><span><b>${esc(c.name)}</b><small>Última vez: ${esc(lastServiceDate(c))}</small></span><button class="btn soft small danger" onclick="eraseClientForever('${c.id}').then(ok=>ok&&openInactive())">${ic('trash2')}Borrar</button></div>`).join('')}</div>`:'<p class="muted">No hay ninguna. ¡Todo en orden!</p>'}`);
}

/* ---------- Tarjeta en Ajustes ---------- */
function privacyCard(){
 const total=A.clients.length,without=A.clients.filter(c=>!c.consent).length,health=A.clients.filter(c=>c.medical?.notes&&!c.consent?.health).length,inact=inactiveClients().length;
 const l=legalData();
 return card('Privacidad y protección de datos','shield',`
  <div class="priv-stats">
   <div class="${without?'warn':'ok'}"><b>${total-without}/${total}</b><small>clientas con permiso guardado</small></div>
   <div class="${health?'warn':'ok'}"><b>${health}</b><small>con alergias sin permiso de salud</small></div>
   <div class="${inact?'warn':'ok'}"><b>${inact}</b><small>sin venir hace +${INACTIVE_YEARS} años</small></div>
  </div>
  ${without?`<p class="hint">Abre la ficha de cada clienta › «Protección de datos» para enviarle el aviso y guardar su permiso.</p>`:''}
  <button class="row-link" onclick="openClientsWithoutConsent()">${ic('users')}<span><b>Ver clientas sin permiso</b><small>Para enviarles el aviso de privacidad</small></span>${ic('right')}</button>
  <button class="row-link" onclick="openInactive()">${ic('history')}<span><b>Revisar clientas antiguas</b><small>Borra las que ya no vengan</small></span>${ic('right')}</button>
  <button class="row-link" onclick="copyGenericPrivacy()">${ic('send')}<span><b>Copiar aviso de privacidad</b><small>Para enviarlo a una clienta nueva</small></span>${ic('right')}</button>
  <button class="row-link" onclick="openPrivacyInfo()">${ic('info')}<span><b>Cómo se protegen tus datos</b><small>Seguridad, cookies y tus obligaciones</small></span>${ic('right')}</button>
  ${!l.name||!l.nif?`<p class="warn-note">${ic('info')}Falta tu nombre y NIF en Catálogo › Datos de contacto › Datos legales.</p>`:''}
  <p class="hint">La papelera se vacía sola a los ${TRASH_DAYS} días y los pedidos del catálogo se borran solos al año de cerrarse.</p>`,{sub:'RGPD: lo que la ley te pide, en un sitio.'});
}
function openClientsWithoutConsent(){
 const list=A.clients.filter(c=>!c.consent);
 openModal(`<h2 class="modal-title">Clientas sin permiso guardado</h2><p class="modal-text">Toca una para abrir su ficha, enviarle el aviso y guardar su permiso.</p>
 ${list.length?`<div class="inactive-list">${list.map(c=>`<button class="inactive-row" onclick="closeModal();openClientFile('${c.id}','data')"><span><b>${esc(c.name)}</b><small>${c.medical?.notes?'Tiene alergias anotadas':'Sin datos de salud'}</small></span>${ic('right')}</button>`).join('')}</div>`:'<p class="muted">Todas tienen su permiso guardado. 💕</p>'}`);
}
function copyGenericPrivacy(){const t=clientPrivacyText(null);(navigator.clipboard?.writeText(t)||Promise.reject()).then(()=>toast('Aviso copiado')).catch(()=>openModal(`<h2 class="modal-title">Aviso de privacidad</h2><textarea class="soft-input" rows="14" readonly>${esc(t)}</textarea>`))}

/* ---------- Información de privacidad y cookies ---------- */
function openPrivacyInfo(){
 const l=legalData();
 openModal(`<h2 class="modal-title">Privacidad y seguridad</h2><div class="legal-text">
  <p>Esta aplicación es la herramienta de trabajo privada de <b>${esc(l.biz)}</b>${l.name?`, cuya responsable es ${esc(legalWho())}`:''}. Solo puede entrar la titular con su correo y contraseña.</p>
  <h3>Cómo se protegen los datos</h3>
  <ul><li>Acceso solo con cuenta. Sin iniciar sesión no se ve ningún dato, ni aunque falle internet.</li>
  <li>Al cerrar sesión se borra la copia del dispositivo. Todo sigue a salvo en la cuenta.</li>
  <li>Las reglas de la base de datos impiden que nadie más lea, cambie o borre la información, aunque conozca la dirección de la web.</li>
  <li>Conexión cifrada (HTTPS) y servidores en la Unión Europea (Irlanda), con Supabase como encargado del tratamiento.</li>
  <li>Las fotos de clientas son privadas: se ven con enlaces temporales que caducan en 12 horas.</li>
  <li>PIN opcional al abrir la app y cambio de contraseña desde Ajustes.</li></ul>
  <h3>Datos de las clientas</h3>
  <p>Se guardan para gestionar citas y pedidos, con el permiso de cada clienta (las alergias son datos de salud y necesitan permiso expreso). Se pueden descargar o borrar para siempre desde su ficha, y se recomienda borrar las fichas de quien no venga en ${INACTIVE_YEARS} años.</p>
  <h3>Cookies</h3><p>No hay cookies de publicidad ni de análisis. <button class="link" onclick="openCookieInfo()">Ver detalle</button></p>
  ${l.email?`<p>Contacto sobre privacidad: <a href="mailto:${esc(l.email)}">${esc(l.email)}</a></p>`:''}
 </div>`);
}
function openCookieInfo(){
 openModal(`<h2 class="modal-title">Cookies y almacenamiento</h2><div class="legal-text">
  <p>Esta aplicación <b>no usa cookies</b> ni herramientas de publicidad o estadísticas. Solo guarda en tu navegador lo imprescindible para funcionar. Es almacenamiento técnico, que la ley permite sin pedir consentimiento (art. 22.2 LSSI):</p>
  <table class="cookie-table"><tr><th>Qué</th><th>Para qué</th><th>Duración</th></tr>
  <tr><td>Sesión (sb-…-auth-token)</td><td>Mantener la sesión iniciada</td><td>Hasta cerrar sesión</td></tr>
  <tr><td>manicure_*</td><td>Tus datos para trabajar sin conexión</td><td>Hasta cerrar sesión</td></tr>
  <tr><td>Preferencias (tema, PIN, aviso visto)</td><td>Recordar tus ajustes</td><td>Hasta borrarlas</td></tr>
  <tr><td>Caché de la app</td><td>Que abra rápido y sin conexión</td><td>Hasta nueva versión</td></tr></table>
  <p>Las tipografías se cargan desde Google Fonts y la librería de conexión desde jsDelivr. Estos servicios reciben tu dirección IP al descargarlas, como cualquier web.</p>
 </div>`);
}
function cookieBanner(){
 if(lsGet('lilium_cookies_seen')===PRIVACY_VERSION||document.getElementById('cookieBar'))return;
 const d=document.createElement('div');d.id='cookieBar';d.className='cookie-bar';d.setAttribute('role','region');d.setAttribute('aria-label','Aviso de cookies');
 d.innerHTML=`<span>${ic('info')}</span><p>Sin cookies de publicidad ni de análisis. Solo guardamos en tu navegador lo imprescindible para que la app funcione.</p><div><button class="link" onclick="openCookieInfo()">Más información</button><button class="btn small" onclick="lsSet('lilium_cookies_seen',PRIVACY_VERSION);document.getElementById('cookieBar').remove()">Entendido</button></div>`;
 document.body.appendChild(d);
}

try{purgeTrash()}catch(e){console.warn(e)}
setTimeout(cookieBanner,800);
