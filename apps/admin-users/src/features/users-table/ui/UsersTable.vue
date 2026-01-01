<template>
	<div class="users-table">
		<el-table :data="users" v-loading="isLoading" border>
			<el-table-column prop="email" label="Email" min-width="200" />
			<el-table-column prop="name" label="Name" min-width="200" />
			<el-table-column prop="role" label="Role" width="120" />
			<el-table-column prop="status" label="Status" width="140" />
			<el-table-column label="Actions" width="160">
				<template #default="scope">
					<el-button v-if="scope.row" size="small" type="primary" plain @click="openEditModal(scope.row.uuid)">
						Edit
					</el-button>
					<el-button v-if="scope.row" size="small" type="danger" plain @click="confirmDelete(scope.row.uuid)">
						Delete
					</el-button>
				</template>
			</el-table-column>
		</el-table>

		<div class="users-table__pagination">
			<el-pagination
				v-model:current-page="pagination.page"
				v-model:page-size="pagination.limit"
				:total="pagination.total"
				layout="prev, pager, next, total"
				@size-change="setlimit"
				@current-change="setPage"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ElMessageBox } from 'element-plus'
import { useUsers } from '#entities/user/lib/composables'

const { users, isLoading, pagination, openEditModal, handleDelete, setPage, setlimit } = useUsers()

const confirmDelete = (uuid: string) => {
	ElMessageBox.confirm('Delete user?', 'Confirm', {
		confirmButtonText: 'Delete',
		cancelButtonText: 'Cancel',
		type: 'warning',
	}).then(() => handleDelete(uuid))
}
</script>

<style scoped>
.users-table__pagination {
	display: flex;
	justify-content: center;
	margin-top: 20px;
}
</style>
