<template>
	<UiModal
		v-model="isUploadModalOpen"
		class="media-upload-dialog"
		title="Bulk Media Upload"
		:width="700"
		@close="closeAndReset"
	>
		<div
			v-loading="isSubmitting"
			element-loading-text="Uploading & processing files..."
			element-loading-background="rgba(0, 0, 0, 0.7)"
			class="upload-container"
		>
			<!-- Global Settings -->
			<el-card class="global-settings-card" shadow="never">
				<template #header>
					<div class="card-header">
						<span class="header-title">Global Metadata</span>
						<div class="header-actions">
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
							v-model="globalCategory"
							clearable
							filterable
							placeholder="Shared Category"
							:disabled="!isApplyToAll"
						>
							<el-option label="Marketing" value="Marketing" />
							<el-option label="UI/UX" value="UI/UX" />
							<el-option label="Content" value="Content" />
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
				class="bulk-uploader"
			>
				<el-icon class="el-icon--upload"><UploadFilled /></el-icon>
				<div class="el-upload__text"> Drop multiple files here or <em>click to upload</em> </div>
			</el-upload>

			<!-- Files List -->
			<div v-if="filesToUpload.length > 0" class="files-grid">
				<div v-for="(file, index) in filesToUpload" :key="index" class="compact-file-item">
					<div class="item-main">
						<div v-if="file.preview" class="file-thumb" @click="openFilePreview(file)">
							<img :src="file.preview" />
						</div>
						<span class="file-name">{{ file.file.name.substring(0, 20) }}...</span>
						<el-tag size="small" type="info">{{ (file.file.size / 1024 / 1024).toFixed(2) }}MB</el-tag>
						<el-button
							circle
							size="small"
							:type="file.isCustom ? 'warning' : 'default'"
							:icon="Edit"
							@click="toggleCustom(index)"
						/>
					</div>

					<el-collapse-transition>
						<div v-if="file.isCustom" class="item-custom-fields">
							<el-input v-model="file.title" placeholder="Custom Title" size="small" />
							<el-input v-model="file.alt" placeholder="Custom Alt" size="small" />
							<el-select v-model="file.category" clearable filterable placeholder="Category" size="small">
								<el-option label="Marketing" value="Marketing" />
								<el-option label="UI/UX" value="UI/UX" />
								<el-option label="Content" value="Content" />
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
					<el-button
						:disabled="filesToUpload.length === 0"
						:loading="isSubmitting"
						type="primary"
						@click="handleUpload"
					>
						Upload All
					</el-button>
				</el-badge>
			</div>
		</template>
	</UiModal>

	<!-- Inner Preview for Uploading Files -->
	<el-dialog v-model="isPreviewOpen" append-to-body title="File Preview" width="600px">
		<div v-if="activePreviewFile" class="upload-preview-container" :class="previewBg">
			<img :src="activePreviewFile.preview" class="upload-preview-img" />
			<div class="bg-toggle">
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
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { UiModal } from '@admin-panel/ui'
import { Edit, UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

import { useMedia } from '#entities/media'

const { isUploadModalOpen, closeUploadModal, createMedia, isSubmitting } = useMedia()

const globalTitle = ref('')
const globalAlt = ref('')
const globalCategory = ref('')
const globalTags = ref<string[]>([])
const isApplyToAll = ref(true)
const convertToWebP = ref(true)

interface FileWithMeta {
	file: File
	title: string
	alt: string
	category: string
	tags: string[]
	isCustom: boolean
	preview?: string
}

const filesToUpload = ref<FileWithMeta[]>([])

const isPreviewOpen = ref(false)
const activePreviewFile = ref<FileWithMeta | null>(null)
const previewBg = ref('checkered')

const openFilePreview = (file: FileWithMeta) => {
	activePreviewFile.value = file

	isPreviewOpen.value = true
}

const handleFileChange = (file: any) => {
	const preview = file.raw.type.startsWith('image/') ? URL.createObjectURL(file.raw) : undefined

	filesToUpload.value.push({
		file: file.raw,
		title: '',
		alt: '',
		category: '',
		tags: [],
		isCustom: false,
		preview,
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

const handleUpload = async () => {
	if (filesToUpload.value.length === 0) return

	try {
		const formData = new FormData()

		formData.append('source', 'cms')

		formData.append('convert_to_webp', String(convertToWebP.value))

		filesToUpload.value.forEach((item, index) => {
			formData.append('file', item.file)

			const finalTitle = isApplyToAll.value && !item.isCustom ? globalTitle.value : item.title

			const finalAlt = isApplyToAll.value && !item.isCustom ? globalAlt.value : item.alt

			const finalCategory = isApplyToAll.value && !item.isCustom ? globalCategory.value : item.category

			const finalTags = isApplyToAll.value && !item.isCustom ? globalTags.value : item.tags

			// Using indexed keys for better reliability as suggested by user
			formData.append(`title_${index}`, finalTitle || '')

			formData.append(`alt_${index}`, finalAlt || '')

			formData.append(`category_${index}`, finalCategory || '')

			formData.append(`tags_${index}`, (finalTags || []).join(','))
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
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
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
	gap: 12px;
}

.file-thumb {
	width: 32px;
	height: 32px;
	flex-shrink: 0;
	border: 1px solid var(--border-color);
	border-radius: 4px;
	transition: transform 0.2s;
	cursor: pointer;
	overflow: hidden;
}

.file-thumb:hover {
	border-color: var(--color-primary);
	transform: scale(1.1);
}

.file-thumb img {
	width: 100%;
	height: 100%;
	object-fit: cover;
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
	height: 400px;
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
