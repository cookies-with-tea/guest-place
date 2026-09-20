<template>
	<div class="content-form-generator">
		<el-form label-position="top" :model="modelValue">
			<el-form-item
				v-for="field in fields"
				:key="field.name"
				:label="field.label"
				:prop="field.name"
				:rules="field.required ? [{ required: true, message: `${field.label} is required` }] : []"
			>
				<!-- 1. Text with Stage 1.8 i18n translation wrapping & variable substitutions -->
				<template v-if="getFieldType(field) === 'text'">
					<div class="text-input-i18n-wrapper">
						<!-- Visual key badge when value is or contains a translation key -->
						<div v-if="isTranslationKey(modelValue[field.name])" class="translation-key-pill">
							<span class="pill-badge">🌐 KEY</span>
							<code class="pill-code">{{ extractTranslationKey(modelValue[field.name]) }}</code>
							<button
								type="button"
								class="pill-action-btn"
								title="Преобразовать в обычный текст"
								@click="unwrapTranslationKey(field.name)"
							>
								✕
							</button>
						</div>

						<el-input
							v-if="field.name?.includes('desc') || field.name?.includes('items') || field.name?.includes('quote')"
							v-model="modelValue[field.name]"
							:disabled="readonly"
							:placeholder="field.label"
							type="textarea"
							:autosize="{ minRows: 2, maxRows: 5 }"
						/>
						<el-input
							v-else
							v-model="modelValue[field.name]"
							:disabled="readonly"
							:placeholder="field.label"
							type="text"
						/>

						<!-- Translation & Substitution Toolbar (Stage 1.8) -->
						<div v-if="!readonly" class="field-i18n-tools">
							<button
								type="button"
								class="i18n-tool-btn"
								:class="{ 'is-active': isTranslationKey(modelValue[field.name]) }"
								title="Обернуть в ключ перевода $t('...')"
								@click="toggleWrapTranslationKey(field.name)"
							>
								<span>🌐</span>
								<span>{{ isTranslationKey(modelValue[field.name]) ? 'Снять ключ $t' : 'В перевод ($t)' }}</span>
							</button>

							<div class="substitutions-inline">
								<span class="sub-label">Подстановки:</span>
								<button
									v-for="sub in commonSubstitutions"
									:key="sub.tag"
									type="button"
									class="sub-tag-btn"
									:title="`Вставить переменную: ${sub.label}`"
									@click="insertSubstitution(field.name, sub.tag)"
								>
									{{ sub.tag }}
								</button>
							</div>
						</div>
					</div>
				</template>

				<!-- 2. RichText — Tiptap block editor -->
				<template v-else-if="getFieldType(field) === 'rich_text'">
					<TiptapEditor
						v-model="modelValue[field.name]"
						:disabled="readonly"
						:placeholder="`Write ${field.label}...`"
					/>
				</template>

				<!-- 3. Number -->
				<template v-else-if="getFieldType(field) === 'number'">
					<el-input-number
						v-model="modelValue[field.name]"
						:disabled="readonly"
						:placeholder="field.label"
						style="width: 100%"
					/>
				</template>

				<!-- 4. Boolean -->
				<template v-else-if="getFieldType(field) === 'boolean'">
					<el-switch v-model="modelValue[field.name]" :disabled="readonly" />
				</template>

				<!-- 5. Media -->
				<template v-else-if="getFieldType(field) === 'media'">
					<div class="media-field-container">
						<UiMediaPicker v-model="modelValue[field.name]" :disabled="readonly" />
						<div class="media-url-fallback" style="margin-top: 8px">
							<el-input
								v-model="modelValue[field.name]"
								:disabled="readonly"
								placeholder="Или прямая ссылка на изображение (https://...)"
								size="small"
								clearable
							>
								<template #prepend>URL</template>
							</el-input>
						</div>
					</div>
				</template>

				<!-- 6. Date -->
				<template v-else-if="getFieldType(field) === 'date'">
					<el-date-picker
						v-model="modelValue[field.name]"
						:disabled="readonly"
						placeholder="Pick a date"
						style="width: 100%"
						type="date"
					/>
				</template>

				<!-- 7. Relation -->
				<template v-else-if="getFieldType(field) === 'relation'">
					<UiRelationPicker
						v-model="modelValue[field.name]"
						:disabled="readonly"
						:multiple="field.multiple"
						:placeholder="field.label"
						:schema-slug="field.relationTo"
					/>
				</template>

				<!-- 8. Color Picker -->
				<template v-else-if="getFieldType(field) === 'color'">
					<div class="color-picker-wrapper">
						<el-color-picker
							v-model="modelValue[field.name]"
							:disabled="readonly"
							show-alpha
							size="default"
						/>
						<el-input
							v-model="modelValue[field.name]"
							:disabled="readonly"
							placeholder="#6366f1 или rgba(...)"
							size="default"
							style="flex: 1"
							clearable
						/>
						<div class="quick-swatches">
							<span
								v-for="swatch in presetSwatches"
								:key="swatch"
								class="swatch-dot"
								:style="{ backgroundColor: swatch }"
								:title="swatch"
								@click="!readonly && (modelValue[field.name] = swatch)"
							></span>
						</div>
					</div>
				</template>

				<!-- 9. Link -->
				<template v-else-if="getFieldType(field) === 'link'">
					<div class="link-field-box">
						<div class="link-inputs">
							<el-input
								v-model="getLinkField(field.name).url"
								:disabled="readonly"
								placeholder="https://example.com или /about"
								size="small"
							>
								<template #prepend>URL</template>
							</el-input>
							<el-input
								v-model="getLinkField(field.name).text"
								:disabled="readonly"
								placeholder="Текст ссылки (необязательно)"
								size="small"
							>
								<template #prepend>Текст</template>
							</el-input>
						</div>
						<div class="link-target-toggle">
							<el-radio-group
								v-model="getLinkField(field.name).target"
								size="small"
								:disabled="readonly"
							>
								<el-radio-button label="_self">Текущая вкладка</el-radio-button>
								<el-radio-button label="_blank">Новая вкладка ↗</el-radio-button>
							</el-radio-group>
						</div>
					</div>
				</template>

				<!-- 10. JSON -->
				<template v-else-if="getFieldType(field) === 'json'">
					<div class="json-field-container">
						<div class="json-toolbar">
							<el-button size="small" link type="primary" @click="formatJson(field.name)">
								Форматировать (Beautify)
							</el-button>
							<span v-if="jsonErrors[field.name]" class="json-error-badge">
								⚠️ Ошибка синтаксиса
							</span>
						</div>
						<el-input
							:model-value="getJsonString(field.name)"
							:disabled="readonly"
							type="textarea"
							:autosize="{ minRows: 3, maxRows: 10 }"
							placeholder="{ key: value }"
							class="code-input"
							@update:model-value="setJsonString(field.name, $event)"
						/>
					</div>
				</template>

				<!-- 11. Group -->
				<template v-else-if="getFieldType(field) === 'group'">
					<div class="group-field-box">
						<div class="group-header">
							<span class="group-icon">📁</span>
							<span class="group-title">{{ field.label }}</span>
						</div>
						<div class="group-body">
							<ContentFormGenerator
								:model-value="getGroupData(field.name)"
								:fields="field.fields || []"
								:readonly="readonly"
								@update:model-value="setGroupData(field.name, $event)"
							/>
						</div>
					</div>
				</template>

				<!-- 12. Repeater -->
				<template v-else-if="getFieldType(field) === 'repeater'">
					<div class="repeater-field-container">
						<div class="repeater-items-list">
							<div
								v-for="(item, index) in getRepeaterList(field.name)"
								:key="index"
								class="repeater-item-card"
							>
								<div class="repeater-item-header">
									<div class="repeater-item-title">
										<span class="item-badge">#{{ index + 1 }}</span>
										<strong class="item-label">{{ getItemPreviewTitle(item) || `Элемент ${index + 1}` }}</strong>
									</div>
									<div class="repeater-item-actions">
										<el-button
											size="small"
											circle
											:disabled="readonly || index === 0"
											title="Вверх"
											@click="moveRepeaterItem(field.name, index, -1)"
										>
											↑
										</el-button>
										<el-button
											size="small"
											circle
											:disabled="readonly || index === getRepeaterList(field.name).length - 1"
											title="Вниз"
											@click="moveRepeaterItem(field.name, index, 1)"
										>
											↓
										</el-button>
										<el-button
											size="small"
											circle
											:disabled="readonly"
											title="Дублировать"
											@click="duplicateRepeaterItem(field.name, index)"
										>
											⎘
										</el-button>
										<el-button
											size="small"
											circle
											type="danger"
											plain
											:disabled="readonly"
											title="Удалить"
											@click="removeRepeaterItem(field.name, index)"
										>
											✕
										</el-button>
									</div>
								</div>
								<div class="repeater-item-body">
									<ContentFormGenerator
										:model-value="item"
										:fields="field.fields || []"
										:readonly="readonly"
										@update:model-value="updateRepeaterItem(field.name, index, $event)"
									/>
								</div>
							</div>

							<div v-if="getRepeaterList(field.name).length === 0" class="repeater-empty">
								<span>Список пока пуст</span>
							</div>
						</div>

						<el-button
							type="primary"
							plain
							size="small"
							class="repeater-add-btn"
							:disabled="readonly"
							@click="addRepeaterItem(field.name, field.fields)"
						>
							+ Добавить элемент в «{{ field.label }}»
						</el-button>
					</div>
				</template>

				<!-- Fallback -->
				<template v-else>
					<div class="unsupported-type">
						Unsupported type: {{ field.fieldType || (field as any).field_type }}
						<span style="font-size: 10px; opacity: 0.5">
							(Name: {{ field.name }})
						</span>
					</div>
				</template>

				<div v-if="errors?.[field.name]" class="field-error">
					{{ errors[field.name][0] }}
				</div>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { FieldDefinition } from '@admin-panel/lib'
