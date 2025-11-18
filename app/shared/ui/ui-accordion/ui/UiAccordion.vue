<template>
  <ul class="ui-accordion">
    <slot />
  </ul>
</template>

<script setup lang="ts">
import { provide } from 'vue'

interface IProps {
  multiple: boolean
}

const props = defineProps<IProps>()

const model = defineModel<string | string[]>()
// console.log(model)

const showContent = (currentIndex: string): void => {
  if (props.multiple) {
    model.value = [currentIndex]
  } else {
    model.value = currentIndex
  }
}

const isActive = (currentIndex: string): boolean => {
  const value = model.value

  if (props.multiple) {
    return Array.isArray(value) && value.includes(currentIndex)
  } else {
    return value === currentIndex
  }
}

provide('activeItems', {
  isActive,
  showContent,
})
</script>

<style scoped lang="scss">
.ui-accordion {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
