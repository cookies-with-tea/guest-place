<template>
	<div class="topology-page">
		<!-- Summary Cards -->
		<div class="summary-grid">
			<div v-for="stat in stats" :key="stat.title" class="stat-card glass-card">
				<div class="stat-icon" :style="{ backgroundColor: stat.color + '22', color: stat.color }">
					<el-icon><component :is="stat.icon" /></el-icon>
				</div>
				<div class="stat-info">
					<div class="stat-value">{{ stat.value }}</div>
					<div class="stat-title">{{ stat.title }}</div>
				</div>
			</div>
		</div>

		<div class="legend-container glass-card">
			<div class="legend-item">
				<span class="legend-dot shell"></span>
				<span>Shell</span>
				<el-tag size="small" type="info">1</el-tag>
			</div>
			<div class="legend-item">
				<span class="legend-dot mfe"></span>
				<span>Microfrontend</span>
				<el-tag size="small" type="info">{{ microfrontends.length }}</el-tag>
			</div>
			<div class="legend-item">
				<span class="legend-dot route"></span>
				<span>Sub-route</span>
				<el-tag size="small" type="info">6</el-tag>
			</div>
			<div class="legend-item">
				<span class="legend-dot package"></span>
				<span>Package</span>
				<el-tag size="small" type="info">4</el-tag>
			</div>
		</div>

		<el-card v-loading="isLoading" class="chart-card glass-card">
			<template #header>
				<div class="card-header">
					<span>Системная Топология</span>
				</div>
			</template>
			<MfeStatsChart :data="chartData" />
		</el-card>
	</div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'

import * as Icons from '@element-plus/icons-vue'

import { useMfe } from '../../../entities/mfe/lib/composables/useMfe'

const MfeStatsChart = defineAsyncComponent(() => import('./MfeStatsChart.vue'))

const { microfrontends, isLoading } = useMfe()

const stats = computed(() => {
	const all = microfrontends.value || []

	return [
		{ title: 'ВСЕГО', value: all.length, icon: Icons.Menu, color: '#646cff' },
		{ title: 'ONLINE', value: all.filter((m: any) => m.enabled).length, icon: Icons.CircleCheck, color: '#42b883' },
		{ title: 'OFFLINE', value: all.filter((m: any) => !m.enabled).length, icon: Icons.CircleClose, color: '#ff5f5f' },
		{
			title: 'SYSTEM',
			value: all.filter((m: any) => m.type === 'system').length,
			icon: Icons.Setting,
			color: '#909399',
		},
		{
			title: 'WEBSITE',
			value: all.filter((m: any) => m.type === 'website').length,
			icon: Icons.Monitor,
			color: '#f59e0b',
		},
	]
})

const chartData = computed(() => {
	const mfes = microfrontends.value || []

	const nodes: any[] = [{ id: 'Shell', group: 1, type: 'shell', status: 'online' }]

	const links: any[] = []

	// Packages
	const packages = ['lib', 'ui', 'i18n', 'testing-utils']

	packages.forEach((pkg) => {
		nodes.push({ id: `@admin-panel/${pkg}`, group: 4, type: 'package', status: 'online' })

		links.push({ source: 'Shell', target: `@admin-panel/${pkg}`, value: 1 })
	})

	mfes.forEach((m: any) => {
		const mId = m.displayName || m.name || `mfe-${m.id}`

		nodes.push({
			id: mId,
			group: 2,
			type: 'mfe',
			status: m.enabled ? 'online' : 'offline',
		})

		links.push({ source: 'Shell', target: mId, value: 2 })

		// Connect MFEs to packages
		links.push({ source: mId, target: '@admin-panel/lib', value: 1 })

		links.push({ source: mId, target: '@admin-panel/ui', value: 1 })

		// Sub-routes for specific MFEs
		if (m.name === 'users') {
			// TODO: Подгружать с API
			const userRoutes = ['Users List', 'Rights Management']

			userRoutes.forEach((r) => {
				nodes.push({ id: r, group: 3, type: 'route', status: 'online' })

				links.push({ source: mId, target: r, value: 1 })
			})
		}

		if (m.name === 'orchestrator') {
			const orchRoutes = ['Monitoring', 'Logs', 'Topology', 'Modules']

			orchRoutes.forEach((r) => {
				nodes.push({ id: r, group: 3, type: 'route', status: 'online' })

				links.push({ source: mId, target: r, value: 1 })
			})
		}
	})

	return { nodes, links }
})
</script>

<style scoped>
.topology-page {
	display: flex;
	flex-direction: column;
	gap: 24px;
}

.summary-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: 16px;
}

.stat-card {
	display: flex;
	align-items: center;
	border-radius: 16px;
	padding: 20px;
	gap: 16px;
}

.stat-icon {
	width: 48px;
	height: 48px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 12px;
	font-size: 24px;
}

.stat-info {
	display: flex;
	flex-direction: column;
}

.stat-value {
	font-weight: 800;
	font-size: 1.5rem;
	line-height: 1.2;
	color: var(--gp-text-main);
}

.stat-title {
	font-weight: 600;
	font-size: 0.75rem;
	letter-spacing: 0.5px;
	text-transform: uppercase;
	color: var(--gp-text-muted);
}

.chart-card {
	border-radius: 20px;
}

.legend-container {
	display: flex;
	justify-content: center;
	border-radius: 16px;
	padding: 16px;
	gap: 32px;
}

.legend-item {
	display: flex;
	align-items: center;
	font-weight: 600;
	font-size: 0.85rem;
	color: var(--gp-text-main);
	gap: 12px;
}

.legend-dot {
	width: 10px;
	height: 10px;
	border-radius: 50%;
}

.legend-dot.shell {
	border: 1px solid #42b883;
	box-shadow: 0 0 8px #42b883;
	background: #35495e;
}

.legend-dot.mfe {
	box-shadow: 0 0 8px #42b883;
	background: #42b883;
}

.legend-dot.route {
	box-shadow: 0 0 8px #646cff;
	background: #646cff;
}

.legend-dot.package {
	background: #909399;
	opacity: 0.6;
}

.card-header {
	font-weight: 600;
	color: var(--gp-text-main);
}
</style>
