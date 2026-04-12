<template>
	<div class="users-filters">
		<el-select v-model="filters.status" clearable placeholder="Status">
			<el-option v-for="opt in statusOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
		</el-select>

		<el-select v-model="filters.role" clearable placeholder="Role">
			<el-option v-for="opt in roleOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
		</el-select>

		<el-input v-model="filters.search" placeholder="Search by email/name" clearable />

		<el-button type="primary" @click="openAddModal">Add user</el-button>

		<TempAuth />
	</div>
</template>

<script setup lang="ts">
import { useUsers } from '#entities/user/lib/composables'
import { UserRole, UserStatus } from '#entities/user/model'
import TempAuth from '#features/temp-auth/TempAuth.vue'

const { filters, openAddModal } = useUsers()

const statusOptions = [
	{ value: UserStatus.Active, label: 'Active' },
	{ value: UserStatus.Inactive, label: 'Inactive' },
	{ value: UserStatus.InModeration, label: 'In moderation' },
]

const roleOptions = [
	{ value: UserRole.Admin, label: 'Admin' },
	{ value: UserRole.User, label: 'User' },
]
</script>

<style scoped>
.users-filters {
	display: flex;
	flex-wrap: wrap;
	align-items: end;
	margin-bottom: 24px;
	gap: 16px;
}

.users-filters .el-input,
.users-filters .el-select {
	width: 200px;
}
</style>
