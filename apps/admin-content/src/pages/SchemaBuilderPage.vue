<template>
	<div class="schema-builder-page" :class="{ 'is-dark': isDark }">
		<!-- ── Schemas list view ── -->
		<div v-if="!builderOpen" class="schemas-view">
			<div class="page-header">
				<div class="page-header__left">
					<h1>Content Schemas</h1>
					<p class="page-subtitle">Define the structure of your content collections</p>
				</div>
				<div class="page-header__actions">
					<el-button :icon="MagicStick" plain type="warning" :loading="isSeedingAbout" @click="seedAboutPage">
						✨ Шаблон «О платформе»
					</el-button>
					<el-button :icon="Notebook" plain @click="goToDocs">
						Документация подхода
					</el-button>
					<el-button :icon="Plus" type="primary" @click="handleAddSchema">
						Create Schema
					</el-button>
				</div>
			</div>

			<div class="page-content">
				<div v-if="loading" class="loading-grid">
					<div v-for="i in 4" :key="i" class="schema-skeleton">
						<el-skeleton animated :rows="2" />
					</div>
				</div>

				<div v-else-if="schemas.length === 0" class="empty-state">
					<div class="empty-state__icon">🗂️</div>
					<h3>No schemas yet</h3>
					<p>Create your first content schema to start building structured content</p>
					<el-button :icon="Plus" type="primary" @click="handleAddSchema">Create Schema</el-button>
				</div>

				<div v-else class="schemas-grid">
					<div
						v-for="schema in schemas"
						:key="schema.id"
						class="schema-card"
						@click="handleEditSchema(schema)"
					>
						<div class="schema-card__header">
							<div class="schema-card__icon">
								<span>{{ schema.isSingleton ? '📄' : '📚' }}</span>
							</div>
							<div class="schema-card__badges">
								<el-tag v-if="schema.isSingleton" size="small" type="warning">Singleton</el-tag>
							</div>
						</div>
						<div class="schema-card__body">
							<h3 class="schema-card__name">{{ schema.name }}</h3>
							<code class="schema-card__slug">{{ schema.slug }}</code>
						</div>
						<div class="schema-card__footer">
							<span class="schema-card__fields">
								<strong>{{ schema.fields?.length || 0 }}</strong> field{{ schema.fields?.length !== 1 ? 's' : '' }}
							</span>
							<div class="schema-card__actions" @click.stop>
								<el-button :icon="Document" plain size="small" type="success" @click="goToEntries(schema.slug)">
									Entries
								</el-button>
								<el-button :icon="Edit" plain size="small" @click="handleEditSchema(schema)">Edit</el-button>
								<el-button :icon="Delete" plain size="small" type="danger" @click="deleteSchema(schema.id)">
									Delete
								</el-button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- ── Schema Builder (split layout) ── -->
		<div v-else class="builder-layout">
			<!-- Builder Header -->
			<div class="builder-header">
				<div class="builder-header__left">
					<button class="back-btn" @click="closeBuilder">
						<svg fill="none" height="16" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
							<path d="M19 12H5M12 5l-7 7 7 7" />
						</svg>
						Back
					</button>
					<div class="builder-header__meta">
						<div class="meta-inputs">
							<input
								v-model="form.name"
								class="meta-input meta-input--name"
								placeholder="Schema name…"
								@input="onNameInput"
							/>
							<div class="meta-slug">
								<span class="meta-slug__prefix">/</span>
								<input
									v-model="form.slug"
									class="meta-input meta-input--slug"
									placeholder="slug"
									@input="slugTouched = true"
								/>
							</div>
						</div>
						<label class="singleton-toggle">
							<el-switch v-model="form.isSingleton" size="small" />
							<span>Singleton</span>
						</label>
					</div>
				</div>
				<div class="builder-header__right">
					<span v-if="validationErrors.length > 0" class="validation-summary">
						{{ validationErrors.length }} error{{ validationErrors.length > 1 ? 's' : '' }}
					</span>
					<el-button @click="closeBuilder">Cancel</el-button>
					<el-button
						:disabled="isLockedByOther || validationErrors.length > 0 || !form.name || !form.slug"
						:loading="saving"
						type="primary"
						@click="saveSchema"
					>
						{{ isEdit ? 'Update Schema' : 'Save Schema' }}
					</el-button>
				</div>
			</div>

			<!-- Entity Soft Lock Warning Banner -->
			<div v-if="isLockedByOther" class="lock-banner">
				<div class="lock-banner__content">
					<span class="lock-banner__icon">⚠️</span>
					<span class="lock-banner__text">
						<strong>Режим только для чтения:</strong> Схему сейчас редактирует <u>{{ lockedByName || 'другой администратор' }}</u>.
						Одновременное редактирование заблокировано через Redis во избежание конфликтов.
					</span>
				</div>
				<el-button size="small" type="warning" plain @click="forceUnlock">
					Принудительно разблокировать
				</el-button>
			</div>

			<!-- Builder Body: palette | canvas | config -->
			<div class="builder-body">
				<!-- Left: Field Type Palette -->
				<aside class="palette">
					<div class="palette__title">Field Types</div>
					<div class="palette__list">
						<button
							v-for="ft in fieldTypePalette"
							:key="ft.value"
							class="palette-item"
							:title="ft.description"
							@click="addFieldOfType(ft.value)"
						>
							<span class="palette-item__icon">{{ ft.icon }}</span>
							<div class="palette-item__info">
								<span class="palette-item__label">{{ ft.label }}</span>
								<span class="palette-item__desc">{{ ft.description }}</span>
							</div>
							<svg class="palette-item__add" fill="none" height="14" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" viewBox="0 0 24 24" width="14" xmlns="http://www.w3.org/2000/svg">
								<path d="M12 5v14M5 12h14" />
							</svg>
						</button>
					</div>
				</aside>

				<!-- Center: Fields Canvas -->
				<main class="canvas" @dragover.prevent @drop="onCanvasDrop">
					<div v-if="form.fields.length === 0" class="canvas-empty" @dragover.prevent @drop="onCanvasDrop">
						<div class="canvas-empty__icon">🎯</div>
						<p class="canvas-empty__title">No fields yet</p>
						<p class="canvas-empty__hint">Click a field type from the left panel to add it</p>
					</div>

					<transition-group v-else class="fields-list" name="field-list" tag="div">
						<div
							v-for="(field, index) in form.fields"
							:key="field._id"
							:class="[
								'field-card',
								{ 'is-selected': selectedFieldId === field._id },
								{ 'is-dragging': draggingId === field._id },
								{ 'is-drag-over': dragOverIndex === index && draggingId !== field._id },
								{ 'has-error': fieldHasError(field.name) },
							]"
							draggable="true"
							@click="selectField(field._id)"
							@dragend="onDragEnd"
							@dragenter.prevent="onDragEnter(index)"
							@dragleave="onDragLeave"
							@dragover.prevent
							@dragstart="onDragStart($event, index, field._id)"
							@drop.stop="onFieldDrop(index)"
						>
							<!-- Drag handle -->
							<div class="field-card__handle" title="Drag to reorder">
								<svg fill="currentColor" height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
									<circle cx="9" cy="5" r="1.5" />
									<circle cx="15" cy="5" r="1.5" />
									<circle cx="9" cy="12" r="1.5" />
									<circle cx="15" cy="12" r="1.5" />
									<circle cx="9" cy="19" r="1.5" />
									<circle cx="15" cy="19" r="1.5" />
								</svg>
							</div>

							<!-- Field info -->
							<div class="field-card__icon">{{ getFieldTypeInfo(field.fieldType).icon }}</div>
							<div class="field-card__meta">
								<div class="field-card__label">
									<span v-if="field.label">{{ field.label }}</span><span v-else class="placeholder-text">Untitled field</span>
									<span v-if="field.required" class="required-badge" title="Required">*</span>
								</div>
								<div class="field-card__name">{{ field.name || '—' }}</div>
							</div>

							<!-- Type badge -->
							<el-tag
								class="field-card__type"
								:color="getFieldTypeInfo(field.fieldType).color + '22'"
								size="small"
								:style="{ color: getFieldTypeInfo(field.fieldType).color, borderColor: getFieldTypeInfo(field.fieldType).color + '44' }"
							>
								{{ getFieldTypeInfo(field.fieldType).label }}
							</el-tag>

							<!-- Actions -->
							<div class="field-card__actions" @click.stop>
								<button
									class="field-action-btn field-action-btn--delete"
									title="Delete field"
									@click="removeField(field._id)"
								>
									<svg fill="none" height="13" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="13" xmlns="http://www.w3.org/2000/svg">
										<polyline points="3 6 5 6 21 6" />
										<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
										<path d="M10 11v6M14 11v6" />
										<path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
									</svg>
								</button>
							</div>

							<!-- Error hint -->
							<div v-if="fieldHasError(field.name)" class="field-error-indicator" />
						</div>
					</transition-group>
				</main>

				<!-- Right: Field Config Panel -->
				<aside class="config-panel">
					<div v-if="!selectedField" class="config-panel__empty">
						<div class="config-panel__empty-icon">⚙️</div>
						<p>Select a field to configure it</p>
					</div>

					<div v-else class="config-form">
						<div class="config-form__header">
							<span class="config-form__type-icon">{{ getFieldTypeInfo(selectedField.fieldType).icon }}</span>
							<span class="config-form__type-label">{{ getFieldTypeInfo(selectedField.fieldType).label }} Field</span>
						</div>

						<div class="config-field">
							<label class="config-label">Label <span class="required-star">*</span></label>
							<input
								v-model="selectedField.label"
								class="config-input"
								:class="{ 'has-error': !selectedField.label }"
								placeholder="e.g. Title"
								@input="onFieldLabelInput"
							/>
							<div v-if="!selectedField.label" class="config-error">Label is required</div>
						</div>

						<div class="config-field">
							<label class="config-label">Identifier (name) <span class="required-star">*</span></label>
							<input
								v-model="selectedField.name"
								class="config-input config-input--mono"
								:class="{ 'has-error': getFieldNameError(selectedField.name) }"
								placeholder="e.g. title"
								@input="selectedField._nameTouched = true"
							/>
							<div v-if="getFieldNameError(selectedField.name)" class="config-error">
								{{ getFieldNameError(selectedField.name) }}
							</div>
							<div v-else class="config-hint">Used as data key. Lowercase letters, digits and hyphens only.</div>
						</div>

						<div class="config-field">
							<label class="config-label">Type</label>
							<el-select v-model="selectedField.fieldType" size="default" style="width: 100%">
								<el-option
									v-for="ft in fieldTypePalette"
									:key="ft.value"
									:label="`${ft.icon}  ${ft.label}`"
									:value="ft.value"
								/>
							</el-select>
						</div>

						<div class="config-field">
							<label class="config-toggle">
								<el-switch v-model="selectedField.required" size="small" />
								<span>Required field</span>
							</label>
						</div>

						<!-- Relation-specific options -->
						<template v-if="selectedField.fieldType === FieldType.Relation">
							<div class="config-divider">Relation Options</div>
							<div class="config-field">
								<label class="config-label">Relation To (Schema slug) <span class="required-star">*</span></label>
								<input
									v-model="selectedField.relationTo"
									class="config-input config-input--mono"
									placeholder="e.g. products"
								/>
								<div class="config-hint">The slug of the target schema</div>
							</div>
							<div class="config-field">
								<label class="config-toggle">
									<el-switch v-model="selectedField.multiple" size="small" />
									<span>Allow multiple</span>
								</label>
							</div>
						</template>

						<!-- Default value (text/number) -->
						<template v-if="selectedField.fieldType === FieldType.Text || selectedField.fieldType === FieldType.RichText">
							<div class="config-divider">Advanced</div>
							<div class="config-field">
								<label class="config-label">Default Value</label>
								<input
									v-model="selectedField.defaultValue"
									class="config-input"
									placeholder="Optional default value"
								/>
							</div>
						</template>

						<template v-if="selectedField.fieldType === FieldType.Number">
							<div class="config-divider">Advanced</div>
							<div class="config-field">
								<label class="config-label">Default Value</label>
								<input
									v-model.number="selectedField.defaultValue"
									class="config-input"
									placeholder="0"
									type="number"
								/>
							</div>
						</template>
					</div>
				</aside>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import type { ContentSchema, FieldDefinition } from '@admin-panel/lib'
