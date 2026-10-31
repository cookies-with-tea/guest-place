<template>
	<UiModal
		v-model="isUploadModalOpen"
		class="media-upload-dialog"
		title="Bulk Media Upload"
		:width="760"
		@close="submit.closeAndReset"
	>
		<div
			v-loading="submit.isUploading"
			element-loading-text="Uploading & processing files..."
			element-loading-background="rgba(0, 0, 0, 0.7)"
			class="upload-container"
		>
			<MediaUploadGlobalSettings :settings="submit" :folders="folders" />
			<MediaUploadFilesGrid :files-list="filesList" :crop="crop" :preview="preview" :folders="folders" />
		</div>

		<template #footer>
			<div class="dialog-footer">
				<el-button @click="submit.closeAndReset">Cancel</el-button>
				<el-badge :value="filesList.filesToUpload.length" :hidden="filesList.filesToUpload.length === 0" type="primary">
					<el-button
						:disabled="filesList.filesToUpload.length === 0"
						:loading="submit.isUploading"
						type="primary"
						@click="submit.handleUpload"
					>
						Upload All
					</el-button>
				</el-badge>
			</div>
		</template>
	</UiModal>

	<MediaUploadPreviewDialog :preview="preview" />
	<MediaCropDialog :crop="crop" />
</template>

<script setup lang="ts">
import { UiModal } from '@admin-panel/ui'

import { MEDIA_QUERY_KEY, uploadFileInChunks, useMedia } from '#entities/media'

import { useImageCrop } from '../composables/useImageCrop'
import { useMediaUploadSubmit } from '../composables/useMediaUploadSubmit'
import { useUploadFilesList } from '../composables/useUploadFilesList'
import { useUploadPreview } from '../composables/useUploadPreview'
import MediaCropDialog from './media-upload/MediaCropDialog.vue'
import MediaUploadFilesGrid from './media-upload/MediaUploadFilesGrid.vue'
import MediaUploadGlobalSettings from './media-upload/MediaUploadGlobalSettings.vue'
import MediaUploadPreviewDialog from './media-upload/MediaUploadPreviewDialog.vue'

const { isUploadModalOpen, closeUploadModal, createMedia, isSubmitting, folders } = useMedia()

const filesList = useUploadFilesList()
const preview = useUploadPreview()
const crop = useImageCrop(filesList)
const submit = useMediaUploadSubmit(filesList, { createMedia, closeUploadModal, isSubmitting })
</script>

<style scoped>
.upload-container {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.dialog-footer {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 16px;
}
</style>
