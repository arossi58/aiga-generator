/* ════════════════════════════════════════════
   MATTER.JS PHYSICS ENGINE
════════════════════════════════════════════ */

/* Stable per-layer identity so bodies survive layer reorders/removes */
let _physIdSeq = 0;
function _physGetId(layer) {
  if (!layer._physId) layer._physId = ++_physIdSeq;
  return layer._physId;
}

const PHYS = {
  engine: null,
  world:  null,
  bodies: {},   // _physId → Matter.Body
  walls:  [],
  gravX:  0,
  gravY:  1,
};

/* ── Init / teardown ──────────────────────────────────────────────── */
function physInit() {
  if (PHYS.engine) return;
  PHYS.engine = Matter.Engine.create({ gravity: { x: PHYS.gravX, y: PHYS.gravY } });
  PHYS.world  = PHYS.engine.world;
  physUpdateWalls();
}

function physUpdateWalls() {
  if (!PHYS.engine) return;
  PHYS.walls.forEach(w => Matter.Composite.remove(PHYS.world, w));
  const t = 120;
  PHYS.walls = [
    Matter.Bodies.rectangle(TW/2,    -t/2,       TW+t*2, t,   { isStatic:true, label:'wall', restitution:0.4, friction:0.1 }),
    Matter.Bodies.rectangle(TW/2,    TH+t/2,     TW+t*2, t,   { isStatic:true, label:'wall', restitution:0.4, friction:0.1 }),
    Matter.Bodies.rectangle(-t/2,    TH/2,       t, TH+t*2,   { isStatic:true, label:'wall', restitution:0.4, friction:0.1 }),
    Matter.Bodies.rectangle(TW+t/2,  TH/2,       t, TH+t*2,   { isStatic:true, label:'wall', restitution:0.4, friction:0.1 }),
  ];
  Matter.Composite.add(PHYS.world, PHYS.walls);
}

/* ── Body size estimation ─────────────────────────────────────────── */
function _physBodyDims(layer) {
  if (layer.type === 'text') {
    const chars = Math.max(1, (layer.text || 'TEXT').replace(/\s/g,'').length);
    const w = Math.max(30, layer.size * chars * 0.58 * ((layer.sx||100)/100));
    const h = Math.max(24, layer.size * 1.25 * ((layer.sy||100)/100));
    return { w, h, shape:'rect' };
  }
  if (layer.type === 'image') {
    const s = ((layer.imgScale??100)/100) * ((layer.sx||100)/100);
    const dim = Math.max(40, 210 * s);
    return { w: dim, h: dim * ((layer.sy||100)/(layer.sx||100)), shape:'rect' };
  }
  if (layer.type === 'eye') {
    const r = Math.max(20, (layer.eyeSize||100)/100 * Math.min(TW,TH) * 0.11);
    return { w: r*2, h: r*2, r, shape:'circle' };
  }
  return { w: 60, h: 60, shape:'rect' };
}

/* ── Add / remove bodies ──────────────────────────────────────────── */
function physAddLayer(layer) {
  physInit();
  physRemoveLayer(layer);  // clean up old body first
  const id  = _physGetId(layer);
  const px  = (layer.x / 100) * TW;
  const py  = (layer.y / 100) * TH;
  const ang = (layer.rot || 0) * Math.PI / 180;
  const { w, h, r, shape } = _physBodyDims(layer);
  const opts = {
    angle:       ang,
    restitution: layer.physRestitution ?? 0.4,
    friction:    layer.physFriction    ?? 0.1,
    frictionAir: layer.physFrictionAir ?? 0.01,
    density:     layer.physDensity     ?? 0.001,
    label: `phys-${id}`,
  };
  const body = shape === 'circle'
    ? Matter.Bodies.circle(px, py, r, opts)
    : Matter.Bodies.rectangle(px, py, w, h, opts);
  Matter.Composite.add(PHYS.world, body);
  PHYS.bodies[id] = body;
}

function physRemoveLayer(layer) {
  const id   = layer._physId;
  const body = id && PHYS.bodies[id];
  if (body && PHYS.world) {
    Matter.Composite.remove(PHYS.world, body);
    delete PHYS.bodies[id];
  }
}

/* ── Per-frame step (called from animation RAF) ──────────────────── */
function physStep() {
  if (!PHYS.engine) return;
  if (!T.layers.some(l => l.phys)) return;
  Matter.Engine.update(PHYS.engine, 1000/60);
  T.layers.forEach(layer => {
    if (!layer.phys) return;
    const body = PHYS.bodies[_physGetId(layer)];
    if (!body) return;
    layer.x   = Math.round((body.position.x / TW) * 1000) / 10;
    layer.y   = Math.round((body.position.y / TH) * 1000) / 10;
    layer.rot = (body.angle * 180 / Math.PI) % 360;
  });
}

/* ── Toggle per-layer physics ────────────────────────────────────── */
function physToggleLayer(idx, lid) {
  const layer = T.layers[idx];
  layer.phys = !layer.phys;
  if (layer.phys) {
    physInit();
    physAddLayer(layer);
    if (!T.animating) typo_setAnim(true, document.getElementById('animOn'));
  } else {
    physRemoveLayer(layer);
  }
  buildLayerPane(lid);
  _physUpdateGravUI();
}

