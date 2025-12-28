<template>
  <form class="ui-form">
    <slot />
  </form>
</template>

<script lang="ts" setup generic="Input extends object">
import { useForm } from '../composables'
import type { IFormExpose, IUseFormOptions } from '../model'

type TProps = IUseFormOptions<Input>

const props = defineProps<TProps>()

const { validate } = useForm<Input>(props)

defineExpose<IFormExpose>({
  validate,
})
</script>

<style lang="scss" scoped>
.ui-form {
  display: flex;
  flex-direction: column;
  gap: 25px;
}
</style>
