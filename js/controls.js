function typo_resize(){
  const v=document.getElementById('canvasSize').value;
  [TW,TH]=v.split(',').map(Number);
  const c=document.getElementById('typeCanvas');c.width=TW;c.height=TH;
  document.getElementById('canvasInfo').textContent=`${TW} × ${TH}px`;
  typo_fitCanvas();typo_render();
  updateSafeZone();
  // Sync export preset to match canvas size
  if(typeof PLATFORMS_DEF!=='undefined'&&typeof EX!=='undefined'){
    const match=PLATFORMS_DEF.find(p=>p.canvasVal===v);
    if(match){EX.platform=match.id;}
    if(typeof buildPlatformGrid==='function')buildPlatformGrid();
  }
}

/* ── Tab switching ── */
/* ════════════════════════════════════════════
   PANEL MODE — BG vs Layers
════════════════════════════════════════════ */
let currentPanelMode = 'bg';
let activeLayerId = 'l1';
let soloedLayerId = null;
let _imgUploadTargetLid = null; // which layer the file input is targeting

/* ── Layer ID helpers ── */
function lidToIdx(lid) { return parseInt(lid.slice(1)) - 1; }

function ensureLayerPane(lid) {
  if (!document.getElementById(`pane-${lid}`)) {
    const pane = document.createElement('div');
    pane.className = 'tab-pane';
    pane.id = `pane-${lid}`;
    document.getElementById('panel-body').appendChild(pane);
  }
}

function toggleAddLayerPicker() {
  const picker = document.getElementById('layerAddPicker');
  if (picker) picker.classList.toggle('open');
}

function addLayer(type) {
  const MAX_LAYERS = 6;
  if (T.layers.length >= MAX_LAYERS) { toast('Maximum 6 layers'); return; }
  const layer = type === 'image'
    ? defImageLayer(50, 50)
    : type === 'eye'
      ? defEyeLayer(50, 50)
      : defLayer('New Text', '#ffffff', 60, 50, 50, 'Roboto Flex');
  T.layers.push(layer);
  const lid = `l${T.layers.length}`;
  ensureLayerPane(lid);
  buildLayerPane(lid);
  buildLayerStack();
  selectLayer(lid);
  // Close picker
  const picker = document.getElementById('layerAddPicker');
  if (picker) picker.classList.remove('open');
  // If image type, immediately trigger upload
  if (type === 'image') {
    _imgUploadTargetLid = lid;
    document.getElementById('imgLayerFileInput').click();
  }
}

function removeLayer(lid) {
  if (T.layers.length <= 1) { toast('At least one layer required'); return; }
  const idx = lidToIdx(lid);
  T.layers.splice(idx, 1);
  // Remove pane from DOM (for l2+)
  const pane = document.getElementById(`pane-${lid}`);
  if (pane) pane.remove();
  // Renumber remaining panes (need to rebuild all panes after the removed one)
  // Actually since IDs are positional, all layers after the removed one shift.
  // Simplest: remove all dynamic panes (l2+) and rebuild.
  for (let i = 2; i <= 6; i++) {
    const p = document.getElementById(`pane-l${i}`);
    if (p) p.remove();
  }
  T.layers.forEach((layer, i) => {
    const nlid = `l${i + 1}`;
    if (i >= 1) ensureLayerPane(nlid);
    buildLayerPane(nlid);
  });
  // Select a valid layer
  const newActive = `l${Math.min(lidToIdx(activeLayerId), T.layers.length - 1) + 1}`;
  activeLayerId = newActive;
  if (soloedLayerId && !T.layers[lidToIdx(soloedLayerId)]) soloedLayerId = null;
  buildLayerStack();
  selectLayer(newActive);
  typo_render();
}

function moveLayer(lid, dir) {
  const idx = lidToIdx(lid);
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= T.layers.length) return;
  [T.layers[idx], T.layers[newIdx]] = [T.layers[newIdx], T.layers[idx]];
  for (let i = 2; i <= 6; i++) { const p = document.getElementById(`pane-l${i}`); if (p) p.remove(); }
  T.layers.forEach((layer, i) => { const nlid = `l${i+1}`; if (i >= 1) ensureLayerPane(nlid); buildLayerPane(nlid); });
  const newLid = `l${newIdx + 1}`;
  activeLayerId = newLid;
  buildLayerStack(); selectLayer(newLid); typo_render();
}

const imgDistNames = ['normal','wave','stagger','explode','glitch','mirror'];
function toggleImgDist(lid, idx, d) {
  const layer = T.layers[idx];
  if (!layer.dists) layer.dists = ['normal'];
  const pos = layer.dists.indexOf(d);
  if (pos >= 0) {
    if (layer.dists.length > 1) layer.dists.splice(pos, 1);
    else layer.dists = ['normal'];
  } else {
    if (d === 'normal') { layer.dists = ['normal']; }
    else {
      const ni = layer.dists.indexOf('normal');
      if (ni >= 0) layer.dists.splice(ni, 1);
      layer.dists.push(d);
    }
  }
  const grid = document.getElementById(`${lid}-dist-grid`);
  if (grid) {
    const dNow = layer.dists;
    grid.querySelectorAll('.dist-btn').forEach((btn, i) => {
      btn.classList.toggle('active', dNow.includes(imgDistNames[i]));
    });
  }
  const dsEl = document.getElementById(`${lid}-dist-controls`);
  if (dsEl) dsEl.innerHTML = buildDistControls(lid, layer);
  typo_render();
}

