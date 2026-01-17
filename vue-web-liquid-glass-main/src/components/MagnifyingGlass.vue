<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import Filter from './Filter.vue'

const containerRef = ref<HTMLDivElement | null>(null)
const isDragging = ref(false)
const velocityX = ref(0)

// Lens geometry
const width = 400
const height = 600
const radius = height / 2

// Controls
const specularOpacity = ref(0)
const specularSaturation = ref(0)
const refractionBase = ref(1)

// Spring-animated values (simulated with CSS transitions + computed)
const targetRefractionLevel = computed(() => refractionBase.value * (isDragging.value ? 1 : 0.8))
const targetMagnifyingScale = computed(() => isDragging.value ? 48 : 24)
const targetObjectScale = computed(() => isDragging.value ? 1 : 0.8)

// Smoothed values for wobble effect
const smoothedVelocityX = ref(0)
const smoothedScaleX = ref(50)
const smoothedScaleY = ref(50)
const smoothedRefractionLevel = ref(50)
const smoothedMagnifyingScale = ref(24)

// Shadow values
const smoothedShadowSx = ref(0)
const smoothedShadowSy = ref(4)
const smoothedShadowAlpha = ref(0.16)
const smoothedInsetShadowAlpha = ref(0.2)
const smoothedShadowBlur = ref(9)

// Animation loop for smooth springs
let animationFrame: number | null = null
let lastTime = 0

const lerp = (current: number, target: number, factor: number) => 
  current + (target - current) * factor

const springLerp = (current: number, target: number, stiffness: number, damping: number, dt: number) => {
  const factor = 1 - Math.exp(-stiffness * dt / damping)
  return lerp(current, target, factor)
}

const animate = (time: number) => {
  const dt = Math.min((time - lastTime) / 1000, 0.05) // Cap delta time
  lastTime = time

  // Smooth velocity decay
  smoothedVelocityX.value = lerp(smoothedVelocityX.value, velocityX.value, 0.3)
  
  // Calculate wobble based on velocity
  const wobbleFactor = Math.max(0.7, 1 - Math.abs(smoothedVelocityX.value) / 3000)
  
  // Target scales with wobble
  const targetScaleY = targetObjectScale.value * wobbleFactor
  const targetScaleX = targetObjectScale.value + (1 - targetScaleY)
  
  // Spring-like interpolation for scales (stiffness: 340, damping: 20)
  smoothedScaleX.value = springLerp(smoothedScaleX.value, targetScaleX, 340, 20, dt)
  smoothedScaleY.value = springLerp(smoothedScaleY.value, targetScaleY, 340, 20, dt)
  
  // Spring for refraction (stiffness: 250, damping: 14)
  smoothedRefractionLevel.value = springLerp(smoothedRefractionLevel.value, targetRefractionLevel.value, 250, 14, dt)
  smoothedMagnifyingScale.value = springLerp(smoothedMagnifyingScale.value, targetMagnifyingScale.value, 250, 14, dt)
  
  // Shadow springs (stiffness: 340, damping: 30)
  const targetShadowSx = isDragging.value ? 4 : 0
  const targetShadowSy = isDragging.value ? 16 : 4
  const targetShadowAlpha = isDragging.value ? 0.22 : 0.16
  const targetInsetShadowAlpha = isDragging.value ? 0.27 : 0.2
  const targetShadowBlur = isDragging.value ? 24 : 9
  
  smoothedShadowSx.value = springLerp(smoothedShadowSx.value, targetShadowSx, 340, 30, dt)
  smoothedShadowSy.value = springLerp(smoothedShadowSy.value, targetShadowSy, 340, 30, dt)
  smoothedShadowAlpha.value = springLerp(smoothedShadowAlpha.value, targetShadowAlpha, 220, 24, dt)
  smoothedInsetShadowAlpha.value = springLerp(smoothedInsetShadowAlpha.value, targetInsetShadowAlpha, 220, 24, dt)
  smoothedShadowBlur.value = springLerp(smoothedShadowBlur.value, targetShadowBlur, 340, 30, dt)
  
  animationFrame = requestAnimationFrame(animate)
}

// Box shadow computed from smoothed values
const boxShadow = computed(() => {
  const sx = smoothedShadowSx.value
  const sy = smoothedShadowSy.value
  const blur = smoothedShadowBlur.value
  const alpha = smoothedShadowAlpha.value
  const insetAlpha = smoothedInsetShadowAlpha.value
  
  return `${sx}px ${sy}px ${blur}px rgba(0,0,0,${alpha}),
   inset ${sx / 2}px ${sy / 2}px 24px rgba(0,0,0,${insetAlpha}),
   inset ${-sx / 2}px ${-sy / 2}px 24px rgba(255,255,255,${insetAlpha})`
})

