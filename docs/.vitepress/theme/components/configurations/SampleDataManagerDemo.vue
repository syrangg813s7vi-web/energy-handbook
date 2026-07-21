<script setup lang="ts">
import { computed } from "vue";
import ConfigurationDemoControls from "./ConfigurationDemoControls.vue";
import { useStepDemo } from "./useStepDemo";

const states = [
  ["接收设备采样", "先按点表识别变量、单位和来源，不把不同周期上送的数字混在一起。", "采集", "等待检查", "等待更新", "尚未写入", "等待数据", false, false, false],
  ["检查时间戳和质量", "值、源时间、接收时间和质量码一起处理；坏值被标记，而不是伪装成正常值。", "质量检查", "24 个坏点已标记", "坏值不覆盖好值", "保存质量码", "等待有效值", true, false, false],
  ["对齐不同采样周期", "10 ms、100 ms 和 1 s 数据按统一时间轴保持或插值，并保留原始时标。", "时间对齐", "源时间已对齐", "形成同刻数据帧", "等待批次", "等待完整帧", true, false, false],
  ["更新实时缓存", "最新有效值和短时间窗供实时算法读取，通信恢复后可补写暂存数据。", "实时缓存", "质量状态正常", "最新值 + 短时窗", "等待落盘", "实时算法可读", true, true, false],
  ["原始与聚合分层保存", "近期保留高分辨率原始值，长期保存分钟或小时的最小、最大、平均和质量覆盖率。", "分层存储", "质量码随数据保存", "近期窗口", "原始 + 1 min 聚合", "实时与历史可读", true, true, true],
  ["按变量和时间查询", "趋势、报表和分析走独立读路径，不阻塞实时采集与控制数据通道。", "查询服务", "返回值和质量", "近期快速查询", "按时间范围返回", "趋势 · 报表 · 分析", true, true, true],
] as const;
const { step, playing, next, reset, togglePlay } = useStepDemo(states.length, 2500);
const s = computed(() => states[step.value]);
</script>

<template>
  <div class="config-demo sample-manager-demo">
    <ConfigurationDemoControls :current="step" :total="states.length" :playing="playing" @play="togglePlay" @next="next" @reset="reset" />
    <div class="config-stat-row"><div class="config-stat"><span>数据速率</span><strong>约 12,000 点/s</strong></div><div class="config-stat"><span>当前层</span><strong>{{ s[2] }}</strong></div><div class="config-stat"><span>数据质量</span><strong>{{ step?"99.8%":"待检查" }}</strong></div></div>
    <div class="sample-stage">
      <svg viewBox="0 0 736 300" preserveAspectRatio="none" role="img" aria-labelledby="sample-title"><title id="sample-title">采样数据从设备流向实时缓存、历史库和消费者</title>
        <path class="wire active" d="M135 145 L230 145"/><path class="wire" :class="{active:s[7]}" d="M350 145 L445 80"/><path class="wire" :class="{active:s[8]}" d="M350 145 L445 220"/><path class="wire" :class="{active:s[9]}" d="M565 80 C625 80 625 145 680 145 M565 220 C625 220 625 145 680 145"/>
        <circle class="packet"><animateMotion dur="1.2s" repeatCount="indefinite" path="M135 145 L230 145"/></circle><circle v-if="s[7]" class="packet"><animateMotion dur="1.2s" repeatCount="indefinite" path="M350 145 L445 80"/></circle><circle v-if="s[8]" class="packet"><animateMotion dur="1.2s" repeatCount="indefinite" path="M350 145 L445 220"/></circle><circle v-if="s[9]" class="packet"><animateMotion dur="1.4s" repeatCount="indefinite" path="M565 220 C625 220 625 145 680 145"/></circle>
      </svg>
      <section class="node source"><span>设备采样流</span><strong>10 ms · 100 ms · 1 s</strong><small>值 + 时间 + 质量</small></section>
      <section class="node manager" :class="{on:s[7]}"><span>sample_data_manager</span><strong>{{ s[2] }}</strong><small>{{ s[3] }}</small></section>
      <section class="node cache" :class="{on:s[8]}"><span>实时缓存</span><strong>{{ s[4] }}</strong><small>最新值 / 短时窗</small></section>
      <section class="node history" :class="{on:s[9]}"><span>历史存储</span><strong>{{ s[5] }}</strong><small>原始 / 聚合 / 保留策略</small></section>
      <section class="node consumer" :class="{on:step>=3}"><span>数据消费者</span><strong>{{ s[6] }}</strong><small>控制 · 趋势 · 报表</small></section>
    </div>
    <div class="config-detail" role="status" aria-live="polite"><strong>{{ s[0] }}</strong><span>{{ s[1] }}</span></div><div class="config-progress"><span :style="{width:`${((step+1)/states.length)*100}%`}"/></div>
  </div>
</template>

<style scoped>
.sample-stage{position:relative;min-height:300px;aspect-ratio:736/300}.sample-stage svg{position:absolute;inset:0;width:100%;height:100%}.wire{fill:none;stroke:var(--config-line);stroke-width:2}.wire.active{stroke:var(--config-accent)}.packet{r:5;fill:var(--config-accent)}.node{position:absolute;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;gap:4px;min-height:84px;padding:10px;border:1px solid var(--config-line);border-radius:10px;background:var(--config-node);transform:translateY(-50%);transition:.4s}.node span,.node small{color:var(--vp-c-text-2)}.node.on{border-color:var(--config-accent);background:var(--config-accent-soft)}.source{top:48.33%;left:0;width:18.3%}.manager{top:48.33%;left:31.2%;width:19%}.cache{top:26.67%;left:60.5%;width:19%}.history{top:73.33%;left:60.5%;width:19%}.consumer{top:48.33%;right:0;width:14.3%}
@media(max-width:680px){.sample-stage{display:grid;grid-template-columns:1fr 1fr;gap:10px;min-height:0;aspect-ratio:auto}.sample-stage svg{display:none}.node{position:static;width:auto;min-height:92px;transform:none}.source{order:1}.manager{order:2}.cache{order:3}.history{order:4}.consumer{order:5;grid-column:1/-1}}
@media(prefers-reduced-motion:reduce){.packet{display:none}}
</style>
