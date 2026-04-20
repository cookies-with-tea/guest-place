<template>
	<aside class="the-sidebar glass-sidebar" :class="{ 'is-collapsed': isCollapsed }">
		<div class="sidebar-header">
			<div v-show="!isCollapsed" class="sidebar-logo">
				<h2>GUEST PLACE</h2>
			</div>
			<div class="collapse-trigger" @click="toggleCollapse">
				<el-icon><Expand v-if="isCollapsed" /><Fold v-else /></el-icon>
			</div>
		</div>

		<div class="context-switcher" :class="{ 'is-collapsed': isCollapsed }">
			<el-tooltip :content="t('general.system_admin')" :disabled="!isCollapsed" placement="right">
				<div class="context-item" :class="{ active: activeContext === 'system' }" @click="setContext('system')">
					<el-icon><Setting /></el-icon>
					<span v-show="!isCollapsed">Admin</span>
				</div>
			</el-tooltip>
			<el-tooltip :content="t('general.website_content')" :disabled="!isCollapsed" placement="right">
				<div class="context-item" :class="{ active: activeContext === 'website' }" @click="setContext('website')">
					<el-icon><EditPen /></el-icon>
					<span v-show="!isCollapsed">Website</span>
				</div>
			</el-tooltip>
		</div>

		<el-menu
			active-text-color="var(--gp-primary)"
			background-color="transparent"
			class="sidebar-menu"
			:collapse="isCollapsed"
			:default-active="activePath"
			mode="vertical"
			router
			text-color="var(--gp-text-secondary)"
		>
			<template v-for="item in sidebarData" :key="item.path || item.title">
				<!-- Single Item -->
				<el-menu-item v-if="!item.children" :index="item.path" :route="{ path: item.path }">
					<el-icon v-if="item.icon"><component :is="getIcon(item.icon)" /></el-icon>
					<template #title>
						<span class="menu-item-text">{{ t(item.title) }}</span>
					</template>
				</el-menu-item>

				<!-- Group / Sub-menu -->
				<el-sub-menu v-else :index="item.title">
					<template #title>
						<el-icon v-if="item.icon"><component :is="getIcon(item.icon)" /></el-icon>
						<span class="menu-item-text">{{ t(item.title) }}</span>
					</template>
					<el-menu-item
						v-for="child in item.children"
						:key="child.path"
						:index="child.path"
						:route="{ path: child.path }"
					>
						<template #title>
							<span class="menu-item-text">{{ t(child.title) }}</span>
						</template>
					</el-menu-item>
				</el-sub-menu>
			</template>
		</el-menu>
	</aside>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import { useI18n } from '@admin-panel/i18n'
import * as Icons from '@element-plus/icons-vue'
import { Expand, Fold } from '@element-plus/icons-vue'

import { useSidebar } from '../composables'

const route = useRoute()

const { sidebarData, activeContext, setContext } = useSidebar()
const { t } = useI18n()

import { EditPen, Setting } from '@element-plus/icons-vue'

const isCollapsed = ref(localStorage.getItem('gp-sidebar-collapsed') === 'true')

const activePath = computed(() => route.path)

const toggleCollapse = () => {
	isCollapsed.value = !isCollapsed.value

	localStorage.setItem('gp-sidebar-collapsed', String(isCollapsed.value))
}

const getIcon = (name: string) => {
	return (Icons as any)[name] || Icons.Menu
}
</script>

<style scoped>
.the-sidebar {
	width: var(--gp-sidebar-width);
	height: 100vh;
	display: flex;
	flex-direction: column;
	transition: width 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
	overflow: hidden;
}

.the-sidebar.is-collapsed {
	width: 64px;
}

.sidebar-header {
	height: 64px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-bottom: 1px solid var(--gp-glass-border);
	padding: 0 16px;
}

.sidebar-logo {
	flex: 1;
	text-align: center;
}

.sidebar-logo h2 {
	font-size: 1.1rem;
	letter-spacing: 1px;
	white-space: nowrap;
	-webkit-text-fill-color: transparent;
	background: linear-gradient(120deg, var(--gp-primary), #fff);
	-webkit-background-clip: text;
	background-clip: text;
	margin: 0;
}

.collapse-trigger {
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 4px;
	font-size: 20px;
	color: var(--gp-text-secondary);
	transition: background 0.2s;
	cursor: pointer;
	padding: 8px;
}

.collapse-trigger:hover {
	color: var(--gp-primary);
	background: var(--gp-glass-hover);
}

.context-switcher {
	display: flex;
	border-bottom: 1px solid var(--gp-glass-border);
	background: rgb(255, 255, 255, 0.02);
	padding: 8px;
	gap: 4px;
}

.context-switcher.is-collapsed {
	flex-direction: column;
	align-items: center;
}

.context-item {
	height: 36px;
	display: flex;
	flex: 1;
	align-items: center;
	justify-content: center;
	border-radius: var(--gp-radius-sm);
	font-weight: 600;
	font-size: 0.85rem;
	color: var(--gp-text-secondary);
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	cursor: pointer;
	gap: 8px;
}

.context-item:hover {
	color: var(--gp-text-primary);
	background: var(--gp-glass-hover);
}

.context-item.active {
	box-shadow: 0 4px 12px rgb(var(--gp-primary-rgb), 0.3);
	color: #fff;
	background: var(--gp-primary);
}

.is-collapsed .context-item {
	width: 40px;
	height: 40px;
	flex: none;
}

.sidebar-menu {
	flex: 1;
	border-right: none;
	padding-top: 16px;
}

.sidebar-menu:not(.el-menu--collapse) {
	width: var(--gp-sidebar-width);
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
	height: 48px;
	border-radius: var(--gp-radius-sm);
	line-height: 48px;
	padding: 0 12px !important;
	margin: 4px 8px;
}

:deep(.el-sub-menu .el-menu-item) {
	margin-right: 8px;
	margin-left: 32px;
}

:deep(.el-menu-item.is-active) {
	background: var(--gp-primary-light) !important;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
	background: var(--gp-glass-hover) !important;
}

.menu-item-text {
	font-weight: 500;
	font-size: 0.9rem;
	margin-left: 8px;
}

.is-collapsed .menu-item-text {
	display: none;
}
</style>
