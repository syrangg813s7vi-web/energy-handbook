<script setup lang="ts">
import { computed } from "vue";
import ConfigurationDemoControls from "./ConfigurationDemoControls.vue";
import { useStepDemo } from "./useStepDemo";

const states = [
  {
    phase: "光伏可以独立完成目标",
    detail: "光伏可发能力高于场站目标，分配器令光伏承担 60 MW，储能保持待命。",
    strategy: "光伏优先",
    target: 60,
    available: 72,
    pv: 60,
    storage: 0,
    soc: 55,
    storageMode: "待命",
    status: "normal",
  },
  {
    phase: "云影造成光伏缺口",
    detail: "光伏可发能力降到 42 MW；储能放电 18 MW 填补缺口，使并网点仍保持 60 MW。",
    strategy: "储能补缺口",
    target: 60,
    available: 42,
    pv: 42,
    storage: 18,
    soc: 55,
    storageMode: "放电",
    status: "discharge",
  },
  {
    phase: "SOC 下限限制放电",
    detail: "SOC 接近下限后，储能只允许放电 6 MW；光储合计 48 MW，分配器必须报告 12 MW 目标不可达。",
    strategy: "约束后限幅",
    target: 60,
    available: 42,
    pv: 42,
    storage: 6,
    soc: 22,
    storageMode: "限功率放电",
    status: "limited",
  },
  {
    phase: "利用富余光伏给储能充电",
    detail: "并网点目标为 45 MW；光伏发 60 MW，储能吸收 15 MW，送到并网点的合计仍是 45 MW。",
    strategy: "富余功率充电",
    target: 45,
    available: 70,
    pv: 60,
    storage: -15,
    soc: 35,
    storageMode: "充电",
    status: "charge",
  },
  {
    phase: "SOC 上限限制充电",
    detail: "SOC 接近上限后，储能只能吸收 4 MW；为了维持 45 MW 并网目标，光伏指令降为 49 MW。",
    strategy: "充电限幅后限光",
    target: 45,
    available: 70,
    pv: 49,
    storage: -4,
    soc: 90,
    storageMode: "限功率充电",
    status: "charge",
  },
  {
    phase: "光伏与储能协同升功率",
    detail: "目标升到 65 MW，光伏可发 52 MW，储能在 SOC 允许范围内放电 13 MW，共同完成目标。",
    strategy: "协同跟踪目标",
    target: 65,
    available: 52,
    pv: 52,
    storage: 13,
    soc: 65,
    storageMode: "放电",
    status: "discharge",
  },
] as const;

const { step, playing, next, reset, togglePlay } = useStepDemo(states.length, 2600);
const state = computed(() => states[step.value]);
const actual = computed(() => state.value.pv + state.value.storage);
const gap = computed(() => Math.max(0, state.value.target - actual.value));
const isCharging = computed(() => state.value.storage < 0);
const isDischarging = computed(() => state.value.storage > 0);
const isLimited = computed(() => state.value.status === "limited");

function formatPower(value: number, signed = false) {
  const prefix = signed && value > 0 ? "+" : "";
  return `${prefix}${value} MW`;
}
</script>

