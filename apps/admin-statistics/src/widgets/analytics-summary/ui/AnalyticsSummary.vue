<template>
	<div class="analytics-summary">
		<div v-for="stat in stats" :key="stat.label" class="summary-card glass-card">
			<div class="stat-icon" :style="{ color: stat.color }">
				<ElIcon><component :is="stat.icon" /></ElIcon>
			</div>
			<div class="stat-info">
				<div class="stat-value">{{ stat.value }}</div>
				<div class="stat-label">{{ stat.label }}</div>
			</div>
			<div class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
				{{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}%
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { Pointer, Timer, User, View } from '@element-plus/icons-vue'
import { ElIcon } from 'element-plus'

import { analyticsApi, type AnalyticsSummary } from '#entities/analytics'

const props = defineProps<{
	days: number
}>()

const summary = ref<AnalyticsSummary>({
	totalVisitors: 0,
	avgSessionDuration: 0,
	totalClicks: 0,
	pageViews: 0,
	visitorsTrend: 0,
	sessionTrend: 0,
	clicksTrend: 0,
	viewsTrend: 0,
})

const stats = computed(() => [
	{
		label: 'Total Visitors',
		value: summary.value.totalVisitors.toLocaleString(),
		icon: User,
		color: '#409EFF',
		trend: summary.value.visitorsTrend,
	},
	{
		label: 'Avg. Session',
		value: Math.floor(summary.value.avgSessionDuration / 60) + 'm ' + (summary.value.avgSessionDuration % 60) + 's',
		icon: Timer,
		color: '#67C23A',
		trend: summary.value.sessionTrend,
	},
	{
		label: 'Total Clicks',
		value: summary.value.totalClicks.toLocaleString(),
		icon: Pointer,
		color: '#E6A23C',
		trend: summary.value.clicksTrend,
	},
	{
		label: 'Page Views',
		value: summary.value.pageViews.toLocaleString(),
		icon: View,
		color: '#F56C6C',
		trend: summary.value.viewsTrend,
	},
])

const loadData = async () => {
	const res = await analyticsApi.getSummary({ days: props.days })

	if (res.data) {
		summary.value = res.data
	}
}

watch(() => props.days, loadData)

onMounted(loadData)
</script>

<style scoped lang="scss">
.analytics-summary {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	margin-bottom: 24px;
	gap: 20px;
}

.summary-card {
	position: relative;
	display: flex;
	align-items: center;
	padding: 20px;
	overflow: hidden;
}

.stat-icon {
	width: 48px;
	height: 48px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 12px;
	font-size: 24px;
	background: rgb(var(--gp-primary-rgb), 0.1);
	margin-right: 16px;
}

.stat-info {
	flex: 1;
}

.stat-value {
	font-weight: 700;
	font-size: 1.5rem;
	color: var(--gp-text-main);
}

.stat-label {
	font-size: 0.85rem;
	color: var(--gp-text-secondary);
}

.stat-trend {
	top: 12px;
	right: 12px;
	position: absolute;
	border-radius: 4px;
	font-weight: 600;
	font-size: 0.75rem;
	padding: 2px 6px;

	&.up {
		color: #67c23a;
		background: rgb(103, 194, 58, 0.1);
	}

	&.down {
		color: #f56c6c;
		background: rgb(245, 108, 108, 0.1);
	}
}
</style>
