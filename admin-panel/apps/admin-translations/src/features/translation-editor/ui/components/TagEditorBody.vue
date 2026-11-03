<template>
	<div class="editor-body">
		<!-- Visual Mode (Contenteditable) -->
		<div
			v-show="editor.activeMode === 'visual'"
			:ref="(el) => (editor.visualEditorRef = el as HTMLDivElement)"
			class="visual-editor"
			contenteditable="true"
			@blur="editor.handleVisualBlur"
			@input="editor.handleVisualInput"
		/>

		<!-- Source / Tag Mode (Textarea) -->
		<div v-show="editor.activeMode === 'source'" class="source-editor-wrapper">
			<textarea
				:ref="(el) => (editor.textareaRef = el as HTMLTextAreaElement)"
				v-model="editor.localValue"
				class="source-textarea"
				placeholder="Введите текст перевода с тегами, напр. Привет, {span}мир{/span}!"
				rows="4"
				@input="editor.handleSourceInput"
				@select="editor.updateSelectionRange"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { TagEditor } from '../../composables/useTagEditor'

defineProps<{
	editor: TagEditor
}>()
</script>

<style scoped>
.editor-body {
	min-height: 90px;
	position: relative;
}

.visual-editor {
	min-height: 90px;
	outline: none;
	font-size: 14px;
	line-height: 1.6;
	color: var(--text-primary, #0f172a);
	cursor: text;
	padding: 12px 14px;
}

:deep(.gp-highlight-span) {
	border-radius: 4px;
	color: #0369a1;
	background: #e0f2fe;
	padding: 1px 4px;
}

:deep(.gp-slot-chip) {
	display: inline-flex;
	align-items: center;
	border: 1px solid #d8b4fe;
	border-radius: 12px;
	font-family: monospace;
	font-size: 12px;
	color: #7e22ce;
	background: #f3e8ff;
	user-select: none;
	padding: 1px 6px;
	margin: 0 2px;
}

.source-editor-wrapper {
	width: 100%;
}

.source-textarea {
	width: 100%;
	min-height: 90px;
	outline: none;
	border: none;
	box-sizing: border-box;
	font-family: ui-monospace, 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', monospace;
	font-size: 13px;
	line-height: 1.6;
	color: var(--text-primary, #0f172a);
	background: transparent;
	resize: vertical;
	padding: 12px 14px;
}
</style>
