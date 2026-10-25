<template>
	<div class="content-form-generator">
		<div v-for="field in fields" :key="field.name" class="content-form-generator__field">
			<label :for="field.name" class="content-form-generator__label">
				{{ field.label }}
				<span v-if="field.required" class="content-form-generator__required">*</span>
			</label>

			<div class="content-form-generator__control">
				<!-- Text -->
				<template v-if="field.fieldType === FieldType.Text">
					<div class="content-form-generator__text-field">
						<div
							v-if="showI18nTools && isTranslationKey(modelValue[field.name])"
							class="content-form-generator__i18n-pill"
						>
							<span class="content-form-generator__i18n-badge">KEY</span>
							<code class="content-form-generator__i18n-code">{{ extractTranslationKey(modelValue[field.name]) }}</code>
							<button
								type="button"
								class="content-form-generator__i18n-unwrap"
								title="Преобразовать в обычный текст"
								@click="unwrapTranslationKey(field.name)"
							>
								✕
							</button>
						</div>

						<textarea
							v-if="field.multiline"
							:id="field.name"
							v-model="modelValue[field.name]"
							class="content-form-generator__textarea"
							:disabled="readonly"
							:placeholder="field.label"
						></textarea>
						<UiInput
							v-else
							:id="field.name"
							v-model="modelValue[field.name]"
							:disabled="readonly"
							:placeholder="field.label"
						/>

						<div v-if="showI18nTools && !readonly" class="content-form-generator__i18n-tools">
							<button
								type="button"
								class="content-form-generator__i18n-tool"
								:class="{ 'is-active': isTranslationKey(modelValue[field.name]) }"
								title="Обернуть в ключ перевода $t('...')"
								@click="toggleWrapTranslationKey(field.name)"
							>
								{{ isTranslationKey(modelValue[field.name]) ? 'Снять ключ $t' : 'В перевод ($t)' }}
							</button>
							<div class="content-form-generator__substitutions">
								<span class="content-form-generator__substitutions-label">Подстановки:</span>
								<button
									v-for="sub in commonSubstitutions"
									:key="sub.tag"
									type="button"
									class="content-form-generator__substitution-tag"
									:title="`Вставить переменную: ${sub.label}`"
									@click="insertSubstitution(field.name, sub.tag)"
								>
									{{ sub.tag }}
								</button>
							</div>
						</div>
					</div>
				</template>

				<!-- Rich text: app provides the actual editor (e.g. Tiptap) via the `rich-text` slot -->
				<template v-else-if="field.fieldType === FieldType.RichText">
					<slot
						name="rich-text"
						:disabled="readonly"
						:field="field"
						:update="(value: any) => updateField(field.name, value)"
						:value="modelValue[field.name]"
					>
						<textarea
							:id="field.name"
							v-model="modelValue[field.name]"
							class="content-form-generator__textarea"
							:disabled="readonly"
							:placeholder="field.label"
						></textarea>
					</slot>
				</template>

				<!-- Number -->
				<template v-else-if="field.fieldType === FieldType.Number">
					<UiInput
						:id="field.name"
						:disabled="readonly"
						:model-value="String(modelValue[field.name] ?? '')"
						:placeholder="field.label"
						@update:model-value="onNumberInput(field.name, $event)"
					/>
				</template>

				<!-- Boolean -->
				<template v-else-if="field.fieldType === FieldType.Boolean">
					<label class="content-form-generator__switch">
						<input :id="field.name" v-model="modelValue[field.name]" :disabled="readonly" type="checkbox" />
						<span class="content-form-generator__switch-track"></span>
					</label>
				</template>

				<!-- Date -->
				<template v-else-if="field.fieldType === FieldType.Date">
					<input
						:id="field.name"
						v-model="modelValue[field.name]"
						class="content-form-generator__date"
						:disabled="readonly"
						type="date"
					/>
				</template>

				<!-- Media -->
				<template v-else-if="field.fieldType === FieldType.Media">
					<div class="content-form-generator__media">
						<UiMediaPicker v-model="modelValue[field.name]" :disabled="readonly" />
						<UiInput
							v-model="modelValue[field.name]"
							:disabled="readonly"
							placeholder="Или прямая ссылка на изображение (https://...)"
						/>
					</div>
				</template>

				<!-- Relation: app provides the real picker (resolves entries over the API) via the `relation` slot -->
				<template v-else-if="field.fieldType === FieldType.Relation">
					<slot
						name="relation"
						:disabled="readonly"
						:field="field"
						:update="(value: any) => updateField(field.name, value)"
						:value="modelValue[field.name]"
					>
						<UiInput
							v-model="modelValue[field.name]"
							:disabled="readonly"
							:placeholder="`ID связанной записи (${field.relationTo})`"
						/>
					</slot>
				</template>

				<!-- Repeater -->
				<template v-else-if="field.fieldType === FieldType.Repeater">
					<div class="content-form-generator__repeater">
						<div v-if="getRepeaterList(field.name).length === 0" class="content-form-generator__repeater-empty">
							Список пока пуст
						</div>

						<div
							v-for="(item, index) in getRepeaterList(field.name)"
							:key="index"
							class="content-form-generator__repeater-item"
						>
							<div class="content-form-generator__repeater-item-header">
								<strong>{{ getItemPreviewTitle(item) || `Элемент ${index + 1}` }}</strong>
								<div class="content-form-generator__repeater-item-actions">
									<UiButton
										appearance="secondary"
										size="m"
										:disabled="readonly || index === 0"
										title="Вверх"
										@click="moveRepeaterItem(field.name, index, -1)"
									>
										↑
									</UiButton>
									<UiButton
										appearance="secondary"
										size="m"
										:disabled="readonly || index === getRepeaterList(field.name).length - 1"
										title="Вниз"
										@click="moveRepeaterItem(field.name, index, 1)"
									>
										↓
									</UiButton>
									<UiButton
										appearance="secondary"
										size="m"
										:disabled="readonly"
										title="Дублировать"
										@click="duplicateRepeaterItem(field.name, index)"
									>
										⎘
									</UiButton>
									<UiButton
										appearance="secondary"
										size="m"
										:disabled="readonly"
										title="Удалить"
										@click="removeRepeaterItem(field.name, index)"
									>
										✕
									</UiButton>
								</div>
							</div>

							<ContentFormGenerator
								:fields="field.fields || []"
								:model-value="item"
								:readonly="readonly"
								:show-i18n-tools="showI18nTools"
								@update:model-value="updateRepeaterItem(field.name, index, $event)"
							>
								<template v-for="(_, slotName) in $slots" #[slotName]="slotScope" :key="slotName">
									<slot :name="slotName" v-bind="slotScope as object" />
								</template>
							</ContentFormGenerator>
						</div>

						<UiButton
							appearance="secondary"
							class="content-form-generator__repeater-add"
							:disabled="readonly"
							@click="addRepeaterItem(field.name, field.fields)"
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
							:model-value="getGroupData(field.name)"
							:readonly="readonly"
							:show-i18n-tools="showI18nTools"
							@update:model-value="setGroupData(field.name, $event)"
						>
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
							<UiButton appearance="text" size="m" @click="formatJson(field.name)">Форматировать</UiButton>
							<span v-if="jsonErrors[field.name]" class="content-form-generator__json-error">Ошибка синтаксиса</span>
						</div>
						<textarea
							class="content-form-generator__textarea content-form-generator__textarea--code"
							:disabled="readonly"
							placeholder="{ key: value }"
							:value="getJsonString(field.name)"
							@input="setJsonString(field.name, ($event.target as HTMLTextAreaElement).value)"
						></textarea>
					</div>
				</template>

				<!-- Color -->
				<template v-else-if="field.fieldType === FieldType.Color">
					<div class="content-form-generator__color">
						<input
							v-model="modelValue[field.name]"
							class="content-form-generator__color-swatch"
							:disabled="readonly"
							type="color"
						/>
						<UiInput v-model="modelValue[field.name]" :disabled="readonly" placeholder="#6366f1 или rgba(...)" />
						<div class="content-form-generator__color-presets">
							<button
								v-for="preset in presetSwatches"
								:key="preset"
								type="button"
								class="content-form-generator__color-preset"
								:disabled="readonly"
								:style="{ backgroundColor: preset }"
								:title="preset"
								@click="modelValue[field.name] = preset"
							></button>
						</div>
					</div>
				</template>

				<!-- Link -->
				<template v-else-if="field.fieldType === FieldType.Link">
					<div class="content-form-generator__link">
						<UiInput
							v-model="getLinkField(field.name).url"
							:disabled="readonly"
							placeholder="https://example.com или /about"
						/>
						<UiInput
							v-model="getLinkField(field.name).text"
							:disabled="readonly"
							placeholder="Текст ссылки (необязательно)"
						/>
						<UiSelect v-model="getLinkField(field.name).target" :disabled="readonly">
							<el-option label="Текущая вкладка" value="_self" />
							<el-option label="Новая вкладка" value="_blank" />
						</UiSelect>
					</div>
				</template>

				<!-- Fallback for unsupported types -->
				<template v-else>
					<div class="content-form-generator__unsupported">Unsupported field type: {{ field.fieldType }}</div>
				</template>
			</div>

			<div v-if="errors?.[field.name]" class="content-form-generator__error">
				{{ errors[field.name][0] }}
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { reactive, watch } from 'vue'
import { ElOption } from 'element-plus'

