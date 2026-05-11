<template>
	<div class="translations-table">
		<UiTable
			v-model:limit="currentLimit"
			v-model:page="currentPage"
			:loading="isLoading"
			style="width: 100%"
			:data="translations"
			:total="pagination.total"
		>
			<UiTableColumn label="ID" prop="id" width="120" />
			<UiTableColumn label="Namespace" prop="key" width="150">
				<template #default="{ row }">
					<el-tag v-if="row.key.includes('.')" size="small" type="info">
						{{ row.key.split('.')[0] }}
					</el-tag>
					<el-tag v-else size="small" type="warning"> none </el-tag>
				</template>
			</UiTableColumn>
			<UiTableColumn label="Key" min-width="200" prop="key" />
			<UiTableColumn label="Translation" min-width="200" prop="value" />
			<el-table-column label="Actions" width="160" align="center">
				<template #default="scope">
					<div class="action-buttons">
						<el-tooltip content="Edit Translation" placement="top">
							<el-button
								v-if="scope.row"
								circle
								plain
								size="small"
								type="primary"
								:icon="Edit"
								@click="openEditModal(scope.row)"
							/>
						</el-tooltip>
						<el-tooltip content="View History" placement="top">
							<el-button
								v-if="scope.row"
								circle
								plain
								size="small"
								type="warning"
								:icon="Clock"
								@click="openHistory(scope.row)"
							/>
						</el-tooltip>
						<el-tooltip content="Delete Translation" placement="top">
							<el-button
								v-if="scope.row"
								circle
								plain
								size="small"
								type="danger"
								:icon="Delete"
								@click="confirmDelete(scope.row.id)"
							/>
						</el-tooltip>
					</div>
				</template>
			</el-table-column>
		</UiTable>

		<TranslationsHistoryDialog />
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { UiTable, UiTableColumn } from '@admin-panel/ui'
import { Clock, Delete, Edit } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

import { useTranslations } from '#entities/translation/lib/composables'

import { TranslationsHistoryDialog } from '../../translations-history'

const { translations, isLoading, pagination, openEditModal, openHistory, handleDelete, setPage, setLimit } =
	useTranslations()

const currentPage = computed({
	get: () => pagination.value.page,
	set: (val) => setPage(val),
})

const currentLimit = computed({
	get: () => pagination.value.limit,
	set: (val) => setLimit(val),
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
.translations-table {
	width: 100%;
}

.action-buttons {
	display: flex;
	justify-content: center;
	gap: 8px;
}
</style>