<template>
  <div
    class="config-demo pv-storage-allocation-demo"
    :data-storage-mode="state.status"
  >
    <ConfigurationDemoControls
      :current="step"
      :total="states.length"
      :playing="playing"
      @play="togglePlay"
      @next="next"
      @reset="reset"
    />

    <div class="config-stat-row" aria-live="polite">
      <div class="config-stat"><span>并网点目标</span><strong>{{ state.target }} MW</strong></div>
      <div class="config-stat"><span>光储合计</span><strong>{{ actual }} MW</strong></div>
      <div class="config-stat" :class="{ limited: gap > 0 }"><span>未完成量</span><strong>{{ gap }} MW</strong></div>
    </div>

    <div class="allocation-stage">
      <svg class="allocation-wires" viewBox="0 0 736 270" role="img" aria-labelledby="psa-title psa-desc">
        <title id="psa-title">光伏与储能有功变量分配</title>
        <desc id="psa-desc">场站并网点目标进入变量分配器，分配器根据光伏可发能力、储能荷电状态和充放电限制，生成光伏功率指令与储能功率指令，两者合计形成并网点功率。</desc>
        <path class="wire active" d="M 130 135 L 190 135"></path>
        <path class="wire active" d="M 330 135 C 365 135, 365 75, 400 75"></path>
        <path class="wire active" d="M 330 135 C 365 135, 365 195, 400 195"></path>
        <path class="wire active" d="M 540 75 C 575 75, 575 135, 606 135"></path>
        <path
          class="wire storage-power-wire"
          :class="{ active: state.storage !== 0, charge: isCharging, limited: isLimited }"
          d="M 540 195 C 575 195, 575 135, 606 135"
        ></path>

        <circle class="packet" r="5">
          <animateMotion dur="1.4s" repeatCount="indefinite" path="M 130 135 L 190 135"></animateMotion>
        </circle>
        <circle class="packet" r="5">
          <animateMotion dur="1.7s" repeatCount="indefinite" path="M 330 135 C 365 135, 365 75, 400 75"></animateMotion>
        </circle>
        <circle class="packet" r="5">
          <animateMotion dur="1.7s" repeatCount="indefinite" path="M 330 135 C 365 135, 365 195, 400 195"></animateMotion>
        </circle>
        <circle class="packet" r="5">
          <animateMotion dur="1.5s" repeatCount="indefinite" path="M 540 75 C 575 75, 575 135, 606 135"></animateMotion>
        </circle>
        <circle
          class="packet storage-packet discharge-packet"
          :class="{ visible: isDischarging, limited: isLimited }"
          r="5"
        >
          <animateMotion dur="1.5s" repeatCount="indefinite" path="M 540 195 C 575 195, 575 135, 606 135"></animateMotion>
        </circle>
        <circle
          class="packet storage-packet charge-packet"
          :class="{ visible: isCharging }"
          r="5"
        >
          <animateMotion dur="1.5s" repeatCount="indefinite" path="M 606 135 C 575 135, 575 195, 540 195"></animateMotion>
        </circle>
      </svg>

      <section class="allocation-node target-node">
        <span>并网点目标</span>
        <strong>{{ state.target }} MW</strong>
      </section>

      <section class="allocation-node allocator-node">
        <span>变量分配器</span>
        <strong>{{ state.strategy }}</strong>
        <small>约束后再求和</small>
      </section>

      <section class="allocation-node pv-node">
        <span>光伏指令</span>
        <strong>{{ state.pv }} MW</strong>
        <small>可发 {{ state.available }} MW</small>
      </section>

      <section
        class="allocation-node storage-node"
        :class="{ charge: isCharging, limited: isLimited }"
      >
        <span>储能指令</span>
        <strong>{{ formatPower(state.storage, true) }}</strong>
        <small>SOC {{ state.soc }}% · {{ state.storageMode }}</small>
      </section>

      <section class="allocation-node output-node" :class="{ limited: gap > 0 }">
        <span>并网点实发</span>
        <strong>{{ actual }} MW</strong>
        <small>{{ gap > 0 ? `缺少 ${gap} MW` : "目标已完成" }}</small>
      </section>
    </div>

    <div class="resource-bars" aria-label="光伏与储能约束">
      <div class="resource-row">
        <span>光伏可发 / 指令</span>
        <div class="resource-track" aria-hidden="true">
          <i
            class="available-fill"
            :style="{ transform: `scaleX(${state.available / 80})` }"
          ></i>
          <i
            class="command-fill"
            :style="{ transform: `scaleX(${state.pv / 80})` }"
          ></i>
        </div>
        <strong>{{ state.pv }} / {{ state.available }} MW</strong>
      </div>

      <div class="resource-row">
        <span>储能 SOC</span>
        <div class="resource-track soc-track" aria-hidden="true">
          <i class="soc-safe"></i>
          <i
            class="soc-fill"
            :style="{ transform: `scaleX(${state.soc / 100})` }"
          ></i>
        </div>
        <strong>{{ state.soc }}%</strong>
      </div>
    </div>

    <div class="config-detail" role="status" aria-live="polite">
      <strong>{{ state.phase }}</strong>
      <span>{{ state.detail }}</span>
    </div>
    <div class="config-progress" aria-hidden="true">
      <span :style="{ width: `${((step + 1) / states.length) * 100}%` }"></span>
    </div>
  </div>
