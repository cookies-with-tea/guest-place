<template>
  <form ref="formRef" class="ui-form" @submit.prevent="handleFormSubmit">
    <slot />
  </form>
</template>

<script lang="ts" setup generic="T extends object">
import { useForm } from '../composables'
import type { IEmits, IUseFormOptions } from '../interfaces'

type TProps = IUseFormOptions<T>

const props = defineProps<TProps>()
const emit = defineEmits<IEmits<T>>()

const { isLoading, handleFormSubmit } = useForm<T>(props, emit)

defineExpose({
  isLoading,
  submit: handleFormSubmit,
})
</script>

<style lang="scss" scoped>
.ui-form {
  display: flex;
  flex-direction: column;
  gap: 25px;
}
</style>
