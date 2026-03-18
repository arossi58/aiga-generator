function initScrollSpy(){
  const sections=['color-section','type-section'];
  const links=document.querySelectorAll('.nav-links a');
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        const id=e.target.id;
        links.forEach(l=>{l.classList.toggle('active',l.getAttribute('href')==='#'+id);});
      }
    });
  },{threshold:.15,rootMargin:'-52px 0px 0px 0px'});
  sections.forEach(id=>{const el=document.getElementById(id);if(el)observer.observe(el);});
}

/* ════════════════════════════════════════════
   REVEAL
════════════════════════════════════════════ */
const revObs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in');});},{threshold:.1});

/* ════════════════════════════════════════════
   TOAST
════════════════════════════════════════════ */
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200);}

/* ════════════════════════════════════════════
   INIT
════════════════════════════════════════════ */
/* ════════════════════════════════════════════
   AUTO-SAVE / RESTORE  (localStorage)
════════════════════════════════════════════ */
let _autosaveTimer = null;

function _flushSave() {
  try {
    const tData = JSON.parse(JSON.stringify(T));
    delete tData.frame; delete tData.animating;
    tData.layers.forEach(l => { delete l.img; }); // Image objects aren't serialisable; imgSrc is kept
    localStorage.setItem('aigakc_T', JSON.stringify(tData));
    const hex = document.getElementById('colorHex')?.value || '#002FA7';
    localStorage.setItem('aigakc_palette', JSON.stringify({ hex, harmonyMode, PALETTE: {...PALETTE} }));
  } catch(e) { /* quota exceeded or private mode — silently skip */ }
}

function autosave() {
  clearTimeout(_autosaveTimer);
  _autosaveTimer = setTimeout(_flushSave, 2000);
}

function restoreFromStorage() {
  try {
    // --- Palette ---
    const palRaw = localStorage.getItem('aigakc_palette');
    if (palRaw) {
      const palData = JSON.parse(palRaw);
      if (palData.hex) {
        const cp = document.getElementById('colorPicker');
        const ch = document.getElementById('colorHex');
        if (cp) cp.value = palData.hex;
        if (ch) ch.value = palData.hex.toUpperCase();
      }
      if (palData.harmonyMode) {
        harmonyMode = palData.harmonyMode;
        document.querySelectorAll('.harm-btn').forEach(btn => {
          const oc = btn.getAttribute('onclick') || '';
          btn.classList.toggle('active', oc.includes("'" + harmonyMode + "'"));
        });
      }
      if (palData.PALETTE) Object.assign(PALETTE, palData.PALETTE);
    }

    // --- Composition (T) ---
    const tRaw = localStorage.getItem('aigakc_T');
    if (!tRaw) return false;
    const data = JSON.parse(tRaw);
    if (!data.layers || !Array.isArray(data.layers)) return false;
    data.frame = 0; data.animating = false;
    data.layers.forEach(layer => {
      if (!layer.type) layer.type = 'text';
      if (layer.type === 'image' && layer.imgSrc && !layer.img) {
        const img = new Image(); img.src = layer.imgSrc; layer.img = img;
      }
      if (!layer.dists) layer.dists = [layer.dist || 'normal'];
      if (!layer.varWghtPat) layer.varWghtPat = 'none';
      if (!layer.varWidthPat) layer.varWidthPat = 'none';
      if (!layer.varSkewPat) layer.varSkewPat = 'none';
      if (layer.varSpd == null) layer.varSpd = 3;
      if (!layer.varSoftPat) layer.varSoftPat = 'none';
      if (layer.varSoftMin == null) layer.varSoftMin = 0;
      if (layer.varSoftMax == null) layer.varSoftMax = 100;
      if (!layer.varWonkPat) layer.varWonkPat = 'none';
      if (layer.varWonkMin == null) layer.varWonkMin = 0;
      if (layer.varWonkMax == null) layer.varWonkMax = 1;
      ['Wght','Width','Skew','Soft','Wonk','ScaleX','ScaleY','Rot','Track'].forEach(a => {
        if (layer[`var${a}Spd`] == null) layer[`var${a}Spd`] = 3;
        if (!layer[`var${a}Ease`]) layer[`var${a}Ease`] = 'linear';
        if (!layer[`var${a}Pat`]) layer[`var${a}Pat`] = 'none';
      });
      if (layer.circleRings == null) layer.circleRings = 1;
      if (!layer.circleOrient) layer.circleOrient = 'tangent';
      if (!layer.distSettings) {
        const fb = {amt: layer.distAmt || 40, spd: layer.distSpd || 30};
        layer.distSettings = {wave:{...fb},stagger:{...fb},explode:{...fb},arch:{...fb},tile:{...fb},mirror:{...fb},glitch:{...fb},circle:{amt:35,spd:20}};
      } else if (!layer.distSettings.circle) {
        layer.distSettings.circle = {amt:35,spd:20};
      }
    });
    Object.assign(T, data);
    return true;
  } catch(e) { return false; }
}

