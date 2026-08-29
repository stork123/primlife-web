// Biot Editor — design a custom biot, preview it live, release it into the world.
'use strict';
const G = require('./genotype.js');
const { Biot } = require('./sim.js');
const { PEN_COLORS } = require('./ui-colors.js');
const { MAX_SEGMENTS, MAX_SYMMETRY, MAX_LIMB_TYPES, DIM_COLOR, WHITE_LEAF } = G;

const COLOR_NAMES = ['green (photosynth)', 'blue (shield)', 'red (teeth)', 'light blue', 'white (injector)'];

class BiotEditor {
  constructor(env, onRelease) {
    this.env = env;
    this.onRelease = onRelease;
    this.visible = false;
    this.pendingRelease = null;
    this.trait = new G.GeneTrait();
    this.name = '';
    this.buildDom();
    this.randomize();
  }

  buildDom() {
    const el = document.createElement('div');
    el.id = 'biot-editor';
    el.innerHTML = `
      <style>
        #biot-editor { position:fixed; top:80px; right:20px; width:240px; max-height:80vh;
                       background:#111; color:#cfc; border:2px solid #0f0; font-size:13px;
                       font-family:monospace; z-index:100; overflow:auto; display:none; }
        #biot-editor .ed-title { padding:4px 8px; color:#ff0; font-weight:bold; }
        #biot-editor .ed-close { float:right; cursor:pointer; color:#f88; }
        #biot-editor canvas { display:block; margin:4px auto; background:#000; border:1px solid #040; }
        #biot-editor .ed-row { padding:2px 8px; }
        #biot-editor .ed-row label { display:inline-block; width:80px; }
        #biot-editor .ed-row input[type=range] { width:90px; vertical-align:middle; }
        #biot-editor .ed-row input[type=checkbox] { vertical-align:middle; margin-left:4px; }
        #biot-editor .ed-seg { display:flex; gap:2px; padding:0 4px; }
        #biot-editor .ed-btns { padding:6px 4px; display:flex; gap:4px; }
        #biot-editor button { flex:1; }
        #biot-editor .ed-hint { font-size:11px; color:#aaa; padding:4px 8px; }
      </style>
      <div class="ed-title">BIOT EDITOR <span class="ed-close" id="ed-close">[X]</span></div>
      <canvas id="ed-preview" width="180" height="180"></canvas>
      <div class="ed-row"><label>name</label><input id="ed-name" size="10"></div>
      <div class="ed-row"><label>limbs</label><input id="ed-limbs" type="range" min="1" max="8" value="4"><span id="ed-limbs-v">4</span></div>
      <div class="ed-row"><label>mirrored</label><input id="ed-mirrored" type="checkbox"></div>
      <div class="ed-row"><label>sex</label><select id="ed-sex"><option value="0">female</option><option value="1">male</option></select>
        <label>asexual</label><input id="ed-asexual" type="checkbox"></div>
      <div class="ed-row"><label>species</label><input id="ed-species" type="range" min="0" max="15" value="0"><span id="ed-species-v">0</span></div>
      <div class="ed-row"><label>children</label><input id="ed-children" type="range" min="1" max="8" value="2"><span id="ed-children-v">2</span></div>
      <div class="ed-row"><label>adult size</label><input id="ed-adult0" type="range" min="1" max="6" value="3"><span id="ed-adult-v">3</span></div>
      <div class="ed-row"><label>max age</label><input id="ed-maxage" type="range" min="0" max="255" value="128"><span id="ed-maxage-v">128</span></div>
      <div class="ed-row"><label>limb type</label><select id="ed-limbtype"></select></div>
      <div id="ed-segments"></div>
      <div class="ed-btns">
        <button id="ed-random">Randomize</button>
        <button id="ed-save">Save</button>
        <button id="ed-load">Load</button>
        <button id="ed-release">Release!</button>
      </div>
      <div class="ed-hint">Press ESC to close editor. Release: click in world.</div>
      <input type="file" id="ed-file" accept=".json" style="display:none">
    `;
    document.body.appendChild(el);
    this.el = el;
    this.preview = el.querySelector('#ed-preview');
    this.pctx = this.preview.getContext('2d');

    el.querySelector('#ed-close').onclick = () => this.hide();
    el.querySelector('#ed-random').onclick = () => this.randomize();
    el.querySelector('#ed-release').onclick = () => this.release();
    el.querySelector('#ed-save').onclick = () => this.save();
    el.querySelector('#ed-load').onclick = () => el.querySelector('#ed-file').click();
    el.querySelector('#ed-file').onchange = (e) => this.loadFile(e.target.files[0]);

    for (const id of ['ed-limbs','ed-mirrored','ed-sex','ed-asexual','ed-species','ed-children','ed-adult0','ed-maxage','ed-limbtype','ed-name'])
      el.querySelector('#' + id).oninput = () => this.syncFromUi();

    this.buildLimbTypeSelect();
    this.buildSegmentRows();
  }

