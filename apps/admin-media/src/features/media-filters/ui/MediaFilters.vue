<template>
	<div class="media-filters">
		<div class="media-filters__card">
			<!-- Header & Search -->
			<div class="media-filters__header">
				<div class="media-filters__title">
					<h2>Media Library</h2>
					<p>Manage and organize your digital assets with advanced search and filtering</p>
				</div>
				<div class="header-actions">
					<el-input
						v-model="filters.search"
						class="search-input"
						clearable
						placeholder="Smart search (name, alt, tags, ext...)"
						:prefix-icon="SearchIcon"
					/>
					<el-button :icon="PlusIcon" type="primary" @click="openUploadModal">Upload Media</el-button>
				</div>
			</div>

			<!-- Quick Type Filter Buttons -->
			<div class="media-filters__type-bar">
				<div class="type-pills">
					<button
						v-for="typeOption in mediaTypeOptions"
						:key="typeOption.value"
						class="type-pill"
						:class="{ 'is-active': isTypeActive(typeOption.value) }"
						type="button"
						@click="toggleMediaType(typeOption.value)"
					>
						<span class="type-pill-icon">{{ typeOption.icon }}</span>
						<span class="type-pill-label">{{ typeOption.label }}</span>
					</button>
				</div>
			</div>

			<!-- Filter Controls Row -->
			<div class="media-filters__controls">
				<!-- Category Filter -->
				<div class="filter-control-item">
					<label class="control-label">Category</label>
					<el-select
						v-model="filters.category"
						clearable
						collapse-tags
						collapse-tags-tooltip
						filterable
						multiple
						placeholder="All Categories"
						style="width: 170px"
					>
						<el-option v-for="cat in availableCategories" :key="cat" :label="cat" :value="cat" />
					</el-select>
				</div>

				<!-- Tags Filter -->
				<div class="filter-control-item">
					<label class="control-label">Tags</label>
					<el-select
						v-model="filters.tags"
						allow-create
						clearable
						collapse-tags
						collapse-tags-tooltip
						default-first-option
						filterable
						multiple
						placeholder="Filter by tags"
						style="width: 200px"
					>
						<el-option v-for="tag in availableTags" :key="tag" :label="`#${tag}`" :value="tag" />
					</el-select>
				</div>

				<!-- Size Filter Presets -->
				<div class="filter-control-item">
					<label class="control-label">Size</label>
					<el-select
						v-model="selectedSizePreset"
						clearable
						placeholder="Any size"
						style="width: 150px"
						@change="handleSizePresetChange"
					>
						<el-option label="Any size" value="all" />
						<el-option label="Small (< 1 MB)" value="small" />
						<el-option label="Medium (1–5 MB)" value="medium" />
						<el-option label="Large (5–20 MB)" value="large" />
						<el-option label="Huge (> 20 MB)" value="huge" />
					</el-select>
				</div>

				<!-- Date Range Filter -->
				<div class="filter-control-item date-filter">
					<label class="control-label">Date</label>
					<el-date-picker
						v-model="dateRange"
						end-placeholder="To"
						format="YYYY-MM-DD"
						range-separator="—"
						start-placeholder="From"
						style="width: 240px"
						type="daterange"
						value-format="YYYY-MM-DD"
						@change="handleDateRangeChange"
					/>
				</div>

				<!-- Reset Filters -->
				<div v-if="hasActiveFilters" class="filter-control-item reset-button-item">
					<el-button :icon="RefreshRightIcon" plain type="info" @click="handleResetAll"> Reset Filters </el-button>
				</div>
			</div>

			<!-- Active Filter Badges -->
			<div v-if="activeFilterTags.length > 0" class="media-filters__tags">
				<span class="tags-label">Active filters:</span>
				<el-tag
					v-for="tag in activeFilterTags"
					:key="tag.key"
					class="gp-tag"
					closable
					round
					@close="handleRemoveFilter(tag.key as any)"
				>
					<span class="tag-key">{{ tag.label }}:</span>
					<span class="tag-value">{{ tag.value }}</span>
				</el-tag>
				<el-button link size="small" type="primary" @click="handleResetAll"> Clear all </el-button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { Plus as PlusIcon, RefreshRight as RefreshRightIcon, Search as SearchIcon } from '@element-plus/icons-vue'

import { useMedia } from '#entities/media'

const { filters, openUploadModal, removeFilter, resetFilters, setSizePreset, mediaItems } = useMedia()

const selectedSizePreset = ref<string>('all')
const dateRange = ref<[string, string] | null>(null)

const mediaTypeOptions = [
	{ value: 'all', label: 'All Media', icon: '📁' },
	{ value: 'image', label: 'Images', icon: '🖼️' },
	{ value: 'video', label: 'Videos', icon: '🎬' },
	{ value: 'document', label: 'Documents', icon: '📄' },
	{ value: 'archive', label: 'Archives', icon: '📦' },
	{ value: 'other', label: 'Other', icon: '📎' },
]