/* ── Impulses ─────────────────────────────────────────────────────── */
function physKick(idx, vx, vy) {
  const layer = T.layers[idx];
  const body  = layer && PHYS.bodies[_physGetId(layer)];
  if (!body) return;
  Matter.Body.setVelocity(body, { x: body.velocity.x + vx, y: body.velocity.y + vy });
  Matter.Body.setAngularVelocity(body, body.angularVelocity + (Math.random()-0.5)*0.1);
}

function physScatter() {
  T.layers.forEach((layer) => {
    if (!layer.phys) return;
    const body = PHYS.bodies[_physGetId(layer)];
    if (!body) return;
    const sp = 14 + Math.random() * 10;
    const angle = Math.random() * Math.PI * 2;
    Matter.Body.setVelocity(body, { x: Math.cos(angle)*sp, y: Math.sin(angle)*sp });
    Matter.Body.setAngularVelocity(body, (Math.random()-0.5)*0.5);
  });
}

function physReset() {
  T.layers.forEach((layer) => {
    if (!layer.phys) return;
    const body = PHYS.bodies[_physGetId(layer)];
    if (!body) return;
    Matter.Body.setPosition(body, { x: (layer.x/100)*TW, y: (layer.y/100)*TH });
    Matter.Body.setAngle(body, (layer.rot||0)*Math.PI/180);
    Matter.Body.setVelocity(body, { x:0, y:0 });
    Matter.Body.setAngularVelocity(body, 0);
  });
}

/* ── Gravity ─────────────────────────────────────────────────────── */
function physSetGravity(x, y) {
  PHYS.gravX = x; PHYS.gravY = y;
  if (PHYS.engine) { PHYS.engine.gravity.x = x; PHYS.engine.gravity.y = y; }
}

/* ── Canvas resize hook (call from typo_resize) ──────────────────── */
function physOnResize() {
  physUpdateWalls();
  T.layers.forEach(layer => { if (layer.phys) physAddLayer(layer); });
}

/* ── Update topbar gravity row visibility ────────────────────────── */
function _physUpdateGravUI() {
  const anyPhys = T.layers.some(l => l.phys);
  const row = document.getElementById('tb-phys-controls');
  if (row) row.style.display = anyPhys ? 'flex' : 'none';
}

/* ── Per-layer panel HTML ─────────────────────────────────────────── */
function physPanelHTML(lid, idx, layer) {
  const on = !!layer.phys;
  return `
<div class="cg">
  <div class="cg-title">Physics <span class="var-badge">MATTER</span></div>
  <button class="phys-toggle-btn${on?' active':''}" onclick="physToggleLayer(${idx},'${lid}')">
    ${on ? '⬡ Physics On' : '⬡ Physics Off'}
  </button>
  ${on ? `<div class="phys-props">
    <div class="sl-row"><span class="sl-label">Bounce</span>
      <div class="sl-wrap"><input type="range" min="0" max="100" value="${Math.round((layer.physRestitution??0.4)*100)}"
        oninput="T.layers[${idx}].physRestitution=+this.value/100;var _b=PHYS.bodies[T.layers[${idx}]._physId];if(_b)_b.restitution=T.layers[${idx}].physRestitution;document.getElementById('${lid}-physBounce').textContent=this.value+'%';">
      </div><span class="sl-val" id="${lid}-physBounce">${Math.round((layer.physRestitution??0.4)*100)}%</span></div>
    <div class="sl-row"><span class="sl-label">Friction</span>
      <div class="sl-wrap"><input type="range" min="0" max="100" value="${Math.round((layer.physFriction??0.1)*100)}"
        oninput="T.layers[${idx}].physFriction=+this.value/100;var _b=PHYS.bodies[T.layers[${idx}]._physId];if(_b)_b.friction=T.layers[${idx}].physFriction;document.getElementById('${lid}-physFric').textContent=this.value+'%';">
      </div><span class="sl-val" id="${lid}-physFric">${Math.round((layer.physFriction??0.1)*100)}%</span></div>
    <div class="sl-row"><span class="sl-label">Air Drag</span>
      <div class="sl-wrap"><input type="range" min="0" max="100" value="${Math.round((layer.physFrictionAir??0.01)*1000)}"
        oninput="T.layers[${idx}].physFrictionAir=+this.value/1000;var _b=PHYS.bodies[T.layers[${idx}]._physId];if(_b)_b.frictionAir=T.layers[${idx}].physFrictionAir;document.getElementById('${lid}-physDrag').textContent=this.value;">
      </div><span class="sl-val" id="${lid}-physDrag">${Math.round((layer.physFrictionAir??0.01)*1000)}</span></div>
    <div class="phys-kick-row">
      <button class="phys-kick-btn" onclick="physKick(${idx},-10,0)">← Left</button>
      <button class="phys-kick-btn" onclick="physKick(${idx},10,0)">Right →</button>
      <button class="phys-kick-btn" onclick="physKick(${idx},0,-14)">↑ Up</button>
      <button class="phys-kick-btn" onclick="physKick(${idx},(Math.random()-.5)*20,(Math.random()-.5)*20)">↻ Spin</button>
    </div>
  </div>` : ''}
</div>`;
}
