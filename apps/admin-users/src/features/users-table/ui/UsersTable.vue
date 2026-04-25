<template>
	<div class="users-table-feature" :class="{ 'is-dark': isDark }">
		<el-table
			v-loading="isLoading || isFetching"
			border
			class="premium-table"
			:data="users"
			element-loading-text="Loading data..."
		>
			<!-- Email Column -->
			<el-table-column min-width="200" prop="email">
				<template #header>
					<el-popover
						placement="bottom-start"
						popper-class="premium-dark-popover"
						:show-arrow="true"
						trigger="click"
						:width="240"
					>
						<template #reference>
							<UiSortableHeader
								v-model:sortBy="filters.sortBy"
								v-model:sortOrder="filters.sortOrder"
								label="Email"
								prop="email"
								:show-filter-active="!!filters.email"
								@sort="setSort"
							/>
						</template>
						<div class="filter-popover-content">
							<span class="popover-label">Filter by Email</span>
							<el-input v-model="filters.email" clearable placeholder="Enter email..." />
						</div>
					</el-popover>
				</template>
			</el-table-column>

			<!-- Name Column -->
			<el-table-column min-width="220" prop="first_name">
				<template #header>
					<el-popover
						placement="bottom-start"
						popper-class="premium-dark-popover"
						:show-arrow="true"
						trigger="click"
						:width="240"
					>
						<template #reference>
							<UiSortableHeader
								v-model:sortBy="filters.sortBy"
								v-model:sortOrder="filters.sortOrder"
								label="Full Name"
								prop="first_name"
								:show-filter-active="!!filters.name"
								@sort="setSort"
							/>
						</template>
						<div class="filter-popover-content">
							<span class="popover-label">Filter by Name</span>
							<el-input v-model="filters.name" clearable placeholder="Enter name..." />
						</div>
					</el-popover>
				</template>
				<template #default="{ row }">
					<div class="user-name-cell">
						{{ row.name }}
					</div>
				</template>
			</el-table-column>

			<!-- Role Column -->
			<el-table-column prop="role" width="160">
				<template #header>
					<el-popover
						placement="bottom-start"
						popper-class="premium-dark-popover"
						:show-arrow="true"
						trigger="click"
						:width="240"
					>
						<template #reference>
							<UiSortableHeader
								v-model:sortBy="filters.sortBy"
								v-model:sortOrder="filters.sortOrder"
								:label="getRoleLabels()"
								prop="role"
								:show-filter-active="filters.role && filters.role.length > 0"
								@sort="setSort"
							/>
						</template>
						<div class="filter-popover-content">
							<span class="popover-label">Filter by Role</span>
							<el-select
								v-model="filters.role"
								clearable
								collapse-tags
								collapse-tags-tooltip
								filterable
								multiple
								placeholder="Select roles"
								popper-class="premium-dark-select"
							>
								<el-option v-for="opt in roleOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
							</el-select>
						</div>
					</el-popover>
				</template>
				<template #default="{ row }">
					<el-tag effect="plain" size="small" :type="row.role === 'admin' ? 'danger' : 'info'">{{ row.role }}</el-tag>
				</template>
			</el-table-column>

			<!-- Status Column -->
			<el-table-column prop="status" width="160">
				<template #header>
					<el-popover
						placement="bottom-start"
						popper-class="premium-dark-popover"
						:show-arrow="true"
						trigger="click"
						:width="240"
					>
						<template #reference>
							<UiSortableHeader
								v-model:sortBy="filters.sortBy"
								v-model:sortOrder="filters.sortOrder"
								:label="getStatusLabels()"
								prop="status"
								:show-filter-active="filters.status && filters.status.length > 0"
								@sort="setSort"
							/>
						</template>
						<div class="filter-popover-content">
							<span class="popover-label">Filter by Status</span>
							<el-select
								v-model="filters.status"
								clearable
								collapse-tags
								collapse-tags-tooltip
								filterable
								multiple
								placeholder="Select statuses"
								popper-class="premium-dark-select"
							>
								<el-option v-for="opt in statusOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
							</el-select>
						</div>
					</el-popover>
				</template>
				<template #default="{ row }">
					<el-tag effect="plain" size="small" :type="row.status === 'active' ? 'success' : 'warning'">{{
						row.status
					}}</el-tag>
				</template>
			</el-table-column>

			<!-- Phone Column -->
			<el-table-column prop="phone" width="160">
				<template #header>
					<el-popover
						placement="bottom-start"
						popper-class="premium-dark-popover"
						:show-arrow="true"
						trigger="click"
						:width="240"
					>
						<template #reference>
							<UiSortableHeader
								v-model:sortBy="filters.sortBy"
								v-model:sortOrder="filters.sortOrder"
								label="Phone"
								prop="phone"
								:show-filter-active="!!filters.phone"
								@sort="setSort"
							/>
						</template>
						<div class="filter-popover-content">
							<span class="popover-label">Filter by Phone</span>
							<el-input v-model="filters.phone" clearable placeholder="Enter phone..." />
						</div>
					</el-popover>
				</template>
			</el-table-column>

			<!-- City Column -->
			<el-table-column prop="city" width="140">
				<template #header>
					<el-popover
						placement="bottom-start"
						popper-class="premium-dark-popover"
						:show-arrow="true"
						trigger="click"
						:width="240"
					>
						<template #reference>
							<UiSortableHeader
								v-model:sortBy="filters.sortBy"
								v-model:sortOrder="filters.sortOrder"
								label="City"
								prop="city"
								:show-filter-active="!!filters.city"
								@sort="setSort"
							/>
						</template>
						<div class="filter-popover-content">
							<span class="popover-label">Filter by City</span>
							<el-input v-model="filters.city" clearable placeholder="Enter city..." />
						</div>
					</el-popover>
				</template>
			</el-table-column>

			<el-table-column label="Actions" width="120">
				<template #default="scope">
					<div class="action-buttons">
						<el-tooltip content="Edit User" placement="top">
							<el-button
								v-if="scope.row"
								circle
								plain
								size="small"
								type="warning"
								:icon="Edit"
								@click.stop="openEditModal(scope.row.uuid)"
							/>
						</el-tooltip>
						<el-tooltip content="Delete User" placement="top">
							<el-button
								v-if="scope.row"
								circle
								plain
								size="small"
								type="danger"
								:icon="Delete"
								@click.stop="confirmDelete(scope.row.uuid)"
							/>
						</el-tooltip>
					</div>
				</template>
			</el-table-column>
		</el-table>

		<div class="pagination-container">
			<el-pagination
				v-model:current-page="pagination.page"
				v-model:page-size="pagination.limit"
				background
				layout="total, sizes, prev, pager, next, jumper"
				:page-sizes="[10, 20, 50, 100]"
				:total="pagination.total"
				@current-change="setPage"
				@size-change="setLimit"
			/>
		</div>
	</div>
