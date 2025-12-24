import { computed, ref, watch } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { fetchTranslations, createTranslation, updateTranslation, deleteTranslation } from '../../api'
import type { TranslationFilters, Translation } from '../../model'
import { TRANSLATIONS_QUERY_KEY } from '../../model'

export const useTranslations = () => {
	// === Filters & Pagination ===
	const filters = ref<TranslationFilters>({
		namespace: undefined,
		language: undefined,
		search: undefined,
	})

	const pagination = ref({
		page: 1,
		pageSize: 10,
		total: 0,
	})

	// === Query ===
	const queryKey = computed(() => [
		TRANSLATIONS_QUERY_KEY,
		{ ...filters.value, page: pagination.value.page, pageSize: pagination.value.pageSize },
	])

	const queryClient = useQueryClient()

	const translationsQuery = useQuery({
		queryKey,
		queryFn: () =>
			fetchTranslations({
				...filters.value,
				page: pagination.value.page,
				pageSize: pagination.value.pageSize,
			}),
	})

	// Sync pagination from response
	watch(
		() => translationsQuery.data?.value?.pagination,
		(newPagination) => {
			if (newPagination) {
				pagination.value = { ...newPagination }
			}
		}
	)

	// === Modal state ===
	const isModalOpen = ref(false)
	const editingTranslation = ref<Translation | null>(null)

	const openAddModal = () => {
		editingTranslation.value = null

		isModalOpen.value = true
	}

	const openEditModal = (t: Translation) => {
		editingTranslation.value = t

		isModalOpen.value = true
	}

	const closeModal = () => {
		isModalOpen.value = false

		editingTranslation.value = null
	}

	// === Mutations ===
	const createMutation = useMutation({
		mutationFn: createTranslation,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [TRANSLATIONS_QUERY_KEY] })

			closeModal()
		},
	})

	const updateMutation = useMutation({
		mutationFn: updateTranslation,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [TRANSLATIONS_QUERY_KEY] })

			closeModal()
		},
	})

	const deleteMutation = useMutation({
		mutationFn: deleteTranslation,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [TRANSLATIONS_QUERY_KEY] })
		},
	})

	const handleSubmit = (data: Translation | Omit<Translation, 'id'>) => {
		if ('id' in data) {
			updateMutation.mutate(data)
		} else {
			createMutation.mutate(data as Omit<Translation, 'id'>)
		}
	}

	const handleDelete = (id: string) => {
		deleteMutation.mutate(id)
	}

	// === Pagination & filters ===
	const setPage = (page: number) => {
		pagination.value.page = page
	}

	const setPageSize = (size: number) => {
		pagination.value.pageSize = size

		pagination.value.page = 1
	}

	// Сброс страницы при изменении фильтров
	watch(filters, () => {
		pagination.value.page = 1
	})

	return {
		// state
		filters,
		pagination,
		isModalOpen,
		editingTranslation,

		// data
		translations: computed(() => translationsQuery.data.value?.data || []),
		isLoading: translationsQuery.isLoading,

		// actions
		openAddModal,
		openEditModal,
		closeModal,
		handleSubmit,
		handleDelete,
		setPage,
		setPageSize,
	}
}
