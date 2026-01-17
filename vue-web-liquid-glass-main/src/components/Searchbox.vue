<script setup lang="ts">
import { ref } from 'vue'
import LiquidGlassSearchBar from './LiquidGlassSearchBar.vue'

// Search query
const searchQuery = ref('')

// Background toggle
const showBgImage = ref(false)
</script>

<template>
  <div>
    <div class="mb-4 flex justify-end px-4">
      <label class="flex items-center gap-2 text-sm font-medium text-black/60 dark:text-white/60 cursor-pointer select-none bg-black/5 dark:bg-white/10 px-3 py-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
        <input type="checkbox" v-model="showBgImage" class="accent-black dark:accent-white">
        Show Background Image
      </label>
    </div>

    <div
      class="relative h-96 flex justify-center items-center rounded-xl -ml-4 w-[calc(100%+32px)] select-none text-black/5 dark:text-white/5 border border-black/10 dark:border-white/10 overflow-hidden transition-all duration-500 ease-in-out"
      :class="{ 'animate-bg-pan': showBgImage }"
      :style="showBgImage ? {
        backgroundImage: 'url(https://images.unsplash.com/photo-1651784627380-58168977f4f9?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } : {
        backgroundImage:
          'linear-gradient(to right, currentColor 1px, transparent 1px),' +
          'linear-gradient(to bottom, currentColor 1px, transparent 1px),' +
          'radial-gradient(120% 100% at 10% 0%, var(--bg1), var(--bg2))',
        backgroundSize: '24px 24px, 24px 24px, 100% 100%',
        backgroundPosition: '12px 12px, 12px 12px, 0 0',
      }"
    >
      <!-- Photo credit -->
      <a
        v-if="showBgImage"
        href="https://unsplash.com/@visaxslr"
        target="_blank"
        rel="noopener noreferrer"
        class="absolute left-3 top-3 inline-block text-[9px] uppercase tracking-wider"
        style="color: rgba(255, 255, 255, 0.4)"
      >
        Photo by @visaxslr<br>on Unsplash
      </a>

      <!-- Search Bar -->
      <div class="w-[420px] max-w-[90%]">
        <LiquidGlassSearchBar
          v-model="searchQuery"
          placeholder="Search"
          size="large"
        />
      </div>

      <!-- Display query -->
      <div 
        v-if="searchQuery" 
        class="absolute bottom-6 left-1/2 -translate-x-1/2 text-black/80 dark:text-white/80 font-medium bg-white/20 dark:bg-black/20 backdrop-blur px-4 py-2 rounded-full text-sm"
      >
        Query: <span class="font-bold">{{ searchQuery }}</span>
      </div>
    </div>

    <!-- Component Usage Info -->
    <div class="mt-8 space-y-4 text-black/80 dark:text-white/80">
      <div class="flex items-center gap-4">
        <div class="uppercase tracking-widest text-[10px] opacity-70 select-none">
          Component Usage
        </div>
        <div class="h-px flex-1 bg-black/10 dark:bg-white/10" />
      </div>

      <div class="bg-black/5 dark:bg-white/5 rounded-lg p-4 font-mono text-sm overflow-x-auto">
        <pre class="text-black/70 dark:text-white/70"><code>&lt;LiquidGlassSearchBar
  v-model="searchQuery"
  placeholder="Search"
  size="large"
/&gt;</code></pre>
      </div>

      <!-- Size Comparison -->
      <div class="mt-6">
        <div class="flex items-center gap-4 mb-4">
          <div class="uppercase tracking-widest text-[10px] opacity-70 select-none">
            Size Comparison
          </div>
          <div class="h-px flex-1 bg-black/10 dark:bg-white/10" />
        </div>
        
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <span class="w-16 text-xs uppercase opacity-60">Extra Small</span>
            <div class="flex-1">
              <LiquidGlassSearchBar v-model="searchQuery" placeholder="XS search bar" size="xs" />
            </div>
          </div>
          <div class="flex items-center gap-4">
            <span class="w-16 text-xs uppercase opacity-60">Small</span>
            <div class="flex-1">
              <LiquidGlassSearchBar v-model="searchQuery" placeholder="Small search bar" size="small" />
            </div>
          </div>
          <div class="flex items-center gap-4">
            <span class="w-16 text-xs uppercase opacity-60">Medium</span>
            <div class="flex-1">
              <LiquidGlassSearchBar v-model="searchQuery" placeholder="Medium search bar" size="medium" />
            </div>
          </div>
          <div class="flex items-center gap-4">
            <span class="w-16 text-xs uppercase opacity-60">Large</span>
            <div class="flex-1">
              <LiquidGlassSearchBar v-model="searchQuery" placeholder="Large search bar" size="large" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
