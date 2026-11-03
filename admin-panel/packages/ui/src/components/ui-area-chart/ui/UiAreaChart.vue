<template>
	<VChart class="ui-area-chart" :option="option" autoresize />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'

import { LineChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'

import { useResolvedColors } from '../../../lib/resolveCssColor'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent])

interface Series {
	name: string
	data: number[]
	/** CSS color or `var(--token)` — resolved before being handed to the canvas renderer. */
	color?: string
}

interface Props {
	series: Series[]
	categories: string[]
	showLegend?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	showLegend: true,
})

// Distinct from each other regardless of theme — don't fall back to --el-color-primary, it tracks
// --gp-primary in this app and would make a 2nd series render in the same color as the 1st.
const PALETTE = ['var(--gp-primary)', '#06b6d4', '#10b981']

const seriesColors = computed(() => props.series.map((s, i) => s.color || PALETTE[i % PALETTE.length]))
const resolvedColors = useResolvedColors(seriesColors)
const textColor = useResolvedColors(computed(() => ['var(--text-muted)']))
const borderColor = useResolvedColors(computed(() => ['var(--border-color)']))

const option = computed(() => ({
	backgroundColor: 'transparent',
	tooltip: { trigger: 'axis' },
	legend: props.showLegend
		? { data: props.series.map((s) => s.name), textStyle: { color: textColor.value[0] }, bottom: 0 }
		: undefined,
	grid: { left: '2%', right: '2%', top: '8%', bottom: props.showLegend ? '15%' : '2%', containLabel: true },
	xAxis: {
		type: 'category',
		boundaryGap: false,
		data: props.categories,
		axisLine: { lineStyle: { color: borderColor.value[0] } },
		axisLabel: { color: textColor.value[0] },
	},
	yAxis: {
		type: 'value',
		splitLine: { lineStyle: { color: borderColor.value[0], opacity: 0.4 } },
		axisLabel: { color: textColor.value[0] },
	},
	series: props.series.map((s, i) => ({
		name: s.name,
		type: 'line',
		smooth: true,
		symbol: 'none',
		data: s.data,
		itemStyle: { color: resolvedColors.value[i] },
		areaStyle: {
			color: {
				type: 'linear',
				x: 0,
				y: 0,
				x2: 0,
				y2: 1,
				colorStops: [
					{ offset: 0, color: `${resolvedColors.value[i]}4d` },
					{ offset: 1, color: `${resolvedColors.value[i]}00` },
				],
			},
		},
	})),
}))
</script>

<style scoped>
.ui-area-chart {
	width: 100%;
	height: 100%;
}
</style>
