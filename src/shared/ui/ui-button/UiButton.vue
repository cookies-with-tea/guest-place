<template>
	<component :is="is" class="ui-button">
		<slot />
	</component>
</template>

<script lang="ts" setup>
interface IProps {
	is: 'button' | 'router-link'
}

withDefaults(defineProps<IProps>(), {
	is: 'button',
})
</script>
