// Скелет + веса + 2 анимации каста для mage_game.glb  →  mage_rigged.glb
// Запуск: node tools/rig.js   (из папки models)
// Единицы — исходные единицы модели (рост ≈ 1.0, y от -0.5 до 0.5, лицо смотрит в +Z, посох в левой руке персонажа, x>0).
const fs = require('fs'), path = require('path');
const { read, write } = require('./glb.js');
const legs = require('./legs.js');
const LEG = {"hipY":-0.12,"kneeY":-0.3,"ankleY":-0.45,"hipX":0.04,"kneeX":0.045,"ankleX":0.05,"z":0.06,"split":0.03};
const SRC = 'mage_game.glb', OUT = 'mage_rigged.glb';

const g = read(SRC), j0 = g.j, prim = j0.meshes[0].primitives[0];
const P = g.acc(prim.attributes.POSITION).data, UV = g.acc(prim.attributes.TEXCOORD_0).data, IDX = g.acc(prim.indices).data;
const N = P.length / 3;

// ---------- кости (позиции в покое, мировые) ----------
const BONES = [
  ['root',      null,        [0, -0.50, 0.03]],
  ['hips',      'root',      [0, -0.08, 0.06]],
  ['spine',     'hips',      [0,  0.06, 0.065]],
  ['chest',     'spine',     [0,  0.17, 0.07]],
  ['neck',      'chest',     [-0.005, 0.24, 0.075]],
  ['head',      'neck',      [-0.005, 0.27, 0.08]],
  ['shoulder.R','chest',     [-0.06, 0.225, 0.07]],
  ['upperarm.R','shoulder.R',[-0.105, 0.225, 0.07]],
  ['forearm.R', 'upperarm.R',[-0.13,  0.06,  0.08]],
  ['hand.R',    'forearm.R', [-0.145, -0.09, 0.09]],
  ['shoulder.L','chest',     [0.05,  0.225, 0.07]],
  ['upperarm.L','shoulder.L',[0.092, 0.225, 0.07]],
  ['forearm.L', 'upperarm.L',[0.14,  0.07,  0.10]],
  ['hand.L',    'forearm.L', [0.172, 0.14,  0.16]],
];
BONES.push(...legs.bones(LEG));
const BI = Object.fromEntries(BONES.map((b, i) => [b[0], i]));
const bp = n => BONES[BI[n]][2];

// ---------- цвет текстуры (для распознавания волос) ----------
const RGB = fs.readFileSync(path.join(__dirname, '_base256.rgb'));
const texel = (u, v) => { const x = Math.min(255, Math.max(0, Math.floor(u * 256))), y = Math.min(255, Math.max(0, Math.floor(v * 256))), k = (y * 256 + x) * 3; return [RGB[k], RGB[k + 1], RGB[k + 2]]; };
const isHair = i => { const [r, gg, b] = texel(UV[i * 2], UV[i * 2 + 1]), mx = Math.max(r, gg, b), mn = Math.min(r, gg, b); return mx > 120 && (mx - mn) < 60; };

// ---------- посох ----------
// ствол: тонкая вертикаль у x≈0.17..0.20, z≈0.15..0.17 по всей высоте; верх: сфера с оправой (y>0.27, x>0.085, z>0.05); цепочки под сферой
function isStaff(x, y, z) {
  if (y > 0.27 && x > 0.085 && z > 0.05) return true;           // сфера, оправа, шипы
  if (y > 0.18 && y <= 0.30 && x > 0.11 && z > 0.14) return true; // цепочки с кристаллами
  // ствол наклонный: низ ≈ (0.11, -0.47, 0.148), кисть ≈ (0.172, 0.14, 0.161), верх ≈ (0.197, 0.39)
  const sx = 0.172 + (y - 0.14) * 0.1016, sz = 0.161 + (y - 0.14) * 0.0213;
  if (Math.hypot(x - sx, z - sz) < (y > 0.08 && y < 0.2 ? 0.022 : 0.011)) return true; // у кисти шире: пальцы на посохе
  return false;
}

