import type { TResponseErrors } from '#shared/types'

export const useFormErrors = () => {
  const formErrors = useState<Record<string, string>>('formErrors', () => ({}))

  const clearFormErrors = () => {
    formErrors.value = {}
  }

  const setFormErrors = (errors: TResponseErrors) => {
    const newErrors: Record<string, string> = {}

    for (const [field, messages] of Object.entries(errors)) {
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
