<template>
	<ul class="ui-ranked-list">
		<li v-for="(item, index) in items" :key="item.id ?? index" class="ui-ranked-list__item">
			<span v-if="$slots.icon || item.icon" class="ui-ranked-list__icon">
				<slot name="icon" :item="item">{{ item.icon }}</slot>
			</span>

			<div class="ui-ranked-list__body">
				<div class="ui-ranked-list__row">
					<span class="ui-ranked-list__label">{{ item.label }}</span>
					<span class="ui-ranked-list__value">{{ item.value }}</span>
				</div>

				<div v-if="item.percent !== undefined" class="ui-ranked-list__track">
					<div class="ui-ranked-list__fill" :style="{ width: `${Math.min(item.percent, 100)}%` }" />
				</div>
			</div>

			<span
				v-if="item.trend !== undefined"
				class="ui-ranked-list__trend"
				:class="item.trend >= 0 ? 'is-up' : 'is-down'"
			>
				{{ item.trend >= 0 ? '▲' : '▼' }} {{ Math.abs(item.trend) }}%
			</span>
		</li>
	</ul>
</template>

<script setup lang="ts">
import type { RankedListItem } from '../model'

defineProps<{
	items: RankedListItem[]
}>()
</script>

<style scoped lang="scss">
.ui-ranked-list {
	display: flex;
	flex-direction: column;
	list-style: none;
	padding: 0;
	margin: 0;
	gap: 14px;

	&__item {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	&__icon {
		width: 24px;
		display: inline-flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		font-size: 16px;
	}

	&__body {
		min-width: 0;
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 6px;
	}

	&__row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 8px;
	}

	&__label {
		font-size: 13px;
		white-space: nowrap;
		text-overflow: ellipsis;
		color: var(--text-primary);
		overflow: hidden;
	}

	&__value {
		flex-shrink: 0;
		font-size: 12px;
		color: var(--text-muted);
	}

	&__track {
		width: 100%;
		height: 4px;
		border-radius: 999px;
		background: var(--border-color);
		overflow: hidden;
	}

	&__fill {
		height: 100%;
		border-radius: 999px;
		background: var(--gp-primary);
	}

	&__trend {
		flex-shrink: 0;
		font-weight: 600;
		font-size: 12px;

		&.is-up {
			color: var(--el-color-success, #10b981);
		}

		&.is-down {
			color: var(--el-color-danger, #f04438);
		}
	}
}
</style>
