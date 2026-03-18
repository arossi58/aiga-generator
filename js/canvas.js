/* ── Layer pane builder ── */
function buildLayerPane(lid){
  ensureLayerPane(lid);
  const idx=lidToIdx(lid);
  const layer=T.layers[idx];
  if(!layer) return;
  // Eye layer
  if(layer.type==='eye'){
    const blendModes=['source-over','multiply','screen','overlay','difference','color-dodge'];
    const gazeDirs=[[-1,-1,'↖'],[0,-1,'↑'],[1,-1,'↗'],[-1,0,'←'],[0,0,'●'],[1,0,'→'],[-1,1,'↙'],[0,1,'↓'],[1,1,'↘']];
    document.getElementById(`pane-${lid}`).innerHTML=`
    <div class="cg">
      <div class="cg-title">Eye</div>
      <div class="bg-opts-col" id="${lid}-arr">
        <div class="bg-opt${layer.arrangement==='single'?' active':''}" onclick="T.layers[${idx}].arrangement='single';this.closest('.bg-opts-col').querySelectorAll('.bg-opt').forEach(e=>e.classList.remove('active'));this.classList.add('active');document.getElementById('${lid}-tile-opts').style.display='none';document.getElementById('${lid}-circ-opts').style.display='none';typo_render();">● Single</div>
        <div class="bg-opt${layer.arrangement==='tile'?' active':''}" onclick="T.layers[${idx}].arrangement='tile';this.closest('.bg-opts-col').querySelectorAll('.bg-opt').forEach(e=>e.classList.remove('active'));this.classList.add('active');document.getElementById('${lid}-tile-opts').style.display='block';document.getElementById('${lid}-circ-opts').style.display='none';typo_render();">▦ Tile</div>
        <div class="bg-opt${layer.arrangement==='circle'?' active':''}" onclick="T.layers[${idx}].arrangement='circle';this.closest('.bg-opts-col').querySelectorAll('.bg-opt').forEach(e=>e.classList.remove('active'));this.classList.add('active');document.getElementById('${lid}-tile-opts').style.display='none';document.getElementById('${lid}-circ-opts').style.display='block';typo_render();">◯ Ring</div>
      </div>
      <div class="sl-row" style="margin-top:8px;"><span class="sl-label">Size</span>
        <div class="sl-wrap"><input type="range" min="10" max="400" value="${layer.eyeSize||100}" id="${lid}-eyeSize" oninput="T.layers[${idx}].eyeSize=+this.value;document.getElementById('${lid}-eyeSizeVal').textContent=this.value;typo_render();"></div>
        <span class="sl-val" id="${lid}-eyeSizeVal">${layer.eyeSize||100}</span></div>
      <div id="${lid}-tile-opts" style="display:${layer.arrangement==='tile'?'block':'none'}">
        <div class="sl-row"><span class="sl-label">Rows</span>
          <div class="sl-wrap"><input type="range" min="1" max="20" value="${layer.tileRows||3}" id="${lid}-tileRows" oninput="T.layers[${idx}].tileRows=+this.value;document.getElementById('${lid}-tileRowsVal').textContent=this.value;typo_render();"></div>
          <span class="sl-val" id="${lid}-tileRowsVal">${layer.tileRows||3}</span></div>
        <div class="sl-row"><span class="sl-label">Cols</span>
          <div class="sl-wrap"><input type="range" min="1" max="20" value="${layer.tileCols||4}" id="${lid}-tileCols" oninput="T.layers[${idx}].tileCols=+this.value;document.getElementById('${lid}-tileColsVal').textContent=this.value;typo_render();"></div>
          <span class="sl-val" id="${lid}-tileColsVal">${layer.tileCols||4}</span></div>
        <div class="sl-row"><span class="sl-label">Gap X</span>
          <div class="sl-wrap"><input type="range" min="100" max="400" value="${Math.round((layer.tileSpacingX||1.8)*100)}" id="${lid}-tileSpX" oninput="T.layers[${idx}].tileSpacingX=+this.value/100;document.getElementById('${lid}-tileSpXVal').textContent=this.value+'%';typo_render();"></div>
          <span class="sl-val" id="${lid}-tileSpXVal">${Math.round((layer.tileSpacingX||1.8)*100)}%</span></div>
        <div class="sl-row"><span class="sl-label">Gap Y</span>
          <div class="sl-wrap"><input type="range" min="100" max="400" value="${Math.round((layer.tileSpacingY||1.5)*100)}" id="${lid}-tileSpY" oninput="T.layers[${idx}].tileSpacingY=+this.value/100;document.getElementById('${lid}-tileSpYVal').textContent=this.value+'%';typo_render();"></div>
          <span class="sl-val" id="${lid}-tileSpYVal">${Math.round((layer.tileSpacingY||1.5)*100)}%</span></div>
      </div>
      <div id="${lid}-circ-opts" style="display:${layer.arrangement==='circle'?'block':'none'}">
        <div class="sl-row"><span class="sl-label">Count</span>
          <div class="sl-wrap"><input type="range" min="1" max="24" value="${layer.circleCount||8}" id="${lid}-circleCount" oninput="T.layers[${idx}].circleCount=+this.value;document.getElementById('${lid}-circleCountVal').textContent=this.value;typo_render();"></div>
          <span class="sl-val" id="${lid}-circleCountVal">${layer.circleCount||8}</span></div>
        <div class="sl-row"><span class="sl-label">Radius</span>
          <div class="sl-wrap"><input type="range" min="5" max="50" value="${layer.circleRadius||30}" id="${lid}-circleRadius" oninput="T.layers[${idx}].circleRadius=+this.value;document.getElementById('${lid}-circleRadiusVal').textContent=this.value+'%';typo_render();"></div>
          <span class="sl-val" id="${lid}-circleRadiusVal">${layer.circleRadius||30}%</span></div>
      </div>
    </div>
    <div class="cg">
      <div class="cg-title">Look Direction</div>
      <div class="gaze-grid" id="${lid}-gaze">
        ${gazeDirs.map(([lx,ly,icon])=>`<button class="gaze-btn${layer.lookMode==='center'&&layer.lookX===lx&&layer.lookY===ly?' active':''}" onclick="T.layers[${idx}].lookX=${lx};T.layers[${idx}].lookY=${ly};T.layers[${idx}].lookMode='center';this.closest('.gaze-grid').querySelectorAll('.gaze-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active');document.getElementById('${lid}-look-anim').style.display='none';document.getElementById('${lid}-look-modes').querySelectorAll('.seg-btn').forEach(b=>b.classList.remove('active'));typo_render();">${icon}</button>`).join('')}
      </div>
      <div class="cg-title" style="margin-top:10px;">Animate</div>
      <div class="seg" style="flex-wrap:wrap;gap:4px;" id="${lid}-look-modes">
        ${[['wander','Wander'],['circle','Circle'],['h-scan','H·Scan'],['v-scan','V·Scan'],['toward-center','→ Center']].map(([m,lbl])=>`<button class="seg-btn${layer.lookMode===m?' active':''}" onclick="T.layers[${idx}].lookMode='${m}';this.closest('.seg').querySelectorAll('.seg-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active');document.getElementById('${lid}-gaze').querySelectorAll('.gaze-btn').forEach(b=>b.classList.remove('active'));document.getElementById('${lid}-look-anim').style.display='block';document.getElementById('${lid}-look-random-row').style.display='${'wander'===m?'block':'none'}';typo_render();">${lbl}</button>`).join('')}
      </div>
      <div id="${lid}-look-anim" style="display:${['wander','circle','h-scan','v-scan','toward-center'].includes(layer.lookMode)?'block':'none'}">
        <div class="sl-row" style="margin-top:8px;"><span class="sl-label">Speed</span>
          <div class="sl-wrap"><input type="range" min="0.1" max="10" step="0.1" value="${layer.lookSpeed??1}" id="${lid}-lookSpd" oninput="T.layers[${idx}].lookSpeed=+this.value;document.getElementById('${lid}-lookSpdVal').textContent=this.value;typo_render();"></div>
          <span class="sl-val" id="${lid}-lookSpdVal">${layer.lookSpeed??1}</span></div>
        <div id="${lid}-look-random-row" style="display:${layer.lookMode==='wander'?'block':'none'}">
          <div class="sl-row"><span class="sl-label">Randomness</span>
            <div class="sl-wrap"><input type="range" min="0" max="1" step="0.05" value="${layer.wanderRandom??0}" id="${lid}-wanderRandom" oninput="T.layers[${idx}].wanderRandom=+this.value;document.getElementById('${lid}-wanderRandomVal').textContent=Math.round(this.value*100)+'%';typo_render();"></div>
            <span class="sl-val" id="${lid}-wanderRandomVal">${Math.round((layer.wanderRandom??0)*100)}%</span></div>
        </div>
        <div class="sl-row"><span class="sl-label">Amount</span>
          <div class="sl-wrap"><input type="range" min="0" max="1" step="0.05" value="${layer.lookAmt??1}" id="${lid}-lookAmt" oninput="T.layers[${idx}].lookAmt=+this.value;document.getElementById('${lid}-lookAmtVal').textContent=Math.round(this.value*100)+'%';typo_render();"></div>
          <span class="sl-val" id="${lid}-lookAmtVal">${Math.round((layer.lookAmt??1)*100)}%</span></div>
        <div class="sl-row"><span class="sl-label">Stagger</span>
          <button class="seg-btn${layer.lookStagger!==false?' active':''}" style="margin-left:auto;" onclick="T.layers[${idx}].lookStagger=!T.layers[${idx}].lookStagger;this.classList.toggle('active',T.layers[${idx}].lookStagger);typo_render();">${layer.lookStagger!==false?'On':'Off'}</button>
        </div>
      </div>
    </div>
    <div class="cg">
      <div class="cg-title">Color</div>
      <div class="seg" style="margin-bottom:8px;">
        <button class="seg-btn${layer.colorMode==='fixed'?' active':''}" onclick="T.layers[${idx}].colorMode='fixed';this.closest('.seg').querySelectorAll('.seg-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active');typo_render();">Fixed</button>
        <button class="seg-btn${layer.colorMode==='palette'?' active':''}" onclick="T.layers[${idx}].colorMode='palette';this.closest('.seg').querySelectorAll('.seg-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active');typo_render();">Palette</button>
        <button class="seg-btn${layer.colorMode==='random'?' active':''}" onclick="T.layers[${idx}].colorMode='random';this.closest('.seg').querySelectorAll('.seg-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active');typo_render();">Random</button>
      </div>
      <div class="sl-row"><span class="sl-label">Iris</span>
        <div class="cdot-row" id="${lid}-pal-colors"></div>
        <input type="color" value="${layer.irisColor||'#e5007d'}" style="width:26px;height:26px;border:none;cursor:pointer;background:none;padding:0;flex-shrink:0;" oninput="T.layers[${idx}].irisColor=this.value;typo_render();"></div>
      <div class="sl-row"><span class="sl-label">Outline</span>
        <input type="color" value="${layer.outlineColor||'#080808'}" style="width:26px;height:26px;border:none;cursor:pointer;background:none;padding:0;" oninput="T.layers[${idx}].outlineColor=this.value;typo_render();"></div>
      <div class="sl-row"><span class="sl-label">Sclera</span>
        <input type="color" value="${layer.scleraColor||'#ffffff'}" style="width:26px;height:26px;border:none;cursor:pointer;background:none;padding:0;" oninput="T.layers[${idx}].scleraColor=this.value;typo_render();"></div>
      <div class="sl-row"><span class="sl-label">Pupil</span>
        <input type="color" value="${layer.pupilColor||'#080808'}" style="width:26px;height:26px;border:none;cursor:pointer;background:none;padding:0;" oninput="T.layers[${idx}].pupilColor=this.value;typo_render();"></div>
    </div>
    <div class="cg">
      <div class="cg-title">Position &amp; Transform
        <div class="align-btns">
          <button class="align-btn" title="Center H" onclick="T.layers[${idx}].x=50;document.getElementById('${lid}-x').value=50;document.getElementById('${lid}-xVal').textContent='50%';typo_render();">↔</button>
          <button class="align-btn" title="Center V" onclick="T.layers[${idx}].y=50;document.getElementById('${lid}-y').value=50;document.getElementById('${lid}-yVal').textContent='50%';typo_render();">↕</button>
        </div>
      </div>
      <div class="sl-row"><span class="sl-label">X</span>
        <div class="sl-wrap"><input type="range" min="0" max="100" value="${Math.round(layer.x)}" id="${lid}-x" oninput="T.layers[${idx}].x=+this.value;document.getElementById('${lid}-xVal').textContent=this.value+'%';typo_render();"></div>
        <span class="sl-val" id="${lid}-xVal">${Math.round(layer.x)}%</span></div>
      <div class="sl-row"><span class="sl-label">Y</span>
        <div class="sl-wrap"><input type="range" min="0" max="100" value="${Math.round(layer.y)}" id="${lid}-y" oninput="T.layers[${idx}].y=+this.value;document.getElementById('${lid}-yVal').textContent=this.value+'%';typo_render();"></div>
        <span class="sl-val" id="${lid}-yVal">${Math.round(layer.y)}%</span></div>
      <div class="sl-row"><span class="sl-label">Rotate</span>
        <div class="sl-wrap"><input type="range" min="-180" max="180" value="${layer.rot||0}" id="${lid}-rot" oninput="T.layers[${idx}].rot=+this.value;document.getElementById('${lid}-rotVal').textContent=this.value+'°';typo_render();"></div>
        <span class="sl-val" id="${lid}-rotVal">${layer.rot||0}°</span></div>
      <div class="sl-row"><span class="sl-label">Scale X</span>
        <div class="sl-wrap"><input type="range" min="10" max="400" value="${layer.sx??100}" id="${lid}-sx" oninput="T.layers[${idx}].sx=+this.value;document.getElementById('${lid}-sxVal').textContent=this.value+'%';typo_render();"></div>
        <span class="sl-val" id="${lid}-sxVal">${layer.sx??100}%</span></div>
      <div class="sl-row"><span class="sl-label">Scale Y</span>
        <div class="sl-wrap"><input type="range" min="10" max="400" value="${layer.sy??100}" id="${lid}-sy" oninput="T.layers[${idx}].sy=+this.value;document.getElementById('${lid}-syVal').textContent=this.value+'%';typo_render();"></div>
        <span class="sl-val" id="${lid}-syVal">${layer.sy??100}%</span></div>
    </div>
    <div class="cg">
      <div class="cg-title">Appearance</div>
      <div class="sl-row"><span class="sl-label">Opacity</span>
        <div class="sl-wrap"><input type="range" min="5" max="100" value="${Math.round(layer.opacity)}" id="${lid}-op" oninput="T.layers[${idx}].opacity=+this.value;document.getElementById('${lid}-opVal').textContent=this.value+'%';typo_render();if(currentPanelMode==='layers')buildLayerStack();"></div>
        <span class="sl-val" id="${lid}-opVal">${Math.round(layer.opacity)}%</span></div>
      <div class="cg-title" style="margin-top:8px;">Blend</div>
      <div class="seg" style="flex-wrap:wrap;gap:4px;">
        ${blendModes.map(m=>`<button class="seg-btn${layer.blend===m?' active':''}" onclick="T.layers[${idx}].blend='${m}';this.closest('.seg').querySelectorAll('.seg-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active');typo_render();">${m}</button>`).join('')}
      </div>
      <div class="sl-row" style="margin-top:8px;"><span class="sl-label">FX</span>
        <button class="seg-btn${layer.excludeFromFX?' active':''}" style="margin-left:auto;" onclick="T.layers[${idx}].excludeFromFX=!T.layers[${idx}].excludeFromFX;this.classList.toggle('active',T.layers[${idx}].excludeFromFX);typo_render();">Above Effects</button>
      </div>
    </div>`;
    updatePlaygroundPaletteSwatches();
    return;
  }
  // Image layer: render a simpler panel
  if(layer.type==='image'){
    const blendModes=['source-over','multiply','screen','overlay','difference','color-dodge'];
    const imgDItems=[
      {d:'normal',i:'□',l:'Normal'},{d:'wave',i:'∿',l:'Wave'},
      {d:'stagger',i:'↕',l:'Bounce'},{d:'explode',i:'✳',l:'Pulse'},
      {d:'glitch',i:'▓',l:'Glitch'},{d:'mirror',i:'⇅',l:'Mirror'},
    ];
    const imgDists=layer.dists||['normal'];
    document.getElementById(`pane-${lid}`).innerHTML=`
    <div class="cg">
      <div class="cg-title">Image</div>
      ${layer.imgSrc
        ? `<img class="img-thumb" src="${layer.imgSrc}" style="margin-bottom:8px;">
           <button class="cg-mini-btn" onclick="_imgUploadTargetLid='${lid}';document.getElementById('imgLayerFileInput').click();">↻ Replace</button>`
        : `<div class="img-upload-area" onclick="_imgUploadTargetLid='${lid}';document.getElementById('imgLayerFileInput').click();">
             <span class="iua-icon">⬆</span>
             <span class="iua-label">Upload Image</span>
             <span class="iua-hint">PNG, JPG, GIF — max 2MB</span>
           </div>`}
    </div>
    <div class="cg">
      <div class="cg-title">Position &amp; Transform
        <div class="align-btns">
          <button class="align-btn" title="Center H" onclick="T.layers[${idx}].x=50;document.getElementById('${lid}-x').value=50;document.getElementById('${lid}-xVal').textContent='50%';typo_render();">↔</button>
          <button class="align-btn" title="Center V" onclick="T.layers[${idx}].y=50;document.getElementById('${lid}-y').value=50;document.getElementById('${lid}-yVal').textContent='50%';typo_render();">↕</button>
        </div>
      </div>
      <div class="sl-row"><span class="sl-label">X</span>
        <div class="sl-wrap"><input type="range" min="0" max="100" value="${Math.round(layer.x)}" id="${lid}-x" oninput="T.layers[${idx}].x=+this.value;document.getElementById('${lid}-xVal').textContent=this.value+'%';typo_render();"></div>
        <span class="sl-val" id="${lid}-xVal">${Math.round(layer.x)}%</span></div>
      <div class="sl-row"><span class="sl-label">Y</span>
        <div class="sl-wrap"><input type="range" min="0" max="100" value="${Math.round(layer.y)}" id="${lid}-y" oninput="T.layers[${idx}].y=+this.value;document.getElementById('${lid}-yVal').textContent=this.value+'%';typo_render();"></div>
        <span class="sl-val" id="${lid}-yVal">${Math.round(layer.y)}%</span></div>
      <div class="sl-row"><span class="sl-label">Scale</span>
        <div class="sl-wrap"><input type="range" min="5" max="300" value="${layer.imgScale??100}" id="${lid}-imgScale" oninput="T.layers[${idx}].imgScale=+this.value;document.getElementById('${lid}-imgScaleVal').textContent=this.value+'%';typo_render();"></div>
        <span class="sl-val" id="${lid}-imgScaleVal">${layer.imgScale??100}%</span></div>
      <div class="sl-row"><span class="sl-label">Rotate</span>
        <div class="sl-wrap"><input type="range" min="-180" max="180" value="${layer.rot||0}" id="${lid}-rot" oninput="T.layers[${idx}].rot=+this.value;document.getElementById('${lid}-rotVal').textContent=this.value+'°';typo_render();"></div>
        <span class="sl-val" id="${lid}-rotVal">${layer.rot||0}°</span></div>
      <div class="sl-row"><span class="sl-label">Scale X</span>
        <div class="sl-wrap"><input type="range" min="10" max="400" value="${layer.sx??100}" id="${lid}-sx" oninput="T.layers[${idx}].sx=+this.value;document.getElementById('${lid}-sxVal').textContent=this.value+'%';typo_render();"></div>
        <span class="sl-val" id="${lid}-sxVal">${layer.sx??100}%</span></div>
      <div class="sl-row"><span class="sl-label">Scale Y</span>
        <div class="sl-wrap"><input type="range" min="10" max="400" value="${layer.sy??100}" id="${lid}-sy" oninput="T.layers[${idx}].sy=+this.value;document.getElementById('${lid}-syVal').textContent=this.value+'%';typo_render();"></div>
        <span class="sl-val" id="${lid}-syVal">${layer.sy??100}%</span></div>
    </div>
    <div class="cg">
      <div class="cg-title">Effects</div>
      <div class="dist-grid" id="${lid}-dist-grid">
        ${imgDItems.map(item=>`<button class="dist-btn${imgDists.includes(item.d)?' active':''}" onclick="toggleImgDist('${lid}',${idx},'${item.d}')"><span class="di">${item.i}</span>${item.l}</button>`).join('')}
      </div>
      <div style="font-size:7px;color:rgba(255,255,255,.2);margin-top:4px;letter-spacing:.1em;">Click multiple to stack</div>
      <div style="margin-top:8px;" id="${lid}-dist-controls">${buildDistControls(lid,layer)}</div>
    </div>
    <div class="cg">
      <div class="cg-title">Appearance</div>
      <div class="sl-row"><span class="sl-label">Opacity</span>
        <div class="sl-wrap"><input type="range" min="5" max="100" value="${Math.round(layer.opacity)}" id="${lid}-op" oninput="T.layers[${idx}].opacity=+this.value;document.getElementById('${lid}-opVal').textContent=this.value+'%';typo_render();if(currentPanelMode==='layers')buildLayerStack();"></div>
        <span class="sl-val" id="${lid}-opVal">${Math.round(layer.opacity)}%</span></div>
      <div class="cg-title" style="margin-top:8px;">Blend</div>
      <div class="seg" style="flex-wrap:wrap;gap:4px;">
        ${blendModes.map(m=>`<button class="seg-btn${layer.blend===m?' active':''}" onclick="T.layers[${idx}].blend='${m}';this.closest('.seg').querySelectorAll('.seg-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active');typo_render();">${m}</button>`).join('')}
      </div>
      <div class="sl-row" style="margin-top:8px;"><span class="sl-label">FX</span>
        <button class="seg-btn${layer.excludeFromFX?' active':''}" style="margin-left:auto;" onclick="T.layers[${idx}].excludeFromFX=!T.layers[${idx}].excludeFromFX;this.classList.toggle('active',T.layers[${idx}].excludeFromFX);typo_render();">Above Effects</button>
      </div>
    </div>`;
    return;
  }
  const dotColors=['#e5007d','#4a9fff','#00c896','#d4af37','#ffffff','#f4f1ea'];
  const distItems=[
    {d:'normal',i:'Aa',l:'Normal'},{d:'wave',i:'∿',l:'Wave'},
    {d:'stagger',i:'↕',l:'Stagger'},{d:'explode',i:'✳',l:'Explode'},
    {d:'arch',i:'◡',l:'Arch'},{d:'tile',i:'▦',l:'Tile'},
    {d:'circle',i:'◯',l:'Circle'},{d:'mirror',i:'⇅',l:'Mirror'},
    {d:'glitch',i:'▓',l:'Glitch'},
  ];
  const blendModes=['source-over','multiply','screen','overlay','difference','color-dodge'];
  document.getElementById(`pane-${lid}`).innerHTML=`
    <div class="cg">
      <div class="cg-title">Text Content <button class="cg-mini-btn" onclick="randText('${lid}')">↻ Random</button></div>
      <textarea class="ti" id="${lid}-text" oninput="T.layers[${idx}].text=this.value;typo_render();if(currentPanelMode==='layers')buildLayerStack();">${layer.text}</textarea>
      <div class="chips" id="${lid}-chips">${buildChips(lid)}</div>
    </div>
    <div class="cg">
      <div class="cg-title">Typeface</div>
      <div class="seg">
        ${[['Roboto Flex','Flex'],['Fraunces','Fraunces'],['DM Mono','Mono'],['Recursive','Recursive']].map(([f,l])=>`<button class="seg-btn${layer.font===f?' active':''}" onclick="T.layers[${idx}].font='${f}';this.closest('.seg').querySelectorAll('.seg-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active');typo_render();">${l}</button>`).join('')}
      </div>
    </div>
    <div class="cg">
      <div class="cg-title">Style</div>
      <div class="seg">
        <button class="seg-btn${layer.style==='normal'?' active':''}" onclick="T.layers[${idx}].style='normal';this.closest('.seg').querySelectorAll('.seg-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active');typo_render();">Normal</button>
        <button class="seg-btn${layer.style==='italic'?' active':''}" onclick="T.layers[${idx}].style='italic';this.closest('.seg').querySelectorAll('.seg-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active');typo_render();">Italic</button>
        <button class="seg-btn${layer.bold?' active':''}" id="${lid}-bold" onclick="T.layers[${idx}].bold=!T.layers[${idx}].bold;this.classList.toggle('active');typo_render();">Bold</button>
      </div>
    </div>
    <div class="cg">
      <div class="cg-title">Color</div>
      <div class="palette-colors" id="${lid}-pal-colors"><span class="ps-label">From palette</span></div>
      <div class="color-row">
        ${dotColors.map(c=>`<div class="cdot${layer.color===c?' active':''}" style="background:${c};" data-c="${c}" onclick="T.layers[${idx}].color='${c}';this.closest('.color-row').querySelectorAll('.cdot').forEach(d=>d.classList.remove('active'));this.classList.add('active');typo_render();"></div>`).join('')}
        <input type="color" class="cust-color" value="${layer.color.startsWith('#')?layer.color:'#ffffff'}" oninput="T.layers[${idx}].color=this.value;typo_render();">
      </div>
    </div>
    <div class="cg">
      <div class="cg-title">Size & Scale</div>
      ${sliderRow(lid,idx,'size','Font Size',8,500,layer.size,'px')}
      ${sliderRow(lid,idx,'sx','Scale X',10,400,layer.sx,'%')}
      ${sliderRow(lid,idx,'sy','Scale Y',10,400,layer.sy,'%')}
    </div>
    <div class="cg">
      <div class="cg-title">Position & Transform
        <div class="align-btns">
          <button class="align-btn" title="Center horizontally" onclick="T.layers[${idx}].x=50;document.getElementById('${lid}-x').value=50;document.getElementById('${lid}-xVal').textContent='50%';typo_render();">↔</button>
          <button class="align-btn" title="Center vertically" onclick="T.layers[${idx}].y=50;document.getElementById('${lid}-y').value=50;document.getElementById('${lid}-yVal').textContent='50%';typo_render();">↕</button>
        </div>
      </div>
      ${sliderRow(lid,idx,'x','X',-50,150,layer.x,'%')}
      ${sliderRow(lid,idx,'y','Y',-50,150,layer.y,'%')}
      ${sliderRow(lid,idx,'rot','Rotate',-180,180,layer.rot,'°')}
      ${sliderRow(lid,idx,'ls','Tracking',-10,120,layer.ls,'')}
      ${sliderRow(lid,idx,'op','Opacity',1,100,layer.opacity,'%')}
    </div>
    <div class="cg">
      <div class="cg-title">Blend Mode</div>
      <div class="blend-seg seg">
        ${blendModes.map(b=>`<button class="seg-btn${layer.blend===b?' active':''}" onclick="T.layers[${idx}].blend='${b}';this.closest('.seg').querySelectorAll('.seg-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active');typo_render();">${b==='source-over'?'Normal':b.replace('-',' ')}</button>`).join('')}
      </div>
      <div class="sl-row" style="margin-top:8px;"><span class="sl-label">FX</span>
        <button class="seg-btn${layer.excludeFromFX?' active':''}" style="margin-left:auto;" onclick="T.layers[${idx}].excludeFromFX=!T.layers[${idx}].excludeFromFX;this.classList.toggle('active',T.layers[${idx}].excludeFromFX);typo_render();">Above Effects</button>
      </div>
    </div>
    <div class="cg">
      <div class="cg-title">Distortion</div>
      <div class="dist-grid" id="${lid}-dist-grid">
        ${distItems.map(d=>`<button class="dist-btn${(layer.dists||(layer.dist?[layer.dist]:['normal'])).includes(d.d)?' active':''}" onclick="toggleDist(${idx},'${d.d}','${lid}')"><span class="di">${d.i}</span>${d.l}</button>`).join('')}
      </div>
      <div style="font-size:7px;color:rgba(255,255,255,.2);margin-top:4px;letter-spacing:.1em;">Click multiple to stack</div>
    </div>
    <div class="cg" id="${lid}-dist-settings-cg">
      <div class="cg-title">Distortion Settings</div>
      <div id="${lid}-dist-settings">${buildDistControls(lid,layer)}</div>
    </div>
    <div class="cg">
      <div class="cg-title">Variable Type <span class="var-badge">AXIS</span></div>
      ${varAxisRow(lid,idx,'varWghtPat','varWghtMin','varWghtMax','varWghtSpd','varWghtEase','Wght',100,900,layer.varWghtPat||'none',layer.varWghtMin??200,layer.varWghtMax??800,layer.varWghtSpd??3,layer.varWghtEase||'linear')}
      ${varAxisRow(lid,idx,'varWidthPat','varWidthMin','varWidthMax','varWidthSpd','varWidthEase','Width',20,300,layer.varWidthPat||'none',layer.varWidthMin??60,layer.varWidthMax??140,layer.varWidthSpd??3,layer.varWidthEase||'linear')}
      ${varAxisRow(lid,idx,'varSkewPat','varSkewMin','varSkewMax','varSkewSpd','varSkewEase','Skew',-60,60,layer.varSkewPat||'none',layer.varSkewMin??-25,layer.varSkewMax??25,layer.varSkewSpd??3,layer.varSkewEase||'linear')}
      <div style="font-size:7px;color:rgba(229,0,125,.5);letter-spacing:.12em;text-transform:uppercase;margin:8px 0 2px;">Fraunces Only</div>
      ${varAxisRow(lid,idx,'varSoftPat','varSoftMin','varSoftMax','varSoftSpd','varSoftEase','SOFT',0,100,layer.varSoftPat||'none',layer.varSoftMin??0,layer.varSoftMax??100,layer.varSoftSpd??3,layer.varSoftEase||'linear')}
      ${varAxisRow(lid,idx,'varWonkPat','varWonkMin','varWonkMax','varWonkSpd','varWonkEase','WONK',0,1,layer.varWonkPat||'none',layer.varWonkMin??0,layer.varWonkMax??1,layer.varWonkSpd??3,layer.varWonkEase||'linear',0.01)}
      <div style="font-size:7px;color:rgba(255,255,255,.35);letter-spacing:.12em;text-transform:uppercase;margin:8px 0 2px;">Transform</div>
      ${varAxisRow(lid,idx,'varScaleXPat','varScaleXMin','varScaleXMax','varScaleXSpd','varScaleXEase','Scale X',10,400,layer.varScaleXPat||'none',layer.varScaleXMin??50,layer.varScaleXMax??150,layer.varScaleXSpd??3,layer.varScaleXEase||'linear')}
      ${varAxisRow(lid,idx,'varScaleYPat','varScaleYMin','varScaleYMax','varScaleYSpd','varScaleYEase','Scale Y',10,400,layer.varScaleYPat||'none',layer.varScaleYMin??50,layer.varScaleYMax??150,layer.varScaleYSpd??3,layer.varScaleYEase||'linear')}
      ${varAxisRow(lid,idx,'varRotPat','varRotMin','varRotMax','varRotSpd','varRotEase','Rotate',-180,180,layer.varRotPat||'none',layer.varRotMin??-45,layer.varRotMax??45,layer.varRotSpd??3,layer.varRotEase||'linear')}
      ${varAxisRow(lid,idx,'varTrackPat','varTrackMin','varTrackMax','varTrackSpd','varTrackEase','Track',-20,120,layer.varTrackPat||'none',layer.varTrackMin??-5,layer.varTrackMax??60,layer.varTrackSpd??3,layer.varTrackEase||'linear')}
    </div>`;
}

