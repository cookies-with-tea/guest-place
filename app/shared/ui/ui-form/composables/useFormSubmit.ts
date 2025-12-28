import { useFormErrors } from './useFormErrors'
import { useFormValidation } from './useFormValidation'
import type { IFormSubmitProps } from '../model'

export const useFormSubmit = <T extends object, U extends object>({
  submitFn,
  onSuccess,
  onError,
  rules
}: IFormSubmitProps<T, U>) => {
  const { clearFormErrors, setFormErrors } = useFormErrors()
  const { validate } = useFormValidation()

  const handleSubmit = async (formData: Ref<T>): Promise<void> => {
    clearFormErrors()

    const isValid = !rules ? Promise.resolve(true) : validate(formData, rules)

    if (!await isValid) return

    const result = await submitFn(formData.value)

    console.log(result)

    if (result.value?.errors) {
      setFormErrors([result.value.errors])

      onError?.(result.value.errors)

      return
    }

    if (result.value?.data) {
      onSuccess?.(result.value?.data)
    }
  }

  return { handleSubmit }
}
