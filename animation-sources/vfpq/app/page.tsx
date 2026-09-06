'use client';
/* oxlint-disable jsx-a11y/prefer-tag-over-role -- Inline SVG diagrams require image semantics; HTML img cannot contain their interactive-state geometry. */
import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { advance, continuous, configs, initial, qLimit } from './model';
import type { Mode, State } from './model';

const stages = ['目标', '偏差', '指令', '响应', '反馈'];
const fmt = (x: number, digits = 2) => x.toFixed(digits);

function Diagram({ s }: { s: State }) {
  const c = configs[s.mode];
  const blocks = [
    { x: 22, y: 50, title: '目标', value: fmt(s.target,c.digits)+' '+c.unit, sub:'调度 / 运行策略', stage:0 },
    { x: 430, y: 50, title: '控制器', value:fmt(s.command,1)+' '+c.outputUnit, sub:c.output+' · 限幅', stage:2 },
    { x: 430, y: 260, title:'设备执行', value:s.mode==='V'?'SVG / 逆变器':s.mode==='F'?'储能 / 机组':c.actuator, sub:s.mode==='V'?'无功改变电压':s.mode==='F'?'有功支撑频率':'跟踪功率指令', stage:3 },
    { x: 22, y: 260, title:'并网点实测', value:fmt(s.actual,c.digits)+' '+c.unit, sub:'采样后返回比较点', stage:4 },
  ];
  return <svg className="diagram" viewBox="0 0 620 430" role="img" aria-label="完整负反馈闭环，实测值返回比较点负端">
    <defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10Z" fill="context-stroke"/></marker></defs>
    <path className={'wire '+(s.stage===0?'active':'')} d="M190 104 H277" markerEnd="url(#arrow)"/>
    <path className={'wire '+(s.stage===1?'active':'')} d="M343 104 H430" markerEnd="url(#arrow)"/>
    <path className={'wire '+(s.stage===2?'active':'')} d="M514 158 V260" markerEnd="url(#arrow)"/>
    <path className={'wire '+(s.stage===3?'active':'')} d="M430 314 H190" markerEnd="url(#arrow)"/>
    <path className={'wire '+(s.stage===4?'active':'')} d="M106 260 V208 H310 V137" markerEnd="url(#arrow)"/>
    {blocks.map(n=><g key={n.title} className={'block '+(s.stage===n.stage?'selected':'')}><rect x={n.x} y={n.y} width="168" height="108" rx="10"/><text x={n.x+84} y={n.y+26} className="small">{n.title}</text><text x={n.x+84} y={n.y+58} className="value">{n.value}</text><text x={n.x+84} y={n.y+86} className="small">{n.sub}</text></g>)}
    <g className={'block '+(s.stage===1?'selected':'')}><circle cx="310" cy="104" r="32"/><text x="294" y="109">+</text><text x="310" y="128">−</text></g>
    <text x="310" y="40" className="annotation">目标 − 测量</text><text x="222" y="197" className="annotation">测量反馈 ↑</text>
    <text x="550" y="211" className="annotation">指令 ↓</text><text x="310" y="301" className="annotation">← 物理响应</text>
    <text x="310" y="395" className="annotation">实测值经反馈回线，进入比较点负端</text>
  </svg>;
}

function Chart({ s }: { s: State }) {
  const c = configs[s.mode], [lo, hi] = c.range;
  const start = s.history[0].t, end = Math.max(start + 20, s.t);
  const x = (t: number) => 48 + (t - start) / (end - start) * 290;
  const y = (v: number) => 180 - (v - lo) / (hi - lo) * 145;
  const points = s.history.map(p => x(p.t) + ',' + y(p.actual)).join(' ');
  let targetPath = '';
  s.history.forEach((p, i) => { targetPath += (i ? ' H' + x(p.t) + ' V' : 'M' + x(p.t) + ' ') + y(p.target); });
  targetPath += ' H' + x(s.t);
  return <section className="chart-panel"><div className="section-head"><h2>目标与实测响应</h2><span><i className="dash" />目标 <i className="solid" />实测</span></div>
    <svg viewBox="0 0 360 225" role="img" aria-label="横轴为模型时间，纵轴为当前控制量，虚线为目标，实线为实测">
      {[0, 1, 2, 3, 4].map(i => <g key={i}><path className="gridline" d={'M48 ' + (35 + i * 36.25) + ' H338'} /><text x="41" y={40 + i * 36.25} textAnchor="end">{fmt(hi - (hi - lo) * i / 4, s.mode === 'F' ? 2 : 0)}</text></g>)}
      <text x="48" y="19">{c.unit}</text>
      <path d={targetPath} className="target-line" />
      <polyline points={points} className="actual-line" />
      <circle cx={x(s.history[s.history.length - 1].t)} cy={y(s.history[s.history.length - 1].actual)} r="4" fill="var(--loop-color)" />
      {[0, 1, 2, 3, 4].map(i => <text key={i} x={48 + i * 72.5} y="203" textAnchor="middle">{fmt(start + (end - start) * i / 4, 0)}</text>)}
      <text x="338" y="221" textAnchor="end">模型时间 / s（演示已放慢）</text>
    </svg>
  </section>;
}

