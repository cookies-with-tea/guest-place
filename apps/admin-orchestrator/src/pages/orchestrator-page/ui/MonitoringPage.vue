<template>
	<div class="monitoring-page">
		<svg width="0" height="0" style="position: absolute">
			<defs>
				<linearGradient id="grad-cpu" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stop-color="#42b883" stop-opacity="0.3" />
					<stop offset="100%" stop-color="#42b883" stop-opacity="0.0" />
				</linearGradient>
				<linearGradient id="grad-mem" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stop-color="#646cff" stop-opacity="0.3" />
					<stop offset="100%" stop-color="#646cff" stop-opacity="0.0" />
				</linearGradient>
			</defs>
		</svg>

		<el-tabs v-model="activeTab" class="monitoring-tabs">
			<el-tab-pane label="Micro-Frontends" name="mfe">
				<div class="mfe-grid mt-4">
					<el-row :gutter="24" class="equal-height-row">
						<el-col v-for="m in mfeMetrics" :key="m.id" :xs="24" :sm="24" :md="12" :lg="8" class="equal-height-col">
							<div class="panel-card glass-card" :class="{ 'is-offline': !m.isOnline, 'is-online': m.isOnline }">
								<div class="panel-header">
									<div class="panel-title-wrapper">
										<span class="status-dot" :class="m.isOnline ? 'online' : 'offline'"></span>
										<span class="panel-title">{{ m.displayName || m.name }}</span>
									</div>
									<div class="panel-actions">
										<el-tag size="small" :type="m.category === 'system' ? 'info' : 'warning'" class="mr-2">
											{{ m.category }}
										</el-tag>
										<el-tag v-if="m.version" size="small" type="info" class="mr-2"> v{{ m.version }} </el-tag>
										<el-tooltip content="Редактировать модуль" placement="top">
											<el-button
												circle
												size="small"
												type="primary"
												plain
												@click="$router.push({ path: '/modules', query: { edit: m.id } })"
											>
												<el-icon><EditPen /></el-icon>
											</el-button>
										</el-tooltip>
									</div>
								</div>

								<div v-if="m.isOnline && m.process" class="panel-body">
									<div class="metric-block">
										<div class="metric-info">
											<span class="metric-label">CPU Usage</span>
											<span class="metric-hero">{{ m.process.cpuUsage.toFixed(1) }}%</span>
										</div>
										<div class="metric-chart">
											<svg
												v-if="history[m.process.name]"
												viewBox="0 0 300 60"
												preserveAspectRatio="none"
												width="100%"
												height="60"
											>
												<path
													:d="getSparklineData(history[m.process.name].cpu, 300, 60, 100).area"
													fill="url(#grad-cpu)"
												/>
												<path
													:d="getSparklineData(history[m.process.name].cpu, 300, 60, 100).line"
													fill="none"
													stroke="#42b883"
													stroke-width="2"
												/>
											</svg>
										</div>
									</div>

									<div class="metric-block mt-4">
										<div class="metric-info">
											<span class="metric-label">Memory Allocation</span>
											<span class="metric-hero">{{ formatBytes(m.process.memoryUsed) }}</span>
										</div>
										<div class="metric-chart">
											<svg
												v-if="history[m.process.name]"
												viewBox="0 0 300 60"
												preserveAspectRatio="none"
												width="100%"
												height="60"
											>
												<path
													:d="getSparklineData(history[m.process.name].mem, 300, 60, 0).area"
													fill="url(#grad-mem)"
												/>
												<path
													:d="getSparklineData(history[m.process.name].mem, 300, 60, 0).line"
													fill="none"
													stroke="#646cff"
													stroke-width="2"
												/>
											</svg>
										</div>
									</div>
								</div>
								<div v-else class="panel-offline-body">
									<el-empty description="Service Offline" :image-size="60" />
								</div>
							</div>
						</el-col>
					</el-row>
				</div>
			</el-tab-pane>

			<el-tab-pane label="System Infrastructure" name="system">
				<div class="metrics-grid mt-4">
					<el-card class="metric-card glass-card">
						<template #header>
							<div class="metric-header">
								<span>Total Node CPU Usage</span>
								<el-tag :type="cpuTagType" size="small">{{ stats.cpuUsage.toFixed(1) }}%</el-tag>
							</div>
						</template>
						<div class="gauge-container">
							<el-progress
								type="dashboard"
								:percentage="Number(Math.min(100, stats.cpuUsage)).toFixed(1)"
								:color="customColors"
								:width="180"
							/>
						</div>
					</el-card>

					<el-card class="metric-card glass-card">
						<template #header>
							<div class="metric-header">
								<span>Total Node Memory</span>
								<el-tag :type="memTagType" size="small">{{ memPercentage.toFixed(1) }}%</el-tag>
							</div>
						</template>
						<div class="gauge-container">
							<el-progress
								type="dashboard"
								:percentage="Number(memPercentage.toFixed(1))"
								:color="customColors"
								:width="180"
							/>
							<div class="mem-details">
								{{ formatBytes(stats.memoryUsed) }} / {{ formatBytes(stats.memoryTotal) }}
							</div>
						</div>
					</el-card>

					<el-card class="metric-card glass-card uptime-card">
						<template #header>
							<div class="metric-header">
								<span>Platform Uptime</span>
								<el-icon><Timer /></el-icon>
							</div>
						</template>
						<div class="uptime-value">
							{{ formatUptime(stats.uptime) }}
						</div>
					</el-card>
				</div>

				<div class="system-grid mt-6">
					<div class="mb-4 d-flex align-center">
						<h3 style="font-weight: 600; font-size: 1.2rem; margin: 0">Core Background Services</h3>
						<el-tag type="primary" size="small" class="ml-2">{{ systemProcesses.length }} Active</el-tag>
					</div>

					<div v-if="!systemProcesses.length" class="empty-state">
						<el-empty description="No core system processes found..." />
					</div>

					<el-row v-else :gutter="24" class="equal-height-row">
						<el-col
							v-for="row in systemProcesses"
							:key="row.name"
							:xs="24"
							:sm="24"
							:md="12"
							:lg="8"
							class="equal-height-col"
						>
							<div class="panel-card glass-card is-online">
								<div class="panel-header">
									<div class="panel-title-wrapper">
										<el-icon class="pulse-icon"><Setting /></el-icon>
										<span class="panel-title">{{ row.name }}</span>
									</div>
									<div class="panel-actions">
										<el-tag size="small" type="primary" effect="dark">SYSTEM</el-tag>
									</div>
								</div>

								<div class="panel-body">
									<div class="metric-block">
										<div class="metric-info">
											<span class="metric-label">Thread CPU</span>
											<span class="metric-hero">{{ row.cpuUsage.toFixed(1) }}%</span>
										</div>
										<div class="metric-chart">
											<svg
												v-if="history[row.name]"
												viewBox="0 0 300 60"
												preserveAspectRatio="none"
												width="100%"
												height="60"
											>
												<path :d="getSparklineData(history[row.name].cpu, 300, 60, 100).area" fill="url(#grad-cpu)" />
												<path
													:d="getSparklineData(history[row.name].cpu, 300, 60, 100).line"
													fill="none"
													stroke="#42b883"
													stroke-width="2"
												/>
											</svg>
										</div>
									</div>

									<div class="metric-block mt-4">
										<div class="metric-info">
											<span class="metric-label">Resident Set Size (RSS)</span>
											<span class="metric-hero">{{ formatBytes(row.memoryUsed) }}</span>
										</div>
										<div class="metric-chart">
											<svg
												v-if="history[row.name]"
												viewBox="0 0 300 60"
												preserveAspectRatio="none"
												width="100%"
												height="60"
											>
												<path :d="getSparklineData(history[row.name].mem, 300, 60, 0).area" fill="url(#grad-mem)" />
												<path
													:d="getSparklineData(history[row.name].mem, 300, 60, 0).line"
													fill="none"
													stroke="#646cff"
													stroke-width="2"
												/>
											</svg>
										</div>
									</div>
								</div>
							</div>
						</el-col>
					</el-row>
				</div>
			</el-tab-pane>
		</el-tabs>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

