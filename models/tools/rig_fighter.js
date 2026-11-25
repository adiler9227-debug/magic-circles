// Скелет + веса + 2 анимации удара для fighter_game.glb  →  fighter_rigged.glb
// Запуск: node tools/rig_fighter.js   (из папки models). Рост ≈ 1.0, y от -0.5 до 0.5, лицо в +Z, правая рука персонажа при x<0.
const fs = require("fs"), path = require("path");
const { read, write } = require("./glb.js");
const legs = require('./legs.js');
const LEG = {"hipY":-0.027,"kneeY":-0.26,"ankleY":-0.41,"hipX":0.048,"kneeX":0.069,"ankleX":0.09,"z":-0.01,"kneeZ":0,"ankleZ":-0.02,"split":0.02};
const SRC = "fighter_game.glb", OUT = "fighter_rigged.glb";
const g = read(SRC), j0 = g.j, prim = j0.meshes[0].primitives[0];
const P = g.acc(prim.attributes.POSITION).data, UV = g.acc(prim.attributes.TEXCOORD_0).data, IDX = g.acc(prim.indices).data;
const N = P.length / 3;
// ---------- кости (позиции в покое) ----------
const BONES = [
  ['root',      null,        [0, -0.50, -0.01]],
  ['hips',      'root',      [0,  0.00, -0.01]],
  ['spine',     'hips',      [0,  0.12, -0.01]],
  ['chest',     'spine',     [0,  0.23, -0.015]],
  ['neck',      'chest',     [0,  0.33, -0.02]],
  ['head',      'neck',      [0,  0.36, -0.02]],
  ['shoulder.R','chest',     [-0.06, 0.27, -0.03]],
  ['upperarm.R','shoulder.R',[-0.13, 0.255, -0.035]],
  ['forearm.R', 'upperarm.R',[-0.20, 0.145, -0.03]],
  ['hand.R',    'forearm.R', [-0.272, 0.06, 0.0]],
  ['shoulder.L','chest',     [0.06,  0.27, -0.03]],
  ['upperarm.L','shoulder.L',[0.13,  0.255, -0.035]],
  ['forearm.L', 'upperarm.L',[0.20,  0.145, -0.03]],
  ['hand.L',    'forearm.L', [0.272, 0.06, 0.0]],
];
BONES.push(...legs.bones(LEG));
const BI = Object.fromEntries(BONES.map((b, i) => [b[0], i]));
const bp = n => BONES[BI[n]][2];

function segDist(p, a, b) { const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], ap = [p[0] - a[0], p[1] - a[1], p[2] - a[2]];
  let t = (ap[0] * ab[0] + ap[1] * ab[1] + ap[2] * ab[2]) / (ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2); t = Math.max(0, Math.min(1, t));
  return [Math.hypot(ap[0] - ab[0] * t, ap[1] - ab[1] * t, ap[2] - ab[2] * t), t]; }
const ss = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

// ---------- веса ----------
const JOINTS = new Uint16Array(N * 4), WEIGHTS = new Float32Array(N * 4);
const stats = { armR: 0, armL: 0, head: 0 };
for (let i = 0; i < N; i++) {
  const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2], p = [x, y, z], w = {};
  const add = (n, v) => { if (v > 1e-4) w[n] = (w[n] || 0) + v; };
  const torso = {};
  if (y < 0.0) torso.hips = 1;
  else if (y < 0.12) { const t = ss(0.0, 0.12, y); torso.hips = 1 - t; torso.spine = t; }
  else if (y < 0.23) { const t = ss(0.12, 0.23, y); torso.spine = 1 - t; torso.chest = t; }
  else torso.chest = 1;
  // голова (с волосами): выше шеи
  let hw = ss(0.315, 0.345, y) * ss(0.12, 0.08, Math.abs(x));
  if (hw > 0) stats.head++;
  if (y > 0.3 && y < 0.36 && hw < 1) { torso.neck = (torso.neck || 0) + 0.4 * (1 - hw); torso.chest = (torso.chest || 0) * 0.6; }
  // руки: в А-позе отделены от тела
  let armW = 0, armBones = {};
  if (y > -0.05) for (const s of ['R', 'L']) {
    const sh = bp('upperarm.' + s), el = bp('forearm.' + s), ha = bp('hand.' + s), sx = s === 'R' ? -1 : 1, ax = x * sx;
    if (ax < 0.07) continue;
    const [du] = segDist(p, sh, el), [df] = segDist(p, el, ha), dhd = Math.hypot(x - (ha[0] + sx * 0.015), y - (ha[1] - 0.025), z - ha[2]);
    const d = Math.min(du, df, dhd);
    // у плеча (наплечник, дельта) — мягкий переход к груди
    const gate = y > 0.2 ? ss(0.075, 0.13, ax) : ss(0.10, 0.135, ax);
    const a = Math.max(ss(0.07, 0.045, d) * gate, ss(0.15, 0.17, ax));  // дальше 0.17 от центра — только рука
    if (a <= 0) continue;
    const iu = 1 / (du ** 4 + 1e-7), iF = 1 / (df ** 4 + 1e-7), ih = 1 / (dhd ** 4 + 1e-7), sum = iu + iF + ih;
    armBones['upperarm.' + s] = a * iu / sum; armBones['forearm.' + s] = a * iF / sum; armBones['hand.' + s] = a * ih / sum;
    armW = Math.max(armW, a); stats['arm' + s]++;
  }
  { const lg = legs.weights(x, y, z, LEG); if (lg.k > 0) { for (const n in torso) torso[n] *= 1 - lg.k; for (const n in lg.w) torso[n] = (torso[n] || 0) + lg.w[n] * lg.k; } }
  const rest = 1 - Math.min(1, hw + armW);
  for (const n in torso) add(n, torso[n] * rest);
  for (const n in armBones) add(n, armBones[n]);
  add('head', hw * (1 - armW));
  const L = Object.entries(w).sort((a, b) => b[1] - a[1]).slice(0, 4), s = L.reduce((a, b) => a + b[1], 0) || 1;
  if (!L.length) L.push(['hips', 1]);
  L.forEach(([n, v], k) => { JOINTS[i * 4 + k] = BI[n]; WEIGHTS[i * 4 + k] = v / s; });
}