document.addEventListener('DOMContentLoaded',()=>{
  const wasRestored = restoreFromStorage();

  // Remove any stale extra panes
  for(let i=2;i<=6;i++){const p=document.getElementById(`pane-l${i}`);if(p)p.remove();}
  T.layers.forEach((_,i)=>buildLayerPane(`l${i+1}`));
  buildTplCards();

  // Init panel: start on BG tab, pane-bg active
  document.querySelectorAll('.tab-pane').forEach(p=>p.classList.remove('active'));
  document.getElementById('pane-bg').classList.add('active');

  if (wasRestored) {
    // Sync all panel controls to restored T state
    document.querySelectorAll('#accentOpts .bg-opt').forEach(el=>el.classList.toggle('active',el.dataset.a===T.accent));
    document.querySelectorAll('#logoVariantOpts .bg-opt').forEach(el=>el.classList.toggle('active',el.dataset.logo===(T.logo||'none')));
    document.querySelectorAll('#logoDockOpts .bg-opt').forEach(el=>el.classList.toggle('active',el.dataset.dock===(T.logoDock||'tr')));
    const lc=document.getElementById('logoControls');if(lc)lc.style.display=(T.logo&&T.logo!=='none')?'flex':'none';
    const lse=(id,v,suf)=>{const el=document.getElementById(id);if(el)el.value=v;const vl=document.getElementById(id+'Val');if(vl)vl.textContent=v+suf;};
    lse('logoSize',T.logoSize||28,'%');lse('logoOpacity',T.logoOpacity!=null?T.logoOpacity:100,'%');
    document.querySelectorAll('#bgTexOpts .bg-opt').forEach(el=>el.classList.toggle('active',el.dataset.tex===T.bgTex));
    document.querySelectorAll('#gradTypeOpts .bg-opt').forEach(el=>el.classList.toggle('active',el.dataset.g===T.grad));
    document.querySelectorAll('#grainStyleOpts .bg-opt').forEach(el=>el.classList.toggle('active',el.dataset.gs===T.grainStyle));
    const grAnimB=document.getElementById('grainAnimToggle');if(grAnimB){const ga=T.grainAnim!==false;grAnimB.classList.toggle('on',ga);grAnimB.textContent=ga?'Animated':'Static';}
    const gcpR2=document.getElementById('grainColorPaletteRow');if(gcpR2)gcpR2.style.display=T.grainStyle==='color'?'flex':'none';
    const gcSw2=document.getElementById('grainColorSw');if(gcSw2)gcSw2.style.background=T.grainColor||'#ec008c';
    document.querySelectorAll('#htModeOpts .bg-opt').forEach(el=>el.classList.toggle('active',el.dataset.ht===T.htMode));
    const se=(id,v,suf)=>{const el=document.getElementById(id);if(el)el.value=v;const vl=document.getElementById(id+'Val');if(vl)vl.textContent=v+suf;};
    se('gradAngle',T.gradAngle,'°');se('gradOpacity',T.gradOpacity,'%');
    se('gradMid',T.gradMid??50,'%');se('gradGrain',T.gradGrain??0,'%');se('gradBlobs',T.gradBlobs??4,'');
    const gbr=document.getElementById('gradBlobsRow');if(gbr)gbr.style.display=T.grad==='mesh'?'flex':'none';
    se('grainAmount',T.grain,'%');se('grainSize',T.grainSize,'×');
    se('glowVal',T.glow,'%');
    se('htSpacing',T.htSpacing,'');se('htAngle',T.htAngle,'°');
    const htBgB=document.getElementById('htBgToggle');if(htBgB){htBgB.classList.toggle('on',T.htBg===false);htBgB.textContent=T.htBg===false?'Text only':'All';}
    se('risoIntensity',T.riso,'');se('risoOffset',T.risoOffset,'');
    const gc1=document.getElementById('gradC1');if(gc1)gc1.value=T.gradC1;
    const gc2=document.getElementById('gradC2');if(gc2)gc2.value=T.gradC2;
    syncGradSlotsFromState();
    syncLayerUI();
    renderSwatches(); renderPreviewCard(); renderCssExport();
    updateGrainPaletteSwatches();
  } else {
    generatePalette();
  }

  typo_fitCanvas();typo_render();
  initCanvasDrag();
  updatePlaygroundPaletteSwatches();
  updateGradPaletteSwatches();
  if (!wasRestored) updateGrainPaletteSwatches();

  // Flush save immediately before tab close
  window.addEventListener('beforeunload', _flushSave);

  document.querySelectorAll('.reveal').forEach(el=>revObs.observe(el));
  initScrollSpy();
});
/* ════════════════════════════════════════════
   QUICK FX — one-click grain / gradient / texture presets
════════════════════════════════════════════ */
function quickFX(type) {
  _grainCanvas = null;
  if (type === 'grain') {
    // Toggle: if grain already on, bump it up; if maxed, reset
    T.grain = T.grain < 20 ? 35 : T.grain < 50 ? 65 : 0;
    T.grainSize = 1; T.grainStyle = 'overlay';
    const el = document.getElementById('grainAmount'); if(el){ el.value = T.grain; document.getElementById('grainVal').textContent = T.grain + '%'; }
    // Switch to BG tab so the slider is visible
    const bgTab = document.querySelector('[data-tab="bg"]'); if(bgTab) switchTab('bg', bgTab);
  } else if (type === 'gradient') {
    const presets = [
      { grad:'vignette', c1:'#000000', c2:'#080808', op:80 },
      { grad:'linear', c1:'#e5007d', c2:'#002fa7', op:60 },
      { grad:'sunset', c1:'#e5007d', c2:'#1a0830', op:80 },
      { grad:'glow-corner', c1:'#e5007d', c2:'#080808', op:70 },
    ];
    // Cycle through presets
    const cur = presets.findIndex(p => p.grad === T.grad);
    const next = presets[(cur + 1) % presets.length];
    T.grad = next.grad; T.gradC1 = next.c1; T.gradC2 = next.c2; T.gradOpacity = next.op;
    document.querySelectorAll('#gradTypeOpts .bg-opt').forEach(el => {
      el.classList.toggle('active', el.dataset.g === T.grad);
    });
    const bgTab = document.querySelector('[data-tab="bg"]'); if(bgTab) switchTab('bg', bgTab);
  } else if (type === 'paper') {
    const isPaper = T.bgTex === 'paper';
    T.bgTex = isPaper ? 'none' : 'paper';
    T.texOp = isPaper ? 12 : 30;
    document.querySelectorAll('#bgTexOpts .bg-opt').forEach(el => {
      el.classList.toggle('active', el.dataset.tex === T.bgTex);
    });
  } else if (type === 'noise') {
    const isNoise = T.bgTex === 'noise';
    T.bgTex = isNoise ? 'none' : 'noise';
    T.texOp = isNoise ? 12 : 20;
    document.querySelectorAll('#bgTexOpts .bg-opt').forEach(el => {
      el.classList.toggle('active', el.dataset.tex === T.bgTex);
    });
  } else if (type === 'halftone') {
    // Cycle: none → dots → lines → color → none
    const modes = ['none','dots','lines','color'];
    const cur = modes.indexOf(T.htMode || 'none');
    T.htMode = modes[(cur + 1) % modes.length];
    document.querySelectorAll('#htModeOpts .bg-opt').forEach(el => {
      el.classList.toggle('active', el.dataset.ht === T.htMode);
    });
    toast(`Halftone: ${T.htMode}`);
  } else if (type === 'riso') {
    // Cycle through riso presets
    const risoPresets = [
      { riso: 0, risoOffset: 3, risoC1: '#e5007d' },
      { riso: 55, risoOffset: 3, risoC1: '#e5007d' },
      { riso: 80, risoOffset: 5, risoC1: '#002fa7' },
      { riso: 65, risoOffset: 4, risoC1: '#00a878' },
    ];
    const cur = T.riso === 0 ? 0 : risoPresets.findIndex(p => Math.abs(p.riso - T.riso) < 15);
    const next = risoPresets[(cur + 1) % risoPresets.length];
    T.riso = next.riso; T.risoOffset = next.risoOffset; T.risoC1 = next.risoC1;
    const rEl = document.getElementById('risoAmt'); if(rEl){ rEl.value = T.riso; document.getElementById('risoAmtVal').textContent = T.riso + '%'; }
    const rOff = document.getElementById('risoOff'); if(rOff){ rOff.value = T.risoOffset; document.getElementById('risoOffVal').textContent = T.risoOffset + 'px'; }
    const rPick = document.getElementById('risoC1Pick'); if(rPick){ rPick.value = T.risoC1; }
    toast(T.riso === 0 ? 'Riso off' : `Riso ${T.riso}% — ${T.risoC1}`);
  } else if (type === 'clear') {
    T.grain = 0; T.grainSize = 1; T.grainStyle = 'overlay';
    T.grad = 'none'; T.glow = 0; T.bgTex = 'none'; T.texOp = 12;
    T.htMode = 'none'; T.htBg = true; T.riso = 0;
    const htBgB2=document.getElementById('htBgToggle');if(htBgB2){htBgB2.classList.remove('on');htBgB2.textContent='All';}
    const gEl = document.getElementById('grainAmount'); if(gEl){ gEl.value = 0; document.getElementById('grainVal').textContent = '0%'; }
    const rEl = document.getElementById('risoAmt'); if(rEl){ rEl.value = 0; document.getElementById('risoAmtVal').textContent = '0%'; }
    document.querySelectorAll('#gradTypeOpts .bg-opt').forEach(el => el.classList.toggle('active', el.dataset.g === 'none'));
    document.querySelectorAll('#bgTexOpts .bg-opt').forEach(el => el.classList.toggle('active', el.dataset.tex === 'none'));
    document.querySelectorAll('#grainStyleOpts .bg-opt').forEach(el => el.classList.toggle('active', el.dataset.gs === 'overlay'));
    document.querySelectorAll('#htModeOpts .bg-opt').forEach(el => el.classList.toggle('active', el.dataset.ht === 'none'));
    toast('FX cleared');
  }
  typo_render();
}

