import { ref, computed, onMounted } from 'vue'
import { mediaApi } from '@/entities/media/api'
import { mediaUtils } from '@/entities/media/utils/media.utils'
import type { MediaItem, ICreateMedia, IUpdateMedia } from '@/entities/media/model'

export const useMedia = () => {
	// State
	const mediaItems = ref<MediaItem[]>([])
	const loading = ref(false)
	const error = ref<string | null>(null)
	const totalItems = ref(0)
	const currentPage = ref(1)
	const itemsPerPage = ref(10)
	const searchQuery = ref('')

	// Computed
	const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))

	// Methods
	const loadMedia = async (page: number = 1, limit: number = 10, search?: string) => {
		loading.value = true

		error.value = null

		currentPage.value = page

		itemsPerPage.value = limit

		searchQuery.value = search || ''

		const response = await mediaApi.getAll()

		mediaItems.value = (response.data.items as unknown as MediaItem[]) || []

		totalItems.value = (response.data.pagination.total as number) || 0

		loading.value = false
	}

	const createMedia = async (mediaData: ICreateMedia): Promise<MediaItem> => {
		loading.value = true

		error.value = null

		const formData = new FormData()

		Object.entries(mediaData).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				formData.append(key, value)
			}
		})

		const newMedia = await mediaApi.create(formData)

		// Refresh the list to include the new item
		await loadMedia(currentPage.value, itemsPerPage.value, searchQuery.value)

		loading.value = false

		return newMedia.data as unknown as MediaItem
	}

	const updateMedia = async (mediaData: IUpdateMedia): Promise<MediaItem> => {
		loading.value = true

		error.value = null

		const formData = new FormData()

		Object.entries(mediaData).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				formData.append(key, value)
			}
		})

		const updatedMedia = await mediaApi.update(mediaData.id, formData)
		// Find and update the item in the local array
		const index = mediaItems.value.findIndex((m) => m.id === mediaData.id)

		if (index !== -1) {
			mediaItems.value[index] = {
				...mediaItems.value[index],
				...(updatedMedia.data as unknown as MediaItem),
			}
		}

		loading.value = false

		return updatedMedia.data as unknown as MediaItem
	}

	const deleteMedia = async (id: string): Promise<void> => {
		loading.value = true

		error.value = null

		await mediaApi.deleteById(id)

		// Remove from local array
		mediaItems.value = mediaItems.value.filter((m) => m.id !== id)

		// Adjust total count
		totalItems.value -= 1

		loading.value = false
	}

	const deleteMultipleMedia = async (ids: string[]): Promise<void> => {
		loading.value = true

		error.value = null

		// Note: The existing API doesn't support bulk delete, so we'll delete one by one
		for (const id of ids) {
			await mediaApi.deleteById(id)
		}

		// Remove from local array
		mediaItems.value = mediaItems.value.filter((m) => !ids.includes(m.id))

		// Adjust total count
		totalItems.value -= ids.length

		loading.value = false
	}

	const getMediaById = async (id: string): Promise<MediaItem> => {
		loading.value = true

		error.value = null

		const media = await mediaApi.getById(id)

		loading.value = false

		return media.data as unknown as MediaItem
	}

	const searchMedia = async (query: string) => {
		await loadMedia(1, itemsPerPage.value, query)
	}

	const changePage = async (page: number) => {
		await loadMedia(page, itemsPerPage.value, searchQuery.value)
	}

	const changePageSize = async (limit: number) => {
		await loadMedia(1, limit, searchQuery.value)
	}

	// Lifecycle
	onMounted(() => {
		loadMedia()
	})

	return {
		// State
		mediaItems,
		loading,
		error,
		totalItems,
		currentPage,
		itemsPerPage,
		searchQuery,
		totalPages,

		// Methods
		loadMedia,
		createMedia,
		updateMedia,
		deleteMedia,
		deleteMultipleMedia,
		getMediaById,
		searchMedia,
		changePage,
		changePageSize,

		// Utilities
		mediaUtils,
	}
}
