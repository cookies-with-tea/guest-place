import { ref } from 'vue'
import { useValidation } from '../composables'
import type { IUseFormOptions } from '../model'

export const useForm = <T>(options: IUseFormOptions<T>) => {
  const isValid = ref(true)

  if (!options?.data) {
    throw new Error('Data is required')
  }

  if (!options?.rules) {
    isValid.value = true

    return {
      isValid,
      validate: () => Promise.resolve(true),
    }
  }

  const { isValid: isFormValid, validate } = useValidation(options.data, options.rules)

  return {
    isValid: isFormValid,
    validate,
  }
}