/* ════════════════════════════════════════════
   EXPORT SYSTEM
════════════════════════════════════════════ */

const PLATFORMS_DEF = [
  { id:'ig-post',    label:'Instagram',  sub:'Post',    icon:'📷', w:1080, h:1080 },
  { id:'ig-story',   label:'Instagram',  sub:'Story',   icon:'📱', w:1080, h:1920 },
  { id:'tiktok',     label:'TikTok',     sub:'Video',   icon:'🎵', w:1080, h:1920 },
  { id:'twitter',    label:'X / Twitter',sub:'Post',    icon:'𝕏',  w:1200, h:675  },
  { id:'linkedin',   label:'LinkedIn',   sub:'Post',    icon:'💼', w:1200, h:628  },
  { id:'facebook',   label:'Facebook',   sub:'Post',    icon:'📘', w:1200, h:630  },
  { id:'youtube',    label:'YouTube',    sub:'Thumb',   icon:'▶',  w:1280, h:720  },
  { id:'custom',     label:'Canvas',     sub:'Current', icon:'⬜', w:null, h:null },
];

const EX = {
  platform: 'ig-post',
  format: 'png',
  quality: 0.92,
  scale: 2,
  duration: 4,
  fps: 30,
  loop: 'loop',
};

let recTimer = null;
let recMediaRecorder = null;