// Drag position
const posX = ref(24)
const posY = ref(24)

// Drag handling
let dragStartX = 0
let dragStartY = 0
let dragStartPosX = 0
let dragStartPosY = 0
let lastClientX = 0

const handlePointerDown = (e: PointerEvent) => {
  isDragging.value = true
  dragStartX = e.clientX
  dragStartY = e.clientY
  dragStartPosX = posX.value
  dragStartPosY = posY.value
  lastClientX = e.clientX
  ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
}

const handlePointerMove = (e: PointerEvent) => {
  if (!isDragging.value) return
  
  const container = containerRef.value
  if (!container) return
  
  const rect = container.getBoundingClientRect()
  const deltaX = e.clientX - dragStartX
  const deltaY = e.clientY - dragStartY
  
  // Calculate velocity for wobble
  velocityX.value = (e.clientX - lastClientX) * 16 // Scale up for visible effect
  lastClientX = e.clientX
  
  // Elastic drag effect at boundaries
  let newX = dragStartPosX + deltaX
  let newY = dragStartPosY + deltaY
  
  // Add elastic effect when dragging past bounds
  const minX = 0
  const maxX = rect.width - width
  const minY = 0
  const maxY = rect.height - height
  
  if (newX < minX) {
    newX = minX + (newX - minX) * 0.13
  } else if (newX > maxX) {
    newX = maxX + (newX - maxX) * 0.13
  }
  
  if (newY < minY) {
    newY = minY + (newY - minY) * 0.13
  } else if (newY > maxY) {
    newY = maxY + (newY - maxY) * 0.13
  }
  
  posX.value = newX
  posY.value = newY
}

const handlePointerUp = () => {
  if (!isDragging.value) return
  
  isDragging.value = false
  velocityX.value = 0
  
  // Snap back to bounds if overflowed
  const container = containerRef.value
  if (container) {
    const rect = container.getBoundingClientRect()
    posX.value = Math.max(0, Math.min(rect.width - width, posX.value))
    posY.value = Math.max(0, Math.min(rect.height - height, posY.value))
  }
}

// Global pointer up handler
onMounted(() => {
  window.addEventListener('pointerup', handlePointerUp)
  window.addEventListener('mouseup', handlePointerUp)
  window.addEventListener('touchend', handlePointerUp)
  
  // Start animation loop
  lastTime = performance.now()
  animationFrame = requestAnimationFrame(animate)
})

onUnmounted(() => {
  window.removeEventListener('pointerup', handlePointerUp)
  window.removeEventListener('mouseup', handlePointerUp)
  window.removeEventListener('touchend', handlePointerUp)
  
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})
</script>

