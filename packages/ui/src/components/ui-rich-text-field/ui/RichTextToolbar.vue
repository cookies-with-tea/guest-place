<template>
	<div class="tiptap-toolbar">
		<!-- Text style -->
		<div class="toolbar-group">
			<button
				:class="{ 'is-active': controller.editor?.isActive('bold') }"
				class="toolbar-btn"
				title="Bold (Ctrl+B)"
				type="button"
				@click="controller.editor?.chain().focus().toggleBold().run()"
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
				:class="{ 'is-active': controller.editor?.isActive('italic') }"
				class="toolbar-btn"
				title="Italic (Ctrl+I)"
				type="button"
				@click="controller.editor?.chain().focus().toggleItalic().run()"
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
				:class="{ 'is-active': controller.editor?.isActive('underline') }"
				class="toolbar-btn"
				title="Underline (Ctrl+U)"
				type="button"
				@click="controller.editor?.chain().focus().toggleUnderline().run()"
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
				:class="{ 'is-active': controller.editor?.isActive('strike') }"
				class="toolbar-btn"
				title="Strikethrough"
				type="button"
				@click="controller.editor?.chain().focus().toggleStrike().run()"
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
				:class="{ 'is-active': controller.editor?.isActive('highlight') }"
				class="toolbar-btn"
				title="Highlight"
				type="button"
				@click="controller.editor?.chain().focus().toggleHighlight().run()"
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
				:class="{ 'is-active': controller.editor?.isActive('code') }"
				class="toolbar-btn"
				title="Inline Code"
				type="button"
				@click="controller.editor?.chain().focus().toggleCode().run()"
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
				:class="{ 'is-active': controller.editor?.isActive('heading', { level }) }"
				class="toolbar-btn toolbar-btn--text"
				:title="`Heading ${level}`"
				type="button"
				@click="controller.editor?.chain().focus().toggleHeading({ level }).run()"
			>
				H{{ level }}
			</button>
			<button
				:class="{ 'is-active': controller.editor?.isActive('paragraph') }"
				class="toolbar-btn toolbar-btn--text"
				title="Paragraph"
				type="button"
				@click="controller.editor?.chain().focus().setParagraph().run()"
			>
				P
			</button>
		</div>

		<div class="toolbar-divider" />

		<!-- Lists -->
		<div class="toolbar-group">
			<button
				:class="{ 'is-active': controller.editor?.isActive('bulletList') }"
				class="toolbar-btn"
				title="Bullet List"
				type="button"
				@click="controller.editor?.chain().focus().toggleBulletList().run()"
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
				:class="{ 'is-active': controller.editor?.isActive('orderedList') }"
				class="toolbar-btn"
				title="Ordered List"
				type="button"
				@click="controller.editor?.chain().focus().toggleOrderedList().run()"
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
				:class="{ 'is-active': controller.editor?.isActive('blockquote') }"
				class="toolbar-btn"
				title="Blockquote"
				type="button"
				@click="controller.editor?.chain().focus().toggleBlockquote().run()"
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
				:class="{ 'is-active': controller.editor?.isActive('codeBlock') }"
				class="toolbar-btn"
				title="Code Block"
				type="button"
				@click="controller.editor?.chain().focus().toggleCodeBlock().run()"
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
				:class="{ 'is-active': controller.editor?.isActive({ textAlign: 'left' }) }"
				class="toolbar-btn"
				title="Align Left"
				type="button"
				@click="controller.editor?.chain().focus().setTextAlign('left').run()"
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
				:class="{ 'is-active': controller.editor?.isActive({ textAlign: 'center' }) }"
				class="toolbar-btn"
				title="Align Center"
				type="button"
				@click="controller.editor?.chain().focus().setTextAlign('center').run()"
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
				:class="{ 'is-active': controller.editor?.isActive({ textAlign: 'right' }) }"
				class="toolbar-btn"
				title="Align Right"
				type="button"
				@click="controller.editor?.chain().focus().setTextAlign('right').run()"
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
				:class="{ 'is-active': controller.editor?.isActive('link') }"
				class="toolbar-btn"
				title="Insert Link"
				type="button"
				@click="controller.handleLinkToggle"
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
				v-if="controller.editor?.isActive('link')"
				class="toolbar-btn"
				title="Remove Link"
				type="button"
				@click="controller.editor?.chain().focus().unsetLink().run()"
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
				@click="controller.editor?.chain().focus().setHorizontalRule().run()"
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

		<!-- Translation / i18n actions -->
		<div class="toolbar-group">
			<button
				:class="{ 'is-active': controller.editor?.isActive('translationKey') }"
				class="toolbar-btn"
				title="Отправить в перевод"
				type="button"
				@click="controller.handleSendToTranslation"
			>
				<svg fill="none" height="15" viewBox="0 0 24 24" width="15" xmlns="http://www.w3.org/2000/svg">
					<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
					<line stroke="currentColor" stroke-linecap="round" stroke-width="2" x1="2" x2="22" y1="12" y2="12" />
					<path
						d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
					/>
				</svg>
			</button>
			<button
				:class="{ 'is-active': controller.editor?.isActive('nonTranslatable') }"
				class="toolbar-btn"
				title="Исключить из перевода"
				type="button"
				@click="controller.handleExclude"
			>
				<svg fill="none" height="15" viewBox="0 0 24 24" width="15" xmlns="http://www.w3.org/2000/svg">
					<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
					<line
						stroke="currentColor"
						stroke-linecap="round"
						stroke-width="2"
						x1="4.93"
						x2="19.07"
						y1="4.93"
						y2="19.07"
					/>
				</svg>
			</button>
			<button class="toolbar-btn" title="Вставить валюту" type="button" @click="controller.handleInsertCurrency">
				<svg fill="none" height="15" viewBox="0 0 24 24" width="15" xmlns="http://www.w3.org/2000/svg">
					<line stroke="currentColor" stroke-linecap="round" stroke-width="2" x1="12" x2="12" y1="1" y2="23" />
					<path
						d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
						stroke="currentColor"
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
					/>
				</svg>
			</button>
		</div>

		<div class="toolbar-divider" />

		<!-- History -->
		<div class="toolbar-group">
			<button
				:disabled="!controller.editor?.can().undo()"
				class="toolbar-btn"
				title="Undo (Ctrl+Z)"
				type="button"
				@click="controller.editor?.chain().focus().undo().run()"
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
				:disabled="!controller.editor?.can().redo()"
				class="toolbar-btn"
				title="Redo (Ctrl+Y)"
				type="button"
				@click="controller.editor?.chain().focus().redo().run()"
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
		<div class="char-count"> {{ controller.editor?.storage.characterCount.characters() ?? 0 }} chars </div>
	</div>
