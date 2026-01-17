<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import Filter from './Filter.vue'

// Props
const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  size?: 'xs' | 'small' | 'medium' | 'large'
  disabled?: boolean
}>(), {
  modelValue: '',
  placeholder: 'Search...',
  size: 'medium',
  disabled: false,
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'focus': []
  'blur': []
}>()

// Size presets
const sizePresets = {
  xs: {
    height: 32,
    orbSize: 24,
    radius: 16,
    iconSize: 14,
    fontSize: 12,
    gap: 6,
    bezelWidth: 8,
    glassThickness: 40,
    translateX: 20,
  },
  small: {
    height: 40,
    orbSize: 32,
    radius: 20,
    iconSize: 16,
    fontSize: 13,
    gap: 8,
    bezelWidth: 12,
    glassThickness: 60,
    translateX: 25,
  },
  medium: {
    height: 52,
    orbSize: 42,
    radius: 26,
    iconSize: 20,
    fontSize: 15,
    gap: 12,
    bezelWidth: 12,
    glassThickness: 80,
    translateX: 31,
  },
  large: {
    height: 64,
    orbSize: 52,
    radius: 32,
    iconSize: 24,
    fontSize: 17,
    gap: 16,
    bezelWidth: 20,
    glassThickness: 100,
    translateX: 37,
  },
}

// Container ref
const containerRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const inputContainerRef = ref<HTMLElement | null>(null)

// Computed dimensions
const dimensions = computed(() => sizePresets[props.size])
const height = computed(() => dimensions.value.height)
const orbSize = computed(() => dimensions.value.orbSize)
const radius = computed(() => dimensions.value.radius)
const iconSize = computed(() => dimensions.value.iconSize)
const gap = computed(() => dimensions.value.gap)
const fontSize = computed(() => dimensions.value.fontSize)

// Unique IDs for filters
const orbFilterId = `liquid-glass-orb-${Math.random().toString(36).substr(2, 9)}`
const inputFilterId = `liquid-glass-input-${Math.random().toString(36).substr(2, 9)}`

// State
const query = computed({
  get: () => props.modelValue,
  set: (val: string) => emit('update:modelValue', val)
})

const focused = ref(false)
const inputWidth = ref(100)
// Resize observer tracking
let resizeObserver: ResizeObserver | null = null

// Animation State
const hasQuery = computed(() => !!query.value)
const isExpanded = computed(() => focused.value || hasQuery.value)

// Transition Lock to prevent lag
const isTransitioning = ref(false)
let transitionTimeout: ReturnType<typeof setTimeout> | null = null

// When expansion state changes, lock updates for duration of CSS transition
watch(isExpanded, () => {
    isTransitioning.value = true
    if (transitionTimeout) clearTimeout(transitionTimeout)
    transitionTimeout = setTimeout(() => {
        isTransitioning.value = false
        // Force update after transition
        if (inputContainerRef.value) {
            inputWidth.value = inputContainerRef.value.offsetWidth
        }
    }, 550) // slightly longer than CSS transition (500ms)
})

// Visual constants
const ORB_REST_SCALE = 0.5
const ORB_ACTIVE_SCALE = 1.3

// Show close orb only when there is a query
const showCloseOrb = computed(() => hasQuery.value)
const orbScale = computed(() => showCloseOrb.value ? ORB_ACTIVE_SCALE : ORB_REST_SCALE)
const orbOpacity = computed(() => showCloseOrb.value ? 1 : 0)

// Setup resize observer for the input part
const setupResizeObserver = () => {
    if(!inputContainerRef.value) return
    resizeObserver = new ResizeObserver((entries) => {
        // If transitioning, DO NOT update filter width to avoid heavy regen
        if (isTransitioning.value) return
        
        for(const entry of entries) {
            inputWidth.value = entry.contentRect.width
        }
    })
    resizeObserver.observe(inputContainerRef.value)
    inputWidth.value = inputContainerRef.value.offsetWidth
}

onMounted(() => {
    nextTick(setupResizeObserver)
})

onUnmounted(() => {
    resizeObserver?.disconnect()
})

const handleFocus = () => {
    focused.value = true
    emit('focus')
}

const handleBlur = () => {
    focused.value = false
    emit('blur')
}

const clearSearch = () => {
    if (!props.disabled) {
        query.value = ''
        inputRef.value?.focus()
    }
}

defineExpose({ focus: () => inputRef.value?.focus() })

</script>

