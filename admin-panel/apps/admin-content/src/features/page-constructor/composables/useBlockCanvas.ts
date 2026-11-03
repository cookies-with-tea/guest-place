import { computed, reactive, ref } from 'vue'
import { uploadMedia } from '@admin-panel/lib'
import { ElMessage } from 'element-plus'
import type { BlockStyle, BlockTypeItem, PageBlock } from '#entities/pages'
import type { InspectorTabs } from './useInspectorTabs'
import type { BlockTypesState } from './useBlockTypes'

const gradientPresets = [
	{ name: 'Indigo Purple', value: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' },
	{ name: 'Dark Slate', value: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' },
	{ name: 'Sunset Glow', value: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)' },
	{ name: 'Emerald Wave', value: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)' },
	{ name: 'Ocean Blue', value: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' },
]

/**
 * Owns the page canvas: the block list (add/remove/reorder/duplicate), block selection,
 * block style editing, drag-and-drop reordering, and direct media drop-to-upload.
 */
export function useBlockCanvas(pageForm: { blocks: PageBlock[] }, blockTypes: BlockTypesState, tabs: InspectorTabs) {
	const selectedBlockIndex = ref<number | null>(null)

	const selectedBlock = computed(() => {
		if (
			selectedBlockIndex.value === null ||
			selectedBlockIndex.value < 0 ||
			selectedBlockIndex.value >= pageForm.blocks.length
		) {
			return null
		}
		const b = pageForm.blocks[selectedBlockIndex.value]
		if (!b) return null
		if (!b.data || typeof b.data !== 'object') b.data = {}
		if (!b.style || typeof b.style !== 'object') {
			b.style = {
				theme: 'light',
				padding: 'md',
				margin: 'none',
				backgroundColor: '',
				backgroundGradient: '',
				backgroundImage: '',
			}
		}
		return b
	})

	const selectedBlockType = computed(() =>
		selectedBlock.value ? blockTypes.getBlockType(selectedBlock.value.type) : null
	)

	function getBlockSummary(block: PageBlock): string {
		if (!block || !block.data) return 'Без заголовка'
		const d = block.data
		return d.title || d.left_title || d.quote || d.title_prefix || 'Без заголовка'
	}

	function getBlockStyle(): BlockStyle {
		if (!selectedBlock.value) return {}
		if (!selectedBlock.value.style) {
			selectedBlock.value.style = { theme: 'light', padding: 'md', margin: 'none' }
		}
		return selectedBlock.value.style
	}

	function setBlockTheme(themeName: string) {
		getBlockStyle().theme = themeName
	}

	function addBlock(bt: BlockTypeItem) {
		const newBlock: PageBlock = {
			id: `${bt.slug}-${Date.now()}`,
			type: bt.slug,
			data: {},
			style: { theme: 'light', padding: 'md', margin: 'none' },
		}
		pageForm.blocks.push(newBlock)
		selectedBlockIndex.value = pageForm.blocks.length - 1
		tabs.inspector = 'block'
		tabs.blockSub = 'content'
		ElMessage.success(`Блок «${bt.name}» добавлен. Заполните поля в правой панели`)
	}

	function addWireframeBlock() {
		const wireframeType =
			blockTypes.blockTypes.find((b: BlockTypeItem) => b.slug === 'wireframe') || blockTypes.WIREFRAME_TYPE
		addBlock(wireframeType)
	}

	function changeBlockType(index: number, newSlug: string) {
		if (index < 0 || index >= pageForm.blocks.length) return
		const block = pageForm.blocks[index]
		if (!block || block.type === newSlug) return
		const oldType = block.type
		block.type = newSlug
		ElMessage.success(`Тип блока заменён: ${oldType} ➔ ${blockTypes.getBlockType(newSlug)?.name || newSlug}`)
	}

	function selectBlock(index: number) {
		selectedBlockIndex.value = index
		tabs.inspector = 'block'
	}

	function moveBlock(index: number, direction: number) {
		const target = index + direction
		if (target < 0 || target >= pageForm.blocks.length) return
		const [item] = pageForm.blocks.splice(index, 1)
		if (item) {
			pageForm.blocks.splice(target, 0, item)
			selectedBlockIndex.value = target
		}
	}

	function duplicateBlock(index: number) {
		const original = pageForm.blocks[index]
		const cloned: PageBlock = {
			id: `${original.type}-${Date.now()}`,
			type: original.type,
			data: JSON.parse(JSON.stringify(original.data || {})),
			style: JSON.parse(JSON.stringify(original.style || {})),
		}
		pageForm.blocks.splice(index + 1, 0, cloned)
		selectedBlockIndex.value = index + 1
	}

	function removeBlock(index: number) {
		pageForm.blocks.splice(index, 1)
		if (selectedBlockIndex.value === index) {
			selectedBlockIndex.value = pageForm.blocks.length ? Math.max(0, index - 1) : null
		} else if (selectedBlockIndex.value !== null && selectedBlockIndex.value > index) {
			selectedBlockIndex.value--
		}
	}

	function clearAllBlocks() {
		pageForm.blocks = []
		selectedBlockIndex.value = null
	}

	// Drag & drop reordering
	const draggingIndex = ref<number | null>(null)
	const dragOverIndex = ref<number | null>(null)

	function onDragStart(index: number, event: DragEvent) {
		draggingIndex.value = index
		dragOverIndex.value = null
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move'
			event.dataTransfer.setData('text/plain', String(index))
		}
	}

	function onDragOver(index: number, event: DragEvent) {
		event.preventDefault()
		if (draggingIndex.value !== null && draggingIndex.value !== index) {
			dragOverIndex.value = index
		}
	}

	function onDragLeave(index: number) {
		if (dragOverIndex.value === index) dragOverIndex.value = null
	}

	function onDrop(targetIndex: number) {
		if (draggingIndex.value === null || draggingIndex.value === targetIndex) {
			draggingIndex.value = null
			dragOverIndex.value = null
			return
		}

		const fromIndex = draggingIndex.value
		const [movedBlock] = pageForm.blocks.splice(fromIndex, 1)
		pageForm.blocks.splice(targetIndex, 0, movedBlock)

		if (selectedBlockIndex.value === fromIndex) {
			selectedBlockIndex.value = targetIndex
		} else if (
			selectedBlockIndex.value !== null &&
			selectedBlockIndex.value > fromIndex &&
			selectedBlockIndex.value <= targetIndex
		) {
			selectedBlockIndex.value--
		} else if (
			selectedBlockIndex.value !== null &&
			selectedBlockIndex.value < fromIndex &&
			selectedBlockIndex.value >= targetIndex
		) {
			selectedBlockIndex.value++
		}

		draggingIndex.value = null
		dragOverIndex.value = null
	}

	function onBlockCardDrop(targetIndex: number, event: DragEvent) {
		if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
			event.preventDefault()
			event.stopPropagation()
			handleDirectMediaUpload(event.dataTransfer.files[0], targetIndex)
			draggingIndex.value = null
			dragOverIndex.value = null
			return
		}
		onDrop(targetIndex)
	}

	function onDragEnd() {
		draggingIndex.value = null
		dragOverIndex.value = null
	}

	// Direct media drop-to-upload (Stage 4.1)
	const isMediaDragActive = ref(false)
	const isUploadingMedia = ref(false)

	function onMediaDragEnter(e: DragEvent) {
		if (e.dataTransfer?.types.includes('Files')) isMediaDragActive.value = true
	}

	function onMediaDragOver(e: DragEvent) {
		if (e.dataTransfer?.types.includes('Files')) {
			e.dataTransfer.dropEffect = 'copy'
			isMediaDragActive.value = true
		}
	}

	function onMediaDragLeave(e: DragEvent) {
		const rect = (e.currentTarget as HTMLElement)?.getBoundingClientRect?.()
		if (!rect) {
			isMediaDragActive.value = false
			return
		}
		if (e.clientX <= rect.left || e.clientX >= rect.right || e.clientY <= rect.top || e.clientY >= rect.bottom) {
			isMediaDragActive.value = false
		}
	}

	async function onMediaCanvasDrop(e: DragEvent) {
		isMediaDragActive.value = false
		const files = e.dataTransfer?.files
		if (!files || files.length === 0) return
		for (let i = 0; i < files.length; i++) {
			await handleDirectMediaUpload(files[i])
		}
	}

	async function handleDirectMediaUpload(file: File, targetBlockIndex?: number) {
		isUploadingMedia.value = true
		const loadingMsg = ElMessage.info({ message: `Загрузка медиа «${file.name}»...`, duration: 0 })

		try {
			const result = await uploadMedia(file)
			if (!result || !result.url) throw new Error('Не удалось получить URL загруженного файла')

			const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|ogg|mov)$/i.test(file.name)

			if (targetBlockIndex !== undefined && targetBlockIndex !== null && pageForm.blocks[targetBlockIndex]) {
				const b = pageForm.blocks[targetBlockIndex]
				if (isVideo) {
					b.data.video_url = result.url
				} else if ('image' in b.data) {
					b.data.image = result.url
				} else if ('poster_url' in b.data) {
					b.data.poster_url = result.url
				} else {
					if (!b.style) b.style = {}
					b.style.backgroundImage = result.url
				}
				ElMessage.success(`Медиа «${file.name}» успешно обновлено в блоке!`)
			} else if (isVideo) {
				const newBlock: PageBlock = {
					id: `video-${Date.now()}`,
					type: 'video_embed',
					data: { title: file.name.replace(/\.[^/.]+$/, ''), video_url: result.url, aspect_ratio: '16/9' },
					style: { theme: 'light', padding: 'md', margin: 'none' },
				}
				pageForm.blocks.push(newBlock)
				selectedBlockIndex.value = pageForm.blocks.length - 1
				tabs.inspector = 'block'
				ElMessage.success(`Медиа «${file.name}» загружено и добавлен новый блок!`)
			} else {
				const newBlock: PageBlock = {
					id: `hero-${Date.now()}`,
					type: 'hero',
					data: {
						title: file.name.replace(/\.[^/.]+$/, ''),
						subtitle: 'Блок с загруженным изображением',
						image: result.url,
					},
					style: { theme: 'light', padding: 'md', margin: 'none' },
				}
				pageForm.blocks.push(newBlock)
				selectedBlockIndex.value = pageForm.blocks.length - 1
				tabs.inspector = 'block'
				ElMessage.success(`Медиа «${file.name}» загружено и добавлен новый блок!`)
			}
		} catch (err: any) {
			ElMessage.error(`Ошибка загрузки: ${err?.message || err}`)
		} finally {
			loadingMsg.close()
			isUploadingMedia.value = false
		}
	}

	async function onBgImageDrop(e: DragEvent) {
		const files = e.dataTransfer?.files
		if (files && files.length > 0) {
			await handleDirectMediaUpload(files[0], selectedBlockIndex.value ?? undefined)
		}
	}

	async function onBgImageSelected(file: any) {
		if (file.raw) {
			await handleDirectMediaUpload(file.raw, selectedBlockIndex.value ?? undefined)
		}
	}

	return reactive({
		selectedBlockIndex,
		selectedBlock,
		selectedBlockType,
		gradientPresets,
		getBlockSummary,
		getBlockStyle,
		setBlockTheme,
		addBlock,
		addWireframeBlock,
		changeBlockType,
		selectBlock,
		moveBlock,
		duplicateBlock,
		removeBlock,
		clearAllBlocks,
		draggingIndex,
		dragOverIndex,
		onDragStart,
		onDragOver,
		onDragLeave,
		onDrop,
		onBlockCardDrop,
		onDragEnd,
		isMediaDragActive,
		isUploadingMedia,
		onMediaDragEnter,
		onMediaDragOver,
		onMediaDragLeave,
		onMediaCanvasDrop,
		handleDirectMediaUpload,
		onBgImageDrop,
		onBgImageSelected,
	})
}

export type BlockCanvas = ReturnType<typeof useBlockCanvas>
