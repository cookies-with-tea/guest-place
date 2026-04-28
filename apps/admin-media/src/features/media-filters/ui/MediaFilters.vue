<template>
	<div class="media-filters">
		<div class="media-filters__card">
			<div class="media-filters__header">
				<div class="media-filters__title">
					<h2>Media Library</h2>
					<p>Manage and organize your digital assets with advanced search</p>
				</div>
				<div class="header-actions">
					<el-input
						v-model="filters.search"
						class="search-input"
						clearable
						placeholder="Search everywhere..."
						:prefix-icon="SearchIcon"
					/>
					<el-button :icon="PlusIcon" type="primary" @click="openUploadModal">Upload Media</el-button>
				</div>
			</div>

			<div v-if="activeFilterTags.length > 0" class="media-filters__tags">
				<span class="tags-label">Active filters:</span>
				<el-tag
					v-for="tag in activeFilterTags"
					:key="tag.key"
					class="gp-tag"
					closable
					round
					@close="removeFilter(tag.key as any)"
				>
					<span class="tag-key">{{ tag.label }}:</span>
					<span class="tag-value">{{ tag.value }}</span>
				</el-tag>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { Plus as PlusIcon, Search as SearchIcon } from '@element-plus/icons-vue'

import { useMedia } from '#entities/media'

const { filters, openUploadModal, removeFilter } = useMedia()

const filterLabels: Record<string, string> = {
	search: 'Search',
	mediaTypes: 'Type',
	category: 'Category',
	tags: 'Tags',
}

const activeFilterTags = computed(() => {
	const tags: { key: string; label: string; value: string }[] = []
	const skipKeys = ['sortBy', 'sortOrder', 'search', 'page', 'limit']

	Object.entries(filters.value).forEach(([key, value]) => {
		if (value !== undefined && value !== '' && value !== null && !skipKeys.includes(key)) {
			if (Array.isArray(value)) {
				if (value.length > 0) {
					tags.push({
						key,
						label: filterLabels[key] || key,
						value: value.join(', '),
					})
				}
			} else {
				tags.push({
					key,
					label: filterLabels[key] || key,
					value: String(value),
				})
			}
		}
	})

	return tags
})
</script>

<style scoped>
.media-filters {
	margin-bottom: 24px;
}

.media-filters__card {
	border: 1px solid var(--border-color);
	border-radius: 16px;
	box-shadow: var(--shadow-sm);
	background: var(--bg-card);
	transition: all 0.3s ease;
	padding: 24px;
}

.media-filters__header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	padding-bottom: 20px;
	gap: 24px;
}

.header-actions {
	display: flex;
	align-items: center;
	gap: 16px;
}

.search-input {
	width: 300px;
}

.media-filters__title h2 {
	font-weight: 700;
	font-size: 24px;
	color: var(--text-primary);
	margin: 0;
}

.media-filters__title p {
	font-size: 15px;
	color: var(--text-muted);
	margin: 8px 0 0;
}

.media-filters__tags {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	border-top: 1px solid var(--border-color);
	padding-top: 24px;
	gap: 12px;
}

.tags-label {
	font-weight: 500;
	font-size: 14px;
	color: var(--text-muted);
	margin-right: 8px;
}

.gp-tag {
	height: auto;
	border: 1px solid var(--border-color);
	border-radius: 20px;
	color: var(--text-primary);
	background: var(--bg-surface);
	transition: all 0.2s ease;
	padding: 10px 14px;
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
	padding: 8px 12px;
}

:deep(.el-input__wrapper.is-focus) {
	box-shadow: 0 0 0 1px var(--accent-primary) inset !important;
}
</style>
