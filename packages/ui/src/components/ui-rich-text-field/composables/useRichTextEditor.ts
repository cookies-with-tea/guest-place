import { nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import type { Ref } from 'vue'

import CharacterCount from '@tiptap/extension-character-count'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import { useEditor } from '@tiptap/vue-3'

import { suggestTranslationKey } from '../lib/translationKey'
import { NonTranslatableMark, TranslationKeyMark } from '../tiptap/marks'

interface RichTextEditorProps {
	placeholder: string
	disabled: boolean
	namespace: string
	fieldPath: string
}

/** Editor instance, external-sync watchers and the link/i18n-action dialogs for RichTextFullEditor.vue. */
export const useRichTextEditor = (modelValue: Ref<string>, props: RichTextEditorProps) => {
	const isFocused = ref(false)
	const isLinkDialogOpen = ref(false)
	const linkUrl = ref('')
	const linkInputRef = ref<HTMLInputElement | null>(null)

	const isKeyDialogOpen = ref(false)
	const pendingKey = ref('')
	const keyInputRef = ref<HTMLInputElement | null>(null)

	const isCurrencyDialogOpen = ref(false)
	const pendingCurrency = ref('')
	const currencyInputRef = ref<HTMLInputElement | null>(null)

	const editor = useEditor({
		content: modelValue.value,
		editable: !props.disabled,
		extensions: [
			StarterKit.configure({
				undoRedo: {
					depth: 100,
				},
			}),
			Underline,
			Highlight.configure({ multicolor: false }),
			TextStyle,
			TextAlign.configure({ types: ['heading', 'paragraph'] }),
			Link.configure({
				openOnClick: false,
				autolink: true,
				HTMLAttributes: {
					rel: 'noopener noreferrer',
					target: '_blank',
				},
			}),
			Placeholder.configure({
				placeholder: props.placeholder,
			}),
			CharacterCount,
			TranslationKeyMark,
			NonTranslatableMark,
		],
		onFocus() {
			isFocused.value = true
		},
		onBlur() {
			isFocused.value = false
		},
		onUpdate({ editor: e }) {
			const html = e.getHTML()

			// Treat empty document as empty string
			if (html === '<p></p>') {
				modelValue.value = ''
			} else {
				modelValue.value = html
			}
		},
	})

	// Sync external changes into editor (e.g. when parent loads data from API)
	watch(
		() => modelValue.value,
		(newVal) => {
			if (!editor.value) return

			const currentHtml = editor.value.getHTML()
			const incoming = newVal || ''

			// Avoid infinite loops by only updating when content actually differs
			if (incoming !== currentHtml && !(incoming === '' && currentHtml === '<p></p>')) {
				editor.value.commands.setContent(incoming, { emitUpdate: false })
			}
		}
	)

	watch(
		() => props.disabled,
		(val) => {
			editor.value?.setEditable(!val)
		}
	)

	const handleLinkToggle = () => {
		if (editor.value?.isActive('link')) {
			editor.value.chain().focus().unsetLink().run()

			return
		}

		linkUrl.value = editor.value?.getAttributes('link').href || ''
		isLinkDialogOpen.value = true

		nextTick(() => linkInputRef.value?.focus())
	}

	const confirmLink = () => {
		if (!linkUrl.value) {
			editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
		} else {
			const url = linkUrl.value.startsWith('http') ? linkUrl.value : `https://${linkUrl.value}`

			editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
		}

		isLinkDialogOpen.value = false
		linkUrl.value = ''
	}

	// "Отправить в перевод": wraps the current selection with a translation-key mark.
	// The dialog lets the content manager rename the auto-suggested key before confirming.
	const handleSendToTranslation = () => {
		if (editor.value?.isActive('translationKey')) {
			editor.value.chain().focus().unsetTranslationKey().run()

			return
		}

		pendingKey.value = suggestTranslationKey(editor.value?.getHTML() || '', props.namespace, props.fieldPath)
		isKeyDialogOpen.value = true

		nextTick(() => keyInputRef.value?.focus())
	}

	const confirmTranslationKey = async (createKey: (key: string, fallback: string) => Promise<void>) => {
		const key = pendingKey.value.trim()

		if (!key || !editor.value) {
			isKeyDialogOpen.value = false

			return
		}

		const { state } = editor.value
		const fallback = state.doc.textBetween(state.selection.from, state.selection.to, ' ')

		editor.value.chain().focus().setTranslationKey(key).run()

		isKeyDialogOpen.value = false

		await createKey(key, fallback)
	}

	// "Исключить из перевода": purely local, no server call needed.
	const handleExclude = () => {
		if (editor.value?.isActive('nonTranslatable')) {
			editor.value.chain().focus().unsetNonTranslatable().run()

			return
		}

		editor.value?.chain().focus().setNonTranslatable().run()
	}

	// "Валюта": inserts a {currency:N} slot chip at the cursor.
	const handleInsertCurrency = () => {
		pendingCurrency.value = ''
		isCurrencyDialogOpen.value = true

		nextTick(() => currencyInputRef.value?.focus())
	}

	const confirmCurrency = () => {
		const amount = parseFloat(pendingCurrency.value.replace(',', '.'))

		if (!isNaN(amount)) {
			const chip = `<span class="gp-currency-chip" data-slot="currency:${amount}" contenteditable="false">{currency:${amount}}</span>`

			editor.value?.chain().focus().insertContent(chip).run()
		}

		isCurrencyDialogOpen.value = false
		pendingCurrency.value = ''
	}

	onBeforeUnmount(() => {
		editor.value?.destroy()
	})

	return reactive({
		editor,
		isFocused,
		isLinkDialogOpen,
		linkUrl,
		linkInputRef,
		handleLinkToggle,
		confirmLink,
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

export type RichTextEditorController = ReturnType<typeof useRichTextEditor>
