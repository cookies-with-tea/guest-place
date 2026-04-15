import { useFormErrors } from './useFormErrors'
import { useFormValidation } from './useFormValidation'
import type { IFormSubmitProps } from '../model'
import type { Ref } from 'vue'

export const useForm = <T extends object, U extends object>({
  submitFn,
  onSuccess,
  onError,
  rules,
}: IFormSubmitProps<T, U>) => {
  const { clearFormErrors, setFormErrors } = useFormErrors()
  const { validate } = useFormValidation()

  const handleSubmit = async (formData: Ref<T>): Promise<void> => {
    clearFormErrors()

    const isValid = rules ? await validate(formData, rules) : true

    if (!isValid) return

    try {
      const data = await submitFn(formData.value)

      onSuccess?.(data.data)
    } catch (error: any) {
      if (error.errors) {
        setFormErrors([error.errors])

        onError?.(error)
      }
    }
  }

  return { handleSubmit }
}