function toggleDist(idx,d,lid){
  const layer=T.layers[idx];
  // Normalize to dists array (backward compat)
  if(!layer.dists)layer.dists=[layer.dist||'normal'];
  const pos=layer.dists.indexOf(d);
  if(pos>=0){
    // Remove — but keep at least one mode
    if(layer.dists.length>1)layer.dists.splice(pos,1);
    else layer.dists=['normal'];
  }else{
    // Adding 'normal' clears all others
    if(d==='normal'){layer.dists=['normal'];}
    else{
      // Adding any real dist removes 'normal' from the list
      const ni=layer.dists.indexOf('normal');
      if(ni>=0)layer.dists.splice(ni,1);
      // circle and tile are mutually exclusive layout modes
      if(d==='circle'){const ti=layer.dists.indexOf('tile');if(ti>=0)layer.dists.splice(ti,1);}
      if(d==='tile'){const ci=layer.dists.indexOf('circle');if(ci>=0)layer.dists.splice(ci,1);}
      layer.dists.push(d);
    }
  }
  // Re-render the dist grid buttons in place (no full panel rebuild)
  const grid=document.getElementById(`${lid}-dist-grid`);
  if(grid){
    grid.querySelectorAll('.dist-btn').forEach(btn=>{
      const bd=btn.querySelector('.di')?.nextSibling?.textContent?.trim();
      // match by icon text in the button
    });
    // Simpler: just update active class based on dists
    const dNow=layer.dists;
    grid.querySelectorAll('.dist-btn').forEach((btn,i)=>{
      const distNames=['normal','wave','stagger','explode','arch','tile','circle','mirror','glitch'];
      btn.classList.toggle('active',dNow.includes(distNames[i]));
    });
  }
  // Refresh per-distortion settings panel
  const dsEl=document.getElementById(`${lid}-dist-settings`);
  if(dsEl)dsEl.innerHTML=buildDistControls(lid,layer);
  typo_render();
}

function sliderRow(lid,idx,param,label,min,max,val,unit){
  const map={size:'size',sx:'sx',sy:'sy',x:'x',y:'y',rot:'rot',ls:'ls',op:'opacity',da:'distAmt',ds:'distSpd',varSpd:'varSpd'};
  const field=map[param]||param;
  return `<div class="sl-row">
    <span class="sl-label">${label}</span>
    <div class="sl-wrap"><input type="range" min="${min}" max="${max}" value="${val}" id="${lid}-${param}" oninput="T.layers[${idx}].${field}=+this.value;document.getElementById('${lid}-${param}Val').textContent=this.value+'${unit}';typo_render();"></div>
    <span class="sl-val" id="${lid}-${param}Val">${val}${unit}</span>
  </div>`;
}

const _distLabels={wave:'Wave',stagger:'Stagger',explode:'Explode',arch:'Arch',tile:'Tile',circle:'Circle',mirror:'Mirror',glitch:'Glitch'};
function buildDistControls(lid,layer){
  const idx=lidToIdx(lid);
  const dists=layer.dists||['normal'];
  const active=dists.filter(d=>d!=='normal');
  if(!active.length)return '<div style="font-size:9px;color:rgba(255,255,255,.25);padding:4px 0;">Select a distortion above</div>';
  return active.map(d=>{
    if(d==='circle'){
      const s=layer.distSettings?.circle||{amt:35,spd:20};
      const rings=layer.circleRings||1;
      const orient=layer.circleOrient||'tangent';
      const orientOpts=[['tangent','Tangent'],['radial-out','Radial ↑'],['radial-in','Radial ↓'],['upright','Upright']];
      return `<div style="margin-bottom:8px;">
  <div style="font-size:8px;color:rgba(255,255,255,.35);letter-spacing:.12em;text-transform:uppercase;margin-bottom:4px;">Circle</div>
  <div class="sl-row"><span class="sl-label">Radius</span>
    <div class="sl-wrap"><input type="range" min="5" max="80" value="${s.amt}" oninput="setDistParam(${idx},'circle','amt',+this.value);document.getElementById('${lid}-circle-amtVal').textContent=this.value;typo_render();"></div>
    <span class="sl-val" id="${lid}-circle-amtVal">${s.amt}</span>
  </div>
  <div class="sl-row"><span class="sl-label">Speed</span>
    <div class="sl-wrap"><input type="range" min="0" max="100" value="${s.spd}" oninput="setDistParam(${idx},'circle','spd',+this.value);document.getElementById('${lid}-circle-spdVal').textContent=this.value;typo_render();"></div>
    <span class="sl-val" id="${lid}-circle-spdVal">${s.spd}</span>
  </div>
  <div class="sl-row"><span class="sl-label">Rings</span>
    <div class="sl-wrap"><input type="range" min="1" max="6" value="${rings}" oninput="T.layers[${idx}].circleRings=+this.value;document.getElementById('${lid}-circleRingsVal').textContent=this.value;typo_render();"></div>
    <span class="sl-val" id="${lid}-circleRingsVal">${rings}</span>
  </div>
  <div style="margin-top:6px;">
    <div style="font-size:7px;color:rgba(255,255,255,.25);letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px;">Orientation</div>
    <div class="seg" style="flex-wrap:wrap;gap:2px;">
      ${orientOpts.map(([v,l])=>`<button class="seg-btn${orient===v?' active':''}" onclick="T.layers[${idx}].circleOrient='${v}';this.closest('.seg').querySelectorAll('.seg-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active');typo_render();">${l}</button>`).join('')}
    </div>
  </div>
</div>`;
    }
    const s=layer.distSettings?.[d]||{amt:layer.distAmt||40,spd:layer.distSpd||30};
    return `<div style="margin-bottom:8px;">
  <div style="font-size:8px;color:rgba(255,255,255,.35);letter-spacing:.12em;text-transform:uppercase;margin-bottom:4px;">${_distLabels[d]||d}</div>
  <div class="sl-row"><span class="sl-label">Amount</span>
    <div class="sl-wrap"><input type="range" min="0" max="100" value="${s.amt}" oninput="setDistParam(${idx},'${d}','amt',+this.value);document.getElementById('${lid}-${d}-amtVal').textContent=this.value;typo_render();"></div>
    <span class="sl-val" id="${lid}-${d}-amtVal">${s.amt}</span>
  </div>
  <div class="sl-row"><span class="sl-label">Speed</span>
    <div class="sl-wrap"><input type="range" min="0" max="100" value="${s.spd}" oninput="setDistParam(${idx},'${d}','spd',+this.value);document.getElementById('${lid}-${d}-spdVal').textContent=this.value;typo_render();"></div>
    <span class="sl-val" id="${lid}-${d}-spdVal">${s.spd}</span>
  </div></div>`;
  }).join('');
}
function setDistParam(idx,dist,param,val){
  const layer=T.layers[idx];
  if(!layer.distSettings)layer.distSettings={};
  if(!layer.distSettings[dist])layer.distSettings[dist]={amt:layer.distAmt||40,spd:layer.distSpd||30};
  layer.distSettings[dist][param]=val;
}

function varAxisRow(lid,idx,patProp,minProp,maxProp,spdProp,easeProp,label,min,max,pat,minVal,maxVal,spd,ease,step){
  const pats=[['none','Off'],['gradient','→ Grad'],['gradient-r','← Grad'],['wave','Wave'],['bounce','Bounce'],['random','Rnd'],['stagger','Alt'],['pulse','Pulse'],['seq-lr','→ Seq'],['seq-rl','← Seq']];
  const eases=[['linear','Linear'],['ease-in','Ease In'],['ease-out','Ease Out'],['ease-in-out','In-Out'],['back','Back'],['elastic','Elastic']];
  const st=step||1;
  return `<div class="var-axis-block">
  <div class="var-row">
    <span class="var-row-label">${label}</span>
    <select class="var-sel" onchange="T.layers[${idx}].${patProp}=this.value;typo_render();">
      ${pats.map(([v,l])=>`<option value="${v}"${pat===v?' selected':''}>${l}</option>`).join('')}
    </select>
  </div>
  <div class="var-range-row">
    <span class="var-mini-label">Min</span>
    <input type="range" class="var-mini-sl" min="${min}" max="${max}" step="${st}" value="${minVal}" oninput="T.layers[${idx}].${minProp}=+this.value;this.nextElementSibling.textContent=this.value;typo_render();">
    <span class="var-mini-val">${minVal}</span>
    <span class="var-mini-label">Max</span>
    <input type="range" class="var-mini-sl" min="${min}" max="${max}" step="${st}" value="${maxVal}" oninput="T.layers[${idx}].${maxProp}=+this.value;this.nextElementSibling.textContent=this.value;typo_render();">
    <span class="var-mini-val">${maxVal}</span>
  </div>
  <div class="var-ease-row">
    <span class="var-mini-label">Spd</span>
    <input type="range" class="var-mini-sl" min="0" max="30" step="0.5" value="${spd}" oninput="T.layers[${idx}].${spdProp}=+this.value;this.nextElementSibling.textContent=this.value;typo_render();">
    <span class="var-mini-val">${spd}</span>
    <select class="var-ease-sel" onchange="T.layers[${idx}].${easeProp}=this.value;typo_render();">
      ${eases.map(([v,l])=>`<option value="${v}"${ease===v?' selected':''}>${l}</option>`).join('')}
    </select>
  </div>
</div>`;
}

function applyEase(v,ease){
  switch(ease){
    case 'ease-in':return v*v;
    case 'ease-out':return 1-(1-v)*(1-v);
    case 'ease-in-out':return v<0.5?2*v*v:1-2*(1-v)*(1-v);
    case 'back':{const c=1.70158;return v*v*((c+1)*v-c);}
    case 'elastic':return v===0||v===1?v:Math.pow(2,-10*v)*Math.sin((v*10-0.75)*(2*Math.PI)/3)+1;
    default:return v;
  }
}
function computeVariation(i,total,pattern,minVal,maxVal,t,spd,ease){
  if(!pattern||pattern==='none')return minVal;
  const norm=total>1?i/(total-1):0;
  const s=(spd??3)*0.012;
  let v;
  switch(pattern){
    case 'gradient':v=(norm+t*s*0.25)%1;break;
    case 'gradient-r':v=1-((norm+t*s*0.25)%1);break;
    case 'wave':v=0.5+0.5*Math.sin(t*s+i*0.85);break;
    case 'bounce':v=Math.abs(Math.sin((norm*2.5+t*s)*Math.PI));break;
    case 'random':v=Math.abs((Math.sin(i*127.1+t*s*7+311.7)*43758.5453)%1);break;
    case 'stagger':v=i%2===0?0.5+0.5*Math.sin(t*s):0.5-0.5*Math.sin(t*s);break;
    case 'pulse':v=0.5+0.5*Math.sin(t*s*1.8+i*1.4);break;
    case 'seq-lr':v=0.5+0.5*Math.sin(t*s-i*(2*Math.PI/Math.max(1,total-1)));break;
    case 'seq-rl':v=0.5+0.5*Math.sin(t*s+i*(2*Math.PI/Math.max(1,total-1)));break;
    default:v=0;
  }
  if(ease&&ease!=='linear')v=applyEase(v,ease);
  return minVal+(maxVal-minVal)*v;
}

function buildChips(lid){
  const pool=[...COPY.display.slice(0,5),...COPY.utility.slice(0,3)];
  const idx=lidToIdx(lid);
  return pool.map(c=>`<div class="chip" onclick="T.layers[${idx}].text='${c.replace(/'/g,"\\'")}';document.getElementById('${lid}-text').value='${c.replace(/'/g,"\\'")}';typo_render();">${c.length>13?c.slice(0,12)+'…':c}</div>`).join('');
}

function randText(lid){
  const idx=lidToIdx(lid);
  const pools=[COPY.display,COPY.editorial,COPY.utility];
  const t=R.p(R.p(pools));
  T.layers[idx].text=t;
  const el=document.getElementById(`${lid}-text`);if(el)el.value=t;
  typo_render();
}