function uploadLayerImage(file) {
  const lid = _imgUploadTargetLid;
  if (!file || !lid) return;
  if (file.size > 2 * 1024 * 1024) { toast('Image must be under 2MB'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    const idx = lidToIdx(lid);
    const img = new Image();
    img.onload = () => {
      T.layers[idx].imgSrc = e.target.result;
      T.layers[idx].img = img;
      buildLayerPane(lid);
      buildLayerStack();
      typo_render();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
  // Reset input so same file can be re-selected
  document.getElementById('imgLayerFileInput').value = '';
}

function switchPanelMode(mode, btn) {
  currentPanelMode = mode;
  document.querySelectorAll('.panel-mode-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const stack = document.getElementById('layer-stack');
  const body = document.getElementById('panel-body');

  if (mode === 'bg') {
    stack.style.display = 'none';
    // Show BG pane, hide layer panes
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.getElementById('pane-bg').classList.add('active');
    body.style.display = 'block';
  } else {
    stack.style.display = 'block';
    // Show active layer pane
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    document.getElementById(`pane-${activeLayerId}`).classList.add('active');
    body.style.display = 'block';
    buildLayerStack();
  }
}

// Legacy compat — called by quickFX bg tab switch
function switchTab(tab, btn) {
  if (tab === 'bg') {
    const bgModeBtn = document.querySelector('.panel-mode-tab.mode-bg');
    if (bgModeBtn) switchPanelMode('bg', bgModeBtn);
  } else {
    const layersModeBtn = document.querySelector('.panel-mode-tab.mode-layers');
    if (layersModeBtn) switchPanelMode('layers', layersModeBtn);
    selectLayer(tab);
  }
}

function selectLayer(lid) {
  activeLayerId = lid;
  ensureLayerPane(lid);
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.getElementById(`pane-${lid}`).classList.add('active');
  document.querySelectorAll('.layer-row').forEach(r => {
    r.classList.toggle('active-layer', r.dataset.lid === lid);
  });
}

function toggleLayerVisible(lid, e) {
  e.stopPropagation();
  const idx = lidToIdx(lid);
  T.layers[idx].visible = !T.layers[idx].visible;
  const row = document.querySelector(`.layer-row[data-lid="${lid}"]`);
  if (row) {
    row.classList.toggle('layer-hidden', !T.layers[idx].visible);
    const eye = row.querySelector('.layer-eye');
    if (eye) eye.textContent = T.layers[idx].visible ? '👁' : '🚫';
  }
  updateLayerVisCount();
  typo_render();
}

function toggleSolo(lid, e) {
  e.stopPropagation();
  if (soloedLayerId === lid) {
    soloedLayerId = null;
    T.layers.forEach(l => l.visible = true);
  } else {
    soloedLayerId = lid;
    const idx = lidToIdx(lid);
    T.layers.forEach((l, i) => l.visible = i === idx);
  }
  buildLayerStack();
  typo_render();
}

function setAllLayersVisible(vis) {
  soloedLayerId = null;
  T.layers.forEach(l => l.visible = vis);
  buildLayerStack();
  typo_render();
}

function updateLayerVisCount() {
  const vis = T.layers.filter(l => l.visible).length;
  const el = document.getElementById('layerVisCount');
  if (el) el.textContent = `${vis} of ${T.layers.length} visible`;
}

function buildLayerStack() {
  const LAYER_COLORS = ['#e5007d', '#4a9fff', '#00c896', '#d4af37', '#9b59b6', '#e67e22'];
  const FONT_SHORT   = { 'Roboto Flex': 'Flex', 'Fraunces': 'Fraunces' };

  const stack = document.getElementById('layer-stack');
  stack.querySelectorAll('.layer-row').forEach(r => r.remove());
  const footer = document.getElementById('layer-stack-footer');
  const picker = document.getElementById('layerAddPicker');

  T.layers.forEach((layer, i) => {
    const lid = `l${i + 1}`;
    const color = LAYER_COLORS[i % LAYER_COLORS.length];
    const name = `L${i + 1}`;
    const isHidden = !layer.visible;
    const isSoloed = soloedLayerId === lid;
    const isImg = layer.type === 'image';
    const isEye = layer.type === 'eye';
    const typeBadge = isImg ? 'IMG' : isEye ? '◉' : 'T';
    const aboveFX = !!layer.excludeFromFX;
    const textPrev = isImg
      ? (layer.imgSrc ? '📷 image' : '📷 no image')
      : isEye
        ? `${layer.arrangement||'single'} · ${layer.eyeSize||100}px`
        : (layer.text.replace(/\n/g, ' ').slice(0, 24) + (layer.text.length > 24 ? '…' : '')) || '—';
    const fontShort = (isImg || isEye) ? '' : (FONT_SHORT[layer.font] || layer.font);
    const opPct = Math.round(layer.opacity);
    const canDelete = T.layers.length > 1;
    const canMoveUp = i > 0;
    const canMoveDown = i < T.layers.length - 1;

    const row = document.createElement('div');
    row.className = `layer-row${isHidden ? ' layer-hidden' : ''}${activeLayerId === lid ? ' active-layer' : ''}`;
    row.dataset.lid = lid;
    row.onclick = () => {
      selectLayer(lid);
      if (currentPanelMode !== 'layers') {
        const layersModeBtn = document.querySelector('.panel-mode-tab.mode-layers');
        if (layersModeBtn) switchPanelMode('layers', layersModeBtn);
      }
    };

    row.innerHTML = `
      <div class="layer-eye" title="${isHidden ? 'Show' : 'Hide'}" onclick="toggleLayerVisible('${lid}',event)">
        ${isHidden ? '🚫' : '👁'}
      </div>
      <div style="width:3px;height:24px;background:${color};border-radius:2px;flex-shrink:0;opacity:${isHidden?'0.2':'0.7'};"></div>
      <div class="layer-body">
        <div class="layer-body-top">
          <span class="layer-name-badge" style="color:${isHidden?'rgba(255,255,255,.15)':color};">${name}</span>
          <span class="layer-type-badge">${typeBadge}</span>
          <span class="layer-text-preview">${textPrev}</span>
        </div>
        <div class="layer-body-meta">
          ${fontShort ? `<span class="layer-font-badge">${fontShort}</span>` : ''}
          ${aboveFX ? `<span class="layer-font-badge" style="color:#e5007d;border-color:rgba(229,0,125,.3);">↑FX</span>` : ''}
          <div class="layer-op-bar">
            <div class="layer-op-bar-fill" style="width:${opPct}%;background:${color};"></div>
          </div>
          <span style="font-size:11px;color:rgba(255,255,255,.2);width:22px;text-align:right;flex-shrink:0;">${opPct}%</span>
        </div>
      </div>
      <div class="layer-solo${isSoloed ? ' soloed' : ''}" title="Solo" onclick="toggleSolo('${lid}',event)">S</div>
      <div class="layer-move-btns">
        <div class="layer-move-btn" title="Move up" onclick="moveLayer('${lid}',-1);event.stopPropagation();" style="${canMoveUp?'':'opacity:.15;pointer-events:none'}">▲</div>
        <div class="layer-move-btn" title="Move down" onclick="moveLayer('${lid}',1);event.stopPropagation();" style="${canMoveDown?'':'opacity:.15;pointer-events:none'}">▼</div>
      </div>
      ${canDelete ? `<div class="layer-del-btn" title="Remove layer" onclick="removeLayer('${lid}');event.stopPropagation();">×</div>` : ''}`;

    stack.insertBefore(row, picker || footer);
  });

  updateLayerVisCount();
}

/* ── BG / Accent / KC ── */
function setBG(dot){
  document.querySelectorAll('#bg-colors .cdot').forEach(d=>d.classList.remove('active'));
  dot.classList.add('active');T.bg=dot.dataset.c;typo_render();
}
function setBGTex(el){
  document.querySelectorAll('#bgTexOpts .bg-opt').forEach(e=>e.classList.remove('active'));
  el.classList.add('active');T.bgTex=el.dataset.tex;typo_render();
}
function setGrad(el,v){
  document.querySelectorAll('#gradTypeOpts .bg-opt').forEach(e=>e.classList.remove('active'));
  el.classList.add('active');T.grad=v;
  const br=document.getElementById('gradBlobsRow');if(br)br.style.display=v==='mesh'?'flex':'none';
  document.querySelectorAll('.mesh-only').forEach(e=>e.style.display=v==='mesh'?'flex':'none');
  updateGradPreviewStrip();typo_render();
}
function setGrainStyle(el,v){
  document.querySelectorAll('#grainStyleOpts .bg-opt').forEach(e=>e.classList.remove('active'));
  el.classList.add('active');T.grainStyle=v;_grainCanvas=null;
  const gcp=document.getElementById('grainColorPaletteRow');if(gcp)gcp.style.display=v==='color'?'flex':'none';
  typo_render();
}
function setAccent(el,v){
  document.querySelectorAll('#accentOpts .bg-opt').forEach(e=>e.classList.remove('active'));
  el.classList.add('active');T.accent=v;typo_render();
}
function setKC(el,v){
  document.querySelectorAll('#kcOpts .bg-opt').forEach(e=>e.classList.remove('active'));
  el.classList.add('active');T.kc=v;typo_render();
}
function setLogoVariant(el,v){
  document.querySelectorAll('#logoVariantOpts .bg-opt').forEach(e=>e.classList.remove('active'));
  el.classList.add('active');T.logo=v;
  const ctrl=document.getElementById('logoControls');
  if(ctrl)ctrl.style.display=v==='none'?'none':'flex';
  typo_render();
}
function setLogoDock(el,v){
  document.querySelectorAll('#logoDockOpts .bg-opt').forEach(e=>e.classList.remove('active'));
  el.classList.add('active');T.logoDock=v;typo_render();
}
function selCtrl(btn,groupId){
  if(!btn||!groupId)return;
  const g=document.getElementById(groupId);if(!g)return;
  g.querySelectorAll('.seg-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
}

/* ── Animation ── */
function typo_setAnim(on,btn){
  document.querySelectorAll('.tb-toggle button').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');T.animating=on;
  if(on){if(animId)cancelAnimationFrame(animId);(function loop(){T.frame++;typo_render();if(T.animating)animId=requestAnimationFrame(loop);})();}
  else{if(animId){cancelAnimationFrame(animId);animId=null;}typo_render();}
}

/* ── Shuffle & Chaos ── */
function typo_shuffle(){
  const fonts=['Roboto Flex','Fraunces'];
  const dists=['normal','wave','stagger','explode','arch','tile','mirror','glitch'];
  const bgs=['#080808','#0a0e1a','#1a0010','#0f1a0a','#f4f1ea','#1a1a0a'];
  const blends=['source-over','source-over','multiply','screen','overlay'];
  T.bg=R.p(bgs);T.bgTex=R.p(['none','none','grid','dot','diagonal']);
  T.accent=R.p(['none','bar-top','bar-bottom','corners','rule','dot','none']);
  T.layers.forEach((layer,i)=>{
    if(layer.type==='image'){layer.x=R.f(10,90);layer.y=R.f(20,85);return;}
    if(layer.type==='eye'){layer.x=R.f(20,80);layer.y=R.f(20,80);layer.rot=R.f(-15,15);layer.irisColor=R.p([PALETTE.magenta,PALETTE.primary,PALETTE.h1,PALETTE.h2]);return;}
    layer.font=R.p(fonts);
    layer.text=R.p(R.p([COPY.display,COPY.editorial,COPY.utility]));
    layer.size=R.i(i===0?80:i===1?18:11, i===0?280:i===1?72:26);
    layer.x=R.f(10,90);layer.y=R.f(20,85);layer.rot=R.f(-12,12);
    layer.sx=R.f(70,180);layer.sy=R.f(75,160);layer.ls=R.f(-2,28);
    layer.opacity=i===0?100:R.i(30,100);
    layer.dists=i===0?[R.p(dists)]:R.p([['normal'],['normal'],['wave'],['stagger'],['wave','glitch'],['normal','glitch']]);
    layer.distAmt=R.i(20,75);layer.distSpd=R.i(1,6);layer.blend=R.p(blends);
    layer.visible=true;layer.style=R.p(['normal','normal','italic']);layer.bold=Math.random()>.7;
    ['wave','stagger','explode','arch','tile','mirror','glitch'].forEach(d=>{if(layer.distSettings?.[d])layer.distSettings[d].spd=R.i(1,6);});
    ['Wght','Width','Skew','Soft','Wonk'].forEach(a=>{layer[`var${a}Spd`]=R.f(0.5,6);});
    layer.color=i===0?'#ffffff':i===1?'#e5007d':`hsl(${R.i(0,360)},${R.i(50,100)}%,${R.i(55,80)}%)`;
  });
  syncLayerUI();typo_render();toast('Composition shuffled');
}
function typo_chaos(){
  const chaosDistCombos=[['wave'],['stagger'],['explode'],['arch'],['glitch'],['mirror'],['wave','glitch'],['stagger','glitch'],['wave','mirror'],['explode','glitch'],['wave','stagger'],['arch','glitch'],['stagger','mirror'],['wave','stagger','glitch']];
  const blends=['multiply','screen','overlay','difference','color-dodge'];
  T.layers.forEach(l=>{if(l.type==='eye'){l.rot=R.f(-40,40);l.sx=R.f(50,200);l.sy=R.f(50,200);l.blend=Math.random()>.4?R.p(blends):'source-over';return;}l.dists=R.p(chaosDistCombos);l.distAmt=R.i(60,100);l.distSpd=R.i(1,6);l.rot=R.f(-40,40);l.sx=R.f(20,380);l.sy=R.f(20,380);l.blend=Math.random()>.4?R.p(blends):'source-over';l.ls=R.f(5,60);['wave','stagger','explode','arch','tile','mirror','glitch'].forEach(d=>{if(l.distSettings?.[d])l.distSettings[d].spd=R.i(1,6);});['Wght','Width','Skew','Soft','Wonk'].forEach(a=>{l[`var${a}Spd`]=R.f(0.5,6);});});
  T.animating=true;document.getElementById('animOn').classList.add('active');document.getElementById('animOff').classList.remove('active');
  typo_setAnim(true,document.getElementById('animOn'));
  syncLayerUI();toast('⚡ Chaos — hit Live to animate');
}
function syncLayerUI(){
  T.layers.forEach((layer,i)=>{
    const lid=`l${i+1}`;
    const get=id=>document.getElementById(id);
    const set=(id,v,u)=>{const el=get(id);if(el)el.value=v;const vl=get(id+'Val');if(vl)vl.textContent=v+u;};
    set(`${lid}-x`,Math.round(layer.x),'%');set(`${lid}-y`,Math.round(layer.y),'%');
    set(`${lid}-op`,Math.round(layer.opacity),'%');
    if(layer.type==='eye'){set(`${lid}-eyeSize`,layer.eyeSize||100,'');set(`${lid}-rot`,Math.round(layer.rot||0),'°');set(`${lid}-sx`,Math.round(layer.sx??100),'%');set(`${lid}-sy`,Math.round(layer.sy??100),'%');}
    if(layer.type!=='image'&&layer.type!=='eye'){
      set(`${lid}-size`,Math.round(layer.size),'px');
      set(`${lid}-sx`,Math.round(layer.sx),'%');set(`${lid}-sy`,Math.round(layer.sy),'%');
      set(`${lid}-rot`,Math.round(layer.rot),'°');
      set(`${lid}-ls`,Math.round(layer.ls),'');
      const ta=get(`${lid}-text`);if(ta)ta.value=layer.text;
      const dsEl=get(`${lid}-dist-settings`);if(dsEl)dsEl.innerHTML=buildDistControls(lid,layer);
    }
  });
  if(currentPanelMode==='layers') buildLayerStack();
}

function typo_resetLayer(){
  const lid = activeLayerId;
  if(!lid || lid==='bg') return;
  const idx=lidToIdx(lid);
  const layer=T.layers[idx];
  if(!layer)return;
  if(layer.type==='image'){
    T.layers[idx]=defImageLayer(50,50);
  }else if(layer.type==='eye'){
    T.layers[idx]=defEyeLayer(50,50);
  }else{
    T.layers[idx]=defLayer('Text','#ffffff',80,50,50,'Roboto Flex');
  }
  buildLayerPane(lid);syncLayerUI();typo_render();toast(`Layer ${idx+1} reset`);
}
function typo_reset(){
  T.bg='#080808';T.bgTex='none';T.texOp=12;T.accent='none';T.kc='none';T.glow=0;
  T.grad='none';T.gradC1='#e5007d';T.gradC2='#002fa7';T.gradC3='#8800cc';T.gradC4='#ff6600';T.gradC5='#00c878';T.gradAngle=135;T.gradOpacity=80;T.gradMid=50;T.gradGrain=0;T.gradBlobs=4;
  T.grain=0;T.grainSize=1;T.grainStyle='overlay';T.grainAnim=true;T.grainColor='#ec008c';
  const grAnimB=document.getElementById('grainAnimToggle');if(grAnimB){grAnimB.classList.add('on');grAnimB.textContent='Animated';}
  const gcpR=document.getElementById('grainColorPaletteRow');if(gcpR)gcpR.style.display='none';
  const gcSw=document.getElementById('grainColorSw');if(gcSw)gcSw.style.background='#ec008c';
  T.htMode='none';T.htBg=true;T.htSpacing=8;T.htAngle=45;_htBgSnap=null;
  const htBgB=document.getElementById('htBgToggle');if(htBgB){htBgB.classList.remove('on');htBgB.textContent='All';}
  T.logo='none';T.logoDock='tr';T.logoSize=28;T.logoOpacity=100;
  document.querySelectorAll('#logoVariantOpts .bg-opt').forEach(e=>e.classList.toggle('active',e.dataset.logo==='none'));
  document.querySelectorAll('#logoDockOpts .bg-opt').forEach(e=>e.classList.toggle('active',e.dataset.dock==='tr'));
  const lc=document.getElementById('logoControls');if(lc)lc.style.display='none';
  soloedLayerId = null;
  // Remove dynamic panes
  for(let i=2;i<=6;i++){const p=document.getElementById(`pane-l${i}`);if(p)p.remove();}
  T.layers=[defLayer('AIGA KC','#ffffff',160,50,50,'Roboto Flex')];
  buildLayerPane('l1');
  syncLayerUI();typo_render();toast('All layers reset');
  syncGradSlotsFromState();
}
function typo_download(){
  const c=document.getElementById('typeCanvas');
  const a=document.createElement('a');a.download='aigakc-composition.png';
  a.href=c.toDataURL('image/png');a.click();toast('PNG downloaded');
}

function typo_exportJSON(){
  const data=JSON.parse(JSON.stringify(T));
  delete data.frame;delete data.animating;
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.download='aigakc-composition.json';
  a.href=URL.createObjectURL(blob);
  a.click();URL.revokeObjectURL(a.href);
  toast('Composition saved as JSON');
}

function typo_importJSON(input){
  const file=input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    try{
      const data=JSON.parse(e.target.result);
      if(!data.layers||!Array.isArray(data.layers))throw new Error('Invalid');
      data.frame=0;data.animating=false;
      Object.assign(T,data);
      // Backfill image layer img objects from imgSrc
      T.layers.forEach(layer=>{
        if(!layer.type)layer.type='text';
        if(layer.type==='image'&&layer.imgSrc&&!layer.img){
          const img=new Image();img.src=layer.imgSrc;layer.img=img;
        }
        if(!layer.dists)layer.dists=[layer.dist||'normal'];
        if(!layer.varWghtPat)layer.varWghtPat='none';
        if(!layer.varWidthPat)layer.varWidthPat='none';
        if(!layer.varSkewPat)layer.varSkewPat='none';
        if(layer.varSpd==null)layer.varSpd=3;
        if(!layer.varSoftPat)layer.varSoftPat='none';
        if(layer.varSoftMin==null)layer.varSoftMin=0;
        if(layer.varSoftMax==null)layer.varSoftMax=100;
        if(!layer.varWonkPat)layer.varWonkPat='none';
        if(layer.varWonkMin==null)layer.varWonkMin=0;
        if(layer.varWonkMax==null)layer.varWonkMax=1;
        ['Wght','Width','Skew','Soft','Wonk'].forEach(a=>{
          if(layer[`var${a}Spd`]==null)layer[`var${a}Spd`]=3;
          if(!layer[`var${a}Ease`])layer[`var${a}Ease`]='linear';
        });
        if(layer.circleRings==null)layer.circleRings=1;
        if(!layer.circleOrient)layer.circleOrient='tangent';
        if(!layer.distSettings){
          const fb={amt:layer.distAmt||40,spd:layer.distSpd||30};
          layer.distSettings={wave:{...fb},stagger:{...fb},explode:{...fb},arch:{...fb},tile:{...fb},mirror:{...fb},glitch:{...fb},circle:{amt:35,spd:20}};
        }else if(!layer.distSettings.circle){
          layer.distSettings.circle={amt:35,spd:20};
        }
      });
      // Remove dynamic panes and rebuild
      for(let i=2;i<=6;i++){const p=document.getElementById(`pane-l${i}`);if(p)p.remove();}
      T.layers.forEach((_,i)=>{ const l=`l${i+1}`; ensureLayerPane(l); buildLayerPane(l); });
      syncLayerUI();
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
      updateGrainPaletteSwatches();
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
      updatePlaygroundPaletteSwatches();
      _grainCanvas=null;
      typo_render();
      input.value='';
      toast('Composition imported');
    }catch(err){toast('Could not import — invalid JSON');input.value='';}
  };
  reader.readAsText(file);
}
function typo_copy(){
  const c=document.getElementById('typeCanvas');
  c.toBlob(b=>{try{navigator.clipboard.write([new ClipboardItem({'image/png':b})]);toast('Copied to clipboard');}catch(e){toast('Use download instead');}});
}

/* ════════════════════════════════════════════
   TEMPLATES
════════════════════════════════════════════ */

const TEMPLATES = [];

let activeTplId = null;
let drawerOpen = false;

function toggleTplDrawer() {
  drawerOpen = !drawerOpen;
  const drawer = document.getElementById('tpl-drawer');
  const btn = document.getElementById('tplToggleBtn');
  drawer.classList.toggle('open', drawerOpen);
  btn.classList.toggle('mag', drawerOpen);
  btn.textContent = drawerOpen ? '✕ Close' : '☰ Templates';
}

function getUserTemplates() {
  try { return JSON.parse(localStorage.getItem('aigakc_userTemplates') || '[]'); } catch(e) { return []; }
}

function _persistUserTemplates(list) {
  localStorage.setItem('aigakc_userTemplates', JSON.stringify(list));
}

async function initUserTemplates() {
  try {
    const res = await fetch('./data/user-templates.json?t=' + Date.now());
    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list) && list.length) {
        localStorage.setItem('aigakc_userTemplates', JSON.stringify(list));
      }
    }
  } catch(e) { /* no file yet — use localStorage */ }
}

function _snapState() {
  const snap = JSON.parse(JSON.stringify(T));
  delete snap.frame; delete snap.animating;
  snap.layers.forEach(l => delete l.img);
  snap.canvas = `${TW},${TH}`;
  return snap;
}

function downloadTemplate() {
  const name = prompt('Template name:', 'My Design');
  if (!name || !name.trim()) return;
  const snap = _snapState();
  snap.name = name.trim();
  const slug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const blob = new Blob([JSON.stringify(snap, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `aigakc-${slug}.json`; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
  toast('Template downloaded');
}

function saveToMyTemplates(e) { if(e) e.stopPropagation();
  const name = prompt('Template name:', 'My Design');
  if (!name || !name.trim()) return;
  const snap    = _snapState();
  const localId = 'user-' + Date.now();
  const tpl = {
    ...snap,
    id: localId,
    name: name.trim(),
    cat: 'Saved',
    desc: `${TW}×${TH} · ${snap.layers.length} layer${snap.layers.length !== 1 ? 's' : ''}`,
    user: true,
  };
  const userTemplates = getUserTemplates();
  userTemplates.unshift(tpl);
  _persistUserTemplates(userTemplates);
  buildTplCards();
  toast(`Saved to My Templates: "${tpl.name}"`);
}

async function shareToCommunity() {
  const name = prompt('Template name:', 'My Design');
  if (!name || !name.trim()) return;
  const userName = prompt('Your name (optional):', '') ?? '';
  const snap = _snapState();
  try {
    await sbSaveTemplate(name.trim(), userName.trim(), snap);
    toast(`"${name.trim()}" shared to Community`);
    buildCommunityCards();
  } catch(e) {
    toast('Share failed — check console');
    console.warn('Share to community failed:', e);
  }
}

function deleteUserTemplate(id, e) {
  e.stopPropagation();
  const filtered = getUserTemplates().filter(t => t.id !== id);
  _persistUserTemplates(filtered);
  if (activeTplId === id) activeTplId = null;
  delete _tplThumbCache[id]; delete _tplThumbSource[id];
  buildTplCards();
  toast('Template deleted');
}

/* ── Template thumbnail rendering ─────────── */
const _tplThumbCache  = {}; // id → dataUrl
const _tplThumbSource = {}; // id → template data

function buildTplCards() {
  const grid = document.getElementById('tplGrid');
  const userTpls = getUserTemplates();

  function thumbCard(tpl, opts = {}) {
    const [cw, ch] = (tpl.canvas || '800,800').split(',').map(Number);
    const ratio = cw > ch ? '16:9' : cw < ch ? '9:16' : '1:1';
    const cat   = opts.cat   ?? 'Saved';
    const extra = opts.extra ?? '';
    _tplThumbSource[tpl.id] = tpl;
    return `<div class="tpl-card${activeTplId === tpl.id ? ' active-tpl' : ''}" onclick="applyTemplate('${tpl.id}')" data-tpl="${tpl.id}">
      ${extra}
      <div class="tpl-preview" style="background:${tpl.bg || '#111'};">
        <img class="tpl-thumb" data-thumb-id="${tpl.id}" alt="">
      </div>
      <div class="tpl-meta">
        <span class="tpl-name">${tpl.name}</span>
        <span class="tpl-desc">${tpl.desc || ''}</span>
        <span class="tpl-cat">${cat} · ${ratio}</span>
      </div>
    </div>`;
  }

  let html = '';
  if (userTpls.length > 0) {
    const deleteBtn = (id) => `<button class="tpl-user-delete" onclick="deleteUserTemplate('${id}',event)" title="Delete">✕</button>`;
    html += `<div class="tpl-section-label">Saved</div>` +
      userTpls.map(t => thumbCard(t, { cat: 'Saved', extra: deleteBtn(t.id) })).join('');
  }
  grid.innerHTML = html;
  _scheduleThumbRender(grid);
}

function _scheduleThumbRender(gridEl) {
  const imgs = Array.from((gridEl || document).querySelectorAll('.tpl-thumb[data-thumb-id]'));
  let i = 0;
  function next() {
    if (i >= imgs.length) return;
    const img = imgs[i++];
    const id  = img.dataset.thumbId;
    if (_tplThumbCache[id]) {
      img.src = _tplThumbCache[id];
      img.classList.add('loaded');
      next();
    } else {
      setTimeout(() => {
        const data = _tplThumbSource[id];
        if (data) {
          const url = renderTplThumb(data, 240, 150);
          _tplThumbCache[id] = url;
          img.src = url;
          img.classList.add('loaded');
        }
        next();
      }, 16); // one frame between renders to keep UI responsive
    }
  }
  next();
}

/* ── Community tab (Supabase) ─────────────── */
let _activeTplTab = 'local';

function switchTplTab(tab, btn) {
  _activeTplTab = tab;
  document.querySelectorAll('.tpl-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tplGrid').style.display          = tab === 'local'     ? '' : 'none';
  document.getElementById('tplCommunityGrid').style.display = tab === 'community' ? '' : 'none';
  const actionBtn = document.getElementById('tplActionBtn');
  if (tab === 'local') {
    actionBtn.textContent = '+ Save to My Templates';
    actionBtn.onclick     = saveToMyTemplates;
  } else {
    actionBtn.textContent = '↑ Share to Community';
    actionBtn.onclick     = shareToCommunity;
    buildCommunityCards();
  }
}

async function buildCommunityCards() {
  const grid   = document.getElementById('tplCommunityGrid');
  const status = document.getElementById('tplCommunityStatus');
  status.style.display = 'block';
  status.textContent   = 'Loading community templates…';
  try {
    const rows = await sbGetTemplates();
    if (!rows || rows.length === 0) {
      status.textContent = 'No community templates yet — be the first to save one!';
      return;
    }
    status.style.display = 'none';
    const cards = rows.map(row => {
      const d    = row.data || {};
      const bg   = d.bg || '#111';
      const thumbId = 'comm-' + row.id;
      const date = new Date(row.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric'});
      const by   = row.user_name ? `by ${row.user_name}` : '';
      _tplThumbSource[thumbId] = d;
      return `<div class="tpl-card" onclick="applyCommunityTemplate('${row.id}')">
        <div class="tpl-preview" style="background:${bg};">
          <img class="tpl-thumb" data-thumb-id="${thumbId}" alt="">
        </div>
        <div class="tpl-meta">
          <span class="tpl-name">${row.name}</span>
          <span class="tpl-desc">${by}</span>
          <span class="tpl-cat">${date}</span>
        </div>
      </div>`;
    });
    grid.innerHTML = `<div id="tplCommunityStatus" style="display:none;"></div>` + cards.join('');
    _scheduleThumbRender(grid);
  } catch(e) {
    status.textContent = 'Could not load community templates. Check Supabase config.';
    console.error(e);
  }
}

async function applyCommunityTemplate(id) {
  try {
    const row = await sbGetTemplate(id);
    if (!row) return;
    const data = row.data;
    if (!data || !data.layers) return;
    data.frame = 0; data.animating = false;
    Object.assign(T, data);
    // Backfill canvas
    const canvas = document.getElementById('typeCanvas');
    if (data.canvas) {
      [TW, TH] = data.canvas.split(',').map(Number);
      canvas.width = TW; canvas.height = TH;
      const sel = document.getElementById('canvasSize');
      [...sel.options].forEach(o => { if (o.value === data.canvas) o.selected = true; });
    }
    syncLayerUI(); typo_render(); typo_fitCanvas();
    toast('Community template applied');
  } catch(e) {
    toast('Failed to load template'); console.error(e);
  }
}

function applyTemplate(id) {
  const tpl = getUserTemplates().find(t => t.id === id);
  if (!tpl) return;

  activeTplId = id;

  // Apply canvas size
  const sel = document.getElementById('canvasSize');
  [...sel.options].forEach(o => { if (o.value === tpl.canvas) o.selected = true; });
  [TW, TH] = tpl.canvas.split(',').map(Number);
  const canvas = document.getElementById('typeCanvas');
  canvas.width = TW; canvas.height = TH;
  document.getElementById('canvasInfo').textContent = `${TW} × ${TH}px`;

  // Apply global state
  T.bg = tpl.bg;
  T.bgTex = tpl.bgTex;
  T.texOp = tpl.texOp;
  T.accent = tpl.accent;
  T.kc = tpl.kc;
  T.glow = tpl.glow;
  // Gradient
  T.grad = tpl.grad ?? 'none';
  T.gradC1 = tpl.gradC1 ?? '#e5007d';
  T.gradC2 = tpl.gradC2 ?? '#002fa7';
  T.gradC3 = tpl.gradC3 ?? '#8800cc';
  T.gradAngle = tpl.gradAngle ?? 135;
  T.gradOpacity = tpl.gradOpacity ?? 80;
  T.gradMid = tpl.gradMid ?? 50;
  T.gradGrain = tpl.gradGrain ?? 0;
  T.gradBlobs = tpl.gradBlobs ?? 4;
  _gradGrainC = null;
  // Grain
  T.grain = tpl.grain ?? 0;
  T.grainSize = tpl.grainSize ?? 1;
  T.grainStyle = tpl.grainStyle ?? 'overlay';
  T.grainColor = tpl.grainColor ?? '#ec008c';
  _grainCanvas = null; // reset grain cache
  _gradOC = null; _gradGrainC = null; // reset gradient caches

  // Deep-copy layers
  T.layers = tpl.layers.map(l => ({...l}));

  // Sync all UI
  syncLayerUI();

  // Sync right panel overlays
  document.querySelectorAll('#accentOpts .bg-opt').forEach(el => {
    el.classList.toggle('active', el.dataset.a === tpl.accent);
  });
  document.querySelectorAll('#kcOpts .bg-opt').forEach(el => {
    el.classList.toggle('active', el.dataset.kc === tpl.kc);
  });

  // Sync bg texture
  document.querySelectorAll('#bgTexOpts .bg-opt').forEach(el => {
    el.classList.toggle('active', el.dataset.tex === tpl.bgTex);
  });

  // Sync gradient UI
  document.querySelectorAll('#gradTypeOpts .bg-opt').forEach(el => {
    el.classList.toggle('active', el.dataset.g === T.grad);
  });
  const gc1El = document.getElementById('gradC1'); if(gc1El) gc1El.value = T.gradC1;
  const gc2El = document.getElementById('gradC2'); if(gc2El) gc2El.value = T.gradC2;
  const gc3El = document.getElementById('gradC3'); if(gc3El) gc3El.value = T.gradC3||'#8800cc';
  const gaEl = document.getElementById('gradAngle'); if(gaEl){ gaEl.value = T.gradAngle; document.getElementById('gradAngleVal').textContent = T.gradAngle + '°'; }
  const gopEl = document.getElementById('gradOpacity'); if(gopEl){ gopEl.value = T.gradOpacity; document.getElementById('gradOpacityVal').textContent = T.gradOpacity + '%'; }
  const gmEl = document.getElementById('gradMid'); if(gmEl){ gmEl.value = T.gradMid??50; document.getElementById('gradMidVal').textContent = (T.gradMid??50) + '%'; }
  const ggEl = document.getElementById('gradGrain'); if(ggEl){ ggEl.value = T.gradGrain??0; document.getElementById('gradGrainVal').textContent = (T.gradGrain??0) + '%'; }
  const gbEl = document.getElementById('gradBlobs'); if(gbEl){ gbEl.value = T.gradBlobs??4; document.getElementById('gradBlobsVal').textContent = T.gradBlobs??4; }
  const gbr = document.getElementById('gradBlobsRow'); if(gbr) gbr.style.display = T.grad==='mesh' ? 'flex' : 'none';

  // Sync gradient slot UI
  syncGradSlotsFromState();

  // Sync grain UI
  const grAmtEl = document.getElementById('grainAmount'); if(grAmtEl){ grAmtEl.value = T.grain; document.getElementById('grainVal').textContent = T.grain + '%'; }
  const grSzEl = document.getElementById('grainSize'); if(grSzEl){ grSzEl.value = T.grainSize; document.getElementById('grainSizeVal').textContent = T.grainSize + '×'; }
  document.querySelectorAll('#grainStyleOpts .bg-opt').forEach(el => {
    el.classList.toggle('active', el.dataset.gs === T.grainStyle);
  });

  // Sync glow
  const glEl = document.querySelector('[oninput*="T.glow"]'); if(glEl){ glEl.value = T.glow; document.getElementById('glowVal').textContent = T.glow + '%'; }

  // Mark cards
  document.querySelectorAll('.tpl-card').forEach(c => {
    c.classList.toggle('active-tpl', c.dataset.tpl === id);
  });

  // Remove dynamic panes and rebuild for all layers in template
  for(let i=2;i<=6;i++){const p=document.getElementById(`pane-l${i}`);if(p)p.remove();}
  T.layers.forEach((_,i)=>{ const l=`l${i+1}`; ensureLayerPane(l); buildLayerPane(l); });
  updatePlaygroundPaletteSwatches();
  soloedLayerId = null;
  if (currentPanelMode === 'layers') buildLayerStack();
  // Switch to Layers mode to show the template visually
  const layersBtn = document.querySelector('.panel-mode-tab.mode-layers');
  if (layersBtn) switchPanelMode('layers', layersBtn);
  selectLayer('l1');

  typo_fitCanvas();
  typo_render();
  toggleTplDrawer();
  toast(`Template loaded: ${tpl.name}`);
}

/* ════════════════════════════════════════════
   SCROLLSPY
════════════════════════════════════════════ */