import { EditPen, Setting, Timer } from '@element-plus/icons-vue'

import { useMfe } from '../../../entities/mfe/lib/composables/useMfe'
import { systemApi } from '../../../entities/system/api'
import type { SystemStats } from '../../../entities/system/model'

const activeTab = ref('mfe')

const { microfrontends } = useMfe()

const stats = ref<SystemStats>({
	cpuUsage: 0,
	memoryUsed: 0,
	memoryTotal: 0,
	uptime: 0,
	processes: [],
})

// History for sparklines
const history = ref<Record<string, { cpu: number[]; mem: number[] }>>({})
const MAX_HISTORY = 30

// Combined MFE + Process data
const mfeMetrics = computed(() => {
	const allMfes = microfrontends.value || []

	return allMfes.map((m) => {
		const process = stats.value.processes.find((p) => p.name.toLowerCase() === (m.displayName || m.name).toLowerCase())

		return {
			...m,
			process,
			isOnline: !!process,
		}
	})
})

const systemProcesses = computed(() => {
	return stats.value.processes.filter((p) => p.isSystem)
})

const memPercentage = computed(() => {
	if (stats.value.memoryTotal === 0) return 0

	return (stats.value.memoryUsed / stats.value.memoryTotal) * 100
})

const cpuTagType = computed(() => {
	if (stats.value.cpuUsage > 80) return 'danger'
	if (stats.value.cpuUsage > 50) return 'warning'

	return 'success'
})

