<template>
	<el-table-column type="selection" width="55" />

	<!-- Name Column -->
	<UiTableColumn
		v-model:sortBy="filters.sortBy"
		v-model:sortOrder="filters.sortOrder"
		label="Name"
		min-width="150"
		prop="name"
		sortable
		@sort="onSort"
	>
		<template #default="{ row }">
			<span class="media-name">{{ row.name || 'unnamed' }}</span>
		</template>
	</UiTableColumn>

	<!-- Media Type Column -->
	<UiTableColumn
		v-model:sortBy="filters.sortBy"
		v-model:sortOrder="filters.sortOrder"
		filterable
		label="Type"
		prop="media_type"
		sortable
		width="140"
		:show-filter-active="filters.mediaTypes && filters.mediaTypes.length > 0"
		@sort="onSort"
	>
		<template #filter>
			<el-select
				v-model="filters.mediaTypes"
				clearable
				collapse-tags
				collapse-tags-tooltip
				multiple
				placeholder="Select types"
				popper-class="dark-select"
			>
				<el-option label="Image" value="image" />
				<el-option label="Video" value="video" />
				<el-option label="Document" value="document" />
				<el-option label="Archive" value="archive" />
				<el-option label="Other" value="other" />
			</el-select>
		</template>
		<template #default="{ row }">
			<el-tag effect="plain" size="small">{{ row.mediaType }}</el-tag>
		</template>
	</UiTableColumn>

	<!-- Category Column -->
	<UiTableColumn
		v-model:sortBy="filters.sortBy"
		v-model:sortOrder="filters.sortOrder"
		filterable
		label="Category"
		prop="category"
		sortable
		width="140"
		:show-filter-active="filters.category && filters.category.length > 0"
		@sort="onSort"
	>
		<template #filter>
			<el-select
				v-model="filters.category"
				clearable
				collapse-tags
				collapse-tags-tooltip
				filterable
				multiple
				placeholder="Select categories"
				popper-class="dark-select"
			>
				<!-- These would ideally come from a separate API -->
				<el-option label="Marketing" value="Marketing" />
				<el-option label="UI/UX" value="UI/UX" />
				<el-option label="Content" value="Content" />
			</el-select>
		</template>
		<template #default="{ row }">
			<span class="media-category">{{ row.category || '—' }}</span>
		</template>
	</UiTableColumn>

	<!-- Tags Column -->
	<UiTableColumn
		v-model:sortBy="filters.sortBy"
		v-model:sortOrder="filters.sortOrder"
		filterable
		label="Tags"
		prop="tags"
		width="180"
		:show-filter-active="filters.tags && filters.tags.length > 0"
		@sort="onSort"
	>
		<template #filter>
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
				popper-class="dark-select"
			>
				<!-- Tags would also ideally be fetched -->
			</el-select>
		</template>
		<template #default="{ row }">
			<div class="tags-container">
				<template v-if="row.tags && row.tags.length">
					<el-tag v-for="tag in row.tags" :key="tag" class="media-tag" effect="light" size="small">
						{{ tag }}
					</el-tag>
				</template>
				<span v-else>—</span>
			</div>
		</template>
	</UiTableColumn>

	<!-- Folder Column -->
	<el-table-column label="Folder" width="140">
		<template #default="{ row }">
			<div v-if="getFolderById(row.folderId)" class="table-folder-badge">
				<span class="folder-dot" :style="{ backgroundColor: getFolderById(row.folderId)?.color || '#409EFF' }" />
				<span class="folder-name">{{ getFolderById(row.folderId)?.name }}</span>
			</div>
			<span v-else class="text-muted">—</span>
		</template>
	</el-table-column>

	<!-- Preview Column -->
	<el-table-column label="Preview" width="105">
		<template #default="{ row }">
			<div class="media-preview-cell">
				<span
					v-if="row.dominantColor"
					class="cell-color-dot"
					:style="{ backgroundColor: row.dominantColor }"
					:title="`Dominant color: ${row.dominantColor}`"
				/>
				<el-image
					v-if="row.mediaType === 'image'"
					class="preview-img"
					fit="cover"
					lazy
					:src="row.variants?.thumbnail?.url || row.optimizedPath || row.url"
				/>
				<div v-else-if="row.mediaType === 'video'" class="video-preview-thumb">
					<video class="preview-img" muted loop autoplay playsinline :src="row.url" />
					<span class="video-play-indicator">▶</span>
				</div>
				<div
					v-else-if="row.extension?.toLowerCase() === 'pdf' || row.mediaType === 'document'"
					class="doc-preview-cell"
				>
					<span class="doc-badge">PDF</span>
					<el-icon :size="20"><Document /></el-icon>
				</div>
				<el-icon v-else :size="24"><Document /></el-icon>
			</div>
		</template>
	</el-table-column>

	<!-- Size Column -->
	<UiTableColumn
		v-model:sortBy="filters.sortBy"
		v-model:sortOrder="filters.sortOrder"
		label="Size"
		prop="size_bytes"
		sortable
		width="120"
		@sort="onSort"
	>
		<template #default="{ row }">
			{{ formatFileSize(row.sizeBytes) }}
		</template>
	</UiTableColumn>

	<!-- Source Column -->
	<UiTableColumn
		v-model:sortBy="filters.sortBy"
		v-model:sortOrder="filters.sortOrder"
		filterable
		label="Source"
		prop="source"
		sortable
		width="140"
		:show-filter-active="filters.source && filters.source.length > 0"
		@sort="onSort"
	>
		<template #filter>
			<el-select
				v-model="filters.source"
				clearable
				collapse-tags
				collapse-tags-tooltip
				filterable
				multiple
				placeholder="Select sources"
				popper-class="dark-select"
			>
				<el-option label="CMS" value="cms" />
				<el-option label="Site" value="site" />
			</el-select>
		</template>
		<template #default="{ row }">
			<el-tag effect="plain" :type="(row.source || 'cms') === 'site' ? 'warning' : 'primary'" size="small">{{
				row.source || 'cms'
			}}</el-tag>
		</template>
	</UiTableColumn>

	<!-- Date Column -->
	<UiTableColumn
		v-model:sortBy="filters.sortBy"
		v-model:sortOrder="filters.sortOrder"
		label="Added"
		prop="created_at"
		sortable
		width="160"
		@sort="onSort"
	>
		<template #default="{ row }">
			{{ formatDate(row.createdAt) }}
		</template>
	</UiTableColumn>

	<!-- Actions Column -->
	<el-table-column label="Actions" width="120">
		<template #default="{ row }">
			<div class="action-buttons">
				<el-tooltip content="Edit Media" placement="top">
					<el-button circle plain size="small" type="warning" :icon="Edit" @click.stop="openEditModal(row.uuid)" />
				</el-tooltip>
				<el-tooltip content="Delete Media" placement="top">
					<el-button circle plain size="small" type="danger" :icon="Delete" @click.stop="confirmDelete(row.uuid)" />
				</el-tooltip>
			</div>
		</template>
	</el-table-column>