/* ── Palette sync into layer swatches ── */
function updatePlaygroundPaletteSwatches(){
  const pal=PALETTE;
  const swatches=[
    {c:pal.magenta,n:'Mag'},{c:pal.primary,n:'Pri'},{c:pal.deep,n:'Deep'},
    {c:pal.surface,n:'Surf'},{c:pal.h1,n:'H1'},{c:pal.h2,n:'H2'},
  ];

  T.layers.forEach((layer,i)=>{
    if(layer.type==='image')return;
    const lid=`l${i+1}`;
    const container=document.getElementById(`${lid}-pal-colors`);
    if(!container)return;
    container.style.display='flex';
    container.innerHTML=`<span class="ps-label">From palette</span>`;
    swatches.forEach(s=>{
      const d=document.createElement('div');
      d.className='cdot ps-swatch';d.style.background=s.c;
      d.title=s.n+' '+s.c;
      d.onclick=()=>{
        if(layer.type==='eye')T.layers[i].irisColor=s.c;
        else T.layers[i].color=s.c;
        typo_render();
      };
      container.appendChild(d);
    });
  });

  // Riso ink palette
  const risopc=document.getElementById('riso-pal-colors');
  if(risopc){
    risopc.innerHTML=`<span class="ps-label">From palette</span>`;
    swatches.forEach(s=>{
      const d=document.createElement('div');
      d.className='cdot';d.style.background=s.c;d.style.width='16px';d.style.height='16px';
      d.title=s.n+' '+s.c;d.dataset.risoPal='1';
      d.onclick=()=>setRisoColor(s.c,d);
      risopc.appendChild(d);
    });
  }

  // BG palette — same set as generator display
  const bgpc=document.getElementById('bg-palette-colors');
  if(bgpc){
    bgpc.style.display='flex';bgpc.style.flexWrap='wrap';bgpc.style.gap='4px';
    bgpc.innerHTML=`<span class="ps-label">From palette</span>`;
    swatches.forEach(s=>{
      const d=document.createElement('div');
      d.className='cdot';d.style.background=s.c;d.title=s.n+' '+s.c;
      d.onclick=()=>{T.bg=s.c;typo_render();};
      bgpc.appendChild(d);
    });
  }

  // Update toolbar strip
  const strip=document.getElementById('palette-sync-strip');
  strip.classList.add('visible');
  // Remove old swatches (keep label)
  [...strip.querySelectorAll('.ps-swatch')].forEach(e=>e.remove());
  swatches.forEach(s=>{
    const d=document.createElement('div');
    d.className='ps-swatch';d.style.background=s.c;d.title=s.c;
    d.onclick=()=>{
      const activeTab=document.querySelector('.layer-tab.active')?.dataset.tab;
      if(activeTab&&activeTab!=='bg'){
        const idx=parseInt(activeTab[1])-1;
        T.layers[idx].color=s.c;typo_render();
        toast(`${s.n} → Layer ${idx+1}`);
      }
    };
    strip.appendChild(d);
  });
}

window.addEventListener('paletteChange',()=>updatePlaygroundPaletteSwatches());

