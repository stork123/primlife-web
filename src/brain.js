// Brain — faithful port of Brain.cpp/.h (product terms/sums, commands, limb stores)
'use strict';
const { Randomizer } = require('./rng.js');
const G = require('./genotype.js');
const { MAX_SEGMENTS, MAX_SYMMETRY, MAX_LIMB_TYPES } = G;

const MAX_PRODUCT_TERMS = 256, MAX_PRODUCT_SUMS = 64;
const MAX_PRODUCT_SUM_TERMS = 8;
const MAX_COMMANDS = 64, MAX_COMMANDS_PER_LIMB = 16;

const CMD = {
  FLAP_LIMB_SEGMENT: 0, FLAP_LIMB_TYPE_SEGMENT: 1, MOVE_LIMB_SEGMENT: 2,
  MOVE_LIMB_SEGMENTS: 3, MOVE_LIMB_TYPE_SEGMENT: 4, MOVE_LIMB_TYPE_SEGMENTS: 5,
  RETRACT_LIMB_TYPE: 6, RETRACT_LIMB: 7, NOP: 8, MEMORY: 9, MAX_TYPES: 10
};

class ProductTerm {
  constructor() { this.mask = 0; this.invert = 0; }
  randomize(r) { this.mask = r.Dword(); this.invert = r.Dword(); }
  mutate(chance, r) {
    if (r.Int1024() < chance) this.mask = r.Dword();
    if (r.Int1024() < chance) this.invert = r.Dword();
  }
  isTrue(sensor) { return (((sensor ^ this.invert) & this.mask) >>> 0) === this.mask; }
  copyFrom(o) { this.mask = o.mask; this.invert = o.invert; }
}

class ProductSum {
  constructor() { this.reference = new Uint8Array(MAX_PRODUCT_SUM_TERMS); this.bTrue = 0; }
  randomize(r) { for (let i=0;i<MAX_PRODUCT_SUM_TERMS;i++) this.reference[i] = r.Byte(MAX_PRODUCT_TERMS); this.bTrue = r.Bool()?1:0; }
  mutate(chance, r) {
    for (let i=0;i<MAX_PRODUCT_SUM_TERMS;i++) if (r.Int1024()<chance) this.reference[i] = r.Byte(MAX_PRODUCT_TERMS);
    if (r.Int1024()<chance) this.bTrue = r.Bool()?1:0;
  }
  crossover(o, r) {
    for (let i=0;i<MAX_PRODUCT_SUM_TERMS;i++) if (r.Bool()) this.reference[i] = o.reference[i];
    if (r.Bool()) this.bTrue = o.bTrue;
  }
  copyFrom(o) { this.reference.set(o.reference); this.bTrue = o.bTrue; }
  isTrue(productArray, sensor) {
    for (let i=0;i<MAX_PRODUCT_SUM_TERMS;i++)
      if (productArray.term[this.reference[i]].isTrue(sensor)) return this.bTrue !== 0;
    return this.bTrue === 0;
  }
}

class ProductArray {
  constructor() {
    this.term = []; for (let i=0;i<MAX_PRODUCT_TERMS;i++) this.term.push(new ProductTerm());
    this.sum = []; for (let i=0;i<MAX_PRODUCT_SUMS;i++) this.sum.push(new ProductSum());
  }
  randomize(r) { this.term.forEach(t=>t.randomize(r)); this.sum.forEach(s=>s.randomize(r)); }
  mutate(chance, r) { this.term.forEach(t=>t.mutate(chance,r)); this.sum.forEach(s=>s.mutate(chance,r)); }
  crossover(o, r) {
    for (let i=0;i<MAX_PRODUCT_TERMS;i++) if (r.Bool()) this.term[i].copyFrom(o.term[i]);
    for (let i=0;i<MAX_PRODUCT_SUMS;i++) this.sum[i].crossover(o.sum[i], r);
  }
  copyFrom(o) {
    for (let i=0;i<MAX_PRODUCT_TERMS;i++) this.term[i].copyFrom(o.term[i]);
    for (let i=0;i<MAX_PRODUCT_SUMS;i++) this.sum[i].copyFrom(o.sum[i]);
  }
  isTrue(nSum, sensor) { return this.sum[nSum].isTrue(this, sensor); }
}

