<script setup lang="ts">
import { computed } from "vue";
import ConfigurationDemoControls from "./ConfigurationDemoControls.vue";
import { useStepDemo } from "./useStepDemo";

const states = [
  {
    phase: "读取可发能力",
    detail: "分配器先确认各单元当前最多能发多少，而不是直接把目标除以设备数量。",
    strategy: "读取能力",
    available: [40, 30, 10],
    requested: [0, 0, 0],
    output: [0, 0, 0],
  },
  {
    phase: "简单平均失败",
    detail: "每台都请求 20 MW，但 C 最多只能发 10 MW，场站最终少了 10 MW。",
    strategy: "平均 20 MW",
    available: [40, 30, 10],
    requested: [20, 20, 20],
    output: [20, 20, 10],
  },
  {
    phase: "按能力同比例分配",
    detail: "目标按 40∶30∶10 分配为 30、22.5、7.5 MW，三个单元都运行在可发能力的 75%。",
    strategy: "能力加权",
    available: [40, 30, 10],
    requested: [30, 22.5, 7.5],
    output: [30, 22.5, 7.5],
  },
  {
    phase: "单元能力突然下降",
    detail: "C 受到云影影响，可发上限降至 4 MW；原指令被限幅，场站产生 3.5 MW 缺口。",
    strategy: "检测限幅",
    available: [40, 30, 4],
    requested: [30, 22.5, 7.5],
    output: [30, 22.5, 4],
  },
  {
    phase: "计算剩余裕度",
    detail: "A 还能增加 10 MW，B 还能增加 7.5 MW，C 已无裕度；缺口只在 A、B 之间重新分配。",
    strategy: "寻找裕度",
    available: [40, 30, 4],
    requested: [30, 22.5, 4],
    output: [30, 22.5, 4],
  },
  {
    phase: "完成二次分配",
    detail: "A 增加 2 MW、B 增加 1.5 MW、C 保持 4 MW，场站重新达到 60 MW。",
    strategy: "剩余量再分",
    available: [40, 30, 4],
    requested: [32, 24, 4],
    output: [32, 24, 4],
  },
] as const;

const names = ["光伏 A", "光伏 B", "光伏 C"];
const { step, playing, next, reset, togglePlay } = useStepDemo(states.length, 2500);
const state = computed(() => states[step.value]);
const total = computed(() => state.value.output.reduce((sum, value) => sum + value, 0));
const residual = computed(() => Math.max(0, 60 - total.value));
</script>

<template>
  <div class="config-demo pv-balance-demo">
    <ConfigurationDemoControls
      :current="step"
      :total="states.length"
      :playing="playing"
      @play="togglePlay"
      @next="next"
      @reset="reset"
    />

    <div class="balance-header" aria-live="polite">
      <div><span>场站目标</span><strong>60.0 MW</strong></div>
      <div><span>合计出力</span><strong>{{ total.toFixed(1) }} MW</strong></div>
      <div><span>待分配</span><strong>{{ residual.toFixed(1) }} MW</strong></div>
    </div>

    <div class="balance-flow" role="img" aria-labelledby="pvb-title pvb-desc">
      <span id="pvb-title" class="config-sr-only">光伏场站功率均衡分配动画</span>
      <span id="pvb-desc" class="config-sr-only">场站目标功率按各光伏单元的可发能力进行分配；单元达到上限后，剩余功率转移给仍有调节裕度的单元。</span>
      <div class="target-node"><span>场站目标</span><strong>60 MW</strong></div>
      <div class="flow-line" aria-hidden="true"><span class="flow-packet"></span></div>
      <div class="dispatch-node"><span>均衡分配器</span><strong>{{ state.strategy }}</strong></div>
    </div>

    <div class="unit-chart" aria-label="各光伏单元可发上限、请求位置和实际分配">
      <div class="scale-row" aria-hidden="true">
        <span>0</span><span>10</span><span>20</span><span>30</span><span>40 MW</span>
      </div>
      <div
        v-for="(name, index) in names"
        :key="name"
        class="unit-row"
        :class="{ limited: state.requested[index] > state.available[index] }"
      >
        <div class="unit-name">
          <strong>{{ name }}</strong>
          <small>可发 {{ state.available[index].toFixed(1) }} MW</small>
        </div>
        <div class="bar-track">
          <span
            class="available"
            :style="{ transform: `scaleX(${state.available[index] / 40})` }"
          ></span>
          <span
            class="output"
            :style="{ transform: `scaleX(${state.output[index] / 40})` }"
          ></span>
          <i
            class="request"
            :style="{ left: `calc(${(state.requested[index] / 40) * 100}% - 1px)` }"
          ></i>
        </div>
        <div class="unit-result">
          <strong>{{ state.output[index].toFixed(1) }} MW</strong>
          <small>指令 {{ state.requested[index].toFixed(1) }}</small>
        </div>
      </div>
    </div>

    <div class="balance-legend" aria-label="图例">
      <span><i class="available-key"></i>可发上限</span>
      <span><i class="output-key"></i>实际分配</span>
      <span><i class="request-key"></i>请求位置</span>
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
.balance-header {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 10px 0 14px;
  border-bottom: 1px solid var(--config-line);
}