// ---------- расстояние до отрезка ----------
function segDist(p, a, b) { const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], ap = [p[0] - a[0], p[1] - a[1], p[2] - a[2]];
  let t = (ap[0] * ab[0] + ap[1] * ab[1] + ap[2] * ab[2]) / (ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2); t = Math.max(0, Math.min(1, t));
  return [Math.hypot(ap[0] - ab[0] * t, ap[1] - ab[1] * t, ap[2] - ab[2] * t), t]; }
const ss = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

// ---------- веса ----------
const JOINTS = new Uint16Array(N * 4), WEIGHTS = new Float32Array(N * 4);
const stats = { staff: 0, armR: 0, armL: 0, head: 0, hair: 0 };
for (let i = 0; i < N; i++) {
  const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2], p = [x, y, z], w = {};
  const add = (n, v) => { if (v > 1e-4) w[n] = (w[n] || 0) + v; };
  if (isStaff(x, y, z)) { add('hand.L', 1); stats.staff++; }
  else {
    // туловище: плавно по высоте
    const torso = {};
    if (y < -0.12) torso.hips = 1;
    else if (y < 0.06) { const t = ss(-0.12, 0.06, y); torso.hips = 1 - t; torso.spine = t; }
    else if (y < 0.17) { const t = ss(0.06, 0.17, y); torso.spine = 1 - t; torso.chest = t; }
    else torso.chest = 1;
    // голова: шар вокруг лица (воротник и волосы ниже остаются на груди)
    const hc = [-0.005, 0.315, 0.085], dh = Math.hypot(x - hc[0], (y - hc[1]) * 0.9, z - hc[2]);
    let hw = ss(0.095, 0.06, dh) * ss(0.235, 0.265, y);
    if (hw > 0) stats.head++;
    if (y > 0.25 && y < 0.3 && hw < 1) { torso.neck = (torso.neck || 0) + 0.3 * (1 - hw); torso.chest = (torso.chest || 0) * 0.7; }
    // руки (волосы к рукам не крепим)
    const hair = isHair(i); if (hair) stats.hair++;
    let armW = 0, armBones = {};
    if (!hair) for (const s of ['R', 'L']) {
      const sh = bp('upperarm.' + s), el = bp('forearm.' + s), ha = bp('hand.' + s), sx = s === 'R' ? -1 : 1;
      if (x * sx < 0.035) continue;
      const [du] = segDist(p, sh, el), [df] = segDist(p, el, ha), dhd = Math.hypot(x - ha[0], y - (ha[1] - 0.03), z - ha[2]);
      // ядро руки — полностью, широкий край рукава — частично (свисает, а не поднимается крылом)
      const d = Math.min(du, df, dhd), a = ss(0.085, 0.022, d) * ss(0.035, 0.07, x * sx);
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
  }
  // топ-4 и нормализация
  const L = Object.entries(w).sort((a, b) => b[1] - a[1]).slice(0, 4), s = L.reduce((a, b) => a + b[1], 0) || 1;
  if (!L.length) L.push(['hips', 1]);
  L.forEach(([n, v], k) => { JOINTS[i * 4 + k] = BI[n]; WEIGHTS[i * 4 + k] = v / s; });
}

