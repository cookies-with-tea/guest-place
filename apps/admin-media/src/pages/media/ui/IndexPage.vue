<template>
	<div class="media-management">
		<div class="media-header">
			<h1>Media Management</h1>
			<div class="media-actions">
				<el-button :icon="Plus" type="success" @click="showAddMediaDialog"> Add Media </el-button>
				<el-button :disabled="selectedMedia.length === 0" :icon="Delete" type="danger" @click="confirmDeleteSelected">
					Delete Selected
				</el-button>
			</div>
		</div>

		<MediaManagementWidget
			:loading="loading"
			:media-items="mediaItems"
			:paginator-enabled="true"
			:rows-per-page="10"
			:show-actions="true"
			:rows-per-page-options="[5, 10, 20, 50]"
			:show-add-button="false"
			:show-delete-button="false"
			:show-search="true"
			:show-selection="true"
			@delete-media="confirmDelete"
			@edit-media="editMedia"
			@preview-media="previewMedia"
			@selection-change="onSelectionChange"
		/>

		<!-- Add/Edit Media Dialog -->
		<MediaUploadDialog
			v-model="mediaDialog.visible"
			:is-edit="mediaDialog.isEdit"
			:media="mediaDialog.isEdit && currentMediaForEdit ? currentMediaForEdit : undefined"
			@cancel="closeMediaDialog"
			@submit="saveMedia"
		/>

		<!-- Media Preview Dialog -->
		<MediaPreviewDialog
			v-model="previewDialog.visible"
			:media="previewDialog.media"
			@close="closePreviewDialog"
			@edit="editMedia"
		/>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { useTheme } from '@admin-panel/ui'
import { Delete, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import MediaManagementWidget from '#widgets/media/ui/MediaManagementWidget.vue'

import MediaPreviewDialog from '#features/media/ui/MediaPreviewDialog.vue'
import MediaUploadDialog from '#features/media/ui/MediaUploadDialog.vue'

import type { MediaItem } from '#entities/media'
import { useMedia } from '#entities/media/lib/composables/useMedia'

// State
const selectedMedia = ref<MediaItem[]>([])

// Composition API
useTheme()

const { mediaItems, loading, loadMedia, createMedia, updateMedia, deleteMedia, deleteMultipleMedia } = useMedia()

// Dialog state
const mediaDialog = ref({
	visible: false,
	isEdit: false,
})

const previewDialog = ref({
	visible: false,
	media: {} as MediaItem,
})

const currentMediaForEdit = ref<MediaItem | null>(null)

// Lifecycle
onMounted(() => {
	loadMedia()
})

// Methods
const showAddMediaDialog = () => {
	mediaDialog.value.visible = true

	mediaDialog.value.isEdit = false

	currentMediaForEdit.value = null
}

const editMedia = (media: MediaItem) => {
	currentMediaForEdit.value = media

	mediaDialog.value.visible = true

	mediaDialog.value.isEdit = true
}

const saveMedia = async (formData: { title?: string; alt?: string; file?: File }) => {
	try {
		if (mediaDialog.value.isEdit && currentMediaForEdit.value) {
			await updateMedia({
				id: currentMediaForEdit.value.id,
				title: formData.title,
				alt: formData.alt,
			})

			ElMessage.success('Media updated successfully')
		} else {
			if (!formData.file) {
				throw new Error('File is required')
			}

			await createMedia({
				title: formData.title,
				alt: formData.alt,
				file: formData.file,
			})

			ElMessage.success('Media uploaded successfully')
		}

		closeMediaDialog()
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error('Failed to save media:', error)

		ElMessage.error('Failed to save media')
	}
}

const confirmDelete = (media: MediaItem) => {
	ElMessageBox.confirm(`Are you sure you want to delete "${media.title || 'this media item'}"?`, 'Confirmation', {
		confirmButtonText: 'Delete',
		cancelButtonText: 'Cancel',
		type: 'warning',
	})
		.then(() => {
			deleteMedia(media.id)

			ElMessage.success('Media deleted successfully')
		})
		.catch(() => {
			// Cancelled
		})
}

const confirmDeleteSelected = () => {
	ElMessageBox.confirm(
		`Are you sure you want to delete ${selectedMedia.value.length} selected media items?`,
		'Confirmation',
		{
			confirmButtonText: 'Delete',
			cancelButtonText: 'Cancel',
			type: 'warning',
		}
	)
		.then(() => {
			const ids = selectedMedia.value.map((m) => m.id)

			deleteMultipleMedia(ids)

			selectedMedia.value = []

			ElMessage.success('Selected media deleted successfully')
		})
		.catch(() => {
			// Cancelled
		})
}

const previewMedia = (media: MediaItem) => {
	previewDialog.value.media = media

	previewDialog.value.visible = true
}

const onSelectionChange = (media: MediaItem[]) => {
	selectedMedia.value = media
}

const closeMediaDialog = () => {
	mediaDialog.value.visible = false
}

const closePreviewDialog = () => {
	previewDialog.value.visible = false
}
</script>

<style scoped>
.media-management {
	min-height: 100vh;
	max-width: 1400px;
	color: var(--text-primary);
	background-color: var(--bg-page);
	transition: all 0.3s ease;
	padding: 2rem;
	margin: 0 auto;
}

.media-header {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 2rem;
	gap: 1rem;
}

.media-header h1 {
	font-weight: 800;
	font-size: 2.5rem;
	letter-spacing: -0.02em;
	color: var(--text-primary);
	margin: 0;
}

.media-actions {
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
}

@media (width <= 768px) {
	.media-management {
		padding: 1rem;
	}

	.media-header {
		flex-direction: column;
		align-items: flex-start;
	}

	.media-actions {
		width: 100%;
		justify-content: space-between;
	}
}
</style>
