import { computed, reactive, ref } from 'vue'

import { useQueryClient } from '@tanstack/vue-query'

import { MEDIA_QUERY_KEY, uploadFileInChunks } from '#entities/media'
import { ElMessage } from 'element-plus'

import type { UploadFilesList } from './useUploadFilesList'

interface MediaSubmitDeps {
	createMedia: (formData: FormData) => Promise<any>
	closeUploadModal: () => void
	isSubmitting: { value: boolean }
}

/** Global metadata/destination fields and the submit logic for the bulk upload dialog. */
export const useMediaUploadSubmit = (filesList: UploadFilesList, deps: MediaSubmitDeps) => {
	const queryClient = useQueryClient()

	const globalTitle = ref('')
	const globalAlt = ref('')
	const globalCategory = ref('')
	const globalTags = ref<string[]>([])
	const globalFolderId = ref<string | null>(null)
	const isApplyToAll = ref(true)
	const convertToWebP = ref(true)
	const useChunkedUpload = ref(true)
	const isChunkUploading = ref(false)

	const isUploading = computed(() => deps.isSubmitting.value || isChunkUploading.value)

	const closeAndReset = () => {
		filesList.reset()

		globalTitle.value = ''
		globalAlt.value = ''
		globalCategory.value = ''
		globalTags.value = []
		globalFolderId.value = null
		isApplyToAll.value = true
		convertToWebP.value = true

		deps.closeUploadModal()
	}

	const handleUploadChunked = async () => {
		isChunkUploading.value = true

		try {
			for (const item of filesList.filesToUpload) {
				const finalTitle = isApplyToAll.value && !item.isCustom ? globalTitle.value : item.title
				const finalAlt = isApplyToAll.value && !item.isCustom ? globalAlt.value : item.alt
				const finalCategory = isApplyToAll.value && !item.isCustom ? globalCategory.value : item.category
				const finalTags = isApplyToAll.value && !item.isCustom ? globalTags.value : item.tags
				const finalFolderId =
					(isApplyToAll.value && !item.isCustom ? globalFolderId.value : item.folderId) ??
					globalFolderId.value ??
					undefined

				await uploadFileInChunks({
					file: item.file,
					title: finalTitle,
					alt: finalAlt,
					category: finalCategory,
					tags: finalTags,
					folderId: finalFolderId,
					convertToWebp: convertToWebP.value,
					onProgress: (p) => {
						item.progress = p.percent
						item.status = p.stage
						item.statusMessage = p.message
					},
				})
			}

			await queryClient.invalidateQueries({ queryKey: [MEDIA_QUERY_KEY] })
			ElMessage.success('Files uploaded successfully')
			closeAndReset()
		} catch (err: any) {
			ElMessage.error(err?.message || 'Chunked upload failed')
		} finally {
			isChunkUploading.value = false
		}
	}

	const handleUploadBatch = async () => {
		try {
			const formData = new FormData()

			formData.append('source', 'cms')
			formData.append('convert_to_webp', String(convertToWebP.value))

			if (globalFolderId.value) {
				formData.append('folder_id', globalFolderId.value)
			}

			filesList.filesToUpload.forEach((item: any, index: number) => {
				formData.append('file', item.file)

				const finalTitle = isApplyToAll.value && !item.isCustom ? globalTitle.value : item.title
				const finalAlt = isApplyToAll.value && !item.isCustom ? globalAlt.value : item.alt
				const finalCategory = isApplyToAll.value && !item.isCustom ? globalCategory.value : item.category
				const finalTags = isApplyToAll.value && !item.isCustom ? globalTags.value : item.tags
				const finalFolderId =
					(isApplyToAll.value && !item.isCustom ? globalFolderId.value : item.folderId) ?? globalFolderId.value

				formData.append(`title_${index}`, finalTitle || '')
				formData.append(`alt_${index}`, finalAlt || '')
				formData.append(`category_${index}`, finalCategory || '')
				formData.append(`tags_${index}`, (finalTags || []).join(','))

				if (finalFolderId) {
					formData.append(`folder_id_${index}`, finalFolderId)
				}
			})

			await deps.createMedia(formData)
			ElMessage.success('Files uploaded successfully')
			closeAndReset()
		} catch {
			ElMessage.error('Failed to upload files')
		}
	}

	const handleUpload = async () => {
		if (filesList.filesToUpload.length === 0) return

		if (useChunkedUpload.value) {
			await handleUploadChunked()
		} else {
			await handleUploadBatch()
		}
	}

	return reactive({
		globalTitle,
		globalAlt,
		globalCategory,
		globalTags,
		globalFolderId,
		isApplyToAll,
		convertToWebP,
		useChunkedUpload,
		isUploading,
		handleUpload,
		closeAndReset,
	})
}

export type MediaUploadSubmit = ReturnType<typeof useMediaUploadSubmit>
