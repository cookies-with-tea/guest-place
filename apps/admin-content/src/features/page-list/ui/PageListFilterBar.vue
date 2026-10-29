<template>
	<div class="page-filter-container">
		<div class="filter-group">
			<span class="filter-label">Тип страниц:</span>
			<el-radio-group v-model="list.typeFilter" size="default">
				<el-radio-button label="all">Все ({{ list.totalItemsCount }})</el-radio-button>
				<el-radio-button label="blocks">
					<el-icon><Box /></el-icon> Блочные ({{ pagesAndSchemas.pages.length }})
				</el-radio-button>
				<el-radio-button label="schemas">
					<el-icon><Tickets /></el-icon> Схемные ({{ list.schemaPages.length }})
				</el-radio-button>
			</el-radio-group>
		</div>

		<div v-if="list.typeFilter !== 'schemas' && pagesAndSchemas.pages.length > 0" class="filter-group">
			<span class="filter-label">Статус:</span>
			<el-radio-group v-model="list.statusFilter" size="default">
				<el-radio-button label="all">Все</el-radio-button>
				<el-radio-button label="published"
					>Опубликовано ({{ pagesAndSchemas.countByStatus('published') }})</el-radio-button
				>
				<el-radio-button label="review">На проверке ({{ pagesAndSchemas.countByStatus('review') }})</el-radio-button>
				<el-radio-button label="draft">Черновики ({{ pagesAndSchemas.countByStatus('draft') }})</el-radio-button>
			</el-radio-group>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Box, Tickets } from '@element-plus/icons-vue'
import type { PagesAndSchemas } from '../composables/usePagesAndSchemas'
import type { UnifiedPageList } from '../composables/useUnifiedPageList'

defineProps<{
	list: UnifiedPageList
	pagesAndSchemas: PagesAndSchemas
}>()
</script>

<style scoped>
.page-filter-container {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	border: 1px solid var(--gp-glass-border, var(--border-color, rgb(255, 255, 255, 0.1)));
	border-radius: 10px;
	background: var(--gp-bg-surface, var(--bg-card, rgb(30, 41, 59, 0.5)));
	padding: 12px 16px;
	margin-bottom: 24px;
	gap: 16px;
}

.filter-group {
	display: flex;
	align-items: center;
	gap: 10px;
}

.filter-label {
	font-weight: 500;
	font-size: 13px;
	color: var(--text-muted);
}

:deep(.el-radio-button__inner) {
	.el-icon {
		width: 1em;
		height: 1em;
		flex-shrink: 0;
		vertical-align: -0.15em;
	}
}
</style>