class CommandArgument {
  constructor() { this.command = 0; this.limb = 0; this.segment = 0; this.rate = 0; this.degrees = 0; }
  randomize(r) {
    this.command = r.Integer(CMD.MAX_TYPES); this.rate = r.Byte(); this.degrees = r.Byte();
    this.limb = r.Byte(MAX_SYMMETRY); this.segment = r.Byte(MAX_SEGMENTS);
  }
  mutate(chance, r) {
    if (r.Int1024()<chance) this.command = r.Integer(CMD.MAX_TYPES);
    if (r.Int1024()<chance) this.rate = r.Byte();
    if (r.Int1024()<chance) this.degrees = r.Byte();
    if (r.Int1024()<chance) this.limb = r.Byte(MAX_SYMMETRY);
    if (r.Int1024()<chance) this.segment = r.Byte(MAX_SEGMENTS);
  }
  copyFrom(o) { this.command=o.command; this.limb=o.limb; this.segment=o.segment; this.rate=o.rate; this.degrees=o.degrees; }
  getLimb(actualLimb) {
    if (this.limb === MAX_SYMMETRY) return this.limb;
    return (this.limb + actualLimb >= MAX_SYMMETRY) ? this.limb + actualLimb - MAX_SYMMETRY : this.limb + actualLimb;
  }
  getSegment() { return this.segment; }
  getCommand() { return this.command; }
  getLimbType() { return this.limb & 0x03; }
  getRate() { return this.rate & 0x03; }
  getDegrees() { return this.degrees; }
  // Memory perspective
  whatIsConsideredSet() { return (this.limb & 0x10) === 0x10; }
  whichStateBit() { return (1 << (this.limb & 0x07)) >>> 0; }
  setDuration() { return this.degrees * 4; }
  setAlgorithmOne() { return (this.segment & 0x02) === 0x02; }
  clearDuration() { return this.rate * 4; }
  clearAlgorithmOne() { return (this.segment & 0x01) === 0x01; }
}

class CommandLimbType {
  constructor() { this.comref = new Uint8Array(MAX_COMMANDS_PER_LIMB); this.sumref = new Uint8Array(MAX_COMMANDS_PER_LIMB); }
  randomize(r) { for (let i=0;i<MAX_COMMANDS_PER_LIMB;i++){ this.comref[i]=r.Byte(MAX_COMMANDS); this.sumref[i]=r.Byte(MAX_PRODUCT_SUMS);} }
  mutate(chance, r) {
    for (let i=0;i<MAX_COMMANDS_PER_LIMB;i++){
      if (r.Int1024()<chance) this.comref[i]=r.Byte(MAX_COMMANDS);
      if (r.Int1024()<chance) this.sumref[i]=r.Byte(MAX_PRODUCT_SUMS);
    }
  }
  crossover(o, r) {
    for (let i=0;i<MAX_COMMANDS_PER_LIMB;i++) if (r.Bool()){ this.comref[i]=o.comref[i]; this.sumref[i]=o.sumref[i]; }
  }
  copyFrom(o) { this.comref.set(o.comref); this.sumref.set(o.sumref); }
}

