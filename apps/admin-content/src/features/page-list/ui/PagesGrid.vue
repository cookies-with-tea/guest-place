<template>
	<div v-if="!pagesAndSchemas.loading && list.displayItems.length === 0" class="empty-state">
		<el-icon class="empty-state__icon"><DocumentDelete /></el-icon>
		<h3>Страниц не найдено</h3>
		<p>В выбранной категории пока нет доступных страниц</p>
		<div class="empty-actions">
			<el-button :icon="Plus" type="primary" @click="actions.goToCreate">Создать блочную страницу</el-button>
			<el-button
				:icon="MagicStick"
				plain
				:loading="actions.isCreatingTemplate"
				@click="actions.handleCreateAboutTemplate"
			>
				Сгенерировать демо «О платформе»
			</el-button>
		</div>
	</div>

	<div v-else-if="list.typeFilter === 'all'" class="pages-sections">
		<section v-if="list.schemaPages.length > 0" class="pages-section">
			<h3 class="pages-section__title"
				><el-icon><Tickets /></el-icon> Схемные страницы</h3
			>
			<div class="pages-grid">
				<PageListCard
					v-for="item in list.schemaPages"
					:key="item.key"
					:item="item"
					:list="list"
					:pages-and-schemas="pagesAndSchemas"
					:actions="actions"
					@card-click="actions.handleCardClick"
				/>
			</div>
		</section>

		<section v-if="list.filteredBlockItems.length > 0" class="pages-section">
			<h3 class="pages-section__title"
				><el-icon><Box /></el-icon> Блочные страницы</h3
			>
			<div class="pages-grid">
				<PageListCard
					v-for="item in list.filteredBlockItems"
					:key="item.key"
					:item="item"
					:list="list"
					:pages-and-schemas="pagesAndSchemas"
					:actions="actions"
					@card-click="actions.handleCardClick"
				/>
			</div>
		</section>
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
import { Box, DocumentDelete, MagicStick, Plus, Tickets } from '@element-plus/icons-vue'
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
.pages-sections {
	display: flex;
	flex-direction: column;
	gap: 32px;
}

.pages-section__title {
	display: flex;
	align-items: center;
	font-weight: 600;
	font-size: 14px;
	color: var(--text-primary);
	margin: 0 0 16px;
	gap: 6px;

	.el-icon {
		width: 1em;
		height: 1em;
		flex-shrink: 0;
	}
}

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
	width: 48px;
	height: 48px;
	color: var(--text-muted);
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
