<template>
	<aside
		class="ui-sidebar"
		:class="{
			'is-collapsed': isCollapsed,
			'is-simple': simple,
			'has-secondary': !simple && !isCollapsed && activeSubMenu,
		}"
	>
		<!-- Primary / Simple Column -->
		<div class="sidebar-primary glass-panel">
			<div class="sidebar-header" :class="{ 'is-collapsed': isCollapsed }">
				<h2 v-show="!isCollapsed" class="logo-text">GUEST PLACE</h2>
				<div class="collapse-trigger" @click="toggleCollapse">
					<el-icon><Expand v-if="isCollapsed" /><Fold v-else /></el-icon>
				</div>
			</div>

			<div v-if="showContextSwitcher" class="context-container">
				<div
					v-for="ctx in availableContexts"
					:key="ctx"
					class="context-item"
					:class="{ active: activeContext === ctx }"
					@click="setContext(ctx)"
				>
					<el-icon><component :is="ctx === 'system' ? 'Setting' : 'EditPen'" /></el-icon>
					<span v-show="!isCollapsed" class="label">{{ t(`shell.${ctx}`) }}</span>
				</div>
			</div>

			<div class="menu-container">
				<template v-for="item in sidebarData" :key="item.title">
					<!-- Simple Mode with Children -->
					<template v-if="simple && item.children">
						<div v-show="!isCollapsed" class="menu-group-title">{{ t(item.title) }}</div>
						<router-link
							v-for="child in item.children"
							:key="child.path"
							v-slot="{ isActive, navigate }"
							:to="child.path || '/'"
							custom
						>
							<div class="menu-item" :class="{ active: isActive }" @click="navigate">
								<el-icon v-if="item.icon"><component :is="getIcon(item.icon)" /></el-icon>
								<span v-show="!isCollapsed" class="label">{{ t(child.title) }}</span>
							</div>
						</router-link>
					</template>

					<!-- Single Item (No children) -->
					<router-link
						v-else-if="!item.children"
						v-slot="{ isExactActive, isActive, navigate }"
						:to="item.path || '/'"
						custom
					>
						<div class="menu-item" :class="{ active: item.path === '/' ? isExactActive : isActive }" @click="navigate">
							<el-icon v-if="item.icon"><component :is="getIcon(item.icon)" /></el-icon>
							<span v-show="!isCollapsed" class="label">{{ t(item.title) }}</span>
						</div>
					</router-link>

					<!-- Group Item (Two-column mode) -->
					<div v-else class="menu-item" :class="{ active: isItemActive(item) }" @click="handlePrimaryClick(item)">
						<div class="item-main">
							<el-icon><component :is="getIcon(item.icon)" /></el-icon>
							<span v-show="!isCollapsed" class="label">{{ t(item.title) }}</span>
						</div>
						<el-icon v-show="!isCollapsed" class="arrow"><ArrowRight /></el-icon>
					</div>
				</template>
			</div>
		</div>

		<!-- Secondary Column -->
		<Transition name="slide">
			<div v-if="!simple && !isCollapsed && activeSubMenu" class="sidebar-secondary glass-panel">
				<div class="secondary-header">
					<h3>{{ t(activeSubMenu.title) }}</h3>
				</div>
				<div class="secondary-menu">
					<router-link
						v-for="child in activeSubMenu.children"
						:key="child.path"
						v-slot="{ isExactActive, isActive, navigate }"
						:to="child.path || ''"
						custom
					>
						<div
							class="secondary-item"
							:class="{ active: child.path === '/' ? isExactActive : isActive }"
							@click="navigate"
						>
							<span>{{ t(child.title) }}</span>
							<el-icon v-if="child.path === '/' ? isExactActive : isActive" class="active-dot">
								<CircleCheckFilled />
							</el-icon>
						</div>
					</router-link>
				</div>
			</div>
		</Transition>
	</aside>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useI18n } from '@admin-panel/i18n'
import * as Icons from '@element-plus/icons-vue'
import { ArrowRight, CircleCheckFilled, Expand, Fold } from '@element-plus/icons-vue'

import { useSidebar } from '../lib/useSidebar'
import type { ISidebarItem, SidebarContext } from '../model'

interface Props {
	showContextSwitcher?: boolean
	availableContexts?: SidebarContext[]
	data?: ISidebarItem[]
	simple?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	showContextSwitcher: true,
	availableContexts: () => ['system', 'website'],
	simple: false,
})

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { sidebarData: globalSidebarData, activeContext, isCollapsed, setContext, toggleCollapse } = useSidebar()

const sidebarData = computed(() => props.data || globalSidebarData.value)
const selectedPrimaryTitle = ref<string | null>(null)

const activeSubMenu = computed(() => {
	if (props.simple) return null

	return sidebarData.value.find((item) => item.title === selectedPrimaryTitle.value && item.children)
})

const isItemActive = (item: ISidebarItem) => {
	// 1. Exact path match
	if (item.path && item.path !== '/') {
		if (route.path === item.path || route.path.startsWith(item.path + '/')) return true
	} else if (item.path === '/') {
		if (route.path === '/') return true
	}

	// 2. Child match
	if (
		item.children?.some((child) => {
			if (!child.path) return false
			if (child.path === '/') return route.path === '/'

			return route.path === child.path || route.path.startsWith(child.path + '/')
		})
	) {
		return true
	}

	return selectedPrimaryTitle.value === item.title
}

