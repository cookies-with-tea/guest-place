<template>
	<div class="ui-glass-card">
		<div class="card-head">
			<div class="card-head__icon">{{ icon }}</div>
			<div class="card-head__text">
				<h3>{{ title }}</h3>
				<p v-if="description">{{ description }}</p>
			</div>
			<slot name="actions" />
		</div>
		<slot />
	</div>
</template>

<script setup lang="ts">
interface Props {
	icon: string
	title: string
	description?: string
}

defineProps<Props>()
</script>

<style scoped lang="scss">
.ui-glass-card {
	border: 1px solid var(--gp-glass-border, rgb(255, 255, 255, 0.08));
	border-radius: 12px;
	background: var(--gp-bg-card, var(--gp-bg-surface, rgb(30, 41, 59, 0.5)));
	padding: 18px 20px;
	margin-bottom: 16px;
	backdrop-filter: blur(12px);
}

.card-head {
	display: flex;
	flex-wrap: wrap;
	align-items: flex-start;
	border-bottom: 1px solid var(--gp-glass-border, rgb(255, 255, 255, 0.06));
	padding-bottom: 12px;
	margin-bottom: 16px;
	gap: 10px;

	&__icon {
		font-size: 20px;
		line-height: 1;
	}

	&__text {
		min-width: 0;
		flex: 1;

		h3 {
			font-weight: 600;
			font-size: 15px;
			color: var(--gp-text-main, #fff);
			margin: 0;
		}

		p {
			font-size: 12px;
			color: var(--gp-text-secondary, #94a3b8);
			margin: 3px 0 0;
		}
	}
}
</style>
