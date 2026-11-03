import { computed, reactive, ref } from 'vue'

import { ElMessage } from 'element-plus'

import { useMedia } from '#entities/media'
import { mediaUtils } from '#entities/media/utils/media.utils'

/** The "Media Preview" dialog — variant/background switching, info panel helpers
 * (copy URL/hex, EXIF detection) and the WebP re-optimize action. */
export const useMediaPreview = () => {
	const { currentMedia, isPreviewDialogOpen, closePreviewDialog, currentMediaUuid, handleOptimize, folders } =
		useMedia()

	const previewBg = ref('checkered')
	const selectedVariantKey = ref<string>('original')
	const isOptimizing = ref(false)

	const folderName = computed(() => {
		const folderId = currentMedia.value?.data?.folderId
		if (!folderId || !folders.value) return ''
		return folders.value.find((f: any) => f.id === folderId)?.name || ''
	})

	const isPdf = (data: any) => {
		if (!data) return false
		return (
			data.mediaType === 'document' ||
			data.name?.toLowerCase().endsWith('.pdf') ||
			data.url?.toLowerCase().endsWith('.pdf')
		)
	}

	const activeVariantUrl = computed(() => {
		if (!currentMedia.value?.data) return ''
		const item = currentMedia.value.data

		if (selectedVariantKey.value === 'thumbnail' && item.variants?.thumbnail) {
			return item.variants.thumbnail.url
		}

		if (selectedVariantKey.value === 'medium' && item.variants?.medium) {
			return item.variants.medium.url
		}

		if (selectedVariantKey.value === 'large' && item.variants?.large) {
			return item.variants.large.url
		}

		return item.url
	})

	const onOptimize = async () => {
		if (!currentMediaUuid.value) return
		isOptimizing.value = true

		try {
			await handleOptimize(currentMediaUuid.value)

			ElMessage.success('WebP варианты успешно созданы')
		} catch (e: any) {
			ElMessage.error(`Ошибка оптимизации: ${e?.message || 'Не удалось сгенерировать'}`)
		} finally {
			isOptimizing.value = false
		}
	}

	const copyUrl = async (url: string) => {
		try {
			await navigator.clipboard.writeText(url)

			ElMessage.success('Ссылка скопирована')
		} catch {
			ElMessage.error('Не удалось скопировать ссылку')
		}
	}

	const copyHex = async (hex: string) => {
		try {
			await navigator.clipboard.writeText(hex)

			ElMessage.success(`Цвет ${hex} скопирован`)
		} catch {
			ElMessage.error('Не удалось скопировать цвет')
		}
	}

	const hasExifData = (exif: Record<string, any>) => {
		return Boolean(
			exif.make ||
			exif.model ||
			exif.dateTime ||
			exif.iso ||
			exif.fNumber ||
			exif.exposureTime ||
			exif.sanitized ||
			exif.gpsStripped
		)
	}

	const formatFileSize = (bytes: number) => mediaUtils.formatFileSize(bytes)
	const formatDate = (date: Date | string) => mediaUtils.formatDate(date)

	return reactive({
		currentMedia,
		isPreviewDialogOpen,
		closePreviewDialog,
		currentMediaUuid,
		folders,
		previewBg,
		selectedVariantKey,
		isOptimizing,
		folderName,
		isPdf,
		activeVariantUrl,
		onOptimize,
		copyUrl,
		copyHex,
		hasExifData,
		formatFileSize,
		formatDate,
	})
}

export type MediaPreview = ReturnType<typeof useMediaPreview>
