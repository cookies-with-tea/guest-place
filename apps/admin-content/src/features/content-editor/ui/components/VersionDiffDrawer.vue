<template>
	<el-drawer
		v-model="history.isDiffOpen"
		:title="`Diff: v${history.diffVersion?.version_number} → Current`"
		size="72%"
		direction="rtl"
		:destroy-on-close="false"
	>
		<template #header>
			<div class="diff-drawer-header">
				<span class="diff-drawer-title">Version Diff</span>
				<el-tag size="small" type="info">v{{ history.diffVersion?.version_number }}</el-tag>
				<svg
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					style="color: #64748b"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M5 12H19M12 5L19 12L12 19"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
				<el-tag size="small" type="success">Current</el-tag>
			</div>
		</template>
		<div class="diff-drawer-body">
			<VersionDiffViewer :version="history.diffVersion" :current-data="modelValue" :schema="schema" />
			<div class="diff-drawer-footer">
				<el-button @click="history.isDiffOpen = false">Close</el-button>
				<el-button type="warning" @click="history.handleRollbackDiff">
					<svg
						width="13"
						height="13"
						viewBox="0 0 24 24"
						fill="none"
						style="margin-right: 4px"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M3 7v4h4"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<path d="M3 11A9 9 0 1 0 6.68 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
					</svg>
					Restore v{{ history.diffVersion?.version_number }}
				</el-button>
			</div>
		</div>
	</el-drawer>
</template>

<script setup lang="ts">
import type { ContentSchema } from '@admin-panel/lib'

import type { EntryHistory } from '../../composables/useEntryHistory'
import VersionDiffViewer from './VersionDiffViewer.vue'

defineProps<{
	history: EntryHistory
	modelValue: Record<string, any>
	schema: ContentSchema | null
}>()
</script>

<style scoped>
.diff-drawer-header {
	display: flex;
	align-items: center;
	gap: 10px;
}

.diff-drawer-title {
	font-weight: 700;
	font-size: 15px;
	color: var(--gp-text-main);
}

.diff-drawer-body {
	height: 100%;
	display: flex;
	flex-direction: column;
}

.diff-drawer-footer {
	display: flex;
	flex-shrink: 0;
	justify-content: flex-end;
	border-top: 1px solid var(--gp-glass-border, rgb(255, 255, 255, 0.07));
	padding-top: 20px;
	margin-top: 24px;
	gap: 12px;
}
</style>
