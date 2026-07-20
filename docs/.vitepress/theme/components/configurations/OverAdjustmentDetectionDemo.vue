<script setup lang="ts">
import { computed } from "vue";
import ConfigurationDemoControls from "./ConfigurationDemoControls.vue";
import { useStepDemo } from "./useStepDemo";

const states = [
  {
    phase: "目标刚改变",
    detail: "控制器先短暂闭锁检测，避免把正常的指令阶跃过程误判为过调。",
    measured: 60,
    status: "指令变化闭锁",
    detector: "blocked",
    x: 130,
    y: 236,
    timer: 0,
    timerText: "未启动",
  },
  {
    phase: "正常跟踪目标",
    detail: "实测功率仍在目标下方，控制器继续升功率；此时不存在过调。",
    measured: 78,
    status: "正常跟踪",
    detector: "normal",
    x: 310,
    y: 113,
    timer: 0,
    timerText: "未启动",
  },
  {
    phase: "越过目标但仍在允许带内",
    detail: "80.6 MW 虽然越过目标，但没有超过 81 MW 上边界，属于允许波动。",
    measured: 80.6,
    status: "允许带内",
    detector: "normal",
    x: 400,
    y: 95,
    timer: 0,
    timerText: "未启动",
  },
  {
    phase: "进入过调候选",
    detail: "实测达到 82 MW，已经超过死区上边界；先启动持续计时，不立即确认。",
    measured: 82,
    status: "过调候选",
    detector: "candidate",
    x: 490,
    y: 85,
    timer: 40,
    timerText: "0.4 / 1.0 s",
  },
  {
    phase: "确认过调",
    detail: "超限连续达到 1 秒，过调标志置位，后级可以冻结积分或减小升功率指令。",
    measured: 82.3,
    status: "过调已确认",
    detector: "alarm",
    x: 580,
    y: 83,
    timer: 100,
    timerText: "1.0 / 1.0 s",
  },
  {
    phase: "回到复归区间",
    detail: "修正后回到 80.4 MW，并满足复归条件；标志解除，避免在边界附近反复跳变。",
    measured: 80.4,
    status: "已复归",
    detector: "recovered",
    x: 670,
    y: 96,
    timer: 0,
    timerText: "已清零",
  },
] as const;

const { step, playing, next, reset, togglePlay } = useStepDemo(states.length, 2600);
const state = computed(() => states[step.value]);
const isOver = computed(() => state.value.detector === "candidate" || state.value.detector === "alarm");
</script>