/* ════════════════════════════════════════════
   AIGA LOGO OVERLAY
════════════════════════════════════════════ */
const _logoImgs={};
(()=>{const img=new Image();img.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjA0IiBoZWlnaHQ9IjIwNyIgdmlld0JveD0iMCAwIDYwNCAyMDciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0yMDcuMzIzIDBIMC4wMjQ1OTcyVjIwN0gyMDcuMzIzVjBaIiBmaWxsPSIjRUMwMDhDIi8+CjxwYXRoIGQ9Ik00MzAuMzQ2IDBIMzcyLjAxN0wyODQuOTg5IDg3LjIxMDhWMEgyNDMuNTM5VjIwNi45MjZIMjg0Ljk4OVYxNDYuMDM4TDMxMS4wMzQgMTIwLjAxTDM3Ny45MzggMjA2LjkyNkg0MzAuNjQxTDM0MC4zNDYgOTAuNDQ5TDQzMC4zNDYgMFoiIGZpbGw9ImJsYWNrIi8+CjxwYXRoIGQ9Ik01ODMuNDE4IDEzOS4yMThDNTY3LjEyOCAxNTYuOTU1IDU0Ny41OTUgMTY1LjUxNyA1MjUuMDg5IDE2NS41MTdDNDg5LjU2IDE2NS41MTcgNDYzLjUxNiAxNDAuMTAyIDQ2My41MTYgMTAzLjQ1MUM0NjMuNTE2IDY2LjgwMDMgNDg5LjU2IDQxLjM2MDggNTI1LjY3OCA0MS4zNjA4QzU0OC4xODUgNDEuMzYwOCA1NjUuMzU5IDUwLjI0MTMgNTgwLjc0IDY1Ljg5MjZMNjAwLjU2OCAyOC4wNjQ1QzU4MC43NjUgOS43NjM2OSA1NTQuNjk2IDAgNTI1Ljk3MyAwQzQ2Ni43NTkgMCA0MjIuMDY2IDQ0LjMyOTEgNDIyLjA2NiAxMDMuMTU3QzQyMi4wNjYgMTYxLjk4NCA0NjYuNzg0IDIwNi45MDIgNTI1LjY3OCAyMDYuOTAyQzU1Ni43NiAyMDYuOTAyIDU4My4xMjMgMTk2LjU0OSA2MDMuODM2IDE3Ny42MzVMNTgzLjQxOCAxMzkuMTk0VjEzOS4yMThaIiBmaWxsPSJibGFjayIvPgo8cGF0aCBkPSJNODguMTMzMSA4MS4xMjcxQzg2LjkwNDYgODEuNjY2OCA4Ni40NjIzIDgyLjMyOTIgODYuMTQyOSA4My4yODU5Qzg1Ljg5NzIgODQuMDIxOSA3Ni4zODg2IDEyNC4xMDcgNzYuMjY1NyAxMjQuNzk0Qzc2LjA2OTEgMTI1LjcwMiA3Ni4wMiAxMjYuNDg3IDc3LjA3NjUgMTI2Ljg3OUM3OC4xNTc2IDEyNy4zMjEgODMuNjEyMiAxMjkuMjM0IDg0LjAyOTkgMTI5LjQzQzg0LjQ0NzYgMTI5LjU3OCA4NC4zNDkzIDEyOS44NzIgODMuODgyNSAxMjkuODcySDYwLjU0MDhDNjAuMTIzMSAxMjkuODcyIDU5Ljg3NzQgMTI5Ljc0OSA2MC4yOTUxIDEyOS41NTNDNjAuNzYxOSAxMjkuMzMyIDY1LjkyMTcgMTI3LjQ5MiA2Ni4zODg1IDEyNy4yOTZDNjYuOTUzNiAxMjcuMDc1IDY4LjI4MDQgMTI2LjYwOSA2OC42NDkgMTI1LjQzMkM2OC44OTQ3IDEyNC41NDkgNzguNjczNiA4NC4yOTE3IDc4Ljg3MDEgODMuNTA2N0M3OS4wOTEzIDgyLjUyNTQgNzguOTkzIDgxLjU0NDEgNzcuODM4MiA4MS4xMjcxQzc3LjIyMzkgODAuODgxOCA3MS4yMDQzIDc4Ljg3MDIgNzEuMDMyMyA3OC43NzJDNzAuNzEyOCA3OC42NzM5IDcwLjcxMjggNzguNDUzMSA3MC45ODMxIDc4LjQ1MzFIOTUuNDc5NkM5NS43NDk4IDc4LjQ1MzEgOTUuOTk1NSA3OC42NDk0IDk1LjY1MTUgNzguNzQ3NUM5NS4yODMgNzguODQ1NiA5MS4yNTM1IDc5Ljk5ODYgOTAuODM1OCA4MC4xNDU4QzkwLjM2OSA4MC4yOTMgODguODk0OCA4MC43NTkxIDg4LjEzMzEgODEuMTAyNlY4MS4xMjcxWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTEzNS40NTUgMTI2LjcwN0MxMzQuNzY3IDEyNi45NzcgMTI2LjU2MSAxMzAuMTE3IDExOC42NzQgMTMwLjMxM0M5OC4zMjk3IDEzMC44NTMgOTAuOTA5NSAxMTYuNjk4IDk0LjQyMyAxMDMuNzk0Qzk2LjIxNjYgOTYuOTk5IDEwMC42NjQgOTAuNjIwNyAxMDYuMzQgODYuMTgwNEMxMDkuNjA3IDgzLjYyOTEgMTE5LjE5IDc3LjY5MjQgMTMxLjc5NCA3Ny42OTI0QzEzNC4xNTMgNzcuNjkyNCAxNDAuMTk3IDc3Ljk4NjggMTQ0LjY0NCA3OS4xMzk4QzE0Ni44MDcgNzkuNzA0IDE0Ni40ODcgODAuOTA2MSAxNDYuMjQxIDgxLjc4OTJDMTQ2LjA5NCA4Mi4yMDYyIDE0MS4zMjcgOTYuNTU3NCAxNDEuMTggOTYuOTI1NEMxNDAuOTgzIDk3LjQ2NTEgMTQwLjUxNyA5Ny40ODk2IDE0MC41MTcgOTYuOTAwOEMxNDAuNTE3IDk2LjU4MTkgMTQxLjEzMSA4My44NzQ0IDE0MS4wODIgODMuMzM0N0MxNDEuMDgyIDgyLjAxIDE0MS4wODIgODEuMTc1OSAxMzkuNTU4IDgwLjcwOThDMTM3LjQ3IDgwLjAyMjkgMTI3LjQ5NCA3OS4xNjQzIDEyMC4xMjMgODIuNTk4OEMxMDcuNzg5IDg4LjMzOTIgMTAwLjU5IDEwMS42MzYgMTAyLjA2NCAxMTIuMjA5QzEwMy4yNDQgMTIwLjkxOCAxMTAuMjIyIDEyOC4wNTYgMTIxLjI3OCAxMjguMzUxQzEyNC43NDMgMTI4LjQ0OSAxMjcuMjk4IDEyNy45MzQgMTI4LjAzNSAxMjcuNjg4QzEyOS4xMTYgMTI3LjM2OSAxMjkuMjYzIDEyNy4wNTEgMTI5LjUzNCAxMjYuNDEzQzEyOS43MyAxMjUuNzc1IDEzMS42MjIgMTE3Ljk3NCAxMzEuNjcxIDExNy42NTVDMTMxLjc3IDExNy4zMTEgMTMyLjIzNiAxMTYuMjA3IDEzMS4xMDYgMTE1Ljg4OUMxMjkuOTc2IDExNS41OTQgMTE5Ljk1MSAxMTIuODk2IDExOS40MzUgMTEyLjc0OEMxMTguOTE5IDExMi42MjYgMTE5LjE0MSAxMTIuMzU2IDExOS41MzQgMTEyLjM1NkgxMzguMzU0QzEzOS4xMTYgMTEyLjM1NiAxNDEuMTA2IDExMi4xODQgMTQwLjU5IDExNC4wNDlDMTQwLjAyNSAxMTUuOTYyIDEzNy4xNzUgMTI0LjkxNiAxMzYuOTI5IDEyNS41M0MxMzYuNzA4IDEyNi4xNjcgMTM2LjE0MyAxMjYuNTExIDEzNS40NTUgMTI2Ljc1NlYxMjYuNzA3WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTUzLjM2NjQgMTI2Ljg1NUM1Mi4wODg3IDEyNi4yNDEgNTEuOTkwNCAxMjUuMjYgNTEuOTQxMyAxMjQuNDVDNTEuOTQxMyAxMjMuNzE1IDUyLjYwNDcgNzcuMjAyMSA1Mi40MDgxIDc2LjgzNDFDNTIuMzA5OCA3Ni42MTMzIDUyLjAzOTYgNzYuNTg4OCA1MS43OTM5IDc2LjgzNDFDNTEuMDMyMiA3Ny41NyA2LjAxOTY5IDEyNi41NiA1LjIwODg3IDEyNy4wNzVDMy42MTE4MSAxMjguMzUxIDAuNDQyMjYzIDEyOS40MDYgMC4yNDU3MDIgMTI5LjQ4QzAuMjQ1NzAyIDEyOS41MDQgMC4xNDc0MjEgMTI5LjUyOSAwIDEyOS41NzhWMTI5Ljk0NkMwLjE0NzQyMSAxMjkuOTIxIDAuMjQ1NzAxIDEyOS45MjEgMC4yOTQ4NDIgMTI5LjkyMUgyNC4wMjk2QzI0LjM0OSAxMjkuOTIxIDI0LjQ0NzMgMTI5LjYyNyAyNC4xNzcgMTI5LjU3OEMyMi40MzI1IDEyOS4yMzQgMTQuNzY2NyAxMjcuNjQgMTMuNDM5OSAxMjcuMjQ3QzEyLjE2MjIgMTI2Ljg3OSAxMi4wMTQ4IDEyNi4xMTkgMTIuNTMwOCAxMjUuNDMyQzEyLjk0ODUgMTI0Ljc2OSAyNS4wNjE2IDEwOS44MjkgMjUuOTcwNyAxMDkuMTY3QzI3LjA1MTcgMTA4LjMwOCAyNy41MTg2IDEwOC4yMSAyOS40NTk2IDEwOC4xODZDMzAuMDczOSAxMDguMTYxIDMzLjY2MTEgMTA4LjA2MyAzNy4xMjU1IDEwOC4xODZDNDAuMDI0OCAxMDguMjM1IDQyLjgwMTIgMTA4LjQ4IDQzLjYxMiAxMDguNTU0QzQ1LjQwNTYgMTA4LjcwMSA0NS4yMDkxIDExMC4wMjYgNDUuMjA5MSAxMTAuNzEzQzQ1LjIwOTEgMTExLjM1IDQ0LjY5MzEgMTIyLjI5MiA0NC42NDQgMTI0LjE4MUM0NC41OTQ4IDEyNi4wOTQgNDQuMjc1NCAxMjYuMzY0IDQzLjA0NjkgMTI2LjgwNkM0Mi40MzI3IDEyNy4wMDIgMzQuMjk5OSAxMjkuNjAyIDM0LjAwNTEgMTI5Ljc0OUMzMy43MTAyIDEyOS44NDcgMzQuMTAzNCAxMjkuOTIxIDM0LjEwMzQgMTI5LjkyMUg1OS4yODc4QzU5LjY4MDkgMTI5LjkyMSA1OS44MDM3IDEyOS43MjUgNTkuNTgyNiAxMjkuNjAyQzU5LjAxNzUgMTI5LjM4MSA1NC41MjEyIDEyNy40NDMgNTMuMzQxOCAxMjYuODc5TDUzLjM2NjQgMTI2Ljg1NVpNNDUuNDMwMiAxMDQuNDgyQzQ1LjQzMDIgMTA1LjUzNiA0NS4wMTI1IDEwNi4xMjUgNDMuMjY4IDEwNi4xMjVDNDEuNTIzNiAxMDYuMTI1IDMxLjAwNzUgMTA2LjEyNSAzMS4wMDc1IDEwNi4xMjVDMjkuMTE1NiAxMDYuMTAxIDI5LjE2NDggMTA1LjA0NiAyOS44NzczIDEwNC4zMUMzMC41NDA3IDEwMy41IDQzLjQ0IDg5LjcxMzMgNDMuOTMxNCA4OS4xNDkxQzQ0Ljg0MDUgODguMTE4OCA0NS42NzU5IDg4LjE2NzggNDUuNjc1OSA4OS41OTA3QzQ1LjY3NTkgOTEuMDEzNSA0NS40NTQ4IDEwMy43OTUgNDUuNDU0OCAxMDQuNTMxTDQ1LjQzMDIgMTA0LjQ4MloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xOTcuNjQyIDEyOS41NzhDMTk3LjA3NyAxMjkuMzU3IDE5Mi41ODEgMTI3LjQxOSAxOTEuNDAxIDEyNi44NTVDMTkwLjA3NSAxMjYuMjQxIDE5MC4wMjYgMTI1LjI2IDE4OS45NzYgMTI0LjQ1QzE4OS45MjcgMTIzLjcxNSAxOTAuNjQgNzcuMjAyMSAxOTAuNDQzIDc2LjgzNDFDMTkwLjM0NSA3Ni42MTMzIDE5MC4wNzUgNzYuNTg4OCAxODkuODI5IDc2LjgzNDFDMTg5LjA2NyA3Ny41NyAxNDQuMDU1IDEyNi41NiAxNDMuMTk1IDEyNy4wNzVDMTQxLjU5OCAxMjguMzUxIDEzOC40NTMgMTI5LjQ1NSAxMzguMjgxIDEyOS41NzhDMTM4LjA4NCAxMjkuNjUxIDEzOC4wODQgMTI5LjkyMSAxMzguMzMgMTI5LjkyMUgxNjIuMDY1QzE2Mi4zODQgMTI5LjkyMSAxNjIuNDMzIDEyOS42MjcgMTYyLjIxMiAxMjkuNTc4QzE2MC40NDMgMTI5LjIzNCAxNTIuODAyIDEyNy42NCAxNTEuNDc1IDEyNy4yNDdDMTUwLjE5NyAxMjYuODc5IDE1MC4wNSAxMjYuMTE5IDE1MC41MTcgMTI1LjQzMkMxNTAuOTg0IDEyNC43NjkgMTYzLjA5NyAxMDkuODI5IDE2My45NTcgMTA5LjE2N0MxNjUuMDg3IDEwOC4zMDggMTY1LjU1NCAxMDguMjEgMTY3LjQ5NSAxMDguMTg2QzE2OC4xMDkgMTA4LjE2MSAxNzEuNjk2IDEwOC4wNjMgMTc1LjE2MSAxMDguMTg2QzE3OC4wMzUgMTA4LjIzNSAxODAuNzg3IDEwOC40OCAxODEuNjQ3IDEwOC41NTRDMTgzLjQ0MSAxMDguNzAxIDE4My4yNjkgMTEwLjAyNiAxODMuMjY5IDExMC43MTNDMTgzLjI2OSAxMTEuMzUgMTgyLjcyOCAxMjIuMjkyIDE4Mi43MDQgMTI0LjE4MUMxODIuNjU1IDEyNi4wOTQgMTgyLjMzNSAxMjYuMzY0IDE4MS4xMDcgMTI2LjgwNkMxODAuNDQzIDEyNy4wMDIgMTcyLjM2IDEyOS42MDIgMTcyLjA4OSAxMjkuNzQ5QzE3MS43OTUgMTI5Ljg0NyAxNzIuMTg4IDEyOS45MjEgMTcyLjE4OCAxMjkuOTIxSDE5Ny4zOTdDMTk3Ljc2NSAxMjkuOTIxIDE5Ny45MTMgMTI5LjcyNSAxOTcuNjkxIDEyOS42MDJMMTk3LjY0MiAxMjkuNTc4Wk0xODMuNDY1IDEwNC40ODJDMTgzLjQ2NSAxMDUuNTM2IDE4Mi45OTggMTA2LjEyNSAxODEuMjc5IDEwNi4xMjVDMTc5LjU1OSAxMDYuMTI1IDE2OC45OTQgMTA2LjEyNSAxNjguOTk0IDEwNi4xMjVDMTY3LjEwMiAxMDYuMTAxIDE2Ny4xNTEgMTA1LjA0NiAxNjcuODYzIDEwNC4zMUMxNjguNTc2IDEwMy41IDE4MS40NTEgODkuNzEzMyAxODEuOTE3IDg5LjE0OTFDMTgyLjg1MSA4OC4xMTg4IDE4My42NjIgODguMTY3OCAxODMuNjYyIDg5LjU5MDdDMTgzLjY2MiA5MS4wMTM1IDE4My40NjUgMTAzLjc5NSAxODMuNDY1IDEwNC41MzFWMTA0LjQ4MloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=';_logoImgs['full']=img;})();
(()=>{const img=new Image();img.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjA0IiBoZWlnaHQ9IjIwNyIgdmlld0JveD0iMCAwIDYwNCAyMDciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik00MzAuMzIyIDBIMzcxLjk5MkwyODQuOTY1IDg3LjIxMDhWMEgyNDMuNTE1VjIwNi45MjZIMjg0Ljk2NVYxNDYuMDM4TDMxMS4wMDkgMTIwLjAxTDM3Ny45MTQgMjA2LjkyNkg0MzAuNjE3TDM0MC4zMjEgOTAuNDQ5TDQzMC4zMjIgMFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik01ODMuMzk0IDEzOS4yMThDNTY3LjEwNCAxNTYuOTU1IDU0Ny41NzEgMTY1LjUxNyA1MjUuMDY0IDE2NS41MTdDNDg5LjUzNiAxNjUuNTE3IDQ2My40OTIgMTQwLjEwMiA0NjMuNDkyIDEwMy40NTFDNDYzLjQ5MiA2Ni44MDAzIDQ4OS41MzYgNDEuMzYwOCA1MjUuNjU0IDQxLjM2MDhDNTQ4LjE2IDQxLjM2MDggNTY1LjMzNSA1MC4yNDEzIDU4MC43MTYgNjUuODkyNkw2MDAuNTQ0IDI4LjA2NDVDNTgwLjc0IDkuNzYzNjkgNTU0LjY3MSAwIDUyNS45NDkgMEM0NjYuNzM1IDAgNDIyLjA0MiA0NC4zMjkxIDQyMi4wNDIgMTAzLjE1N0M0MjIuMDQyIDE2MS45ODQgNDY2Ljc1OSAyMDYuOTAyIDUyNS42NTQgMjA2LjkwMkM1NTYuNzM1IDIwNi45MDIgNTgzLjA5OSAxOTYuNTQ5IDYwMy44MTIgMTc3LjYzNUw1ODMuMzk0IDEzOS4xOTRWMTM5LjIxOFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yMDcuMjk5IDIwN0gwVjEyOS45NDJDMC4xMzM5NjYgMTI5LjkyMiAwLjIyNDEyIDEyOS45MjEgMC4yNzA1MDggMTI5LjkyMUgyNC4wMDQ5QzI0LjMyNDMgMTI5LjkyMSAyNC40MjI2IDEyOS42MjYgMjQuMTUyMyAxMjkuNTc3QzIyLjQwNzIgMTI5LjIzNCAxNC43NDE3IDEyNy42NCAxMy40MTUgMTI3LjI0N0MxMi4xMzc4IDEyNi44NzkgMTEuOTkwOSAxMjYuMTE4IDEyLjUwNjggMTI1LjQzMkMxMi45Mjc5IDEyNC43NjUgMjUuMDM3MyAxMDkuODI5IDI1Ljk0NjMgMTA5LjE2N0MyNy4wMjczIDEwOC4zMDggMjcuNDk0NiAxMDguMjEgMjkuNDM1NSAxMDguMTg2QzMwLjA1MDggMTA4LjE2MSAzMy42Mzc5IDEwOC4wNjMgMzcuMTAxNiAxMDguMTg2QzQwLjAwMDcgMTA4LjIzNSA0Mi43NzcxIDEwOC40OCA0My41ODc5IDEwOC41NTRDNDUuMzgxMiAxMDguNzAxIDQ1LjE4NDYgMTEwLjAyNiA0NS4xODQ2IDExMC43MTNDNDUuMTg0NCAxMTEuMzU0IDQ0LjY2ODMgMTIyLjI5MiA0NC42MTkxIDEyNC4xODFDNDQuNTcgMTI2LjA5NCA0NC4yNTEgMTI2LjM2NCA0My4wMjI1IDEyNi44MDZDNDIuNDA3NyAxMjcuMDAyIDM0LjI3NTMgMTI5LjYwMiAzMy45ODA1IDEyOS43NDlDMzMuNjg1OCAxMjkuODQ3IDM0LjA3OTEgMTI5LjkyMSAzNC4wNzkxIDEyOS45MjFINTkuMjYzN0M1OS42NTYzIDEyOS45MjEgNTkuNzc5IDEyOS43MjUgNTkuNTU4NiAxMjkuNjAzQzU4Ljk5MzUgMTI5LjM4MiA1NC40OTY4IDEyNy40NDMgNTMuMzE3NCAxMjYuODc5TDUzLjM0MTggMTI2Ljg1NEM1Mi4wNjQzIDEyNi4yNDEgNTEuOTY2MSAxMjUuMjYgNTEuOTE3IDEyNC40NUM1MS45MTcyIDEyMy43MDMgNTIuNTgwMyA3Ny4yMDE5IDUyLjM4MzggNzYuODM0QzUyLjI4NTUgNzYuNjEzMyA1Mi4wMTUyIDc2LjU4ODggNTEuNzY5NSA3Ni44MzRDNTEuMDA3OSA3Ny41Njk5IDYuMDAxMjkgMTI2LjU1NCA1LjE4NDU3IDEyNy4wNzVDMy41ODg0NSAxMjguMzUgMC40MjE2MDMgMTI5LjQwNSAwLjIyMTY4IDEyOS40NzlDMC4yMjE2OCAxMjkuNTAzIDAuMTMzNTU0IDEyOS41MjUgMCAxMjkuNTY4VjBIMjA3LjI5OVYyMDdaTTEzMS43NyA3Ny42OTI0QzExOS4xNjUgNzcuNjkyNSAxMDkuNTgzIDgzLjYyOTMgMTA2LjMxNSA4Ni4xODA3QzEwMC42NCA5MC42MjA5IDk2LjE5MjEgOTYuOTk4NyA5NC4zOTg0IDEwMy43OTRDOTAuODg0OSAxMTYuNjk4IDk4LjMwNTMgMTMwLjg1MyAxMTguNjQ5IDEzMC4zMTNDMTI2LjUzNiAxMzAuMTE3IDEzNC43NDIgMTI2Ljk3NyAxMzUuNDMxIDEyNi43MDdWMTI2Ljc1NkMxMzYuMTE5IDEyNi41MTEgMTM2LjY4NCAxMjYuMTY3IDEzNi45MDUgMTI1LjUyOUMxMzcuMTUyIDEyNC45MTMgMTQwIDExNS45NjMgMTQwLjU2NSAxMTQuMDQ5QzE0MS4wODEgMTEyLjE4NCAxMzkuMDkyIDExMi4zNTUgMTM4LjMzIDExMi4zNTVIMTE5LjUxQzExOS4xMTcgMTEyLjM1NSAxMTguODk1IDExMi42MjUgMTE5LjQxMSAxMTIuNzQ4QzExOS45MjcgMTEyLjg5NSAxMjkuOTUyIDExNS41OTQgMTMxLjA4MiAxMTUuODg5QzEzMi4yMTIgMTE2LjIwOCAxMzEuNzQ1IDExNy4zMTIgMTMxLjY0NiAxMTcuNjU1QzEzMS41OTUgMTE3Ljk4MiAxMjkuNzA2IDEyNS43NzYgMTI5LjUxIDEyNi40MTNDMTI5LjI0IDEyNy4wNTEgMTI5LjA5MiAxMjcuMzcgMTI4LjAxMSAxMjcuNjg4QzEyNy4yNzQgMTI3LjkzNCAxMjQuNzE4IDEyOC40NDkgMTIxLjI1NCAxMjguMzUxQzExMC4xOTcgMTI4LjA1NiAxMDMuMjIgMTIwLjkxOCAxMDIuMDQgMTEyLjIwOUMxMDAuNTY2IDEwMS42MzYgMTA3Ljc2NSA4OC4zMzkyIDEyMC4wOTkgODIuNTk4NkMxMjcuNDcgNzkuMTY0MiAxMzcuNDQ2IDgwLjAyMzEgMTM5LjUzNCA4MC43MUMxNDEuMDU3IDgxLjE3NjEgMTQxLjA1OCA4Mi4wMTAzIDE0MS4wNTggODMuMzM1QzE0MS4xMDcgODMuODc4MyAxNDAuNDkzIDk2LjU3MDIgMTQwLjQ5MiA5Ni45MDA0QzE0MC40OTIgOTcuNDg5IDE0MC45NTkgOTcuNDY1IDE0MS4xNTUgOTYuOTI1OEMxNDEuMzAzIDk2LjU1NzggMTQ2LjA2OSA4Mi4yMDYxIDE0Ni4yMTcgODEuNzg5MUMxNDYuNDYyIDgwLjkwNTkgMTQ2Ljc4MiA3OS43MDM5IDE0NC42MiA3OS4xMzk2QzE0MC4xNzMgNzcuOTg2NyAxMzQuMTI4IDc3LjY5MjQgMTMxLjc3IDc3LjY5MjRaTTE5MC40MTkgNzYuODM0QzE5MC4zMjEgNzYuNjEzMyAxOTAuMDUgNzYuNTg4OCAxODkuODA1IDc2LjgzNEMxODkuMDQzIDc3LjU2OTggMTQ0LjA0NSAxMjYuNTQ1IDE0My4xNzEgMTI3LjA3NUMxNDEuNTc1IDEyOC4zNSAxMzguNDM0IDEyOS40NTMgMTM4LjI1NyAxMjkuNTc3QzEzOC4wNiAxMjkuNjUxIDEzOC4wNiAxMjkuOTIxIDEzOC4zMDYgMTI5LjkyMUgxNjIuMDRDMTYyLjM1OSAxMjkuOTIxIDE2Mi40MDkgMTI5LjYyNiAxNjIuMTg4IDEyOS41NzdDMTYwLjQxOCAxMjkuMjM0IDE1Mi43NzcgMTI3LjY0IDE1MS40NSAxMjcuMjQ3QzE1MC4xNzMgMTI2Ljg3OSAxNTAuMDI1IDEyNi4xMTggMTUwLjQ5MiAxMjUuNDMyQzE1MC45NTkgMTI0Ljc2OSAxNjMuMDczIDEwOS44MjkgMTYzLjkzMyAxMDkuMTY3QzE2NS4wNjMgMTA4LjMwOSAxNjUuNTMgMTA4LjIxIDE2Ny40NzEgMTA4LjE4NkMxNjguMDg2IDEwOC4xNjEgMTcxLjY3MiAxMDguMDYzIDE3NS4xMzYgMTA4LjE4NkMxNzguMDEgMTA4LjIzNSAxODAuNzYzIDEwOC40OCAxODEuNjIzIDEwOC41NTRDMTgzLjQxNiAxMDguNzAxIDE4My4yNDQgMTEwLjAyNiAxODMuMjQ0IDExMC43MTNDMTgzLjI0NCAxMTEuMzU0IDE4Mi43MDQgMTIyLjI5MiAxODIuNjggMTI0LjE4MUMxODIuNjMxIDEyNi4wOTQgMTgyLjMxMSAxMjYuMzY0IDE4MS4wODIgMTI2LjgwNkMxODAuNDE3IDEyNy4wMDIgMTcyLjMzNSAxMjkuNjAyIDE3Mi4wNjQgMTI5Ljc0OUMxNzEuNzc0IDEyOS44NDYgMTcyLjE1NCAxMjkuOTE5IDE3Mi4xNjMgMTI5LjkyMUgxOTcuMzcyQzE5Ny43NDEgMTI5LjkyMSAxOTcuODg4IDEyOS43MjUgMTk3LjY2NyAxMjkuNjAzTDE5Ny42MTggMTI5LjU3N0MxOTcuMDUzIDEyOS4zNTYgMTkyLjU1NiAxMjcuNDE5IDE5MS4zNzcgMTI2Ljg1NEMxOTAuMDUgMTI2LjI0MSAxOTAuMDAxIDEyNS4yNiAxODkuOTUyIDEyNC40NUMxODkuOTAzIDEyMy43MDQgMTkwLjYxNSA3Ny4yMDE5IDE5MC40MTkgNzYuODM0Wk03MC45NTkgNzguNDUzMUM3MC42ODg3IDc4LjQ1MzEgNzAuNjg4NCA3OC42NzQzIDcxLjAwNzggNzguNzcyNUM3MS4xODMxIDc4Ljg3MTcgNzcuMTk3NyA4MC44ODEyIDc3LjgxMzUgODEuMTI3Qzc4Ljk2ODMgODEuNTQ0IDc5LjA2NjggODIuNTI1NiA3OC44NDU3IDgzLjUwNjhDNzguNjQ4IDg0LjI5NjQgNjguODcxOCAxMjQuNTQ0IDY4LjYyNSAxMjUuNDMyQzY4LjI1NjUgMTI2LjYwOSA2Ni45Mjk1IDEyNy4wNzUgNjYuMzY0MyAxMjcuMjk2QzY1Ljg5NzQgMTI3LjQ5MiA2MC43MzczIDEyOS4zMzIgNjAuMjcwNSAxMjkuNTUzQzU5Ljg1MjkgMTI5Ljc0OSA2MC4wOTg5IDEyOS44NzIgNjAuNTE2NiAxMjkuODcySDgzLjg1ODRDODQuMzI0OCAxMjkuODcyIDg0LjQyMjkgMTI5LjU3OCA4NC4wMDU5IDEyOS40MzFDODMuNTg4MiAxMjkuMjM0IDc4LjEzMjggMTI3LjMyIDc3LjA1MTggMTI2Ljg3OUM3NS45OTU3IDEyNi40ODYgNzYuMDQ0NyAxMjUuNzAxIDc2LjI0MTIgMTI0Ljc5NEM3Ni4zNjQgMTI0LjEwNyA4NS44NyA4NC4wMzI2IDg2LjExODIgODMuMjg2MUM4Ni40Mzc2IDgyLjMyOTQgODYuODggODEuNjY2NiA4OC4xMDg0IDgxLjEyN1Y4MS4xMDI1Qzg4Ljg3MDEgODAuNzU5MSA5MC4zNDQ3IDgwLjI5MjcgOTAuODExNSA4MC4xNDU1QzkxLjIzMDQgNzkuOTk4IDk1LjI1ODEgNzguODQ1MyA5NS42MjcgNzguNzQ3MUM5NS45NzA5IDc4LjY0ODkgOTUuNzI1MyA3OC40NTMxIDk1LjQ1NTEgNzguNDUzMUg3MC45NTlaTTQzLjkwNzIgODkuMTQ5NEM0NC44MTYzIDg4LjExOTEgNDUuNjUxNCA4OC4xNjggNDUuNjUxNCA4OS41OTA4QzQ1LjY1MTQgOTEuMDE0MiA0NS40MzA3IDEwMy43OTEgNDUuNDMwNyAxMDQuNTNMNDUuNDA2MiAxMDQuNDgxQzQ1LjQwNjIgMTA1LjUzNiA0NC45ODc2IDEwNi4xMjUgNDMuMjQzMiAxMDYuMTI1SDMwLjk4MzRDMjkuMDkxNSAxMDYuMSAyOS4xNDAxIDEwNS4wNDYgMjkuODUyNSAxMDQuMzFDMzAuNTE1OSAxMDMuNSA0My40MTQ3IDg5LjcxNDggNDMuOTA3MiA4OS4xNDk0Wk0xODEuODkzIDg5LjE0OTRDMTgyLjgyNiA4OC4xMTkxIDE4My42MzggODguMTY4IDE4My42MzggODkuNTkwOEMxODMuNjM4IDkxLjAxNDIgMTgzLjQ0MSAxMDMuNzkxIDE4My40NDEgMTA0LjUzVjEwNC40ODFDMTgzLjQ0MSAxMDUuNTM2IDE4Mi45NzQgMTA2LjEyNSAxODEuMjU0IDEwNi4xMjVIMTY4Ljk2OUMxNjcuMDc3IDEwNi4xIDE2Ny4xMjYgMTA1LjA0NSAxNjcuODM5IDEwNC4zMUMxNjguNTUyIDEwMy40OTkgMTgxLjQyIDg5LjcxOTYgMTgxLjg5MyA4OS4xNDk0WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==';_logoImgs['white']=img;})();
(()=>{const img=new Image();img.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjA0IiBoZWlnaHQ9IjIwNyIgdmlld0JveD0iMCAwIDYwNCAyMDciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik00MzAuMzIyIDBIMzcxLjk5MkwyODQuOTY1IDg3LjIxMDhWMEgyNDMuNTE1VjIwNi45MjZIMjg0Ljk2NVYxNDYuMDM4TDMxMS4wMDkgMTIwLjAxTDM3Ny45MTQgMjA2LjkyNkg0MzAuNjE3TDM0MC4zMjEgOTAuNDQ5TDQzMC4zMjIgMFoiIGZpbGw9IiNFQzAwOEMiLz4KPHBhdGggZD0iTTU4My4zOTQgMTM5LjIxOEM1NjcuMTA0IDE1Ni45NTUgNTQ3LjU3MSAxNjUuNTE3IDUyNS4wNjQgMTY1LjUxN0M0ODkuNTM2IDE2NS41MTcgNDYzLjQ5MiAxNDAuMTAyIDQ2My40OTIgMTAzLjQ1MUM0NjMuNDkyIDY2LjgwMDMgNDg5LjUzNiA0MS4zNjA4IDUyNS42NTQgNDEuMzYwOEM1NDguMTYgNDEuMzYwOCA1NjUuMzM1IDUwLjI0MTMgNTgwLjcxNiA2NS44OTI2TDYwMC41NDQgMjguMDY0NUM1ODAuNzQgOS43NjM2OSA1NTQuNjcxIDAgNTI1Ljk0OSAwQzQ2Ni43MzUgMCA0MjIuMDQyIDQ0LjMyOTEgNDIyLjA0MiAxMDMuMTU3QzQyMi4wNDIgMTYxLjk4NCA0NjYuNzU5IDIwNi45MDIgNTI1LjY1NCAyMDYuOTAyQzU1Ni43MzUgMjA2LjkwMiA1ODMuMDk5IDE5Ni41NDkgNjAzLjgxMiAxNzcuNjM1TDU4My4zOTQgMTM5LjE5NFYxMzkuMjE4WiIgZmlsbD0iI0VDMDA4QyIvPgo8cGF0aCBkPSJNMjA3LjI5OSAyMDdIMFYxMjkuOTQyQzAuMTMzOTY2IDEyOS45MjIgMC4yMjQxMiAxMjkuOTIxIDAuMjcwNTA4IDEyOS45MjFIMjQuMDA0OUMyNC4zMjQzIDEyOS45MjEgMjQuNDIyNiAxMjkuNjI2IDI0LjE1MjMgMTI5LjU3N0MyMi40MDcyIDEyOS4yMzQgMTQuNzQxNyAxMjcuNjQgMTMuNDE1IDEyNy4yNDdDMTIuMTM3OCAxMjYuODc5IDExLjk5MDkgMTI2LjExOCAxMi41MDY4IDEyNS40MzJDMTIuOTI3OSAxMjQuNzY1IDI1LjAzNzMgMTA5LjgyOSAyNS45NDYzIDEwOS4xNjdDMjcuMDI3MyAxMDguMzA4IDI3LjQ5NDYgMTA4LjIxIDI5LjQzNTUgMTA4LjE4NkMzMC4wNTA4IDEwOC4xNjEgMzMuNjM3OSAxMDguMDYzIDM3LjEwMTYgMTA4LjE4NkM0MC4wMDA3IDEwOC4yMzUgNDIuNzc3MSAxMDguNDggNDMuNTg3OSAxMDguNTU0QzQ1LjM4MTIgMTA4LjcwMSA0NS4xODQ2IDExMC4wMjYgNDUuMTg0NiAxMTAuNzEzQzQ1LjE4NDQgMTExLjM1NCA0NC42NjgzIDEyMi4yOTIgNDQuNjE5MSAxMjQuMTgxQzQ0LjU3IDEyNi4wOTQgNDQuMjUxIDEyNi4zNjQgNDMuMDIyNSAxMjYuODA2QzQyLjQwNzcgMTI3LjAwMiAzNC4yNzUzIDEyOS42MDIgMzMuOTgwNSAxMjkuNzQ5QzMzLjY4NTggMTI5Ljg0NyAzNC4wNzkxIDEyOS45MjEgMzQuMDc5MSAxMjkuOTIxSDU5LjI2MzdDNTkuNjU2MyAxMjkuOTIxIDU5Ljc3OSAxMjkuNzI1IDU5LjU1ODYgMTI5LjYwM0M1OC45OTM1IDEyOS4zODIgNTQuNDk2OCAxMjcuNDQzIDUzLjMxNzQgMTI2Ljg3OUw1My4zNDE4IDEyNi44NTRDNTIuMDY0MyAxMjYuMjQxIDUxLjk2NjEgMTI1LjI2IDUxLjkxNyAxMjQuNDVDNTEuOTE3MiAxMjMuNzAzIDUyLjU4MDMgNzcuMjAxOSA1Mi4zODM4IDc2LjgzNEM1Mi4yODU1IDc2LjYxMzMgNTIuMDE1MiA3Ni41ODg4IDUxLjc2OTUgNzYuODM0QzUxLjAwNzkgNzcuNTY5OSA2LjAwMTI5IDEyNi41NTQgNS4xODQ1NyAxMjcuMDc1QzMuNTg4NDUgMTI4LjM1IDAuNDIxNjAzIDEyOS40MDUgMC4yMjE2OCAxMjkuNDc5QzAuMjIxNjggMTI5LjUwMyAwLjEzMzU1NCAxMjkuNTI1IDAgMTI5LjU2OFYwSDIwNy4yOTlWMjA3Wk0xMzEuNzcgNzcuNjkyNEMxMTkuMTY1IDc3LjY5MjUgMTA5LjU4MyA4My42MjkzIDEwNi4zMTUgODYuMTgwN0MxMDAuNjQgOTAuNjIwOSA5Ni4xOTIxIDk2Ljk5ODcgOTQuMzk4NCAxMDMuNzk0QzkwLjg4NDkgMTE2LjY5OCA5OC4zMDUzIDEzMC44NTMgMTE4LjY0OSAxMzAuMzEzQzEyNi41MzYgMTMwLjExNyAxMzQuNzQyIDEyNi45NzcgMTM1LjQzMSAxMjYuNzA3VjEyNi43NTZDMTM2LjExOSAxMjYuNTExIDEzNi42ODQgMTI2LjE2NyAxMzYuOTA1IDEyNS41MjlDMTM3LjE1MiAxMjQuOTEzIDE0MCAxMTUuOTYzIDE0MC41NjUgMTE0LjA0OUMxNDEuMDgxIDExMi4xODQgMTM5LjA5MiAxMTIuMzU1IDEzOC4zMyAxMTIuMzU1SDExOS41MUMxMTkuMTE3IDExMi4zNTUgMTE4Ljg5NSAxMTIuNjI1IDExOS40MTEgMTEyLjc0OEMxMTkuOTI3IDExMi44OTUgMTI5Ljk1MiAxMTUuNTk0IDEzMS4wODIgMTE1Ljg4OUMxMzIuMjEyIDExNi4yMDggMTMxLjc0NSAxMTcuMzEyIDEzMS42NDYgMTE3LjY1NUMxMzEuNTk1IDExNy45ODIgMTI5LjcwNiAxMjUuNzc2IDEyOS41MSAxMjYuNDEzQzEyOS4yNCAxMjcuMDUxIDEyOS4wOTIgMTI3LjM3IDEyOC4wMTEgMTI3LjY4OEMxMjcuMjc0IDEyNy45MzQgMTI0LjcxOCAxMjguNDQ5IDEyMS4yNTQgMTI4LjM1MUMxMTAuMTk3IDEyOC4wNTYgMTAzLjIyIDEyMC45MTggMTAyLjA0IDExMi4yMDlDMTAwLjU2NiAxMDEuNjM2IDEwNy43NjUgODguMzM5MiAxMjAuMDk5IDgyLjU5ODZDMTI3LjQ3IDc5LjE2NDIgMTM3LjQ0NiA4MC4wMjMxIDEzOS41MzQgODAuNzFDMTQxLjA1NyA4MS4xNzYxIDE0MS4wNTggODIuMDEwMyAxNDEuMDU4IDgzLjMzNUMxNDEuMTA3IDgzLjg3ODMgMTQwLjQ5MyA5Ni41NzAyIDE0MC40OTIgOTYuOTAwNEMxNDAuNDkyIDk3LjQ4OSAxNDAuOTU5IDk3LjQ2NSAxNDEuMTU1IDk2LjkyNThDMTQxLjMwMyA5Ni41NTc4IDE0Ni4wNjkgODIuMjA2MSAxNDYuMjE3IDgxLjc4OTFDMTQ2LjQ2MiA4MC45MDU5IDE0Ni43ODIgNzkuNzAzOSAxNDQuNjIgNzkuMTM5NkMxNDAuMTczIDc3Ljk4NjcgMTM0LjEyOCA3Ny42OTI0IDEzMS43NyA3Ny42OTI0Wk0xOTAuNDE5IDc2LjgzNEMxOTAuMzIxIDc2LjYxMzMgMTkwLjA1IDc2LjU4ODggMTg5LjgwNSA3Ni44MzRDMTg5LjA0MyA3Ny41Njk4IDE0NC4wNDUgMTI2LjU0NSAxNDMuMTcxIDEyNy4wNzVDMTQxLjU3NSAxMjguMzUgMTM4LjQzNCAxMjkuNDUzIDEzOC4yNTcgMTI5LjU3N0MxMzguMDYgMTI5LjY1MSAxMzguMDYgMTI5LjkyMSAxMzguMzA2IDEyOS45MjFIMTYyLjA0QzE2Mi4zNTkgMTI5LjkyMSAxNjIuNDA5IDEyOS42MjYgMTYyLjE4OCAxMjkuNTc3QzE2MC40MTggMTI5LjIzNCAxNTIuNzc3IDEyNy42NCAxNTEuNDUgMTI3LjI0N0MxNTAuMTczIDEyNi44NzkgMTUwLjAyNSAxMjYuMTE4IDE1MC40OTIgMTI1LjQzMkMxNTAuOTU5IDEyNC43NjkgMTYzLjA3MyAxMDkuODI5IDE2My45MzMgMTA5LjE2N0MxNjUuMDYzIDEwOC4zMDkgMTY1LjUzIDEwOC4yMSAxNjcuNDcxIDEwOC4xODZDMTY4LjA4NiAxMDguMTYxIDE3MS42NzIgMTA4LjA2MyAxNzUuMTM2IDEwOC4xODZDMTc4LjAxIDEwOC4yMzUgMTgwLjc2MyAxMDguNDggMTgxLjYyMyAxMDguNTU0QzE4My40MTYgMTA4LjcwMSAxODMuMjQ0IDExMC4wMjYgMTgzLjI0NCAxMTAuNzEzQzE4My4yNDQgMTExLjM1NCAxODIuNzA0IDEyMi4yOTIgMTgyLjY4IDEyNC4xODFDMTgyLjYzMSAxMjYuMDk0IDE4Mi4zMTEgMTI2LjM2NCAxODEuMDgyIDEyNi44MDZDMTgwLjQxNyAxMjcuMDAyIDE3Mi4zMzUgMTI5LjYwMiAxNzIuMDY0IDEyOS43NDlDMTcxLjc3NCAxMjkuODQ2IDE3Mi4xNTQgMTI5LjkxOSAxNzIuMTYzIDEyOS45MjFIMTk3LjM3MkMxOTcuNzQxIDEyOS45MjEgMTk3Ljg4OCAxMjkuNzI1IDE5Ny42NjcgMTI5LjYwM0wxOTcuNjE4IDEyOS41NzdDMTk3LjA1MyAxMjkuMzU2IDE5Mi41NTYgMTI3LjQxOSAxOTEuMzc3IDEyNi44NTRDMTkwLjA1IDEyNi4yNDEgMTkwLjAwMSAxMjUuMjYgMTg5Ljk1MiAxMjQuNDVDMTg5LjkwMyAxMjMuNzA0IDE5MC42MTUgNzcuMjAxOSAxOTAuNDE5IDc2LjgzNFpNNzAuOTU5IDc4LjQ1MzFDNzAuNjg4NyA3OC40NTMxIDcwLjY4ODQgNzguNjc0MyA3MS4wMDc4IDc4Ljc3MjVDNzEuMTgzMSA3OC44NzE3IDc3LjE5NzcgODAuODgxMiA3Ny44MTM1IDgxLjEyN0M3OC45NjgzIDgxLjU0NCA3OS4wNjY4IDgyLjUyNTYgNzguODQ1NyA4My41MDY4Qzc4LjY0OCA4NC4yOTY0IDY4Ljg3MTggMTI0LjU0NCA2OC42MjUgMTI1LjQzMkM2OC4yNTY1IDEyNi42MDkgNjYuOTI5NSAxMjcuMDc1IDY2LjM2NDMgMTI3LjI5NkM2NS44OTc0IDEyNy40OTIgNjAuNzM3MyAxMjkuMzMyIDYwLjI3MDUgMTI5LjU1M0M1OS44NTI5IDEyOS43NDkgNjAuMDk4OSAxMjkuODcyIDYwLjUxNjYgMTI5Ljg3Mkg4My44NTg0Qzg0LjMyNDggMTI5Ljg3MiA4NC40MjI5IDEyOS41NzggODQuMDA1OSAxMjkuNDMxQzgzLjU4ODIgMTI5LjIzNCA3OC4xMzI4IDEyNy4zMiA3Ny4wNTE4IDEyNi44NzlDNzUuOTk1NyAxMjYuNDg2IDc2LjA0NDcgMTI1LjcwMSA3Ni4yNDEyIDEyNC43OTRDNzYuMzY0IDEyNC4xMDcgODUuODcgODQuMDMyNiA4Ni4xMTgyIDgzLjI4NjFDODYuNDM3NiA4Mi4zMjk0IDg2Ljg4IDgxLjY2NjYgODguMTA4NCA4MS4xMjdWODEuMTAyNUM4OC44NzAxIDgwLjc1OTEgOTAuMzQ0NyA4MC4yOTI3IDkwLjgxMTUgODAuMTQ1NUM5MS4yMzA0IDc5Ljk5OCA5NS4yNTgxIDc4Ljg0NTMgOTUuNjI3IDc4Ljc0NzFDOTUuOTcwOSA3OC42NDg5IDk1LjcyNTMgNzguNDUzMSA5NS40NTUxIDc4LjQ1MzFINzAuOTU5Wk00My45MDcyIDg5LjE0OTRDNDQuODE2MyA4OC4xMTkxIDQ1LjY1MTQgODguMTY4IDQ1LjY1MTQgODkuNTkwOEM0NS42NTE0IDkxLjAxNDIgNDUuNDMwNyAxMDMuNzkxIDQ1LjQzMDcgMTA0LjUzTDQ1LjQwNjIgMTA0LjQ4MUM0NS40MDYyIDEwNS41MzYgNDQuOTg3NiAxMDYuMTI1IDQzLjI0MzIgMTA2LjEyNUgzMC45ODM0QzI5LjA5MTUgMTA2LjEgMjkuMTQwMSAxMDUuMDQ2IDI5Ljg1MjUgMTA0LjMxQzMwLjUxNTkgMTAzLjUgNDMuNDE0NyA4OS43MTQ4IDQzLjkwNzIgODkuMTQ5NFpNMTgxLjg5MyA4OS4xNDk0QzE4Mi44MjYgODguMTE5MSAxODMuNjM4IDg4LjE2OCAxODMuNjM4IDg5LjU5MDhDMTgzLjYzOCA5MS4wMTQyIDE4My40NDEgMTAzLjc5MSAxODMuNDQxIDEwNC41M1YxMDQuNDgxQzE4My40NDEgMTA1LjUzNiAxODIuOTc0IDEwNi4xMjUgMTgxLjI1NCAxMDYuMTI1SDE2OC45NjlDMTY3LjA3NyAxMDYuMSAxNjcuMTI2IDEwNS4wNDUgMTY3LjgzOSAxMDQuMzFDMTY4LjU1MiAxMDMuNDk5IDE4MS40MiA4OS43MTk2IDE4MS44OTMgODkuMTQ5NFoiIGZpbGw9IiNFQzAwOEMiLz4KPC9zdmc+Cg==';_logoImgs['magenta']=img;})();
(()=>{const img=new Image();img.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjA0IiBoZWlnaHQ9IjIwNyIgdmlld0JveD0iMCAwIDYwNCAyMDciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik00MzAuMzIyIDBIMzcxLjk5MkwyODQuOTY1IDg3LjIxMDhWMEgyNDMuNTE1VjIwNi45MjZIMjg0Ljk2NVYxNDYuMDM4TDMxMS4wMDkgMTIwLjAxTDM3Ny45MTQgMjA2LjkyNkg0MzAuNjE3TDM0MC4zMjEgOTAuNDQ5TDQzMC4zMjIgMFoiIGZpbGw9ImJsYWNrIi8+CjxwYXRoIGQ9Ik01ODMuMzk0IDEzOS4yMThDNTY3LjEwNCAxNTYuOTU1IDU0Ny41NzEgMTY1LjUxNyA1MjUuMDY0IDE2NS41MTdDNDg5LjUzNiAxNjUuNTE3IDQ2My40OTIgMTQwLjEwMiA0NjMuNDkyIDEwMy40NTFDNDYzLjQ5MiA2Ni44MDAzIDQ4OS41MzYgNDEuMzYwOCA1MjUuNjU0IDQxLjM2MDhDNTQ4LjE2IDQxLjM2MDggNTY1LjMzNSA1MC4yNDEzIDU4MC43MTYgNjUuODkyNkw2MDAuNTQ0IDI4LjA2NDVDNTgwLjc0IDkuNzYzNjkgNTU0LjY3MSAwIDUyNS45NDkgMEM0NjYuNzM1IDAgNDIyLjA0MiA0NC4zMjkxIDQyMi4wNDIgMTAzLjE1N0M0MjIuMDQyIDE2MS45ODQgNDY2Ljc1OSAyMDYuOTAyIDUyNS42NTQgMjA2LjkwMkM1NTYuNzM1IDIwNi45MDIgNTgzLjA5OSAxOTYuNTQ5IDYwMy44MTIgMTc3LjYzNUw1ODMuMzk0IDEzOS4xOTRWMTM5LjIxOFoiIGZpbGw9ImJsYWNrIi8+CjxwYXRoIGQ9Ik0yMDcuMjk5IDIwN0gwVjEyOS45NDJDMC4xMzM5NjYgMTI5LjkyMiAwLjIyNDEyIDEyOS45MjEgMC4yNzA1MDggMTI5LjkyMUgyNC4wMDQ5QzI0LjMyNDMgMTI5LjkyMSAyNC40MjI2IDEyOS42MjYgMjQuMTUyMyAxMjkuNTc3QzIyLjQwNzIgMTI5LjIzNCAxNC43NDE3IDEyNy42NCAxMy40MTUgMTI3LjI0N0MxMi4xMzc4IDEyNi44NzkgMTEuOTkwOSAxMjYuMTE4IDEyLjUwNjggMTI1LjQzMkMxMi45Mjc5IDEyNC43NjUgMjUuMDM3MyAxMDkuODI5IDI1Ljk0NjMgMTA5LjE2N0MyNy4wMjczIDEwOC4zMDggMjcuNDk0NiAxMDguMjEgMjkuNDM1NSAxMDguMTg2QzMwLjA1MDggMTA4LjE2MSAzMy42Mzc5IDEwOC4wNjMgMzcuMTAxNiAxMDguMTg2QzQwLjAwMDcgMTA4LjIzNSA0Mi43NzcxIDEwOC40OCA0My41ODc5IDEwOC41NTRDNDUuMzgxMiAxMDguNzAxIDQ1LjE4NDYgMTEwLjAyNiA0NS4xODQ2IDExMC43MTNDNDUuMTg0NCAxMTEuMzU0IDQ0LjY2ODMgMTIyLjI5MiA0NC42MTkxIDEyNC4xODFDNDQuNTcgMTI2LjA5NCA0NC4yNTEgMTI2LjM2NCA0My4wMjI1IDEyNi44MDZDNDIuNDA3NyAxMjcuMDAyIDM0LjI3NTMgMTI5LjYwMiAzMy45ODA1IDEyOS43NDlDMzMuNjg1OCAxMjkuODQ3IDM0LjA3OTEgMTI5LjkyMSAzNC4wNzkxIDEyOS45MjFINTkuMjYzN0M1OS42NTYzIDEyOS45MjEgNTkuNzc5IDEyOS43MjUgNTkuNTU4NiAxMjkuNjAzQzU4Ljk5MzUgMTI5LjM4MiA1NC40OTY4IDEyNy40NDMgNTMuMzE3NCAxMjYuODc5TDUzLjM0MTggMTI2Ljg1NEM1Mi4wNjQzIDEyNi4yNDEgNTEuOTY2MSAxMjUuMjYgNTEuOTE3IDEyNC40NUM1MS45MTcyIDEyMy43MDMgNTIuNTgwMyA3Ny4yMDE5IDUyLjM4MzggNzYuODM0QzUyLjI4NTUgNzYuNjEzMyA1Mi4wMTUyIDc2LjU4ODggNTEuNzY5NSA3Ni44MzRDNTEuMDA3OSA3Ny41Njk5IDYuMDAxMjkgMTI2LjU1NCA1LjE4NDU3IDEyNy4wNzVDMy41ODg0NSAxMjguMzUgMC40MjE2MDMgMTI5LjQwNSAwLjIyMTY4IDEyOS40NzlDMC4yMjE2OCAxMjkuNTAzIDAuMTMzNTU0IDEyOS41MjUgMCAxMjkuNTY4VjBIMjA3LjI5OVYyMDdaTTEzMS43NyA3Ny42OTI0QzExOS4xNjUgNzcuNjkyNSAxMDkuNTgzIDgzLjYyOTMgMTA2LjMxNSA4Ni4xODA3QzEwMC42NCA5MC42MjA5IDk2LjE5MjEgOTYuOTk4NyA5NC4zOTg0IDEwMy43OTRDOTAuODg0OSAxMTYuNjk4IDk4LjMwNTMgMTMwLjg1MyAxMTguNjQ5IDEzMC4zMTNDMTI2LjUzNiAxMzAuMTE3IDEzNC43NDIgMTI2Ljk3NyAxMzUuNDMxIDEyNi43MDdWMTI2Ljc1NkMxMzYuMTE5IDEyNi41MTEgMTM2LjY4NCAxMjYuMTY3IDEzNi45MDUgMTI1LjUyOUMxMzcuMTUyIDEyNC45MTMgMTQwIDExNS45NjMgMTQwLjU2NSAxMTQuMDQ5QzE0MS4wODEgMTEyLjE4NCAxMzkuMDkyIDExMi4zNTUgMTM4LjMzIDExMi4zNTVIMTE5LjUxQzExOS4xMTcgMTEyLjM1NSAxMTguODk1IDExMi42MjUgMTE5LjQxMSAxMTIuNzQ4QzExOS45MjcgMTEyLjg5NSAxMjkuOTUyIDExNS41OTQgMTMxLjA4MiAxMTUuODg5QzEzMi4yMTIgMTE2LjIwOCAxMzEuNzQ1IDExNy4zMTIgMTMxLjY0NiAxMTcuNjU1QzEzMS41OTUgMTE3Ljk4MiAxMjkuNzA2IDEyNS43NzYgMTI5LjUxIDEyNi40MTNDMTI5LjI0IDEyNy4wNTEgMTI5LjA5MiAxMjcuMzcgMTI4LjAxMSAxMjcuNjg4QzEyNy4yNzQgMTI3LjkzNCAxMjQuNzE4IDEyOC40NDkgMTIxLjI1NCAxMjguMzUxQzExMC4xOTcgMTI4LjA1NiAxMDMuMjIgMTIwLjkxOCAxMDIuMDQgMTEyLjIwOUMxMDAuNTY2IDEwMS42MzYgMTA3Ljc2NSA4OC4zMzkyIDEyMC4wOTkgODIuNTk4NkMxMjcuNDcgNzkuMTY0MiAxMzcuNDQ2IDgwLjAyMzEgMTM5LjUzNCA4MC43MUMxNDEuMDU3IDgxLjE3NjEgMTQxLjA1OCA4Mi4wMTAzIDE0MS4wNTggODMuMzM1QzE0MS4xMDcgODMuODc4MyAxNDAuNDkzIDk2LjU3MDIgMTQwLjQ5MiA5Ni45MDA0QzE0MC40OTIgOTcuNDg5IDE0MC45NTkgOTcuNDY1IDE0MS4xNTUgOTYuOTI1OEMxNDEuMzAzIDk2LjU1NzggMTQ2LjA2OSA4Mi4yMDYxIDE0Ni4yMTcgODEuNzg5MUMxNDYuNDYyIDgwLjkwNTkgMTQ2Ljc4MiA3OS43MDM5IDE0NC42MiA3OS4xMzk2QzE0MC4xNzMgNzcuOTg2NyAxMzQuMTI4IDc3LjY5MjQgMTMxLjc3IDc3LjY5MjRaTTE5MC40MTkgNzYuODM0QzE5MC4zMjEgNzYuNjEzMyAxOTAuMDUgNzYuNTg4OCAxODkuODA1IDc2LjgzNEMxODkuMDQzIDc3LjU2OTggMTQ0LjA0NSAxMjYuNTQ1IDE0My4xNzEgMTI3LjA3NUMxNDEuNTc1IDEyOC4zNSAxMzguNDM0IDEyOS40NTMgMTM4LjI1NyAxMjkuNTc3QzEzOC4wNiAxMjkuNjUxIDEzOC4wNiAxMjkuOTIxIDEzOC4zMDYgMTI5LjkyMUgxNjIuMDRDMTYyLjM1OSAxMjkuOTIxIDE2Mi40MDkgMTI5LjYyNiAxNjIuMTg4IDEyOS41NzdDMTYwLjQxOCAxMjkuMjM0IDE1Mi43NzcgMTI3LjY0IDE1MS40NSAxMjcuMjQ3QzE1MC4xNzMgMTI2Ljg3OSAxNTAuMDI1IDEyNi4xMTggMTUwLjQ5MiAxMjUuNDMyQzE1MC45NTkgMTI0Ljc2OSAxNjMuMDczIDEwOS44MjkgMTYzLjkzMyAxMDkuMTY3QzE2NS4wNjMgMTA4LjMwOSAxNjUuNTMgMTA4LjIxIDE2Ny40NzEgMTA4LjE4NkMxNjguMDg2IDEwOC4xNjEgMTcxLjY3MiAxMDguMDYzIDE3NS4xMzYgMTA4LjE4NkMxNzguMDEgMTA4LjIzNSAxODAuNzYzIDEwOC40OCAxODEuNjIzIDEwOC41NTRDMTgzLjQxNiAxMDguNzAxIDE4My4yNDQgMTEwLjAyNiAxODMuMjQ0IDExMC43MTNDMTgzLjI0NCAxMTEuMzU0IDE4Mi43MDQgMTIyLjI5MiAxODIuNjggMTI0LjE4MUMxODIuNjMxIDEyNi4wOTQgMTgyLjMxMSAxMjYuMzY0IDE4MS4wODIgMTI2LjgwNkMxODAuNDE3IDEyNy4wMDIgMTcyLjMzNSAxMjkuNjAyIDE3Mi4wNjQgMTI5Ljc0OUMxNzEuNzc0IDEyOS44NDYgMTcyLjE1NCAxMjkuOTE5IDE3Mi4xNjMgMTI5LjkyMUgxOTcuMzcyQzE5Ny43NDEgMTI5LjkyMSAxOTcuODg4IDEyOS43MjUgMTk3LjY2NyAxMjkuNjAzTDE5Ny42MTggMTI5LjU3N0MxOTcuMDUzIDEyOS4zNTYgMTkyLjU1NiAxMjcuNDE5IDE5MS4zNzcgMTI2Ljg1NEMxOTAuMDUgMTI2LjI0MSAxOTAuMDAxIDEyNS4yNiAxODkuOTUyIDEyNC40NUMxODkuOTAzIDEyMy43MDQgMTkwLjYxNSA3Ny4yMDE5IDE5MC40MTkgNzYuODM0Wk03MC45NTkgNzguNDUzMUM3MC42ODg3IDc4LjQ1MzEgNzAuNjg4NCA3OC42NzQzIDcxLjAwNzggNzguNzcyNUM3MS4xODMxIDc4Ljg3MTcgNzcuMTk3NyA4MC44ODEyIDc3LjgxMzUgODEuMTI3Qzc4Ljk2ODMgODEuNTQ0IDc5LjA2NjggODIuNTI1NiA3OC44NDU3IDgzLjUwNjhDNzguNjQ4IDg0LjI5NjQgNjguODcxOCAxMjQuNTQ0IDY4LjYyNSAxMjUuNDMyQzY4LjI1NjUgMTI2LjYwOSA2Ni45Mjk1IDEyNy4wNzUgNjYuMzY0MyAxMjcuMjk2QzY1Ljg5NzQgMTI3LjQ5MiA2MC43MzczIDEyOS4zMzIgNjAuMjcwNSAxMjkuNTUzQzU5Ljg1MjkgMTI5Ljc0OSA2MC4wOTg5IDEyOS44NzIgNjAuNTE2NiAxMjkuODcySDgzLjg1ODRDODQuMzI0OCAxMjkuODcyIDg0LjQyMjkgMTI5LjU3OCA4NC4wMDU5IDEyOS40MzFDODMuNTg4MiAxMjkuMjM0IDc4LjEzMjggMTI3LjMyIDc3LjA1MTggMTI2Ljg3OUM3NS45OTU3IDEyNi40ODYgNzYuMDQ0NyAxMjUuNzAxIDc2LjI0MTIgMTI0Ljc5NEM3Ni4zNjQgMTI0LjEwNyA4NS44NyA4NC4wMzI2IDg2LjExODIgODMuMjg2MUM4Ni40Mzc2IDgyLjMyOTQgODYuODggODEuNjY2NiA4OC4xMDg0IDgxLjEyN1Y4MS4xMDI1Qzg4Ljg3MDEgODAuNzU5MSA5MC4zNDQ3IDgwLjI5MjcgOTAuODExNSA4MC4xNDU1QzkxLjIzMDQgNzkuOTk4IDk1LjI1ODEgNzguODQ1MyA5NS42MjcgNzguNzQ3MUM5NS45NzA5IDc4LjY0ODkgOTUuNzI1MyA3OC40NTMxIDk1LjQ1NTEgNzguNDUzMUg3MC45NTlaTTQzLjkwNzIgODkuMTQ5NEM0NC44MTYzIDg4LjExOTEgNDUuNjUxNCA4OC4xNjggNDUuNjUxNCA4OS41OTA4QzQ1LjY1MTQgOTEuMDE0MiA0NS40MzA3IDEwMy43OTEgNDUuNDMwNyAxMDQuNTNMNDUuNDA2MiAxMDQuNDgxQzQ1LjQwNjIgMTA1LjUzNiA0NC45ODc2IDEwNi4xMjUgNDMuMjQzMiAxMDYuMTI1SDMwLjk4MzRDMjkuMDkxNSAxMDYuMSAyOS4xNDAxIDEwNS4wNDYgMjkuODUyNSAxMDQuMzFDMzAuNTE1OSAxMDMuNSA0My40MTQ3IDg5LjcxNDggNDMuOTA3MiA4OS4xNDk0Wk0xODEuODkzIDg5LjE0OTRDMTgyLjgyNiA4OC4xMTkxIDE4My42MzggODguMTY4IDE4My42MzggODkuNTkwOEMxODMuNjM4IDkxLjAxNDIgMTgzLjQ0MSAxMDMuNzkxIDE4My40NDEgMTA0LjUzVjEwNC40ODFDMTgzLjQ0MSAxMDUuNTM2IDE4Mi45NzQgMTA2LjEyNSAxODEuMjU0IDEwNi4xMjVIMTY4Ljk2OUMxNjcuMDc3IDEwNi4xIDE2Ny4xMjYgMTA1LjA0NSAxNjcuODM5IDEwNC4zMUMxNjguNTUyIDEwMy40OTkgMTgxLjQyIDg5LjcxOTYgMTgxLjg5MyA4OS4xNDk0WiIgZmlsbD0iYmxhY2siLz4KPC9zdmc+Cg==';_logoImgs['black']=img;})();


function drawLogo(ctx,W,H){
  if(T.logo==='none')return;
  const img=_logoImgs[T.logo];
  if(!img||!img.complete||img.naturalWidth===0)return;
  const pad=W*.03;
  const logoW=120;
  const logoH=logoW*(207/604);
  const dock=T.logoDock||'tr';
  const x=dock==='tr'?W-pad-logoW:pad;
  const y=dock==='tr'?pad:H-pad-logoH;
  ctx.save();
  ctx.drawImage(img,x,y,logoW,logoH);
  ctx.restore();
}

/* ════════════════════════════════════════════
   CANVAS RENDER ENGINE
════════════════════════════════════════════ */
function typo_render(){
  autosave();
  const canvas=document.getElementById('typeCanvas');
  const ctx=canvas.getContext('2d');
  const t=T.frame;
  ctx.clearRect(0,0,TW,TH);

  // BG solid
  ctx.fillStyle=T.bg;ctx.fillRect(0,0,TW,TH);

  // Gradient overlay
  if(T.grad!=='none'){
    ctx.save();ctx.globalAlpha=T.gradOpacity/100;
    drawGradient(ctx,T.grad,TW,TH,T.gradC1,T.gradC2,T.gradC3||T.gradC1,T.gradAngle,T.gradMid??50,T.gradGrain??0,T.gradBlobs??4,T.gradC4||T.gradC1,T.gradC5||T.gradC2);
    ctx.restore();
  }

  // Texture
  if(T.bgTex!=='none'){
    ctx.save();ctx.globalAlpha=T.texOp/100;
    drawBGTexture(ctx,T.bgTex,TW,TH);ctx.restore();
  }

  // Snapshot background before layers for halftone text-only mode
  if(T.htMode&&T.htMode!=='none'&&T.htMode!=='color'&&T.htBg===false){
    _htBgSnap=ctx.getImageData(0,0,TW,TH);
  }else{
    _htBgSnap=null;
  }

  // Layers — first pass: layers subject to post FX
  T.layers.forEach(layer=>{
    if(!layer.visible||layer.excludeFromFX)return;
    ctx.save();ctx.globalAlpha=layer.opacity/100;
    ctx.globalCompositeOperation=layer.blend;
    drawLayer(ctx,layer,t);ctx.restore();
  });

  // Post FX (halftone + riso — after all content, before grain)
  if(T.htMode&&T.htMode!=='none')applyHalftone(ctx,TW,TH);
  if(T.riso>0)applyRisograph(ctx,TW,TH);

  // Grain
  if(T.grain>0) drawGrain(ctx,TW,TH,T.grain,T.grainSize,T.grainStyle||'overlay');

  // Layers — second pass: layers excluded from FX (render clean on top)
  T.layers.forEach(layer=>{
    if(!layer.visible||!layer.excludeFromFX)return;
    ctx.save();ctx.globalAlpha=layer.opacity/100;
    ctx.globalCompositeOperation=layer.blend;
    drawLayer(ctx,layer,t);ctx.restore();
  });

  // AIGA Logo — always last, unaffected by any FX
  drawLogo(ctx,TW,TH);
}

function setHTMode(el,mode){
  document.querySelectorAll('#htModeOpts .bg-opt').forEach(e=>e.classList.remove('active'));
  el.classList.add('active');T.htMode=mode;typo_render();
}

function applyHalftone(ctx,W,H){
  const sp=Math.max(1,T.htSpacing||8);
  const ang=(T.htAngle||45)*Math.PI/180;
  const mode=T.htMode;
  // Snapshot current canvas before we clear it
  const snap=ctx.getImageData(0,0,W,H);
  const pd=snap.data;

  if(mode==='color'){
    // CMYK: white paper + multiply blend, 4 separate screens
    ctx.fillStyle='#ffffff';
    ctx.fillRect(0,0,W,H);
    ctx.globalCompositeOperation='multiply';
    const screens=[[15,'#00b4f0',(r,g,b)=>1-r/255],[75,'#ec008c',(r,g,b)=>1-g/255],[90,'#ffee00',(r,g,b)=>1-b/255],[45,'#231f20',(r,g,b)=>1-(0.299*r+0.587*g+0.114*b)/255]];
    screens.forEach(([screenDeg,dotColor,inkFn])=>{
      const a2=screenDeg*Math.PI/180;
      const cos2=Math.cos(a2),sin2=Math.sin(a2);
      const ext=Math.ceil(Math.hypot(W,H)/sp)+2;
      ctx.fillStyle=dotColor;ctx.globalAlpha=0.88;
      for(let gi=-ext;gi<ext;gi++){
        for(let gj=-ext;gj<ext;gj++){
          const cx=Math.round(gj*sp*cos2-gi*sp*sin2+W/2);
          const cy=Math.round(gj*sp*sin2+gi*sp*cos2+H/2);
          if(cx<0||cx>=W||cy<0||cy>=H)continue;
          const idx=(cy*W+cx)*4;
          const ink=inkFn(pd[idx],pd[idx+1],pd[idx+2]);
          const rad=sp*0.52*ink;
          if(rad<0.2)continue;
          ctx.beginPath();ctx.arc(cx,cy,rad,0,Math.PI*2);ctx.fill();
        }
      }
    });
    ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
    return;
  }

  // Dots or lines — color-preserving, rotate grid around center
  // If htBg=false, restore the clean background instead of solid fill
  if(_htBgSnap){
    ctx.putImageData(_htBgSnap,0,0);
  }else{
    ctx.fillStyle=T.bg;ctx.fillRect(0,0,W,H);
  }
  const cos=Math.cos(ang),sin=Math.sin(ang);
  const ext=Math.ceil(Math.hypot(W,H)/sp)+2;
  // Pre-compute solid bg color for fallback contrast check
  const bgHex=(T.bg||'#080808').replace('#','');
  const bgR=parseInt(bgHex.slice(0,2),16)/255;
  const bgG=parseInt(bgHex.slice(2,4),16)/255;
  const bgB=parseInt(bgHex.slice(4,6),16)/255;
  const bgPd=_htBgSnap?_htBgSnap.data:null;
  // Minimum mark size grows with spacing — ensures visibility at small sp
  const minMark=Math.max(0.5,sp*0.18);

  for(let gi=-ext;gi<ext;gi++){
    for(let gj=-ext;gj<ext;gj++){
      const cx=Math.round(gj*sp*cos-gi*sp*sin+W/2);
      const cy=Math.round(gj*sp*sin+gi*sp*cos+H/2);
      if(cx<0||cx>=W||cy<0||cy>=H)continue;
      const idx=(cy*W+cx)*4;
      const r=pd[idx],g=pd[idx+1],b=pd[idx+2],a=pd[idx+3];
      if(a<8)continue;
      // Use RGB distance from background to size marks — handles colored content
      let dr,dg,db;
      if(bgPd){
        // Compare against actual background snapshot pixel
        dr=r/255-bgPd[idx]/255;dg=g/255-bgPd[idx+1]/255;db=b/255-bgPd[idx+2]/255;
      }else{
        dr=r/255-bgR;dg=g/255-bgG;db=b/255-bgB;
      }
      const contrast=Math.min(1,Math.sqrt(dr*dr+dg*dg+db*db)*0.577);
      if(contrast<0.04)continue;
      // Slight gamma lift so mid-contrast colors get proportionally larger marks
      const t=Math.pow(contrast,0.72);
      ctx.fillStyle=`rgb(${r},${g},${b})`;
      if(mode==='dots'){
        const rad=Math.max(minMark,sp*0.52*t);
        ctx.beginPath();ctx.arc(cx,cy,rad,0,Math.PI*2);ctx.fill();
      }else{ // lines
        const lw=Math.max(minMark,sp*0.88*t);
        ctx.save();ctx.translate(cx,cy);ctx.rotate(ang+Math.PI/2);
        ctx.fillRect(-sp*0.5,-lw*0.5,sp,lw);ctx.restore();
      }
    }
  }
}

function setRisoColor(hex,clickedEl){
  T.risoC1=hex;
  const pick=document.getElementById('risoC1Pick');
  if(pick&&/^#[0-9A-Fa-f]{6}$/.test(hex))pick.value=hex;
  // Update active state across preset dots and palette dots
  document.querySelectorAll('[data-riso-preset],[data-riso-pal="1"]').forEach(d=>d.classList.remove('active'));
  if(clickedEl)clickedEl.classList.add('active');
  typo_render();
}

function applyRisograph(ctx,W,H){
  const amt=T.riso/100;
  if(amt<=0)return;
  const offset=Math.round(T.risoOffset||3);

  // Pixel-level R channel misregistration (riso color plate offset)
  const imgData=ctx.getImageData(0,0,W,H);
  const d=imgData.data;
  const orig=new Uint8ClampedArray(d);
  for(let y=0;y<H;y++){
    for(let x=0;x<W;x++){
      const i=(y*W+x)*4;
      // Shift R channel by offset pixels (horizontal misregistration)
      const sx=Math.min(W-1,x+offset);
      const si=(y*W+sx)*4;
      d[i]=Math.round(orig[i]*(1-amt)+orig[si]*amt);
      // Slight G channel counter-shift (vertical) for more riso feel
      const sy=Math.min(H-1,y+Math.round(offset*0.4));
      const siy=(sy*W+x)*4;
      d[i+1]=Math.round(orig[i+1]*(1-amt*0.5)+orig[siy+1]*amt*0.5);
    }
  }
  ctx.putImageData(imgData,0,0);

  // Ink color tint overlay
  const hex=T.risoC1||'#e5007d';
  ctx.save();
  ctx.globalAlpha=0.3*amt;
  ctx.globalCompositeOperation='screen';
  ctx.fillStyle=hex;
  ctx.fillRect(0,0,W,H);
  ctx.restore();

  // Riso-specific halftone grain (coarse, colored)
  const gW=Math.ceil(W/2),gH=Math.ceil(H/2);
  const gr=document.createElement('canvas');
  gr.width=gW;gr.height=gH;
  const gCtx=gr.getContext('2d');
  const imgd=gCtx.createImageData(gW,gH);
  const gd=imgd.data;
  // Parse hex to rgb for grain coloring
  const rc=parseInt(hex.slice(1,3),16),gc2=parseInt(hex.slice(3,5),16),bc2=parseInt(hex.slice(5,7),16);
  for(let i=0;i<gd.length;i+=4){
    const on=Math.random()>0.6;
    gd[i]=on?rc:0;gd[i+1]=on?gc2:0;gd[i+2]=on?bc2:0;
    gd[i+3]=on?Math.round(Math.random()*45*amt):0;
  }
  gCtx.putImageData(imgd,0,0);
  ctx.save();
  ctx.globalCompositeOperation='screen';
  ctx.globalAlpha=0.45;
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(gr,0,0,W,H);
  ctx.restore();
}

function drawBGTexture(ctx,type,W,H){
  const s=22;ctx.strokeStyle='#e5007d';ctx.fillStyle='#e5007d';ctx.lineWidth=1;
  if(type==='grid'){
    for(let x=0;x<W;x+=s){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=0;y<H;y+=s){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  }else if(type==='paper'){
    // Blueprint / graph paper — light blue lines, standard grid spacing
    const sp=28;const minor='rgba(100,160,220,0.55)';const major='rgba(60,120,190,0.75)';
    ctx.lineWidth=0.8;
    for(let x=0;x<W;x+=sp){
      ctx.strokeStyle=(Math.round(x/sp)%5===0)?major:minor;
      ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();
    }
    for(let y=0;y<H;y+=sp){
      ctx.strokeStyle=(Math.round(y/sp)%5===0)?major:minor;
      ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();
    }
  }else if(type==='dot'){
    for(let x=s/2;x<W;x+=s)for(let y=s/2;y<H;y+=s){ctx.beginPath();ctx.arc(x,y,s*.1,0,Math.PI*2);ctx.fill();}
  }else if(type==='diagonal'){
    const d=Math.ceil(Math.hypot(W,H));ctx.save();ctx.translate(W/2,H/2);ctx.rotate(Math.PI/4);ctx.translate(-d/2,-d/2);
    for(let x=0;x<d*2;x+=s){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,d*2);ctx.stroke();}
    ctx.restore();
  }else if(type==='scan'){
    // Horizontal scan lines — CRT / risograph feel
    ctx.strokeStyle='rgba(0,0,0,0.5)';ctx.lineWidth=1;
    const lh=3;
    for(let y=0;y<H;y+=lh){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  }else if(type==='noise'){
    // Fine static noise drawn pixel-by-pixel
    const imgd=ctx.createImageData(W,H);const d=imgd.data;
    for(let i=0;i<d.length;i+=4){
      const v=Math.random()>0.5?255:0;
      d[i]=v;d[i+1]=v;d[i+2]=v;d[i+3]=Math.round(Math.random()*80+20);
    }
    ctx.putImageData(imgd,0,0);
  }
}

function drawGradient(ctx,type,W,H,c1,c2,c3,angle,mid,grain,blobs,c4,c5){
  c3=c3||c1;
  const midStop=Math.max(0.01,Math.min(0.99,(mid??50)/100));
  // Draw to offscreen canvas so grain stays isolated to gradient layer
  if(!_gradOC||_gradOC.width!==W||_gradOC.height!==H){
    _gradOC=document.createElement('canvas');_gradOC.width=W;_gradOC.height=H;
  }
  const gc=_gradOC.getContext('2d');
  gc.clearRect(0,0,W,H);
  let g;
  if(type==='linear'){
    const rad=angle*Math.PI/180;
    const cx=W/2,cy=H/2,len=Math.max(W,H)*1.5;
    g=gc.createLinearGradient(cx-Math.cos(rad)*len/2,cy-Math.sin(rad)*len/2,cx+Math.cos(rad)*len/2,cy+Math.sin(rad)*len/2);
    g.addColorStop(0,c1);g.addColorStop(midStop,c3);g.addColorStop(1,c2);
    gc.fillStyle=g;gc.fillRect(0,0,W,H);
  }else if(type==='radial'){
    g=gc.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.max(W,H)*.7);
    g.addColorStop(0,c1);g.addColorStop(midStop,c3);g.addColorStop(1,c2);
    gc.fillStyle=g;gc.fillRect(0,0,W,H);
  }else if(type==='conic'){
    const rad=angle*Math.PI/180;
    g=gc.createConicGradient(rad,W/2,H/2);
    g.addColorStop(0,c1);g.addColorStop(midStop,c3);g.addColorStop(0.66,c2);g.addColorStop(1,c1);
    gc.fillStyle=g;gc.fillRect(0,0,W,H);
  }else if(type==='split'){
    gc.fillStyle=c1;gc.fillRect(0,0,W/2,H);
    gc.fillStyle=c2;gc.fillRect(W/2,0,W/2,H);
    const sg=gc.createLinearGradient(W/2-W*.06,0,W/2+W*.06,0);
    sg.addColorStop(0,c1);sg.addColorStop(1,c2);
    gc.fillStyle=sg;gc.fillRect(W/2-W*.06,0,W*.12,H);
  }else if(type==='vignette'){
    g=gc.createRadialGradient(W/2,H/2,Math.min(W,H)*.2,W/2,H/2,Math.max(W,H)*.85);
    g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,0.88)');
    gc.fillStyle=g;gc.fillRect(0,0,W,H);
  }else if(type==='sunset'){
    g=gc.createLinearGradient(0,0,0,H);
    g.addColorStop(0,c3);g.addColorStop(0.45,c1);g.addColorStop(1,c2);
    gc.fillStyle=g;gc.fillRect(0,0,W,H);
  }else if(type==='glow-corner'){
    const corners=[[0,H],[W,0]];
    corners.forEach(([cx,cy])=>{
      const cg=gc.createRadialGradient(cx,cy,0,cx,cy,Math.max(W,H)*.75);
      cg.addColorStop(0,c1+'88');cg.addColorStop(1,'transparent');
      gc.fillStyle=cg;gc.fillRect(0,0,W,H);
    });
  }else if(type==='mesh'){
    const n=Math.max(2,Math.min(8,blobs||4));
    const meshCols=[c1,c2,c3,c4||c1,c5||c2];
    const positions=[[0.15,0.20],[0.85,0.15],[0.50,0.50],[0.10,0.80],[0.90,0.85],[0.50,0.10],[0.30,0.65],[0.70,0.40]];
    const r=Math.max(W,H)*0.78;
    gc.save();
    for(let i=0;i<n;i++){
      const [px,py]=positions[i%positions.length];
      const col=meshCols[i%meshCols.length];
      const bx=px*W,by=py*H;
      const bg=gc.createRadialGradient(bx,by,0,bx,by,r);
      bg.addColorStop(0,col+'cc');bg.addColorStop(1,'rgba(0,0,0,0)');
      gc.globalCompositeOperation=i===0?'source-over':'screen';
      gc.fillStyle=bg;gc.fillRect(0,0,W,H);
    }
    gc.restore();
  }
  // Inline grain — isolated to gradient layer only
  if(grain>0){
    const GS=256;
    if(!_gradGrainC||(T.animating&&T.frame%2===0)){
      if(!_gradGrainC){_gradGrainC=document.createElement('canvas');_gradGrainC.width=GS;_gradGrainC.height=GS;}
      const nc=_gradGrainC.getContext('2d');
      const nid=nc.createImageData(GS,GS);const nd=nid.data;
      const a=Math.round(grain*2.2);
      for(let i=0;i<nd.length;i+=4){const v=Math.round(Math.random()*255);nd[i]=nd[i+1]=nd[i+2]=v;nd[i+3]=Math.random()*a;}
      nc.putImageData(nid,0,0);
    }
    gc.save();
    gc.globalCompositeOperation='overlay';
    gc.globalAlpha=0.9;
    gc.imageSmoothingEnabled=false;
    gc.drawImage(_gradGrainC,0,0,W,H);
    gc.restore();
  }
  ctx.drawImage(_gradOC,0,0);
}

// Cached gradient offscreen canvas and grain canvas
let _gradOC=null,_gradGrainC=null;
// Background snapshot for halftone text-only mode
let _htBgSnap=null;
// Cached grain canvas for performance
let _grainCanvas=null,_grainW=0,_grainH=0,_grainSeed=0;
function drawGrain(ctx,W,H,intensity,size,style){
  size=Math.max(1,Math.round(size));
  const gW=Math.ceil(W/size),gH=Math.ceil(H/size);
  // Regenerate grain every 2 frames when animated; stay static otherwise
  if(!_grainCanvas||_grainW!==gW||_grainH!==gH||(T.grainAnim!==false&&T.animating&&T.frame%2===0)){
    if(!_grainCanvas)_grainCanvas=document.createElement('canvas');
    _grainCanvas.width=gW;_grainCanvas.height=gH;
    const gCtx=_grainCanvas.getContext('2d');
    const imgData=gCtx.createImageData(gW,gH);
    const d=imgData.data;
    const alpha=Math.round(intensity*2);
    let gcR=229,gcG=0,gcB=125;
    if(style==='color'){const gcHex=(T.grainColor||'#ec008c').replace('#','');gcR=parseInt(gcHex.slice(0,2),16);gcG=parseInt(gcHex.slice(2,4),16);gcB=parseInt(gcHex.slice(4,6),16);}
    for(let i=0;i<d.length;i+=4){
      if(style==='color'){
        d[i]=Math.random()>0.5?gcR:0;
        d[i+1]=Math.random()>0.5?gcG:0;
        d[i+2]=Math.random()>0.5?gcB:0;
        d[i+3]=Math.random()*alpha;
      }else{
        const v=Math.round(Math.random()*255);
        d[i]=d[i+1]=d[i+2]=v;
        d[i+3]=Math.random()*alpha;
      }
    }
    gCtx.putImageData(imgData,0,0);
    _grainW=gW;_grainH=gH;
  }
  ctx.save();
  ctx.globalCompositeOperation=style==='overlay'?'overlay':'screen';
  ctx.globalAlpha=1;
  ctx.imageSmoothingEnabled=false;
  ctx.drawImage(_grainCanvas,0,0,W,H);
  ctx.restore();
}

/* ════════════════════════════════════════════
   EYE LAYER
════════════════════════════════════════════ */
function eyePath(ctx,cx,cy,hw,hh){
  const c=hw*0.42;
  ctx.moveTo(cx-hw,cy);
  ctx.bezierCurveTo(cx-c,cy-hh,cx+c,cy-hh,cx+hw,cy);
  ctx.bezierCurveTo(cx+c,cy+hh,cx-c,cy+hh,cx-hw,cy);
  ctx.closePath();
}
function drawEye(ctx,cx,cy,hw,layer,eyeIdx,t){
  const hh=hw*0.595;
  const hwi=hw*0.886;
  const hhi=hh*0.834;
  const irisR=hw*0.363;
  const pupilR=hw*0.174;
  const maxOffset=hw*0.22;
  const spd=layer.lookSpeed??1;
  const amt=layer.lookAmt??1;
  const ph=(layer.lookStagger!==false)?eyeIdx*0.618:0;
  let gx=cx,gy=cy;
  if(layer.lookMode==='wander'){
    const rand=layer.wanderRandom??0;
    const smoothX=Math.sin(t*spd*0.021+ph*4.9)*Math.cos(t*spd*0.013+ph*2.3);
    const smoothY=Math.sin(t*spd*0.016+ph*7.3+1.4)*Math.cos(t*spd*0.011+ph*3.1);
    const chaoticX=(Math.sin(t*spd*0.047+ph*3.1)+Math.sin(t*spd*0.009+ph*6.2)*0.7+Math.sin(t*spd*0.031+ph*1.7)*0.5)/2.2;
    const chaoticY=(Math.sin(t*spd*0.059+ph*4.4+1)+Math.sin(t*spd*0.011+ph*5.1+2)*0.7+Math.sin(t*spd*0.037+ph*2.9)*0.5)/2.2;
    gx=cx+(smoothX*(1-rand)+chaoticX*rand)*maxOffset*amt;
    gy=cy+(smoothY*(1-rand)+chaoticY*rand)*maxOffset*amt;
  }else if(layer.lookMode==='circle'){
    const a=t*spd*Math.PI*2+ph*Math.PI*2;
    gx=cx+Math.cos(a)*maxOffset*amt;gy=cy+Math.sin(a)*maxOffset*amt;
  }else if(layer.lookMode==='h-scan'){
    gx=cx+Math.sin(t*spd*Math.PI*2+ph*Math.PI*2)*maxOffset*amt;gy=cy;
  }else if(layer.lookMode==='v-scan'){
    gx=cx;gy=cy+Math.sin(t*spd*Math.PI*2+ph*Math.PI*2)*maxOffset*amt;
  }else if(layer.lookMode==='toward-center'){
    const dx=TW/2-cx,dy=TH/2-cy;
    const dist=Math.sqrt(dx*dx+dy*dy)||1;
    gx=cx+(dx/dist)*maxOffset*amt;gy=cy+(dy/dist)*maxOffset*amt;
  }else{
    gx=cx+(layer.lookX||0)*maxOffset;gy=cy+(layer.lookY||0)*maxOffset;
  }
  const allPalCols=[PALETTE.magenta,PALETTE.primary,PALETTE.h1,PALETTE.h2,PALETTE.muted,PALETTE.surface];
  const palCols=allPalCols.filter(c=>lightness(c)<=75);
  let irisColor;
  if(layer.colorMode==='palette'){irisColor=palCols[eyeIdx%palCols.length]||PALETTE.magenta;}
  else if(layer.colorMode==='random'){irisColor=palCols[Math.abs(Math.floor(eyeIdx*2.618))%palCols.length]||PALETTE.magenta;}
  else{irisColor=layer.irisColor||'#e5007d';}
  const outlineColor=layer.outlineColor||'#080808';
  const scleraColor=layer.scleraColor||'#ffffff';
  const pupilColor=layer.pupilColor||'#080808';
  ctx.beginPath();eyePath(ctx,cx,cy,hwi,hhi);ctx.fillStyle=scleraColor;ctx.fill();
  ctx.save();
  ctx.beginPath();eyePath(ctx,cx,cy,hwi,hhi);ctx.clip();
  ctx.beginPath();ctx.arc(gx,gy,irisR,0,Math.PI*2);ctx.fillStyle=irisColor;ctx.fill();
  ctx.beginPath();ctx.arc(gx,gy,pupilR,0,Math.PI*2);ctx.fillStyle=pupilColor;ctx.fill();
  ctx.restore();
  ctx.beginPath();eyePath(ctx,cx,cy,hw,hh);eyePath(ctx,cx,cy,hwi,hhi);
  ctx.fillStyle=outlineColor;ctx.fill('evenodd');
}
function drawEyeLayer(ctx,layer,t){
  const cx=(layer.x/100)*TW;
  const cy=(layer.y/100)*TH;
  const hw=layer.eyeSize||100;
  ctx.save();
  ctx.globalAlpha=(layer.opacity??100)/100;
  ctx.globalCompositeOperation=layer.blend||'source-over';
  ctx.translate(cx,cy);
  ctx.rotate((layer.rot||0)*Math.PI/180);
  ctx.scale((layer.sx??100)/100,(layer.sy??100)/100);
  ctx.translate(-cx,-cy);
  if(layer.arrangement==='tile'){
    const rows=layer.tileRows||3,cols=layer.tileCols||4;
    const spX=hw*2*(layer.tileSpacingX||1.8);
    const spY=hw*2*0.595*(layer.tileSpacingY||1.5);
    const totalW=(cols-1)*spX,totalH=(rows-1)*spY;
    let idx=0;
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
      drawEye(ctx,cx-totalW/2+c*spX,cy-totalH/2+r*spY,hw,layer,idx++,t);
    }
  }else if(layer.arrangement==='circle'){
    const count=layer.circleCount||8;
    const radius=(layer.circleRadius/100)*Math.min(TW,TH)*0.5;
    for(let i=0;i<count;i++){
      const angle=(i/count)*Math.PI*2-Math.PI/2;
      const ex=cx+Math.cos(angle)*radius,ey=cy+Math.sin(angle)*radius;
      ctx.save();ctx.translate(ex,ey);ctx.rotate(angle+Math.PI/2);ctx.translate(-ex,-ey);
      drawEye(ctx,ex,ey,hw,layer,i,t);
      ctx.restore();
    }
  }else{
    drawEye(ctx,cx,cy,hw,layer,0,t);
  }
  ctx.restore();
}

function drawLayer(ctx,layer,t){
  // Eye layer
  if(layer.type==='eye'){drawEyeLayer(ctx,layer,t);return;}
  // Image layer
  if(layer.type==='image'){
    if(!layer.img)return;
    const scale=(layer.imgScale??100)/100;
    const iw=layer.img.naturalWidth*scale;
    const ih=layer.img.naturalHeight*scale;
    const cx=(layer.x/100)*TW;
    const cy=(layer.y/100)*TH;
    const dists=layer.dists||['normal'];
    const hasWave=dists.includes('wave');
    const hasGlitch=dists.includes('glitch');
    const hasMirror=dists.includes('mirror');
    const hasStagger=dists.includes('stagger');
    const hasExplode=dists.includes('explode');
    const _ds=layer.distSettings||{};
    const _fb={amt:layer.distAmt??40,spd:layer.distSpd??30};
    const wAmt=(_ds.wave?.amt??_fb.amt),wSpd=(_ds.wave?.spd??_fb.spd)/100;
    const stAmt=(_ds.stagger?.amt??_fb.amt),stSpd=(_ds.stagger?.spd??_fb.spd)/100;
    const exAmt=(_ds.explode?.amt??_fb.amt),exSpd=(_ds.explode?.spd??_fb.spd)/100;
    const glAmt=(_ds.glitch?.amt??_fb.amt),glSpd=(_ds.glitch?.spd??_fb.spd)/100;
    const miAmt=_ds.mirror?.amt??_fb.amt;
    ctx.save();
    ctx.translate(cx,cy);
    ctx.rotate((layer.rot||0)*Math.PI/180);
    ctx.scale((layer.sx??100)/100,(layer.sy??100)/100);
    const staggerOff=hasStagger?Math.sin(t*stSpd*Math.PI*2)*stAmt:0;
    if(hasExplode){const es=1+Math.sin(t*exSpd*Math.PI*2)*(exAmt/200);ctx.scale(es,es);}
    if(hasWave||hasGlitch){
      const nSlices=40;
      const srcSliceH=layer.img.naturalHeight/nSlices;
      const drawSliceH=ih/nSlices;
      for(let s=0;s<nSlices;s++){
        let ox=0;
        if(hasWave)ox=Math.sin((s/nSlices)*Math.PI*4+t*wSpd*Math.PI*2)*(wAmt*0.8);
        if(hasGlitch){const seed=Math.floor(t*glSpd*8+s*7.3)%29;if(seed%4===0)ox+=((seed*17)%glAmt)-glAmt/2;}
        ctx.drawImage(layer.img,0,s*srcSliceH,layer.img.naturalWidth,srcSliceH,ox-iw/2,s*drawSliceH-ih/2+staggerOff,iw,drawSliceH);
      }
    }else{
      ctx.drawImage(layer.img,-iw/2,-ih/2+staggerOff,iw,ih);
    }
    if(hasMirror){ctx.save();ctx.scale(1,-1);ctx.globalAlpha*=Math.min(1,(miAmt/100)*0.5+0.1);ctx.drawImage(layer.img,-iw/2,ih/2+staggerOff+4,iw,ih);ctx.restore();}
    ctx.restore();
    return;
  }
  const text=layer.text||'';if(!text.trim())return;
  const italicW=layer.style==='italic'?'italic ':'';
  const boldW=layer.bold?'bold ':'';
  const baseFstr=`${italicW}${boldW}${layer.size}px '${layer.font}'`.trim();
  const lines=text.split('\n');
  // Normalize dists — backward compat with old dist: string property
  const dists=layer.dists||(layer.dist?[layer.dist]:['normal']);
  const hasTile=dists.includes('tile');
  const hasCircle=dists.includes('circle');
  const hasArch=dists.includes('arch');
  const hasWave=dists.includes('wave');
  const hasStagger=dists.includes('stagger');
  const hasExplode=dists.includes('explode');
  const hasGlitch=dists.includes('glitch');
  const hasMirror=dists.includes('mirror');
  // Per-distortion settings (fall back to global distAmt/distSpd for compat)
  const _ds=layer.distSettings||{};
  const _fb={amt:layer.distAmt??40,spd:layer.distSpd??30};
  const wAmt=(_ds.wave?.amt??_fb.amt), wSpd=(_ds.wave?.spd??_fb.spd)/100;
  const stAmt=(_ds.stagger?.amt??_fb.amt), stSpd=(_ds.stagger?.spd??_fb.spd)/100;
  const exAmt=(_ds.explode?.amt??_fb.amt), exSpd=(_ds.explode?.spd??_fb.spd)/100;
  const arAmt=(_ds.arch?.amt??_fb.amt), arSpd=(_ds.arch?.spd??_fb.spd)/100;
  const glAmt=(_ds.glitch?.amt??_fb.amt), glSpd=(_ds.glitch?.spd??_fb.spd)/100;
  const miAmt=(_ds.mirror?.amt??_fb.amt);
  const hasVarSoft=!!(layer.varSoftPat&&layer.varSoftPat!=='none');
  const hasVarWonk=!!(layer.varWonkPat&&layer.varWonkPat!=='none');
  const hasVarScaleX=!!(layer.varScaleXPat&&layer.varScaleXPat!=='none');
  const hasVarScaleY=!!(layer.varScaleYPat&&layer.varScaleYPat!=='none');
  const hasVarRot=!!(layer.varRotPat&&layer.varRotPat!=='none');
  const hasVarTrack=!!(layer.varTrackPat&&layer.varTrackPat!=='none');
  const hasVarType=(layer.varWghtPat&&layer.varWghtPat!=='none')||(layer.varWidthPat&&layer.varWidthPat!=='none')||(layer.varSkewPat&&layer.varSkewPat!=='none')||hasVarSoft||hasVarWonk||hasVarScaleX||hasVarScaleY||hasVarRot||hasVarTrack;
  const vspd=layer.varSpd||30;
  // Tile: render repeating background pattern, then fall through to normal text if other dists active
  if(hasTile){drawTile(ctx,layer,baseFstr,lines,t,dists);return;}
  if(hasCircle){drawCircle(ctx,layer,baseFstr,lines,t);return;}
  ctx.font=baseFstr;ctx.fillStyle=layer.color;ctx.textBaseline='middle';
  const px=(layer.x/100)*TW,py=(layer.y/100)*TH;
  const lineH=layer.size*1.15;
  const totalH=lineH*lines.length;
  let yOff=py-totalH/2+lineH/2;
  // Fast path: only 'normal' or 'tile', no effects, no var type
  const hasEffects=hasGlitch||hasMirror;
  const hasMotion=hasArch||hasWave||hasStagger||hasExplode;
  if(!hasMotion&&!hasEffects&&!hasVarType){
    lines.forEach(line=>{
      ctx.save();ctx.translate(px,yOff);ctx.rotate(layer.rot*Math.PI/180);ctx.scale(layer.sx/100,layer.sy/100);
      ctx.font=baseFstr;
      const tw=ctx.measureText(line).width+(line.length-1)*layer.ls;
      ctx.fillText(line,-tw/2,0);ctx.restore();
      yOff+=lineH;
    });
    return;
  }
  lines.forEach(line=>{
    const chars=line.split('');
    ctx.font=baseFstr;
    ctx.save();ctx.translate(px,yOff);ctx.rotate(layer.rot*Math.PI/180);ctx.scale(layer.sx/100,layer.sy/100);
    let totalW=0;
    const vTracks=hasVarTrack?chars.map((_,i)=>computeVariation(i,chars.length,layer.varTrackPat,layer.varTrackMin??-5,layer.varTrackMax??60,t,layer.varTrackSpd??layer.varSpd??3,layer.varTrackEase||'linear')):null;
    const widths=chars.map((c,i)=>{const w=ctx.measureText(c).width+(hasVarTrack?vTracks[i]:layer.ls);totalW+=w;return w;});
    let cx=-totalW/2;
    chars.forEach((ch,i)=>{
      ctx.save();
      // Variable type axis values (per-axis speed + easing)
      const vWght=computeVariation(i,chars.length,layer.varWghtPat,layer.varWghtMin??200,layer.varWghtMax??800,t,layer.varWghtSpd??layer.varSpd??3,layer.varWghtEase||'linear');
      const vWidth=computeVariation(i,chars.length,layer.varWidthPat,layer.varWidthMin??60,layer.varWidthMax??140,t,layer.varWidthSpd??layer.varSpd??3,layer.varWidthEase||'linear');
      const vSkew=computeVariation(i,chars.length,layer.varSkewPat,layer.varSkewMin??-25,layer.varSkewMax??25,t,layer.varSkewSpd??layer.varSpd??3,layer.varSkewEase||'linear');
      const vSoft=computeVariation(i,chars.length,layer.varSoftPat,layer.varSoftMin??0,layer.varSoftMax??100,t,layer.varSoftSpd??layer.varSpd??3,layer.varSoftEase||'linear');
      const vWonk=computeVariation(i,chars.length,layer.varWonkPat,layer.varWonkMin??0,layer.varWonkMax??1,t,layer.varWonkSpd??layer.varSpd??3,layer.varWonkEase||'linear');
      const vScaleX=hasVarScaleX?computeVariation(i,chars.length,layer.varScaleXPat,layer.varScaleXMin??50,layer.varScaleXMax??150,t,layer.varScaleXSpd??layer.varSpd??3,layer.varScaleXEase||'linear'):100;
      const vScaleY=hasVarScaleY?computeVariation(i,chars.length,layer.varScaleYPat,layer.varScaleYMin??50,layer.varScaleYMax??150,t,layer.varScaleYSpd??layer.varSpd??3,layer.varScaleYEase||'linear'):100;
      const vRot=hasVarRot?computeVariation(i,chars.length,layer.varRotPat,layer.varRotMin??-45,layer.varRotMax??45,t,layer.varRotSpd??layer.varSpd??3,layer.varRotEase||'linear'):0;
      // Apply SOFT/WONK/opsz via CSS font-variation-settings (must set before ctx.font)
      if(hasVarSoft||hasVarWonk){
        const opsz=Math.min(144,Math.max(9,layer.size));
        const fvp=[`'opsz' ${opsz}`];
        if(hasVarSoft)fvp.push(`'SOFT' ${Math.round(vSoft)}`);
        if(hasVarWonk)fvp.push(`'WONK' ${vWonk.toFixed(2)}`);
        ctx.canvas.style.fontVariationSettings=fvp.join(', ');
      }
      // Variable weight via font-weight (re-setting ctx.font also picks up fontVariationSettings)
      if(layer.varWghtPat&&layer.varWghtPat!=='none'){
        ctx.font=`${italicW}${Math.round(vWght)} ${layer.size}px '${layer.font}'`.trim();
      }else{
        ctx.font=baseFstr;
      }
      // ── ARCH: special layout (overrides x/y position) ──────────────────
      if(hasArch){
        const arcR=Math.max(TW,TH)*(.3+(1-arAmt/100)*.5);
        const arcSpan=totalW/arcR;const sA=-arcSpan/2-Math.PI/2;
        const charA=sA+(cx+widths[i]/2+totalW/2)/arcR;
        ctx.translate(Math.cos(charA)*arcR,Math.sin(charA)*arcR+arcR);
        ctx.rotate(charA+Math.PI/2);
        // Additive motion on top of arch
        if(hasWave){const wT=t*wSpd+i*.3;ctx.translate(0,Math.sin(wT*2+i*.5)*(wAmt/100)*layer.size*.3);}
        if(hasStagger){const stT=t*stSpd+i*.3;ctx.translate(0,Math.sin(stT*1.5+i*1.1)*(stAmt/100)*layer.size*.35);}
        if(hasExplode){const exT=t*exSpd+i*.3;const ea=(exAmt/100)*layer.size*.6;ctx.rotate(Math.sin(i*2.7+exT*.5)*(exAmt/100)*.5);ctx.translate(Math.sin(i*5.1)*ea*.3,Math.cos(i*3.7)*ea*.2);}
        if(hasVarType){
          if(hasVarRot)ctx.rotate(vRot*Math.PI/180);
          if(hasVarScaleX||hasVarScaleY)ctx.scale(hasVarScaleX?vScaleX/100:1,hasVarScaleY?vScaleY/100:1);
          if(layer.varWidthPat&&layer.varWidthPat!=='none')ctx.scale(vWidth/100,1);
          if(layer.varSkewPat&&layer.varSkewPat!=='none')ctx.transform(1,0,Math.tan(vSkew*Math.PI/180),1,0,0);
        }
        ctx.translate(-widths[i]/2,0);
        if(hasGlitch){const glT=t*glSpd;const ga=(glAmt/100)*layer.size,gx=Math.sin(glT*3+i)*ga*.25;ctx.save();ctx.fillStyle='#e5007d';ctx.globalAlpha*=.65;ctx.fillText(ch,gx,Math.sin(glT*2+i*1.3)*ga*.1);ctx.restore();ctx.save();ctx.fillStyle='#00e5ff';ctx.globalAlpha*=.45;ctx.fillText(ch,-gx*.5,0);ctx.restore();}
        ctx.fillText(ch,0,0);
        if(hasMirror){ctx.save();ctx.scale(1,-1);ctx.globalAlpha=(miAmt/100)*.35;ctx.fillText(ch,0,layer.size*.15);ctx.restore();}
        ctx.restore();cx+=widths[i];return;
      }
      // ── STANDARD POSITIONING: additive offsets ──────────────────────────
      let offX=cx+widths[i]/2,offY=0,extraRot=0;
      if(hasWave){const wT=t*wSpd+i*.3;offY+=Math.sin(wT*2+i*.5)*(wAmt/100)*layer.size*.6;}
      if(hasStagger){const stT=t*stSpd+i*.3;offY+=Math.sin(stT*1.5+i*1.1)*(stAmt/100)*layer.size*.8;}
      if(hasExplode){
        const exT=t*exSpd+i*.3;const sd=i*2.4+1.3,ea=(exAmt/100)*layer.size*1.5;
        offX+=Math.sin(sd*5.1)*ea+Math.sin(exT*.8+sd)*ea*.3;
        offY+=Math.cos(sd*3.7)*ea*.5+Math.sin(exT*.6+sd*1.2)*ea*.2;
        extraRot=Math.sin(sd*2.7+exT*.5)*(exAmt/100)*.8;
      }
      ctx.translate(offX,offY);
      if(extraRot)ctx.rotate(extraRot);
      // Variable transform axes
      if(hasVarType){
        if(hasVarRot)ctx.rotate(vRot*Math.PI/180);
        if(hasVarScaleX||hasVarScaleY)ctx.scale(hasVarScaleX?vScaleX/100:1,hasVarScaleY?vScaleY/100:1);
        if(layer.varWidthPat&&layer.varWidthPat!=='none')ctx.scale(vWidth/100,1);
        if(layer.varSkewPat&&layer.varSkewPat!=='none')ctx.transform(1,0,Math.tan(vSkew*Math.PI/180),1,0,0);
      }
      // Glitch effect (before main draw — chromatic aberration layers)
      if(hasGlitch){
        const glT=t*glSpd;const ga=(glAmt/100)*layer.size,gx=Math.sin(glT*3+i)*ga*.3;
        ctx.save();ctx.fillStyle='#e5007d';ctx.globalAlpha*=.65;ctx.fillText(ch,-widths[i]/2+gx,Math.sin(glT*2+i*1.3)*ga*.1);ctx.restore();
        ctx.save();ctx.fillStyle='#00e5ff';ctx.globalAlpha*=.45;ctx.fillText(ch,-widths[i]/2-gx*.5,0);ctx.restore();
      }
      // Main character draw
      ctx.fillText(ch,-widths[i]/2,0);
      // Mirror effect (after main draw)
      if(hasMirror){ctx.save();ctx.scale(1,-1);ctx.globalAlpha=(miAmt/100)*.4;ctx.fillText(ch,-widths[i]/2,layer.size*.15);ctx.restore();}
      ctx.restore();cx+=widths[i];
    });
    ctx.restore();
    yOff+=lineH;
  });
  if(hasVarSoft||hasVarWonk)ctx.canvas.style.fontVariationSettings='normal';
}

function drawTile(ctx,layer,fstr,lines,t,dists){
  const text=lines.join(' ');
  const chars=text.split('');
  if(!chars.length)return;
  ctx.font=fstr.trim();ctx.fillStyle=layer.color;ctx.textBaseline='middle';
  const scaleX=layer.sx/100,scaleY=layer.sy/100;
  // Measure each char for per-instance letter-spacing
  const charW=chars.map(c=>ctx.measureText(c).width);
  const rawW=charW.reduce((s,w)=>s+w,0)+layer.ls*Math.max(0,chars.length-1);
  // Grid spacing respects scale
  const tw=Math.max(1,rawW*scaleX);
  const th=layer.size*scaleY;
  const rowH=th*1.6;const rowStagger=th*.8;
  const tHasWave=dists.includes('wave');
  const tHasStagger=dists.includes('stagger');
  const tHasExplode=dists.includes('explode');
  const tHasGlitch=dists.includes('glitch');
  const tHasMirror=dists.includes('mirror');
  // Per-distortion settings for tile
  const _tds=layer.distSettings||{};
  const _tfb={amt:layer.distAmt??40,spd:layer.distSpd??30};
  const tWAmt=(_tds.wave?.amt??_tfb.amt),tWSpd=(_tds.wave?.spd??_tfb.spd)/100;
  const tStAmt=(_tds.stagger?.amt??_tfb.amt);
  const tExAmt=(_tds.explode?.amt??_tfb.amt),tExSpd=(_tds.explode?.spd??_tfb.spd)/100;
  const tGlAmt=(_tds.glitch?.amt??_tfb.amt),tGlSpd=(_tds.glitch?.spd??_tfb.spd)/100;
  const tMiAmt=(_tds.mirror?.amt??_tfb.amt);
  // Tile scroll speed uses tile's own setting
  const tTileSpd=(_tds.tile?.spd??_tfb.spd)/100;
  const offset=(T.frame*tTileSpd*.5)%tw;
  const vBase=layer.opacity/100;
  // Variable type
  const italicW=layer.style==='italic'?'italic ':'';
  const vspd=layer.varSpd||30;
  const hasVarWght=layer.varWghtPat&&layer.varWghtPat!=='none';
  const hasVarWidth=layer.varWidthPat&&layer.varWidthPat!=='none';
  const hasVarSkew=layer.varSkewPat&&layer.varSkewPat!=='none';
  const hasVarSoft=!!(layer.varSoftPat&&layer.varSoftPat!=='none');
  const hasVarWonk=!!(layer.varWonkPat&&layer.varWonkPat!=='none');
  const hasVarType=hasVarWght||hasVarWidth||hasVarSkew||hasVarSoft||hasVarWonk;
  // Draw with letter spacing + per-char variable type, centered horizontally
  const drawLS=(xOff,yOff)=>{
    let cx=-rawW/2+xOff;
    chars.forEach((ch,i)=>{
      if(hasVarType){
        ctx.save();
        ctx.translate(cx,yOff);
        if(hasVarSoft||hasVarWonk){
          const vSoft=computeVariation(i,chars.length,layer.varSoftPat,layer.varSoftMin??0,layer.varSoftMax??100,t,layer.varSoftSpd??layer.varSpd??3,layer.varSoftEase||'linear');
          const vWonk=computeVariation(i,chars.length,layer.varWonkPat,layer.varWonkMin??0,layer.varWonkMax??1,t,layer.varWonkSpd??layer.varSpd??3,layer.varWonkEase||'linear');
          const opsz=Math.min(144,Math.max(9,layer.size));
          const fvp=[`'opsz' ${opsz}`];
          if(hasVarSoft)fvp.push(`'SOFT' ${Math.round(vSoft)}`);
          if(hasVarWonk)fvp.push(`'WONK' ${vWonk.toFixed(2)}`);
          ctx.canvas.style.fontVariationSettings=fvp.join(', ');
        }
        if(hasVarWght){
          const vW=computeVariation(i,chars.length,layer.varWghtPat,layer.varWghtMin??200,layer.varWghtMax??800,t,layer.varWghtSpd??layer.varSpd??3,layer.varWghtEase||'linear');
          ctx.font=`${italicW}${Math.round(vW)} ${layer.size}px '${layer.font}'`.trim();
        }else if(hasVarSoft||hasVarWonk){
          ctx.font=fstr.trim();
        }
        if(hasVarWidth){
          const vWd=computeVariation(i,chars.length,layer.varWidthPat,layer.varWidthMin??60,layer.varWidthMax??140,t,layer.varWidthSpd??layer.varSpd??3,layer.varWidthEase||'linear');
          ctx.scale(vWd/100,1);
        }
        if(hasVarSkew){
          const vSk=computeVariation(i,chars.length,layer.varSkewPat,layer.varSkewMin??-25,layer.varSkewMax??25,t,layer.varSkewSpd??layer.varSpd??3,layer.varSkewEase||'linear');
          ctx.transform(1,0,Math.tan(vSk*Math.PI/180),1,0,0);
        }
        ctx.fillText(ch,0,0);
        ctx.restore();
      }else{
        ctx.fillText(ch,cx,yOff);
      }
      cx+=charW[i]+layer.ls;
    });
  };
  ctx.save();ctx.rotate(layer.rot*Math.PI/180);
  const rows=Math.ceil(TH/Math.max(1,rowH))+2;
  const cols=Math.ceil(TW/tw)+2;
  for(let r=-1;r<rows;r++){
    for(let c=-1;c<cols;c++){
      ctx.save();
      ctx.globalAlpha=vBase;
      let offX=0,offY=0;
      if(tHasWave){const wT=t*tWSpd;offY+=Math.sin(wT*2+r*.8+c*.3)*(tWAmt/100)*th*.5;}
      if(tHasStagger)offY+=(r%2===0?1:-1)*(tStAmt/100)*th*.4;
      if(tHasExplode){const exT=t*tExSpd;const sd=r*7.3+c*3.1;offX+=Math.sin(exT*.7+sd)*(tExAmt/100)*tw*.2;offY+=Math.cos(exT*.5+sd*1.3)*(tExAmt/100)*th*.3;}
      ctx.translate(c*tw-offset+offX,r*rowH+(c%2===0?0:rowStagger)+offY);
      ctx.scale(scaleX,scaleY);
      if(tHasGlitch){
        const glT=t*tGlSpd;const ga=(tGlAmt/100)*rawW*.04,gx=Math.sin(glT*3+r*2.1)*ga;
        ctx.save();ctx.fillStyle='#e5007d';ctx.globalAlpha*=.65;drawLS(gx,0);ctx.restore();
        ctx.save();ctx.fillStyle='#00e5ff';ctx.globalAlpha*=.45;drawLS(-gx*.5,0);ctx.restore();
      }
      ctx.fillStyle=layer.color;
      drawLS(0,0);
      if(tHasMirror){ctx.save();ctx.scale(1,-1);ctx.globalAlpha*=tMiAmt/100*.35*2;drawLS(0,layer.size*.15);ctx.restore();}
      ctx.restore();
    }
  }
  ctx.restore();
  if(hasVarSoft||hasVarWonk)ctx.canvas.style.fontVariationSettings='normal';
}

function drawCircle(ctx,layer,fstr,lines,t){
  const text=lines.join(' ');
  const chars=text.split('');
  if(!chars.length)return;
  const italicW=layer.style==='italic'?'italic ':'';
  // Variable type setup
  const hasVarSoft=!!(layer.varSoftPat&&layer.varSoftPat!=='none');
  const hasVarWonk=!!(layer.varWonkPat&&layer.varWonkPat!=='none');
  const hasVarWght=!!(layer.varWghtPat&&layer.varWghtPat!=='none');
  const hasVarWidth=!!(layer.varWidthPat&&layer.varWidthPat!=='none');
  const hasVarSkew=!!(layer.varSkewPat&&layer.varSkewPat!=='none');
  const hasVarType=hasVarWght||hasVarWidth||hasVarSkew||hasVarSoft||hasVarWonk;
  ctx.save();
  ctx.font=fstr.trim();ctx.fillStyle=layer.color;ctx.textBaseline='middle';ctx.textAlign='center';
  const cx=(layer.x/100)*TW, cy=(layer.y/100)*TH;
  const _ds=layer.distSettings||{};
  const cAmt=_ds.circle?.amt??35;
  const cSpd=(_ds.circle?.spd??20)/100;
  const rings=Math.max(1,Math.min(6,layer.circleRings||1));
  const orient=layer.circleOrient||'tangent';
  const baseR=(cAmt/100)*Math.min(TW,TH)*0.5;
  const ringGap=layer.size*1.45;
  const charW=chars.map(c=>ctx.measureText(c).width);
  const totalTextW=charW.reduce((s,w)=>s+w,0)+layer.ls*Math.max(0,chars.length-1);
  for(let ring=0;ring<rings;ring++){
    const r=baseR+ring*ringGap;
    const circumference=2*Math.PI*r;
    const repGap=layer.size*0.6;
    const reps=Math.max(1,Math.round(circumference/(totalTextW+repGap)));
    const anglePerRep=(2*Math.PI)/reps;
    const dir=ring%2===0?1:-1;
    const baseAngle=t*cSpd*0.05*dir-Math.PI/2;
    for(let rep=0;rep<reps;rep++){
      let a=baseAngle+rep*anglePerRep;
      chars.forEach((ch,i)=>{
        const cw=charW[i];
        const ls=i<chars.length-1?layer.ls:0;
        const midAngle=a+cw/(2*r);
        ctx.save();
        ctx.translate(cx+Math.cos(midAngle)*r, cy+Math.sin(midAngle)*r);
        if(orient==='tangent')ctx.rotate(midAngle+Math.PI/2);
        else if(orient==='radial-out')ctx.rotate(midAngle);
        else if(orient==='radial-in')ctx.rotate(midAngle+Math.PI);
        if(hasVarType){
          // Apply SOFT/WONK via font-variation-settings (must precede ctx.font)
          if(hasVarSoft||hasVarWonk){
            const vSoft=computeVariation(i,chars.length,layer.varSoftPat,layer.varSoftMin??0,layer.varSoftMax??100,t,layer.varSoftSpd??layer.varSpd??3,layer.varSoftEase||'linear');
            const vWonk=computeVariation(i,chars.length,layer.varWonkPat,layer.varWonkMin??0,layer.varWonkMax??1,t,layer.varWonkSpd??layer.varSpd??3,layer.varWonkEase||'linear');
            const opsz=Math.min(144,Math.max(9,layer.size));
            const fvp=[`'opsz' ${opsz}`];
            if(hasVarSoft)fvp.push(`'SOFT' ${Math.round(vSoft)}`);
            if(hasVarWonk)fvp.push(`'WONK' ${vWonk.toFixed(2)}`);
            ctx.canvas.style.fontVariationSettings=fvp.join(', ');
          }
          // Variable weight via ctx.font
          if(hasVarWght){
            const vW=computeVariation(i,chars.length,layer.varWghtPat,layer.varWghtMin??200,layer.varWghtMax??800,t,layer.varWghtSpd??layer.varSpd??3,layer.varWghtEase||'linear');
            ctx.font=`${italicW}${Math.round(vW)} ${layer.size}px '${layer.font}'`.trim();
          }else if(hasVarSoft||hasVarWonk){
            ctx.font=fstr.trim();
          }
          // Variable width (x-scale) and skew applied after orientation rotate
          if(hasVarWidth){
            const vWd=computeVariation(i,chars.length,layer.varWidthPat,layer.varWidthMin??60,layer.varWidthMax??140,t,layer.varWidthSpd??layer.varSpd??3,layer.varWidthEase||'linear');
            ctx.scale(vWd/100,1);
          }
          if(hasVarSkew){
            const vSk=computeVariation(i,chars.length,layer.varSkewPat,layer.varSkewMin??-25,layer.varSkewMax??25,t,layer.varSkewSpd??layer.varSpd??3,layer.varSkewEase||'linear');
            ctx.transform(1,0,Math.tan(vSk*Math.PI/180),1,0,0);
          }
        }
        ctx.fillText(ch,0,0);
        ctx.restore();
        a+=(cw+ls)/r;
      });
    }
  }
  if(hasVarSoft||hasVarWonk)ctx.canvas.style.fontVariationSettings='normal';
  ctx.restore();
}

function drawAccent(ctx,W,H){
  ctx.fillStyle='#e5007d';const bw=Math.max(3,W*.004);
  if(T.accent==='bar-top')ctx.fillRect(0,0,W,bw);
  if(T.accent==='bar-bottom')ctx.fillRect(0,H-bw,W,bw);
  if(T.accent==='bar-left')ctx.fillRect(0,0,bw,H);
  if(T.accent==='corners'){
    ctx.lineWidth=bw;ctx.strokeStyle='#e5007d';
    const p=W*.03,s=W*.05;
    [[p,p,1,1],[W-p,p,-1,1],[p,H-p,1,-1],[W-p,H-p,-1,-1]].forEach(([x,y,dx,dy])=>{
      ctx.beginPath();ctx.moveTo(x+s*dx,y);ctx.lineTo(x,y);ctx.lineTo(x,y+s*dy);ctx.stroke();
    });
  }
  if(T.accent==='rule')ctx.fillRect(0,H/2-bw/2,W,bw);
  if(T.accent==='dot'){ctx.beginPath();ctx.arc(W*.91,H*.09,W*.013,0,Math.PI*2);ctx.fill();}
}
function drawKC(ctx,W,H){
  if(T.kc==='none')return;
  const sz=W*.09,pad=W*.04;
  const x=T.kc==='tr'?W-pad-sz:pad;
  const y=T.kc==='tr'?pad:H-pad-sz;
  ctx.strokeStyle='#e5007d';ctx.lineWidth=W*.004;ctx.strokeRect(x,y,sz,sz);
  ctx.fillStyle='#e5007d';ctx.font=`${sz*.45}px 'Roboto Flex'`;
  ctx.textBaseline='middle';ctx.textAlign='center';
  ctx.fillText('KC',x+sz/2,y+sz/2);ctx.textAlign='left';
}

/* ── Fit canvas ── */
/* ════════════════════════════════════════════
   CANVAS DRAG — click & drag to move layers
════════════════════════════════════════════ */
let _dragLayerIdx = null;
let _dragOffX = 0, _dragOffY = 0;

function _canvasCoords(e) {
  const canvas = document.getElementById('typeCanvas');
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (TW / rect.width),
    y: (e.clientY - rect.top)  * (TH / rect.height),
  };
}

function _hitTestLayers(cx, cy) {
  for (let i = T.layers.length - 1; i >= 0; i--) {
    const layer = T.layers[i];
    if (!layer.visible) continue;
    const ax = layer.x / 100 * TW;
    const ay = layer.y / 100 * TH;
    if (layer.type === 'image' && layer.img) {
      const scale = (layer.imgScale ?? 100) / 100;
      const hw = layer.img.naturalWidth  * scale / 2;
      const hh = layer.img.naturalHeight * scale / 2;
      if (cx >= ax - hw && cx <= ax + hw && cy >= ay - hh && cy <= ay + hh) return i;
    } else if (layer.type === 'eye') {
      const hw = layer.eyeSize || 100;
      const dx = cx - ax, dy = cy - ay;
      if (Math.sqrt(dx*dx + dy*dy) < hw * 1.2) return i;
    } else if (layer.type !== 'image') {
      const radius = Math.max(50, (layer.size || 60) * 0.9);
      const dx = cx - ax, dy = cy - ay;
      if (Math.sqrt(dx*dx + dy*dy) < radius) return i;
    }
  }
  return -1;
}

function initCanvasDrag() {
  const canvas = document.getElementById('typeCanvas');

  canvas.addEventListener('pointerdown', e => {
    const {x, y} = _canvasCoords(e);
    const idx = _hitTestLayers(x, y);
    if (idx < 0) return;
    _dragLayerIdx = idx;
    const layer = T.layers[idx];
    _dragOffX = x - (layer.x / 100 * TW);
    _dragOffY = y - (layer.y / 100 * TH);
    canvas.classList.add('dragging');
    canvas.setPointerCapture(e.pointerId);
    // Switch to layers panel and select this layer
    const lid = `l${idx + 1}`;
    if (currentPanelMode !== 'layers') {
      const btn = document.querySelector('.panel-mode-tab.mode-layers');
      if (btn) switchPanelMode('layers', btn);
    }
    selectLayer(lid);
    e.preventDefault();
  });

  canvas.addEventListener('pointermove', e => {
    const {x, y} = _canvasCoords(e);
    if (_dragLayerIdx === null) {
      canvas.classList.toggle('drag-hover', _hitTestLayers(x, y) >= 0);
      return;
    }
    const layer = T.layers[_dragLayerIdx];
    const newX = Math.round(((x - _dragOffX) / TW) * 100);
    const newY = Math.round(((y - _dragOffY) / TH) * 100);
    layer.x = Math.max(0, Math.min(100, newX));
    layer.y = Math.max(0, Math.min(100, newY));
    // Update sliders
    const lid = `l${_dragLayerIdx + 1}`;
    const xEl = document.getElementById(`${lid}-x`);
    const yEl = document.getElementById(`${lid}-y`);
    if (xEl) { xEl.value = layer.x; document.getElementById(`${lid}-xVal`).textContent = layer.x + '%'; }
    if (yEl) { yEl.value = layer.y; document.getElementById(`${lid}-yVal`).textContent = layer.y + '%'; }
    typo_render();
  });

  canvas.addEventListener('pointerup', e => {
    _dragLayerIdx = null;
    canvas.classList.remove('dragging');
  });

  canvas.addEventListener('pointerleave', () => {
    canvas.classList.remove('drag-hover');
  });
}

function typo_fitCanvas(){
  const area=document.getElementById('type-canvas-area');
  const aw=area.clientWidth-48,ah=area.clientHeight-60;
  const scale=Math.min(1,aw/TW,ah/TH);
  const stage=document.getElementById('stage');
  stage.style.transform=`scale(${scale})`;
  stage.style.transformOrigin='center center';
  stage.style.width=TW+'px';stage.style.height=TH+'px';
}
window.addEventListener('resize',typo_fitCanvas);

/* ════════════════════════════════════════════
   SAFE ZONE OVERLAY
════════════════════════════════════════════ */
// Safe zone data sourced from Jon Loomer (jonloomer.com/qvt/safe-zones-template-meta-ads/)
// 9:16 vertical (1080×1920): top=270px=14%, sides=65px=6%
// Story bottom=380px=20%  |  Reel bottom=670px=35%
// Keys match PLATFORMS_DEF ids in app.js
const SAFE_ZONE_DEFS = {
  'square': {
    name: 'Square 1:1', hint: '1080×1080',
    zones: [],
    safe: { x:.06, y:.06, w:.88, h:.88 },
  },
  'landscape': {
    name: 'Landscape 1.91:1', hint: '1200×628',
    zones: [],
    safe: { x:.06, y:.06, w:.88, h:.88 },
  },
  'portrait-45': {
    name: 'Portrait 4:5', hint: '1080×1350',
    zones: [],
    safe: { x:.06, y:.06, w:.88, h:.88 },
  },
  'story-reel': {
    // Story: top 14%, bottom 20% — Reel: top 14%, bottom 35%
    // Show the stricter Reel bottom zone + Story end line; right-side action buttons
    // Source: Jon Loomer safe zone template for Meta ads
    name: 'Story / Reel 9:16', hint: '1080×1920',
    zones: [
      { label:'Top Bar + Profile',         x:0,   y:0,   w:1,   h:.14  },
      { label:'Action Buttons (Reel)',     x:.82, y:.14, w:.18, h:.51  },
      { label:'Story ends — Reel caption', x:0,   y:.80, w:1,   h:.05  },
      { label:'Caption + Audio + Nav Bar', x:0,   y:.85, w:1,   h:.15  },
    ],
    // Conservative safe zone: stays clear of all Story AND Reel UI
    safe: { x:.06, y:.14, w:.76, h:.51 },
    // Extra marker: where Story engagement begins (dashed line at 80%)
    storyLine: .80,
  },
  'youtube': {
    name: 'YouTube 16:9', hint: '1280×720',
    zones: [
      { label:'Title Overlay', x:0, y:.78, w:1, h:.22 },
    ],
    safe: { x:.05, y:.05, w:.90, h:.73 },
  },
  'banner': {
    name: 'Banner 8:3', hint: '1200×450',
    zones: [],
    safe: { x:.05, y:.05, w:.90, h:.90 },
  },
  'custom': {
    name: 'Custom Canvas', hint: 'current size',
    zones: [],
    safe: { x:.05, y:.05, w:.90, h:.90 },
  },
};

let _safeZoneOn = false;

function toggleSafeZone(btn) {
  _safeZoneOn = !_safeZoneOn;
  btn.classList.toggle('on', _safeZoneOn);
  btn.textContent = _safeZoneOn ? 'On' : 'Off';
  updateSafeZone();
}

function updateSafeZone() {
  const overlay = document.getElementById('safeZoneOverlay');
  if (!overlay) return;
  if (!_safeZoneOn) { overlay.style.cssText = 'display:none;position:absolute;top:0;left:0;pointer-events:none;z-index:10;'; return; }

  const platform = (typeof EX !== 'undefined' ? EX.platform : null) || 'custom';
  const def = SAFE_ZONE_DEFS[platform] || SAFE_ZONE_DEFS['custom'];
  const W = TW, H = TH;
  const fs = Math.round(Math.max(10, Math.min(18, Math.min(W, H) * 0.022)));
  const sw = Math.max(1.5, W * 0.002); // stroke width

  // Unique hatch pattern id per render
  const pid = 'szH' + Date.now();

  const defs = `<defs>
    <pattern id="${pid}" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="10" stroke="rgba(229,0,125,0.5)" stroke-width="3"/>
    </pattern>
  </defs>`;

  // Blocked zones
  let zonesHTML = def.zones.map(z => {
    const x = z.x * W, y = z.y * H, zw = z.w * W, zh = z.h * H;
    const lx = x + zw / 2, ly = y + zh / 2;
    const pillW = Math.min(zw * 0.9, z.label.length * fs * 0.58 + 20);
    const pillH = fs + 10;
    // Only show label if zone is tall/wide enough
    const showLabel = zh > fs * 2.5 && zw > fs * 4;
    return `
      <rect x="${x}" y="${y}" width="${zw}" height="${zh}" fill="url(#${pid})"/>
      <rect x="${x}" y="${y}" width="${zw}" height="${zh}" fill="rgba(229,0,125,0.18)"/>
      ${showLabel ? `
        <rect x="${lx - pillW/2}" y="${ly - pillH/2}" width="${pillW}" height="${pillH}"
          fill="rgba(20,8,16,0.75)" rx="${pillH/2}"/>
        <text x="${lx}" y="${ly + 1}" text-anchor="middle" dominant-baseline="middle"
          font-family="'DM Mono',monospace" font-size="${fs}" font-weight="500"
          fill="rgba(255,255,255,0.85)">${z.label}</text>
      ` : ''}
    `;
  }).join('');

  // Safe zone rectangle
  const s = def.safe;
  const sx = s.x * W, sy = s.y * H, ssw = s.w * W, ssh = s.h * H;
  const dash = `${Math.round(W * 0.012)},${Math.round(W * 0.006)}`;
  const tagW = fs * 5.5, tagH = fs + 8;

  const safeHTML = `
    <rect x="${sx}" y="${sy}" width="${ssw}" height="${ssh}"
      fill="none" stroke="rgba(80,220,130,0.9)" stroke-width="${sw}"
      stroke-dasharray="${dash}"/>
    <rect x="${sx}" y="${sy}" width="${tagW}" height="${tagH}"
      fill="rgba(80,220,130,0.9)" rx="2"/>
    <text x="${sx + tagW/2}" y="${sy + tagH/2 + 1}" text-anchor="middle" dominant-baseline="middle"
      font-family="'DM Mono',monospace" font-size="${fs - 1}" font-weight="700"
      letter-spacing="0.08em" fill="rgba(10,30,15,0.95)">SAFE ZONE</text>
  `;

  // Optional story/reel split line
  const splitLine = def.storyLine ? (() => {
    const ly = def.storyLine * H;
    const pillW = fs * 7, pillH = fs + 6;
    return `
      <line x1="0" y1="${ly}" x2="${W}" y2="${ly}"
        stroke="rgba(80,220,130,0.5)" stroke-width="${sw}"
        stroke-dasharray="${Math.round(W*0.008)},${Math.round(W*0.004)}"/>
      <rect x="${W/2 - pillW/2}" y="${ly - pillH/2}" width="${pillW}" height="${pillH}"
        fill="rgba(20,20,20,0.8)" rx="${pillH/2}"/>
      <text x="${W/2}" y="${ly + 1}" text-anchor="middle" dominant-baseline="middle"
        font-family="'DM Mono',monospace" font-size="${fs - 2}" fill="rgba(80,220,130,0.9)">
        ← Story safe end
      </text>`;
  })() : '';

  // Platform label — bottom center, outside safe zone
  const labelY = Math.min(H - 6, sy + ssh + fs * 1.6);
  const platLabel = `
    <text x="${W/2}" y="${labelY}" text-anchor="middle"
      font-family="'DM Mono',monospace" font-size="${fs * 0.8}"
      fill="rgba(255,255,255,0.35)">${def.name} · ${def.hint}</text>
  `;

  overlay.style.cssText = `display:block;position:absolute;top:0;left:0;width:${W}px;height:${H}px;pointer-events:none;z-index:10;`;
  overlay.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="display:block;">
    ${defs}${zonesHTML}${safeHTML}${splitLine}${platLabel}
  </svg>`;
}

