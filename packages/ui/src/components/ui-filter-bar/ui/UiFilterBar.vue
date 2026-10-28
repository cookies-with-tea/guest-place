<template>
	<div class="ui-filter-bar">
		<div class="ui-filter-bar__controls">
			<slot />
		</div>
		<div v-if="totalLabel || $slots.actions" class="ui-filter-bar__meta">
			<span v-if="totalLabel" class="ui-filter-bar__total">{{ totalLabel }}</span>
			<slot name="actions" />
		</div>
	</div>
</template>

<script setup lang="ts">
export interface Props {
	/** Right-aligned summary text, e.g. "Total: 12". Omit to hide the meta area unless the `actions` slot is used. */
	totalLabel?: string
}

defineProps<Props>()
</script>

<style scoped lang="scss">
.ui-filter-bar {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	border: 1px solid var(--border-color);
	border-radius: 10px;
	background: var(--bg-card);
	padding: 14px 18px;
	margin-bottom: 16px;
	gap: 12px;

	&__controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px;
	}

	&__meta {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	&__total {
		font-weight: 500;
		font-size: 13px;
		white-space: nowrap;
		color: var(--text-muted);
	}
}
</style>