import { createApi, FieldType, useEntityLock } from '@admin-panel/lib'
import { useTheme } from '@admin-panel/ui'
import { Delete, Document, Edit, MagicStick, Notebook, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { contentApi } from '#entities/content'

// ── Types ──────────────────────────────────────────────────────────────────
interface FieldWithMeta extends FieldDefinition {
	_id: string
	_nameTouched?: boolean
}

interface FieldTypeInfo {
	value: FieldType
	label: string
	icon: string
	description: string
	color: string
}

// ── Setup ──────────────────────────────────────────────────────────────────
const router = useRouter()
const { fetchData: apiFetch } = createApi('content/schemas')
const { isDark } = useTheme()

// ── Schema list state ──────────────────────────────────────────────────────
const schemas = ref<ContentSchema[]>([])
const loading = ref(false)
const saving = ref(false)
const builderOpen = ref(false)
const isEdit = ref(false)
const currentSchemaId = ref('')
const slugTouched = ref(false)

const lockEntityId = computed(() => (builderOpen.value && isEdit.value ? currentSchemaId.value : ''))
const { isLocked, isLockedByOther, lockedByName, forceUnlock } = useEntityLock('schema', lockEntityId)

// ── Field palette config ───────────────────────────────────────────────────
const fieldTypePalette: FieldTypeInfo[] = [
	{ value: FieldType.Text, label: 'Text', icon: '📝', description: 'Short text, single line', color: '#6366f1' },
	{ value: FieldType.RichText, label: 'Rich Text', icon: '📄', description: 'Formatted content (Tiptap editor)', color: '#8b5cf6' },
	{ value: FieldType.Number, label: 'Number', icon: '🔢', description: 'Integer or decimal number', color: '#0ea5e9' },
	{ value: FieldType.Boolean, label: 'Boolean', icon: '☑️', description: 'True / false toggle', color: '#10b981' },
	{ value: FieldType.Date, label: 'Date', icon: '📅', description: 'Date or datetime picker', color: '#f59e0b' },
	{ value: FieldType.Media, label: 'Media', icon: '🖼️', description: 'Image, video or file reference', color: '#ef4444' },
	{ value: FieldType.Relation, label: 'Relation', icon: '🔗', description: 'Link to another schema', color: '#f97316' },
]

const getFieldTypeInfo = (type: FieldType): FieldTypeInfo =>
	fieldTypePalette.find((f) => f.value === type) ?? fieldTypePalette[0]

// ── Form state ─────────────────────────────────────────────────────────────
const form = reactive({
	name: '',
	slug: '',
	isSingleton: false,
	fields: [] as FieldWithMeta[],
})

// ── Selection / DnD state ─────────────────────────────────────────────────
const selectedFieldId = ref<string | null>(null)
const draggingIndex = ref<number | null>(null)
const draggingId = ref<string | null>(null)
const dragOverIndex = ref<number | null>(null)

const selectedField = computed(() =>
	selectedFieldId.value ? form.fields.find((f) => f._id === selectedFieldId.value) ?? null : null
)

// ── Unique ID helper ───────────────────────────────────────────────────────
let _uid = 0
const uid = () => `f_${++_uid}_${Date.now()}`

// ── Slug generation ────────────────────────────────────────────────────────
const toSlug = (s: string) =>
	s
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')

const onNameInput = () => {
	if (!slugTouched.value) {
		form.slug = toSlug(form.name)
	}
}

// ── Validation ─────────────────────────────────────────────────────────────
const NAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9_-]*$/

