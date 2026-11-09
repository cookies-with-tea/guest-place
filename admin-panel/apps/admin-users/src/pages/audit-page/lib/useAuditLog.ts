import { ref, watch } from 'vue'

import { auditApi, type IAuditLogEntry, useDebouncedFilters, usePagination } from '@admin-panel/lib'

export interface IAuditLogFilters {
	action: string
	entityType: string
}

export function useAuditLog() {
	const filters = ref<IAuditLogFilters>({
		action: '',
		entityType: '',
	})

	const { debouncedFilters } = useDebouncedFilters(filters)
	const { pagination, setPage, setLimit } = usePagination()

	const entries = ref<IAuditLogEntry[]>([])
	const isLoading = ref(true)

	const loadData = async () => {
		isLoading.value = true

		try {
			const res = await auditApi.list({
				action: debouncedFilters.value.action || undefined,
				entityType: debouncedFilters.value.entityType || undefined,
				page: pagination.value.page,
				limit: pagination.value.limit,
			})

			entries.value = res.data?.items || []

			// Мутируем только total/totalPages — а не весь pagination.value объект (как это
			// делает usePagination().syncFrom(), рассчитанный на реактивный источник вида
			// useQuery().data, не на ручной fetch в composable): полная переприсвоение объекта
			// триггерило реактивность UiTable/el-pagination на каждый ответ и уходило в
			// бесконечный цикл запросов, даже когда page/limit фактически не менялись.
			const serverPagination = res.data?.pagination as { total?: number; totalPages?: number } | undefined

			if (serverPagination) {
				pagination.value.total = serverPagination.total ?? 0
				pagination.value.totalPages = serverPagination.totalPages ?? 0
			}
		} finally {
			isLoading.value = false
		}
	}

	watch(
		filters,
		() => {
			pagination.value.page = 1
		},
		{ deep: true }
	)

	watch([debouncedFilters, () => pagination.value.page, () => pagination.value.limit], loadData, {
		deep: true,
		immediate: true,
	})

	const resetFilters = () => {
		filters.value.action = ''
		filters.value.entityType = ''
	}

	return {
		entries,
		filters,
		isLoading,
		pagination,
		setPage,
		setLimit,
		resetFilters,
		loadData,
	}
}
