<template>
  <ul class="ui-accordion">
    <slot />
  </ul>
</template>

<script setup lang="ts">
import { provide, onMounted } from 'vue'
import type { TUiAccordionModelValue } from '../types'
import type { IUiAccordionProvider } from '../interfaces'
import { UiAccordionInjectionKey } from '../constants'

interface IProps {
  multiple?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  multiple: false,
})

const model = defineModel<TUiAccordionModelValue>({
  default: '',
})

provide<IUiAccordionProvider>(UiAccordionInjectionKey, {
  model,
  multiple: props.multiple,
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
