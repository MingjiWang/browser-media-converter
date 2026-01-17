<script setup lang="ts">
import BottomNavBar from '../components/BottomNavBar.vue'
</script>

<template>
  <div>
    <header class="mb-12">
      <h2 class="text-3xl font-bold tracking-tight">Bottom NavBar</h2>
      <p class="mt-2 text-lg text-black/60 dark:text-white/60">
        An iOS-style dock/navigation bar with magnification effects and glass masking.
      </p>
    </header>

    <div class="min-h-[500px]">
      <BottomNavBar />
    </div>
  </div>
</template>
