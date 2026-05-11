import { computed, ref, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import type { IPagination } from '@admin-panel/lib'

import { mediaApi } from '../../api'
import { MEDIA_QUERY_KEY, type MediaFilters, type MediaItem } from '../../model'

// === Shared State (Singleton) ===
const isUploadModalOpen = ref(false)
const isPreviewDialogOpen = ref(false)
const isEditModalOpen = ref(false)

const filters = ref<MediaFilters>({
	search: '',
	sortBy: 'created_at',
	sortOrder: 'DESC',
	mediaTypes: [],
	category: [],
	tags: [],
})

const pagination = ref<IPagination>({
	page: 1,
	limit: 10,
	total: 0,
	totalPages: 0,
})

const currentMediaUuid = ref<string>('')

export const useMedia = () => {
	const queryClient = useQueryClient()

	const { create, update, getAll, deleteById, getById } = mediaApi

	const debouncedFilters = ref({ ...filters.value })

	watchDebounced(
		filters,
		(val) => {
			debouncedFilters.value = { ...val }
		},
		{ debounce: 500, deep: true }
	)

	// === Query ===
	const queryKey = computed(() => [
		MEDIA_QUERY_KEY,
		{
			...debouncedFilters.value,
			page: pagination.value.page,
			limit: pagination.value.limit,
		},
	])

	const mediaQuery = useQuery({
		queryKey,
		queryFn: () =>
			getAll({
				...debouncedFilters.value,
				page: pagination.value.page,
				limit: pagination.value.limit,
			}),
	})

	const mediaItems = computed(() => mediaQuery.data.value?.data.items || [])

	const { data: currentMedia, refetch: refetchCurrentMedia } = useQuery({
		queryKey: [MEDIA_QUERY_KEY, currentMediaUuid.value],
		queryFn: () => getById(currentMediaUuid.value || ''),
		enabled: !!currentMediaUuid.value,
	})

	watch(
		() => mediaQuery.data?.value?.data.pagination,
		(newPagination) => {
			if (newPagination) {
				pagination.value = { ...newPagination }
			}
		}
	)

	// === Modals / Dialogs ===
	const openUploadModal = () => {
		isUploadModalOpen.value = true
	}

	const closeUploadModal = () => {
		isUploadModalOpen.value = false
	}

	const openPreviewDialog = (uuid: string) => {
		currentMediaUuid.value = uuid

		isPreviewDialogOpen.value = true

		refetchCurrentMedia()
	}

	const closePreviewDialog = () => {
		isPreviewDialogOpen.value = false

		currentMediaUuid.value = ''
	}

	const closeEditModal = () => {
		isEditModalOpen.value = false

		currentMediaUuid.value = ''
	}

	const openEditModal = (uuid: string) => {
		currentMediaUuid.value = uuid

		isEditModalOpen.value = true

		refetchCurrentMedia()
	}

	// === Mutations ===
	const createMutation = useMutation({
		mutationFn: create,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [MEDIA_QUERY_KEY] })
		},
	})

	const updateMutation = useMutation({
		mutationFn: ({ uuid, data }: { uuid: string; data: Partial<MediaItem> }) => update(uuid, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [MEDIA_QUERY_KEY] })

			closeEditModal()
		},
	})

	const deleteMutation = useMutation({
		mutationFn: deleteById,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [MEDIA_QUERY_KEY] })
		},
	})

	const handleDelete = (uuid: string) => {
		deleteMutation.mutate(uuid)
	}

	const handleMultipleDelete = async (uuids: string[]) => {
		// Since there's no bulk delete API yet, we delete sequentially
		for (const uuid of uuids) {
			await deleteById(uuid)
		}

		queryClient.invalidateQueries({ queryKey: [MEDIA_QUERY_KEY] })
	}

	const handleBulkUpdate = async (uuids: string[], data: Partial<MediaItem>) => {
		await mediaApi.updateBulk(uuids, data)

		queryClient.invalidateQueries({ queryKey: [MEDIA_QUERY_KEY] })
	}

	// === Pagination & Filters ===
	const setPage = (page: number) => {
		pagination.value.page = page
	}

	const setLimit = (limit: number) => {
		pagination.value.limit = limit

		pagination.value.page = 1
	}

	const setSort = (prop: string, order: 'ASC' | 'DESC' | null) => {
		if (!order) {
			filters.value.sortBy = undefined

			filters.value.sortOrder = undefined
		} else {
			filters.value.sortBy = prop

			filters.value.sortOrder = order
		}
	}

	const removeFilter = (key: keyof MediaFilters) => {
		if (key === 'search') {
			filters.value.search = ''
		} else if (Array.isArray(filters.value[key])) {
			;(filters.value[key] as any) = []
		} else {
			;(filters.value[key] as any) = undefined
		}
	}

	watch(
		filters,
		() => {
			pagination.value.page = 1
		},
		{ deep: true }
	)

	return {
		// state
		filters,
		pagination,
		isUploadModalOpen,
		isPreviewDialogOpen,
		isEditModalOpen,
		currentMediaUuid,

		// data
		mediaItems,
		currentMedia,
		isLoading: mediaQuery.isLoading,
		isFetching: mediaQuery.isFetching,
		isSubmitting: createMutation.isPending || updateMutation.isPending,

		// actions
		openUploadModal,
		closeUploadModal,
		openPreviewDialog,
		closePreviewDialog,
		openEditModal,
		closeEditModal,
		handleDelete,
		handleMultipleDelete,
		handleBulkUpdate,
		createMedia: createMutation.mutateAsync,
		updateMedia: updateMutation.mutate,
		setPage,
		setLimit,
		setSort,
		removeFilter,
	}
}
