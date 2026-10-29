<template>
	<div class="page-card" :class="{ 'is-schema-card': item.isSchema }" @click="emit('card-click', item)">
		<div class="page-card__header">
			<div class="page-card__icon-wrap">
				<el-icon class="page-card__icon"><component :is="resolveIcon(item.icon)" /></el-icon>
				<span class="page-card__type-pill" :class="item.isSchema ? 'pill-schema' : 'pill-block'">
					{{ item.isSchema ? 'СХЕМА ПОЛЕЙ' : 'БЛОЧНЫЙ КОНСТРУКТОР' }}
				</span>
			</div>

			<div class="page-card__badges">
				<el-tag
					v-if="!item.isSchema"
					size="small"
					:type="item.status === 'published' ? 'success' : item.status === 'review' ? 'warning' : 'info'"
				>
					{{ pagesAndSchemas.getStatusLabel(item.status).toUpperCase() }}
				</el-tag>

				<el-tag v-else size="small" type="warning" effect="light">
					{{ item.hasSchema ? 'Схема готова' : 'Требует инициализации' }}
				</el-tag>
			</div>
		</div>

		<div class="page-card__body">
			<h3 class="page-card__title">{{ item.title }}</h3>
			<p v-if="item.description" class="page-card__desc">{{ item.description }}</p>

			<div class="page-card__slug-wrapper">
				<span class="slug-prefix">Путь:</span>
				<code class="page-card__slug">{{ item.path }}</code>
			</div>

			<div v-if="item.parentTitle" class="page-card__parent-badge">
				<span>↳ Родитель:</span>
				<strong>{{ item.parentTitle }}</strong>
				<span class="parent-slug">(/p/{{ item.parentSlug }})</span>
			</div>

			<div v-if="item.published_at" class="page-card__published-date">
				<el-icon><Promotion /></el-icon> {{ list.formatDate(item.published_at) }}
			</div>
		</div>

		<div class="page-card__footer">
			<span class="page-card__count">
				<template v-if="!item.isSchema">
					<el-icon><Box /></el-icon> <strong>{{ item.blocks?.length || 0 }}</strong> блоков
				</template>
				<template v-else>
					<el-icon><Tickets /></el-icon> <strong>{{ item.fieldsCount || 0 }}</strong> полей схемы
				</template>
			</span>

			<div class="page-card__actions" @click.stop>
				<template v-if="!item.isSchema">
					<el-dropdown trigger="click" @command="(cmd: string) => pagesAndSchemas.quickSetStatus(item, cmd)">
						<el-button size="small" plain title="Сменить статус"> {{ list.getStatusShort(item.status) }} ▾ </el-button>
						<template #dropdown>
							<el-dropdown-menu>
								<el-dropdown-item command="draft" :icon="EditPen" :disabled="item.status === 'draft'">
									Черновик
								</el-dropdown-item>
								<el-dropdown-item command="review" :icon="Search" :disabled="item.status === 'review'">
									На проверку
								</el-dropdown-item>
								<el-dropdown-item command="published" :icon="Promotion" :disabled="item.status === 'published'">
									Опубликовать
								</el-dropdown-item>
							</el-dropdown-menu>
						</template>
					</el-dropdown>

					<el-button :icon="View" size="small" plain @click="actions.openClientPreview(item.slug)">Просмотр</el-button>
					<el-button size="small" type="primary" plain @click="actions.goToEdit(item.id)"> Конструктор </el-button>
					<el-button :icon="Close" size="small" type="danger" plain @click="pagesAndSchemas.handleDelete(item)" />
				</template>

				<template v-else>
					<el-button :icon="View" size="small" plain @click="actions.openWebsitePath(item.path)">На сайт</el-button>
					<el-button size="small" type="primary" plain @click="actions.handleEditSchemaPage(item)">
						{{ item.hasSchema ? 'Редактор контента' : 'Инициализировать' }}
					</el-button>
				</template>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { Box, Close, EditPen, Promotion, Search, Tickets, View } from '@element-plus/icons-vue'
