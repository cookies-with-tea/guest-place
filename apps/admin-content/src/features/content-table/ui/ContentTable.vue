<template>
	<div class="content-table-feature" :class="{ 'is-dark': isDark }">
		<UiTable v-loading="isLoading" border :data="entries" element-loading-text="Loading data...">
			<el-table-column label="ID" prop="id" width="100">
				<template #default="{ row }">
					<span class="uuid-cell">{{ row.id.slice(0, 8) }}</span>
				</template>
			</el-table-column>

			<el-table-column
				v-for="field in previewFields"
				:key="field.name"
				:label="field.label"
				:prop="`data.${field.name}`"
			>
				<template #default="{ row }">
					{{ formatCellValue(row.data[field.name], field) }}
				</template>
			</el-table-column>

			<el-table-column label="Status" prop="status" width="120">
				<template #default="{ row }">
					<el-tag :type="getStatusType(row.status)" size="small">
						{{ row.status.toUpperCase() }}
					</el-tag>
				</template>
			</el-table-column>

			<el-table-column label="Updated At" prop="updatedAt" width="180">
				<template #default="{ row }">
					{{ formatDate(row.updatedAt) }}
				</template>
			</el-table-column>

			<el-table-column label="Actions" width="200">
				<template #default="scope">
					<div class="action-buttons">
						<el-button plain size="small" type="warning" @click="emit('edit', scope.row.id)"> Edit </el-button>
						<el-button plain size="small" type="danger" @click="confirmDelete(scope.row.id)"> Delete </el-button>
					</div>
				</template>
			</el-table-column>
		</UiTable>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { ContentEntry, ContentSchema, FieldDefinition } from '@admin-panel/lib'
import { FieldType } from '@admin-panel/lib'
import { UiTable, useTheme } from '@admin-panel/ui'
import { ElMessageBox } from 'element-plus'

interface Props {
	entries: ContentEntry[]
	schema: ContentSchema | null
	isLoading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
	edit: [id: string]
	delete: [id: string]
}>()

const { isDark } = useTheme()

const previewFields = computed(() => {
	if (!props.schema) return []

	return props.schema.fields.slice(0, 3)
})

const formatCellValue = (value: any, field: FieldDefinition) => {
	if (value === null || value === undefined) return '-'
	if (field.fieldType === FieldType.Boolean) return value ? 'Yes' : 'No'
	if (field.fieldType === FieldType.Media) return '[Media]'

	return value
}

const formatDate = (dateStr: string) => {
	if (!dateStr) return '-'

	return new Date(dateStr).toLocaleString()
}

const getStatusType = (status: string) => {
	switch (status) {
		case 'published':
			return 'success'
		case 'review':
			return 'warning'
		default:
			return 'info'
	}
}

const confirmDelete = (id: string) => {
	ElMessageBox.confirm('Delete entry?', 'Confirm', {
		confirmButtonText: 'Delete',
		cancelButtonText: 'Cancel',
		type: 'warning',
	}).then(() => emit('delete', id))
}
</script>

<style scoped>
.content-table-feature {
	width: 100%;
}

.uuid-cell {
	font-family: monospace;
	font-size: 12px;
	color: var(--text-muted);
}

.action-buttons {
	display: flex;
	gap: 8px;
}
</style>