<template>
  <div>
    <div
      ref="containerRef"
      class="relative h-[440px] sm:h-[460px] rounded-xl -ml-4 w-[calc(100%+32px)] border border-black/10 dark:border-white/10 overflow-hidden select-none bg-white dark:bg-black"
    >
      <!-- Background content: left text, right image -->
      <div class="absolute inset-0 grid grid-cols-1 sm:grid-cols-[1fr_46%] gap-6 sm:gap-10 p-6 sm:p-10">
        <div class="flex flex-col justify-center">
          <div class="flex items-center gap-3 text-red-600 dark:text-red-500">
            <span class="h-0.5 w-10 bg-current" />
            <span class="uppercase tracking-[0.25em] text-[11px] font-medium">
              Optics Study
            </span>
          </div>
          <h3 class="mt-4 text-[36px] sm:text-[54px] leading-[0.95] font-extrabold tracking-tight text-black dark:text-white">
            Liquid&nbsp;Glass
            <span class="text-black/40 dark:text-white/40">—</span>
            Precision&nbsp;Lens
          </h3>
          <div class="mt-4 max-w-[60ch] text-[15px] sm:text-base leading-relaxed text-black/70 dark:text-white/70 space-y-3">
            <p>
              Drag the capsule to bend the page. This lens is a compact SVG
              displacement rig that refracts whatever sits beneath it.
            </p>
            <p>
              The field comes from a rounded bezel profile; pixels are pushed
              along its gradient, then topped with a subtle specular bloom for
              depth.
            </p>
            <p class="text-black/60 dark:text-white/60">
              Sweep across strong edges—high contrast makes the bend snap.
            </p>
          </div>
        </div>
        <div class="relative hidden sm:block rounded-lg overflow-hidden ring-1 ring-black/10 dark:ring-white/10">
          <img
            src="https://images.unsplash.com/photo-1651784627380-58168977f4f9?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Abstract architectural lines"
            loading="lazy"
            class="absolute inset-0 w-full h-full object-cover"
            draggable="false"
          >
        </div>
        <!-- Discrete credit under photo -->
        <div class="absolute right-3 bottom-1.5 hidden sm:block mt-1 text-right">
          <a
            href="https://images.unsplash.com/photo-1651784627380-58168977f4f9?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-block text-[9px] uppercase tracking-wider text-black/40 dark:text-white/40 hover:text-black/60 dark:hover:text-white/60 transition-colors"
          >
            Photo: Stephanie LeBlanc / Unsplash
          </a>
        </div>
      </div>

      <!-- Draggable circular lens -->
      <div
        class="absolute z-10 cursor-grab active:cursor-grabbing"
        :style="{
          width: `${width}px`,
          height: `${height}px`,
          borderRadius: `${radius}px`,
          left: `${posX}px`,
          top: `${posY}px`,
          transform: `scaleX(${smoothedScaleX}) scaleY(${smoothedScaleY})`,
        }"
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="handlePointerUp"
      >
        <!-- SVG filter definition for the lens -->
        <Filter
          id="magnifying-glass-filter"
          :width="width"
          :height="height"
          :radius="radius"
          :bezel-width="25"
          :glass-thickness="110"
          :refractive-index="1.5"
          bezel-type="convex_squircle"
          shape="pill"
          :blur="2"
          :scale-ratio="smoothedRefractionLevel"
          :specular-opacity="specularOpacity"
          :specular-saturation="specularSaturation"
          :magnify="true"
          :magnifying-scale="smoothedMagnifyingScale"
        />

        <!-- The glass layer using the filter as a backdrop -->
        <div
          class="absolute inset-0 ring-1 ring-black/10 dark:ring-white/10"
          :style="{
            borderRadius: `${radius}px`,
            backdropFilter: 'url(#magnifying-glass-filter)',
            boxShadow,
          }"
        />
      </div>
    </div>

    <!-- Parameters controls -->
    <div class="mt-8 space-y-3 text-black/80 dark:text-white/80">
      <div class="flex items-center gap-4">
        <div class="uppercase tracking-widest text-[10px] opacity-70 select-none">
          Parameters
        </div>
        <div class="h-px flex-1 bg-black/10 dark:bg-white/10" />
      </div>

      <!-- Specular Opacity -->
      <div class="flex items-center gap-4">
        <label class="w-56 uppercase tracking-wider text-[11px] opacity-80 select-none">
          Specular Opacity
        </label>
        <span class="w-14 text-right font-mono tabular-nums text-[11px] text-black/60 dark:text-white/60">
          {{ specularOpacity.toFixed(2) }}
        </span>
        <input
          v-model.number="specularOpacity"
          type="range"
          min="0"
          max="1"
          step="0.01"
          class="flex-1 appearance-none h-0.5 bg-black/20 dark:bg-white/20 rounded outline-none"
          aria-label="Specular Opacity"
        >
      </div>

      <!-- Specular Saturation -->
      <div class="flex items-center gap-4">
        <label class="w-56 uppercase tracking-wider text-[11px] opacity-80 select-none">
          Specular Saturation
        </label>
        <span class="w-14 text-right font-mono tabular-nums text-[11px] text-black/60 dark:text-white/60">
          {{ Math.round(specularSaturation) }}
        </span>
        <input
          v-model.number="specularSaturation"
          type="range"
          min="0"
          max="50"
          step="1"
          class="flex-1 appearance-none h-0.5 bg-black/20 dark:bg-white/20 rounded outline-none"
          aria-label="Specular Saturation"
        >
      </div>

      <!-- Refraction Level -->
      <div class="flex items-center gap-4">
        <label class="w-56 uppercase tracking-wider text-[11px] opacity-80 select-none">
          Refraction Level
        </label>
        <span class="w-14 text-right font-mono tabular-nums text-[11px] text-black/60 dark:text-white/60">
          {{ refractionBase.toFixed(2) }}
        </span>
        <input
          v-model.number="refractionBase"
          type="range"
          min="0"
          max="1"
          step="0.01"
          class="flex-1 appearance-none h-0.5 bg-black/20 dark:bg-white/20 rounded outline-none"
          aria-label="Refraction Level"
        >
      </div>
    </div>
  </div>
</template>