const getFieldNameError = (name: string): string | null => {
	if (!name) return 'Identifier is required'
	if (!NAME_PATTERN.test(name)) return 'Only letters, digits, underscores and hyphens'
	const dupes = form.fields.filter((f) => f.name === name)
	if (dupes.length > 1) return 'Identifier must be unique'
	return null
}

const fieldHasError = (name: string) => !!getFieldNameError(name) || !name

const validationErrors = computed(() => {
	const errors: string[] = []
	if (!form.name) errors.push('Schema name is required')
	if (!form.slug) errors.push('Schema slug is required')
	form.fields.forEach((f, i) => {
		const err = getFieldNameError(f.name)
		if (!f.label) errors.push(`Field #${i + 1}: label required`)
		if (err) errors.push(`Field "${f.label || `#${i + 1}`}": ${err}`)
	})
	return errors
})

// ── Field label → name auto-slug ───────────────────────────────────────────
const onFieldLabelInput = () => {
	if (!selectedField.value) return
	if (!selectedField.value._nameTouched) {
		selectedField.value.name = toSlug(selectedField.value.label).replace(/-/g, '_')
	}
}

// ── Field operations ───────────────────────────────────────────────────────
const addFieldOfType = (type: FieldType) => {
	const id = uid()
	form.fields.push({
		_id: id,
		label: '',
		name: '',
		fieldType: type,
		required: false,
		multiple: false,
		_nameTouched: false,
	})
	selectedFieldId.value = id
}

const removeField = (id: string) => {
	const idx = form.fields.findIndex((f) => f._id === id)
	if (idx !== -1) {
		form.fields.splice(idx, 1)
		if (selectedFieldId.value === id) {
			selectedFieldId.value = form.fields[Math.min(idx, form.fields.length - 1)]?._id ?? null
		}
	}
}

const selectField = (id: string) => {
	selectedFieldId.value = id
}

// ── Drag-and-drop ─────────────────────────────────────────────────────────
const onDragStart = (_e: DragEvent, index: number, id: string) => {
	draggingIndex.value = index
	draggingId.value = id
}

const onDragEnter = (index: number) => {
	dragOverIndex.value = index
}

const onDragLeave = () => {
	// Let dragenter on the next card handle it
}

const onFieldDrop = (targetIndex: number) => {
	if (draggingIndex.value === null || draggingIndex.value === targetIndex) {
		draggingIndex.value = null
		draggingId.value = null
		dragOverIndex.value = null
		return
	}
	const item = form.fields.splice(draggingIndex.value, 1)[0]
	form.fields.splice(targetIndex, 0, item)
	draggingIndex.value = null
	draggingId.value = null
	dragOverIndex.value = null
}

const onCanvasDrop = () => {
	// Drop on empty canvas — nothing to do if there are no fields
	draggingIndex.value = null
	draggingId.value = null
	dragOverIndex.value = null
}

const onDragEnd = () => {
	draggingIndex.value = null
	draggingId.value = null
	dragOverIndex.value = null
}

// ── Open / Close builder ───────────────────────────────────────────────────
const openBuilder = () => {
	builderOpen.value = true
	selectedFieldId.value = null
	slugTouched.value = false
}

const closeBuilder = () => {
	builderOpen.value = false
}

const handleAddSchema = () => {
	isEdit.value = false
	currentSchemaId.value = ''
	form.name = ''
	form.slug = ''
	form.isSingleton = false
	form.fields = []
	openBuilder()
}

const handleEditSchema = (schema: ContentSchema) => {
	isEdit.value = true
	currentSchemaId.value = schema.id
	form.name = schema.name
	form.slug = schema.slug
	form.isSingleton = !!schema.isSingleton
	// Map existing fields to FieldWithMeta
	form.fields = JSON.parse(JSON.stringify(schema.fields)).map((f: FieldDefinition) => ({
		...f,
		_id: uid(),
		_nameTouched: true,
	}))
	slugTouched.value = true
	openBuilder()
}

// ── Schema CRUD ────────────────────────────────────────────────────────────
const fetchSchemas = async () => {
	loading.value = true
	try {
		const response = await apiFetch<ContentSchema[]>('')
		if (response.data) schemas.value = response.data
	} catch {
		ElMessage.error('Failed to fetch schemas')
	} finally {
		loading.value = false
	}
}

const saveSchema = async () => {
	saving.value = true
	try {
		// Strip internal _id/_nameTouched meta before sending
		const payload = {
			...form,
			fields: form.fields.map(({ _id: _, _nameTouched: __, ...rest }) => rest),
		}
		if (isEdit.value) {
			await apiFetch(`/${currentSchemaId.value}`, { method: 'PATCH', body: payload })
			ElMessage.success('Schema updated')
		} else {
			await apiFetch('', { method: 'POST', body: payload })
			ElMessage.success('Schema created')
		}
		closeBuilder()
		fetchSchemas()
	} catch (error: any) {
		ElMessage.error(error.messages?.[0] || 'Failed to save schema')
	} finally {
		saving.value = false
	}
}

const deleteSchema = async (id: string) => {
	try {
		await ElMessageBox.confirm('Permanently delete this schema and ALL its entries?', 'Warning', {
			confirmButtonText: 'Delete',
			cancelButtonText: 'Cancel',
			type: 'warning',
		})
		await apiFetch(`/${id}`, { method: 'DELETE' })
		ElMessage.success('Schema deleted')
		fetchSchemas()
	} catch (error) {
		if (error !== 'cancel') ElMessage.error('Delete failed')
	}
}

const goToEntries = (slug: string) => {
	router.push({ name: 'EntriesList', params: { schemaIdentifier: slug } })
}

const goToDocs = () => {
	try {
		router.push({ name: 'ContentDocs' })
	} catch {
		router.push('/docs')
	}
}

const isSeedingAbout = ref(false)

const seedAboutPage = async () => {
	isSeedingAbout.value = true
	try {
		let targetSchema = schemas.value.find((s) => s.slug === 'page_about')
		if (!targetSchema) {
			try {
				const res = await contentApi.getSchemaByIdentifier('page_about')
				if (res.data) targetSchema = res.data
			} catch {
				// not found, proceed to create
			}
		}
		if (!targetSchema) {
			const res = await apiFetch<ContentSchema>('', {
				method: 'POST',
				body: {
					name: 'Страница: О платформе',
					slug: 'page_about',
					is_singleton: true,
					fields: [
						{ name: 'city', label: 'Город по умолчанию', field_type: FieldType.Text, required: false },
						{ name: 'hero_title', label: 'Главный заголовок (Hero Title)', field_type: FieldType.Text, required: true },
						{ name: 'hero_subtitle', label: 'Подзаголовок Hero (многострочный)', field_type: FieldType.Text, required: false },
						{ name: 'guest_title', label: 'Название карточки 1 (Guest)', field_type: FieldType.Text, required: true },
						{ name: 'guest_features', label: 'Пункты возможностей Guest (через новую строку)', field_type: FieldType.Text, required: false },
						{ name: 'guest_button_text', label: 'Текст кнопки Guest', field_type: FieldType.Text, required: false },
						{ name: 'place_title', label: 'Название карточки 2 (Place)', field_type: FieldType.Text, required: true },
						{ name: 'place_features', label: 'Пункты возможностей Place (через новую строку)', field_type: FieldType.Text, required: false },
						{ name: 'place_button_text', label: 'Текст кнопки Place', field_type: FieldType.Text, required: false },
						{ name: 'quote_title', label: 'Заголовок блока цитаты / ценностей', field_type: FieldType.Text, required: false },
						{ name: 'quote_description', label: 'Текст блока ценностей', field_type: FieldType.Text, required: false },
						{ name: 'quote_val_1', label: 'Ценность 1 (Технологии)', field_type: FieldType.Text, required: false },
						{ name: 'quote_val_2', label: 'Ценность 2 (Ожидания)', field_type: FieldType.Text, required: false },
						{ name: 'mission_title_accent', label: 'Акцентное слово Миссии (МИССИЯ)', field_type: FieldType.Text, required: false },
						{ name: 'mission_text', label: 'Текст Миссии (RichText / HTML)', field_type: FieldType.RichText, required: false },
						{ name: 'mission_image', label: 'URL изображения Миссии', field_type: FieldType.Text, required: false },
						{ name: 'history_title_accent', label: 'Акцентное слово Истории (СОЗДАНИЯ)', field_type: FieldType.Text, required: false },
						{ name: 'history_text', label: 'Текст Истории создания', field_type: FieldType.RichText, required: false },
						{ name: 'history_image', label: 'URL изображения Истории', field_type: FieldType.Text, required: false },
					],
				},
			})
			targetSchema = res.data
			ElMessage.success('Схема «page_about» создана!')
			await fetchSchemas()
		}

		if (targetSchema) {
			const entriesRes = await contentApi.getEntries(targetSchema.id)
			let entry = entriesRes.data?.[0]
			if (!entry) {
				const createEntryRes = await contentApi.createEntry({
					schema_id: targetSchema.id,
					slug: 'about-main-entry',
					status: 'published',
					data: {
						city: 'Москва',
						hero_title: 'О платформе Guest & Place',
						hero_subtitle: 'Платформа, позволяющая общаться напрямую!\nПомогаем каждому Гостю найти “свое” место.\nМы за «прозрачные отношения»!',
						guest_title: 'Guest',
						guest_features: 'Прямая связь с площадкой в режиме реального времени\nАктуальная информация, меню, цены, свободные даты\nПрямое онлайн бронирование и оплата\nЗаказ столика, банкета, доставка еды, аренда помещения под мероприятия — все в одном месте\nОнлайн просмотр\nОбщение в чатах, видео-встречи, консультации менеджеров площадок\nЛичный кабинет и вся информация в одном месте',
						guest_button_text: 'Зарегистрироваться',
						place_title: 'Place',
						place_features: 'Чаты, видео-встречи\nОнлайн-показ площадки\nПрямые трансляции, новости, лента событий\nПрямое онлайн-бронирование и оплата\nКалендарь бронирования в режиме реального времени\nПростое приложение в системе Учета (все в одном месте)',
						place_button_text: 'Добавить место',
						quote_title: ' - проект от души :)',
						quote_description: 'Лидерство на рынке обеспечивается нашей талантливой командой, экспертами своего дела',
						quote_val_1: 'постоянный поиск новых решений и внедрение новых технологий',
						quote_val_2: 'мы хотим превзойти ожидания пользователей и свои тоже :)',
						mission_title_accent: 'МИССИЯ',
						mission_text: '<p>Соединяем гостей (людей) и места, создавая простоту и прозрачность в “отношениях”. Предоставляем самые современные технологии и инструменты для простого и легкого общения.</p><p>Наши эксперты помогают Гостям найти <strong><span style="color:#0066CC">«то самое»</span></strong> место.</p>',
						mission_image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80',
						history_title_accent: 'СОЗДАНИЯ',
						history_text: '<p>Соединяем гостей (людей) и места, создавая простоту и прозрачность в “отношениях”. Предоставляем самые современные технологии и инструменты для простого и легкого общения.</p><p>Наши эксперты помогают Гостям найти <strong><span style="color:#0066CC">“то самое”</span></strong> место.</p>',
						history_image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop&q=80',
					},
				})
				entry = createEntryRes.data
				ElMessage.success('Начальный контент страницы «О платформе» успешно создан!')
			}

			if (entry?.id) {
				router.push({
					name: 'EntryEdit',
					params: { schemaIdentifier: 'page_about', id: entry.id },
				})
			} else {
				goToEntries('page_about')
			}
		}
	} catch (err: any) {
		console.error('Failed to seed about page:', err)
		ElMessage.error(err.messages?.[0] || 'Не удалось инициализировать страницу')
	} finally {
		isSeedingAbout.value = false
	}
}

onMounted(fetchSchemas)
</script>

<style scoped>
/* ── Page wrapper ─────────────────────────────────────────────────────────── */
.schema-builder-page {
	min-height: 100vh;
	color: var(--gp-text-main);
	background-color: transparent;
}

/* ── Schemas list view ────────────────────────────────────────────────────── */
.schemas-view {
	padding: 32px;
}

.page-header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	margin-bottom: 32px;
}