import { FieldType } from '@admin-panel/lib'
import { UiMediaPicker } from '@admin-panel/ui'

import TiptapEditor from './TiptapEditor.vue'
import UiRelationPicker from './UiRelationPicker.vue'

const modelValue = defineModel<Record<string, any>>({ required: true, default: () => ({}) })

interface Props {
	fields: FieldDefinition[]
	errors?: Record<string, string[]>
	readonly?: boolean
}

defineProps<Props>()

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

const jsonErrors = reactive<Record<string, boolean>>({})

// Stage 1.8: Translation & Variable Interpolation Helpers
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
	let str = String(val).trim()
	if (str.startsWith('$t(') && str.endsWith(')')) {
		return str.slice(3, -1).replace(/['"]/g, '')
	}
	if (str.startsWith('@t:')) return str.slice(3)
	if (str.startsWith('i18n:')) return str.slice(5)
	return str
}

function toggleWrapTranslationKey(fieldName: string) {
	const current = String(modelValue.value[fieldName] || '').trim()
	if (isTranslationKey(current)) {
		modelValue.value[fieldName] = extractTranslationKey(current)
	} else {
		const key = current
			? (current.includes(' ') ? current.toLowerCase().replace(/[^a-z0-9а-яё]/gi, '_').slice(0, 30) : current)
			: `page.${fieldName}`
		modelValue.value[fieldName] = `$t('${key}')`
	}
}

function unwrapTranslationKey(fieldName: string) {
	const current = String(modelValue.value[fieldName] || '')
	modelValue.value[fieldName] = extractTranslationKey(current)
}

function insertSubstitution(fieldName: string, tag: string) {
	const current = String(modelValue.value[fieldName] || '')
	modelValue.value[fieldName] = current ? `${current} ${tag}` : tag
}

function getFieldType(field: any): string {
	const raw = String(field?.fieldType || field?.field_type || '').toLowerCase().replace(/_/g, '')
	if (raw === 'text') return 'text'
	if (raw === 'richtext') return 'rich_text'
	if (raw === 'number') return 'number'
	if (raw === 'boolean') return 'boolean'
	if (raw === 'date') return 'date'
	if (raw === 'media') return 'media'
	if (raw === 'relation') return 'relation'
	if (raw === 'color') return 'color'
	if (raw === 'link') return 'link'
	if (raw === 'json') return 'json'
	if (raw === 'group') return 'group'
	if (raw === 'repeater') return 'repeater'
	return raw
}

// LINK FIELD HELPERS
function getLinkField(name: string) {
	if (!modelValue.value[name] || typeof modelValue.value[name] !== 'object') {
		const existingUrl = typeof modelValue.value[name] === 'string' ? modelValue.value[name] : ''
		modelValue.value[name] = {
			url: existingUrl,
			text: '',
			target: '_self',
		}
	}
	if (!modelValue.value[name].target) {
		modelValue.value[name].target = '_self'
	}
	return modelValue.value[name]
}

// JSON FIELD HELPERS
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
		const parsed = JSON.parse(str)
		modelValue.value[name] = parsed
		jsonErrors[name] = false
	} catch {
		// Keep as raw text while user is typing
		modelValue.value[name] = str
		jsonErrors[name] = true
	}
}

