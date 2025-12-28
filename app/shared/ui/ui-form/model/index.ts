import type { TResponseErrors } from '#shared/types'
import type { Rules } from 'async-validator'
import type { AsyncData } from 'nuxt/app'
import type { IResponse } from '~/shared/interfaces'
import type { FetchError } from 'ofetch'

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
  data: Ref<T>
  submitFn: (data: T) => AsyncData<IResponse<U> | undefined, FetchError<any> | undefined>
  onSuccess?: (data: U) => void
  onError?: (error: any) => void
}
