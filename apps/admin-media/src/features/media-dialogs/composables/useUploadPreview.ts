import { reactive, ref } from 'vue'

import type { FileWithMeta } from './useUploadFilesList'

/** The inner "preview a staged file before upload" dialog. */
export const useUploadPreview = () => {
	const isPreviewOpen = ref(false)
	const activePreviewFile = ref<FileWithMeta | null>(null)
	const previewBg = ref('checkered')

	const openFilePreview = (file: FileWithMeta) => {
		activePreviewFile.value = file
		isPreviewOpen.value = true
	}

	return reactive({
		isPreviewOpen,
		activePreviewFile,
		previewBg,
		openFilePreview,
	})
}

export type UploadPreview = ReturnType<typeof useUploadPreview>