class CommandArray {
  constructor() {
    this.command = []; for (let i=0;i<MAX_COMMANDS;i++) this.command.push(new CommandArgument());
    this.productArray = new ProductArray();
    this.commandLimbType = []; for (let i=0;i<MAX_LIMB_TYPES;i++) this.commandLimbType.push(new CommandLimbType());
  }
  randomize(r) {
    this.command.forEach(c=>c.randomize(r));
    this.productArray.randomize(r);
    this.commandLimbType.forEach(c=>c.randomize(r));
  }
  mutate(chance, r) {
    this.command.forEach(c=>c.mutate(chance,r));
    this.productArray.mutate(chance,r);
    this.commandLimbType.forEach(c=>c.mutate(chance,r));
  }
  crossover(o, r) {
    for (let i=0;i<MAX_COMMANDS;i++) if (r.Bool()) this.command[i].copyFrom(o.command[i]);
    this.productArray.crossover(o.productArray, r);
    for (let i=0;i<MAX_LIMB_TYPES;i++) this.commandLimbType[i].crossover(o.commandLimbType[i], r);
  }
  copyFrom(o) {
    for (let i=0;i<MAX_COMMANDS;i++) this.command[i].copyFrom(o.command[i]);
    this.productArray.copyFrom(o.productArray);
    for (let i=0;i<MAX_LIMB_TYPES;i++) this.commandLimbType[i].copyFrom(o.commandLimbType[i]);
  }
  getCommandArgument(nLimbType, nCommand) { return this.command[this.commandLimbType[nLimbType].comref[nCommand]]; }
  isTrue(nLimbType, nCommand, sensor) { return this.productArray.isTrue(this.commandLimbType[nLimbType].sumref[nCommand], sensor); }
}

// ---- Per-limb runtime command state ----
// Each entry mirrors one of the C++ Command* classes; implemented as plain objects
// keyed by kind, initialized per command slot.

const MEM_WAIT_FOR_TRUE_SET = 0, MEM_WAIT_AND_SET = 1, MEM_WAIT_FOR_FALSE_CLEAR = 2, MEM_WAIT_AND_CLEAR = 3;

