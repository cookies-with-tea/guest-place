import { computed, reactive, ref } from 'vue'
import type { ContentSchema, FieldDefinition } from '@admin-panel/lib'
import { createApi, useEntityLock } from '@admin-panel/lib'
import { ElMessage } from 'element-plus'
import { addFieldMeta, stripFieldMeta, toSlug } from '../lib/helpers'

export interface FieldWithMeta extends FieldDefinition {
	_id: string
	_nameTouched?: boolean
}

type FetchData = ReturnType<typeof createApi>['fetchData']

/**
 * Owns the schema being created/edited: its name/slug/singleton flag and field list,
 * the builder open/close state, the entity soft-lock, and saving.
 */
export function useSchemaForm(apiFetch: FetchData, onSaved: () => void) {
	const saving = ref(false)
	const builderOpen = ref(false)
	const isEdit = ref(false)
	const currentSchemaId = ref('')
	const slugTouched = ref(false)

	const form = reactive({
		name: '',
		slug: '',
		isSingleton: false,
		fields: [] as FieldWithMeta[],
	})

	const lockEntityId = computed(() => (builderOpen.value && isEdit.value ? currentSchemaId.value : ''))
	const { isLocked, isLockedByOther, lockedByName, forceUnlock } = useEntityLock('schema', lockEntityId)

	function onNameInput() {
		if (!slugTouched.value) form.slug = toSlug(form.name)
	}

	function openBuilder() {
		builderOpen.value = true
		slugTouched.value = false
	}

	function closeBuilder() {
		builderOpen.value = false
	}

	function handleAddSchema() {
		isEdit.value = false
		currentSchemaId.value = ''
		form.name = ''
		form.slug = ''
		form.isSingleton = false
		form.fields = []
		openBuilder()
	}

	function handleEditSchema(schema: ContentSchema) {
		isEdit.value = true
		currentSchemaId.value = schema.id
		form.name = schema.name
		form.slug = schema.slug
		form.isSingleton = !!schema.isSingleton
		form.fields = addFieldMeta(JSON.parse(JSON.stringify(schema.fields))) as FieldWithMeta[]
		slugTouched.value = true
		openBuilder()
	}

	async function saveSchema() {
		saving.value = true
		try {
			const payload = {
				...form,
				fields: stripFieldMeta(form.fields),
			}
			if (isEdit.value) {
				await apiFetch(`/${currentSchemaId.value}`, { method: 'PATCH', body: payload })
				ElMessage.success('Schema updated')
			} else {
				await apiFetch('', { method: 'POST', body: payload })
				ElMessage.success('Schema created')
			}
			closeBuilder()
			onSaved()
		} catch (error: any) {
			ElMessage.error(error.messages?.[0] || 'Failed to save schema')
		} finally {
			saving.value = false
		}
	}

	return reactive({
		form,
		saving,
		builderOpen,
		isEdit,
		currentSchemaId,
		slugTouched,
		isLocked,
		isLockedByOther,
		lockedByName,
		forceUnlock,
		onNameInput,
		openBuilder,
		closeBuilder,
		handleAddSchema,
		handleEditSchema,
		saveSchema,
	})
}

export type SchemaForm = ReturnType<typeof useSchemaForm>
