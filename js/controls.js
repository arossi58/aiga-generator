function typo_resize(){
  const v=document.getElementById('canvasSize').value;
  [TW,TH]=v.split(',').map(Number);
  const c=document.getElementById('typeCanvas');c.width=TW;c.height=TH;
  document.getElementById('canvasInfo').textContent=`${TW} × ${TH}px`;
  typo_fitCanvas();typo_render();
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
  const FONT_SHORT   = { 'Roboto Flex': 'Flex', 'Fraunces': 'Fraunces', 'DM Mono': 'Mono', 'Recursive': 'Recursive' };

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
    const typeBadge = isImg ? 'IMG' : 'T';
    const textPrev = isImg
      ? (layer.imgSrc ? '📷 image' : '📷 no image')
      : (layer.text.replace(/\n/g, ' ').slice(0, 24) + (layer.text.length > 24 ? '…' : '')) || '—';
    const fontShort = isImg ? '' : (FONT_SHORT[layer.font] || layer.font);
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
          <div class="layer-op-bar">
            <div class="layer-op-bar-fill" style="width:${opPct}%;background:${color};"></div>
          </div>
          <span style="font-size:7px;color:rgba(255,255,255,.2);width:22px;text-align:right;flex-shrink:0;">${opPct}%</span>
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
  const fonts=['Roboto Flex','Fraunces','DM Mono'];
  const dists=['normal','wave','stagger','explode','arch','tile','mirror','glitch'];
  const bgs=['#080808','#0a0e1a','#1a0010','#0f1a0a','#f4f1ea','#1a1a0a'];
  const blends=['source-over','source-over','multiply','screen','overlay'];
  T.bg=R.p(bgs);T.bgTex=R.p(['none','none','grid','dot','diagonal']);
  T.accent=R.p(['none','bar-top','bar-bottom','corners','rule','dot','none']);
  T.layers.forEach((layer,i)=>{
    if(layer.type==='image'){layer.x=R.f(10,90);layer.y=R.f(20,85);return;}
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
  T.layers.forEach(l=>{l.dists=R.p(chaosDistCombos);l.distAmt=R.i(60,100);l.distSpd=R.i(1,6);l.rot=R.f(-40,40);l.sx=R.f(20,380);l.sy=R.f(20,380);l.blend=Math.random()>.4?R.p(blends):'source-over';l.ls=R.f(5,60);['wave','stagger','explode','arch','tile','mirror','glitch'].forEach(d=>{if(l.distSettings?.[d])l.distSettings[d].spd=R.i(1,6);});['Wght','Width','Skew','Soft','Wonk'].forEach(a=>{l[`var${a}Spd`]=R.f(0.5,6);});});
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
    if(layer.type!=='image'){
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

const TEMPLATES = [
  {
    id: 'event-poster',
    name: 'Event Poster',
    cat: 'Event',
    desc: 'Bold headline with date & URL',
    canvas: '800,1000',
    bg: '#080808', bgTex: 'none', texOp: 12,
    accent: 'bar-top', kc: 'tr', glow: 18,
    preview: {
      bg: '#080808', barTop: true, corners: false,
      eyebrow: { text: 'AIGA KC', color: '#e5007d', size: 9 },
      h1: { text: 'PORTFOLIO\nREVIEW\nDAY', color: '#ffffff', size: 38, font: 'Roboto Flex' },
      sub: { text: 'kc.aiga.org', color: 'rgba(255,255,255,0.4)', size: 7 },
    },
    layers: [
      { text: 'PORTFOLIO\nREVIEW\nDAY', color: '#ffffff', size: 210, x: 50, y: 40,
        font: 'Roboto Flex', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 2, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
      { text: 'April 12, 2025', color: '#e5007d', size: 28, x: 50, y: 72,
        font: 'DM Mono', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 8, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
      { text: 'kc.aiga.org', color: 'rgba(255,255,255,0.35)', size: 16, x: 50, y: 90,
        font: 'DM Mono', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 14, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
    ],
  },
  {
    id: 'social-square',
    name: 'Social Square',
    cat: 'Social',
    desc: 'Instagram-ready 1:1 announcement',
    canvas: '800,800',
    bg: '#e5007d', bgTex: 'grid', texOp: 10,
    accent: 'corners', kc: 'tr', glow: 0,
    preview: {
      bg: '#e5007d', barTop: false, corners: true,
      eyebrow: { text: 'SAVE THE DATE', color: '#ffffff', size: 7 },
      h1: { text: 'GALA\n2025', color: '#ffffff', size: 40, font: 'Roboto Flex' },
      sub: { text: 'Annual Design Awards', color: 'rgba(255,255,255,0.65)', size: 7 },
    },
    layers: [
      { text: 'GALA\n2025', color: '#ffffff', size: 220, x: 50, y: 46,
        font: 'Roboto Flex', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 3, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
      { text: 'Annual Design Awards', color: 'rgba(255,255,255,0.75)', size: 24, x: 50, y: 74,
        font: 'Fraunces', style: 'italic', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 2, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
      { text: 'AIGA KC', color: 'rgba(255,255,255,0.22)', size: 18, x: 50, y: 87,
        font: 'DM Mono', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 22, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
    ],
  },
  {
    id: 'editorial',
    name: 'Editorial',
    cat: 'Brand',
    desc: 'Serif quote with structural rules',
    canvas: '1200,630',
    bg: '#f4f1ea', bgTex: 'none', texOp: 12,
    accent: 'rule', kc: 'none', glow: 0,
    preview: {
      bg: '#f4f1ea', barTop: false, corners: false, light: true,
      eyebrow: { text: 'AIGA KC', color: '#e5007d', size: 7 },
      h1: { text: '"Build.\nConnect.\nFlourish."', color: '#080808', size: 22, font: 'Fraunces' },
      sub: { text: 'kc.aiga.org', color: 'rgba(0,0,0,0.35)', size: 7 },
    },
    layers: [
      { text: '"Build.\nConnect.\nFlourish."', color: '#080808', size: 120, x: 50, y: 46,
        font: 'Fraunces', style: 'italic', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 0, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
      { text: 'Kansas City\'s Design Community', color: 'rgba(0,0,0,0.45)', size: 18, x: 50, y: 79,
        font: 'DM Mono', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 10, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
      { text: 'AIGA KC', color: '#e5007d', size: 16, x: 50, y: 88,
        font: 'DM Mono', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 26, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
    ],
  },
  {
    id: 'story-vertical',
    name: 'Story / Reel',
    cat: 'Social',
    desc: 'Full-bleed 9:16 for Stories & Reels',
    canvas: '630,1200',
    bg: '#0a0010', bgTex: 'dot', texOp: 14,
    accent: 'bar-left', kc: 'bl', glow: 45,
    preview: {
      bg: '#0a0010', barTop: false, corners: false,
      eyebrow: { text: 'THIS WEEK', color: '#e5007d', size: 7 },
      h1: { text: 'COFFEE\nWITH\nCREATIVES', color: '#ffffff', size: 24, font: 'Roboto Flex' },
      sub: { text: 'Join us Thursday', color: 'rgba(255,255,255,0.5)', size: 7 },
    },
    layers: [
      { text: 'COFFEE\nWITH\nCREATIVES', color: '#ffffff', size: 160, x: 50, y: 42,
        font: 'Roboto Flex', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 2, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
      { text: '"Join us every Thursday\nfor good coffee and\nbetter conversation."', color: 'rgba(255,255,255,0.55)', size: 26, x: 50, y: 72,
        font: 'Fraunces', style: 'italic', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 0, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
      { text: 'kc.aiga.org', color: '#e5007d', size: 15, x: 50, y: 88,
        font: 'DM Mono', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 16, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
    ],
  },
  {
    id: 'stat-banner',
    name: 'Stat Banner',
    cat: 'Brand',
    desc: 'Big number + supporting copy',
    canvas: '1200,450',
    bg: '#080808', bgTex: 'diagonal', texOp: 7,
    accent: 'bar-bottom', kc: 'none', glow: 0,
    preview: {
      bg: '#080808', barTop: false, corners: false,
      eyebrow: { text: 'COMMUNITY', color: '#e5007d', size: 7 },
      h1: { text: '500+\nMEMBERS', color: '#ffffff', size: 30, font: 'Roboto Flex' },
      sub: { text: 'Kansas City Designers', color: 'rgba(255,255,255,0.35)', size: 7 },
    },
    layers: [
      { text: '500+', color: '#ffffff', size: 280, x: 30, y: 52,
        font: 'Roboto Flex', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: -2, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
      { text: 'Kansas City\nDesign Members', color: '#e5007d', size: 46, x: 72, y: 45,
        font: 'Roboto Flex', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 2, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
      { text: 'and growing every year', color: 'rgba(255,255,255,0.35)', size: 18, x: 72, y: 72,
        font: 'DM Mono', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 6, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
    ],
  },
  {
    id: 'glitch-energy',
    name: 'Glitch Energy',
    cat: 'Experimental',
    desc: 'RGB split — animated distortion',
    canvas: '800,800',
    bg: '#080808', bgTex: 'none', texOp: 12,
    accent: 'dot', kc: 'none', glow: 30,
    preview: {
      bg: '#080808', barTop: false, corners: false,
      eyebrow: { text: 'LIVE', color: '#e5007d', size: 7 },
      h1: { text: 'DESIGN\nCOMMUNITY', color: '#ffffff', size: 26, font: 'Roboto Flex' },
      sub: { text: 'glitch / animated', color: 'rgba(229,0,125,0.6)', size: 7 },
    },
    layers: [
      { text: 'DESIGN\nCOMMUNITY', color: '#ffffff', size: 160, x: 50, y: 43,
        font: 'Roboto Flex', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 2, opacity: 100, blend: 'source-over', dist: 'glitch', distAmt: 68, distSpd: 55, visible: true },
      { text: 'KANSAS CITY', color: '#e5007d', size: 44, x: 50, y: 69,
        font: 'DM Mono', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 18, opacity: 85, blend: 'source-over', dist: 'wave', distAmt: 28, distSpd: 40, visible: true },
      { text: 'kc.aiga.org', color: 'rgba(255,255,255,0.3)', size: 14, x: 50, y: 84,
        font: 'DM Mono', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 20, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
    ],
  },
  {
    id: 'board-recruitment',
    name: 'Board Recruitment',
    cat: 'Event',
    desc: 'Call-to-action with diagonal energy',
    canvas: '800,800',
    bg: '#002fa7', bgTex: 'grid', texOp: 10,
    accent: 'corners', kc: 'bl', glow: 20,
    preview: {
      bg: '#002fa7', barTop: false, corners: true,
      eyebrow: { text: 'JOIN THE BOARD', color: '#ffffff', size: 7 },
      h1: { text: 'SHAPE\nKC\nDESIGN', color: '#ffffff', size: 34, font: 'Roboto Flex' },
      sub: { text: 'Apply now', color: 'rgba(255,255,255,0.55)', size: 7 },
    },
    layers: [
      { text: 'SHAPE\nKC\nDESIGN', color: '#ffffff', size: 200, x: 50, y: 43,
        font: 'Roboto Flex', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: -4, ls: 2, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
      { text: '"Lead. Build. Inspire."', color: '#e5007d', size: 30, x: 50, y: 74,
        font: 'Fraunces', style: 'italic', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 0, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
      { text: 'Board Applications Open', color: 'rgba(255,255,255,0.55)', size: 15, x: 50, y: 87,
        font: 'DM Mono', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 10, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
    ],
  },
  {
    id: 'mentorship',
    name: 'Mentorship',
    cat: 'Event',
    desc: 'Warm and editorial — light on dark',
    canvas: '800,800',
    bg: '#0d1208', bgTex: 'none', texOp: 12,
    accent: 'bar-top', kc: 'none', glow: 12,
    grad: 'none', gradC1: '#e5007d', gradC2: '#002fa7', gradAngle: 135, gradOpacity: 80,
    grain: 0, grainSize: 1, grainStyle: 'overlay',
    preview: {
      bg: '#0d1208', barTop: true, corners: false,
      eyebrow: { text: 'MENTORSHIP PROGRAM', color: '#e5007d', size: 7 },
      h1: { text: 'GROW\nTOGETHER', color: '#ffffff', size: 30, font: 'Roboto Flex' },
      sub: { text: '"Every expert was once a beginner."', color: 'rgba(255,255,255,0.5)', size: 7 },
    },
    layers: [
      { text: 'GROW\nTOGETHER', color: '#ffffff', size: 190, x: 50, y: 42,
        font: 'Roboto Flex', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 3, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
      { text: '"Every expert was\nonce a beginner."', color: 'rgba(255,255,255,0.5)', size: 28, x: 50, y: 73,
        font: 'Fraunces', style: 'italic', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 0, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
      { text: 'AIGA KC  ·  kc.aiga.org', color: '#e5007d', size: 13, x: 50, y: 89,
        font: 'DM Mono', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 12, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
    ],
  },
  // ── NEW TEMPLATES FROM EXISTING LIBRARY ──
  {
    id: 'awards-call',
    name: 'A-Awards CFS',
    cat: 'Gala',
    desc: 'Black + magenta — call for submissions',
    canvas: '800,1000',
    bg: '#080808', bgTex: 'none', texOp: 12,
    accent: 'none', kc: 'tr', glow: 0,
    grad: 'none', gradC1: '#e5007d', gradC2: '#002fa7', gradAngle: 135, gradOpacity: 80,
    grain: 22, grainSize: 1, grainStyle: 'overlay',
    preview: {
      bg: '#080808', barTop: false, corners: false,
      eyebrow: { text: 'A-AWARDS', color: '#e5007d', size: 7 },
      h1: { text: 'CALL FOR\nSUBMISSIONS\nIS OPEN!', color: '#ffffff', size: 28, font: 'Roboto Flex' },
      sub: { text: 'AIGA KC Annual Design Awards', color: '#e5007d', size: 7 },
    },
    layers: [
      { text: 'CALL FOR\nSUBMISSIONS\nIS OPEN!', color: '#ffffff', size: 195, x: 50, y: 42,
        font: 'Roboto Flex', style: 'normal', bold: true, sx: 100, sy: 100,
        rot: 0, ls: 1, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
      { text: 'EARLY BIRD', color: '#e5007d', size: 80, x: 50, y: 71,
        font: 'Roboto Flex', style: 'normal', bold: true, sx: 100, sy: 100,
        rot: 0, ls: 2, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
      { text: 'A-AWARDS  ·  AIGA KC', color: 'rgba(255,255,255,0.35)', size: 14, x: 50, y: 88,
        font: 'DM Mono', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 16, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
    ],
  },
  {
    id: 'split-takeover',
    name: 'Takeover Split',
    cat: 'Campaign',
    desc: 'Two-tone split bg — high energy matchup',
    canvas: '800,800',
    bg: '#080808', bgTex: 'none', texOp: 12,
    accent: 'none', kc: 'none', glow: 0,
    grad: 'split', gradC1: '#00a878', gradC2: '#c8000e', gradAngle: 90, gradOpacity: 100,
    grain: 35, grainSize: 1.5, grainStyle: 'overlay',
    preview: {
      bg: '#080808', barTop: false, corners: false,
      eyebrow: { text: 'THE TAKEOVER', color: '#ffffff', size: 7 },
      h1: { text: 'AIGA PHL\nvs AIGA KC', color: '#ffffff', size: 26, font: 'Roboto Flex' },
      sub: { text: 'Winner takes all of social media', color: 'rgba(255,255,255,0.6)', size: 7 },
    },
    layers: [
      { text: 'THE\nTAKEOVER', color: '#ffffff', size: 195, x: 50, y: 35,
        font: 'Roboto Flex', style: 'normal', bold: true, sx: 100, sy: 100,
        rot: 0, ls: 1, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
      { text: 'WINNER TAKES ALL', color: '#ffffff', size: 46, x: 50, y: 68,
        font: 'Roboto Flex', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 4, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
      { text: 'kc.aiga.org', color: 'rgba(255,255,255,0.45)', size: 16, x: 50, y: 85,
        font: 'DM Mono', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 14, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
    ],
  },
  {
    id: 'cocktails-solid',
    name: 'Cocktails w/ Creatives',
    cat: 'Event',
    desc: 'Solid vibrant bg — bold display info',
    canvas: '800,800',
    bg: '#00a878', bgTex: 'none', texOp: 12,
    accent: 'none', kc: 'none', glow: 0,
    grad: 'none', gradC1: '#e5007d', gradC2: '#002fa7', gradAngle: 135, gradOpacity: 80,
    grain: 8, grainSize: 1, grainStyle: 'monochrome',
    preview: {
      bg: '#00a878', barTop: false, corners: false,
      eyebrow: { text: 'THIS THURSDAY', color: '#1a1a0a', size: 7 },
      h1: { text: 'COCKTAILS\nWITH\nCREATIVES', color: '#1a1a0a', size: 26, font: 'Roboto Flex' },
      sub: { text: '6–8PM  ·  Vine Street Brewing', color: 'rgba(0,0,0,0.6)', size: 7 },
    },
    layers: [
      { text: 'COCKTAILS\nWITH\nCREATIVES', color: '#1a1a0a', size: 190, x: 50, y: 42,
        font: 'Roboto Flex', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 1, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
      { text: 'JULY 31  ·  6–8PM', color: '#080808', size: 32, x: 50, y: 73,
        font: 'DM Mono', style: 'normal', bold: true, sx: 100, sy: 100,
        rot: 0, ls: 6, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
      { text: '@AIGAKC', color: '#e5007d', size: 22, x: 50, y: 86,
        font: 'DM Mono', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 18, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
    ],
  },
  {
    id: 'jazz-couture',
    name: 'Jazz Couture / Gala',
    cat: 'Gala',
    desc: 'Dark bg + bold mixed color type',
    canvas: '800,800',
    bg: '#080808', bgTex: 'none', texOp: 12,
    accent: 'none', kc: 'none', glow: 0,
    grad: 'glow-corner', gradC1: '#002fa7', gradC2: '#080808', gradAngle: 135, gradOpacity: 60,
    grain: 18, grainSize: 1, grainStyle: 'overlay',
    preview: {
      bg: '#080808', barTop: false, corners: false,
      eyebrow: { text: 'A20 THEME ATTIRE', color: '#e5007d', size: 7 },
      h1: { text: 'JAZZ\nCOUTURE', color: '#f4f1ea', size: 36, font: 'Roboto Flex' },
      sub: { text: 'Fashion that embodies heart and soul', color: 'rgba(255,255,255,0.6)', size: 7 },
    },
    layers: [
      { text: 'A20 THEME', color: '#e5007d', size: 36, x: 50, y: 22,
        font: 'DM Mono', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 20, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
      { text: 'JAZZ\nCOUTURE', color: '#f4f1ea', size: 220, x: 50, y: 52,
        font: 'Roboto Flex', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 1, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
      { text: 'Heart & Soul', color: '#e5007d', size: 38, x: 50, y: 83,
        font: 'Fraunces', style: 'italic', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 0, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
    ],
  },
  {
    id: 'join-board-grid',
    name: 'Join Our Board',
    cat: 'Brand',
    desc: 'Grid paper bg — bold black type, magenta accents',
    canvas: '800,1000',
    bg: '#f8f7f2', bgTex: 'grid', texOp: 22,
    accent: 'none', kc: 'none', glow: 0,
    grad: 'none', gradC1: '#e5007d', gradC2: '#f8f7f2', gradAngle: 135, gradOpacity: 80,
    grain: 6, grainSize: 1, grainStyle: 'monochrome',
    preview: {
      bg: '#f8f7f2', barTop: false, corners: false, light: true,
      eyebrow: { text: 'FIND YOUR CREATIVE COMMUNITY', color: '#e5007d', size: 7 },
      h1: { text: 'JOIN\nOUR\nBOARD', color: '#080808', size: 38, font: 'Roboto Flex' },
      sub: { text: 'AIGA KC — Apply Now', color: 'rgba(0,0,0,0.5)', size: 7 },
    },
    layers: [
      { text: 'JOIN\nOUR\nBOARD', color: '#080808', size: 210, x: 50, y: 42,
        font: 'Roboto Flex', style: 'normal', bold: true, sx: 100, sy: 100,
        rot: 0, ls: 0, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
      { text: 'FIND YOUR\nCREATIVE COMMUNITY', color: '#e5007d', size: 34, x: 50, y: 74,
        font: 'DM Mono', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 4, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
      { text: '@AIGAKC', color: 'rgba(0,0,0,0.45)', size: 18, x: 50, y: 88,
        font: 'DM Mono', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 20, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
    ],
  },
  {
    id: 'peach-gradient',
    name: 'Upcoming Events',
    cat: 'Event',
    desc: 'Soft warm gradient — upcoming events style',
    canvas: '800,800',
    bg: '#f4c5a0', bgTex: 'none', texOp: 12,
    accent: 'none', kc: 'none', glow: 0,
    grad: 'linear', gradC1: '#f9d4b0', gradC2: '#e8a080', gradAngle: 160, gradOpacity: 100,
    grain: 14, grainSize: 1, grainStyle: 'monochrome',
    preview: {
      bg: '#f4c5a0', barTop: false, corners: false, light: true,
      eyebrow: { text: 'MARCH 2025', color: '#080808', size: 7 },
      h1: { text: 'UPCOMING\nEVENTS', color: '#080808', size: 36, font: 'Roboto Flex' },
      sub: { text: 'AIGA KC  ·  Sign up today!', color: 'rgba(0,0,0,0.5)', size: 7 },
    },
    layers: [
      { text: 'UPCOMING\nEVENTS', color: '#080808', size: 185, x: 50, y: 35,
        font: 'Roboto Flex', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 1, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
      { text: 'March 2025', color: '#080808', size: 32, x: 50, y: 60,
        font: 'Fraunces', style: 'italic', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 0, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
      { text: '@AIGAKC', color: '#e5007d', size: 18, x: 50, y: 84,
        font: 'DM Mono', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 22, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
    ],
  },
  {
    id: 'lavender-editorial',
    name: 'Wellness / Collab',
    cat: 'Event',
    desc: 'Soft lavender + vignette — calm editorial feel',
    canvas: '800,800',
    bg: '#c8c0e8', bgTex: 'none', texOp: 12,
    accent: 'none', kc: 'none', glow: 0,
    grad: 'vignette', gradC1: '#c8c0e8', gradC2: '#9080c0', gradAngle: 135, gradOpacity: 55,
    grain: 20, grainSize: 1, grainStyle: 'monochrome',
    preview: {
      bg: '#c8c0e8', barTop: false, corners: false, light: true,
      eyebrow: { text: 'A CREATIVE WELLNESS WORKSHOP', color: '#e5007d', size: 7 },
      h1: { text: 'REFRESH\n& RESET', color: '#080808', size: 30, font: 'Fraunces' },
      sub: { text: 'AIGA KC  ·  kc.aiga.org', color: 'rgba(0,0,0,0.45)', size: 7 },
    },
    layers: [
      { text: 'REFRESH\n& RESET', color: '#1a0830', size: 160, x: 50, y: 40,
        font: 'Fraunces', style: 'italic', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 0, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
      { text: 'A Creative Wellness Workshop', color: '#080808', size: 22, x: 50, y: 67,
        font: 'DM Mono', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 3, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
      { text: 'AIGA KC', color: '#e5007d', size: 20, x: 50, y: 83,
        font: 'DM Mono', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 24, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
    ],
  },
  // ─── FROM REFERENCE LIBRARY ─────────────────────────────────────────────
  {
    id: 'coffee-creatives',
    name: 'Coffee w/ Creatives',
    cat: 'Event',
    desc: 'Grid paper bg, mixed script + display headline',
    canvas: '800,800',
    bg: '#f6f4ef', bgTex: 'paper', texOp: 28,
    accent: 'none', kc: 'tr', glow: 0,
    grad: 'none', gradC1: '#e5007d', gradC2: '#f6f4ef', gradAngle: 135, gradOpacity: 80,
    grain: 10, grainSize: 1, grainStyle: 'monochrome',
    preview: {
      bg: '#f6f4ef', barTop: false, corners: false, light: true,
      eyebrow: { text: 'LEARN MORE ABOUT JOINING', color: '#e5007d', size: 6 },
      h1: { text: 'Coffee\nwith\nCreatives', color: '#080808', size: 26, font: 'Fraunces' },
      sub: { text: 'AIGA KC  ·  @AIGAKC', color: 'rgba(0,0,0,0.35)', size: 7 },
    },
    layers: [
      { text: 'Coffee with\nCreatives', color: '#080808', size: 152, x: 50, y: 38,
        font: 'Fraunces', style: 'italic', bold: false, sx: 100, sy: 100,
        rot: -2, ls: -1, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
      { text: 'LEARN MORE ABOUT', color: '#e5007d', size: 24, x: 50, y: 66,
        font: 'Roboto Flex', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 8, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
      { text: 'JOINING OUR BOARD', color: '#080808', size: 30, x: 50, y: 74,
        font: 'Roboto Flex', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 4, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
    ],
  },
  {
    id: 'portfolio-day',
    name: 'Portfolio Day',
    cat: 'Event',
    desc: 'Black bg, vibrant multicolor header + speaker layout',
    canvas: '800,800',
    bg: '#080808', bgTex: 'none', texOp: 12,
    accent: 'none', kc: 'bl', glow: 0,
    grad: 'none', gradC1: '#e5007d', gradC2: '#002fa7', gradAngle: 135, gradOpacity: 80,
    grain: 8, grainSize: 1, grainStyle: 'overlay',
    preview: {
      bg: '#080808', barTop: false, corners: false, light: false,
      eyebrow: { text: 'AIGA KC  ·  PRESENTED BY ADOBE', color: '#ffffff', size: 6 },
      h1: { text: 'PORTFOLIO\nDAY', color: '#e5007d', size: 36, font: 'Roboto Flex' },
      sub: { text: 'SPEAKER SPOTLIGHT', color: 'rgba(255,255,255,0.5)', size: 7 },
    },
    layers: [
      { text: 'PORTFOLIO\nDAY', color: '#e5007d', size: 220, x: 50, y: 32,
        font: 'Roboto Flex', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 2, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
      { text: 'SPEAKER NAME', color: '#ffffff', size: 42, x: 50, y: 62,
        font: 'Roboto Flex', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 2, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
      { text: 'VP OF DESIGN  ·  COMPANY NAME', color: '#f5a623', size: 22, x: 50, y: 74,
        font: 'DM Mono', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 3, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
    ],
  },
  {
    id: 'field-guide',
    name: 'Field Guide',
    cat: 'Event',
    desc: 'Clean cream card, deep green display, editorial serif',
    canvas: '800,1000',
    bg: '#f2f0e8', bgTex: 'none', texOp: 12,
    accent: 'corners', kc: 'bl', glow: 0,
    grad: 'none', gradC1: '#e5007d', gradC2: '#002fa7', gradAngle: 135, gradOpacity: 80,
    grain: 16, grainSize: 1.5, grainStyle: 'monochrome',
    preview: {
      bg: '#f2f0e8', barTop: false, corners: true, light: true,
      eyebrow: { text: 'A CREATIVE BOTANICAL EXPLORATION', color: 'rgba(0,0,0,0.45)', size: 6 },
      h1: { text: 'FIELD\nGUIDE', color: '#1a4a1a', size: 42, font: 'Roboto Flex' },
      sub: { text: 'SATURDAY  ·  11AM – 1PM', color: '#e5007d', size: 7 },
    },
    layers: [
      { text: 'FIELD\nGUIDE', color: '#1a4a1a', size: 240, x: 50, y: 35,
        font: 'Roboto Flex', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 1, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
      { text: 'A Creative Botanical Exploration', color: '#080808', size: 28, x: 50, y: 58,
        font: 'Fraunces', style: 'italic', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 0, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
      { text: 'SATURDAY  ·  11AM – 1PM', color: '#e5007d', size: 20, x: 50, y: 70,
        font: 'DM Mono', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 10, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
    ],
  },
  {
    id: 'cocktails-teal',
    name: 'Cocktails / Social',
    cat: 'Event',
    desc: 'Vibrant teal bg, chunky rounded display type, editorial date block',
    canvas: '800,800',
    bg: '#00a878', bgTex: 'none', texOp: 12,
    accent: 'none', kc: 'none', glow: 0,
    grad: 'none', gradC1: '#e5007d', gradC2: '#002fa7', gradAngle: 135, gradOpacity: 80,
    grain: 20, grainSize: 1, grainStyle: 'monochrome',
    preview: {
      bg: '#00a878', barTop: false, corners: false, light: false,
      eyebrow: { text: 'JULY 31  ·  6–8PM', color: '#080808', size: 6 },
      h1: { text: 'COCKTAILS\nW/ CREATIVES', color: '#080808', size: 26, font: 'Roboto Flex' },
      sub: { text: 'VINE STREET BREWING  ·  @AIGAKC', color: 'rgba(0,0,0,0.55)', size: 7 },
    },
    layers: [
      { text: 'Cocktails\nwith\nCreatives', color: '#080808', size: 165, x: 50, y: 38,
        font: 'Fraunces', style: 'italic', bold: false, sx: 100, sy: 100,
        rot: 0, ls: -1, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
      { text: 'JULY 31  ·  6–8PM', color: '#080808', size: 32, x: 50, y: 70,
        font: 'Roboto Flex', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 4, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
      { text: 'BOOK DONATION  ·  BLK + BRWN', color: '#e5007d', size: 20, x: 50, y: 83,
        font: 'DM Mono', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 6, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
    ],
  },
  {
    id: 'gala-dark-energy',
    name: 'Gala / A-Awards',
    cat: 'Brand',
    desc: 'Black bg, blue torn-paper border feel, cream + magenta mixed type',
    canvas: '800,800',
    bg: '#080808', bgTex: 'none', texOp: 12,
    accent: 'corners', kc: 'none', glow: 22,
    grad: 'vignette', gradC1: '#0a0820', gradC2: '#080808', gradAngle: 135, gradOpacity: 70,
    grain: 28, grainSize: 1, grainStyle: 'overlay',
    preview: {
      bg: '#080808', barTop: false, corners: true, light: false,
      eyebrow: { text: 'A20 · ANNUAL DESIGN AWARDS', color: '#e5007d', size: 6 },
      h1: { text: 'JAZZ\nCOUTURE', color: '#f0e8d8', size: 38, font: 'Roboto Flex' },
      sub: { text: 'FASHION THAT EMBODIES HEART AND SOUL', color: 'rgba(255,255,255,0.4)', size: 6 },
    },
    layers: [
      { text: 'A20 · ANNUAL DESIGN AWARDS', color: '#e5007d', size: 22, x: 50, y: 14,
        font: 'Roboto Flex', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 8, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
      { text: 'JAZZ\nCOUTURE', color: '#f0e8d8', size: 220, x: 50, y: 48,
        font: 'Roboto Flex', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 1, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
      { text: 'FASHION THAT EMBODIES\nHEART AND SOUL', color: '#e5007d', size: 34, x: 50, y: 80,
        font: 'Roboto Flex', style: 'normal', bold: false, sx: 100, sy: 100,
        rot: 0, ls: 3, opacity: 100, blend: 'source-over', dist: 'normal', distAmt: 40, distSpd: 30, visible: true },
    ],
  },
];

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

function buildTplCards() {
  const grid = document.getElementById('tplGrid');
  const cats = [...new Set(TEMPLATES.map(t => t.cat))];

  grid.innerHTML = TEMPLATES.map(tpl => {
    const p = tpl.preview;
    const lightBg = p.light;
    const textColor = lightBg ? p.h1.color : p.h1.color;
    const eyeColor = p.eyebrow.color;
    const subColor = p.sub.color;

    const barHTML = p.barTop
      ? `<div style="position:absolute;top:0;left:0;right:0;height:2.5px;background:#e5007d;"></div>` : '';
    const cornerHTML = p.corners
      ? `<div style="position:absolute;top:5px;left:5px;width:8px;height:8px;border-top:1px solid rgba(229,0,125,0.55);border-left:1px solid rgba(229,0,125,0.55);"></div>
         <div style="position:absolute;bottom:5px;right:5px;width:8px;height:8px;border-bottom:1px solid rgba(229,0,125,0.55);border-right:1px solid rgba(229,0,125,0.55);"></div>` : '';

    // Encode canvas size label
    const [cw, ch] = tpl.canvas.split(',');
    const ratio = parseInt(cw) > parseInt(ch) ? '16:9' : parseInt(cw) < parseInt(ch) ? '9:16' : '1:1';

    return `<div class="tpl-card${activeTplId === tpl.id ? ' active-tpl' : ''}" onclick="applyTemplate('${tpl.id}')" data-tpl="${tpl.id}">
      <div class="tpl-preview" style="background:${p.bg};">
        ${barHTML}${cornerHTML}
        <div class="tp-ey" style="color:${eyeColor};font-size:${p.eyebrow.size}px;">${p.eyebrow.text}</div>
        <div style="font-family:'${p.h1.font}',${p.h1.font==='Fraunces'?'serif':'sans-serif'};font-size:${p.h1.size}px;line-height:.95;letter-spacing:.02em;color:${textColor};}">${p.h1.text.replace(/\n/g,'<br>')}</div>
        <div style="font-size:${p.sub.size}px;letter-spacing:.12em;text-transform:uppercase;color:${subColor};margin-top:4px;font-family:'DM Mono',monospace;">${p.sub.text}</div>
      </div>
      <div class="tpl-meta">
        <span class="tpl-name">${tpl.name}</span>
        <span class="tpl-desc">${tpl.desc}</span>
        <span class="tpl-cat">${tpl.cat} · ${ratio}</span>
      </div>
    </div>`;
  }).join('');
}

function applyTemplate(id) {
  const tpl = TEMPLATES.find(t => t.id === id);
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
