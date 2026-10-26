<template>
	<el-card v-loading="isLoading" class="mfe-list-card glass-card">
		<template #header>
			<div class="card-header">
				<div class="header-left">
					<span class="header-title">Список микрофронтендов и сервисов</span>
					<span class="header-subtitle">Управление состоянием, роутингом и мониторинг доступности</span>
				</div>

				<div class="header-actions">
					<el-tooltip content="Автоматический пинг каждые 15 секунд" placement="top">
						<div class="auto-ping-wrapper">
							<span class="auto-ping-label">Авто-пинг</span>
							<el-switch v-model="health.isAutoPingActive" size="small" />
						</div>
					</el-tooltip>

					<el-button
						:icon="Refresh"
						:loading="health.isCheckingAll"
						size="small"
						type="info"
						plain
						@click="health.checkAllHealth"
					>
						Пинговать все
					</el-button>

					<el-button size="small" type="primary" @click="mfe.handleCreate">
						<el-icon><Plus /></el-icon>
						Добавить MFE
					</el-button>
				</div>
			</div>
		</template>

		<UiTable :data="microfrontends" style="width: 100%">
			<!-- Module Column -->
			<el-table-column label="Модуль" min-width="190">
				<template #default="scope">
					<div class="mfe-name-cell">
						<el-icon class="mfe-icon">
							<component :is="getIcon(scope.row.icon)" />
						</el-icon>
						<div>
							<div class="mfe-display-name">{{ scope.row.displayName }}</div>
							<div class="mfe-id">{{ scope.row.name }}</div>
						</div>
					</div>
				</template>
			</el-table-column>

			<!-- URL Column -->
			<el-table-column label="Entry Point URL" prop="url" show-overflow-tooltip width="220">
				<template #default="scope">
					<a v-if="scope.row.url" class="mfe-url-link" :href="scope.row.url" rel="noopener noreferrer" target="_blank">
						<el-icon><Link /></el-icon>
						{{ scope.row.url }}
					</a>
					<span v-else class="mfe-url-empty">—</span>
				</template>
			</el-table-column>

			<!-- Category Column -->
			<el-table-column label="Категория" width="110">
				<template #default="scope">
					<el-tag size="small" :type="scope.row.category === 'system' ? 'info' : 'warning'">
						{{ scope.row.category }}
					</el-tag>
				</template>
			</el-table-column>

			<!-- Version Column -->
			<el-table-column label="Версия" width="90">
				<template #default="scope">
					<el-tag v-if="scope.row.version" size="small" type="info"> v{{ scope.row.version }} </el-tag>
					<span v-else class="mfe-url-empty">—</span>
				</template>
			</el-table-column>

			<!-- Health & Status Column -->
			<el-table-column label="Статус" width="190">
				<template #default="scope">
					<div class="status-indicator-wrapper">
						<div
							class="status-dot"
							:class="{
								'status-dot--online': health.getStatus(scope.row) === 'online',
								'status-dot--offline': health.getStatus(scope.row) === 'offline',
								'status-dot--loading': health.getStatus(scope.row) === 'checking',
							}"
						/>
						<div v-if="scope.row.name === 'orchestrator' && health.backendHealth" class="health-badges">
							<el-tooltip :content="`Database connection: ${health.backendHealth.db}`" placement="top">
								<el-tag :type="health.backendHealth.db === 'ok' ? 'success' : 'danger'" size="small">DB</el-tag>
							</el-tooltip>
							<el-tooltip :content="`Redis connection: ${health.backendHealth.redis}`" placement="top">
								<el-tag :type="health.backendHealth.redis === 'ok' ? 'success' : 'danger'" size="small">RD</el-tag>
							</el-tooltip>
						</div>
						<div v-else class="health-simple-status">
							<span v-if="health.getStatus(scope.row) === 'online'" class="status-text online">Online</span>
							<span v-else-if="health.getStatus(scope.row) === 'offline'" class="status-text offline">Offline</span>
							<span v-else class="status-text checking">Проверка...</span>
						</div>

						<!-- Quick Ping Button -->
						<el-tooltip content="Проверить доступность прямо сейчас" placement="top">
							<el-button
								circle
								:icon="Refresh"
								:loading="health.healthMap[scope.row.url]?.status === 'checking'"
								size="small"
								text
								@click="health.checkHealth(scope.row.url)"
							/>
						</el-tooltip>
					</div>
				</template>
			</el-table-column>

			<!-- Latency Column -->
			<el-table-column label="Latency" width="105">
				<template #default="scope">
					<div
						v-if="
							health.healthMap[scope.row.url]?.latency !== undefined &&
							health.healthMap[scope.row.url]?.latency !== null
						"
					>
						<el-tag :type="health.getLatencyType(health.healthMap[scope.row.url].latency)" effect="light" size="small">
							{{ health.healthMap[scope.row.url].latency }} ms
						</el-tag>
					</div>
					<span v-else class="mfe-url-empty">—</span>
				</template>
			</el-table-column>

			<!-- Chunk Size Column -->
			<el-table-column label="Размер чанка" width="125">
				<template #default="scope">
					<div v-if="health.healthMap[scope.row.url]?.chunkSize">
						<el-tag effect="plain" size="small" type="info">
							{{ health.formatBytes(health.healthMap[scope.row.url].chunkSize) }}
						</el-tag>
					</div>
					<span v-else class="mfe-url-empty">—</span>
				</template>
			</el-table-column>

			<!-- Feature Flag / Enabled Switch -->
			<el-table-column label="MFE Активен" width="120">
				<template #default="scope">
					<el-tooltip :content="scope.row.enabled ? 'Отключить MFE в Shell' : 'Включить MFE в Shell'" placement="top">
						<el-switch
							:disabled="scope.row.name === 'orchestrator'"
							:model-value="scope.row.enabled"
							active-color="var(--gp-primary)"
							@change="mfe.toggleEnabled(scope.row)"
						/>
					</el-tooltip>
				</template>
			</el-table-column>

			<!-- Sub-routes & Menu Items Control -->
			<el-table-column label="Пункты меню" width="140">
				<template #default="scope">
					<el-button
						plain
						size="small"
						:type="routes.getDisabledCount(scope.row) > 0 ? 'warning' : 'default'"
						@click="routes.openRoutesDrawer(scope.row)"
					>
						<el-icon><Menu /></el-icon>
						<span>Меню</span>
						<el-badge
							v-if="routes.getDisabledCount(scope.row) > 0"
							class="routes-badge"
							:value="`-${routes.getDisabledCount(scope.row)}`"
						/>
					</el-button>
				</template>
			</el-table-column>

			<!-- Actions Column -->
			<el-table-column fixed="right" label="Действия" width="140">
				<template #default="scope">
					<div class="action-btns">
						<el-tooltip content="Редактировать" placement="top">
							<el-button
								circle
								:disabled="scope.row.name === 'orchestrator'"
								size="small"
								type="primary"
								@click="mfe.handleEdit(scope.row)"
							>
								<el-icon><EditPen /></el-icon>
							</el-button>
						</el-tooltip>
						<el-tooltip content="Сбросить кэш и перезагрузить" placement="top">
							<el-button circle size="small" type="warning" @click="health.handleHotReload(scope.row)">
								<el-icon><RefreshRight /></el-icon>
							</el-button>
						</el-tooltip>
						<el-tooltip content="Удалить" placement="top">
							<el-button
								circle
								:disabled="scope.row.name === 'orchestrator'"
								size="small"
								type="danger"
								@click="mfe.handleDelete(scope.row)"
							>
								<el-icon><Delete /></el-icon>
							</el-button>
						</el-tooltip>
					</div>
				</template>
			</el-table-column>
		</UiTable>
	</el-card>
