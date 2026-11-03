export function getCrudComposable(resourceSlug, entitySingular, entityPlural, entityPluralCamel) {
	const entitySingularLower = entitySingular.charAt(0).toLowerCase() + entitySingular.slice(1)
	const entityPluralLower = entityPlural.charAt(0).toLowerCase() + entityPlural.slice(1)

	return `import { computed, reactive, ref } from 'vue'

import { ElMessage, ElMessageBox } from 'element-plus'

import { ${entityPluralCamel}Api, type ${entitySingular}Item } from '#entities/${resourceSlug}'

/** ${entityPlural} list — load/filter, the create/edit dialog form, and the per-row delete action. */
export const use${entityPlural}Data = () => {
	const loading = ref(true)
	const items = ref<${entitySingular}Item[]>([])

	const searchQuery = ref('')
	const statusFilter = ref<'all' | 'active' | 'inactive'>('all')

	const isDialogOpen = ref(false)
	const editingId = ref<string | null>(null)

	const form = reactive({
		name: '',
		description: '',
		status: 'active' as 'active' | 'inactive',
	})

	const loadItems = async () => {
		loading.value = true
		try {
			const res = await ${entityPluralCamel}Api.get${entityPlural}()
			items.value = res.data || []
		} catch (e: any) {
			ElMessage.error(e.message || 'Failed to load ${entityPluralLower}')
		} finally {
			loading.value = false
		}
	}

	const filteredItems = computed(() => {
		let list = items.value

		if (searchQuery.value.trim()) {
			const q = searchQuery.value.trim().toLowerCase()
			list = list.filter((item) => item.name.toLowerCase().includes(q))
		}

		if (statusFilter.value !== 'all') {
			list = list.filter((item) => item.status === statusFilter.value)
		}

		return list
	})

	const resetForm = () => {
		form.name = ''
		form.description = ''
		form.status = 'active'
	}

	const openCreateDialog = () => {
		editingId.value = null
		resetForm()
		isDialogOpen.value = true
	}

	const openEditDialog = (row: ${entitySingular}Item) => {
		editingId.value = row.id
		form.name = row.name
		form.description = row.description
		form.status = row.status
		isDialogOpen.value = true
	}

	const confirmSave = async () => {
		try {
			if (editingId.value) {
				await ${entityPluralCamel}Api.update${entitySingular}(editingId.value, { ...form })
				ElMessage.success('${entitySingular} updated')
			} else {
				await ${entityPluralCamel}Api.create${entitySingular}({ ...form })
				ElMessage.success('${entitySingular} created')
			}
			isDialogOpen.value = false
			await loadItems()
		} catch (e: any) {
			ElMessage.error(e.message || 'Failed to save ${entitySingularLower}')
		}
	}

	const confirmDelete = async (row: ${entitySingular}Item) => {
		try {
			await ElMessageBox.confirm(\`Delete "\${row.name}"?\`, 'Confirm', {
				confirmButtonText: 'Delete',
				cancelButtonText: 'Cancel',
				type: 'warning',
			})
			await ${entityPluralCamel}Api.delete${entitySingular}(row.id)
			ElMessage.success('${entitySingular} deleted')
			await loadItems()
		} catch {
			// cancelled
		}
	}

	return reactive({
		loading,
		searchQuery,
		statusFilter,
		isDialogOpen,
		editingId,
		form,
		filteredItems,
		loadItems,
		openCreateDialog,
		openEditDialog,
		confirmSave,
		confirmDelete,
	})
}

export type ${entityPlural}Data = ReturnType<typeof use${entityPlural}Data>
`
}
