<template>
	<div class="ui-select" :class="[`ui-select--${size}`, { 'is-loading': loading }]">
		<el-select v-bind="$attrs" :size="size === 'l' ? 'large' : 'default'" class="ui-select__control" :loading="loading">
			<template v-for="(_, name) in $slots" #[name]="slotData">
				<slot :name="name" v-bind="slotData || {}" />
			</template>
		</el-select>
	</div>
</template>

<script lang="ts" setup>
interface IProps {
	size?: 'm' | 'l'
	loading?: boolean
}

withDefaults(defineProps<IProps>(), {
	size: 'l',
	loading: false,
})

defineOptions({
	inheritAttrs: false,
})
</script>

<style scoped lang="scss">
.ui-select {
	width: 100%;
}

:deep(.el-select__wrapper) {
	border: 1px solid var(--gp-glass-border-inner) !important;
	border-radius: var(--gp-radius-md);
	box-shadow: 0 0 0 1px var(--gp-glass-border) inset !important;
	background: var(--gp-glass-gradient) !important;
	background-color: var(--gp-bg-glass) !important;
	transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	backdrop-filter: blur(var(--gp-glass-blur));

	&:hover {
		background-color: var(--gp-bg-glass-hover) !important;
	}

	&.is-focused {
		box-shadow:
			0 0 0 1px var(--gp-primary) inset,
			0 8px 16px -4px var(--gp-primary-light) !important;
		background: var(--gp-bg-glass-hover) !important;
		transform: translateY(-1px);
	}
}

.ui-select--m {
	:deep(.el-select__wrapper) {
		border-radius: var(--gp-radius-sm);
	}
}
</style>
