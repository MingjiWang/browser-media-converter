<script setup lang="ts">
import Slider from '../components/Slider.vue'
</script>

<template>
  <div>
    <header class="mb-12">
      <h2 class="text-3xl font-bold tracking-tight">Slider</h2>
      <p class="mt-2 text-lg text-black/60 dark:text-white/60">
        A fluid, physics-based slider component with liquid deformation feedback.
      </p>
    </header>

    <div class="min-h-[500px]">
      <Slider />
    </div>
  </div>
</template>
