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
				<el-form-item label="Category">
					<el-select v-model="form.category" clearable filterable placeholder="Select category">
						<el-option label="Marketing" value="Marketing" />
						<el-option label="UI/UX" value="UI/UX" />
						<el-option label="Content" value="Content" />
					</el-select>
				</el-form-item>
				<el-form-item label="Tags">
					<el-select
						v-model="form.tags"
						allow-create
						clearable
						default-first-option
						filterable
						multiple
						placeholder="Add tags..."
					>
						<el-option label="Hero" value="Hero" />
						<el-option label="Banner" value="Banner" />
						<el-option label="Mobile" value="Mobile" />
						<el-option label="Icon" value="Icon" />
						<el-option label="Dark" value="Dark" />
					</el-select>
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
	category: '',
	tags: [] as string[],
})

watch(
	() => currentMedia?.value?.data,
	(newData) => {
		if (newData) {
			form.value.title = newData.title || ''

			form.value.alt = newData.alt || ''

			form.value.category = newData.category || ''

			form.value.tags = newData.tags || []
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
			category: form.value.category,
			tags: form.value.tags,
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