.page-header__actions {
	display: flex;
	align-items: center;
	gap: 12px;
}

.page-header h1 {
	margin: 0 0 4px;
	font-weight: 800;
	font-size: 2rem;
	letter-spacing: -0.02em;
	color: var(--gp-text-main);
}

.page-subtitle {
	margin: 0;
	font-size: 14px;
	color: var(--gp-text-secondary);
}

/* ── Schema grid cards ────────────────────────────────────────────────────── */
.schemas-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 20px;
}

.schema-card {
	display: flex;
	flex-direction: column;
	gap: 16px;
	border: 1px solid var(--gp-glass-border-inner);
	border-radius: var(--gp-radius-md);
	background: var(--gp-bg-glass);
	padding: 20px;
	cursor: pointer;
	transition:
		border-color 0.2s ease,
		box-shadow 0.2s ease,
		transform 0.15s ease;
}

.schema-card:hover {
	border-color: var(--gp-primary-light);
	box-shadow: var(--gp-glass-shadow);
	transform: translateY(-2px);
}

.schema-card__header {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.schema-card__icon {
	font-size: 28px;
	line-height: 1;
}

.schema-card__body {
	flex: 1;
}

.schema-card__name {
	margin: 0 0 6px;
	font-size: 16px;
	font-weight: 700;
	color: var(--gp-text-main);
}

.schema-card__slug {
	font-family: 'JetBrains Mono', monospace;
	font-size: 12px;
	color: var(--gp-text-secondary);
	background: var(--gp-bg-glass-hover);
	padding: 2px 8px;
	border-radius: 4px;
}

.schema-card__footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-top: 1px solid var(--gp-glass-border);
	padding-top: 14px;
}

