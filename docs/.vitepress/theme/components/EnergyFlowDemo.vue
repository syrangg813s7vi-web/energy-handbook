<script setup lang="ts">
import { computed, ref, useId } from "vue";

const props = withDefaults(defineProps<{
  inputWatts?: number;
  efficiency?: number;
}>(), {
  inputWatts: 1000,
  efficiency: 82,
});

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

const input = ref(clamp(props.inputWatts, 100, 5000));
const efficiency = ref(clamp(props.efficiency, 10, 100));
const titleId = `energy-demo-${useId()}`;
const output = computed(() => Math.round(input.value * efficiency.value / 100));
const loss = computed(() => input.value - output.value);
const formatWatts = (value: number) =>
  `${new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 0 }).format(value)} W`;

const status = computed(() =>
  `输入${formatWatts(input.value)}，效率${efficiency.value}%，` +
  `有效输出${formatWatts(output.value)}，其他形式的输出${formatWatts(loss.value)}。`,
);
</script>

<template>
  <section class="energy-demo" :aria-labelledby="titleId">
    <header class="header">
      <h3 :id="titleId">能量转换演示</h3>
      <span class="equation">有效输出 = 输入 × 效率</span>
    </header>

    <div class="controls">
      <label>
        <span class="label-row">
          <span>输入功率</span>
          <output>{{ formatWatts(input) }}</output>
        </span>
        <input v-model.number="input" type="range" min="100" max="5000" step="100">
      </label>
      <label>
        <span class="label-row">
          <span>系统效率</span>
          <output>{{ efficiency }}%</output>
        </span>
        <input v-model.number="efficiency" type="range" min="10" max="100" step="1">
      </label>
    </div>

    <div class="flow" aria-hidden="true">
      <div class="path" />
      <div class="node source">
        <span class="icon">☀</span>
        <strong>{{ formatWatts(input) }}</strong>
        <small>一次输入</small>
      </div>
      <div class="node converter">
        <span class="icon">◈</span>
        <strong>{{ efficiency }}%</strong>
        <small>转换系统</small>
      </div>
      <div class="node load">
        <span class="icon">⌂</span>
        <strong>{{ formatWatts(output) }}</strong>
        <small>有效输出</small>
      </div>
      <div class="loss">
        <span class="loss-dot" />
        <span>其他形式的输出（损失）{{ formatWatts(loss) }}</span>
      </div>
    </div>

    <p class="sr-only" role="status" aria-live="polite">{{ status }}</p>
  </section>
</template>

<style scoped>
.energy-demo {
  --sun: #f4b942;
  --grid: #168b85;
  --use: #3e6fb0;
  --loss: #c95b45;
  position: relative;
  overflow: hidden;
  margin: 1.5rem 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 1rem;
  color: var(--vp-c-text-1);
  background: color-mix(in srgb, var(--vp-c-bg) 96%, var(--grid));
  box-shadow: 0 0.5rem 1.6rem color-mix(in srgb, #102d2b 10%, transparent);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  padding: 1rem 1.1rem 0;
}

.header h3 {
  margin: 0;
  border: 0;
  padding: 0;
  font-size: 1rem;
}

.equation {
  font-size: 0.76rem;
  opacity: 0.72;
}

.controls {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem 1.2rem;
  padding: 1rem 1.1rem;
}

label {
  display: grid;
  gap: 0.35rem;
  font-size: 0.78rem;
  font-weight: 600;
}

.label-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

output {
  color: var(--grid);
  font-variant-numeric: tabular-nums;
}

input {
  width: 100%;
  accent-color: var(--grid);
  cursor: pointer;
}

.flow {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: center;
  min-height: 12rem;
  padding: 1rem;
  background:
    radial-gradient(circle at 10% 15%, color-mix(in srgb, var(--sun) 16%, transparent), transparent 30%),
    linear-gradient(145deg, color-mix(in srgb, var(--grid) 7%, transparent), transparent 60%);
}

.node {
  position: relative;
  z-index: 2;
  display: grid;
  justify-items: center;
  gap: 0.4rem;
  text-align: center;
}

.node strong {
  font-size: 1rem;
  font-variant-numeric: tabular-nums;
}

.node small {
  opacity: 0.76;
}

.icon {
  display: grid;
  place-items: center;
  width: 4.2rem;
  height: 4.2rem;
  border: 0.18rem solid currentColor;
  border-radius: 50%;
  background: var(--vp-c-bg);
  font-size: 1.7rem;
  box-shadow: 0 0.25rem 0.8rem color-mix(in srgb, currentColor 16%, transparent);
}

.source { color: #a66a00; }
.converter { color: var(--grid); }
.load { color: var(--use); }

.path {
  position: absolute;
  z-index: 1;
  top: 49%;
  right: 18%;
  left: 18%;
  height: 0.28rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--grid) 25%, transparent);
}

.path::after {
  content: "";
  position: absolute;
  top: -0.18rem;
  width: 0.65rem;
  height: 0.65rem;
  border-radius: 50%;
  background: var(--sun);
  box-shadow: 0 0 0.7rem var(--sun);
  animation: travel 2.2s linear infinite;
}

.loss {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.9rem;
  color: var(--loss);
  font-size: 0.76rem;
  font-weight: 650;
}

.loss-dot {
  width: 0.55rem;
  height: 0.55rem;
  border-radius: 50%;
  background: currentColor;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
  white-space: nowrap;
}

@keyframes travel {
  from { left: 0; }
  to { left: calc(100% - 0.65rem); }
}

@media (prefers-reduced-motion: reduce) {
  .path::after {
    left: 50%;
    animation: none;
  }
}

@media (max-width: 560px) {
  .controls { grid-template-columns: 1fr; }
  .flow { min-height: 10rem; padding-inline: 0.5rem; }
  .icon { width: 3.25rem; height: 3.25rem; font-size: 1.3rem; }
  .node small { font-size: 0.62rem; }
  .equation { display: none; }
}
</style>
