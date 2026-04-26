<template>
	<div id="__MF_ORCHESTRATOR_PAGE__" class="orchestrator-page">
		<div class="page-header">
			<div class="page-header__title">
				<h1>Оркестрация Микрофронтендов</h1>
				<p class="page-header__subtitle">Управление и мониторинг всех подключённых модулей</p>
			</div>
		</div>

		<!-- Stats Cards -->
		<div v-if="!isLoading" class="stats-row">
			<div class="stat-card glass-card">
				<div class="stat-card__icon stat-card__icon--total">
					<el-icon><Grid /></el-icon>
				</div>
				<div class="stat-card__body">
					<span class="stat-card__value">{{ stats.total }}</span>
					<span class="stat-card__label">Всего модулей</span>
				</div>
			</div>
			<div class="stat-card glass-card">
				<div class="stat-card__icon stat-card__icon--online">
					<el-icon><CircleCheck /></el-icon>
				</div>
				<div class="stat-card__body">
					<span class="stat-card__value stat-card__value--online">{{ stats.online }}</span>
					<span class="stat-card__label">Активных</span>
				</div>
			</div>
			<div class="stat-card glass-card">
				<div class="stat-card__icon stat-card__icon--offline">
					<el-icon><CircleClose /></el-icon>
				</div>
				<div class="stat-card__body">
					<span class="stat-card__value stat-card__value--offline">{{ stats.offline }}</span>
					<span class="stat-card__label">Отключённых</span>
				</div>
			</div>
			<div class="stat-card glass-card">
				<div class="stat-card__icon stat-card__icon--system">
					<el-icon><Setting /></el-icon>
				</div>
				<div class="stat-card__body">
					<span class="stat-card__value">{{ stats.system }}</span>
					<span class="stat-card__label">Системных</span>
				</div>
			</div>
			<div class="stat-card glass-card">
				<div class="stat-card__icon stat-card__icon--website">
					<el-icon><Monitor /></el-icon>
				</div>
				<div class="stat-card__body">
					<span class="stat-card__value">{{ stats.website }}</span>
					<span class="stat-card__label">Сайтовых</span>
				</div>
			</div>
		</div>

		<!-- Skeleton for stats -->
		<div v-else class="stats-row">
			<div v-for="i in 5" :key="i" class="skeleton-card" style="height: 88px" />
		</div>

		<el-tabs v-model="activeTab" class="orchestrator-tabs">
			<!-- Вкладка Топология -->
			<el-tab-pane label="Топология" name="topology">
				<el-card v-loading="isLoading" class="stats-card glass-card">
					<template #header>
						<div class="card-header">
							<span>Карта системы (D3.js Visualization)</span>
						</div>
					</template>
					<MfeStatsChart :data="chartData" />
				</el-card>
			</el-tab-pane>

			<!-- Вкладка Микрофронтенды -->
			<el-tab-pane label="Модули (MFE)" name="modules">
				<el-card v-loading="isLoading" class="mfe-list-card glass-card">
					<template #header>
						<div class="card-header">
							<span>Список подключенных модулей</span>
							<el-button size="small" type="primary" @click="handleCreate">
								<el-icon><Plus /></el-icon>
								Добавить MFE
							</el-button>
						</div>
					</template>

					<UiTable :data="microfrontends" style="width: 100%">
						<el-table-column label="Модуль" min-width="180">
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

						<el-table-column label="URL" prop="url" show-overflow-tooltip width="220">
							<template #default="scope">
								<a
									v-if="scope.row.url"
									class="mfe-url-link"
									:href="scope.row.url"
									rel="noopener noreferrer"
									target="_blank"
								>
									<el-icon><Link /></el-icon>
									{{ scope.row.url }}
								</a>
								<span v-else class="mfe-url-empty">—</span>
							</template>
						</el-table-column>

						<el-table-column label="Категория" width="110">
							<template #default="scope">
								<el-tag size="small" :type="scope.row.category === 'system' ? 'info' : 'warning'">
									{{ scope.row.category }}
								</el-tag>
							</template>
						</el-table-column>

						<el-table-column align="center" label="Порядок" prop="orderIndex" width="90" />

						<el-table-column align="center" label="Статус" width="100">
							<template #default="scope">
								<el-tooltip
									:content="scope.row.enabled ? 'Нажмите чтобы отключить' : 'Нажмите чтобы включить'"
									placement="top"
								>
									<el-switch
										:disabled="scope.row.name === 'orchestrator'"
										:model-value="scope.row.enabled"
										:active-color="'var(--gp-primary)'"
										@change="toggleEnabled(scope.row)"
									/>
								</el-tooltip>
							</template>
						</el-table-column>

						<el-table-column label="Действия" width="150">
							<template #default="scope">
								<div class="action-btns">
									<el-tooltip content="Редактировать" placement="top">
										<el-button
											circle
											:disabled="scope.row.name === 'orchestrator'"
											size="small"
											type="primary"
											@click="handleEdit(scope.row)"
										>
											<el-icon><EditPen /></el-icon>
										</el-button>
									</el-tooltip>
									<el-tooltip content="Удалить" placement="top">
										<el-button
											circle
											:disabled="scope.row.name === 'orchestrator'"
											size="small"
											type="danger"
											@click="handleDelete(scope.row)"
										>
											<el-icon><Delete /></el-icon>
										</el-button>
									</el-tooltip>
								</div>
							</template>
						</el-table-column>
					</UiTable>
				</el-card>
			</el-tab-pane>
		</el-tabs>

		<!-- Dialog for Add/Edit -->
		<UiModal v-model="dialogVisible" :title="isEdit ? 'Редактировать MFE' : 'Добавить MFE'" width="560px">
			<el-form class="mfe-form" label-position="top" :model="form">
				<el-row :gutter="16">
					<el-col :span="12">
						<el-form-item label="ID (name)">
							<el-input v-model="form.name" :disabled="isEdit" placeholder="напр. admin-about" />
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="Отображаемое название">
							<el-input v-model="form.displayName" placeholder="напр. About Page" />
						</el-form-item>
					</el-col>
				</el-row>

				<el-form-item label="URL (entry point)">
					<el-input v-model="form.url" placeholder="http://localhost:3006/assets/remoteEntry.js">
						<template #prefix>
							<el-icon><Link /></el-icon>
						</template>
					</el-input>
				</el-form-item>

				<el-row :gutter="16">
					<el-col :span="12">
						<el-form-item label="Scope">
							<el-input v-model="form.scope" placeholder="about" />
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="Module">
							<el-input v-model="form.module" placeholder="./AboutRoutes" />
						</el-form-item>
					</el-col>
				</el-row>

				<el-row :gutter="16">
					<el-col :span="8">
						<el-form-item label="Icon (Element Plus)">
							<el-input v-model="form.icon" placeholder="EditPen">
								<template #prefix>
									<el-icon><component :is="getIcon(form.icon)" /></el-icon>
								</template>
							</el-input>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="Категория">
							<el-select v-model="form.category" style="width: 100%">
								<el-option label="System" value="system" />
								<el-option label="Website" value="website" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="Порядок">
							<el-input-number v-model="form.orderIndex" :max="100" :min="0" style="width: 100%" />
						</el-form-item>
					</el-col>
				</el-row>

				<el-form-item label="Активен">
					<el-switch v-model="form.enabled" :disabled="form.name === 'orchestrator'" />
				</el-form-item>
			</el-form>

			<template #footer>
				<el-button plain @click="dialogVisible = false">Отмена</el-button>
				<el-button :loading="isSubmitting" type="primary" @click="saveMfe">
					{{ isEdit ? 'Сохранить изменения' : 'Создать' }}
				</el-button>
			</template>
		</UiModal>
	</div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue'

