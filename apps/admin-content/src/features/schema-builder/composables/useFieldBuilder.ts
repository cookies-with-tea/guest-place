import { computed, reactive, ref } from 'vue'
import { FieldType } from '@admin-panel/lib'
import { toSlug, uid } from '../lib/helpers'
import type { SchemaForm } from './useSchemaForm'

export interface FieldTypeInfo {
	value: FieldType
	label: string
	icon: string
	description: string
	color: string
}

export const FIELD_TYPE_PALETTE: FieldTypeInfo[] = [
	{ value: FieldType.Text, label: 'Text', icon: 'Document', description: 'Single line of text', color: '#6366f1' },
	{
		value: FieldType.RichText,
		label: 'Rich Text',
		icon: 'Reading',
		description: 'Formatted content',
		color: '#8b5cf6',
	},
	{ value: FieldType.Number, label: 'Number', icon: 'Sort', description: 'Integer or decimal', color: '#0ea5e9' },
	{ value: FieldType.Boolean, label: 'Boolean', icon: 'CircleCheck', description: 'True / false', color: '#10b981' },
	{ value: FieldType.Date, label: 'Date', icon: 'Calendar', description: 'Date or datetime', color: '#f59e0b' },
	{
		value: FieldType.Media,
		label: 'Media',
		icon: 'PictureFilled',
		description: 'Image, video or file',
		color: '#ef4444',
	},
	{
		value: FieldType.Relation,
		label: 'Relation',
		icon: 'Connection',
		description: 'Link to another schema',
		color: '#f97316',
	},
	{
		value: FieldType.Repeater,
		label: 'Repeater',
		icon: 'Collection',
		description: 'Repeated sub-fields',
		color: '#14b8a6',
	},
	{ value: FieldType.Group, label: 'Group', icon: 'Folder', description: 'Nested sub-fields', color: '#a855f7' },
	{ value: FieldType.Color, label: 'Color', icon: 'Brush', description: 'Hex/rgba color picker', color: '#ec4899' },
	{ value: FieldType.Link, label: 'Link', icon: 'Position', description: 'URL + text + target', color: '#3b82f6' },
	{ value: FieldType.Json, label: 'JSON', icon: 'Operation', description: 'Free-form JSON value', color: '#64748b' },
]

const NESTABLE_TYPES = [FieldType.Repeater, FieldType.Group]

const NAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9_-]*$/

interface PathEntry {
	id: string
	label: string
}

/** Owns the field canvas: selection, add/remove, drag-and-drop reordering, validation, and
 * drilling into a Repeater/Group field's own sub-fields (the canvas shows one "scope" of
 * fields at a time — top-level, or the sub-fields of whichever nestable field is on top of
 * `fieldPath`). */
