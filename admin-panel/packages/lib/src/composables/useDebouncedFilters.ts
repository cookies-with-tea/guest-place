import { ref, type Ref } from 'vue'
import { watchDebounced } from '@vueuse/core'

/**
 * Debounces a reactive filters object before it hits the query key, so typing
 * in a search field doesn't refetch on every keystroke. Every entity list
 * composable (users, media, translations, ...) otherwise reimplements the
 * same `watchDebounced` block identically.
 */
export const useDebouncedFilters = <T extends object>(filters: Ref<T>, debounce = 500) => {
	const debouncedFilters = ref({ ...filters.value }) as Ref<T>

	watchDebounced(
		filters,
		(val) => {
			debouncedFilters.value = { ...val }
		},
		{ debounce, deep: true }
	)

	return { debouncedFilters }
}
