import { ref, watch, type WatchSource } from 'vue'

import type { IPagination } from '../model/general'

const DEFAULT_PAGINATION: IPagination = {
	page: 1,
	limit: 10,
	total: 0,
	totalPages: 0,
}

/**
 * Shared pagination state + the setPage/setLimit/sync-from-response logic that
 * every entity list composable (users, media, translations, ...) otherwise
 * reimplements identically. Call once at module scope in the entity
 * composable file to get the same module-level singleton `pagination` ref
 * these composables already relied on, then call `syncFrom` inside the
 * exported `useX()` with the query's pagination field.
 */
export const usePagination = (initial: Partial<IPagination> = {}) => {
	const pagination = ref<IPagination>({ ...DEFAULT_PAGINATION, ...initial })

	const setPage = (page: number) => {
		pagination.value.page = page
	}

	const setLimit = (limit: number) => {
		pagination.value.limit = limit

		pagination.value.page = 1
	}

	const syncFrom = (source: WatchSource<IPagination | undefined>, options: { immediate?: boolean } = {}) => {
		watch(
			source,
			(newPagination) => {
				if (newPagination) {
					pagination.value = { ...pagination.value, ...newPagination }
				}
			},
			options
		)
	}

	return { pagination, setPage, setLimit, syncFrom }
}
