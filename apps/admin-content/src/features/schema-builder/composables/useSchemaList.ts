import { reactive, ref } from 'vue'
import type { Router } from 'vue-router'
import type { ContentSchema } from '@admin-panel/lib'
import { createApi } from '@admin-panel/lib'
import { ElMessage, ElMessageBox } from 'element-plus'

/** Owns the schemas list: fetching, deleting, and navigating to a schema's entries/docs. */
export function useSchemaList(router: Router) {
	const { fetchData: apiFetch } = createApi('content/schemas')

	const schemas = ref<ContentSchema[]>([])
	const loading = ref(false)

	async function fetchSchemas() {
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

	async function deleteSchema(id: string) {
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

	function goToEntries(slug: string) {
		router.push({ name: 'EntriesList', params: { schemaIdentifier: slug } })
	}

	function goToDocs() {
		try {
			router.push({ name: 'ContentDocs' })
		} catch {
			router.push('/docs')
		}
	}

	return reactive({ schemas, loading, apiFetch, fetchSchemas, deleteSchema, goToEntries, goToDocs })
}

export type SchemaList = ReturnType<typeof useSchemaList>
