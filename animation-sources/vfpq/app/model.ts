export type Mode = 'V' | 'F' | 'P' | 'Q';
export const configs = {
  V: { title: '电压控制', unit: 'kV', color: '#66b5ff', target: 220, initial: 218, min: 217, max: 223, step: .5, actuator: '逆变器 / SVG', output: 'Q 指令', outputUnit: 'Mvar', law: '电压偏差 → 无功调节', relation: 'V → Q', range: [215, 225], digits: 2 },
  F: { title: '频率支撑', unit: 'Hz', color: '#ffbd66', target: 50, initial: 49.8, min: 50, max: 50, step: .01, actuator: '储能 / 可调机组', output: 'ΔP 支撑', outputUnit: 'MW', law: '频差 → 下垂响应', relation: 'F → ΔP', range: [49.6, 50.1], digits: 3 },
  P: { title: '有功控制', unit: 'MW', color: '#54e0b0', target: 82, initial: 68, min: 55, max: 105, step: 1, actuator: '逆变器 / 风机 / PCS', output: 'P 指令', outputUnit: 'MW', law: '功率偏差 → 有功调节', relation: 'P → P', range: [45, 110], digits: 1 },
  Q: { title: '无功控制', unit: 'Mvar', color: '#c9a0ff', target: 15, initial: 0, min: -45, max: 45, step: 1, actuator: '逆变器 / SVG', output: 'Q 指令', outputUnit: 'Mvar', law: '无功偏差 → 无功调节', relation: 'Q → Q', range: [-50, 50], digits: 1 },
} as const;
export type Point = { t: number; actual: number; target: number };
export type State = { mode: Mode; target: number; actual: number; feedback: number; integral: number; command: number; limited: boolean; stage: number; t: number; disturbance: number; history: Point[] };
export const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));
export const qLimit = Math.sqrt(90 ** 2 - 80 ** 2);
export function initial(mode: Mode): State {
  const c = configs[mode];
  return { mode, target: c.target, actual: c.initial, feedback: c.initial, integral: 0, command: mode === 'P' ? c.initial : 0, limited: false, stage: 0, t: 0, disturbance: 0, history: [{ t: 0, actual: c.initial, target: c.target }] };
}
function control(s: State, dt = 1): State {
  const n = { ...s };
    const e = s.target - s.feedback;
    if (s.mode === 'F') {
      const request = 50 * Math.sign(e) * Math.max(0, Math.abs(e) - .02);
      n.command = clamp(request, -10, 10);
      n.limited = Math.abs(request) > 10;
    } else {
      const gain = s.mode === 'V' ? 6 : .65;
      const i = s.integral + e * (s.mode === 'V' ? 1.8 : .24) * dt;
      const request = (s.mode === 'P' ? s.target : s.mode === 'Q' ? s.target : 0) + gain * e + i;
      n.command = clamp(request, s.mode === 'P' ? 0 : -qLimit, s.mode === 'P' ? 100 : qLimit);
      n.limited = Math.abs(n.command - request) > .00001;
      if (!n.limited) n.integral = i;
    }
  return n;
}
export function continuous(s: State, dt = .05): State {
  const n = control(s, dt);
  const equilibrium = s.mode === 'V' ? 218 + .16 * n.command + s.disturbance
    : s.mode === 'F' ? 49.8 + .02 * n.command + s.disturbance : n.command + s.disturbance;
  n.actual += (equilibrium - s.actual) * (1 - Math.exp(-.6 * dt));
  n.feedback = n.actual;
  n.t = s.t + dt;
  n.stage = Math.floor(n.t / .8) % 5;
  if (Math.floor(n.t * 5) > Math.floor(s.t * 5)) {
    n.history = [...s.history, { t: n.t, actual: n.actual, target: n.target }].slice(-300);
  }
  return n;
}
export function advance(s: State): State {
  let n = { ...s, stage: (s.stage + 1) % 5 };
  if (n.stage === 2) n = control(n);
  if (n.stage === 3) {
    const equilibrium = s.mode === 'V' ? 218 + .16 * s.command + s.disturbance
      : s.mode === 'F' ? 49.8 + .02 * s.command + s.disturbance : s.command + s.disturbance;
    n.actual += (equilibrium - s.actual) * .45;
    n.t += 1;
  }
  if (n.stage === 4) {
    n.feedback = s.actual;
    n.history = [...s.history, { t: s.t, actual: s.actual, target: s.target }].slice(-60);
  }
  return n;
}
