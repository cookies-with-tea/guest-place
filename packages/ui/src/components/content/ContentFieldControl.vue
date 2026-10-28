<template>
	<!-- Text: single-line/short, no WYSIWYG formatting — only the i18n marks -->
	<template v-if="field.fieldType === FieldType.Text">
		<UiRichTextField
			v-model="modelValue"
			:disabled="readonly"
			:field-path="field.name"
			mode="simple"
			:multiline="!!field.multiline"
			:namespace="translationNamespace"
			:placeholder="field.label"
		/>
	</template>

	<!-- Rich text: full Tiptap WYSIWYG, same i18n marks as Text -->
	<template v-else-if="field.fieldType === FieldType.RichText">
		<UiRichTextField
			v-model="modelValue"
			:disabled="readonly"
			:field-path="field.name"
			mode="full"
			:namespace="translationNamespace"
			:placeholder="field.label"
		/>
	</template>

	<!-- Number -->
	<template v-else-if="field.fieldType === FieldType.Number">
		<UiInput
			:id="field.name"
			:disabled="readonly"
			:model-value="String(modelValue ?? '')"
			:placeholder="field.label"
			@update:model-value="onNumberInput"
		/>
	</template>

	<!-- Boolean -->
	<template v-else-if="field.fieldType === FieldType.Boolean">
		<label class="content-form-generator__switch">
			<input :id="field.name" v-model="modelValue" :disabled="readonly" type="checkbox" />
			<span class="content-form-generator__switch-track"></span>
		</label>
	</template>

	<!-- Date -->
	<template v-else-if="field.fieldType === FieldType.Date">
		<input
			:id="field.name"
			v-model="modelValue"
			class="content-form-generator__date"
			:disabled="readonly"
			type="date"
		/>
	</template>

	<!-- Media -->
	<template v-else-if="field.fieldType === FieldType.Media">
		<div class="content-form-generator__media">
			<UiMediaPicker v-model="modelValue" :disabled="readonly" />
			<UiInput v-model="modelValue" :disabled="readonly" placeholder="Или прямая ссылка на изображение (https://...)" />
		</div>
	</template>

	<!-- Relation: app provides the real picker (resolves entries over the API) via the `relation` slot -->
	<template v-else-if="field.fieldType === FieldType.Relation">
		<slot
			name="relation"
			:disabled="readonly"
			:field="field"
			:update="(value: any) => (modelValue = value)"
			:value="modelValue"
		>
			<UiInput v-model="modelValue" :disabled="readonly" :placeholder="`ID связанной записи (${field.relationTo})`" />
		</slot>
	</template>

	<!-- Repeater -->
	<template v-else-if="field.fieldType === FieldType.Repeater">
		<div class="content-form-generator__repeater">
			<div v-if="repeaterList().length === 0" class="content-form-generator__repeater-empty"> Список пока пуст </div>

			<div v-for="(item, index) in repeaterList()" :key="index" class="content-form-generator__repeater-item">
				<div class="content-form-generator__repeater-item-header">
					<strong>{{ getItemPreviewTitle(item) || `Элемент ${index + 1}` }}</strong>
					<div class="content-form-generator__repeater-item-actions">
						<UiButton
							appearance="secondary"
							size="m"
							:disabled="readonly || index === 0"
							title="Вверх"
							@click="moveRepeaterItem(index, -1)"
						>
							↑
						</UiButton>
						<UiButton
							appearance="secondary"
							size="m"
							:disabled="readonly || index === repeaterList().length - 1"
							title="Вниз"
							@click="moveRepeaterItem(index, 1)"
						>
							↓
						</UiButton>
						<UiButton
							appearance="secondary"
							size="m"
							:disabled="readonly"
							title="Дублировать"
							@click="duplicateRepeaterItem(index)"
						>
							⎘
						</UiButton>
						<UiButton
							appearance="secondary"
							size="m"
							:disabled="readonly"
							title="Удалить"
							@click="removeRepeaterItem(index)"
						>
							✕
						</UiButton>
					</div>
				</div>

				<ContentFormGenerator
					:fields="field.fields || []"
					:model-value="item"
					:readonly="readonly"
					:translation-namespace="`${translationNamespace}.${field.name}`"
					@update:model-value="updateRepeaterItem(index, $event)"
				>
					<!-- @vue-ignore: vue-tsc can't resolve this dynamically-named forwarded slot's prop type (TS7022) without a real runtime effect -->
					<template v-for="(_, slotName) in $slots" #[slotName]="slotScope" :key="slotName">
						<slot :name="slotName" v-bind="slotScope as object" />
					</template>
				</ContentFormGenerator>
			</div>

			<UiButton
				appearance="secondary"
				class="content-form-generator__repeater-add"
				:disabled="readonly"
				@click="addRepeaterItem"
			>
				+ Добавить элемент
			</UiButton>
		</div>
	</template>

	<!-- Group -->
	<template v-else-if="field.fieldType === FieldType.Group">
		<div class="content-form-generator__group">
			<ContentFormGenerator
				:fields="field.fields || []"
				:model-value="groupData()"
				:readonly="readonly"
				:translation-namespace="`${translationNamespace}.${field.name}`"
				@update:model-value="setGroupData"
			>
				<!-- @vue-ignore: vue-tsc can't resolve this dynamically-named forwarded slot's prop type (TS7022) without a real runtime effect -->
				<template v-for="(_, slotName) in $slots" #[slotName]="slotScope" :key="slotName">
					<slot :name="slotName" v-bind="slotScope as object" />
				</template>
			</ContentFormGenerator>
		</div>
	</template>

	<!-- Json -->
	<template v-else-if="field.fieldType === FieldType.Json">
		<div class="content-form-generator__json">
			<div class="content-form-generator__json-toolbar">
				<UiButton appearance="text" size="m" @click="formatJson">Форматировать</UiButton>
				<span v-if="jsonError" class="content-form-generator__json-error">Ошибка синтаксиса</span>
			</div>
			<textarea
				class="content-form-generator__textarea content-form-generator__textarea--code"
				:disabled="readonly"
				placeholder="{ key: value }"
				:value="jsonString"
				@input="setJsonString(($event.target as HTMLTextAreaElement).value)"
			></textarea>
		</div>
	</template>

	<!-- Color -->
	<template v-else-if="field.fieldType === FieldType.Color">
		<div class="content-form-generator__color">
			<input v-model="modelValue" class="content-form-generator__color-swatch" :disabled="readonly" type="color" />
			<UiInput v-model="modelValue" :disabled="readonly" placeholder="#6366f1 или rgba(...)" />
			<div class="content-form-generator__color-presets">
				<button
					v-for="preset in presetSwatches"
					:key="preset"
					type="button"
					class="content-form-generator__color-preset"
					:disabled="readonly"
					:style="{ backgroundColor: preset }"
					:title="preset"
					@click="modelValue = preset"
				></button>
			</div>
		</div>
	</template>

	<!-- Link -->
	<template v-else-if="field.fieldType === FieldType.Link">
		<div class="content-form-generator__link">
			<UiInput v-model="linkField().url" :disabled="readonly" placeholder="https://example.com или /about" />
			<UiInput v-model="linkField().text" :disabled="readonly" placeholder="Текст ссылки (необязательно)" />
			<UiSelect v-model="linkField().target" :disabled="readonly">
				<el-option label="Текущая вкладка" value="_self" />
				<el-option label="Новая вкладка" value="_blank" />
			</UiSelect>
		</div>
	</template>

	<!-- Fallback for unsupported types -->
	<template v-else>
		<div class="content-form-generator__unsupported">Unsupported field type: {{ field.fieldType }}</div>
	</template>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { ElOption } from 'element-plus'

