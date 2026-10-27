import { reactive, ref } from 'vue'

import { ElMessage, ElMessageBox } from 'element-plus'

import type { MediaFolder } from '#entities/media'

interface FolderDialogDeps {
	createFolder: (data: { name: string; color?: string }) => Promise<any>
	updateFolder: (data: { id: string; data: { name: string; color?: string } }) => Promise<any>
	deleteFolder: (id: string) => Promise<any>
}

/** The create/edit/delete dialog for media folders. */
export const useMediaFolderDialog = (deps: FolderDialogDeps) => {
	const isFolderDialogOpen = ref(false)
	const isEditingFolder = ref(false)
	const editingFolderId = ref('')
	const folderForm = ref({ name: '', color: '#409EFF' })

	const openCreateFolderDialog = () => {
		isEditingFolder.value = false
		editingFolderId.value = ''
		folderForm.value = { name: '', color: '#409EFF' }
		isFolderDialogOpen.value = true
	}

	const handleFolderCommand = (cmd: string, folder: MediaFolder) => {
		if (cmd === 'edit') {
			isEditingFolder.value = true
			editingFolderId.value = folder.id
			folderForm.value = { name: folder.name, color: folder.color || '#409EFF' }
			isFolderDialogOpen.value = true
		} else if (cmd === 'delete') {
			ElMessageBox.confirm(
				`Are you sure you want to delete folder "${folder.name}"? Media files inside it will remain intact.`,
				'Delete Folder',
				{
					confirmButtonText: 'Delete',
					cancelButtonText: 'Cancel',
					type: 'warning',
				}
			).then(async () => {
				await deps.deleteFolder(folder.id)
				ElMessage.success('Folder deleted')
			})
		}
	}

	const saveFolder = async () => {
		if (!folderForm.value.name.trim()) return

		if (isEditingFolder.value) {
			await deps.updateFolder({ id: editingFolderId.value, data: folderForm.value })
			ElMessage.success('Folder updated')
		} else {
			await deps.createFolder(folderForm.value)
			ElMessage.success('Folder created')
		}

		isFolderDialogOpen.value = false
	}

	return reactive({
		isFolderDialogOpen,
		isEditingFolder,
		folderForm,
		openCreateFolderDialog,
		handleFolderCommand,
		saveFolder,
	})
}

export type MediaFolderDialog = ReturnType<typeof useMediaFolderDialog>
