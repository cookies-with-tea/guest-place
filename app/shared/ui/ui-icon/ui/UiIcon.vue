<template>
  <svg class="ui-icon" :class="iconClass" :width="props.width" :height="props.height" aria-hidden="true">
    <use :href="symbolId" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { IconNamesType } from '../types'

const props = withDefaults(defineProps<Props>(), {
  prefix: 'icon',
  width: '23px',
  height: '24px',
  reverse: false,
})

type Props = {
  name: IconNamesType
  prefix?: string
  width?: string | number
  height?: string | number
  reverse?: boolean
}

const symbolId = computed(() => `#${props.prefix}-${props.name}`)

const iconClass = computed(() => {
  return [{ 'reversed-icon': props.reverse }, `ui-icon--${props.name}`]
})
</script>

<style scoped>
.ui-icon {
  position: relative;
  display: inline-block;
  flex-shrink: 0;
  transition: transform 0.2s;
}

.reversed-icon {
  transform: rotate(180deg);
}
</style>
