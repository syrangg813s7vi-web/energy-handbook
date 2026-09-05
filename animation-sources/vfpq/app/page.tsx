'use client';
/* oxlint-disable jsx-a11y/prefer-tag-over-role -- Inline SVG diagrams require image semantics; HTML img cannot contain their interactive-state geometry. */
import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { advance, continuous, clamp, configs, initial, qLimit } from './model';
import type { Mode, State } from './model';

const stages = ['读取目标', '比较偏差', '计算指令', '设备响应', '测量反馈'];
const fmt = (x: number, digits = 2) => x.toFixed(digits);

function PhysicalStory({ s }: { s: State }) {
  const c = configs[s.mode], error = s.target - s.actual;
  const tolerance = s.mode === 'F' ? .02 : s.mode === 'V' ? .05 : .15;
  const settled = Math.abs(error) < tolerance;
  const low = error > 0;
  const percent = (value: number) => clamp((value - c.range[0]) / (c.range[1] - c.range[0]) * 100, 0, 100);
  const measured = percent(s.actual), target = percent(s.target);
  const limit = s.mode === 'P' ? 100 : s.mode === 'F' ? 10 : qLimit;
  const ratio = clamp(s.command / limit, -1, 1);
  const direction = s.command >= 0 ? '正向' : '反向';
  const action = s.mode === 'V' ? (s.command >= 0 ? '增加无功注入，支撑电压' : '吸收无功，降低电压')
    : s.mode === 'F' ? (s.command >= 0 ? '增加有功出力，支撑频率' : '减少有功出力，抑制频率升高')
    : s.mode === 'P' ? '设备跟踪有功指令' : (s.command >= 0 ? '设备输出正向无功' : '设备吸收无功');
  const residual = s.mode === 'F' && Math.abs(error) > .02;
  return <section className="physical-story" aria-label="偏差、设备调节和物理响应的直观对照">
    <div className="story-title"><h2>{s.mode === 'V' ? '看见 Q 如何改变 V' : s.mode === 'F' ? '看见 ΔP 如何支撑 F' : '看见指令如何改变实际功率'}</h2><span>{s.limited ? '已到能力边界' : settled ? '已接近目标' : low ? '实际值低于目标' : '实际值高于目标'}</span></div>
    <div className="story-grid">
      <div className="difference">
        <p className="card-label">① 发现偏差</p>
        <div className="big-reading">{fmt(Math.abs(error), c.digits)} <small>{c.unit}</small></div>
        <p>{settled ? '偏差已经很小' : (low ? '距离目标还差 ' : '超过目标 ') + fmt(Math.abs(error), c.digits) + ' ' + c.unit}</p>
        <div className="compare-row"><span>目标</span><div className="compare-track"><i className="target-fill" style={{width: target + '%'}} /></div><b>{fmt(s.target, c.digits)}</b></div>
        <div className="compare-row"><span>实际</span><div className="compare-track"><i style={{width: measured + '%'}} /></div><b>{fmt(s.actual, c.digits)}</b></div>
        <small>同一量程：{c.range[0]} — {c.range[1]} {c.unit}</small>
      </div>
      <div className="causal-arrow" aria-hidden="true">→<small>偏差决定调节</small></div>
      <div className="device-demand">
        <p className="card-label">② {s.mode === 'V' ? 'SVG / 逆变器调节无功' : c.actuator}</p>
        <svg className="dial" viewBox="0 0 240 135" role="img" aria-label={c.output + fmt(s.command) + c.outputUnit}>
          <path d="M30 115 A90 90 0 0 1 210 115" fill="none" stroke="#29475f" strokeWidth="12"/>
          <path d="M30 115 A90 90 0 0 1 210 115" fill="none" stroke="var(--loop-color)" strokeWidth="12" pathLength="100" strokeDasharray={((ratio + 1) * 50) + ' 100'}/>
          <g style={{transform: 'rotate(' + (ratio * 90) + 'deg)', transformOrigin: '120px 115px'}}><path d="M120 115 L120 35" stroke="#f1f7fc" strokeWidth="3"/><circle cx="120" cy="115" r="7" fill="#f1f7fc"/></g>
          <text x="18" y="134">−{fmt(limit,0)}</text><text x="116" y="18">0</text><text x="198" y="134">+{fmt(limit,0)}</text>
        </svg>
        <div className="command-reading">{s.command >= 0 ? '+' : ''}{fmt(s.command, 2)} <small>{c.outputUnit}</small></div>
        <p>{action}</p><small>{c.output} · {direction} · 指针显示下发指令</small>
      </div>
      <div className="causal-arrow" aria-hidden="true">→<small>设备作用于并网点</small></div>
      <div className="physical-response">
        <p className="card-label">③ {s.mode === 'F' ? '电网频率响应' : '并网点实际响应'}</p>
        <div className="response-reading"><strong>{fmt(s.actual,c.digits)}</strong><span>{c.unit}</span></div>
        <div className="ruler"><div className="gap-zone" style={{left: Math.min(target,measured)+'%',width:Math.abs(target-measured)+'%'}}/><i className="target-pin" style={{left:target+'%'}}/><i className="actual-pin" style={{left:measured+'%'}}/></div>
        <div className="ruler-key"><span>● 实际值</span><span>┆ 目标 {fmt(s.target,c.digits)}</span></div>
        <p>{s.limited ? '指令受限，偏差可能持续存在。' : residual ? '增加有功可支撑频率，但下垂控制允许保留频差。' : settled ? '设备仍维持必要输出，保持当前状态。' : '观察实际标记逐渐接近目标，阴影差距随之变化。'}</p>
      </div>
    </div>
    <div className="story-return">↶ 新测量值返回比较点，重新计算偏差 <span>持续调节；接近目标时并不等于设备输出归零</span></div>
  </section>;
}

