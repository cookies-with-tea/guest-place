<template>
  <ul class="ui-accordion">
    <slot />
  </ul>
</template>

<script setup lang="ts">
// interface IProps {
//   a: any,
// }
//
// const props = defineProps<IProps>()
const model = defineModel()
console.log(model)
provide('key', model)
</script>

<style scoped lang="scss">
.ui-accordion {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