function getExportDims() {
  const p = PLATFORMS_DEF.find(x => x.id === EX.platform);
  if (!p || p.w === null) return { w: TW * EX.scale, h: TH * EX.scale };
  return { w: p.w, h: p.h };
}

function openExport() {
  document.getElementById('export-overlay').classList.add('open');
  buildPlatformGrid();
  updateExpSummary();
}
function closeExport() {
  document.getElementById('export-overlay').classList.remove('open');
}

function buildPlatformGrid() {
  const grid = document.getElementById('platGrid');
  grid.innerHTML = PLATFORMS_DEF.map(p => {
    const dims = p.w ? `${p.w}×${p.h}` : `${TW}×${TH}`;
    return `<button class="plat-btn${EX.platform===p.id?' active':''}" onclick="selPlatform('${p.id}',this)">
      <span class="plat-icon">${p.icon}</span>
      <span class="plat-name">${p.label}</span>
      <span class="plat-dim">${p.sub} · ${dims}</span>
    </button>`;
  }).join('');
}

function selPlatform(id, btn) {
  EX.platform = id;
  document.querySelectorAll('.plat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  updateExpSummary();
}

function switchExpTab(tab, btn) {
  document.querySelectorAll('.exp-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.exp-pane').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(`exp-pane-${tab}`).classList.add('active');
}

function selExpSeg(btn, groupId) {
  document.querySelectorAll(`#${groupId} .exp-seg`).forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function updateExpSummary() {
  const d = getExportDims();
  // Image summary
  document.getElementById('sumW').textContent = d.w.toLocaleString();
  document.getElementById('sumH').textContent = d.h.toLocaleString();
  document.getElementById('sumFmt').textContent = EX.format.toUpperCase();
  const p = PLATFORMS_DEF.find(x => x.id === EX.platform);
  document.getElementById('sumPlat').textContent = p ? p.label.split('/')[0].trim() : 'Custom';
  // Show/hide quality slider
  const isPNG = EX.format === 'png';
  document.getElementById('qualitySlider').disabled = isPNG;
  document.getElementById('qualityNote').style.display = isPNG ? 'inline' : 'none';
  document.getElementById('qualitySlider').style.opacity = isPNG ? '.3' : '1';
  // Video summary
  document.getElementById('vidSumW').textContent = d.w.toLocaleString();
  document.getElementById('vidSumH').textContent = d.h.toLocaleString();
  document.getElementById('vidSumDur').textContent = EX.duration + 's';
  document.getElementById('vidSumFps').textContent = EX.fps;
}

/* ── Render at arbitrary resolution ── */
function renderAtRes(targetW, targetH) {
  const off = document.createElement('canvas');
  off.width = targetW; off.height = targetH;
  const ctx = off.getContext('2d');
  const sx = targetW / TW;
  const sy = targetH / TH;

  // Background
  ctx.fillStyle = T.bg; ctx.fillRect(0, 0, targetW, targetH);

  // Gradient
  if (T.grad !== 'none') {
    ctx.save(); ctx.globalAlpha = T.gradOpacity/100;
    drawGradient(ctx, T.grad, targetW, targetH, T.gradC1, T.gradC2, T.gradC3||T.gradC1, T.gradAngle, T.gradMid??50, T.gradGrain??0, T.gradBlobs??4, T.gradC4||T.gradC1, T.gradC5||T.gradC2);
    ctx.restore();
  }

  // Glow
  if (T.glow > 0) {
    const g = ctx.createRadialGradient(targetW/2, targetH/2, 0, targetW/2, targetH/2, Math.max(targetW,targetH)*.7);
    g.addColorStop(0, `rgba(229,0,125,${T.glow/400})`); g.addColorStop(1, 'transparent');
    ctx.fillStyle = g; ctx.fillRect(0, 0, targetW, targetH);
  }

  // Texture (scale-aware)
  if (T.bgTex !== 'none') {
    ctx.save(); ctx.globalAlpha = T.texOp/100;
    const s = 22 * sx;
    ctx.strokeStyle = '#e5007d'; ctx.fillStyle = '#e5007d'; ctx.lineWidth = sx;
    if (T.bgTex === 'grid') {
      for (let x=0; x<targetW; x+=s) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,targetH); ctx.stroke(); }
      for (let y=0; y<targetH; y+=s) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(targetW,y); ctx.stroke(); }
    } else if (T.bgTex === 'paper') {
      const sp = 28 * sx; const minor = 'rgba(100,160,220,0.55)'; const major = 'rgba(60,120,190,0.75)';
      ctx.lineWidth = 0.8 * sx;
      for (let x=0; x<targetW; x+=sp) {
        ctx.strokeStyle = (Math.round(x/sp)%5===0) ? major : minor;
        ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,targetH); ctx.stroke();
      }
      for (let y=0; y<targetH; y+=sp) {
        ctx.strokeStyle = (Math.round(y/sp)%5===0) ? major : minor;
        ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(targetW,y); ctx.stroke();
      }
    } else if (T.bgTex === 'dot') {
      for (let x=s/2; x<targetW; x+=s) for (let y=s/2; y<targetH; y+=s) { ctx.beginPath(); ctx.arc(x,y,s*.1,0,Math.PI*2); ctx.fill(); }
    } else if (T.bgTex === 'diagonal') {
      const d = Math.ceil(Math.hypot(targetW,targetH));
      ctx.save(); ctx.translate(targetW/2,targetH/2); ctx.rotate(Math.PI/4); ctx.translate(-d/2,-d/2);
      for (let x=0; x<d*2; x+=s) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,d*2); ctx.stroke(); }
      ctx.restore();
    } else if (T.bgTex === 'scan') {
      ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = sx;
      const lh = 3 * sx;
      for (let y=0; y<targetH; y+=lh) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(targetW,y); ctx.stroke(); }
    } else if (T.bgTex === 'noise') {
      const imgd = ctx.createImageData(targetW, targetH); const nd = imgd.data;
      for (let i=0; i<nd.length; i+=4) {
        const v = Math.random()>0.5?255:0; nd[i]=v; nd[i+1]=v; nd[i+2]=v; nd[i+3]=Math.round(Math.random()*80+20);
      }
      ctx.putImageData(imgd, 0, 0);
    }
    ctx.restore();
  }

  // Snapshot background before layers for halftone text-only mode
  if (T.htMode && T.htMode !== 'none' && T.htMode !== 'color' && T.htBg === false) {
    _htBgSnap = ctx.getImageData(0, 0, targetW, targetH);
  } else {
    _htBgSnap = null;
  }

  // Layers — scale all size/position values
  const savedTW = TW, savedTH = TH;
  TW = targetW; TH = targetH;
  T.layers.forEach(layer => {
    if (!layer.visible) return;
    const scaledLayer = {
      ...layer,
      size: layer.size * ((sx + sy) / 2),
    };
    ctx.save();
    ctx.globalAlpha = scaledLayer.opacity / 100;
    ctx.globalCompositeOperation = scaledLayer.blend;
    drawLayer(ctx, scaledLayer, T.frame);
    ctx.restore();
  });
  TW = savedTW; TH = savedTH;

  // Accents at target dims
  const savedAccentTW = TW, savedAccentTH = TH;
  TW = targetW; TH = targetH;
  drawAccent(ctx, targetW, targetH);
  TW = savedAccentTW; TH = savedAccentTH;

  // Post FX — halftone + riso (mirrors typo_render pipeline)
  const savedTW2 = TW, savedTH2 = TH;
  TW = targetW; TH = targetH;
  if (T.htMode && T.htMode !== 'none') applyHalftone(ctx, targetW, targetH);
  if (T.riso > 0) applyRisograph(ctx, targetW, targetH);
  TW = savedTW2; TH = savedTH2;

  // Grain
  if (T.grain > 0) {
    _grainCanvas = null; // force regenerate at export res
    drawGrain(ctx, targetW, targetH, T.grain, T.grainSize, T.grainStyle||'overlay');
  }

  // AIGA Logo — always last, unaffected by any FX
  drawLogo(ctx, targetW, targetH);

  return off;
}