</template>

<script setup lang="ts">
import type { RichTextEditorController } from '../composables/useRichTextEditor'

defineProps<{
	controller: RichTextEditorController
}>()
</script>

<style scoped lang="scss">
.tiptap-toolbar {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	border-bottom: 1px solid var(--tiptap-border);
	background: var(--tiptap-toolbar-bg);
	padding: 8px 12px;
	gap: 2px;
}

.toolbar-group {
	display: flex;
	align-items: center;
	gap: 1px;
}

.toolbar-divider {
	width: 1px;
	height: 20px;
	flex-shrink: 0;
	background: var(--tiptap-border);
	margin: 0 6px;
}

.toolbar-spacer {
	flex: 1;
}

.toolbar-btn {
	width: 30px;
	height: 28px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border: none;
	border-radius: 6px;
	color: var(--tiptap-muted);
	background: transparent;
	transition:
		background 0.15s ease,
		color 0.15s ease;
	cursor: pointer;
	padding: 0;
}

.toolbar-btn--text {
	width: auto;
	font-weight: 700;
	font-size: 11px;
	letter-spacing: 0.02em;
	padding: 0 8px;
}

.toolbar-btn:hover:not(:disabled) {
	color: var(--tiptap-text);
	background: var(--tiptap-btn-hover);
}

.toolbar-btn.is-active {
	color: var(--tiptap-active-text);
	background: var(--tiptap-active-bg);
}

.toolbar-btn:disabled {
	cursor: not-allowed;
	opacity: 0.3;
}

.char-count {
	font-size: 11px;
	white-space: nowrap;
	color: var(--tiptap-muted);
}
</style>