// ---------- анимации ----------
const qx = a => [Math.sin(a / 2), 0, 0, Math.cos(a / 2)], qy = a => [0, Math.sin(a / 2), 0, Math.cos(a / 2)], qz = a => [0, 0, Math.sin(a / 2), Math.cos(a / 2)];
const qm = (a, b) => [a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1], a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0], a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3], a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]];
const D = Math.PI / 180, Q0 = [0, 0, 0, 1];
// qz(+) выпрямляет правую руку к телу, qz(-) — левую; qx(-) поднимает руку вперёд
const CLIPS = {
  // прямой удар правой: замах (кулак к груди, корпус назад) → выброс вперёд → возврат
  cast_punch: [
    [0.00, {}],
    [0.12, { 'thigh.L': qx(8 * D), 'thigh.R': qx(-6 * D), 'upperarm.R': qm(qx(-20 * D), qz(20 * D)), 'forearm.R': qm(qx(-110 * D), qz(8 * D)), chest: qy(-18 * D), spine: qy(-6 * D), 'upperarm.L': qm(qx(-35 * D), qz(-20 * D)), 'forearm.L': qx(-80 * D) }],
    [0.24, { 'thigh.L': qx(-24 * D), 'shin.L': qx(20 * D), 'thigh.R': qx(14 * D), 'shin.R': qx(12 * D), 'upperarm.R': qm(qx(-85 * D), qz(36 * D)), 'forearm.R': qz(8 * D), 'hand.R': qx(-10 * D), chest: qy(22 * D), spine: qy(8 * D), head: qy(-12 * D), 'upperarm.L': qm(qx(-25 * D), qz(-15 * D)), 'forearm.L': qx(-90 * D) }],
    [0.50, { 'thigh.L': qx(-22 * D), 'shin.L': qx(18 * D), 'thigh.R': qx(13 * D), 'shin.R': qx(11 * D), 'upperarm.R': qm(qx(-82 * D), qz(36 * D)), 'forearm.R': qz(8 * D), 'hand.R': qx(-10 * D), chest: qy(20 * D), spine: qy(7 * D), head: qy(-11 * D), 'upperarm.L': qm(qx(-25 * D), qz(-15 * D)), 'forearm.L': qx(-90 * D) }],
    [0.90, {}],
  ],
  // двуручный удар сверху: руки вверх, корпус назад → удар вниз-вперёд → возврат
  cast_heavy: [
    [0.00, {}],
    [0.35, { 'thigh.L': qx(-8 * D), 'thigh.R': qx(-8 * D), 'shin.L': qx(10 * D), 'shin.R': qx(10 * D), 'upperarm.R': qm(qx(-150 * D), qz(25 * D)), 'forearm.R': qx(-50 * D), 'upperarm.L': qm(qx(-150 * D), qz(-25 * D)), 'forearm.L': qx(-50 * D), chest: qx(-12 * D), spine: qx(-5 * D), head: qx(-8 * D) }],
    [0.55, { 'thigh.L': qx(-30 * D), 'thigh.R': qx(-26 * D), 'shin.L': qx(42 * D), 'shin.R': qx(38 * D), 'foot.L': qx(-12 * D), 'foot.R': qx(-12 * D), 'upperarm.R': qm(qx(-55 * D), qz(30 * D)), 'forearm.R': qx(-15 * D), 'upperarm.L': qm(qx(-55 * D), qz(-30 * D)), 'forearm.L': qx(-15 * D), chest: qx(22 * D), spine: qx(10 * D), head: qx(-10 * D) }],
    [0.85, { 'thigh.L': qx(-28 * D), 'thigh.R': qx(-24 * D), 'shin.L': qx(40 * D), 'shin.R': qx(36 * D), 'foot.L': qx(-12 * D), 'foot.R': qx(-12 * D), 'upperarm.R': qm(qx(-52 * D), qz(30 * D)), 'forearm.R': qx(-15 * D), 'upperarm.L': qm(qx(-52 * D), qz(-30 * D)), 'forearm.L': qx(-15 * D), chest: qx(20 * D), spine: qx(9 * D), head: qx(-9 * D) }],
    [1.30, {}],
  ],
};

