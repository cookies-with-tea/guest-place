<template>
	<el-dialog
		v-model="folderDialog.isFolderDialogOpen"
		:title="folderDialog.isEditingFolder ? 'Edit Folder' : 'Create New Folder'"
		width="420px"
	>
		<el-form label-position="top">
			<el-form-item label="Folder Name" required>
				<el-input v-model="folderDialog.folderForm.name" placeholder="e.g. Hero Banners, Room Photos" autofocus />
			</el-form-item>
			<el-form-item label="Folder Color Tag">
				<div class="color-picker-row">
					<el-color-picker v-model="folderDialog.folderForm.color" />
					<span class="color-hex-label">{{ folderDialog.folderForm.color }}</span>
				</div>
			</el-form-item>
		</el-form>
		<template #footer>
			<el-button @click="folderDialog.isFolderDialogOpen = false">Cancel</el-button>
			<el-button type="primary" :disabled="!folderDialog.folderForm.name.trim()" @click="folderDialog.saveFolder">
				{{ folderDialog.isEditingFolder ? 'Save Changes' : 'Create Folder' }}
			</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import type { MediaFolderDialog } from '../../composables/useMediaFolderDialog'

defineProps<{
	folderDialog: MediaFolderDialog
}>()
</script>

<style scoped>
.color-picker-row {
	display: flex;
	align-items: center;
	gap: 12px;
}

.color-hex-label {
	font-family: monospace;
	font-weight: 600;
	color: var(--text-muted);
}
</style>
