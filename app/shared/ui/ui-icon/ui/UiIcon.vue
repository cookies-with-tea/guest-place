<template>
  <component :is="iconComponent" :class="iconClass" :height :width aria-hidden="true" class="ui-icon" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { IconNamesType } from '../types'

interface Props {
  name: IconNamesType
  width?: string | number
  height?: string | number
  reverse?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: '1em',
  height: '1em',
  reverse: false,
})

const iconClass = computed(() => {
  return [{ 'ui-icon--reversed': props.reverse }, `ui-icon--${props.name}`]
})

const iconComponent = computed(() => {
  try {
    return defineAsyncComponent(() =>
      import(`public/assets/icons/${props.name}.svg`).catch((error) => {
        console.error(`Failed to load icon: ${props.name}`, error)

        return {
          template: '<div>Not found</div>',
        }
      })
    )
  } catch (e) {
    console.error('Error defining async component for icon:', props.name, e)

    return null
  }
})
</script>

<style lang="scss" scoped>
.ui-icon {
  position: relative;
  display: inline-block;
  flex-shrink: 0;
  transition: transform var(--transition-duration-secondary);

  &--reversed {
    transform: rotate(180deg);
  }
}
</style>
