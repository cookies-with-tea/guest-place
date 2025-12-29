import type { TResponseErrors } from '../types'

export type IResponse<T> = {
  data: T
  errors: TResponseErrors
  messages: Array<string>
}
