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
	{ value: FieldType.Text, label: 'Text', icon: '📝', description: 'Short text, single line', color: '#6366f1' },
	{
		value: FieldType.RichText,
		label: 'Rich Text',
		icon: '📄',
		description: 'Formatted content (Tiptap editor)',
		color: '#8b5cf6',
	},
	{ value: FieldType.Number, label: 'Number', icon: '🔢', description: 'Integer or decimal number', color: '#0ea5e9' },
	{ value: FieldType.Boolean, label: 'Boolean', icon: '☑️', description: 'True / false toggle', color: '#10b981' },
	{ value: FieldType.Date, label: 'Date', icon: '📅', description: 'Date or datetime picker', color: '#f59e0b' },
	{
		value: FieldType.Media,
		label: 'Media',
		icon: '🖼️',
		description: 'Image, video or file reference',
		color: '#ef4444',
	},
	{ value: FieldType.Relation, label: 'Relation', icon: '🔗', description: 'Link to another schema', color: '#f97316' },
]

const NAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9_-]*$/

/** Owns the field canvas: selection, add/remove, drag-and-drop reordering, and validation. */
export function useFieldBuilder(schemaForm: SchemaForm) {
	const selectedFieldId = ref<string | null>(null)
	const draggingIndex = ref<number | null>(null)
	const draggingId = ref<string | null>(null)
	const dragOverIndex = ref<number | null>(null)

	const selectedField = computed(() => schemaForm.form.fields.find((f: any) => f._id === selectedFieldId.value) ?? null)

	function getFieldTypeInfo(type: FieldType): FieldTypeInfo {
		return FIELD_TYPE_PALETTE.find((f) => f.value === type) ?? FIELD_TYPE_PALETTE[0]
	}

	function getFieldNameError(name: string): string | null {
		if (!name) return 'Identifier is required'
		if (!NAME_PATTERN.test(name)) return 'Only letters, digits, underscores and hyphens'
		const dupes = schemaForm.form.fields.filter((f: any) => f.name === name)
		if (dupes.length > 1) return 'Identifier must be unique'
		return null
	}

	function fieldHasError(name: string): boolean {
		return !!getFieldNameError(name) || !name
	}

	const validationErrors = computed(() => {
		const errors: string[] = []
		if (!schemaForm.form.name) errors.push('Schema name is required')
		if (!schemaForm.form.slug) errors.push('Schema slug is required')
		schemaForm.form.fields.forEach((f: any, i: number) => {
			const err = getFieldNameError(f.name)
			if (!f.label) errors.push(`Field #${i + 1}: label required`)
			if (err) errors.push(`Field "${f.label || `#${i + 1}`}": ${err}`)
		})
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
		schemaForm.form.fields.push({
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

	function removeField(id: string) {
		const idx = schemaForm.form.fields.findIndex((f: any) => f._id === id)
		if (idx !== -1) {
			schemaForm.form.fields.splice(idx, 1)
			if (selectedFieldId.value === id) {
				selectedFieldId.value = schemaForm.form.fields[Math.min(idx, schemaForm.form.fields.length - 1)]?._id ?? null
			}
		}
	}

	function selectField(id: string) {
		selectedFieldId.value = id
	}

	function resetSelection() {
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
		const item = schemaForm.form.fields.splice(draggingIndex.value, 1)[0]
		schemaForm.form.fields.splice(targetIndex, 0, item)
		resetDragState()
	}

	return reactive({
		selectedFieldId,
		selectedField,
		draggingIndex,
		draggingId,
		dragOverIndex,
		fieldTypePalette: FIELD_TYPE_PALETTE,
		getFieldTypeInfo,
		getFieldNameError,
		fieldHasError,
		validationErrors,
		onFieldLabelInput,
		addFieldOfType,
		removeField,
		selectField,
		resetSelection,
		onDragStart,
		onDragEnter,
		onDragLeave,
		onFieldDrop,
		onCanvasDrop: resetDragState,
		onDragEnd: resetDragState,
	})
}

export type FieldBuilder = ReturnType<typeof useFieldBuilder>
