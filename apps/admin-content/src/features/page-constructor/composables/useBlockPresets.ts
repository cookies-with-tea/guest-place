import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { BlockStyle, PageBlock } from '#entities/pages'
import type { BlockCanvas } from './useBlockCanvas'
import type { BlockTypesState } from './useBlockTypes'
import type { InspectorTabs } from './useInspectorTabs'

export interface BlockPreset {
	id: string
	name: string
	type: string
	data: Record<string, any>
	style?: BlockStyle
	createdAt: string
}

const STORAGE_KEY = 'gp_cms_block_presets'

/**
 * Owns saved block presets (persisted to localStorage), the "save as preset" dialog,
 * and the copy/paste clipboard for blocks (including the Ctrl+C / Ctrl+V shortcuts).
 */
export function useBlockPresets(
	pageForm: { blocks: PageBlock[] },
	blockTypes: BlockTypesState,
	canvas: BlockCanvas,
	tabs: InspectorTabs
) {
	const savedPresets = ref<BlockPreset[]>([])
	const isPresetDialogOpen = ref(false)
	const presetFormName = ref('')
	const presetTargetIndex = ref<number | null>(null)
	const clipboardBlock = ref<PageBlock | null>(null)

	function loadSavedPresets() {
		try {
			const raw = localStorage.getItem(STORAGE_KEY)
			if (raw) savedPresets.value = JSON.parse(raw)
		} catch (e) {
			console.warn('Failed to load presets from localStorage:', e)
		}
	}

	function persistPresets() {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPresets.value))
		} catch (e) {
			console.warn('Failed to save presets to localStorage:', e)
		}
	}

	function openSavePresetDialog(index: number) {
		presetTargetIndex.value = index
		const block = pageForm.blocks[index]
		const summary = block ? canvas.getBlockSummary(block) : ''
		presetFormName.value = summary
			? `${blockTypes.getBlockType(block.type)?.name || block.type}: ${summary}`
			: `${blockTypes.getBlockType(block.type)?.name || block.type} (Пресет)`
		isPresetDialogOpen.value = true
	}

	function confirmSavePreset() {
		if (presetTargetIndex.value === null) return
		const block = pageForm.blocks[presetTargetIndex.value]
		if (!block) return

		const newPreset: BlockPreset = {
			id: `preset-${Date.now()}`,
			name: presetFormName.value.trim(),
			type: block.type,
			data: JSON.parse(JSON.stringify(block.data || {})),
			style: JSON.parse(JSON.stringify(block.style || {})),
			createdAt: new Date().toISOString(),
		}

		savedPresets.value.unshift(newPreset)
		persistPresets()
		isPresetDialogOpen.value = false
		ElMessage.success(`Пресет «${newPreset.name}» успешно сохранён!`)
	}

	function deletePreset(id: string) {
		savedPresets.value = savedPresets.value.filter((p) => p.id !== id)
		persistPresets()
		ElMessage.info('Пресет удалён')
	}

	function addPresetToCanvas(preset: BlockPreset) {
		const newBlock: PageBlock = {
			id: `${preset.type}-${Date.now()}`,
			type: preset.type,
			data: JSON.parse(JSON.stringify(preset.data || {})),
			style: JSON.parse(JSON.stringify(preset.style || {})),
		}
		pageForm.blocks.push(newBlock)
		canvas.selectedBlockIndex = pageForm.blocks.length - 1
		tabs.inspector = 'block'
		ElMessage.success(`Блок из пресета «${preset.name}» добавлен на страницу!`)
	}

	function copyBlock(index: number) {
		const original = pageForm.blocks[index]
		if (!original) return
		clipboardBlock.value = JSON.parse(JSON.stringify(original))
		ElMessage.success(`Блок «${blockTypes.getBlockType(original.type)?.name || original.type}» скопирован в буфер`)
	}

	function pasteBlock() {
		if (!clipboardBlock.value) {
			ElMessage.warning('Буфер блоков пуст')
			return
		}
		const cloned: PageBlock = {
			id: `${clipboardBlock.value.type}-${Date.now()}`,
			type: clipboardBlock.value.type,
			data: JSON.parse(JSON.stringify(clipboardBlock.value.data || {})),
			style: JSON.parse(JSON.stringify(clipboardBlock.value.style || {})),
		}
		if (canvas.selectedBlockIndex !== null && canvas.selectedBlockIndex >= 0) {
			pageForm.blocks.splice(canvas.selectedBlockIndex + 1, 0, cloned)
			canvas.selectedBlockIndex = canvas.selectedBlockIndex + 1
		} else {
			pageForm.blocks.push(cloned)
			canvas.selectedBlockIndex = pageForm.blocks.length - 1
		}
		tabs.inspector = 'block'
		ElMessage.success('Блок успешно вставлен из буфера!')
	}

	function onKeydown(e: KeyboardEvent) {
		const target = e.target as HTMLElement
		if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return
		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
			if (canvas.selectedBlockIndex !== null) {
				copyBlock(canvas.selectedBlockIndex)
				e.preventDefault()
			}
		} else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
			if (clipboardBlock.value) {
				pasteBlock()
				e.preventDefault()
			}
		}
	}

	onMounted(() => {
		loadSavedPresets()
		window.addEventListener('keydown', onKeydown)
	})

	onUnmounted(() => {
		window.removeEventListener('keydown', onKeydown)
	})

	return reactive({
		savedPresets,
		isPresetDialogOpen,
		presetFormName,
		presetTargetIndex,
		clipboardBlock,
		openSavePresetDialog,
		confirmSavePreset,
		deletePreset,
		addPresetToCanvas,
		copyBlock,
		pasteBlock,
	})
}

export type BlockPresetsAndClipboard = ReturnType<typeof useBlockPresets>
