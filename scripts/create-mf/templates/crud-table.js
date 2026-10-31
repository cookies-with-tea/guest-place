export function getCrudTable(entityPlural, entityPluralCamel) {
	return `<template>
	<div class="table-card">
		<el-table v-loading="${entityPluralCamel}.loading" :data="${entityPluralCamel}.filteredItems" style="width: 100%">
			<el-table-column label="Name" min-width="200" prop="name" />

			<el-table-column label="Description" min-width="240" prop="description" />

			<el-table-column label="Status" width="120" align="center">
				<template #default="{ row }">
					<el-tag :type="row.status === 'active' ? 'success' : 'info'" effect="light">
						{{ row.status }}
					</el-tag>
				</template>
			</el-table-column>

			<el-table-column label="Actions" width="180" align="right">
				<template #default="{ row }">
					<el-button size="small" plain @click="${entityPluralCamel}.openEditDialog(row)"> Edit </el-button>
					<el-button size="small" plain type="danger" @click="${entityPluralCamel}.confirmDelete(row)"> Delete </el-button>
				</template>
			</el-table-column>
		</el-table>
	</div>
</template>

<script setup lang="ts">
import type { ${entityPlural}Data } from '../../composables/use${entityPlural}Data'

defineProps<{
	${entityPluralCamel}: ${entityPlural}Data
}>()
</script>

<style scoped>
.table-card {
	border: 1px solid var(--border-color);
	border-radius: 12px;
	background: var(--bg-card);
	overflow: hidden;
}
</style>
`
}
