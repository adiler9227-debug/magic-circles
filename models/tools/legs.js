// Ноги для скелета героя: кости бедро/голень/стопа слева и справа + веса вершин ниже таза.
// Единицы — исходные единицы модели (рост ≈ 1, y от -0.5 до 0.5, лицо в +Z, левая сторона персонажа при x>0).
// cfg: { hipY, kneeY, ankleY, toeZ, hipX, kneeX, ankleX, z, kneeZ, ankleZ, split }
const ss = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

// добавить кости ног (родитель — hips)
exports.bones = cfg => {
  const z = cfg.z || 0, kz = cfg.kneeZ != null ? cfg.kneeZ : z, az = cfg.ankleZ != null ? cfg.ankleZ : z;
  const out = [];
  for (const [s, sx] of [['R', -1], ['L', 1]]) {
    const cx = cfg.cx || 0;
    out.push(['thigh.' + s, 'hips', [cx + sx * cfg.hipX, cfg.hipY, z]]);
    out.push(['shin.' + s, 'thigh.' + s, [cx + sx * cfg.kneeX, cfg.kneeY, kz]]);
    out.push(['foot.' + s, 'shin.' + s, [cx + sx * cfg.ankleX, cfg.ankleY, az]]);
  }
  return out;
};

// веса ног для вершины. Возвращает { w: {кость: вес}, k } — k: какая доля вершины уходит ногам (0 — вся остаётся тазу)
exports.weights = (x, y, z, cfg) => {
  x -= cfg.cx || 0;
  const top = cfg.hipY + 0.02;
  if (y > top) return { w: {}, k: 0 };
  const sp = cfg.split || 0.02;
  const wL = ss(-sp, sp, x), wR = 1 - wL;                          // посередине (подол) — поровну обеим ногам
  const tk = ss(cfg.kneeY + 0.035, cfg.kneeY - 0.035, y);          // доля голени
  const tf = ss(cfg.ankleY + 0.02, cfg.ankleY - 0.025, y);         // доля стопы
  const chain = { thigh: 1 - tk, shin: tk * (1 - tf), foot: tf };
  const w = {};
  for (const [s, ws] of [['L', wL], ['R', wR]]) if (ws > 1e-3) for (const b in chain) if (chain[b] > 1e-3) w[b + '.' + s] = ws * chain[b];
  const k = 1 - ss(cfg.hipY - 0.07, top, y);                       // у самого таза — плавно к hips
  return { w, k };
};
