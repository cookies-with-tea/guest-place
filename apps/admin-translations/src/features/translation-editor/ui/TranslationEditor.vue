<template>
	<div class="translation-editor">
		<TagEditorToolbar :editor="editor" />
		<TagEditorBody :editor="editor" />
		<TagEditorFooter :editor="editor" :preview="preview" />
		<TagEditorPreviewPanel v-if="preview.showPreview" :preview="preview" />
	</div>
</template>

<script setup lang="ts">
import { useTagEditor } from '../composables/useTagEditor'
import { useTagPreview } from '../composables/useTagPreview'
import TagEditorBody from './components/TagEditorBody.vue'
import TagEditorFooter from './components/TagEditorFooter.vue'
import TagEditorPreviewPanel from './components/TagEditorPreviewPanel.vue'
import TagEditorToolbar from './components/TagEditorToolbar.vue'

const props = withDefaults(
	defineProps<{
		modelValue: string
		placeholder?: string
	}>(),
	{
		modelValue: '',
		placeholder: '',
	}
)

const emit = defineEmits<{
	(e: 'update:modelValue', val: string): void
}>()

const editor = useTagEditor(props, emit)
const preview = useTagPreview(editor)
</script>

<style scoped>
.translation-editor {
	width: 100%;
	display: flex;
	flex-direction: column;
	border: 1px solid var(--border-color, #e2e8f0);
	border-radius: 12px;
	box-shadow: var(--shadow-sm, 0 1px 3px rgb(0, 0, 0, 0.05));
	background: var(--bg-card, #fff);
	overflow: hidden;
}
</style>
