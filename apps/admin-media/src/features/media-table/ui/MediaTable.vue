<template>
	<div class="media-table-feature" :class="{ 'is-dark': isDark }">
		<UiTable
			v-loading="isLoading || isFetching"
			border
			class="ui-table"
			:data="mediaItems"
			element-loading-text="Loading data..."
			@selection-change="handleSelectionChange"
			@row-click="(row: MediaItem) => openPreviewDialog(row.uuid)"
		>
			<el-table-column type="selection" width="55" />

			<!-- Name Column -->
			<el-table-column min-width="150" prop="name">
				<template #header>
					<UiSortableHeader
						v-model:sortBy="filters.sortBy"
						v-model:sortOrder="filters.sortOrder"
						label="Name"
						prop="name"
						@sort="setSort"
					/>
				</template>
				<template #default="{ row }">
					<span class="media-name">{{ row.name || 'unnamed' }}</span>
				</template>
			</el-table-column>

			<!-- Preview Column -->
			<el-table-column label="Preview" width="120">
				<template #default="{ row }">
					<div class="media-preview-cell">
						<el-image v-if="row.mediaType === 'image'" class="preview-img" fit="cover" lazy :src="row.url" />
						<el-icon v-else :size="24"><Document /></el-icon>
					</div>
				</template>
			</el-table-column>

			<!-- Title Column -->
			<el-table-column min-width="200" prop="title">
				<template #header>
					<el-popover
						placement="bottom-start"
						popper-class="gp-popover"
						:show-arrow="true"
						trigger="click"
						:width="240"
					>
						<template #reference>
							<UiSortableHeader
								v-model:sortBy="filters.sortBy"
								v-model:sortOrder="filters.sortOrder"
								label="Title"
								prop="title"
								:show-filter-active="!!filters.search"
								@sort="setSort"
							/>
						</template>
						<div class="filter-popover-content">
							<span class="popover-label">Search Media</span>
							<el-input v-model="filters.search" clearable placeholder="Search by title or alt..." />
						</div>
					</el-popover>
				</template>
				<template #default="{ row }">
					<div class="media-title-cell">
						{{ row.title || row.filename }}
					</div>
				</template>
			</el-table-column>

			<!-- Size Column -->
			<el-table-column width="140">
				<template #header>
					<UiSortableHeader
						v-model:sortBy="filters.sortBy"
						v-model:sortOrder="filters.sortOrder"
						label="Size"
						prop="size_bytes"
						@sort="setSort"
					/>
				</template>
				<template #default="{ row }">
					{{ formatFileSize(row.sizeBytes) }}
				</template>
			</el-table-column>

			<!-- Date Column -->
			<el-table-column width="180">
				<template #header>
					<UiSortableHeader
						v-model:sortBy="filters.sortBy"
						v-model:sortOrder="filters.sortOrder"
						label="Added"
						prop="created_at"
						@sort="setSort"
					/>
				</template>
				<template #default="{ row }">
					{{ formatDate(row.createdAt) }}
				</template>
			</el-table-column>

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
		</UiTable>

		<div class="pagination-container">
			<el-pagination
				v-model:current-page="pagination.page"
				v-model:page-size="pagination.limit"
				background
				layout="total, sizes, prev, pager, next, jumper"
				:page-sizes="[10, 20, 50, 100]"
				:total="pagination.total"
				@current-change="setPage"
				@size-change="setLimit"
			/>
		</div>
		<MediaPreviewDialog />
		<MediaUpdateModal />
		<MediaUploadDialog />
	</div>
</template>
<script setup lang="ts">
import { ref } from 'vue'

import { UiSortableHeader, UiTable, useTheme } from '@admin-panel/ui'
import { Delete, Document, Edit } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

import { useMedia } from '#entities/media'
import type { MediaItem } from '#entities/media/model'
import { mediaUtils } from '#entities/media/utils/media.utils'

import { MediaPreviewDialog, MediaUpdateModal, MediaUploadDialog } from '../../media-dialogs'

const {
	mediaItems,
	filters,
	pagination,
	isLoading,
	isFetching,
	setPage,
	setLimit,
	setSort,
	openPreviewDialog,
	openEditModal,
	handleDelete,
} = useMedia()

const { isDark } = useTheme()

const selectedItems = ref<MediaItem[]>([])

const handleSelectionChange = (val: MediaItem[]) => {
	selectedItems.value = val
}

const formatFileSize = (bytes: number) => mediaUtils.formatFileSize(bytes)
const formatDate = (date: string | Date) => mediaUtils.formatDate(date)

const confirmDelete = (uuid: string) => {
	ElMessageBox.confirm('Are you sure you want to delete this file?', 'Warning', {
		confirmButtonText: 'Delete',
		cancelButtonText: 'Cancel',
		type: 'warning',
	}).then(() => {
		handleDelete(uuid)
	})
}

defineExpose({
	selectedItems,
})
</script>

<style scoped>
.media-table-feature {
	width: 100%;
}

.ui-table {
	border: 1px solid var(--border-color);
	border-radius: 16px;
	box-shadow: var(--shadow-sm);
	background-color: var(--bg-card) !important;
	overflow: hidden;
}

.media-preview-cell {
	display: flex;
	align-items: center;
	justify-content: center;
}

.preview-img {
	width: 48px;
	height: 48px;
	border: 1px solid var(--border-color);
	border-radius: 8px;
}

.pagination-container {
	width: 100%;
	display: flex;
	justify-content: center;
	background: transparent;
	padding: 16px;
	margin-top: 40px;
}

/* Popover Styles */
:deep(.gp-popover) {
	border: 1px solid var(--border-color) !important;
	border-radius: 12px !important;
	box-shadow: var(--shadow-sm) !important;
	background: var(--bg-card) !important;
	padding: 16px !important;
}

.filter-popover-content {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.popover-label {
	font-weight: 600;
	font-size: 12px;
	letter-spacing: 0.05em;
	text-transform: uppercase;
	color: #94a3b8;
}

.action-buttons {
	display: flex;
	justify-content: center;
	gap: 8px;
}
</style>
