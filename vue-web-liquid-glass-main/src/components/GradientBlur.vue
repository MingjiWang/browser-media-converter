<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  direction: 'top' | 'bottom' | 'left' | 'right'
  size?: number // height for top/bottom, width for left/right
}>(), {
  size: 60
})

const style = computed(() => {
  const s: Record<string, string> = {}
  
  if (props.direction === 'top') {
    s.top = '0'
    s.left = '0'
    s.right = '0'
    s.height = `${props.size}px`
    s['--mask-dir'] = 'to top'
  } else if (props.direction === 'bottom') {
    s.bottom = '0'
    s.left = '0'
    s.right = '0'
    s.height = `${props.size}px`
    s['--mask-dir'] = 'to bottom'
  } else if (props.direction === 'left') {
    s.top = '0'
    s.bottom = '0'
    s.left = '0'
    s.width = `${props.size}px`
    s['--mask-dir'] = 'to left'
  } else if (props.direction === 'right') {
    s.top = '0'
    s.bottom = '0'
    s.right = '0'
    s.width = `${props.size}px`
    s['--mask-dir'] = 'to right'
  }
  
  return s
})
</script>

<template>
  <div class="gradient-blur" :style="style">
    <div></div><div></div><div></div><div></div><div></div><div></div>
  </div>
</template>

<style scoped>
.gradient-blur {
  position: absolute;
  z-index: 20;
  pointer-events: none;
}

.gradient-blur > div,
.gradient-blur::before,
.gradient-blur::after {
  position: absolute;
  inset: 0;
}

.gradient-blur::before {
  content: "";
  z-index: 1;
  backdrop-filter: blur(0.5px);
  -webkit-backdrop-filter: blur(0.5px);
  mask: linear-gradient(
    var(--mask-dir),
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 1) 12.5%,
    rgba(0, 0, 0, 1) 25%,
    rgba(0, 0, 0, 0) 37.5%
  );
  -webkit-mask: linear-gradient(
    var(--mask-dir),
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 1) 12.5%,
    rgba(0, 0, 0, 1) 25%,
    rgba(0, 0, 0, 0) 37.5%
  );
}

.gradient-blur > div:nth-of-type(1) {
  z-index: 2;
  backdrop-filter: blur(1px);
  -webkit-backdrop-filter: blur(1px);
  mask: linear-gradient(
    var(--mask-dir),
    rgba(0, 0, 0, 0) 12.5%,
    rgba(0, 0, 0, 1) 25%,
    rgba(0, 0, 0, 1) 37.5%,
    rgba(0, 0, 0, 0) 50%
  );
  -webkit-mask: linear-gradient(
    var(--mask-dir),
    rgba(0, 0, 0, 0) 12.5%,
    rgba(0, 0, 0, 1) 25%,
    rgba(0, 0, 0, 1) 37.5%,
    rgba(0, 0, 0, 0) 50%
  );
}

.gradient-blur > div:nth-of-type(2) {
  z-index: 3;
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  mask: linear-gradient(
    var(--mask-dir),
    rgba(0, 0, 0, 0) 25%,
    rgba(0, 0, 0, 1) 37.5%,
    rgba(0, 0, 0, 1) 50%,
    rgba(0, 0, 0, 0) 62.5%
  );
  -webkit-mask: linear-gradient(
    var(--mask-dir),
    rgba(0, 0, 0, 0) 25%,
    rgba(0, 0, 0, 1) 37.5%,
    rgba(0, 0, 0, 1) 50%,
    rgba(0, 0, 0, 0) 62.5%
  );
}

.gradient-blur > div:nth-of-type(3) {
  z-index: 4;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  mask: linear-gradient(
    var(--mask-dir),
    rgba(0, 0, 0, 0) 37.5%,
    rgba(0, 0, 0, 1) 50%,
    rgba(0, 0, 0, 1) 62.5%,
    rgba(0, 0, 0, 0) 75%
  );
  -webkit-mask: linear-gradient(
    var(--mask-dir),
    rgba(0, 0, 0, 0) 37.5%,
    rgba(0, 0, 0, 1) 50%,
    rgba(0, 0, 0, 1) 62.5%,
    rgba(0, 0, 0, 0) 75%
  );
}

.gradient-blur > div:nth-of-type(4) {
  z-index: 5;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  mask: linear-gradient(
    var(--mask-dir),
    rgba(0, 0, 0, 0) 50%,
    rgba(0, 0, 0, 1) 62.5%,
    rgba(0, 0, 0, 1) 75%,
    rgba(0, 0, 0, 0) 87.5%
  );
  -webkit-mask: linear-gradient(
    var(--mask-dir),
    rgba(0, 0, 0, 0) 50%,
    rgba(0, 0, 0, 1) 62.5%,
    rgba(0, 0, 0, 1) 75%,
    rgba(0, 0, 0, 0) 87.5%
  );
}

.gradient-blur > div:nth-of-type(5) {
  z-index: 6;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  mask: linear-gradient(
    var(--mask-dir),
    rgba(0, 0, 0, 0) 62.5%,
    rgba(0, 0, 0, 1) 75%,
    rgba(0, 0, 0, 1) 87.5%,
    rgba(0, 0, 0, 0) 100%
  );
  -webkit-mask: linear-gradient(
    var(--mask-dir),
    rgba(0, 0, 0, 0) 62.5%,
    rgba(0, 0, 0, 1) 75%,
    rgba(0, 0, 0, 1) 87.5%,
    rgba(0, 0, 0, 0) 100%
  );
}

.gradient-blur > div:nth-of-type(6) {
  z-index: 7;
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
  mask: linear-gradient(
    var(--mask-dir),
    rgba(0, 0, 0, 0) 75%,
    rgba(0, 0, 0, 1) 87.5%,
    rgba(0, 0, 0, 1) 100%
  );
  -webkit-mask: linear-gradient(
    var(--mask-dir),
    rgba(0, 0, 0, 0) 75%,
    rgba(0, 0, 0, 1) 87.5%,
    rgba(0, 0, 0, 1) 100%
  );
}

.gradient-blur::after {
  content: "";
  z-index: 8;
  backdrop-filter: blur(64px);
  -webkit-backdrop-filter: blur(64px);
  mask: linear-gradient(
    var(--mask-dir),
    rgba(0, 0, 0, 0) 87.5%,
    rgba(0, 0, 0, 1) 100%
  );
  -webkit-mask: linear-gradient(
    var(--mask-dir),
    rgba(0, 0, 0, 0) 87.5%,
    rgba(0, 0, 0, 1) 100%
  );
}
</style>