</template>

<style scoped>
.config-stat.limited strong {
  color: var(--config-danger);
}

.allocation-stage {
  position: relative;
  width: 100%;
  min-height: 270px;
  aspect-ratio: 736 / 270;
}

.allocation-wires {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.wire {
  fill: none;
  stroke: var(--config-line);
  stroke-width: 2;
  transition: stroke 400ms var(--config-ease), opacity 400ms var(--config-ease);
}

.wire.active {
  stroke: var(--config-accent);
}

.storage-power-wire.charge {
  stroke: var(--config-capacity);
  stroke-dasharray: 6 4;
}

.storage-power-wire.limited {
  stroke: var(--config-danger);
}

.packet {
  fill: var(--config-accent);
}

.storage-packet {
  opacity: 0;
  transition: opacity 300ms ease;
}

.storage-packet.visible {
  opacity: 1;
}

.charge-packet {
  fill: var(--config-capacity);
}

.storage-packet.limited {
  fill: var(--config-danger);
}

.allocation-node {
  position: absolute;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  min-height: 80px;
  padding: 10px;
  border: 1px solid var(--config-line);
  border-radius: 10px;
  background: var(--config-node);
  transition:
    color 350ms var(--config-ease),
    border-color 350ms var(--config-ease),
    background 350ms var(--config-ease);
}

.allocation-node span,
.allocation-node small {
  color: var(--vp-c-text-2);
}

.target-node {
  top: 95px;
  left: 0;
  width: 17.66%;
}

.allocator-node {
  top: 95px;
  left: 25.82%;
  width: 19.02%;
}

.pv-node {
  top: 35px;
  left: 54.35%;
  width: 19.02%;
}

.storage-node {
  top: 155px;
  left: 54.35%;
  width: 19.02%;
}

.output-node {
  top: 95px;
  left: 82.34%;
  width: 17.66%;
}

.storage-node.charge {
  border-color: var(--config-capacity);
}

.storage-node.limited,
.output-node.limited {
  border-color: var(--config-danger);
  background: var(--config-danger-soft);
}

.resource-bars {
  border-top: 1px solid var(--config-line);
}

.resource-row {
  display: grid;
  grid-template-columns: 132px minmax(180px, 1fr) 94px;
  gap: 12px;
  align-items: center;
  min-height: 52px;
  border-bottom: 1px solid var(--config-line);
}

.resource-row > span {
  color: var(--vp-c-text-2);
}

.resource-row > strong {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.resource-track {
  position: relative;
  height: 18px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--config-track);
}

.resource-track i {
  position: absolute;
  inset: 0;
  display: block;
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 650ms var(--config-ease);
  will-change: transform;
}

.available-fill {
  background: var(--config-capacity-soft);
}

.command-fill {
  background: var(--config-accent-fill);
}

.soc-track .soc-safe {
  inset: 0 10%;
  transform: none;
  background: var(--config-capacity-soft);
}

.soc-fill {
  background: var(--config-accent-fill);
}

@media (max-width: 600px) {
  .allocation-stage {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    min-height: 0;
    aspect-ratio: auto;
  }

  .allocation-wires {
    display: none;
  }

  .allocation-node {
    position: static;
    width: auto;
    min-height: 94px;
  }

  .target-node { order: 1; }
  .allocator-node { order: 2; }
  .pv-node { order: 3; }
  .storage-node { order: 4; }
  .output-node {
    grid-column: 1 / -1;
    order: 5;
  }

  .resource-row {
    grid-template-columns: 1fr 70px;
    gap: 6px 10px;
    padding: 8px 0;
  }

  .resource-track {
    grid-column: 1 / -1;
    grid-row: 2;
  }
}

@media (prefers-reduced-motion: reduce) {
  .packet {
    display: none;
  }
}
</style>
