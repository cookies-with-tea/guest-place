import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { venuesApi, type Venue } from '#entities/venues/api'

/**
 * Owns the venues catalog: the list itself, search/status filters, pagination,
 * and delete. The live editor (create/edit) lives in a sibling composable.
 */
export function useVenuesCatalog() {
	const loading = ref(false)
	const venues = ref<Venue[]>([])
	const searchQuery = ref('')
	const statusFilter = ref('')
	const currentPage = ref(1)
	const pageSize = ref(10)
	const totalVenues = ref(0)

	async function fetchVenuesList() {
		loading.value = true
		try {
			const res = await venuesApi.getVenues({
				search: searchQuery.value?.trim() || undefined,
				status: statusFilter.value || undefined,
				page: currentPage.value,
				limit: pageSize.value,
			})
			const data = (res as any)?.data ?? res
			const items = Array.isArray(data) ? data : data?.items || []
			venues.value = items
			totalVenues.value = data?.pagination?.total ?? items.length
		} catch (e: any) {
			ElMessage.error(e.message || 'Ошибка загрузки списка площадок')
			venues.value = []
		} finally {
			loading.value = false
		}
	}

	function handlePageChange(page: number) {
		currentPage.value = page
		fetchVenuesList()
	}

	function handleSizeChange(size: number) {
		pageSize.value = size
		currentPage.value = 1
		fetchVenuesList()
	}

	function handleSearch() {
		currentPage.value = 1
		fetchVenuesList()
	}

	function getVenueThumb(row: any): string {
		const photos = row.gallery_photos || row.galleryPhotos
		if (photos && photos.length > 0) return photos[0]
		return 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=200&q=80'
	}

	async function handleDelete(row: Venue) {
		try {
			await venuesApi.deleteVenue(row.id)
			ElMessage.success(`Площадка "${row.title}" удалена`)
			fetchVenuesList()
		} catch (e: any) {
			ElMessage.error(e.message || 'Ошибка при удалении')
		}
	}

	return reactive({
		loading,
		venues,
		searchQuery,
		statusFilter,
		currentPage,
		pageSize,
		totalVenues,
		fetchVenuesList,
		handlePageChange,
		handleSizeChange,
		handleSearch,
		getVenueThumb,
		handleDelete,
	})
}

export type VenuesCatalog = ReturnType<typeof useVenuesCatalog>
