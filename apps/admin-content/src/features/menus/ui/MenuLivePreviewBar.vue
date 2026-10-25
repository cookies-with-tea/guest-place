<template>
	<div class="menu-live-preview">
		<div class="preview-label">
			<span>Предпросмотр навигации ({{ currentMenu.currentMenu!.location }}):</span>
		</div>
		<div class="preview-bar-container" :class="`is-${currentMenu.currentMenu!.location}`">
			<div v-if="currentMenu.currentMenu!.location === 'header'" class="preview-header-mock">
				<div class="mock-logo">Guest &amp; Place</div>
				<div class="mock-nav">
					<div
						v-for="item in currentMenu.currentMenu!.items"
						:key="item.id"
						class="mock-nav-item"
						:class="{ 'has-dropdown': item.children && item.children.length > 0 }"
					>
						<span>{{ item.title }}</span>
						<span v-if="item.children && item.children.length > 0" class="caret">▾</span>
					</div>
				</div>
			</div>
			<div v-else class="preview-simple-mock">
				<div v-for="item in currentMenu.currentMenu!.items" :key="item.id" class="mock-simple-item">
					<span>{{ item.title }}</span>
					<span v-if="item.children?.length" class="mock-sub-count">({{ item.children.length }})</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { CurrentMenu } from '../composables/useCurrentMenu'

defineProps<{
	currentMenu: CurrentMenu
}>()
</script>

<style scoped>
.menu-live-preview {
	border: 1px solid var(--border-color);
	border-radius: 10px;
	background: var(--bg-surface);
	padding: 16px;
	margin-bottom: 24px;
}

.preview-label {
	font-weight: 600;
	font-size: 12px;
	color: var(--text-muted);
	margin-bottom: 10px;
}

.preview-header-mock {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	border: 1px solid var(--border-color);
	border-radius: 8px;
	background: var(--bg-card);
	padding: 12px 20px;
	gap: 12px;
}

.mock-logo {
	font-weight: 800;
	font-size: 16px;
	color: var(--text-primary);
}

.mock-nav {
	display: flex;
	flex-wrap: wrap;
	gap: 20px;
}

.mock-nav-item {
	display: flex;
	align-items: center;
	font-weight: 500;
	font-size: 14px;
	color: var(--text-muted);
	gap: 4px;
}

.mock-simple-item {
	display: inline-flex;
	align-items: center;
	border: 1px solid var(--border-color);
	border-radius: 6px;
	font-size: 13px;
	color: var(--text-primary);
	background: var(--bg-card);
	padding: 6px 12px;
	margin-right: 8px;
	margin-bottom: 8px;
	gap: 6px;
}

.mock-sub-count {
	font-size: 11px;
	color: #6366f1;
}
</style>
