<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import Filter from './Filter.vue'

// Props
const props = withDefaults(defineProps<{
  modelValue?: boolean
  size?: 'xs' | 'small' | 'medium' | 'large'
  disabled?: boolean
}>(), {
  modelValue: false,
  size: 'medium',
  disabled: false,
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// Size presets
const sizePresets = {
  xs: {
    sliderWidth: 70,
    sliderHeight: 30,
    thumbWidth: 64,
    thumbHeight: 40,
    thumbScale: 0.65,
    bezelWidth: 8,
    glassThickness: 10,
  },
  small: {
    sliderWidth: 100,
    sliderHeight: 42,
    thumbWidth: 92,
    thumbScale: 0.65,
    thumbHeight: 58,
    bezelWidth: 14,
    glassThickness: 15,
  },
  medium: {
    sliderWidth: 130,
    sliderHeight: 54,
    thumbWidth: 119,
    thumbHeight: 75,
    thumbScale: 0.65,
    bezelWidth: 16,
    glassThickness: 20,
  },
  large: {
    sliderWidth: 160,
    sliderHeight: 67,
    thumbWidth: 146,
    thumbHeight: 92,
    thumbScale: 0.65,
    bezelWidth: 18,
    glassThickness: 25,
  },
}

// Computed dimensions
const dimensions = computed(() => sizePresets[props.size])
const sliderWidth = computed(() => dimensions.value.sliderWidth)
const sliderHeight = computed(() => dimensions.value.sliderHeight)
const thumbWidth = computed(() => dimensions.value.thumbWidth)
const thumbHeight = computed(() => dimensions.value.thumbHeight)
const thumbRadius = computed(() => thumbHeight.value / 2)
const bezelWidth = computed(() => dimensions.value.bezelWidth)
const glassThickness = computed(() => dimensions.value.glassThickness)

// Generate unique filter ID
const filterId = `liquid-glass-switch-${Math.random().toString(36).substr(2, 9)}`

// Constants for animation
const THUMB_REST_SCALE = 0.65
const THUMB_ACTIVE_SCALE = 0.9
const THUMB_REST_OFFSET = computed(() => ((1 - THUMB_REST_SCALE) * thumbWidth.value) / 2)
const TRAVEL = computed(() => 
  sliderWidth.value - sliderHeight.value - (thumbWidth.value - thumbHeight.value) * THUMB_REST_SCALE
)

// Internal state
const internalChecked = ref(props.modelValue)
const pointerDown = ref(0)
const xDragRatio = ref(props.modelValue ? 1 : 0)
const initialPointerX = ref(0)

// Sync with prop changes
watch(() => props.modelValue, (newVal) => {
  internalChecked.value = newVal
  if (pointerDown.value === 0) {
    xDragRatio.value = newVal ? 1 : 0
  }
})

// Computed styles
const isActive = computed(() => pointerDown.value > 0.5)

const thumbScale = computed(() => 
  THUMB_REST_SCALE + (THUMB_ACTIVE_SCALE - THUMB_REST_SCALE) * (isActive.value ? 1 : 0)
)

const backgroundOpacity = computed(() => 1 - 0.9 * (isActive.value ? 1 : 0))

const scaleRatio = computed(() => (0.4 + 0.5 * (isActive.value ? 1 : 0)))

const considerChecked = computed(() => {
  if (pointerDown.value > 0) {
    return xDragRatio.value > 0.5
  }
  return internalChecked.value
})

const backgroundColor = computed(() => {
  const ratio = xDragRatio.value
  // Interpolate from gray to green
  const r = Math.round(148 + (59 - 148) * ratio)
  const g = Math.round(148 + (191 - 148) * ratio)
  const b = Math.round(159 + (78 - 159) * ratio)
  const a = Math.round(119 + (238 - 119) * ratio)
  return `rgba(${r}, ${g}, ${b}, ${a / 255})`
})

const thumbX = computed(() => xDragRatio.value * TRAVEL.value)

const thumbMarginLeft = computed(() => 
  -THUMB_REST_OFFSET.value + (sliderHeight.value - thumbHeight.value * THUMB_REST_SCALE) / 2
)

// Event handlers
const handleThumbPointerDown = (e: MouseEvent | TouchEvent) => {
  if (props.disabled) return
  
  pointerDown.value = 1
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  initialPointerX.value = clientX
}

const handlePointerMove = (e: PointerEvent | TouchEvent | MouseEvent) => {
  if (pointerDown.value === 0 || props.disabled) return
  
  const clientX = 'touches' in e 
    ? e.touches[0].clientX 
    : e.clientX
  
  const baseRatio = internalChecked.value ? 1 : 0
  const displacementX = clientX - initialPointerX.value
  const ratio = baseRatio + displacementX / TRAVEL.value
  
  // Add some overflow damping
  const overflow = ratio < 0 ? -ratio : ratio > 1 ? ratio - 1 : 0
  const overflowSign = ratio < 0 ? -1 : 1
  const dampedOverflow = (overflowSign * overflow) / 22
  
  xDragRatio.value = Math.min(1, Math.max(0, ratio)) + dampedOverflow
}

const handlePointerUp = (e: PointerEvent | TouchEvent | MouseEvent) => {
  if (pointerDown.value === 0) return
  
  pointerDown.value = 0
  
  const clientX = 'changedTouches' in e 
    ? e.changedTouches[0].clientX 
    : e.clientX
  
  const distance = clientX - initialPointerX.value
  
  if (Math.abs(distance) > 4) {
    // Dragged - determine state from position
    const shouldBeChecked = xDragRatio.value > 0.5
    internalChecked.value = shouldBeChecked
    xDragRatio.value = shouldBeChecked ? 1 : 0
    emit('update:modelValue', shouldBeChecked)
  } else {
    // Clicked - toggle
    const newValue = !internalChecked.value
    internalChecked.value = newValue
    xDragRatio.value = newValue ? 1 : 0
    emit('update:modelValue', newValue)
  }
}

// Global pointer up listener
onMounted(() => {
  window.addEventListener('mouseup', handlePointerUp)
  window.addEventListener('touchend', handlePointerUp)
})

onUnmounted(() => {
  window.removeEventListener('mouseup', handlePointerUp)
  window.removeEventListener('touchend', handlePointerUp)
})
</script>

<template>
  <div
    class="inline-block select-none touch-none"
    :class="{ 'opacity-50 cursor-not-allowed': disabled }"
    @mousemove="handlePointerMove"
    @touchmove="handlePointerMove"
  >
    <div
      class="relative cursor-pointer transition-colors duration-150"
      :style="{
        width: `${sliderWidth}px`,
        height: `${sliderHeight}px`,
        backgroundColor: backgroundColor,
        borderRadius: `${sliderHeight / 2}px`,
      }"
    >
      <!-- Filter -->
      <Filter
        :id="filterId"
        :width="thumbWidth"
        :height="thumbHeight"
        :radius="thumbRadius"
        :bezel-width="bezelWidth"
        :glass-thickness="glassThickness"
        :refractive-index="1.5"
        bezel-type="lip"
        shape="pill"
        :blur="0.2"
        :scale-ratio="scaleRatio"
        :specular-opacity="0.5"
        :specular-saturation="6"
      />

      <!-- Thumb -->
      <div
        class="absolute cursor-pointer transition-transform duration-100 ease-out"
        :style="{
          height: `${thumbHeight}px`,
          width: `${thumbWidth}px`,
          marginLeft: `${thumbMarginLeft}px`,
          transform: `translateX(${thumbX}px) translateY(-50%) scale(${thumbScale})`,
          top: `${sliderHeight / 2}px`,
          borderRadius: `${thumbRadius}px`,
          backdropFilter: `url(#${filterId})`,
          backgroundColor: `rgba(255, 255, 255, ${backgroundOpacity})`,
          boxShadow: pointerDown > 0.5 
            ? '0 4px 22px rgba(0,0,0,0.1), inset 2px 7px 24px rgba(0,0,0,0.09), inset -2px -7px 24px rgba(255,255,255,0.09)'
            : '0 4px 22px rgba(0,0,0,0.1)',
        }"
        @mousedown="handleThumbPointerDown"
        @touchstart="handleThumbPointerDown"
      />
    </div>
  </div>
</template>
