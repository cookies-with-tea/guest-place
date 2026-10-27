<template>
	<div class="metric-block">
		<div class="metric-info">
			<span class="metric-label">{{ label }}</span>
			<span class="metric-hero">{{ heroValue }}</span>
		</div>
		<div class="metric-chart">
			<svg v-if="historyValues.length" viewBox="0 0 300 60" preserveAspectRatio="none" width="100%" height="60">
				<path :d="sparkline.area" :fill="`url(#${gradientId})`" />
				<path :d="sparkline.line" fill="none" :stroke="strokeColor" stroke-width="2" />
			</svg>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const MAX_HISTORY = 30

const props = withDefaults(
	defineProps<{
		label: string
		heroValue: string
		historyValues: number[]
		gradientId: string
		strokeColor: string
		max?: number
	}>(),
	{
		max: 100,
	}
)

const getSparklineData = (values: number[], width: number, height: number, max: number) => {
	if (values.length < 2) return { line: '', area: '' }

	const realMax = max === 0 ? Math.max(...values, 1) : max
	const step = width / (MAX_HISTORY - 1)
	const points = values.map((v, i) => {
		const x = i * step
		const y = height - (v / realMax) * height

		return { x, y }
	})
	const linePath = `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`
	const areaPath = `${linePath} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`

	return { line: linePath, area: areaPath }
}

const sparkline = computed(() => getSparklineData(props.historyValues, 300, 60, props.max))
</script>

<style scoped>
.metric-block {
	display: flex;
	flex-direction: column;
	margin-bottom: 12px;
}

.metric-info {
	display: flex;
	align-items: flex-end;
	justify-content: space-between;
	margin-bottom: 8px;
}

.metric-label {
	font-size: 0.8rem;
	letter-spacing: 1px;
	text-transform: uppercase;
	color: var(--gp-text-muted);
}

.metric-hero {
	font-weight: 800;
	font-variant-numeric: tabular-nums;
	font-size: 1.5rem;
	color: var(--gp-text-main);
}

.metric-chart {
	height: 60px;
	margin: 0 -20px; /* Stretch to edges */
}

.metric-chart svg {
	display: block;
}
</style>
