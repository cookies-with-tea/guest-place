<template>
	<div id="__MF_USERS_PAGE__" class="users-page">
		<h1>MF Users</h1>

		<UsersFilters />
		<UsersTable />
		<UsersUpdateModal />
	</div>
</template>

<script setup lang="ts">
import { useUsers } from '#entities/user/lib/composables'
import { UsersFilters } from '#features/users-filters'
import { UsersUpdateModal } from '#features/users-update-modal'
import { UsersTable } from '#features/users-table'

useUsers()
</script>

<style scoped>
.users-page {
	padding: 24px;
}
</style>
