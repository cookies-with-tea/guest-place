<template>
	<UiModal
		v-model="isPreviewDialogOpen"
		title="Media Preview"
		:width="800"
		@close="closePreviewDialog"
	>
		<div v-if="currentMedia?.data && currentMedia.data.uuid === currentMediaUuid" class="preview-container">
			<div class="media-display">
				<el-image
					v-if="currentMedia.data.mediaType === 'image'"
					class="preview-img"
					fit="contain"
					lazy
					:src="currentMedia.data.url"
				/>
				<div v-else class="file-placeholder">
					<el-icon :size="64"><Document /></el-icon>
					<span class="name">{{ currentMedia.data.name }}</span>
				</div>
			</div>

			<div class="media-info">
				<el-descriptions border :column="1" title="Information">
					<el-descriptions-item label="Title">
						{{ currentMedia.data.title || 'no title' }}
					</el-descriptions-item>
					<el-descriptions-item label="Alt Text">
						{{ currentMedia.data.alt || 'no alt text' }}
					</el-descriptions-item>
					<el-descriptions-item label="Type">
						<el-tag size="small" type="info">{{ currentMedia.data.mediaType }}</el-tag>
					</el-descriptions-item>
					<el-descriptions-item label="name">
						{{ currentMedia.data.name || 'unknown' }}
					</el-descriptions-item>
					<el-descriptions-item label="Size">
						{{ formatFileSize(currentMedia.data.sizeBytes) }}
					</el-descriptions-item>
					<el-descriptions-item label="Added">
						{{ formatDate(currentMedia.data.createdAt) }}
					</el-descriptions-item>
				</el-descriptions>
			</div>
		</div>

		<template #footer>
			<div class="dialog-footer">
				<el-button @click="closePreviewDialog">Close</el-button>
				<el-link
					class="download-link"
					:download="currentMedia?.data?.name"
					:href="currentMedia?.data?.url"
					target="_blank"
				>
					<el-button type="primary">Download</el-button>
				</el-link>
			</div>
		</template>
	</UiModal>
</template>

<script setup lang="ts">
import { Document } from '@element-plus/icons-vue'
import { UiModal } from '@admin-panel/ui'

import { useMedia } from '#entities/media'
import { mediaUtils } from '#entities/media/utils/media.utils'

const { currentMedia, isPreviewDialogOpen, closePreviewDialog, currentMediaUuid } = useMedia()

const formatFileSize = (bytes: number) => mediaUtils.formatFileSize(bytes)
const formatDate = (date: Date | string) => mediaUtils.formatDate(date)
</script>

<style scoped>
.preview-container {
	display: grid;
	grid-template-columns: 1fr 300px;
	gap: 24px;
}

.media-display {
	width: 100%;
	height: 400px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	border: 1px solid var(--border-color);
	border-radius: 12px;
	background: var(--bg-surface);
	overflow: hidden;
}

.preview-img {
	width: 100%;
	height: 100%;
}

.file-placeholder {
	display: flex;
	flex-direction: column;
	align-items: center;
	color: var(--text-muted);
	gap: 16px;
}

.name {
	font-size: 14px;
	word-break: break-all;
	text-align: center;
	padding: 0 20px;
}

.media-info {
	display: flex;
	flex-direction: column;
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
