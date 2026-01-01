export type TResponseErrors = Array<Record<string, Array<string>>>

export type IResponse<T> = {
  data: T
  errors: TResponseErrors
  messages: Array<string>
}
