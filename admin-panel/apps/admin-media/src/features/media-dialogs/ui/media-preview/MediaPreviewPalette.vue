<template>
	<div class="palette-box">
		<div class="palette-header">
			<span class="palette-title">Color Palette</span>
		</div>
		<div class="palette-swatches">
			<div
				v-for="color in palette"
				:key="color"
				class="palette-swatch"
				:style="{ backgroundColor: color }"
				:title="`Click to copy ${color}`"
				@click="preview.copyHex(color)"
			>
				<span class="swatch-hex">{{ color }}</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { MediaPreview } from '../../composables/useMediaPreview'

defineProps<{
	palette: string[]
	preview: MediaPreview
}>()
</script>

<style scoped>
.palette-box {
	display: flex;
	flex-direction: column;
	border: 1px solid var(--border-color);
	border-radius: 8px;
	background: var(--bg-surface);
	padding: 12px;
	gap: 8px;
}

.palette-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.palette-title {
	font-weight: 600;
	font-size: 13px;
}

.palette-swatches {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
}

.palette-swatch {
	height: 32px;
	min-width: 44px;
	position: relative;
	display: flex;
	flex: 1;
	align-items: center;
	justify-content: center;
	border: 1px solid rgb(0, 0, 0, 0.15);
	border-radius: 6px;
	transition:
		transform 0.15s,
		box-shadow 0.15s;
	cursor: pointer;
}

.palette-swatch:hover {
	box-shadow: 0 4px 8px rgb(0, 0, 0, 0.15);
	transform: translateY(-2px);
}

.swatch-hex {
	font-family: monospace;
	font-size: 10px;
	text-shadow: 0 1px 2px rgb(0, 0, 0, 0.8);
	color: #fff;
	opacity: 0.9;
}
</style>