/* ── Image export ── */
function exportImage() {
  const d = getExportDims();
  const off = renderAtRes(d.w, d.h);
  const mime = EX.format === 'png' ? 'image/png' : EX.format === 'jpeg' ? 'image/jpeg' : 'image/webp';
  const quality = EX.format === 'png' ? undefined : EX.quality;
  const p = PLATFORMS_DEF.find(x => x.id === EX.platform);
  const platSlug = p ? p.id : 'custom';
  const ext = EX.format === 'jpeg' ? 'jpg' : EX.format;
  const ts = new Date().toISOString().slice(0,10);
  const filename = `aigakc-${platSlug}-${ts}.${ext}`;

  off.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    const kb = Math.round(blob.size / 1024);
    toast(`Downloaded ${filename} · ${kb < 1024 ? kb+'KB' : (kb/1024).toFixed(1)+'MB'}`);
  }, mime, quality);
}

function exportCopy() {
  const d = getExportDims();
  const off = renderAtRes(d.w, d.h);
  off.toBlob(blob => {
    try {
      navigator.clipboard.write([new ClipboardItem({'image/png': blob})]);
      toast('Copied to clipboard — paste into Figma, Canva, or your app');
    } catch(e) {
      toast('Clipboard write failed — try Download instead');
    }
  }, 'image/png');
}