import type { FieldDefinition } from '@admin-panel/lib'
import { FieldType } from '@admin-panel/lib'

import UiButton from '../ui-button'
import UiInput from '../ui-input'
import UiMediaPicker from '../ui-media-picker'
import UiSelect from '../ui-select'

defineOptions({
	name: 'ContentFormGenerator',
})

interface Props {
	fields: FieldDefinition[]
	errors?: Record<string, string[]>
	readonly?: boolean
	// Shows the "wrap into $t() key" / variable-substitution toolbar on Text fields.
	showI18nTools?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	readonly: false,
	showI18nTools: true,
})

const modelValue = defineModel<Record<string, any>>({ required: true, default: () => ({}) })

function getDefaultValue(type: FieldType) {
	switch (type) {
		case FieldType.Boolean:
			return false
		case FieldType.Number:
			return 0
		case FieldType.Media:
			return null
		case FieldType.Repeater:
			return []
		case FieldType.Group:
			return {}
		default:
			return ''
	}
}

function ensureDefaults(fieldList: FieldDefinition[]) {
	fieldList.forEach((field) => {
		if (modelValue.value[field.name] === undefined) {
			modelValue.value[field.name] =
				field.defaultValue !== undefined ? field.defaultValue : getDefaultValue(field.fieldType)
		}
	})
}

