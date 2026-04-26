import { computed, onMounted, ref, watch } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import { useI18n } from '@admin-panel/i18n'

import { createTranslation, deleteTranslation, fetchTranslations, updateTranslation } from '../../api'
import type { Translation, TranslationFilters } from '../../model'
import { TRANSLATIONS_QUERY_KEY } from '../../model'

// === PERSISTENT STATE (SHARED) ===
const filters = ref<TranslationFilters>({
	namespace: undefined,
	language: undefined,
	search: undefined,
})

const pagination = ref({
	page: 1,
	limit: 10,
	total: 0,
})

const isModalOpen = ref(false)
const editingTranslation = ref<Translation | null>(null)

export const useTranslations = () => {
	const { loadLanguages, loadNamespaces } = useI18n()

	const fetchedNamespaces = ref<string[]>([])
	const fetchedLanguages = ref<string[]>([])

	onMounted(async () => {
		const [ns, langs] = await Promise.all([loadNamespaces(), loadLanguages()])

		fetchedNamespaces.value = ns

		fetchedLanguages.value = langs.map((l) => l.code)
	})

	// === Query ===
	const queryKey = computed(() => [
		TRANSLATIONS_QUERY_KEY,
		{ ...filters.value, page: pagination.value.page, limit: pagination.value.limit },
	])

	const queryClient = useQueryClient()

	const translationsQuery = useQuery({
		queryKey,
		queryFn: () =>
			fetchTranslations({
				...filters.value,
				page: pagination.value.page,
				limit: pagination.value.limit,
			}),
	})

	// Sync pagination from response
	watch(
		() => translationsQuery.data?.value?.data?.pagination,
		(newPagination) => {
			if (newPagination) {
				pagination.value = { ...newPagination }
			}
		},
		{ immediate: true }
	)

	// === Actions ===
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
		mutationFn: (id: string) => deleteTranslation(id, filters.value.language),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [TRANSLATIONS_QUERY_KEY] })
		},
	})

	const handleSubmit = (data: Translation | Omit<Translation, 'id'> | Array<Omit<Translation, 'id'>>) => {
		if (Array.isArray(data)) {
			createMutation.mutate(data as any) // Backend now supports Array
		} else if ('id' in data) {
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

	const setlimit = (size: number) => {
		pagination.value.limit = size

		pagination.value.page = 1
	}

	// Сброс страницы при изменении фильтров
	watch(filters, () => {
		pagination.value.page = 1
	})

	const translations = computed(() => translationsQuery.data.value?.data?.items || [])

	const allNamespaces = computed(() => {
		const ns = new Set<string>(fetchedNamespaces.value)

		translations.value.forEach((t: any) => {
			if (t.key.includes('.')) ns.add(t.key.split('.')[0])
			if (t.namespace) ns.add(t.namespace)
		})

		// Add currently active filter if missing
		if (filters.value.namespace) ns.add(filters.value.namespace)

		return Array.from(ns).sort()
	})

	const allLanguages = computed(() => {
		const langs = new Set<string>(fetchedLanguages.value)

		translations.value.forEach((t: any) => {
			if (t.locale) langs.add(t.locale)
		})

		if (filters.value.language) langs.add(filters.value.language)

		return Array.from(langs).sort()
	})

	return {
		// state
		filters,
		pagination,
		isModalOpen,
		editingTranslation,
		isSubmitting: computed(() => createMutation.isPending.value || updateMutation.isPending.value),

		// data
		translations,
		allNamespaces,
		allLanguages,
		isLoading: translationsQuery.isLoading,

		// actions
		openAddModal,
		openEditModal,
		closeModal,
		handleSubmit,
		handleDelete,
		setPage,
		setlimit,
	}
}
