<template>
	<el-dialog
		v-model="visible"
		:title="isEdit ? 'Edit Media' : 'Upload New Media'"
		width="600px"
		class="media-upload-dialog"
		destroy-on-close
	>
		<el-form label-position="top" @submit.prevent="handleSubmit" class="upload-form">
			<el-form-item label="Title" :error="errors.title">
				<el-input v-model="formData.title" placeholder="Enter media title" clearable />
			</el-form-item>

			<el-form-item label="Alt Text" :error="errors.alt">
				<el-input v-model="formData.alt" placeholder="Enter alt text for accessibility" clearable />
			</el-form-item>

			<el-form-item label="File" :error="errors.file">
				<div
					class="file-upload-area"
					:class="{ 'has-file': !!formData.file }"
					@click="triggerFileInput"
					@dragover.prevent="handleDragover"
					@drop.prevent="handleDrop"
				>
					<input
						type="file"
						id="mediaFileInput"
						ref="fileInput"
						@change="handleFileChange"
						accept="image/*,video/*,.svg"
						style="display: none"
					/>

					<div v-if="!formData.file" class="upload-placeholder">
						<el-icon class="upload-icon"><Upload /></el-icon>
						<p class="upload-text"> Drag & drop files here or <span>click to browse</span> </p>
						<p class="upload-hint"> Supported: JPG, PNG, GIF, SVG, MP4. Max 50MB </p>
					</div>

					<div v-else class="file-preview">
						<div v-if="isImage(formData.file)" class="image-preview">
							<el-image :src="formData.file.preview" fit="contain" class="preview-content" />
							<div class="file-info">
								<span class="file-name">{{ formData.file.name }}</span>
								<span class="file-size">{{ formatFileSize(formData.file.size) }}</span>
							</div>
						</div>
						<div v-else class="video-preview">
							<video controls class="preview-content">
								<source :src="formData.file.preview" :type="getMimeType(formData.file.name)" />
							</video>
							<div class="file-info">
								<span class="file-name">{{ formData.file.name }}</span>
								<span class="file-size">{{ formatFileSize(formData.file.size) }}</span>
							</div>
						</div>

						<el-button type="danger" :icon="Delete" circle class="remove-btn" @click.stop="removeFile" />
					</div>
				</div>
			</el-form-item>
		</el-form>

		<template #footer>
			<div class="dialog-footer">
				<el-button @click="handleCancel">Cancel</el-button>
				<el-button type="primary" @click="handleSubmit" :disabled="!isFormValid" :loading="loading">
					{{ isEdit ? 'Save Changes' : 'Upload Media' }}
				</el-button>
			</div>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Upload, Delete } from '@element-plus/icons-vue'
import type { MediaItem, MediaFile } from '@/entities/media/model'
import { mediaUtils } from '#entities/media'

export interface Props {
	isEdit?: boolean
	media?: MediaItem
}

export interface Emits {
	(e: 'submit', data: { title?: string; alt?: string; file?: File }): void
	(e: 'cancel'): void
}

const visible = defineModel({
	type: Boolean,
	required: true,
})
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const formData = ref({
	title: '',
	alt: '',
	file: null as MediaFile | null,
})

const errors = ref({
	title: '',
	alt: '',
	file: '',
})

const loading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

// Computed
const isFormValid = computed(() => {
	return !errors.value.title && !errors.value.alt && (props.isEdit || !!formData.value.file)
})

// Watch for prop changes
watch(visible, (newVal) => {
	if (newVal && props.media && props.isEdit) {
		formData.value.title = props.media.title || ''

		formData.value.alt = props.media.alt || ''

		formData.value.file = null
	} else if (newVal) {
		resetForm()
	}
})

// Methods
const handleSubmit = () => {
	if (!validateForm()) return

	loading.value = true

	try {
		const submitData = {
			title: formData.value.title || undefined,
			alt: formData.value.alt || undefined,
			file: formData.value.file?.file,
		}

		emit('submit', submitData)
	} finally {
		loading.value = false
	}
}

const handleCancel = () => {
	visible.value = false

	emit('cancel')
}

