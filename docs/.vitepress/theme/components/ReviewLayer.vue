<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";

type ReviewSession = {
  token: string;
  email: string;
  expiresAt: string;
};

type ReviewSelection = {
  text: string;
  before: string;
  after: string;
  pagePath: string;
  pageTitle: string;
};

const apiBase = (import.meta.env.VITE_REVIEW_API_URL || "").replace(/\/$/, "");
const sessionKey = "energy-handbook-review-session";
const reviewMode = ref(false);
const session = ref<ReviewSession | null>(null);
const selection = ref<ReviewSelection | null>(null);
const instruction = ref("");
const drawerOpen = ref(false);
const submitting = ref(false);
const message = ref("");
const selectionButton = ref({ visible: false, left: 0, top: 0 });
let savedRange: Range | null = null;

const configured = computed(() => Boolean(apiBase));
const authenticated = computed(() => Boolean(session.value?.token));
const canSubmit = computed(() => (
  authenticated.value
  && Boolean(selection.value)
  && instruction.value.trim().length >= 2
  && !submitting.value
));

function restoreSession() {
  const raw = sessionStorage.getItem(sessionKey);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as ReviewSession;
    if (new Date(parsed.expiresAt).getTime() > Date.now()) session.value = parsed;
    else sessionStorage.removeItem(sessionKey);
  } catch {
    sessionStorage.removeItem(sessionKey);
  }
}

async function exchangeLoginCode() {
  const url = new URL(window.location.href);
  const code = url.searchParams.get("review_code");
  if (!code || !apiBase) return;
  url.searchParams.delete("review_code");
  window.history.replaceState({}, "", url);

  try {
    const response = await fetch(`${apiBase}/auth/exchange`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (!response.ok) throw new Error("登录授权码无效或已过期");
    const nextSession = await response.json() as ReviewSession;
    session.value = nextSession;
    sessionStorage.setItem(sessionKey, JSON.stringify(nextSession));
    reviewMode.value = true;
    message.value = `已登录：${nextSession.email}`;
  } catch (error) {
    message.value = error instanceof Error ? error.message : "登录失败";
  }
}

function login() {
  if (!apiBase) return;
  const returnTo = `${window.location.origin}${window.location.pathname}${window.location.search}`;
  window.location.assign(`${apiBase}/auth/start?return_to=${encodeURIComponent(returnTo)}`);
}

function logout() {
  sessionStorage.removeItem(sessionKey);
  session.value = null;
  reviewMode.value = false;
  clearSelection();
  message.value = "已退出批阅模式";
}

function clearHighlight() {
  const highlights = (CSS as typeof CSS & { highlights?: Map<string, unknown> }).highlights;
  highlights?.delete("energy-review-selection");
}

function clearSelection() {
  savedRange = null;
  selection.value = null;
  selectionButton.value.visible = false;
  clearHighlight();
  window.getSelection()?.removeAllRanges();
}

function highlightSavedRange() {
  if (!savedRange) return;
  const css = CSS as typeof CSS & {
    highlights?: { set: (name: string, value: unknown) => void };
  };
  const HighlightConstructor = (window as typeof window & {
    Highlight?: new (...ranges: Range[]) => unknown;
  }).Highlight;
  if (css.highlights && HighlightConstructor) {
    css.highlights.set("energy-review-selection", new HighlightConstructor(savedRange));
  }
}

function captureSelection() {
  if (!reviewMode.value || drawerOpen.value) return;
  const browserSelection = window.getSelection();
  if (!browserSelection || browserSelection.isCollapsed || browserSelection.rangeCount !== 1) {
    selectionButton.value.visible = false;
    return;
  }

  const range = browserSelection.getRangeAt(0);
  const ancestor = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
    ? range.commonAncestorContainer as Element
    : range.commonAncestorContainer.parentElement;
  const article = ancestor?.closest(".vp-doc");
  if (!article || ancestor?.closest(".review-layer")) return;

  const text = browserSelection.toString().replace(/\s+/g, " ").trim();
  if (text.length < 2 || text.length > 2_000) {
    selectionButton.value.visible = false;
    return;
  }

  const beforeRange = document.createRange();
  beforeRange.selectNodeContents(article);
  beforeRange.setEnd(range.startContainer, range.startOffset);
  const afterRange = document.createRange();
  afterRange.selectNodeContents(article);
  afterRange.setStart(range.endContainer, range.endOffset);
  const rect = range.getBoundingClientRect();

  savedRange = range.cloneRange();
  selection.value = {
    text,
    before: beforeRange.toString().replace(/\s+/g, " ").slice(-300),
    after: afterRange.toString().replace(/\s+/g, " ").slice(0, 300),
    pagePath: window.location.pathname,
    pageTitle: document.querySelector("h1")?.textContent?.trim() || document.title,
  };
  selectionButton.value = {
    visible: true,
    left: Math.min(window.innerWidth - 130, Math.max(12, rect.left + rect.width / 2 - 55)),
    top: Math.max(12, rect.top - 44),
  };
}

async function openDrawer() {
  highlightSavedRange();
  selectionButton.value.visible = false;
  drawerOpen.value = true;
  await nextTick();
  document.querySelector<HTMLTextAreaElement>("#review-instruction")?.focus();
}

function closeDrawer() {
  drawerOpen.value = false;
  instruction.value = "";
  message.value = "";
  clearSelection();
}

async function submitReview() {
  if (!canSubmit.value || !session.value || !selection.value) return;
  submitting.value = true;
  message.value = "正在提交云端 Codex 任务…";
  try {
    const response = await fetch(`${apiBase}/reviews`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${session.value.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        ...selection.value,
        instruction: instruction.value.trim(),
        siteOrigin: window.location.origin,
      }),
    });
    const result = await response.json() as { jobId?: string; message?: string };
    if (response.status === 401) {
      logout();
      throw new Error("登录已过期，请重新登录");
    }
    if (!response.ok || !result.jobId) throw new Error(result.message || "提交失败");
    message.value = `任务 ${result.jobId} 已提交，检查通过后将自动合并并发布。`;
    instruction.value = "";
  } catch (error) {
    message.value = error instanceof Error ? error.message : "提交失败";
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  restoreSession();
  void exchangeLoginCode();
  document.addEventListener("mouseup", captureSelection);
  document.addEventListener("keyup", captureSelection);
});

