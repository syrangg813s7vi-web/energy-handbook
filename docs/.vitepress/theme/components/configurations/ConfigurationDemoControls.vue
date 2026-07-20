<script setup lang="ts">
defineProps<{
  current: number;
  total: number;
  playing: boolean;
}>();

defineEmits<{
  play: [];
  next: [];
  reset: [];
}>();
</script>

<template>
  <div class="config-controls" aria-label="动画控制">
    <button type="button" class="config-button primary" @click="$emit('play')">
      {{ playing ? "暂停" : "自动演示" }}
    </button>
    <button type="button" class="config-button" @click="$emit('next')">下一步</button>
    <button type="button" class="config-button quiet" @click="$emit('reset')">复位</button>
    <span class="config-step">步骤 {{ current + 1 }} / {{ total }}</span>
  </div>
</template>
