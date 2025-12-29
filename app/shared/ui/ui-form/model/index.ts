import type { TResponseErrors } from '#shared/types'
import type { Rules } from 'async-validator'
import type { Ref } from 'vue'
import type { IResponse } from '#shared/interfaces'

export type IUseFormOptions<T> = {
  data?: T
  errors?: TResponseErrors
  rules?: Rules
}

export interface IEmits<T> {
  'on-success': [data: T]
  'on-error': [errors: TResponseErrors]
}

export interface IFormExpose {
  validate: () => Promise<boolean>
}

export type TFormInstance = IFormExpose

export interface IFormSubmitProps<T, U> {
  rules?: Rules
  data: Ref
  submitFn: (data: T) => Promise<IResponse<U>>
  onSuccess?: (data: U) => void
  onError?: (error: any) => void
}
