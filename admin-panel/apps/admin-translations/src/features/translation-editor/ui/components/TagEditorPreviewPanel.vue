<template>
	<div class="editor-preview-card">
		<div class="preview-header">
			<span class="preview-title">Живой предпросмотр (Live Preview)</span>
			<div v-if="preview.detectedSlots.length > 0" class="slot-params-row">
				<span class="slot-params-label">Тестовые значения:</span>
				<div v-for="slot in preview.detectedSlots" :key="slot" class="slot-param-item">
					<span class="param-key">{{ slot }}:</span>
					<input v-model="preview.mockParams[slot]" class="param-input" :placeholder="slot" type="text" />
				</div>
			</div>
		</div>
		<div class="preview-content">
			<div class="rendered-translation">
				<!-- Renders parsed nodes safely with mock params -->
				<component :is="preview.renderPreviewNodes" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { TagPreview } from '../../composables/useTagPreview'

defineProps<{
	preview: TagPreview
}>()
</script>

<style scoped>
.editor-preview-card {
	border-top: 1px dashed var(--border-color, #cbd5e1);
	background: #fafafa;
	padding: 12px 14px;
}

.preview-header {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 8px;
	gap: 8px;
}

.preview-title {
	font-weight: 600;
	font-size: 12px;
	letter-spacing: 0.5px;
	text-transform: uppercase;
	color: #64748b;
}

.slot-params-row {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 8px;
}

.slot-params-label {
	font-size: 11px;
	color: #64748b;
}

.slot-param-item {
	display: flex;
	align-items: center;
	font-size: 11px;
	gap: 4px;
}

.param-key {
	font-weight: 500;
	color: #475569;
}

.param-input {
	width: 70px;
	outline: none;
	border: 1px solid #cbd5e1;
	border-radius: 4px;
	font-size: 11px;
	padding: 2px 6px;
}

.param-input:focus {
	border-color: #3b82f6;
}

.preview-content {
	border: 1px solid #e2e8f0;
	border-radius: 8px;
	font-size: 14px;
	line-height: 1.5;
	background: #fff;
	padding: 10px 12px;
}

:deep(.preview-slot-value) {
	font-weight: 600;
	color: #7c3aed;
}

:deep(.preview-span-highlight) {
	font-weight: 500;
	color: #0284c7;
}
</style>
