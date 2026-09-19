<template>
	<div class="tiptap-editor" :class="{ 'is-dark': isDark, 'is-disabled': disabled, 'is-focused': isFocused }">
		<!-- Toolbar -->
		<div v-if="!disabled" class="tiptap-toolbar">
			<!-- Text style -->
			<div class="toolbar-group">
				<button
					:class="{ 'is-active': editor?.isActive('bold') }"
					class="toolbar-btn"
					title="Bold (Ctrl+B)"
					type="button"
					@click="editor?.chain().focus().toggleBold().run()"
				>
					<svg fill="currentColor" height="15" viewBox="0 0 24 24" width="15" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
						/>
						<path
							d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
						/>
					</svg>
				</button>
				<button
					:class="{ 'is-active': editor?.isActive('italic') }"
					class="toolbar-btn"
					title="Italic (Ctrl+I)"
					type="button"
					@click="editor?.chain().focus().toggleItalic().run()"
				>
					<svg fill="currentColor" height="15" viewBox="0 0 24 24" width="15" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M19 4h-9M14 20H5M15 4 9 20"
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
						/>
					</svg>
				</button>
				<button
					:class="{ 'is-active': editor?.isActive('underline') }"
					class="toolbar-btn"
					title="Underline (Ctrl+U)"
					type="button"
					@click="editor?.chain().focus().toggleUnderline().run()"
				>
					<svg fill="currentColor" height="15" viewBox="0 0 24 24" width="15" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
						/>
						<line
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							x1="4"
							x2="20"
							y1="21"
							y2="21"
						/>
					</svg>
				</button>
				<button
					:class="{ 'is-active': editor?.isActive('strike') }"
					class="toolbar-btn"
					title="Strikethrough"
					type="button"
					@click="editor?.chain().focus().toggleStrike().run()"
				>
					<svg fill="currentColor" height="15" viewBox="0 0 24 24" width="15" xmlns="http://www.w3.org/2000/svg">
						<line
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							x1="5"
							x2="19"
							y1="12"
							y2="12"
						/>
						<path
							d="M16 6C16 6 14.5 4 12 4C9.5 4 7 5.5 7 8C7 9.5 8 10.5 10 11.5"
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-width="2"
						/>
						<path
							d="M8 18C8 18 9.5 20 12 20C14.5 20 17 18.5 17 16C17 14.5 16.2 13.5 14.5 12.5"
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-width="2"
						/>
					</svg>
				</button>
				<button
					:class="{ 'is-active': editor?.isActive('highlight') }"
					class="toolbar-btn"
					title="Highlight"
					type="button"
					@click="editor?.chain().focus().toggleHighlight().run()"
				>
					<svg fill="currentColor" height="15" viewBox="0 0 24 24" width="15" xmlns="http://www.w3.org/2000/svg">
						<path
							d="m9 11-6 6v3h3l6-6"
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
						/>
						<path
							d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
						/>
					</svg>
				</button>
				<button
					:class="{ 'is-active': editor?.isActive('code') }"
					class="toolbar-btn"
					title="Inline Code"
					type="button"
					@click="editor?.chain().focus().toggleCode().run()"
				>
					<svg fill="currentColor" height="15" viewBox="0 0 24 24" width="15" xmlns="http://www.w3.org/2000/svg">
						<polyline
							fill="none"
							points="16 18 22 12 16 6"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
						/>
						<polyline
							fill="none"
							points="8 6 2 12 8 18"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
						/>
					</svg>
				</button>
			</div>

			<div class="toolbar-divider" />

			<!-- Headings -->
			<div class="toolbar-group">
				<button
					v-for="level in [1, 2, 3] as const"
					:key="level"
					:class="{ 'is-active': editor?.isActive('heading', { level }) }"
					class="toolbar-btn toolbar-btn--text"
					:title="`Heading ${level}`"
					type="button"
					@click="editor?.chain().focus().toggleHeading({ level }).run()"
				>
					H{{ level }}
				</button>
				<button
					:class="{ 'is-active': editor?.isActive('paragraph') }"
					class="toolbar-btn toolbar-btn--text"
					title="Paragraph"
					type="button"
					@click="editor?.chain().focus().setParagraph().run()"
				>
					P
				</button>
			</div>

			<div class="toolbar-divider" />

			<!-- Lists -->
			<div class="toolbar-group">
				<button
					:class="{ 'is-active': editor?.isActive('bulletList') }"
					class="toolbar-btn"
					title="Bullet List"
					type="button"
					@click="editor?.chain().focus().toggleBulletList().run()"
				>
					<svg fill="currentColor" height="15" viewBox="0 0 24 24" width="15" xmlns="http://www.w3.org/2000/svg">
						<line
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							x1="9"
							x2="21"
							y1="6"
							y2="6"
						/>
						<line
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							x1="9"
							x2="21"
							y1="12"
							y2="12"
						/>
						<line
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							x1="9"
							x2="21"
							y1="18"
							y2="18"
						/>
						<circle cx="4" cy="6" fill="currentColor" r="1" />
						<circle cx="4" cy="12" fill="currentColor" r="1" />
						<circle cx="4" cy="18" fill="currentColor" r="1" />
					</svg>
				</button>
				<button
					:class="{ 'is-active': editor?.isActive('orderedList') }"
					class="toolbar-btn"
					title="Ordered List"
					type="button"
					@click="editor?.chain().focus().toggleOrderedList().run()"
				>
					<svg fill="currentColor" height="15" viewBox="0 0 24 24" width="15" xmlns="http://www.w3.org/2000/svg">
						<line
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							x1="10"
							x2="21"
							y1="6"
							y2="6"
						/>
						<line
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							x1="10"
							x2="21"
							y1="12"
							y2="12"
						/>
						<line
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							x1="10"
							x2="21"
							y1="18"
							y2="18"
						/>
						<path
							d="M4 6h1v4"
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
						/>
						<path
							d="M4 10h2"
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
						/>
						<path
							d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
						/>
					</svg>
				</button>
				<button
					:class="{ 'is-active': editor?.isActive('blockquote') }"
					class="toolbar-btn"
					title="Blockquote"
					type="button"
					@click="editor?.chain().focus().toggleBlockquote().run()"
				>
					<svg fill="currentColor" height="15" viewBox="0 0 24 24" width="15" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
						/>
						<path
							d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
						/>
					</svg>
				</button>
				<button
					:class="{ 'is-active': editor?.isActive('codeBlock') }"
					class="toolbar-btn"
					title="Code Block"
					type="button"
					@click="editor?.chain().focus().toggleCodeBlock().run()"
				>
					<svg fill="currentColor" height="15" viewBox="0 0 24 24" width="15" xmlns="http://www.w3.org/2000/svg">
						<rect
							fill="none"
							height="18"
							rx="2"
							ry="2"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							width="22"
							x="1"
							y="3"
						/>
						<path
							d="m10 10-3 3 3 3"
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
						/>
						<path
							d="m14 10 3 3-3 3"
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
						/>
					</svg>
				</button>
			</div>

			<div class="toolbar-divider" />

			<!-- Align -->
			<div class="toolbar-group">
				<button
					:class="{ 'is-active': editor?.isActive({ textAlign: 'left' }) }"
					class="toolbar-btn"
					title="Align Left"
					type="button"
					@click="editor?.chain().focus().setTextAlign('left').run()"
				>
					<svg fill="currentColor" height="15" viewBox="0 0 24 24" width="15" xmlns="http://www.w3.org/2000/svg">
						<line
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							x1="21"
							x2="3"
							y1="6"
							y2="6"
						/>
						<line
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							x1="15"
							x2="3"
							y1="12"
							y2="12"
						/>
						<line
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							x1="17"
							x2="3"
							y1="18"
							y2="18"
						/>
					</svg>
				</button>
				<button
					:class="{ 'is-active': editor?.isActive({ textAlign: 'center' }) }"
					class="toolbar-btn"
					title="Align Center"
					type="button"
					@click="editor?.chain().focus().setTextAlign('center').run()"
				>
					<svg fill="currentColor" height="15" viewBox="0 0 24 24" width="15" xmlns="http://www.w3.org/2000/svg">
						<line
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							x1="21"
							x2="3"
							y1="6"
							y2="6"
						/>
						<line
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							x1="17"
							x2="7"
							y1="12"
							y2="12"
						/>
						<line
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							x1="19"
							x2="5"
							y1="18"
							y2="18"
						/>
					</svg>
				</button>
				<button
					:class="{ 'is-active': editor?.isActive({ textAlign: 'right' }) }"
					class="toolbar-btn"
					title="Align Right"
					type="button"
					@click="editor?.chain().focus().setTextAlign('right').run()"
				>
					<svg fill="currentColor" height="15" viewBox="0 0 24 24" width="15" xmlns="http://www.w3.org/2000/svg">
						<line
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							x1="21"
							x2="3"
							y1="6"
							y2="6"
						/>
						<line
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							x1="21"
							x2="9"
							y1="12"
							y2="12"
						/>
						<line
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							x1="21"
							x2="7"
							y1="18"
							y2="18"
						/>
					</svg>
				</button>
			</div>

			<div class="toolbar-divider" />

			<!-- Link -->
			<div class="toolbar-group">
				<button
					:class="{ 'is-active': editor?.isActive('link') }"
					class="toolbar-btn"
					title="Insert Link"
					type="button"
					@click="handleLinkToggle"
				>
					<svg fill="currentColor" height="15" viewBox="0 0 24 24" width="15" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
						/>
						<path
							d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
						/>
					</svg>
				</button>
				<button
					v-if="editor?.isActive('link')"
					class="toolbar-btn"
					title="Remove Link"
					type="button"
					@click="editor?.chain().focus().unsetLink().run()"
				>
					<svg fill="currentColor" height="15" viewBox="0 0 24 24" width="15" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M18.84 12.25l1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71"
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
						/>
						<path
							d="M5.17 11.75l-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71"
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
						/>
						<line
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							x1="8"
							x2="8"
							y1="2"
							y2="5"
						/>
						<line
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							x1="2"
							x2="5"
							y1="8"
							y2="8"
						/>
						<line
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							x1="16"
							x2="19"
							y1="16"
							y2="16"
						/>
						<line
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							x1="16"
							x2="16"
							y1="19"
							y2="22"
						/>
					</svg>
				</button>
				<button
					class="toolbar-btn"
					title="Horizontal Rule"
					type="button"
					@click="editor?.chain().focus().setHorizontalRule().run()"
				>
					<svg fill="currentColor" height="15" viewBox="0 0 24 24" width="15" xmlns="http://www.w3.org/2000/svg">
						<line
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							x1="5"
							x2="19"
							y1="12"
							y2="12"
						/>
					</svg>
				</button>
			</div>

			<div class="toolbar-divider" />

			<!-- History -->
			<div class="toolbar-group">
				<button
					:disabled="!editor?.can().undo()"
					class="toolbar-btn"
					title="Undo (Ctrl+Z)"
					type="button"
					@click="editor?.chain().focus().undo().run()"
				>
					<svg fill="currentColor" height="15" viewBox="0 0 24 24" width="15" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M3 7v6h6"
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
						/>
						<path
							d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
						/>
					</svg>
				</button>
				<button
					:disabled="!editor?.can().redo()"
					class="toolbar-btn"
					title="Redo (Ctrl+Y)"
					type="button"
					@click="editor?.chain().focus().redo().run()"
				>
					<svg fill="currentColor" height="15" viewBox="0 0 24 24" width="15" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M21 7v6h-6"
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
						/>
						<path
							d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"
							fill="none"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
						/>
					</svg>
				</button>
			</div>

			<!-- Character count -->
			<div class="toolbar-spacer" />
			<div class="char-count">
				{{ editor?.storage.characterCount.characters() ?? 0 }} chars
			</div>
		</div>

		<!-- Link input dialog -->
		<div v-if="isLinkDialogOpen" class="link-dialog">
			<input
				ref="linkInputRef"
				v-model="linkUrl"
				class="link-input"
				placeholder="https://example.com"
				type="url"
				@keydown.enter="confirmLink"
				@keydown.escape="isLinkDialogOpen = false"
			/>
			<button class="link-confirm-btn" type="button" @click="confirmLink">Insert</button>
			<button class="link-cancel-btn" type="button" @click="isLinkDialogOpen = false">Cancel</button>
		</div>

		<!-- Editor area -->
		<EditorContent :editor="editor" class="tiptap-content" />
	</div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

