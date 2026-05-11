<template>
	<div class="engagement-stats glass-card">
		<div class="chart-header">
			<h3 class="chart-title">Venue Engagement</h3>
			<span class="subtitle">Top performing venues by views & clicks</span>
		</div>
		<div class="chart-container">
			<VChart class="chart" :option="option" autoresize />
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import VChart from 'vue-echarts'

import { analyticsApi, type EngagementStats } from '#entities/analytics'

const props = defineProps<{
	days: number
}>()

import { BarChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent])

const engagement = ref<EngagementStats>([])
const loading = ref(true)

const loadData = async () => {
	loading.value = true

	const res = await analyticsApi.getEngagement({ days: props.days })

	loading.value = false

	if (res.data) {
		engagement.value = res.data
	}
}

watch(() => props.days, loadData)

onMounted(loadData)

const option = computed(() => ({
	backgroundColor: 'transparent',
	tooltip: {
		trigger: 'axis',
		axisPointer: { type: 'shadow' },
	},
	legend: {
		data: ['Views', 'Clicks'],
		textStyle: { color: '#94a3b8' },
		bottom: 0,
	},
	grid: {
		left: '3%',
		right: '4%',
		bottom: '15%',
		top: '5%',
		containLabel: true,
	},
	xAxis: {
		type: 'value',
		splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
		axisLabel: { color: '#94a3b8' },
	},
	yAxis: {
		type: 'category',
		data: engagement.value.map((v) => v.entityId || 'Unknown'),
		axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } },
		axisLabel: { color: '#94a3b8' },
	},
	series: [
		{
			name: 'Views',
			type: 'bar',
			data: engagement.value.map((v) => v.views),
			itemStyle: {
				color: '#42b883',
				borderRadius: [0, 4, 4, 0],
			},
		},
		{
			name: 'Clicks',
			type: 'bar',
			data: engagement.value.map((v) => v.clicks),
			itemStyle: {
				color: '#00b4d8',
				borderRadius: [0, 4, 4, 0],
			},
		},
	],
}))
</script>

<style scoped lang="scss">
.engagement-stats {
	height: 400px;
	display: flex;
	flex-direction: column;
	padding: 24px;
}

.chart-header {
	margin-bottom: 20px;
}

.chart-title {
	font-size: 1.1rem;
	color: var(--gp-text-main);
	margin: 0;
}

.subtitle {
	font-size: 0.85rem;
	color: var(--gp-text-secondary);
}

.chart-container {
	min-height: 0;
	flex: 1;
}

.chart {
	height: 100%;
}
</style>
