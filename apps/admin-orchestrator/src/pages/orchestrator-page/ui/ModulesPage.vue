<template>
	<div class="modules-page">
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
			<!-- Table and Modal Content -->

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

				<el-table-column label="Порядок" prop="orderIndex" width="90" />

				<el-table-column label="Версия" width="90">
					<template #default="scope">
						<el-tag v-if="scope.row.version" size="small" type="info"> v{{ scope.row.version }} </el-tag>
						<span v-else class="mfe-url-empty">—</span>
					</template>
				</el-table-column>

				<el-table-column align="center" label="Статус" width="100">
					<template #default="scope">
						<div class="status-indicator-wrapper">
							<div
								class="status-dot"
								:class="{
									'status-dot--online': healthMap[scope.row.url]?.status === 'online',
									'status-dot--offline': healthMap[scope.row.url]?.status === 'offline',
									'status-dot--loading': healthMap[scope.row.url]?.status === 'checking',
								}"
							/>
							<el-tooltip
								:content="scope.row.enabled ? 'Нажмите чтобы отключить' : 'Нажмите чтобы включить'"
								placement="top"
							>
								<el-switch
									:disabled="scope.row.name === 'orchestrator' || healthMap[scope.row.url]?.status === 'checking'"
									:model-value="scope.row.enabled"
									:active-color="'var(--gp-primary)'"
									@change="toggleEnabled(scope.row)"
								/>
							</el-tooltip>
						</div>
					</template>
				</el-table-column>

				<el-table-column label="Метрики" width="130">
					<template #default="scope">
						<div v-if="loadingStats[scope.row.name]" class="mfe-metrics">
							<div class="mfe-metric">
								<el-icon><Timer /></el-icon>
								{{ loadingStats[scope.row.name].loadTime }}ms
							</div>
						</div>
						<span v-else class="mfe-url-empty">—</span>
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
						<el-form-item label="Версия">
							<el-input v-model="form.version" placeholder="1.0.0" />
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
import { onMounted, onUnmounted, ref, watch } from 'vue'

import { UiModal, UiTable } from '@admin-panel/ui'
import * as Icons from '@element-plus/icons-vue'
import { Delete, EditPen, Link, Plus, Timer } from '@element-plus/icons-vue'

import { useMfe } from '../../../entities/mfe/lib/composables/useMfe'

const {
	microfrontends,
	isLoading,
	dialogVisible,
	isEdit,
	form,
	isSubmitting,
	handleCreate,
	handleEdit,
	handleDelete,
	toggleEnabled,
	saveMfe,
} = useMfe()

import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()

// Auto-open edit modal if query param is present
watch(
	() => microfrontends.value,
	(newMfes) => {
		if (route.query.edit && newMfes.length > 0) {
			const mfeToEdit = newMfes.find((m: any) => m.id === route.query.edit)

			if (mfeToEdit) {
				handleEdit(mfeToEdit)
			}

			router.replace({ query: {} })
		}
	},
	{ immediate: true, deep: true }
)

// --- Health Checking Logic ---
const healthMap = ref<Record<string, { status: 'online' | 'offline' | 'checking'; lastChecked: number }>>({})

const checkHealth = async (url: string) => {
	if (!url) return

	healthMap.value[url] = { status: 'checking', lastChecked: Date.now() }

	try {
		const controller = new AbortController()
		const id = setTimeout(() => controller.abort(), 5000)

		await fetch(url, {
			method: 'HEAD',
			mode: 'no-cors',
			signal: controller.signal,
		})

		clearTimeout(id)

		healthMap.value[url] = { status: 'online', lastChecked: Date.now() }
	} catch {
		healthMap.value[url] = { status: 'offline', lastChecked: Date.now() }
	}
}

const checkAllHealth = () => {
	microfrontends.value.forEach((m: any) => {
		if (m.url) checkHealth(m.url)
	})
}

const loadingStats = ref<Record<string, { loadTime: number }>>({})

const handleLoadStat = (event: any) => {
	const { name, loadTime } = event.detail

	loadingStats.value[name] = { loadTime }
}

onMounted(() => {
	checkAllHealth()

	// Initial sync from global cache
	// @ts-ignore
	const globalStats = window.__gp_mfe_stats || {}

	Object.keys(globalStats).forEach((name) => {
		loadingStats.value[name] = globalStats[name]
	})

	window.addEventListener('mfe:load-stat', handleLoadStat)
})

onUnmounted(() => {
	window.removeEventListener('mfe:load-stat', handleLoadStat)
})

watch(
	() => microfrontends.value,
	(newMfes) => {
		newMfes.forEach((m: any) => {
			if (m.url && !healthMap.value[m.url]) {
				checkHealth(m.url)
			}
		})
	},
	{ deep: true }
)

const getIcon = (name: string) => {
	return (Icons as any)[name] || Icons.Menu
}
</script>

<style scoped>
.modules-page {
	padding: 0;
}

.card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
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

.action-btns {
	display: flex;
	align-items: center;
	gap: 8px;
}

.status-indicator-wrapper {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
}

.status-dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background-color: var(--gp-text-disabled);
	transition: background-color 0.3s ease;
}

.status-dot--online {
	box-shadow: 0 0 8px var(--gp-primary);
	background-color: var(--gp-primary);
}

.status-dot--offline {
	box-shadow: 0 0 8px #ff5f5f;
	background-color: #ff5f5f;
}

.status-dot--loading {
	background-color: #f59e0b;
	animation: pulse 1.5s infinite;
}

@keyframes pulse {
	0% {
		opacity: 1;
	}

	50% {
		opacity: 0.5;
	}

	100% {
		opacity: 1;
	}
}

.mfe-metrics {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.mfe-metric {
	display: flex;
	align-items: center;
	font-size: 0.75rem;
	color: var(--gp-text-secondary);
	gap: 4px;
}

.mfe-metric .el-icon {
	font-size: 14px;
	color: var(--gp-primary);
}

.mfe-form :deep(.el-form-item__label) {
	font-weight: 500;
	font-size: 0.85rem;
	color: var(--gp-text-secondary);
	margin-bottom: 4px;
}
</style>