.schema-card__fields {
	font-size: 13px;
	color: var(--gp-text-secondary);
}

.schema-card__actions {
	display: flex;
	gap: 6px;
	opacity: 0;
	transition: opacity 0.2s ease;
}

.schema-card:hover .schema-card__actions {
	opacity: 1;
}

/* ── Skeleton / empty states ─────────────────────────────────────────────── */
.loading-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 20px;
}

.schema-skeleton {
	border: 1px solid var(--gp-glass-border);
	border-radius: var(--gp-radius-md);
	padding: 20px;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	text-align: center;
	padding: 80px 40px;
	border: 2px dashed var(--gp-glass-border);
	border-radius: var(--gp-radius-lg);
	gap: 12px;
}

.empty-state__icon {
	font-size: 48px;
	line-height: 1;
}

.empty-state h3 {
	margin: 0;
	font-size: 20px;
	font-weight: 700;
	color: var(--gp-text-main);
}

.empty-state p {
	margin: 0;
	color: var(--gp-text-secondary);
	font-size: 14px;
}

/* ── Builder layout ─────────────────────────────────────────────────────── */
.builder-layout {
	display: flex;
	flex-direction: column;
	height: 100vh;
	overflow: hidden;
}

/* Builder header */
.builder-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-shrink: 0;
	padding: 12px 24px;
	border-bottom: 1px solid var(--gp-glass-border);
	background: var(--gp-bg-glass);
	backdrop-filter: blur(12px);
	gap: 16px;
	z-index: 10;
}

