<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { withBase } from "vitepress";
import { photos } from "../data/cigreVendorPhotos";

const props = defineProps<{
  theme: "digital-transition" | "iec-61850" | "huawei-power-corps" | "other";
}>();

const vendorOrder = [
  "ABB",
  "ETAP",
  "GE Vernova",
  "Hitachi Energy",
  "南瑞继保",
  "SEL",
  "Siemens",
  "华为",
];

const expandedVendors = ref(new Set<string>());
const activePhoto = ref<(typeof photos)[number] | null>(null);

const groups = computed(() => {
  const byVendor = new Map<string, (typeof photos)[number][]>();

  for (const photo of photos) {
    if (photo.theme !== props.theme) continue;
    const group = byVendor.get(photo.vendorLabel) ?? [];
    group.push(photo);
    byVendor.set(photo.vendorLabel, group);
  }

  return [...byVendor.entries()]
    .sort(([left], [right]) => vendorOrder.indexOf(left) - vendorOrder.indexOf(right))
    .map(([vendor, items]) => ({ vendor, items }));
});

function imagePath(src: string) {
  return withBase(`/visuals/cigre-2026-vendors${src.slice("/photos".length)}`);
}

function visibleItems(vendor: string, items: (typeof photos)[number][]) {
  return expandedVendors.value.has(vendor) ? items : items.slice(0, 8);
}

function toggleVendor(vendor: string) {
  const next = new Set(expandedVendors.value);
  next.has(vendor) ? next.delete(vendor) : next.add(vendor);
  expandedVendors.value = next;
}

function closeLightbox() {
  activePhoto.value = null;
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") closeLightbox();
}

onMounted(() => window.addEventListener("keydown", handleKeydown));
onBeforeUnmount(() => window.removeEventListener("keydown", handleKeydown));
</script>

<template>
  <div class="cigre-gallery">
    <section v-for="group in groups" :key="group.vendor" class="cigre-vendor-group">
      <header class="cigre-vendor-header">
        <h3>{{ group.vendor }}</h3>
        <span>{{ group.items.length }} 张</span>
      </header>

      <div class="cigre-photo-grid">
        <button
          v-for="photo in visibleItems(group.vendor, group.items)"
          :key="photo.id"
          class="cigre-photo-card"
          type="button"
          :aria-label="`查看大图：${photo.alt}`"
          @click="activePhoto = photo"
        >
          <img
            :src="imagePath(photo.src)"
            :alt="photo.alt"
            loading="lazy"
            decoding="async"
          />
          <span>现场照片 {{ photo.number }}</span>
        </button>
      </div>

      <button
        v-if="group.items.length > 8"
        class="cigre-expand"
        type="button"
        :aria-expanded="expandedVendors.has(group.vendor)"
        @click="toggleVendor(group.vendor)"
      >
        {{ expandedVendors.has(group.vendor) ? "收起照片" : `查看全部 ${group.items.length} 张` }}
      </button>
    </section>

    <div
      v-if="activePhoto"
      class="cigre-lightbox"
      role="dialog"
      aria-modal="true"
      :aria-label="activePhoto.alt"
      @click.self="closeLightbox"
    >
      <button class="cigre-lightbox-close" type="button" aria-label="关闭大图" @click="closeLightbox">×</button>
      <figure>
        <img :src="imagePath(activePhoto.src)" :alt="activePhoto.alt" />
        <figcaption>{{ activePhoto.vendorLabel }} · 现场照片 {{ activePhoto.number }}</figcaption>
      </figure>
    </div>
  </div>
</template>

<style scoped>
.cigre-gallery {
  margin: 1.5rem 0 2.5rem;
}

.cigre-vendor-group {
  margin: 1.75rem 0;
  padding-top: 0.25rem;
}

.cigre-vendor-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.8rem;
}

.cigre-vendor-header h3 {
  margin: 0;
  border: 0;
}

.cigre-vendor-header span {
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
  white-space: nowrap;
}

.cigre-photo-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.cigre-photo-card {
  overflow: hidden;
  padding: 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  cursor: zoom-in;
  text-align: left;
}

.cigre-photo-card:hover,
.cigre-photo-card:focus-visible {
  border-color: var(--vp-c-brand-1);
  outline: none;
}

.cigre-photo-card img {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

.cigre-photo-card span {
  display: block;
  padding: 0.5rem 0.65rem;
  font-size: 0.75rem;
}

.cigre-expand {
  margin-top: 0.85rem;
  padding: 0.48rem 0.8rem;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 999px;
  background: transparent;
  color: var(--vp-c-brand-1);
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 600;
}

.cigre-lightbox {
  position: fixed;
  z-index: 100;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 3.5rem 1rem 1rem;
  background: rgb(5 12 18 / 92%);
}

.cigre-lightbox figure {
  display: grid;
  max-width: min(1100px, 96vw);
  max-height: 88vh;
  margin: 0;
  color: #fff;
  gap: 0.65rem;
  justify-items: center;
}

.cigre-lightbox img {
  max-width: 100%;
  max-height: 80vh;
  border-radius: 8px;
  object-fit: contain;
}

.cigre-lightbox figcaption {
  font-size: 0.85rem;
}

.cigre-lightbox-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2.4rem;
  height: 2.4rem;
  border: 1px solid rgb(255 255 255 / 55%);
  border-radius: 50%;
  background: rgb(0 0 0 / 35%);
  color: #fff;
  cursor: pointer;
  font-size: 1.8rem;
  line-height: 1;
}

@media (max-width: 720px) {
  .cigre-photo-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.55rem;
  }
}
</style>
