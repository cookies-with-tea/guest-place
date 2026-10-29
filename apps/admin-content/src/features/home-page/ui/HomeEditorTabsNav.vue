<template>
	<div class="editor-tabs-nav">
		<button type="button" class="tab-nav-btn" :class="{ active: tabs.active === 'hero' }" @click="tabs.active = 'hero'">
			<el-icon class="tab-icon"><StarFilled /></el-icon>
			<span class="tab-label">Первый экран (Hero)</span>
		</button>
		<button
			type="button"
			class="tab-nav-btn"
			:class="{ active: tabs.active === 'categories' }"
			@click="tabs.active = 'categories'"
		>
			<el-icon class="tab-icon"><Folder /></el-icon>
			<span class="tab-label">Категории</span>
			<span class="tab-badge">{{ homeForm.form.categories.length }}</span>
		</button>
		<button
			type="button"
			class="tab-nav-btn"
			:class="{ active: tabs.active === 'latest' }"
			@click="tabs.active = 'latest'"
		>
			<el-icon class="tab-icon"><Clock /></el-icon>
			<span class="tab-label">Последние</span>
		</button>
		<button
			type="button"
			class="tab-nav-btn"
			:class="{ active: tabs.active === 'popular' }"
			@click="tabs.active = 'popular'"
		>
			<el-icon class="tab-icon"><TrendCharts /></el-icon>
			<span class="tab-label">Популярные</span>
		</button>
		<button
			type="button"
			class="tab-nav-btn"
			:class="{ active: tabs.active === 'interactions' }"
			@click="tabs.active = 'interactions'"
		>
			<el-icon class="tab-icon"><Aim /></el-icon>
			<span class="tab-label">Сценарии</span>
			<span class="tab-badge">{{ homeForm.form.interactions.length }}</span>
		</button>
		<button
			type="button"
			class="tab-nav-btn"
			:class="{ active: tabs.active === 'banner' }"
			@click="tabs.active = 'banner'"
		>
			<el-icon class="tab-icon"><Promotion /></el-icon>
			<span class="tab-label">Нижний баннер</span>
		</button>
	</div>
</template>

<script setup lang="ts">
import { Aim, Clock, Folder, Promotion, StarFilled, TrendCharts } from '@element-plus/icons-vue'
import type { HomeEditorTabs } from '../composables/useHomeEditorTabs'
import type { HomePageForm } from '../composables/useHomePageForm'

defineProps<{
	tabs: HomeEditorTabs
	homeForm: HomePageForm
}>()
</script>

<style scoped lang="scss">
.editor-tabs-nav {
	display: flex;
	flex-wrap: wrap;
	border-bottom: 1px solid var(--gp-glass-border, rgb(255, 255, 255, 0.08));
	padding-bottom: 16px;
	margin-bottom: 20px;
	gap: 8px;
}

.tab-nav-btn {
	display: inline-flex;
	align-items: center;
	border: 1px solid var(--gp-glass-border, rgb(255, 255, 255, 0.08));
	border-radius: 10px;
	font-weight: 500;
	font-size: 13px;
	color: var(--gp-text-secondary, #94a3b8);
	background: var(--gp-bg-surface, rgb(30, 41, 59, 0.5));
	transition: all 0.2s;
	cursor: pointer;
	padding: 8px 14px;
	gap: 8px;

	&:hover {
		color: var(--gp-text-main, #fff);
		background: rgb(255, 255, 255, 0.05);
	}

	&.active {
		border-color: var(--gp-primary, #7c3aed);
		box-shadow: 0 0 16px rgb(var(--gp-primary-rgb), 0.18);
		font-weight: 600;
		color: #fff;
		background: rgb(var(--gp-primary-rgb), 0.15);
	}
}

.tab-icon {
	width: 1em;
	height: 1em;
	flex-shrink: 0;
}

.tab-badge {
	border-radius: 10px;
	font-weight: 700;
	font-size: 11px;
	color: var(--gp-primary, #7c3aed);
	background: rgb(0, 0, 0, 0.35);
	padding: 1px 6px;
}
</style>