class CommandLimbStore {
  constructor() { this.nLimbType = 0; this.nLimb = 0; this.state = new Array(MAX_COMMANDS_PER_LIMB).fill(null); }
  initialize(nLimbType, nLimb, biot) {
    this.nLimbType = nLimbType; this.nLimb = nLimb;
    for (let i = 0; i < MAX_COMMANDS_PER_LIMB; i++) {
      const arg = biot.commandArray.getCommandArgument(nLimbType, i);
      this.state[i] = this._initCommand(arg, biot);
    }
  }
  _initCommand(arg, biot) {
    const s = { };
    switch (arg.getCommand()) {
      case CMD.FLAP_LIMB_SEGMENT: case CMD.MOVE_LIMB_SEGMENT: {
        const nLimb = arg.getLimb(this.nLimb), nSegment = arg.getSegment();
        if (nLimb >= biot.trait.getLines() ||
            !biot.trait.getLineType(biot.trait.getLineTypeIndex(nLimb)).segment[nSegment].isVisible())
          { s.off = true; break; }
        s.nLimb = nLimb; s.nSegment = nSegment;
        s.maxDegrees = arg.getDegrees(); s.applied = 0; s.rate = arg.getRate(); s.goingUp = true;
        break;
      }
      case CMD.FLAP_LIMB_TYPE_SEGMENT: case CMD.MOVE_LIMB_TYPE_SEGMENT: {
        const lt = arg.getLimbType(), nSegment = arg.getSegment();
        if (!biot.trait.isLineTypeVisible(lt) || !biot.trait.getLineType(lt).segment[nSegment].isVisible())
          { s.off = true; break; }
        s.nLimbType = lt; s.nSegment = nSegment;
        s.maxDegrees = arg.getDegrees(); s.applied = 0; s.rate = arg.getRate(); s.goingUp = true;
        break;
      }
      case CMD.MOVE_LIMB_SEGMENTS: {
        const nLimb = arg.getLimb(this.nLimb);
        if (nLimb >= biot.trait.getLines()) { s.off = true; break; }
        s.nLimb = nLimb; s.maxDegrees = arg.getDegrees(); s.applied = 0; s.rate = arg.getRate();
        break;
      }
      case CMD.MOVE_LIMB_TYPE_SEGMENTS: {
        const lt = arg.getLimbType();
        if (!biot.trait.isLineTypeVisible(lt)) { s.off = true; break; }
        s.nLimbType = lt; s.maxDegrees = arg.getDegrees(); s.applied = 0; s.rate = arg.getRate();
        break;
      }
      case CMD.RETRACT_LIMB: {
        s.nSegment = MAX_SEGMENTS;
        const nLimb = arg.getLimb(this.nLimb);
        if (nLimb >= biot.trait.getLines()) { s.off = true; break; }
        const lt = biot.trait.getLineTypeIndex(nLimb);
        let found = false, other = false;
        for (let i = MAX_SEGMENTS - 1; i >= 0; i--) {
          const seg = biot.trait.getSegmentType(lt, i);
          if (!found) { if (seg.isVisible()) { s.maxRadius = seg.radius; s.appliedRadius = s.maxRadius; s.nSegment = i; found = true; } }
          else if (seg.isVisible()) { other = true; break; }
        }
        if (!other) { s.nSegment = MAX_SEGMENTS; s.off = true; }
        s.nLimb = nLimb;
        break;
      }
      case CMD.RETRACT_LIMB_TYPE: {
        s.nSegment = MAX_SEGMENTS;
        const lt = arg.getLimbType();
        if (!biot.trait.isLineTypeVisible(lt)) { s.off = true; break; }
        let found = false, other = false;
        for (let i = MAX_SEGMENTS - 1; i >= 0; i--) {
          const seg = biot.trait.getSegmentType(lt, i);
          if (!found) { if (seg.isVisible()) { s.maxRadius = seg.radius; s.appliedRadius = s.maxRadius; s.nSegment = i; found = true; } }
          else if (seg.isVisible()) { other = true; break; }
        }
        if (!other) { s.nSegment = MAX_SEGMENTS; s.off = true; }
        s.nLimbType = lt;
        break;
      }
      case CMD.MEMORY: {
        s.bSet = false;
        s.type = arg.setAlgorithmOne() ? MEM_WAIT_FOR_TRUE_SET : MEM_WAIT_AND_SET;
        s.time = arg.setDuration();
        break;
      }
      default: s.off = true; // NOP
    }
    return s;
  }
  execute(biot, sensor) {
    for (let i = 0; i < MAX_COMMANDS_PER_LIMB; i++) {
      const arg = biot.commandArray.getCommandArgument(this.nLimbType, i);
      const s = this.state[i];
      if (!s || s.off) continue;
      const isTrue = biot.commandArray.isTrue(this.nLimbType, i, sensor);
      switch (arg.getCommand()) {
        case CMD.FLAP_LIMB_SEGMENT: this._flapSeg(biot, s, isTrue, false); break;
        case CMD.FLAP_LIMB_TYPE_SEGMENT: this._flapSeg(biot, s, isTrue, true); break;
        case CMD.MOVE_LIMB_SEGMENT:
          if (isTrue) { if (s.applied < s.maxDegrees) s.applied += biot.moveLimbSegment(s.nSegment, s.nLimb, Math.min(s.rate, s.maxDegrees - s.applied)); }
          else if (s.applied > 0) s.applied += biot.moveLimbSegment(s.nSegment, s.nLimb, -Math.min(s.rate, s.applied));
          break;
        case CMD.MOVE_LIMB_SEGMENTS:
          if (isTrue) { if (s.applied < s.maxDegrees) s.applied += biot.moveLimbSegments(s.nLimb, Math.min(s.rate, s.maxDegrees - s.applied)); }
          else if (s.applied > 0) s.applied += biot.moveLimbSegments(s.nLimb, -Math.min(s.rate, s.applied));
          break;
        case CMD.MOVE_LIMB_TYPE_SEGMENT:
          if (isTrue) { if (s.applied < s.maxDegrees) s.applied += biot.moveLimbTypeSegment(s.nSegment, s.nLimbType, Math.min(s.rate, s.maxDegrees - s.applied)); }
          else if (s.applied > 0) s.applied += biot.moveLimbTypeSegment(s.nSegment, s.nLimbType, -Math.min(s.rate, s.applied));
          break;
        case CMD.MOVE_LIMB_TYPE_SEGMENTS:
          if (isTrue) { if (s.applied < s.maxDegrees) s.applied += biot.moveLimbTypeSegments(s.nLimbType, Math.min(s.rate, s.maxDegrees - s.applied)); }
          else if (s.applied > 0) s.applied += biot.moveLimbTypeSegments(s.nLimbType, -Math.min(s.rate, s.applied));
          break;
        case CMD.RETRACT_LIMB:
          if (isTrue) { if (s.appliedRadius > 0) s.appliedRadius -= biot.retractLine(s.nSegment, s.nLimb, s.maxRadius); }
          else if (s.appliedRadius < s.maxRadius) s.appliedRadius += biot.extendLine(s.nSegment, s.nLimb);
          break;
        case CMD.RETRACT_LIMB_TYPE:
          if (isTrue) { if (s.appliedRadius > 0) s.appliedRadius -= biot.retractLimbType(s.nSegment, s.nLimbType, s.maxRadius); }
          else if (s.appliedRadius < s.maxRadius) s.appliedRadius += biot.extendLimbType(s.nSegment, s.nLimbType);
          break;
        case CMD.MEMORY: this._memory(biot, arg, s, isTrue); break;
      }
    }
  }
  _flapSeg(biot, s, isTrue, isType) {
    // FLAP: oscillate the segment; impulse at zero-crossing
    const move = (rate) => isType
      ? biot.moveLimbTypeSegment(s.nSegment, s.nLimbType, rate)
      : biot.moveLimbSegment(s.nSegment, s.nLimb, rate);
    const impulse = () => {
      if (isType) {
        for (let i = 0; i < biot.trait.getLines(); i++)
          if (s.nLimbType === biot.trait.getLineTypeIndex(i)) biot.flap(s.nSegment * MAX_SYMMETRY + i);
      } else biot.flap(s.nSegment * MAX_SYMMETRY + s.nLimb);
    };
    if (isTrue) {
      if (s.goingUp) {
        const wasNeg = s.applied < 0;
        if (s.applied < s.maxDegrees) {
          s.applied += move(Math.min(s.rate, s.maxDegrees - s.applied));
          s.goingUp = !(s.applied >= s.maxDegrees);
        } else s.goingUp = false;
        if (wasNeg && s.applied >= 0) impulse();
      } else {
        const wasPos = s.applied > 0;
        if (s.applied > -s.maxDegrees) {
          s.applied += move(-Math.min(s.rate, s.applied + s.maxDegrees));
          s.goingUp = (s.applied <= -s.maxDegrees);
        } else s.goingUp = true;
        if (wasPos && s.applied <= 0) impulse();
      }
    } else {
      if (s.applied > 0) s.applied += move(-Math.min(s.rate, s.applied));
      if (s.applied < 0) s.applied += move(Math.min(s.rate, -s.applied));
    }
  }
  _memory(biot, arg, s, isTrue) {
    if (!s.bSet) {
      if (s.type === MEM_WAIT_FOR_TRUE_SET && !isTrue) s.time = arg.setDuration();
      s.time--;
      if (s.time <= 0) {
        if (arg.whatIsConsideredSet()) biot.internalState = (biot.internalState | arg.whichStateBit()) >>> 0;
        else biot.internalState = (biot.internalState & ~arg.whichStateBit()) >>> 0;
        s.time = arg.clearDuration(); s.bSet = true;
        s.type = arg.clearAlgorithmOne() ? MEM_WAIT_FOR_FALSE_CLEAR : MEM_WAIT_AND_CLEAR;
      }
    } else {
      if (s.type === MEM_WAIT_FOR_FALSE_CLEAR && !isTrue) s.time = arg.clearDuration();
      s.time--;
      if (s.time <= 0) {
        if (arg.whatIsConsideredSet()) biot.internalState = (biot.internalState & ~arg.whichStateBit()) >>> 0;
        else biot.internalState = (biot.internalState | arg.whichStateBit()) >>> 0;
        s.time = arg.setDuration(); s.bSet = false;
        s.type = arg.setAlgorithmOne() ? MEM_WAIT_FOR_FALSE_CLEAR : MEM_WAIT_AND_CLEAR;
      }
    }
  }
}

module.exports = { CMD, MAX_PRODUCT_TERMS, MAX_PRODUCT_SUMS, MAX_COMMANDS, MAX_COMMANDS_PER_LIMB,
  ProductTerm, ProductSum, ProductArray, CommandArgument, CommandLimbType, CommandArray, CommandLimbStore };
