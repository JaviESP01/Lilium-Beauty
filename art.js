/* Lilium · ilustraciones a plumilla (SVG originales) */
(function(){
const R=n=>Math.round(n*10)/10;
function seeded(seed){let s=seed;return()=>{s=(s*9301+49297)%233280;return s/233280}}

/* Pétalo de lirio visto de frente: base en (0,0), punta hacia arriba */
function petal(len,w,curl,rnd){
  const p=`M0,0 C${R(w*.95)},${R(-len*.22)} ${R(w*1.05)},${R(-len*.62)} ${R(w*.18)},${R(-len*.93)} C${R(w*.1)},${R(-len*.99)} ${R(-w*.05)},${R(-len*1.01)} ${R(-w*.14)},${R(-len*.96)} C${R(-w*1.02)},${R(-len*.64)} ${R(-w*.92)},${R(-len*.22)} 0,0Z`;
  const rib=`M0,-3 C${R(w*.12)},${R(-len*.4)} ${R(w*.08)},${R(-len*.7)} ${R(w*.02)},${R(-len*.9)}`;
  const tip=`M${R(-w*.14)},${R(-len*.96)} c${R(curl)},${R(-curl*.9)} ${R(curl*2.2)},${R(-curl*.2)} ${R(curl*1.7)},${R(curl*.9)}`;
  let hatch='';for(let i=0;i<4;i++){const k=.16+i*.09;hatch+=`M${R(w*.1)},${R(-len*k)} q${R(w*.3)},${R(-len*.02)} ${R(w*.58)},${R(-len*.07)} M${R(-w*.06)},${R(-len*(k+.02))} q${R(-w*.3)},${R(-len*.02)} ${R(-w*.58)},${R(-len*.07)} `}
  let spots='';for(let i=0;i<9;i++){const t=.18+rnd()*.45,x=(rnd()-.5)*w*.9;spots+=`<circle cx="${R(x)}" cy="${R(-len*t)}" r="${R(.7+rnd()*1.1)}"/>`}
  return {p,rib,tip,hatch,spots};
}
function lilyHead(size=60,seed=3){
  const rnd=seeded(seed);let back='',front='',stam='';
  for(let i=0;i<6;i++){
    const outer=i%2===0,a=i*60+(outer?0:0)+(rnd()-.5)*8,len=size*(outer?1:.9),w=size*(outer?.3:.25);
    const pt=petal(len,w,size*.05,rnd);
    const g=`<g transform="rotate(${R(a)})"><path class="l-wash" d="${pt.p}"/><path class="l-ink" d="${pt.p}"/><path class="l-fine" d="${pt.rib}"/><path class="l-hatch" d="${pt.hatch}"/><path class="l-ink" d="${pt.tip}"/><g class="l-dots">${pt.spots}</g></g>`;
    if(outer)back+=g;else front+=g;
  }
  for(let i=0;i<6;i++){const a=(i*60+30+(rnd()-.5)*14)*Math.PI/180,l=size*(.5+rnd()*.12),x=Math.sin(a)*l,y=-Math.cos(a)*l;
    stam+=`<path class="l-fine" d="M0,0 Q${R(x*.4+3)},${R(y*.4)} ${R(x)},${R(y)}"/><ellipse class="l-anther" cx="${R(x)}" cy="${R(y)}" rx="${R(size*.035)}" ry="${R(size*.08)}" transform="rotate(${R(a*180/Math.PI+90)} ${R(x)} ${R(y)})"/>`}
  stam+=`<path class="l-fine" d="M0,0 Q4,${R(-size*.3)} 1,${R(-size*.62)}"/><circle class="l-pistil" cx="1" cy="${R(-size*.63)}" r="${R(size*.045)}"/>`;
  return `<g class="lily">${back}${front}<circle class="l-heart" r="${R(size*.1)}"/>${stam}</g>`;
}
function bud(len=46){return `<g class="bud"><path class="l-wash" d="M0,0 C${R(len*.16)},${R(-len*.25)} ${R(len*.17)},${R(-len*.7)} 0,${-len} C${R(-len*.17)},${R(-len*.7)} ${R(-len*.16)},${R(-len*.25)} 0,0Z"/><path class="l-ink" d="M0,0 C${R(len*.16)},${R(-len*.25)} ${R(len*.17)},${R(-len*.7)} 0,${-len} C${R(-len*.17)},${R(-len*.7)} ${R(-len*.16)},${R(-len*.25)} 0,0Z"/><path class="l-fine" d="M0,-2 C${R(len*.06)},${R(-len*.4)} ${R(len*.05)},${R(-len*.75)} 0,${R(-len*.97)}M${R(-len*.08)},${R(-len*.2)} q${R(-len*.04)},${R(-len*.3)} ${R(-len*.03)},${R(-len*.55)}"/></g>`}
function leaf(len=80,bend=10){const w=len*.1;const p=`M0,0 C${R(w)},${R(-len*.2)} ${R(w*1.2+bend*.5)},${R(-len*.6)} ${bend},${-len} C${R(-w*.6+bend*.5)},${R(-len*.6)} ${R(-w)},${R(-len*.2)} 0,0Z`;let v='';for(let i=1;i<6;i++){const t=i/7;v+=`M${R(bend*t*t)},${R(-len*t)} q${R(w*.5)},${R(-len*.04)} ${R(w*.85)},${R(-len*.1)} `}return `<g class="leaf"><path class="s-wash" d="${p}"/><path class="l-ink" d="${p}"/><path class="l-fine" d="M0,-2 Q${R(bend*.3)},${R(-len*.5)} ${bend},${R(-len*.97)}"/><path class="l-hatch" d="${v}"/></g>`}
function blossom(r=6,rot=0){let s='';for(let i=0;i<5;i++){const a=i*72+rot;s+=`<ellipse class="b-wash" cx="0" cy="${R(-r*.62)}" rx="${R(r*.46)}" ry="${R(r*.6)}" transform="rotate(${a})"/><ellipse class="l-ink thin" cx="0" cy="${R(-r*.62)}" rx="${R(r*.46)}" ry="${R(r*.6)}" transform="rotate(${a})"/>`}return `<g class="blossom">${s}<circle class="l-dotc" r="${R(r*.18)}"/></g>`}
function sparkle(r=6){return `<path class="l-ink" d="M0,${-r}Q${R(r*.12)},${R(-r*.12)} ${r},0Q${R(r*.12)},${R(r*.12)} 0,${r}Q${R(-r*.12)},${R(r*.12)} ${-r},0Q${R(-r*.12)},${R(-r*.12)} 0,${-r}Z"/>`}
const T=(x,y,r=0,s=1,inner)=>`<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})">${inner}</g>`;

/* Ramo de lirios para la cabecera */
function lilySpray(){
  let g='';
  g+=`<path class="l-ink stem" d="M150,330 C150,280 140,240 118,198"/><path class="l-ink stem" d="M152,330 C160,270 190,230 222,206"/><path class="l-ink stem" d="M151,330 C150,260 160,170 172,110"/><path class="l-ink stem" d="M150,320 C130,290 96,272 70,262"/><path class="l-ink stem" d="M152,318 C178,300 214,300 252,286"/>`;
  [[149,318,-58,96,-26],[152,316,52,104,28],[146,282,-34,84,-22],[156,270,30,80,20],[140,246,-60,70,-18],[168,236,64,72,20],[162,170,-24,62,-14],[150,326,-8,70,-10],[154,326,10,66,10]].forEach(([x,y,r,l,b])=>g+=T(x,y,r,1,leaf(l,b)));
  g+=T(172,110,10,1,bud(50))+T(252,286,70,.9,bud(44))+T(70,262,-72,.85,bud(40));
  g+=T(118,196,0,1,lilyHead(64,7))+T(224,204,0,1,lilyHead(54,11));
  const bl=[[60,190,6],[44,214,5],[82,150,5.5],[262,150,6],[280,176,5],[246,128,4.5],[100,300,5],[206,306,5.5],[226,330,4.5],[74,330,4.5],[300,240,5]];
  bl.forEach(([x,y,r],i)=>g+=T(x,y,i*17,1,blossom(r,i*9)));
  g+=`<path class="l-fine" d="M60,190 Q70,176 82,150 M44,214 Q52,200 60,190 M262,150 Q256,140 246,128 M280,176 Q272,162 262,150 M100,300 Q120,312 140,318 M206,306 Q220,318 226,330 M300,240 Q280,262 252,286"/>`;
  g+=T(36,120,0,1,sparkle(5))+T(300,96,0,1,sparkle(7))+T(312,300,0,1,sparkle(4));
  return `<svg class="art art-spray" viewBox="0 0 340 340" aria-hidden="true">${g}</svg>`;
}
function moon(){return `<svg class="art art-moon" viewBox="0 0 120 170" aria-hidden="true"><path class="m-wash" d="M70,8 A52,52 0 1,0 70,112 A62,62 0 0,1 70,8Z"/><path class="l-ink" d="M70,8 A52,52 0 1,0 70,112 A62,62 0 0,1 70,8Z"/><path class="l-hatch" d="M30,40 q-6,12 -4,26 M26,58 q0,14 6,24 M38,30 q-8,10 -9,22 M36,90 q8,10 20,14 M24,72 q4,14 14,22"/><path class="l-fine" d="M60,112 v18 M60,138 v12"/>${T(60,134,0,1,blossom(4))}${T(60,156,0,1,sparkle(5))}${T(100,30,0,1,sparkle(5))}${T(108,70,0,1,sparkle(3))}</svg>`}
function swans(){
  const sw=`M30,37 L41,32 C46,23 58,23 60,33 C62,45 51,57 51,72 C51,84 58,90 70,90 C94,88 118,72 150,62 C140,77 160,80 176,72 C170,95 150,110 115,112 C85,114 56,110 48,96 C42,84 40,70 44,58 C48,48 49,44 46,40Z`;
  const feathers=`M78,96 C100,94 124,82 146,68 M86,102 C108,100 130,90 152,78 M96,108 C120,106 144,96 162,84 M150,62 c6,6 14,8 24,8`;
  const wing=`M74,90 C88,62 118,44 152,44 C142,50 146,56 158,54 C148,62 152,68 166,66 C154,76 158,82 170,82 C150,94 110,98 74,90Z`;
  const wf=`M84,86 C100,70 122,58 146,52 M92,90 C110,78 132,68 156,62 M102,93 C120,86 140,78 162,74`;
  const one=`<path class="sw-wash" d="${sw}"/><path class="l-ink" d="${sw}"/><path class="l-fine" d="${feathers}"/><path class="sw-wash" d="${wing}"/><path class="l-ink" d="${wing}"/><path class="l-fine" d="${wf}"/><path class="l-ink" d="M30,37 l6,4 l6,-6"/><circle class="l-dotc" cx="48" cy="33" r="1.4"/>`;
  return `<svg class="art art-swans" viewBox="0 0 400 140" aria-hidden="true">${T(182,10,0,1,one)}<g transform="translate(218 10) scale(-1 1)">${one}</g><path class="l-fine" d="M20,128 q40,-6 80,0 t80,0 t80,0 t80,0 t80,0 M50,136 q30,-4 60,0 t60,0 M250,136 q30,-4 60,0 t60,0"/></svg>`;
}
function flourish(){return `<svg class="art art-flourish" viewBox="0 0 320 30" style="overflow:visible" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><path class="l-ink" d="M160,15 C150,4 136,4 128,12 C122,18 128,26 135,22 C140,19 137,12 131,14 M160,15 C170,4 184,4 192,12 C198,18 192,26 185,22 C180,19 183,12 189,14 M128,12 C110,24 80,16 40,15 C30,15 20,16 6,15 M192,12 C210,24 240,16 280,15 C290,15 300,16 314,15"/><path class="l-fine" d="M100,17 q8,-8 16,-4 M220,17 q-8,-8 -16,-4 M64,16 q6,-5 12,-2 M256,16 q-6,-5 -12,-2"/>${T(160,15,45,1,'<rect class="b-wash" x="-3.5" y="-3.5" width="7" height="7"/><rect class="l-ink" x="-3.5" y="-3.5" width="7" height="7"/>')}</svg>`}
function corner(){return `<svg class="art art-corner" viewBox="0 0 90 90" aria-hidden="true"><path class="l-ink" d="M4,86 V22 C4,10 10,4 22,4 H86 M10,86 V26 C10,16 16,10 26,10 H86"/><path class="l-fine" d="M10,40 C22,40 30,32 30,20 C30,14 24,12 21,16 C18,20 22,25 26,22 M40,10 C40,22 32,30 20,30"/>${T(30,30,0,1,blossom(5,10))}${T(50,18,20,1,blossom(3.5))}${T(18,50,40,1,blossom(3.5))}</svg>`}
function bow(){return `<svg class="art art-bow" viewBox="0 0 100 80" aria-hidden="true"><path class="b-wash" d="M50,30 C40,10 14,6 12,22 C10,36 36,38 50,30Z M50,30 C60,10 86,6 88,22 C90,36 64,38 50,30Z"/><path class="l-ink" d="M50,30 C40,10 14,6 12,22 C10,36 36,38 50,30Z M50,30 C60,10 86,6 88,22 C90,36 64,38 50,30Z M50,30 C46,46 36,58 26,74 M50,30 C54,46 64,58 76,72"/><ellipse class="l-ink" cx="50" cy="30" rx="5" ry="6"/><path class="l-fine" d="M22,20 q8,-4 18,4 M78,20 q-8,-4 -18,4"/></svg>`}
function chain(h=420){let g=`<path class="l-fine" d="M10,0 V${h}"/>`;const marks=[60,150,230,330];marks.forEach((y,i)=>{g+=`<g transform="translate(10 ${y})">${i%2?sparkle(7):'<path class="l-ink thin" d="M0,-9 L4,0 L0,9 L-4,0Z"/><circle class="l-dotc" r="1.3" cy="-13"/><circle class="l-dotc" r="1.3" cy="13"/>'}</g>`});return `<svg class="art art-chain" viewBox="0 0 20 ${h}" preserveAspectRatio="xMidYMin meet" aria-hidden="true">${g}</svg>`}
function sprig(){return `<svg class="art art-sprig" viewBox="0 0 120 120" aria-hidden="true">${T(70,112,-20,1,leaf(70,-12))}${T(72,112,18,.8,leaf(60,10))}${T(66,40,-30,.55,lilyHead(40,5))}${T(100,30,0,1,sparkle(5))}${T(30,60,0,1,sparkle(3.5))}</svg>`}
function lilyMark(){return `<svg class="art art-mark" viewBox="-70 -72 140 140" aria-hidden="true">${lilyHead(58,7)}</svg>`}

/* Iconos de línea */
const I={
 home:'<path d="M12 21v-6"/><path d="M12 15C8 15 5 12.5 5 9.5c3 0 5.5 1.6 7 4"/><path d="M12 15c4 0 7-2.5 7-5.5-3 0-5.5 1.6-7 4"/><path d="M12 13c-2-2.4-2.3-5.6-.8-8.5 1.6 1.4 2.3 3.6 1.9 6"/><path d="M12 13c2-2.4 2.3-5.6.8-8.5"/>',
 clients:'<ellipse cx="12" cy="12" rx="7.5" ry="9.2"/><circle cx="12" cy="10" r="2.6"/><path d="M7.6 17.4c1-2.2 2.6-3.2 4.4-3.2s3.4 1 4.4 3.2"/>',
 agenda:'<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/><path d="M14.6 12.4a2.6 2.6 0 1 0 0 5 3 3 0 0 1 0-5z"/>',
 services:'<path d="M9.5 3.5h5v4h-5z"/><path d="M8 7.5h8l1 3.5v8a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-8z"/><path d="M9.5 14c1.5-1 3.5-1 5 0"/>',
 settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/>',
 search:'<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>',
 star:'<path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7z"/>',
 user:'<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c1.2-3.6 3.8-5.4 7-5.4s5.8 1.8 7 5.4"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 whatsapp:'<path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"/><path d="M9 9.2c0 3 2.6 5.6 5.6 5.6l1-1.4-1.8-1-.9.8c-1-.4-1.9-1.3-2.3-2.3l.8-.9-1-1.8z"/>',
 trash:'<path d="M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13"/>',
 edit:'<path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z"/><path d="M14.5 6.5l3 3"/>',
 cloud:'<path d="M7 18.5h10a4 4 0 0 0 .6-8 5.5 5.5 0 0 0-10.6 1.4A3.3 3.3 0 0 0 7 18.5z"/>',
 lock:'<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
 logout:'<path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/><path d="M10 8l-4 4 4 4M6 12h10"/>',
 close:'<path d="M6 6l12 12M18 6L6 18"/>',
 left:'<path d="M15 5l-7 7 7 7"/>', right:'<path d="M9 5l7 7-7 7"/>',
 check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
 coin:'<circle cx="12" cy="12" r="8"/><path d="M15 9.2a3.4 3.4 0 1 0 0 5.6M8 11h5M8 13h5"/>',
 clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
 camera:'<path d="M4 8h3l1.5-2.5h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
 gift:'<rect x="4" y="9" width="16" height="11" rx="1"/><path d="M12 9v11M4 13h16M12 9C10 5 6.5 5.5 7.5 8 8.2 9.3 12 9 12 9zM12 9c2-4 5.5-3.5 4.5-1-.7 1.3-4.5 1-4.5 1z"/>',
 download:'<path d="M12 4v11M7.5 10.5L12 15l4.5-4.5M5 19.5h14"/>',
 upload:'<path d="M12 15V4M7.5 8.5L12 4l4.5 4.5M5 19.5h14"/>',
 sync:'<path d="M19 8a7.5 7.5 0 0 0-13.5 1M5 16a7.5 7.5 0 0 0 13.5-1"/><path d="M19 3.5V8h-4.5M5 20.5V16h4.5"/>',
 moon:'<path d="M15 4a8.5 8.5 0 1 0 5 13.5A7 7 0 0 1 15 4z"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
 message:'<path d="M4 5h16v11H9l-5 4z"/>',
 recycle:'<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 12.5h9l1-12.5"/><path d="M10 11v5M14 11v5"/>',
 photo:'<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M20.5 16l-5-5-8 8"/>',
 bell:'<path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7z"/><path d="M19 17.5l.7 2M5 17.5l-.7 2"/>',
 house:'<path d="M3.5 11L12 4l8.5 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5.5h4V20"/>',
 calendar:'<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
 person:'<circle cx="12" cy="8" r="3.8"/><path d="M4.5 20.5c1.3-4 4.2-6 7.5-6s6.2 2 7.5 6"/>',
 users:'<circle cx="9" cy="8.5" r="3.3"/><path d="M2.8 19.5c.9-3.4 3.2-5.2 6.2-5.2s5.3 1.8 6.2 5.2"/><path d="M15.5 5.3a3.2 3.2 0 0 1 0 6.3M17.5 14.6c1.8.6 3.1 2.2 3.7 4.9"/>',
 userplus:'<circle cx="10" cy="8" r="3.6"/><path d="M3 20c1.2-3.7 3.9-5.6 7-5.6 1.6 0 3 .5 4.2 1.4"/><path d="M18 14v6M15 17h6"/>',
 wrench:'<path d="M14.7 6.3a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3l7.7-7.7z" transform="translate(-1.5 0)"/><path d="M15.5 4.2a4.2 4.2 0 0 1 4.3 4.3l-2.6-.4-1.3-1.3z"/>',
 chartline:'<path d="M3.5 20.5h17"/><path d="M5 20.5V4"/><path d="M8.5 17v-4M12 17V9M15.5 17v-6M19 17V7"/>',
 cog:'<circle cx="12" cy="12" r="3.2"/><path d="M19.4 13.5l1.6 1.2-1.8 3.1-1.9-.7a7.6 7.6 0 0 1-2.2 1.3l-.3 2h-3.6l-.3-2a7.6 7.6 0 0 1-2.2-1.3l-1.9.7L3 14.7l1.6-1.2a7.8 7.8 0 0 1 0-2.9L3 9.3l1.8-3.1 1.9.7a7.6 7.6 0 0 1 2.2-1.3l.3-2h3.6l.3 2a7.6 7.6 0 0 1 2.2 1.3l1.9-.7L21 9.3l-1.6 1.2a7.8 7.8 0 0 1 0 3z"/>',
 bellr:'<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
 coins:'<ellipse cx="12" cy="6" rx="6.5" ry="2.5"/><path d="M5.5 6v4c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5V6"/><path d="M5.5 10v4c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5v-4"/><path d="M5.5 14v4c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5v-4"/>',
 wallet:'<path d="M4 7.5h14.5a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2h-13A1.5 1.5 0 0 1 4 18.5z"/><path d="M4 7.5 15.5 4v3.5"/><path d="M16 13.5h4.5"/><circle cx="16.5" cy="13.7" r=".6"/>',
 heart:'<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20z"/>',
 heartfill:'<path fill="currentColor" stroke="none" d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20z"/>',
 crown:'<path d="M4 18h16M4.5 15.5 3.5 7l5 4 3.5-6 3.5 6 5-4-1 8.5z"/>',
 phone:'<path d="M5 4h3.5l1.5 4-2 1.3a10 10 0 0 0 6.7 6.7L16 14l4 1.5V19a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4z"/>',
 mail:'<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="M4 7l8 6 8-6"/>',
 pin:'<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
 hand:'<path d="M8 13V5.8a1.4 1.4 0 0 1 2.8 0V12"/><path d="M10.8 11V4.4a1.4 1.4 0 0 1 2.8 0V11"/><path d="M13.6 11V5.4a1.4 1.4 0 0 1 2.8 0V12"/><path d="M16.4 12V8a1.4 1.4 0 0 1 2.8 0v6.2c0 4-2.8 6.8-6.6 6.8-2.7 0-4.4-1.2-5.8-3.4L4.4 13.5a1.4 1.4 0 0 1 2.3-1.6L8 13.6"/>',
 note:'<rect x="5" y="3.5" width="14" height="17" rx="2"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4"/>',
 image:'<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="9.5" r="1.8"/><path d="M20.5 15.5 15 10l-8.5 9.5"/>',
 bars:'<path d="M6 20v-6M10 20V9M14 20v-8M18 20V5"/>',
 more:'<circle cx="5.5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="18.5" cy="12" r="1" fill="currentColor"/>',
 morev:'<circle cx="12" cy="5.5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="18.5" r="1" fill="currentColor"/>',
 arrow:'<path d="M5 12h14M13.5 6.5 19 12l-5.5 5.5"/>',
 arrowleft:'<path d="M19 12H5M10.5 6.5 5 12l5.5 5.5"/>',
 arrowup:'<path d="M7 17 17 7M9 7h8v8"/>',
 arrowdown:'<path d="M7 7l10 10M17 9v8H9"/>',
 down:'<path d="M6 9.5l6 6 6-6"/>',
 pluscircle:'<circle cx="12" cy="12" r="8.5"/><path d="M12 8v8M8 12h8"/>',
 box:'<path d="M12 3.5 20 8v8l-8 4.5L4 16V8z"/><path d="M4 8l8 4.5L20 8M12 12.5v8"/>',
 card:'<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>',
 palette:'<path d="M12 3.5a8.5 8.5 0 0 0 0 17c1.3 0 1.8-.9 1.4-1.9-.5-1.2.3-2.3 1.6-2.3h2a3.5 3.5 0 0 0 3.5-3.5c0-5.1-3.8-9.3-8.5-9.3z"/><circle cx="7.8" cy="11" r="1"/><circle cx="10" cy="7.5" r="1"/><circle cx="14.5" cy="7.5" r="1"/>',
 store:'<path d="M4 9.5 5.5 4h13L20 9.5"/><path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0"/><path d="M5.5 11.5V20h13v-8.5M10 20v-4.5h4V20"/>',
 globe:'<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.3 2.4 3.5 5.2 3.5 8.5s-1.2 6.1-3.5 8.5c-2.3-2.4-3.5-5.2-3.5-8.5s1.2-6.1 3.5-8.5z"/>',
 insta:'<rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.6"/><circle cx="16.8" cy="7.2" r=".8" fill="currentColor"/>',
 tiktok:'<path d="M13.5 4v10.5a3.5 3.5 0 1 1-3-3.5"/><path d="M13.5 4c.4 2.6 2.2 4.3 5 4.5"/>',
 info:'<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.4"/>',
 folder:'<path d="M3.5 7a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>',
 database:'<ellipse cx="12" cy="6" rx="7" ry="2.7"/><path d="M5 6v12c0 1.5 3.1 2.7 7 2.7s7-1.2 7-2.7V6M5 12c0 1.5 3.1 2.7 7 2.7s7-1.2 7-2.7"/>',
 cloudup:'<path d="M7 18.5h10a4 4 0 0 0 .6-8 5.5 5.5 0 0 0-10.6 1.4A3.3 3.3 0 0 0 7 18.5z"/><path d="M12 16v-5M9.8 13 12 10.8 14.2 13"/>',
 shield:'<path d="M12 3.5 19 6v6c0 4.3-3 7.4-7 8.5-4-1.1-7-4.2-7-8.5V6z"/><path d="M9 12l2 2 4-4"/>',
 monitor:'<rect x="3.5" y="4.5" width="17" height="11.5" rx="1.5"/><path d="M9 20h6M12 16v4"/>',
 eye:'<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
 eyeoff:'<path d="M3 3l18 18M10.6 6a9.6 9.6 0 0 1 1.4-.1c6 0 9.5 6.1 9.5 6.1a17 17 0 0 1-2.6 3.3M6.6 6.7A16.5 16.5 0 0 0 2.5 12s3.5 6.5 9.5 6.5a9 9 0 0 0 4.5-1.2"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
 receipt:'<path d="M6 3.5h12v17l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3z"/><path d="M9 8h6M9 11.5h6M9 15h4"/>',
 pie:'<path d="M12 3.5v8.5h8.5A8.5 8.5 0 1 1 12 3.5z"/><path d="M15 3.8A8.5 8.5 0 0 1 20.2 9H15z"/>',
 sparkles:'<path d="M10 4c.5 3.6 1.9 5 5.5 5.5-3.6.5-5 1.9-5.5 5.5-.5-3.6-1.9-5-5.5-5.5C8.1 9 9.5 7.6 10 4z"/><path d="M17.5 14c.3 1.8 1 2.5 2.8 2.8-1.8.3-2.5 1-2.8 2.8-.3-1.8-1-2.5-2.8-2.8 1.8-.3 2.5-1 2.8-2.8z"/>',
 bottle:'<path d="M10 3.5h4v4h-4z"/><path d="M8.5 7.5h7l1 3.5v8.5a1.5 1.5 0 0 1-1.5 1.5H9a1.5 1.5 0 0 1-1.5-1.5V11z"/>',
 star5:'<path d="M12 4l2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z"/>',
 save:'<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>',
 history:'<path d="M3.5 12a8.5 8.5 0 1 0 2.5-6"/><path d="M3.5 4v4.5H8M12 8v4.5l3 1.8"/>',
 refresh:'<path d="M19 8a7.5 7.5 0 0 0-13.5 1M5 16a7.5 7.5 0 0 0 13.5-1"/><path d="M19 3.5V8h-4.5M5 20.5V16h4.5"/>',
 trash2:'<path d="M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13M10 11v5M14 11v5"/>',
 checkbox:'<rect x="4" y="4" width="16" height="16" rx="3"/>',
 checked:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 12.5l3 3 5-6"/>',
 medical:'<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/>',
 clipboard:'<rect x="5" y="4.5" width="14" height="16" rx="2"/><path d="M9 4.5V3h6v1.5M8.5 12l2 2 4-4"/>',
 send:'<path d="M20.5 3.5 10 14M20.5 3.5 14 20.5l-4-6.5-6.5-4z"/>'
};
function icon(n,cls=''){return `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${I[n]||''}</svg>`}

window.ART={chain,sprig,lilySpray,moon,swans,flourish,corner,bow,lilyMark,lilyHead,blossom,sparkle,icon};
})();