Object.assign(CLIPS, require('./walk.js')({ qx, qy, qz, qm, D }, {armIn:28}));
// ---------- сборка glTF ----------
const j = { asset: { version: '2.0', generator: 'magic-circles rig.js' }, scene: 0, scenes: [{ nodes: [0] }],
  samplers: j0.samplers, images: [], textures: j0.textures, materials: j0.materials, accessors: [], bufferViews: [], buffers: [], nodes: [], meshes: [], skins: [], animations: [] };
const chunks = [];
const addAcc = (data, type, ct, extra = {}) => { chunks.push({ data, target: extra.target }); delete extra.target; j.accessors.push(Object.assign({ bufferView: chunks.length - 1, componentType: ct, count: data.length / { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 }[type], type }, extra)); return j.accessors.length - 1; };
// изображения
j0.images.forEach((im, k) => { chunks.push({ data: g.img(k) }); j.images.push({ bufferView: chunks.length - 1, mimeType: im.mimeType }); });
// геометрия
const pmin = [1e9, 1e9, 1e9], pmax = [-1e9, -1e9, -1e9]; for (let i = 0; i < N; i++) for (let k = 0; k < 3; k++) { pmin[k] = Math.min(pmin[k], P[i * 3 + k]); pmax[k] = Math.max(pmax[k], P[i * 3 + k]); }
const aPos = addAcc(new Float32Array(P), 'VEC3', 5126, { min: pmin, max: pmax, target: 34962 });
const aUV = addAcc(new Float32Array(UV), 'VEC2', 5126, { target: 34962 });
const aJ = addAcc(JOINTS, 'VEC4', 5123, { target: 34962 });
const aW = addAcc(WEIGHTS, 'VEC4', 5126, { target: 34962 });
const aI = addAcc(N < 65536 ? new Uint16Array(IDX) : new Uint32Array(IDX), 'SCALAR', N < 65536 ? 5123 : 5125, { target: 34963 });
j.meshes.push({ name: "fighter", primitives: [{ attributes: { POSITION: aPos, TEXCOORD_0: aUV, JOINTS_0: aJ, WEIGHTS_0: aW }, indices: aI, material: 0, mode: 4 }] });
// узлы: 0 = корень "mage", 1 = меш, 2.. = кости
j.nodes.push({ name: "fighter", children: [1, 2] });
j.nodes.push({ name: "fighter_mesh", mesh: 0, skin: 0 });
const boneNode = n => 2 + BI[n];
BONES.forEach(([n, par, pos]) => {
  const pp = par ? bp(par) : [0, 0, 0];
  const node = { name: n, translation: [pos[0] - pp[0], pos[1] - pp[1], pos[2] - pp[2]] };
  const kids = BONES.filter(b => b[1] === n).map(b => boneNode(b[0])); if (kids.length) node.children = kids;
  j.nodes.push(node);
});
const IBM = new Float32Array(16 * BONES.length);
BONES.forEach(([, , p], k) => { const m = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -p[0], -p[1], -p[2], 1]; IBM.set(m, k * 16); });
j.skins.push({ name: "fighter_skin", joints: BONES.map(b => boneNode(b[0])), skeleton: boneNode('root'), inverseBindMatrices: addAcc(IBM, 'MAT4', 5126) });
// анимации
for (const [name, keys] of Object.entries(CLIPS)) {
  const times = new Float32Array(keys.map(k => k[0])), aT = addAcc(times, 'SCALAR', 5126, { min: [times[0]], max: [times[times.length - 1]] });
  const used = [...new Set(keys.flatMap(k => Object.keys(k[1])))];
  const anim = { name, samplers: [], channels: [] };
  used.forEach(bn => {
    const out = new Float32Array(keys.length * 4); keys.forEach((k, i) => out.set(k[1][bn] || Q0, i * 4));
    anim.samplers.push({ input: aT, output: addAcc(out, 'VEC4', 5126), interpolation: 'LINEAR' });
    anim.channels.push({ sampler: anim.samplers.length - 1, target: { node: boneNode(bn), path: 'rotation' } });
  });
  j.animations.push(anim);
}
write(OUT, j, chunks);
console.log('verts', N, 'tris', IDX.length / 3, stats, 'size', fs.statSync(OUT).size);
