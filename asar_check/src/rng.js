// ISAAC RNG — faithful port of Bob Jenkins' generator as used in Rand.cpp
'use strict';
const RANDSIZL = 8, RANDSIZ = 1 << RANDSIZL;

function mix(s) { // s = [a..h] uint32
  let [a,b,c,d,e,f,g,h] = s;
  a^=(b<<11)>>>0; d=(d+a)>>>0; b=(b+c)>>>0;
  b^=c>>>2;  e=(e+b)>>>0; c=(c+d)>>>0;
  c^=(d<<8)>>>0; f=(f+c)>>>0; d=(d+e)>>>0;
  d^=e>>>16; g=(g+d)>>>0; e=(e+f)>>>0;
  e^=(f<<10)>>>0; h=(h+e)>>>0; f=(f+g)>>>0;
  f^=g>>>4;  a=(a+f)>>>0; g=(g+h)>>>0;
  g^=(h<<8)>>>0; b=(b+g)>>>0; h=(h+a)>>>0;
  h^=a>>>9;  c=(c+h)>>>0; a=(a+b)>>>0;
  s[0]=a;s[1]=b;s[2]=c;s[3]=d;s[4]=e;s[5]=f;s[6]=g;s[7]=h;
}

class Randomizer {
  constructor() {
    if (!Randomizer._seeded) { Randomizer.randSeed((Date.now() & 0x7fffffff)); Randomizer._seeded = true; }
  }
  static randSeed(seed) {
    const r = Randomizer.randrsl;
    r[0] = seed >>> 0;
    for (let i = 1; i < RANDSIZ; i++) r[i] = (Math.imul((r[i-1] + 1) >>> 0, r[i-1])) >>> 0;
    Randomizer.randInit(true);
  }
  static randInit(seed) {
    const rsl = Randomizer.randrsl, mm = Randomizer.mm;
    Randomizer.aa = Randomizer.bb = Randomizer.cc = 0;
    const s = [0x9e3779b9,0x9e3779b9,0x9e3779b9,0x9e3779b9,0x9e3779b9,0x9e3779b9,0x9e3779b9,0x9e3779b9];
    for (let i = 0; i < 4; i++) mix(s);
    for (let i = 0; i < RANDSIZ; i += 8) {
      if (seed) for (let j = 0; j < 8; j++) s[j] = (s[j] + rsl[i+j]) >>> 0;
      mix(s);
      for (let j = 0; j < 8; j++) mm[i+j] = s[j];
    }
    if (seed) {
      for (let i = 0; i < RANDSIZ; i += 8) {
        for (let j = 0; j < 8; j++) s[j] = (s[j] + mm[i+j]) >>> 0;
        mix(s);
        for (let j = 0; j < 8; j++) mm[i+j] = s[j];
      }
    }
    Randomizer.isaac();
    Randomizer.randcnt = RANDSIZ;
  }
  static isaac() {
    const mm = Randomizer.mm, r = Randomizer.randrsl;
    let a = Randomizer.aa, b = (Randomizer.bb + (++Randomizer.cc)) >>> 0, x, y;
    const ind = (v) => mm[(v & (RANDSIZ-1)) >>> 0];
    let m2 = 0, m = 0;
    const step = (mixv, mi) => {
      x = mm[mi];
      a = ((a ^ mixv) + mm[m2++]) >>> 0;
      y = (ind(x) + a + b) >>> 0; mm[mi] = y;
      b = (ind(y >>> RANDSIZL) + x) >>> 0; r[mi] = b;
    };
    for (m = 0, m2 = RANDSIZ/2; m < RANDSIZ/2;) {
      step((a<<13)>>>0, m++); step(a>>>6, m++); step((a<<2)>>>0, m++); step(a>>>16, m++);
    }
    for (m2 = 0; m2 < RANDSIZ/2;) {
      step((a<<13)>>>0, m++); step(a>>>6, m++); step((a<<2)>>>0, m++); step(a>>>16, m++);
    }
    Randomizer.bb = b; Randomizer.aa = a;
  }
  rand() {
    if (Randomizer.randcnt-- === 0) { Randomizer.isaac(); Randomizer.randcnt = RANDSIZ - 1; }
    return Randomizer.randrsl[Randomizer.randcnt];
  }
  Integer(max) { return max > 0 ? this.rand() % max : 0; }
  Byte(max) { return max === undefined ? this.rand() & 0xff : this.rand() % max; }
  Sign() { return (this.rand() & 0x80000000) ? -1 : 1; }
  Bool() { return (this.rand() & 0x10) === 0x10; }
  Int1024() { return this.rand() & 0x3ff; }
  Int256() { return this.rand() & 0xff; }
  Float() { return (this.Int256() * 2) / 255 - 1; }
  Dword() { return this.rand(); }
}
Randomizer.randrsl = new Uint32Array(RANDSIZ);
Randomizer.mm = new Uint32Array(RANDSIZ);
Randomizer.aa = 0; Randomizer.bb = 0; Randomizer.cc = 0;
Randomizer.randcnt = 0; Randomizer._seeded = false;

module.exports = { Randomizer, RANDSIZ };
