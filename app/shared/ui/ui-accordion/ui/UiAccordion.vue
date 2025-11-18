<template>
  <ul class="ui-accordion">
    <slot />
  </ul>
</template>

<script setup lang="ts">
import { provide, computed } from 'vue'

interface IProps {
  multiple: boolean
}

const props = defineProps<IProps>()

const model = defineModel<string | string[]>()
console.log(model)
// const normalizedModel = computed<string | string[]>(() => {
//   if (props.multiple) {
//     // Ожидаем массив. Если не массив — возвращаем пустой массив.
//     return Array.isArray(model.value) ? model.value : [];
//   } else {
//     // Ожидаем строку. Если не строка — возвращаем пустую строку или можно null, но тип не позволяет.
//     return typeof model.value === 'string' ? model.value : '';
//   }
// });
//
// const isActive = (id: string) => normalizedModel.value.includes(id)

provide('activeItems', model)
</script>

<style scoped lang="scss">
.ui-accordion {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
