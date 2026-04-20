<template>
	<component :is="as" :class="classes">
		<div class="ui-button__content">
			<slot />
		</div>

		<slot v-if="$slots.postfix" class="ui-button__postfix" name="postfix" />
	</component>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

interface IProps {
	as?: 'button' | 'router-link'
	appearance?: 'primary' | 'secondary' | 'text'
	size?: 'm' | 'l'
}

const props = withDefaults(defineProps<IProps>(), {
	as: 'button',
	appearance: 'primary',
	size: 'l',
})

const classes = computed(() => ['ui-button', `ui-button--${props.appearance}`, `ui-button--${props.size}`])
</script>

<style lang="scss" scoped>
@use 'styles.scss';
</style>
