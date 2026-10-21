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

	const handleBulkOptimize = async (uuids: string[]) => {
		await mediaApi.optimizeBulk(uuids)

		queryClient.invalidateQueries({ queryKey: [MEDIA_QUERY_KEY] })
	}

	const handleOptimize = async (uuid: string) => {
		await mediaApi.optimize(uuid)

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

	const resetFilters = () => {
		filters.value.search = ''

		filters.value.mediaTypes = []

		filters.value.category = []

		filters.value.tags = []

		filters.value.source = []

		filters.value.minSizeBytes = undefined

		filters.value.maxSizeBytes = undefined

		filters.value.dateFrom = undefined

		filters.value.dateTo = undefined

		filters.value.sortBy = 'created_at'

		filters.value.sortOrder = 'DESC'
	}

	const setSizePreset = (preset: 'all' | 'small' | 'medium' | 'large' | 'huge') => {
		switch (preset) {
			case 'small':
				filters.value.minSizeBytes = undefined

				filters.value.maxSizeBytes = 1024 * 1024 // < 1MB

				break
			case 'medium':
				filters.value.minSizeBytes = 1024 * 1024 // 1MB

				filters.value.maxSizeBytes = 5 * 1024 * 1024 // 5MB

				break
			case 'large':
				filters.value.minSizeBytes = 5 * 1024 * 1024 // 5MB

				filters.value.maxSizeBytes = 20 * 1024 * 1024 // 20MB

				break
			case 'huge':
				filters.value.minSizeBytes = 20 * 1024 * 1024 // > 20MB

				filters.value.maxSizeBytes = undefined

				break
			case 'all':
			default:
				filters.value.minSizeBytes = undefined

				filters.value.maxSizeBytes = undefined

				break
		}
	}

	// === Folders & Tags & Config ===
	const foldersQuery = useQuery({
		queryKey: ['media-folders'],
		queryFn: () => mediaApi.getFolders(),
	})

	const folders = computed(() => foldersQuery.data.value?.data || [])

	const tagsQuery = useQuery({
		queryKey: ['media-tags'],
		queryFn: () => mediaApi.getTags(),
	})

	const mediaTags = computed(() => tagsQuery.data.value?.data || [])

	const configQuery = useQuery({
		queryKey: ['media-config'],
		queryFn: () => mediaApi.getConfig(),
	})

	const mediaConfig = computed(() => configQuery.data.value?.data)

	const createFolderMutation = useMutation({
		mutationFn: (data: { name: string; parentId?: string | null; color?: string }) => mediaApi.createFolder(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['media-folders'] })
		},
	})

	const updateFolderMutation = useMutation({
		mutationFn: ({ id, data }: { id: string; data: { name?: string; parentId?: string | null; color?: string } }) =>
			mediaApi.updateFolder(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['media-folders'] })
		},
	})

	const deleteFolderMutation = useMutation({
		mutationFn: (id: string) => mediaApi.deleteFolder(id),
		onSuccess: () => {
			if (filters.value.folderId) {
				filters.value.folderId = undefined
			}
			queryClient.invalidateQueries({ queryKey: ['media-folders'] })
			queryClient.invalidateQueries({ queryKey: [MEDIA_QUERY_KEY] })
		},
	})

	const batchMoveMutation = useMutation({
		mutationFn: ({ uuids, folderId }: { uuids: string[]; folderId: string | null }) =>
			mediaApi.batchMove(uuids, folderId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [MEDIA_QUERY_KEY] })
			queryClient.invalidateQueries({ queryKey: ['media-folders'] })
		},
	})

	const selectFolder = (folderId?: string) => {
		filters.value.folderId = folderId
		pagination.value.page = 1
	}

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
		folders,
		mediaTags,
		mediaConfig,
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
		handleBulkOptimize,
		handleOptimize,
		createMedia: createMutation.mutateAsync,
		updateMedia: updateMutation.mutate,
		createFolder: createFolderMutation.mutateAsync,
		updateFolder: updateFolderMutation.mutateAsync,
		deleteFolder: deleteFolderMutation.mutateAsync,
		batchMove: batchMoveMutation.mutateAsync,
		selectFolder,
		setPage,
		setLimit,
		setSort,
		removeFilter,
		resetFilters,
		setSizePreset,
	}
}

export const filterMediaItemLocally = (item: MediaItem, filterValues: MediaFilters): boolean => {
	if (filterValues.search) {
		const q = filterValues.search.toLowerCase()
		const matchesName = item.name?.toLowerCase().includes(q)
		const matchesTitle = item.title?.toLowerCase().includes(q)
		const matchesAlt = item.alt?.toLowerCase().includes(q)
		const matchesCategory = item.category?.toLowerCase().includes(q)
		const matchesExtension = item.extension?.toLowerCase().includes(q)
		const matchesTags = item.tags?.some((t) => t.toLowerCase().includes(q))

		if (!matchesName && !matchesTitle && !matchesAlt && !matchesCategory && !matchesExtension && !matchesTags) {
			return false
		}
	}

	if (filterValues.mediaTypes && filterValues.mediaTypes.length > 0) {
		if (!filterValues.mediaTypes.includes(item.mediaType)) return false
	}

	if (filterValues.category && filterValues.category.length > 0) {
		if (!item.category || !filterValues.category.includes(item.category)) return false
	}

	if (filterValues.tags && filterValues.tags.length > 0) {
		if (!item.tags || !filterValues.tags.some((t) => item.tags?.includes(t))) return false
	}

	if (filterValues.folderId !== undefined && filterValues.folderId !== '') {
		if (filterValues.folderId === 'root' || filterValues.folderId === 'none') {
			if (item.folderId) return false
		} else {
			if (item.folderId !== filterValues.folderId) return false
		}
	}

	if (filterValues.minSizeBytes !== undefined && item.sizeBytes < filterValues.minSizeBytes) {
		return false
	}

	if (filterValues.maxSizeBytes !== undefined && item.sizeBytes > filterValues.maxSizeBytes) {
		return false
	}

	if (filterValues.dateFrom) {
		const fromTime = new Date(filterValues.dateFrom).getTime()
		const itemTime = new Date(item.createdAt).getTime()

		if (itemTime < fromTime) return false
	}

	if (filterValues.dateTo) {
		const toTime = new Date(filterValues.dateTo).getTime()
		const itemTime = new Date(item.createdAt).getTime()

		if (itemTime > toTime) return false
	}

	return true
}
