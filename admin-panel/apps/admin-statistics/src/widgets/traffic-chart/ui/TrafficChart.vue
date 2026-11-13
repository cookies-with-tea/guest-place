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
import { ElMessage } from 'element-plus'

import { LineChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'

import { useTheme } from '@admin-panel/ui'

import { analyticsApi, type TrafficStats } from '#entities/analytics'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent])

const props = defineProps<{
	days: number
}>()

const { isDark } = useTheme()

const loading = ref(true)
const trafficData = ref<TrafficStats>({ labels: [], dau: [], sessions: [] })

// ECharts рендерит в canvas, var(--gp-*) там не резолвится — держим light/dark
// в паре с токенами из _tokens.scss (gp-text-secondary / gp-border-color).
const axisTextColor = computed(() => (isDark.value ? '#94a3b8' : '#656d76'))
const axisLineColor = computed(() => (isDark.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'))
const splitLineColor = computed(() => (isDark.value ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'))

const loadData = async () => {
	loading.value = true

	try {
		const res = await analyticsApi.getTraffic({ days: props.days })

		if (res.data) {
			trafficData.value = res.data
		}
	} catch (err: any) {
		ElMessage.error(err?.message || 'Failed to load traffic data')
	} finally {
		loading.value = false
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
		textStyle: { color: axisTextColor.value },
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
		axisLine: { lineStyle: { color: axisLineColor.value } },
		axisLabel: { color: axisTextColor.value },
	},
	yAxis: {
		type: 'value',
		splitLine: { lineStyle: { color: splitLineColor.value } },
		axisLabel: { color: axisTextColor.value },
	},
	series: [
		{
			name: 'Sessions',
			type: 'line',
			smooth: true,
			data: trafficData.value.sessions,
			itemStyle: { color: '#7c3aed' },
			areaStyle: {
				color: {
					type: 'linear',
					x: 0,
					y: 0,
					x2: 0,
					y2: 1,
					colorStops: [
						{ offset: 0, color: 'rgba(124, 58, 237, 0.3)' },
						{ offset: 1, color: 'rgba(124, 58, 237, 0)' },
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
