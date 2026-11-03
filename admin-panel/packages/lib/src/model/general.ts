export type SnakeToCamel<S> = S extends `${infer T}_${infer U}` ? `${T}${Capitalize<SnakeToCamel<U>>}` : S

export type CamelCasedProperties<T> =
	T extends Array<infer U>
		? Array<CamelCasedProperties<U>>
		: {
				[K in keyof T as SnakeToCamel<K & string>]: T[K] extends object
					? T[K] extends Array<infer V>
						? Array<CamelCasedProperties<V>>
						: CamelCasedProperties<T[K]>
					: T[K]
			}

type _CamelToSnake<T extends string> = T extends `${infer A}${infer B}`
	? B extends Uncapitalize<B>
		? `${Uncapitalize<A>}${_CamelToSnake<B>}`
		: `${Uncapitalize<A>}_${_CamelToSnake<Uncapitalize<B>>}`
	: Uncapitalize<T>

export type CamelToSnake<T extends string> = T extends '' ? '' : _CamelToSnake<T>

export type SnakeCasedProperties<T> =
	T extends Array<infer U>
		? Array<SnakeCasedProperties<U>>
		: {
				[K in keyof T as CamelToSnake<K & string>]: T[K] extends object
					? T[K] extends Array<infer V>
						? Array<SnakeCasedProperties<V>>
						: SnakeCasedProperties<T[K]>
					: T[K]
			}

export interface IPagination {
	page: number
	total: number
	totalPages: number
	limit: number
}

export interface IPaginationQuery {
	page?: number
	limit?: number
}

export interface IWithPagination<T> {
	items: T[]
	pagination: IPagination
}
