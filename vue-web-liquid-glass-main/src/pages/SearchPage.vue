<script setup lang="ts">
import Searchbox from '../components/Searchbox.vue'
</script>

<template>
  <div>
    <header class="mb-12">
      <h2 class="text-3xl font-bold tracking-tight">Searchbox</h2>
      <p class="mt-2 text-lg text-black/60 dark:text-white/60">
        A liquid-glass search component throughout the app. Features a distinct glass orb for the close button and smooth expansion animations.
      </p>
    </header>

    <div class="min-h-[500px]">
      <Searchbox />
    </div>
  </div>
</template>
