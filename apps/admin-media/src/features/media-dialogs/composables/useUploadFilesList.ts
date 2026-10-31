import { reactive, ref } from 'vue'

import { mediaUtils } from '#entities/media'

export interface FileWithMeta {
	file: File
	title: string
	alt: string
	category: string
	tags: string[]
	folderId?: string | null
	isCustom: boolean
	preview?: string
	progress?: number
	status?: 'idle' | 'hashing' | 'uploading' | 'verifying' | 'completed' | 'error'
	statusMessage?: string
}

/** The staged files list for the bulk upload dialog: add/remove/toggle-custom-fields. */
export const useUploadFilesList = () => {
	const filesToUpload = ref<FileWithMeta[]>([])

	const handleFileChange = (file: any) => {
		const rawFile = file.raw as File
		let preview: string | undefined

		if (
			mediaUtils.isImage(rawFile) ||
			mediaUtils.isVideo(rawFile) ||
			rawFile.type === 'application/pdf' ||
			rawFile.name.toLowerCase().endsWith('.pdf')
		) {
			preview = URL.createObjectURL(rawFile)
		}

		filesToUpload.value.push({
			file: rawFile,
			title: '',
			alt: '',
			category: '',
			tags: [],
			folderId: null,
			isCustom: false,
			preview,
			progress: 0,
			status: 'idle',
			statusMessage: '',
		})
	}

	const handleFileRemove = (file: any) => {
		const index = filesToUpload.value.findIndex((f) => f.file === file.raw)

		if (index !== -1) {
			const removed = filesToUpload.value.splice(index, 1)[0]

			if (removed.preview) {
				URL.revokeObjectURL(removed.preview)
			}
		}
	}

	const toggleCustom = (index: number) => {
		filesToUpload.value[index].isCustom = !filesToUpload.value[index].isCustom
	}

	const reset = () => {
		filesToUpload.value.forEach((f) => {
			if (f.preview) URL.revokeObjectURL(f.preview)
		})

		filesToUpload.value = []
	}

	return reactive({
		filesToUpload,
		handleFileChange,
		handleFileRemove,
		toggleCustom,
		reset,
	})
}

export type UploadFilesList = ReturnType<typeof useUploadFilesList>