.balance-header > div {
  display: flex;
  gap: 8px;
  align-items: baseline;
  justify-content: space-between;
}

.balance-header span {
  color: var(--vp-c-text-2);
}

.balance-flow {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 90px;
  padding: 14px 0 8px;
}

.target-node,
.dispatch-node {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 128px;
  min-height: 62px;
  padding: 8px 12px;
  border: 1px solid var(--config-line);
  border-radius: 10px;
  background: var(--config-node);
}

.target-node span,
.dispatch-node span {
  color: var(--vp-c-text-2);
}

.flow-line {
  position: relative;
  width: 120px;
  height: 2px;
  margin: 0 14px;
  background: var(--config-accent);
}

.flow-line::after {
  position: absolute;
  top: -4px;
  right: -1px;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-left: 8px solid var(--config-accent);
  content: "";
}

.flow-packet {
  position: absolute;
  top: -5px;
  left: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--config-accent);
  animation: pv-balance-flow 1.8s linear infinite;
  will-change: transform;
}

@keyframes pv-balance-flow {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(108px, 0, 0); }
}

.unit-chart {
  padding: 4px 0;
}

.scale-row,
.unit-row {
  display: grid;
  grid-template-columns: 112px minmax(220px, 1fr) 116px;
  gap: 14px;
  align-items: center;
}

.scale-row {
  position: relative;
  min-height: 22px;
  color: var(--vp-c-text-2);
}

.scale-row > span {
  position: absolute;
  top: 0;
}

.scale-row > span:nth-child(1) { left: 126px; }
.scale-row > span:nth-child(2) { left: calc(126px + (100% - 256px) * 0.25); }
.scale-row > span:nth-child(3) { left: calc(126px + (100% - 256px) * 0.5); }
.scale-row > span:nth-child(4) { left: calc(126px + (100% - 256px) * 0.75); }
.scale-row > span:nth-child(5) { right: 130px; }

.unit-row {
  min-height: 72px;
  border-top: 1px solid var(--config-line);
}

.unit-name,
.unit-result {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.unit-name small,
.unit-result small {
  color: var(--vp-c-text-2);
}

.unit-result {
  text-align: right;
}

.bar-track {
  position: relative;
  height: 28px;
  overflow: visible;
  border-radius: 6px;
  background:
    linear-gradient(to right, transparent calc(25% - 1px), var(--config-line) 25%, transparent calc(25% + 1px)),
    linear-gradient(to right, transparent calc(50% - 1px), var(--config-line) 50%, transparent calc(50% + 1px)),
    linear-gradient(to right, transparent calc(75% - 1px), var(--config-line) 75%, transparent calc(75% + 1px)),
    var(--config-track);
}

.bar-track .available,
.bar-track .output {
  position: absolute;
  inset: 0;
  border-radius: 6px;
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 650ms var(--config-ease);
  will-change: transform;
}

.bar-track .available {
  background: var(--config-capacity-soft);
}

.bar-track .output {
  background: var(--config-accent-fill);
}

.bar-track .request {
  position: absolute;
  top: -5px;
  width: 2px;
  height: 38px;
  background: var(--vp-c-text-1);
  transition: left 650ms var(--config-ease), background 300ms ease;
  will-change: left;
}

.bar-track .request::before {
  position: absolute;
  top: -2px;
  left: -3px;
  width: 8px;
  height: 8px;
  transform: rotate(45deg);
  background: inherit;
  content: "";
}

.unit-row.limited .request {
  background: var(--config-danger);
}

.balance-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 10px 0 6px 126px;
  color: var(--vp-c-text-2);
  font-size: 0.86rem;
}

.balance-legend span {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.balance-legend i {
  display: inline-block;
  width: 16px;
  height: 8px;
}

.available-key {
  background: var(--config-capacity-soft);
}

.output-key {
  background: var(--config-accent-fill);
}

.request-key {
  width: 2px !important;
  height: 14px !important;
  background: var(--vp-c-text-1);
}

@media (max-width: 600px) {
  .balance-header {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .balance-flow {
    justify-content: flex-start;
  }

  .flow-line {
    width: 52px;
    margin: 0 8px;
  }

  .flow-packet {
    display: none;
  }

  .target-node,
  .dispatch-node {
    min-width: 0;
    flex: 1;
  }

  .scale-row {
    display: none;
  }

  .unit-row {
    grid-template-columns: 82px minmax(100px, 1fr);
    gap: 8px;
    padding: 9px 0;
  }

  .unit-result {
    grid-column: 2;
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
  }

  .balance-legend {
    padding-left: 0;
  }
}
</style>
