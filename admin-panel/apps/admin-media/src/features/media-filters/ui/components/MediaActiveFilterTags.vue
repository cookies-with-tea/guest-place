<template>
	<div v-if="controls.activeFilterTags.length > 0" class="media-filters__tags">
		<span class="tags-label">Active filters:</span>
		<el-tag
			v-for="tag in controls.activeFilterTags"
			:key="tag.key"
			class="gp-tag"
			closable
			round
			@close="controls.handleRemoveFilter(tag.key)"
		>
			<span class="tag-key">{{ tag.label }}:</span>
			<span class="tag-value">{{ tag.value }}</span>
		</el-tag>
		<el-button link size="small" type="primary" @click="controls.handleResetAll"> Clear all </el-button>
	</div>
</template>

<script setup lang="ts">
import type { MediaFilterControls } from '../../composables/useMediaFilterControls'

defineProps<{
	controls: MediaFilterControls
}>()
</script>

<style scoped>
.media-filters__tags {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	border-top: 1px dashed var(--border-color);
	padding-top: 14px;
	gap: 10px;
}

.tags-label {
	font-weight: 500;
	font-size: 13px;
	color: var(--text-muted);
	margin-right: 4px;
}

.gp-tag {
	height: auto;
	border: 1px solid var(--border-color);
	border-radius: 20px;
	font-size: 13px;
	color: var(--text-primary);
	background: var(--bg-surface);
	transition: all 0.2s ease;
	padding: 6px 12px;
}

.gp-tag:hover {
	border-color: var(--accent-primary);
}

.tag-key {
	font-weight: 500;
	margin-right: 6px;
	opacity: 0.85;
}

.tag-value {
	font-weight: 600;
}
</style>