watch(() => props.fields, ensureDefaults, { immediate: true })

function updateField(name: string, value: any) {
	modelValue.value[name] = value
}

function onNumberInput(name: string, value: string) {
	const num = parseFloat(value)
	modelValue.value[name] = isNaN(num) ? 0 : num
}

// Text field: translation-key wrapping & variable substitution helpers
const commonSubstitutions = [
	{ tag: '{{city}}', label: 'Город' },
	{ tag: '{{user_name}}', label: 'Имя пользователя' },
	{ tag: '{{count}}', label: 'Число' },
	{ tag: '{{year}}', label: 'Год' },
]

function isTranslationKey(val: any): boolean {
	if (typeof val !== 'string') return false
	const trimmed = val.trim()
	return (
		trimmed.startsWith('$t(') ||
		trimmed.startsWith('@t:') ||
		trimmed.startsWith('i18n:') ||
		(trimmed.includes('.') && !trimmed.includes(' ') && trimmed.length < 80 && /^[a-zA-Z0-9_\-.]+$/.test(trimmed))
	)
}

function extractTranslationKey(val: any): string {
	if (!val) return ''
	const str = String(val).trim()
	if (str.startsWith('$t(') && str.endsWith(')')) return str.slice(3, -1).replace(/['"]/g, '')
	if (str.startsWith('@t:')) return str.slice(3)
	if (str.startsWith('i18n:')) return str.slice(5)
	return str
}

function toggleWrapTranslationKey(fieldName: string) {
	const current = String(modelValue.value[fieldName] || '').trim()
	if (isTranslationKey(current)) {
		modelValue.value[fieldName] = extractTranslationKey(current)
		return
	}
	const key = current
		? current.includes(' ')
			? current
					.toLowerCase()
					.replace(/[^a-z0-9а-яё]/gi, '_')
					.slice(0, 30)
			: current
		: `page.${fieldName}`
	modelValue.value[fieldName] = `$t('${key}')`
}

function unwrapTranslationKey(fieldName: string) {
	modelValue.value[fieldName] = extractTranslationKey(String(modelValue.value[fieldName] || ''))
}

function insertSubstitution(fieldName: string, tag: string) {
	const current = String(modelValue.value[fieldName] || '')
	modelValue.value[fieldName] = current ? `${current} ${tag}` : tag
}

// Link field helpers
function getLinkField(name: string) {
	if (!modelValue.value[name] || typeof modelValue.value[name] !== 'object') {
		const existingUrl = typeof modelValue.value[name] === 'string' ? modelValue.value[name] : ''
		modelValue.value[name] = { url: existingUrl, text: '', target: '_self' }
	}
	if (!modelValue.value[name].target) modelValue.value[name].target = '_self'
	return modelValue.value[name]
}

// Json field helpers
const jsonErrors = reactive<Record<string, boolean>>({})

function getJsonString(name: string): string {
	const val = modelValue.value[name]
	if (val === undefined || val === null) return ''
	if (typeof val === 'string') return val
	try {
		return JSON.stringify(val, null, 2)
	} catch {
		return String(val)
	}
}

function setJsonString(name: string, str: string) {
	try {
		modelValue.value[name] = JSON.parse(str)
		jsonErrors[name] = false
	} catch {
		modelValue.value[name] = str
		jsonErrors[name] = true
	}
}

function formatJson(name: string) {
	try {
		modelValue.value[name] = JSON.parse(getJsonString(name))
		jsonErrors[name] = false
	} catch {
		jsonErrors[name] = true
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
function getGroupData(name: string) {
	if (!modelValue.value[name] || typeof modelValue.value[name] !== 'object') modelValue.value[name] = {}
	return modelValue.value[name]
}

function setGroupData(name: string, val: any) {
	modelValue.value[name] = { ...(modelValue.value[name] || {}), ...val }
}

// Repeater field helpers
function getRepeaterList(name: string): any[] {
	if (!Array.isArray(modelValue.value[name])) modelValue.value[name] = []
	return modelValue.value[name]
}

function addRepeaterItem(name: string, subfields?: FieldDefinition[]) {
	const list = getRepeaterList(name)
	const newItem: Record<string, any> = {}
	subfields?.forEach((f) => {
		newItem[f.name] = f.defaultValue !== undefined ? f.defaultValue : getDefaultValue(f.fieldType)
	})
	modelValue.value[name] = [...list, newItem]
}

function duplicateRepeaterItem(name: string, index: number) {
	const list = getRepeaterList(name)
	const copy = JSON.parse(JSON.stringify(list[index] || {}))
	const next = [...list]
	next.splice(index + 1, 0, copy)
	modelValue.value[name] = next
}

function moveRepeaterItem(name: string, index: number, delta: number) {
	const list = getRepeaterList(name)
	const target = index + delta
	if (target < 0 || target >= list.length) return
	const next = [...list]
	const [item] = next.splice(index, 1)
	next.splice(target, 0, item)
	modelValue.value[name] = next
}

function removeRepeaterItem(name: string, index: number) {
	const next = [...getRepeaterList(name)]
	next.splice(index, 1)
	modelValue.value[name] = next
}

function updateRepeaterItem(name: string, index: number, updatedItem: any) {
	const next = [...getRepeaterList(name)]
	next[index] = updatedItem
	modelValue.value[name] = next
}

function getItemPreviewTitle(item: any): string {
	if (!item || typeof item !== 'object') return ''
	return item.title || item.name || item.label || item.heading || item.text || ''
}
</script>

<style scoped lang="scss">
.content-form-generator {
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 20px;

	&__field {
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	&__label {
		font-weight: 500;
		font-size: 14px;
		color: var(--text-primary);
	}

	&__required {
		color: var(--el-color-danger, #f04438);
		margin-left: 2px;
	}

	&__control {
		min-width: 0;
	}

	&__textarea {
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

	&__unsupported,
	&__repeater-empty {
		border: 1px dashed var(--border-color);
		border-radius: 6px;
		font-size: 12px;
		color: var(--text-muted);
		padding: 8px;
	}

	&__error {
		font-size: 12px;
		color: var(--el-color-danger, #f04438);
		margin-top: 2px;
	}

	// Text + i18n tools
	&__text-field {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	&__i18n-pill {
		display: inline-flex;
		align-items: center;
		align-self: flex-start;
		border: 1px solid rgb(99, 102, 241, 0.25);
		border-radius: 4px;
		font-size: 11px;
		background: rgb(99, 102, 241, 0.1);
		padding: 2px 8px;
		gap: 6px;
	}

	&__i18n-badge {
		font-weight: 700;
		letter-spacing: 0.5px;
		color: var(--gp-primary);
	}

	&__i18n-code {
		border-radius: 3px;
		font-family: monospace;
		color: var(--gp-primary);
		background: rgb(99, 102, 241, 0.15);
		padding: 1px 4px;
	}

	&__i18n-unwrap {
		border: none;
		font-size: 12px;
		color: var(--gp-primary);
		background: transparent;
		cursor: pointer;
		padding: 0 2px;

		&:hover {
			color: var(--el-color-danger, #ef4444);
		}
	}

	&__i18n-tools {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		font-size: 11px;
		gap: 8px;
	}

	&__i18n-tool {
		border: 1px solid var(--border-color);
		border-radius: 4px;
		font-size: 11px;
		color: var(--text-muted);
		background: var(--bg-card, #f8fafc);
		transition: all 0.2s;
		cursor: pointer;
		padding: 2px 8px;

		&:hover {
			border-color: var(--gp-primary);
			color: var(--text-primary);
		}

		&.is-active {
			border-color: var(--gp-primary);
			color: var(--gp-white);
			background: var(--gp-primary);
		}
	}

	&__substitutions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px;
	}

	&__substitutions-label {
		font-size: 10px;
		color: var(--text-muted);
	}

	&__substitution-tag {
		border: 1px dashed var(--border-color);
		border-radius: 3px;
		font-family: monospace;
		font-size: 10px;
		color: var(--text-muted);
		background: transparent;
		cursor: pointer;
		padding: 1px 5px;

		&:hover {
			border-color: var(--gp-primary);
			color: var(--gp-primary);
			background: rgb(99, 102, 241, 0.08);
		}
	}

	// Boolean switch
	&__switch {
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

	&__switch-track {
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
	&__date {
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
	&__media {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	// Json
	&__json {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	&__json-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 12px;
	}

	&__json-error {
		font-size: 11px;
		color: var(--el-color-danger, #f04438);
	}

	// Color
	&__color {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px;
	}

	&__color-swatch {
		width: 36px;
		height: 36px;
		border: 1px solid var(--border-color);
		border-radius: 6px;
		cursor: pointer;
		padding: 2px;
	}

	&__color-presets {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
	}

	&__color-preset {
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
	&__link {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	// Group / Repeater
	&__group {
		border: 1px solid var(--border-color);
		border-radius: 8px;
		background: rgb(0, 0, 0, 0.02);
		padding: 12px;
	}

	&__repeater {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	&__repeater-item {
		border: 1px solid var(--border-color);
		border-radius: 8px;
		background: var(--bg-surface);
		overflow: hidden;
	}

	&__repeater-item-header {
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

	&__repeater-item-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}

	&__repeater-add {
		width: 100%;
	}
}
</style>
