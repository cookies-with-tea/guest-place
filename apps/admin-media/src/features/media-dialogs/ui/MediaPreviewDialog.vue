<template>
	<UiModal v-model="preview.isPreviewDialogOpen" title="Media Preview" :width="850" @close="preview.closePreviewDialog">
		<div
			v-if="preview.currentMedia?.data && preview.currentMedia.data.uuid === preview.currentMediaUuid"
			class="preview-container"
		>
			<MediaPreviewViewer :media="preview.currentMedia.data" :preview="preview" />

			<div class="media-info">
				<MediaPreviewDetails :media="preview.currentMedia.data" :preview="preview" />

				<MediaPreviewPalette
					v-if="preview.currentMedia.data.palette && preview.currentMedia.data.palette.length"
					:palette="preview.currentMedia.data.palette"
					:preview="preview"
				/>

				<MediaPreviewExif
					v-if="preview.currentMedia.data.exif && preview.hasExifData(preview.currentMedia.data.exif)"
					:exif="preview.currentMedia.data.exif"
				/>

				<MediaPreviewVariants
					v-if="preview.currentMedia.data.mediaType === 'image'"
					:preview="preview"
					:variants="preview.currentMedia.data.variants"
				/>
			</div>
		</div>

		<template #footer>
			<div class="dialog-footer">
				<el-button @click="preview.closePreviewDialog">Close</el-button>
				<el-link
					class="download-link"
					:download="preview.currentMedia?.data?.name"
					:href="preview.activeVariantUrl || preview.currentMedia?.data?.url"
					target="_blank"
				>
					<el-button type="primary">Download</el-button>
				</el-link>
			</div>
		</template>
	</UiModal>
</template>

<script setup lang="ts">
import { UiModal } from '@admin-panel/ui'

import { useMediaPreview } from '../composables/useMediaPreview'
import MediaPreviewDetails from './media-preview/MediaPreviewDetails.vue'
import MediaPreviewExif from './media-preview/MediaPreviewExif.vue'
import MediaPreviewPalette from './media-preview/MediaPreviewPalette.vue'
import MediaPreviewVariants from './media-preview/MediaPreviewVariants.vue'
import MediaPreviewViewer from './media-preview/MediaPreviewViewer.vue'

const preview = useMediaPreview()
</script>

<style scoped>
.preview-container {
	display: grid;
	grid-template-columns: 1fr 320px;
	gap: 24px;
}

.media-info {
	min-width: 0;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	gap: 16px;
}

.dialog-footer {
	display: flex;
	justify-content: flex-end;
	gap: 12px;
}

.download-link {
	text-decoration: none;
}
</style>
