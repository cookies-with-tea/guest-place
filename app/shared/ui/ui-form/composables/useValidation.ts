import { ref } from 'vue'
import Schema from 'async-validator'
import type { TResponseErrors } from '#shared/types'
import { useFormErrors } from './useFormErrors'

export const useValidation = <T extends Record<string, any>>(data: T, rules: Record<keyof T, any[]>) => {
  const isValid = ref(true)
  const { setFormErrors, clearFormErrors } = useFormErrors()

  const validate = async (): Promise<boolean> => {
    clearFormErrors()

    const validator = new Schema(rules)

    try {
      await validator.validate(data)

      isValid.value = true

      return true
    } catch (e: any) {
      isValid.value = false

      const errors: TResponseErrors = {} as TResponseErrors

      if (e.errors && Array.isArray(e.errors)) {
        e.errors.forEach((err: { field?: string; message?: string }) => {
          if (err.field) {
            if (!errors[err.field]) {
              errors[err.field] = []
            }

            errors[err.field].push(err.message || 'Ошибка валидации')
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
