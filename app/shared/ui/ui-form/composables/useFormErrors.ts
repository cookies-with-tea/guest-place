import { ref } from 'vue'
import type { TResponseErrors } from '#shared/types'

const snakeToCamelCase = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, char) => char.toUpperCase())
}

const mapErrorsKeysToCamelCase = (errors: TResponseErrors): TResponseErrors => {
  const result: TResponseErrors = {} as TResponseErrors

  for (const [key, messages] of Object.entries(errors)) {
    if (typeof key === 'string') {
      const camelKey = snakeToCamelCase(key)

      Object.assign(result, {
        [camelKey]: messages,
      })
    }
  }

  return result
}

const formErrors = ref<Record<string, string>>({})

export const useFormErrors = () => {
  const clearFormErrors = () => {
    formErrors.value = {}
  }

  const setFormErrors = (errors: TResponseErrors) => {
    const camelCaseErrors = mapErrorsKeysToCamelCase(errors)
    const newErrors: Record<string, string> = {}

    for (const [field, messages] of Object.entries(camelCaseErrors)) {
      if (Array.isArray(messages) && messages.length > 0) {
        newErrors[field] = messages[0]
      }
    }

    formErrors.value = newErrors
  }

  return {
    formErrors,
    clearFormErrors,
    setFormErrors,
  }
}
