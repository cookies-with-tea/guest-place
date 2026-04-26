<template>
	<div class="translations-table">
		<UiTable v-loading="isLoading" border :data="translations">
			<el-table-column label="ID" prop="id" width="120" />
			<el-table-column label="Namespace" prop="key" width="150">
				<template #default="{ row }">
					<el-tag v-if="row.key.includes('.')" size="small" type="info">
						{{ row.key.split('.')[0] }}
					</el-tag>
					<el-tag v-else size="small" type="warning"> none </el-tag>
				</template>
			</el-table-column>
			<el-table-column label="Key" min-width="200" prop="key" />
			<el-table-column label="Translation" min-width="200" prop="value" />
			<el-table-column label="Actions" width="160">
				<template #default="scope">
					<el-button v-if="scope && scope.row" plain size="small" type="primary" @click="openEditModal(scope.row)">
						Edit
					</el-button>
					<el-button v-if="scope && scope.row" plain size="small" type="danger" @click="confirmDelete(scope.row.id)">
						Delete
					</el-button>
				</template>
			</el-table-column>
		</UiTable>

		<div class="translations-table__pagination">
			<el-pagination
				v-model:current-page="currentPage"
				v-model:page-size="currentlimit"
				layout="prev, pager, next, total"
				:total="pagination.total"
				@current-change="setPage"
				@size-change="setlimit"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { UiTable } from '@admin-panel/ui'
import { ElMessageBox } from 'element-plus'

import { useTranslations } from '#entities/translation/lib/composables'

const { translations, isLoading, pagination, openEditModal, handleDelete, setPage, setlimit } = useTranslations()

const currentPage = computed({
	get: () => pagination.value.page,
	set: (val) => setPage(val),
})

const currentlimit = computed({
	get: () => pagination.value.limit,
	set: (val) => setlimit(val),
})

const confirmDelete = (id: string) => {
	ElMessageBox.confirm('Delete translation?', 'Confirm', {
		confirmButtonText: 'Delete',
		cancelButtonText: 'Cancel',
		type: 'warning',
	}).then(() => handleDelete(id))
}
</script>

<style scoped>
/* ... */
</style>
