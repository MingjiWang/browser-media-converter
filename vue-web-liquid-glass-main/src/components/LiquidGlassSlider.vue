<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import Filter from './Filter.vue'

// Props
const props = withDefaults(defineProps<{
  modelValue?: number
  min?: number
  max?: number
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
}>(), {
  modelValue: 0,
  min: 0,
  max: 100,
  size: 'medium',
  disabled: false,
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

// Size presets (only thumb dimensions, not slider width)
const sizePresets = {
  small: {
    sliderHeight: 10,
    thumbWidth: 54,
    thumbHeight: 36,
    thumbRadius: 18,
    bezelWidth: 30,
    glassThickness: 30,
  },
  medium: {
    sliderHeight: 14,
    thumbWidth: 90,
    thumbHeight: 60,
    thumbRadius: 30,
    bezelWidth: 40,
    glassThickness: 40,
  },
  large: {
    sliderHeight: 18,
    thumbWidth: 126,
    thumbHeight: 84,
    thumbRadius: 42,
    bezelWidth: 50,
    glassThickness: 40,
  },
}

// Container ref for measuring width
const containerRef = ref<HTMLElement | null>(null)
const containerWidth = ref(300) // default fallback

// Computed dimensions based on size
const dimensions = computed(() => sizePresets[props.size])
const sliderWidth = computed(() => containerWidth.value)
const sliderHeight = computed(() => dimensions.value.sliderHeight)
const thumbWidth = computed(() => dimensions.value.thumbWidth)
const thumbHeight = computed(() => dimensions.value.thumbHeight)
const thumbRadius = computed(() => dimensions.value.thumbRadius)
const bezelWidth = computed(() => dimensions.value.bezelWidth)
const glassThickness = computed(() => dimensions.value.glassThickness)

// Generate unique filter ID for each instance
const filterId = `liquid-glass-slider-${Math.random().toString(36).substr(2, 9)}`

// Internal value state
const internalValue = ref(props.modelValue)

// Sync with prop changes
watch(() => props.modelValue, (newVal) => {
  internalValue.value = newVal
})

// Use numeric values (0/1) for compatibility with transforms
const pointerDown = ref(0)
const isUp = computed(() => pointerDown.value > 0.5 ? 1 : 0)

// Motion effects
const SCALE_REST = 0.6
const SCALE_DRAG = 1

const pressMultiplier = computed(() => isUp.value === 1 ? 0.9 : 0.4)
const scaleRatio = computed(() => pressMultiplier.value)
const scaleSpring = computed(() => isUp.value === 1 ? SCALE_DRAG : SCALE_REST)
const backgroundOpacity = computed(() => isUp.value === 1 ? 0.1 : 1)

// Thumb position based on value
const thumbX = ref(0)

// Calculate thumb position from value
const updateThumbFromValue = () => {
  const range = sliderWidth.value - thumbWidth.value
  if (range <= 0) return
  const normalizedValue = (internalValue.value - props.min) / (props.max - props.min)
  thumbX.value = normalizedValue * range
}

// ResizeObserver to track container width
let resizeObserver: ResizeObserver | null = null

const setupResizeObserver = () => {
  if (!containerRef.value) return
  
  resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      containerWidth.value = entry.contentRect.width
      nextTick(() => updateThumbFromValue())
    }
  })
  
  resizeObserver.observe(containerRef.value)
  
  // Initialize with current width
  containerWidth.value = containerRef.value.offsetWidth
  updateThumbFromValue()
}

