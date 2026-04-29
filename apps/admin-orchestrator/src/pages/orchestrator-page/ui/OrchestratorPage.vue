<template>
	<div id="__MF_ORCHESTRATOR_PAGE__" class="orchestrator-layout glass-panel">
		<!-- MF Internal Sidebar -->
		<UiSidebar
			:available-contexts="['system']"
			class="orchestrator-sidebar"
			:data="sidebarData"
			:show-context-switcher="false"
		/>

		<div class="orchestrator-content">
			<div class="page-header">
				<div class="page-header__title">
					<h1>Оркестрация</h1>
					<p class="page-header__subtitle">Управление и мониторинг модулей</p>
				</div>
			</div>

			<!-- Stats Cards -->
			<div v-if="!isLoading" class="stats-row">
				<div v-for="stat in statItems" :key="stat.label" class="stat-card glass-card">
					<div class="stat-card__icon" :class="`stat-card__icon--${stat.type}`">
						<el-icon><component :is="stat.icon" /></el-icon>
					</div>
					<div class="stat-card__body">
						<span class="stat-card__value">{{ stat.value }}</span>
						<span class="stat-card__label">{{ stat.label }}</span>
					</div>
				</div>
			</div>

			<div class="sub-page-container">
				<RouterView v-slot="{ Component }">
					<Transition mode="out-in" name="fade">
						<component :is="Component" />
					</Transition>
				</RouterView>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterView } from 'vue-router'

import { UiSidebar } from '@admin-panel/ui'
import { CircleCheck, CircleClose, Grid, Monitor, Setting } from '@element-plus/icons-vue'

import { useMfe } from '../../../entities/mfe/lib/composables/useMfe'

const { isLoading, stats } = useMfe()

const statItems = computed(() => [
	{ label: 'Всего', value: stats.value.total, icon: Grid, type: 'total' },
	{ label: 'Online', value: stats.value.online, icon: CircleCheck, type: 'online' },
	{ label: 'Offline', value: stats.value.offline, icon: CircleClose, type: 'offline' },
	{ label: 'System', value: stats.value.system, icon: Setting, type: 'system' },
	{ label: 'Website', value: stats.value.website, icon: Monitor, type: 'website' },
])

const sidebarData = [
	{ title: 'Топология', path: '/orchestrator/topology', icon: 'Share' },
	{ title: 'Модули (MFE)', path: '/orchestrator/modules', icon: 'Monitor' },
	{ title: 'Мониторинг', path: '/orchestrator/monitoring', icon: 'DataAnalysis' },
	{ title: 'Логи системы', path: '/orchestrator/logs', icon: 'Memo' },
]
</script>

<style scoped>
.orchestrator-layout {
	width: 100%;
	height: calc(100vh - var(--gp-header-height) - 72px); /* Correct height accounting for padding */
	display: flex;
	border: 1px solid var(--gp-glass-border);
	border-radius: var(--gp-radius-md);
	overflow: hidden;
}

.orchestrator-sidebar {
	height: 100%;
	flex-shrink: 0;
	border-right: 1px solid var(--gp-glass-border);
	background: rgb(0, 0, 0, 0.05);
}

.orchestrator-content {
	min-width: 0;
	display: flex;
	flex: 1;
	flex-direction: column;
	padding: 20px;
	overflow-y: auto;
	gap: 20px;
}

.page-header h1 {
	font-weight: 700;
	font-size: 1.25rem;
	color: var(--gp-text-main);
	margin: 0;
}

.page-header__subtitle {
	font-size: 0.8rem;
	color: var(--gp-text-secondary);
	margin-top: 2px;
}

.stats-row {
	display: grid;
	flex-shrink: 0;
	grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
	gap: 12px;
}

.stat-card {
	display: flex;
	align-items: center;
	padding: 12px;
	gap: 12px;
}

.stat-card__icon {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 8px;
	font-size: 16px;
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
	background: rgb(255, 95, 95, 0.1);
}

.stat-card__icon--system {
	color: #6366f1;
	background: rgb(99, 102, 241, 0.1);
}

.stat-card__icon--website {
	color: #f59e0b;
	background: rgb(245, 158, 11, 0.1);
}

.stat-card__body {
	display: flex;
	flex-direction: column;
}

.stat-card__value {
	font-weight: 700;
	font-size: 1.1rem;
	line-height: 1.2;
	color: var(--gp-text-main);
}

.stat-card__label {
	font-size: 0.65rem;
	text-transform: uppercase;
	color: var(--gp-text-secondary);
}

.sub-page-container {
	flex: 1;
}

.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
