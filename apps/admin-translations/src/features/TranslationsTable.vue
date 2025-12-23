<!-- src/features/translations/ui/TranslationsTable.vue -->
<template>
	<div class="translations-table">
		<el-table :data="translations" v-loading="isLoading" border>
			<el-table-column prop="id" label="ID" width="120" />
			<el-table-column prop="key" label="Key" min-width="200" />
			<el-table-column prop="value" label="Translation" min-width="200" />
			<el-table-column label="Actions" width="160">
				<template #default="scope">
					<el-button v-if="scope.row" size="small" type="primary" plain @click="openEditModal(scope.row)">
						Edit
					</el-button>
					<el-button v-if="scope.row" size="small" type="danger" plain @click="confirmDelete(scope.row.id)">
						Delete
					</el-button>
				</template>
			</el-table-column>
		</el-table>

		<div class="translations-table__pagination">
			<el-pagination
				v-model:current-page="currentPage"
				v-model:page-size="currentPageSize"
				:total="pagination.total"
				layout="prev, pager, next, total"
				@size-change="setPageSize"
				@current-change="setPage"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessageBox } from 'element-plus'
import { useTranslations } from '@/entities/translation/lib/composables'

const { translations, isLoading, pagination, openEditModal, handleDelete, setPage, setPageSize } = useTranslations()

const currentPage = computed({
	get: () => pagination.value.page,
	set: (val) => setPage(val),
})

const currentPageSize = computed({
	get: () => pagination.value.pageSize,
	set: (val) => setPageSize(val),
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
