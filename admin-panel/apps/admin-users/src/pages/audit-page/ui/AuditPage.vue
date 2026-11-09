<template>
	<div class="audit-page glass-card">
		<div class="header">
			<h1>Audit Log</h1>
			<p>История действий администраторов — кто, что и когда изменил</p>
		</div>

		<div class="filters-row">
			<el-select v-model="filters.action" class="filter-select" clearable placeholder="Действие">
				<el-option v-for="opt in actionOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
			</el-select>

			<el-select v-model="filters.entityType" class="filter-select" clearable placeholder="Тип сущности">
				<el-option v-for="opt in entityTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
			</el-select>

			<el-button :disabled="!filters.action && !filters.entityType" @click="resetFilters">Сбросить</el-button>
		</div>

		<UiTable
			v-model:page="pagination.page"
			v-model:limit="pagination.limit"
			border
			class="ui-table"
			:data="entries"
			:loading="isLoading"
			:total="pagination.total"
			@update:page="setPage"
			@update:limit="setLimit"
		>
			<UiTableColumn label="Дата" min-width="170">
				<template #default="{ row }">
					{{ new Date(row.createdAt).toLocaleString() }}
				</template>
			</UiTableColumn>

			<UiTableColumn label="Кто" min-width="200">
				<template #default="{ row }">
					<span v-if="row.actorEmail">{{ row.actorEmail }}</span>
					<span v-else class="muted">—</span>
				</template>
			</UiTableColumn>

			<UiTableColumn label="Действие" min-width="180" prop="action">
				<template #default="{ row }">
					<el-tag :type="actionTagType(row.action)" effect="plain" size="small">{{ row.action }}</el-tag>
				</template>
			</UiTableColumn>

			<UiTableColumn label="Сущность" min-width="160">
				<template #default="{ row }">
					<span v-if="row.entityType"
						>{{ row.entityType }}<span v-if="row.entityId">: {{ row.entityId }}</span></span
					>
					<span v-else class="muted">—</span>
				</template>
			</UiTableColumn>

			<UiTableColumn label="Детали" min-width="260">
				<template #default="{ row }">
					<pre v-if="row.payload" class="payload-cell">{{ JSON.stringify(row.payload, null, 2) }}</pre>
					<span v-else class="muted">—</span>
				</template>
			</UiTableColumn>
		</UiTable>
	</div>
</template>

<script setup lang="ts">
import { UiTable, UiTableColumn } from '@admin-panel/ui'

import { useAuditLog } from '../lib/useAuditLog'

const { entries, filters, isLoading, pagination, setPage, setLimit, resetFilters } = useAuditLog()

const actionOptions = [
	{ value: 'user.create', label: 'user.create' },
	{ value: 'user.update', label: 'user.update' },
	{ value: 'user.delete', label: 'user.delete' },
	{ value: 'role.permissions_update', label: 'role.permissions_update' },
	{ value: 'media.delete', label: 'media.delete' },
	{ value: 'media.delete_all', label: 'media.delete_all' },
	{ value: 'auth.login', label: 'auth.login' },
	{ value: 'auth.logout', label: 'auth.logout' },
]

const entityTypeOptions = [
	{ value: 'user', label: 'user' },
	{ value: 'role', label: 'role' },
	{ value: 'media', label: 'media' },
	{ value: 'session', label: 'session' },
]

const actionTagType = (action: string | undefined) => {
	// UiTable renders skeleton placeholder rows (no `action` field at all) while
	// isLoading is true and entries is still empty — without this guard, that first
	// render throws here and corrupts the whole table's vnode tree (Element Plus then
	// fails to patch in the real rows once they arrive).
	if (!action) return 'info'
	if (action.endsWith('.delete') || action.endsWith('.delete_all')) return 'danger'
	if (action.endsWith('.create')) return 'success'
	if (action.endsWith('.update') || action.endsWith('_update')) return 'warning'
	return 'info'
}
</script>

<style scoped>
.audit-page {
	min-height: 400px;
	padding: 24px;
}

.header {
	margin-bottom: 24px;
}

.header h1 {
	font-size: 1.5rem;
	color: var(--text-primary);
	margin: 0;
}

.header p {
	color: var(--gp-text-secondary);
	margin: 8px 0 0;
}

.filters-row {
	display: flex;
	margin-bottom: 20px;
	gap: 12px;
}

.filter-select {
	width: 220px;
}

.muted {
	color: var(--gp-text-secondary);
}

.payload-cell {
	max-width: 100%;
	max-height: 120px;
	font-size: 12px;
	white-space: pre-wrap;
	margin: 0;
	overflow: auto;
	overflow-wrap: break-word;
}
</style>
