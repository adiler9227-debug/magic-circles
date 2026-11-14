/* VFX — эффекты умений для three.js r128. Без внешних картинок: все текстуры рисуются на canvas.
   Использование:
     const fx = new VFX(scene, camera);          // один раз
     fx.cast('arcane', new THREE.Vector3(x,0,z), {scale:1});  // 'arcane' | 'fire' | 'lightning' | 'void'
     // в цикле кадра:  fx.update(dt); renderer.render(scene,camera); fx.restore();
*/
(function (global) {
'use strict';
const T = global.THREE, PI2 = Math.PI * 2, AB = T.AdditiveBlending;
const rnd = Math.random, lerp = (a, b, t) => a + (b - a) * t, clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeBack = t => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

/* ---------- процедурные текстуры ---------- */
function canvasTex(size, draw) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const x = c.getContext('2d'); draw(x, size);
  const t = new T.CanvasTexture(c); t.anisotropy = 4; return t;
}
function glyph(x, r, seed) {              // псевдо-руна: стержень + ветки
  const R = mulberry(seed); x.beginPath(); x.moveTo(0, -r); x.lineTo(0, r);
  const n = 2 + (R() * 3 | 0);
  for (let i = 0; i < n; i++) { const y = lerp(-r, r, R()), dx = (R() < .5 ? -1 : 1) * r * (.3 + R() * .5); x.moveTo(0, y); x.lineTo(dx, y + (R() - .5) * r); }
  x.stroke();
}
function neon(x, w) { x.strokeStyle = '#fff'; x.fillStyle = '#fff'; x.lineWidth = w; x.shadowColor = '#fff'; x.shadowBlur = 16; x.lineCap = x.lineJoin = 'round'; }
function circ(x, c, r) { x.beginPath(); x.arc(c, c, r, 0, PI2); x.stroke(); }
function star(x, c, r, n, k, rot) { x.beginPath(); for (let i = 0; i <= n; i++) { const a = rot + i * k * PI2 / n, px = c + Math.cos(a) * r, py = c + Math.sin(a) * r; i ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke(); }
function ringGlyphs(x, c, r, n, h, seed) { for (let i = 0; i < n; i++) { x.save(); x.translate(c, c); x.rotate(i / n * PI2); x.translate(0, -r); glyph(x, h, seed + i * 7); x.restore(); } }
function makeTextures() {
  const S = 1024, C = S / 2;
  return {
    outer: canvasTex(S, (x) => { neon(x, 6); circ(x, C, 496); x.lineWidth = 2.5; circ(x, C, 484); circ(x, C, 424); x.lineWidth = 3;
      for (let i = 0; i < 180; i++) { const a = i / 180 * PI2, l = i % 5 ? 8 : 18; x.beginPath(); x.moveTo(C + Math.cos(a) * 484, C + Math.sin(a) * 484); x.lineTo(C + Math.cos(a) * (484 - l), C + Math.sin(a) * (484 - l)); x.stroke(); }
      x.lineWidth = 3; ringGlyphs(x, C, 454, 64, 17, 11); x.lineWidth = 5;
      for (let i = 0; i < 4; i++) { x.save(); x.translate(C, C); x.rotate(i * Math.PI / 2); x.translate(0, -438); x.beginPath(); x.moveTo(0, -26); x.lineTo(14, 0); x.lineTo(0, 26); x.lineTo(-14, 0); x.closePath(); x.stroke(); x.restore(); } }),
    mid: canvasTex(S, (x) => { neon(x, 5); circ(x, C, 400); x.lineWidth = 2.5; circ(x, C, 384); circ(x, C, 200); x.lineWidth = 4;
      star(x, C, 384, 6, 2, -Math.PI / 2); star(x, C, 384, 12, 5, -Math.PI / 2); x.lineWidth = 3; ringGlyphs(x, C, 292, 30, 15, 99);
      for (let i = 0; i < 6; i++) { const a = i / 6 * PI2 - Math.PI / 2; x.beginPath(); x.arc(C + Math.cos(a) * 384, C + Math.sin(a) * 384, 26, 0, PI2); x.stroke(); } }),
    inner: canvasTex(S, (x) => { neon(x, 5); circ(x, C, 340); x.lineWidth = 3; circ(x, C, 300); circ(x, C, 120); star(x, C, 300, 5, 2, -Math.PI / 2); x.lineWidth = 3;
      for (let i = 0; i < 48; i++) { const a = i / 48 * PI2; x.beginPath(); x.moveTo(C + Math.cos(a) * 304, C + Math.sin(a) * 304); x.lineTo(C + Math.cos(a) * 336, C + Math.sin(a) * 336); x.stroke(); }
      for (let i = 0; i < 5; i++) { const a = i / 5 * PI2 - Math.PI / 2; x.beginPath(); x.arc(C + Math.cos(a) * 300, C + Math.sin(a) * 300, 22, 0, PI2); x.stroke(); }
      x.lineWidth = 6; circ(x, C, 40); }),
    glow: canvasTex(256, (x, s) => { const g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.25, 'rgba(255,255,255,.55)'); g.addColorStop(.6, 'rgba(255,255,255,.12)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, s, s); }),
    ring: canvasTex(512, (x, s) => { const g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.62, 'rgba(255,255,255,0)'); g.addColorStop(.88, 'rgba(255,255,255,.9)'); g.addColorStop(.93, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, s, s); })
  };
}

/* ---------- частицы: один Points на все эффекты ---------- */
class Particles {
  constructor(max) {
    this.max = max; this.i = 0;
    const m3 = () => new Float32Array(max * 3), m1 = () => new Float32Array(max);
    this.pos = m3(); this.col = m3(); this.size = m1(); this.alpha = m1(); this.vel = m3(); this.life = m1(); this.ml = m1().fill(1);
    this.s0 = m1(); this.s1 = m1(); this.c0 = m3(); this.c1 = m3(); this.grav = m1(); this.drag = m1();
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(this.pos, 3)); g.setAttribute('aColor', new T.BufferAttribute(this.col, 3));
    g.setAttribute('aSize', new T.BufferAttribute(this.size, 1)); g.setAttribute('aAlpha', new T.BufferAttribute(this.alpha, 1));
    this.geo = g;
    this.mat = new T.ShaderMaterial({
      uniforms: { uScale: { value: 600 } }, transparent: true, depthWrite: false, blending: AB,
      vertexShader: 'attribute float aSize;attribute float aAlpha;attribute vec3 aColor;varying vec3 vC;varying float vA;uniform float uScale;void main(){vC=aColor;vA=aAlpha;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=aSize*uScale/max(-mv.z,.1);gl_Position=projectionMatrix*mv;}',
      fragmentShader: 'varying vec3 vC;varying float vA;void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;float a=pow(1.-d,2.)*vA;gl_FragColor=vec4(vC*1.4+vec3(a*.4),a);}'
    });
    this.points = new T.Points(g, this.mat); this.points.frustumCulled = false;
  }
  emit(x, y, z, vx, vy, vz, life, s0, s1, c0, c1, grav, drag) {
    const i = this.i; this.i = (i + 1) % this.max; const k = i * 3;
    this.pos[k] = x; this.pos[k + 1] = y; this.pos[k + 2] = z; this.vel[k] = vx; this.vel[k + 1] = vy; this.vel[k + 2] = vz;
    this.life[i] = this.ml[i] = life; this.s0[i] = s0; this.s1[i] = s1; this.grav[i] = grav || 0; this.drag[i] = drag || 0;
    this.c0[k] = c0.r; this.c0[k + 1] = c0.g; this.c0[k + 2] = c0.b; this.c1[k] = c1.r; this.c1[k + 1] = c1.g; this.c1[k + 2] = c1.b;
  }
  update(dt) {
    const p = this.pos, v = this.vel;
    for (let i = 0; i < this.max; i++) {
      if (this.life[i] <= 0) { this.alpha[i] = 0; continue; }
      this.life[i] -= dt; const k = 1 - clamp(this.life[i] / this.ml[i]), j = i * 3, d = Math.exp(-this.drag[i] * dt);
      v[j] *= d; v[j + 1] = v[j + 1] * d - this.grav[i] * dt; v[j + 2] *= d;
      p[j] += v[j] * dt; p[j + 1] += v[j + 1] * dt; p[j + 2] += v[j + 2] * dt;
      this.size[i] = lerp(this.s0[i], this.s1[i], k); this.alpha[i] = Math.min(k * 10, 1) * (1 - k);
      this.col[j] = lerp(this.c0[j], this.c1[j], k); this.col[j + 1] = lerp(this.c0[j + 1], this.c1[j + 1], k); this.col[j + 2] = lerp(this.c0[j + 2], this.c1[j + 2], k);
    }
    const g = this.geo.attributes; g.position.needsUpdate = g.aColor.needsUpdate = g.aSize.needsUpdate = g.aAlpha.needsUpdate = true;
  }
}

/* ---------- основной класс ---------- */
class VFX {
  constructor(scene, camera, opts) {
    opts = opts || {}; this.scene = scene; this.camera = camera; this.tex = makeTextures();
    this.p = new Particles(opts.maxParticles || 9000); scene.add(this.p.points);
    this.light = new T.PointLight(0xffffff, 0, 60, 2); scene.add(this.light); this.lightK = 0;
    this.plane = new T.PlaneGeometry(2, 2); this.cyl = new T.CylinderGeometry(1, 1, 1, 48, 1, true); this.cyl.translate(0, .5, 0);
    this.skins = {}; this.list = []; this.timers = []; this.off = new T.Vector3(); this.sT = 0; this.sD = 1; this.sM = 0; this.time = 0;
  }
  col(h) { return new T.Color(h); }
  /* Картинки кругов (Forge GUI): чёрный фон -> прозрачность по яркости, белый рисунок красится цветом умения.
     fx.loadSkins({arcane:'tex/arcane.png', fire:'...', void:'...'}). При ошибке остаётся нарисованный кодом круг. */
  loadSkins(map) {
    Object.keys(map).forEach(k => { const im = new Image(); im.crossOrigin = 'anonymous';
      im.onload = () => { if (k === 'nebula') { const t = new T.Texture(im); t.wrapS = t.wrapT = T.RepeatWrapping; t.needsUpdate = true; this.skins[k] = t; return; } try { const S = 1024, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d'); x.drawImage(im, 0, 0, S, S);
        const d = x.getImageData(0, 0, S, S), a = d.data; for (let i = 0; i < a.length; i += 4) { const l = Math.max(a[i], a[i + 1], a[i + 2]) / 255; a[i] = a[i + 1] = a[i + 2] = 255; a[i + 3] = Math.min(255, Math.max(0, (l - .08) * 1.35 * 255)); }
        x.putImageData(d, 0, 0); const t = new T.CanvasTexture(c); t.anisotropy = 4; this.skins[k] = t; } catch (e) { console.warn('VFX skin', k, e); } };
      im.onerror = () => console.warn('VFX: не загрузился круг', k); im.src = map[k]; });
  }
  add(fn, cleanup) { this.list.push({ fn, cleanup, t: 0 }); }
  after(sec, fn) { this.timers.push({ t: sec, fn }); }
  run(dur, fn) { this.add((dt, t) => { fn(dt, t / dur, t); return t < dur; }); }
  shake(m, d) { this.sM = m; this.sT = this.sD = d || .4; }
  flashLight(h, intensity, pos, y) { this.light.color.set(h); this.light.position.copy(pos); this.light.position.y += y || 3; this.lightK = intensity; }
  update(dt) {
    dt = Math.min(dt, .05); this.time += dt;
    for (let i = this.timers.length - 1; i >= 0; i--) { const q = this.timers[i]; q.t -= dt; if (q.t <= 0) { this.timers.splice(i, 1); q.fn(); } }
    for (let i = this.list.length - 1; i >= 0; i--) { const q = this.list[i]; q.t += dt; if (q.fn(dt, q.t) === false) { if (q.cleanup) q.cleanup(); this.list.splice(i, 1); } }
    this.p.mat.uniforms.uScale.value = (global.innerHeight || 720) * .5;
    this.p.update(dt);
    this.lightK *= Math.exp(-5 * dt); this.light.intensity = this.lightK;
    if (this.sT > 0) { this.sT -= dt; const m = this.sM * clamp(this.sT / this.sD); this.off.set((rnd() - .5) * m, (rnd() - .5) * m, (rnd() - .5) * m); this.camera.position.add(this.off); } else this.off.set(0, 0, 0);
  }
  restore() { this.camera.position.sub(this.off); }

  /* --- строительные блоки --- */
  _mat(map, color) { return new T.MeshBasicMaterial({ map, color, transparent: true, blending: AB, depthWrite: false, side: T.DoubleSide }); }
  circle(pos, R, c1, c2, life, skin) {
    const g = new T.Group(); g.position.copy(pos); g.position.y += .06; this.scene.add(g);
    const defs = [[this.tex.outer, 1, 0, .3, c1], [skin || this.tex.mid, skin ? .92 : .86, .02, -.55, c1], [this.tex.inner, .5, .04, 1.1, c2]], ls = [];
    const under = new T.Mesh(this.plane, this._mat(this.tex.glow, c1)); under.rotation.x = -Math.PI / 2; under.position.y = -.02; g.add(under);
    defs.forEach(d => { const piv = new T.Group(), m = new T.Mesh(this.plane, this._mat(d[0], d[4])); m.rotation.x = -Math.PI / 2; piv.add(m); piv.position.y = d[2]; g.add(piv); ls.push({ piv, m, sf: d[1], spin: d[3] }); });
    const o = { pulse: 0 };
    this.add((dt, t) => {
      const k = easeBack(clamp(t / .55)), fade = clamp((life - t) / .7), pulse = 1 + .07 * o.pulse; o.pulse *= Math.exp(-4 * dt);
      under.scale.setScalar(R * 2.5 * k * pulse); under.material.opacity = .4 * fade;
      ls.forEach(l => { l.piv.rotation.y += l.spin * dt * (1 + 3 * o.pulse); l.piv.scale.setScalar(Math.max(.001, R * l.sf * k * pulse)); l.m.material.opacity = clamp(t / .25) * fade * (.88 + .12 * Math.sin(t * 9)); });
      return t < life;
    }, () => { this.scene.remove(g); g.traverse(n => n.material && n.material.dispose()); });
    return o;
  }
  pillar(pos, R, col, h, life) {
    const m = new T.Mesh(this.cyl, new T.ShaderMaterial({ transparent: true, depthWrite: false, blending: AB, side: T.DoubleSide, uniforms: { uCol: { value: col }, uT: { value: 0 }, uA: { value: 1 } },
      vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader: 'varying vec2 vUv;uniform vec3 uCol;uniform float uT,uA;void main(){float y=vUv.y;float s=.55+.45*sin(vUv.x*62.83+uT*4.+y*8.);float s2=.6+.4*sin(vUv.x*25.13-uT*3.+y*14.);float a=pow(1.-y,1.3)*s*s2*uA;gl_FragColor=vec4(uCol*1.4,a);}' }));
    m.position.copy(pos); this.scene.add(m);
    this.add((dt, t) => { m.scale.set(R * (1 + .15 * Math.sin(t * 20)) * (1 - .35 * clamp(t / life)), h * easeOut(clamp(t / .22)), R * (1 - .35 * clamp(t / life))); m.material.uniforms.uT.value = t; m.material.uniforms.uA.value = clamp((life - t) / .5); return t < life; },
      () => { this.scene.remove(m); m.material.dispose(); });
  }
  ring(pos, maxR, col, dur, y) {
    const m = new T.Mesh(this.plane, this._mat(this.tex.ring, col)); m.rotation.x = -Math.PI / 2; m.position.copy(pos); m.position.y += y || .15; this.scene.add(m);
    this.add((dt, t) => { const k = clamp(t / dur); m.scale.setScalar(Math.max(.01, maxR * easeOut(k))); m.material.opacity = (1 - k) * (1 - k); return t < dur; }, () => { this.scene.remove(m); m.material.dispose(); });
  }
  flash(pos, size, col, dur) {
    const s = new T.Sprite(new T.SpriteMaterial({ map: this.tex.glow, color: col, blending: AB, transparent: true, depthWrite: false })); s.position.copy(pos); this.scene.add(s);
    this.add((dt, t) => { const k = clamp(t / dur); s.scale.setScalar(size * (1 + k * .6)); s.material.opacity = (1 - k) * (1 - k); return t < dur; }, () => { this.scene.remove(s); s.material.dispose(); });
    return s;
  }
  burst(pos, n, o) {
    const c0 = o.c0, c1 = o.c1;
    for (let i = 0; i < n; i++) {
      const a = rnd() * PI2, u = rnd() * 2 - 1, sp = o.speed * (.4 + rnd() * .8), r = Math.sqrt(1 - u * u * (o.flat === undefined ? 1 : o.flat));
      this.p.emit(pos.x, pos.y, pos.z, Math.cos(a) * r * sp, (o.up || 0) * (.5 + rnd()) + u * sp * (o.flat === undefined ? 1 : o.flat), Math.sin(a) * r * sp,
        o.life * (.6 + rnd() * .6), o.s0 * (.6 + rnd() * .8), o.s1 || 0, c0, c1, o.grav, o.drag === undefined ? 1.2 : o.drag);
    }
  }
  bolt(a, b, col, core, w, depth) {
    const n = 14, dir = b.clone().sub(a), len = dir.length(), pts = [a.clone()];
    const up = Math.abs(dir.y) > .9 * len ? new T.Vector3(1, 0, 0) : new T.Vector3(0, 1, 0), p1 = new T.Vector3().crossVectors(dir, up).normalize(), p2 = new T.Vector3().crossVectors(dir, p1).normalize();
    for (let i = 1; i < n; i++) pts.push(a.clone().addScaledVector(dir, i / n).addScaledVector(p1, (rnd() - .5) * len * .09).addScaledVector(p2, (rnd() - .5) * len * .09));
    pts.push(b.clone());
    for (let i = 0; i < pts.length - 1; i++) {
      const s = pts[i], e = pts[i + 1], seg = s.distanceTo(e), steps = Math.max(1, Math.ceil(seg / (.3 * w)));
      for (let j = 0; j < steps; j++) {
        const q = s.clone().lerp(e, j / steps);
        this.p.emit(q.x, q.y, q.z, 0, 0, 0, .16 + rnd() * .14, w * 1.1, .05, core, col, 0, 0);
        this.p.emit(q.x, q.y, q.z, 0, 0, 0, .3 + rnd() * .2, w * 3.2, .3, col, col, 0, 0);
      }
      if (!depth && i > 1 && rnd() < .3) { const br = e.clone().add(new T.Vector3((rnd() - .5) * len * .35, -rnd() * len * .25, (rnd() - .5) * len * .35)); this.bolt(e, br, col, core, w * .55, 1); }
    }
  }
  ember(pos, n, R, c0, c1, up) { for (let i = 0; i < n; i++) { const a = rnd() * PI2, r = Math.sqrt(rnd()) * R; this.p.emit(pos.x + Math.cos(a) * r, pos.y + .1, pos.z + Math.sin(a) * r, 0, (up || 3) * (.5 + rnd()), 0, 1 + rnd(), .3 + rnd() * .3, 0, c0, c1, -.2, .3); } }

  /* --- умения --- */
  cast(kind, pos, o) { o = o || {}; const f = VFX.kinds[kind]; if (!f) throw new Error('VFX: нет умения ' + kind); f(this, pos.clone(), o.scale || 1); }
}


/* ---------- разломы пространства ---------- */
VFX.prototype._riftTex = function () {
  const W = 512, H = 1024, R = mulberry((rnd() * 1e9) | 0), n = 26, L = [], Rt = [];
  for (let i = 0; i <= n; i++) { const v = i / n, y = v * 2 - 1, wv = (1 - Math.pow(Math.abs(y), 1.5)) * 200 + 3, j = (R() - .5) * 60 * (1 - Math.abs(y) * .5);
    L.push([W / 2 - wv + j + (R() - .5) * 30, v * H]); Rt.push([W / 2 + wv + j + (R() - .5) * 30, v * H]); }
  const path = x => { x.beginPath(); x.moveTo(L[0][0], L[0][1]); for (let i = 1; i <= n; i++) x.lineTo(L[i][0], L[i][1]); for (let i = n; i >= 0; i--) x.lineTo(Rt[i][0], Rt[i][1]); x.closePath(); };
  const mk = f => { const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); f(x); const t = new T.CanvasTexture(c); return t; };
  const mask = mk(x => { x.fillStyle = '#000'; x.fillRect(0, 0, W, H); x.fillStyle = '#fff'; x.shadowColor = '#fff'; x.shadowBlur = 6; path(x); x.fill(); });
  const edge = mk(x => { x.lineJoin = 'round'; x.strokeStyle = '#fff'; x.shadowColor = '#fff'; x.shadowBlur = 34; x.lineWidth = 7; path(x); x.stroke(); x.shadowBlur = 10; x.lineWidth = 2.5; path(x); x.stroke();
    x.lineWidth = 2; for (let b = 0; b < 12; b++) { const side = R() < .5 ? L : Rt, i = 3 + (R() * (n - 6) | 0); let px = side[i][0], py = side[i][1], dir = side === L ? -1 : 1; x.beginPath(); x.moveTo(px, py);
      for (let k = 0; k < 4; k++) { px += dir * (14 + R() * 26); py += (R() - .5) * 46; x.lineTo(px, py); } x.stroke(); } });
  return { mask, edge };
};
VFX.prototype.riftOne = function (pos, S, yaw, roll, life) {
  const W = 4.2 * S, H = 9 * S, tx = this._riftTex(), g = new T.Group(), h = new T.Group(); g.position.copy(pos); g.position.y += H / 2 + .2 * S; g.rotation.y = yaw; h.rotation.z = roll; g.add(h); this.scene.add(g);
  const hasN = !!this.skins.nebula;
  const inner = new T.Mesh(this.plane, new T.ShaderMaterial({ transparent: true, depthWrite: false, side: T.DoubleSide,
    uniforms: { uMask: { value: tx.mask }, uNeb: { value: this.skins.nebula || null }, uT: { value: 0 }, uHas: { value: hasN ? 1 : 0 }, uA: { value: new T.Color(0x3a1a8a) }, uB: { value: new T.Color(0x20c0ff) } },
    vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: 'uniform sampler2D uMask,uNeb;uniform float uT,uHas;uniform vec3 uA,uB;varying vec2 vUv;float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){float m=texture2D(uMask,vUv).r;vec2 q=vUv*vec2(1.2,2.2)+vec2(uT*.03,-uT*.06);vec3 n;if(uHas>.5){n=texture2D(uNeb,q).rgb*1.2+texture2D(uNeb,q*1.7+.3).rgb*.5;}else{float a=sin(q.x*9.+uT)+sin(q.y*11.-uT*1.3)+sin((q.x+q.y)*7.+uT*.7)+sin(length(q-vec2(.6,1.1))*14.-uT*2.);n=mix(uA,uB,.5+.2*a)*.75;}vec2 gp=floor(vUv*vec2(70.,140.));float st=step(.982,h(gp))*(.5+.5*sin(uT*3.+h(gp)*30.));vec3 col=n*.85+vec3(st);gl_FragColor=vec4(col,m);}' }));
  inner.scale.set(W / 2, H / 2, 1); h.add(inner);
  const edge = new T.Mesh(this.plane, this._mat(tx.edge, this.col(0xb98cff))); edge.scale.set(W / 2 * 1.02, H / 2 * 1.02, 1); edge.position.z = .02; h.add(edge);
  const halo = new T.Mesh(this.plane, this._mat(this.tex.glow, this.col(0x7a4cff))); halo.scale.set(W * 1.6, H * .75, 1); halo.position.z = -.05; h.add(halo);
  const wAt = y => (1 - Math.pow(Math.abs(y), 1.5)) * 200 / 512 * W * 1.0, cy = Math.cos(yaw), sy = Math.sin(yaw), cr = Math.cos(roll), sr = Math.sin(roll);
  const world = (lx, ly) => { const x = lx * cr - ly * sr, y = lx * sr + ly * cr; return new T.Vector3(g.position.x + x * cy, g.position.y + y, g.position.z - x * sy); };
  const pa = this.col(0xe8d8ff), pb = this.col(0x6a3cff), pc = this.col(0x6cf0ff);
  this.add((dt, t) => {
    const cl = 1 - clamp((life - t) / .5), ox = easeBack(clamp((t - .04) / .5)) * (1 + .03 * Math.sin(t * 31)) * (1 - cl), oy = easeOut(clamp(t / .3)) * (1 - cl * .25);
    h.scale.set(Math.max(.001, ox), Math.max(.001, oy), 1); inner.material.uniforms.uT.value = t; edge.material.opacity = (.85 + .15 * Math.sin(t * 41)) * (1 - cl * .6); halo.material.opacity = .55 * (1 - cl) * clamp(t / .2);
    if (cl < 1) for (let i = 0; i < 5; i++) { const y = (rnd() * 2 - 1), side = rnd() < .5 ? -1 : 1, lx = side * wAt(y) * H / H * (.85 + rnd() * .3), p = world(lx, y * H / 2 * .96);
      this.p.emit(p.x, p.y, p.z, side * cy * (1 + rnd() * 3), 1 + rnd() * 3, -side * sy * (1 + rnd() * 3), .7 + rnd() * .6, .3 * S, 0, pa, pb, 1.5, .8); }
    if (t < life - .6 && rnd() < .5) { const a = rnd() * PI2, r = (5 + rnd() * 4) * S, c = world(0, 0); this.p.emit(c.x + Math.cos(a) * r, g.position.y + (rnd() - .5) * H * .6, c.z + Math.sin(a) * r, -Math.cos(a) * r * 1.4, 0, -Math.sin(a) * r * 1.4, .7, .3 * S, 0, pc, pb, 0, 0); }
    return t < life;
  }, () => { this.scene.remove(g); [tx.mask, tx.edge].forEach(x => x.dispose()); inner.material.dispose(); edge.material.dispose(); halo.material.dispose(); });
  const c0 = world(0, 0);
  this.burst(new T.Vector3(pos.x, pos.y + .4, pos.z), 70, { speed: 9 * S, up: 7 * S, flat: .2, life: 1.2, s0: .35 * S, grav: 12, drag: .4, c0: pa, c1: pc });
  this.flash(c0, 11 * S, this.col(0xa070ff), .5);
};
VFX.prototype.crackGround = function (pos, R, col, life) {
  let map = this.skins.crack, own = false;
  if (!map) { own = true; const S = 1024, C = S / 2, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d'); x.strokeStyle = '#fff'; x.shadowColor = '#fff'; x.shadowBlur = 16; x.lineCap = x.lineJoin = 'round';
    const branch = (px, py, a, len, w, d) => { x.lineWidth = w; x.beginPath(); x.moveTo(px, py); const st = 9; for (let i = 0; i < st; i++) { a += (rnd() - .5) * .7; px += Math.cos(a) * len / st; py += Math.sin(a) * len / st; x.lineTo(px, py);
        if (d < 2 && rnd() < .28) { x.stroke(); branch(px, py, a + (rnd() < .5 ? -1 : 1) * (.5 + rnd() * .6), len * .5, w * .6, d + 1); x.lineWidth = w; x.beginPath(); x.moveTo(px, py); } } x.stroke(); };
    for (let i = 0; i < 16; i++) branch(C, C, i / 16 * PI2 + rnd() * .3, C * (.55 + rnd() * .4), 6, 0);
    map = new T.CanvasTexture(c); }
  const m = new T.Mesh(this.plane, this._mat(map, col)); m.rotation.x = -Math.PI / 2; m.position.copy(pos); m.position.y += .05; this.scene.add(m);
  this.add((dt, t) => { const k = clamp(t / .4); m.scale.setScalar(Math.max(.01, R * (.4 + .6 * easeOut(k)))); m.material.opacity = clamp(t / .08) * clamp((life - t) / 1) * (.85 + .15 * Math.sin(t * 25)); return t < life; },
    () => { this.scene.remove(m); m.material.dispose(); if (own) map.dispose(); });
};

VFX.kinds = {
  /* Разломы: три раскола пространства с космосом внутри, трещины на земле, обломки */
  rift(fx, pos, s) {
    const c1 = fx.col(0x9a5cff), c2 = fx.col(0x5cf0ff), yaw0 = Math.atan2(fx.camera.position.x - pos.x, fx.camera.position.z - pos.z), rx = Math.cos(yaw0), rz = -Math.sin(yaw0);
    fx.crackGround(pos, 8.5 * s, c2, 3.6); fx.ring(pos, 9 * s, c1, .8); fx.flashLight(0x9a6cff, 16, pos, 4); fx.shake(.55 * s, .7);
    [[0, 0, 0, 0, 1], [.22, -5.4, -1.8, .25, .68], [.38, 5.8, -1.2, -.28, .6]].forEach(c => fx.after(c[0], () => {
      const p = new T.Vector3(pos.x + (rx * c[1] + 0) * s, pos.y, pos.z + (rz * c[1] + 0) * s); p.x += (-rz) * c[2] * s * .0; fx.riftOne(p, s * c[4], yaw0 + c[3] * .4, c[3], 3.4 - c[0]); fx.shake(.3 * s, .35); }));
    fx.after(3.1, () => { fx.flash(pos.clone().setY(pos.y + 4 * s), 14 * s, c1, .45); fx.ring(pos, 6 * s, c2, .6); fx.shake(.3 * s, .4); });
  },
  /* Аркан: фиолетовый круг, столб света, звёздный взрыв */
  arcane(fx, pos, s) {
    const c1 = fx.col(0xa070ff), c2 = fx.col(0x60e8ff), R = 4.2 * s, white = fx.col(0xffffff), c = fx.circle(pos, R, c1, c2, 3.4, fx.skins.arcane);
    fx.run(.8, () => { for (let i = 0; i < 6; i++) { const a = rnd() * PI2; fx.p.emit(pos.x + Math.cos(a) * R * .95, pos.y + .2, pos.z + Math.sin(a) * R * .95, 0, 3 + rnd() * 4, 0, .9, .45 * s, 0, c2, c1, 0, .2); } });
    fx.after(.8, () => {
      c.pulse = 1; fx.pillar(pos, R * .75, c2, 26 * s, 1.5); fx.ring(pos, R * 3.4, c1, .9); fx.ring(pos, R * 2.2, c2, .7); fx.flash(pos.clone().setY(pos.y + 1.5), 14 * s, c2, .5);
      fx.flashLight(0x9d7bff, 14, pos, 4); fx.shake(.35 * s, .5);
      fx.burst(pos.clone().setY(pos.y + .3), 170, { speed: 9 * s, up: 12 * s, flat: .15, life: 1.4, s0: .5 * s, grav: 4, c0: white, c1: c1 });
    });
    fx.run(2, (dt, k) => { if (k > .35) for (let i = 0; i < 4; i++) { const a = rnd() * PI2, r = Math.sqrt(rnd()) * R * .8; fx.p.emit(pos.x + Math.cos(a) * r, pos.y + .2, pos.z + Math.sin(a) * r, 0, 4 + rnd() * 8, 0, 1.1, .35 * s, 0, c2, c1, 0, .4); } });
  },
  /* Огонь: оранжевый круг и огненная волна наружу */
  fire(fx, pos, s) {
    const c1 = fx.col(0xff6a1a), c2 = fx.col(0xffd060), R = 3.6 * s, c = fx.circle(pos, R, c1, c2, 3.2, fx.skins.fire), hot = fx.col(0xfff2b0), red = fx.col(0xb01800), dark = fx.col(0x300800);
    fx.run(.7, () => { fx.ember(pos, 5, R * .9, c2, c1, 5 * s); });
    fx.after(.7, () => {
      c.pulse = 1; fx.ring(pos, R * 4.2, c1, .8); fx.after(.12, () => fx.ring(pos, R * 3, c2, .7)); fx.flash(pos.clone().setY(pos.y + 1.5), 12 * s, c2, .45);
      fx.flashLight(0xff7a2a, 16, pos, 3); fx.shake(.5 * s, .6);
      fx.run(1.1, (dt, k) => { const front = R * (.3 + 3.4 * easeOut(k));
        for (let i = 0; i < 46; i++) { const a = rnd() * PI2, r = front * (.55 + rnd() * .45); fx.p.emit(pos.x + Math.cos(a) * r, pos.y + .3, pos.z + Math.sin(a) * r, Math.cos(a) * 2, 2 + rnd() * 5, Math.sin(a) * 2, .7 + rnd() * .6, 1.5 * s, .2, hot, red, -3, .5); }
        for (let i = 0; i < 4; i++) { const a = rnd() * PI2, r = front * rnd(); fx.p.emit(pos.x + Math.cos(a) * r, pos.y + 1, pos.z + Math.sin(a) * r, 0, 2 + rnd() * 3, 0, 1.4, 2.6 * s, 3 * s, red, dark, -1, .5); } });
      fx.burst(pos.clone().setY(pos.y + .5), 120, { speed: 12 * s, up: 8 * s, flat: .3, life: 1.6, s0: .35 * s, grav: 9, drag: .6, c0: c2, c1: c1 });
    });
  },
  /* Молния: серия ударов с неба */
  lightning(fx, pos, s) {
    const c1 = fx.col(0x6ab4ff), c2 = fx.col(0xeaf6ff), R = 4 * s, c = fx.circle(pos, R, c1, c2, 3);
    fx.run(.6, () => { for (let i = 0; i < 3; i++) { const a = rnd() * PI2; fx.p.emit(pos.x + Math.cos(a) * R, pos.y + .2, pos.z + Math.sin(a) * R, 0, 1, 0, .3, .5 * s, 0, c2, c1, 0, 0); } });
    const strike = (target, big) => {
      const from = target.clone().add(new T.Vector3((rnd() - .5) * 6, 28, (rnd() - .5) * 6));
      fx.bolt(from, target, c1, c2, (big ? 1.5 : .85) * s, 0); fx.flash(target.clone().setY(target.y + 1), (big ? 16 : 7) * s, c2, big ? .35 : .22); fx.ring(target, (big ? 9 : 4) * s, c1, .45);
      fx.flashLight(0xbfe0ff, big ? 22 : 10, target, 4); fx.burst(target.clone().setY(target.y + .3), big ? 90 : 36, { speed: 9 * s, up: 6 * s, flat: .3, life: .7, s0: .35 * s, grav: 10, c0: c2, c1: c1 }); fx.shake((big ? .5 : .22) * s, .3);
    };
    fx.after(.65, () => { c.pulse = 1; strike(pos, true); });
    for (let i = 0; i < 6; i++) fx.after(.85 + i * .13, () => { const a = rnd() * PI2, r = Math.sqrt(rnd()) * R * 1.4; strike(pos.clone().add(new T.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)), false); });
  },
  /* Пустота: воронка втягивает свет, затем коллапс и взрыв */
  void(fx, pos, s) {
    const c1 = fx.col(0xc040ff), c2 = fx.col(0x40e0ff), R = 4.4 * s, white = fx.col(0xffffff), c = fx.circle(pos, R, c1, c2, 3.6, fx.skins.void), core = pos.clone().setY(pos.y + 2.2 * s);
    const orb = fx.flash(core, .1, c1, 1.7);   // ядро: размер задаём сами
    fx.add((dt, t) => { const k = t < 1.5 ? easeOut(t / 1.5) : 0; orb.scale.setScalar(Math.max(.01, 6 * s * k * (1 + .08 * Math.sin(t * 25)))); orb.material.opacity = t < 1.5 ? .95 : 0; return t < 1.6; });
    fx.run(1.5, (dt, k) => { for (let i = 0; i < 14; i++) { const a = rnd() * PI2, r = R * (1.1 + rnd() * .9) * (1 - .4 * k), sp = 5 + 10 * k;
      fx.p.emit(pos.x + Math.cos(a) * r, pos.y + .3 + rnd() * 3 * s, pos.z + Math.sin(a) * r, -Math.cos(a) * sp - Math.sin(a) * 6, 1.5, -Math.sin(a) * sp + Math.cos(a) * 6, .6, .55 * s, .1, c2, c1, 0, 0); } });
    fx.after(1.5, () => {
      c.pulse = 1.5; fx.flash(core, 22 * s, white, .5); fx.ring(pos, R * 4.6, c1, 1); fx.after(.1, () => fx.ring(pos, R * 3, c2, .8)); fx.pillar(pos, R * .55, c1, 22 * s, 1);
      fx.flashLight(0xc060ff, 20, pos, 4); fx.shake(.7 * s, .7);
      fx.burst(core, 260, { speed: 15 * s, up: 2, flat: 1, life: 1.3, s0: .5 * s, grav: 0, drag: 1.6, c0: white, c1: c1 });
    });
  }
};

global.VFX = VFX;
})(window);
