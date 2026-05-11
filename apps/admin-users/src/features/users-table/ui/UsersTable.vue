<template>
	<div class="users-table-feature" :class="{ 'is-dark': isDark }">
		<UiTable
			v-model:page="pagination.page"
			v-model:limit="pagination.limit"
			v-loading="isLoading || isFetching"
			border
			class="ui-table"
			:data="users"
			element-loading-text="Loading data..."
			:total="pagination.total"
			@update:page="setPage"
			@update:limit="setLimit"
		>
			<!-- Email Column -->
			<UiTableColumn
				v-model:sortBy="filters.sortBy"
				v-model:sortOrder="filters.sortOrder"
				filterable
				label="Email"
				min-width="200"
				prop="email"
				sortable
				:show-filter-active="!!filters.email"
				@sort="setSort"
			>
				<template #filter>
					<el-input v-model="filters.email" clearable placeholder="Enter email..." />
				</template>
			</UiTableColumn>

			<!-- Name Column -->
			<UiTableColumn
				v-model:sortBy="filters.sortBy"
				v-model:sortOrder="filters.sortOrder"
				filterable
				label="Full Name"
				min-width="220"
				prop="first_name"
				sortable
				:show-filter-active="!!filters.name"
				@sort="setSort"
			>
				<template #filter>
					<el-input v-model="filters.name" clearable placeholder="Enter name..." />
				</template>
				<template #default="{ row }">
					<div class="user-name-cell">
						{{ row.name }}
					</div>
				</template>
			</UiTableColumn>

			<!-- Role Column -->
			<UiTableColumn
				v-model:sortBy="filters.sortBy"
				v-model:sortOrder="filters.sortOrder"
				filterable
				prop="role"
				sortable
				width="160"
				:label="getRoleLabels()"
				:show-filter-active="filters.role && filters.role.length > 0"
				@sort="setSort"
			>
				<template #filter>
					<el-select
						v-model="filters.role"
						clearable
						collapse-tags
						collapse-tags-tooltip
						filterable
						multiple
						placeholder="Select roles"
						popper-class="dark-select"
					>
						<el-option v-for="opt in roleOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
					</el-select>
				</template>
				<template #default="{ row }">
					<el-select
						v-model="row.role"
						class="inline-edit-select"
						placeholder="Role"
						size="small"
						@change="(val: any) => handlePatch(row.uuid, { role: val })"
					>
						<el-option v-for="opt in roleOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
					</el-select>
				</template>
			</UiTableColumn>

			<!-- Status Column -->
			<UiTableColumn
				v-model:sortBy="filters.sortBy"
				v-model:sortOrder="filters.sortOrder"
				filterable
				prop="status"
				sortable
				width="160"
				:label="getStatusLabels()"
				:show-filter-active="filters.status && filters.status.length > 0"
				@sort="setSort"
			>
				<template #filter>
					<el-select
						v-model="filters.status"
						clearable
						collapse-tags
						collapse-tags-tooltip
						filterable
						multiple
						placeholder="Select statuses"
						popper-class="dark-select"
					>
						<el-option v-for="opt in statusOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
					</el-select>
				</template>
				<template #default="{ row }">
					<div class="status-cell">
						<el-switch
							v-model="row.status"
							active-value="active"
							inactive-value="inactive"
							size="small"
							@change="(val: any) => handlePatch(row.uuid, { status: val })"
						/>
						<el-tag v-if="row.status === 'in_moderation'" class="status-tag" effect="plain" size="small" type="warning">
							Moderation
						</el-tag>
					</div>
				</template>
			</UiTableColumn>

			<!-- Phone Column -->
			<UiTableColumn
				v-model:sortBy="filters.sortBy"
				v-model:sortOrder="filters.sortOrder"
				filterable
				label="Phone"
				prop="phone"
				sortable
				width="160"
				:show-filter-active="!!filters.phone"
				@sort="setSort"
			>
				<template #filter>
					<el-input v-model="filters.phone" clearable placeholder="Enter phone..." />
				</template>
			</UiTableColumn>

			<!-- City Column -->
			<UiTableColumn
				v-model:sortBy="filters.sortBy"
				v-model:sortOrder="filters.sortOrder"
				filterable
				label="City"
				prop="city"
				sortable
				width="140"
				:show-filter-active="!!filters.city"
				@sort="setSort"
			>
				<template #filter>
					<el-input v-model="filters.city" clearable placeholder="Enter city..." />
				</template>
			</UiTableColumn>

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
		</UiTable>
	</div>
</template>

<script setup lang="ts">
import { UiTable, UiTableColumn, useTheme } from '@admin-panel/ui'
import { Delete, Edit } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

import { useUsers } from '#entities/user'
import { UserRole, UserStatus } from '#entities/user/model'

const {
	users,
	filters,
	isLoading,
	isFetching,
	pagination,
	openEditModal,
	handleDelete,
	handlePatch,
	setPage,
	setLimit,
	setSort,
} = useUsers()

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

/* Dark Popover Styles */
:deep(.dark-popover) {
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

.inline-edit-select {
	width: 100%;
}

.status-cell {
	display: flex;
	align-items: center;
	gap: 8px;
}

.status-tag {
	margin-left: 4px;
}
</style>
