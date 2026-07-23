<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";
import { withBase } from "vitepress";

const frame = ref<HTMLIFrameElement>();
const frameHeight = ref(2200);
let outerResizeObserver: ResizeObserver | undefined;
let innerResizeObserver: ResizeObserver | undefined;
let themeObserver: MutationObserver | undefined;

function contentHeight(documentNode: Document) {
  const body = documentNode.body;
  const bodyRect = body.getBoundingClientRect();
  const styles = documentNode.defaultView?.getComputedStyle(body);
  const paddingBottom = Number.parseFloat(styles?.paddingBottom ?? "0");
  const bottom = Array.from(body.children).reduce(
    (current, child) => Math.max(current, child.getBoundingClientRect().bottom),
    bodyRect.top,
  );
  return Math.ceil(bottom - bodyRect.top + paddingBottom) + 2;
}

function nestedFrame() {
  return frame.value?.contentDocument?.querySelector("iframe");
}

function syncTheme() {
  const theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
  const outerDocument = frame.value?.contentDocument;
  if (!outerDocument) return;
  outerDocument.documentElement.dataset.theme = theme;
  const innerDocument = nestedFrame()?.contentDocument;
  if (innerDocument) innerDocument.documentElement.dataset.theme = theme;
}

function measureContent() {
  const outerDocument = frame.value?.contentDocument;
  if (!outerDocument?.body) return;

  const inner = nestedFrame();
  const innerDocument = inner?.contentDocument;
  if (inner && innerDocument?.body) {
    inner.style.height = `${contentHeight(innerDocument)}px`;
  }

  frameHeight.value = contentHeight(outerDocument);
}

function observeInnerFrame() {
  const inner = nestedFrame();
  const innerDocument = inner?.contentDocument;
  if (!inner || !innerDocument?.body) return;

  syncTheme();
  measureContent();
  innerResizeObserver?.disconnect();
  innerResizeObserver = new ResizeObserver(measureContent);
  innerResizeObserver.observe(innerDocument.body);
}

function handleLoad() {
  const outerDocument = frame.value?.contentDocument;
  if (!outerDocument?.body) return;

  const inner = nestedFrame();
  if (inner) inner.addEventListener("load", observeInnerFrame, { once: true });
  observeInnerFrame();

  outerResizeObserver?.disconnect();
  outerResizeObserver = new ResizeObserver(measureContent);
  outerResizeObserver.observe(outerDocument.body);

  themeObserver ??= new MutationObserver(syncTheme);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
}

onBeforeUnmount(() => {
  outerResizeObserver?.disconnect();
  innerResizeObserver?.disconnect();
  themeObserver?.disconnect();
});
</script>

<template>
  <div class="energy-controller-panorama-demo">
    <iframe
      ref="frame"
      :src="withBase('/demos/energy-controller/knowledge-panorama.html')"
      title="能源控制器知识全景：按掌握状态筛选并查看每个模块的证据和下一步"
      :style="{ height: `${frameHeight}px` }"
      sandbox="allow-scripts allow-same-origin"
      loading="lazy"
      @load="handleLoad"
    />
  </div>
</template>

<style scoped>
.energy-controller-panorama-demo {
  width: 100%;
  margin: 1.25rem auto 1.5rem;
}

.energy-controller-panorama-demo iframe {
  display: block;
  width: 100%;
  border: 0;
  background: transparent;
}
</style>