<template>
  <div class="config-demo over-adjust-demo" :class="{ over: isOver }">
    <ConfigurationDemoControls
      :current="step"
      :total="states.length"
      :playing="playing"
      @play="togglePlay"
      @next="next"
      @reset="reset"
    />

    <div class="config-stat-row" aria-live="polite">
      <div class="config-stat"><span>目标</span><strong>80.0 MW</strong></div>
      <div class="config-stat"><span>并网点实测</span><strong>{{ state.measured.toFixed(1) }} MW</strong></div>
      <div class="config-stat"><span>检测状态</span><strong class="detector-status">{{ state.status }}</strong></div>
    </div>

    <svg class="response-plot" viewBox="0 0 736 330" role="img" aria-labelledby="oad-title oad-desc">
      <title id="oad-title">升功率过程的过调检测</title>
      <desc id="oad-desc">目标功率从六十兆瓦升到八十兆瓦，实测逐步上升，超过允许带并持续一段时间后确认过调，随后回到复归区间。</desc>
      <defs>
        <clipPath id="oad-site-reveal">
          <rect x="60" y="20" :width="state.x - 60" height="260"></rect>
        </clipPath>
      </defs>

      <g class="grid">
        <line x1="60" y1="30" x2="680" y2="30"></line>
        <line x1="60" y1="99" x2="680" y2="99"></line>
        <line x1="60" y1="167" x2="680" y2="167"></line>
        <line x1="60" y1="236" x2="680" y2="236"></line>
        <line x1="60" y1="270" x2="680" y2="270"></line>
      </g>
      <g class="axis-labels">
        <text x="48" y="34" text-anchor="end">90</text>
        <text x="48" y="103" text-anchor="end">80</text>
        <text x="48" y="171" text-anchor="end">70</text>
        <text x="48" y="240" text-anchor="end">60</text>
        <text x="60" y="302">0 s</text>
        <text x="680" y="302" text-anchor="end">时间</text>
        <text x="16" y="20">MW</text>
      </g>

      <rect class="deadband" x="130" y="92" width="550" height="14"></rect>
      <text class="muted-label" x="672" y="88" text-anchor="end">允许带 ±1 MW</text>
      <path class="target-line" d="M 60 236 L 130 236 L 130 99 L 680 99"></path>
      <text class="muted-label" x="672" y="120" text-anchor="end">目标 80 MW</text>

      <g clip-path="url(#oad-site-reveal)">
        <path class="measured-line" d="M 60 236 L 130 236 L 220 154 L 310 113 L 400 95 L 490 85 L 580 83 L 670 96"></path>
      </g>
      <line class="cursor" :x1="state.x" y1="30" :x2="state.x" y2="270"></line>
      <circle class="point" :cx="state.x" :cy="state.y" r="7"></circle>
      <text
        class="point-label"
        :x="state.x > 620 ? state.x - 12 : state.x + 12"
        :y="state.y - 10"
        :text-anchor="state.x > 620 ? 'end' : 'start'"
      >
        {{ state.measured.toFixed(1) }} MW
      </text>
    </svg>

    <div class="timer-lane">
      <span>超限持续计时</span>
      <div class="timer-track" aria-hidden="true">
        <span :style="{ width: `${state.timer}%` }"></span>
      </div>
      <strong>{{ state.timerText }}</strong>
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
.detector-status {
  transition: color 300ms ease;
}

.over .detector-status {
  color: var(--vp-c-danger-1);
}

.response-plot {
  display: block;
  width: 100%;
  height: auto;
}

.grid line {
  stroke: var(--vp-c-divider);
  stroke-width: 1;
}

.axis-labels,
.muted-label {
  fill: var(--vp-c-text-2);
}

.deadband {
  fill: rgba(213, 138, 0, 0.2);
}

.target-line {
  fill: none;
  stroke: #d58a00;
  stroke-width: 2;
  stroke-dasharray: 7 5;
}

.measured-line {
  fill: none;
  stroke: var(--vp-c-brand-1);
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

clipPath rect {
  transition: width 600ms ease;
}

.cursor {
  stroke: var(--vp-c-divider);
  stroke-width: 1;
  transition: x1 600ms ease, x2 600ms ease;
}

.point {
  fill: var(--vp-c-brand-1);
  stroke: var(--vp-c-bg);
  stroke-width: 3;
  transition: cx 600ms ease, cy 600ms ease, fill 300ms ease;
}

.over .point {
  fill: var(--vp-c-danger-1);
}

.point-label {
  fill: var(--vp-c-text-1);
  transition: x 600ms ease, y 600ms ease;
}

.timer-lane {
  display: grid;
  grid-template-columns: 124px minmax(160px, 1fr) 88px;
  gap: 12px;
  align-items: center;
  min-height: 42px;
  padding: 8px 0;
  border-top: 1px solid var(--vp-c-divider);
}

.timer-lane > span {
  color: var(--vp-c-text-2);
}

.timer-lane > strong {
  text-align: right;
}

.timer-track {
  height: 12px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--vp-c-divider);
}

.timer-track span {
  display: block;
  height: 100%;
  background: var(--vp-c-danger-1);
  transition: width 500ms ease;
}

@media (max-width: 560px) {
  .timer-lane {
    grid-template-columns: 1fr 82px;
  }

  .timer-track {
    grid-column: 1 / -1;
    grid-row: 2;
  }

  .timer-lane > strong {
    grid-column: 2;
    grid-row: 1;
  }
}
</style>
