<template>
	<div class="ui-rich-text-field" :class="`ui-rich-text-field--${mode}`">
		<!-- "full" mode (RichText): Tiptap WYSIWYG, code-split so MFEs that never render
		     a RichText field don't pay for it in their eager federated chunk. -->
		<Suspense v-if="mode === 'full'">
			<RichTextFullEditor
				v-model="modelValue"
				:disabled="disabled"
				:field-path="fieldPath"
				:namespace="namespace"
				:placeholder="placeholder"
			/>
			<template #fallback>
				<div class="ui-rich-text-field__loading">Загрузка редактора…</div>
			</template>
		</Suspense>

		<!-- "simple" mode (Text): plain text, no WYSIWYG formatting, just the i18n marks. -->
		<div v-else class="ui-rich-text-field__simple" :class="{ 'is-disabled': disabled }">
			<div
				:ref="(el) => (controller.editableRef = el as HTMLDivElement | null)"
				class="ui-rich-text-field__editable"
				:class="{ 'is-multiline': multiline }"
				:contenteditable="!disabled"
				:data-placeholder="placeholder"
				@blur="controller.handleInput"
				@input="controller.handleInput"
				@keydown="controller.handleKeydown"
			></div>

			<div v-if="!disabled" class="ui-rich-text-field__simple-tools">
				<button
					class="ui-rich-text-field__tool"
					title="Отправить в перевод"
					type="button"
					@click="controller.handleSendToTranslation"
				>
					<svg fill="none" height="14" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg">
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
					class="ui-rich-text-field__tool"
					title="Исключить из перевода"
					type="button"
					@click="controller.handleExclude"
				>
					<svg fill="none" height="14" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg">
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
				<button
					class="ui-rich-text-field__tool"
					title="Вставить валюту"
					type="button"
					@click="controller.handleInsertCurrency"
				>
					<svg fill="none" height="14" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg">
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

			<RichTextActionDialog
				confirm-label="Отправить"
				label="Ключ перевода:"
				:model-value="controller.pendingKey"
				:open="controller.isKeyDialogOpen"
				placeholder="namespace.field.1"
				@cancel="controller.isKeyDialogOpen = false"
				@confirm="onConfirmKey"
				@input-ref="(el) => (controller.keyInputRef = el)"
				@update:model-value="controller.pendingKey = $event"
			/>
			<RichTextActionDialog
				confirm-label="Вставить"
				input-type="number"
				label="Сумма:"
				:model-value="controller.pendingCurrency"
				:open="controller.isCurrencyDialogOpen"
				placeholder="1990.50"
				@cancel="controller.isCurrencyDialogOpen = false"
				@confirm="controller.confirmCurrency"
				@input-ref="(el) => (controller.currencyInputRef = el)"
				@update:model-value="controller.pendingCurrency = $event"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

import { createTranslationKey } from '../lib/translationKey'
import { useSimpleRichTextField } from '../composables/useSimpleRichTextField'
import RichTextActionDialog from './RichTextActionDialog.vue'

const RichTextFullEditor = defineAsyncComponent(() => import('./RichTextFullEditor.vue'))

export interface Props {
	mode: 'simple' | 'full'
	disabled?: boolean
	placeholder?: string
	namespace?: string
	fieldPath?: string
	/** "simple" mode only: allow line breaks (Enter) instead of a single-line field. */
	multiline?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	disabled: false,
	placeholder: '',
	namespace: 'content',
	fieldPath: 'field',
	multiline: false,
})

const modelValue = defineModel<string>({ default: '' })

const controller = useSimpleRichTextField(modelValue, props)

const onConfirmKey = () => {
	controller.confirmTranslationKey((key, fallback) => createTranslationKey(key, fallback, props.namespace))
}
</script>

<style scoped lang="scss">
.ui-rich-text-field {
	width: 100%;
}

.ui-rich-text-field__loading {
	border: 1px solid var(--gp-glass-border-inner);
	border-radius: var(--gp-radius-md);
	font-size: 13px;
	color: var(--gp-text-secondary);
	background-color: var(--gp-bg-glass);
	padding: 16px;
}

.ui-rich-text-field__simple {
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.ui-rich-text-field__editable {
	width: 100%;
	min-height: 44px;
	outline: none;
	border: 1px solid var(--gp-glass-border-inner);
	border-radius: var(--gp-radius-md);
	font-family: inherit;
	font-size: 14px;
	line-height: 1.5;
	color: var(--gp-text-main);
	background: var(--gp-glass-gradient);
	background-color: var(--gp-bg-glass);
	transition: all 0.2s ease;
	padding: 12px 16px;
	overflow-wrap: anywhere;

	&:not(.is-multiline) {
		white-space: nowrap;
		overflow: hidden;
	}

	&:empty::before {
		content: attr(data-placeholder);
		color: var(--gp-text-secondary);
	}

	:deep(.gp-i18n-key) {
		border-radius: 3px;
		box-shadow: 0 0 0 1px rgb(99, 102, 241, 0.3);
		background: rgb(99, 102, 241, 0.15);
	}

	:deep(.gp-i18n-literal) {
		border-radius: 3px;
		box-shadow: 0 0 0 1px rgb(148, 163, 184, 0.35);
		background: rgb(148, 163, 184, 0.2);
	}

	:deep(.gp-currency-chip) {
		border-radius: 3px;
		font-family: monospace;
		color: var(--gp-primary);
		background: rgb(99, 102, 241, 0.12);
		padding: 0 4px;
	}

	&:focus {
		border-color: var(--gp-primary);
	}

	&.is-multiline {
		min-height: 100px;
	}
}

.ui-rich-text-field__simple.is-disabled .ui-rich-text-field__editable {
	cursor: not-allowed;
	opacity: 0.6;
}

.ui-rich-text-field__simple-tools {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
}

.ui-rich-text-field__tool {
	width: 26px;
	height: 24px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border: 1px solid var(--border-color);
	border-radius: 4px;
	color: var(--text-muted);
	background: var(--bg-card, #f8fafc);
	transition: all 0.2s;
	cursor: pointer;
	padding: 0;

	&:hover {
		border-color: var(--gp-primary);
		color: var(--text-primary);
	}
}
</style>