</template>

<script setup lang="ts">
import { UiTable } from '@admin-panel/ui'
import * as Icons from '@element-plus/icons-vue'
import { Delete, EditPen, Link, Menu, Plus, Refresh, RefreshRight } from '@element-plus/icons-vue'

import type { ModuleHealth } from '../composables/useModuleHealth'
import type { ModuleRoutes } from '../composables/useModuleRoutes'

defineProps<{
	microfrontends: any[]
	isLoading: boolean
	health: ModuleHealth
	routes: ModuleRoutes
	mfe: {
		handleCreate: () => void
		handleEdit: (row: any) => void
		handleDelete: (row: any) => void
		toggleEnabled: (row: any) => void
	}
}>()

const getIcon = (name: string) => (Icons as any)[name] || Icons.Menu
</script>

<style scoped lang="scss">
.card-header {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
}

.header-left {
	display: flex;
	flex-direction: column;
}

.header-title {
	font-weight: 600;
	font-size: 1.1rem;
	color: var(--gp-text-main, #fff);
}

.header-subtitle {
	font-size: 0.8rem;
	color: var(--gp-text-secondary, #a0aec0);
	margin-top: 2px;
}

.header-actions {
	display: flex;
	align-items: center;
	gap: 12px;
}

.auto-ping-wrapper {
	display: flex;
	align-items: center;
	border: 1px solid rgb(255, 255, 255, 0.06);
	border-radius: 6px;
	background: rgb(255, 255, 255, 0.04);
	padding: 4px 10px;
	gap: 6px;
}

.auto-ping-label {
	font-size: 0.75rem;
	color: var(--gp-text-secondary, #a0aec0);
}

.mfe-name-cell {
	display: flex;
	align-items: center;
	gap: 12px;
}

.mfe-icon {
	width: 36px;
	height: 36px;
	display: flex;
	flex-shrink: 0;
	align-items: center;
	justify-content: center;
	border-radius: 10px;
	font-size: 18px;
	color: var(--gp-primary, #42b883);
	background: var(--gp-primary-light, rgb(66, 184, 131, 0.1));
}

.mfe-display-name {
	font-weight: 500;
	color: var(--gp-text-main, #fff);
}

.mfe-id {
	font-family: monospace;
	font-size: 0.75rem;
	color: var(--gp-text-secondary, #a0aec0);
}

.mfe-url-link {
	display: flex;
	align-items: center;
	font-size: 0.8rem;
	text-decoration: none;
	color: var(--gp-primary, #42b883);
	transition: opacity 0.2s;
	gap: 4px;

	&:hover {
		opacity: 0.8;
	}
}

.mfe-url-empty {
	color: var(--gp-text-disabled, #4a5568);
}

.action-btns {
	display: flex;
	align-items: center;
	gap: 6px;
}

.status-indicator-wrapper {
	display: flex;
	align-items: center;
	gap: 8px;
}

.status-dot {
	width: 9px;
	height: 9px;
	border-radius: 50%;
	background-color: var(--gp-text-disabled, #4a5568);
	transition: background-color 0.3s ease;

	&--online {
		box-shadow: 0 0 8px var(--gp-primary, #42b883);
		background-color: var(--gp-primary, #42b883);
	}

	&--offline {
		box-shadow: 0 0 8px #ff5f5f;
		background-color: #ff5f5f;
	}

	&--loading {
		background-color: #f59e0b;
		animation: pulse 1.5s infinite;
	}
}

@keyframes pulse {
	0% {
		opacity: 1;
	}

	50% {
		opacity: 0.4;
	}

	100% {
		opacity: 1;
	}
}

.health-badges {
	display: flex;
	gap: 4px;
}

.health-simple-status {
	min-width: 55px;
	font-weight: 500;
	font-size: 0.8rem;
}

.status-text.online {
	color: var(--gp-primary, #42b883);
}

.status-text.offline {
	color: #ff5f5f;
}

.status-text.checking {
	color: #f59e0b;
}

.routes-badge {
	margin-left: 6px;
}
</style>
