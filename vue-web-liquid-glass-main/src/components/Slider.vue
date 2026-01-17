<script setup lang="ts">
import { ref } from 'vue'
import LiquidGlassSlider from './LiquidGlassSlider.vue'

// Values for each slider size
const smallValue = ref(30)
const mediumValue = ref(50)
const largeValue = ref(70)
const fullWidthValue = ref(40)
</script>

<template>
  <div>
    <div
      class="relative rounded-xl -ml-4 w-[calc(100%+32px)] select-none text-black/5 dark:text-white/5 border border-black/10 dark:border-white/10 py-12 px-8"
      :style="{
        backgroundImage:
          'linear-gradient(to right, currentColor 1px, transparent 1px),' +
          'linear-gradient(to bottom, currentColor 1px, transparent 1px),' +
          'radial-gradient(120% 100% at 10% 0%, var(--bg1), var(--bg2))',
        backgroundSize: '24px 24px, 24px 24px, 100% 100%',
        backgroundPosition: '12px 12px, 12px 12px, 0 0',
      }"
    >
      <!-- Sliders showcase -->
      <div class="flex flex-col items-center gap-10">
        <!-- Full Width Slider -->
        <div class="flex flex-col gap-2 w-full">
          <div class="flex justify-between items-center">
            <span class="text-xs uppercase tracking-widest text-black/50 dark:text-white/50 font-medium">
              Full Width (Large)
            </span>
            <span class="text-xs font-mono text-black/60 dark:text-white/60">
              {{ fullWidthValue.toFixed(0) }}
            </span>
          </div>
          <LiquidGlassSlider v-model="fullWidthValue" size="large" />
        </div>

        <!-- Medium Width Container -->
        <div class="flex flex-col gap-2 w-full">
          <div class="flex justify-between items-center">
            <span class="text-xs uppercase tracking-widest text-black/50 dark:text-white/50 font-medium">
              Medium Container (Medium)
            </span>
            <span class="text-xs font-mono text-black/60 dark:text-white/60">
              {{ mediumValue.toFixed(0) }}
            </span>
          </div>
          <LiquidGlassSlider v-model="mediumValue" size="medium" />
        </div>

        <!-- Small Width Container -->
        <div class="flex flex-col gap-2 w-full">
          <div class="flex justify-between items-center">
            <span class="text-xs uppercase tracking-widest text-black/50 dark:text-white/50 font-medium">
              Small Container (Small)
            </span>
            <span class="text-xs font-mono text-black/60 dark:text-white/60">
              {{ smallValue.toFixed(0) }}
            </span>
          </div>
          <LiquidGlassSlider v-model="smallValue" size="small" />
        </div>
      </div>
    </div>

    <!-- Usage Info -->
    <div class="mt-8 space-y-4 text-black/80 dark:text-white/80">
      <div class="flex items-center gap-4">
        <div class="uppercase tracking-widest text-[10px] opacity-70 select-none">
          Component Usage
        </div>
        <div class="h-px flex-1 bg-black/10 dark:bg-white/10" />
      </div>

      <div class="bg-black/5 dark:bg-white/5 rounded-lg p-4 font-mono text-sm overflow-x-auto">
        <pre class="text-black/70 dark:text-white/70"><code>&lt;!-- Fills container width automatically --&gt;
&lt;div class="w-full"&gt;
  &lt;LiquidGlassSlider v-model="value" size="large" /&gt;
&lt;/div&gt;

&lt;!-- Fixed width container --&gt;
&lt;div class="w-[400px]"&gt;
  &lt;LiquidGlassSlider v-model="value" size="medium" /&gt;
&lt;/div&gt;

&lt;!-- With custom range --&gt;
&lt;LiquidGlassSlider v-model="volume" :min="0" :max="100" /&gt;

&lt;!-- Disabled state --&gt;
&lt;LiquidGlassSlider v-model="value" disabled /&gt;</code></pre>
      </div>

      <div class="text-sm text-black/60 dark:text-white/60 space-y-2">
        <p><strong>Props:</strong></p>
        <ul class="list-disc list-inside space-y-1 pl-2">
          <li><code class="bg-black/10 dark:bg-white/10 px-1 rounded">modelValue</code> - Number value (use with v-model)</li>
          <li><code class="bg-black/10 dark:bg-white/10 px-1 rounded">size</code> - "small" | "medium" | "large" (controls thumb size)</li>
          <li><code class="bg-black/10 dark:bg-white/10 px-1 rounded">min</code> - Minimum value (default: 0)</li>
          <li><code class="bg-black/10 dark:bg-white/10 px-1 rounded">max</code> - Maximum value (default: 100)</li>
          <li><code class="bg-black/10 dark:bg-white/10 px-1 rounded">disabled</code> - Disable interaction (default: false)</li>
        </ul>
        <p class="mt-3"><strong>Note:</strong> The slider automatically fills its container width. The <code class="bg-black/10 dark:bg-white/10 px-1 rounded">size</code> prop controls the thumb dimensions, not the track width.</p>
      </div>
    </div>
  </div>
</template>
