<template>
	<UiModal
		v-model="isUploadModalOpen"
		class="media-upload-dialog"
		title="Bulk Media Upload"
		:width="760"
		@close="closeAndReset"
	>
		<div
			v-loading="isUploading"
			element-loading-text="Uploading & processing files..."
			element-loading-background="rgba(0, 0, 0, 0.7)"
			class="upload-container"
		>
			<!-- Global Settings -->
			<el-card class="global-settings-card" shadow="never">
				<template #header>
					<div class="card-header">
						<span class="header-title">Global Metadata & Destination</span>
						<div class="header-actions">
							<el-checkbox v-model="useChunkedUpload">Resumable Chunked</el-checkbox>
							<el-checkbox v-model="convertToWebP">Auto-convert to WebP</el-checkbox>
							<el-checkbox v-model="isApplyToAll">Apply to all files</el-checkbox>
						</div>
					</div>
				</template>
				<div class="global-inputs">
					<div class="input-row">
						<el-input v-model="globalTitle" placeholder="Shared Title" :disabled="!isApplyToAll">
							<template #prepend>Title</template>
						</el-input>
						<el-input v-model="globalAlt" placeholder="Shared Alt Text" :disabled="!isApplyToAll">
							<template #prepend>Alt</template>
						</el-input>
					</div>
					<div class="input-row">
						<el-select
							v-model="globalFolderId"
							clearable
							placeholder="Target Folder (Root)"
							:disabled="!isApplyToAll"
						>
							<el-option :value="null" label="📁 Root (No folder)" />
							<el-option
								v-for="folder in folders || []"
								:key="folder.id"
								:value="folder.id"
								:label="`📁 ${folder.name}`"
							>
								<div class="folder-option">
									<span class="folder-dot" :style="{ backgroundColor: folder.color || '#3b82f6' }" />
									<span>{{ folder.name }}</span>
								</div>
							</el-option>
						</el-select>
						<el-select
							v-model="globalCategory"
							clearable
							filterable
							placeholder="Shared Category"
							:disabled="!isApplyToAll"
						>
							<el-option label="Marketing" value="Marketing" />
							<el-option label="UI/UX" value="UI/UX" />
							<el-option label="Content" value="Content" />
							<el-option label="Documentation" value="Documentation" />
							<el-option label="Media" value="Media" />
						</el-select>
						<el-select
							v-model="globalTags"
							allow-create
							clearable
							default-first-option
							filterable
							multiple
							placeholder="Shared Tags"
							:disabled="!isApplyToAll"
						>
							<el-option label="Marketing" value="Marketing" />
							<el-option label="Product" value="Product" />
							<el-option label="UI/UX" value="UI/UX" />
							<el-option label="Hero" value="Hero" />
							<el-option label="Video" value="Video" />
							<el-option label="Doc" value="Doc" />
						</el-select>
					</div>
				</div>
			</el-card>

			<el-upload
				drag
				multiple
				:limit="50"
				:auto-upload="false"
				:on-change="handleFileChange"
				:on-remove="handleFileRemove"
				:show-file-list="false"
				accept="image/*,video/*,application/pdf"
				class="bulk-uploader"
			>
				<el-icon class="el-icon--upload"><UploadFilled /></el-icon>
				<div class="el-upload__text">
					Drop multiple images, videos, or PDF documents here or <em>click to upload</em>
				</div>
			</el-upload>

			<!-- Files List -->
			<div v-if="filesToUpload.length > 0" class="files-grid">
				<div v-for="(file, index) in filesToUpload" :key="index" class="compact-file-item">
					<div class="item-main">
						<div class="file-thumb" @click="openFilePreview(file)">
							<img v-if="file.preview && isImageFile(file.file)" :src="file.preview" />
							<div v-else-if="isVideoFile(file.file)" class="thumb-badge video">
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
							<el-tooltip v-if="isImageFile(file.file)" content="Crop & Resize before upload" placement="top">
								<el-button
									circle
									size="small"
									type="primary"
									plain
									:icon="Crop"
									@click="startCropping(index)"
								/>
							</el-tooltip>
							<el-button
								circle
								size="small"
								:type="file.isCustom ? 'warning' : 'default'"
								:icon="Edit"
								@click="toggleCustom(index)"
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
							<el-select
								v-model="file.folderId"
								clearable
								placeholder="Target Folder"
								size="small"
							>
								<el-option :value="null" label="📁 Root (No folder)" />
								<el-option
									v-for="folder in folders || []"
									:key="folder.id"
									:value="folder.id"
									:label="`📁 ${folder.name}`"
								/>
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
		</div>

		<template #footer>
			<div class="dialog-footer">
				<el-button @click="closeAndReset">Cancel</el-button>
				<el-badge :value="filesToUpload.length" :hidden="filesToUpload.length === 0" type="primary">
					<el-button :disabled="filesToUpload.length === 0" :loading="isUploading" type="primary" @click="handleUpload">
						Upload All
					</el-button>
				</el-badge>
			</div>
		</template>
	</UiModal>

	<!-- Inner Preview for Uploading Files -->
	<el-dialog v-model="isPreviewOpen" append-to-body title="File Preview" width="650px">
		<div v-if="activePreviewFile" class="upload-preview-container" :class="previewBg">
			<img
				v-if="isImageFile(activePreviewFile.file)"
				:src="activePreviewFile.preview"
				class="upload-preview-img"
			/>
			<video
				v-else-if="isVideoFile(activePreviewFile.file)"
				:src="activePreviewFile.preview"
				controls
				autoplay
				class="upload-preview-video"
			/>
			<iframe
				v-else
				:src="activePreviewFile.preview"
				class="upload-preview-pdf"
			/>

			<div v-if="isImageFile(activePreviewFile.file)" class="bg-toggle">
				<el-radio-group v-model="previewBg" size="small">
					<el-radio-button label="Transparent" value="checkered" />
					<el-radio-button label="White" value="white" />
					<el-radio-button label="Black" value="black" />
				</el-radio-group>
			</div>
		</div>
		<template #footer>
			<div class="preview-info">
				<span>{{ activePreviewFile?.file.name }}</span>
				<span>{{ (activePreviewFile?.file.size || 0 / 1024 / 1024).toFixed(2) }} MB</span>
			</div>
		</template>
	</el-dialog>

	<!-- In-browser Image Crop & Resize Modal -->
	<el-dialog
		v-model="isCropDialogOpen"
		append-to-body
		title="Crop & Resize Image Before Upload"
		width="800px"
		:before-close="closeCropDialog"
	>
		<div class="crop-modal-body">
			<div class="crop-cropper-area">
				<VueCropper
					v-if="isCropDialogOpen && croppingImageUrl"
					ref="cropperRef"
					:img="croppingImageUrl"
					:auto-crop="true"
					:center-box="true"
					:fixed="cropFixed"
					:fixed-number="cropFixedNumber"
					:output-size="1"
					output-type="webp"
				/>
			</div>
			<div class="crop-modal-controls">
				<div class="crop-control-group">
					<span class="control-label">Aspect Ratio</span>
					<el-radio-group v-model="cropAspectRatio" size="small" @change="handleCropRatioChange">
						<el-radio-button label="free" value="free">Free</el-radio-button>
						<el-radio-button label="1:1" value="1:1">1:1</el-radio-button>
						<el-radio-button label="4:3" value="4:3">4:3</el-radio-button>
						<el-radio-button label="16:9" value="16:9">16:9</el-radio-button>
					</el-radio-group>
				</div>
				<div class="crop-control-group">
					<span class="control-label">Rotate</span>
					<el-button-group>
						<el-button size="small" :icon="RefreshLeft" @click="cropperRef?.rotateLeft()" />
						<el-button size="small" :icon="RefreshRight" @click="cropperRef?.rotateRight()" />
					</el-button-group>
				</div>
			</div>
		</div>
		<template #footer>
			<el-button @click="closeCropDialog">Cancel</el-button>
			<el-button type="primary" @click="applyCrop">Apply Crop & Resize</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { VueCropper } from 'vue-cropper/dist/vue-cropper.es.js'
