<template>
  <section class="ps-overview" aria-label="一次系统与二次系统全局关系">
    <header class="ps-head">
      <div>
        <span class="ps-kicker">一座电站 · 两套通道</span>
        <h3>一次输送能量，二次感知并控制</h3>
      </div>
      <div class="ps-legend" aria-label="颜色说明">
        <span><i class="dot primary"></i>一次：能量</span>
        <span><i class="dot secondary"></i>二次：信息与命令</span>
      </div>
    </header>

    <div class="ps-lane primary-lane">
      <div class="lane-title">
        <span class="lane-number">01</span>
        <strong>一次能量通道</strong>
        <small>电能真正从这里流过</small>
      </div>
      <div class="lane-flow energy-flow">
        <div class="flow-node"><span>☀️ 🌬️ 🔋</span><strong>能量来源</strong><small>光伏 · 风机 · 电池</small></div>
        <b class="flow-arrow" aria-hidden="true">→</b>
        <div class="flow-node"><span>⚡</span><strong>功率变换</strong><small>逆变器 · PCS</small></div>
        <b class="flow-arrow" aria-hidden="true">→</b>
        <div class="flow-node"><span>▥</span><strong>汇集升压</strong><small>箱变 · 母线 · 主变</small></div>
        <b class="flow-arrow" aria-hidden="true">→</b>
        <div class="flow-node execute"><span>⏻</span><strong>开断输送</strong><small>断路器 · 送出线路</small></div>
        <b class="flow-arrow" aria-hidden="true">→</b>
        <div class="flow-node"><span>🏙️</span><strong>公共电网</strong><small>能量去向</small></div>
      </div>
    </div>

    <div class="ps-bridge" aria-label="一次与二次之间的联系">
      <span class="sense">↓ 电流 · 电压 · 温度 · 位置</span>
      <strong>感知 → 判断 → 命令 → 执行 → 反馈</strong>
      <span class="command">跳闸 · 合闸 · 功率目标 ↑</span>
    </div>

    <div class="ps-lane secondary-lane">
      <div class="lane-title">
        <span class="lane-number">02</span>
        <strong>二次信息与控制通道</strong>
        <small>信息、逻辑和命令从这里流过</small>
      </div>
      <div class="lane-flow control-flow">
        <div class="flow-node"><span>◉</span><strong>感知</strong><small>CT · VT · 传感器</small></div>
        <b class="flow-arrow" aria-hidden="true">→</b>
        <div class="flow-node"><span>🛡</span><strong>判断</strong><small>保护 · 联锁 · 控制器</small></div>
        <b class="flow-arrow" aria-hidden="true">→</b>
        <div class="flow-node"><span>⌁</span><strong>协调</strong><small>站控 · PPC · EMS</small></div>
        <b class="flow-arrow return" aria-hidden="true">↺</b>
        <div class="flow-node result"><span>✓</span><strong>确认结果</strong><small>位置 · 告警 · 测量</small></div>
      </div>
    </div>

    <footer class="ps-summary">
      <div><strong>一次回答</strong><span>电从哪里来，经过哪里，送到哪里？</span></div>
      <div><strong>二次回答</strong><span>是否正常，能否操作，何时保护或调节？</span></div>
    </footer>
  </section>
</template>

<style scoped>
.ps-overview {
  margin: 24px 0 30px;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 18px;
  background:
    radial-gradient(circle at 12% 10%, rgba(16, 185, 129, .09), transparent 32%),
    radial-gradient(circle at 88% 90%, rgba(14, 165, 233, .10), transparent 30%),
    var(--vp-c-bg-soft);
  box-shadow: 0 14px 38px rgba(15, 23, 42, .07);
}

.ps-head,
.ps-summary {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: center;
}

.ps-kicker {
  color: var(--vp-c-brand-1);
  font-size: .74rem;
  font-weight: 800;
  letter-spacing: .12em;
}

.ps-head h3 {
  margin: 3px 0 0;
  border: 0;
  font-size: 1.15rem;
}