  buildLimbTypeSelect() {
    const sel = this.el.querySelector('#ed-limbtype');
    sel.innerHTML = '';
    for (let i = 0; i < MAX_LIMB_TYPES; i++) {
      const o = document.createElement('option'); o.value = i; o.textContent = 'limb type ' + i;
      sel.appendChild(o);
    }
  }

  buildSegmentRows() {
    const box = this.el.querySelector('#ed-segments');
    box.innerHTML = '';
    for (let s = 0; s < MAX_SEGMENTS; s++) {
      const row = document.createElement('div'); row.className = 'ed-seg';
      row.innerHTML =
        `<input type="checkbox" id="ed-s${s}-vis" title="visible">` +
        `<select id="ed-s${s}-color">` + COLOR_NAMES.map((n,i)=>`<option value="${i}">${n}</option>`).join('') + `</select>` +
        `<input type="range" id="ed-s${s}-len" min="2" max="15" value="8" title="length">` +
        `<input type="range" id="ed-s${s}-ang" min="-175" max="175" value="0" title="angle">`;
      box.appendChild(row);
      for (const part of ['vis','color','len','ang'])
        row.querySelector(`#ed-s${s}-${part}`).oninput = () => this.syncFromUi();
    }
  }

  curLimbType() { return parseInt(this.el.querySelector('#ed-limbtype').value); }

  randomize() {
    this.trait = new G.GeneTrait();
    const { Randomizer } = require('./rng.js');
    const rand = new Randomizer();
    this.trait.randomize(MAX_SYMMETRY, MAX_LIMB_TYPES, MAX_SEGMENTS, rand);
    this.name = '';
    this.syncToUi();
  }

  syncToUi() {
    const t = this.trait, q = (id) => this.el.querySelector('#' + id);
    q('ed-name').value = this.name || '';
    q('ed-limbs').value = t.lineCount; q('ed-limbs-v').textContent = t.lineCount;
    q('ed-mirrored').checked = t.mirrored;
    q('ed-sex').value = String(t.sex);
    q('ed-asexual').checked = t.asexual;
    q('ed-species').value = t.species; q('ed-species-v').textContent = t.species;
    q('ed-children').value = t.children; q('ed-children-v').textContent = t.children;
    q('ed-adult0').value = t.adultRatio[0]; q('ed-adult-v').textContent = t.adultRatio[0];
    q('ed-maxage').value = t.maxAge; q('ed-maxage-v').textContent = t.maxAge;
    q('ed-limbtype').value = '0';
    // show limb type 0 segments for all lines that reference it
    const limb = t.getLineType(0);
    for (let s = 0; s < MAX_SEGMENTS; s++) {
      const seg = limb.segment[s];
      q(`ed-s${s}-vis`).checked = !!seg.visible;
      q(`ed-s${s}-color`).value = String(seg.color[0]);
      q(`ed-s${s}-len`).value = seg.radius;
      q(`ed-s${s}-ang`).value = seg.angle;
    }
    this.refreshPreview();
  }

  syncFromUi() {
    const t = this.trait, q = (id) => this.el.querySelector('#' + id);
    this.name = q('ed-name').value;
    const limbs = parseInt(q('ed-limbs').value);
    const mirrored = q('ed-mirrored').checked ? 1 : 0;
    if (limbs & 1) { t.mirrored = 0; } // odd limb count can't mirror (original rule)
    else t.mirrored = mirrored;
    t.lineCount = limbs;
    q('ed-limbs-v').textContent = t.lineCount;
    t.sex = parseInt(q('ed-sex').value);
    t.asexual = q('ed-asexual').checked ? 1 : 0;
    t.species = parseInt(q('ed-species').value); q('ed-species-v').textContent = t.species;
    t.children = parseInt(q('ed-children').value); q('ed-children-v').textContent = t.children;
    const adult = parseInt(q('ed-adult0').value);
    t.adultRatio[0] = t.adultRatio[1] = adult; q('ed-adult-v').textContent = adult;
    t.maxAge = parseInt(q('ed-maxage').value); q('ed-maxage-v').textContent = t.maxAge;
    // editor uses limb type 0 for display; apply edits to all limb types? 
    // No — original: each limb type is independent. Edit limb type 0 only.
    const limb = t.getLineType(this.curLimbType());
    for (let s = 0; s < MAX_SEGMENTS; s++) {
      const seg = limb.segment[s];
      seg.visible = q(`ed-s${s}-vis`).checked ? 1 : 0;
      seg.color[0] = seg.color[1] = parseInt(q(`ed-s${s}-color`).value);
      seg.radius = parseInt(q(`ed-s${s}-len`).value);
      seg.angle = parseInt(q(`ed-s${s}-ang`).value);
    }
    limb.toggleSegments();
    t.calculateAngles();
    this.refreshPreview();
  }

