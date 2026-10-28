<template>
	<div class="ui-stat-card">
		<div class="ui-stat-card__head">
			<span class="ui-stat-card__label">{{ label }}</span>
			<span v-if="icon" class="ui-stat-card__icon"
				><slot name="icon">{{ icon }}</slot></span
			>
		</div>

		<div class="ui-stat-card__body">
			<span class="ui-stat-card__value">{{ value }}</span>
			<span v-if="trend !== undefined" class="ui-stat-card__trend" :class="trendDirection">
				<span class="ui-stat-card__trend-arrow">{{ trendDirection === 'is-up' ? '▲' : '▼' }}</span>
				{{ Math.abs(trend) }}%
			</span>
		</div>

		<span v-if="trendLabel" class="ui-stat-card__trend-label">{{ trendLabel }}</span>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
	label: string
	value: string | number
	/** Percentage change; sign decides the arrow/color, pass a negative number for a drop. */
	trend?: number
	trendLabel?: string
	icon?: string
}

const props = defineProps<Props>()

const trendDirection = computed(() => ((props.trend ?? 0) >= 0 ? 'is-up' : 'is-down'))
</script>

<style scoped lang="scss">
.ui-stat-card {
	display: flex;
	flex-direction: column;
	border: 1px solid var(--border-color);
	border-radius: var(--gp-radius-sm, 16px);
	box-shadow: var(--gp-glass-shadow, none);
	background: var(--bg-card);
	padding: 18px 20px;
	gap: 10px;

	&__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	&__label {
		font-size: 13px;
		color: var(--text-muted);
	}

	&__icon {
		width: 28px;
		height: 28px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		font-size: 14px;
		background: var(--gp-primary-light);
	}

	&__body {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 10px;
	}

	&__value {
		font-weight: 700;
		font-size: 26px;
		line-height: 1.1;
		color: var(--text-primary);
	}

	&__trend {
		display: inline-flex;
		align-items: center;
		border-radius: 999px;
		font-weight: 600;
		font-size: 12px;
		padding: 2px 8px;
		gap: 2px;

		&.is-up {
			color: var(--el-color-success, #10b981);
			background: rgb(16, 185, 129, 0.12);
		}

		&.is-down {
			color: var(--el-color-danger, #f04438);
			background: rgb(240, 68, 56, 0.12);
		}
	}

	&__trend-arrow {
		font-size: 9px;
	}

	&__trend-label {
		font-size: 12px;
		color: var(--text-muted);
	}
}
</style>
