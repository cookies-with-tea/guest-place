<template>
	<div class="metric-block">
		<div class="metric-info">
			<span class="metric-label">{{ label }}</span>
			<span class="metric-hero">{{ heroValue }}</span>
		</div>
		<div class="metric-chart">
			<UiSparkline
				v-if="historyValues.length > 1"
				:data="historyValues"
				:color="strokeColor"
				:max="max === 0 ? undefined : max"
				:height="60"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { UiSparkline } from '@admin-panel/ui'

withDefaults(
	defineProps<{
		label: string
		heroValue: string
		historyValues: number[]
		/** Kept for API compatibility with existing call sites — the shared UiSparkline
		 * resolves its own gradient from `color`, it doesn't take a gradient id. */
		gradientId?: string
		strokeColor: string
		max?: number
	}>(),
	{
		max: 100,
	}
)
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
	color: var(--text-muted);
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
</style>
