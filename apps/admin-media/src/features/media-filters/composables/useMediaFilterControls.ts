import { computed, reactive, ref, watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'

export const MEDIA_TYPE_OPTIONS = [
	{ value: 'all', label: 'All Media', icon: '📁' },
	{ value: 'image', label: 'Images', icon: '🖼️' },
	{ value: 'video', label: 'Videos', icon: '🎬' },
	{ value: 'document', label: 'Documents', icon: '📄' },
	{ value: 'archive', label: 'Archives', icon: '📦' },
	{ value: 'other', label: 'Other', icon: '📎' },
]

const PREDEFINED_CATEGORIES = ['Marketing', 'UI/UX', 'Content', 'Suites', 'Amenities', 'General']
const PREDEFINED_TAGS = ['hero', 'banner', 'logo', 'background', 'interior', 'exterior', 'room', 'luxury', 'promo']

interface FilterControlsDeps {
	filters: Ref<any>
	mediaItems: ComputedRef<any[]>
	folders: ComputedRef<any[]>
	removeFilter: (key: any) => void
	resetFilters: () => void
	setSizePreset: (preset: 'all' | 'small' | 'medium' | 'large' | 'huge') => void
	selectFolder: (folderId?: string) => void
}

/** Search/folder/type/category/tags/size/date filters for the media library, plus
 * the derived "active filter" badges shown to the user. */
export const useMediaFilterControls = (deps: FilterControlsDeps) => {
	const { filters, mediaItems, folders } = deps

	const selectedSizePreset = ref<string>('all')
	const dateRange = ref<[string, string] | null>(null)

	// Compute dynamic categories and tags from loaded media items
	const availableCategories = computed(() => {
		const set = new Set<string>(PREDEFINED_CATEGORIES)

		mediaItems.value.forEach((item) => {
			if (item.category) set.add(item.category)
		})

		return Array.from(set).sort()
	})

	const availableTags = computed(() => {
		const set = new Set<string>(PREDEFINED_TAGS)

		mediaItems.value.forEach((item) => {
			if (item.tags) {
				item.tags.forEach((t: string) => set.add(t))
			}
		})

		return Array.from(set).sort()
	})

	const isTypeActive = (typeVal: string) => {
		if (typeVal === 'all') {
			return !filters.value.mediaTypes || filters.value.mediaTypes.length === 0
		}

		return filters.value.mediaTypes?.includes(typeVal)
	}

	const toggleMediaType = (typeVal: string) => {
		if (typeVal === 'all') {
			filters.value.mediaTypes = []

			return
		}

		const current = [...(filters.value.mediaTypes || [])]
		const idx = current.indexOf(typeVal)

		if (idx === -1) {
			filters.value.mediaTypes = [typeVal]
		} else {
			filters.value.mediaTypes = []
		}
	}

	const handleSizePresetChange = (val: string) => {
		deps.setSizePreset(val as any)
	}

	const handleDateRangeChange = (val: [string, string] | null) => {
		if (val && val[0] && val[1]) {
			filters.value.dateFrom = val[0]
			filters.value.dateTo = val[1]
		} else {
			filters.value.dateFrom = undefined
			filters.value.dateTo = undefined
		}
	}

	const handleResetAll = () => {
		deps.resetFilters()
		filters.value.folderId = undefined
		selectedSizePreset.value = 'all'
		dateRange.value = null
	}

	const handleRemoveFilter = (key: any) => {
		if (key === 'folderId') {
			filters.value.folderId = undefined
		} else if (key === 'size') {
			selectedSizePreset.value = 'all'
			filters.value.minSizeBytes = undefined
			filters.value.maxSizeBytes = undefined
		} else if (key === 'date') {
			dateRange.value = null
			filters.value.dateFrom = undefined
			filters.value.dateTo = undefined
		} else {
			deps.removeFilter(key)
		}
	}

	// Keep dateRange/selectedSizePreset in sync when filters are cleared elsewhere
	watch(
		() => [filters.value.dateFrom, filters.value.dateTo],
		([from, to]) => {
			if (!from && !to) {
				dateRange.value = null
			}
		}
	)

	watch(
		() => [filters.value.minSizeBytes, filters.value.maxSizeBytes],
		([min, max]) => {
			if (min === undefined && max === undefined) {
				selectedSizePreset.value = 'all'
			}
		}
	)

	const hasActiveFilters = computed(() => {
		return (
			Boolean(filters.value.search) ||
			Boolean(filters.value.folderId) ||
			(filters.value.mediaTypes && filters.value.mediaTypes.length > 0) ||
			(filters.value.category && filters.value.category.length > 0) ||
			(filters.value.tags && filters.value.tags.length > 0) ||
			filters.value.minSizeBytes !== undefined ||
			filters.value.maxSizeBytes !== undefined ||
			Boolean(filters.value.dateFrom) ||
			Boolean(filters.value.dateTo)
		)
	})

	const activeFilterTags = computed(() => {
		const tags: { key: string; label: string; value: string }[] = []

		if (filters.value.folderId) {
			const f = folders.value.find((x) => x.id === filters.value.folderId)
			const fName = f ? f.name : filters.value.folderId === 'root' ? 'Unorganized' : 'Folder'

			tags.push({ key: 'folderId', label: 'Folder', value: fName })
		}

		if (filters.value.search) {
			tags.push({ key: 'search', label: 'Search', value: `"${filters.value.search}"` })
		}

		if (filters.value.mediaTypes && filters.value.mediaTypes.length > 0) {
			tags.push({ key: 'mediaTypes', label: 'Type', value: filters.value.mediaTypes.join(', ') })
		}

		if (filters.value.category && filters.value.category.length > 0) {
			tags.push({ key: 'category', label: 'Category', value: filters.value.category.join(', ') })
		}

		if (filters.value.tags && filters.value.tags.length > 0) {
			tags.push({ key: 'tags', label: 'Tags', value: filters.value.tags.map((t: string) => `#${t}`).join(', ') })
		}

		if (filters.value.minSizeBytes !== undefined || filters.value.maxSizeBytes !== undefined) {
			const sizeLabel =
				selectedSizePreset.value !== 'all'
					? selectedSizePreset.value
					: `${filters.value.minSizeBytes ? Math.round(filters.value.minSizeBytes / 1024 / 1024) + 'MB' : '0'} – ${filters.value.maxSizeBytes ? Math.round(filters.value.maxSizeBytes / 1024 / 1024) + 'MB' : '∞'}`

			tags.push({ key: 'size', label: 'Size', value: sizeLabel })
		}

		if (filters.value.dateFrom || filters.value.dateTo) {
			tags.push({
				key: 'date',
				label: 'Date',
				value: `${filters.value.dateFrom || 'start'} → ${filters.value.dateTo || 'end'}`,
			})
		}

		return tags
	})

	return reactive({
		filters,
		folders,
		selectedSizePreset,
		dateRange,
		availableCategories,
		availableTags,
		isTypeActive,
		toggleMediaType,
		handleSizePresetChange,
		handleDateRangeChange,
		handleResetAll,
		handleRemoveFilter,
		hasActiveFilters,
		activeFilterTags,
		selectFolder: deps.selectFolder,
	})
}

export type MediaFilterControls = ReturnType<typeof useMediaFilterControls>