import { useQueryClient } from '@tanstack/vue-query'

import { UiModal } from '@admin-panel/ui'
import { Crop, Document, Edit, RefreshLeft, RefreshRight, UploadFilled, VideoCamera } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

import { MEDIA_QUERY_KEY, uploadFileInChunks, useMedia } from '#entities/media'

import 'vue-cropper/dist/index.css'

const queryClient = useQueryClient()
const { isUploadModalOpen, closeUploadModal, createMedia, isSubmitting, folders } = useMedia()

const globalTitle = ref('')
const globalAlt = ref('')
const globalCategory = ref('')
const globalTags = ref<string[]>([])
const globalFolderId = ref<string | null>(null)
const isApplyToAll = ref(true)
const convertToWebP = ref(true)
const useChunkedUpload = ref(true)
const isChunkUploading = ref(false)

const isUploading = computed(() => isSubmitting.value || isChunkUploading.value)

interface FileWithMeta {
	file: File
	title: string
	alt: string
	category: string
	tags: string[]
	folderId?: string | null
	isCustom: boolean
	preview?: string
	progress?: number
	status?: 'idle' | 'hashing' | 'uploading' | 'verifying' | 'completed' | 'error'
	statusMessage?: string
}

const filesToUpload = ref<FileWithMeta[]>([])

