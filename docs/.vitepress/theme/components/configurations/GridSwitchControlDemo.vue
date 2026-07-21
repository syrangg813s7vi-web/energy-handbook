<script setup lang="ts">
import { computed } from "vue";
import ConfigurationDemoControls from "./ConfigurationDemoControls.vue";
import { useStepDemo } from "./useStepDemo";

const states = [
  ["开关保持断开", "两侧尚未同期，开关保持断开，合闸许可为否。", "0.9%", "0.18 Hz", "14°", "断开", "无许可", 0, false, false],
  ["收到并网请求", "控制器先核对保护、检修、接地刀闸和开关机构联锁。", "0.9%", "0.18 Hz", "14°", "断开", "检查联锁", 18, false, false],
  ["微网向电网靠拢", "调节本地构网源，使两侧电压、频率和相角逐步接近。", "0.6%", "0.05 Hz", "4°", "断开", "同期中", 48, false, false],
  ["同期条件持续满足", "三个差值均进入允许窗，并连续稳定到确认时间。", "0.3%", "0.02 Hz", "1.2°", "断开", "同期许可", 76, true, false],
  ["发出合闸命令", "根据开关固有动作时间适当提前发令，使触头闭合时相角最小。", "0.2%", "0.01 Hz", "0.5°", "合闸中", "命令已发", 92, true, false],
  ["转入并网运行", "辅助触点确认闭合，控制模式由构网或同步控制切换到并网功率控制。", "0.1%", "0.00 Hz", "0.1°", "闭合", "并网完成", 100, true, true],
  ["故障优先分闸", "保护动作的优先级高于合闸流程：立即分闸，并闭锁自动重合。", "—", "—", "—", "跳闸", "保护闭锁", 0, false, false],
] as const;
const { step, playing, next, reset, togglePlay } = useStepDemo(states.length, 2400);
const s = computed(() => states[step.value]);
</script>

<template>
  <div class="config-demo grid-switch-demo" :class="{ fault:step===6 }">
    <ConfigurationDemoControls :current="step" :total="states.length" :playing="playing" @play="togglePlay" @next="next" @reset="reset" />
    <div class="config-stat-row"><div class="config-stat"><span>ΔU</span><strong>{{ s[2] }}</strong></div><div class="config-stat"><span>Δf</span><strong>{{ s[3] }}</strong></div><div class="config-stat"><span>Δθ</span><strong>{{ s[4] }}</strong></div></div>
    <div class="switch-stage">
      <svg viewBox="0 0 736 350" role="img" aria-labelledby="switch-title">
        <title id="switch-title">并网开关同期合闸状态机</title>
        <path class="wire left" d="M145 200 L285 200"/><path class="wire right" :class="{active:s[9]}" d="M455 200 L590 200"/>
        <circle class="packet"><animateMotion dur="1.4s" repeatCount="indefinite" path="M145 200 L285 200"/></circle>
        <circle v-if="s[9]" class="packet"><animateMotion dur="1.4s" repeatCount="indefinite" path="M455 200 L590 200"/></circle>
      </svg>
      <section class="node grid"><span>公共电网侧</span><strong>50.00 Hz</strong><small>电压 / 相位参考</small></section>
      <section class="node logic" :class="{permitted:s[8]}"><span>gridswitch_ctrl</span><strong>{{ s[6] }}</strong><small>联锁 → 同期 → 动作反馈</small></section>
      <section class="node breaker" :class="{closed:s[9]}"><span>并网开关</span><strong>{{ s[5] }}</strong><small>{{ s[9] ? "辅助触点已确认" : "两侧电气隔离" }}</small></section>
      <section class="node island"><span>场站 / 微网侧</span><strong>{{ step<3 ? "正在调频调相" : "已接近电网" }}</strong><small>构网源调整参考</small></section>
      <div class="sync-window"><span>同期确认进度</span><div><i :style="{width:`${s[7]}%`}"/></div><strong>{{ s[7] }}%</strong></div>
    </div>
    <div class="config-detail" role="status" aria-live="polite"><strong>{{ s[0] }}</strong><span>{{ s[1] }}</span></div>
    <div class="config-progress"><span :style="{width:`${((step+1)/states.length)*100}%`}"/></div>
  </div>
</template>

<style scoped>
.switch-stage{position:relative;min-height:350px;aspect-ratio:736/350}.switch-stage svg{position:absolute;inset:0;width:100%;height:100%}.wire{fill:none;stroke:var(--config-accent);stroke-width:2}.wire.right{stroke:var(--config-line);stroke-dasharray:7 5}.wire.right.active{stroke:var(--config-accent);stroke-dasharray:none}.packet{r:5;fill:var(--config-accent)}.node{position:absolute;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;gap:4px;min-height:82px;padding:11px;border:1px solid var(--config-line);border-radius:10px;background:var(--config-node);transition:.4s}.node span,.node small{color:var(--vp-c-text-2)}.grid{top:158px;left:0;width:19.7%}.logic{top:16px;left:38%;width:24%}.breaker{top:158px;left:38%;width:24%;text-align:center}.island{top:158px;right:0;width:19.7%}.logic.permitted,.breaker.closed{border-color:var(--config-accent);background:var(--config-accent-soft)}.fault .logic,.fault .breaker{border-color:var(--config-danger);color:var(--config-danger)}.sync-window{position:absolute;left:24%;right:24%;bottom:18px;display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;color:var(--vp-c-text-2)}.sync-window>div{height:10px;overflow:hidden;border-radius:999px;background:var(--config-track)}.sync-window i{display:block;height:100%;background:var(--config-accent);transition:width .6s var(--config-ease)}
@media(max-width:680px){.switch-stage{display:grid;grid-template-columns:1fr 1fr;gap:10px;min-height:0;aspect-ratio:auto}.switch-stage svg{display:none}.node{position:static;width:auto;min-height:92px}.grid{order:1}.island{order:2}.logic{order:3}.breaker{order:4}.sync-window{position:static;grid-column:1/-1;order:5}}
@media(prefers-reduced-motion:reduce){.packet{display:none}}
</style>