function formatJson(name: string) {
	try {
		const str = getJsonString(name)
		const parsed = JSON.parse(str)
		modelValue.value[name] = parsed
		jsonErrors[name] = false
	} catch (e) {
		jsonErrors[name] = true
	}
}

// GROUP FIELD HELPERS
function getGroupData(name: string) {
	if (!modelValue.value[name] || typeof modelValue.value[name] !== 'object') {
		modelValue.value[name] = {}
	}
	return modelValue.value[name]
}

function setGroupData(name: string, val: any) {
	modelValue.value[name] = { ...(modelValue.value[name] || {}), ...val }
}

// REPEATER FIELD HELPERS
function getRepeaterList(name: string): any[] {
	if (!Array.isArray(modelValue.value[name])) {
		modelValue.value[name] = []
	}
	return modelValue.value[name]
}

function addRepeaterItem(name: string, subfields?: FieldDefinition[]) {
	const list = getRepeaterList(name)
	const newItem: Record<string, any> = {}
	if (subfields && Array.isArray(subfields)) {
		subfields.forEach(f => {
			newItem[f.name] = f.defaultValue !== undefined ? f.defaultValue : ''
		})
	}
	list.push(newItem)
	modelValue.value[name] = [...list]
}

function duplicateRepeaterItem(name: string, index: number) {
	const list = getRepeaterList(name)
	const itemToCopy = JSON.parse(JSON.stringify(list[index] || {}))
	list.splice(index + 1, 0, itemToCopy)
	modelValue.value[name] = [...list]
}