export function useFieldBuilder(schemaForm: SchemaForm) {
	const selectedFieldId = ref<string | null>(null)
	const fieldPath = ref<PathEntry[]>([])
	const draggingIndex = ref<number | null>(null)
	const draggingId = ref<string | null>(null)
	const dragOverIndex = ref<number | null>(null)

	/** The field whose `.fields` array the canvas currently shows (undefined at top level).
	 * Assumes `drillInto` already ensured every ancestor on the path has a `.fields` array. */
	const scopeField = computed(() => {
		let list = schemaForm.form.fields
		let field: any

		for (const entry of fieldPath.value) {
			field = list.find((f: any) => f._id === entry.id)
			if (!field) break
			list = field.fields ?? []
		}

		return field
	})

	/** The list of fields the canvas/palette currently operate on. */
	const currentFields = computed<any[]>(() => scopeField.value?.fields ?? schemaForm.form.fields)

	const selectedField = computed(() => currentFields.value.find((f: any) => f._id === selectedFieldId.value) ?? null)

	function getFieldTypeInfo(type: FieldType): FieldTypeInfo {
		return FIELD_TYPE_PALETTE.find((f) => f.value === type) ?? FIELD_TYPE_PALETTE[0]
	}

	function isNestable(type: FieldType): boolean {
		return NESTABLE_TYPES.includes(type)
	}

	function getFieldNameError(name: string): string | null {
		if (!name) return 'Identifier is required'
		if (!NAME_PATTERN.test(name)) return 'Only letters, digits, underscores and hyphens'
		const dupes = currentFields.value.filter((f: any) => f.name === name)
		if (dupes.length > 1) return 'Identifier must be unique'
		return null
	}

	function fieldHasError(name: string): boolean {
		return !!getFieldNameError(name) || !name
	}

	function validateFields(fields: any[], path: string): string[] {
		const errors: string[] = []
		fields.forEach((f: any, i: number) => {
			const label = f.label || `#${i + 1}`
			if (!f.label) errors.push(`${path}Field #${i + 1}: label required`)
			if (!f.name) errors.push(`${path}Field "${label}": Identifier is required`)
			else if (!NAME_PATTERN.test(f.name)) errors.push(`${path}Field "${label}": invalid identifier`)
			if (f.fields?.length) errors.push(...validateFields(f.fields, `${path}${label} > `))
		})
		return errors
	}

	const validationErrors = computed(() => {
		const errors: string[] = []
		if (!schemaForm.form.name) errors.push('Schema name is required')
		if (!schemaForm.form.slug) errors.push('Schema slug is required')
		errors.push(...validateFields(schemaForm.form.fields, ''))
		return errors
	})

	function onFieldLabelInput() {
		if (!selectedField.value) return
		if (!selectedField.value._nameTouched) {
			selectedField.value.name = toSlug(selectedField.value.label).replace(/-/g, '_')
		}
	}

	function addFieldOfType(type: FieldType) {
		const id = uid()
		currentFields.value.push({
			_id: id,
			label: '',
			name: '',
			fieldType: type,
			required: false,
			multiple: false,
			_nameTouched: false,
			fields: isNestable(type) ? [] : undefined,
		})
		selectedFieldId.value = id
	}

	/** Inserts a ready-made set of fields (see `useFieldBlocks`) wrapped in one Group field. */
	function insertBlock(blockLabel: string, blockName: string, fields: any[]) {
		const id = uid()
		currentFields.value.push({
			_id: id,
			label: blockLabel,
			name: blockName,
			fieldType: FieldType.Group,
			required: false,
			multiple: false,
			_nameTouched: true,
			fields: fields.map((f) => ({ ...f, _id: uid(), _nameTouched: true })),
		})
		selectedFieldId.value = id
	}

	function removeField(id: string) {
		const list = currentFields.value
		const idx = list.findIndex((f: any) => f._id === id)
		if (idx !== -1) {
			list.splice(idx, 1)
			if (selectedFieldId.value === id) {
				selectedFieldId.value = list[Math.min(idx, list.length - 1)]?._id ?? null
			}
		}
	}

	function selectField(id: string) {
		selectedFieldId.value = id
	}

	function resetSelection() {
		selectedFieldId.value = null
		fieldPath.value = []
	}

	/** Enters a Repeater/Group field's own sub-fields; the canvas now shows/edits those. */
	function drillInto(id: string) {
		const field = currentFields.value.find((f: any) => f._id === id)
		if (!field || !isNestable(field.fieldType)) return
		field.fields ??= []
		fieldPath.value = [...fieldPath.value, { id, label: field.label || field.name || 'Untitled' }]
		selectedFieldId.value = null
	}

	/** Jumps back to a breadcrumb entry (or the root, for index -1). */
	function drillTo(index: number) {
		fieldPath.value = fieldPath.value.slice(0, index + 1)
		selectedFieldId.value = null
	}

	function onDragStart(_e: DragEvent, index: number, id: string) {
		draggingIndex.value = index
		draggingId.value = id
	}

	function onDragEnter(index: number) {
		dragOverIndex.value = index
	}

	function onDragLeave() {
		// Let dragenter on the next card handle it
	}

	function resetDragState() {
		draggingIndex.value = null
		draggingId.value = null
		dragOverIndex.value = null
	}

	function onFieldDrop(targetIndex: number) {
		if (draggingIndex.value === null || draggingIndex.value === targetIndex) {
			resetDragState()
			return
		}
		const list = currentFields.value
		const item = list.splice(draggingIndex.value, 1)[0]
		list.splice(targetIndex, 0, item)
		resetDragState()
	}

	return reactive({
		selectedFieldId,
		selectedField,
		fieldPath,
		scopeField,
		currentFields,
		draggingIndex,
		draggingId,
		dragOverIndex,
		fieldTypePalette: FIELD_TYPE_PALETTE,
		getFieldTypeInfo,
		isNestable,
		getFieldNameError,
		fieldHasError,
		validationErrors,
		onFieldLabelInput,
		addFieldOfType,
		insertBlock,
		removeField,
		selectField,
		resetSelection,
		drillInto,
		drillTo,
		onDragStart,
		onDragEnter,
		onDragLeave,
		onFieldDrop,
		onCanvasDrop: resetDragState,
		onDragEnd: resetDragState,
	})
}

export type FieldBuilder = ReturnType<typeof useFieldBuilder>