const memTagType = computed(() => {
	if (memPercentage.value > 85) return 'danger'
	if (memPercentage.value > 60) return 'warning'

	return 'success'
})

const customColors = [
	{ color: '#42b883', percentage: 40 },
	{ color: '#f59e0b', percentage: 70 },
	{ color: '#ff5f5f', percentage: 100 },
]

const formatBytes = (bytes: number) => {
	if (bytes === 0) return '0 B'
	const k = 1024
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
	const i = Math.floor(Math.log(bytes) / Math.log(k))

	// Rounding to one decimal place as requested (две десятых -> 0.1 precision)
	return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const formatUptime = (seconds: number) => {
	const days = Math.floor(seconds / (24 * 3600))
	const hours = Math.floor((seconds % (24 * 3600)) / 3600)
	const minutes = Math.floor((seconds % 3600) / 60)
	const secs = seconds % 60

	return `${days}d ${hours}h ${minutes}m ${secs}s`
}

let timer: any = null

const fetchStats = async () => {
	const response = await systemApi.getStats()

	const data = response.data

	if (data) {
		stats.value = data

		// Update history
		data.processes.forEach((p) => {
			if (!history.value[p.name]) {
				history.value[p.name] = { cpu: [], mem: [] }
			}

			const h = history.value[p.name]

			h.cpu.push(p.cpuUsage)

			h.mem.push(p.memoryUsed)

			if (h.cpu.length > MAX_HISTORY) h.cpu.shift()
			if (h.mem.length > MAX_HISTORY) h.mem.shift()
		})
	}
}

const getSparklineData = (values: number[], width: number, height: number, max: number = 100) => {
	if (values.length < 2) return { line: '', area: '' }
	const realMax = max === 0 ? Math.max(...values, 1) : max
	const step = width / (MAX_HISTORY - 1)
	const points = values.map((v, i) => {
		const x = i * step
		const y = height - (v / realMax) * height

		return { x, y }
	})
	const linePath = `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`
	const areaPath = `${linePath} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`

	return { line: linePath, area: areaPath }
}

onMounted(() => {
	fetchStats()

	timer = setInterval(fetchStats, 2000)
})

onUnmounted(() => {
	if (timer) clearInterval(timer)
})
</script>

<style scoped>
.monitoring-page {
	height: 100%;
}

.metrics-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
	gap: 24px;
}

.metric-card {
	display: flex;
	flex-direction: column;
}

.metric-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.gauge-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 20px 0;
}

.mem-details {
	font-size: 0.85rem;
	color: var(--gp-text-secondary);
	margin-top: 12px;
}

