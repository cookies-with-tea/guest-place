<template>
	<div v-if="controller.isLinkDialogOpen" class="link-dialog">
		<input
			:ref="(el) => (controller.linkInputRef = el as HTMLInputElement | null)"
			v-model="controller.linkUrl"
			class="link-input"
			placeholder="https://example.com"
			type="url"
			@keydown.enter="controller.confirmLink"
			@keydown.escape="controller.isLinkDialogOpen = false"
		/>
		<button class="link-confirm-btn" type="button" @click="controller.confirmLink">Insert</button>
		<button class="link-cancel-btn" type="button" @click="controller.isLinkDialogOpen = false">Cancel</button>
	</div>
</template>

<script setup lang="ts">
import type { TiptapEditorController } from '../../../composables/useTiptapEditor'

defineProps<{
	controller: TiptapEditorController
}>()
</script>

<style scoped lang="scss">
.link-dialog {
	display: flex;
	align-items: center;
	border-bottom: 1px solid var(--tiptap-border);
	background: var(--tiptap-toolbar-bg);
	animation: slide-down 0.15s ease;
	padding: 8px 12px;
	gap: 8px;
}

@keyframes slide-down {
	from {
		transform: translateY(-4px);
		opacity: 0;
	}

	to {
		transform: translateY(0);
		opacity: 1;
	}
}

.link-input {
	height: 30px;
	flex: 1;
	outline: none;
	border: 1px solid var(--tiptap-border);
	border-radius: 6px;
	font-size: 13px;
	color: var(--tiptap-text);
	background: var(--tiptap-bg);
	padding: 0 10px;

	&:focus {
		border-color: var(--tiptap-active-bg);
	}
}

.link-confirm-btn,
.link-cancel-btn {
	height: 30px;
	border: none;
	border-radius: 6px;
	font-weight: 500;
	font-size: 13px;
	transition: opacity 0.15s ease;
	cursor: pointer;
	padding: 0 12px;

	&:hover {
		opacity: 0.85;
	}
}

.link-confirm-btn {
	color: #fff;
	background: var(--tiptap-active-bg);
}

.link-cancel-btn {
	color: var(--tiptap-text);
	background: var(--tiptap-border);
}
</style>
