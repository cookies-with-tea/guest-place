<template>
	<el-upload
		drag
		multiple
		:limit="50"
		:auto-upload="false"
		:on-change="filesList.handleFileChange"
		:on-remove="filesList.handleFileRemove"
		:show-file-list="false"
		accept="image/*,video/*,application/pdf"
		class="bulk-uploader"
	>
		<el-icon class="el-icon--upload"><UploadFilled /></el-icon>
		<div class="el-upload__text"> Drop multiple images, videos, or PDF documents here or <em>click to upload</em> </div>
	</el-upload>

	<!-- Files List -->
	<div v-if="filesList.filesToUpload.length > 0" class="files-grid">
		<div v-for="(file, index) in filesList.filesToUpload" :key="index" class="compact-file-item">
			<div class="item-main">
				<div class="file-thumb" @click="preview.openFilePreview(file)">
					<img v-if="file.preview && mediaUtils.isImage(file.file)" :src="file.preview" />
					<div v-else-if="mediaUtils.isVideo(file.file)" class="thumb-badge video">
						<el-icon><VideoCamera /></el-icon>
					</div>
					<div v-else class="thumb-badge pdf">
						<el-icon><Document /></el-icon>
					</div>
				</div>
				<span class="file-name" :title="file.file.name">{{ file.file.name }}</span>
				<el-tag size="small" type="info">{{ (file.file.size / 1024 / 1024).toFixed(2) }}MB</el-tag>
				<el-tag
					v-if="file.status && file.status !== 'idle'"
					size="small"
					:type="file.status === 'completed' ? 'success' : file.status === 'error' ? 'danger' : 'warning'"
				>
					{{ file.status }}
				</el-tag>

				<div class="item-actions">
					<!-- Crop button for images -->
					<el-tooltip v-if="mediaUtils.isImage(file.file)" content="Crop & Resize before upload" placement="top">
						<el-button circle size="small" type="primary" plain :icon="Crop" @click="crop.startCropping(index)" />
					</el-tooltip>
					<el-button
						circle
						size="small"
						:type="file.isCustom ? 'warning' : 'default'"
						:icon="Edit"
						@click="filesList.toggleCustom(index)"
					/>
				</div>
			</div>

			<div v-if="file.status && file.status !== 'idle'" class="item-upload-progress">
				<el-progress
					:percentage="file.progress || 0"
					:status="file.status === 'error' ? 'exception' : file.status === 'completed' ? 'success' : ''"
					:stroke-width="4"
				/>
				<div class="progress-message">{{ file.statusMessage }}</div>
			</div>

			<el-collapse-transition>
				<div v-if="file.isCustom" class="item-custom-fields">
					<el-input v-model="file.title" placeholder="Custom Title" size="small" />
					<el-input v-model="file.alt" placeholder="Custom Alt" size="small" />
					<el-select v-model="file.folderId" clearable placeholder="Target Folder" size="small">
						<el-option :value="null" label="Root (No folder)">
							<el-icon class="folder-option-icon"><Folder /></el-icon>
							<span>Root (No folder)</span>
						</el-option>
						<el-option v-for="folder in folders || []" :key="folder.id" :value="folder.id" :label="folder.name">
							<el-icon class="folder-option-icon"><Folder /></el-icon>
							<span>{{ folder.name }}</span>
						</el-option>
					</el-select>
					<el-select v-model="file.category" clearable filterable placeholder="Category" size="small">
						<el-option label="Marketing" value="Marketing" />
						<el-option label="UI/UX" value="UI/UX" />
						<el-option label="Content" value="Content" />
						<el-option label="Documentation" value="Documentation" />
						<el-option label="Media" value="Media" />
					</el-select>
					<el-select
						v-model="file.tags"
						allow-create
						clearable
						default-first-option
						filterable
						multiple
						placeholder="Tags"
						size="small"
					>
						<el-option label="Logo" value="Logo" />
						<el-option label="Social" value="Social" />
						<el-option label="Document" value="Document" />
						<el-option label="Video" value="Video" />
					</el-select>
				</div>
			</el-collapse-transition>
		</div>
	</div>
</template>

<script setup lang="ts">
import { mediaUtils } from '#entities/media'
import { Crop, Document, Edit, Folder, UploadFilled, VideoCamera } from '@element-plus/icons-vue'

import type { ImageCrop } from '../../composables/useImageCrop'
import type { UploadFilesList } from '../../composables/useUploadFilesList'
import type { UploadPreview } from '../../composables/useUploadPreview'

defineProps<{
	filesList: UploadFilesList
	crop: ImageCrop
	preview: UploadPreview
	folders: any[]
}>()
</script>

<style scoped>
.bulk-uploader {
	width: 100%;
}

.folder-option-icon {
	width: 1em;
	height: 1em;
	flex-shrink: 0;
	margin-right: 8px;
}

.files-grid {
	max-height: 250px;
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
	padding: 4px;
	overflow-y: auto;
	gap: 12px;
}

.compact-file-item {
	display: flex;
	flex-direction: column;
	border: 1px solid var(--border-color);
	border-radius: 10px;
	background: var(--bg-surface);
	transition: all 0.2s ease;
	padding: 10px;
	gap: 8px;
}

.compact-file-item:hover {
	border-color: var(--accent-primary);
	box-shadow: var(--shadow-sm);
}

.item-main {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
}

.item-actions {
	display: flex;
	align-items: center;
	gap: 4px;
}

.item-upload-progress {
	width: 100%;
	display: flex;
	flex-direction: column;
	padding: 2px 0;
	gap: 4px;
}

.progress-message {
	font-size: 11px;
	white-space: nowrap;
	text-overflow: ellipsis;
	color: var(--text-muted);
	overflow: hidden;
}

.file-thumb {
	width: 36px;
	height: 36px;
	display: flex;
	flex-shrink: 0;
	align-items: center;
	justify-content: center;
	border: 1px solid var(--border-color);
	border-radius: 6px;
	background: var(--bg-header);
	transition: transform 0.2s;
	cursor: pointer;
	overflow: hidden;
}

.file-thumb:hover {
	border-color: var(--accent-primary);
	transform: scale(1.08);
}

.file-thumb img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.thumb-badge {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 18px;
}

.thumb-badge.video {
	color: #a855f7;
	background: rgb(168, 85, 247, 0.15);
}

.thumb-badge.pdf {
	color: #ef4444;
	background: rgb(239, 68, 68, 0.15);
}

.file-name {
	flex: 1;
	font-size: 12px;
	white-space: nowrap;
	text-overflow: ellipsis;
	color: var(--text-muted);
	overflow: hidden;
}

.item-custom-fields {
	display: flex;
	flex-direction: column;
	border-top: 1px dashed var(--border-color);
	padding-top: 8px;
	margin-top: 4px;
	gap: 8px;
}
</style>