function moveRepeaterItem(name: string, index: number, delta: number) {
	const list = getRepeaterList(name)
	const target = index + delta
	if (target < 0 || target >= list.length) return
	const [item] = list.splice(index, 1)
	list.splice(target, 0, item)
	modelValue.value[name] = [...list]
}

function removeRepeaterItem(name: string, index: number) {
	const list = getRepeaterList(name)
	list.splice(index, 1)
	modelValue.value[name] = [...list]
}

function updateRepeaterItem(name: string, index: number, updatedItem: any) {
	const list = getRepeaterList(name)
	list[index] = { ...updatedItem }
	modelValue.value[name] = [...list]
}

function getItemPreviewTitle(item: any): string {
	if (!item || typeof item !== 'object') return ''
	return item.title || item.name || item.label || item.heading || item.text || ''
}
</script>

<style scoped>
.content-form-generator {
	width: 100%;
}

.unsupported-type {
	border: 1px dashed var(--border-color);
	border-radius: 4px;
	font-size: 12px;
	color: var(--text-muted);
	padding: 8px;
}

.field-error {
	font-size: 12px;
	color: var(--el-color-danger);
	margin-top: 4px;
}

/* Color Picker */
.color-picker-wrapper {
	display: flex;
	align-items: center;
	gap: 10px;
	width: 100%;
}

.quick-swatches {
	display: flex;
	align-items: center;
	gap: 6px;
}

.swatch-dot {
	width: 18px;
	height: 18px;
	border-radius: 50%;
	border: 1px solid rgba(0, 0, 0, 0.15);
	cursor: pointer;
	transition: transform 0.15s ease;
}

.swatch-dot:hover {
	transform: scale(1.2);
}

/* Link Field */
.link-field-box {
	display: flex;
	flex-direction: column;
	gap: 8px;
	width: 100%;
	padding: 10px;
	background: var(--bg-surface);
	border: 1px solid var(--border-color);
	border-radius: 6px;
}

.link-inputs {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.link-target-toggle {
	display: flex;
	justify-content: flex-end;
}

/* JSON Field */
.json-field-container {
	display: flex;
	flex-direction: column;
	gap: 6px;
	width: 100%;
}

.json-toolbar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 12px;
}

