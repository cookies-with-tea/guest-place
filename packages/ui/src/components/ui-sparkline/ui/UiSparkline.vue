<template>
	<VChart class="ui-sparkline" :style="{ height: `${height}px` }" :option="option" autoresize />
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import VChart from 'vue-echarts'

import { LineChart } from 'echarts/charts'
import { GridComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'

import { useResolvedColor } from '../../../lib/resolveCssColor'

use([CanvasRenderer, LineChart, GridComponent])

interface Props {
	data: number[]
	color?: string
	height?: number
	areaFill?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	color: 'var(--gp-primary)',
	height: 48,
	areaFill: true,
})

const color = useResolvedColor(toRef(props, 'color'))

const option = computed(() => ({
	backgroundColor: 'transparent',
	grid: { left: 0, right: 0, top: 2, bottom: 2 },
	xAxis: { type: 'category', show: false, boundaryGap: false, data: props.data.map((_, i) => i) },
	yAxis: { type: 'value', show: false, min: 'dataMin', max: 'dataMax' },
	series: [
		{
			type: 'line',
			smooth: true,
			symbol: 'none',
			data: props.data,
			lineStyle: { color: color.value, width: 2 },
			areaStyle: props.areaFill
				? {
						color: {
							type: 'linear',
							x: 0,
							y: 0,
							x2: 0,
							y2: 1,
							colorStops: [
								{ offset: 0, color: `${color.value}40` },
								{ offset: 1, color: `${color.value}00` },
							],
						},
					}
				: undefined,
		},
	],
}))
</script>

<style scoped>
.ui-sparkline {
	width: 100%;
}
</style>
