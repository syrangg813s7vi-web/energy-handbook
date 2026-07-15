<script setup lang="ts">
import { computed, ref, useId } from "vue";

type RoleKey = "battery" | "bms" | "pcs" | "ems";

const roles: Record<RoleKey, { short: string; title: string; description: string; question: string }> = {
  bms: {
    short: "护",
    title: "BMS：安全管家",
    description: "监测电芯电压、电流、温度、SOC和SOH，防止过充、过放与热失控。",
    question: "电池现在是否安全？",
  },
  ems: {
    short: "决",
    title: "EMS：协调与优化",
    description: "汇总发电、负荷、电价和设备状态，决定何时充放、充放多少以及能量流向。",
    question: "现在应该怎样运行？",
  },
  pcs: {
    short: "变",
    title: "PCS：转换与执行",
    description: "完成交流与直流的双向转换，并把EMS的功率指令变成实际充放电动作。",
    question: "电能怎样进出电池？",
  },
  battery: {
    short: "存",
    title: "电池：能量载体",
    description: "把电能暂时保存起来，容量决定能存多少，功率决定充放多快。",
    question: "能量存在哪里？",
  },
};

const selected = ref<RoleKey>("ems");
const titleId = `energy-roles-${useId()}`;
const current = computed(() => roles[selected.value]);
</script>

<template>
  <section class="roles-demo" :aria-labelledby="titleId">
    <h3 :id="titleId">一条指令如何变成能量流</h3>
    <div class="role-flow" role="group" aria-label="储能系统角色关系">
      <button
        v-for="(role, key, index) in roles"
        :key="key"
        type="button"
        :class="{ active: selected === key }"
        :aria-pressed="selected === key"
        @click="selected = key"
      >
        <span>{{ role.short }}</span>
        <strong>{{ role.title.split("：")[0] }}</strong>
        <small>{{ role.question }}</small>
        <i v-if="index < Object.keys(roles).length - 1" aria-hidden="true">→</i>
      </button>
    </div>
    <div class="role-detail" aria-live="polite">
      <strong>{{ current.title }}</strong>
      <span>{{ current.description }}</span>
    </div>
  </section>
</template>

<style scoped>
.roles-demo {
  margin: 1.5rem 0;
  padding: 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 1rem;
  background: color-mix(in srgb, var(--vp-c-bg) 96%, var(--vp-c-brand-1));
}
.roles-demo h3 { margin: 0 0 0.9rem; border: 0; padding: 0; font-size: 1rem; }
.role-flow { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.75rem; }
.role-flow button {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 0.25rem;
  min-width: 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 0.75rem;
  padding: 0.75rem 0.4rem;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  cursor: pointer;
}
.role-flow button.active { border-color: var(--vp-c-brand-1); background: var(--vp-c-brand-soft); }
.role-flow button > span { display: grid; place-items: center; width: 2.2rem; height: 2.2rem; border-radius: 50%; color: var(--vp-c-brand-1); background: var(--vp-c-bg-soft); font-weight: 750; }
.role-flow strong { font-size: 0.78rem; }
.role-flow small { color: var(--vp-c-text-2); font-size: 0.66rem; }
.role-flow i { position: absolute; top: 50%; right: -0.72rem; z-index: 2; color: var(--vp-c-brand-1); font-style: normal; }
.role-detail { display: grid; gap: 0.2rem; margin-top: 0.9rem; padding: 0.75rem; border-radius: 0.65rem; background: var(--vp-c-bg-soft); }
.role-detail strong { color: var(--vp-c-brand-1); font-size: 0.82rem; }
.role-detail span { font-size: 0.78rem; }
@media (max-width: 600px) {
  .role-flow { grid-template-columns: 1fr 1fr; }
  .role-flow i { display: none; }
}
</style>
