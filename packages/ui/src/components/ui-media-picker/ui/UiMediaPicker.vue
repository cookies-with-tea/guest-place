<template>
	<div class="ui-media-picker" tabindex="0" @paste="handlePaste">
		<div v-if="loading" class="media-picker-loading">
			<el-skeleton animated>
				<template #template>
					<el-skeleton-item variant="image" class="skeleton-image" />
				</template>
			</el-skeleton>
		</div>

		<div v-else-if="currentMediaUrl" class="media-preview">
			<el-image :src="currentMediaUrl" fit="cover" class="preview-image" :preview-src-list="[currentMediaUrl]" />
			<div class="media-actions">
				<el-button type="danger" circle :icon="Delete" @click="handleRemove" />
				<el-upload
					action="#"
					:auto-upload="false"
					:show-file-list="false"
					:on-change="handleUpload"
					class="upload-trigger"
				>
					<el-button type="primary" circle :icon="Refresh" />
				</el-upload>
			</div>
		</div>

		<div v-else class="media-empty">
			<el-upload
				action="#"
				:auto-upload="false"
				:show-file-list="false"
				:on-change="handleUpload"
				class="empty-upload"
				drag
			>
				<el-icon class="el-icon--upload"><UploadFilled /></el-icon>
				<div class="el-upload__text">
					Drop file here, <em>click to upload</em> or <strong>paste from clipboard</strong>
				</div>
			</el-upload>
		</div>

		<div v-if="modelValue" class="media-uuid">
			<code>{{ modelValue }}</code>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Delete, Refresh, UploadFilled } from '@element-plus/icons-vue'
import { createApi, uploadMedia } from '@admin-panel/lib'
import { ElMessage } from 'element-plus'

interface Props {
	modelValue?: string | null
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const { fetchData: apiFetch } = createApi('media')
const currentMediaUrl = ref('')
const loading = ref(false)

const fetchMediaInfo = async (uuid: string) => {
	if (!uuid) return

	loading.value = true

	try {
		const response = await apiFetch<{ url: string }>(`/${uuid}`)

		if (response.data) {
			currentMediaUrl.value = response.data.url
		}
	} catch {
		// Silent fail or handle error
	} finally {
		loading.value = false
	}
}

const processFile = async (rawFile: File) => {
	try {
		loading.value = true

		const result = await uploadMedia(rawFile)

		if (result) {
			emit('update:modelValue', result.uuid)

			currentMediaUrl.value = result.url

			ElMessage.success('Media uploaded successfully')
		}
	} catch {
		ElMessage.error('Failed to upload media')
	} finally {
		loading.value = false
	}
}

const handleUpload = async (file: any) => {
	if (file.raw) {
		await processFile(file.raw)
	}
}

const handlePaste = async (event: ClipboardEvent) => {
	const items = event.clipboardData?.items

	if (!items) return

	for (const item of items) {
		if (item.type.indexOf('image') !== -1) {
			const blob = item.getAsFile()

			if (blob) {
				await processFile(blob)

				// Important to prevent default paste behavior if any
				event.preventDefault()

				break
			}
		}
	}
}

const handleRemove = () => {
	emit('update:modelValue', null)

	currentMediaUrl.value = ''
}

watch(
	() => props.modelValue,
	(newVal) => {
		if (newVal && !currentMediaUrl.value) {
			fetchMediaInfo(newVal)
		} else if (!newVal) {
			currentMediaUrl.value = ''
		}
	}
)

onMounted(() => {
	if (props.modelValue) {
		fetchMediaInfo(props.modelValue)
	}
})
</script>

<style scoped lang="scss">
.ui-media-picker {
	width: 100%;
	border: 1px dashed var(--gp-glass-border);
	border-radius: 12px;
	background: rgb(255, 255, 255, 0.02);
	transition: all 0.3s;
	padding: 12px;

	&:hover,
	&:focus {
		outline: none;
		border-color: var(--gp-primary);
		background: rgb(var(--gp-primary-rgb), 0.03);
	}

	&:focus {
		box-shadow: 0 0 0 2px rgb(var(--gp-primary-rgb), 0.2);
	}
}

.media-preview {
	width: 100%;
	height: 180px;
	position: relative;
	border-radius: 8px;
	overflow: hidden;

	.preview-image {
		width: 100%;
		height: 100%;
	}

	.media-actions {
		top: 10px;
		right: 10px;
		position: absolute;
		display: flex;
		transform: translateY(-5px);
		transition: all 0.3s;
		opacity: 0;
		gap: 8px;
	}

	&:hover .media-actions {
		transform: translateY(0);
		opacity: 1;
	}
}

.media-empty {
	:deep(.el-upload-dragger) {
		border: none;
		background: transparent;
		padding: 20px;

		&:hover {
			border-color: var(--gp-primary);
		}
	}
}

.media-uuid {
	font-size: 11px;
	word-break: break-all;
	color: var(--gp-text-secondary);
	margin-top: 8px;
	opacity: 0.6;
}

.skeleton-image {
	width: 100%;
	height: 180px;
	border-radius: 8px;
}
</style>
