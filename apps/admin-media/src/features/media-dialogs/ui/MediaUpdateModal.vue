<template>
	<UiModal v-model="isEditModalOpen" title="Edit Media" :width="600" @close="closeEditModal">
		<div v-if="currentMedia?.data" v-loading="isSubmitting" class="edit-container">
			<div class="media-context">
				<el-image
					v-if="currentMedia.data.mediaType === 'image'"
					class="context-thumb"
					fit="cover"
					:src="currentMedia.data.url"
				/>
				<el-icon v-else :size="48"><Document /></el-icon>
				<span class="filename">{{ currentMedia.data.name }}</span>
			</div>

			<el-form label-position="top">
				<el-form-item label="Title">
					<el-input v-model="form.title" placeholder="Enter media title" />
				</el-form-item>
				<el-form-item label="Alt Text">
					<el-input v-model="form.alt" placeholder="Enter alternative text for accessibility" type="textarea" />
				</el-form-item>
			</el-form>
		</div>

		<template #footer>
			<el-button @click="closeEditModal">Cancel</el-button>
			<el-button :loading="isSubmitting" type="primary" @click="handleSave"> Save Changes </el-button>
		</template>
	</UiModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import { UiModal } from '@admin-panel/ui'
import { Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

import { useMedia } from '#entities/media'

const { currentMedia, isEditModalOpen, closeEditModal, updateMedia, isSubmitting } = useMedia()

const form = ref({
	title: '',
	alt: '',
})

watch(
	() => currentMedia?.value?.data,
	(newData) => {
		if (newData) {
			form.value.title = newData.title || ''

			form.value.alt = newData.alt || ''
		}
	},
	{ immediate: true }
)

const handleSave = () => {
	if (!currentMedia?.value?.data?.uuid) return

	updateMedia({
		uuid: currentMedia.value.data.uuid,
		data: {
			title: form.value.title,
			alt: form.value.alt,
		},
	})

	ElMessage.success('Media updated successfully')
}
</script>

<style scoped>
.edit-container {
	display: flex;
	flex-direction: column;
	gap: 24px;
}

.media-context {
	display: flex;
	align-items: center;
	border: 1px solid var(--border-color);
	border-radius: 12px;
	background: var(--bg-surface);
	padding: 16px;
	gap: 16px;
}

.context-thumb {
	width: 80px;
	height: 80px;
	border-radius: 8px;
	object-fit: cover;
}

.filename {
	font-weight: 500;
	word-break: break-all;
	color: var(--text-primary);
}

.dialog-footer {
	display: flex;
	justify-content: flex-end;
	gap: 12px;
}
</style>
