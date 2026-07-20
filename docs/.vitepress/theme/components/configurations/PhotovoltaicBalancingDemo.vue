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

    <div class="config-stat-row" aria-live="polite">
      <div class="config-stat"><span>场站目标</span><strong>60.0 MW</strong></div>
      <div class="config-stat"><span>合计出力</span><strong>{{ total.toFixed(1) }} MW</strong></div>
      <div class="config-stat"><span>待分配</span><strong>{{ residual.toFixed(1) }} MW</strong></div>
    </div>

    <div class="dispatch-flow" aria-label="场站目标进入光伏均衡分配器">
      <div><span>场站目标</span><strong>60 MW</strong></div>
      <b aria-hidden="true">→</b>
      <div><span>均衡分配器</span><strong>{{ state.strategy }}</strong></div>
      <b aria-hidden="true">→</b>
      <span>各光伏单元</span>
    </div>

    <div class="unit-chart" aria-label="各光伏单元可发上限、请求位置和实际分配">
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
            :style="{ width: `${(state.available[index] / 40) * 100}%` }"
          ></span>
          <span
            class="output"
            :style="{ width: `${(state.output[index] / 40) * 100}%` }"
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
.dispatch-flow {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  min-height: 88px;
}

.dispatch-flow div {
  display: flex;
  flex-direction: column;
  min-width: 128px;
  padding: 9px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 9px;
  background: var(--vp-c-bg);
}

.dispatch-flow span {
  color: var(--vp-c-text-2);
}

.dispatch-flow b {
  color: var(--vp-c-brand-1);
  font-size: 1.45rem;
}

.unit-row {
  display: grid;
  grid-template-columns: 112px minmax(180px, 1fr) 105px;
  gap: 14px;
  align-items: center;
  min-height: 70px;
  border-top: 1px solid var(--vp-c-divider);
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
  border-radius: 6px;
  background:
    linear-gradient(to right, transparent calc(25% - 1px), var(--vp-c-divider) 25%, transparent calc(25% + 1px)),
    linear-gradient(to right, transparent calc(50% - 1px), var(--vp-c-divider) 50%, transparent calc(50% + 1px)),
    linear-gradient(to right, transparent calc(75% - 1px), var(--vp-c-divider) 75%, transparent calc(75% + 1px)),
    var(--vp-c-bg);
}

.bar-track .available,
.bar-track .output {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: 6px;
  transition: width 500ms ease;
}

.bar-track .available {
  background: rgba(213, 138, 0, 0.24);
}

.bar-track .output {
  background: color-mix(in srgb, var(--vp-c-brand-1) 72%, transparent);
}

.bar-track .request {
  position: absolute;
  top: -5px;
  width: 2px;
  height: 38px;
  background: var(--vp-c-text-1);
  transition: left 500ms ease, background 300ms ease;
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
  background: var(--vp-c-danger-1);
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
  background: rgba(213, 138, 0, 0.24);
}

.output-key {
  background: color-mix(in srgb, var(--vp-c-brand-1) 72%, transparent);
}

.request-key {
  width: 2px !important;
  height: 14px !important;
  background: var(--vp-c-text-1);
}

@media (max-width: 600px) {
  .dispatch-flow {
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .dispatch-flow div {
    flex: 1;
  }

  .dispatch-flow > span {
    width: 100%;
    text-align: center;
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
