<template>
	<div class="editor-footer">
		<div class="footer-left">
			<div v-if="editor.validation.isValid" class="validation-status is-valid">
				<span class="status-dot valid-dot" />
				<span>Синтаксис тегов корректен</span>
			</div>
			<div v-else class="validation-status is-invalid">
				<span class="status-dot invalid-dot" />
				<span class="error-msg">{{ editor.validation.errors[0] }}</span>
			</div>
		</div>

		<div class="footer-right">
			<button class="preview-toggle-btn" type="button" @click="preview.showPreview = !preview.showPreview">
				{{ preview.showPreview ? 'Скрыть предпросмотр' : 'Предпросмотр' }}
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { TagEditor } from '../../composables/useTagEditor'
import type { TagPreview } from '../../composables/useTagPreview'

defineProps<{
	editor: TagEditor
	preview: TagPreview
}>()
</script>

<style scoped>
.editor-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-top: 1px solid var(--border-color, #e2e8f0);
	font-size: 12px;
	background: var(--bg-surface, #f8fafc);
	padding: 6px 12px;
}

.validation-status {
	display: flex;
	align-items: center;
	gap: 6px;
}

.status-dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
}

.valid-dot {
	background: #10b981;
}

.invalid-dot {
	background: #ef4444;
}

.is-valid {
	color: #059669;
}

.is-invalid {
	color: #dc2626;
}

.preview-toggle-btn {
	border: none;
	border-radius: 4px;
	font-weight: 500;
	font-size: 12px;
	color: var(--accent-primary, #2563eb);
	background: transparent;
	cursor: pointer;
	padding: 2px 6px;
}

.preview-toggle-btn:hover {
	text-decoration: underline;
}
</style>
