<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import LiquidGlassContainer from './components/LiquidGlassContainer.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Dark mode detection - applies .dark class to <html> element
const isDark = ref(false)
const applyDarkMode = (dark: boolean) => {
  isDark.value = dark
  if (dark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

let mediaQuery: MediaQueryList

onMounted(() => {
  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  applyDarkMode(mediaQuery.matches)
  mediaQuery.addEventListener('change', (e) => applyDarkMode(e.matches))
})

onUnmounted(() => {
  mediaQuery?.removeEventListener('change', (e: MediaQueryListEvent) => applyDarkMode(e.matches))
})

const navItems = [
  { id: 'container', label: 'Container', path: '/container' },
  { id: 'navbar', label: 'Bottom NavBar', path: '/navbar' },
  { id: 'searchbox', label: 'Searchbox', path: '/searchbox' },
  { id: 'switch', label: 'Switch Control', path: '/switch' },
  { id: 'slider', label: 'Slider', path: '/slider' },
]
</script>

<template>
  <div 
    class="flex h-screen w-full overflow-hidden bg-white text-black dark:bg-[#050505] dark:text-white"
    :style="{
      backgroundImage: `linear-gradient(to right, ${isDark ? '#ffffff10' : '#00000008'} 1px, transparent 1px),
                        linear-gradient(to bottom, ${isDark ? '#ffffff10' : '#00000008'} 1px, transparent 1px)`,
      backgroundSize: '24px 24px'
    }"
  >
    <!-- Sidebar -->
    <div class="flex h-screen w-[300px] p-4 shrink-0">
    <LiquidGlassContainer>
      <template #content>
        <div class="flex flex-col h-full">
          <!-- Header -->
          <div class="px-6 py-8">
            <router-link to="/" class="block">
              <h1 class="mb-1 text-2xl font-bold tracking-tight cursor-pointer hover:opacity-80 transition-opacity">
                Liquid Glass
                <span class="text-black/40 dark:text-white/40">Vue</span>
              </h1>
            </router-link>
            <p class="text-xs font-medium text-black/40 dark:text-white/40">
              v1.0.0 · Vue 3 Recreation
            </p>
          </div>

          <!-- Navigation -->
          <nav class="flex-1 overflow-y-auto px-4 py-2 space-y-8">

            <div class="space-y-2">
              <h3 class="px-2 text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40">
                Components
              </h3>
              <div class="space-y-1">
                <router-link
                  v-for="item in navItems" 
                  :key="item.id"
                  :to="item.path"
                  custom
                  v-slot="{ href, navigate, isActive }"
                >
                  <a
                    :href="href"
                    @click="navigate"
                    class="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200"
                    :class="isActive 
                      ? 'bg-black text-white shadow-lg dark:bg-white dark:text-black' 
                      : 'text-black/60 hover:bg-black/5 hover:text-black dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white'"
                  >
                    {{ item.label }}
                  </a>
                </router-link>
              </div>
            </div>

          </nav>

          <!-- Footer / Meta -->
          <div class="border-t border-black/5 p-6 dark:border-white/5 mt-auto">
            <div class="flex items-center gap-3">
              <div class="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500"></div>
              <div class="text-xs">
                <div class="font-medium">Mohamed Khaled</div>
                <div class="text-black/40 dark:text-white/40">Liquid Glass System</div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </LiquidGlassContainer>
    </div>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto scroll-smooth">
      <div class="mx-auto max-w-6xl px-12 py-12">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>

        <footer
          class="mt-24 border-t border-black/5 pt-12 text-sm text-black/40 dark:border-white/5 dark:text-white/40">
          <p>Designed with physics-based interactions and SVG filters.</p>
        </footer>
      </div>
    </main>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