.builder-header__left {
	display: flex;
	align-items: center;
	gap: 20px;
	min-width: 0;
	flex: 1;
}

.builder-header__right {
	display: flex;
	align-items: center;
	gap: 10px;
	flex-shrink: 0;
}

.back-btn {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 6px 12px;
	border: 1px solid var(--gp-glass-border);
	border-radius: 8px;
	background: transparent;
	color: var(--gp-text-secondary);
	font-size: 13px;
	font-weight: 500;
	cursor: pointer;
	white-space: nowrap;
	transition:
		background 0.15s,
		color 0.15s;

	&:hover {
		background: var(--gp-bg-glass-hover);
		color: var(--gp-text-main);
	}
}

.meta-inputs {
	display: flex;
	align-items: center;
	gap: 12px;
	flex: 1;
	min-width: 0;
}

.meta-input {
	border: 1px solid transparent;
	border-radius: 8px;
	background: transparent;
	color: var(--gp-text-main);
	padding: 6px 10px;
	font-family: inherit;
	outline: none;
	transition:
		border-color 0.15s,
		background 0.15s;

	&:hover,
	&:focus {
		border-color: var(--gp-glass-border);
		background: var(--gp-bg-glass-hover);
	}
}

.meta-input--name {
	font-size: 16px;
	font-weight: 700;
	width: 220px;
}

