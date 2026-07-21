<script setup lang="ts">
import { computed } from "vue";
import ConfigurationDemoControls from "./ConfigurationDemoControls.vue";
import { useStepDemo } from "./useStepDemo";

const states = [
  ["系统完全失电", "站内母线无压，普通跟网型逆变器没有可跟随的电压，不能自行启动。", "0 V", "停电", 0, false, false, false],
  ["隔离故障并建立启动路径", "先确认故障区段隔离、开关位置正确，避免把黑启动源送入未清除故障。", "0 V", "路径检查", 8, false, false, false],
  ["黑启动源自主启动", "具备独立直流与辅助电源的构网型储能启动，准备建立 V/f。", "80 V", "储能启动", 22, true, false, false],
  ["母线软升压并空载稳定", "控制升压斜率并限制变压器励磁涌流，先建立稳定空载母线。", "400 V", "母线稳定", 40, true, false, false],
  ["优先投入关键负荷", "按负荷块逐级投入站用电、通信和控制等关键负荷，观察每次阶跃。", "400 V", "关键负荷供电", 58, true, true, false],
  ["母线稳定后投入光伏", "有稳定电压和频率后，跟网型光伏才具备同步并投入的条件。", "400 V", "光伏已投入", 78, true, true, true],
  ["逐级扩大恢复范围", "在频率、电压和备用能力允许时继续恢复普通负荷，始终保留调节裕度。", "400 V", "恢复完成", 100, true, true, true],
] as const;
const { step, playing, next, reset, togglePlay } = useStepDemo(states.length, 2500);
const s = computed(() => states[step.value]);
</script>

<template>
  <div class="config-demo black-start-demo">
    <ConfigurationDemoControls :current="step" :total="states.length" :playing="playing" @play="togglePlay" @next="next" @reset="reset" />
    <div class="config-stat-row"><div class="config-stat"><span>母线电压</span><strong>{{ s[2] }}</strong></div><div class="config-stat"><span>恢复状态</span><strong>{{ s[3] }}</strong></div><div class="config-stat"><span>恢复进度</span><strong>{{ s[4] }}%</strong></div></div>
    <div class="black-stage">
      <svg viewBox="0 0 736 330" role="img" aria-labelledby="black-title"><title id="black-title">场站从无压状态逐级黑启动</title>
        <path class="wire" :class="{active:s[5]}" d="M135 165 L290 165"/><path class="wire" :class="{active:s[6]}" d="M405 165 L600 80"/><path class="wire" :class="{active:s[7]}" d="M405 165 L600 250"/>
        <circle v-if="s[5]" class="packet"><animateMotion dur="1.5s" repeatCount="indefinite" path="M135 165 L290 165"/></circle><circle v-if="s[6]" class="packet"><animateMotion dur="1.5s" repeatCount="indefinite" path="M405 165 L600 80"/></circle><circle v-if="s[7]" class="packet"><animateMotion dur="1.5s" repeatCount="indefinite" path="M405 165 L600 250"/></circle>
      </svg>
      <section class="node source" :class="{on:s[5]}"><span>构网型储能</span><strong>{{ s[5]?"V/f 已建立":"停止" }}</strong><small>独立辅助电源</small></section>
      <section class="node bus" :class="{on:s[5]}"><span>交流母线</span><strong>{{ s[2] }}</strong><small>软升压 / 涌流约束</small></section>
      <section class="node critical" :class="{on:s[6]}"><span>关键负荷</span><strong>{{ s[6]?"已供电":"待恢复" }}</strong><small>站用电 · 控制 · 通信</small></section>
      <section class="node pv" :class="{on:s[7]}"><span>跟网型光伏</span><strong>{{ s[7]?"已同步投入":"等待母线" }}</strong><small>不能独自建立 V/f</small></section>
      <div class="restore-track"><span>隔离故障</span><span>建立 V/f</span><span>关键负荷</span><span>其他电源</span><span>扩大恢复</span><i :style="{width:`${s[4]}%`}"/></div>
    </div>
    <div class="config-detail" role="status" aria-live="polite"><strong>{{ s[0] }}</strong><span>{{ s[1] }}</span></div><div class="config-progress"><span :style="{width:`${((step+1)/states.length)*100}%`}"/></div>
  </div>
</template>

<style scoped>
.black-stage{position:relative;min-height:330px;aspect-ratio:736/330}.black-stage svg{position:absolute;inset:0;width:100%;height:100%}.wire{fill:none;stroke:var(--config-line);stroke-width:2}.wire.active{stroke:var(--config-accent)}.packet{r:5;fill:var(--config-accent)}.node{position:absolute;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;gap:4px;min-height:82px;padding:11px;border:1px solid var(--config-line);border-radius:10px;background:var(--config-node);opacity:.65;transition:.4s}.node span,.node small{color:var(--vp-c-text-2)}.node.on{border-color:var(--config-accent);background:var(--config-accent-soft);opacity:1}.source{top:123px;left:0;width:18.3%}.bus{top:123px;left:39.4%;width:16%}.critical{top:38px;right:0;width:18.5%}.pv{top:208px;right:0;width:18.5%}.restore-track{position:absolute;left:16%;right:16%;bottom:12px;display:grid;grid-template-columns:repeat(5,1fr);gap:5px;padding-top:16px;border-top:5px solid var(--config-track);font-size:.76rem;color:var(--vp-c-text-2);text-align:center}.restore-track i{position:absolute;top:-5px;left:0;height:5px;background:var(--config-accent);transition:width .6s}
@media(max-width:680px){.black-stage{display:grid;grid-template-columns:1fr 1fr;gap:10px;min-height:0;aspect-ratio:auto}.black-stage svg{display:none}.node{position:static;width:auto;min-height:92px}.source{order:1}.bus{order:2}.critical{order:3}.pv{order:4}.restore-track{position:relative;left:auto;right:auto;bottom:auto;grid-column:1/-1;order:5}.restore-track span{font-size:.66rem}}
@media(prefers-reduced-motion:reduce){.packet{display:none}}
</style>
