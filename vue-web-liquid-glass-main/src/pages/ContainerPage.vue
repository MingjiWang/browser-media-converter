<script setup lang="ts">
import ContainerDemo from '../components/ContainerDemo.vue'
</script>

<template>
  <div>
    <header class="mb-12">
      <h2 class="text-3xl font-bold tracking-tight">Container</h2>
      <p class="mt-2 text-lg text-black/60 dark:text-white/60">
        A wrapper component for applying liquid glass effects, gradient blurs, and refractions to any content.
      </p>
    </header>

    <div class="min-h-[500px]">
      <ContainerDemo />
    </div>
  </div>
</template>