.meta-slug {
	display: flex;
	align-items: center;
	gap: 2px;
}

.meta-slug__prefix {
	font-size: 14px;
	color: var(--gp-text-secondary);
	font-weight: 600;
}

.meta-input--slug {
	font-size: 13px;
	font-family: 'JetBrains Mono', monospace;
	color: var(--gp-text-secondary);
	width: 160px;
}

.singleton-toggle {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 13px;
	color: var(--gp-text-secondary);
	cursor: pointer;
	white-space: nowrap;
}

.validation-summary {
	font-size: 12px;
	color: var(--el-color-danger);
	font-weight: 600;
}

/* Builder body */
.builder-body {
	display: grid;
	grid-template-columns: 220px 1fr 280px;
	flex: 1;
	overflow: hidden;
	min-height: 0;
}

/* ── Palette ─────────────────────────────────────────────────────────────── */
.palette {
	display: flex;
	flex-direction: column;
	border-right: 1px solid var(--gp-glass-border);
	background: var(--gp-bg-glass);
	overflow-y: auto;
	padding: 16px 12px;
	gap: 4px;
}

.palette__title {
	font-size: 10px;
	font-weight: 800;
	letter-spacing: 0.1em;
	text-transform: uppercase;
	color: var(--gp-text-secondary);
	padding: 0 4px 12px;
}

