<template>
	<div class="table-card">
		<el-table v-loading="redirects.loading" :data="redirects.filteredRedirects" style="width: 100%">
			<el-table-column label="Исходный путь (Source)" min-width="200">
				<template #default="{ row }">
					<div class="path-cell">
						<code class="source-path">{{ row.sourcePath }}</code>
						<el-button size="small" text :icon="DocumentCopy" @click="redirects.copyPath(row.sourcePath)" />
					</div>
				</template>
			</el-table-column>

			<el-table-column label="→" width="50" align="center">
				<template #default>
					<el-icon class="arrow-icon"><Right /></el-icon>
				</template>
			</el-table-column>

			<el-table-column label="Целевой путь (Target)" min-width="220">
				<template #default="{ row }">
					<div class="path-cell">
						<code class="target-path">{{ row.targetPath }}</code>
						<el-button size="small" text :icon="DocumentCopy" @click="redirects.copyPath(row.targetPath)" />
					</div>
				</template>
			</el-table-column>

			<el-table-column label="Тип редиректа" width="160" align="center">
				<template #default="{ row }">
					<el-tag :type="row.statusCode === 301 ? 'success' : 'warning'" effect="light">
						{{ row.statusCode === 301 ? '301 Permanent' : '302 Temporary' }}
					</el-tag>
				</template>
			</el-table-column>

			<el-table-column label="Переходов" width="130" align="center">
				<template #default="{ row }">
					<span class="hits-counter"
						><el-icon class="hits-counter__icon"><View /></el-icon> {{ row.hits || 0 }}</span
					>
				</template>
			</el-table-column>

			<el-table-column label="Активен" width="100" align="center">
				<template #default="{ row }">
					<el-switch v-model="row.isActive" @change="(val: boolean) => redirects.toggleActive(row, val)" />
				</template>
			</el-table-column>

			<el-table-column label="Действия" width="220" align="right">
				<template #default="{ row }">
					<el-button size="small" plain type="info" :icon="Lightning" @click="redirects.testRedirect(row)">
						Проверить
					</el-button>
					<el-button size="small" plain @click="redirects.openEditDialog(row)"> Изменить </el-button>
					<el-button size="small" plain type="danger" :icon="Close" @click="redirects.confirmDelete(row)" />
				</template>
			</el-table-column>
		</el-table>
	</div>
</template>

<script setup lang="ts">
import { Close, DocumentCopy, Lightning, Right, View } from '@element-plus/icons-vue'

import type { RedirectsData } from '../../composables/useRedirectsData'

defineProps<{
	redirects: RedirectsData
}>()
</script>

<style scoped>
.table-card {
	border: 1px solid var(--border-color);
	border-radius: 12px;
	background: var(--bg-card);
	overflow: hidden;
}

:deep(.el-table) {
	--el-table-header-bg-color: var(--bg-surface);
	--el-table-row-hover-bg-color: rgb(255, 255, 255, 0.05);
	--el-table-border-color: var(--border-color);
	--el-table-bg-color: transparent;
	--el-table-tr-bg-color: transparent;
	--el-table-text-color: var(--text-primary);
	--el-table-header-text-color: var(--text-muted);

	color: var(--text-primary);
	background-color: transparent !important;
}

:deep(.el-table th.el-table__cell) {
	border-bottom: 1px solid var(--border-color) !important;
	color: var(--text-muted) !important;
	background-color: var(--bg-surface) !important;
}

:deep(.el-table td.el-table__cell) {
	border-bottom: 1px solid var(--border-color) !important;
}

:deep(.el-table tr) {
	background-color: transparent !important;
}

.path-cell {
	display: flex;
	align-items: center;
	gap: 6px;
}

.source-path {
	border: 1px solid rgb(239, 68, 68, 0.3);
	border-radius: 4px;
	font-family: monospace;
	font-size: 13px;
	color: #f87171;
	background: rgb(239, 68, 68, 0.15);
	padding: 2px 6px;
}

.target-path {
	border: 1px solid rgb(34, 197, 94, 0.3);
	border-radius: 4px;
	font-family: monospace;
	font-size: 13px;
	color: #4ade80;
	background: rgb(34, 197, 94, 0.15);
	padding: 2px 6px;
}

.hits-counter {
	display: inline-flex;
	align-items: center;
	border: 1px solid var(--border-color);
	border-radius: 12px;
	font-weight: 600;
	font-size: 12px;
	color: var(--text-primary);
	background: var(--bg-surface);
	padding: 2px 8px;
	gap: 4px;
}

.hits-counter__icon {
	width: 1em;
	height: 1em;
	flex-shrink: 0;
}

.arrow-icon {
	width: 16px;
	height: 16px;
	color: #9ca3af;
}
</style>
