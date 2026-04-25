<template>
	<div class="media-index-page">
		<div class="page-header">
			<div class="header-left">
				<h1 class="page-title">Media Library</h1>
				<p class="page-subtitle">Manage and organize your digital assets</p>
			</div>
			<div class="header-right">
				<el-button v-if="selectedUuids.length > 0" plain type="danger" @click="confirmBatchDelete">
					Delete Selected ({{ selectedUuids.length }})
				</el-button>
				<el-button type="primary" @click="openUploadModal">
					<el-icon class="el-icon--left"><Plus /></el-icon>
					Upload Media
				</el-button>
			</div>
		</div>

		<div class="page-content">
			<MediaTable ref="tableRef" />
		</div>

		<!-- Dialogs -->
		<MediaUploadDialog />
		<MediaPreviewDialog />
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { Plus } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

import { MediaPreviewDialog, MediaUploadDialog } from '#features/media-dialogs'
import { MediaTable } from '#features/media-table'

import { useMedia } from '#entities/media'

const { openUploadModal, handleMultipleDelete } = useMedia()

const tableRef = ref<any>(null)

const selectedUuids = computed(() => {
	return tableRef.value?.selectedItems?.map((m: any) => m.uuid) || []
})

const confirmBatchDelete = () => {
	ElMessageBox.confirm(`Are you sure you want to delete ${selectedUuids.value.length} files?`, 'Warning', {
		confirmButtonText: 'Delete',
		cancelButtonText: 'Cancel',
		type: 'warning',
	}).then(() => {
		handleMultipleDelete(selectedUuids.value)
	})
}
</script>

<style scoped>
.media-index-page {
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	padding: 24px;
	gap: 24px;
}

.page-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.page-title {
	font-weight: 700;
	font-size: 24px;
	color: var(--text-primary);
	margin: 0;
}

.page-subtitle {
	font-size: 14px;
	color: var(--text-muted);
	margin: 4px 0 0;
}

.header-right {
	display: flex;
	gap: 12px;
}

.page-content {
	flex: 1;
}
</style>
