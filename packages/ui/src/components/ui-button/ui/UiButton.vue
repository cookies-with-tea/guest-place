<template>
	<component :is="as" :class="classes" :disabled="as === 'button' ? disabled || loading : undefined">
		<span v-if="loading" class="ui-button__spinner" />
		<div class="ui-button__content">
			<slot />
		</div>

		<slot v-if="$slots.postfix" class="ui-button__postfix" name="postfix" />
	</component>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

export interface IProps {
	as?: 'button' | 'router-link'
	appearance?: 'primary' | 'secondary' | 'text'
	size?: 'm' | 'l'
	disabled?: boolean
	loading?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
	as: 'button',
	appearance: 'primary',
	size: 'l',
	disabled: false,
	loading: false,
})

const classes = computed(() => [
	'ui-button',
	`ui-button--${props.appearance}`,
	`ui-button--${props.size}`,
	{ 'is-disabled': props.disabled || props.loading, 'is-loading': props.loading },
])
</script>

<style lang="scss" scoped>
@use 'styles.scss';
</style>
