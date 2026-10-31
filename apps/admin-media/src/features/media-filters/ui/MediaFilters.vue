<template>
	<div class="media-filters">
		<div class="media-filters__card">
			<MediaFiltersHeader :controls="controls" :on-upload="openUploadModal" />
			<MediaFoldersBar :controls="controls" :folder-dialog="folderDialog" :media-config="mediaConfig" />
			<MediaTypeFilterBar :controls="controls" />
			<MediaFilterControlsRow :controls="controls" />
			<MediaActiveFilterTags :controls="controls" />
		</div>

		<MediaFolderDialog :folder-dialog="folderDialog" />
	</div>
</template>

<script setup lang="ts">
import { useMedia } from '#entities/media'

import { useMediaFilterControls } from '../composables/useMediaFilterControls'
import { useMediaFolderDialog } from '../composables/useMediaFolderDialog'
import MediaActiveFilterTags from './components/MediaActiveFilterTags.vue'
import MediaFilterControlsRow from './components/MediaFilterControlsRow.vue'
import MediaFiltersHeader from './components/MediaFiltersHeader.vue'
import MediaFolderDialog from './components/MediaFolderDialog.vue'
import MediaFoldersBar from './components/MediaFoldersBar.vue'
import MediaTypeFilterBar from './components/MediaTypeFilterBar.vue'

const {
	filters,
	openUploadModal,
	removeFilter,
	resetFilters,
	setSizePreset,
	mediaItems,
	folders,
	mediaConfig,
	selectFolder,
	createFolder,
	updateFolder,
	deleteFolder,
} = useMedia()

const controls = useMediaFilterControls({
	filters,
	mediaItems,
	folders,
	removeFilter,
	resetFilters,
	setSizePreset,
	selectFolder,
})

const folderDialog = useMediaFolderDialog({ createFolder, updateFolder, deleteFolder })
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
