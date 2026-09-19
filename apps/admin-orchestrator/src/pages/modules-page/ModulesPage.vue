<template>
	<div class="modules-page">
		<!-- Status Dashboard Header Cards -->
		<div class="dashboard-stats-grid">
			<div class="stat-card glass-card">
				<div class="stat-icon stat-icon--total">
					<el-icon><Monitor /></el-icon>
				</div>
				<div class="stat-content">
					<div class="stat-value">{{ microfrontends.length }}</div>
					<div class="stat-label">Всего MFE</div>
				</div>
			</div>

			<div class="stat-card glass-card">
				<div class="stat-icon stat-icon--online">
					<span class="live-dot" />
				</div>
				<div class="stat-content">
					<div class="stat-value text-success">{{ onlineCount }}</div>
					<div class="stat-label">Онлайн</div>
				</div>
			</div>

			<div class="stat-card glass-card">
				<div class="stat-icon stat-icon--offline">
					<span class="offline-dot" />
				</div>
				<div class="stat-content">
					<div class="stat-value text-danger">{{ offlineCount }}</div>
					<div class="stat-label">Офлайн</div>
				</div>
			</div>

			<div class="stat-card glass-card">
				<div class="stat-icon stat-icon--latency">
					<el-icon><Timer /></el-icon>
				</div>
				<div class="stat-content">
					<div class="stat-value text-primary">
						{{ avgLatency !== null ? `${avgLatency} ms` : '—' }}
					</div>
					<div class="stat-label">Средняя задержка</div>
				</div>
			</div>

			<div class="stat-card glass-card">
				<div class="stat-icon stat-icon--size">
					<el-icon><Files /></el-icon>
				</div>
				<div class="stat-content">
					<div class="stat-value text-info">{{ formatBytes(totalChunkBytes) }}</div>
					<div class="stat-label">Размер чанков</div>
				</div>
			</div>
		</div>

		<!-- Table Card -->
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
								<el-switch v-model="isAutoPingActive" size="small" />
							</div>
						</el-tooltip>

						<el-button
							:icon="Refresh"
							:loading="isCheckingAll"
							size="small"
							type="info"
							plain
							@click="checkAllHealth"
						>
							Пинговать все
						</el-button>

						<el-button size="small" type="primary" @click="handleCreate">
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
									'status-dot--online': getStatus(scope.row) === 'online',
									'status-dot--offline': getStatus(scope.row) === 'offline',
									'status-dot--loading': getStatus(scope.row) === 'checking',
								}"
							/>
							<div v-if="scope.row.name === 'orchestrator' && backendHealth" class="health-badges">
								<el-tooltip :content="`Database connection: ${backendHealth.db}`" placement="top">
									<el-tag :type="backendHealth.db === 'ok' ? 'success' : 'danger'" size="small">DB</el-tag>
								</el-tooltip>
								<el-tooltip :content="`Redis connection: ${backendHealth.redis}`" placement="top">
									<el-tag :type="backendHealth.redis === 'ok' ? 'success' : 'danger'" size="small">RD</el-tag>
								</el-tooltip>
							</div>
							<div v-else class="health-simple-status">
								<span v-if="getStatus(scope.row) === 'online'" class="status-text online">Online</span>
								<span v-else-if="getStatus(scope.row) === 'offline'" class="status-text offline">Offline</span>
								<span v-else class="status-text checking">Проверка...</span>
							</div>

							<!-- Quick Ping Button -->
							<el-tooltip content="Проверить доступность прямо сейчас" placement="top">
								<el-button
									circle
									:icon="Refresh"
									:loading="healthMap[scope.row.url]?.status === 'checking'"
									size="small"
									text
									@click="checkHealth(scope.row.url, scope.row.name)"
								/>
							</el-tooltip>
						</div>
					</template>
				</el-table-column>

				<!-- Latency Column -->
				<el-table-column label="Latency" width="105">
					<template #default="scope">
						<div v-if="healthMap[scope.row.url]?.latency !== undefined && healthMap[scope.row.url]?.latency !== null">
							<el-tag :type="getLatencyType(healthMap[scope.row.url].latency)" effect="light" size="small">
								{{ healthMap[scope.row.url].latency }} ms
							</el-tag>
						</div>
						<span v-else class="mfe-url-empty">—</span>
					</template>
				</el-table-column>

				<!-- Chunk Size Column -->
				<el-table-column label="Размер чанка" width="125">
					<template #default="scope">
						<div v-if="healthMap[scope.row.url]?.chunkSize">
							<el-tag effect="plain" size="small" type="info">
								{{ formatBytes(healthMap[scope.row.url].chunkSize) }}
							</el-tag>
						</div>
						<span v-else class="mfe-url-empty">—</span>
					</template>
				</el-table-column>

				<!-- Feature Flag / Enabled Switch -->
				<el-table-column label="MFE Активен" width="120">
					<template #default="scope">
						<el-tooltip
							:content="scope.row.enabled ? 'Отключить MFE в Shell' : 'Включить MFE в Shell'"
							placement="top"
						>
							<el-switch
								:disabled="scope.row.name === 'orchestrator'"
								:model-value="scope.row.enabled"
								active-color="var(--gp-primary)"
								@change="toggleEnabled(scope.row)"
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
							:type="getDisabledCount(scope.row) > 0 ? 'warning' : 'default'"
							@click="openRoutesDrawer(scope.row)"
						>
							<el-icon><Menu /></el-icon>
							<span>Меню</span>
							<el-badge
								v-if="getDisabledCount(scope.row) > 0"
								class="routes-badge"
								:value="`-${getDisabledCount(scope.row)}`"
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
									@click="handleEdit(scope.row)"
								>
									<el-icon><EditPen /></el-icon>
								</el-button>
							</el-tooltip>
							<el-tooltip content="Сбросить кэш и перезагрузить" placement="top">
								<el-button circle size="small" type="warning" @click="handleHotReload(scope.row)">
									<el-icon><RefreshRight /></el-icon>
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

		<!-- Sub-routes & Menu Items Drawer (Feature Flags per Route) -->
		<el-drawer
			v-model="routesDrawerVisible"
			direction="rtl"
			size="480px"
			:title="`Пункты меню: ${activeMfe?.displayName || activeMfe?.name}`"
		>
			<div v-if="activeMfe" class="drawer-content">
				<div class="drawer-notice">
					<el-icon class="notice-icon"><InfoFilled /></el-icon>
					<span>
						Включение и отключение отдельных страниц микрофронтенда в боковом меню Shell без перезапуска сервера.
					</span>
				</div>

				<div class="routes-actions-bar">
					<el-button size="small" type="success" plain @click="enableAllRoutes">
						Включить все
					</el-button>
					<el-button size="small" type="danger" plain @click="disableAllRoutes">
						Отключить все
					</el-button>
				</div>

				<div class="routes-list">
					<div
						v-for="item in activeMfeRoutes"
						:key="item.path"
						class="route-item glass-card"
						:class="{ 'is-disabled': isRouteDisabled(item.path) }"
					>
						<div class="route-info">
							<div class="route-title">{{ item.title }}</div>
							<code class="route-path">{{ item.path }}</code>
						</div>
						<el-switch
							:model-value="!isRouteDisabled(item.path)"
							active-color="var(--gp-primary)"
							@change="toggleRoute(item.path)"
						/>
					</div>
				</div>

				<div class="custom-route-box mt-4">
					<span class="custom-route-label">Добавить пользовательский путь роута:</span>
					<div class="custom-route-input-row">
						<el-input
							v-model="customRoutePath"
							:placeholder="`/${activeMfe.name}/custom`"
							size="small"
						/>
						<el-button :icon="Plus" size="small" type="primary" @click="addCustomRoute">
							Добавить
						</el-button>
					</div>
				</div>
			</div>

			<template #footer>
				<el-button @click="routesDrawerVisible = false">Закрыть</el-button>
				<el-button :loading="isSavingRoutes" type="primary" @click="saveRoutesConfig">
					Сохранить в PostgreSQL
				</el-button>
			</template>
		</el-drawer>

		<!-- Dialog for Add/Edit MFE -->
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
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { GP_EVENTS, useEvents } from '@admin-panel/lib'
import { UiModal, UiTable } from '@admin-panel/ui'
import * as Icons from '@element-plus/icons-vue'
import {
	Delete,
	EditPen,
	Files,
	InfoFilled,
	Link,
	Menu,
	Monitor,
	Plus,
	Refresh,
	RefreshRight,
	Timer,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

import { mfeApi, systemApi, useMfe } from '#entities/mfe'

const { dispatch } = useEvents()
const route = useRoute()
const router = useRouter()

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

// --- Known Routes Registry per MFE ---
const KNOWN_MFE_ROUTES: Record<string, { path: string; title: string }[]> = {
	orchestrator: [
		{ path: '/orchestrator', title: 'Топология системы' },
		{ path: '/orchestrator/modules', title: 'Модули (MFE)' },
		{ path: '/orchestrator/monitoring', title: 'Мониторинг ресурсов' },
		{ path: '/orchestrator/features', title: 'Feature Flags' },
		{ path: '/orchestrator/logs', title: 'Логи системы' },
	],
	users: [
		{ path: '/users', title: 'Список пользователей' },
		{ path: '/users/rights', title: 'Права и роли' },
	],
	content: [
		{ path: '/content', title: 'Схемы контента' },
	],
	translations: [
		{ path: '/translations', title: 'Переводы интерфейса' },
	],
	media: [
		{ path: '/media', title: 'Медиабиблиотека' },
	],
	about: [
		{ path: '/about', title: 'О нас' },
	],
	guests: [
		{ path: '/guests', title: 'Гости и предложения' },
	],
	platforms: [
		{ path: '/platforms', title: 'Платформы и интеграции' },
	],
	profile: [
		{ path: '/profile', title: 'Профиль' },
	],
	statistics: [
		{ path: '/statistics', title: 'Аналитика и статистика' },
	],
}

// --- Health Checking Logic ---
interface HealthItem {
	status: 'online' | 'offline' | 'checking'
	latency?: number | null
	chunkSize?: number | null
	statusCode?: number
	lastChecked: number
	error?: string
}

const healthMap = ref<Record<string, HealthItem>>({})
const backendHealth = ref<any>(null)
const isCheckingAll = ref(false)
const isAutoPingActive = ref(true)
let autoPingTimer: any = null

const checkHealth = async (url: string, name?: string) => {
	if (!url) return

	const key = url
	healthMap.value[key] = {
		...(healthMap.value[key] || {}),
		status: 'checking',
		lastChecked: Date.now(),
	}

	const startTime = performance.now()
	const controller = new AbortController()
	const timeoutId = setTimeout(() => controller.abort(), 6000)

	try {
		const res = await fetch(url, {
			method: 'GET',
			signal: controller.signal,
		})

		clearTimeout(timeoutId)
		const latency = Math.round(performance.now() - startTime)

		// Calculate chunk size
		let chunkSize = 0
		const contentLength = res.headers.get('content-length')
		if (contentLength) {
			chunkSize = parseInt(contentLength, 10)
		} else {
			const blob = await res.blob()
			chunkSize = blob.size
		}

		healthMap.value[key] = {
			status: res.ok ? 'online' : 'offline',
			latency,
			chunkSize,
			statusCode: res.status,
			lastChecked: Date.now(),
		}
	} catch (err: any) {
		clearTimeout(timeoutId)
		healthMap.value[key] = {
			status: 'offline',
			latency: null,
			chunkSize: null,
			error: err.name === 'AbortError' ? 'Timeout (6s)' : err.message || 'Сбой сети',
			lastChecked: Date.now(),
		}
	}
}

const checkBackendHealth = async () => {
	try {
		const res = await systemApi.getHealth()

		if (res.data) {
			backendHealth.value = res.data
			healthMap.value['orchestrator'] = {
				status: 'online',
				latency: 2,
				lastChecked: Date.now(),
			}
		} else {
			healthMap.value['orchestrator'] = {
				status: 'offline',
				lastChecked: Date.now(),
			}
		}
	} catch {
		healthMap.value['orchestrator'] = {
			status: 'offline',
			lastChecked: Date.now(),
		}
	}
}

const checkAllHealth = async () => {
	isCheckingAll.value = true
	const promises = (microfrontends.value || []).map((m: any) => {
		if (m.name === 'orchestrator') {
			return checkBackendHealth()
		} else if (m.url) {
			return checkHealth(m.url, m.name)
		}
		return Promise.resolve()
	})

	await Promise.all(promises)
	isCheckingAll.value = false
}

const getStatus = (row: any): 'online' | 'offline' | 'checking' => {
	if (row.name === 'orchestrator') {
		return healthMap.value['orchestrator']?.status || 'checking'
	}
	return healthMap.value[row.url]?.status || 'checking'
}

// --- Dashboard Computed Metrics ---
const onlineCount = computed(() => {
	return (microfrontends.value || []).filter((m: any) => getStatus(m) === 'online').length
})

const offlineCount = computed(() => {
	return (microfrontends.value || []).filter((m: any) => getStatus(m) === 'offline').length
})

const avgLatency = computed(() => {
	const latencies = Object.values(healthMap.value)
		.map((h) => h.latency)
		.filter((l): l is number => typeof l === 'number' && l > 0)

	if (!latencies.length) return null
	const sum = latencies.reduce((acc, curr) => acc + curr, 0)
	return Math.round(sum / latencies.length)
})

const totalChunkBytes = computed(() => {
	return Object.values(healthMap.value).reduce((acc, h) => acc + (h.chunkSize || 0), 0)
})

const getLatencyType = (latency?: number | null) => {
	if (latency === undefined || latency === null) return 'info'
	if (latency < 50) return 'success'
	if (latency < 200) return 'warning'
	return 'danger'
}

const formatBytes = (bytes?: number | null) => {
	if (!bytes || bytes === 0) return '0 B'
	const k = 1024
	const sizes = ['B', 'KB', 'MB', 'GB']
	const i = Math.floor(Math.log(bytes) / Math.log(k))
	return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// --- Sub-routes & Menu Items Drawer Logic ---
const routesDrawerVisible = ref(false)
const activeMfe = ref<any>(null)
const disabledRoutesLocal = ref<string[]>([])
const customRoutePath = ref('')
const isSavingRoutes = ref(false)

const activeMfeRoutes = computed(() => {
	if (!activeMfe.value) return []
	const mfeName = activeMfe.value.name
	const known = KNOWN_MFE_ROUTES[mfeName] || [{ path: `/${mfeName}`, title: activeMfe.value.displayName }]

	// Include any existing disabled routes that aren't in known
	const allPaths = new Set(known.map((k) => k.path))
	const extras = disabledRoutesLocal.value
		.filter((p) => !allPaths.has(p))
		.map((p) => ({ path: p, title: `Роут: ${p}` }))

	return [...known, ...extras]
})

const openRoutesDrawer = (mfe: any) => {
	activeMfe.value = mfe
	const config = mfe.config || {}
	const disabled = (config.disabledRoutes || config.disabled_routes || []) as string[]
	disabledRoutesLocal.value = [...disabled]
	customRoutePath.value = ''
	routesDrawerVisible.value = true
}

const isRouteDisabled = (path: string) => {
	return disabledRoutesLocal.value.includes(path)
}

const toggleRoute = (path: string) => {
	const idx = disabledRoutesLocal.value.indexOf(path)
	if (idx >= 0) {
		disabledRoutesLocal.value.splice(idx, 1)
	} else {
		disabledRoutesLocal.value.push(path)
	}
}

const enableAllRoutes = () => {
	disabledRoutesLocal.value = []
}

const disableAllRoutes = () => {
	disabledRoutesLocal.value = activeMfeRoutes.value.map((r) => r.path)
}

const addCustomRoute = () => {
	if (!customRoutePath.value.trim()) return
	const path = customRoutePath.value.trim()
	if (!disabledRoutesLocal.value.includes(path)) {
		disabledRoutesLocal.value.push(path)
	}
	customRoutePath.value = ''
}

const getDisabledCount = (mfe: any) => {
	const config = mfe.config || {}
	const disabled = (config.disabledRoutes || config.disabled_routes || []) as string[]
	return disabled.length
}

const saveRoutesConfig = async () => {
	if (!activeMfe.value) return
	isSavingRoutes.value = true

	try {
		const updatedConfig = {
			...(activeMfe.value.config || {}),
			disabledRoutes: [...disabledRoutesLocal.value],
		}

		await mfeApi.update(activeMfe.value.id, {
			...activeMfe.value,
			config: updatedConfig,
		})

		// Update in local item
		activeMfe.value.config = updatedConfig

		ElMessage.success('Настройки пунктов меню сохранены в PostgreSQL')
		dispatch(GP_EVENTS.UPDATED)
		routesDrawerVisible.value = false
	} catch (e: any) {
		ElMessage.error(`Ошибка при сохранении: ${e.message || 'Сбой сети'}`)
	} finally {
		isSavingRoutes.value = false
	}
}

// --- Hot Reload Logic ---
const handleHotReload = async (mfe: any) => {
	ElMessage.info(`Инициирован сброс кэша для ${mfe.displayName}...`)

	// 1. Backend reload (clear Redis etc)
	const res = await systemApi.reloadModule(mfe.name)

	if (res) {
		ElMessage.success(`Backend кэш для ${mfe.name} успешно очищен`)
	}

	// 2. Local Storage / Session Storage cleanup
	Object.keys(localStorage).forEach((key) => {
		if (key.includes(mfe.name) || key.includes(mfe.scope)) {
			localStorage.removeItem(key)
		}
	})

	Object.keys(sessionStorage).forEach((key) => {
		if (key.includes(mfe.name) || key.includes(mfe.scope)) {
			sessionStorage.removeItem(key)
		}
	})

	// 3. Notify shell and reload
	dispatch(GP_EVENTS.FORCE_RELOAD, { name: mfe.name })

	setTimeout(() => {
		window.location.reload()
	}, 800)
}

// --- Lifecycle & Auto-ping ---
onMounted(() => {
	checkAllHealth()

	autoPingTimer = setInterval(() => {
		if (isAutoPingActive.value) {
			checkAllHealth()
		}
	}, 15000)
})

onUnmounted(() => {
	if (autoPingTimer) clearInterval(autoPingTimer)
})

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

const getIcon = (name: string) => {
	return (Icons as any)[name] || Icons.Menu
}
</script>

<style scoped lang="scss">
.modules-page {
	padding: 0;
}

/* Status Dashboard Grid */
.dashboard-stats-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: 16px;
	margin-bottom: 24px;
}

.stat-card {
	display: flex;
	align-items: center;
	padding: 16px 20px;
	border-radius: 12px;
	border: 1px solid var(--gp-glass-border, rgba(255, 255, 255, 0.08));
	background: var(--gp-bg-glass, rgba(20, 20, 20, 0.6));
	gap: 16px;
	transition: transform 0.2s, box-shadow 0.2s;

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
	}
}

