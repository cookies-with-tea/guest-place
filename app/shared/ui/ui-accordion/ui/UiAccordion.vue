<template>
  <ul class="ui-accordion">
    <slot />
  </ul>
</template>

<script setup lang="ts">
import { provide } from 'vue'

interface IProps {
  multiple?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  multiple: false,
})

const model = defineModel<string | string[]>()

const showContent = (currentIndex: string): void => {
  const isOpenAccordion = isActive(currentIndex)

  if (props.multiple) {
    model.value = isOpenAccordion ? [] : [currentIndex]
  } else {
    model.value = isOpenAccordion ? '0' : currentIndex
  }
}

const isActive = (currentIndex: string): boolean => {
  return Array.isArray(model.value) ? model.value.includes(currentIndex) : model.value === currentIndex
}

provide('activeItems', {
  isActive,
  showContent,
})

onMounted(() => {
  if (props.multiple && !Array.isArray(model.value)) {
    throw new Error('Model value must be an array when multiple is true')
  }

  if (!props.multiple && Array.isArray(model.value)) {
    throw new Error('Model value must be a string when multiple is false')
  }
})
</script>

<style scoped lang="scss">
.ui-accordion {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
