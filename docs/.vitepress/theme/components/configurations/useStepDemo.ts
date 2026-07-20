import { computed, onUnmounted, ref } from "vue";

export function useStepDemo(stepCount: number, intervalMs = 2400) {
  const step = ref(0);
  const timer = ref<ReturnType<typeof setInterval>>();

  const playing = computed(() => timer.value !== undefined);

  function stop() {
    if (timer.value !== undefined) {
      clearInterval(timer.value);
      timer.value = undefined;
    }
  }

  function next() {
    step.value = (step.value + 1) % stepCount;
    if (step.value === stepCount - 1) {
      stop();
    }
  }

  function reset() {
    stop();
    step.value = 0;
  }

  function togglePlay() {
    if (playing.value) {
      stop();
      return;
    }

    if (step.value === stepCount - 1) {
      step.value = 0;
    }

    timer.value = setInterval(next, intervalMs);
  }

  onUnmounted(stop);

  return {
    step,
    playing,
    next,
    reset,
    togglePlay,
  };
}
