import type { TResponseErrors } from '#shared/types'
import type { IResponse } from '#shared/interfaces'

export type IUseFormOptions<T> = {
  data?: T
  errors?: TResponseErrors
  rules?: any
  notification?:
    | {
    title?: string
    message?: string
  }
    | boolean
  action?: (data?: T) => Promise<IResponse<T>>
}

export interface IEmits<T> {
  'on-success': [data: T]
  'on-error': [errors: TResponseErrors]
}
