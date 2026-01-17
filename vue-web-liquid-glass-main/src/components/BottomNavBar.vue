<script setup lang="ts">
import { ref } from 'vue'
import LiquidGlassBottomNavBar from './LiquidGlassBottomNavBar.vue'

// Icons
const homeIcon = `<svg viewBox="0 0 24 24" fill="none" class="w-full h-full"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
const searchIcon = `<svg viewBox="0 0 24 24" fill="none" class="w-full h-full"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
const userIcon = `<svg viewBox="0 0 24 24" fill="none" class="w-full h-full"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
const settingsIcon = `<svg viewBox="0 0 24 24" fill="none" class="w-full h-full"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`

const navItems = [
  { id: 'home', label: 'Home', icon: homeIcon },
  { id: 'search', label: 'Search', icon: searchIcon },
  { id: 'profile', label: 'Profile', icon: userIcon },
  { id: 'settings', label: 'Settings', icon: settingsIcon },
]

const activeTab = ref('home')
const showBgImage = ref(true)
const alwaysShowGlass = ref(false)
</script>

<template>
  <div>
    <div class="mb-4 flex justify-end gap-4 px-4">
      <label class="flex items-center gap-2 text-sm font-medium text-black/60 dark:text-white/60 cursor-pointer select-none bg-black/5 dark:bg-white/10 px-3 py-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
        <input type="checkbox" v-model="alwaysShowGlass" class="accent-black dark:accent-white">
        Always Show Glass
      </label>
      <label class="flex items-center gap-2 text-sm font-medium text-black/60 dark:text-white/60 cursor-pointer select-none bg-black/5 dark:bg-white/10 px-3 py-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
        <input type="checkbox" v-model="showBgImage" class="accent-black dark:accent-white">
        Show Background Image
      </label>
    </div>

    <div
      class="relative h-130 flex flex-col justify-center items-center rounded-xl -ml-4 w-[calc(100%+32px)] select-none text-black/5 dark:text-white/5 border border-black/10 dark:border-white/10 overflow-hidden transition-all duration-500 ease-in-out"
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
      <div class="mb-8 text-black/80 dark:text-white/80 font-medium">
         Active: <span class="uppercase tracking-widest font-bold">{{ activeTab }}</span>
      </div>


      <!-- NavBar in center -->
      <LiquidGlassBottomNavBar v-model="activeTab" :items="navItems" size="small" :always-show-glass="alwaysShowGlass" />
      
      <div class="mt-8">
         <LiquidGlassBottomNavBar v-model="activeTab" :items="navItems" size="medium" :always-show-glass="alwaysShowGlass" />
      </div>
      
      <div class="mt-8">
         <LiquidGlassBottomNavBar v-model="activeTab" :items="navItems" size="large" :always-show-glass="alwaysShowGlass" />
      </div>

      <div class="mt-8">
         <LiquidGlassBottomNavBar v-model="activeTab" :items="navItems" size="XL" :always-show-glass="alwaysShowGlass" />
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
        <pre class="text-black/70 dark:text-white/70"><code>&lt;LiquidGlassBottomNavBar 
  v-model="activeTab" 
  :items="[
    { id: 'home', label: 'Home', icon: '...' },
    { id: 'search', label: 'Search', icon: '...' }
  ]"
  size="medium"
  :always-show-glass="true"
/&gt;</code></pre>
      </div>
    </div>
  </div>
</template>