import type { FieldDefinition } from '@admin-panel/lib'
import { FieldType } from '@admin-panel/lib'

import UiButton from '../ui-button'
import UiInput from '../ui-input'
import UiMediaPicker from '../ui-media-picker'
import UiRichTextField from '../ui-rich-text-field'
import UiSelect from '../ui-select'
import ContentFormGenerator from './ContentFormGenerator.vue'
import { getDefaultValue } from './fieldDefaults'

defineOptions({
	name: 'ContentFieldControl',
})

const props = defineProps<{
	field: FieldDefinition
	readonly?: boolean
	translationNamespace?: string
}>()

const modelValue = defineModel<any>({ required: true })

function onNumberInput(value: string) {
	const num = parseFloat(value)
	modelValue.value = isNaN(num) ? 0 : num
}

// Link field helpers
function linkField() {
	if (!modelValue.value || typeof modelValue.value !== 'object') {
		const existingUrl = typeof modelValue.value === 'string' ? modelValue.value : ''
		modelValue.value = { url: existingUrl, text: '', target: '_self' }
	}
	if (!modelValue.value.target) modelValue.value.target = '_self'
	return modelValue.value
}

// Json field helpers
const jsonError = ref(false)

const jsonString = computed(() => {
	const val = modelValue.value
	if (val === undefined || val === null) return ''
	if (typeof val === 'string') return val
	try {
		return JSON.stringify(val, null, 2)
	} catch {
		return String(val)
	}
})

function setJsonString(str: string) {
	try {
		modelValue.value = JSON.parse(str)
		jsonError.value = false
	} catch {
		modelValue.value = str
		jsonError.value = true
	}
}

function formatJson() {
	try {
		modelValue.value = JSON.parse(jsonString.value)
		jsonError.value = false
	} catch {
		jsonError.value = true
	}
}

const presetSwatches = [
	'#ffffff',
	'#f8fafc',
	'#0f172a',
	'#6366f1',
	'#3b82f6',
	'#10b981',
	'#f59e0b',
	'#ef4444',
	'#ec4899',
	'#8b5cf6',
]

// Group field helpers
function groupData() {
	if (!modelValue.value || typeof modelValue.value !== 'object') modelValue.value = {}
	return modelValue.value
}

function setGroupData(val: any) {
	modelValue.value = { ...(modelValue.value || {}), ...val }
}

