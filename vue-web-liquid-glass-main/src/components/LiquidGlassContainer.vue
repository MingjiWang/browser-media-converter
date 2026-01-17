<script setup lang="ts">
import { computed } from 'vue'
import GradientBlur from './GradientBlur.vue'

// Props
const props = withDefaults(defineProps<{
  size?: 'regular'
  disabled?: boolean
}>(), {
  size: 'regular',
  disabled: false,
})

// Size presets (height and styling only, width is responsive)
const sizePresets = {
  regular: {
    height: 100,
    radius: 50,
  },
}

// Computed dimensions based on size
const dimensions = computed(() => sizePresets[props.size])
const barRadius = computed(() => dimensions.value.radius)
</script>

<template>
  <div
    class="relative w-full h-full transition-transform duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] overflow-hidden"
    :class="{ 'opacity-50 cursor-not-allowed': disabled }"
    :style="{
      transform: `scale(1)`,
      borderRadius: `${barRadius}px`,
      border: '1.5px solid rgb(112 112 112 / 38%)',
    }"
  >

    <!-- Glass background -->
    <div
      class="absolute inset-0 bg-[var(--glass-rgb)]/[var(--glass-bg-alpha)]"
      :style="{
        borderRadius: `${barRadius}px`,
        boxShadow: `0 4px 20px rgba(0, 0, 0, 0.24)`,
      }"
    />

    <!-- Gradient Blur Edges -->
    <GradientBlur direction="top" />
    <GradientBlur direction="bottom" />
    <GradientBlur direction="left" />
    <GradientBlur direction="right" />

    <div 
      class="absolute top-[40px] bottom-[40px] left-[40px] right-[40px] backdrop-blur-[3px]"
    ></div>

    <div class="absolute z-[99] p-5 w-full h-full overflow-x-hidden overflow-y-auto">
        <slot name="content" />
    </div>
  </div>
</template>

<style scoped>
/* No extra styles needed, using utility classes */
</style>
