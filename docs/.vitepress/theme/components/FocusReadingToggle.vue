<script setup lang="ts">
import { useData } from "vitepress";
import { computed, onMounted, ref } from "vue";

const STORAGE_KEY = "energy-handbook:focus-reading";
const ROOT_CLASS = "focus-reading";

const { frontmatter, page } = useData();
const enabled = ref(false);

const isDocumentPage = computed(() => {
  const layout = frontmatter.value.layout;
  return !page.value.isNotFound && (!layout || layout === "doc");
});

function applyRootState() {
  document.documentElement.classList.toggle(ROOT_CLASS, enabled.value);
}

function readPreference() {
  try {
    enabled.value = window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    enabled.value = false;
  }

  applyRootState();
}

function toggleFocusReading() {
  enabled.value = !enabled.value;
  applyRootState();

  try {
    window.localStorage.setItem(STORAGE_KEY, String(enabled.value));
  } catch {
    // The layout still works when browser storage is unavailable.
  }
}

onMounted(readPreference);
</script>

<template>
  <button
    v-if="isDocumentPage"
    class="focus-reading-toggle"
    type="button"
    :class="{ active: enabled }"
    :aria-pressed="enabled"
    :aria-label="enabled ? '显示左右目录' : '隐藏左右目录，进入专注阅读'"
    :title="enabled ? '显示左右目录' : '隐藏左右目录，扩大正文'"
    @click="toggleFocusReading"
  >
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        v-if="enabled"
        d="M4 5h3v14H4V5Zm5 0h11v3H9V5Zm0 5h11v3H9v-3Zm0 5h11v4H9v-4Z"
      />
      <path
        v-else
        d="M4 4h6v2H6v4H4V4Zm10 0h6v6h-2V6h-4V4ZM4 14h2v4h4v2H4v-6Zm14 0h2v6h-6v-2h4v-4ZM8 9h8v6H8V9Z"
      />
    </svg>
    <span>{{ enabled ? "显示目录" : "专注阅读" }}</span>
  </button>
</template>
