import { useFormErrors } from './useFormErrors'
import type { IFormSubmitProps } from '../model'

export const useFormSubmit = <T extends object, U extends object>({
  formRef,
  validateFn,
  submitFn,
  onSuccess,
  onError,
}: IFormSubmitProps<T, U>) => {
  const { clearFormErrors, setFormErrors } = useFormErrors()

  const handleSubmit = async (formData: T): Promise<void> => {
    clearFormErrors()

    if (!formRef.value) return

    const isValid = validateFn ? await validateFn() : Promise.resolve(true)

    if (!isValid) return

    const result = await submitFn(formData)

    const { data, error } = result

    if (error.value?.data?.errors) {
      setFormErrors(error.value.data?.errors)

      onError?.(error)

      return
    }

    if (data.value?.data) {
      onSuccess?.(data.value.data)
    }
  }

  return { handleSubmit }
}
