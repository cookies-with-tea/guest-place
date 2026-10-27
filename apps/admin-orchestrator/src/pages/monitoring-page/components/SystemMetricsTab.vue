<template>
	<div>
		<div class="metrics-grid mt-4">
			<el-card class="metric-card glass-card">
				<template #header>
					<div class="metric-header">
						<span>Total Node CPU Usage</span>
						<el-tag :type="stats.cpuTagType" size="small">{{ stats.stats.cpuUsage.toFixed(1) }}%</el-tag>
					</div>
				</template>
				<div class="gauge-container">
					<el-progress
						type="dashboard"
						:percentage="Number(Math.min(100, stats.stats.cpuUsage)).toFixed(1)"
						:color="customColors"
						:width="180"
					/>
				</div>
			</el-card>

			<el-card class="metric-card glass-card">
				<template #header>
					<div class="metric-header">
						<span>Total Node Memory</span>
						<el-tag :type="stats.memTagType" size="small">{{ stats.memPercentage.toFixed(1) }}%</el-tag>
					</div>
				</template>
				<div class="gauge-container">
					<el-progress
						type="dashboard"
						:percentage="Number(stats.memPercentage.toFixed(1))"
						:color="customColors"
						:width="180"
					/>
					<div class="mem-details">
						{{ formatBytes(stats.stats.memoryUsed) }} / {{ formatBytes(stats.stats.memoryTotal) }}
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
					{{ formatUptime(stats.stats.uptime) }}
				</div>
			</el-card>
		</div>

		<div class="system-grid mt-6">
			<div class="mb-4 d-flex align-center">
				<h3 style="font-weight: 600; font-size: 1.2rem; margin: 0">Core Background Services</h3>
				<el-tag type="primary" size="small" class="ml-2">{{ stats.systemProcesses.length }} Active</el-tag>
			</div>

			<div v-if="!stats.systemProcesses.length" class="empty-state">
				<el-empty description="No core system processes found..." />
			</div>

			<el-row v-else :gutter="24" class="equal-height-row">
				<el-col
					v-for="row in stats.systemProcesses"
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
							<SparklineMetric
								label="Thread CPU"
								:hero-value="`${row.cpuUsage.toFixed(1)}%`"
								:history-values="stats.history[row.name]?.cpu || []"
								gradient-id="grad-cpu"
								stroke-color="#42b883"
								:max="100"
							/>

							<SparklineMetric
								class="mt-4"
								label="Resident Set Size (RSS)"
								:hero-value="formatBytes(row.memoryUsed)"
								:history-values="stats.history[row.name]?.mem || []"
								gradient-id="grad-mem"
								stroke-color="#646cff"
								:max="0"
							/>
						</div>
					</div>
				</el-col>
			</el-row>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Setting, Timer } from '@element-plus/icons-vue'

import { formatBytes, formatUptime, type SystemStatsState } from '../composables/useSystemStats'
import SparklineMetric from './SparklineMetric.vue'

defineProps<{
	stats: SystemStatsState
}>()

const customColors = [
	{ color: '#42b883', percentage: 40 },
	{ color: '#f59e0b', percentage: 70 },
	{ color: '#ff5f5f', percentage: 100 },
]
</script>

<style scoped>
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

.panel-body {
	display: flex;
	flex-grow: 1;
	flex-direction: column;
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