import * as Icons from '@element-plus/icons-vue'
import { CircleCheck, CircleClose, Delete, EditPen, Grid, Link, Monitor, Plus, Setting } from '@element-plus/icons-vue'
import { UiModal, UiTable } from '@admin-panel/ui'

import { useMfe } from '../../../entities/mfe/lib/composables/useMfe'

const MfeStatsChart = defineAsyncComponent(() => import('./MfeStatsChart.vue'))

const activeTab = ref('topology')

const {
	microfrontends,
	isLoading,
	dialogVisible,
	isEdit,
	form,
	stats,
	isSubmitting,
	handleCreate,
	handleEdit,
	handleDelete,
	toggleEnabled,
	saveMfe,
} = useMfe()

const chartData = computed(() => {
	const nodes = [
		{ id: 'Shell', group: 1, status: 'online' as const },
		...(microfrontends.value || []).map((m: any) => {
			const mId = m.displayName || m.name || `mfe-${m.id}`

			return {
				id: mId,
				group: 2,
				status: m.enabled ? ('online' as const) : ('offline' as const),
			}
		}),
	]

	const links = (microfrontends.value || []).map((m: any) => {
		const mId = m.displayName || m.name || `mfe-${m.id}`

		return {
			source: 'Shell',
			target: mId,
			value: 2,
		}
	})

	return { nodes, links }
})