/* ── Video export ── */
function _downloadRecordedBlob(chunks, mime, targetBitrate) {
  const blob = new Blob(chunks, { type: mime });
  const url = URL.createObjectURL(blob);
  const p = PLATFORMS_DEF.find(x => x.id === EX.platform);
  const a = document.createElement('a');
  a.href = url;
  a.download = `aigakc-${p ? p.id : 'custom'}-${new Date().toISOString().slice(0,10)}.webm`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  const mb = (blob.size / (1024*1024)).toFixed(1);
  toast(`Downloaded WebM · ${mb}MB · ${EX.duration}s · ${EX.fps}fps · ${Math.round(targetBitrate/1e6)}Mbps`);
}

async function recordVideo() {
  if (recMediaRecorder && recMediaRecorder.state === 'recording') return;

  const d = getExportDims();
  const canvas = document.getElementById('typeCanvas');
  const ctx = canvas.getContext('2d');
  const origW = TW, origH = TH;
  const startFrame = T.frame;
  TW = d.w; TH = d.h;
  canvas.width = d.w; canvas.height = d.h;
  typo_fitCanvas();

  // Suspend the RAF animation loop
  const wasAnimating = T.animating;
  T.animating = false;
  if (animId) { cancelAnimationFrame(animId); animId = null; }

  const btn = document.getElementById('recBtn');
  btn.disabled = true;
  const progress = document.getElementById('rec-progress');
  const barFill = document.getElementById('recBarFill');
  const recLabel = document.getElementById('recLabel');
  progress.classList.add('visible');

  const totalFrames = Math.ceil(EX.duration * EX.fps);
  const frameDuration = 1000 / EX.fps;

  // Codec + bitrate
  const mimeOptions = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
  const mime = mimeOptions.find(m => MediaRecorder.isTypeSupported(m)) || 'video/webm';
  const targetBitrate = Math.max(20_000_000, Math.round(d.w * d.h * EX.fps * 0.15));

  // Shared restore function
  function restore(pumpHandle) {
    clearTimeout(pumpHandle);
    clearInterval(recTimer);
    TW = origW; TH = origH;
    canvas.width = TW; canvas.height = TH;
    document.getElementById('canvasInfo').textContent = `${TW} × ${TH}px`;
    typo_fitCanvas();
    if (wasAnimating) typo_setAnim(true, document.getElementById('animOn'));
    else { T.animating = false; typo_render(); }
    btn.disabled = false;
    btn.textContent = '● Record & Export WebM';
    progress.classList.remove('visible');
    barFill.style.width = '0%';
  }

  // ── Phase 1: Pre-render all frames as GPU-resident ImageBitmaps ──────────
  // Rendering and encoding are fully decoupled: slow renders don't affect
  // the encoder's frame timing, so the output is always perfectly smooth.
  btn.textContent = '● Rendering…';
  const frames = [];
  let preRenderOk = true;

  for (let i = 0; i < totalFrames; i++) {
    T.frame = startFrame + i;

    // T.animating must be true so grain and gradient-grain caches regenerate
    // each frame exactly as they do during live playback — without this, every
    // pre-rendered frame would have identical static grain.
    T.animating = true;
    typo_render();
    T.animating = false;

    // Await one animation frame before snapshotting.
    // On hardware-accelerated canvas the GPU rasterisation pipeline is async;
    // RAF fires after the browser has flushed and composited the current frame,
    // guaranteeing createImageBitmap captures a fully-completed render.
    await new Promise(r => requestAnimationFrame(r));

    try {
      frames.push(await createImageBitmap(canvas));
    } catch (_) {
      // Out of GPU memory — fall back to live pump
      preRenderOk = false;
      break;
    }
    barFill.style.width = ((i + 1) / totalFrames * 50) + '%';
    recLabel.textContent = `Rendering… ${i + 1} / ${totalFrames}`;
  }

  if (!preRenderOk) {
    frames.forEach(b => b.close?.());
    frames.length = 0;
  }

  // ── Phase 2a: Perfect playback from pre-rendered frames ──────────────────
  if (frames.length === totalFrames) {
    btn.textContent = '● Encoding…';

    // captureStream(EX.fps) embeds correct fps metadata in the stream so players
    // know the exact playback rate. requestFrame() still gives us explicit
    // per-frame control: each drawImage+requestFrame pair submits exactly one
    // frame to the encoder, with proper timestamps.
    const stream = canvas.captureStream(EX.fps);
    const track = stream.getVideoTracks()[0];
    const chunks = [];
    let pump = null;

    recMediaRecorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: targetBitrate });
    recMediaRecorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    recMediaRecorder.onstop = () => {
      restore(pump);
      frames.forEach(b => b.close?.());
      _downloadRecordedBlob(chunks, mime, targetBitrate);
    };
    recMediaRecorder.start();

    let fi = 0;
    let nextT = performance.now();
    function encodeFrame() {
      if (fi >= frames.length) { recMediaRecorder.stop(); return; }
      // drawImage from ImageBitmap is a GPU→GPU blit — takes < 1 ms
      ctx.drawImage(frames[fi], 0, 0);
      track.requestFrame(); // submit this exact canvas state to the encoder now
      barFill.style.width = (50 + (fi + 1) / frames.length * 50) + '%';
      recLabel.textContent = `Encoding… ${fi + 1} / ${frames.length}`;
      fi++;
      nextT += frameDuration;
      pump = setTimeout(encodeFrame, Math.max(0, nextT - performance.now()));
    }
    nextT = performance.now();
    encodeFrame();

  // ── Phase 2b: Fallback — live frame pump (pre-render OOM'd) ──────────────
  } else {
    btn.textContent = '● Recording…';

    const stream = canvas.captureStream(EX.fps);
    const chunks = [];
    let pump = null;

    recMediaRecorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: targetBitrate });
    recMediaRecorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    recMediaRecorder.onstop = () => {
      restore(pump);
      _downloadRecordedBlob(chunks, mime, targetBitrate);
    };
    recMediaRecorder.start();

    let nextF = performance.now() + frameDuration;
    function pumpFrame() {
      T.frame++; typo_render();
      nextF += frameDuration;
      pump = setTimeout(pumpFrame, Math.max(0, nextF - performance.now()));
    }
    pumpFrame();

    const startTime = Date.now();
    const totalMs = EX.duration * 1000;
    recTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      barFill.style.width = Math.min(100, elapsed / totalMs * 100) + '%';
      recLabel.textContent = `Recording… ${(elapsed/1000).toFixed(1)}s / ${EX.duration}s`;
      if (elapsed >= totalMs) { clearInterval(recTimer); recMediaRecorder.stop(); }
    }, 60);
  }
}