// Initialize
onMounted(() => {
  setupResizeObserver()
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

watch([internalValue, () => props.size], updateThumbFromValue)

// Drag handling
let isDragging = false
let startX = 0
let startThumbX = 0

const handlePointerDown = (e: PointerEvent) => {
  if (props.disabled) return
  
  isDragging = true
  pointerDown.value = 1
  startX = e.clientX
  startThumbX = thumbX.value
  ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
}

const handlePointerMove = (e: PointerEvent) => {
  if (!isDragging || props.disabled) return
  
  const deltaX = e.clientX - startX
  const maxThumbX = sliderWidth.value - thumbWidth.value
  const newThumbX = Math.max(0, Math.min(maxThumbX, startThumbX + deltaX))
  thumbX.value = newThumbX
  
  // Update value based on thumb position
  const range = sliderWidth.value - thumbWidth.value
  const normalizedValue = thumbX.value / range
  const newValue = props.min + normalizedValue * (props.max - props.min)
  internalValue.value = newValue
  emit('update:modelValue', newValue)
}

const handlePointerUp = () => {
  isDragging = false
  pointerDown.value = 0
}

// End drag when releasing outside the element
onMounted(() => {
  window.addEventListener('pointerup', handlePointerUp)
  window.addEventListener('mouseup', handlePointerUp)
  window.addEventListener('touchend', handlePointerUp)
})

onUnmounted(() => {
  window.removeEventListener('pointerup', handlePointerUp)
  window.removeEventListener('mouseup', handlePointerUp)
  window.removeEventListener('touchend', handlePointerUp)
})
</script>

<template>
  <div
    ref="containerRef"
    class="relative w-full"
    :class="{ 'opacity-50 cursor-not-allowed': disabled }"
    :style="{
      height: `${thumbHeight}px`,
    }"
  >
    <!-- Track with padding to account for scaled thumb overflow -->
    <div
      class="absolute"
      :class="disabled ? 'cursor-not-allowed' : 'cursor-pointer'"
      :style="{
        height: `${sliderHeight}px`,
        top: `${(thumbHeight - sliderHeight) / 2}px`,
        // Inset the track slightly to align with visual thumb edges
        left: `${thumbWidth * (1 - SCALE_REST) / 2}px`,
        right: `${thumbWidth * (1 - SCALE_REST) / 2}px`,
        backgroundColor: '#89898F66',
        borderRadius: `${sliderHeight / 2}px`,
      }"
    >
      <div class="w-full h-full overflow-hidden rounded-full">
        <!-- Blue fill - calculated based on visual position -->
        <div
          :style="{
            top: 0,
            left: 0,
            height: `${sliderHeight}px`,
            // Fill width follows thumb center, adjusted for visual position
            width: `${Math.max(0, thumbX + thumbWidth / 2 - thumbWidth * (1 - SCALE_REST) / 2)}px`,
            borderRadius: `${sliderHeight / 2}px`,
            backgroundColor: '#0377F7',
          }"
        />
      </div>
    </div>

    <!-- SVG Filter -->
    <Filter
      :id="filterId"
      :width="thumbWidth"
      :height="thumbHeight"
      :radius="thumbRadius"
      :bezel-width="bezelWidth"
      :glass-thickness="glassThickness"
      :refractive-index="1.45"
      bezel-type="convex_squircle"
      shape="pill"
      :blur="0"
      :scale-ratio="scaleRatio"
      :specular-opacity="0.4"
      :specular-saturation="7"
    />

    <!-- Thumb - positioned by center for perfect scale alignment -->
    <div
      class="absolute transition-transform duration-150 ease-out"
      :class="disabled ? 'cursor-not-allowed' : 'cursor-pointer'"
      :style="{
        height: `${thumbHeight}px`,
        width: `${thumbWidth}px`,
        top: '50%',
        // Position the left edge at thumbX, add half width to get center
        left: `${thumbX + thumbWidth / 2}px`,
        borderRadius: `${thumbRadius}px`,
        backdropFilter: `url(#${filterId})`,
        // Translate -50% to center on the position point, then scale
        transform: `translate(-50%, -50%) scale(${scaleSpring})`,
        transformOrigin: 'center center',
        backgroundColor: `rgba(255, 255, 255, ${backgroundOpacity})`,
        boxShadow: '0 3px 14px rgba(0,0,0,0.1)',
      }"
      @pointerdown="handlePointerDown"
      @pointermove="handlePointerMove"
      @pointerup="handlePointerUp"
    />
  </div>
</template>