.json-error-badge {
	color: var(--el-color-danger);
	font-size: 11px;
}

.code-input :deep(textarea) {
	font-family: Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
	font-size: 12px;
}

/* Group Field */
.group-field-box {
	width: 100%;
	border: 1px solid var(--border-color);
	border-radius: 8px;
	padding: 12px;
	background: rgba(0, 0, 0, 0.02);
}

.group-header {
	display: flex;
	align-items: center;
	gap: 6px;
	font-weight: 600;
	font-size: 13px;
	margin-bottom: 12px;
	color: var(--text-primary);
}

/* Repeater Field */
.repeater-field-container {
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.repeater-items-list {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.repeater-item-card {
	border: 1px solid var(--border-color);
	border-radius: 8px;
	background: var(--bg-surface);
	overflow: hidden;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.repeater-item-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 8px 12px;
	background: rgba(0, 0, 0, 0.03);
	border-bottom: 1px solid var(--border-color);
}

.repeater-item-title {
	display: flex;
	align-items: center;
	gap: 8px;
}

.item-badge {
	font-size: 10px;
	font-weight: 700;
	background: #6366f1;
	color: #fff;
	padding: 2px 6px;
	border-radius: 10px;
}

.item-label {
	font-size: 12px;
	color: var(--text-primary);
}

.repeater-item-actions {
	display: flex;
	gap: 4px;
}

.repeater-item-body {
	padding: 12px;
}

.repeater-empty {
	text-align: center;
	padding: 16px;
	color: var(--text-muted);
	font-size: 12px;
	border: 1px dashed var(--border-color);
	border-radius: 6px;
}

.repeater-add-btn {
	width: 100%;
}

:deep(.el-form-item__label) {
	font-weight: 600;
	color: var(--text-primary);
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
	box-shadow: 0 0 0 1px var(--border-color) inset !important;
	background-color: var(--bg-surface) !important;
}

:deep(.el-input__inner),
:deep(.el-textarea__inner) {
	color: var(--text-primary) !important;
}

/* Stage 1.8: Translation & Substitution Styles */
.text-input-i18n-wrapper {
	display: flex;
	flex-direction: column;
	width: 100%;
	gap: 6px;
}

.translation-key-pill {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 2px 8px;
	border-radius: 4px;
	background: rgba(99, 102, 241, 0.1);
	border: 1px solid rgba(99, 102, 241, 0.25);
	align-self: flex-start;
	font-size: 11px;
}

.pill-badge {
	font-weight: 700;
	color: #6366f1;
	letter-spacing: 0.5px;
}

.pill-code {
	font-family: monospace;
	color: #4338ca;
	background: rgba(99, 102, 241, 0.15);
	padding: 1px 4px;
	border-radius: 3px;
}

.pill-action-btn {
	border: none;
	background: transparent;
	color: #6366f1;
	cursor: pointer;
	padding: 0 2px;
	font-size: 12px;
	line-height: 1;

	&:hover {
		color: #ef4444;
	}
}

.field-i18n-tools {
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 8px;
	padding: 4px 2px;
	font-size: 11px;
}

.i18n-tool-btn {
	display: inline-flex;
	align-items: center;
	gap: 4px;
	padding: 2px 8px;
	border-radius: 4px;
	border: 1px solid var(--border-color);
	background: var(--bg-card, #f8fafc);
	color: var(--text-muted);
	font-size: 11px;
	cursor: pointer;
	transition: all 0.2s;

	&:hover {
		color: var(--text-main);
		border-color: #6366f1;
	}

	&.is-active {
		background: #6366f1;
		color: #fff;
		border-color: #6366f1;
	}
}

.substitutions-inline {
	display: flex;
	align-items: center;
	gap: 4px;
	flex-wrap: wrap;
}

.sub-label {
	color: var(--text-muted);
	font-size: 10px;
}

.sub-tag-btn {
	border: 1px dashed var(--border-color);
	background: transparent;
	color: var(--text-muted);
	border-radius: 3px;
	padding: 1px 5px;
	font-size: 10px;
	font-family: monospace;
	cursor: pointer;
	transition: all 0.15s;

	&:hover {
		color: #6366f1;
		border-color: #6366f1;
		background: rgba(99, 102, 241, 0.08);
	}
}
</style>
