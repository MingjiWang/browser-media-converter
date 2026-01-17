<script setup lang="ts">
import Switch from '../components/Switch.vue'
</script>

<template>
  <div>
    <header class="mb-12">
      <h2 class="text-3xl font-bold tracking-tight">Switch Control</h2>
      <p class="mt-2 text-lg text-black/60 dark:text-white/60">
        Clickable toggle switch with realistic glass refraction and haptic-like visual feedback.
      </p>
    </header>

    <div class="min-h-[500px]">
      <Switch />
    </div>
  </div>
</template>
