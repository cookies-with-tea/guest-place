<template>
	<aside class="menus-sidebar">
		<div class="sidebar-header">
			<span class="sidebar-title">Области навигации</span>
		</div>
		<div v-if="menusList.loading" class="sidebar-loading">
			<el-skeleton animated :rows="3" />
		</div>
		<div v-else class="locations-list">
			<div
				v-for="menu in menusList.menus"
				:key="menu.id"
				class="location-card"
				:class="{ active: currentMenu.currentMenu?.id === menu.id }"
				@click="currentMenu.selectMenu(menu)"
			>
				<div class="loc-card-header">
					<span class="loc-icon">{{ menusList.getLocationIcon(menu.location) }}</span>
					<div class="loc-card-info">
						<strong>{{ menu.name }}</strong>
						<code>{{ menu.location }}</code>
					</div>
				</div>
				<div class="loc-card-meta">
					<span>{{ menusList.countTotalItems(menu.items) }} пунктов</span>
					<el-tag v-if="menusList.isSystemLocation(menu.location)" size="small" type="info">Системное</el-tag>
				</div>
			</div>
		</div>
	</aside>
</template>

<script setup lang="ts">
import type { CurrentMenu } from '../composables/useCurrentMenu'
import type { MenusList } from '../composables/useMenusList'

defineProps<{
	menusList: MenusList
	currentMenu: CurrentMenu
}>()
</script>

<style scoped>
.menus-sidebar {
	height: fit-content;
	border: 1px solid var(--border-color);
	border-radius: 12px;
	background: var(--bg-card);
	padding: 16px;
}

.sidebar-header {
	margin-bottom: 12px;
}

.sidebar-title {
	font-weight: 700;
	font-size: 13px;
	letter-spacing: 0.5px;
	text-transform: uppercase;
	color: var(--text-muted);
}

.locations-list {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.location-card {
	border: 1px solid var(--border-color);
	border-radius: 8px;
	background: var(--bg-surface);
	transition: all 0.2s;
	cursor: pointer;
	padding: 12px;
}

.location-card:hover {
	border-color: var(--accent-primary, #6366f1);
	background: rgb(99, 102, 241, 0.1);
}

.location-card.active {
	border-color: var(--accent-primary, #6366f1);
	box-shadow: 0 1px 3px rgb(99, 102, 241, 0.2);
	background: rgb(99, 102, 241, 0.15);
}

.loc-card-header {
	display: flex;
	align-items: center;
	gap: 10px;
}

.loc-icon {
	font-size: 20px;
}

.loc-card-info {
	display: flex;
	flex-direction: column;
}

.loc-card-info strong {
	font-size: 14px;
	color: var(--text-primary);
}

.loc-card-info code {
	font-size: 11px;
	color: var(--accent-primary, #6366f1);
}

.loc-card-meta {
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-size: 11px;
	color: var(--text-muted);
	margin-top: 8px;
}
</style>
