<template>
	<div class="orchestrator-page-wrapper">
		<UiSidebar
			:available-contexts="['system']"
			class="orchestrator-sidebar"
			:data="sidebarData"
			:show-context-switcher="false"
		/>

		<div class="orchestrator-content">
			<div class="page-header">
				<h1>Оркестрация</h1>
				<p class="page-subtitle">Управление и мониторинг модулей системы</p>
			</div>

			<div v-if="!isLoading" class="stats-row">
				<div v-for="stat in statItems" :key="stat.label" class="stat-card glass-panel">
					<el-icon class="stat-icon" :class="`stat-icon--${stat.type}`">
						<component :is="stat.icon" />
					</el-icon>
					<div class="stat-info">
						<span class="stat-value">{{ stat.value }}</span>
						<span class="stat-label">{{ stat.label }}</span>
					</div>
				</div>
			</div>

			<div class="page-body">
				<slot />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

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
	{ title: 'Топология', path: '/', icon: 'Share' },
	{ title: 'Модули (MFE)', path: '/modules', icon: 'Monitor' },
	{ title: 'Мониторинг', path: '/monitoring', icon: 'DataAnalysis' },
	{ title: 'Логи системы', path: '/logs', icon: 'Memo' },
]
</script>

<style scoped>
.orchestrator-page-wrapper {
	min-height: calc(100vh - var(--gp-header-height) - 48px);
	display: flex;
	margin: -24px; /* Входим в края контента Shell, но без рамок */
}

.orchestrator-sidebar {
	flex-shrink: 0;
	border-right: 1px solid var(--gp-glass-border);
	background: var(--gp-bg-glass);
}

.orchestrator-content {
	min-width: 0;
	display: flex;
	flex: 1;
	flex-direction: column;
	background: var(--gp-bg-main);
	padding: 32px;
	gap: 32px;
}

.page-header h1 {
	font-weight: 800;
	font-size: 2rem;
	letter-spacing: -0.02em;
	color: var(--gp-text-main);
	margin: 0;
}

.page-subtitle {
	font-size: 0.9rem;
	color: var(--gp-text-secondary);
	margin-top: 4px;
}

.stats-row {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
	gap: 16px;
}

.stat-card {
	display: flex;
	align-items: center;
	padding: 16px;
	gap: 16px;
}

.stat-icon {
	font-size: 24px;
	color: var(--gp-text-secondary);
}

.stat-icon--online {
	color: var(--gp-primary);
}

.stat-icon--offline {
	color: var(--gp-danger);
}

.stat-info {
	display: flex;
	flex-direction: column;
}

.stat-value {
	font-weight: 700;
	font-size: 1.25rem;
	color: var(--gp-text-main);
}

.stat-label {
	font-size: 0.75rem;
	letter-spacing: 0.05em;
	text-transform: uppercase;
	color: var(--gp-text-muted);
}

.page-body {
	flex: 1;
}
</style>
