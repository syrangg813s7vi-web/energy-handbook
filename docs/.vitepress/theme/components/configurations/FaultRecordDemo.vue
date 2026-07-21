<script setup lang="ts">
import { computed } from "vue";
import ConfigurationDemoControls from "./ConfigurationDemoControls.vue";
import { useStepDemo } from "./useStepDemo";

const states = [
  ["持续监视", "正常时也在高速采样，环形缓存始终保留最近一小段历史。", "未触发", "滚动写入", "等待事件", "等待分析", 0, false, false, false],
  ["环形缓存覆盖旧数据", "空间固定；新样本覆盖最旧样本，不需无限内存，也随时保留故障前状态。", "未触发", "写指针循环", "等待事件", "等待分析", 16, false, false, false],
  ["故障条件触发", "电流越限、保护启动、开关跳闸或外部命令均可触发，并锁存触发原因和时刻。", "过流 t = 0", "前 200 ms 冻结", "等待后窗", "等待分析", 35, true, false, false],
  ["继续记录故障后数据", "触发后不立即停采，继续保存故障发展、保护动作和断路器切除过程。", "已锁存", "后 1.0 s 采集中", "事件未完成", "等待分析", 58, true, false, false],
  ["生成事件文件", "通道配置、采样率、统一时间戳、模拟量和开关量一起写入 COMTRADE。", "记录完成", "窗口已冻结", "COMTRADE", "文件可读取", 82, true, true, false],
  ["用于事后诊断", "用录波判断故障类型、保护时序、开关切除时间和控制响应，也可回放校核模型。", "事件归档", "恢复滚动采样", "不可变保存", "定位 · 保护 · 回放", 100, true, true, true],
] as const;
const { step, playing, next, reset, togglePlay } = useStepDemo(states.length, 2500);
const s = computed(() => states[step.value]);
</script>

<template>
  <div class="config-demo fault-record-demo">
    <ConfigurationDemoControls :current="step" :total="states.length" :playing="playing" @play="togglePlay" @next="next" @reset="reset" />
    <div class="config-stat-row"><div class="config-stat"><span>触发状态</span><strong>{{ s[2] }}</strong></div><div class="config-stat"><span>记录窗口</span><strong>{{ s[3] }}</strong></div><div class="config-stat"><span>事件进度</span><strong>{{ s[6] }}%</strong></div></div>
    <div class="record-stage">
      <svg viewBox="0 0 736 300" preserveAspectRatio="none" role="img" aria-labelledby="record-title"><title id="record-title">故障录波的触发前后记录流程</title>
        <path class="wire active" d="M145 140 L245 140"/><path class="wire" :class="{active:s[7]}" d="M365 140 L465 140"/><path class="wire" :class="{active:s[8]}" d="M585 140 L685 140"/>
        <circle class="packet"><animateMotion dur="1.2s" repeatCount="indefinite" path="M145 140 L245 140"/></circle><circle v-if="s[7]" class="packet"><animateMotion dur="1.2s" repeatCount="indefinite" path="M365 140 L465 140"/></circle><circle v-if="s[8]" class="packet"><animateMotion dur="1.2s" repeatCount="indefinite" path="M585 140 L685 140"/></circle>
      </svg>
      <section class="node signal"><span>配置通道</span><strong>波形 + 状态</strong><small>电压 · 电流 · 保护位</small></section>
      <section class="node buffer" :class="{on:s[7]}"><span>环形缓存</span><strong>{{ s[3] }}</strong><small>持续高速采样</small></section>
      <section class="node file" :class="{on:s[8]}"><span>事件文件</span><strong>{{ s[4] }}</strong><small>CFG / DAT / CFF</small></section>
      <section class="node analysis" :class="{on:s[9]}"><span>事后分析</span><strong>{{ s[5] }}</strong><small>统一时标对齐</small></section>
      <div class="wave" :class="{triggered:s[7]}"><svg viewBox="0 0 600 60" preserveAspectRatio="none"><path d="M0 35 C25 5 50 55 75 25 S125 50 150 28 S200 45 225 28 S275 42 300 30 C315 3 330 58 345 10 S380 55 400 15 S440 53 460 22 S510 48 600 30"/><line x1="300" y1="0" x2="300" y2="60"/></svg><span>触发前</span><strong>t = 0</strong><span>触发后</span></div>
    </div>
    <div class="config-detail" role="status" aria-live="polite"><strong>{{ s[0] }}</strong><span>{{ s[1] }}</span></div><div class="config-progress"><span :style="{width:`${((step+1)/states.length)*100}%`}"/></div>
  </div>
</template>

<style scoped>
.record-stage{position:relative;min-height:300px;aspect-ratio:736/300}.record-stage>svg{position:absolute;inset:0;width:100%;height:100%}.wire{fill:none;stroke:var(--config-line);stroke-width:2}.wire.active{stroke:var(--config-accent)}.packet{r:5;fill:var(--config-accent)}.node{position:absolute;top:46.67%;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;gap:4px;width:16.3%;min-height:84px;padding:10px;border:1px solid var(--config-line);border-radius:10px;background:var(--config-node);transform:translateY(-50%);transition:.4s}.node span,.node small{color:var(--vp-c-text-2)}.node.on{border-color:var(--config-accent);background:var(--config-accent-soft)}.signal{left:0}.buffer{left:33.3%}.file{left:66.4%}.analysis{right:0}.wave{position:absolute;left:8%;right:8%;bottom:6px;display:grid;grid-template-columns:1fr auto 1fr;align-items:end;text-align:center;color:var(--vp-c-text-2)}.wave svg{grid-column:1/-1;width:100%;height:54px}.wave path{fill:none;stroke:var(--config-accent);stroke-width:2}.wave line{stroke:var(--config-line);stroke-dasharray:4 3}.wave.triggered line{stroke:var(--config-danger);stroke-width:2}
@media(max-width:680px){.record-stage{display:grid;grid-template-columns:1fr 1fr;gap:10px;min-height:0;aspect-ratio:auto}.record-stage>svg{display:none}.node{position:static;width:auto;min-height:92px;transform:none}.signal{order:1}.buffer{order:2}.file{order:3}.analysis{order:4}.wave{position:relative;left:auto;right:auto;bottom:auto;grid-column:1/-1;order:5}}
@media(prefers-reduced-motion:reduce){.packet{display:none}}
</style>
