<script setup lang="ts">
import { computed, watch, ref, watchEffect } from 'vue'
import {
  calculateDisplacementMap,
  calculateDisplacementMap2,
  calculateDisplacementMapWithShape,
  type ShapeType
} from '../lib/displacementMap'
import { calculateRefractionSpecular } from '../lib/specular'
import { calculateMagnifyingDisplacementMap } from '../lib/magnifyingDisplacement'
import { CONVEX, CONCAVE, CONVEX_CIRCLE, LIP } from '../lib/surfaceEquations'

interface Props {
  id: string
  width?: number
  height?: number
  radius?: number
  bezelWidth?: number
  glassThickness?: number
  refractiveIndex?: number
  bezelType?: 'convex_circle' | 'convex_squircle' | 'concave' | 'lip'
  blur?: number
  scaleRatio?: number
  specularOpacity?: number
  specularSaturation?: number
  magnify?: boolean
  magnifyingScale?: number
  // New adaptive props
  shape?: ShapeType
  cornerRadius?: number  // 0 = sharp, 1 = fully rounded
  squircleExponent?: number
  quality?: number
}

const props = withDefaults(defineProps<Props>(), {
  width: 150,
  height: 150,
  radius: 75,
  bezelWidth: 40,
  glassThickness: 120,
  refractiveIndex: 1.5,
  bezelType: 'convex_squircle',
  blur: 0.2,
  scaleRatio: 1,
  specularOpacity: 0.4,
  specularSaturation: 4,
  magnify: false,
  magnifyingScale: 24,
  // Default to circle shape for backward compatibility
  shape: 'pill',
  cornerRadius: 1.0,
  squircleExponent: 2,
  quality: 2
})

// Generated data URLs - reactive
const displacementMapUrl = ref('')
const specularMapUrl = ref('')
const magnifyingMapUrl = ref('')
const maxDisplacement = ref(0)

// Debounce timer
let regenerateTimeout: ReturnType<typeof setTimeout> | null = null

// Convert ImageData to data URL
function imageDataToDataUrl(imageData: ImageData): string {
  const canvas = document.createElement('canvas')
  canvas.width = imageData.width
  canvas.height = imageData.height
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  ctx.putImageData(imageData, 0, 0)
  return canvas.toDataURL('image/png')
}

// Get surface function based on bezel type
function getSurfaceFn(bezelType: string) {
  switch (bezelType) {
    case 'convex_circle':
      return CONVEX_CIRCLE.fn
    case 'convex_squircle':
      return CONVEX.fn
    case 'concave':
      return CONCAVE.fn
    case 'lip':
      return LIP.fn
    default:
      return CONVEX.fn
  }
}

// Regenerate all filter assets
function regenerateAssets() {
  const surfaceFn = getSurfaceFn(props.bezelType)
  
  // Calculate displacement map for bezel profile
  const precomputedMap = calculateDisplacementMap(
    props.glassThickness,
    props.bezelWidth,
    surfaceFn,
    props.refractiveIndex
  )
  
  maxDisplacement.value = Math.max(...precomputedMap.map(x => Math.abs(x))) || 1
  
  // Use the new shape-aware function for shapes other than default circle
  let displacementImageData: ImageData
  
  if (props.shape && props.shape !== 'circle') {
    // Use new shape-aware displacement map
    displacementImageData = calculateDisplacementMapWithShape(
      props.width,
      props.height,
      props.width,
      props.height,
      props.bezelWidth,
      100,
      precomputedMap,
      props.shape,
      props.cornerRadius,
      props.squircleExponent,
      props.quality
    )
  } else {
    // Use original circular displacement map
    displacementImageData = calculateDisplacementMap2(
      props.width,
      props.height,
      props.width,
      props.height,
      props.radius,
      props.bezelWidth,
      100,
      precomputedMap,
      props.quality
    )
  }
  
  displacementMapUrl.value = imageDataToDataUrl(displacementImageData)
  
  // Calculate specular map
  const specularImageData = calculateRefractionSpecular(
    props.width,
    props.height,
    props.radius,
    props.bezelWidth,
    undefined,
    props.quality
  )
  
  specularMapUrl.value = imageDataToDataUrl(specularImageData)
  
  // Calculate magnifying map if needed
  if (props.magnify) {
    const magnifyingImageData = calculateMagnifyingDisplacementMap(
      props.width,
      props.height,
      props.quality
    )
    magnifyingMapUrl.value = imageDataToDataUrl(magnifyingImageData)
  }
}

// Debounced regeneration to avoid excessive updates
function debouncedRegenerate() {
  if (regenerateTimeout) {
    clearTimeout(regenerateTimeout)
  }
  regenerateTimeout = setTimeout(() => {
    regenerateAssets()
  }, 16) // ~60fps debounce
}

// Watch all relevant props and regenerate when they change
watch(
  () => [
    props.width,
    props.height,
    props.radius,
    props.bezelWidth,
    props.glassThickness,
    props.refractiveIndex,
    props.bezelType,
    props.magnify,
    props.shape,
    props.cornerRadius,
    props.squircleExponent,
    props.quality
  ],
  () => {
    debouncedRegenerate()
  },
  { immediate: true, deep: true }
)

const scale = computed(() => maxDisplacement.value * props.scaleRatio)
const specularSaturationValue = computed(() => props.specularSaturation.toString())
</script>

<template>
  <svg color-interpolation-filters="sRGB" style="display: none">
    <defs>
      <filter :id="id">
        <!-- Magnifying effect (optional) -->
        <template v-if="magnify && magnifyingMapUrl">
          <feImage
            :href="magnifyingMapUrl"
            x="0"
            y="0"
            :width="width"
            :height="height"
            result="magnifying_displacement_map"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="magnifying_displacement_map"
            :scale="magnifyingScale"
            xChannelSelector="R"
            yChannelSelector="G"
            result="magnified_source"
          />
        </template>
        
        <!-- Blur -->
        <feGaussianBlur
          :in="magnify ? 'magnified_source' : 'SourceGraphic'"
          :stdDeviation="blur"
          result="blurred_source"
        />
        
        <!-- Displacement map -->
        <feImage
          v-if="displacementMapUrl"
          :href="displacementMapUrl"
          x="0"
          y="0"
          :width="width"
          :height="height"
          result="displacement_map"
        />
        <feDisplacementMap
          in="blurred_source"
          in2="displacement_map"
          :scale="scale"
          xChannelSelector="R"
          yChannelSelector="G"
          result="displaced"
        />
        
        <!-- Saturation -->
        <feColorMatrix
          in="displaced"
          type="saturate"
          :values="specularSaturationValue"
          result="displaced_saturated"
        />
        
        <!-- Specular layer -->
        <feImage
          v-if="specularMapUrl"
          :href="specularMapUrl"
          x="0"
          y="0"
          :width="width"
          :height="height"
          result="specular_layer"
        />
        <feComposite
          in="displaced_saturated"
          in2="specular_layer"
          operator="in"
          result="specular_saturated"
        />
        <feComponentTransfer in="specular_layer" result="specular_faded">
          <feFuncA type="linear" :slope="specularOpacity" />
        </feComponentTransfer>
        
        <!-- Blend layers -->
        <feBlend
          in="specular_saturated"
          in2="displaced"
          mode="normal"
          result="withSaturation"
        />
        <feBlend
          in="specular_faded"
          in2="withSaturation"
          mode="normal"
        />
      </filter>
    </defs>
  </svg>
</template>
