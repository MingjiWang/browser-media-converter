<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  calculateDisplacementMap,
  calculateDisplacementMapWithShape,
  type ShapeType,
} from '../lib/displacementMap'
import { getRayColorDimmed } from '../lib/rayColor'
import { CONVEX_CIRCLE, CONVEX, CONCAVE, LIP } from '../lib/surfaceEquations'

// Constants
const padding = 30
const width = 400
const height = 300
const usableWidth = width - padding * 2
const usableHeight = height - padding * 2
const refractiveIndex = 1.5

// Object dimensions
const objectWidth = ref(240)
const objectHeight = ref(180)

// Reactive inputs
const surface = ref<'convex_circle' | 'convex_squircle' | 'concave' | 'lip'>('convex_circle')
const shape = ref<ShapeType>('squircle')
const bezelWidth = ref(60)
const glassThickness = ref(50)
const scaleRatio = ref(1)
const cornerRadius = ref(0.5) // 0 = sharp, 1 = fully rounded
const squircleExponent = ref(4) // 2 = ellipse, 4+ = squircle
const aspectRatio = ref(1.33) // width / height ratio
const currentX = ref<number | null>(null)

// Update dimensions based on aspect ratio
watch(aspectRatio, (ratio) => {
  const baseSize = 160
  if (ratio >= 1) {
    objectWidth.value = Math.round(baseSize * ratio)
    objectHeight.value = baseSize
  } else {
    objectWidth.value = baseSize
    objectHeight.value = Math.round(baseSize / ratio)
  }
}, { immediate: true })

// Canvas ref
const canvasRef = ref<HTMLCanvasElement | null>(null)

// Surface options (bezel profile)
const surfaceOptions = [
  { id: 'convex_circle', label: 'Circle', icon: '○' },
  { id: 'convex_squircle', label: 'Squircle', icon: '▢' },
  { id: 'concave', label: 'Concave', icon: '◠' },
  { id: 'lip', label: 'Lip', icon: '◡' },
] as const

// Shape options (glass shape)
const shapeOptions = [
  { id: 'circle', label: 'Circle', icon: '●' },
  { id: 'squircle', label: 'Squircle', icon: '◼' },
  { id: 'rectangle', label: 'Rectangle', icon: '▬' },
  { id: 'pill', label: 'Pill', icon: '⬭' },
] as const

// Get surface function based on selection
const getSurfaceFn = () => {
  switch (surface.value) {
    case 'convex_circle': return CONVEX_CIRCLE.fn
    case 'convex_squircle': return CONVEX.fn
    case 'concave': return CONCAVE.fn
    case 'lip': return LIP.fn
  }
}

// Computed displacement data
const precomputedDisplacementMap = computed(() => 
  calculateDisplacementMap(
    glassThickness.value,
    bezelWidth.value,
    getSurfaceFn(),
    refractiveIndex,
    512
  )
)

const maximumDisplacement = computed(() => 
  Math.max(...precomputedDisplacementMap.value.map(Math.abs)) || 1
)

const imageData = computed(() => 
  calculateDisplacementMapWithShape(
    width,
    height,
    objectWidth.value,
    objectHeight.value,
    bezelWidth.value,
    maximumDisplacement.value,
    precomputedDisplacementMap.value,
    shape.value,
    cornerRadius.value,
    squircleExponent.value
  )
)

