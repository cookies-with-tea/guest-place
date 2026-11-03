import { reactive, ref } from 'vue'

import { mediaUtils } from '#entities/media'
import { ElMessage } from 'element-plus'

import type { UploadFilesList } from './useUploadFilesList'

/** The in-browser "crop & resize before upload" dialog for a single staged image. */
export const useImageCrop = (filesList: UploadFilesList) => {
	const isCropDialogOpen = ref(false)
	const croppingIndex = ref<number | null>(null)
	const croppingImageUrl = ref('')
	const cropperRef = ref<any>(null)
	const cropAspectRatio = ref('free')
	const cropFixed = ref(false)
	const cropFixedNumber = ref([1, 1])

	const startCropping = (index: number) => {
		const item = filesList.filesToUpload[index]

		if (!item || !mediaUtils.isImage(item.file)) return

		croppingIndex.value = index
		croppingImageUrl.value = item.preview || URL.createObjectURL(item.file)
		cropAspectRatio.value = 'free'
		cropFixed.value = false
		isCropDialogOpen.value = true
	}

	const handleCropRatioChange = (val: string) => {
		if (val === 'free') {
			cropFixed.value = false
		} else {
			cropFixed.value = true

			const [w, h] = val.split(':').map(Number)

			cropFixedNumber.value = [w, h]
		}
	}

	const closeCropDialog = () => {
		isCropDialogOpen.value = false
		croppingIndex.value = null
		croppingImageUrl.value = ''
	}

	const applyCrop = () => {
		if (!cropperRef.value || croppingIndex.value === null) return

		const index = croppingIndex.value
		const item = filesList.filesToUpload[index]

		if (!item) return

		cropperRef.value.getCropBlob((blob: Blob) => {
			if (!blob) return

			const originalName = item.file.name.replace(/\.[^/.]+$/, '')
			const newFile = new File([blob], `${originalName}.webp`, { type: 'image/webp' })

			if (item.preview) {
				URL.revokeObjectURL(item.preview)
			}

			item.file = newFile
			item.preview = URL.createObjectURL(blob)
			closeCropDialog()
			ElMessage.success('Image cropped & resized successfully')
		})
	}

	return reactive({
		isCropDialogOpen,
		croppingImageUrl,
		cropperRef,
		cropAspectRatio,
		cropFixed,
		cropFixedNumber,
		startCropping,
		handleCropRatioChange,
		closeCropDialog,
		applyCrop,
	})
}

export type ImageCrop = ReturnType<typeof useImageCrop>
