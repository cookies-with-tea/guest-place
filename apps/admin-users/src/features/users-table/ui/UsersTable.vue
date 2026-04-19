<template>
	<div class="users-table-feature" :class="{ 'is-dark': isDark }">
		<el-table
			:data="users"
			v-loading="isLoading || isFetching"
			element-loading-text="Loading data..."
			border
			class="premium-table"
			@row-click="(row: IUserResponse) => openDetailDrawer(row.uuid!)"
		>
			<!-- Email Column -->
			<el-table-column prop="email" label="Email" min-width="200">
				<template #header>
					<el-popover
						placement="bottom-start"
						:width="240"
						trigger="click"
						popper-class="premium-dark-popover"
						:show-arrow="true"
					>
						<template #reference>
							<div class="header-interactive" :class="{ 'is-active': filters.email }">
								<span>Email</span>
								<div class="sort-controls">
									<el-icon
										:class="{ active: filters.sortBy === 'email' && filters.sortOrder === 'ASC' }"
										@click.stop="setSort('email', 'ascending')"
										><CaretTop
									/></el-icon>
									<el-icon
										:class="{ active: filters.sortBy === 'email' && filters.sortOrder === 'DESC' }"
										@click.stop="setSort('email', 'descending')"
										><CaretBottom
									/></el-icon>
								</div>
							</div>
						</template>
						<div class="filter-popover-content">
							<span class="popover-label">Filter by Email</span>
							<el-input v-model="filters.email" placeholder="Enter email..." clearable />
						</div>
					</el-popover>
				</template>
			</el-table-column>

			<!-- Name Column -->
			<el-table-column prop="firstName" label="Full Name" min-width="220">
				<template #header>
					<el-popover
						placement="bottom-start"
						:width="240"
						trigger="click"
						popper-class="premium-dark-popover"
						:show-arrow="true"
					>
						<template #reference>
							<div class="header-interactive" :class="{ 'is-active': filters.name }">
								<span>Full Name</span>
								<div class="sort-controls">
									<el-icon
										:class="{ active: filters.sortBy === 'firstName' && filters.sortOrder === 'ASC' }"
										@click.stop="setSort('firstName', 'ascending')"
										><CaretTop
									/></el-icon>
									<el-icon
										:class="{ active: filters.sortBy === 'firstName' && filters.sortOrder === 'DESC' }"
										@click.stop="setSort('firstName', 'descending')"
										><CaretBottom
									/></el-icon>
								</div>
							</div>
						</template>
						<div class="filter-popover-content">
							<span class="popover-label">Filter by Name</span>
							<el-input v-model="filters.name" placeholder="Enter name..." clearable />
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
			<el-table-column prop="role" label="Role" width="160">
				<template #header>
					<el-popover
						placement="bottom-start"
						:width="240"
						trigger="click"
						popper-class="premium-dark-popover"
						:show-arrow="true"
					>
						<template #reference>
							<div class="header-interactive" :class="{ 'is-active': filters.role && filters.role.length > 0 }">
								<span>{{ getRoleLabels() }}</span>
								<div class="sort-controls">
									<el-icon
										:class="{ active: filters.sortBy === 'role' && filters.sortOrder === 'ASC' }"
										@click.stop="setSort('role', 'ascending')"
										><CaretTop
									/></el-icon>
									<el-icon
										:class="{ active: filters.sortBy === 'role' && filters.sortOrder === 'DESC' }"
										@click.stop="setSort('role', 'descending')"
										><CaretBottom
									/></el-icon>
								</div>
							</div>
						</template>
						<div class="filter-popover-content">
							<span class="popover-label">Filter by Role</span>
							<el-select
								v-model="filters.role"
								multiple
								collapse-tags
								collapse-tags-tooltip
								clearable
								placeholder="Select roles"
								filterable
								popper-class="premium-dark-select"
							>
								<el-option v-for="opt in roleOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
							</el-select>
						</div>
					</el-popover>
				</template>
				<template #default="{ row }">
					<el-tag :type="row.role === 'admin' ? 'danger' : 'info'" size="small" effect="plain">{{ row.role }}</el-tag>
				</template>
			</el-table-column>

			<!-- Status Column -->
			<el-table-column prop="status" label="Status" width="160">
				<template #header>
					<el-popover
						placement="bottom-start"
						:width="240"
						trigger="click"
						popper-class="premium-dark-popover"
						:show-arrow="true"
					>
						<template #reference>
							<div class="header-interactive" :class="{ 'is-active': filters.status && filters.status.length > 0 }">
								<span>{{ getStatusLabels() }}</span>
								<div class="sort-controls">
									<el-icon
										:class="{ active: filters.sortBy === 'status' && filters.sortOrder === 'ASC' }"
										@click.stop="setSort('status', 'ascending')"
										><CaretTop
									/></el-icon>
									<el-icon
										:class="{ active: filters.sortBy === 'status' && filters.sortOrder === 'DESC' }"
										@click.stop="setSort('status', 'descending')"
										><CaretBottom
									/></el-icon>
								</div>
							</div>
						</template>
						<div class="filter-popover-content">
							<span class="popover-label">Filter by Status</span>
							<el-select
								v-model="filters.status"
								multiple
								collapse-tags
								collapse-tags-tooltip
								clearable
								placeholder="Select statuses"
								filterable
								popper-class="premium-dark-select"
							>
								<el-option v-for="opt in statusOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
							</el-select>
						</div>
					</el-popover>
				</template>
				<template #default="{ row }">
					<el-tag :type="row.status === 'active' ? 'success' : 'warning'" size="small" effect="plain">{{
						row.status
					}}</el-tag>
				</template>
			</el-table-column>

			<!-- Phone Column -->
			<el-table-column prop="phone" label="Phone" width="160">
				<template #header>
					<el-popover
						placement="bottom-start"
						:width="240"
						trigger="click"
						popper-class="premium-dark-popover"
						:show-arrow="true"
					>
						<template #reference>
							<div class="header-interactive" :class="{ 'is-active': filters.phone }">
								<span>Phone</span>
							</div>
						</template>
						<div class="filter-popover-content">
							<span class="popover-label">Filter by Phone</span>
							<el-input v-model="filters.phone" placeholder="Enter phone..." clearable />
						</div>
					</el-popover>
				</template>
			</el-table-column>

			<!-- City Column -->
			<el-table-column prop="city" label="City" width="140">
				<template #header>
					<el-popover
						placement="bottom-start"
						:width="240"
						trigger="click"
						popper-class="premium-dark-popover"
						:show-arrow="true"
					>
						<template #reference>
							<div class="header-interactive" :class="{ 'is-active': filters.city }">
								<span>City</span>
							</div>
						</template>
						<div class="filter-popover-content">
							<span class="popover-label">Filter by City</span>
							<el-input v-model="filters.city" placeholder="Enter city..." clearable />
						</div>
					</el-popover>
				</template>
			</el-table-column>

			<el-table-column label="Actions" width="200">
				<template #default="scope">
					<div class="action-buttons">
						<el-button v-if="scope.row" size="small" type="warning" plain @click.stop="openEditModal(scope.row.uuid)">
							Edit
						</el-button>
						<el-button v-if="scope.row" size="small" type="danger" plain @click.stop="confirmDelete(scope.row.uuid)">
							Delete
						</el-button>
					</div>
				</template>
			</el-table-column>
		</el-table>

		<div class="pagination-container">
			<el-pagination
				v-model:current-page="pagination.page"
				v-model:page-size="pagination.limit"
				:total="pagination.total"
				:page-sizes="[10, 20, 50, 100]"
				layout="total, sizes, prev, pager, next, jumper"
				background
				@current-change="setPage"
				@size-change="setlimit"
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
import { CaretTop, CaretBottom } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { useUsers, type IUserResponse } from '#entities/user'
import { UserRole, UserStatus } from '#entities/user/model'
import { useTheme } from '@admin-panel/ui'

