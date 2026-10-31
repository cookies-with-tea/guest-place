<template>
	<div class="mfe-grid mt-4">
		<el-row :gutter="24" class="equal-height-row">
			<el-col v-for="m in stats.mfeMetrics" :key="m.id" :xs="24" :sm="24" :md="12" :lg="8" class="equal-height-col">
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
						<SparklineMetric
							label="CPU Usage"
							:hero-value="`${m.process.cpuUsage.toFixed(1)}%`"
							:history-values="stats.history[m.process.name]?.cpu || []"
							gradient-id="grad-cpu"
							stroke-color="#42b883"
							:max="100"
						/>

						<SparklineMetric
							class="mt-4"
							label="Memory Allocation"
							:hero-value="formatBytes(m.process.memoryUsed)"
							:history-values="stats.history[m.process.name]?.mem || []"
							gradient-id="grad-mem"
							stroke-color="#646cff"
							:max="0"
						/>
					</div>
					<div v-else class="panel-offline-body">
						<el-empty description="Service Offline" :image-size="60" />
					</div>
				</div>
			</el-col>
		</el-row>
	</div>
</template>

<script setup lang="ts">
import { EditPen } from '@element-plus/icons-vue'

import { formatBytes, type SystemStatsState } from '../composables/useSystemStats'
import SparklineMetric from './SparklineMetric.vue'

defineProps<{
	stats: SystemStatsState
}>()
</script>

<style scoped>
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

.panel-card.is-offline {
	filter: grayscale(0.8);
	opacity: 0.6;
}

.status-dot {
	width: 10px;
	height: 10px;
	border-radius: 50%;
}

.status-dot.online {
	box-shadow: 0 0 8px var(--el-color-success, #10b981);
	background-color: var(--el-color-success, #10b981);
}

.status-dot.offline {
	background-color: var(--el-color-danger, #f04438);
}

.mr-2 {
	margin-right: 8px;
}
</style>
