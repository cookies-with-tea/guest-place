<template>
  <div class="ui-input">
    <input v-model="model">

    {{model}}
  </div>

</template>

<script setup lang="ts">
const model = defineModel()

interface IProps {
  size?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  size: '',
})
</script>

<style scoped lang="scss">

</style>
