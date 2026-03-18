/* ════════════════════════════════════════════
   SHARED PALETTE STATE — the bridge
════════════════════════════════════════════ */
const PALETTE = {
  magenta: '#e5007d',
  primary: '#002fa7',
  deep:    '#080f20',
  dark:    '#0d1a35',
  surface: '#e8f0fe',
  muted:   '#6b8ecf',
  h1:      '#a86fa7',
  h2:      '#7fb3e8',
};

function firePaletteChange() {
  window.dispatchEvent(new CustomEvent('paletteChange', {detail: {...PALETTE}}));
}

/* ════════════════════════════════════════════
   COLOR UTILS
════════════════════════════════════════════ */
function hexToRgb(hex){
  hex=hex.replace('#','');
  if(hex.length===3)hex=hex.split('').map(c=>c+c).join('');
  const n=parseInt(hex,16);
  return{r:(n>>16)&255,g:(n>>8)&255,b:n&255};
}
function rgbToHsl(r,g,b){
  r/=255;g/=255;b/=255;
  const mx=Math.max(r,g,b),mn=Math.min(r,g,b);
  let h,s,l=(mx+mn)/2;
  if(mx===mn){h=s=0;}else{
    const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);
    switch(mx){case r:h=((g-b)/d+(g<b?6:0))/6;break;case g:h=((b-r)/d+2)/6;break;case b:h=((r-g)/d+4)/6;break;}
  }
  return[Math.round(h*360),Math.round(s*100),Math.round(l*100)];
}
function hslToHex(h,s,l){
  h=((h%360)+360)%360;s/=100;l/=100;
  const a=s*Math.min(l,1-l);
  const f=n=>{const k=(n+h/30)%12;const c=l-a*Math.max(-1,Math.min(k-3,9-k,1));return Math.round(255*c).toString(16).padStart(2,'0');};
  return'#'+f(0)+f(8)+f(4);
}
function hexToHsl(hex){const{r,g,b}=hexToRgb(hex);return rgbToHsl(r,g,b);}
function luminance(hex){const{r,g,b}=hexToRgb(hex);const t=c=>{c/=255;return c<=.03928?c/12.92:Math.pow((c+.055)/1.055,2.4);};return .2126*t(r)+.7152*t(g)+.0722*t(b);}
function contrastRatio(a,b){const la=luminance(a),lb=luminance(b);return(Math.max(la,lb)+.05)/(Math.min(la,lb)+.05);}
function lightness(hex){return hexToHsl(hex)[2];}
function textOn(bg){return lightness(bg)>50?'#080808':'#ffffff';}
function clamp(v,a,b){return Math.min(b,Math.max(a,v));}

