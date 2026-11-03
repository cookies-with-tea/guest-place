<template>
	<div class="media-filters__header">
		<div class="media-filters__title">
			<h2>Media Library</h2>
			<p>Manage and organize your digital assets with advanced search and filtering</p>
		</div>
		<div class="header-actions">
			<el-input
				v-model="controls.filters.search"
				class="search-input"
				clearable
				placeholder="Smart search (name, alt, tags, ext...)"
				:prefix-icon="SearchIcon"
			/>
			<el-button :icon="PlusIcon" type="primary" @click="onUpload">Upload Media</el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Plus as PlusIcon, Search as SearchIcon } from '@element-plus/icons-vue'

import type { MediaFilterControls } from '../../composables/useMediaFilterControls'

defineProps<{
	controls: MediaFilterControls
	onUpload: () => void
}>()
</script>

<style scoped>
.media-filters__header {
	display: flex;
	flex-wrap: wrap;
	align-items: flex-start;
	justify-content: space-between;
	gap: 24px;
}

.header-actions {
	display: flex;
	align-items: center;
	gap: 16px;
}

.search-input {
	width: 320px;
}

.media-filters__title h2 {
	font-weight: 700;
	font-size: 24px;
	color: var(--text-primary);
	margin: 0;
}

.media-filters__title p {
	font-size: 14px;
	color: var(--text-muted);
	margin: 6px 0 0;
}
</style>