.ps-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  color: var(--vp-c-text-2);
  font-size: .76rem;
}

.ps-legend span { white-space: nowrap; }
.dot { display: inline-block; width: 9px; height: 9px; margin-right: 6px; border-radius: 50%; }
.dot.primary { background: #10a66b; }
.dot.secondary { background: #1597cf; }

.ps-lane {
  margin-top: 16px;
  overflow: hidden;
  border: 1px solid;
  border-radius: 14px;
}

.primary-lane { border-color: rgba(16, 166, 107, .38); background: rgba(16, 166, 107, .06); }
.secondary-lane { border-color: rgba(21, 151, 207, .38); background: rgba(21, 151, 207, .06); }

.lane-title {
  display: flex;
  gap: 9px;
  align-items: baseline;
  padding: 10px 13px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.lane-title strong { font-size: .9rem; }
.lane-title small { color: var(--vp-c-text-2); }
.lane-number { font: 800 .7rem/1 ui-monospace, SFMono-Regular, Menlo, monospace; }
.primary-lane .lane-number { color: #0b8a58; }
.secondary-lane .lane-number { color: #0b7dad; }

.lane-flow {
  display: grid;
  align-items: stretch;
  padding: 12px;
}

.energy-flow { grid-template-columns: 1.15fr auto 1fr auto 1.15fr auto 1fr auto .85fr; }
.control-flow { grid-template-columns: 1fr auto 1.1fr auto 1fr auto 1fr; }

.flow-node {
  display: flex;
  min-width: 0;
  min-height: 86px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 9px 6px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 11px;
  background: var(--vp-c-bg);
  text-align: center;
}

.flow-node > span { margin-bottom: 4px; font-size: 1.15rem; line-height: 1; }
.flow-node strong { color: var(--vp-c-text-1); font-size: .82rem; line-height: 1.3; }
.flow-node small { margin-top: 4px; color: var(--vp-c-text-2); font-size: .66rem; line-height: 1.35; }
.flow-node.execute { border-color: rgba(224, 72, 94, .55); box-shadow: inset 0 -3px rgba(224, 72, 94, .16); }
.flow-node.result { border-style: dashed; }

.flow-arrow {
  display: grid;
  place-items: center;
  padding: 0 4px;
  color: #0b9560;
  font-size: 1.15rem;
}
.control-flow .flow-arrow { color: #1289bb; }
.control-flow .return { color: #7c6dd8; }

.ps-bridge {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 10px;
  align-items: center;
  padding: 8px 14px 0;
  color: var(--vp-c-text-2);
  font-size: .7rem;
}

.ps-bridge strong {
  padding: 6px 10px;
  border-radius: 999px;
  color: var(--vp-c-text-1);
  background: linear-gradient(90deg, rgba(16,166,107,.13), rgba(21,151,207,.14));
  text-align: center;
  white-space: nowrap;
}
.ps-bridge .sense { color: #0b8a58; }
.ps-bridge .command { color: #0b7dad; text-align: right; }

.ps-summary {
  margin-top: 14px;
  align-items: stretch;
}
.ps-summary div {
  display: grid;
  width: 50%;
  grid-template-columns: auto 1fr;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--vp-c-bg);
  font-size: .76rem;
}
.ps-summary strong { color: var(--vp-c-brand-1); white-space: nowrap; }
.ps-summary span { color: var(--vp-c-text-2); }

@media (max-width: 700px) {
  .ps-overview { padding: 15px; }
  .ps-head, .ps-summary { align-items: flex-start; flex-direction: column; }
  .ps-summary div { width: 100%; }
  .energy-flow, .control-flow { grid-template-columns: 1fr; gap: 6px; }
  .flow-node { min-height: 72px; }
  .flow-arrow { transform: rotate(90deg); padding: 0; }
  .control-flow .return { transform: none; }
  .ps-bridge { grid-template-columns: 1fr; text-align: center; }
  .ps-bridge .command { text-align: center; }
  .lane-title { flex-wrap: wrap; }
}
</style>