/* ════════════════════════════════════════════
   COLOR GENERATOR
════════════════════════════════════════════ */
let harmonyMode = 'split';
function syncHex(v){document.getElementById('colorHex').value=v.toUpperCase();}
function syncPicker(v){if(/^#[0-9A-Fa-f]{6}$/.test(v))document.getElementById('colorPicker').value=v;}
function setHarmony(btn,v){
  document.querySelectorAll('.harm-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');harmonyMode=v;generatePalette();
}
function randomSeed(){
  const hex=hslToHex(Math.floor(Math.random()*360),60+Math.floor(Math.random()*40),35+Math.floor(Math.random()*25));
  document.getElementById('colorPicker').value=hex;
  document.getElementById('colorHex').value=hex.toUpperCase();
  generatePalette();
}
function generatePalette(){
  let hex=document.getElementById('colorHex').value.trim();
  if(!/^#[0-9A-Fa-f]{6}$/.test(hex))hex=document.getElementById('colorPicker').value;
  const[h,s,l]=hexToHsl(hex);
  let ah=h;if(Math.abs(h-330)<25||Math.abs(h-330+360)<25)ah=(h+35)%360;
  const primary=hslToHex(ah,clamp(s,50,100),clamp(l,35,65));
  const deep=hslToHex(ah,clamp(s*.7,20,70),clamp(l*.15,5,18));
  const dark=hslToHex(ah,clamp(s*.6,15,60),clamp(l*.22,10,25));
  const surface=hslToHex(ah,clamp(s*.08,3,15),clamp(100-l*.05,92,97));
  const muted=hslToHex(ah,clamp(s*.45,20,70),clamp(l+20,50,80));
  let h1,h2;
  if(harmonyMode==='analogous'){h1=hslToHex((ah+28)%360,s,l);h2=hslToHex((ah-28+360)%360,s,l);}
  else if(harmonyMode==='split'){h1=hslToHex((ah+150)%360,s,l);h2=hslToHex((ah+210)%360,s,l);}
  else{h1=hslToHex((ah+120)%360,s,l);h2=hslToHex((ah+240)%360,s,l);}

  Object.assign(PALETTE,{magenta:'#e5007d',primary,deep,dark,surface,muted,h1,h2});

  const cr=contrastRatio(primary,'#e5007d');
  const score=Math.min(100,Math.round((cr/5)*100));
  document.getElementById('compatBar').style.width=score+'%';
  document.getElementById('compatBar').style.background=score>60?'#00a878':score>35?'#d4af37':'#e5007d';
  document.getElementById('compatScore').textContent=`${score}% — ${score>60?'Excellent':score>35?'Good — test in context':'Close to Magenta — test carefully'}`;

  renderSwatches();
  renderPreviewCard();
  renderCssExport();
  firePaletteChange();
  autosave();
  toast('Palette generated — use ⬆ Push to sync to Typography');
}

function renderSwatches(){
  const sw=[
    {c:PALETTE.magenta,n:'Magenta'},{c:PALETTE.primary,n:'Primary'},
    {c:PALETTE.deep,n:'Deep'},{c:PALETTE.surface,n:'Surface'},
    {c:PALETTE.h1,n:'Harmony 1'},{c:PALETTE.h2,n:'Harmony 2'},
  ];
  document.getElementById('paletteSwatches').innerHTML=sw.map(s=>`
    <div class="p-swatch" style="background:${s.c};" onclick="openOklchPanel('${s.c}','${s.n}',this)" title="Click to view OKLCH shades">
      <div class="p-swatch-inner" style="color:${textOn(s.c)};">
        <span class="p-swatch-hex">${s.c.toUpperCase()}</span>
        <span class="p-swatch-name">${s.n}</span>
      </div>
    </div>`).join('');
  // Close panel when palette regenerates with a new seed
  if(_currentOklchHex) closeOklchPanel();
}
function renderPreviewCard(){
  const p=PALETTE;const tc=textOn(p.deep);
  document.getElementById('previewCard').style.background=p.deep;
  document.getElementById('pcBar').style.background=p.magenta;
  document.getElementById('pcTag').style.color=p.magenta;
  document.getElementById('pcHead').style.color=tc==='#ffffff'?p.surface:p.primary;
  document.getElementById('pcSub').style.color=tc==='#ffffff'?'rgba(255,255,255,.4)':'rgba(0,0,0,.4)';
  const tex=document.getElementById('pcTex');
  tex.innerHTML=`<defs><pattern id="pp" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><line x1="0" y1="20" x2="20" y2="0" stroke="${p.magenta}" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#pp)"/>`;
}
function renderCssExport(){
  const p=PALETTE;
  document.getElementById('cssVars').innerHTML=[
    `--color-magenta: ${p.magenta};`,`--color-primary: ${p.primary};`,
    `--color-deep:    ${p.deep};`,`--color-dark:    ${p.dark};`,
    `--color-surface: ${p.surface};`,`--color-muted:   ${p.muted};`,
    `--color-h1:      ${p.h1};`,`--color-h2:      ${p.h2};`,
  ].map(l=>`<div>${l}</div>`).join('');
}
function copyCss(){
  const p=PALETTE;
  const t=`:root {\n  --color-magenta: ${p.magenta};\n  --color-primary: ${p.primary};\n  --color-deep:    ${p.deep};\n  --color-dark:    ${p.dark};\n  --color-surface: ${p.surface};\n  --color-muted:   ${p.muted};\n  --color-h1:      ${p.h1};\n  --color-h2:      ${p.h2};\n}`;
  navigator.clipboard?.writeText(t);
  const b=document.getElementById('cssBtn');b.textContent='Copied!';b.classList.add('ok');
  setTimeout(()=>{b.textContent='Copy';b.classList.remove('ok');},2000);
  toast('CSS variables copied');
}

function pushToPlayground(){
  // Push palette colors into the type playground
  updatePlaygroundPaletteSwatches();
  // Also apply deep color as bg option
  toast('Palette pushed to Typography Playground — check L1/L2/L3 color rows');
}

/* ════════════════════════════════════════════
   TYPOGRAPHY PLAYGROUND STATE
════════════════════════════════════════════ */
const COPY={
  display:['AIGA KC','DESIGN','COMMUNITY','GALA','PORTFOLIO','VIBRANCE','INCLUSIVITY','CREATIVE','KC','CONNECT','FLOURISH','BELONG'],
  editorial:['"Where KC designers come alive."','"Creativity belongs to everyone."','"Build. Connect. Flourish."','"This is your community."'],
  utility:['kc.aiga.org','Spring 2025','Portfolio Review Day','Coffee with Creatives','Annual Gala','Mentorship Program','Board Recruitment'],
};
const R={
  f:(a,b)=>a+Math.random()*(b-a),
  i:(a,b)=>Math.round(R.f(a,b)),
  p:a=>a[Math.floor(Math.random()*a.length)],
};
const defLayer=(text,color,size,x,y,font)=>({
  type:'text',
  text,color,size,x,y,font:font||'Roboto Flex',
  style:'normal',bold:false,sx:100,sy:100,rot:0,ls:2,
  opacity:100,blend:'source-over',
  dists:['normal'],distAmt:40,distSpd:30,visible:true,
  distSettings:{wave:{amt:40,spd:30},stagger:{amt:40,spd:30},explode:{amt:40,spd:30},arch:{amt:40,spd:30},tile:{amt:40,spd:30},mirror:{amt:40,spd:30},glitch:{amt:40,spd:30},circle:{amt:35,spd:20}},
  circleRings:1,circleOrient:'tangent',
  varWghtPat:'none',varWghtMin:200,varWghtMax:800,varWghtSpd:3,varWghtEase:'linear',
  varWidthPat:'none',varWidthMin:60,varWidthMax:140,varWidthSpd:3,varWidthEase:'linear',
  varSkewPat:'none',varSkewMin:-25,varSkewMax:25,varSkewSpd:3,varSkewEase:'linear',
  varSoftPat:'none',varSoftMin:0,varSoftMax:100,varSoftSpd:3,varSoftEase:'linear',
  varWonkPat:'none',varWonkMin:0,varWonkMax:1,varWonkSpd:3,varWonkEase:'linear',
  varScaleXPat:'none',varScaleXMin:50,varScaleXMax:150,varScaleXSpd:3,varScaleXEase:'linear',
  varScaleYPat:'none',varScaleYMin:50,varScaleYMax:150,varScaleYSpd:3,varScaleYEase:'linear',
  varRotPat:'none',varRotMin:-45,varRotMax:45,varRotSpd:3,varRotEase:'linear',
  varTrackPat:'none',varTrackMin:-5,varTrackMax:60,varTrackSpd:3,varTrackEase:'linear',
  varSpd:3,
});
const defImageLayer=(x,y)=>({
  type:'image',
  x:x??50,y:y??50,imgSrc:null,img:null,imgScale:100,
  opacity:100,blend:'source-over',visible:true,
  text:'',color:'#fff',size:16,font:'Roboto Flex',
  style:'normal',bold:false,sx:100,sy:100,rot:0,ls:2,
  dists:['normal'],distAmt:40,distSpd:30,
  distSettings:{},circleRings:1,circleOrient:'tangent',
  varWghtPat:'none',varWidthPat:'none',varSkewPat:'none',varSoftPat:'none',varWonkPat:'none',
  varScaleXPat:'none',varScaleYPat:'none',varRotPat:'none',varTrackPat:'none',
  varWghtMin:200,varWghtMax:800,varWidthMin:60,varWidthMax:140,
  varSkewMin:-25,varSkewMax:25,varSoftMin:0,varSoftMax:100,varWonkMin:0,varWonkMax:1,
  varScaleXMin:50,varScaleXMax:150,varScaleYMin:50,varScaleYMax:150,
  varRotMin:-45,varRotMax:45,varTrackMin:-5,varTrackMax:60,
  varSpd:3,varWghtSpd:3,varWidthSpd:3,varSkewSpd:3,varSoftSpd:3,varWonkSpd:3,
  varScaleXSpd:3,varScaleYSpd:3,varRotSpd:3,varTrackSpd:3,
  varWghtEase:'linear',varWidthEase:'linear',varSkewEase:'linear',varSoftEase:'linear',varWonkEase:'linear',
  varScaleXEase:'linear',varScaleYEase:'linear',varRotEase:'linear',varTrackEase:'linear',
});
const defEyeLayer=(x,y)=>({
  type:'eye',
  x:x??50,y:y??50,
  eyeSize:100,
  irisColor:'#e5007d',
  pupilColor:'#080808',
  scleraColor:'#ffffff',
  outlineColor:'#080808',
  colorMode:'fixed',      // 'fixed' | 'palette' | 'random'
  lookMode:'center',      // 'center' | 'wander'
  lookX:0,lookY:0,
  blinkMode:'none',       // 'none' | 'auto'
  blinkSpeed:5,
  arrangement:'single',   // 'single' | 'tile' | 'circle'
  tileRows:3,tileCols:4,tileSpacingX:1.8,tileSpacingY:1.5,
  circleCount:8,circleRadius:30,
  opacity:100,blend:'source-over',visible:true,
  rot:0,sx:100,sy:100,
  // compat fields for serialization / layer stack
  text:'',color:'#e5007d',size:100,font:'Roboto Flex',
  style:'normal',bold:false,ls:2,
  dists:['normal'],distAmt:40,distSpd:30,distSettings:{},
});
const T={
  bg:'#080808',bgTex:'none',texOp:12,
  accent:'none',kc:'none',glow:0,
  // Gradient
  grad:'none', gradC1:'#e5007d', gradC2:'#002fa7', gradC3:'#8800cc', gradC4:'#ff6600', gradC5:'#00c878',
  gradAngle:135, gradOpacity:80, gradMid:50, gradGrain:0, gradBlobs:4,
  // Grain
  grain:0, grainSize:1, grainAnim:true, grainColor:'#ec008c',
  htMode:'none', htSpacing:8, htAngle:45, htBg:true,
  riso:0, risoOffset:3, risoC1:'#e5007d',
  // Logo
  logo:'none', logoDock:'tr', logoSize:28, logoOpacity:100,
  frame:0,animating:false,
  layers:[
    defLayer('AIGA KC','#ffffff',160,50,50,'Roboto Flex'),
  ],
};
let TW=800,TH=800,animId=null;

