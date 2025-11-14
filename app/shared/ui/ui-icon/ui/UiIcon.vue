<template>
  <svg class="ui-icon" :class="iconClass" :width="props.width" :height="props.height" aria-hidden="true">
    <use :href="symbolId" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { IconNamesType } from '../types'

interface Props {
  name: IconNamesType
  prefix?: string
  width?: string | number
  height?: string | number
  reverse?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  prefix: 'icon',
  width: '1em',
  height: '1em',
  reverse: false,
})

const symbolId = computed(() => `#${props.prefix}-${props.name}`)

const iconClass = computed(() => {
  return [{ 'reversed-icon': props.reverse }, `ui-icon--${props.name}`]
})
</script>

<style scoped>
.ui-icon {
  position: relative;
  display: flex;
  flex-shrink: 0;
  transition: transform 0.2s;
}

.reversed-icon {
  transform: rotate(180deg);
}
</style>
