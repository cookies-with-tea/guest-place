<template>
	<div class="media-table-feature" :class="{ 'is-dark': isDark }">
		<MediaBulkActionsBar :bulk="bulk" />

		<UiTable
			v-model:page="pagination.page"
			v-model:limit="pagination.limit"
			:loading="isLoading || isFetching"
			border
			class="ui-table"
			:data="mediaItems"
			element-loading-text="Loading data..."
			:total="pagination.total"
			@selection-change="bulk.handleSelectionChange"
			@row-click="(row: MediaItem) => openPreviewDialog(row.uuid)"
			@update:page="setPage"
			@update:limit="setLimit"
		>
			<MediaTableColumns
				:confirm-delete="bulk.confirmDelete"
				:filters="filters"
				:get-folder-by-id="bulk.getFolderById"
				:on-sort="setSort"
				:open-edit-modal="openEditModal"
			/>
		</UiTable>

		<MediaPreviewDialog />
		<MediaUpdateModal />
		<MediaUploadDialog />

		<MoveToFolderDialog :bulk="bulk" />
	</div>
</template>

<script setup lang="ts">
import { UiTable, useTheme } from '@admin-panel/ui'

import { useMedia } from '#entities/media'
import type { MediaItem } from '#entities/media/model'

import { MediaPreviewDialog, MediaUpdateModal, MediaUploadDialog } from '../../media-dialogs'
import { useMediaTableBulkActions } from '../composables/useMediaTableBulkActions'
import MediaBulkActionsBar from './components/MediaBulkActionsBar.vue'
import MediaTableColumns from './components/MediaTableColumns.vue'
import MoveToFolderDialog from './components/MoveToFolderDialog.vue'

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
} = useMedia()

const { isDark } = useTheme()

const bulk = useMediaTableBulkActions()
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
</style>
