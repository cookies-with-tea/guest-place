import { nextTick, onMounted, reactive, ref, watch } from 'vue'
import type { Ref } from 'vue'

import { htmlToTranslation, translationToHtml } from '@admin-panel/i18n'

import { suggestTranslationKey } from '../lib/translationKey'

interface SimpleFieldProps {
	namespace: string
	fieldPath: string
	multiline: boolean
}

/**
 * Lightweight (no Tiptap) contenteditable-based engine for `UiRichTextField`'s
 * "simple" mode (Text fields): plain text plus the three i18n marks
 * (translation key / non-translatable / currency), no block formatting.
 * Bridges to/from the tag format via translationToHtml/htmlToTranslation,
 * same as the "full" (RichText) editor.
 */
export const useSimpleRichTextField = (modelValue: Ref<string>, props: SimpleFieldProps) => {
	const editableRef = ref<HTMLDivElement | null>(null)

	// The i18n-action dialogs steal focus to their own input, which collapses
	// window.getSelection() inside the contenteditable — so the Range at the
	// moment an action starts must be captured and reused at confirm time,
	// not re-read from window.getSelection() later.
	const savedRange = ref<Range | null>(null)

	const isKeyDialogOpen = ref(false)
	const pendingKey = ref('')
	const keyInputRef = ref<HTMLInputElement | null>(null)

	const isCurrencyDialogOpen = ref(false)
	const pendingCurrency = ref('')
	const currencyInputRef = ref<HTMLInputElement | null>(null)

	const renderFromModel = () => {
		if (editableRef.value) editableRef.value.innerHTML = translationToHtml(modelValue.value)
	}

	const syncFromDom = () => {
		if (!editableRef.value) return

		modelValue.value = htmlToTranslation(editableRef.value.innerHTML)
	}

	const handleInput = () => {
		syncFromDom()
	}

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key !== 'Enter') return

		e.preventDefault()

		if (props.multiline) {
			document.execCommand('insertLineBreak')

			syncFromDom()
		}
	}

	const captureSelectionRange = (): Range | null => {
		const selection = window.getSelection()

		if (!selection || selection.rangeCount === 0) return null
		if (!editableRef.value?.contains(selection.anchorNode)) return null

		return selection.getRangeAt(0).cloneRange()
	}

	const captureEndRange = (): Range | null => {
		if (!editableRef.value) return null

		const range = document.createRange()

		range.selectNodeContents(editableRef.value)
		range.collapse(false)

		return range
	}

	const wrapRangeWithSpan = (range: Range, className: string, attrs: Record<string, string>): HTMLElement => {
		const span = document.createElement('span')

		span.className = className
		Object.entries(attrs).forEach(([key, value]) => span.setAttribute(key, value))
		span.appendChild(range.extractContents())
		range.insertNode(span)

		return span
	}

	const handleSendToTranslation = () => {
		const range = captureSelectionRange()

		if (!range || range.collapsed) return

		savedRange.value = range
		pendingKey.value = suggestTranslationKey(editableRef.value?.innerHTML || '', props.namespace, props.fieldPath)
		isKeyDialogOpen.value = true

		nextTick(() => keyInputRef.value?.focus())
	}

	const confirmTranslationKey = async (createKey: (key: string, fallback: string) => Promise<void>) => {
		const key = pendingKey.value.trim()
		const range = savedRange.value

		savedRange.value = null
		isKeyDialogOpen.value = false

		if (!key || !range) return

		const fallback = range.toString()

		wrapRangeWithSpan(range, 'gp-i18n-key', { 'data-i18n-key': key })
		syncFromDom()

		await createKey(key, fallback)
	}

	const handleExclude = () => {
		const range = captureSelectionRange()

		if (!range || range.collapsed) return

		wrapRangeWithSpan(range, 'gp-i18n-literal', { 'data-gp-literal': 'true' })
		syncFromDom()
	}

	const handleInsertCurrency = () => {
		savedRange.value = captureSelectionRange() || captureEndRange()
		pendingCurrency.value = ''
		isCurrencyDialogOpen.value = true

		nextTick(() => currencyInputRef.value?.focus())
	}

	const confirmCurrency = () => {
		const amount = parseFloat(pendingCurrency.value.replace(',', '.'))
		const range = savedRange.value

		savedRange.value = null
		isCurrencyDialogOpen.value = false
		pendingCurrency.value = ''

		if (isNaN(amount) || !range) return

		const chip = document.createElement('span')

		chip.className = 'gp-currency-chip'
		chip.setAttribute('data-slot', `currency:${amount}`)
		chip.setAttribute('contenteditable', 'false')
		chip.textContent = `{currency:${amount}}`

		range.deleteContents()
		range.insertNode(chip)
		syncFromDom()
	}

	watch(
		() => modelValue.value,
		(val) => {
			if (!editableRef.value) return

			const current = htmlToTranslation(editableRef.value.innerHTML)

			if (val !== current) renderFromModel()
		}
	)

	onMounted(renderFromModel)

	return reactive({
		editableRef,
		handleInput,
		handleKeydown,
		isKeyDialogOpen,
		pendingKey,
		keyInputRef,
		handleSendToTranslation,
		confirmTranslationKey,
		handleExclude,
		isCurrencyDialogOpen,
		pendingCurrency,
		currencyInputRef,
		handleInsertCurrency,
		confirmCurrency,
	})
}

export type SimpleRichTextFieldController = ReturnType<typeof useSimpleRichTextField>