</template>

<script lang="ts">
export default {
	components: {},
}
</script>

<script setup lang="ts">
import { UiSortableHeader, useTheme } from '@admin-panel/ui'
import { Delete, Edit } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

import { useUsers } from '#entities/user'
import { UserRole, UserStatus } from '#entities/user/model'

const { users, filters, isLoading, isFetching, pagination, openEditModal, handleDelete, setPage, setLimit, setSort } =
	useUsers()

const { isDark } = useTheme()

const statusOptions = [
	{ value: UserStatus.Active, label: 'Active' },
	{ value: UserStatus.Inactive, label: 'Inactive' },
	{ value: UserStatus.InModeration, label: 'In moderation' },
]

const roleOptions = [
	{ value: UserRole.Admin, label: 'Admin' },
	{ value: UserRole.User, label: 'User' },
	{ value: UserRole.Superadmin, label: 'Superadmin' },
	{ value: UserRole.Editor, label: 'Editor' },
]

const getRoleLabels = () => {
	if (!filters.value.role || filters.value.role.length === 0) return 'Role'

	return filters.value.role.map((val) => roleOptions.find((opt) => opt.value === val)?.label || val).join(', ')
}

const getStatusLabels = () => {
	if (!filters.value.status || filters.value.status.length === 0) return 'Status'

	return filters.value.status.map((val) => statusOptions.find((opt) => opt.value === val)?.label || val).join(', ')
}

const confirmDelete = (uuid: string) => {
	ElMessageBox.confirm('Delete user?', 'Confirm', {
		confirmButtonText: 'Delete',
		cancelButtonText: 'Cancel',
		type: 'warning',
	}).then(() => handleDelete(uuid))
}
</script>

<style scoped>
.users-table-feature {
	width: 100%;
}

.premium-table {
	border: 1px solid var(--border-color);
	border-radius: 16px;
	box-shadow: var(--shadow-sm);
	background-color: var(--bg-card) !important;
	overflow: hidden;
}

:deep(.el-table) {
	--el-table-header-bg-color: var(--bg-header);
	--el-table-row-hover-bg-color: var(--bg-surface);
	--el-table-border-color: var(--border-color);

	color: var(--text-primary);
	background-color: var(--bg-card) !important;
}

:deep(.el-table__header-wrapper th) {
	height: 60px;
	border-bottom: 1px solid var(--border-color) !important;
	font-weight: 700;
	color: var(--text-muted);
	background-color: var(--bg-header) !important;
	padding: 0 !important;
}

.pagination-container {
	width: 100%;
	display: flex;
	justify-content: center;
	background: transparent;
	padding: 16px;
	margin-top: 40px;
}

/* Premium Dark Popover Styles */
:deep(.premium-dark-popover) {
	border: 1px solid var(--border-color) !important;
	border-radius: 12px !important;
	box-shadow: var(--shadow-sm) !important;
	background: var(--bg-card) !important;
	padding: 16px !important;
}

.filter-popover-content {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.popover-label {
	font-weight: 600;
	font-size: 12px;
	letter-spacing: 0.05em;
	text-transform: uppercase;
	color: #94a3b8;
}

.action-buttons {
	display: flex;
	justify-content: center;
	gap: 8px;
}
</style>
