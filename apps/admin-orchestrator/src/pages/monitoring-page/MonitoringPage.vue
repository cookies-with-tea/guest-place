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
				<MfeMetricsTab :stats="stats" />
			</el-tab-pane>

			<el-tab-pane label="System Infrastructure" name="system">
				<SystemMetricsTab :stats="stats" />
			</el-tab-pane>
		</el-tabs>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { useMfe } from '#entities/mfe'

import { useSystemStats } from './composables/useSystemStats'
import MfeMetricsTab from './components/MfeMetricsTab.vue'
import SystemMetricsTab from './components/SystemMetricsTab.vue'

const activeTab = ref('mfe')

const { microfrontends } = useMfe()
const stats = useSystemStats(microfrontends)
</script>

<style scoped>
.monitoring-page {
	height: 100%;
}

.mt-4 {
	margin-top: 16px;
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

/* Panel card: shared by the MFE grid and the system-process grid */
:deep(.equal-height-row) {
	display: flex;
	flex-wrap: wrap;
	align-items: stretch;
}

:deep(.equal-height-col) {
	display: flex;
}

:deep(.panel-card) {
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

:deep(.panel-card:hover) {
	border-color: rgb(255, 255, 255, 0.15);
	box-shadow: 0 8px 24px rgb(0, 0, 0, 0.4);
	transform: translateY(-4px);
}

:deep(.panel-card.is-online) {
	border-color: rgb(66, 184, 131, 0.3);
	box-shadow: 0 0 15px rgb(66, 184, 131, 0.1) inset;
}

:deep(.panel-header) {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20px;
}

:deep(.panel-title-wrapper) {
	display: flex;
	align-items: center;
	gap: 10px;
}

:deep(.panel-actions) {
	display: flex;
	align-items: center;
}

:deep(.panel-title) {
	font-weight: 700;
	font-size: 1.1rem;
	letter-spacing: 0.5px;
	color: var(--gp-text-main);
}
</style>
