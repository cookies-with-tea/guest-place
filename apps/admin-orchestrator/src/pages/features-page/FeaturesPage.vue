<template>
	<div class="features-page glass-card">
		<div class="header">
			<div class="header-content">
				<h1>System Feature Flags</h1>
				<p>Toggle system features and experiments in real-time</p>
			</div>
			<el-button :icon="Plus" type="primary" @click="showAddDialog = true"> Add Flag </el-button>
		</div>

		<el-table v-loading="loading" class="feature-table" :data="flags" style="width: 100%">
			<el-table-column label="ID" prop="id" width="180">
				<template #default="{ row }">
					<code class="flag-id">{{ row.id }}</code>
				</template>
			</el-table-column>
			<el-table-column label="Name" prop="name" width="200" />
			<el-table-column label="Description" prop="description" />
			<el-table-column label="Status" width="120">
				<template #default="{ row }">
					<el-switch v-model="row.enabled" @change="handleToggle(row)" />
				</template>
			</el-table-column>
			<el-table-column label="Actions" width="100">
				<template #default="{ $index }">
					<el-button circle :icon="Delete" type="danger" @click="removeFlag($index)" />
				</template>
			</el-table-column>
		</el-table>

		<div class="footer-actions">
			<el-button :loading="saving" type="success" @click="handleSave()"> Save All Changes </el-button>
		</div>

		<!-- Add Flag Dialog -->
		<el-dialog v-model="showAddDialog" append-to-body title="Add New Feature Flag" width="400px">
			<el-form label-position="top" :model="newFlag">
				<el-form-item label="ID (snake_case)">
					<el-input v-model="newFlag.id" placeholder="e.g. new_dashboard" />
				</el-form-item>
				<el-form-item label="Name">
					<el-input v-model="newFlag.name" placeholder="Feature name" />
				</el-form-item>
				<el-form-item label="Description">
					<el-input v-model="newFlag.description" placeholder="What this flag controls" type="textarea" />
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="showAddDialog = false">Cancel</el-button>
				<el-button type="primary" @click="addFlag">Add</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { useFeatureFlags } from '@admin-panel/lib'
import { Delete, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const { flags, loading, loadFlags, updateFlags } = useFeatureFlags()

const showAddDialog = ref(false)
const saving = ref(false)

const newFlag = ref({
	id: '',
	name: '',
	description: '',
	enabled: false,
})

const handleToggle = (row: any) => {
	ElMessage.info(`Flag "${row.name}" ${row.enabled ? 'enabled' : 'disabled'} locally. Save to apply.`)
}

const addFlag = () => {
	if (!newFlag.value.id || !newFlag.value.name) {
		ElMessage.warning('ID and Name are required')

		return
	}

	flags.value.push({ ...newFlag.value })

	showAddDialog.value = false

	newFlag.value = { id: '', name: '', description: '', enabled: false }
}

const removeFlag = (index: number) => {
	flags.value.splice(index, 1)
}

const handleSave = async () => {
	saving.value = true

	try {
		await updateFlags(flags.value)

		ElMessage.success('Feature flags saved successfully')
	} catch {
		ElMessage.error('Failed to save feature flags')
	} finally {
		saving.value = false
	}
}

onMounted(loadFlags)
</script>

<style scoped>
.features-page {
	padding: 24px;
}

.header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	margin-bottom: 32px;
}

.header h1 {
	font-size: 1.5rem;
	margin: 0;
}

.header p {
	color: var(--gp-text-secondary);
	margin: 8px 0 0;
}

.flag-id {
	border-radius: 4px;
	font-family: monospace;
	font-size: 0.9em;
	background: var(--gp-glass-hover);
	padding: 2px 6px;
}

.feature-table {
	border-radius: 8px;
	background: transparent !important;
	overflow: hidden;
}

:deep(.el-table),
:deep(.el-table tr),
:deep(.el-table th) {
	background: transparent !important;
}

.footer-actions {
	display: flex;
	justify-content: flex-end;
	margin-top: 32px;
}
</style>
