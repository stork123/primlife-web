// Genotype — faithful port of Genotype.cpp/.h
'use strict';
const { Randomizer } = require('./rng.js');

const MAX_RATIO = 20, UNI_RATIO = 5;
const MAX_SEGMENTS = 10, MAX_SYMMETRY = 8;
const MAX_GENES = MAX_SYMMETRY * MAX_SEGMENTS;
const MAX_LIMB_TYPES = 4;
const DIM_COLOR = 5;
const GREEN_LEAF = 0, BLUE_LEAF = 1, RED_LEAF = 2, LBLUE_LEAF = 3, WHITE_LEAF = 4,
  DARK_GREEN_LEAF = 5, DARK_BLUE_LEAF = 6, DARK_RED_LEAF = 7, DARK_LBLUE_LEAF = 8,
  GREY_LEAF = 9, YELLOW_LEAF = 10, BLACK_LEAF = 11, PURPLE_LEAF = 12, MAX_LEAF = 13;

// Contact actions
const CONTACT_IGNORE = 0, CONTACT_EAT = 1, CONTACT_EATEN = 2, CONTACT_DESTROY = 3,
  CONTACT_DESTROYED = 4, CONTACT_DEFEND = 5, CONTACT_DEFENDED = 6, CONTACT_ATTACK = 7;

const MIRROR_ANGLE = [0, 180, 0, 180, 90, 90, 270, 270];
const MIRROR_COEF = [1, -1, -1, 1, -1, 1, -1, 1];
const MIRROR_SIX = [0, 120, 0, 120, 240, 240, 0, 0];

class GeneSegment {
  constructor() { this.color = [0, 0]; this.visible = 0; this.radius = 0; this.angle = 0; this.startSegment = 0; }
  randomize(segment, isVisible, rand) {
    this.radius = rand.Integer(MAX_SEGMENTS - 1) + 2;
    this.angle = segment === 0 ? rand.Integer(45) + 1 : rand.Integer(350) - 175;
    this.visible = isVisible ? 1 : 0;
    this.startSegment = rand.Byte(MAX_SEGMENTS);
    this.color[0] = rand.Byte(DIM_COLOR - 1);
    this.color[1] = rand.Byte(DIM_COLOR);
    if (this.color[1] !== WHITE_LEAF && this.color[1] !== GREEN_LEAF) this.color[1] = rand.Byte(DIM_COLOR);
  }
  mutate(chance, segment, rand) {
    if (rand.Int1024() < chance) this.radius = rand.Integer(MAX_SEGMENTS - 1) + 2;
    if (rand.Int1024() < chance) this.angle = segment === 0 ? rand.Integer(45) + 1 : rand.Integer(350) - 175;
    if (rand.Int1024() < chance) this.startSegment = rand.Byte(MAX_SEGMENTS);
    if (rand.Int1024() < chance) this.visible = this.visible ? 0 : 1;
    if (rand.Int1024() < chance) this.color[0] = rand.Byte(DIM_COLOR - 1);
    if (rand.Int1024() < chance) this.color[1] = rand.Byte(DIM_COLOR);
  }
  copyFrom(o) { this.color[0]=o.color[0]; this.color[1]=o.color[1]; this.visible=o.visible; this.radius=o.radius; this.angle=o.angle; this.startSegment=o.startSegment; }
  isVisible() { return !!this.visible; }
}

class GeneLimb {
  constructor() { this.segment = []; for (let i=0;i<MAX_SEGMENTS;i++) this.segment.push(new GeneSegment()); this.toggleVisibleSegments = new Array(MAX_SEGMENTS).fill(false); }
  randomize(nSegmentsPerArm, rand) {
    for (let i = 0; i < MAX_SEGMENTS; i++) {
      let vis;
      switch (nSegmentsPerArm) {
        case 1: vis = i < 3 ? rand.Bool() : false; break;
        case 2: vis = i < 4 ? true : (i < 7 ? rand.Bool() : false); break;
        case 3: vis = i < 7 ? true : (i < 10 ? rand.Bool() : false); break;
        default: vis = rand.Bool();
      }
      this.segment[i].randomize(i, vis, rand);
    }
    this.toggleSegments();
  }
  mutate(chance, rand) { for (let i=0;i<MAX_SEGMENTS;i++) this.segment[i].mutate(chance, i, rand); this.toggleSegments(); }
  crossover(other, rand) { for (let i=0;i<MAX_SEGMENTS;i++) if (rand.Bool()) this.segment[i].copyFrom(other.segment[i]); this.toggleSegments(); }
  toggleSegments() {
    let toggle = false;
    for (let i = 0; i < MAX_SEGMENTS; i++) {
      if (this.segment[i].isVisible()) { this.toggleVisibleSegments[i] = toggle; toggle = !toggle; }
      else this.toggleVisibleSegments[i] = false;
    }
  }
  copyFrom(o) { for (let i=0;i<MAX_SEGMENTS;i++) this.segment[i].copyFrom(o.segment[i]); this.toggleSegments(); }
}

