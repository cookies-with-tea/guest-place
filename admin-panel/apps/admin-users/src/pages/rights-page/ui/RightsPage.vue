<template>
	<div class="rights-page glass-card">
		<div class="header">
			<h1>Rights Management</h1>
			<p>Матрица прав: роли и разрешения, которые им доступны</p>
		</div>

		<div class="filters-row">
			<el-input v-model="search" class="search-input" clearable placeholder="Поиск по правам..." />
		</div>

		<div v-if="loading" class="loading-state">
			<el-skeleton animated :rows="8" />
		</div>

		<div v-else class="matrix-wrapper">
			<table class="matrix">
				<thead>
					<tr>
						<th class="matrix__perm-col">Разрешение</th>
						<th v-for="role in roles" :key="role" class="matrix__role-col">{{ role.toUpperCase() }}</th>
					</tr>
				</thead>

				<template v-for="group in groups" :key="group.module">
					<tbody>
						<tr class="matrix__group-row">
							<td :colspan="roles.length + 1">{{ moduleLabel(group.module) }}</td>
						</tr>

						<tr v-for="perm in group.permissions" :key="perm.id" class="matrix__perm-row">
							<td class="matrix__perm-col">
								<el-tooltip v-if="perm.description" :content="perm.description" placement="right">
									<div class="perm-label">
										<span class="perm-label__name">{{ perm.name }}</span>
										<span class="perm-label__id">{{ perm.id }}</span>
									</div>
								</el-tooltip>
								<div v-else class="perm-label">
									<span class="perm-label__name">{{ perm.name }}</span>
									<span class="perm-label__id">{{ perm.id }}</span>
								</div>
							</td>

							<td v-for="role in roles" :key="role" class="matrix__role-col">
								<el-checkbox :model-value="isChecked(role, perm.id)" @update:model-value="toggle(role, perm.id)" />
							</td>
						</tr>
					</tbody>
				</template>
			</table>

			<p v-if="!groups.length" class="empty-state">Ничего не найдено</p>
		</div>

		<div class="actions">
			<el-button :disabled="!isDirty" :loading="saving" type="primary" @click="save"> Save Changes </el-button>
			<el-button :disabled="!isDirty" @click="reset">Reset</el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

import { moduleLabel, useRightsMatrix } from '../lib/useRightsMatrix'

const { roles, groups, search, loading, saving, isDirty, isChecked, toggle, save, reset, loadData } = useRightsMatrix()

onMounted(loadData)
</script>

<style scoped>
.rights-page {
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
	align-items: center;
	margin-bottom: 20px;
}

.search-input {
	width: 320px;
}

.search-input :deep(.el-input__wrapper) {
	border: 1px solid var(--border-color);
	border-radius: 12px;
	box-shadow: none;
	background-color: var(--bg-surface);
	padding: 8px 16px;
}

.search-input :deep(.el-input__inner) {
	height: 40px;
	color: var(--text-primary);
}

/* Без темы element-plus svg-иконка suffix (clear-крестик) не имеет собственного
   размера (нет width/height атрибутов, только viewBox) — без explicit constraint
   браузер рендерит её в дефолтном replaced-element размере (~300px), раздувая
   высоту строки инпута. */
.search-input :deep(.el-input__icon svg) {
	width: 14px;
	height: 14px;
}

.loading-state {
	padding: 40px 0;
}

.matrix-wrapper {
	border: 1px solid var(--border-color);
	border-radius: 16px;
	box-shadow: var(--shadow-sm);
	overflow-x: auto;
}

.matrix {
	width: 100%;
	border-collapse: collapse;
}

.matrix thead th {
	height: 56px;
	border-bottom: 1px solid var(--border-color);
	font-weight: 700;
	font-size: 0.85rem;
	text-align: left;
	color: var(--text-muted);
	background-color: var(--bg-header);
	padding: 0 16px;
}

.matrix__perm-col {
	min-width: 260px;
}

.matrix__role-col {
	min-width: 110px;
	text-align: center;
}

.matrix__group-row td {
	font-weight: 700;
	font-size: 0.75rem;
	letter-spacing: 0.04em;
	text-transform: uppercase;
	color: var(--text-muted);
	background-color: var(--bg-header);
	padding: 10px 16px;
}

.matrix__perm-row {
	border-bottom: 1px solid var(--border-color);
}

.matrix__perm-row td {
	padding: 12px 16px;
}

.matrix__perm-row:hover {
	background-color: var(--bg-surface);
}

.perm-label {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.perm-label__name {
	color: var(--text-primary);
}

.perm-label__id {
	font-family: monospace;
	font-size: 0.75rem;
	color: var(--gp-text-secondary);
}

.empty-state {
	text-align: center;
	color: var(--gp-text-secondary);
	padding: 32px;
}

.actions {
	display: flex;
	margin-top: 24px;
	gap: 12px;
}
</style>
