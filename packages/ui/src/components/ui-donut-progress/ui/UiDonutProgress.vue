<template>
	<div class="ui-donut-progress" :style="{ width: `${size}px`, height: `${size}px` }">
		<VChart class="ui-donut-progress__chart" :option="option" :autoresize="false" />
		<div class="ui-donut-progress__center">
			<span class="ui-donut-progress__value">{{ Math.round(percent) }}%</span>
			<span v-if="label" class="ui-donut-progress__label">{{ label }}</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import VChart from 'vue-echarts'

import { PieChart } from 'echarts/charts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'

import { useResolvedColor } from '../../../lib/resolveCssColor'

use([CanvasRenderer, PieChart])

interface Props {
	/** 0–100 */
	percent: number
	label?: string
	size?: number
	color?: string
	trackColor?: string
}

const props = withDefaults(defineProps<Props>(), {
	size: 120,
	color: 'var(--gp-primary)',
	trackColor: 'var(--border-color)',
})

const color = useResolvedColor(toRef(props, 'color'))
const trackColor = useResolvedColor(toRef(props, 'trackColor'))

const option = computed(() => ({
	series: [
		{
			type: 'pie',
			radius: ['78%', '100%'],
			silent: true,
			avoidLabelOverlap: false,
			label: { show: false },
			labelLine: { show: false },
			itemStyle: { borderRadius: 999 },
			data: [
				{ value: Math.max(props.percent, 0), itemStyle: { color: color.value } },
				{ value: Math.max(100 - props.percent, 0), itemStyle: { color: trackColor.value } },
			],
		},
	],
}))
</script>

<style scoped lang="scss">
.ui-donut-progress {
	position: relative;

	&__chart {
		width: 100%;
		height: 100%;
	}

	&__center {
		position: absolute;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		pointer-events: none;
		inset: 0;
	}

	&__value {
		font-weight: 700;
		font-size: 20px;
		color: var(--text-primary);
	}

	&__label {
		font-size: 11px;
		color: var(--text-muted);
		margin-top: 2px;
	}
}
</style>
