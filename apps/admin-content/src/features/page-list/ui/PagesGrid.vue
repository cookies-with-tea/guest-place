<template>
	<div v-if="!pagesAndSchemas.loading && list.displayItems.length === 0" class="empty-state">
		<div class="empty-state__icon">📄</div>
		<h3>Страниц не найдено</h3>
		<p>В выбранной категории пока нет доступных страниц</p>
		<div class="empty-actions">
			<el-button type="primary" @click="actions.goToCreate">+ Создать блочную страницу</el-button>
			<el-button plain :loading="actions.isCreatingTemplate" @click="actions.handleCreateAboutTemplate"
				>✨ Сгенерировать демо «О платформе»</el-button
			>
		</div>
	</div>

	<div v-else class="pages-grid">
		<PageListCard
			v-for="item in list.displayItems"
			:key="item.key"
			:item="item"
			:list="list"
			:pages-and-schemas="pagesAndSchemas"
			:actions="actions"
			@card-click="actions.handleCardClick"
		/>
	</div>
</template>

<script setup lang="ts">
import type { PageListActions } from '../composables/usePageListActions'
import type { PagesAndSchemas } from '../composables/usePagesAndSchemas'
import type { UnifiedPageList } from '../composables/useUnifiedPageList'
import PageListCard from './PageListCard.vue'

defineProps<{
	list: UnifiedPageList
	pagesAndSchemas: PagesAndSchemas
	actions: PageListActions
}>()
</script>

<style scoped>
.pages-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
	gap: 20px;
}

.empty-state {
	max-width: 520px;
	border: 2px dashed var(--border-color);
	border-radius: 16px;
	text-align: center;
	background: var(--bg-card);
	padding: 80px 24px;
	margin: 40px auto;
	backdrop-filter: blur(8px);
}

.empty-state__icon {
	font-size: 48px;
	margin-bottom: 16px;
}

.empty-state h3 {
	font-weight: 600;
	font-size: 18px;
	color: var(--text-primary);
	margin: 0 0 8px;
}

.empty-state p {
	font-size: 14px;
	color: var(--text-muted);
	margin: 0 0 24px;
}

.empty-actions {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 12px;
}
</style>
