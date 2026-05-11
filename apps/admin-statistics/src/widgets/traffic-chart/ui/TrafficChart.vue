<template>
	<div class="traffic-chart glass-card">
		<div class="chart-header">
			<h3 class="chart-title">Traffic Overview</h3>
		</div>
		<div class="chart-container">
			<VChart class="chart" :option="option" autoresize />
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import VChart from 'vue-echarts'

import { LineChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'

import { analyticsApi, type TrafficStats } from '#entities/analytics'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent])

const props = defineProps<{
	days: number
}>()

const loading = ref(true)
const trafficData = ref<TrafficStats>({ labels: [], dau: [], sessions: [] })

const loadData = async () => {
	loading.value = true

	const res = await analyticsApi.getTraffic({ days: props.days })

	loading.value = false

	if (res.data) {
		trafficData.value = res.data
	}
}

watch(() => props.days, loadData)

onMounted(loadData)

const option = computed(() => ({
	backgroundColor: 'transparent',
	tooltip: {
		trigger: 'axis',
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
		borderColor: 'transparent',
		textStyle: { color: '#fff' },
	},
	legend: {
		data: ['Sessions', 'Unique Visitors'],
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
		type: 'category',
		boundaryGap: false,
		data: trafficData.value.labels,
		axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.1)' } },
		axisLabel: { color: '#94a3b8' },
	},
	yAxis: {
		type: 'value',
		splitLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.05)' } },
		axisLabel: { color: '#94a3b8' },
	},
	series: [
		{
			name: 'Sessions',
			type: 'line',
			smooth: true,
			data: trafficData.value.sessions,
			itemStyle: { color: '#42b883' },
			areaStyle: {
				color: {
					type: 'linear',
					x: 0,
					y: 0,
					x2: 0,
					y2: 1,
					colorStops: [
						{ offset: 0, color: 'rgba(66, 184, 131, 0.3)' },
						{ offset: 1, color: 'rgba(66, 184, 131, 0)' },
					],
				},
			},
		},
		{
			name: 'Unique Visitors',
			type: 'line',
			smooth: true,
			data: trafficData.value.dau,
			itemStyle: { color: '#00b4d8' },
			areaStyle: {
				color: {
					type: 'linear',
					x: 0,
					y: 0,
					x2: 0,
					y2: 1,
					colorStops: [
						{ offset: 0, color: 'rgba(0, 180, 216, 0.3)' },
						{ offset: 1, color: 'rgba(0, 180, 216, 0)' },
					],
				},
			},
		},
	],
}))
</script>

<style scoped lang="scss">
.traffic-chart {
	height: 400px;
	display: flex;
	flex-direction: column;
	padding: 24px;
}

.chart-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20px;
}

.chart-title {
	font-size: 1.1rem;
	color: var(--gp-text-main);
	margin: 0;
}

.chart-container {
	min-height: 0;
	flex: 1;
}

.chart {
	height: 100%;
}
</style>
