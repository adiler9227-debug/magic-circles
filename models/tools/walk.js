// Цикл ходьбы (клип "walk", 1 с, по кругу): ноги шагают, руки машут в противофазе, корпус чуть поворачивается.
// armIn — на сколько градусов прижать руки к телу из А-позы (у каждой модели свой угол), sw — размах шага.
module.exports = ({ qx, qy, qz, qm, D }, { armIn = 25, sw = 1, arms = 1 } = {}) => {
  const A = armIn * D, s = sw;
  const arm = (fwdR) => ({                                   // fwdR: правая рука вперёд (+) / назад (−)
    'upperarm.R': qm(qx(-fwdR * 24 * arms * D), qz(A)), 'forearm.R': qx(-(18 + Math.max(0, fwdR) * 14) * D),
    'upperarm.L': qm(qx(fwdR * 24 * arms * D), qz(-A)), 'forearm.L': qx(-(18 + Math.max(0, -fwdR) * 14) * D),
  });
  // контакт: левая нога впереди, правая сзади → правая рука вперёд
  const contactL = Object.assign({ 'thigh.L': qx(-26 * s * D), 'shin.L': qx(6 * D), 'foot.L': qx(8 * D),
    'thigh.R': qx(20 * s * D), 'shin.R': qx(22 * s * D), 'foot.R': qx(-12 * D), chest: qy(7 * D), hips: qy(-6 * D), head: qy(-3 * D) }, arm(1));
  const passL = Object.assign({ 'thigh.L': qx(-4 * D), 'shin.L': qx(8 * D),
    'thigh.R': qx(-18 * s * D), 'shin.R': qx(48 * s * D), 'foot.R': qx(-6 * D), chest: qy(0), hips: qy(0) }, arm(0));
  const contactR = Object.assign({ 'thigh.R': qx(-26 * s * D), 'shin.R': qx(6 * D), 'foot.R': qx(8 * D),
    'thigh.L': qx(20 * s * D), 'shin.L': qx(22 * s * D), 'foot.L': qx(-12 * D), chest: qy(-7 * D), hips: qy(6 * D), head: qy(3 * D) }, arm(-1));
  const passR = Object.assign({ 'thigh.R': qx(-4 * D), 'shin.R': qx(8 * D),
    'thigh.L': qx(-18 * s * D), 'shin.L': qx(48 * s * D), 'foot.L': qx(-6 * D), chest: qy(0), hips: qy(0) }, arm(0));
  // ожидание (2 с, по кругу): руки опущены вдоль тела, локти чуть согнуты, лёгкое дыхание
  const rest = (b, sw) => ({ 'upperarm.R': qm(qx(-(3 + sw) * D), qz(A)), 'forearm.R': qx(-14 * D), 'upperarm.L': qm(qx(-(3 - sw) * D), qz(-A)), 'forearm.L': qx(-14 * D),
    chest: qx(-b * D), head: qx(b * .5 * D) });
  return { walk: [[0.00, contactL], [0.25, passL], [0.50, contactR], [0.75, passR], [1.00, contactL]],
    idle: [[0.00, rest(0, 1)], [1.00, rest(2.2, -1)], [2.00, rest(0, 1)]] };
};
