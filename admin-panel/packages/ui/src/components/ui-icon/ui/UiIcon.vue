<template>
	<svg aria-hidden="true" class="ui-icon" :class="iconClass" :height="props.height" :width="props.width">
		<use :href="symbolId" />
	</svg>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted } from 'vue'

import { useUiIcon } from '../composables'
import type { IconNamesType } from '../types/iconTypes'

type Props = {
	name: IconNamesType
	prefix?: string
	width?: string | number
	height?: string | number
	reverse?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	prefix: 'icon',
	width: '23px',
	height: '24px',
	reverse: false,
})

const { initIcon } = useUiIcon()

const symbolId = computed(() => `#${props.prefix}-${props.name}`)

const iconClass = computed(() => {
	return [{ 'ui-icon--reversed': props.reverse }, `ui-icon--${props.name}`]
})

onMounted(async () => {
	await nextTick()

	await initIcon()
})
</script>

<style lang="scss" scoped>
@use './styles';
</style>