// ---------- анимации ----------
const qx = a => [Math.sin(a / 2), 0, 0, Math.cos(a / 2)], qy = a => [0, Math.sin(a / 2), 0, Math.cos(a / 2)], qz = a => [0, 0, Math.sin(a / 2), Math.cos(a / 2)];
const qm = (a, b) => [a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1], a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0], a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3], a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]];
const D = Math.PI / 180, Q0 = [0, 0, 0, 1];
// кадры: [время, {кость: кватернион}]
const CLIPS = {
  // каст свободной (правой) рукой: замах назад → резкий выброс руки вперёд ладонью к цели → возврат
  cast_hand: [
    [0.00, {}],
    [0.15, { 'upperarm.R': qx(12 * D), 'forearm.R': qx(-15 * D), chest: qy(10 * D), head: qy(-5 * D) }],
    [0.30, { 'thigh.R': qx(-12 * D), 'shin.R': qx(10 * D), 'thigh.L': qx(6 * D), 'upperarm.R': qm(qx(-28 * D), qz(-6 * D)), 'forearm.R': qx(-75 * D), 'hand.R': qx(-25 * D), chest: qm(qy(-12 * D), qx(5 * D)), spine: qy(-4 * D), head: qy(8 * D) }],
    [0.55, { 'thigh.R': qx(-11 * D), 'shin.R': qx(9 * D), 'thigh.L': qx(6 * D), 'upperarm.R': qm(qx(-30 * D), qz(-6 * D)), 'forearm.R': qx(-72 * D), 'hand.R': qx(-30 * D), chest: qm(qy(-10 * D), qx(4 * D)), spine: qy(-4 * D), head: qy(7 * D) }],
    [1.00, {}],
  ],
  // каст посохом: подъём посоха → удар/направление вперёд-вниз → возврат
  cast_staff: [
    [0.00, {}],
    [0.25, { 'upperarm.L': qx(-20 * D), 'forearm.L': qx(-18 * D), 'hand.L': qx(-10 * D), chest: qm(qx(-5 * D), qy(6 * D)), head: qx(-5 * D) }],
    [0.45, { 'thigh.L': qx(-10 * D), 'shin.L': qx(12 * D), 'thigh.R': qx(-4 * D), 'shin.R': qx(8 * D), 'upperarm.L': qx(-34 * D), 'forearm.L': qx(8 * D), 'hand.L': qx(34 * D), chest: qm(qx(8 * D), qy(-5 * D)), spine: qx(3 * D), head: qx(5 * D) }],
    [0.75, { 'thigh.L': qx(-9 * D), 'shin.L': qx(11 * D), 'thigh.R': qx(-4 * D), 'shin.R': qx(7 * D), 'upperarm.L': qx(-32 * D), 'forearm.L': qx(8 * D), 'hand.L': qx(30 * D), chest: qm(qx(7 * D), qy(-4 * D)), spine: qx(3 * D), head: qx(4 * D) }],
    [1.25, {}],
  ],
};

Object.assign(CLIPS, require('./walk.js')({ qx, qy, qz, qm, D }, {armIn:4,sw:.8}));
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
j.meshes.push({ name: 'mage', primitives: [{ attributes: { POSITION: aPos, TEXCOORD_0: aUV, JOINTS_0: aJ, WEIGHTS_0: aW }, indices: aI, material: 0, mode: 4 }] });
// узлы: 0 = корень "mage", 1 = меш, 2.. = кости
j.nodes.push({ name: 'mage', children: [1, 2] });
j.nodes.push({ name: 'mage_mesh', mesh: 0, skin: 0 });
const boneNode = n => 2 + BI[n];
BONES.forEach(([n, par, pos]) => {
  const pp = par ? bp(par) : [0, 0, 0];
  const node = { name: n, translation: [pos[0] - pp[0], pos[1] - pp[1], pos[2] - pp[2]] };
  const kids = BONES.filter(b => b[1] === n).map(b => boneNode(b[0])); if (kids.length) node.children = kids;
  j.nodes.push(node);
});
const IBM = new Float32Array(16 * BONES.length);
BONES.forEach(([, , p], k) => { const m = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -p[0], -p[1], -p[2], 1]; IBM.set(m, k * 16); });
j.skins.push({ name: 'mage_skin', joints: BONES.map(b => boneNode(b[0])), skeleton: boneNode('root'), inverseBindMatrices: addAcc(IBM, 'MAT4', 5126) });
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
