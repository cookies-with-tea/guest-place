<template>
	<el-dialog v-model="preview.isPreviewOpen" append-to-body title="File Preview" width="650px">
		<div v-if="preview.activePreviewFile" class="upload-preview-container" :class="preview.previewBg">
			<img
				v-if="mediaUtils.isImage(preview.activePreviewFile.file)"
				:src="preview.activePreviewFile.preview"
				class="upload-preview-img"
			/>
			<video
				v-else-if="mediaUtils.isVideo(preview.activePreviewFile.file)"
				:src="preview.activePreviewFile.preview"
				controls
				autoplay
				class="upload-preview-video"
			/>
			<iframe v-else :src="preview.activePreviewFile.preview" class="upload-preview-pdf" />

			<div v-if="mediaUtils.isImage(preview.activePreviewFile.file)" class="bg-toggle">
				<el-radio-group v-model="preview.previewBg" size="small">
					<el-radio-button label="Transparent" value="checkered" />
					<el-radio-button label="White" value="white" />
					<el-radio-button label="Black" value="black" />
				</el-radio-group>
			</div>
		</div>
		<template #footer>
			<div class="preview-info">
				<span>{{ preview.activePreviewFile?.file.name }}</span>
				<span>{{ (preview.activePreviewFile?.file.size || 0 / 1024 / 1024).toFixed(2) }} MB</span>
			</div>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { mediaUtils } from '#entities/media'

import type { UploadPreview } from '../../composables/useUploadPreview'

defineProps<{
	preview: UploadPreview
}>()
</script>

<style scoped>
.upload-preview-container {
	width: 100%;
	height: 420px;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid var(--border-color);
	border-radius: 8px;
	background: var(--bg-surface);
	overflow: hidden;
}

.upload-preview-container.checkered {
	background-image:
		linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%),
		linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%);
	background-position:
		0 0,
		0 10px,
		10px -10px,
		-10px 0;
	background-size: 20px 20px;
	background-color: #1a1a1a;
}

.upload-preview-container.white {
	background: #fff !important;
}

.upload-preview-container.black {
	background: #000 !important;
}

.upload-preview-img {
	max-width: 100%;
	max-height: 100%;
	object-fit: contain;
}

.upload-preview-video {
	width: 100%;
	height: 100%;
	object-fit: contain;
}

.upload-preview-pdf {
	width: 100%;
	height: 100%;
	border: none;
}

.bg-toggle {
	top: 12px;
	right: 12px;
	position: absolute;
	z-index: 10;
}

.preview-info {
	width: 100%;
	display: flex;
	justify-content: space-between;
	font-size: 12px;
	color: var(--text-muted);
}
</style>