function Diagram({ s }: { s: State }) {
  const c = configs[s.mode];
  const nodes = [
    { x: 30, w: 160, title: s.mode === 'F' ? '额定频率' : '调度 / 运行目标', value: fmt(s.target, c.digits) + ' ' + c.unit, sub: '参考值 r', stage: 0 },
    { x: 385, w: 190, title: s.mode === 'F' ? '下垂控制 + 死区' : '反馈调节 + 限幅', value: fmt(s.command) + ' ' + c.outputUnit, sub: c.output, stage: 2 },
    { x: 640, w: 190, title: c.actuator, value: s.mode === 'F' ? '调整有功出力' : s.mode === 'V' ? '调整无功输出' : '跟踪设备指令', sub: '设备级控制', stage: 3 },
    { x: 900, w: 165, title: s.mode === 'F' ? '场站 + 电网响应' : '并网点 POC', value: fmt(s.actual, c.digits) + ' ' + c.unit, sub: '实际物理量 y', stage: 3 },
  ];
  return <div className="diagram-scroll"><svg className="diagram" viewBox="0 0 1100 350" role="img" aria-label={c.title + '负反馈闭环：目标进入比较点正端，测量值沿底部回线进入负端'}>
    <defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10Z" fill="currentColor" /></marker></defs>
    <path className={'wire ' + (s.stage === 0 ? 'active' : '')} d="M190 117 H269" markerEnd="url(#arrow)" />
    <path className={'wire ' + (s.stage === 1 ? 'active' : '')} d="M331 117 H385" markerEnd="url(#arrow)" />
    <path className={'wire ' + (s.stage === 2 ? 'active' : '')} d="M575 117 H640" markerEnd="url(#arrow)" />
    <path className={'wire ' + (s.stage === 3 ? 'active' : '')} d="M830 117 H900" markerEnd="url(#arrow)" />
    <path className={'wire feedback ' + (s.stage === 4 ? 'active' : '')} d="M982 162 V276 H300 V148" markerEnd="url(#arrow)" />
    {nodes.map(n => <g key={n.x} className={'block ' + (s.stage === n.stage ? 'selected' : '')}>
      <rect x={n.x} y="70" width={n.w} height="94" rx="12" />
      <text x={n.x + n.w / 2} y="94" className="small">{n.title}</text>
      <text x={n.x + n.w / 2} y="124" className="value">{n.value}</text>
      <text x={n.x + n.w / 2} y="148" className="small">{n.sub}</text>
    </g>)}
    <g className={'block ' + (s.stage === 1 ? 'selected' : '')}><circle cx="300" cy="117" r="30" /><text x="284" y="122">+</text><text x="300" y="140">−</text></g>
    <text x="300" y="53" className="annotation">e = r − y测量</text>
    <text x="300" y="196" className="annotation">偏差 {fmt(s.target - s.feedback, c.digits)} {c.unit}</text>
    <g className={'block ' + (s.stage === 4 ? 'selected' : '')}><rect x="587" y="251" width="230" height="50" rx="10" /><text x="702" y="282">测量反馈 {fmt(s.feedback, c.digits)} {c.unit}</text></g>
    <text x="460" y="311" className="annotation">反馈回到比较点的负端</text>
    <text x="984" y="208" className="annotation">{s.mode === 'F' ? '电网负荷扰动 ↓' : '外部扰动 ↓'}</text>
  </svg></div>;
}

