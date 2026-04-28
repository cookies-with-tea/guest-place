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
						<el-checkbox v-model="isApplyToAll">Apply to all files</el-checkbox>
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

interface FileWithMeta {
	file: File
	title: string
	alt: string
	category: string
	tags: string[]
	isCustom: boolean
}

const filesToUpload = ref<FileWithMeta[]>([])

const handleFileChange = (file: any) => {
	filesToUpload.value.push({
		file: file.raw,
		title: '',
		alt: '',
		category: '',
		tags: [],
		isCustom: false,
	})
}

const handleFileRemove = (file: any) => {
	const index = filesToUpload.value.findIndex((f) => f.file === file.raw)

	if (index !== -1) filesToUpload.value.splice(index, 1)
}

const toggleCustom = (index: number) => {
	filesToUpload.value[index].isCustom = !filesToUpload.value[index].isCustom
}

const handleUpload = async () => {
	if (filesToUpload.value.length === 0) return

	try {
		const formData = new FormData()

		formData.append('source', 'cms')

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
	filesToUpload.value = []

	globalTitle.value = ''

	globalAlt.value = ''

	globalCategory.value = ''

	globalTags.value = []

	isApplyToAll.value = true

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
	gap: 8px;
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
</style>