  makeBiot() {
    const b = new Biot(this.env);
    b.trait.copyFrom(this.trait);
    b.commandArray.randomize(new (require('./rng.js').Randomizer)());
    b.max_genes = G.MAX_GENES; b.genes = G.MAX_GENES;
    b.energy = b.adultBaseEnergy; // initialize won't set energy if it's a fresh trait copy
    b.initialize(true);
    b.setBonus();
    b.placeRandom();
    if (this.name) b.name = this.name;
    b.generation = 0;
    b.motherId = 0;
    return b;
  }

  refreshPreview() {
    const b = this.makeBiot();
    const c = this.pctx, W = this.preview.width, H = this.preview.height;
    c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2;
    c.lineWidth = 1;
    for (let i = 0; i < b.genes; i++) {
      if (b.state[i] <= 0 && b.distance[i] <= 0) continue;
      c.strokeStyle = PEN_COLORS[b.nType[i]] || '#808080';
      c.beginPath();
      c.moveTo(cx + b.startPt[i].x, cy + b.startPt[i].y);
      c.lineTo(cx + b.stopPt[i].x, cy + b.stopPt[i].y);
      c.stroke();
    }
  }

  release() {
    const b = this.makeBiot();
    this.pendingRelease = { biot: b, clicked: false };
    this.onRelease(b);
  }

  save() {
    const data = { name: this.name, trait: this.serializeTrait(this.trait) };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (this.name || 'biot') + '.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  loadFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        this.name = data.name || '';
        this.trait = this.deserializeTrait(data.trait);
        this.syncToUi();
      } catch (e) { alert('Could not load biot: ' + e.message); }
    };
    reader.readAsText(file);
  }

  serializeTrait(t) {
    return {
      disperse: t.disperse, children: t.children, attackChildren: t.attackChildren,
      attackSiblings: t.attackSiblings, species: t.species, adultRatio: [...t.adultRatio],
      lineCount: t.lineCount, lineRef: [...t.lineRef], mirrored: t.mirrored,
      sex: t.sex, asexual: t.asexual, chanceMale: t.chanceMale, offset: t.offset, maxAge: t.maxAge,
      geneLine: t.geneLine.map(l => l.segment.map(s => ({
        color: [...s.color], visible: s.visible, radius: s.radius, angle: s.angle, startSegment: s.startSegment
      })))
    };
  }

  deserializeTrait(d) {
    const t = new G.GeneTrait();
    Object.assign(t, {
      disperse: d.disperse, children: d.children, attackChildren: d.attackChildren,
      attackSiblings: d.attackSiblings, species: d.species, lineCount: d.lineCount,
      mirrored: d.mirrored, sex: d.sex, asexual: d.asexual, chanceMale: d.chanceMale,
      offset: d.offset, maxAge: d.maxAge
    });
    t.adultRatio = [...d.adultRatio]; t.lineRef = [...d.lineRef];
    if (d.geneLine) {
      d.geneLine.forEach((l, li) => l.forEach((s, si) => {
        const seg = t.geneLine[li].segment[si];
        seg.color = [...s.color]; seg.visible = s.visible; seg.radius = s.radius;
        seg.angle = s.angle; seg.startSegment = s.startSegment;
      }));
      t.geneLine.forEach(l => l.toggleSegments());
    }
    t.calculateAngles();
    return t;
  }

  show() { this.visible = true; this.el.style.display = 'block'; this.refreshPreview(); }
  hide() { this.visible = false; this.el.style.display = 'none'; this.pendingRelease = null; }
  toggle() { this.visible ? this.hide() : this.show(); }
}

module.exports = { BiotEditor };
