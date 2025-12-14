import { ref } from 'vue'
import { useFormErrors, useValidation } from '../composables'
import type { IEmits, IUseFormOptions } from '../interfaces'
import type { EmitFn } from '#shared/types'

export const useForm = <T>(options: IUseFormOptions<T>, emit: EmitFn<IEmits<T>>) => {
  const { isValid, validate } = useValidation(options?.data, options?.rules)
  const { setFormErrors } = useFormErrors()

  const isLoading = ref(false)

  const handleFormSubmit = async () => {
    await validate()

    if (!isValid.value) {
      return
    }

    if (!options?.action) {
      return
    }

    isLoading.value = true

    const { error, data } = await options.action(options.data)

    if (data.value) {
      console.log(data.value)

      emit('on-success', data.value)

      isLoading.value = false

      return
    }

    if (error.value?.data) {
      setFormErrors(error.value?.data.errors ?? [])

      emit('on-error', error.value?.data.errors)

      isLoading.value = false
    }
  }

  return {
    isLoading,
    handleFormSubmit,
  }
}