import { resolveIcon } from '../lib/icons'
import type { PageListActions } from '../composables/usePageListActions'
import type { PagesAndSchemas } from '../composables/usePagesAndSchemas'
import type { UnifiedPageList } from '../composables/useUnifiedPageList'

defineProps<{
	item: any
	list: UnifiedPageList
	pagesAndSchemas: PagesAndSchemas
	actions: PageListActions
}>()

const emit = defineEmits<{
	'card-click': [item: any]
}>()
</script>

<style scoped>
.page-card {
	position: relative;
	display: flex;
	flex-direction: column;
	border: 1px solid var(--border-color);
	border-radius: 14px;
	background: var(--bg-card);
	transition: all 0.2s ease;
	cursor: pointer;
	padding: 20px;
	overflow: hidden;
	backdrop-filter: blur(8px);
}

.page-card:hover {
	border-color: #6366f1;
	box-shadow: 0 10px 24px rgb(0, 0, 0, 0.08);
	transform: translateY(-2px);
}

.page-card.is-schema-card {
	border-left: 4px solid #f59e0b;
}

.page-card:not(.is-schema-card) {
	border-left: 4px solid #6366f1;
}

.page-card__header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 12px;
}

.page-card__icon-wrap {
	display: flex;
	align-items: center;
	gap: 8px;
}

.page-card__icon {
	width: 1em;
	height: 1em;
	flex-shrink: 0;
	font-size: 22px;
	color: #6366f1;
}

.page-card__type-pill {
	border-radius: 4px;
	font-weight: 800;
	font-size: 9px;
	letter-spacing: 0.5px;
	padding: 2px 6px;
}

.pill-schema {
	color: #d97706;
	background: rgb(245, 158, 11, 0.12);
}

.pill-block {
	color: #6366f1;
	background: rgb(99, 102, 241, 0.12);
}

.page-card__title {
	font-weight: 600;
	font-size: 16px;
	color: var(--text-primary);
	margin: 0 0 6px;
}

.page-card__desc {
	display: -webkit-box;
	font-size: 12px;
	line-height: 1.4;
	color: var(--text-muted);
	margin: 0 0 12px;
	overflow: hidden;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
}

.page-card__slug-wrapper {
	display: flex;
	align-items: center;
	font-size: 12px;
	color: var(--text-muted);
	margin-bottom: 14px;
	gap: 6px;
}

.page-card__slug {
	border: 1px solid var(--border-color);
	border-radius: 4px;
	font-family: monospace;
	font-size: 12px;
	color: var(--accent-primary, #38bdf8);
	background: var(--bg-surface);
	padding: 2px 8px;
}

.page-card__parent-badge {
	display: flex;
	align-items: center;
	border: 1px dashed rgb(99, 102, 241, 0.3);
	border-radius: 6px;
	font-size: 11px;
	color: #6366f1;
	background: rgb(99, 102, 241, 0.08);
	padding: 4px 8px;
	margin-bottom: 12px;
	gap: 5px;
}

.page-card__parent-badge .parent-slug {
	font-family: monospace;
	font-size: 10px;
	color: var(--text-muted);
}

.page-card__published-date {
	display: inline-flex;
	align-items: center;
	font-size: 11px;
	color: var(--text-muted);
	margin-bottom: 12px;
	gap: 4px;

	.el-icon {
		width: 1em;
		height: 1em;
		flex-shrink: 0;
	}
}

.page-card__footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-top: 1px solid var(--border-color);
	padding-top: 14px;
	margin-top: auto;
}

.page-card__count {
	display: inline-flex;
	align-items: center;
	font-size: 12px;
	color: var(--text-muted);
	gap: 4px;

	.el-icon {
		width: 1em;
		height: 1em;
		flex-shrink: 0;
	}
}

.page-card__actions {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
}
</style>