const validateForm = (): boolean => {
	let isValid = true

	// Validate title (optional but max length)
	if (formData.value.title && formData.value.title.length > 100) {
		errors.value.title = 'Title must be less than 100 characters'

		isValid = false
	} else {
		errors.value.title = ''
	}

	// Validate alt text (optional but max length)
	if (formData.value.alt && formData.value.alt.length > 200) {
		errors.value.alt = 'Alt text must be less than 200 characters'

		isValid = false
	} else {
		errors.value.alt = ''
	}

	// Validate file (required for new media)
	if (!props.isEdit && !formData.value.file) {
		errors.value.file = 'Please select a file'

		isValid = false
	} else {
		errors.value.file = ''
	}

	return isValid
}

const handleFileChange = (event: Event) => {
	const target = event.target as HTMLInputElement

	if (target.files && target.files.length > 0) {
		const file = target.files[0]
		const validation = mediaUtils.validateMediaFile(file)

		if (!validation.valid) {
			errors.value.file = validation.message || 'Invalid file'

			return
		}

		processFile(file)
	}
}

const processFile = (file: File) => {
	mediaUtils
		.createFilePreview(file)
		.then((preview) => {
			formData.value.file = {
				file,
				name: file.name,
				type: file.type,
				size: file.size,
				preview,
			}

			errors.value.file = ''
		})
		.catch(() => {
			errors.value.file = 'Failed to process file'
		})
}

const removeFile = () => {
	formData.value.file = null

	if (fileInput.value) {
		fileInput.value.value = ''
	}

	errors.value.file = ''
}

const triggerFileInput = () => {
	if (fileInput.value) {
		fileInput.value.click()
	}
}

const handleDragover = (event: DragEvent) => {
	if (event.dataTransfer?.dropEffect) {
		event.dataTransfer.dropEffect = 'copy'
	}
}

const handleDrop = (event: DragEvent) => {
	const files = event.dataTransfer?.files

	if (files && files.length > 0) {
		const file = files[0]
		const validation = mediaUtils.validateMediaFile(file)

		if (!validation.valid) {
			errors.value.file = validation.message || 'Invalid file'

			return
		}

		processFile(file)
	}
}

const isImage = (file: MediaFile | null): boolean => {
	return file ? mediaUtils.isImage(file.file) : false
}

const getMimeType = (filename: string): string => {
	return mediaUtils.getMimeType(filename)
}

const formatFileSize = (bytes: number): string => {
	return mediaUtils.formatFileSize(bytes)
}

const resetForm = () => {
	formData.value = {
		title: '',
		alt: '',
		file: null,
	}

	errors.value = {
		title: '',
		alt: '',
		file: '',
	}
}
</script>

<style scoped>
.upload-form {
	padding: 10px 0;
}

.file-upload-area {
	width: 100%;
	position: relative;
	border: 2px dashed #dcdfe6;
	border-radius: 8px;
	box-sizing: border-box;
	text-align: center;
	background-color: #fafafa;
	transition: all 0.3s ease;
	cursor: pointer;
	padding: 30px;
}

.file-upload-area:hover {
	border-color: #409eff;
	background-color: #f0f7ff;
}

.file-upload-area.has-file {
	border-style: solid;
	padding: 15px;
}

.upload-placeholder {
	color: #909399;
}

.upload-icon {
	font-size: 40px;
	color: #c0c4cc;
	margin-bottom: 15px;
}

.upload-text {
	font-size: 16px;
	margin: 5px 0;
}

.upload-text span {
	font-weight: 500;
	color: #409eff;
}

.upload-hint {
	font-size: 13px;
	margin-top: 8px;
}

.file-preview {
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 15px;
}

.preview-content {
	max-width: 100%;
	max-height: 200px;
	border-radius: 4px;
	box-shadow: 0 2px 8px rgb(0, 0, 0, 0.1);
}

.file-info {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.file-name {
	font-weight: 500;
	word-break: break-all;
	color: #303133;
}

.file-size {
	font-size: 12px;
	color: #909399;
}

.remove-btn {
	top: 10px;
	right: 10px;
	position: absolute;
}

.dialog-footer {
	display: flex;
	justify-content: flex-end;
	gap: 12px;
}
</style>
