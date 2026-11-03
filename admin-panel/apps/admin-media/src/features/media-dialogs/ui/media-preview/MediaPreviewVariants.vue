<template>
	<div class="variants-box">
		<div class="variants-header">
			<span class="variants-title">WebP Variants</span>
			<el-button size="small" :loading="preview.isOptimizing" @click="preview.onOptimize"> Regenerate </el-button>
		</div>
		<div v-if="variants" class="variants-list">
			<div v-if="variants.thumbnail" class="variant-row">
				<span class="variant-tag">Thumb</span>
				<span class="variant-meta">{{ variants.thumbnail.width }}×{{ variants.thumbnail.height }}</span>
				<span class="variant-meta">{{ preview.formatFileSize(variants.thumbnail.sizeBytes) }}</span>
				<el-button link size="small" type="primary" @click="preview.copyUrl(variants.thumbnail.url)">Copy</el-button>
			</div>
			<div v-if="variants.medium" class="variant-row">
				<span class="variant-tag">Medium</span>
				<span class="variant-meta">{{ variants.medium.width }}×{{ variants.medium.height }}</span>
				<span class="variant-meta">{{ preview.formatFileSize(variants.medium.sizeBytes) }}</span>
				<el-button link size="small" type="primary" @click="preview.copyUrl(variants.medium.url)">Copy</el-button>
			</div>
			<div v-if="variants.large" class="variant-row">
				<span class="variant-tag">Large</span>
				<span class="variant-meta">{{ variants.large.width }}×{{ variants.large.height }}</span>
				<span class="variant-meta">{{ preview.formatFileSize(variants.large.sizeBytes) }}</span>
				<el-button link size="small" type="primary" @click="preview.copyUrl(variants.large.url)">Copy</el-button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { MediaPreview } from '../../composables/useMediaPreview'

defineProps<{
	variants: any
	preview: MediaPreview
}>()
</script>

<style scoped>
.variants-box {
	display: flex;
	flex-direction: column;
	border: 1px solid var(--border-color);
	border-radius: 8px;
	background: var(--bg-surface);
	padding: 12px;
	gap: 8px;
}

.variants-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.variants-title {
	font-weight: 600;
	font-size: 13px;
}

.variants-list {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.variant-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-size: 12px;
}

.variant-tag {
	width: 50px;
	font-weight: 500;
	color: var(--text-primary);
}

.variant-meta {
	color: var(--text-muted);
}
</style>
