<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId } from "vue";

type SceneKey = "home" | "business" | "station";

type Scene = {
  label: string;
  loadTitle: string;
  loadNote: string;
  batteryNote: string;
  baseLoad: number;
  solarPeak: number;
  batteryPower: number;
};

const scenes: Record<SceneKey, Scene> = {
  home: {
    label: "家庭",
    loadTitle: "家庭负荷",
    loadNote: "家电、热泵、充电桩",
    batteryNote: "户用电池",
    baseLoad: 1.4,
    solarPeak: 5.2,
    batteryPower: 4.2,
  },
  business: {
    label: "工商业",
    loadTitle: "企业负荷",
    loadNote: "产线、空调、充电设施",
    batteryNote: "工商业储能",
    baseLoad: 26,
    solarPeak: 42,
    batteryPower: 32,
  },
  station: {
    label: "独立储能电站",
    loadTitle: "电网需求",
    loadNote: "调峰、调频、备用服务",
    batteryNote: "大型电池舱",
    baseLoad: 38,
    solarPeak: 64,
    batteryPower: 44,
  },
};

const sceneKey = ref<SceneKey>("home");
const hour = ref(8);
const playing = ref(false);
const titleId = `energy-management-${useId()}`;
let animationFrame = 0;
let previousFrame = 0;

const scene = computed(() => scenes[sceneKey.value]);

function priceAt(value: number) {
  if (value < 7) return 0.28;
  if (value < 10) return 0.68;
  if (value < 17) return 0.48;
  if (value < 22) return 0.92;
  return 0.38;
}

function solarAt(value: number, peak: number) {
  if (value < 6 || value > 19) return 0;
  const x = (value - 12.5) / 3.4;
  return peak * Math.exp(-0.5 * x * x);
}

function loadAt(value: number, current: Scene) {
  if (sceneKey.value === "home") {
    const morning = 1.8 * Math.exp(-0.5 * ((value - 8) / 1.4) ** 2);
    const evening = 3.1 * Math.exp(-0.5 * ((value - 19.5) / 2) ** 2);
    return current.baseLoad + morning + evening;
  }
  if (sceneKey.value === "business") {
    return current.baseLoad + (value >= 8 && value <= 18 ? 24 : 3);
  }
  return current.baseLoad + (value >= 17 && value <= 22 ? 20 : 0);
}

const model = computed(() => {
  const current = scene.value;
  const price = priceAt(hour.value);
  const solar = solarAt(hour.value, current.solarPeak);
  const load = loadAt(hour.value, current);
  const soc = Math.max(16, Math.min(92, 45 + 24 * Math.sin((hour.value - 5) / 24 * Math.PI * 2)));
  let battery = 0;
  let grid = 0;
  let strategy = "";
  let decision = "";

  if (sceneKey.value === "station") {
    if (price <= 0.38 || solar > current.solarPeak * 0.72) {
      battery = -Math.min(current.batteryPower, solar * 0.42 + current.batteryPower * 0.35);
      grid = -battery;
      strategy = "低价充电";
      decision = "吸收低价电与新能源富余电，为高峰调节预留容量";
    } else if (price >= 0.68) {
      battery = Math.min(current.batteryPower, load * 0.68);
      grid = -battery;
      strategy = "响应电网";
      decision = "储能向电网放电，参与调峰、调频或现货交易";
    } else {
      strategy = "保持待命";
      decision = "保留容量和功率裕度，等待市场或调度指令";
    }
  } else {
    const surplus = solar - load;
    if (surplus > 0.15) {
      battery = -Math.min(surplus, current.batteryPower);
      grid = -Math.max(0, surplus + battery);
      strategy = "光伏充电";
      decision = "光伏优先供负荷，余电充入电池，最后才上网";
    } else if (price >= 0.68 && soc > 30) {
      battery = Math.min(load - solar, current.batteryPower);
      grid = Math.max(0, load - solar - battery);
      strategy = "高峰放电";
      decision = sceneKey.value === "home"
        ? "电池在高价时段放电，减少家庭购电"
        : "电池削减并网点峰值，降低电费和最大需量";
    } else {
      grid = Math.max(0, load - solar);
      strategy = price <= 0.38 ? "低价购电" : "光伏优先";
      decision = price <= 0.38
        ? "低价时段由电网供能，为后续高峰保留电量"
        : "实时平衡发电和负荷，由电网补足缺口";
    }
  }

  return { price, solar, load, soc, battery, grid, strategy, decision };
});