<template>
  <div 
    class="relative flex items-center select-none w-full"
    :style="{ height: `${height}px` }"
  >
    <!-- 1. The Fluid Input Field (Main Element) -->
    <!-- Takes full width always, no layout thrashing -->
    <div 
        ref="inputContainerRef"
        class="absolute inset-0 transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
        style="z-index: 10;"
        :style="{
            transform: isExpanded ? `scale(1.02) translateX(${showCloseOrb ? -dimensions.translateX : 0}px)` : 'scale(1)',
            transformOrigin: 'center center'
        }"
    >
       <!-- Input Filter -->
       <Filter
            :id="inputFilterId"
            :width="inputWidth"
            :height="height"
            :radius="radius"
            :bezel-width="dimensions.bezelWidth"
            :glass-thickness="dimensions.glassThickness"
            :refractive-index="1.4"
            bezel-type="convex_squircle"
            shape="pill"
            :blur="1"
            :scale-ratio="0.4"
            :specular-opacity="0.4"
            :specular-saturation="8"
        />

        <!-- Input Glass Body -->
        <div
            class="absolute inset-0 z-0 transition-all duration-300"
            :style="{
                borderRadius: `${radius}px`,
                backdropFilter: `url(#${inputFilterId})`,
                backgroundColor: 'rgba(255,255,255,0.05)',
                boxShadow: isExpanded ? '0 4px 24px rgba(0,0,0,0.1)' : '0 2px 10px rgba(0,0,0,0.05)',
            }"
        ></div>

        <!-- Content Container -->
        <div class="absolute inset-0 z-10 flex items-center" :style="{ paddingLeft: `${radius * 0.8}px` }">
             <!-- Search Icon (Inside Input) -->
             <svg
                class="shrink-0 transition-colors duration-300"
                :class="isExpanded ? 'text-black dark:text-white' : 'text-black/50 dark:text-white/50'"
                :style="{ width: `${iconSize}px`, height: `${iconSize}px`, marginRight: `${gap}px` }"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
            </svg>

            <!-- Input Element -->
            <input 
                ref="inputRef"
                v-model="query"
                type="text"
                :placeholder="placeholder"
                :disabled="disabled"
                class="flex-1 w-full h-full bg-transparent border-none outline-none text-black/90 dark:text-white/90 placeholder-black/40 dark:placeholder-white/40 font-medium transition-[padding] duration-300"
                :style="{
                    fontSize: `${fontSize}px`,
                    paddingRight: showCloseOrb ? `${orbSize + gap}px` : `${radius}px`
                }"
                @focus="handleFocus"
                @blur="handleBlur"
            />
        </div>
    </div>

    <!-- 2. The Glass Orb (Close Button) -->
    <!-- Positioned ON TOP (Overlay) for clean rendering -->
    <div 
        class="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        :style="{
            width: `${orbSize}px`,
            height: `${orbSize}px`,
            right: `${(height - orbSize) / 2}px`, 
            transform: `translateX(${dimensions.translateX}px) scale(${orbScale}) rotate(${showCloseOrb ? 0 : -90}deg)`,
            opacity: orbOpacity,
            pointerEvents: showCloseOrb ? 'auto' : 'none',
            zIndex: 20 // Higher than input
        }"
        @mousedown.prevent="clearSearch"
    >
        <!-- Orb Filter -->
        <Filter
            :id="orbFilterId"
            :width="orbSize"
            :height="orbSize"
            :radius="orbSize / 2"
            :bezel-width="dimensions.bezelWidth"
            :glass-thickness="dimensions.glassThickness"
            :refractive-index="1.4"
            bezel-type="convex_squircle"
            shape="pill"
            :blur="1"
            :scale-ratio="0.2"
            :specular-opacity="0.4"
            :specular-saturation="10"
        />
        
        <!-- Orb Glass Body -->
         <div
            class="absolute inset-0 z-10"
            :style="{
                borderRadius: `${radius}px`,
                backdropFilter: `url(#${orbFilterId})`,
                backgroundColor: 'rgba(255,255,255,0.05)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1), inset 0 0 5px rgba(255,255,255,0.1)',
            }"
         ></div>

         <!-- Close Icon -->
         <div class="absolute inset-0 z-20 flex items-center justify-center pointer-events-none text-black/60 dark:text-white/70">
            <svg
                :style="{ width: `${iconSize}px`, height: `${iconSize}px` }"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
            </svg>
         </div>
    </div>
  </div>
</template>