.stat-icon {
	width: 44px;
	height: 44px;
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 22px;

	&--total {
		background: rgba(66, 184, 131, 0.15);
		color: var(--gp-primary, #42b883);
	}

	&--online {
		background: rgba(66, 184, 131, 0.2);
	}

	&--offline {
		background: rgba(255, 95, 95, 0.2);
	}

	&--latency {
		background: rgba(100, 108, 255, 0.15);
		color: #646cff;
	}

	&--size {
		background: rgba(245, 158, 11, 0.15);
		color: #f59e0b;
	}
}

.live-dot {
	width: 14px;
	height: 14px;
	border-radius: 50%;
	background-color: var(--gp-primary, #42b883);
	box-shadow: 0 0 10px var(--gp-primary, #42b883);
	animation: pulse-live 2s infinite;
}

.offline-dot {
	width: 14px;
	height: 14px;
	border-radius: 50%;
	background-color: #ff5f5f;
	box-shadow: 0 0 8px #ff5f5f;
}

@keyframes pulse-live {
	0% {
		transform: scale(0.9);
		opacity: 0.8;
	}
	50% {
		transform: scale(1.15);
		opacity: 1;
	}
	100% {
		transform: scale(0.9);
		opacity: 0.8;
	}
}

.stat-content {
	display: flex;
	flex-direction: column;
}

.stat-value {
	font-size: 1.45rem;
	font-weight: 700;
	line-height: 1.2;
	color: var(--gp-text-main, #fff);
}

.stat-label {
	font-size: 0.78rem;
	color: var(--gp-text-muted, #718096);
	text-transform: uppercase;
	letter-spacing: 0.4px;
	margin-top: 2px;
}

.text-success {
	color: var(--gp-primary, #42b883) !important;
}

.text-danger {
	color: #ff5f5f !important;
}

.text-primary {
	color: #646cff !important;
}

.text-info {
	color: #f59e0b !important;
}

/* Card Header */
.card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 12px;
}

.header-left {
	display: flex;
	flex-direction: column;
}

.header-title {
	font-size: 1.1rem;
	font-weight: 600;
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
	gap: 6px;
	padding: 4px 10px;
	border-radius: 6px;
	background: rgba(255, 255, 255, 0.04);
	border: 1px solid rgba(255, 255, 255, 0.06);
}

.auto-ping-label {
	font-size: 0.75rem;
	color: var(--gp-text-secondary, #a0aec0);
}

/* Table Cells */
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
	background: var(--gp-primary-light, rgba(66, 184, 131, 0.1));
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

/* Sub-routes Drawer */
.drawer-content {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.drawer-notice {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 10px 14px;
	border-radius: 8px;
	background: rgba(66, 184, 131, 0.1);
	border: 1px solid rgba(66, 184, 131, 0.2);
	font-size: 0.8rem;
	color: var(--gp-text-secondary, #a0aec0);

	.notice-icon {
		font-size: 16px;
		color: var(--gp-primary, #42b883);
		flex-shrink: 0;
	}
}

.routes-actions-bar {
	display: flex;
	gap: 8px;
}

.routes-list {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.route-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 16px;
	border-radius: 8px;
	border: 1px solid rgba(255, 255, 255, 0.08);
	background: rgba(255, 255, 255, 0.02);
	transition: opacity 0.2s;

	&.is-disabled {
		opacity: 0.55;
		border-color: rgba(255, 95, 95, 0.2);
	}
}

.route-info {
	display: flex;
	flex-direction: column;
}

.route-title {
	font-weight: 500;
	font-size: 0.9rem;
	color: var(--gp-text-main, #fff);
}

.route-path {
	font-size: 0.75rem;
	font-family: monospace;
	color: var(--gp-text-muted, #718096);
	margin-top: 2px;
}

.custom-route-box {
	display: flex;
	flex-direction: column;
	gap: 8px;
	padding-top: 12px;
	border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.custom-route-label {
	font-size: 0.8rem;
	color: var(--gp-text-secondary, #a0aec0);
}

.custom-route-input-row {
	display: flex;
	gap: 8px;
}
</style>
