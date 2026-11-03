<template>
	<div class="namespaces-management">
		<div class="namespaces-management__header">
			<div class="namespaces-management__info">
				<el-icon class="namespaces-management__icon"><Files /></el-icon>
				<h3>Manage Namespaces</h3>
			</div>
			<el-button type="primary" @click="openCreateDialog">
				<el-icon><Plus /></el-icon>
				Add Namespace
			</el-button>
		</div>

		<UiTable v-loading="isLoading" :data="namespaces" style="width: 100%">
			<el-table-column prop="name" label="Name" width="180" />
			<el-table-column prop="description" label="Description" />
			<el-table-column prop="isDynamic" label="Dynamic" width="100">
				<template #default="{ row }">
					<el-tag :type="row.isDynamic ? 'success' : 'info'">
						{{ row.isDynamic ? 'Yes' : 'No' }}
					</el-tag>
				</template>
			</el-table-column>
			<el-table-column label="Actions" width="120" align="center">
				<template #default="{ row }">
					<div class="action-buttons">
						<el-tooltip content="Edit Namespace" placement="top">
							<el-button circle plain size="small" type="primary" :icon="Edit" @click="openEditDialog(row)" />
						</el-tooltip>
						<el-tooltip content="Delete Namespace" placement="top">
							<el-button circle plain size="small" type="danger" :icon="Delete" @click="handleDelete(row.id)" />
						</el-tooltip>
					</div>
				</template>
			</el-table-column>
		</UiTable>

		<el-dialog v-model="isDialogOpen" :title="editingId ? 'Edit Namespace' : 'Create Namespace'" width="400px">
			<el-form :model="form" label-position="top">
				<el-form-item label="Namespace Name (prefix)">
					<el-input v-model="form.name" placeholder="e.g. auth" :disabled="!!editingId" />
				</el-form-item>
				<el-form-item label="Description">
					<el-input v-model="form.description" type="textarea" placeholder="What is this namespace for?" />
				</el-form-item>
				<el-form-item>
					<el-checkbox v-model="form.isDynamic" label="Dynamic (optimized loading)" />
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="isDialogOpen = false">Cancel</el-button>
				<el-button type="primary" :loading="isSubmitting" @click="handleSubmit">Save</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import type { Namespace } from '@admin-panel/i18n'
import { UiTable } from '@admin-panel/ui'
import { Delete, Edit, Files, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import { createNamespace, deleteNamespace, fetchNamespaces, updateNamespace } from '#entities/namespace/api'

const namespaces = ref<Namespace[]>([])
const isLoading = ref(false)
const isSubmitting = ref(false)
const isDialogOpen = ref(false)
const editingId = ref<string | null>(null)

const form = ref({
	name: '',
	description: '',
	isDynamic: false,
})

const loadData = async () => {
	isLoading.value = true

	const { data } = await fetchNamespaces()

	isLoading.value = false

	if (data) {
		namespaces.value = data || []
	}
}

const openCreateDialog = () => {
	editingId.value = null

	form.value = { name: '', description: '', isDynamic: false }

	isDialogOpen.value = true
}

const openEditDialog = (ns: Namespace) => {
	editingId.value = ns.id

	form.value = {
		name: ns.name,
		description: ns.description || '',
		isDynamic: ns.isDynamic,
	}

	isDialogOpen.value = true
}

const handleSubmit = async () => {
	if (!form.value.name) return ElMessage.warning('Name is required')

	if (editingId.value) {
		const { data } = await updateNamespace(editingId.value, form.value)

		if (data) {
			ElMessage.success('Namespace updated')
		} else {
			ElMessage.error('Failed to update namespace')
		}
	} else {
		const { data } = await createNamespace(form.value)

		if (data) {
			ElMessage.success('Namespace created')
		} else {
			ElMessage.error('Failed to create namespace')
		}
	}

	isDialogOpen.value = false

	await loadData()
}

const handleDelete = async (id: string) => {
	await ElMessageBox.confirm(
		'Are you sure you want to delete this namespace? This will NOT delete translations, but they will become "orphaned".',
		'Warning',
		{
			confirmButtonText: 'Delete',
			cancelButtonText: 'Cancel',
			type: 'warning',
		}
	)

	const { errors } = await deleteNamespace(id)

	if (errors && errors.length) return ElMessage.error(errors[0])

	ElMessage.success('Namespace deleted')

	await loadData()
}

onMounted(loadData)
</script>

<style scoped>
.namespaces-management {
	padding: 16px 0;
}

.namespaces-management__header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24px;
	margin-bottom: 32px;
}

.namespaces-management__info {
	display: flex;
	align-items: center;
	gap: 12px;
}

.namespaces-management__icon {
	font-size: 20px;
	color: var(--gp-primary);
}

.namespaces-management__header h3 {
	font-weight: 600;
	font-size: 18px;
	margin: 0;
}

.action-buttons {
	display: flex;
	justify-content: center;
	gap: 8px;
}
</style>
