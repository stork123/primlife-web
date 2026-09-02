"use strict";
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __commonJS = (cb, mod) => function __require2() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };

  // tools/stub-node.js
  var __originalRequire;
  var init_stub_node = __esm({
    "tools/stub-node.js"() {
      __originalRequire = typeof __require !== "undefined" ? __require : null;
      globalThis.require = function(name) {
        if (typeof __originalRequire === "function") {
          try {
            return __originalRequire(name);
          } catch (e) {
          }
        }
        if (name === "fs") return {};
        if (name === "path") return {
          join: function() {
            return Array.prototype.join.call(arguments, "/");
          },
          resolve: function() {
            return Array.prototype.join.call(arguments, "/");
          },
          basename: function(p) {
            return p.split("/").pop();
          },
          dirname: function(p) {
            return p.split("/").slice(0, -1).join("/");
          }
        };
        return {};
      };
      if (typeof process === "undefined" || !process.env) {
        globalThis.process = { env: {} };
      }
    }
  });

  // src/rng.js
  var require_rng = __commonJS({
    "src/rng.js"(exports, module) {
      "use strict";
      init_stub_node();
      var RANDSIZL = 8;
      var RANDSIZ = 1 << RANDSIZL;
      function mix(s) {
        let [a, b, c, d, e, f, g, h] = s;
        a ^= b << 11 >>> 0;
        d = d + a >>> 0;
        b = b + c >>> 0;
        b ^= c >>> 2;
        e = e + b >>> 0;
        c = c + d >>> 0;
        c ^= d << 8 >>> 0;
        f = f + c >>> 0;
        d = d + e >>> 0;
        d ^= e >>> 16;
        g = g + d >>> 0;
        e = e + f >>> 0;
        e ^= f << 10 >>> 0;
        h = h + e >>> 0;
        f = f + g >>> 0;
        f ^= g >>> 4;
        a = a + f >>> 0;
        g = g + h >>> 0;
        g ^= h << 8 >>> 0;
        b = b + g >>> 0;
        h = h + a >>> 0;
        h ^= a >>> 9;
        c = c + h >>> 0;
        a = a + b >>> 0;
        s[0] = a;
        s[1] = b;
        s[2] = c;
        s[3] = d;
        s[4] = e;
        s[5] = f;
        s[6] = g;
        s[7] = h;
      }
      var Randomizer = class _Randomizer {
        constructor() {
          if (!_Randomizer._seeded) {
            _Randomizer.randSeed(Date.now() & 2147483647);
            _Randomizer._seeded = true;
          }
        }
        static randSeed(seed) {
          const r = _Randomizer.randrsl;
          r[0] = seed >>> 0;
          for (let i = 1; i < RANDSIZ; i++) r[i] = Math.imul(r[i - 1] + 1 >>> 0, r[i - 1]) >>> 0;
          _Randomizer.randInit(true);
        }
        static randInit(seed) {
          const rsl = _Randomizer.randrsl, mm = _Randomizer.mm;
          _Randomizer.aa = _Randomizer.bb = _Randomizer.cc = 0;
          const s = [2654435769, 2654435769, 2654435769, 2654435769, 2654435769, 2654435769, 2654435769, 2654435769];
          for (let i = 0; i < 4; i++) mix(s);
          for (let i = 0; i < RANDSIZ; i += 8) {
            if (seed) for (let j = 0; j < 8; j++) s[j] = s[j] + rsl[i + j] >>> 0;
            mix(s);
            for (let j = 0; j < 8; j++) mm[i + j] = s[j];
          }
          if (seed) {
            for (let i = 0; i < RANDSIZ; i += 8) {
              for (let j = 0; j < 8; j++) s[j] = s[j] + mm[i + j] >>> 0;
              mix(s);
              for (let j = 0; j < 8; j++) mm[i + j] = s[j];
            }
          }
          _Randomizer.isaac();
          _Randomizer.randcnt = RANDSIZ;
        }
        static isaac() {
          const mm = _Randomizer.mm, r = _Randomizer.randrsl;
          let a = _Randomizer.aa, b = _Randomizer.bb + ++_Randomizer.cc >>> 0, x, y;
          const ind = (v) => mm[(v & RANDSIZ - 1) >>> 0];
          let m2 = 0, m = 0;
          const step = (mixv, mi) => {
            x = mm[mi];
            a = (a ^ mixv) + mm[m2++] >>> 0;
            y = ind(x) + a + b >>> 0;
            mm[mi] = y;
            b = ind(y >>> RANDSIZL) + x >>> 0;
            r[mi] = b;
          };
          for (m = 0, m2 = RANDSIZ / 2; m < RANDSIZ / 2; ) {
            step(a << 13 >>> 0, m++);
            step(a >>> 6, m++);
            step(a << 2 >>> 0, m++);
            step(a >>> 16, m++);
          }
          for (m2 = 0; m2 < RANDSIZ / 2; ) {
            step(a << 13 >>> 0, m++);
            step(a >>> 6, m++);
            step(a << 2 >>> 0, m++);
            step(a >>> 16, m++);
          }
          _Randomizer.bb = b;
          _Randomizer.aa = a;
        }
        rand() {
          if (_Randomizer.randcnt-- === 0) {
            _Randomizer.isaac();
            _Randomizer.randcnt = RANDSIZ - 1;
          }
          return _Randomizer.randrsl[_Randomizer.randcnt];
        }
        Integer(max) {
          return max > 0 ? this.rand() % max : 0;
        }
        Byte(max) {
          return max === void 0 ? this.rand() & 255 : this.rand() % max;
        }
        Sign() {
          return this.rand() & 2147483648 ? -1 : 1;
        }
        Bool() {
          return (this.rand() & 16) === 16;
        }
        Int1024() {
          return this.rand() & 1023;
        }
        Int256() {
          return this.rand() & 255;
        }
        Float() {
          return this.Int256() * 2 / 255 - 1;
        }
        Dword() {
          return this.rand();
        }
      };
      Randomizer.randrsl = new Uint32Array(RANDSIZ);
      Randomizer.mm = new Uint32Array(RANDSIZ);
      Randomizer.aa = 0;
      Randomizer.bb = 0;
      Randomizer.cc = 0;
      Randomizer.randcnt = 0;
      Randomizer._seeded = false;
      module.exports = { Randomizer, RANDSIZ };
    }
  });

  // src/genotype.js
  var require_genotype = __commonJS({
    "src/genotype.js"(exports, module) {
      "use strict";
      init_stub_node();
      var { Randomizer } = require_rng();
      var MAX_RATIO = 20;
      var UNI_RATIO = 5;
      var MAX_SEGMENTS = 10;
      var MAX_SYMMETRY = 8;
      var MAX_GENES = MAX_SYMMETRY * MAX_SEGMENTS;
      var MAX_LIMB_TYPES = 4;
      var DIM_COLOR = 5;
      var GREEN_LEAF = 0;
      var BLUE_LEAF = 1;
      var RED_LEAF = 2;
      var LBLUE_LEAF = 3;
      var WHITE_LEAF = 4;
      var DARK_GREEN_LEAF = 5;
      var DARK_BLUE_LEAF = 6;
      var DARK_RED_LEAF = 7;
      var DARK_LBLUE_LEAF = 8;
      var GREY_LEAF = 9;
      var YELLOW_LEAF = 10;
      var BLACK_LEAF = 11;
      var PURPLE_LEAF = 12;
      var MAX_LEAF = 13;
      var CONTACT_IGNORE = 0;
      var CONTACT_EAT = 1;
      var CONTACT_EATEN = 2;
      var CONTACT_DESTROY = 3;
      var CONTACT_DESTROYED = 4;
      var CONTACT_DEFEND = 5;
      var CONTACT_DEFENDED = 6;
      var CONTACT_ATTACK = 7;
      var MIRROR_ANGLE = [0, 180, 0, 180, 90, 90, 270, 270];
      var MIRROR_COEF = [1, -1, -1, 1, -1, 1, -1, 1];
      var MIRROR_SIX = [0, 120, 0, 120, 240, 240, 0, 0];
      var GeneSegment = class {
        constructor() {
          this.color = [0, 0];
          this.visible = 0;
          this.radius = 0;
          this.angle = 0;
          this.startSegment = 0;
        }
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
        copyFrom(o) {
          this.color[0] = o.color[0];
          this.color[1] = o.color[1];
          this.visible = o.visible;
          this.radius = o.radius;
          this.angle = o.angle;
          this.startSegment = o.startSegment;
        }
        isVisible() {
          return !!this.visible;
        }
      };
      var GeneLimb = class {
        constructor() {
          this.segment = [];
          for (let i = 0; i < MAX_SEGMENTS; i++) this.segment.push(new GeneSegment());
          this.toggleVisibleSegments = new Array(MAX_SEGMENTS).fill(false);
        }
        randomize(nSegmentsPerArm, rand) {
          for (let i = 0; i < MAX_SEGMENTS; i++) {
            let vis;
            switch (nSegmentsPerArm) {
              case 1:
                vis = i < 3 ? rand.Bool() : false;
                break;
              case 2:
                vis = i < 4 ? true : i < 7 ? rand.Bool() : false;
                break;
              case 3:
                vis = i < 7 ? true : i < 10 ? rand.Bool() : false;
                break;
              default:
                vis = rand.Bool();
            }
            this.segment[i].randomize(i, vis, rand);
          }
          this.toggleSegments();
        }
        mutate(chance, rand) {
          for (let i = 0; i < MAX_SEGMENTS; i++) this.segment[i].mutate(chance, i, rand);
          this.toggleSegments();
        }
        crossover(other, rand) {
          for (let i = 0; i < MAX_SEGMENTS; i++) if (rand.Bool()) this.segment[i].copyFrom(other.segment[i]);
          this.toggleSegments();
        }
        toggleSegments() {
          let toggle = false;
          for (let i = 0; i < MAX_SEGMENTS; i++) {
            if (this.segment[i].isVisible()) {
              this.toggleVisibleSegments[i] = toggle;
              toggle = !toggle;
            } else this.toggleVisibleSegments[i] = false;
          }
        }
        copyFrom(o) {
          for (let i = 0; i < MAX_SEGMENTS; i++) this.segment[i].copyFrom(o.segment[i]);
          this.toggleSegments();
        }
      };
      var GeneTrait = class {
        constructor() {
          this.disperse = 0;
          this.children = 1;
          this.attackChildren = 0;
          this.attackSiblings = 0;
          this.species = 0;
          this.adultRatio = [1, 1];
          this.lineCount = 1;
          this.lineRef = new Array(MAX_SYMMETRY).fill(0);
          this.mirrored = 0;
          this.sex = 0;
          this.asexual = 0;
          this.chanceMale = 0;
          this.offset = 0;
          this.maxAge = 255;
          this.geneLine = [];
          for (let i = 0; i < MAX_LIMB_TYPES; i++) this.geneLine.push(new GeneLimb());
          this.angle = Array.from({ length: MAX_SYMMETRY }, () => new Array(MAX_SEGMENTS).fill(0));
        }
        getLines() {
          return this.lineCount;
        }
        getLineTypeIndex(line) {
          return this.lineRef[line];
        }
        isMirrored() {
          return !!this.mirrored;
        }
        isMale() {
          return !!this.sex;
        }
        isAsexual() {
          return !!this.asexual;
        }
        getOffset() {
          return this.offset;
        }
        getAdultRatio() {
          return this.adultRatio[this.sex];
        }
        getNumberOfChildren() {
          return this.children;
        }
        getDisperseChildren() {
          return !!this.disperse;
        }
        getSpecies() {
          return this.species;
        }
        getMaxAge() {
          return 1280 * (this.maxAge + 1);
        }
        getSegment(line, seg) {
          return this.geneLine[this.lineRef[line]].segment[seg];
        }
        getSegmentType(lt, seg) {
          return this.geneLine[lt].segment[seg];
        }
        getLineType(lt) {
          return this.geneLine[lt];
        }
        pickSex(rand) {
          this.sex = this.chanceMale > rand.Int256() ? 1 : 0;
        }
        isLineTypeVisible(lt) {
          for (let i = 0; i < this.lineCount; i++) if (lt === this.lineRef[i]) return true;
          return false;
        }
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
                  this.angle[line][seg] = this.getOffset() + gSeg.angle + Math.floor(line * 360 / this.getLines());
              }
            }
          }
        }
        randomize(nArmsPerBiot, nTypesPerBiot, nSegmentsPerArm, rand) {
          this.disperse = rand.Bool() ? 1 : 0;
          this.children = rand.Integer(8) + 1;
          this.attackChildren = rand.Bool() ? 1 : 0;
          this.attackSiblings = rand.Bool() ? 1 : 0;
          this.species = rand.Integer(2);
          this.adultRatio[0] = rand.Integer(6) + 1;
          this.adultRatio[1] = rand.Integer(6) + 1;
          this.mirrored = rand.Bool() ? 1 : 0;
          switch (nArmsPerBiot) {
            case 1:
              this.lineCount = rand.Integer(2) + 1;
              break;
            case 2:
              this.lineCount = rand.Integer(2) + 3;
              break;
            case 3:
              this.lineCount = rand.Integer(2) + 5;
              break;
            case 4:
              this.lineCount = rand.Integer(2) + 7;
              break;
            default:
              this.lineCount = rand.Integer(MAX_SYMMETRY) + 1;
          }
          if (this.lineCount & 1) this.mirrored = 0;
          this.offset = rand.Integer(360);
          for (let i = 0; i < MAX_LIMB_TYPES; i++) this.geneLine[i].randomize(nSegmentsPerArm, rand);
          this.sex = rand.Bool() ? 1 : 0;
          this.asexual = rand.Bool() ? 1 : 0;
          this.chanceMale = Math.floor(rand.Int256() / 2) + 64;
          this.maxAge = rand.Int256();
          for (let i = 0; i < MAX_SYMMETRY; i++) this.lineRef[i] = rand.Byte(nTypesPerBiot + 1);
          this.calculateAngles();
        }
        mutate(chance, rand) {
          if (rand.Int1024() < chance) this.disperse = rand.Bool() ? 1 : 0;
          if (rand.Int1024() < chance) this.children = rand.Integer(8) + 1;
          if (rand.Int1024() < chance) this.attackChildren = rand.Bool() ? 1 : 0;
          if (rand.Int1024() < chance) this.attackSiblings = rand.Bool() ? 1 : 0;
          if (rand.Int1024() < chance) {
            this.species += rand.Sign() > 0 ? 1 : -1;
            if (this.species < 0) this.species = 0;
            if (this.species > 15) this.species = 15;
          }
          if (rand.Int1024() < chance) this.adultRatio[0] = rand.Integer(6) + 1;
          if (rand.Int1024() < chance) this.adultRatio[1] = rand.Integer(6) + 1;
          if (rand.Int1024() < chance) this.lineCount = rand.Integer(8) + 1;
          if (rand.Int1024() < chance) this.mirrored = rand.Bool() ? 1 : 0;
          if (rand.Int1024() < chance) this.offset = rand.Integer(360);
          for (let i = 0; i < MAX_LIMB_TYPES; i++) this.geneLine[i].mutate(chance, rand);
          if (rand.Int1024() < chance) this.sex = rand.Bool() ? 1 : 0;
          if (rand.Int1024() < chance) this.asexual = rand.Bool() ? 1 : 0;
          if (rand.Int1024() < chance) this.chanceMale = rand.Byte();
          if (rand.Int1024() < chance) this.maxAge = rand.Int256();
          for (let i = 0; i < MAX_SYMMETRY; i++) if (rand.Int1024() < chance) this.lineRef[i] = rand.Byte(MAX_LIMB_TYPES);
          this.calculateAngles();
        }
        crossover(other, rand) {
          for (let i = 0; i < MAX_LIMB_TYPES; i++) this.geneLine[i].crossover(other.geneLine[i], rand);
          for (let i = 0; i < MAX_SYMMETRY; i++) if (rand.Bool()) this.lineRef[i] = other.lineRef[i];
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
          this.disperse = o.disperse;
          this.children = o.children;
          this.attackChildren = o.attackChildren;
          this.attackSiblings = o.attackSiblings;
          this.species = o.species;
          this.adultRatio[0] = o.adultRatio[0];
          this.adultRatio[1] = o.adultRatio[1];
          this.lineCount = o.lineCount;
          for (let i = 0; i < MAX_SYMMETRY; i++) this.lineRef[i] = o.lineRef[i];
          this.mirrored = o.mirrored;
          this.sex = o.sex;
          this.asexual = o.asexual;
          this.chanceMale = o.chanceMale;
          this.offset = o.offset;
          this.maxAge = o.maxAge;
          for (let i = 0; i < MAX_LIMB_TYPES; i++) this.geneLine[i].copyFrom(o.geneLine[i]);
          this.calculateAngles();
        }
      };
      module.exports = {
        MAX_RATIO,
        UNI_RATIO,
        MAX_SEGMENTS,
        MAX_SYMMETRY,
        MAX_GENES,
        MAX_LIMB_TYPES,
        DIM_COLOR,
        GREEN_LEAF,
        BLUE_LEAF,
        RED_LEAF,
        LBLUE_LEAF,
        WHITE_LEAF,
        DARK_GREEN_LEAF,
        DARK_BLUE_LEAF,
        DARK_RED_LEAF,
        DARK_LBLUE_LEAF,
        GREY_LEAF,
        YELLOW_LEAF,
        BLACK_LEAF,
        PURPLE_LEAF,
        MAX_LEAF,
        CONTACT_IGNORE,
        CONTACT_EAT,
        CONTACT_EATEN,
        CONTACT_DESTROY,
        CONTACT_DESTROYED,
        CONTACT_DEFEND,
        CONTACT_DEFENDED,
        CONTACT_ATTACK,
        MIRROR_ANGLE,
        MIRROR_COEF,
        MIRROR_SIX,
        GeneSegment,
        GeneLimb,
        GeneTrait
      };
    }
  });

  // src/brain.js
  var require_brain = __commonJS({
    "src/brain.js"(exports, module) {
      "use strict";
      init_stub_node();
      var { Randomizer } = require_rng();
      var G2 = require_genotype();
      var { MAX_SEGMENTS, MAX_SYMMETRY, MAX_LIMB_TYPES } = G2;
      var MAX_PRODUCT_TERMS = 256;
      var MAX_PRODUCT_SUMS = 64;
      var MAX_PRODUCT_SUM_TERMS = 8;
      var MAX_COMMANDS = 64;
      var MAX_COMMANDS_PER_LIMB = 16;
      var CMD = {
        FLAP_LIMB_SEGMENT: 0,
        FLAP_LIMB_TYPE_SEGMENT: 1,
        MOVE_LIMB_SEGMENT: 2,
        MOVE_LIMB_SEGMENTS: 3,
        MOVE_LIMB_TYPE_SEGMENT: 4,
        MOVE_LIMB_TYPE_SEGMENTS: 5,
        RETRACT_LIMB_TYPE: 6,
        RETRACT_LIMB: 7,
        NOP: 8,
        MEMORY: 9,
        MAX_TYPES: 10
      };
      var ProductTerm = class {
        constructor() {
          this.mask = 0;
          this.invert = 0;
        }
        randomize(r) {
          this.mask = r.Dword();
          this.invert = r.Dword();
        }
        mutate(chance, r) {
          if (r.Int1024() < chance) this.mask = r.Dword();
          if (r.Int1024() < chance) this.invert = r.Dword();
        }
        isTrue(sensor) {
          return ((sensor ^ this.invert) & this.mask) >>> 0 === this.mask;
        }
        copyFrom(o) {
          this.mask = o.mask;
          this.invert = o.invert;
        }
      };
      var ProductSum = class {
        constructor() {
          this.reference = new Uint8Array(MAX_PRODUCT_SUM_TERMS);
          this.bTrue = 0;
        }
        randomize(r) {
          for (let i = 0; i < MAX_PRODUCT_SUM_TERMS; i++) this.reference[i] = r.Byte(MAX_PRODUCT_TERMS);
          this.bTrue = r.Bool() ? 1 : 0;
        }
        mutate(chance, r) {
          for (let i = 0; i < MAX_PRODUCT_SUM_TERMS; i++) if (r.Int1024() < chance) this.reference[i] = r.Byte(MAX_PRODUCT_TERMS);
          if (r.Int1024() < chance) this.bTrue = r.Bool() ? 1 : 0;
        }
        crossover(o, r) {
          for (let i = 0; i < MAX_PRODUCT_SUM_TERMS; i++) if (r.Bool()) this.reference[i] = o.reference[i];
          if (r.Bool()) this.bTrue = o.bTrue;
        }
        copyFrom(o) {
          this.reference.set(o.reference);
          this.bTrue = o.bTrue;
        }
        isTrue(productArray, sensor) {
          for (let i = 0; i < MAX_PRODUCT_SUM_TERMS; i++)
            if (productArray.term[this.reference[i]].isTrue(sensor)) return this.bTrue !== 0;
          return this.bTrue === 0;
        }
      };
      var ProductArray = class {
        constructor() {
          this.term = [];
          for (let i = 0; i < MAX_PRODUCT_TERMS; i++) this.term.push(new ProductTerm());
          this.sum = [];
          for (let i = 0; i < MAX_PRODUCT_SUMS; i++) this.sum.push(new ProductSum());
        }
        randomize(r) {
          this.term.forEach((t) => t.randomize(r));
          this.sum.forEach((s) => s.randomize(r));
        }
        mutate(chance, r) {
          this.term.forEach((t) => t.mutate(chance, r));
          this.sum.forEach((s) => s.mutate(chance, r));
        }
        crossover(o, r) {
          for (let i = 0; i < MAX_PRODUCT_TERMS; i++) if (r.Bool()) this.term[i].copyFrom(o.term[i]);
          for (let i = 0; i < MAX_PRODUCT_SUMS; i++) this.sum[i].crossover(o.sum[i], r);
        }
        copyFrom(o) {
          for (let i = 0; i < MAX_PRODUCT_TERMS; i++) this.term[i].copyFrom(o.term[i]);
          for (let i = 0; i < MAX_PRODUCT_SUMS; i++) this.sum[i].copyFrom(o.sum[i]);
        }
        isTrue(nSum, sensor) {
          return this.sum[nSum].isTrue(this, sensor);
        }
      };
      var CommandArgument = class {
        constructor() {
          this.command = 0;
          this.limb = 0;
          this.segment = 0;
          this.rate = 0;
          this.degrees = 0;
        }
        randomize(r) {
          this.command = r.Integer(CMD.MAX_TYPES);
          this.rate = r.Byte();
          this.degrees = r.Byte();
          this.limb = r.Byte(MAX_SYMMETRY);
          this.segment = r.Byte(MAX_SEGMENTS);
        }
        mutate(chance, r) {
          if (r.Int1024() < chance) this.command = r.Integer(CMD.MAX_TYPES);
          if (r.Int1024() < chance) this.rate = r.Byte();
          if (r.Int1024() < chance) this.degrees = r.Byte();
          if (r.Int1024() < chance) this.limb = r.Byte(MAX_SYMMETRY);
          if (r.Int1024() < chance) this.segment = r.Byte(MAX_SEGMENTS);
        }
        copyFrom(o) {
          this.command = o.command;
          this.limb = o.limb;
          this.segment = o.segment;
          this.rate = o.rate;
          this.degrees = o.degrees;
        }
        getLimb(actualLimb) {
          if (this.limb === MAX_SYMMETRY) return this.limb;
          return this.limb + actualLimb >= MAX_SYMMETRY ? this.limb + actualLimb - MAX_SYMMETRY : this.limb + actualLimb;
        }
        getSegment() {
          return this.segment;
        }
        getCommand() {
          return this.command;
        }
        getLimbType() {
          return this.limb & 3;
        }
        getRate() {
          return this.rate & 3;
        }
        getDegrees() {
          return this.degrees;
        }
        // Memory perspective
        whatIsConsideredSet() {
          return (this.limb & 16) === 16;
        }
        whichStateBit() {
          return 1 << (this.limb & 7) >>> 0;
        }
        setDuration() {
          return this.degrees * 4;
        }
        setAlgorithmOne() {
          return (this.segment & 2) === 2;
        }
        clearDuration() {
          return this.rate * 4;
        }
        clearAlgorithmOne() {
          return (this.segment & 1) === 1;
        }
      };
      var CommandLimbType = class {
        constructor() {
          this.comref = new Uint8Array(MAX_COMMANDS_PER_LIMB);
          this.sumref = new Uint8Array(MAX_COMMANDS_PER_LIMB);
        }
        randomize(r) {
          for (let i = 0; i < MAX_COMMANDS_PER_LIMB; i++) {
            this.comref[i] = r.Byte(MAX_COMMANDS);
            this.sumref[i] = r.Byte(MAX_PRODUCT_SUMS);
          }
        }
        mutate(chance, r) {
          for (let i = 0; i < MAX_COMMANDS_PER_LIMB; i++) {
            if (r.Int1024() < chance) this.comref[i] = r.Byte(MAX_COMMANDS);
            if (r.Int1024() < chance) this.sumref[i] = r.Byte(MAX_PRODUCT_SUMS);
          }
        }
        crossover(o, r) {
          for (let i = 0; i < MAX_COMMANDS_PER_LIMB; i++) if (r.Bool()) {
            this.comref[i] = o.comref[i];
            this.sumref[i] = o.sumref[i];
          }
        }
        copyFrom(o) {
          this.comref.set(o.comref);
          this.sumref.set(o.sumref);
        }
      };
      var CommandArray = class {
        constructor() {
          this.command = [];
          for (let i = 0; i < MAX_COMMANDS; i++) this.command.push(new CommandArgument());
          this.productArray = new ProductArray();
          this.commandLimbType = [];
          for (let i = 0; i < MAX_LIMB_TYPES; i++) this.commandLimbType.push(new CommandLimbType());
        }
        randomize(r) {
          this.command.forEach((c) => c.randomize(r));
          this.productArray.randomize(r);
          this.commandLimbType.forEach((c) => c.randomize(r));
        }
        mutate(chance, r) {
          this.command.forEach((c) => c.mutate(chance, r));
          this.productArray.mutate(chance, r);
          this.commandLimbType.forEach((c) => c.mutate(chance, r));
        }
        crossover(o, r) {
          for (let i = 0; i < MAX_COMMANDS; i++) if (r.Bool()) this.command[i].copyFrom(o.command[i]);
          this.productArray.crossover(o.productArray, r);
          for (let i = 0; i < MAX_LIMB_TYPES; i++) this.commandLimbType[i].crossover(o.commandLimbType[i], r);
        }
        copyFrom(o) {
          for (let i = 0; i < MAX_COMMANDS; i++) this.command[i].copyFrom(o.command[i]);
          this.productArray.copyFrom(o.productArray);
          for (let i = 0; i < MAX_LIMB_TYPES; i++) this.commandLimbType[i].copyFrom(o.commandLimbType[i]);
        }
        getCommandArgument(nLimbType, nCommand) {
          return this.command[this.commandLimbType[nLimbType].comref[nCommand]];
        }
        isTrue(nLimbType, nCommand, sensor) {
          return this.productArray.isTrue(this.commandLimbType[nLimbType].sumref[nCommand], sensor);
        }
      };
      var MEM_WAIT_FOR_TRUE_SET = 0;
      var MEM_WAIT_AND_SET = 1;
      var MEM_WAIT_FOR_FALSE_CLEAR = 2;
      var MEM_WAIT_AND_CLEAR = 3;
      var CommandLimbStore = class {
        constructor() {
          this.nLimbType = 0;
          this.nLimb = 0;
          this.state = new Array(MAX_COMMANDS_PER_LIMB).fill(null);
        }
        initialize(nLimbType, nLimb, biot) {
          this.nLimbType = nLimbType;
          this.nLimb = nLimb;
          for (let i = 0; i < MAX_COMMANDS_PER_LIMB; i++) {
            const arg = biot.commandArray.getCommandArgument(nLimbType, i);
            this.state[i] = this._initCommand(arg, biot);
          }
        }
        _initCommand(arg, biot) {
          const s = {};
          switch (arg.getCommand()) {
            case CMD.FLAP_LIMB_SEGMENT:
            case CMD.MOVE_LIMB_SEGMENT: {
              const nLimb = arg.getLimb(this.nLimb), nSegment = arg.getSegment();
              if (nLimb >= biot.trait.getLines() || !biot.trait.getLineType(biot.trait.getLineTypeIndex(nLimb)).segment[nSegment].isVisible()) {
                s.off = true;
                break;
              }
              s.nLimb = nLimb;
              s.nSegment = nSegment;
              s.maxDegrees = arg.getDegrees();
              s.applied = 0;
              s.rate = arg.getRate();
              s.goingUp = true;
              break;
            }
            case CMD.FLAP_LIMB_TYPE_SEGMENT:
            case CMD.MOVE_LIMB_TYPE_SEGMENT: {
              const lt = arg.getLimbType(), nSegment = arg.getSegment();
              if (!biot.trait.isLineTypeVisible(lt) || !biot.trait.getLineType(lt).segment[nSegment].isVisible()) {
                s.off = true;
                break;
              }
              s.nLimbType = lt;
              s.nSegment = nSegment;
              s.maxDegrees = arg.getDegrees();
              s.applied = 0;
              s.rate = arg.getRate();
              s.goingUp = true;
              break;
            }
            case CMD.MOVE_LIMB_SEGMENTS: {
              const nLimb = arg.getLimb(this.nLimb);
              if (nLimb >= biot.trait.getLines()) {
                s.off = true;
                break;
              }
              s.nLimb = nLimb;
              s.maxDegrees = arg.getDegrees();
              s.applied = 0;
              s.rate = arg.getRate();
              break;
            }
            case CMD.MOVE_LIMB_TYPE_SEGMENTS: {
              const lt = arg.getLimbType();
              if (!biot.trait.isLineTypeVisible(lt)) {
                s.off = true;
                break;
              }
              s.nLimbType = lt;
              s.maxDegrees = arg.getDegrees();
              s.applied = 0;
              s.rate = arg.getRate();
              break;
            }
            case CMD.RETRACT_LIMB: {
              s.nSegment = MAX_SEGMENTS;
              const nLimb = arg.getLimb(this.nLimb);
              if (nLimb >= biot.trait.getLines()) {
                s.off = true;
                break;
              }
              const lt = biot.trait.getLineTypeIndex(nLimb);
              let found = false, other = false;
              for (let i = MAX_SEGMENTS - 1; i >= 0; i--) {
                const seg = biot.trait.getSegmentType(lt, i);
                if (!found) {
                  if (seg.isVisible()) {
                    s.maxRadius = seg.radius;
                    s.appliedRadius = s.maxRadius;
                    s.nSegment = i;
                    found = true;
                  }
                } else if (seg.isVisible()) {
                  other = true;
                  break;
                }
              }
              if (!other) {
                s.nSegment = MAX_SEGMENTS;
                s.off = true;
              }
              s.nLimb = nLimb;
              break;
            }
            case CMD.RETRACT_LIMB_TYPE: {
              s.nSegment = MAX_SEGMENTS;
              const lt = arg.getLimbType();
              if (!biot.trait.isLineTypeVisible(lt)) {
                s.off = true;
                break;
              }
              let found = false, other = false;
              for (let i = MAX_SEGMENTS - 1; i >= 0; i--) {
                const seg = biot.trait.getSegmentType(lt, i);
                if (!found) {
                  if (seg.isVisible()) {
                    s.maxRadius = seg.radius;
                    s.appliedRadius = s.maxRadius;
                    s.nSegment = i;
                    found = true;
                  }
                } else if (seg.isVisible()) {
                  other = true;
                  break;
                }
              }
              if (!other) {
                s.nSegment = MAX_SEGMENTS;
                s.off = true;
              }
              s.nLimbType = lt;
              break;
            }
            case CMD.MEMORY: {
              s.bSet = false;
              s.type = arg.setAlgorithmOne() ? MEM_WAIT_FOR_TRUE_SET : MEM_WAIT_AND_SET;
              s.time = arg.setDuration();
              break;
            }
            default:
              s.off = true;
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
              case CMD.FLAP_LIMB_SEGMENT:
                this._flapSeg(biot, s, isTrue, false);
                break;
              case CMD.FLAP_LIMB_TYPE_SEGMENT:
                this._flapSeg(biot, s, isTrue, true);
                break;
              case CMD.MOVE_LIMB_SEGMENT:
                if (isTrue) {
                  if (s.applied < s.maxDegrees) s.applied += biot.moveLimbSegment(s.nSegment, s.nLimb, Math.min(s.rate, s.maxDegrees - s.applied));
                } else if (s.applied > 0) s.applied += biot.moveLimbSegment(s.nSegment, s.nLimb, -Math.min(s.rate, s.applied));
                break;
              case CMD.MOVE_LIMB_SEGMENTS:
                if (isTrue) {
                  if (s.applied < s.maxDegrees) s.applied += biot.moveLimbSegments(s.nLimb, Math.min(s.rate, s.maxDegrees - s.applied));
                } else if (s.applied > 0) s.applied += biot.moveLimbSegments(s.nLimb, -Math.min(s.rate, s.applied));
                break;
              case CMD.MOVE_LIMB_TYPE_SEGMENT:
                if (isTrue) {
                  if (s.applied < s.maxDegrees) s.applied += biot.moveLimbTypeSegment(s.nSegment, s.nLimbType, Math.min(s.rate, s.maxDegrees - s.applied));
                } else if (s.applied > 0) s.applied += biot.moveLimbTypeSegment(s.nSegment, s.nLimbType, -Math.min(s.rate, s.applied));
                break;
              case CMD.MOVE_LIMB_TYPE_SEGMENTS:
                if (isTrue) {
                  if (s.applied < s.maxDegrees) s.applied += biot.moveLimbTypeSegments(s.nLimbType, Math.min(s.rate, s.maxDegrees - s.applied));
                } else if (s.applied > 0) s.applied += biot.moveLimbTypeSegments(s.nLimbType, -Math.min(s.rate, s.applied));
                break;
              case CMD.RETRACT_LIMB:
                if (isTrue) {
                  if (s.appliedRadius > 0) s.appliedRadius -= biot.retractLine(s.nSegment, s.nLimb, s.maxRadius);
                } else if (s.appliedRadius < s.maxRadius) s.appliedRadius += biot.extendLine(s.nSegment, s.nLimb);
                break;
              case CMD.RETRACT_LIMB_TYPE:
                if (isTrue) {
                  if (s.appliedRadius > 0) s.appliedRadius -= biot.retractLimbType(s.nSegment, s.nLimbType, s.maxRadius);
                } else if (s.appliedRadius < s.maxRadius) s.appliedRadius += biot.extendLimbType(s.nSegment, s.nLimbType);
                break;
              case CMD.MEMORY:
                this._memory(biot, arg, s, isTrue);
                break;
            }
          }
        }
        _flapSeg(biot, s, isTrue, isType) {
          const move = (rate) => isType ? biot.moveLimbTypeSegment(s.nSegment, s.nLimbType, rate) : biot.moveLimbSegment(s.nSegment, s.nLimb, rate);
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
                s.goingUp = s.applied <= -s.maxDegrees;
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
              s.time = arg.clearDuration();
              s.bSet = true;
              s.type = arg.clearAlgorithmOne() ? MEM_WAIT_FOR_FALSE_CLEAR : MEM_WAIT_AND_CLEAR;
            }
          } else {
            if (s.type === MEM_WAIT_FOR_FALSE_CLEAR && !isTrue) s.time = arg.clearDuration();
            s.time--;
            if (s.time <= 0) {
              if (arg.whatIsConsideredSet()) biot.internalState = (biot.internalState & ~arg.whichStateBit()) >>> 0;
              else biot.internalState = (biot.internalState | arg.whichStateBit()) >>> 0;
              s.time = arg.setDuration();
              s.bSet = false;
              s.type = arg.setAlgorithmOne() ? MEM_WAIT_FOR_FALSE_CLEAR : MEM_WAIT_AND_CLEAR;
            }
          }
        }
      };
      module.exports = {
        CMD,
        MAX_PRODUCT_TERMS,
        MAX_PRODUCT_SUMS,
        MAX_COMMANDS,
        MAX_COMMANDS_PER_LIMB,
        ProductTerm,
        ProductSum,
        ProductArray,
        CommandArgument,
        CommandLimbType,
        CommandArray,
        CommandLimbStore
      };
    }
  });

  // src/sim.js
  var require_sim = __commonJS({
    "src/sim.js"(exports, module) {
      "use strict";
      init_stub_node();
      var { Randomizer } = require_rng();
      var G2 = require_genotype();
      var B = require_brain();
      var {
        MAX_RATIO,
        MAX_SEGMENTS,
        MAX_SYMMETRY,
        MAX_GENES,
        MAX_LIMB_TYPES,
        GREEN_LEAF,
        BLUE_LEAF,
        RED_LEAF,
        LBLUE_LEAF,
        WHITE_LEAF,
        YELLOW_LEAF,
        MAX_LEAF,
        DIM_COLOR,
        CONTACT_IGNORE,
        CONTACT_EAT,
        CONTACT_EATEN,
        CONTACT_DESTROY,
        CONTACT_DESTROYED,
        CONTACT_DEFEND,
        CONTACT_DEFENDED,
        CONTACT_ATTACK,
        GeneTrait
      } = G2;
      var { CommandArray, CommandLimbStore } = B;
      var RADIANS = Math.PI / 180;
      var LIMIT = 2;
      var RLIMIT = 3;
      var SCALE = [0.7, 0.76, 0.84, 0.92, 1, 1.1, 1.22, 1.34, 1.48, 1.7, 1.94, 2.21, 2.47, 2.77, 3.11, 3.48, 3.9, 4.36, 4.89, 5.47];
      var MAX_COLLISIONS = 5;
      var clamp = (v, lim) => v > lim ? lim : v < -lim ? -lim : v;
      var Vector = class {
        constructor() {
          this.dx = 0;
          this.dy = 0;
          this.x = 0;
          this.y = 0;
          this.dr = 0;
          this.r = 0;
          this.drx = 0;
          this.dry = 0;
          this.mass = 0;
        }
        setDeltaX(v) {
          this.dx = clamp(v, LIMIT);
        }
        setDeltaY(v) {
          this.dy = clamp(v, LIMIT);
        }
        setDeltaRotate(v) {
          this.dr = clamp(v, RLIMIT);
        }
        adjustDeltaX(v) {
          this.dx += v;
        }
        adjustDeltaY(v) {
          this.dy += v;
        }
        accelerateX(a) {
          this.dx = clamp(this.dx + a / this.mass, LIMIT);
        }
        accelerateY(a) {
          this.dy = clamp(this.dy + a / this.mass, LIMIT);
        }
        accelerateRotation(a) {
          this.dr = clamp(this.dr + a / this.mass, RLIMIT);
        }
        invertDeltaX() {
          this.dx = -this.dx;
        }
        invertDeltaY() {
          this.dy = -this.dy;
        }
        setMass(m) {
          this.mass = m;
        }
        addMass(m) {
          this.mass += m;
        }
        setX(v) {
          this.x = v;
        }
        setY(v) {
          this.y = v;
        }
        setRotate(v) {
          this.r = v;
        }
        getRotate() {
          return Math.trunc(this.r);
        }
        distance(x1, y1) {
          return Math.sqrt(x1 * x1 + y1 * y1);
        }
        collisionResult(emass, DX, eDX) {
          return ((this.mass - emass) * DX + 2 * emass * eDX) / (this.mass + emass);
        }
        rotationComponent(x1, y1, x2, y2) {
          const d = this.distance(x1, y1);
          return d ? (y1 * x2 - x1 * y2) / d : 0;
        }
        motionComponent(vec, rot) {
          return Math.abs(Math.abs(vec) - Math.abs(rot)) < 1e-4 ? 0 : Math.sqrt(vec * vec - rot * rot);
        }
        fraction(motion, x1, center) {
          return motion * x1 / center;
        }
        VectorR(radius) {
          return RADIANS * radius * this.dr;
        }
        deltaYr(Vr, deltaX, radius) {
          return radius !== 0 ? Vr * deltaX / radius : 0;
        }
        deltaXr(Vr, deltaY, radius) {
          return radius !== 0 ? -Vr * deltaY / radius : 0;
        }
        rotatedDelta(deltaX, deltaY, radius) {
          const Vr = this.VectorR(radius);
          return [this.dx + this.deltaXr(Vr, deltaY, radius), this.dy + this.deltaYr(Vr, deltaX, radius)];
        }
        tryRotate(origin, center) {
          const dcx = origin.x - center.x, dcy = origin.y - center.y;
          const deltaC = this.distance(dcx, dcy);
          const baseAngle = Math.atan2(dcy, dcx);
          const deltaR = RADIANS * this.dr + baseAngle;
          this.drx = center.x + deltaC * Math.cos(deltaR) - origin.x;
          this.dry = center.y + deltaC * Math.sin(deltaR) - origin.y;
          return Math.trunc(this.r + this.dr) - Math.trunc(this.r);
        }
        tryStepX() {
          return Math.trunc(this.x + this.dx + this.drx) - Math.trunc(this.x);
        }
        tryStepY() {
          return Math.trunc(this.y + this.dy + this.dry) - Math.trunc(this.y);
        }
        makeStep() {
          this.x += this.dx + this.drx;
          this.y += this.dy + this.dry;
          this.r += this.dr;
          if (this.r >= 360) this.r -= 360;
          else if (this.r <= -360) this.r += 360;
        }
      };
      function segIntersect(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {
        const d1x = ax2 - ax1, d1y = ay2 - ay1, d2x = bx2 - bx1, d2y = by2 - by1;
        const denom = d1x * d2y - d1y * d2x;
        if (denom === 0) return null;
        const t = ((bx1 - ax1) * d2y - (by1 - ay1) * d2x) / denom;
        const u = ((bx1 - ax1) * d1y - (by1 - ay1) * d1x) / denom;
        if (t < 0 || t > 1 || u < 0 || u > 1) return null;
        return [Math.round(ax1 + t * d1x), Math.round(ay1 + t * d1y)];
      }
      function rectsTouch(a, b) {
        return !(a.right < b.left || b.right < a.left || a.bottom < b.top || b.bottom < a.top);
      }
      var GROW = 0;
      var RECALCULATE = 1;
      var REFORM = 2;
      var NORMAL = 3;
      var VOWELS = "aeiouy";
      var CONS = "bcdfghjklmnpqrstvwx";
      var Biot = class _Biot {
        constructor(env2) {
          this.env = env2;
          this.trait = new GeneTrait();
          this.trait2 = new GeneTrait();
          this.commandArray = new CommandArray();
          this.commandArray2 = new CommandArray();
          this.vector = new Vector();
          this.stores = [];
          for (let i = 0; i < MAX_SYMMETRY; i++) this.stores.push(new CommandLimbStore());
          this.origin = { x: 0, y: 0 };
          this.startPt = [];
          this.stopPt = [];
          for (let i = 0; i < MAX_GENES; i++) {
            this.startPt.push({ x: 0, y: 0 });
            this.stopPt.push({ x: 0, y: 0 });
          }
          this.state = new Int16Array(MAX_GENES);
          this.distance = new Int16Array(MAX_GENES);
          this.nType = new Uint8Array(MAX_GENES);
          this.angle = new Int16Array(MAX_GENES);
          this.angleDrawn = new Int16Array(MAX_GENES);
          this.angleLimbType = new Int16Array(MAX_LIMB_TYPES);
          this.angleLimbTypeDrawn = new Int16Array(MAX_LIMB_TYPES);
          this.angleLimb = new Int16Array(MAX_SYMMETRY);
          this.angleLimbDrawn = new Int16Array(MAX_SYMMETRY);
          this.angleLimbTypeSegment = Array.from({ length: MAX_LIMB_TYPES }, () => new Int16Array(MAX_SEGMENTS));
          this.angleLimbTypeSegmentDrawn = Array.from({ length: MAX_LIMB_TYPES }, () => new Int16Array(MAX_SEGMENTS));
          this.retractSegment = new Int16Array(MAX_SYMMETRY).fill(-1);
          this.retractRadius = new Int16Array(MAX_SYMMETRY);
          this.retractDrawn = new Int16Array(MAX_SYMMETRY);
          this.colorDistance = new Int32Array(WHITE_LEAF + 1);
          this.collider = [];
          for (let i = 0; i < MAX_COLLISIONS; i++) this.collider.push({ id: -1, hits: 0, seen: -1 });
          this.geneNo = new Uint8Array(MAX_GENES);
          this.lineNo = new Uint8Array(MAX_GENES);
          this.clearSettings();
        }
        clearSettings() {
          this.bDie = false;
          this.genes = MAX_SYMMETRY;
          this.genes2 = 0;
          this.fatherId = 0;
          this.mateId = 0;
          this.motherId = 0;
          this.generation = 0;
          this.age = 0;
          this.maxAge = 0;
          this.nSick = 0;
          this.newType = -2;
          this.ratio = 1;
          this.energy = 0;
          this.adultBaseEnergy = 0;
          this.childBaseEnergy = 0;
          this.stepEnergy = 0;
          this.totalDistance = 0;
          this.turnBenefit = 0;
          this.bInjured = false;
          this.bRedraw = false;
          this.internalState = 0;
          this.max_genes = 1;
          this.left = this.top = this.right = this.bottom = 0;
          this.leftX = this.topY = this.rightX = this.bottomY = 0;
          this.bonusRatio = 0;
          this.id = 0;
          this.name = "";
          this.angle.fill(0);
          this.angleDrawn.fill(0);
          this.angleLimbType.fill(0);
          this.angleLimbTypeDrawn.fill(0);
          this.angleLimb.fill(0);
          this.angleLimbDrawn.fill(0);
          for (let lt = 0; lt < MAX_LIMB_TYPES; lt++) {
            this.angleLimbTypeSegment[lt].fill(0);
            this.angleLimbTypeSegmentDrawn[lt].fill(0);
          }
          this.retractSegment.fill(-1);
          this.retractRadius.fill(0);
          this.retractDrawn.fill(0);
          this.state.fill(0);
          for (const c of this.collider) {
            c.id = -1;
            c.hits = 0;
            c.seen = -1;
          }
          let nPeno = 0;
          for (let g = 0; g < MAX_SEGMENTS; g++) for (let l = 0; l < MAX_SYMMETRY; l++) {
            this.geneNo[nPeno] = g;
            this.lineNo[nPeno++] = l;
          }
        }
        makeName(rand) {
          let n = "";
          const max = 1 + rand.Integer(3);
          for (let i = 0; i < max; i++) {
            if (rand.Bool()) {
              n += VOWELS[rand.Integer(6)];
              n += CONS[rand.Integer(6)];
            } else {
              n += CONS[rand.Integer(6)];
              n += VOWELS[rand.Integer(6)];
            }
          }
          if (rand.Bool()) n += VOWELS[rand.Integer(6)];
          return n.charAt(0).toUpperCase() + n.slice(1);
        }
        randomCreate(nArms, nTypes, nSegs) {
          const rand = new Randomizer();
          this.max_genes = MAX_GENES;
          this.genes = MAX_GENES;
          this.trait.randomize(nArms, nTypes, nSegs, rand);
          this.commandArray.randomize(rand);
          this.motherId = 0;
          this.vector.setDeltaX(rand.Float());
          this.vector.setDeltaY(rand.Float());
          this.vector.setDeltaRotate(0);
          this.initialize(true);
          this.placeRandom();
          this.setBonus();
          this.name = this.makeName(rand);
        }
        initialize(bRandom) {
          this.adultBaseEnergy = this.symmetric(this.trait.getAdultRatio()) * this.env.options.startEnergy;
          if (bRandom || this.energy <= 0) this.energy = this.adultBaseEnergy;
          this.setRatio();
          this.totalDistance = this.symmetric(this.ratio);
          this.childBaseEnergy = this.totalDistance * this.env.options.startEnergy;
          this.id = this.env.getID();
          this.maxAge = this.trait.getMaxAge();
          for (let i = 0; i < MAX_GENES; i++) this.state[i] = this.distance[i];
          for (let i = 0; i < MAX_SYMMETRY; i++) this.stores[i].initialize(this.trait.getLineTypeIndex(i % MAX_LIMB_TYPES) !== void 0 ? this.trait.getLineTypeIndex(Math.min(i, MAX_SYMMETRY - 1)) : 0, i, this);
          for (let i = 0; i < MAX_SYMMETRY; i++) this.stores[i].initialize(this.trait.getLineTypeIndex(i), i, this);
        }
        setRatio() {
          if (this.energy > 0) {
            this.ratio = Math.trunc(2 * this.adultBaseEnergy / this.energy) + this.trait.getAdultRatio() - 1;
            if (this.ratio > MAX_RATIO) this.ratio = MAX_RATIO;
            if (this.ratio < this.trait.getAdultRatio()) this.ratio = this.trait.getAdultRatio();
          } else this.ratio = MAX_RATIO;
          this.stepEnergy = Math.trunc(2 * this.adultBaseEnergy / this.baseRatio());
        }
        baseRatio() {
          return this.ratio - (this.trait.getAdultRatio() - 1);
        }
        setBonus() {
          this.bonusRatio = this.area() / 4e4;
        }
        area() {
          return this.width() * this.height();
        }
        width() {
          return this.right - this.left;
        }
        height() {
          return this.bottom - this.top;
        }
        centerX() {
          return this.left + this.right >> 1;
        }
        centerY() {
          return this.top + this.bottom >> 1;
        }
        setScreenRect() {
          this.left = this.origin.x + this.leftX;
          this.right = this.origin.x + this.rightX;
          this.top = this.origin.y + this.topY;
          this.bottom = this.origin.y + this.bottomY;
        }
        percentEnergy() {
          const f = 100 * this.energy / (this.adultBaseEnergy * 2);
          return f > 100 ? 100 : f;
        }
        percentColor(color) {
          return this.colorDistance[color] / this.totalDistance;
        }
        x1(g) {
          return this.startPt[g].x + this.origin.x;
        }
        y1(g) {
          return this.startPt[g].y + this.origin.y;
        }
        x2(g) {
          return this.stopPt[g].x + this.origin.x;
        }
        y2(g) {
          return this.stopPt[g].y + this.origin.y;
        }
        isSegmentMissing(nPeno) {
          return this.state[nPeno] <= 0;
        }
        translate(radius, xy, degrees, aRatio) {
          radius /= SCALE[aRatio - 1];
          if (radius < 1.42) radius = 1.42;
          const theta = degrees * RADIANS;
          xy.x += radius * Math.cos(theta);
          xy.y += radius * Math.sin(theta);
          return Math.trunc(radius + 0.5);
        }
        symmetric(aRatio) {
          let dist = 0;
          for (let i = 0; i <= WHITE_LEAF; i++) this.colorDistance[i] = 0;
          this.leftX = this.topY = this.rightX = this.bottomY = 0;
          this.turnBenefit = 0;
          this.bRedraw = false;
          this.distance.fill(0);
          for (let i = 0; i < MAX_GENES; i++) {
            this.stopPt[i].x = 0;
            this.stopPt[i].y = 0;
            this.startPt[i].x = 0;
            this.startPt[i].y = 0;
          }
          this.nType.fill(0);
          const xy = { x: 0, y: 0 };
          for (let nLimb = 0; nLimb < this.trait.getLines(); nLimb++) {
            let nLastGene = -1;
            const lineType = this.trait.getLineTypeIndex(nLimb);
            const nTypeAngle = this.angleLimbType[lineType];
            const nLineAngle = this.angleLimb[nLimb];
            this.angleLimbTypeDrawn[lineType] = nTypeAngle;
            this.angleLimbDrawn[nLimb] = nLineAngle;
            xy.x = 0;
            xy.y = 0;
            for (let nGene = 0; nGene < MAX_SEGMENTS; nGene++) {
              this.angleLimbTypeSegmentDrawn[lineType][nGene] = this.angleLimbTypeSegment[lineType][nGene];
              const segment = this.trait.getSegment(nLimb, nGene);
              if (!segment.isVisible()) continue;
              const nPeno = nLimb + nGene * MAX_SYMMETRY;
              this.angleDrawn[nPeno] = this.angle[nPeno];
              if (nLastGene < 0) {
                this.startPt[nPeno].x = 0;
                this.startPt[nPeno].y = 0;
              } else {
                if (segment.startSegment < nGene && this.trait.getSegment(nLimb, segment.startSegment).isVisible()) {
                  const p = this.stopPt[nPeno - (nGene - segment.startSegment) * MAX_SYMMETRY];
                  this.startPt[nPeno].x = p.x;
                  this.startPt[nPeno].y = p.y;
                } else {
                  const p = this.stopPt[nPeno - (nGene - nLastGene) * MAX_SYMMETRY];
                  this.startPt[nPeno].x = p.x;
                  this.startPt[nPeno].y = p.y;
                }
              }
              nLastGene = nGene;
              let radius = segment.radius;
              if (nGene === this.retractSegment[nLimb]) {
                radius -= this.retractRadius[nLimb];
                this.retractDrawn[nLimb] = this.retractRadius[nLimb];
              }
              this.distance[nPeno] = this.translate(
                segment.radius,
                xy,
                this.trait.angle[nLimb][nGene] + this.vector.getRotate() + this.angleDrawn[nPeno] + this.trait.getCompressedToggle(nTypeAngle, nLimb, nGene) + nLineAngle + this.trait.getCompressedToggle(this.angleLimbTypeSegment[lineType][nGene], nLimb, nGene),
                aRatio
              );
              this.stopPt[nPeno].x = this.startPt[nPeno].x + Math.trunc(xy.x);
              this.stopPt[nPeno].y = this.startPt[nPeno].y + Math.trunc(xy.y);
              xy.x -= Math.trunc(xy.x);
              xy.y -= Math.trunc(xy.y);
              if (this.stopPt[nPeno].x < this.leftX) this.leftX = this.stopPt[nPeno].x;
              if (this.stopPt[nPeno].x > this.rightX) this.rightX = this.stopPt[nPeno].x;
              if (this.stopPt[nPeno].y < this.topY) this.topY = this.stopPt[nPeno].y;
              if (this.stopPt[nPeno].y > this.bottomY) this.bottomY = this.stopPt[nPeno].y;
              dist += this.distance[nPeno];
              let t = segment.color[this.trait.isMale() ? 1 : 0];
              if (t === WHITE_LEAF && (!this.trait.isMale() || this.trait.isAsexual())) t = GREEN_LEAF;
              this.nType[nPeno] = t;
              if (t === GREEN_LEAF) this.turnBenefit += this.env.options.leafEnergy * this.distance[nPeno];
              this.colorDistance[t] += this.distance[nPeno];
            }
          }
          this.vector.setMass(0);
          for (let i = GREEN_LEAF; i <= WHITE_LEAF; i++)
            this.vector.addMass(this.colorDistance[i] * this.env.options.leafMass[i]);
          if (this.vector.mass <= 0) this.vector.mass = 1;
          return dist;
        }
        placeRandom() {
          const rand = new Randomizer();
          const env2 = this.env;
          for (let i = 0; i < 24; i++) {
            const w = Math.max(1, env2.width + this.leftX - this.rightX);
            const h = Math.max(1, env2.height + this.topY - this.bottomY);
            this.origin.x = rand.Integer(w) - this.leftX;
            this.origin.y = rand.Integer(h) - this.topY;
            this.setScreenRect();
            if (!env2.hitCheck(this)) break;
          }
          this.vector.setX(this.origin.x);
          this.vector.setY(this.origin.y);
        }
        placeNear(parent) {
          const rand = new Randomizer();
          const side = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
          let nPos = rand.Integer(8);
          for (let n = 0; n < 8; n++) {
            nPos = nPos + 1 & 7;
            this.origin.x = parent.origin.x + parent.width() * side[nPos][0];
            this.origin.y = parent.origin.y + parent.height() * side[nPos][1];
            this.setScreenRect();
            if (this.left >= 0 && this.top >= 0 && this.right < this.env.width && this.bottom < this.env.height) {
              if (!this.env.hitCheck(this)) {
                if (parent.trait.getDisperseChildren()) {
                  this.vector.setDeltaX(side[nPos][0] * Math.abs(parent.vector.dx));
                  this.vector.setDeltaY(side[nPos][1] * Math.abs(parent.vector.dy));
                } else {
                  this.vector.setDeltaX(parent.vector.dx);
                  this.vector.setDeltaY(parent.vector.dy);
                }
                this.vector.setX(this.origin.x);
                this.vector.setY(this.origin.y);
                return true;
              }
            }
          }
          return false;
        }
        copyFromParent(copyMe) {
          this.clearSettings();
          const rand = new Randomizer();
          this.commandArray.copyFrom(copyMe.commandArray);
          this.trait.copyFrom(copyMe.trait);
          this.name = copyMe.name;
          this.generation = copyMe.generation + 1;
          if (copyMe.genes2) {
            this.trait.crossover(copyMe.trait2, rand);
            this.commandArray.crossover(copyMe.commandArray2, rand);
            if (rand.Bool()) this.name = copyMe.fatherName || this.name;
          }
          this.trait.mutate(this.env.options.chance, rand);
          this.commandArray.mutate(this.env.options.chance, rand);
          this.max_genes = MAX_GENES;
          this.origin.x = copyMe.origin.x;
          this.origin.y = copyMe.origin.y;
          this.energy = Math.trunc(copyMe.adultBaseEnergy / copyMe.trait.getNumberOfChildren());
          this.motherId = copyMe.id;
          this.fatherId = copyMe.mateId;
          this.trait.pickSex(rand);
          this.initialize(false);
        }
        copyGenes(enemy) {
          this.trait2.copyFrom(enemy.trait);
          this.commandArray2.copyFrom(enemy.commandArray);
          this.genes2 = enemy.genes;
          this.fatherName = enemy.name;
        }
        // ---- limb movement API (called by brain) ----
        moveLimbTypeSegment(nSegment, nLimbType, nRate) {
          const maxRate = 3;
          const delta = this.angleLimbTypeSegment[nLimbType][nSegment] - this.angleLimbTypeSegmentDrawn[nLimbType][nSegment];
          if (nRate < 0) {
            if (delta <= -maxRate) return 0;
            nRate = Math.max(nRate, -maxRate - delta);
          } else {
            if (delta >= maxRate) return 0;
            nRate = Math.min(nRate, maxRate - delta);
          }
          this.angleLimbTypeSegment[nLimbType][nSegment] += nRate;
          if (delta + nRate >= maxRate || delta + nRate <= -maxRate) this.bRedraw = true;
          return nRate;
        }
        moveLimbTypeSegments(nLimbType, nRate) {
          const maxRate = 3;
          const delta = this.angleLimbType[nLimbType] - this.angleLimbTypeDrawn[nLimbType];
          if (nRate < 0) {
            if (delta <= -maxRate) return 0;
            nRate = Math.max(nRate, -maxRate - delta);
          } else {
            if (delta >= maxRate) return 0;
            nRate = Math.min(nRate, maxRate - delta);
          }
          this.angleLimbType[nLimbType] += nRate;
          if (delta + nRate >= maxRate || delta + nRate <= -maxRate) this.bRedraw = true;
          return nRate;
        }
        moveLimbSegments(nLimb, nRate) {
          const maxRate = 3;
          const delta = this.angleLimb[nLimb] - this.angleLimbDrawn[nLimb];
          if (nRate < 0) {
            if (delta <= -maxRate) return 0;
            nRate = Math.max(nRate, -maxRate - delta);
          } else {
            if (delta >= maxRate) return 0;
            nRate = Math.min(nRate, maxRate - delta);
          }
          this.angleLimb[nLimb] += nRate;
          if (delta + nRate >= maxRate || delta + nRate <= -maxRate) this.bRedraw = true;
          return nRate;
        }
        moveLimbSegment(nSegment, nLimb, nRate) {
          const maxRate = 3;
          const nPeno = nLimb + nSegment * MAX_SYMMETRY;
          const delta = this.angle[nPeno] - this.angleDrawn[nPeno];
          if (nRate < 0) {
            if (delta <= -maxRate) return 0;
            nRate = Math.max(nRate, -maxRate - delta);
          } else {
            if (delta >= maxRate) return 0;
            nRate = Math.min(nRate, maxRate - delta);
          }
          this.angle[nPeno] += nRate;
          if (delta + nRate >= maxRate || delta + nRate <= -maxRate) this.bRedraw = true;
          return nRate;
        }
        retractLine(nSegment, nLimb, maxRadius) {
          if (this.retractDrawn[nLimb] === this.retractRadius[nLimb] && this.retractDrawn[nLimb] < maxRadius) {
            this.retractSegment[nLimb] = nSegment;
            this.retractRadius[nLimb] += 1;
            this.bRedraw = true;
            return 1;
          }
          return 0;
        }
        extendLine(nSegment, nLimb) {
          if (this.retractDrawn[nLimb] === this.retractRadius[nLimb] && this.retractDrawn[nLimb] > 0) {
            this.retractSegment[nLimb] = nSegment;
            this.retractRadius[nLimb] -= 1;
            this.bRedraw = true;
            return 1;
          }
          return 0;
        }
        retractLimbType(nSegment, nLimbType, maxRadius) {
          let one = false;
          for (let i = 0; i < this.trait.getLines(); i++)
            if (nLimbType === this.trait.getLineTypeIndex(i)) {
              if (this.retractDrawn[i] !== this.retractRadius[i] || this.retractDrawn[i] >= maxRadius) return 0;
              one = true;
            }
          if (!one) return 0;
          for (let i = 0; i < this.trait.getLines(); i++)
            if (nLimbType === this.trait.getLineTypeIndex(i)) {
              this.retractSegment[i] = nSegment;
              this.retractRadius[i] += 1;
            }
          this.bRedraw = true;
          return 1;
        }
        extendLimbType(nSegment, nLimbType) {
          let one = false;
          for (let i = 0; i < this.trait.getLines(); i++)
            if (nLimbType === this.trait.getLineTypeIndex(i)) {
              if (this.retractDrawn[i] !== this.retractRadius[i] || this.retractDrawn[i] <= 0) return 0;
              one = true;
            }
          if (!one) return 0;
          for (let i = 0; i < this.trait.getLines(); i++)
            if (nLimbType === this.trait.getLineTypeIndex(i)) {
              this.retractSegment[i] = nSegment;
              this.retractRadius[i] -= 1;
            }
          this.bRedraw = true;
          return 1;
        }
        flap(nPeno) {
          if (this.isSegmentMissing(nPeno)) return;
          let Vx = this.startPt[nPeno].x - this.stopPt[nPeno].x;
          let Vy = this.startPt[nPeno].y - this.stopPt[nPeno].y;
          const dr = this.vector.rotationComponent(
            this.startPt[nPeno].x,
            this.startPt[nPeno].y,
            this.startPt[nPeno].x + Vx,
            this.startPt[nPeno].y + Vy
          );
          const radius = this.vector.distance(this.startPt[nPeno].x, this.startPt[nPeno].y);
          if (dr !== 0) {
            const dv = this.vector.motionComponent(this.vector.distance(Vx, Vy), dr);
            Vx = -this.vector.fraction(dv, this.startPt[nPeno].x, radius);
            Vy = -this.vector.fraction(dv, this.startPt[nPeno].y, radius);
          }
          this.vector.accelerateX(Vx * 20);
          this.vector.accelerateY(Vy * 20);
          this.vector.accelerateRotation(dr * 10);
        }
        // ---- interactions ----
        areSiblings(e) {
          return this.motherId === e.motherId && this.motherId !== 0;
        }
        oneIsChild(e) {
          return this.id === e.motherId || e.id === this.motherId;
        }
        siblingsAttack(e) {
          return this.trait.attackSiblings || e.trait.attackSiblings;
        }
        attackChildren(e) {
          return this.trait.attackChildren || e.trait.attackChildren;
        }
        speciesMatch(enemySpecies) {
          const d = Math.abs(enemySpecies - this.trait.getSpecies());
          return d <= 1 || d >= 15;
        }
        lengthLoss(nPeno, delta) {
          let loss = Math.min(delta, this.state[nPeno]);
          if (loss === this.state[nPeno]) {
            let p = nPeno + MAX_SYMMETRY;
            while (p < this.genes) {
              if (this.state[p] > 0) loss += this.state[p];
              p += MAX_SYMMETRY;
            }
          }
          return loss;
        }
        adjustState(nPeno, delta) {
          if (delta > this.state[nPeno]) delta = this.state[nPeno];
          this.state[nPeno] -= delta;
          this.totalDistance -= delta;
          this.bInjured = true;
          if (this.nType[nPeno] === GREEN_LEAF) this.turnBenefit -= delta * this.env.options.leafEnergy;
          this.colorDistance[this.nType[nPeno]] -= delta;
          if (this.state[nPeno] <= 0) {
            this.state[nPeno] = -this.distance[nPeno];
            let p = nPeno + MAX_SYMMETRY;
            while (p < this.max_genes) {
              if (this.state[p] > 0) {
                if (this.nType[p] === GREEN_LEAF) this.turnBenefit -= this.state[p] * this.env.options.leafEnergy;
                this.totalDistance -= this.state[p];
                this.colorDistance[this.nType[p]] -= this.state[p];
              }
              this.state[p] = -this.distance[p];
              p += MAX_SYMMETRY;
            }
            return true;
          }
          return false;
        }
        contactLine(enemy, nEnemyPeno, nPeno, out) {
          out.delta = 0;
          out.deltaEnergy = 0;
          if (enemy.energy <= 0 || this.energy <= 0 || this.areSiblings(enemy) && !this.siblingsAttack(enemy) || this.oneIsChild(enemy) && !this.attackChildren(enemy)) return false;
          const type = this.nType[nPeno], enemyType = enemy.nType[nEnemyPeno];
          if (type === WHITE_LEAF && !enemy.trait.isMale() && enemy.ratio === enemy.trait.getAdultRatio() && this.speciesMatch(enemy.trait.getSpecies())) {
            enemy.copyGenes(this);
            enemy.mateId = this.id;
            enemy.newType = type;
            this.env.emit("mate");
          }
          switch (this.env.options.leafContact[type][enemyType]) {
            case CONTACT_IGNORE:
              return false;
            case CONTACT_EAT: {
              let delta = this.lengthLoss(nPeno, Math.min(enemy.state[nEnemyPeno], this.state[nPeno]));
              out.deltaEnergy = Math.trunc(this.percentColor(RED_LEAF) * (delta * 2) * (Math.trunc(enemy.energy / enemy.totalDistance) + 1));
              if (out.deltaEnergy > enemy.energy) out.deltaEnergy = enemy.energy;
              out.delta = 0;
              break;
            }
            case CONTACT_EATEN: {
              out.delta = this.lengthLoss(nPeno, Math.min(enemy.state[nEnemyPeno], this.state[nPeno]));
              let de = out.delta * 2 * (Math.trunc(this.energy / this.totalDistance) + 1);
              if (de > this.energy) de = this.energy;
              out.deltaEnergy = -de;
              break;
            }
            case CONTACT_DESTROY:
              break;
            case CONTACT_ATTACK: {
              out.delta = this.lengthLoss(nPeno, Math.min(enemy.state[nEnemyPeno], this.state[nPeno]));
              const totalRed = this.colorDistance[RED_LEAF] + enemy.colorDistance[RED_LEAF];
              const pd = totalRed !== 0 ? (this.colorDistance[RED_LEAF] - enemy.colorDistance[RED_LEAF]) / totalRed : 0;
              if (pd > 0) out.deltaEnergy = Math.trunc(pd * (out.delta * 2 * Math.trunc(enemy.energy / enemy.totalDistance) + 1));
              else out.deltaEnergy = Math.trunc(pd * (out.delta * 2 * Math.trunc(this.energy / this.totalDistance) + 1));
              break;
            }
            case CONTACT_DEFEND:
              out.delta = this.lengthLoss(nPeno, Math.min(enemy.state[nEnemyPeno] + 1 >> 1, this.state[nPeno]));
              break;
            case CONTACT_DEFENDED:
              out.delta = this.lengthLoss(nPeno, Math.min(enemy.state[nEnemyPeno] << 1, this.state[nPeno]));
              break;
            case CONTACT_DESTROYED:
              out.delta = this.lengthLoss(nPeno, Math.min(enemy.state[nEnemyPeno], this.state[nPeno]));
              break;
          }
          return true;
        }
        contacter(enemy, dx, dy, pt) {
          let nContacts = 0;
          const eRect = { left: enemy.left, top: enemy.top, right: enemy.right, bottom: enemy.bottom };
          for (let i = 0; i < this.genes; i++) {
            if (this.state[i] <= 0) continue;
            const lx1 = this.x1(i), ly1 = this.y1(i), lx2 = this.x2(i), ly2 = this.y2(i);
            const lineRect = { left: Math.min(lx1, lx2), right: Math.max(lx1, lx2), top: Math.min(ly1, ly2), bottom: Math.max(ly1, ly2) };
            if (!rectsTouch(lineRect, eRect)) continue;
            for (let j = 0; j < enemy.genes; j++) {
              if (enemy.state[j] <= 0 || this.state[i] <= 0) continue;
              const ex1 = enemy.x1(j), ey1 = enemy.y1(j), ex2 = enemy.x2(j), ey2 = enemy.y2(j);
              const eLineRect = { left: Math.min(ex1, ex2), right: Math.max(ex1, ex2), top: Math.min(ey1, ey2), bottom: Math.max(ey1, ey2) };
              if (!rectsTouch(lineRect, eLineRect)) continue;
              const hit = segIntersect(lx1 + dx, ly1 + dy, lx2 + dx, ly2 + dy, ex1, ey1, ex2, ey2);
              if (!hit) continue;
              const mine = {}, theirs = {};
              let bInteract = this.contactLine(enemy, j, i, mine);
              bInteract = enemy.contactLine(this, i, j, theirs) || bInteract;
              if (bInteract) {
                enemy.energy += theirs.deltaEnergy;
                let bNoContact = enemy.adjustState(j, theirs.delta);
                enemy.newType = this.env.options.newType[enemy.nType[j]];
                this.energy += mine.deltaEnergy;
                bNoContact = this.adjustState(i, mine.delta) || bNoContact;
                this.newType = this.env.options.newType[this.nType[i]];
                if (bNoContact) nContacts--;
              }
              if (this.nSick) {
                if (!enemy.nSick) enemy.nSick = this.env.options.nSick;
              } else if (enemy.nSick) this.nSick = this.env.options.nSick;
              nContacts++;
              pt.x = hit[0];
              pt.y = hit[1];
            }
          }
          return nContacts;
        }
        wallBounce(x, y) {
          const deltaX = x - this.centerX(), deltaY = y - this.centerY();
          const radius = this.vector.distance(deltaX, deltaY);
          let [dx, dy] = this.vector.rotatedDelta(deltaX, deltaY, radius);
          const dr = this.vector.rotationComponent(deltaX, deltaY, deltaX + dx, deltaY + dy);
          if (dr !== 0) {
            const dv = this.vector.motionComponent(this.vector.distance(dx, dy), dr);
            dx = this.vector.fraction(dv, deltaX, radius);
            dy = this.vector.fraction(dv, deltaY, radius);
          }
          this.vector.setDeltaX(-dx);
          this.vector.setDeltaY(-dy);
          this.vector.setDeltaRotate(-dr);
        }
        validateBorderMovement() {
          let dx = this.vector.dx, dy = this.vector.dy;
          const env2 = this.env;
          if (this.top <= 0) {
            if (dy <= 0) dy = -dy;
            if (dy < 0.1) dy = 0.1;
          }
          if (this.bottom >= env2.height) {
            if (dy >= 0) dy = -dy;
            if (dy > -0.1) dy = -0.1;
          }
          if (this.left <= 0) {
            if (dx <= 0) dx = -dx;
            if (dx < 0.1) dx = 0.1;
          }
          if (this.right >= env2.width) {
            if (dx >= 0) dx = -dx;
            if (dx > -0.1) dx = -0.1;
          }
          this.vector.setDeltaX(dx);
          this.vector.setDeltaY(dy);
        }
        motion(deltaX, deltaY, Vx, Vy, radius) {
          let dr = this.vector.rotationComponent(deltaX, deltaY, deltaX + Vx, deltaY + Vy);
          if (dr !== 0) {
            const dv = this.vector.motionComponent(this.vector.distance(Vx, Vy), dr);
            Vx = this.vector.fraction(dv, Math.trunc(deltaX), radius);
            Vy = this.vector.fraction(dv, Math.trunc(deltaY), radius);
            dr = -dr;
          }
          this.vector.setDeltaX(Vx);
          this.vector.setDeltaY(Vy);
          this.vector.setDeltaRotate(dr);
        }
        moveBiot(x, y) {
          this.origin.x += x;
          this.origin.y += y;
          this.left += x;
          this.right += x;
          this.top += y;
          this.bottom += y;
        }
        findCollision(id) {
          for (let i = 0; i < MAX_COLLISIONS; i++) if (this.collider[i].id === id) return i;
          return MAX_COLLISIONS;
        }
        addCollision() {
          for (let i = 0; i < MAX_COLLISIONS; i++) if (this.collider[i].id === -1) return i;
          return MAX_COLLISIONS;
        }
        removeCollisions(age) {
          for (const c of this.collider) if (c.seen !== (age & 32767)) c.id = -1;
        }
        checkReproduction() {
          if (this.energy < this.adultBaseEnergy * 2) return;
          if (this.genes2 > 0 && !this.trait.isMale() || this.trait.isAsexual()) {
            const children = this.trait.getNumberOfChildren();
            this.energy = this.adultBaseEnergy;
            let born = 0;
            for (let i = 0; i < children; i++) {
              const nBiot = new _Biot(this.env);
              this.env.stats.births++;
              nBiot.copyFromParent(this);
              if (!nBiot.placeNear(this)) {
                this.env.stats.deaths++;
                break;
              }
              this.env.addBiot(nBiot);
              nBiot.setBonus();
              born++;
            }
            if (born > 0) {
              this.genes2 = 0;
              this.env.emit("birth");
            }
          }
        }
        move() {
          this.age++;
          const center = { x: this.centerX(), y: this.centerY() };
          let dr = this.vector.tryRotate(this.origin, center);
          let dx = this.vector.tryStepX();
          let dy = this.vector.tryStepY();
          this.moveBiot(dx, dy);
          const env2 = this.env;
          if (this.left < 0 || this.top < 0 || this.right >= env2.width || this.bottom >= env2.height) {
            let bounced = false;
            for (let i = 0; i < this.genes && !bounced; i++) {
              if (this.state[i] <= 0) continue;
              const sx1 = this.x1(i), sy1 = this.y1(i), sx2 = this.x2(i), sy2 = this.y2(i);
              const minX = Math.min(sx1, sx2), maxX = Math.max(sx1, sx2), minY = Math.min(sy1, sy2), maxY = Math.max(sy1, sy2);
              if (minX < 0 || minY < 0 || maxX >= env2.width || maxY >= env2.height) {
                const x = Math.max(0, Math.min(env2.width - 1, sx2));
                const y = Math.max(0, Math.min(env2.height - 1, sy2));
                this.wallBounce(x, y);
                this.moveBiot(-dx, -dy);
                dr = this.vector.tryRotate(this.origin, center);
                dx = this.vector.tryStepX();
                dy = this.vector.tryStepY();
                this.moveBiot(dx, dy);
                bounced = true;
              }
            }
            if (!bounced) {
              this.validateBorderMovement();
              this.moveBiot(-dx, -dy);
              dr = this.vector.tryRotate(this.origin, center);
              dx = this.vector.tryStepX();
              dy = this.vector.tryStepY();
              this.moveBiot(dx, dy);
            }
            if (this.left < 0) this.moveBiot(-this.left, 0);
            if (this.top < 0) this.moveBiot(0, -this.top);
            if (this.right >= env2.width) this.moveBiot(env2.width - 1 - this.right, 0);
            if (this.bottom >= env2.height) this.moveBiot(0, env2.height - 1 - this.bottom);
            this.vector.x = this.origin.x;
            this.vector.y = this.origin.y;
          }
          const pt = { x: 0, y: 0 };
          const hits = env2.findIntersecting(this);
          for (const enemy of hits) {
            if (this.contacter(enemy, dx, dy, pt)) {
              let him = this.findCollision(enemy.id);
              this.moveBiot(-dx, -dy);
              env2.stats.collisionCount++;
              if (him < MAX_COLLISIONS) {
                this.collider[him].seen = this.age & 32767;
                if (++this.collider[him].hits > 1) {
                  let boost = 0;
                  if (enemy.origin.x > this.origin.x) boost = -0.05;
                  if (enemy.origin.x < this.origin.x) boost = 0.05;
                  this.vector.adjustDeltaX(boost);
                  enemy.vector.adjustDeltaX(-boost);
                  boost = 0;
                  if (enemy.origin.y > this.origin.y) boost = -0.05;
                  if (enemy.origin.y < this.origin.y) boost = 0.05;
                  this.vector.adjustDeltaY(boost);
                  enemy.vector.adjustDeltaY(-boost);
                  dx = this.vector.tryStepX();
                  dy = this.vector.tryStepY();
                  this.moveBiot(dx, dy);
                }
              } else {
                him = this.addCollision();
                if (him < MAX_COLLISIONS) {
                  this.collider[him].id = enemy.id;
                  this.collider[him].hits = 0;
                  this.collider[him].seen = this.age & 32767;
                  const me = enemy.addCollision();
                  if (me < MAX_COLLISIONS) {
                    enemy.collider[me].id = this.id;
                    enemy.collider[me].hits = 0;
                    enemy.collider[me].seen = enemy.age & 32767;
                    const deltaX = pt.x - this.centerX(), deltaY = pt.y - this.centerY();
                    const radius = this.vector.distance(deltaX, deltaY);
                    const [DX, DY] = this.vector.rotatedDelta(deltaX, deltaY, radius);
                    const edeltaX = enemy.centerX() - pt.x, edeltaY = enemy.centerY() - pt.y;
                    const eradius = enemy.vector.distance(edeltaX, edeltaY);
                    const [eDX, eDY] = enemy.vector.rotatedDelta(edeltaX, edeltaY, eradius);
                    const Vx = this.vector.collisionResult(enemy.vector.mass, DX, eDX);
                    const Vy = this.vector.collisionResult(enemy.vector.mass, DY, eDY);
                    const eVx = enemy.vector.collisionResult(this.vector.mass, eDX, DX);
                    const eVy = enemy.vector.collisionResult(this.vector.mass, eDY, DY);
                    enemy.motion(edeltaX, edeltaY, eVx, eVy, eradius);
                    this.motion(deltaX, deltaY, Vx, Vy, radius);
                    dx = this.vector.tryStepX();
                    dy = this.vector.tryStepY();
                    this.moveBiot(dx, dy);
                  }
                }
              }
            }
          }
          this.removeCollisions(this.age);
          this.vector.makeStep();
          for (let i = 0; i < MAX_SYMMETRY; i++) this.stores[i].execute(this, 4294967295);
          let bChangeSize = false;
          if (this.bDie) {
            this.genes -= 2;
            this.max_genes -= 2;
            if (this.genes <= 0) {
              this.env.emit("tooOld");
              return false;
            }
            bChangeSize = true;
          } else if (this.genes < this.max_genes && (this.age & 7) === 7) {
            this.genes += MAX_GENES / MAX_SEGMENTS;
            bChangeSize = true;
          }
          if (this.bRedraw || dr || bChangeSize) {
            this.symmetric(this.ratio);
            this.setScreenRect();
            this.setBonus();
          }
          if (this.nSick) {
            this.energy -= 2e3;
            this.nSick--;
            if (!this.nSick) this.newType = -2;
          } else {
            this.energy += this.turnBenefit - this.totalDistance;
            this.energy += Math.trunc(this.bonusRatio * this.turnBenefit);
          }
          if (this.energy <= 0 || this.totalDistance <= 0) {
            this.env.emit(this.totalDistance <= 0 || this.energy >= 0 ? "eaten" : "noEnergy");
            return false;
          }
          if ((this.age & 15) === 15) {
            this.checkReproduction();
            if (this.ratio > this.trait.getAdultRatio() && this.energy > this.stepEnergy) {
              this.ratio--;
              this.stepEnergy = Math.trunc(2 * this.adultBaseEnergy / this.baseRatio());
              this.totalDistance = this.symmetric(this.ratio);
              for (let i = 0; i < MAX_GENES; i++) this.state[i] = this.distance[i];
              this.childBaseEnergy = this.totalDistance * env2.options.startEnergy;
              this.setScreenRect();
              this.setBonus();
            }
            if (this.maxAge < this.age) this.bDie = true;
          }
          if (this.bInjured && (this.age & env2.options.regenTime) === env2.options.regenTime) {
            const regenEnergy = this.childBaseEnergy >> 2;
            if (this.energy > regenEnergy) {
              this.bInjured = false;
              for (let i = 0; i < MAX_SYMMETRY && this.energy > regenEnergy; i++) {
                let j = i;
                while (j < this.genes) {
                  if (this.state[j] < this.distance[j] && this.distance[j] > 0) {
                    this.energy -= env2.options.regenCost;
                    this.state[j]++;
                    this.bInjured = true;
                    if (this.state[j] <= 0) break;
                    if (this.state[j] === this.distance[j] || this.state[j] === 1) this.newType = -2;
                    if (this.nType[j] === GREEN_LEAF) this.turnBenefit += env2.options.leafEnergy;
                    this.colorDistance[this.nType[j]]++;
                    this.totalDistance++;
                  }
                  j += MAX_SYMMETRY;
                }
              }
            }
          }
          return true;
        }
      };
      var Environment2 = class {
        constructor(width, height, seed, opts) {
          this.width = width;
          this.height = height;
          Randomizer.randSeed(seed >>> 0);
          Randomizer._seeded = true;
          this.uniqueID = 0;
          this.biots = [];
          this.stats = { births: 0, deaths: 0, extinctions: 0, collisionCount: 0, generation: 0 };
          this.options = Object.assign({
            leafEnergy: 2,
            regenCost: 200,
            regenTime: 7,
            startEnergy: 400 * 8,
            friction: 5e-3,
            chance: 12,
            initialPopulation: 20,
            nSexual: 3,
            nSick: 200,
            armsPerBiot: 0,
            typesPerBiot: 0,
            segmentsPerArm: 0,
            maxPopulation: 250,
            // cap to prevent O(n²) collision slowdown freeze
            leafMass: null,
            leafContact: null,
            newType: null
          }, opts || {});
          const lc = Array.from({ length: MAX_LEAF }, () => new Array(MAX_LEAF).fill(CONTACT_IGNORE));
          lc[GREEN_LEAF][RED_LEAF] = CONTACT_EATEN;
          lc[BLUE_LEAF][RED_LEAF] = CONTACT_DEFEND;
          lc[RED_LEAF][RED_LEAF] = CONTACT_ATTACK;
          lc[RED_LEAF][GREEN_LEAF] = CONTACT_EAT;
          lc[RED_LEAF][BLUE_LEAF] = CONTACT_DEFENDED;
          lc[RED_LEAF][WHITE_LEAF] = CONTACT_DESTROY;
          lc[RED_LEAF][LBLUE_LEAF] = CONTACT_DESTROY;
          lc[WHITE_LEAF][RED_LEAF] = CONTACT_DESTROYED;
          lc[LBLUE_LEAF][RED_LEAF] = CONTACT_DESTROYED;
          this.options.leafContact = lc;
          const lm = new Array(MAX_LEAF).fill(1);
          lm[RED_LEAF] = 1;
          lm[BLUE_LEAF] = 2;
          lm[WHITE_LEAF] = 1;
          lm[GREEN_LEAF] = 4;
          lm[LBLUE_LEAF] = 1;
          this.options.leafMass = lm;
          const nt = new Array(MAX_LEAF).fill(-1);
          nt[RED_LEAF] = RED_LEAF;
          nt[BLUE_LEAF] = BLUE_LEAF;
          nt[WHITE_LEAF] = WHITE_LEAF;
          nt[GREEN_LEAF] = YELLOW_LEAF;
          nt[LBLUE_LEAF] = LBLUE_LEAF;
          this.options.newType = nt;
          this.cursor = 0;
          this.sampleCounter = 0;
          this.listeners = {};
          this.createBiots();
        }
        on(event, fn) {
          (this.listeners[event] = this.listeners[event] || []).push(fn);
        }
        emit(event) {
          const l = this.listeners[event];
          if (l) for (const fn of l) fn();
        }
        getID() {
          return ++this.uniqueID;
        }
        addBiot(b) {
          this.biots.push(b);
        }
        createBiots() {
          for (let i = 0; i < this.options.initialPopulation; i++) {
            const b = new Biot(this);
            b.randomCreate(this.options.armsPerBiot, this.options.typesPerBiot, this.options.segmentsPerArm);
            this.biots.push(b);
          }
        }
        hitCheck(me) {
          for (const b of this.biots) {
            if (b === me) continue;
            if (rectsTouch(me, b)) return b;
          }
          return null;
        }
        findIntersecting(me) {
          const out = [];
          for (const b of this.biots) {
            if (b === me) continue;
            if (rectsTouch(me, b)) out.push(b);
          }
          return out;
        }
        // one full pass over all biots (== one "generation" tick of the original Skip loop)
        step() {
          if (this.biots.length > this.options.maxPopulation) {
            this.stats.generation++;
            const toRemove = [];
            for (let i = 0; i < this.biots.length; i++) {
              const b = this.biots[i];
              b.age++;
              b.energy -= b.totalDistance || 1;
              if (b.energy <= 0 || b.totalDistance <= 0) {
                this.stats.deaths++;
                toRemove.push(i);
              }
            }
            for (let i = toRemove.length - 1; i >= 0; i--) this.biots.splice(toRemove[i], 1);
            if (this.biots.length === 0) {
              this.stats.extinctions++;
              this.emit("extinction");
              this.createBiots();
            }
            return;
          }
          for (let i = 0; i < this.biots.length; i++) {
            const b = this.biots[i];
            if (!b.move()) {
              this.biots.splice(i, 1);
              i--;
              this.stats.deaths++;
            }
          }
          this.stats.generation++;
          if ((this.stats.generation & 511) === 511 && this.biots.length) {
            let covered = 0;
            for (const b of this.biots) covered += b.area();
            if (covered / (this.width * this.height) > 0.5) {
              const rand = new Randomizer();
              this.biots[rand.Integer(this.biots.length)].nSick = this.options.nSick;
            }
          }
          if (this.biots.length === 0) {
            this.stats.extinctions++;
            this.emit("extinction");
            this.createBiots();
          }
        }
      };
      module.exports = { Vector, Biot, Environment: Environment2, SCALE, GROW, RECALCULATE, REFORM, NORMAL };
    }
  });

  // src/sounds.js
  var require_sounds = __commonJS({
    "src/sounds.js"(exports, module) {
      "use strict";
      init_stub_node();
      var ctx2 = null;
      var enabled = true;
      var lastPlay = {};
      var buffers = {};
      var isElectron = typeof window !== "undefined" && typeof window.process !== "undefined" && window.process.type === "renderer";
      function ac() {
        if (!ctx2) ctx2 = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx2.state === "suspended") ctx2.resume();
        return ctx2;
      }
      function loadWav(file) {
        if (isElectron) {
          try {
            const fs = __require("fs");
            const path = __require("path");
            const p = path.join(__dirname, "sounds", file);
            const buf = fs.readFileSync(p);
            const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
            ac().decodeAudioData(ab).then((b) => {
              buffers[file] = b;
            });
          } catch (e) {
            console.error("Electron WAV load failed:", e);
            fetch("sounds/" + file).then((r) => r.arrayBuffer()).then((ab) => ac().decodeAudioData(ab)).then((b) => {
              buffers[file] = b;
            });
          }
        } else {
          fetch("sounds/" + file).then((r) => r.arrayBuffer()).then((ab) => ac().decodeAudioData(ab)).then((b) => {
            buffers[file] = b;
          }).catch((e) => console.error("Failed to load", file, ":", e));
        }
      }
      loadWav("birth.wav");
      function blip(name, f0, f1, dur, type, vol, throttleMs) {
        if (!enabled) return;
        const now = Date.now();
        if (throttleMs && lastPlay[name] && now - lastPlay[name] < throttleMs) return;
        lastPlay[name] = now;
        const a = ac(), t = a.currentTime;
        const o = a.createOscillator(), g = a.createGain();
        o.type = type;
        o.frequency.setValueAtTime(f0, t);
        o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t + dur);
        g.gain.setValueAtTime(vol, t);
        g.gain.exponentialRampToValueAtTime(1e-4, t + dur);
        o.connect(g);
        g.connect(a.destination);
        o.start(t);
        o.stop(t + dur);
      }
      var Sounds2 = {
        toggle() {
          enabled = !enabled;
          return enabled;
        },
        isEnabled() {
          return enabled;
        },
        start() {
          blip("start", 220, 880, 0.35, "triangle", 0.15);
        },
        birth() {
          if (!enabled || !buffers["birth.wav"]) return;
          const a = ac();
          const s = a.createBufferSource();
          s.buffer = buffers["birth.wav"];
          s.connect(a.destination);
          s.start(a.currentTime);
        },
        mate() {
          blip("mate", 660, 990, 0.15, "sine", 0.1, 150);
        },
        eaten() {
          blip("eaten", 330, 110, 0.1, "sawtooth", 0.08, 60);
        },
        noEnergy() {
          blip("noEnergy", 220, 55, 0.25, "triangle", 0.1, 100);
        },
        tooOld() {
          blip("tooOld", 165, 41, 0.4, "sine", 0.1, 100);
        },
        extinction() {
          blip("extinction", 880, 27, 1.2, "sawtooth", 0.18);
        }
      };
      module.exports = Sounds2;
    }
  });

  // src/ui-colors.js
  var require_ui_colors = __commonJS({
    "src/ui-colors.js"(exports, module) {
      "use strict";
      init_stub_node();
      var PEN_COLORS2 = [
        "#00ff00",
        // 0 GREEN
        "#0000ff",
        // 1 BLUE
        "#ff0000",
        // 2 RED
        "#00ffff",
        // 3 LBLUE
        "#ffffff",
        // 4 WHITE
        "#008000",
        // 5 DARK_GREEN
        "#000080",
        // 6 DARK_BLUE
        "#800000",
        // 7 DARK_RED
        "#008080",
        // 8 DARK_LBLUE
        "#808080",
        // 9 GREY
        "#ffff00",
        // 10 YELLOW
        "#000000",
        // 11 BLACK
        "#ff00ff"
        // 12 PURPLE
      ];
      module.exports = { PEN_COLORS: PEN_COLORS2 };
    }
  });

  // src/guide.js
  var require_guide = __commonJS({
    "src/guide.js"(exports, module) {
      "use strict";
      init_stub_node();
      var isElectron = typeof window !== "undefined" && typeof window.process !== "undefined" && window.process.type === "renderer";
      var GUIDE_PATH = "docs/BIOT-GUIDE.md";
      function escapeHtml(s) {
        return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      }
      function inline(s) {
        return escapeHtml(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\*(.+?)\*/g, "<i>$1</i>");
      }
      function loadGuide() {
        if (isElectron) {
          try {
            const fs = __require("fs");
            const path = __require("path");
            const p = path.join(__dirname, "..", "..", "docs", "BIOT-GUIDE.md");
            try {
              return Promise.resolve(fs.readFileSync(p, "utf8"));
            } catch (e) {
              console.error("Guide load failed (Electron):", e);
              return Promise.resolve("Could not load guide.");
            }
          } catch (e) {
            return fetch(GUIDE_PATH).then((r) => r.ok ? r.text() : Promise.reject("HTTP " + r.status)).then(null, () => "Could not load guide.");
          }
        } else {
          return fetch(GUIDE_PATH).then((r) => r.ok ? r.text() : Promise.reject("HTTP " + r.status)).catch((e) => {
            console.error("Guide load failed (web):", e);
            return "Could not load guide.";
          });
        }
      }
      function mdToHtml(md) {
        const out = [];
        let inCode = false, inTable = false, tableRow = 0, inList = false, listType = "";
        const closeList = () => {
          if (inList) {
            out.push(listType === "ol" ? "</ol>" : "</ul>");
            inList = false;
          }
        };
        const closeTable = () => {
          if (inTable) {
            out.push("</table>");
            inTable = false;
          }
        };
        const flush = () => {
          closeList();
          closeTable();
        };
        for (const raw of md.split("\n")) {
          const t = raw.trim();
          if (t.startsWith("```")) {
            flush();
            out.push(inCode ? "</pre>" : "<pre>");
            inCode = !inCode;
            continue;
          }
          if (inCode) {
            out.push(escapeHtml(raw));
            continue;
          }
          if (inList && t !== "" && /^\s/.test(raw)) {
            out[out.length - 1] = out[out.length - 1].replace("</li>", " " + inline(t) + "</li>");
            continue;
          }
          if (t.startsWith("|") && t.endsWith("|")) {
            closeList();
            if (/^\|[\s:|-]+\|$/.test(t)) continue;
            if (!inTable) {
              out.push("<table>");
              inTable = true;
              tableRow = 0;
            }
            const cells = t.slice(1, -1).split("|").map((c) => inline(c.trim()));
            const tag = tableRow === 0 ? "th" : "td";
            out.push("<tr>" + cells.map((c) => `<${tag}>${c}</${tag}>`).join("") + "</tr>");
            tableRow++;
            continue;
          }
          closeTable();
          if (t.startsWith("# ")) {
            flush();
            out.push("<h1>" + inline(t.slice(2)) + "</h1>");
            continue;
          }
          if (t.startsWith("## ")) {
            flush();
            out.push("<h2>" + inline(t.slice(3)) + "</h2>");
            continue;
          }
          const bullet = t.match(/^[-*] (.*)/);
          if (bullet) {
            if (!inList || listType !== "ul") {
              flush();
              out.push("<ul>");
              inList = true;
              listType = "ul";
            }
            out.push("<li>" + inline(bullet[1]) + "</li>");
            continue;
          }
          const num = t.match(/^\d+\. (.*)/);
          if (num) {
            if (!inList || listType !== "ol") {
              flush();
              out.push("<ol>");
              inList = true;
              listType = "ol";
            }
            out.push("<li>" + inline(num[1]) + "</li>");
            continue;
          }
          flush();
          if (t === "") continue;
          out.push("<p>" + inline(t) + "</p>");
        }
        flush();
        return out.join("\n");
      }
      var Guide2 = class {
        constructor() {
          this.visible = false;
          this.loaded = false;
          const el = document.createElement("div");
          el.id = "biot-guide";
          el.innerHTML = `
      <style>
        #biot-guide { position:fixed; top:5vh; left:50%; transform:translateX(-50%);
                       width:min(720px,90vw); max-height:88vh; overflow:auto; z-index:200;
                       background:#000; color:#cfc; border:2px solid #0f0;
                       font:14px "Courier New", monospace; display:none; }
        #biot-guide .guide-title { position:sticky; top:0; background:#010; color:#ff0;
                       padding:6px 10px; border-bottom:1px solid #040; font-weight:bold; }
        #biot-guide .guide-close { float:right; cursor:pointer; color:#f88; }
        #biot-guide .guide-body { padding:8px 16px 20px; line-height:1.45; }
        #biot-guide h1 { color:#ff0; font-size:17px; border-bottom:1px solid #040; }
        #biot-guide h2 { color:#0f0; font-size:15px; margin-top:18px; }
        #biot-guide b { color:#fff; }
        #biot-guide table { border-collapse:collapse; margin:8px 0; width:100%; }
        #biot-guide th, #biot-guide td { border:1px solid #050; padding:4px 8px; text-align:left; vertical-align:top; }
        #biot-guide th { color:#ff0; background:#020; }
        #biot-guide td:first-child { white-space:nowrap; }
        #biot-guide pre { background:#020; border:1px solid #040; padding:8px; overflow-x:auto; }
        #biot-guide ul, #biot-guide ol { padding-left:22px; }
        #biot-guide li { margin:3px 0; }
      </style>
      <div class="guide-title">BIOT FIELD GUIDE <span class="guide-close" id="guide-close">[X]</span></div>
      <div class="guide-body" id="guide-body">Loading guide...</div>
    `;
          document.body.appendChild(el);
          this.el = el;
          el.querySelector("#guide-close").onclick = () => this.hide();
          loadGuide().then((md) => {
            el.querySelector("#guide-body").innerHTML = mdToHtml(md);
            this.loaded = true;
          });
        }
        show() {
          this.visible = true;
          this.el.style.display = "block";
        }
        hide() {
          this.visible = false;
          this.el.style.display = "none";
        }
        toggle() {
          this.visible ? this.hide() : this.show();
        }
      };
      module.exports = { Guide: Guide2, mdToHtml, loadGuide };
    }
  });

  // src/render.js
  init_stub_node();
  var { Environment } = require_sim();
  var G = require_genotype();
  var Sounds = require_sounds();
  var { PEN_COLORS } = require_ui_colors();
  var { Guide } = require_guide();
  var canvas = document.getElementById("world");
  var ctx = canvas.getContext("2d");
  var hud = document.getElementById("hud");
  var inspector = document.getElementById("inspector");
  var env = null;
  var paused = false;
  var stepsPerFrame = 1;
  var selected = null;
  var guide;
  try {
    guide = new Guide();
  } catch (e) {
    console.error("Guide failed to initialize:", e);
    guide = { visible: false, toggle() {
    }, hide() {
    } };
  }
  var newWorldSafe = function() {
    try {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      env = new Environment(canvas.width, canvas.height, Date.now() & 2147483647, { initialPopulation: 20 });
      env.on("birth", () => {
        try {
          Sounds.birth();
        } catch (e) {
          console.error("birth sound failed:", e);
        }
      });
      env.on("mate", () => Sounds.mate());
      env.on("eaten", () => Sounds.eaten());
      env.on("noEnergy", () => Sounds.noEnergy());
      env.on("tooOld", () => Sounds.tooOld());
      env.on("extinction", () => Sounds.extinction());
      Sounds.start();
      selected = null;
      inspector.style.display = "none";
    } catch (e) {
      console.error("newWorld failed:", e);
      const err = document.getElementById("inspector");
      if (err) err.textContent = "RESTART FAILED: " + e.message;
    }
  };
  function newWorld() {
    newWorldSafe();
  }
  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (env) {
      env.width = canvas.width;
      env.height = canvas.height;
    }
  });
  newWorld();
  window.addEventListener("keydown", (e) => {
    const tag = (e.target.tagName || "").toUpperCase();
    if (["INPUT", "SELECT", "TEXTAREA"].includes(tag) || e.target.isContentEditable) return;
    if (e.code === "Space") {
      paused = !paused;
      e.preventDefault();
    } else if (e.key === "r" || e.key === "R") newWorld();
    else if (e.key === "s" || e.key === "S") Sounds.toggle();
    else if (e.key === "g" || e.key === "G") guide.toggle();
    else if (e.key === "Escape") {
      if (guide.visible) guide.hide();
    } else if (e.key === "+" || e.key === "=") stepsPerFrame = Math.min(16, stepsPerFrame + 1);
    else if (e.key === "-") stepsPerFrame = Math.max(1, stepsPerFrame - 1);
  });
  canvas.addEventListener("mousedown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    selected = null;
    for (const b of env.biots) {
      if (x >= b.left && x <= b.right && y >= b.top && y <= b.bottom) {
        selected = b;
        break;
      }
    }
    if (!selected) inspector.style.display = "none";
  });
  ["btn-pause", "btn-restart", "btn-sound", "btn-guide"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", (e) => {
      e.preventDefault();
      switch (id) {
        case "btn-pause":
          paused = !paused;
          break;
        case "btn-restart":
          newWorld();
          break;
        case "btn-sound":
          Sounds.toggle();
          updateSoundBtn();
          break;
        case "btn-guide":
          guide.toggle();
          break;
      }
    });
  });
  function updateSoundBtn() {
    const btn = document.getElementById("btn-sound");
    if (btn) btn.textContent = Sounds.isEnabled() ? "\u{1F50A}" : "\u{1F507}";
  }
  function drawBiot(b) {
    const sick = b.nSick > 0;
    let lastColor = -1;
    for (let i = 0; i < b.genes; i++) {
      if (b.state[i] <= 0) continue;
      let pen = sick ? G.PURPLE_LEAF : b.nType[i];
      if (!sick && b.state[i] !== b.distance[i]) pen += G.DIM_COLOR;
      if (pen >= PEN_COLORS.length) pen = G.GREY_LEAF;
      if (pen !== lastColor) {
        ctx.strokeStyle = PEN_COLORS[pen];
        lastColor = pen;
      }
      ctx.beginPath();
      ctx.moveTo(b.x1(i) + 0.5, b.y1(i) + 0.5);
      ctx.lineTo(b.x2(i) + 0.5, b.y2(i) + 0.5);
      ctx.stroke();
    }
    if (b === selected) {
      ctx.strokeStyle = "#808080";
      ctx.strokeRect(b.left - 2, b.top - 2, b.width() + 4, b.height() + 4);
    }
  }
  function updateInspector() {
    if (!selected) return;
    if (!env.biots.includes(selected)) {
      selected = null;
      inspector.style.display = "none";
      return;
    }
    const b = selected;
    inspector.style.display = "block";
    inspector.textContent = `Biot: ${b.name}:${b.generation}
sex: ${b.trait.isMale() ? "male" : "female"}${b.trait.isAsexual() ? " (asexual)" : ""}
species: ${b.trait.getSpecies()}  limbs: ${b.trait.getLines()}${b.trait.isMirrored() ? " mirrored" : ""}
age: ${b.age} / ${b.maxAge}
energy: ${Math.round(b.percentEnergy())}%  ratio: ${b.ratio}
children: ${b.trait.getNumberOfChildren()}  fertilized: ${b.genes2 ? "yes" : "no"}
green: ${b.colorDistance[0]}  red: ${b.colorDistance[2]}
blue: ${b.colorDistance[1]}  white: ${b.colorDistance[4]}  lblue: ${b.colorDistance[3]}` + (b.nSick ? "\n** SICK **" : "");
  }
  function frame() {
    try {
      if (!paused) for (let s = 0; s < stepsPerFrame; s++) env.step();
    } catch (e) {
      console.error("frame step error:", e);
      paused = true;
    }
    try {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 1;
      for (const b of env.biots) drawBiot(b);
    } catch (e) {
      console.error("draw error:", e);
    }
    hud.textContent = `Primordial Life  |  pop ${env.biots.length}  gen ${env.stats.generation}
births ${env.stats.births}  deaths ${env.stats.deaths}  extinctions ${env.stats.extinctions}` + (Sounds.isEnabled() ? "" : "  [MUTED]") + (paused ? "  [PAUSED]" : stepsPerFrame > 1 ? `  x${stepsPerFrame}` : "");
    updateInspector();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