// Repeater field helpers
function repeaterList(): any[] {
	if (!Array.isArray(modelValue.value)) modelValue.value = []
	return modelValue.value
}

function addRepeaterItem() {
	const newItem: Record<string, any> = {}
	props.field.fields?.forEach((f) => {
		newItem[f.name] = f.defaultValue !== undefined ? f.defaultValue : getDefaultValue(f.fieldType)
	})
	modelValue.value = [...repeaterList(), newItem]
}

function duplicateRepeaterItem(index: number) {
	const list = repeaterList()
	const copy = JSON.parse(JSON.stringify(list[index] || {}))
	const next = [...list]
	next.splice(index + 1, 0, copy)
	modelValue.value = next
}

function moveRepeaterItem(index: number, delta: number) {
	const list = repeaterList()
	const target = index + delta
	if (target < 0 || target >= list.length) return
	const next = [...list]
	const [item] = next.splice(index, 1)
	next.splice(target, 0, item)
	modelValue.value = next
}

function removeRepeaterItem(index: number) {
	const next = [...repeaterList()]
	next.splice(index, 1)
	modelValue.value = next
}

function updateRepeaterItem(index: number, updatedItem: any) {
	const next = [...repeaterList()]
	next[index] = updatedItem
	modelValue.value = next
}

function getItemPreviewTitle(item: any): string {
	if (!item || typeof item !== 'object') return ''
	return item.title || item.name || item.label || item.heading || item.text || ''
}
</script>

<style scoped lang="scss">
.content-form-generator__textarea {
	width: 100%;
	min-height: 100px;
	border: 1px solid var(--gp-glass-border-inner);
	border-radius: var(--gp-radius-md);
	font-family: inherit;
	font-size: 14px;
	color: var(--text-primary);
	background: var(--gp-glass-gradient);
	background-color: var(--gp-bg-glass);
	resize: vertical;
	padding: 12px 16px;

	&:focus {
		outline: none;
		border-color: var(--gp-primary);
	}

	&:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	&--code {
		font-family: 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', monospace;
		font-size: 12px;
	}
}

.content-form-generator__unsupported,
.content-form-generator__repeater-empty {
	border: 1px dashed var(--border-color);
	border-radius: 6px;
	font-size: 12px;
	color: var(--text-muted);
	padding: 8px;
}

// Boolean switch
.content-form-generator__switch {
	width: 40px;
	height: 24px;
	position: relative;
	display: inline-flex;

	input {
		position: absolute;
		cursor: pointer;
		opacity: 0;
		inset: 0;

		&:checked + .content-form-generator__switch-track {
			background: var(--gp-primary);

			&::before {
				transform: translateX(16px);
			}
		}

		&:disabled {
			cursor: not-allowed;
		}
	}
}

.content-form-generator__switch-track {
	position: absolute;
	border-radius: 12px;
	background: var(--border-color);
	transition: background 0.2s;
	inset: 0;

	&::before {
		content: '';
		top: 2px;
		left: 2px;
		width: 20px;
		height: 20px;
		position: absolute;
		border-radius: 50%;
		background: var(--gp-white);
		transition: transform 0.2s;
	}
}

// Date
.content-form-generator__date {
	width: 100%;
	border: 1px solid var(--gp-glass-border-inner);
	border-radius: var(--gp-radius-md);
	font-family: inherit;
	font-size: 14px;
	color: var(--text-primary);
	background-color: var(--gp-bg-glass);
	padding: 12px 16px;
}

// Media
.content-form-generator__media {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

// Json
.content-form-generator__json {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.content-form-generator__json-toolbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-size: 12px;
}

.content-form-generator__json-error {
	font-size: 11px;
	color: var(--el-color-danger, #f04438);
}

// Color
.content-form-generator__color {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 10px;
}

.content-form-generator__color-swatch {
	width: 36px;
	height: 36px;
	border: 1px solid var(--border-color);
	border-radius: 6px;
	cursor: pointer;
	padding: 2px;
}

.content-form-generator__color-presets {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 6px;
}

.content-form-generator__color-preset {
	width: 18px;
	height: 18px;
	border: 1px solid rgb(0, 0, 0, 0.15);
	border-radius: 50%;
	transition: transform 0.15s ease;
	cursor: pointer;

	&:hover {
		transform: scale(1.2);
	}
}

// Link
.content-form-generator__link {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

// Group / Repeater
.content-form-generator__group {
	border: 1px solid var(--border-color);
	border-radius: 8px;
	background: rgb(0, 0, 0, 0.02);
	padding: 12px;
}

.content-form-generator__repeater {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.content-form-generator__repeater-item {
	border: 1px solid var(--border-color);
	border-radius: 8px;
	background: var(--bg-surface);
	overflow: hidden;
}

.content-form-generator__repeater-item-header {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	border-bottom: 1px solid var(--border-color);
	font-size: 12px;
	background: rgb(0, 0, 0, 0.03);
	padding: 8px 12px;
	gap: 8px;
}

.content-form-generator__repeater-item-actions {
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
}

.content-form-generator__repeater-add {
	width: 100%;
}
</style>
