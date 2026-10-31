<template>
	<div class="dashboard-stats-grid">
		<div class="stat-card glass-card">
			<div class="stat-icon stat-icon--total">
				<el-icon><Monitor /></el-icon>
			</div>
			<div class="stat-content">
				<div class="stat-value">{{ total }}</div>
				<div class="stat-label">Всего MFE</div>
			</div>
		</div>

		<div class="stat-card glass-card">
			<div class="stat-icon stat-icon--online">
				<span class="live-dot" />
			</div>
			<div class="stat-content">
				<div class="stat-value text-success">{{ health.onlineCount }}</div>
				<div class="stat-label">Онлайн</div>
			</div>
		</div>

		<div class="stat-card glass-card">
			<div class="stat-icon stat-icon--offline">
				<span class="offline-dot" />
			</div>
			<div class="stat-content">
				<div class="stat-value text-danger">{{ health.offlineCount }}</div>
				<div class="stat-label">Офлайн</div>
			</div>
		</div>

		<div class="stat-card glass-card">
			<div class="stat-icon stat-icon--latency">
				<el-icon><Timer /></el-icon>
			</div>
			<div class="stat-content">
				<div class="stat-value text-primary">
					{{ health.avgLatency !== null ? `${health.avgLatency} ms` : '—' }}
				</div>
				<div class="stat-label">Средняя задержка</div>
			</div>
		</div>

		<div class="stat-card glass-card">
			<div class="stat-icon stat-icon--size">
				<el-icon><Files /></el-icon>
			</div>
			<div class="stat-content">
				<div class="stat-value text-info">{{ health.formatBytes(health.totalChunkBytes) }}</div>
				<div class="stat-label">Размер чанков</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Files, Monitor, Timer } from '@element-plus/icons-vue'

import type { ModuleHealth } from '../composables/useModuleHealth'

defineProps<{
	total: number
	health: ModuleHealth
}>()
</script>

<style scoped lang="scss">
.dashboard-stats-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	margin-bottom: 24px;
	gap: 16px;
}

.stat-card {
	display: flex;
	align-items: center;
	border: 1px solid var(--gp-glass-border, rgb(255, 255, 255, 0.08));
	border-radius: 12px;
	background: var(--gp-bg-glass, rgb(20, 20, 20, 0.6));
	transition:
		transform 0.2s,
		box-shadow 0.2s;
	padding: 16px 20px;
	gap: 16px;

	&:hover {
		box-shadow: 0 6px 18px rgb(0, 0, 0, 0.3);
		transform: translateY(-2px);
	}
}

.stat-icon {
	width: 44px;
	height: 44px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 10px;
	font-size: 22px;

	&--total {
		color: var(--gp-primary, #7c3aed);
		background: rgb(var(--gp-primary-rgb), 0.15);
	}

	&--online {
		background: rgb(66, 184, 131, 0.2);
	}

	&--offline {
		background: rgb(255, 95, 95, 0.2);
	}

	&--latency {
		color: #646cff;
		background: rgb(100, 108, 255, 0.15);
	}

	&--size {
		color: #f59e0b;
		background: rgb(245, 158, 11, 0.15);
	}
}

.live-dot {
	width: 14px;
	height: 14px;
	border-radius: 50%;
	box-shadow: 0 0 10px var(--gp-primary, #7c3aed);
	background-color: var(--gp-primary, #7c3aed);
	animation: pulse-live 2s infinite;
}

.offline-dot {
	width: 14px;
	height: 14px;
	border-radius: 50%;
	box-shadow: 0 0 8px #ff5f5f;
	background-color: #ff5f5f;
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
	font-weight: 700;
	font-size: 1.45rem;
	line-height: 1.2;
	color: var(--gp-text-main, #fff);
}

.stat-label {
	font-size: 0.78rem;
	letter-spacing: 0.4px;
	text-transform: uppercase;
	color: var(--text-muted, #718096);
	margin-top: 2px;
}

.text-success {
	/* Used for health.onlineCount — an actual success/health count, not brand accent. */
	color: var(--el-color-success, #10b981) !important;
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
</style>
