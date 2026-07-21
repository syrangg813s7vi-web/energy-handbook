<script setup lang="ts">
import { computed } from "vue";
import ConfigurationDemoControls from "./ConfigurationDemoControls.vue";
import { useStepDemo } from "./useStepDemo";

const states = [
  ["稳定并网", "外部电网提供频率和相位参考，场站在并网点闭环跟踪 60 MW。", 60, 60, 50, 10, "目标已达到", false],
  ["调度提高有功目标", "目标从 60 MW 提高到 80 MW，场站控制器计算并网点偏差。", 80, 60, 50, 10, "偏差 +20 MW", false],
  ["把增量分给设备", "控制器依据可发能力、SOC 和爬坡边界，把增量分给光伏与储能。", 80, 70, 58, 12, "设备正在响应", true],
  ["并网点闭环收敛", "并网点反馈持续回送，场站总出力收敛到目标，不要求设备输出相同 MW。", 80, 80, 65, 15, "有功目标达到", true],
  ["无功回路调节电压", "有功闭环之外，无功或电压回路根据并网点反馈独立调节。", 80, 80, 65, 15, "电压回到允许带", true],
  ["波动由储能补偿", "云影使光伏降到 57 MW，储能暂时提高到 23 MW，守住并网点目标。", 80, 80, 57, 23, "储能补偿波动", true],
] as const;
const { step, playing, next, reset, togglePlay } = useStepDemo(states.length, 2400);
const s = computed(() => states[step.value]);
</script>

<template>
  <div class="config-demo grid-connected-demo">
    <ConfigurationDemoControls :current="step" :total="states.length" :playing="playing" @play="togglePlay" @next="next" @reset="reset" />
    <div class="config-stat-row">
      <div class="config-stat"><span>并网点目标</span><strong>{{ s[2] }} MW</strong></div>
      <div class="config-stat"><span>并网点实测</span><strong>{{ s[3] }} MW</strong></div>
      <div class="config-stat"><span>闭环状态</span><strong>{{ s[6] }}</strong></div>
    </div>
    <div class="gc-stage">
      <svg viewBox="0 0 736 330" role="img" aria-labelledby="gc-title">
        <title id="gc-title">场站并网点有功闭环控制</title>
        <path class="wire command" d="M110 70 C210 70 205 145 300 145" />
        <path class="wire" :class="{ active:s[7] }" d="M410 130 C485 100 500 65 610 65 M410 160 C485 190 500 230 610 230" />
        <path class="wire active" d="M610 100 C510 120 510 280 310 280 C220 280 210 205 300 175" />
        <circle class="packet"><animateMotion dur="1.4s" repeatCount="indefinite" path="M110 70 C210 70 205 145 300 145" /></circle>
        <circle v-if="s[7]" class="packet"><animateMotion dur="1.3s" repeatCount="indefinite" path="M410 130 C485 100 500 65 610 65" /></circle>
        <circle v-if="s[7]" class="packet"><animateMotion dur="1.3s" repeatCount="indefinite" path="M410 160 C485 190 500 230 610 230" /></circle>
        <circle class="packet"><animateMotion dur="2.1s" repeatCount="indefinite" path="M610 100 C510 120 510 280 310 280 C220 280 210 205 300 175" /></circle>
      </svg>
      <section class="node dispatch"><span>调度 / 上层目标</span><strong>{{ s[2] }} MW</strong><small>有功目标 P*</small></section>
      <section class="node controller"><span>场站控制器</span><strong>{{ s[6] }}</strong><small>POI 闭环 + 约束分配</small></section>
      <section class="node pv"><span>光伏</span><strong>{{ s[4] }} MW</strong><small>受可发能力约束</small></section>
      <section class="node bess"><span>储能</span><strong>{{ s[5] }} MW</strong><small>受功率 / SOC 约束</small></section>
      <section class="node poi" :class="{ reached:s[2]===s[3] }"><span>并网点 POI</span><strong>{{ s[3] }} MW</strong><small>反馈 P / Q / U</small></section>
    </div>
    <div class="config-detail" role="status" aria-live="polite"><strong>{{ s[0] }}</strong><span>{{ s[1] }}</span></div>
    <div class="config-progress"><span :style="{width:`${((step+1)/states.length)*100}%`}" /></div>
  </div>
</template>

<style scoped>
.gc-stage{position:relative;min-height:330px;aspect-ratio:736/330}.gc-stage svg{position:absolute;inset:0;width:100%;height:100%}.wire{fill:none;stroke:var(--config-line);stroke-width:2;transition:.4s}.wire.active,.wire.command{stroke:var(--config-accent)}.packet{r:5;fill:var(--config-accent)}.node{position:absolute;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;gap:4px;min-height:82px;padding:11px;border:1px solid var(--config-line);border-radius:10px;background:var(--config-node);transition:.4s var(--config-ease)}.node span,.node small{color:var(--vp-c-text-2)}.controller,.reached{border-color:var(--config-accent);background:var(--config-accent-soft)}.dispatch{top:28px;left:0;width:20%}.controller{top:110px;left:40.7%;width:18%}.pv{top:24px;right:0;width:18%}.bess{top:190px;right:0;width:18%}.poi{top:240px;left:22%;width:18%}
@media(max-width:680px){.gc-stage{display:grid;grid-template-columns:1fr 1fr;gap:10px;min-height:0;aspect-ratio:auto}.gc-stage svg{display:none}.node{position:static;width:auto;min-height:92px}.dispatch{order:1}.controller{order:2}.pv{order:3}.bess{order:4}.poi{order:5;grid-column:1/-1}}
@media(prefers-reduced-motion:reduce){.packet{display:none}}
</style>
