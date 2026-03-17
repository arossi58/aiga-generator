/* ── Panel open/close ── */
let _currentOklchHex = null;
let _currentOklchName = null;
let _oklchShades = [];

function openOklchPanel(hex, name, sourceEl) {
  _currentOklchHex = hex;
  _currentOklchName = name;

  // Update source chip
  document.getElementById('oklchSourceDot').style.background = hex;
  document.getElementById('oklchSourceLabel').textContent = `${name}  ${hex.toUpperCase()}`;

  // Generate shades
  _oklchShades = generateOklchShades(hex, 11);

  renderOklchShades();
  renderOklchDetail(hex);
  renderOklchCopyRow();

  // Show panel
  const panel = document.getElementById('oklch-panel');
  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function closeOklchPanel() {
  document.getElementById('oklch-panel').style.display = 'none';
  _currentOklchHex = null;
}

function renderOklchShades() {
  const STEP_LABELS = ['50','100','200','300','400','500','600','700','800','900','950'];
  document.getElementById('oklchShades').innerHTML = _oklchShades.map((s, i) => {
    const tc = textOn(s.hex);
    const marker = s.isSrc ? `<div style="position:absolute;top:4px;left:50%;transform:translateX(-50%);width:4px;height:4px;border-radius:50%;background:${tc};opacity:.5;"></div>` : '';
    return `<div class="oklch-shade" style="background:${s.hex};" onclick="copyShadeHex('${s.hex}','${STEP_LABELS[i]}',this)" title="Click to copy ${s.hex}">
      ${marker}
      <div class="oklch-shade-inner" style="color:${tc};">
        <span class="oklch-shade-step">${STEP_LABELS[i]}</span>
        <span class="oklch-shade-hex">${s.hex.toUpperCase()}</span>
        <span class="oklch-shade-val">L ${s.L.toFixed(2)} C ${s.C.toFixed(3)}</span>
      </div>
    </div>`;
  }).join('');
}

function renderOklchDetail(hex) {
  const { L, C, H } = hexToOklch(hex);
  const { r, g, b } = hexToRgb(hex);
  const wcagWhite = contrastRatio(hex, '#ffffff').toFixed(1);
  const wcagBlack = contrastRatio(hex, '#000000').toFixed(1);
  const wcagMag   = contrastRatio(hex, '#e5007d').toFixed(1);

  document.getElementById('oklchDetail').innerHTML = `
    <div class="oklch-stat">
      <div class="oklch-stat-val" style="font-family:'DM Mono',monospace;font-size:12px;">${L.toFixed(3)}</div>
      <div class="oklch-stat-key">Lightness (L)</div>
    </div>
    <div class="oklch-stat">
      <div class="oklch-stat-val" style="font-family:'DM Mono',monospace;font-size:12px;">${C.toFixed(4)}</div>
      <div class="oklch-stat-key">Chroma (C)</div>
    </div>
    <div class="oklch-stat">
      <div class="oklch-stat-val" style="font-family:'DM Mono',monospace;font-size:12px;">${H.toFixed(1)}°</div>
      <div class="oklch-stat-key">Hue (H)</div>
    </div>
    <div class="oklch-stat">
      <div class="oklch-stat-val">${wcagWhite}:1</div>
      <div class="oklch-stat-key">vs White</div>
    </div>
    <div class="oklch-stat">
      <div class="oklch-stat-val">${wcagBlack}:1</div>
      <div class="oklch-stat-key">vs Black</div>
    </div>
    <div class="oklch-stat">
      <div class="oklch-stat-val" style="color:#e5007d;">${wcagMag}:1</div>
      <div class="oklch-stat-key">vs Magenta</div>
    </div>`;
}

function renderOklchCopyRow() {
  const { L, C, H } = hexToOklch(_currentOklchHex);
  const oklchStr = `oklch(${(L*100).toFixed(1)}% ${C.toFixed(4)} ${H.toFixed(1)})`;

  document.getElementById('oklchCopyRow').innerHTML = `
    <button class="oklch-copy-btn" onclick="copyText('${oklchStr}',this)">Copy oklch()</button>
    <button class="oklch-copy-btn" onclick="copyText('${_currentOklchHex.toUpperCase()}',this)">Copy HEX</button>
    <button class="oklch-copy-btn" onclick="copyOklchCss()">Copy CSS vars</button>
    <button class="oklch-copy-btn" onclick="exportShadesImage()">↓ Export PNG</button>
    <button class="oklch-copy-btn" onclick="pushShadeToPlayground('${_currentOklchHex}')">→ Push to Playground</button>`;
}

function copyShadeHex(hex, step, el) {
  copyText(hex.toUpperCase(), el);
  // Update detail panel to reflect clicked shade
  _currentOklchHex = hex;
  renderOklchDetail(hex);
  renderOklchCopyRow();
  // Highlight the clicked shade
  document.querySelectorAll('.oklch-shade').forEach(s => s.style.outline = 'none');
  el.style.outline = '2px solid #fff';
  setTimeout(() => { el.style.outline = 'none'; }, 900);
}

function copyText(text, btn) {
  navigator.clipboard?.writeText(text);
  const orig = btn.textContent;
  btn.textContent = '✓ Copied';
  btn.classList.add('copied');
  setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 1600);
  toast(`Copied: ${text}`);
}

