<template>
	<div id="__MF_USERS_PAGE__" class="users-page">
		<h1>{{ t('users.title') }}</h1>
		<div style="display: none"> useI18n().t(): {{ t('platforms.tools.title') }} </div>
		<div style="display: none"> $T(): {{ $T('platforms.tools.title') }} </div>
		<UsersFilters />
		<UsersTable />
		<UsersUpdateModal />
		<DrawerDetailUser />
	</div>
</template>

<script setup lang="ts">
import { useI18n } from '@admin-panel/i18n'
import { useTheme } from '@admin-panel/ui'

import { UsersFilters } from '#features/users-filters'
import { UsersTable } from '#features/users-table'
import { UsersUpdateModal } from '#features/users-update-modal'

import { DrawerDetailUser } from './components/drawer-detail-user'

const { t } = useI18n()

useTheme()
</script>

<style scoped>
.users-page {
	min-height: 100vh;
	color: var(--text-primary);
	background-color: var(--bg-page);
	transition: all 0.3s ease;
	padding: 32px;
}

.users-page h1 {
	font-weight: 800;
	font-size: 32px;
	letter-spacing: -0.02em;
	color: var(--text-primary);
	margin: 0 0 32px 4px;
}
</style>