/* ════════════════════════════════════════════
   OKLCH COLOR ENGINE
════════════════════════════════════════════ */

// sRGB → Linear
function srgbToLinear(c) {
  c = c / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
// Linear → sRGB
function linearToSrgb(c) {
  c = Math.max(0, Math.min(1, c));
  return Math.round(255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1/2.4) - 0.055));
}

// sRGB → OKLab (via linear sRGB → XYZ D65 → OKLab)
function rgbToOklab(r, g, b) {
  const lr = srgbToLinear(r), lg = srgbToLinear(g), lb = srgbToLinear(b);
  // Linear sRGB → LMS (via M1 matrix)
  const l = 0.4122214708*lr + 0.5363325363*lg + 0.0514459929*lb;
  const m = 0.2119034982*lr + 0.6806995451*lg + 0.1073969566*lb;
  const s = 0.0883024619*lr + 0.2817188376*lg + 0.6299787005*lb;
  // Cube-root
  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
  return {
    L: 0.2104542553*l_ + 0.7936177850*m_ - 0.0040720468*s_,
    a: 1.9779984951*l_ - 2.4285922050*m_ + 0.4505937099*s_,
    b: 0.0259040371*l_ + 0.7827717662*m_ - 0.8086757660*s_
  };
}

// OKLab → OKLCH
function oklabToOklch({ L, a, b }) {
  const C = Math.sqrt(a * a + b * b);
  let H = Math.atan2(b, a) * 180 / Math.PI;
  if (H < 0) H += 360;
  return { L, C, H };
}

