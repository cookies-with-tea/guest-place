<template>
	<div class="media-filters__type-bar">
		<div class="type-pills">
			<button
				v-for="typeOption in MEDIA_TYPE_OPTIONS"
				:key="typeOption.value"
				class="type-pill"
				:class="{ 'is-active': controls.isTypeActive(typeOption.value) }"
				type="button"
				@click="controls.toggleMediaType(typeOption.value)"
			>
				<span class="type-pill-icon">{{ typeOption.icon }}</span>
				<span class="type-pill-label">{{ typeOption.label }}</span>
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { MEDIA_TYPE_OPTIONS } from '../../composables/useMediaFilterControls'
import type { MediaFilterControls } from '../../composables/useMediaFilterControls'

defineProps<{
	controls: MediaFilterControls
}>()
</script>

<style scoped>
.media-filters__type-bar {
	display: flex;
	align-items: center;
	padding-bottom: 4px;
	overflow-x: auto;
}

.type-pills {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.type-pill {
	display: inline-flex;
	align-items: center;
	border: 1px solid var(--border-color);
	border-radius: 20px;
	font-weight: 500;
	font-size: 13px;
	color: var(--text-primary);
	background: var(--bg-surface);
	transition: all 0.2s ease;
	cursor: pointer;
	padding: 6px 14px;
	gap: 6px;
}

.type-pill:hover {
	border-color: var(--accent-primary);
	color: var(--accent-primary);
}

.type-pill.is-active {
	border-color: var(--accent-primary);
	color: #fff;
	background: var(--accent-primary);
}

.type-pill-icon {
	font-size: 14px;
}
</style>