function copyOklchCss() {
  const STEP_LABELS = ['50','100','200','300','400','500','600','700','800','900','950'];
  const name = (_currentOklchName || 'color').toLowerCase().replace(/\s+/g, '-');
  const lines = _oklchShades.map((s, i) => {
    const { L, C, H } = hexToOklch(s.hex);
    return `  --${name}-${STEP_LABELS[i]}: oklch(${(L*100).toFixed(1)}% ${C.toFixed(4)} ${H.toFixed(1)}); /* ${s.hex.toUpperCase()} */`;
  });
  const css = `:root {\n${lines.join('\n')}\n}`;
  navigator.clipboard?.writeText(css);
  toast(`CSS scale for ${_currentOklchName} copied`);
}

function pushShadeToPlayground(hex) {
  // Add the color to the palette and push to playground
  PALETTE.primary = hex;
  updatePlaygroundPaletteSwatches();
  toast(`${hex.toUpperCase()} pushed to Typography Playground`);
}

function exportShadesImage() {
  if (!_oklchShades.length) return;
  const STEP_LABELS = ['50','100','200','300','400','500','600','700','800','900','950'];
  const DPR = 2;
  const W = 1400, H = 480, PAD = 60;
  const SHADE_W = (W - PAD * 2) / 11;
  const off = document.createElement('canvas');
  off.width = W * DPR; off.height = H * DPR;
  const ctx = off.getContext('2d');
  ctx.scale(DPR, DPR);

  ctx.fillStyle = '#111111';
  ctx.fillRect(0, 0, W, H);

  // Title
  ctx.fillStyle = '#EC008C';
  ctx.font = '600 18px "DM Mono",monospace';
  ctx.textAlign = 'left';
  ctx.fillText('AIGA KC \u2014 ' + (_currentOklchName || 'Color').toUpperCase() + ' SHADE SCALE', PAD, PAD - 10);

  // Step labels
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '500 13px "DM Mono",monospace';
  STEP_LABELS.forEach((lbl, i) => {
    ctx.textAlign = 'center';
    ctx.fillText(lbl, PAD + i * SHADE_W + SHADE_W / 2, PAD + 18);
  });

  // Swatches
  const swY = PAD + 32, swH = H - swY - PAD + 16;
  _oklchShades.forEach((s, i) => {
    const x = PAD + i * SHADE_W;
    ctx.fillStyle = s.hex;
    ctx.fillRect(x, swY, SHADE_W - 3, swH);
    const tc = textOn(s.hex);
    const la = tc === '#ffffff' ? 0.7 : 0.6;
    ctx.fillStyle = tc === '#ffffff' ? `rgba(255,255,255,${la})` : `rgba(0,0,0,${la})`;
    ctx.font = '500 12px "DM Mono",monospace';
    ctx.textAlign = 'center';
    ctx.fillText(s.hex.slice(1).toUpperCase(), x + SHADE_W / 2 - 1.5, swY + swH - 14);
    if (s.isSrc) {
      ctx.beginPath();
      ctx.arc(x + SHADE_W / 2 - 1.5, swY + 12, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Footer
  ctx.fillStyle = '#EC008C';
  ctx.fillRect(PAD, H - 24, 28, 2);
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = '400 11px "DM Mono",monospace';
  ctx.textAlign = 'left';
  ctx.fillText('aigakc.org', PAD + 40, H - 15);

  off.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const n = (_currentOklchName || 'color').toLowerCase().replace(/\s+/g, '-');
    a.href = url; a.download = `aigakc-${n}-shades-${new Date().toISOString().slice(0,10)}.png`;
    a.click(); URL.revokeObjectURL(url);
  }, 'image/png');
  toast((_currentOklchName || 'Color') + ' shade scale exported');
}

function exportPaletteImage() {
  const colors = [
    {c: PALETTE.magenta, n: 'Magenta'},
    {c: PALETTE.primary, n: 'Primary'},
    {c: PALETTE.deep,    n: 'Deep'},
    {c: PALETTE.surface, n: 'Surface'},
    {c: PALETTE.h1,      n: 'Harmony 1'},
    {c: PALETTE.h2,      n: 'Harmony 2'},
  ];
  const STEP_LABELS = ['50','100','200','300','400','500','600','700','800','900','950'];
  const DPR = 2;
  const W = 1600, PAD = 64, LABEL_W = 160;
  const HEADER_H = 100, ROW_H = 128, FOOTER_H = 64;
  const H = HEADER_H + colors.length * ROW_H + FOOTER_H;
  const SHADE_W = (W - PAD * 2 - LABEL_W) / 11;

  const off = document.createElement('canvas');
  off.width = W * DPR; off.height = H * DPR;
  const ctx = off.getContext('2d');
  ctx.scale(DPR, DPR);

  // Background
  ctx.fillStyle = '#111111';
  ctx.fillRect(0, 0, W, H);

  // Header title
  ctx.fillStyle = '#EC008C';
  ctx.font = '600 20px "DM Mono",monospace';
  ctx.textAlign = 'left';
  ctx.fillText('AIGA KC \u2014 COLOR PALETTE', PAD, PAD - 4);

  // Step column labels
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font = '500 13px "DM Mono",monospace';
  STEP_LABELS.forEach((lbl, i) => {
    ctx.textAlign = 'center';
    ctx.fillText(lbl, PAD + LABEL_W + i * SHADE_W + SHADE_W / 2, HEADER_H - 16);
  });

  // Divider line under header
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  ctx.fillRect(PAD, HEADER_H - 6, W - PAD * 2, 1);

  // Color rows
  colors.forEach((col, ri) => {
    const shades = generateOklchShades(col.c, 11);
    const y = HEADER_H + ri * ROW_H;

    // Subtle row separator
    if (ri > 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(PAD, y, W - PAD * 2, 1);
    }

    // Label: color name
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = '600 14px "DM Mono",monospace';
    ctx.fillText(col.n.toUpperCase(), PAD, y + ROW_H / 2 - 8);
    // Label: source hex
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '400 11px "DM Mono",monospace';
    ctx.fillText(col.c.toUpperCase(), PAD, y + ROW_H / 2 + 12);

    // Swatch blocks
    shades.forEach((s, i) => {
      const x = PAD + LABEL_W + i * SHADE_W;
      const sw = SHADE_W - 3, sh = ROW_H - 16;
      ctx.fillStyle = s.hex;
      ctx.fillRect(x, y + 8, sw, sh);
      const tc = textOn(s.hex);
      const la = tc === '#ffffff' ? 0.65 : 0.55;
      ctx.fillStyle = tc === '#ffffff' ? `rgba(255,255,255,${la})` : `rgba(0,0,0,${la})`;
      ctx.font = '500 11px "DM Mono",monospace';
      ctx.textAlign = 'center';
      ctx.fillText(s.hex.slice(1).toUpperCase(), x + sw / 2, y + 8 + sh - 10);
      // Source dot
      if (s.isSrc) {
        ctx.beginPath();
        ctx.arc(x + sw / 2, y + 8 + 11, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  });

  // Footer
  const fy = H - FOOTER_H + 20;
  ctx.fillStyle = '#EC008C';
  ctx.fillRect(PAD, fy, 28, 2);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.font = '400 11px "DM Mono",monospace';
  ctx.textAlign = 'left';
  ctx.fillText('aigakc.org', PAD + 40, fy + 8);

  off.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `aigakc-palette-${new Date().toISOString().slice(0,10)}.png`;
    a.click(); URL.revokeObjectURL(url);
  }, 'image/png');
  toast('Full palette exported as PNG');
}

/* ════════════════════════════════════════════
   GRADIENT COLOR PICKER
════════════════════════════════════════════ */
let _activeGradSlot = 1; // which slot (1 or 2) is selected for editing

function selectGradSlot(n) {
  _activeGradSlot = n;
  document.getElementById('gradSlot1').classList.toggle('active', n === 1);
  document.getElementById('gradSlot2').classList.toggle('active', n === 2);
  document.getElementById('gradSlot3').classList.toggle('active', n === 3);
  const s4 = document.getElementById('gradSlot4'); if (s4) s4.classList.toggle('active', n === 4);
  const s5 = document.getElementById('gradSlot5'); if (s5) s5.classList.toggle('active', n === 5);
  const hex = n === 1 ? T.gradC1 : n === 3 ? (T.gradC3||'#8800cc') : n === 4 ? (T.gradC4||'#ff6600') : n === 5 ? (T.gradC5||'#00c878') : T.gradC2;
  const hexInput = document.getElementById('gradHexInput');
  if (hexInput) hexInput.value = hex.toUpperCase();
  updateGradPaletteApplied();
}

function applyGradColor(hex) {
  if (_activeGradSlot === 1) {
    T.gradC1 = hex;
    document.getElementById('gradSlot1Swatch').style.background = hex;
    document.getElementById('gradC1').value = hex;
  } else if (_activeGradSlot === 3) {
    T.gradC3 = hex;
    document.getElementById('gradSlot3Swatch').style.background = hex;
    document.getElementById('gradC3').value = hex;
  } else if (_activeGradSlot === 4) {
    T.gradC4 = hex;
    const s = document.getElementById('gradSlot4Swatch'); if (s) s.style.background = hex;
    const i = document.getElementById('gradC4'); if (i) i.value = hex;
  } else if (_activeGradSlot === 5) {
    T.gradC5 = hex;
    const s = document.getElementById('gradSlot5Swatch'); if (s) s.style.background = hex;
    const i = document.getElementById('gradC5'); if (i) i.value = hex;
  } else {
    T.gradC2 = hex;
    document.getElementById('gradSlot2Swatch').style.background = hex;
    document.getElementById('gradC2').value = hex;
  }
  const hexInput = document.getElementById('gradHexInput');
  if (hexInput) hexInput.value = hex.toUpperCase();
  updateGradPreviewStrip();
  updateGradPaletteApplied();
  typo_render();
}

function applyGradColorInput(slot, hex) {
  if (slot === 1) { T.gradC1 = hex; document.getElementById('gradSlot1Swatch').style.background = hex; }
  else if (slot === 3) { T.gradC3 = hex; document.getElementById('gradSlot3Swatch').style.background = hex; }
  else if (slot === 4) { T.gradC4 = hex; const s = document.getElementById('gradSlot4Swatch'); if (s) s.style.background = hex; }
  else if (slot === 5) { T.gradC5 = hex; const s = document.getElementById('gradSlot5Swatch'); if (s) s.style.background = hex; }
  else { T.gradC2 = hex; document.getElementById('gradSlot2Swatch').style.background = hex; }
  updateGradPreviewStrip();
  typo_render();
}

function applyGradHexInput(val) {
  if (/^#[0-9A-Fa-f]{6}$/.test(val)) applyGradColor(val);
}

function openGradColorPicker() {
  const id = _activeGradSlot === 1 ? 'gradC1' : _activeGradSlot === 3 ? 'gradC3' : _activeGradSlot === 4 ? 'gradC4' : _activeGradSlot === 5 ? 'gradC5' : 'gradC2';
  const picker = document.getElementById(id);
  if (picker) picker.click();
}

function updateGradPreviewStrip() {
  const strip = document.getElementById('gradPreviewStrip');
  if (!strip) return;
  const c1=T.gradC1, c2=T.gradC2, c3=T.gradC3||c1, c4=T.gradC4||c1, c5=T.gradC5||c2, mid=T.gradMid??50;
  if (T.grad === 'mesh') {
    strip.style.background = `linear-gradient(90deg,${c1},${c3},${c2},${c4},${c5})`;
  } else if (T.grad === 'none' || T.grad === 'vignette') {
    strip.style.background = `linear-gradient(90deg,${c1},${c3} 50%,${c2})`;
  } else if (T.grad === 'split') {
    strip.style.background = `linear-gradient(90deg,${c1} 50%,${c2} 50%)`;
  } else if (T.grad === 'radial') {
    strip.style.background = `radial-gradient(circle,${c1},${c3} ${mid}%,${c2})`;
  } else if (T.grad === 'conic') {
    strip.style.background = `conic-gradient(${c1},${c3},${c2},${c1})`;
  } else {
    const angle = T.gradAngle ?? 135;
    strip.style.background = `linear-gradient(${angle}deg,${c1},${c3} ${mid}%,${c2})`;
  }
}

function updateGradPaletteApplied() {
  const activeHex = (_activeGradSlot === 1 ? T.gradC1 : _activeGradSlot === 3 ? (T.gradC3||'#8800cc') : _activeGradSlot === 4 ? (T.gradC4||'#ff6600') : _activeGradSlot === 5 ? (T.gradC5||'#00c878') : T.gradC2).toLowerCase();
  document.querySelectorAll('#gradPaletteRow .grad-pal-dot').forEach(dot => {
    dot.classList.toggle('applied', dot.dataset.c.toLowerCase() === activeHex);
  });
}

function updateGradPaletteSwatches() {
  const row = document.getElementById('gradPaletteRow');
  if (!row) return;
  const colors = [
    { c: PALETTE.magenta, n: 'Mag' },
    { c: PALETTE.primary, n: 'Pri' },
    { c: PALETTE.deep,    n: 'Deep' },
    { c: PALETTE.dark,    n: 'Dark' },
    { c: PALETTE.surface, n: 'Surf' },
    { c: PALETTE.h1,      n: 'H1' },
    { c: PALETTE.h2,      n: 'H2' },
    { c: '#080808',       n: 'Ink' },
    { c: '#f4f1ea',       n: 'Paper' },
    { c: '#ffffff',       n: 'White' },
  ];
  row.innerHTML = `<span class="grad-pal-label">Palette</span>`;
  colors.forEach(({ c, n }) => {
    const d = document.createElement('div');
    d.className = 'grad-pal-dot';
    d.style.background = c;
    d.dataset.c = c;
    d.title = `${n} — ${c}`;
    d.onclick = () => applyGradColor(c);
    row.appendChild(d);
  });
  updateGradPreviewStrip();
  updateGradPaletteApplied();
}

// Sync when palette changes
window.addEventListener('paletteChange', () => { updateGradPaletteSwatches(); updateGrainPaletteSwatches(); });

function applyGrainColor(hex) {
  T.grainColor = hex;
  _grainCanvas = null;
  // Update the color grain style button swatch
  const sw = document.getElementById('grainColorSw');
  if (sw) sw.style.background = hex;
  // Highlight applied dot
  document.querySelectorAll('#grainColorPaletteRow .grad-pal-dot').forEach(d => {
    d.classList.toggle('applied', d.dataset.c.toLowerCase() === hex.toLowerCase());
  });
  typo_render();
}

function updateGrainPaletteSwatches() {
  const row = document.getElementById('grainColorPaletteRow');
  if (!row) return;
  const colors = [
    { c: PALETTE.magenta, n: 'Mag' },
    { c: PALETTE.primary, n: 'Pri' },
    { c: PALETTE.deep,    n: 'Deep' },
    { c: PALETTE.dark,    n: 'Dark' },
    { c: PALETTE.surface, n: 'Surf' },
    { c: PALETTE.h1,      n: 'H1' },
    { c: PALETTE.h2,      n: 'H2' },
    { c: '#080808',       n: 'Ink' },
    { c: '#f4f1ea',       n: 'Paper' },
    { c: '#ffffff',       n: 'White' },
  ];
  row.innerHTML = `<span class="grad-pal-label">Color</span>`;
  colors.forEach(({ c, n }) => {
    const d = document.createElement('div');
    d.className = 'grad-pal-dot';
    d.style.background = c;
    d.dataset.c = c;
    d.title = `${n} — ${c}`;
    d.classList.toggle('applied', c.toLowerCase() === (T.grainColor||'#ec008c').toLowerCase());
    d.onclick = () => applyGrainColor(c);
    row.appendChild(d);
  });
}

// Also sync gradient slot UI when a template applies new colors
const _origApplyGradColor = applyGradColor;
function syncGradSlotsFromState() {
  const s1 = document.getElementById('gradSlot1Swatch');
  const s2 = document.getElementById('gradSlot2Swatch');
  const s3 = document.getElementById('gradSlot3Swatch');
  const s4 = document.getElementById('gradSlot4Swatch');
  const s5 = document.getElementById('gradSlot5Swatch');
  const c3 = T.gradC3 || '#8800cc';
  const c4 = T.gradC4 || '#ff6600';
  const c5 = T.gradC5 || '#00c878';
  if (s1) s1.style.background = T.gradC1;
  if (s2) s2.style.background = T.gradC2;
  if (s3) s3.style.background = c3;
  if (s4) s4.style.background = c4;
  if (s5) s5.style.background = c5;
  const gc1 = document.getElementById('gradC1'); if (gc1) gc1.value = T.gradC1;
  const gc2 = document.getElementById('gradC2'); if (gc2) gc2.value = T.gradC2;
  const gc3 = document.getElementById('gradC3'); if (gc3) gc3.value = c3;
  const gc4 = document.getElementById('gradC4'); if (gc4) gc4.value = c4;
  const gc5 = document.getElementById('gradC5'); if (gc5) gc5.value = c5;
  // Show/hide mesh-only slots based on current grad type
  document.querySelectorAll('.mesh-only').forEach(e => e.style.display = T.grad === 'mesh' ? 'flex' : 'none');
  updateGradPreviewStrip();
  updateGradPaletteApplied();
}

