<template>
	<div class="items-list-container">
		<div class="items-list-header">
			<h3>Структура пунктов меню</h3>
			<span class="items-hint">Перемещайте пункты стрелками для изменения порядка и вложенности</span>
		</div>

		<div v-if="!currentMenu.currentMenu!.items || currentMenu.currentMenu!.items.length === 0" class="no-items-state">
			<span>Пункты меню ещё не добавлены. Нажмите «+ Добавить пункт меню».</span>
		</div>

		<div v-else class="items-tree">
			<template v-for="(item, idx) in currentMenu.currentMenu!.items" :key="item.id">
				<div class="tree-item root-item">
					<div class="item-main-row">
						<div class="item-reorder-btns">
							<el-button
								size="small"
								circle
								:disabled="idx === 0"
								@click="currentMenu.moveItemUp(currentMenu.currentMenu!.items, idx)"
								>▲</el-button
							>
							<el-button
								size="small"
								circle
								:disabled="idx === currentMenu.currentMenu!.items.length - 1"
								@click="currentMenu.moveItemDown(currentMenu.currentMenu!.items, idx)"
							>
								▼
							</el-button>
						</div>

						<div class="item-badge-type" :class="`type-${item.type}`">
							{{ currentMenu.getTypeLabel(item.type) }}
						</div>

						<div class="item-title-col">
							<strong>{{ item.title }}</strong>
							<span class="item-target-url">{{ currentMenu.formatItemUrl(item) }}</span>
						</div>

						<div class="item-target-flag">
							<el-tag size="small" :type="item.target === '_blank' ? 'warning' : 'info'" effect="plain">
								{{ item.target === '_blank' ? 'В новой вкладке ↗' : 'В этой вкладке' }}
							</el-tag>
						</div>

						<div class="item-actions">
							<el-button size="small" plain type="primary" @click="emit('add-sub-item', item)"> + Подпункт </el-button>
							<el-button size="small" plain @click="emit('edit-item', item, currentMenu.currentMenu!.items)">
								Изменить
							</el-button>
							<el-button
								size="small"
								plain
								type="danger"
								@click="currentMenu.removeItem(currentMenu.currentMenu!.items, idx)"
								>✕</el-button
							>
						</div>
					</div>

					<div v-if="item.children && item.children.length > 0" class="sub-items-container">
						<div v-for="(sub, subIdx) in item.children" :key="sub.id" class="tree-item sub-item">
							<div class="item-main-row">
								<div class="sub-tree-indent">↳</div>

								<div class="item-reorder-btns">
									<el-button
										size="small"
										circle
										:disabled="subIdx === 0"
										@click="currentMenu.moveItemUp(item.children!, subIdx)"
										>▲</el-button
									>
									<el-button
										size="small"
										circle
										:disabled="subIdx === item.children!.length - 1"
										@click="currentMenu.moveItemDown(item.children!, subIdx)"
									>
										▼
									</el-button>
								</div>

								<div class="item-badge-type" :class="`type-${sub.type}`">
									{{ currentMenu.getTypeLabel(sub.type) }}
								</div>

								<div class="item-title-col">
									<span>{{ sub.title }}</span>
									<span class="item-target-url">{{ currentMenu.formatItemUrl(sub) }}</span>
								</div>

								<div class="item-target-flag">
									<el-tag size="small" :type="sub.target === '_blank' ? 'warning' : 'info'" effect="plain">
										{{ sub.target === '_blank' ? '↗' : '—' }}
									</el-tag>
								</div>

								<div class="item-actions">
									<el-button size="small" plain @click="emit('edit-item', sub, item.children!)"> Изменить </el-button>
									<el-button size="small" plain type="danger" @click="currentMenu.removeItem(item.children!, subIdx)"
										>✕</el-button
									>
								</div>
							</div>
						</div>
					</div>
				</div>
			</template>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { MenuItem } from '#entities/menus'
import type { CurrentMenu } from '../composables/useCurrentMenu'

defineProps<{
	currentMenu: CurrentMenu
}>()

const emit = defineEmits<{
	'add-sub-item': [parent: MenuItem]
	'edit-item': [item: MenuItem, container: MenuItem[]]
}>()
</script>

<style scoped>
.items-list-header {
	display: flex;
	flex-wrap: wrap;
	align-items: baseline;
	justify-content: space-between;
	margin-bottom: 16px;
	gap: 8px;
}

.items-list-header h3 {
	font-weight: 600;
	font-size: 16px;
	color: var(--text-primary);
	margin: 0;
}

.items-hint {
	font-size: 12px;
	color: var(--text-muted);
}

.no-items-state {
	border: 1px dashed var(--border-color);
	border-radius: 8px;
	text-align: center;
	color: var(--text-muted);
	padding: 40px;
}

.items-tree {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.tree-item {
	border: 1px solid var(--border-color);
	border-radius: 8px;
	background: var(--bg-card);
	overflow: hidden;
}

.item-main-row {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	padding: 12px 16px;
	gap: 12px;
}

.item-reorder-btns {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.item-badge-type {
	border-radius: 6px;
	font-weight: 600;
	font-size: 11px;
	white-space: nowrap;
	padding: 2px 8px;
}

.type-page {
	color: #10b981;
	background: rgb(16, 185, 129, 0.15);
}

.type-url {
	color: #818cf8;
	background: rgb(99, 102, 241, 0.15);
}

.type-anchor {
	color: #fbbf24;
	background: rgb(245, 158, 11, 0.15);
}

.item-title-col {
	min-width: 0;
	display: flex;
	flex: 1;
	flex-direction: column;
	gap: 2px;
}

.item-title-col strong {
	font-size: 14px;
	color: var(--text-primary);
}

.item-target-url {
	font-family: monospace;
	font-size: 12px;
	color: var(--text-muted);
}

.item-actions {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
}

.sub-items-container {
	display: flex;
	flex-direction: column;
	border-top: 1px solid var(--border-color);
	background: var(--bg-surface);
	padding: 8px 12px 8px 36px;
	gap: 6px;
}

.sub-item {
	border: 1px solid var(--border-color);
	background: var(--bg-card);
}

.sub-tree-indent {
	font-size: 14px;
	color: var(--text-muted);
}
</style>