const handlePrimaryClick = (item: ISidebarItem) => {
	if (item.children) {
		selectedPrimaryTitle.value = item.title

		if (isCollapsed.value) toggleCollapse()
	} else if (item.path) {
		selectedPrimaryTitle.value = null

		router.push(item.path)
	}
}

const getIcon = (name?: string) => (name && (Icons as any)[name]) || Icons.Menu

watch(
	() => route.path,
	(path) => {
		const found = sidebarData.value.find((item) => {
			if (item.path === path) return true
			if (item.path && item.path !== '/' && path.startsWith(item.path + '/')) return true

			if (!item.children) return false

			return item.children.some((child) => {
				if (!child.path) return false
				if (child.path === '/') return path === '/'

				return path === child.path || path.startsWith(child.path + '/')
			})
		})

		if (found) {
			selectedPrimaryTitle.value = found.title || null
		}
	},
	{ immediate: true }
)
</script>

<style scoped>
.ui-sidebar {
	width: 64px;
	height: 100vh;
	position: relative;
	display: flex;
	transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.ui-sidebar.is-simple {
	width: 240px;
}

.ui-sidebar.is-simple.is-collapsed {
	width: 64px;
}

.ui-sidebar.has-secondary {
	width: 440px;
}

.ui-sidebar:not(.is-simple, .is-collapsed, .has-secondary) {
	width: 240px;
}

.sidebar-primary {
	width: 64px;
	height: 100%;
	display: flex;
	flex-direction: column;
	border-right: 1px solid var(--gp-glass-border);
	background: var(--gp-bg-sidebar);
	transition: width 0.3s;
	padding: 0;
	overflow: hidden;
	z-index: 2;
}

.ui-sidebar:not(.is-collapsed) .sidebar-primary {
	width: 240px;
}

.sidebar-header {
	height: 64px;
	position: relative;
	display: flex;
	align-items: center;
	border-bottom: 1px solid var(--gp-glass-border);
	padding: 0 16px;
}

.sidebar-header.is-collapsed {
	justify-content: center;
	padding: 0;
}

.logo-text {
	flex: 1;
	font-weight: 800;
	font-size: 1rem;
	white-space: nowrap;
	color: var(--gp-text-main);
	margin: 0;
}

.collapse-trigger {
	display: flex;
	align-items: center;
	font-size: 20px;
	color: var(--gp-text-secondary);
	cursor: pointer;
}

.context-container {
	display: flex;
	flex-direction: column;
	border-bottom: 1px solid var(--gp-glass-border);
	padding: 8px;
	gap: 4px;
}

.context-item {
	height: 40px;
	display: flex;
	align-items: center;
	border-radius: 8px;
	color: var(--gp-text-secondary);
	transition: all 0.2s;
	cursor: pointer;
	padding: 0 12px;
	gap: 12px;
}

.context-item:hover {
	background: var(--gp-glass-hover);
}

.context-item.active {
	color: var(--text-inverse);
	background: var(--gp-primary);
}

.context-item .label {
	font-weight: 600;
	font-size: 0.85rem;
	white-space: nowrap;
}

.menu-container {
	display: flex;
	flex: 1;
	flex-direction: column;
	padding: 12px 8px;
	gap: 4px;
}

.menu-group-title {
	font-weight: 700;
	font-size: 0.75rem;
	letter-spacing: 0.05em;
	text-transform: uppercase;
	color: var(--gp-text-muted);
	padding: 12px 12px 4px;
	margin-top: 8px;
}

.menu-group-title:first-child {
	margin-top: 0;
}

.menu-item {
	height: 44px;
	display: flex;
	align-items: center;
	border-radius: 8px;
	color: var(--gp-text-secondary);
	transition: all 0.2s;
	cursor: pointer;
	padding: 0 12px;
	gap: 12px;
}

.item-main {
	display: flex;
	align-items: center;
	gap: 12px;
}

.menu-item .label {
	font-weight: 500;
	font-size: 0.9rem;
	white-space: nowrap;
}

.menu-item .el-icon {
	font-size: 20px;
}

.arrow {
	font-size: 14px;
	opacity: 0.5;
}

.menu-item:hover {
	color: var(--gp-primary);
	background: var(--gp-glass-hover);
}

.menu-item.active {
	color: var(--gp-primary);
	background: var(--gp-primary-light);
}

.sidebar-secondary {
	width: 200px;
	height: 100%;
	display: flex;
	flex-direction: column;
	border-right: 1px solid var(--gp-glass-border);
	box-shadow: 10px 0 30px rgb(0, 0, 0, 0.05);
	background: var(--gp-bg-sidebar);
	z-index: 1;
}

.secondary-header {
	border-bottom: 1px solid var(--gp-glass-border);
	padding: 24px 20px;
}

.secondary-header h3 {
	font-size: 0.8rem;
	letter-spacing: 1px;
	text-transform: uppercase;
	color: var(--gp-text-muted);
	margin: 0;
}

.secondary-menu {
	display: flex;
	flex-direction: column;
	padding: 16px 8px;
	gap: 4px;
}

.secondary-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-radius: 6px;
	font-size: 0.85rem;
	color: var(--gp-text-secondary);
	transition: all 0.2s;
	cursor: pointer;
	padding: 10px 12px;
}

.secondary-item:hover {
	background: var(--gp-glass-hover);
}

.secondary-item.active {
	color: var(--gp-primary);
	background: var(--gp-primary-light);
}

.slide-enter-active,
.slide-leave-active {
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from,
.slide-leave-to {
	width: 0;
	transform: translateX(-100%);
	opacity: 0;
}
</style>
