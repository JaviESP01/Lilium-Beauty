/* Lilium · finanzas: ingresos, gastos y beneficio */
const DONUT_COLORS=['var(--c1)','var(--c2)','var(--c3)','var(--c4)','var(--c5)','var(--c6)'];
function donut(map,centerLabel,centerSub='Total'){
 const entries=Object.entries(map).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]);
 const total=entries.reduce((n,[,v])=>n+v,0);
 if(!total)return '<p class="muted">Sin datos todavía.</p>';
 const top=entries.slice(0,5);if(entries.length>5)top.push(['Otros',entries.slice(5).reduce((n,[,v])=>n+v,0)]);
 let acc=0;const R=52,C=2*Math.PI*R;
 const arcs=top.map(([k,v],i)=>{const len=v/total*C;const el=`<circle r="${R}" cx="70" cy="70" fill="none" stroke="${DONUT_COLORS[i]}" stroke-width="24" stroke-dasharray="${len} ${C-len}" stroke-dashoffset="${-acc}" transform="rotate(-90 70 70)"><title>${esc(k)}: ${money(v)}</title></circle>`;acc+=len;return el}).join('');
 return `<div class="donut-wrap"><div class="donut"><svg viewBox="0 0 140 140" role="img" aria-label="Reparto">${arcs}</svg><div class="donut-c"><b class="num">${centerLabel}</b><small>${centerSub}</small></div></div><ul class="legend">${top.map(([k,v],i)=>`<li><i style="background:${DONUT_COLORS[i]}"></i><span>${esc(k)}</span><em class="num">${Math.round(v/total*100)}%</em><b class="num">${money(v)}</b></li>`).join('')}</ul></div>`;
}
function monthKey(d){return `${d.getFullYear()}-${pad(d.getMonth()+1)}`}
function shiftMonth(key,n){const [y,m]=key.split('-').map(Number);return monthKey(new Date(y,m-1+n,1))}
function monthName(key,opts={month:'long',year:'numeric'}){const [y,m]=key.split('-').map(Number);return cap(new Date(y,m-1,1).toLocaleDateString('es-ES',opts))}
function monthIncome(key){return A.appointments.filter(a=>a.date.startsWith(key)&&(a.status==='completed'||isPaid(a))).reduce((n,a)=>n+apptAmount(a),0)}
function monthExpenses(key){return A.expenses.filter(e=>e.date.startsWith(key)).reduce((n,e)=>n+Number(e.amount||0),0)}
function monthDone(key){return A.appointments.filter(a=>a.date.startsWith(key)&&a.status==='completed').length}
function financePage(){
 const mk=view.financeMonth||monthKey(new Date()),pk=shiftMonth(mk,-1);
 const inc=monthIncome(mk),exp=monthExpenses(mk),net=inc-exp,done=monthDone(mk);
 const pInc=monthIncome(pk),pExp=monthExpenses(pk),pNet=pInc-pExp,pDone=monthDone(pk);
 const months=[];for(let i=6;i>=0;i--){const k=shiftMonth(mk,-i);months.push({k,l:monthName(k,{month:'short'}).replace('.',''),i:monthIncome(k),e:monthExpenses(k)})}
 const max=Math.max(1,...months.flatMap(m=>[m.i,m.e]));
 const steps=4,top=Math.ceil(max/steps/50)*50*steps||200;
 const appts=A.appointments.filter(a=>a.date.startsWith(mk)&&(a.status==='completed'||isPaid(a)));
 const byCat={};appts.forEach(a=>{const c=serviceOf(a)?.cat||'Otros';byCat[c]=(byCat[c]||0)+apptAmount(a)});
 const bySvc={};appts.forEach(a=>{const k=a.serviceId||a.service;bySvc[k]=bySvc[k]||{name:a.service,n:0,v:0};bySvc[k].n++;bySvc[k].v+=apptAmount(a)});
 const svcTop=Object.values(bySvc).sort((a,b)=>b.v-a.v).slice(0,5),svcMax=Math.max(1,...svcTop.map(x=>x.v));
 const exps=A.expenses.filter(e=>e.date.startsWith(mk)).sort((a,b)=>b.date.localeCompare(a.date));
 const moves=[...appts.map(a=>({date:a.date,type:'in',desc:`Cita · ${a.service} (${a.client.split(' ')[0]})`,cat:serviceOf(a)?.cat||'Servicios',v:apptAmount(a),id:a.id})),...exps.map(e=>({date:e.date,type:'out',desc:e.concept,cat:e.cat,v:Number(e.amount),id:e.id}))].sort((a,b)=>b.date.localeCompare(a.date));
 const monthOpts=[];for(let i=0;i<18;i++){const k=shiftMonth(monthKey(new Date()),-i);monthOpts.push(k)}
 const sel=`<label class="mini-select">${ic('calendar')}<select onchange="view.financeMonth=this.value;render()" aria-label="Mes">${monthOpts.map(k=>`<option value="${k}" ${k===mk?'selected':''}>${monthName(k)}</option>`).join('')}</select></label>`;
 const body=`<div class="fin-top">${sel}</div>
 <div class="stats">
  ${finStat('wallet',money(inc),'Ingresos totales',pctChange(inc,pInc))}
  ${finStat('coins',money(exp),'Gastos totales',pctChange(exp,pExp),true)}
  ${finStat('bars',money(net),'Beneficio neto',pNet>0?pctChange(net,pNet):null)}
  ${finStat('calendar',done,'Citas realizadas',pctChange(done,pDone))}
 </div>
 <div class="fin-grid">
  ${card('Ingresos y gastos','bars',`<div class="legend-inline"><span><i class="lg-in"></i>Ingresos</span><span><i class="lg-out"></i>Gastos</span></div><div class="gchart"><div class="g-axis">${Array.from({length:steps+1},(_,i)=>`<span>${money0(top-top/steps*i)}</span>`).join('')}</div><div class="g-bars">${months.map(m=>`<div class="g-col ${m.k===mk?'cur':''}" onclick="view.financeMonth='${m.k}';render()" title="${m.l}: ingresos ${money(m.i)}, gastos ${money(m.e)}"><div class="g-pair"><i class="in" style="height:${m.i/top*100}%"></i><i class="out" style="height:${m.e/top*100}%"></i></div><span>${cap(m.l)}</span></div>`).join('')}</div></div>`,{cls:'fin-chart',sub:'Últimos 7 meses · toca un mes para verlo'})}
  ${card('Balance del mes','pie',donut(byCat,money0(inc),'Ingresos'),{stamp:'rosa'})}
  ${card('Servicios más rentables','star5',svcTop.length?svcTop.map(x=>`<div class="hbar rich"><span>${esc(x.name)}</span><small>${plural(x.n,'cita','citas')}</small><i><em style="width:${x.v/svcMax*100}%"></em></i><b class="num">${money(x.v)}</b></div>`).join(''):'<p class="muted">Aún no hay citas cobradas este mes.</p>',{stamp:'flores'})}
  ${card('Gastos del mes','wallet',exps.length?`<div class="table-scroll"><table class="tbl"><thead><tr><th>Fecha</th><th>Concepto</th><th>Categoría</th><th class="r">Importe</th><th></th></tr></thead><tbody>${exps.map(e=>`<tr><td class="num">${fmtDate(parseDate(e.date))}</td><td>${esc(e.concept)}</td><td>${esc(e.cat)}</td><td class="r num">${money(e.amount)}</td><td><button class="icon-btn tiny" aria-label="Opciones" onclick="openMenu(event,[{label:'Editar',icon:'edit',action:()=>openExpense('${e.id}')},{label:'Eliminar',icon:'trash2',danger:true,action:()=>deleteExpense('${e.id}')}])">${ic('morev')}</button></td></tr>`).join('')}</tbody></table></div>`:'<p class="muted">No has apuntado gastos este mes. Apunta materiales, tips o el local para ver tu beneficio real.</p>',{action:`<button class="btn soft small" onclick="openExpense()">${ic('plus')}Añadir gasto</button>`})}
  ${card('Historial de movimientos','note',moves.length?`<div class="table-scroll"><table class="tbl moves"><thead><tr><th>Fecha</th><th>Tipo</th><th>Descripción</th><th>Categoría</th><th class="r">Importe</th></tr></thead><tbody>${moves.slice(0,40).map(m=>`<tr onclick="${m.type==='in'?`openAppt('${m.id}')`:`openExpense('${m.id}')`}"><td class="num">${fmtDate(parseDate(m.date))}</td><td><span class="tag ${m.type}">${m.type==='in'?'Ingreso':'Gasto'}</span></td><td>${esc(m.desc)}</td><td>${esc(m.cat)}</td><td class="r num ${m.type}">${m.type==='in'?'+':'−'}${money(m.v)}</td></tr>`).join('')}</tbody></table></div>`:'<p class="muted">Sin movimientos este mes.</p>',{cls:'span-all',action:`<button class="btn soft small" onclick="exportFinanceCsv('${mk}')">${ic('download')}Descargar</button>`})}
 </div>`;
 return {head:pageHead('Finanzas','Controla tus ingresos, gastos y beneficios',['shillings','fresas']),body,searchPh:'Buscar por fecha, servicio o nota…'};
}
function finStat(icon,value,label,p,inverse=false){const t=p===null||!isFinite(p)?'<em>Sin datos del mes anterior</em>':`<em class="trend ${(p>=0)!==inverse?'up':'down'}">${ic(p>=0?'arrowup':'arrowdown')}${p>=0?'+':''}${p}% respecto al mes anterior</em>`;return `<div class="stat fin"><span class="stat-ic round">${ic(icon)}</span><span class="stat-txt"><b>${value}</b><small>${label}</small>${t}</span></div>`}
function openExpense(id=null){
 const e=id?A.expenses.find(x=>x.id===id):null;
 openModal(`<h2 class="modal-title">${e?'Editar gasto':'Añadir gasto'}</h2><form onsubmit="event.preventDefault();saveExpense('${id||''}')"><div class="field"><label for="g_concept">Concepto</label><input id="g_concept" value="${esc(e?.concept||'')}" placeholder="Esmaltes, tips, lámpara…" required></div>
 <div class="grid-3"><div class="field"><label for="g_amount">Importe (€)</label><input id="g_amount" type="number" min="0" step="0.01" value="${e?.amount??''}" required></div><div class="field"><label for="g_date">Fecha</label><input id="g_date" type="date" value="${e?.date||todayKey()}" required></div><div class="field"><label for="g_cat">Categoría</label><select id="g_cat">${EXPENSE_CATS.map(c=>`<option ${e?.cat===c?'selected':''}>${c}</option>`).join('')}</select></div></div>
 <div class="field"><label for="g_note">Nota (opcional)</label><input id="g_note" value="${esc(e?.note||'')}"></div>
 <div class="modal-actions split"><div>${e?`<button type="button" class="icon-btn danger" aria-label="Eliminar gasto" onclick="deleteExpense('${e.id}')">${ic('trash2')}</button>`:''}</div><div><button type="button" class="btn ghost" onclick="closeModal()">Cancelar</button><button class="btn">${e?'Guardar':'Añadir gasto'}</button></div></div></form>`,{cls:'small'});
}
function saveExpense(id){const g=x=>document.getElementById(x).value;const data={concept:g('g_concept').trim(),amount:Math.max(0,Number(g('g_amount'))||0),date:g('g_date'),cat:g('g_cat'),note:g('g_note').trim()};if(!data.concept||!validDateKey(data.date))return toast('Completa concepto, importe y fecha');if(id)Object.assign(A.expenses.find(x=>x.id===id),data);else A.expenses.push({id:uid('g'),...data});save();closeModal();render();toast(id?'Gasto guardado':'Gasto añadido')}
async function deleteExpense(id){const e=A.expenses.find(x=>x.id===id);if(!e)return;if(!await confirmDelete(`¿Eliminar «${e.concept}»?`,money(e.amount)))return;A.expenses=A.expenses.filter(x=>x.id!==id);markRemoved(id);save();closeModal();render();toast('Gasto eliminado')}
function exportFinanceCsv(mk){
 const rows=[['Fecha','Tipo','Descripción','Categoría','Importe']];
 A.appointments.filter(a=>a.date.startsWith(mk)&&(a.status==='completed'||isPaid(a))).forEach(a=>rows.push([a.date,'Ingreso',`${a.service} (${a.client})`,serviceOf(a)?.cat||'',apptAmount(a).toFixed(2).replace('.',',')]));
 A.expenses.filter(e=>e.date.startsWith(mk)).forEach(e=>rows.push([e.date,'Gasto',e.concept,e.cat,(-e.amount).toFixed(2).replace('.',',')]));
 const csv='﻿'+rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(';')).join('\n');
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download=`finanzas-${mk}.csv`;document.body.appendChild(a);a.click();a.remove();toast('Descargado');
}
