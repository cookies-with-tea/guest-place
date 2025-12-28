import type { TResponseErrors } from '#shared/types'
import { useState } from '#imports'

export const useFormErrors = () => {
  const formErrors = useState<Record<string, string>>('formErrors', () => ({}))

  const clearFormErrors = () => {
    formErrors.value = {}
  }

  const setFormErrors = (errors: TResponseErrors) => {
    const newErrors: Record<string, string> = {}

    if (errors?.length && errors[0]) {
      Object.entries(errors[0]).forEach(([field, errors]) => {
        if (errors && errors[0]) {
          newErrors[field] = errors[0]
        }
      })
    }

    formErrors.value = newErrors
  }

  return {
    formErrors,
    clearFormErrors,
    setFormErrors,
  }
}
