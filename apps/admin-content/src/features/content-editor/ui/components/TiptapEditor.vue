<template>
	<div
		class="tiptap-editor"
		:class="{ 'is-dark': isDark, 'is-disabled': disabled, 'is-focused': controller.isFocused }"
	>
		<TiptapToolbar v-if="!disabled" :controller="controller" />
		<TiptapLinkDialog :controller="controller" />

		<!-- Editor area -->
		<EditorContent :editor="controller.editor" class="tiptap-content" />
	</div>
</template>

<script setup lang="ts">
import { useTheme } from '@admin-panel/ui'
import { EditorContent } from '@tiptap/vue-3'

import { useTiptapEditor } from '../../composables/useTiptapEditor'
import TiptapLinkDialog from './tiptap/TiptapLinkDialog.vue'
import TiptapToolbar from './tiptap/TiptapToolbar.vue'

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

const controller = useTiptapEditor(modelValue, props)
</script>

<style scoped>
.tiptap-editor {
	--tiptap-border: var(--border-color, #e2e8f0);
	--tiptap-bg: var(--bg-surface, #fff);
	--tiptap-toolbar-bg: var(--bg-card, #f8fafc);
	--tiptap-text: var(--text-primary, #1e293b);
	--tiptap-muted: var(--text-muted, #94a3b8);
	--tiptap-active-bg: var(--gp-accent, #6366f1);
	--tiptap-active-text: #fff;
	--tiptap-btn-hover: rgb(99, 102, 241, 0.1);
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
	box-shadow: 0 0 0 3px rgb(99, 102, 241, 0.15);
}

.tiptap-editor.is-dark {
	--tiptap-border: rgb(255, 255, 255, 0.12);
	--tiptap-bg: rgb(15, 23, 42, 0.6);
	--tiptap-toolbar-bg: rgb(15, 23, 42, 0.8);
	--tiptap-text: #e2e8f0;
	--tiptap-muted: #64748b;
	--tiptap-btn-hover: rgb(99, 102, 241, 0.15);
}

.tiptap-editor.is-disabled {
	pointer-events: none;
	opacity: 0.6;
}

/* Editor content */
.tiptap-content {
	min-height: 220px;
	flex: 1;
	font-size: 14px;
	line-height: 1.7;
	color: var(--tiptap-text);
	cursor: text;
	padding: 16px 20px;
}

:deep(.tiptap) {
	min-height: 200px;
	outline: none;

	/* Placeholder */
	p.is-editor-empty:first-child::before {
		content: attr(data-placeholder);
		height: 0;
		float: left;
		color: var(--tiptap-muted);
		pointer-events: none;
	}

	/* Headings */
	h1 {
		font-weight: 700;
		font-size: 1.8em;
		line-height: 1.3;
		margin: 0.5em 0 0.3em;
	}

	h2 {
		font-weight: 700;
		font-size: 1.4em;
		line-height: 1.3;
		margin: 0.5em 0 0.3em;
	}

	h3 {
		font-weight: 600;
		font-size: 1.15em;
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
		border-left: 3px solid var(--tiptap-active-bg);
		font-style: italic;
		color: var(--tiptap-muted);
		padding-left: 16px;
		margin: 0.6em 0;
	}

	/* Code inline */
	code {
		border-radius: 4px;
		font-family: 'JetBrains Mono', 'Fira Code', monospace;
		font-size: 0.88em;
		color: #6366f1;
		background: rgb(99, 102, 241, 0.12);
		padding: 2px 6px;
	}

	/* Code block */
	pre {
		border-radius: 8px;
		color: #e2e8f0;
		background: #0f172a;
		padding: 12px 16px;
		margin: 0.6em 0;
		overflow-x: auto;

		code {
			font-size: 13px;
			color: inherit;
			background: transparent;
			padding: 0;
		}
	}

	/* Highlight */
	mark {
		border-radius: 3px;
		color: inherit;
		background: rgb(250, 204, 21, 0.4);
		padding: 1px 2px;
	}

	/* Link */
	a {
		text-decoration: underline;
		color: #6366f1;
		cursor: pointer;
		text-underline-offset: 2px;

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
		background: rgb(99, 102, 241, 0.25);
	}
}
</style>
