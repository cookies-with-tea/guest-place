<template>
	<div class="media-filters__controls">
		<!-- Category Filter -->
		<div class="filter-control-item">
			<label class="control-label">Category</label>
			<el-select
				v-model="controls.filters.category"
				clearable
				collapse-tags
				collapse-tags-tooltip
				filterable
				multiple
				placeholder="All Categories"
				style="width: 170px"
			>
				<el-option v-for="cat in controls.availableCategories" :key="cat" :label="cat" :value="cat" />
			</el-select>
		</div>

		<!-- Tags Filter -->
		<div class="filter-control-item">
			<label class="control-label">Tags</label>
			<el-select
				v-model="controls.filters.tags"
				allow-create
				clearable
				collapse-tags
				collapse-tags-tooltip
				default-first-option
				filterable
				multiple
				placeholder="Filter by tags"
				style="width: 200px"
			>
				<el-option v-for="tag in controls.availableTags" :key="tag" :label="`#${tag}`" :value="tag" />
			</el-select>
		</div>

		<!-- Size Filter Presets -->
		<div class="filter-control-item">
			<label class="control-label">Size</label>
			<el-select
				v-model="controls.selectedSizePreset"
				clearable
				placeholder="Any size"
				style="width: 150px"
				@change="controls.handleSizePresetChange"
			>
				<el-option label="Any size" value="all" />
				<el-option label="Small (< 1 MB)" value="small" />
				<el-option label="Medium (1–5 MB)" value="medium" />
				<el-option label="Large (5–20 MB)" value="large" />
				<el-option label="Huge (> 20 MB)" value="huge" />
			</el-select>
		</div>

		<!-- Date Range Filter -->
		<div class="filter-control-item date-filter">
			<label class="control-label">Date</label>
			<el-date-picker
				v-model="controls.dateRange"
				end-placeholder="To"
				format="YYYY-MM-DD"
				range-separator="—"
				start-placeholder="From"
				style="width: 240px"
				type="daterange"
				value-format="YYYY-MM-DD"
				@change="controls.handleDateRangeChange"
			/>
		</div>

		<!-- Reset Filters -->
		<div v-if="controls.hasActiveFilters" class="filter-control-item reset-button-item">
			<el-button :icon="RefreshRightIcon" plain type="info" @click="controls.handleResetAll"> Reset Filters </el-button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { RefreshRight as RefreshRightIcon } from '@element-plus/icons-vue'

import type { MediaFilterControls } from '../../composables/useMediaFilterControls'

defineProps<{
	controls: MediaFilterControls
}>()
</script>

<style scoped>
.media-filters__controls {
	display: flex;
	flex-wrap: wrap;
	align-items: flex-end;
	border-top: 1px solid var(--border-color);
	padding-top: 10px;
	gap: 16px;
}

.filter-control-item {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.control-label {
	font-weight: 600;
	font-size: 12px;
	letter-spacing: 0.5px;
	text-transform: uppercase;
	color: var(--text-muted);
}

.reset-button-item {
	margin-left: auto;
}
</style>
