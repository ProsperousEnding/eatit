<template>
  <picture class="responsive-dish-image" v-bind="$attrs">
    <source
      v-if="imageData.srcset"
      type="image/webp"
      :srcset="imageData.srcset"
      :sizes="sizes"
    >
    <img
      class="responsive-dish-image__element"
      :src="imageData.fallback"
      :alt="alt"
      :loading="loading"
      :fetchpriority="fetchPriority"
      decoding="async"
      :style="{ objectFit: fit }"
    >
  </picture>
</template>

<script setup>
import { computed } from 'vue'
import { getResponsiveImageData } from '@/utils/image'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  src: { type: String, required: true },
  alt: { type: String, required: true },
  sizes: { type: String, default: '100vw' },
  loading: { type: String, default: 'lazy' },
  fetchPriority: { type: String, default: 'auto' },
  fit: { type: String, default: 'contain' }
})

const imageData = computed(() => getResponsiveImageData(props.src))
</script>

<style scoped>
.responsive-dish-image {
  display: block;
  overflow: hidden;
  background: #fff;
}

.responsive-dish-image__element {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
