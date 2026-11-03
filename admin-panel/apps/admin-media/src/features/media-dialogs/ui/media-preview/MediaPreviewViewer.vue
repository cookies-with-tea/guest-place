<template>
	<div class="media-display-wrapper">
		<div class="media-display" :class="preview.previewBg">
			<el-image
				v-if="media.mediaType === 'image'"
				class="preview-img"
				fit="contain"
				lazy
				:src="preview.activeVariantUrl || media.url"
			/>
			<video v-else-if="media.mediaType === 'video'" class="preview-img" controls playsinline :src="media.url" />
			<iframe v-else-if="preview.isPdf(media)" class="preview-pdf" :src="media.url" title="PDF Preview" />
			<div v-else class="file-placeholder">
				<el-icon :size="64"><Document /></el-icon>
				<span class="name">{{ media.name }}</span>
			</div>

			<div class="bg-toggle">
				<el-radio-group v-model="preview.previewBg" size="small">
					<el-radio-button label="Transparent" value="checkered" />
					<el-radio-button label="White" value="white" />
					<el-radio-button label="Black" value="black" />
				</el-radio-group>
			</div>
		</div>

		<div v-if="media.mediaType === 'image' && media.variants" class="variant-selector">
			<span class="variant-label">Preview Size:</span>
			<el-radio-group v-model="preview.selectedVariantKey" size="small">
				<el-radio-button value="original">Original</el-radio-button>
				<el-radio-button v-if="media.variants.large" value="large">Large</el-radio-button>
				<el-radio-button v-if="media.variants.medium" value="medium">Medium</el-radio-button>
				<el-radio-button v-if="media.variants.thumbnail" value="thumbnail">Thumb</el-radio-button>
			</el-radio-group>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Document } from '@element-plus/icons-vue'

import type { MediaPreview } from '../../composables/useMediaPreview'

defineProps<{
	media: any
	preview: MediaPreview
}>()
</script>

<style scoped>
.media-display-wrapper {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.media-display {
	width: 100%;
	height: 400px;
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	border: 1px solid var(--border-color);
	border-radius: 12px;
	background: var(--bg-surface);
	overflow: hidden;
}

.variant-selector {
	display: flex;
	align-items: center;
	gap: 8px;
}

.variant-label {
	font-size: 12px;
	color: var(--text-muted);
}

.media-display.checkered {
	background-image:
		linear-gradient(45deg, #333 25%, transparent 25%), linear-gradient(-45deg, #333 25%, transparent 25%),
		linear-gradient(45deg, transparent 75%, #333 75%), linear-gradient(-45deg, transparent 75%, #333 75%);
	background-position:
		0 0,
		0 10px,
		10px -10px,
		-10px 0;
	background-size: 20px 20px;
	background-color: #1a1a1a;
}

.media-display.white {
	background: #fff !important;
}

.media-display.black {
	background: #000 !important;
}

.bg-toggle {
	top: 12px;
	right: 12px;
	position: absolute;
	z-index: 10;
}

.preview-img {
	width: 100%;
	height: 100%;
}

.preview-pdf {
	width: 100%;
	height: 100%;
	min-height: 420px;
	border: none;
	background: #fff;
}

.file-placeholder {
	display: flex;
	flex-direction: column;
	align-items: center;
	color: var(--text-muted);
	gap: 16px;
}

.name {
	font-size: 14px;
	word-break: break-all;
	text-align: center;
	padding: 0 20px;
}
</style>
