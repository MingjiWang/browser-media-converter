<script setup lang="ts">
import { ref } from 'vue'
import LiquidGlassSwitch from './LiquidGlassSwitch.vue'

// Switch states for demo
const xsSwitch = ref(true)
const smallSwitch = ref(false)
const mediumSwitch = ref(true)
const largeSwitch = ref(true)

// Force active toggle
const forceActive = ref(false)
</script>

<template>
  <div>
    <div
      class="relative h-140 flex justify-center items-center rounded-xl -ml-4 w-[calc(100%+32px)] select-none text-black/5 dark:text-white/5 border border-black/10 dark:border-white/10"
      :style="{
        backgroundImage:
          'linear-gradient(to right, currentColor 1px, transparent 1px),' +
          'linear-gradient(to bottom, currentColor 1px, transparent 1px),' +
          'radial-gradient(120% 100% at 10% 0%, var(--bg1), var(--bg2))',
        backgroundSize: '24px 24px, 24px 24px, 100% 100%',
        backgroundPosition: '12px 12px, 12px 12px, 0 0',
      }"
    >
      <!-- Large switch in center -->
        <div class="flex flex-col items-center gap-8">
          <div class="flex flex-col items-center gap-2">
            <span class="text-xs uppercase text-white">XS</span>
            <LiquidGlassSwitch v-model="xsSwitch" size="xs" />
            <span class="text-[10px] text-white">{{ xsSwitch ? 'ON' : 'OFF' }}</span>
          </div>
          <div class="flex flex-col items-center gap-2">
            <span class="text-xs uppercase text-white">Small</span>
            <LiquidGlassSwitch v-model="smallSwitch" size="small" />
            <span class="text-[10px] text-white">{{ smallSwitch ? 'ON' : 'OFF' }}</span>
          </div>
          <div class="flex flex-col items-center gap-2">
            <span class="text-xs uppercase text-white">Medium</span>
            <LiquidGlassSwitch v-model="mediumSwitch" size="medium" />
            <span class="text-[10px] text-white">{{ mediumSwitch ? 'ON' : 'OFF' }}</span>
          </div>
          <div class="flex flex-col items-center gap-2">
            <span class="text-xs uppercase text-white">Large</span>
            <LiquidGlassSwitch v-model="largeSwitch" size="large" />
            <span class="text-[10px] text-white">{{ largeSwitch ? 'ON' : 'OFF' }}</span>
          </div>
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
        <pre class="text-black/70 dark:text-white/70"><code>
&lt;LiquidGlassSwitch v-model="isOn" size="large" /&gt;

&lt;!-- Sizes --&gt;
&lt;LiquidGlassSwitch v-model="value" size="xs" /&gt;
&lt;LiquidGlassSwitch v-model="value" size="small" /&gt;
&lt;LiquidGlassSwitch v-model="value" size="medium" /&gt;
&lt;LiquidGlassSwitch v-model="value" size="large" /&gt;

&lt;!-- Disabled --&gt;
&lt;LiquidGlassSwitch v-model="value" disabled /&gt;
        </code></pre>
      </div>

      <div class="text-sm text-black/60 dark:text-white/60 space-y-2">
        <p><strong>Props:</strong></p>
        <ul class="list-disc list-inside space-y-1 pl-2">
          <li><code class="bg-black/10 dark:bg-white/10 px-1 rounded">modelValue</code> - Boolean value (use with v-model)</li>
          <li><code class="bg-black/10 dark:bg-white/10 px-1 rounded">size</code> - "xs" | "small" | "medium" | "large" (default: "medium")</li>
          <li><code class="bg-black/10 dark:bg-white/10 px-1 rounded">disabled</code> - Disable interaction (default: false)</li>
        </ul>
        <p class="mt-3"><strong>Features:</strong></p>
        <ul class="list-disc list-inside space-y-1 pl-2">
          <li>Click to toggle</li>
          <li>Drag to slide between states</li>
          <li>Smooth spring animations</li>
          <li>Liquid glass refraction effect</li>
          <li>Green/gray background based on state</li>
        </ul>
      </div>
    </div>
  </div>
</template>