.uptime-card {
	align-items: center;
	justify-content: center;
}

.uptime-value {
	font-weight: 700;
	font-size: 1.5rem;
	text-align: center;
	color: var(--gp-primary);
	padding: 40px 0;
}

.mt-6 {
	margin-top: 24px;
}

.mr-2 {
	margin-right: 8px;
}

.ml-2 {
	margin-left: 8px;
}

.mb-4 {
	margin-bottom: 16px;
}

.d-flex {
	display: flex;
}

.align-center {
	align-items: center;
}

:deep(.monitoring-tabs .el-tabs__item) {
	font-weight: 500;
	font-size: 1.1rem;
	color: var(--gp-text-muted);
}

:deep(.monitoring-tabs .el-tabs__item.is-active) {
	font-weight: 700;
	color: var(--gp-primary);
}

:deep(.monitoring-tabs .el-tabs__nav-wrap::after) {
	background-color: rgb(255, 255, 255, 0.05);
}

.equal-height-row {
	display: flex;
	flex-wrap: wrap;
	align-items: stretch;
}

.equal-height-col {
	display: flex;
}

.panel-card {
	width: 100%;
	display: flex;
	flex: 1;
	flex-direction: column;
	border: 1px solid rgb(255, 255, 255, 0.08);
	border-radius: 12px;
	background: linear-gradient(145deg, rgb(20, 20, 20, 0.4) 0%, rgb(10, 10, 10, 0.8) 100%);
	transition: all 0.3s ease;
	padding: 20px 20px 0;
	margin-bottom: 24px;
	overflow: hidden;
}

.panel-card:hover {
	border-color: rgb(255, 255, 255, 0.15);
	box-shadow: 0 8px 24px rgb(0, 0, 0, 0.4);
	transform: translateY(-4px);
}

.panel-card.is-online {
	border-color: rgb(66, 184, 131, 0.3);
	box-shadow: 0 0 15px rgb(66, 184, 131, 0.1) inset;
}

.panel-card.is-offline {
	border-color: rgb(255, 95, 95, 0.2);
	filter: grayscale(0.8);
	opacity: 0.6;
}

.panel-body,
.panel-offline-body {
	display: flex;
	flex-grow: 1;
	flex-direction: column;
}

.panel-offline-body {
	align-items: center;
	justify-content: center;
	padding-bottom: 20px;
}

.panel-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20px;
}

.panel-title-wrapper {
	display: flex;
	align-items: center;
	gap: 10px;
}

.panel-actions {
	display: flex;
	align-items: center;
}

.status-dot {
	width: 10px;
	height: 10px;
	border-radius: 50%;
}

.status-dot.online {
	box-shadow: 0 0 8px var(--gp-success);
	background-color: var(--gp-success);
}

.status-dot.offline {
	background-color: var(--gp-danger);
}

.panel-title {
	font-weight: 700;
	font-size: 1.1rem;
	letter-spacing: 0.5px;
	color: var(--gp-text-main);
}

.metric-block {
	display: flex;
	flex-direction: column;
	margin-bottom: 12px;
}

.metric-info {
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	margin-bottom: 8px;
}

.metric-label {
	font-size: 0.8rem;
	letter-spacing: 1px;
	text-transform: uppercase;
	color: var(--gp-text-muted);
}

.metric-hero {
	font-weight: 800;
	font-variant-numeric: tabular-nums;
	font-size: 1.5rem;
	color: var(--gp-text-main);
}

.metric-chart {
	height: 60px;
	margin: 0 -20px; /* Stretch to edges */
}

.metric-chart svg {
	display: block;
}

.pulse-icon {
	font-size: 1.2rem;
	color: var(--gp-success);
	animation: pulse 2s infinite;
}

@keyframes pulse {
	0% {
		transform: scale(1);
		opacity: 0.6;
	}

	50% {
		transform: scale(1.2);
		opacity: 1;
	}

	100% {
		transform: scale(1);
		opacity: 0.6;
	}
}

.empty-state {
	padding: 40px 0;
}
</style>
