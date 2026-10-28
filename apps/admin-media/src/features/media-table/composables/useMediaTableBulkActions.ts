import { reactive, ref } from 'vue'

import { ElMessage, ElMessageBox } from 'element-plus'

import { useMedia } from '#entities/media'
import type { MediaItem } from '#entities/media/model'

/** Row selection + bulk operations toolbar for the media table: move-to-folder
 * dialog, delete confirmations, and the "Групповые операции" dropdown. */
export const useMediaTableBulkActions = () => {
	const { folders, batchMove, handleDelete, handleMultipleDelete, handleBulkUpdate, handleBulkOptimize } = useMedia()

	const selectedItems = ref<MediaItem[]>([])
	const isMoveFolderDialogOpen = ref(false)
	const targetFolderId = ref('root')
	const isMoving = ref(false)

	const getFolderById = (folderId?: string) => {
		if (!folderId) return null
		return folders.value.find((f) => f.id === folderId)
	}

	const handleSelectionChange = (val: MediaItem[]) => {
		selectedItems.value = val
	}

	const confirmDelete = (uuid: string) => {
		ElMessageBox.confirm('Are you sure you want to delete this file?', 'Warning', {
			confirmButtonText: 'Delete',
			cancelButtonText: 'Cancel',
			type: 'warning',
		}).then(() => {
			handleDelete(uuid)
		})
	}

	const confirmMultipleDelete = () => {
		if (selectedItems.value.length === 0) return
		ElMessageBox.confirm(`Are you sure you want to delete ${selectedItems.value.length} files?`, 'Warning', {
			confirmButtonText: 'Delete All',
			cancelButtonText: 'Cancel',
			type: 'warning',
		}).then(() => {
			const uuids = selectedItems.value.map((item) => item.uuid)

			handleMultipleDelete(uuids)

			selectedItems.value = []
		})
	}

	const handleMoveToFolder = () => {
		targetFolderId.value = 'root'
		isMoveFolderDialogOpen.value = true
	}

	const confirmMoveToFolder = async () => {
		isMoving.value = true
		try {
			const uuids = selectedItems.value.map((i) => i.uuid)
			const fId = targetFolderId.value === 'root' ? null : targetFolderId.value
			await batchMove({ uuids, folderId: fId })
			ElMessage.success('Files moved successfully')
			isMoveFolderDialogOpen.value = false
			selectedItems.value = []
		} catch (e: any) {
			ElMessage.error(e?.message || 'Failed to move files')
		} finally {
			isMoving.value = false
		}
	}

	const handleBulkCommand = (command: string) => {
		const uuids = selectedItems.value.map((i) => i.uuid)

		switch (command) {
			case 'moveToFolder':
				handleMoveToFolder()
				break
			case 'delete':
				confirmMultipleDelete()

				break
			case 'addTags':
				ElMessageBox.prompt('Введите теги через запятую', 'Добавить теги', {
					confirmButtonText: 'Добавить',
					cancelButtonText: 'Отмена',
				}).then(({ value }) => {
					if (value) {
						const tags = value.split(',').map((t) => t.trim())

						handleBulkUpdate(uuids, { tags })

						ElMessage.success(`Теги добавлены для ${uuids.length} файлов`)

						selectedItems.value = []
					}
				})

				break
			case 'changeCategory':
				ElMessageBox.prompt('Введите название категории', 'Сменить категорию', {
					confirmButtonText: 'Сменить',
					cancelButtonText: 'Отмена',
				}).then(({ value }) => {
					if (value) {
						handleBulkUpdate(uuids, { category: value })

						ElMessage.success(`Категория изменена для ${uuids.length} файлов`)

						selectedItems.value = []
					}
				})

				break
			case 'convertToWebP':
				ElMessage.info(`Генерация responsive превью и WebP для ${uuids.length} файлов...`)

				handleBulkOptimize(uuids)
					.then(() => {
						ElMessage.success(`Файлы (${uuids.length}) успешно обработаны и сконвертированы в WebP`)

						selectedItems.value = []
					})
					.catch((err: any) => {
						ElMessage.error(`Ошибка оптимизации: ${err?.message || 'Не удалось обработать'}`)
					})

				break
		}
	}

	return reactive({
		folders,
		selectedItems,
		isMoveFolderDialogOpen,
		targetFolderId,
		isMoving,
		getFolderById,
		handleSelectionChange,
		confirmDelete,
		confirmMoveToFolder,
		handleBulkCommand,
	})
}

export type MediaTableBulkActions = ReturnType<typeof useMediaTableBulkActions>
