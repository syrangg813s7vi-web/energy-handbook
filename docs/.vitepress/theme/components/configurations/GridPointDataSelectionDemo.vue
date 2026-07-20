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
  <div
    class="config-demo grid-selector-demo"
    :data-selected="state.selected"
    :data-hold="state.selected === 'hold'"
  >
    <ConfigurationDemoControls
      :current="step"
      :total="states.length"
      :playing="playing"
      @play="togglePlay"
      @next="next"
      @reset="reset"
    />

    <div class="selector-stage">
      <svg class="selector-wires" viewBox="0 0 736 300" role="img" aria-labelledby="gps-title gps-desc">
        <title id="gps-title">并网点主备测量数据选择动画</title>
        <desc id="gps-desc">主测量和备用测量进入数据选择器；选择器根据品质、更新时间和回切延时，为场站控制器提供一个可信的并网点功率值。</desc>
        <path class="wire main-wire" d="M 186 78 C 280 78, 260 128, 350 128"></path>
        <path class="wire backup-wire" d="M 186 222 C 280 222, 260 172, 350 172"></path>
        <path class="wire output-wire" d="M 486 150 L 604 150"></path>
        <circle class="packet main-packet" r="6">
          <animateMotion dur="1.6s" repeatCount="indefinite" path="M 186 78 C 280 78, 260 128, 350 128"></animateMotion>
        </circle>
        <circle class="packet backup-packet" r="6">
          <animateMotion dur="1.6s" repeatCount="indefinite" path="M 186 222 C 280 222, 260 172, 350 172"></animateMotion>
        </circle>
        <circle class="packet output-packet" r="6">
          <animateMotion dur="1.2s" repeatCount="indefinite" path="M 486 150 L 604 150"></animateMotion>
        </circle>
      </svg>

      <section
        class="source source-main"
        :class="{ 'is-selected': state.selected === 'main', 'is-invalid': state.main[1].includes('无效') }"
        aria-label="主测量"
      >
        <span>主测量 A</span>
        <strong>{{ state.main[0] }}</strong>
        <small>{{ state.main[1] }}</small>
      </section>

      <section class="selector-node" :class="{ holding: state.selected === 'hold' }" aria-label="数据选择器">
        <span>数据选择器</span>
        <strong>{{ state.selector[0] }}</strong>
        <small>{{ state.selector[1] }}</small>
      </section>

      <section class="controller-node" aria-label="场站控制器">
        <span>送往控制器</span>
        <strong>{{ state.output }}</strong>
        <small>唯一可信输入</small>
      </section>

      <section
        class="source source-backup"
        :class="{ 'is-selected': state.selected === 'backup' }"
        aria-label="备用测量"
      >
        <span>备用测量 B</span>
        <strong>{{ state.backup[0] }}</strong>
        <small>{{ state.backup[1] }}</small>
      </section>
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
.selector-stage {
  position: relative;
  width: 100%;
  min-height: 300px;
  aspect-ratio: 736 / 300;
}

.selector-wires {
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

.packet {
  fill: var(--config-accent);
  opacity: 0;
  transition: opacity 300ms ease;
}

.source,
.selector-node,
.controller-node {
  box-sizing: border-box;
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  min-height: 82px;
  padding: 12px;
  border: 1px solid var(--config-line);
  border-radius: 10px;
  background: var(--config-node);
  color: var(--vp-c-text-1);
  transition:
    border-color 400ms var(--config-ease),
    background 400ms var(--config-ease),
    opacity 400ms var(--config-ease),
    transform 400ms var(--config-ease);
}

.source span,
.selector-node span,
.controller-node span,
.source small,
.selector-node small,
.controller-node small {
  color: var(--vp-c-text-2);
}

.source {
  left: 0;
  width: 25.27%;
}

.source-main {
  top: 36px;
}

.source-backup {
  top: 180px;
}

.selector-node {
  top: 105px;
  left: 47.55%;
  width: 18.48%;
  text-align: center;
}

.controller-node {
  top: 105px;
  left: 82.06%;
  width: 17.94%;
}

.source.is-selected {
  border-color: var(--config-accent);
  background: var(--config-accent-soft);
  transform: translateY(-2px);
}

.source.is-invalid {
  border-color: var(--config-danger);
  background: var(--config-danger-soft);
}

.selector-node.holding {
  border-style: dashed;
}

.grid-selector-demo[data-selected="main"] .main-wire,
.grid-selector-demo[data-selected="backup"] .backup-wire,
.grid-selector-demo .output-wire {
  stroke: var(--config-accent);
}

.grid-selector-demo[data-selected="main"] .main-packet,
.grid-selector-demo[data-selected="backup"] .backup-packet,
.grid-selector-demo .output-packet {
  opacity: 1;
}

.grid-selector-demo[data-hold="true"] .output-packet {
  opacity: 0;
}

.grid-selector-demo[data-hold="true"] .output-wire {
  stroke-dasharray: 5 5;
}

@media (max-width: 620px) {
  .selector-stage {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    min-height: 0;
    aspect-ratio: auto;
  }

  .selector-wires {
    display: none;
  }

  .source,
  .selector-node,
  .controller-node {
    position: static;
    width: auto;
    min-height: 96px;
  }

  .selector-node,
  .controller-node {
    text-align: left;
  }

  .source-main { order: 1; }
  .source-backup { order: 2; }
  .selector-node { order: 3; }
  .controller-node { order: 4; }
}

@media (prefers-reduced-motion: reduce) {
  .packet {
    display: none;
  }
}
</style>
