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

interface TiptapEditorProps {
	placeholder: string
	disabled: boolean
}

/** Editor instance, external-sync watchers and the link-insert dialog for TiptapEditor.vue. */
export const useTiptapEditor = (modelValue: Ref<string>, props: TiptapEditorProps) => {
	const isFocused = ref(false)
	const isLinkDialogOpen = ref(false)
	const linkUrl = ref('')
	const linkInputRef = ref<HTMLInputElement | null>(null)

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
	})
}

export type TiptapEditorController = ReturnType<typeof useTiptapEditor>