const isPreviewOpen = ref(false)
const activePreviewFile = ref<FileWithMeta | null>(null)
const previewBg = ref('checkered')

// In-browser crop state
const isCropDialogOpen = ref(false)
const croppingIndex = ref<number | null>(null)
const croppingImageUrl = ref('')
const cropperRef = ref<any>(null)
const cropAspectRatio = ref('free')
const cropFixed = ref(false)
const cropFixedNumber = ref([1, 1])

const isImageFile = (file: File) => file.type.startsWith('image/')
const isVideoFile = (file: File) => file.type.startsWith('video/')

const openFilePreview = (file: FileWithMeta) => {
	activePreviewFile.value = file
	isPreviewOpen.value = true
}

const handleFileChange = (file: any) => {
	const rawFile = file.raw as File
	let preview: string | undefined

	if (isImageFile(rawFile) || isVideoFile(rawFile) || rawFile.type === 'application/pdf' || rawFile.name.toLowerCase().endsWith('.pdf')) {
		preview = URL.createObjectURL(rawFile)
	}

	filesToUpload.value.push({
		file: rawFile,
		title: '',
		alt: '',
		category: '',
		tags: [],
		folderId: null,
		isCustom: false,
		preview,
		progress: 0,
		status: 'idle',
		statusMessage: '',
	})
}

const handleFileRemove = (file: any) => {
	const index = filesToUpload.value.findIndex((f) => f.file === file.raw)

	if (index !== -1) {
		const removed = filesToUpload.value.splice(index, 1)[0]

		if (removed.preview) {
			URL.revokeObjectURL(removed.preview)
		}
	}
}

const toggleCustom = (index: number) => {
	filesToUpload.value[index].isCustom = !filesToUpload.value[index].isCustom
}

const startCropping = (index: number) => {
	const item = filesToUpload.value[index]
	if (!item || !isImageFile(item.file)) return

	croppingIndex.value = index
	croppingImageUrl.value = item.preview || URL.createObjectURL(item.file)
	cropAspectRatio.value = 'free'
	cropFixed.value = false
	isCropDialogOpen.value = true
}

const handleCropRatioChange = (val: string) => {
	if (val === 'free') {
		cropFixed.value = false
	} else {
		cropFixed.value = true
		const [w, h] = val.split(':').map(Number)
		cropFixedNumber.value = [w, h]
	}
}

const closeCropDialog = () => {
	isCropDialogOpen.value = false
	croppingIndex.value = null
	croppingImageUrl.value = ''
}

const applyCrop = () => {
	if (!cropperRef.value || croppingIndex.value === null) return
	const index = croppingIndex.value
	const item = filesToUpload.value[index]
	if (!item) return

	cropperRef.value.getCropBlob((blob: Blob) => {
		if (!blob) return

		const originalName = item.file.name.replace(/\.[^/.]+$/, '')
		const newFile = new File([blob], `${originalName}.webp`, { type: 'image/webp' })

		if (item.preview) {
			URL.revokeObjectURL(item.preview)
		}

		item.file = newFile
		item.preview = URL.createObjectURL(blob)
		closeCropDialog()
		ElMessage.success('Image cropped & resized successfully')
	})
}

