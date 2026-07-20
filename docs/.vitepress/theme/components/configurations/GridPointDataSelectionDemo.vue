<script setup lang="ts">
import { computed } from "vue";
import ConfigurationDemoControls from "./ConfigurationDemoControls.vue";
import { useStepDemo } from "./useStepDemo";

const states = [
  {
    phase: "正常运行",
    detail: "两路数据都正常，选择器按优先级采用主测量 A。",
    main: ["50.2 MW", "品质正常 · 刚刚更新"],
    backup: ["50.4 MW", "品质正常 · 刚刚更新"],
    selected: "main",
    selector: ["选择 A", "主测量有效，优先使用"],
    output: "50.2 MW",
  },
  {
    phase: "发现异常",
    detail: "A 的数值看似合理，但时间戳停止更新；选择器开始进行失效确认。",
    main: ["50.2 MW", "品质正常 · 已 1.2 s 未更新"],
    backup: ["50.6 MW", "品质正常 · 刚刚更新"],
    selected: "main",
    selector: ["暂用 A", "等待失效确认延时"],
    output: "50.2 MW",
  },
  {
    phase: "确认失效",
    detail: "A 超过允许的数据龄期；切换瞬间保持最后可信值，阻止坏数据进入控制器。",
    main: ["50.2 MW", "数据超时 · 判定无效"],
    backup: ["50.8 MW", "品质正常 · 刚刚更新"],
    selected: "hold",
    selector: ["切换中", "保持最后可信值"],
    output: "50.2 MW",
  },
  {
    phase: "切到备用",
    detail: "备用 B 通过品质、范围和新鲜度检查，成为新的并网点控制数据。",
    main: ["50.2 MW", "数据超时 · 判定无效"],
    backup: ["50.9 MW", "品质正常 · 刚刚更新"],
    selected: "backup",
    selector: ["选择 B", "主无效，备用有效"],
    output: "50.9 MW",
  },
  {
    phase: "主测量恢复",
    detail: "A 已恢复，但选择器继续使用 B，等待 A 连续稳定，防止主备反复切换。",
    main: ["51.1 MW", "已恢复 · 稳定 1.0 s"],
    backup: ["51.0 MW", "品质正常 · 刚刚更新"],
    selected: "backup",
    selector: ["仍选择 B", "主测量回切延时"],
    output: "51.0 MW",
  },
  {
    phase: "稳定回切",
    detail: "A 满足稳定回切条件，重新成为主数据；控制器始终只接收一路可信数据。",
    main: ["51.3 MW", "品质正常 · 稳定 5.0 s"],
    backup: ["51.2 MW", "品质正常 · 刚刚更新"],
    selected: "main",
    selector: ["选择 A", "主测量稳定，恢复优先级"],
    output: "51.3 MW",
  },
] as const;

const { step, playing, next, reset, togglePlay } = useStepDemo(states.length, 2400);
const state = computed(() => states[step.value]);
</script>

<template>
  <div class="config-demo grid-selector-demo">
    <ConfigurationDemoControls
      :current="step"
      :total="states.length"
      :playing="playing"
      @play="togglePlay"
      @next="next"
      @reset="reset"
    />

    <div class="selector-flow" aria-label="并网点主备数据选择过程">
      <div
        class="source main-source"
        :class="{ selected: state.selected === 'main', invalid: state.main[1].includes('无效') }"
      >
        <span>主测量 A</span>
        <strong>{{ state.main[0] }}</strong>
        <small>{{ state.main[1] }}</small>
      </div>

      <div class="flow-arrow main-arrow" :class="{ active: state.selected === 'main' }">→</div>

      <div class="selector" :class="{ holding: state.selected === 'hold' }">
        <span>数据选择器</span>
        <strong>{{ state.selector[0] }}</strong>
        <small>{{ state.selector[1] }}</small>
      </div>

      <div class="flow-arrow output-arrow" :class="{ paused: state.selected === 'hold' }">→</div>

      <div class="controller">
        <span>送往控制器</span>
        <strong>{{ state.output }}</strong>
        <small>唯一可信输入</small>
      </div>

      <div
        class="source backup-source"
        :class="{ selected: state.selected === 'backup' }"
      >
        <span>备用测量 B</span>
        <strong>{{ state.backup[0] }}</strong>
        <small>{{ state.backup[1] }}</small>
      </div>

      <div class="flow-arrow backup-arrow" :class="{ active: state.selected === 'backup' }">→</div>
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
.selector-flow {
  display: grid;
  grid-template-columns: minmax(150px, 1fr) 42px minmax(145px, 0.9fr) 42px minmax(140px, 0.9fr);
  grid-template-rows: repeat(2, minmax(96px, auto));
  gap: 12px 4px;
  align-items: center;
  padding: 14px 0 4px;
}

.source,
.selector,
.controller {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  min-height: 88px;
  padding: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
  transition: border-color 300ms ease, background 300ms ease, transform 300ms ease;
}

.source span,
.selector span,
.controller span,
.source small,
.selector small,
.controller small {
  color: var(--vp-c-text-2);
}

.source.selected {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  transform: translateY(-2px);
}

.source.invalid {
  border-color: var(--vp-c-danger-1);
}

.main-source {
  grid-column: 1;
  grid-row: 1;
}

.backup-source {
  grid-column: 1;
  grid-row: 2;
}

.selector {
  grid-column: 3;
  grid-row: 1 / 3;
}

.selector.holding {
  border-style: dashed;
}

.controller {
  grid-column: 5;
  grid-row: 1 / 3;
}

.flow-arrow {
  color: var(--vp-c-divider);
  text-align: center;
  font-size: 1.6rem;
  transition: color 300ms ease, opacity 300ms ease;
}

.flow-arrow.active,
.output-arrow {
  color: var(--vp-c-brand-1);
}

.main-arrow {
  grid-column: 2;
  grid-row: 1;
}

.backup-arrow {
  grid-column: 2;
  grid-row: 2;
}

.output-arrow {
  grid-column: 4;
  grid-row: 1 / 3;
}

.output-arrow.paused {
  opacity: 0.35;
}

@media (max-width: 620px) {
  .selector-flow {
    display: flex;
    flex-direction: column;
  }

  .main-source { order: 1; }
  .backup-source { order: 2; }
  .selector { order: 3; }
  .controller { order: 4; }

  .main-arrow,
  .backup-arrow,
  .output-arrow {
    display: none;
  }
}
</style>
