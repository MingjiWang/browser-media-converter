<script setup lang="ts">
import { ref, computed } from 'vue'
import LiquidGlassContainer from './LiquidGlassContainer.vue'

// Search query
const searchQuery = ref('')

// Background toggle
const useImageBg = ref(false)

const containerStyle = computed(() => {
  if (useImageBg.value) {
    return {
      backgroundImage: 'url("https://images.unsplash.com/photo-1651784627380-58168977f4f9?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }
  return {
    backgroundImage:
      'linear-gradient(to right, currentColor 1px, transparent 1px),' +
      'linear-gradient(to bottom, currentColor 1px, transparent 1px),' +
      'radial-gradient(120% 100% at 10% 0%, var(--bg1), var(--bg2))',
    backgroundSize: '24px 24px, 24px 24px, 100% 100%',
    backgroundPosition: '12px 12px, 12px 12px, 0 0',
  }
})
</script>

<template>
  <div>
    <div
      class="relative h-96 flex justify-center items-center rounded-xl -ml-4 w-[calc(100%+32px)] select-none text-black/5 dark:text-white/5 border border-black/10 dark:border-white/10"
      :class="{ 'animate-bg-pan': useImageBg }"
      :style="containerStyle"
    >
      <!-- Photo credit -->
      <a
        v-if="useImageBg"
        href="https://unsplash.com/@visaxslr"
        target="_blank"
        rel="noopener noreferrer"
        class="absolute left-3 top-3 inline-block text-[9px] uppercase tracking-wider"
        style="color: rgba(255, 255, 255, 0.4)"
      >
        Photo by @visaxslr<br>on Unsplash
      </a>

      <!-- Search Bar using reusable component -->
      <!-- Search Bar using reusable component -->
      <div class="w-full h-full flex flex-col justify-center px-8 z-10">
          <div class="grid grid-cols-2 h-64 items-center gap-6 overflow-x-hidden overflow-y-auto">
            <div class="h-full">
              <LiquidGlassContainer placeholder="Large search bar" size="regular">
                <template #content>
                  <div class="flex h-full flex-col text-white p-2">
                    <h3 class="text-lg font-bold">Glass Card</h3>
                    <p class="text-sm opacity-80">This container now fills the full height of its parent.</p>
                    <p class="text-sm opacity-80">This container now fills the full height of its parent.</p>
                    <p class="text-sm opacity-80">This container now fills the full height of its parent.</p>
                    <div 
                      class="h-18 w-full bg-[#000000ab] p-3 flex items-center justify-between rounded-3xl mt-4"
                      style="border: 1px solid #1f1f1f;"
                    >
                      <div class="h-12 w-12 bg-[#1f1f1fab] rounded-xl"/>
                      <div class="h-12 w-12 bg-[#1f1f1fab] rounded-xl"/>
                      <div class="h-12 w-12 bg-[#1f1f1fab] rounded-xl"/>
                      <div class="h-12 w-12 bg-[#1f1f1fab] rounded-xl"/>
                      <div class="h-12 w-12 bg-[#1f1f1fab] rounded-xl"/>
                    </div>
                  </div>
                </template>
              </LiquidGlassContainer>
            </div>
            <div class="h-full">
              <LiquidGlassContainer placeholder="Large search bar" size="regular">
                <template #content>
                  <div class="flex h-full items-center justify-center text-white">
                    <span class="text-2xl font-bold">Centered Content</span>
                  </div>
                </template>
              </LiquidGlassContainer>
            </div>
          </div>
      </div>

      <!-- Toggle control -->
      <label
        class="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs backdrop-blur px-2 py-1 rounded-md flex items-center gap-2 z-20"
        :class="useImageBg
          ? 'text-white/90 bg-black/10'
          : 'text-black/90 dark:text-white/90 bg-white/10 dark:bg-black/10'"
      >
        <input
          v-model="useImageBg"
          type="checkbox"
          class="accent-blue-600"
        >
        Use image background
      </label>
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
        <pre class="text-black/70 dark:text-white/70">
<code>&lt;LiquidGlassContainer&gt;
  &lt;template #content&gt;
    &lt;div&gt;
     &lt;!-- Your content here --&gt;
    &lt;/div&gt;
  &lt;/template&gt;
&lt;LiquidGlassContainer/&gt;</code></pre>
      </div>

      <div class="text-sm text-black/60 dark:text-white/60 space-y-2">
        <p><strong>Props:</strong></p>
        <ul class="list-disc list-inside space-y-1 pl-2">
          <li><code class="bg-black/10 dark:bg-white/10 px-1 rounded">modelValue</code> - Search text (use with v-model)</li>
          <li><code class="bg-black/10 dark:bg-white/10 px-1 rounded">placeholder</code> - Placeholder text (default: "Search...")</li>
          <li><code class="bg-black/10 dark:bg-white/10 px-1 rounded">size</code> - "small" | "medium" | "large"</li>
          <li><code class="bg-black/10 dark:bg-white/10 px-1 rounded">disabled</code> - Disable input (default: false)</li>
        </ul>
        <p class="mt-3"><strong>Features:</strong></p>
        <ul class="list-disc list-inside space-y-1 pl-2">
          <li>Responsive width - fills container automatically</li>
          <li>Adaptive displacement map - regenerates on resize</li>
          <li>Interactive scale effects on focus/click</li>
          <li>Full dark mode support</li>
        </ul>
      </div>
    </div>
  </div>
</template>
