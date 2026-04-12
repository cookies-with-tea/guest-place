<template>
	<el-dialog
		v-model="visible"
		:title="media.title || 'Media Preview'"
		width="80%"
		style="max-width: 900px"
		class="media-preview-dialog"
		destroy-on-close
	>
		<div class="media-preview-content">
			<div v-if="isImage" class="image-preview-large">
				<el-image
					:src="media.url"
					:alt="media.alt || media.title || 'Media preview'"
					class="preview-image"
					fit="contain"
					:preview-src-list="[media.url]"
				/>
			</div>
			<div v-else class="video-preview-large">
				<video controls :src="media.url" class="preview-video">
					<source :src="media.url" :type="getMimeType(media.url)" />
					Your browser does not support the video tag.
				</video>
			</div>
			<div class="media-info">
				<h3>{{ media.title || 'Untitled' }}</h3>
				<el-descriptions :column="1" border>
					<el-descriptions-item v-if="media.alt" label="Alt Text">
						{{ media.alt }}
					</el-descriptions-item>
					<el-descriptions-item label="Filename">
						{{ media.filename || 'unknown' }}
					</el-descriptions-item>
					<el-descriptions-item label="Size">
						{{ formatFileSize(media.size) }}
					</el-descriptions-item>
					<el-descriptions-item label="Added">
						{{ formatDate(media.createdAt) }}
					</el-descriptions-item>
				</el-descriptions>
			</div>
		</div>
		<template #footer>
			<div class="dialog-footer">
				<el-button @click="handleClose">Close</el-button>
				<el-button v-if="showEditButton" type="primary" :icon="Edit" @click="handleEdit"> Edit </el-button>
			</div>
		</template>
	</el-dialog>
</template>

<script setup lang="ts" generic="T extends MediaItem">
import { computed } from 'vue'
import { Edit } from '@element-plus/icons-vue'
import type { MediaItem } from '@/entities/media/model'
import { mediaUtils } from '@/entities/media/utils/media.utils'

export interface Props<T> {
	media: T
	showEditButton?: boolean
}

export interface Emits<T> {
	(e: 'edit', media: T): void
	(e: 'close'): void
}

const visible = defineModel({
	type: Boolean,
	required: true,
})

const props = withDefaults(defineProps<Props<T>>(), {
	showEditButton: true,
})

const emit = defineEmits<Emits<T>>()

// Computed
const isImage = computed(() => {
	return mediaUtils.isImage(props.media.url)
})

// Methods
const handleClose = () => {
	visible.value = false

	emit('close')
}

const handleEdit = () => {
	emit('edit', props.media)

	visible.value = false
}

const formatFileSize = (bytes: number): string => {
	return mediaUtils.formatFileSize(bytes)
}

const formatDate = (date: Date): string => {
	return mediaUtils.formatDate(date)
}

const getMimeType = (filename: string): string => {
	return mediaUtils.getMimeType(filename)
}
</script>

<style scoped>
.media-preview-content {
	display: flex;
	flex-wrap: wrap;
	padding: 10px 0;
	gap: 2rem;
}

.image-preview-large,
.video-preview-large {
	min-width: 300px;
	display: flex;
	flex: 1;
	align-items: center;
	justify-content: center;
}

.preview-image {
	width: 100%;
	border-radius: 8px;
	box-shadow: 0 4px 12px rgb(0, 0, 0, 0.1);
}

.preview-video {
	max-width: 100%;
	border-radius: 8px;
	box-shadow: 0 4px 12px rgb(0, 0, 0, 0.1);
}

.media-info {
	min-width: 250px;
	flex: 1;
}

.media-info h3 {
	font-weight: 600;
	color: #303133;
	margin-top: 0;
	margin-bottom: 1.5rem;
}

.dialog-footer {
	display: flex;
	justify-content: flex-end;
	gap: 12px;
}

@media (width <= 768px) {
	.media-preview-content {
		flex-direction: column;
	}
}
</style>
