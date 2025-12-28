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
