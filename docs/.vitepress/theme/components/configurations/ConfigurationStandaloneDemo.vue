<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import { withBase } from "vitepress";

const props = defineProps<{
  src: string;
  title: string;
}>();

const frame = ref<HTMLIFrameElement>();
const frameHeight = ref(620);
const resolvedSrc = computed(() => withBase(props.src));
let contentResizeObserver: ResizeObserver | undefined;
let themeObserver: MutationObserver | undefined;

function syncTheme() {
  const frameDocument = frame.value?.contentDocument;
  if (!frameDocument) return;
  frameDocument.documentElement.dataset.theme = document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
}

function measureContent() {
  const frameDocument = frame.value?.contentDocument;
  if (!frameDocument?.body) return;
  const body = frameDocument.body;
  const bodyRect = body.getBoundingClientRect();
  const paddingBottom = Number.parseFloat(frameDocument.defaultView?.getComputedStyle(body).paddingBottom ?? "0");
  const contentBottom = Array.from(body.children).reduce(
    (bottom, child) => Math.max(bottom, child.getBoundingClientRect().bottom),
    bodyRect.top,
  );
  frameHeight.value = Math.ceil(contentBottom - bodyRect.top + paddingBottom) + 2;
}

function handleLoad() {
  const frameDocument = frame.value?.contentDocument;
  if (!frameDocument) return;

  syncTheme();
  measureContent();
  contentResizeObserver?.disconnect();
  contentResizeObserver = new ResizeObserver(measureContent);
  contentResizeObserver.observe(frameDocument.body);

  themeObserver ??= new MutationObserver(syncTheme);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
}

onBeforeUnmount(() => {
  contentResizeObserver?.disconnect();
  themeObserver?.disconnect();
});
</script>

<template>
  <div class="configuration-standalone-demo">
    <iframe
      ref="frame"
      :src="resolvedSrc"
      :title="title"
      :style="{ height: `${frameHeight}px` }"
      sandbox="allow-scripts allow-same-origin"
      @load="handleLoad"
    />
  </div>
</template>

<style scoped>
.configuration-standalone-demo {
  width: 100%;
  max-width: 736px;
  margin: 1.25rem auto 1.5rem;
}

.configuration-standalone-demo iframe {
  display: block;
  width: 100%;
  border: 0;
  background: transparent;
}
</style>