const predefinedCategories = ['Marketing', 'UI/UX', 'Content', 'Suites', 'Amenities', 'General']
const predefinedTags = ['hero', 'banner', 'logo', 'background', 'interior', 'exterior', 'room', 'luxury', 'promo']

// Compute dynamic categories and tags from loaded media items
const availableCategories = computed(() => {
	const set = new Set<string>(predefinedCategories)

	mediaItems.value.forEach((item) => {
		if (item.category) set.add(item.category)
	})

	return Array.from(set).sort()
})

const availableTags = computed(() => {
	const set = new Set<string>(predefinedTags)

	mediaItems.value.forEach((item) => {
		if (item.tags) {
			item.tags.forEach((t) => set.add(t))
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
	setSizePreset(val as any)
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
	resetFilters()

	selectedSizePreset.value = 'all'

	dateRange.value = null
}

const handleRemoveFilter = (key: any) => {
	if (key === 'size') {
		selectedSizePreset.value = 'all'

		filters.value.minSizeBytes = undefined

		filters.value.maxSizeBytes = undefined
	} else if (key === 'date') {
		dateRange.value = null

		filters.value.dateFrom = undefined

		filters.value.dateTo = undefined
	} else {
		removeFilter(key)
	}
}

// Watch filters to sync dateRange and selectedSizePreset
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
		tags.push({ key: 'tags', label: 'Tags', value: filters.value.tags.map((t) => `#${t}`).join(', ') })
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
</script>

<style scoped>
.media-filters {
	margin-bottom: 24px;
}

.media-filters__card {
	display: flex;
	flex-direction: column;
	border: 1px solid var(--border-color);
	border-radius: 16px;
	box-shadow: var(--shadow-sm);
	background: var(--bg-card);
	transition: all 0.3s ease;
	padding: 24px;
	gap: 18px;
}

.media-filters__header {
	display: flex;
	flex-wrap: wrap;
	align-items: flex-start;
	justify-content: space-between;
	gap: 24px;
}

.header-actions {
	display: flex;
	align-items: center;
	gap: 16px;
}

.search-input {
	width: 320px;
}

.media-filters__title h2 {
	font-weight: 700;
	font-size: 24px;
	color: var(--text-primary);
	margin: 0;
}

.media-filters__title p {
	font-size: 14px;
	color: var(--text-muted);
	margin: 6px 0 0;
}

/* Type Pills Bar */
.media-filters__type-bar {
	display: flex;
	align-items: center;
	padding-bottom: 4px;
	overflow-x: auto;
}

.type-pills {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.type-pill {
	display: inline-flex;
	align-items: center;
	border: 1px solid var(--border-color);
	border-radius: 20px;
	font-weight: 500;
	font-size: 13px;
	color: var(--text-primary);
	background: var(--bg-surface);
	transition: all 0.2s ease;
	cursor: pointer;
	padding: 6px 14px;
	gap: 6px;
}

.type-pill:hover {
	border-color: var(--accent-primary);
	color: var(--accent-primary);
}

.type-pill.is-active {
	border-color: var(--accent-primary);
	color: #fff;
	background: var(--accent-primary);
}

.type-pill-icon {
	font-size: 14px;
}

/* Controls Grid */
.media-filters__controls {
	display: flex;
	flex-wrap: wrap;
	align-items: flex-end;
	border-top: 1px solid var(--border-color);
	padding-top: 10px;
	gap: 16px;
}

.filter-control-item {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.control-label {
	font-weight: 600;
	font-size: 12px;
	letter-spacing: 0.5px;
	text-transform: uppercase;
	color: var(--text-muted);
}

.reset-button-item {
	margin-left: auto;
}

/* Tags Section */
.media-filters__tags {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	border-top: 1px dashed var(--border-color);
	padding-top: 14px;
	gap: 10px;
}

.tags-label {
	font-weight: 500;
	font-size: 13px;
	color: var(--text-muted);
	margin-right: 4px;
}

.gp-tag {
	height: auto;
	border: 1px solid var(--border-color);
	border-radius: 20px;
	font-size: 13px;
	color: var(--text-primary);
	background: var(--bg-surface);
	transition: all 0.2s ease;
	padding: 6px 12px;
}

.gp-tag:hover {
	border-color: var(--accent-primary);
}

.tag-key {
	font-weight: 500;
	margin-right: 6px;
	opacity: 0.85;
}

.tag-value {
	font-weight: 600;
}

:deep(.el-input__wrapper) {
	border-radius: 12px;
	box-shadow: 0 0 0 1px var(--border-color) inset;
	background-color: var(--bg-surface);
	padding: 6px 12px;
}

:deep(.el-input__wrapper.is-focus) {
	box-shadow: 0 0 0 1px var(--accent-primary) inset !important;
}

:deep(.el-select__wrapper) {
	border-radius: 12px;
	box-shadow: 0 0 0 1px var(--border-color) inset;
	background-color: var(--bg-surface);
}

:deep(.el-date-editor) {
	border-radius: 12px;
}
</style>
