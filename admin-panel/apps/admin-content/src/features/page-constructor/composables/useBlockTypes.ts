import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { pagesApi, type BlockTypeItem } from '#entities/pages'

// Built-in Wireframe prototype block
const WIREFRAME_TYPE: BlockTypeItem = {
	id: 'builtin-wireframe',
	name: 'Макет / Вайрфрейм',
	slug: 'wireframe',
	description: 'Свободный прямоугольник с заголовком и текстом для прототипирования структуры',
	icon: 'Crop',
	category: 'prototype',
	schema: [
		{ name: 'title', label: 'Заголовок / Назначение блока', fieldType: 'Text', required: true },
		{ name: 'subtitle', label: 'Подзаголовок / Секция', fieldType: 'Text' },
		{ name: 'description', label: 'Текст / Описание / ТЗ для верстки', fieldType: 'RichText' },
		{ name: 'cta_text', label: 'Текст кнопки (если нужна)', fieldType: 'Text' },
		{ name: 'cta_link', label: 'Ссылка кнопки', fieldType: 'Text' },
		{ name: 'badge', label: 'Метка статуса (например, «В разработке»)', fieldType: 'Text' },
		{ name: 'height', label: 'Высота блока (small, medium, large)', fieldType: 'Text' },
	],
}

// Built-in Video block (Stage 4.3)
const VIDEO_TYPE: BlockTypeItem = {
	id: 'builtin-video-embed',
	name: 'Видео блок',
	slug: 'video_embed',
	description: 'Встраивание видео (MP4/WebM файлы или YouTube/Vimeo ссылки)',
	icon: 'VideoCamera',
	category: 'media',
	schema: [
		{ name: 'title', label: 'Заголовок блока', fieldType: 'Text' },
		{ name: 'subtitle', label: 'Подзаголовок', fieldType: 'Text' },
		{ name: 'video_url', label: 'Видео (файл или YouTube/Vimeo ссылка)', fieldType: 'Media', required: true },
		{ name: 'poster_url', label: 'Обложка видео (Poster image)', fieldType: 'Media' },
		{ name: 'caption', label: 'Подпись к видео', fieldType: 'Text' },
		{ name: 'aspect_ratio', label: 'Соотношение сторон (16/9, 4/3, 1/1)', fieldType: 'Text' },
	],
}

/**
 * Owns the registry of available block types: built-in blocks, blocks loaded from the server,
 * the palette search filter, and syncing block types from the client's component manifest.
 */
export function useBlockTypes(clientManifest: { value: any[] }) {
	const blockTypes = ref<BlockTypeItem[]>([])
	const paletteSearch = ref('')
	const syncingBlocks = ref(false)

	const filteredBlockTypes = computed(() => {
		if (!paletteSearch.value) return blockTypes.value
		const q = paletteSearch.value.toLowerCase()
		return blockTypes.value.filter((b) => b.name.toLowerCase().includes(q) || b.slug.toLowerCase().includes(q))
	})

	function getBlockType(slug: string): BlockTypeItem | undefined {
		return blockTypes.value.find((b) => b.slug === slug)
	}

	async function fetchBlockTypes() {
		try {
			const res = await pagesApi.getBlockTypes()
			const list = res.data && Array.isArray(res.data) ? res.data : []
			if (!list.some((b) => b.slug === 'wireframe')) list.unshift(WIREFRAME_TYPE)
			if (!list.some((b) => b.slug === 'video_embed')) list.push(VIDEO_TYPE)
			blockTypes.value = list
		} catch (err: any) {
			console.warn('Failed to load block types:', err)
			blockTypes.value = [WIREFRAME_TYPE, VIDEO_TYPE]
		}
	}

	async function syncBlocksFromClient() {
		if (!clientManifest.value.length) {
			ElMessage.warning('Манифест компонентов с фронтенда ещё не получен')
			return
		}
		syncingBlocks.value = true
		try {
			const res = await pagesApi.syncBlockTypes(clientManifest.value)
			if (res.data) {
				blockTypes.value = res.data
				ElMessage.success(`Синхронизировано ${res.data.length} блоков из фронтенда!`)
			}
		} catch (err: any) {
			ElMessage.error(err.message || 'Ошибка синхронизации блоков')
		} finally {
			syncingBlocks.value = false
		}
	}

	return reactive({
		blockTypes,
		paletteSearch,
		syncingBlocks,
		filteredBlockTypes,
		getBlockType,
		fetchBlockTypes,
		syncBlocksFromClient,
		WIREFRAME_TYPE,
		VIDEO_TYPE,
	})
}

export type BlockTypesState = ReturnType<typeof useBlockTypes>