</template>

<script setup lang="ts">
import { UiTableColumn } from '@admin-panel/ui'
import { Delete, Document, Edit } from '@element-plus/icons-vue'

import { mediaUtils } from '#entities/media/utils/media.utils'

defineProps<{
	filters: any
	getFolderById: (folderId?: string) => { name: string; color?: string } | null | undefined
	openEditModal: (uuid: string) => void
	confirmDelete: (uuid: string) => void
	onSort: (...args: any[]) => void
}>()

const formatFileSize = (bytes: number) => mediaUtils.formatFileSize(bytes)
const formatDate = (date: string | Date) => mediaUtils.formatDate(date)
</script>

<style scoped>
.media-preview-cell {
	position: relative;
	display: inline-flex;
	align-items: center;
	justify-content: center;
}

.cell-color-dot {
	top: -3px;
	left: -3px;
	width: 10px;
	height: 10px;
	position: absolute;
	border: 1.5px solid #fff;
	border-radius: 50%;
	box-shadow: 0 1px 3px rgb(0, 0, 0, 0.4);
	z-index: 2;
}

.preview-img {
	width: 48px;
	height: 48px;
	border: 1px solid var(--border-color);
	border-radius: 8px;
}

.action-buttons {
	display: flex;
	justify-content: center;
	gap: 8px;
}

.table-folder-badge {
	display: inline-flex;
	align-items: center;
	border-radius: 6px;
	font-weight: 500;
	font-size: 12px;
	background: var(--bg-surface, rgb(255, 255, 255, 0.05));
	padding: 3px 8px;
	gap: 6px;
}

.folder-dot {
	width: 7px;
	height: 7px;
	display: inline-block;
	border-radius: 50%;
}

.folder-name {
	max-width: 95px;
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
}

.video-preview-thumb {
	width: 48px;
	height: 48px;
	position: relative;
	border-radius: 8px;
	overflow: hidden;
}

.video-play-indicator {
	top: 50%;
	left: 50%;
	width: 18px;
	height: 18px;
	position: absolute;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 50%;
	font-size: 9px;
	color: #fff;
	background: rgb(0, 0, 0, 0.65);
	transform: translate(-50%, -50%);
}

.doc-preview-cell {
	width: 48px;
	height: 48px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	border: 1px dashed rgb(230, 162, 60, 0.4);
	border-radius: 8px;
	color: #e6a23c;
	background: rgb(230, 162, 60, 0.1);
	gap: 2px;
}

.doc-badge {
	border-radius: 3px;
	font-weight: 700;
	font-size: 9px;
	color: #fff;
	background: #e6a23c;
	padding: 1px 3px;
}
</style>