import { useTheme } from '@admin-panel/ui'
import CharacterCount from '@tiptap/extension-character-count'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/vue-3'

interface Props {
	placeholder?: string
	disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	placeholder: 'Start writing...',
	disabled: false,
})

const modelValue = defineModel<string>({ default: '' })

const { isDark } = useTheme()

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

// Watch disabled prop
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
</script>

<style scoped>
.tiptap-editor {
	--tiptap-border: var(--border-color, #e2e8f0);
	--tiptap-bg: var(--bg-surface, #ffffff);
	--tiptap-toolbar-bg: var(--bg-card, #f8fafc);
	--tiptap-text: var(--text-primary, #1e293b);
	--tiptap-muted: var(--text-muted, #94a3b8);
	--tiptap-active-bg: var(--gp-accent, #6366f1);
	--tiptap-active-text: #ffffff;
	--tiptap-btn-hover: rgba(99, 102, 241, 0.1);
	--tiptap-radius: 12px;

	display: flex;
	flex-direction: column;
	border: 1px solid var(--tiptap-border);
	border-radius: var(--tiptap-radius);
	background: var(--tiptap-bg);
	transition:
		border-color 0.2s ease,
		box-shadow 0.2s ease;
	overflow: hidden;
}

.tiptap-editor.is-focused {
	border-color: var(--tiptap-active-bg);
	box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.tiptap-editor.is-dark {
	--tiptap-border: rgba(255, 255, 255, 0.12);
	--tiptap-bg: rgba(15, 23, 42, 0.6);
	--tiptap-toolbar-bg: rgba(15, 23, 42, 0.8);
	--tiptap-text: #e2e8f0;
	--tiptap-muted: #64748b;
	--tiptap-btn-hover: rgba(99, 102, 241, 0.15);
}

.tiptap-editor.is-disabled {
	opacity: 0.6;
	pointer-events: none;
}

/* Toolbar */
.tiptap-toolbar {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 2px;
	padding: 8px 12px;
	background: var(--tiptap-toolbar-bg);
	border-bottom: 1px solid var(--tiptap-border);
}

.toolbar-group {
	display: flex;
	align-items: center;
	gap: 1px;
}

.toolbar-divider {
	width: 1px;
	height: 20px;
	background: var(--tiptap-border);
	margin: 0 6px;
	flex-shrink: 0;
}

.toolbar-spacer {
	flex: 1;
}

.toolbar-btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 30px;
	height: 28px;
	padding: 0;
	border: none;
	border-radius: 6px;
	background: transparent;
	color: var(--tiptap-muted);
	cursor: pointer;
	transition:
		background 0.15s ease,
		color 0.15s ease;
}

.toolbar-btn--text {
	width: auto;
	padding: 0 8px;
	font-size: 11px;
	font-weight: 700;
	letter-spacing: 0.02em;
}

.toolbar-btn:hover:not(:disabled) {
	background: var(--tiptap-btn-hover);
	color: var(--tiptap-text);
}

.toolbar-btn.is-active {
	background: var(--tiptap-active-bg);
	color: var(--tiptap-active-text);
}

.toolbar-btn:disabled {
	opacity: 0.3;
	cursor: not-allowed;
}

/* Link dialog */
.link-dialog {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 12px;
	background: var(--tiptap-toolbar-bg);
	border-bottom: 1px solid var(--tiptap-border);
	animation: slideDown 0.15s ease;
}

@keyframes slideDown {
	from {
		opacity: 0;
		transform: translateY(-4px);
	}

	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.link-input {
	flex: 1;
	height: 30px;
	padding: 0 10px;
	border: 1px solid var(--tiptap-border);
	border-radius: 6px;
	background: var(--tiptap-bg);
	color: var(--tiptap-text);
	font-size: 13px;
	outline: none;

	&:focus {
		border-color: var(--tiptap-active-bg);
	}
}

.link-confirm-btn,
.link-cancel-btn {
	height: 30px;
	padding: 0 12px;
	border: none;
	border-radius: 6px;
	font-size: 13px;
	font-weight: 500;
	cursor: pointer;
	transition: opacity 0.15s ease;

	&:hover {
		opacity: 0.85;
	}
}

.link-confirm-btn {
	background: var(--tiptap-active-bg);
	color: #fff;
}

.link-cancel-btn {
	background: var(--tiptap-border);
	color: var(--tiptap-text);
}

/* Char count */
.char-count {
	font-size: 11px;
	color: var(--tiptap-muted);
	white-space: nowrap;
}

/* Editor content */
.tiptap-content {
	flex: 1;
	min-height: 220px;
	padding: 16px 20px;
	color: var(--tiptap-text);
	font-size: 14px;
	line-height: 1.7;
	cursor: text;
}

:deep(.tiptap) {
	outline: none;
	min-height: 200px;

	/* Placeholder */
	p.is-editor-empty:first-child::before {
		color: var(--tiptap-muted);
		content: attr(data-placeholder);
		float: left;
		height: 0;
		pointer-events: none;
	}

	/* Headings */
	h1 {
		font-size: 1.8em;
		font-weight: 700;
		margin: 0.5em 0 0.3em;
		line-height: 1.3;
	}

	h2 {
		font-size: 1.4em;
		font-weight: 700;
		margin: 0.5em 0 0.3em;
		line-height: 1.3;
	}

	h3 {
		font-size: 1.15em;
		font-weight: 600;
		margin: 0.5em 0 0.3em;
	}

	/* Paragraph */
	p {
		margin: 0.4em 0;
	}

	/* Lists */
	ul,
	ol {
		padding-left: 1.4em;
		margin: 0.4em 0;
	}

	li {
		margin: 0.2em 0;
	}

	/* Blockquote */
	blockquote {
		margin: 0.6em 0;
		padding-left: 16px;
		border-left: 3px solid var(--tiptap-active-bg);
		color: var(--tiptap-muted);
		font-style: italic;
	}

	/* Code inline */
	code {
		padding: 2px 6px;
		border-radius: 4px;
		background: rgba(99, 102, 241, 0.12);
		color: #6366f1;
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
		font-size: 0.88em;
	}

	/* Code block */
	pre {
		margin: 0.6em 0;
		padding: 12px 16px;
		border-radius: 8px;
		background: #0f172a;
		color: #e2e8f0;
		overflow-x: auto;

		code {
			padding: 0;
			background: transparent;
			color: inherit;
			font-size: 13px;
		}
	}

	/* Highlight */
	mark {
		border-radius: 3px;
		background: rgba(250, 204, 21, 0.4);
		color: inherit;
		padding: 1px 2px;
	}

	/* Link */
	a {
		color: #6366f1;
		text-decoration: underline;
		text-underline-offset: 2px;
		cursor: pointer;

		&:hover {
			opacity: 0.8;
		}
	}

	/* HR */
	hr {
		border: none;
		border-top: 2px solid var(--tiptap-border);
		margin: 1em 0;
	}

	/* Selection */
	::selection {
		background: rgba(99, 102, 241, 0.25);
	}
}
</style>
