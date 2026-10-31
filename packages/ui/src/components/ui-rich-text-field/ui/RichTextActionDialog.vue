<template>
	<div v-if="open" class="link-dialog">
		<span class="action-dialog-label">{{ label }}</span>
		<input
			:ref="(el) => emit('input-ref', el as HTMLInputElement | null)"
			class="link-input"
			:placeholder="placeholder"
			:type="inputType"
			:value="modelValue"
			@input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
			@keydown.enter="emit('confirm')"
			@keydown.escape="emit('cancel')"
		/>
		<button class="link-confirm-btn" type="button" @click="emit('confirm')">{{ confirmLabel }}</button>
		<button class="link-cancel-btn" type="button" @click="emit('cancel')">Отмена</button>
	</div>
</template>

<script setup lang="ts">
withDefaults(
	defineProps<{
		open: boolean
		label: string
		modelValue: string
		placeholder?: string
		confirmLabel?: string
		inputType?: 'text' | 'number'
	}>(),
	{
		placeholder: '',
		confirmLabel: 'Применить',
		inputType: 'text',
	}
)

const emit = defineEmits<{
	(e: 'update:modelValue', value: string): void
	(e: 'confirm'): void
	(e: 'cancel'): void
	(e: 'input-ref', el: HTMLInputElement | null): void
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

.action-dialog-label {
	font-size: 12px;
	white-space: nowrap;
	color: var(--tiptap-muted);
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