const {
	users,
	filters,
	isLoading,
	isFetching,
	pagination,
	openEditModal,
	openDetailDrawer,
	handleDelete,
	setPage,
	setlimit,
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

.header-interactive {
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	transition: all 0.2s ease;
	cursor: pointer;
	user-select: none;
	padding: 12px 16px;
}

.header-interactive:hover {
	background-color: var(--bg-surface);
}

.header-interactive.is-active {
	color: var(--accent-primary);
	background-color: var(--bg-surface);
}

.sort-controls {
	display: flex;
	flex-direction: column;
	transition: opacity 0.2s;
	margin-left: 8px;
	opacity: 0.3;
	gap: 0;
}

.header-interactive:hover .sort-controls {
	opacity: 1;
}

.sort-controls .el-icon {
	font-size: 12px;
	transition: color 0.2s;
	cursor: pointer;
}

.sort-controls .el-icon:hover {
	color: var(--accent-hover);
}

.sort-controls .el-icon.active {
	color: var(--accent-primary);
	opacity: 1;
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

:deep(.premium-dark-popover .el-popper__arrow::before) {
	border: 1px solid #334155 !important;
	background: #1e293b !important;
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

/* Dark Select & Input Overrides */
:deep(.premium-dark-popover .el-input__wrapper),
:deep(.premium-dark-popover .el-select__wrapper) {
	box-shadow: 0 0 0 1px #334155 inset !important;
	background-color: #0f172a !important;
}

:deep(.premium-dark-popover .el-input__inner) {
	color: #f8fafc !important;
}

/* Popover Arrow fix - ensuring it doesn't look like a square */
:deep(.el-popper.is-light.premium-dark-popover .el-popper__arrow::before) {
	border: 1px solid #334155 !important;
	background: #1e293b !important;
}

/* Dark Select Dropdown Styles (often teleported) */
:global(.premium-dark-select) {
	border: 1px solid #334155 !important;
	background-color: #1e293b !important;
}

:global(.premium-dark-select .el-select-dropdown__item) {
	color: #94a3b8 !important;
}

:global(.premium-dark-select .el-select-dropdown__item.hover),
:global(.premium-dark-select .el-select-dropdown__item:hover) {
	color: #f8fafc !important;
	background-color: #334155 !important;
}

:global(.premium-dark-select .el-select-dropdown__item.selected) {
	color: #409eff !important;
	background-color: #0f172a !important;
}

:global(.premium-dark-select .el-popper__arrow::before) {
	border: 1px solid #334155 !important;
	background: #1e293b !important;
}

.action-buttons {
	display: flex;
	justify-content: center;
	gap: 8px;
}
</style>
