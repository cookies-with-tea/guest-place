<template>
	<el-dialog v-model="bulk.isMoveFolderDialogOpen" title="Move to Folder" width="400px">
		<el-form label-position="top">
			<el-form-item label="Target Folder">
				<el-select v-model="bulk.targetFolderId" placeholder="Select destination folder" style="width: 100%">
					<el-option label="📁 Unorganized (Root)" value="root" />
					<el-option v-for="folder in bulk.folders" :key="folder.id" :label="folder.name" :value="folder.id">
						<span class="folder-dot" :style="{ backgroundColor: folder.color || '#409EFF', marginRight: '8px' }" />
						<span>{{ folder.name }}</span>
					</el-option>
				</el-select>
			</el-form-item>
		</el-form>
		<template #footer>
			<el-button @click="bulk.isMoveFolderDialogOpen = false">Cancel</el-button>
			<el-button type="primary" :loading="bulk.isMoving" @click="bulk.confirmMoveToFolder">Move Items</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import type { MediaTableBulkActions } from '../../composables/useMediaTableBulkActions'

defineProps<{
	bulk: MediaTableBulkActions
}>()
</script>

<style scoped>
.folder-dot {
	width: 7px;
	height: 7px;
	display: inline-block;
	border-radius: 50%;
}
</style>