const getIcon = (name: string) => {
	return (Icons as any)[name] || Icons.Menu
}
</script>

<style scoped>
.orchestrator-page {
	height: 100%;
	display: flex;
	flex-direction: column;
	gap: 24px;
}

.page-header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
}

.page-header h1 {
	font-weight: 700;
	font-size: 1.6rem;
	color: var(--gp-text-main);
	margin-bottom: 4px;
}

.page-header__subtitle {
	font-size: 0.9rem;
	color: var(--gp-text-secondary);
}

/* Stats Row */
.stats-row {
	display: grid;
	grid-template-columns: repeat(5, 1fr);
	gap: 16px;
}

.stat-card {
	display: flex;
	align-items: center;
	transition: transform 0.2s ease;
	padding: 20px;
	gap: 16px;
}

.stat-card:hover {
	transform: translateY(-2px);
}

.stat-card__icon {
	width: 48px;
	height: 48px;
	display: flex;
	flex-shrink: 0;
	align-items: center;
	justify-content: center;
	border-radius: 12px;
	font-size: 22px;
}

.stat-card__icon--total {
	color: var(--gp-text-secondary);
	background: var(--gp-bg-glass-hover);
}

.stat-card__icon--online {
	color: var(--gp-primary);
	background: var(--gp-primary-light);
}

.stat-card__icon--offline {
	color: #ff5f5f;
	background: rgb(255, 95, 95, 0.15);
}

.stat-card__icon--system {
	color: #60a5fa;
	background: rgb(96, 165, 250, 0.15);
}

.stat-card__icon--website {
	color: #f59e0b;
	background: rgb(245, 158, 11, 0.15);
}

.stat-card__body {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.stat-card__value {
	font-weight: 700;
	font-size: 1.8rem;
	line-height: 1;
	color: var(--gp-text-main);
}

.stat-card__value--online {
	color: var(--gp-primary);
}

.stat-card__value--offline {
	color: #ff5f5f;
}

.stat-card__label {
	font-size: 0.78rem;
	letter-spacing: 0.5px;
	text-transform: uppercase;
	color: var(--gp-text-secondary);
}

/* Skeleton */
.skeleton-card {
	border: 1px solid var(--gp-glass-border);
	border-radius: var(--gp-radius-md);
	background: linear-gradient(90deg, var(--gp-bg-glass) 25%, var(--gp-bg-glass-hover) 50%, var(--gp-bg-glass) 75%);
	background-size: 800px 100%;
	animation: shimmer 1.6s infinite linear;
}

@keyframes shimmer {
	0% {
		background-position: -400px 0;
	}

	100% {
		background-position: 400px 0;
	}
}

/* MFE Name Cell */
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
	color: var(--gp-primary);
	background: var(--gp-primary-light);
}

.mfe-display-name {
	font-weight: 500;
	color: var(--gp-text-main);
}

.mfe-id {
	font-family: monospace;
	font-size: 0.75rem;
	color: var(--gp-text-secondary);
}

/* URL link */
.mfe-url-link {
	display: flex;
	align-items: center;
	font-size: 0.8rem;
	text-decoration: none;
	color: var(--gp-primary);
	transition: opacity 0.2s;
	gap: 4px;
}

.mfe-url-link:hover {
	opacity: 0.8;
}

.mfe-url-empty {
	color: var(--gp-text-disabled);
}

/* Action buttons */
.action-btns {
	display: flex;
	align-items: center;
	gap: 8px;
}

/* Card header */
.card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

/* Form */
.mfe-form :deep(.el-form-item__label) {
	font-weight: 500;
	font-size: 0.85rem;
	color: var(--gp-text-secondary);
	margin-bottom: 4px;
}

/* Customizing Element Plus Tabs for Glass Theme */
:deep(.el-tabs__nav-wrap::after) {
	background-color: var(--gp-glass-border);
}

:deep(.el-tabs__item) {
	font-weight: 500;
	font-size: 16px;
	color: var(--gp-text-secondary);
	transition: all 0.3s;
}

:deep(.el-tabs__item.is-active),
:deep(.el-tabs__item:hover) {
	color: var(--gp-primary);
}

:deep(.el-tabs__active-bar) {
	height: 3px;
	border-radius: 3px;
	background-color: var(--gp-primary);
}

:deep(.el-tabs__content) {
	padding-top: 16px;
}
</style>