class GeneTrait {
  constructor() {
    this.disperse=0; this.children=1; this.attackChildren=0; this.attackSiblings=0;
    this.species=0; this.adultRatio=[1,1]; this.lineCount=1; this.lineRef=new Array(MAX_SYMMETRY).fill(0);
    this.mirrored=0; this.sex=0; this.asexual=0; this.chanceMale=0; this.offset=0; this.maxAge=255;
    this.geneLine=[]; for (let i=0;i<MAX_LIMB_TYPES;i++) this.geneLine.push(new GeneLimb());
    this.angle = Array.from({length:MAX_SYMMETRY},()=>new Array(MAX_SEGMENTS).fill(0));
  }
  getLines() { return this.lineCount; }
  getLineTypeIndex(line) { return this.lineRef[line]; }
  isMirrored() { return !!this.mirrored; }
  isMale() { return !!this.sex; }
  isAsexual() { return !!this.asexual; }
  getOffset() { return this.offset; }
  getAdultRatio() { return this.adultRatio[this.sex]; }
  getNumberOfChildren() { return this.children; }
  getDisperseChildren() { return !!this.disperse; }
  getSpecies() { return this.species; }
  getMaxAge() { return 1280 * (this.maxAge + 1); }
  getSegment(line, seg) { return this.geneLine[this.lineRef[line]].segment[seg]; }
  getSegmentType(lt, seg) { return this.geneLine[lt].segment[seg]; }
  getLineType(lt) { return this.geneLine[lt]; }
  pickSex(rand) { this.sex = this.chanceMale > rand.Int256() ? 1 : 0; }
  isLineTypeVisible(lt) { for (let i=0;i<this.lineCount;i++) if (lt===this.lineRef[i]) return true; return false; }
  getCompressedToggle(nAngle, nLine, nSegment) {
    if (this.isMirrored() && MIRROR_COEF[nLine] === -1)
      return this.geneLine[this.lineRef[nLine]].toggleVisibleSegments[nSegment] ? -nAngle : nAngle;
    return this.geneLine[this.lineRef[nLine]].toggleVisibleSegments[nSegment] ? nAngle : -nAngle;
  }
  calculateAngles() {
    const pAngle = this.getLines() === 6 ? MIRROR_SIX : MIRROR_ANGLE;
    for (let line = 0; line < this.getLines(); line++) {
      const gLine = this.geneLine[this.lineRef[line]];
      for (let seg = 0; seg < MAX_SEGMENTS; seg++) {
        const gSeg = gLine.segment[seg];
        if (gSeg.isVisible()) {
          if (this.isMirrored())
            this.angle[line][seg] = this.getOffset() + gSeg.angle * MIRROR_COEF[line] + pAngle[line];
          else
            this.angle[line][seg] = this.getOffset() + gSeg.angle + Math.floor((line * 360) / this.getLines());
        }
      }
    }
  }
  randomize(nArmsPerBiot, nTypesPerBiot, nSegmentsPerArm, rand) {
    this.disperse = rand.Bool()?1:0; this.children = rand.Integer(8)+1;
    this.attackChildren = rand.Bool()?1:0; this.attackSiblings = rand.Bool()?1:0;
    this.species = rand.Integer(2); this.adultRatio[0] = rand.Integer(6)+1; this.adultRatio[1] = rand.Integer(6)+1;
    this.mirrored = rand.Bool()?1:0;
    switch (nArmsPerBiot) {
      case 1: this.lineCount = rand.Integer(2)+1; break;
      case 2: this.lineCount = rand.Integer(2)+3; break;
      case 3: this.lineCount = rand.Integer(2)+5; break;
      case 4: this.lineCount = rand.Integer(2)+7; break;
      default: this.lineCount = rand.Integer(MAX_SYMMETRY)+1;
    }
    if (this.lineCount & 1) this.mirrored = 0;
    this.offset = rand.Integer(360);
    for (let i=0;i<MAX_LIMB_TYPES;i++) this.geneLine[i].randomize(nSegmentsPerArm, rand);
    this.sex = rand.Bool()?1:0; this.asexual = rand.Bool()?1:0;
    this.chanceMale = Math.floor(rand.Int256()/2)+64; this.maxAge = rand.Int256();
    for (let i=0;i<MAX_SYMMETRY;i++) this.lineRef[i] = rand.Byte(nTypesPerBiot+1);
    this.calculateAngles();
  }
  mutate(chance, rand) {
    if (rand.Int1024()<chance) this.disperse = rand.Bool()?1:0;
    if (rand.Int1024()<chance) this.children = rand.Integer(8)+1;
    if (rand.Int1024()<chance) this.attackChildren = rand.Bool()?1:0;
    if (rand.Int1024()<chance) this.attackSiblings = rand.Bool()?1:0;
    if (rand.Int1024()<chance) { this.species += rand.Sign()>0?1:-1; if(this.species<0)this.species=0; if(this.species>15)this.species=15; }
    if (rand.Int1024()<chance) this.adultRatio[0] = rand.Integer(6)+1;
    if (rand.Int1024()<chance) this.adultRatio[1] = rand.Integer(6)+1;
    if (rand.Int1024()<chance) this.lineCount = rand.Integer(8)+1;
    if (rand.Int1024()<chance) this.mirrored = rand.Bool()?1:0;
    if (rand.Int1024()<chance) this.offset = rand.Integer(360);
    for (let i=0;i<MAX_LIMB_TYPES;i++) this.geneLine[i].mutate(chance, rand);
    if (rand.Int1024()<chance) this.sex = rand.Bool()?1:0;
    if (rand.Int1024()<chance) this.asexual = rand.Bool()?1:0;
    if (rand.Int1024()<chance) this.chanceMale = rand.Byte();
    if (rand.Int1024()<chance) this.maxAge = rand.Int256();
    for (let i=0;i<MAX_SYMMETRY;i++) if (rand.Int1024()<chance) this.lineRef[i] = rand.Byte(MAX_LIMB_TYPES);
    this.calculateAngles();
  }
  crossover(other, rand) {
    for (let i=0;i<MAX_LIMB_TYPES;i++) this.geneLine[i].crossover(other.geneLine[i], rand);
    for (let i=0;i<MAX_SYMMETRY;i++) if (rand.Bool()) this.lineRef[i] = other.lineRef[i];
    if (rand.Bool()) this.offset = other.offset;
    if (rand.Bool()) this.disperse = other.disperse;
    if (rand.Bool()) this.children = other.children;
    if (rand.Bool()) this.attackChildren = other.attackChildren;
    if (rand.Bool()) this.attackSiblings = other.attackSiblings;
    if (rand.Bool()) this.species = other.species;
    if (rand.Bool()) this.adultRatio[0] = other.adultRatio[0];
    if (rand.Bool()) this.adultRatio[1] = other.adultRatio[1];
    if (rand.Bool()) this.lineCount = other.lineCount;
    if (rand.Bool()) this.mirrored = other.mirrored;
    if (rand.Bool()) this.asexual = other.asexual;
    if (rand.Bool()) this.chanceMale = other.chanceMale;
    this.calculateAngles();
  }
  copyFrom(o) {
    this.disperse=o.disperse; this.children=o.children; this.attackChildren=o.attackChildren;
    this.attackSiblings=o.attackSiblings; this.species=o.species;
    this.adultRatio[0]=o.adultRatio[0]; this.adultRatio[1]=o.adultRatio[1];
    this.lineCount=o.lineCount; for(let i=0;i<MAX_SYMMETRY;i++) this.lineRef[i]=o.lineRef[i];
    this.mirrored=o.mirrored; this.sex=o.sex; this.asexual=o.asexual; this.chanceMale=o.chanceMale;
    this.offset=o.offset; this.maxAge=o.maxAge;
    for(let i=0;i<MAX_LIMB_TYPES;i++) this.geneLine[i].copyFrom(o.geneLine[i]);
    this.calculateAngles();
  }
}

module.exports = { MAX_RATIO, UNI_RATIO, MAX_SEGMENTS, MAX_SYMMETRY, MAX_GENES, MAX_LIMB_TYPES, DIM_COLOR,
  GREEN_LEAF, BLUE_LEAF, RED_LEAF, LBLUE_LEAF, WHITE_LEAF, DARK_GREEN_LEAF, DARK_BLUE_LEAF,
  DARK_RED_LEAF, DARK_LBLUE_LEAF, GREY_LEAF, YELLOW_LEAF, BLACK_LEAF, PURPLE_LEAF, MAX_LEAF,
  CONTACT_IGNORE, CONTACT_EAT, CONTACT_EATEN, CONTACT_DESTROY, CONTACT_DESTROYED, CONTACT_DEFEND,
  CONTACT_DEFENDED, CONTACT_ATTACK, MIRROR_ANGLE, MIRROR_COEF, MIRROR_SIX, GeneSegment, GeneLimb, GeneTrait };
