export type SnakeToCamel<S> = S extends `${infer T}_${infer U}` ? `${T}${Capitalize<SnakeToCamel<U>>}` : S

export type CamelCasedProperties<T> = {
  [K in keyof T as SnakeToCamel<K & string>]: T[K] extends object
    ? T[K] extends Array<infer U>
      ? U extends object
        ? Array<CamelCasedProperties<U>>
        : T[K]
      : CamelCasedProperties<T[K]>
    : T[K]
}

type _CamelToSnake<T extends string> = T extends `${infer A}${infer B}`
  ? B extends Uncapitalize<B>
    ? `${Uncapitalize<A>}${_CamelToSnake<B>}`
    : `${Uncapitalize<A>}_${_CamelToSnake<Uncapitalize<B>>}`
  : Uncapitalize<T>

export type CamelToSnake<T extends string> = T extends '' ? '' : _CamelToSnake<T>

export type SnakeCasedProperties<T> = {
  [K in keyof T as CamelToSnake<K & string>]: T[K] extends object
    ? T[K] extends Array<infer U>
      ? U extends object
        ? Array<SnakeCasedProperties<U>>
        : T[K]
      : SnakeCasedProperties<T[K]>
    : T[K]
}
