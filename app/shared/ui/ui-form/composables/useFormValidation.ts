import { ref } from 'vue'
import Schema, { type Rules } from 'async-validator'
import { useFormErrors } from './useFormErrors'
import type { TResponseErrors } from '#shared/types'

export const useFormValidation = () => {
  const { setFormErrors, clearFormErrors } = useFormErrors()

  const isValid = ref(true)

  const validate = async <T extends Record<string, any>>(data: Ref<T>, rules: Rules): Promise<boolean> => {
    clearFormErrors()

    const validator = new Schema(rules)

    try {
      await validator.validate(data.value)

      isValid.value = true

      return true
    } catch (e: any) {
      isValid.value = false

      const errors: TResponseErrors = []

      if (e.errors && Array.isArray(e.errors)) {
        e.errors.forEach((err: { field?: string; message?: string }) => {
          if (err.field) {
            let fieldErrors = errors.find((item) => item[err.field as string])

            if (!fieldErrors) {
              fieldErrors = { [err.field]: [] }

              errors.push(fieldErrors)
            }

            if (err?.field && fieldErrors[err.field]) {
              fieldErrors[err.field]!.push(err.message || 'Validation error')
            }
          }
        })
      }

      setFormErrors(errors)

      return false
    }
  }

  return {
    isValid,
    validate,
  }
}