.palette__list {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.palette-item {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 10px 10px;
	border: 1px solid transparent;
	border-radius: 10px;
	background: transparent;
	cursor: pointer;
	text-align: left;
	transition:
		background 0.15s,
		border-color 0.15s;

	&:hover {
		background: var(--gp-bg-glass-hover);
		border-color: var(--gp-glass-border);
	}

	&:hover .palette-item__add {
		opacity: 1;
	}
}

.palette-item__icon {
	font-size: 20px;
	line-height: 1;
	flex-shrink: 0;
}

.palette-item__info {
	display: flex;
	flex-direction: column;
	gap: 2px;
	min-width: 0;
	flex: 1;
}

.palette-item__label {
	font-size: 13px;
	font-weight: 600;
	color: var(--gp-text-main);
	line-height: 1.3;
}

.palette-item__desc {
	font-size: 10px;
	color: var(--gp-text-secondary);
	line-height: 1.3;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.palette-item__add {
	opacity: 0;
	color: var(--gp-text-secondary);
	flex-shrink: 0;
	transition: opacity 0.15s;
}

/* ── Canvas ──────────────────────────────────────────────────────────────── */
.canvas {
	overflow-y: auto;
	padding: 24px;
	background: transparent;
}

.canvas-empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 400px;
	border: 2px dashed var(--gp-glass-border);
	border-radius: 16px;
	text-align: center;
	gap: 10px;
	transition: border-color 0.2s;

	&:hover {
		border-color: var(--gp-primary-light);
	}
}

.canvas-empty__icon {
	font-size: 48px;
}

.canvas-empty__title {
	margin: 0;
	font-size: 16px;
	font-weight: 600;
	color: var(--gp-text-main);
}

.canvas-empty__hint {
	margin: 0;
	font-size: 13px;
	color: var(--gp-text-secondary);
}

/* Field list transition */
.field-list-enter-active,
.field-list-leave-active {
	transition:
		opacity 0.2s ease,
		transform 0.2s ease;
}

.field-list-enter-from {
	opacity: 0;
	transform: translateY(-8px);
}

.field-list-leave-to {
	opacity: 0;
	transform: translateX(10px);
}

.fields-list {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

/* Field card */
.field-card {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 12px 14px;
	border: 1.5px solid var(--gp-glass-border);
	border-radius: 12px;
	background: var(--gp-bg-glass);
	cursor: pointer;
	transition:
		border-color 0.15s,
		background 0.15s,
		box-shadow 0.15s,
		transform 0.1s;
	position: relative;
}

.field-card:hover {
	border-color: var(--gp-primary-light);
	background: var(--gp-bg-glass-hover);
	box-shadow: var(--gp-glass-shadow);
}

.field-card.is-selected {
	border-color: var(--gp-primary, #6366f1);
	background: var(--gp-bg-glass-hover);
	box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.field-card.is-dragging {
	opacity: 0.4;
	transform: scale(0.98);
}

.field-card.is-drag-over {
	border-color: var(--gp-primary, #6366f1);
	border-style: dashed;
}

.field-card.has-error {
	border-color: var(--el-color-danger);
}

.field-card__handle {
	color: var(--gp-text-secondary);
	cursor: grab;
	flex-shrink: 0;
	opacity: 0.5;
	transition: opacity 0.15s;

	&:hover {
		opacity: 1;
	}

	&:active {
		cursor: grabbing;
	}
}

.field-card__icon {
	font-size: 20px;
	flex-shrink: 0;
}

.field-card__meta {
	flex: 1;
	min-width: 0;
}

.field-card__label {
	font-size: 14px;
	font-weight: 600;
	color: var(--gp-text-main);
	display: flex;
	align-items: center;
	gap: 4px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.field-card__name {
	font-family: 'JetBrains Mono', monospace;
	font-size: 11px;
	color: var(--gp-text-secondary);
	margin-top: 2px;
}

.field-card__type {
	flex-shrink: 0;
}

.field-card__actions {
	display: flex;
	gap: 4px;
	flex-shrink: 0;
	opacity: 0;
	transition: opacity 0.15s;
}

.field-card:hover .field-card__actions {
	opacity: 1;
}

.field-action-btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 28px;
	height: 28px;
	border: none;
	border-radius: 6px;
	background: transparent;
	cursor: pointer;
	transition: background 0.15s;
}

.field-action-btn--delete {
	color: var(--el-color-danger);

	&:hover {
		background: rgba(239, 68, 68, 0.12);
	}
}

.required-badge {
	color: var(--el-color-danger);
	font-weight: 700;
}

.placeholder-text {
	color: var(--gp-text-secondary);
	font-style: italic;
	font-weight: 400;
}

.field-error-indicator {
	position: absolute;
	top: -3px;
	right: -3px;
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: var(--el-color-danger);
	border: 2px solid var(--gp-bg-glass);
}

/* ── Config panel ────────────────────────────────────────────────────────── */
.config-panel {
	border-left: 1px solid var(--gp-glass-border);
	background: var(--gp-bg-glass);
	overflow-y: auto;
	padding: 20px;
}

.config-panel__empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
	gap: 12px;
	text-align: center;
}

.config-panel__empty-icon {
	font-size: 36px;
}

.config-panel__empty p {
	font-size: 13px;
	color: var(--gp-text-secondary);
	margin: 0;
}

.config-form {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.config-form__header {
	display: flex;
	align-items: center;
	gap: 8px;
	padding-bottom: 16px;
	border-bottom: 1px solid var(--gp-glass-border);
	font-size: 13px;
	font-weight: 700;
	color: var(--gp-text-main);
}

.config-form__type-icon {
	font-size: 20px;
}

.config-field {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.config-label {
	font-size: 12px;
	font-weight: 600;
	color: var(--gp-text-secondary);
	letter-spacing: 0.03em;
}

.required-star {
	color: var(--el-color-danger);
}

.config-input {
	width: 100%;
	height: 34px;
	padding: 0 10px;
	border: 1px solid var(--gp-glass-border);
	border-radius: 8px;
	background: var(--gp-bg-glass-hover);
	color: var(--gp-text-main);
	font-size: 13px;
	font-family: inherit;
	outline: none;
	box-sizing: border-box;
	transition:
		border-color 0.15s,
		box-shadow 0.15s;

	&:focus {
		border-color: var(--gp-primary, #6366f1);
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
	}

	&.has-error {
		border-color: var(--el-color-danger);
	}
}

.config-input--mono {
	font-family: 'JetBrains Mono', monospace;
	font-size: 12px;
}

.config-error {
	font-size: 11px;
	color: var(--el-color-danger);
}

.config-hint {
	font-size: 11px;
	color: var(--gp-text-secondary);
	line-height: 1.4;
}

.config-toggle {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 13px;
	color: var(--gp-text-main);
	cursor: pointer;
}

.config-divider {
	font-size: 10px;
	font-weight: 800;
	letter-spacing: 0.1em;
	text-transform: uppercase;
	color: var(--gp-text-secondary);
	padding: 8px 0 0;
	border-top: 1px solid var(--gp-glass-border);
}

.lock-banner {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 10px 20px;
	background: rgba(245, 158, 11, 0.12);
	border-bottom: 1px solid rgba(245, 158, 11, 0.3);
	color: #f59e0b;
	font-size: 13px;
	z-index: 10;

	&__content {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	&__icon {
		font-size: 16px;
	}

	&__text {
		color: var(--gp-text-main, #f8fafc);
		strong {
			color: #f59e0b;
		}
		u {
			font-weight: 600;
			text-decoration-color: #f59e0b;
		}
	}
}
</style>
