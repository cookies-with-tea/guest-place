import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'

import { htmlToTranslation, translationToHtml, unwrapTag, validateTranslation, wrapWithTag } from '@admin-panel/i18n'

interface TagEditorProps {
	modelValue: string
}

type UpdateModelValue = (e: 'update:modelValue', val: string) => void

/** The tag-format (`{b}...{/b}`, `{slotName}`) rich-text editor engine: visual/source
 * mode switching, toolbar actions (bold/italic/.../custom tag/slot) and validation. */
export const useTagEditor = (props: TagEditorProps, emit: UpdateModelValue) => {
	const localValue = ref(props.modelValue || '')
	const activeMode = ref<'visual' | 'source'>('visual')

	const visualEditorRef = ref<HTMLDivElement>()
	const textareaRef = ref<HTMLTextAreaElement>()

	const isSlotPopoverOpen = ref(false)
	const isTagPopoverOpen = ref(false)
	const customSlotName = ref('')
	const customTagName = ref('')
	const quickSlots = ['userName', 'count', 'date', 'link', 'status']

	const selectionRange = ref<{ start: number; end: number }>({ start: 0, end: 0 })

	// Sync with incoming modelValue
	watch(
		() => props.modelValue,
		(newVal) => {
			if (newVal !== localValue.value) {
				localValue.value = newVal || ''

				updateVisualHtmlFromModel()
			}
		}
	)

	const validation = computed(() => validateTranslation(localValue.value))

	const updateModelValue = (val: string) => {
		localValue.value = val

		emit('update:modelValue', val)
	}

	const updateVisualHtmlFromModel = () => {
		if (visualEditorRef.value) {
			visualEditorRef.value.innerHTML = translationToHtml(localValue.value)
		}
	}

	onMounted(() => {
		updateVisualHtmlFromModel()
	})

	const switchMode = (mode: 'visual' | 'source') => {
		if (mode === activeMode.value) return

		if (mode === 'source') {
			// Sync visual changes to model before switching
			if (visualEditorRef.value) {
				const text = htmlToTranslation(visualEditorRef.value.innerHTML)

				updateModelValue(text)
			}
		} else {
			// Switching to visual mode, render html
			updateVisualHtmlFromModel()
		}

		activeMode.value = mode
	}

	const handleVisualInput = () => {
		if (visualEditorRef.value) {
			const text = htmlToTranslation(visualEditorRef.value.innerHTML)

			localValue.value = text

			emit('update:modelValue', text)
		}
	}

	const handleVisualBlur = () => {
		if (visualEditorRef.value) {
			const text = htmlToTranslation(visualEditorRef.value.innerHTML)

			updateModelValue(text)
		}
	}

	const handleSourceInput = () => {
		emit('update:modelValue', localValue.value)
	}

	const updateSelectionRange = () => {
		if (textareaRef.value) {
			selectionRange.value = {
				start: textareaRef.value.selectionStart,
				end: textareaRef.value.selectionEnd,
			}
		}
	}

	const applyTag = (tag: string) => {
		if (activeMode.value === 'visual') {
			// Use document.execCommand in visual mode
			if (tag === 'b') {
				document.execCommand('bold')
			} else if (tag === 'i') {
				document.execCommand('italic')
			} else if (tag === 'u') {
				document.execCommand('underline')
			} else if (tag === 'span') {
				const selection = window.getSelection()

				if (selection && selection.rangeCount > 0) {
					const range = selection.getRangeAt(0)
					const span = document.createElement('span')

					span.className = 'gp-highlight-span'

					span.appendChild(range.extractContents())

					range.insertNode(span)
				}
			} else if (tag === 'code') {
				const selection = window.getSelection()

				if (selection && selection.rangeCount > 0) {
					const range = selection.getRangeAt(0)
					const code = document.createElement('code')

					code.appendChild(range.extractContents())

					range.insertNode(code)
				}
			}

			handleVisualInput()
		} else {
			// Source mode
			const textarea = textareaRef.value

			if (!textarea) return

			const start = textarea.selectionStart
			const end = textarea.selectionEnd

			const res = wrapWithTag(localValue.value, start, end, tag)

			updateModelValue(res.newText)

			nextTick(() => {
				textarea.focus()

				textarea.setSelectionRange(res.newStart, res.newEnd)

				updateSelectionRange()
			})
		}
	}

	const insertSlot = (slotName: string) => {
		isSlotPopoverOpen.value = false

		if (activeMode.value === 'visual') {
			const chipHtml = `<span class="gp-slot-chip" data-slot="${slotName}" contenteditable="false">{${slotName}}</span>`

			document.execCommand('insertHTML', false, chipHtml)

			handleVisualInput()
		} else {
			const textarea = textareaRef.value

			if (!textarea) return

			const start = textarea.selectionStart
			const end = textarea.selectionEnd
			const insertion = `{${slotName}}`
			const newText = localValue.value.substring(0, start) + insertion + localValue.value.substring(end)

			updateModelValue(newText)

			nextTick(() => {
				textarea.focus()

				const pos = start + insertion.length

				textarea.setSelectionRange(pos, pos)

				updateSelectionRange()
			})
		}
	}

	const handleInsertCustomSlot = () => {
		const name = customSlotName.value.trim()

		if (name) {
			insertSlot(name)

			customSlotName.value = ''
		}
	}

	const handleInsertCustomTag = () => {
		const tag = customTagName.value.trim()

		if (tag) {
			isTagPopoverOpen.value = false

			applyTag(tag)

			customTagName.value = ''
		}
	}

	const handleStripFormatting = () => {
		if (activeMode.value === 'visual') {
			document.execCommand('removeFormat')

			handleVisualInput()
		} else {
			const textarea = textareaRef.value

			if (!textarea) return

			const start = textarea.selectionStart
			const end = textarea.selectionEnd

			if (start === end) {
				// Strip all tags from entire text
				const res = unwrapTag(localValue.value, 0, localValue.value.length)

				updateModelValue(res.newText)
			} else {
				const res = unwrapTag(localValue.value, start, end)

				updateModelValue(res.newText)
			}
		}
	}

	return reactive({
		localValue,
		activeMode,
		visualEditorRef,
		textareaRef,
		isSlotPopoverOpen,
		isTagPopoverOpen,
		customSlotName,
		customTagName,
		quickSlots,
		validation,
		switchMode,
		handleVisualInput,
		handleVisualBlur,
		handleSourceInput,
		updateSelectionRange,
		applyTag,
		insertSlot,
		handleInsertCustomSlot,
		handleInsertCustomTag,
		handleStripFormatting,
	})
}

export type TagEditor = ReturnType<typeof useTagEditor>