const handleUpload = async () => {
	if (filesToUpload.value.length === 0) return

	if (useChunkedUpload.value) {
		isChunkUploading.value = true

		try {
			for (const item of filesToUpload.value) {
				const finalTitle = isApplyToAll.value && !item.isCustom ? globalTitle.value : item.title
				const finalAlt = isApplyToAll.value && !item.isCustom ? globalAlt.value : item.alt
				const finalCategory = isApplyToAll.value && !item.isCustom ? globalCategory.value : item.category
				const finalTags = isApplyToAll.value && !item.isCustom ? globalTags.value : item.tags
				const finalFolderId = (isApplyToAll.value && !item.isCustom ? globalFolderId.value : item.folderId) ?? globalFolderId.value ?? undefined

				await uploadFileInChunks({
					file: item.file,
					title: finalTitle,
					alt: finalAlt,
					category: finalCategory,
					tags: finalTags,
					folderId: finalFolderId,
					convertToWebp: convertToWebP.value,
					onProgress: (p) => {
						item.progress = p.percent
						item.status = p.stage
						item.statusMessage = p.message
					},
				})
			}

			await queryClient.invalidateQueries({ queryKey: [MEDIA_QUERY_KEY] })
			ElMessage.success('Files uploaded successfully')
			closeAndReset()
		} catch (err: any) {
			ElMessage.error(err?.message || 'Chunked upload failed')
		} finally {
			isChunkUploading.value = false
		}

		return
	}

	try {
		const formData = new FormData()
		formData.append('source', 'cms')
		formData.append('convert_to_webp', String(convertToWebP.value))

		if (globalFolderId.value) {
			formData.append('folder_id', globalFolderId.value)
		}

		filesToUpload.value.forEach((item, index) => {
			formData.append('file', item.file)

			const finalTitle = isApplyToAll.value && !item.isCustom ? globalTitle.value : item.title
			const finalAlt = isApplyToAll.value && !item.isCustom ? globalAlt.value : item.alt
			const finalCategory = isApplyToAll.value && !item.isCustom ? globalCategory.value : item.category
			const finalTags = isApplyToAll.value && !item.isCustom ? globalTags.value : item.tags
			const finalFolderId = (isApplyToAll.value && !item.isCustom ? globalFolderId.value : item.folderId) ?? globalFolderId.value

			formData.append(`title_${index}`, finalTitle || '')
			formData.append(`alt_${index}`, finalAlt || '')
			formData.append(`category_${index}`, finalCategory || '')
			formData.append(`tags_${index}`, (finalTags || []).join(','))
			if (finalFolderId) {
				formData.append(`folder_id_${index}`, finalFolderId)
			}
		})

		await createMedia(formData as any)
		ElMessage.success('Files uploaded successfully')
		closeAndReset()
	} catch {
		ElMessage.error('Failed to upload files')
	}
}

const closeAndReset = () => {
	filesToUpload.value.forEach((f) => {
		if (f.preview) URL.revokeObjectURL(f.preview)
	})

	filesToUpload.value = []
	globalTitle.value = ''
	globalAlt.value = ''
	globalCategory.value = ''
	globalTags.value = []
	globalFolderId.value = null
	isApplyToAll.value = true
	convertToWebP.value = true

	closeUploadModal()
}
</script>

<style scoped>
.upload-container {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.global-settings-card {
	border: 1px solid var(--border-color);
	border-radius: 12px;
	background: var(--bg-surface);
}

.card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.header-actions {
	display: flex;
	gap: 16px;
}

.header-title {
	font-weight: 600;
	color: var(--text-primary);
}

.global-inputs {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.input-row {
	display: flex;
	gap: 12px;
}

.input-row > * {
	flex: 1;
}

.folder-option {
	display: flex;
	align-items: center;
	gap: 8px;
}

.folder-dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
}

:deep(.el-input-group__prepend) {
	min-width: 60px;
	font-weight: 600;
	text-align: center;
	color: var(--text-muted);
	background-color: var(--bg-header);
}

.bulk-uploader {
	width: 100%;
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
	border-color: var(--color-primary);
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
	flex-shrink: 0;
	border: 1px solid var(--border-color);
	border-radius: 6px;
	transition: transform 0.2s;
	cursor: pointer;
	overflow: hidden;
	display: flex;
	align-items: center;
	justify-content: center;
	background: var(--bg-header);
}

.file-thumb:hover {
	border-color: var(--color-primary);
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
	background: rgba(168, 85, 247, 0.15);
	color: #a855f7;
}

.thumb-badge.pdf {
	background: rgba(239, 68, 68, 0.15);
	color: #ef4444;
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

.dialog-footer {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 16px;
}

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

.crop-modal-body {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.crop-cropper-area {
	width: 100%;
	height: 400px;
	border-radius: 8px;
	overflow: hidden;
	border: 1px solid var(--border-color);
}

.crop-modal-controls {
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 12px;
}

.crop-control-group {
	display: flex;
	align-items: center;
	gap: 8px;
}

.control-label {
	font-size: 13px;
	color: var(--text-muted);
}
</style>