const timeLabel = computed(() => {
  const wholeHour = Math.floor(hour.value) % 24;
  const minutes = Math.floor((hour.value - Math.floor(hour.value)) * 60);
  return `${String(wholeHour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
});

const formatPower = (value: number) => `${Math.abs(value).toFixed(1)} kW`;
const gridLabel = computed(() => model.value.grid < 0
  ? `上网 ${formatPower(model.value.grid)}`
  : model.value.grid > 0
    ? `购电 ${formatPower(model.value.grid)}`
    : "待命 0.0 kW");
const batteryLabel = computed(() => model.value.battery < 0
  ? `充电 ${formatPower(model.value.battery)}`
  : model.value.battery > 0
    ? `放电 ${formatPower(model.value.battery)}`
    : "待命 0.0 kW");
const accessibleStatus = computed(() =>
  `${scene.value.label}场景，${timeLabel.value}，电价${model.value.price.toFixed(2)}元每千瓦时，` +
  `光伏${formatPower(model.value.solar)}，负荷${formatPower(model.value.load)}，` +
  `电网${gridLabel.value}，电池${batteryLabel.value}。策略：${model.value.decision}。`,
);

function stop() {
  playing.value = false;
  cancelAnimationFrame(animationFrame);
  previousFrame = 0;
}

function step(timestamp: number) {
  if (!playing.value) return;
  if (!previousFrame) previousFrame = timestamp;
  const delta = Math.min(100, timestamp - previousFrame);
  previousFrame = timestamp;
  hour.value += delta * 0.0022;
  if (hour.value >= 23.9) {
    hour.value = 23.9;
    stop();
    return;
  }
  animationFrame = requestAnimationFrame(step);
}

function togglePlayback() {
  if (playing.value) {
    stop();
    return;
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    hour.value = 18;
    return;
  }
  if (hour.value >= 23.8) hour.value = 0;
  playing.value = true;
  animationFrame = requestAnimationFrame(step);
}

function selectScene(key: SceneKey) {
  sceneKey.value = key;
}

function handleSlider() {
  if (playing.value) stop();
}

onBeforeUnmount(stop);
</script>

<template>
  <section class="management-demo" :aria-labelledby="titleId">
    <header class="demo-header">
      <div>
        <h3 :id="titleId">一天中的能量管理</h3>
        <p>观察 EMS 如何根据发电、负荷、电价和电池状态改变策略。</p>
      </div>
      <div class="scene-switch" role="group" aria-label="应用场景">
        <button
          v-for="(item, key) in scenes"
          :key="key"
          type="button"
          :class="{ active: sceneKey === key }"
          :aria-pressed="sceneKey === key"
          @click="selectScene(key)"
        >
          {{ item.label }}
        </button>
      </div>
    </header>

    <div class="status-row" aria-hidden="true">
      <div><span>时刻</span><strong>{{ timeLabel }}</strong></div>
      <div><span>电价</span><strong>{{ model.price.toFixed(2) }} 元/kWh</strong></div>
      <div><span>电池 SOC</span><strong>{{ Math.round(model.soc) }}%</strong></div>
      <div><span>当前策略</span><strong>{{ model.strategy }}</strong></div>
    </div>

    <div class="time-controls">
      <button type="button" class="play-button" @click="togglePlayback">
        {{ playing ? "暂停" : "播放一天" }}
      </button>
      <label>
        <span>时间</span>
        <input v-model.number="hour" type="range" min="0" max="23.9" step="0.1" @input="handleSlider">
      </label>
    </div>

    <div class="energy-map" :class="{ playing }" aria-hidden="true">
      <div class="energy-node solar">
        <span class="node-icon">☀</span>
        <strong>光伏 / 新能源</strong>
        <b>发电 {{ formatPower(model.solar) }}</b>
        <small>可再生能源输入</small>
      </div>
      <div class="flow-link solar-link" :class="{ active: model.solar > 0.08 }"><span /></div>

      <div class="energy-node grid">
        <span class="node-icon">⌁</span>
        <strong>电网 / 市场</strong>
        <b>{{ gridLabel }}</b>
        <small>价格与调度信号</small>
      </div>
      <div class="flow-link grid-link" :class="{ active: Math.abs(model.grid) > 0.08, reverse: model.grid < 0 }"><span /></div>

      <div class="energy-node battery">
        <span class="node-icon">▰</span>
        <strong>储能电池</strong>
        <b>{{ batteryLabel }}</b>
        <small>{{ scene.batteryNote }}</small>
      </div>
      <div class="flow-link battery-link" :class="{ active: Math.abs(model.battery) > 0.08, reverse: model.battery < 0 }"><span /></div>

      <div class="energy-node ems">
        <span class="ems-pulse">EMS</span>
        <strong>感知 → 预测 → 优化</strong>
        <b>{{ model.strategy }}</b>
        <small>执行并检查结果，再滚动修正</small>
      </div>
      <div class="flow-link output-link active"><span /></div>

      <div class="energy-node load">
        <span class="node-icon">⌂</span>
        <strong>{{ scene.loadTitle }}</strong>
        <b>需求 {{ formatPower(model.load) }}</b>
        <small>{{ scene.loadNote }}</small>
      </div>
    </div>

    <div class="decision" aria-live="polite">
      <strong>EMS 决策</strong>
      <span>{{ timeLabel }} · {{ model.decision }}</span>
    </div>
    <p class="sr-only" role="status" aria-live="polite">{{ accessibleStatus }}</p>
  </section>
</template>

<style scoped>
.management-demo {
  --flow: var(--vp-c-brand-1);
  --flow-soft: color-mix(in srgb, var(--flow) 14%, transparent);
  margin: 1.5rem 0;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 1rem;
  color: var(--vp-c-text-1);
  background: color-mix(in srgb, var(--vp-c-bg) 96%, var(--flow));
}

.demo-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.1rem;
}

.demo-header h3 { margin: 0 0 0.25rem; border: 0; padding: 0; font-size: 1rem; }
.demo-header p { margin: 0; color: var(--vp-c-text-2); font-size: 0.78rem; }
.scene-switch { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 0.35rem; }
.scene-switch button,
.play-button {
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  padding: 0.42rem 0.7rem;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  cursor: pointer;
}
.scene-switch button.active,
.play-button {
  border-color: var(--flow);
  color: var(--vp-c-brand-1);
  background: var(--flow-soft);
}

.status-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.5rem;
  padding: 0 1.1rem 0.8rem;
}
.status-row div { padding: 0.55rem 0.65rem; border-radius: 0.55rem; background: var(--vp-c-bg-soft); }
.status-row span,
.status-row strong { display: block; }
.status-row span { color: var(--vp-c-text-2); font-size: 0.7rem; }
.status-row strong { margin-top: 0.12rem; font-size: 0.82rem; font-variant-numeric: tabular-nums; }

.time-controls {
  display: grid;
  grid-template-columns: auto minmax(10rem, 1fr);
  align-items: center;
  gap: 0.9rem;
  padding: 0 1.1rem 0.9rem;
}
.time-controls label { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 0.6rem; font-size: 0.76rem; }
.time-controls input { width: 100%; accent-color: var(--flow); cursor: pointer; }

.energy-map {
  display: grid;
  grid-template-columns: minmax(8rem, 1fr) 3rem minmax(10rem, 1.15fr) 3rem minmax(8rem, 1fr);
  grid-template-rows: repeat(3, minmax(5.4rem, auto));
  align-items: center;
  gap: 0.65rem 0;
  padding: 1rem 1.1rem;
  background:
    radial-gradient(circle at 15% 10%, color-mix(in srgb, var(--energy-sun) 14%, transparent), transparent 31%),
    linear-gradient(145deg, var(--flow-soft), transparent 64%);
}

.energy-node {
  position: relative;
  z-index: 2;
  display: grid;
  min-width: 0;
  padding: 0.65rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--vp-c-bg) 94%, transparent);
  text-align: center;
}
.energy-node strong { font-size: 0.78rem; }
.energy-node b { margin-top: 0.2rem; font-size: 0.78rem; color: var(--vp-c-brand-1); font-variant-numeric: tabular-nums; }
.energy-node small { margin-top: 0.15rem; color: var(--vp-c-text-2); font-size: 0.66rem; }
.node-icon { margin-bottom: 0.2rem; color: var(--vp-c-brand-1); font-size: 1.25rem; }
.solar { grid-area: 1 / 1; }
.grid { grid-area: 2 / 1; }
.battery { grid-area: 3 / 1; }
.ems { grid-area: 1 / 3 / 4 / 4; align-self: stretch; align-content: center; background: var(--flow-soft); }
.load { grid-area: 1 / 5 / 4 / 6; align-self: center; }
.ems-pulse {
  display: grid;
  place-items: center;
  width: 3.8rem;
  height: 3.8rem;
  margin: 0 auto 0.55rem;
  border: 0.16rem solid var(--flow);
  border-radius: 50%;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-bg);
  font-weight: 750;
}

.flow-link { position: relative; height: 0.22rem; border-radius: 999px; background: var(--vp-c-divider); }
.solar-link { grid-area: 1 / 2; }
.grid-link { grid-area: 2 / 2; }
.battery-link { grid-area: 3 / 2; }
.output-link { grid-area: 2 / 4; }
.flow-link.active { background: color-mix(in srgb, var(--flow) 45%, transparent); }
.flow-link span {
  position: absolute;
  top: -0.22rem;
  left: 0;
  width: 0.65rem;
  height: 0.65rem;
  border-radius: 50%;
  opacity: 0;
  background: var(--energy-sun);
  box-shadow: 0 0 0.6rem color-mix(in srgb, var(--energy-sun) 60%, transparent);
}
.energy-map.playing .flow-link.active span { opacity: 1; animation: travel 1.35s linear infinite; }
.energy-map.playing .flow-link.reverse span { animation-direction: reverse; }

.decision {
  display: flex;
  gap: 0.65rem;
  padding: 0.85rem 1.1rem;
  background: var(--vp-c-bg-soft);
  font-size: 0.8rem;
}
.decision strong { flex: 0 0 auto; color: var(--vp-c-brand-1); }
.sr-only { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0; white-space: nowrap; }

@keyframes travel {
  from { left: 0; }
  to { left: calc(100% - 0.65rem); }
}

@media (prefers-reduced-motion: reduce) {
  .energy-map.playing .flow-link.active span { left: 50%; animation: none; }
}

@media (max-width: 640px) {
  .demo-header { display: grid; }
  .scene-switch { justify-content: flex-start; }
  .status-row { grid-template-columns: 1fr 1fr; }
  .time-controls { grid-template-columns: 1fr; }
  .energy-map {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    grid-template-rows: auto 1.7rem auto 1.7rem auto;
    gap: 0.45rem;
  }
  .solar { grid-area: 1 / 1; }
  .grid { grid-area: 1 / 2; }
  .battery { grid-area: 1 / 3; }
  .solar-link { grid-area: 2 / 1; }
  .grid-link { grid-area: 2 / 2; }
  .battery-link { grid-area: 2 / 3; }
  .ems { grid-area: 3 / 1 / 4 / 4; }
  .output-link { grid-area: 4 / 1 / 5 / 4; width: 0.22rem; height: 100%; justify-self: center; }
  .load { grid-area: 5 / 1 / 6 / 4; }
  .flow-link:not(.output-link) { width: 0.22rem; height: 100%; justify-self: center; }
  .flow-link span { top: 0; left: -0.22rem; }
  .energy-map.playing .flow-link.active span { animation-name: travel-vertical; }
  .energy-node { padding: 0.5rem 0.28rem; }
  .node-icon { font-size: 1rem; }
  .energy-node strong,
  .energy-node b { font-size: 0.67rem; }
  .energy-node small { display: none; }
  .decision { display: grid; gap: 0.2rem; }
}

@keyframes travel-vertical {
  from { top: 0; }
  to { top: calc(100% - 0.65rem); }
}
</style>