// SVG path for displacement chart
const pathData = computed(() => {
  const arr = precomputedDisplacementMap.value
  const max = maximumDisplacement.value
  return arr
    .map((d, i) => {
      const x = (i / arr.length) * usableWidth + padding
      const y = usableHeight / 2 - ((d / max) * usableHeight * 0.8) / 2 + padding
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')
})

// Current X position indicator
const currentXPos = computed(() => (currentX.value ?? 0) * usableWidth)

const y2Motion = computed(() => {
  const arr = precomputedDisplacementMap.value
  const v = currentX.value ?? 0
  const max = maximumDisplacement.value
  const idx = Math.min(arr.length - 1, Math.max(0, (v * arr.length) | 0))
  const d = arr[idx] ?? 0
  return usableHeight / 2 - (d / max) * (usableHeight / 2) * 0.8
})

const displacementColor = computed(() => {
  const arr = precomputedDisplacementMap.value
  const v = currentX.value
  if (v == null || v < 0 || v > 1) return 'transparent'
  const idx = Math.min(arr.length - 1, Math.max(0, (v * arr.length) | 0))
  const d = Math.abs(arr[idx] ?? 0)
  const max = maximumDisplacement.value
  return getRayColorDimmed(d / max)
})

const showIndicator = computed(() => {
  const v = currentX.value
  return v != null && v >= 0 && v <= 1
})

// Filter scale for preview
const filterScale = computed(() => maximumDisplacement.value * scaleRatio.value)

// Generate unique filter ID
const filterId = `playground-filter-${Math.random().toString(36).substr(2, 9)}`

// Data URL for displacement map
const displacementMapUrl = computed(() => {
  const data = imageData.value
  if (!data) return ''
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = data.width
  tempCanvas.height = data.height
  const tempCtx = tempCanvas.getContext('2d')
  if (!tempCtx) return ''
  tempCtx.putImageData(data, 0, 0)
  return tempCanvas.toDataURL()
})

// Update canvas when image data changes
watch(imageData, (data) => {
  const canvas = canvasRef.value
  if (!canvas || !data) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  canvas.width = data.width
  canvas.height = data.height
  ctx.putImageData(data, 0, 0)
}, { immediate: true })

// Pointer handlers for chart interaction
const handlePointerDown = (e: PointerEvent) => {
  const rect = (e.currentTarget as SVGElement).getBoundingClientRect()
  const xRatio = (e.clientX - rect.left - padding) / usableWidth
  currentX.value = Math.max(0, Math.min(1, xRatio))
  ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
}

const handlePointerMove = (e: PointerEvent) => {
  if (!(e.buttons & 1)) return
  const rect = (e.currentTarget as SVGElement).getBoundingClientRect()
  const xRatio = (e.clientX - rect.left - padding) / usableWidth
  currentX.value = Math.max(0, Math.min(1, xRatio))
}

// Panel styles
const panel = 'relative rounded-md border border-black/15 dark:border-white/15 bg-white dark:bg-zinc-900/60 overflow-hidden'
const heading = 'uppercase tracking-[0.15em] text-[9px] sm:text-[11px] leading-none text-black/50 dark:text-white/50'
</script>

<template>
  <div class="-ml-[18px] w-[calc(100%+36px)] text-black dark:text-white select-none">
    <!-- Top row: Surface & Shape selectors -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
      <!-- Surface Selector (Bezel Profile) -->
      <div :class="['flex flex-col', panel]">
        <h4 :class="['absolute px-2 pt-2 z-40', heading]">Bezel Profile</h4>
        <div class="p-4 pt-8 flex items-center justify-center gap-2 grow flex-wrap">
          <button
            v-for="opt in surfaceOptions"
            :key="opt.id"
            class="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-150 text-xs"
            :class="surface === opt.id 
              ? 'bg-black dark:bg-white text-white dark:text-black' 
              : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'"
            @click="surface = opt.id"
          >
            <span class="text-lg">{{ opt.icon }}</span>
            <span class="text-[9px] uppercase tracking-wide">{{ opt.label }}</span>
          </button>
        </div>
      </div>

      <!-- Shape Selector -->
      <div :class="['flex flex-col', panel]">
        <h4 :class="['absolute px-2 pt-2 z-40', heading]">Shape</h4>
        <div class="p-4 pt-8 flex items-center justify-center gap-2 grow flex-wrap">
          <button
            v-for="opt in shapeOptions"
            :key="opt.id"
            class="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-150 text-xs"
            :class="shape === opt.id 
              ? 'bg-black dark:bg-white text-white dark:text-black' 
              : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'"
            @click="shape = opt.id"
          >
            <span class="text-lg">{{ opt.icon }}</span>
            <span class="text-[9px] uppercase tracking-wide">{{ opt.label }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Controls Panel -->
    <div :class="['mt-1.5 sm:mt-2', panel]">
      <h4 :class="['px-2 pt-2 z-40', heading]">Controls</h4>
      <div class="text-xs grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 p-4 pt-3 items-center">
        <!-- Bezel Width -->
        <div class="flex items-center gap-2">
          <label class="w-24 opacity-80 text-right text-[10px]">Bezel Width</label>
          <input
            v-model.number="bezelWidth"
            type="range"
            min="10"
            max="100"
            step="1"
            class="flex-1 accent-sky-600 dark:accent-slate-400 h-0.5"
          >
          <span class="w-8 text-[10px] opacity-60 tabular-nums">{{ bezelWidth }}</span>
        </div>

        <!-- Glass Thickness -->
        <div class="flex items-center gap-2">
          <label class="w-24 opacity-80 text-right text-[10px]">Thickness</label>
          <input
            v-model.number="glassThickness"
            type="range"
            min="0"
            max="100"
            step="1"
            class="flex-1 accent-sky-600 dark:accent-slate-400 h-0.5"
          >
          <span class="w-8 text-[10px] opacity-60 tabular-nums">{{ glassThickness }}</span>
        </div>

        <!-- Scale Ratio -->
        <div class="flex items-center gap-2">
          <label class="w-24 opacity-80 text-right text-[10px]">Scale</label>
          <input
            v-model.number="scaleRatio"
            type="range"
            min="0"
            max="1"
            step="0.01"
            class="flex-1 accent-sky-600 dark:accent-slate-400 h-0.5"
          >
          <span class="w-8 text-[10px] opacity-60 tabular-nums">{{ scaleRatio.toFixed(2) }}</span>
        </div>

        <!-- Corner Radius -->
        <div class="flex items-center gap-2">
          <label class="w-24 opacity-80 text-right text-[10px]">Corner Radius</label>
          <input
            v-model.number="cornerRadius"
            type="range"
            min="0"
            max="1"
            step="0.01"
            class="flex-1 accent-sky-600 dark:accent-slate-400 h-0.5"
            :disabled="shape === 'circle' || shape === 'pill'"
          >
          <span class="w-8 text-[10px] opacity-60 tabular-nums">{{ cornerRadius.toFixed(2) }}</span>
        </div>

        <!-- Squircle Exponent -->
        <div class="flex items-center gap-2">
          <label class="w-24 opacity-80 text-right text-[10px]">Squircle Power</label>
          <input
            v-model.number="squircleExponent"
            type="range"
            min="2"
            max="10"
            step="0.5"
            class="flex-1 accent-sky-600 dark:accent-slate-400 h-0.5"
            :disabled="shape !== 'squircle'"
          >
          <span class="w-8 text-[10px] opacity-60 tabular-nums">{{ squircleExponent.toFixed(1) }}</span>
        </div>

        <!-- Aspect Ratio -->
        <div class="flex items-center gap-2">
          <label class="w-24 opacity-80 text-right text-[10px]">Aspect Ratio</label>
          <input
            v-model.number="aspectRatio"
            type="range"
            min="0.5"
            max="2"
            step="0.01"
            class="flex-1 accent-sky-600 dark:accent-slate-400 h-0.5"
          >
          <span class="w-8 text-[10px] opacity-60 tabular-nums">{{ aspectRatio.toFixed(2) }}</span>
        </div>
      </div>
    </div>

    <!-- Bottom row - 3 columns -->
    <div class="grid grid-cols-3 gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
      <!-- Displacement Map Image -->
      <div :class="panel">
        <h4 :class="['absolute px-2 pt-2 z-40', heading]">Displacement Map</h4>
        <div class="flex items-center justify-center h-full p-4 pt-8">
          <canvas
            ref="canvasRef"
            class="max-w-full max-h-full object-contain border border-black/10 dark:border-white/10 rounded"
            :style="{ imageRendering: 'pixelated' }"
          />
        </div>
      </div>

      <!-- Displacement Chart -->
      <div :class="panel">
        <h4 :class="['absolute px-2 pt-2 z-40', heading]">Radius Displacements</h4>
        <svg
          :viewBox="`0 0 ${width} ${height}`"
          class="w-full cursor-crosshair"
          @pointerdown="handlePointerDown"
          @pointermove="handlePointerMove"
        >
          <defs>
            <marker
              id="axisArrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="9"
              markerHeight="9"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
            </marker>
          </defs>

          <!-- Indicator line -->
          <line
            v-if="showIndicator"
            :x1="currentXPos + padding"
            :y1="usableHeight / 2 + padding"
            :x2="currentXPos + padding"
            :y2="y2Motion + padding"
            :stroke="displacementColor"
            stroke-width="2"
          />

          <!-- Path -->
          <path
            :d="pathData"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-opacity="0.6"
            stroke-linecap="round"
          />

          <!-- Center line -->
          <line
            :y1="usableHeight / 2 + padding"
            :y2="usableHeight / 2 + padding"
            :x1="padding"
            :x2="padding + usableWidth"
            stroke="currentColor"
            stroke-width="1"
            opacity="0.25"
            stroke-dasharray="4 1"
          />

          <!-- Y axis -->
          <line
            :x1="padding"
            :x2="padding"
            :y1="usableHeight + padding"
            :y2="padding"
            stroke="currentColor"
            opacity="0.25"
            stroke-width="1"
            marker-end="url(#axisArrow)"
          />
          <text
            x="6"
            y="7"
            alignment-baseline="middle"
            text-anchor="end"
            transform="rotate(-90 30 20)"
            fill="currentColor"
            opacity="0.5"
            class="text-[10px]"
          >
            Displacement
          </text>

          <!-- X axis -->
          <line
            :x1="padding"
            :x2="usableWidth + padding"
            :y1="usableHeight + padding"
            :y2="usableHeight + padding"
            stroke="currentColor"
            stroke-width="1"
            opacity="0.28"
            marker-end="url(#axisArrow)"
          />
          <text
            :x="usableWidth + padding - 10"
            :y="usableHeight + padding + 15"
            alignment-baseline="middle"
            text-anchor="end"
            fill="currentColor"
            opacity="0.5"
            class="text-[10px]"
          >
            Distance to border
          </text>
        </svg>
      </div>

      <!-- Preview -->
      <div :class="panel">
        <h4 :class="['absolute px-2 pt-2 z-40 text-white/70', heading]">Preview</h4>
        <svg
          class="object-cover w-full"
          :viewBox="`0 0 ${width} ${height}`"
          color-interpolation-filters="sRGB"
        >
          <defs>
            <filter :id="filterId" color-interpolation-filters="sRGB">
              <feImage
                :href="displacementMapUrl"
                x="0"
                y="0"
                :width="width"
                :height="height"
                result="displacement_map"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="displacement_map"
                :scale="filterScale"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>

            <pattern
              id="grid"
              :x="-15"
              :y="-15"
              width="30"
              height="30"
              patternUnits="userSpaceOnUse"
            >
              <animate
                attributeName="x"
                from="-15"
                to="15"
                dur="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="y"
                from="-15"
                to="15"
                dur="2s"
                repeatCount="indefinite"
              />
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="#D7E8E6"
                stroke-width="3"
                opacity="0.8"
              />
            </pattern>

            <linearGradient
              id="doubleGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stop-color="#4FBDBB" />
              <stop offset="50%" stop-color="#AFBDBB" />
              <stop offset="100%" stop-color="#DFBDBB" />
            </linearGradient>
          </defs>

          <g :filter="`url(#${filterId})`">
            <rect :width="width" :height="height" fill="url(#doubleGradient)" />
            <rect :width="width" :height="height" fill="url(#grid)" />
          </g>
        </svg>
      </div>
    </div>
  </div>
</template>
