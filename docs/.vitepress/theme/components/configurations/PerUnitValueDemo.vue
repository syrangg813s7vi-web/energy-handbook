<script setup lang="ts">
import { computed } from "vue";
import ConfigurationDemoControls from "./ConfigurationDemoControls.vue";
import { useStepDemo } from "./useStepDemo";

const states = [
  {
    phase: "先看物理量",
    detail: "50、25、10 MW 看起来不同，但设备容量也不同，不能直接判断谁的负载更重。",
    mode: "raw",
    heading: "物理实测值",
    physical: ["50 MW", "25 MW", "10 MW"],
    operation: ["尚未换算", "尚未换算", "尚未换算"],
    pu: [null, null, null],
    controller: "等待标幺化",
    note: "目标 0.80 pu",
  },
  {
    phase: "绑定各自基准",
    detail: "每一路实测值必须和自己的固定基准配对：A 用 100 MW，B 用 50 MW，C 用 20 MW。",
    mode: "normalize",
    heading: "物理实测值",
    physical: ["50 MW", "25 MW", "10 MW"],
    operation: ["÷ 100 MW", "÷ 50 MW", "÷ 20 MW"],
    pu: [0, 0, 0],
    controller: "基准已确认",
    note: "目标 0.80 pu",
  },
  {
    phase: "得到统一标幺值",
    detail: "三路结果都是 0.50 pu：虽然 MW 不同，它们都运行在自身额定能力的 50%。",
    mode: "normalize",
    heading: "物理实测值",
    physical: ["50 MW", "25 MW", "10 MW"],
    operation: ["÷ 100 MW", "÷ 50 MW", "÷ 20 MW"],
    pu: [0.5, 0.5, 0.5],
    controller: "实测均为 0.50 pu",
    note: "目标 0.80 pu",
  },
  {
    phase: "控制器统一算偏差",
    detail: "控制器对三路使用相同的偏差：0.80 − 0.50 = 0.30 pu。",
    mode: "control",
    heading: "当前物理值",
    physical: ["50 MW", "25 MW", "10 MW"],
    operation: ["÷ 100 MW", "÷ 50 MW", "÷ 20 MW"],
    pu: [0.5, 0.5, 0.5],
    controller: "统一偏差 +0.30 pu",
    note: "目标 0.80 − 实测 0.50",
  },
  {
    phase: "换回设备物理指令",
    detail: "同一个 0.80 pu 指令乘以各自基准，得到 A 80、B 40、C 16 MW。",
    mode: "denormalize",
    heading: "下发物理指令",
    physical: ["80 MW", "40 MW", "16 MW"],
    operation: ["× 100 MW", "× 50 MW", "× 20 MW"],
    pu: [0.8, 0.8, 0.8],
    controller: "下发 0.80 pu",
    note: "分别换算回 MW",
  },
] as const;

const devices = [
  ["光伏 A", "额定 100 MW"],
  ["光伏 B", "额定 50 MW"],
  ["光伏 C", "额定 20 MW"],
] as const;

const { step, playing, next, reset, togglePlay } = useStepDemo(states.length, 2600);
const state = computed(() => states[step.value]);
</script>

<template>
  <div class="config-demo per-unit-demo" :data-mode="state.mode">
    <ConfigurationDemoControls
      :current="step"
      :total="states.length"
      :playing="playing"
      @play="togglePlay"
      @next="next"
      @reset="reset"
    />

    <div class="controller-lane" aria-live="polite">
      <span>统一控制尺度</span>
      <strong>{{ state.controller }}</strong>
      <span>{{ state.note }}</span>
    </div>

    <div class="conversion-head" aria-hidden="true">
      <span>设备</span>
      <span>{{ state.heading }}</span>
      <span>基准换算</span>
      <span>统一尺度</span>
    </div>

    <div
      v-for="(device, index) in devices"
      :key="device[0]"
      class="conversion-row"
    >
      <div class="device-name">
        <strong>{{ device[0] }}</strong>
        <small>{{ device[1] }}</small>
      </div>
      <div class="physical">
        <strong>{{ state.physical[index] }}</strong>
      </div>
      <div class="operation">
        <span aria-hidden="true">{{ state.mode === "denormalize" ? "←" : "→" }}</span>
        <strong>{{ state.operation[index] }}</strong>
      </div>
      <div class="pu-result">
        <div class="pu-track">
          <span
            class="pu-fill"
            :style="{ width: `${(state.pu[index] ?? 0) * 100}%` }"
          ></span>
          <i v-if="state.mode === 'control' || state.mode === 'denormalize'" class="target"></i>
        </div>
        <strong>{{ state.pu[index] === null ? "—" : `${state.pu[index]?.toFixed(2)} pu` }}</strong>
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
.controller-lane {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 14px;
  align-items: center;
  min-height: 54px;
  padding: 10px 0;
  border-top: 1px solid var(--vp-c-divider);
  border-bottom: 1px solid var(--vp-c-divider);
}

.controller-lane span {
  color: var(--vp-c-text-2);
}

.controller-lane span:last-child {
  text-align: right;
}

.conversion-head,
.conversion-row {
  display: grid;
  grid-template-columns: 100px 112px 140px minmax(180px, 1fr);
  gap: 12px;
  align-items: center;
}

.conversion-head {
  min-height: 38px;
  color: var(--vp-c-text-2);
}

.conversion-row {
  min-height: 78px;
  border-top: 1px solid var(--vp-c-divider);
}

.device-name,
.operation {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.device-name small {
  color: var(--vp-c-text-2);
}

.physical {
  padding: 8px 10px;
  border-left: 3px solid #d58a00;
  background: rgba(213, 138, 0, 0.1);
}

.operation {
  align-items: center;
  color: var(--vp-c-text-2);
  text-align: center;
}

.operation span {
  color: var(--vp-c-brand-1);
  font-size: 1.3rem;
}

.pu-result {
  display: grid;
  grid-template-columns: minmax(100px, 1fr) 68px;
  gap: 10px;
  align-items: center;
}

.pu-track {
  position: relative;
  height: 24px;
  overflow: visible;
  border-radius: 6px;
  background:
    linear-gradient(to right, transparent calc(50% - 1px), var(--vp-c-divider) 50%, transparent calc(50% + 1px)),
    var(--vp-c-bg);
}

.pu-fill {
  display: block;
  height: 100%;
  border-radius: 6px;
  background: color-mix(in srgb, var(--vp-c-brand-1) 72%, transparent);
  transition: width 500ms ease;
}

.target {
  position: absolute;
  top: -4px;
  left: calc(80% - 1px);
  width: 2px;
  height: 32px;
  background: var(--vp-c-text-1);
}

.target::before {
  position: absolute;
  top: -1px;
  left: -3px;
  width: 8px;
  height: 8px;
  transform: rotate(45deg);
  background: inherit;
  content: "";
}

@media (max-width: 640px) {
  .controller-lane {
    grid-template-columns: 1fr;
    gap: 4px;
  }

  .controller-lane span:last-child {
    text-align: left;
  }

  .conversion-head {
    display: none;
  }

  .conversion-row {
    grid-template-columns: 82px 1fr;
    gap: 8px 10px;
    padding: 10px 0;
  }

  .operation {
    grid-column: 1;
  }

  .pu-result {
    grid-column: 2;
  }
}
</style>