function Chart({ s }: { s: State }) {
  const c = configs[s.mode], [lo, hi] = c.range;
  const start = s.history[0].t, end = Math.max(start + 20, s.t);
  const x = (t: number) => 65 + (t - start) / (end - start) * 790;
  const y = (v: number) => 180 - (v - lo) / (hi - lo) * 145;
  const points = s.history.map(p => x(p.t) + ',' + y(p.actual)).join(' ');
  let targetPath = '';
  s.history.forEach((p, i) => { targetPath += (i ? ' H' + x(p.t) + ' V' : 'M' + x(p.t) + ' ') + y(p.target); });
  targetPath += ' H' + x(s.t);
  return <section className="chart-panel"><div className="section-head"><h2>目标与实测响应</h2><span><i className="dash" />目标 <i className="solid" />实测</span></div>
    <svg viewBox="0 0 890 225" role="img" aria-label="横轴为模型时间，纵轴为当前控制量，虚线为目标，实线为实测">
      {[0, 1, 2, 3, 4].map(i => <g key={i}><path className="gridline" d={'M65 ' + (35 + i * 36.25) + ' H855'} /><text x="56" y={40 + i * 36.25} textAnchor="end">{fmt(hi - (hi - lo) * i / 4, s.mode === 'F' ? 2 : 0)}</text></g>)}
      <text x="65" y="19">{c.unit}</text>
      <path d={targetPath} className="target-line" />
      <polyline points={points} className="actual-line" />
      <circle cx={x(s.history[s.history.length - 1].t)} cy={y(s.history[s.history.length - 1].actual)} r="4" fill="var(--loop-color)" />
      {[0, 1, 2, 3, 4].map(i => <text key={i} x={65 + i * 197.5} y="203" textAnchor="middle">{fmt(start + (end - start) * i / 4, 0)}</text>)}
      <text x="855" y="221" textAnchor="end">模型时间 / s（演示已放慢）</text>
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
  return <main style={{ '--loop-color': c.color } as CSSProperties} className={running ? 'running' : 'paused'}>
    <header><div><p className="eyebrow">场站闭环控制 · 交互原理演示</p><h1>从目标，到响应，再回到反馈。</h1></div><span className="status">{running ? '连续演示中' : '已暂停 · 可单步观察'}</span></header>
    <nav aria-label="选择控制场景">{(Object.keys(configs) as Mode[]).map(mode => <Button key={mode} onClick={() => select(mode)} aria-pressed={s.mode === mode} className={'mode-button ' + (s.mode === mode ? 'chosen' : '')}><b>{mode}</b><span>{configs[mode].title}<small>{configs[mode].relation}</small></span></Button>)}</nav>
    <section className="toolbar">
      <div className="target-control"><label id="target-label">{s.mode === 'F' ? '额定频率参考（固定）' : '调整目标值'}<strong>{fmt(s.target, c.digits)} {c.unit}</strong></label>
        {s.mode !== 'F' ? <Slider aria-labelledby="target-label" min={c.min} max={c.max} step={c.step} value={[s.target]} onValueChange={v => setS(prev => ({ ...prev, target: typeof v === 'number' ? v : v[0] }))} /> : <p>通过右侧“施加扰动”观察调频支撑。</p>}
      </div>
      <div className="actions"><Button onClick={() => setRunning(v => !v)}>{running ? 'Ⅱ 暂停' : '▶ 连续运行'}</Button><Button onClick={() => { setRunning(false); setS(prev => advance(prev)); }}>单步 →</Button><Button onClick={() => setS(prev => ({ ...prev, disturbance: prev.disturbance === 0 ? (s.mode === 'F' ? -.1 : s.mode === 'V' ? -.8 : -8) : 0 }))}>{s.disturbance ? '撤除扰动' : '施加扰动'}</Button><Button onClick={() => select(s.mode)}>复位</Button></div>
    </section>
    <PhysicalStory s={s} />
    <section className="main-panel"><div className="section-head"><h2><b>{s.mode}</b> {c.title} <span>{c.law}</span></h2><span className={s.limited ? 'limit' : ''}>{s.limited ? '能力限幅 · 目标可能不可达' : '能力范围内'}{s.disturbance ? ' · 扰动已投入' : ''}</span></div>
      <div className="steps">{stages.map((label, i) => <div key={label} className={s.stage === i ? 'current' : ''}><b>{i + 1}</b>{label}</div>)}</div>
      <Diagram s={s} />
      <div className="explanation" aria-live={running ? 'off' : 'polite'}><strong>{s.stage + 1} / 5 · {stages[s.stage]}</strong><p>{descriptions[s.stage]}</p></div>
    </section>
    <div className="bottom"><Chart s={s} /><aside><h2>这个环与其他量的关系</h2>
      {s.mode === 'F' || s.mode === 'P' ? <><div className="relation">P基础 + ΔP频率 → P设备</div><p>F 根据频差产生有功增减量；P 环跟踪合成后的有功目标。两者共享有功裕度，不能互相抵消。</p><p className="note">{s.mode === 'F' ? '一次调频是下垂支撑，可保留稳态频差。恢复额定频率还需要电网其他调节，本演示不会强制归零。' : '示意有功上限 100 MW。把目标提高到 105 MW，可观察限幅后持续存在的偏差。'}</p></> : <><div className="relation">V外环 → Q目标 → Q内环</div><p>V 模式通过调 Q 来调压；定 Q 模式直接跟踪无功目标。两种目标须经模式选择或协调后执行。</p><p className="note">示意设备 S = 90 MVA、P = 80 MW，因此 |Q| ≤ {fmt(qLimit, 1)} Mvar。V 模式中的设备块包含简化 Q 跟踪。</p></>}
    </aside></div>
    <footer>教学模型：连续模式平滑推进物理响应，五步高亮仅用于讲解；单步模式每次推进一个因果环节。量程、参数与设备响应均为示意，场景切换会复位。</footer>
  </main>;
}