// OKLCH → OKLab
function oklchToOklab({ L, C, H }) {
  const hr = H * Math.PI / 180;
  return { L, a: C * Math.cos(hr), b: C * Math.sin(hr) };
}

// OKLab → linear RGB → sRGB hex
function oklabToHex({ L, a, b }) {
  const l_ = L + 0.3963377774*a + 0.2158037573*b;
  const m_ = L - 0.1055613458*a - 0.0638541728*b;
  const s_ = L - 0.0894841775*a - 1.2914855480*b;
  const l = l_*l_*l_, m = m_*m_*m_, s = s_*s_*s_;
  const lr =  4.0767416621*l - 3.3077115913*m + 0.2309699292*s;
  const lg = -1.2684380046*l + 2.6097574011*m - 0.3413193965*s;
  const lb = -0.0041960863*l - 0.7034186147*m + 1.7076147010*s;
  const R = linearToSrgb(lr), G = linearToSrgb(lg), B = linearToSrgb(lb);
  return '#' + [R,G,B].map(v => Math.max(0,Math.min(255,v)).toString(16).padStart(2,'0')).join('');
}

// Full pipeline: hex → OKLCH
function hexToOklch(hex) {
  const { r, g, b } = hexToRgb(hex);
  return oklabToOklch(rgbToOklab(r, g, b));
}

// Full pipeline: OKLCH → hex
function oklchToHex(L, C, H) {
  return oklabToHex(oklchToOklab({ L, C, H }));
}

// Generate N perceptually-even shades by sweeping L from near-white to near-black,
// keeping C and H constant (chroma-preserved scale)
function generateOklchShades(hex, steps = 11) {
  const { L, C, H } = hexToOklch(hex);
  const shades = [];
  for (let i = 0; i < steps; i++) {
    // L sweep: 0.97 (near white) → 0.10 (near black)
    const t = i / (steps - 1);
    const targetL = 0.97 - t * 0.87;
    // Scale chroma: reduce slightly at extremes to avoid gamut issues
    const chromaScale = 1 - Math.pow(Math.abs(targetL - 0.5) * 2, 2.5) * 0.35;
    const targetC = C * chromaScale;
    const h = oklchToHex(targetL, Math.max(0, targetC), H);
    const step = i === 0 ? 50 : i * 100; // 50, 100, 200…1000
    shades.push({
      step,
      hex: h,
      L: targetL,
      C: targetC,
      H,
      isSrc: Math.abs(targetL - L) < 0.045 // flag the shade closest to source
    });
  }
  return shades;
}