export default function Home() {
  const [s, setS] = useState<State>(() => initial('V'));
  const [running, setRunning] = useState(false);
  const c = configs[s.mode];
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setS(prev => continuous(prev)), 50);
    return () => window.clearInterval(timer);
  }, [running]);
  const select = (mode: Mode) => { setRunning(false); setS(initial(mode)); };
  const descriptions = [
    s.mode === 'F' ? '以 50 Hz 为频差参考。并网场站参与频率支撑，频率由整个电网共同决定。' : '从调度或运行策略读取目标。拖动目标值，观察指令如何改变。',
    '将目标与上一轮测量值相减。正偏差意味着需要提高被控量，负偏差意味着需要降低。',
    s.mode === 'F' ? '频差超出 ±0.02 Hz 示意死区后，生成有功支撑 ΔP，并受 ±10 MW 裕度限制。' : s.mode === 'V' ? '电压调节器把电压偏差转换为无功 Q 指令，再按设备无功能力限幅。' : '根据功率偏差修正设备指令，并执行容量限幅；限幅时停止积分继续累积。',
    s.mode === 'F' ? 'ΔP 叠加到 80 MW 基础出力上。出力变化通过简化电网模型影响频率。' : s.mode === 'V' ? '设备调整无功，改变并网点电压。电压响应还取决于网络条件。' : '设备响应指令，实际功率逐渐变化。设备响应存在惯性，无法瞬间到达目标。',
    '采集新的实际值，沿底部回线送回比较点。下一轮使用新反馈，继续修正。',
  ];
  return <main style={{ '--loop-color': ({V:'#2365aa',F:'#956016',P:'#197052',Q:'#7754a7'})[s.mode] } as CSSProperties} className={running ? 'running' : 'paused'}>
    <header><div><p className="eyebrow">场站闭环控制 · 交互原理演示</p><h1>V / F / P / Q 场站闭环控制</h1></div><span className="status">{running ? '连续演示中' : '已暂停 · 可单步观察'}</span></header>
    <div className="workspace"><section className="control-panel"><nav aria-label="选择控制场景">{(Object.keys(configs) as Mode[]).map(mode => <Button key={mode} onClick={() => select(mode)} aria-pressed={s.mode === mode} className={'mode-button ' + (s.mode === mode ? 'chosen' : '')}><b>{mode}</b><span>{configs[mode].title}<small>{configs[mode].relation}</small></span></Button>)}</nav>
    <section className="toolbar">
      <div className="target-control"><label id="target-label">{s.mode === 'F' ? '额定频率参考（固定）' : '调整目标值'}<strong>{fmt(s.target, c.digits)} {c.unit}</strong></label>
        {s.mode !== 'F' ? <Slider aria-labelledby="target-label" min={c.min} max={c.max} step={c.step} value={[s.target]} onValueChange={v => setS(prev => ({ ...prev, target: typeof v === 'number' ? v : v[0] }))} /> : <p>点击下方“施加扰动”观察频率支撑。</p>}
      </div>
      <div className="actions"><Button onClick={() => setRunning(v => !v)}>{running ? 'Ⅱ 暂停' : '▶ 连续运行'}</Button><Button onClick={() => { setRunning(false); setS(prev => advance(prev)); }}>单步 →</Button><Button onClick={() => setS(prev => ({ ...prev, disturbance: prev.disturbance === 0 ? (s.mode === 'F' ? -.1 : s.mode === 'V' ? -.8 : -8) : 0 }))}>{s.disturbance ? '撤除扰动' : '施加扰动'}</Button><Button onClick={() => select(s.mode)}>复位</Button></div>
    </section>
    </section>
    <section className="main-panel"><div className="section-head"><h2><b>{s.mode}</b> {c.title} <span>{c.law}</span></h2><span className={s.limited ? 'limit' : ''}>{s.limited ? '能力限幅 · 目标可能不可达' : '能力范围内'}{s.disturbance ? ' · 扰动已投入' : ''}</span></div>
      <div className="steps">{stages.map((label, i) => <div key={label} className={s.stage === i ? 'current' : ''}><b>{i + 1}</b>{label}</div>)}</div>
      <div className="compact-readings"><span>目标 <b>{fmt(s.target,c.digits)} {c.unit}</b></span><span>实际 <b>{fmt(s.actual,c.digits)} {c.unit}</b></span><span>偏差 <b>{fmt(s.target-s.actual,c.digits)} {c.unit}</b></span></div>
      <Diagram s={s} />

    </section>
    <div className="bottom"><Chart s={s} /><div className="explanation" aria-live={running ? 'off' : 'polite'}><strong>{s.stage + 1} / 5 · {stages[s.stage]}</strong><p>{descriptions[s.stage]}</p></div><aside><h2>这个环与其他量的关系</h2>
      {s.mode === 'F' || s.mode === 'P' ? <><div className="relation">P基础 + ΔP频率 → P设备</div><p>F 根据频差产生有功增减量；P 环跟踪合成后的有功目标。两者共享有功裕度，不能互相抵消。</p><p className="note">{s.mode === 'F' ? '一次调频是下垂支撑，可保留稳态频差。恢复额定频率还需要电网其他调节，本演示不会强制归零。' : '示意有功上限 100 MW。把目标提高到 105 MW，可观察限幅后持续存在的偏差。'}</p></> : <><div className="relation">V外环 → Q目标 → Q内环</div><p>V 模式通过调 Q 来调压；定 Q 模式直接跟踪无功目标。两种目标须经模式选择或协调后执行。</p><p className="note">示意设备 S = 90 MVA、P = 80 MW，因此 |Q| ≤ {fmt(qLimit, 1)} Mvar。V 模式中的设备块包含简化 Q 跟踪。</p></>}
    </aside></div>
    </div><footer>教学模型：连续模式平滑推进物理响应，五步高亮仅用于讲解；单步模式每次推进一个因果环节。量程、参数与设备响应均为示意，场景切换会复位。</footer>
  </main>;
}
