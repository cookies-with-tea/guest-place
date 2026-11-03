import { computed, h, reactive, ref, watch } from 'vue'

import { parseTranslation, type I18nNode } from '@admin-panel/i18n'

import type { TagEditor } from './useTagEditor'

const NON_SLOT_TAG_NAMES = ['b', 'i', 'u', 'span', 'code', 'br', 'hr', 'p', 'div']
const PREVIEW_ALLOWED_TAGS = ['b', 'i', 'u', 'strong', 'em', 'code', 'p', 'div', 'small']

/** Live preview of the tag-format translation, with mock values for detected slots. */
export const useTagPreview = (editor: TagEditor) => {
	const showPreview = ref(false)
	const mockParams = ref<Record<string, string>>({})

	// Detect slots in text for testing in preview
	const detectedSlots = computed(() => {
		const regex = /\{([a-zA-Z0-9_.-]+)\}/g
		const set = new Set<string>()
		let match: RegExpExecArray | null

		while ((match = regex.exec(editor.localValue)) !== null) {
			const name = match[1]

			if (!NON_SLOT_TAG_NAMES.includes(name.toLowerCase())) {
				set.add(name)
			}
		}

		return Array.from(set)
	})

	// Initialize mock params when new slots appear
	watch(
		detectedSlots,
		(slots) => {
			slots.forEach((s) => {
				if (!mockParams.value[s]) {
					mockParams.value[s] = s === 'count' ? '5' : s === 'userName' ? 'Иван' : `[${s}]`
				}
			})
		},
		{ immediate: true }
	)

	const renderPreviewNodes = () => {
		const nodes = parseTranslation(editor.localValue)

		const renderNode = (node: I18nNode): any => {
			if (node.type === 'text') {
				return node.content
			}

			if (node.type === 'slot') {
				if (node.name === 'br') return h('br')
				if (node.name === 'hr') return h('hr')

				return h('span', { class: 'preview-slot-value' }, mockParams.value[node.name] || `{${node.name}}`)
			}

			if (node.type === 'tag') {
				const children = (node.children || []).map(renderNode)
				const tag = node.name.toLowerCase()

				if (tag === 'span') return h('span', { class: 'preview-span-highlight' }, children)

				const validTag = PREVIEW_ALLOWED_TAGS.includes(tag) ? tag : 'span'

				return h(validTag, {}, children)
			}

			return null
		}

		return h('div', {}, nodes.map(renderNode))
	}

	return reactive({
		showPreview,
		mockParams,
		detectedSlots,
		renderPreviewNodes,
	})
}

export type TagPreview = ReturnType<typeof useTagPreview>
