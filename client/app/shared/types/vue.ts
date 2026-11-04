// TODO: Понять как работает :D

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never

export type EmitFn<T extends { [K in keyof T]: any[] }> = UnionToIntersection<
  { [K in keyof T]: (event: K, ...payload: T[K]) => void }[keyof T]
>