onBeforeUnmount(() => {
  document.removeEventListener("mouseup", captureSelection);
  document.removeEventListener("keyup", captureSelection);
  clearHighlight();
});
</script>

<template>
  <div v-if="configured" class="review-layer">
    <div class="review-account">
      <button v-if="!authenticated" class="review-login" type="button" @click="login">
        登录批阅
      </button>
      <template v-else>
        <button
          class="review-mode"
          :class="{ active: reviewMode }"
          type="button"
          :aria-pressed="reviewMode"
          @click="reviewMode = !reviewMode"
        >
          {{ reviewMode ? "批阅已开启" : "开启批阅" }}
        </button>
        <button class="review-logout" type="button" @click="logout">退出</button>
      </template>
    </div>

    <button
      v-if="selectionButton.visible"
      class="review-selection-action"
      type="button"
      :style="{ left: `${selectionButton.left}px`, top: `${selectionButton.top}px` }"
      @mousedown.prevent
      @click="openDrawer"
    >
      添加批阅
    </button>

    <div v-if="drawerOpen" class="review-backdrop" @click.self="closeDrawer">
      <aside class="review-drawer" aria-labelledby="review-title">
        <div class="review-drawer-head">
          <div>
            <span class="review-eyebrow">在线批阅</span>
            <h2 id="review-title">给云端 Codex 修改要求</h2>
          </div>
          <button class="review-close" type="button" aria-label="关闭批阅" @click="closeDrawer">×</button>
        </div>

        <blockquote class="review-quote">{{ selection?.text }}</blockquote>
        <label for="review-instruction">修改要求</label>
        <textarea
          id="review-instruction"
          v-model="instruction"
          maxlength="2000"
          rows="6"
          placeholder="例如：补充单位换算，并把这段改得更适合高中生理解。"
        />
        <p class="review-help">Codex 会结合上下文修改文章或相关动画；安全检查通过后自动合并。</p>
        <p v-if="message" class="review-message" role="status">{{ message }}</p>
        <div class="review-actions">
          <button type="button" class="review-cancel" @click="closeDrawer">取消</button>
          <button type="button" class="review-submit" :disabled="!canSubmit" @click="submitReview">
            {{ submitting ? "提交中…" : "提交自动修改" }}
          </button>
        </div>
      </aside>
    </div>
  </div>
</template>
