<script setup lang="ts">
import { computed } from "vue";
import ConfigurationDemoControls from "./ConfigurationDemoControls.vue";
import { useStepDemo } from "./useStepDemo";

const states = [
  ["并网运行", "外部电网固定母线电压和频率，本地资源按照功率指令运行。", 50, 400, "外部电网", "闭合", "购电 20 MW", "5 MW", "并网功率控制", "60 MW", false, false],
  ["离网前功率预平衡", "储能先提高出力，把并网点交换功率降到 2 MW，减小断开冲击。", 50, 400, "外部电网", "准备断开", "购电 2 MW", "23 MW", "预平衡功率", "60 MW", false, false],
  ["并网开关断开", "外部电网退出，构网型储能立即接管本地母线的电压和频率参考。", 49.9, 398, "构网型储能", "断开", "交换 0 MW", "25 MW", "V/f 构网控制", "60 MW", true, false],
  ["离网负荷突然增加", "负荷阶跃产生瞬时功率缺口，频率和电压下跌，一次调节开始响应。", 49.6, 392, "构网型储能", "断开", "交换 0 MW", "40 MW", "下垂增功率", "75 MW", true, false],
  ["一次调节稳定供需", "构网源通过 P–f 与 Q–V 下垂支撑，先阻止频率和电压继续下降。", 49.9, 398, "构网型储能", "断开", "交换 0 MW", "40 MW", "下垂分担负荷", "75 MW", true, false],
  ["二次控制恢复额定值", "上层控制缓慢修正参考，把频率和电压恢复到额定值。", 50, 400, "构网型储能", "断开", "交换 0 MW", "40 MW", "二次 V/f 恢复", "75 MW", true, false],
  ["能力不足时切负荷", "本地最多稳定供应 80 MW，切除 10 MW 非重要负荷，优先守住 V/f。", 50, 400, "构网型储能", "断开", "交换 0 MW", "45 MW", "达到可用上限", "已供 80 MW", true, true],
] as const;

const { step, playing, next, reset, togglePlay } = useStepDemo(states.length, 2500);
const s = computed(() => states[step.value]);
</script>

<template>
  <div class="config-demo off-grid-demo">
    <ConfigurationDemoControls :current="step" :total="states.length" :playing="playing" @play="togglePlay" @next="next" @reset="reset" />
    <div class="config-stat-row">
      <div class="config-stat"><span>母线频率</span><strong>{{ s[2].toFixed(1) }} Hz</strong></div>
      <div class="config-stat"><span>母线电压</span><strong>{{ s[3] }} V</strong></div>
      <div class="config-stat"><span>V/f 参考</span><strong>{{ s[4] }}</strong></div>
    </div>
    <div class="island-stage">
      <svg viewBox="0 0 736 420" preserveAspectRatio="none" role="img" aria-labelledby="off-grid-title">
        <title id="off-grid-title">微电网由并网切换到离网运行</title>
        <path class="wire" :class="{ inactive: s[10] }" d="M120 195 L160 195 M260 195 L325 195" />
        <path class="wire active" d="M435 195 L616 195 M380 318 L380 250" />
        <path class="wire" :class="{ active: s[10] }" d="M380 106 L380 150" />
        <circle v-if="!s[10]" class="packet" r="5"><animateMotion dur="1.2s" repeatCount="indefinite" path="M120 195 L325 195" /></circle>
        <circle class="packet" r="5"><animateMotion dur="1.5s" repeatCount="indefinite" path="M435 195 L616 195" /></circle>
        <circle class="packet" r="5"><animateMotion dur="1.1s" repeatCount="indefinite" path="M380 318 L380 250" /></circle>
        <circle v-if="s[10]" class="packet" r="5"><animateMotion dur="1.1s" repeatCount="indefinite" path="M380 106 L380 150" /></circle>
      </svg>
      <section class="node grid"><span>公共电网</span><strong>{{ s[6] }}</strong><small>强电压 / 频率参考</small></section>
      <section class="node breaker" :class="{ open: s[10] }"><span>并网开关</span><strong>{{ s[5] }}</strong><small>{{ s[10] ? "电气隔离" : "与电网并联" }}</small></section>
      <section class="node bus" :class="{ leader: s[10] }"><span>本地交流母线</span><strong>{{ s[10] ? "储能建立参考" : "电网定频定压" }}</strong><small>光伏 35 MW</small></section>
      <section class="node storage" :class="{ leader: s[10] }"><span>储能 / 构网源</span><strong>{{ s[7] }}</strong><small>{{ s[8] }}</small></section>
      <section class="node pv"><span>光伏 / 跟网源</span><strong>35 MW</strong><small>跟随本地母线</small></section>
      <section class="node load" :class="{ danger: s[11] }"><span>本地负荷</span><strong>{{ s[9] }}</strong><small>{{ s[11] ? "已切除 10 MW" : "全部负荷供电" }}</small></section>
    </div>
    <div class="config-detail" role="status" aria-live="polite"><strong>{{ s[0] }}</strong><span>{{ s[1] }}</span></div>
    <div class="config-progress"><span :style="{ width: `${((step + 1) / states.length) * 100}%` }" /></div>
  </div>
</template>

<style scoped>
.island-stage{position:relative;min-height:390px;aspect-ratio:736/390}.island-stage svg{position:absolute;inset:0;width:100%;height:100%}.wire{fill:none;stroke:var(--config-line);stroke-width:2;transition:stroke .4s,opacity .4s}.wire.active{stroke:var(--config-accent)}.wire.inactive{stroke:var(--config-danger);stroke-dasharray:6 5;opacity:.55}.packet{fill:var(--config-accent)}.node{position:absolute;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;gap:4px;min-height:80px;padding:11px;border:1px solid var(--config-line);border-radius:10px;background:var(--config-node);transition:.4s var(--config-ease)}.node span,.node small{color:var(--vp-c-text-2)}.node.leader{border-color:var(--config-accent);background:var(--config-accent-soft)}.node.open{border-color:var(--config-danger);opacity:.72}.node.danger{border-color:var(--config-danger);color:var(--config-danger)}.grid{top:150px;left:0;width:16.3%}.breaker{top:150px;left:21.74%;width:13.59%}.bus{top:150px;left:44.16%;width:14.95%}.storage{top:8px;left:43.48%;width:16.3%}.pv{top:292px;left:43.48%;width:16.3%}.load{top:150px;left:83.7%;width:16.3%}
.island-stage{min-height:420px;aspect-ratio:736/420}.node{transform:translateY(-50%)}.grid,.breaker,.bus,.load{top:46.43%}.storage{top:10%}.pv{top:86.9%}
@media(max-width:680px){.island-stage{display:grid;grid-template-columns:1fr 1fr;gap:10px;min-height:0;aspect-ratio:auto}.island-stage svg{display:none}.node{position:static;width:auto;min-height:92px;transform:none}.grid{order:1}.breaker{order:2}.storage{order:3}.pv{order:4}.bus{order:5}.load{order:6}}
@media(prefers-reduced-motion:reduce){.packet{display:none}}
</style>
