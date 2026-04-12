<template>
	<aside class="the-sidebar glass-sidebar">
		<div class="sidebar-logo">
			<h2>GUEST PLACE</h2>
		</div>
		<el-menu
			:default-active="activePath"
			mode="vertical"
			background-color="transparent"
			text-color="var(--gp-text-secondary)"
			active-text-color="var(--gp-primary)"
			router
			class="sidebar-menu"
		>
			<el-menu-item v-for="item in sidebarData" :key="item.path" :index="item.path" :route="{ path: item.path }">
				<template #title>
					<span class="menu-item-text">{{ t(item.title).value }}</span>
				</template>
			</el-menu-item>
		</el-menu>
	</aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSidebar } from '../composables'
import { useI18n } from '@admin-panel/i18n'

const route = useRoute()

const { sidebarData } = useSidebar()
const { t } = useI18n()

const activePath = computed(() => route.path)
</script>

<style scoped>
.the-sidebar {
	width: var(--gp-sidebar-width);
	height: 100vh;
	display: flex;
	flex-direction: column;
}

.sidebar-logo {
	border-bottom: 1px solid var(--gp-glass-border);
	text-align: center;
	padding: 24px;
}

.sidebar-logo h2 {
	font-size: 1.2rem;
	letter-spacing: 2px;
	-webkit-text-fill-color: transparent;
	background: linear-gradient(120deg, var(--gp-primary), #fff);
	-webkit-background-clip: text;
	background-clip: text;
	margin: 0;
}

.sidebar-menu {
	flex: 1;
	border-right: none;
	padding-top: 16px;
}

:deep(.el-menu-item) {
	height: 48px;
	border-radius: var(--gp-radius-sm);
	line-height: 48px;
	margin: 4px 12px;
}

:deep(.el-menu-item.is-active) {
	background: var(--gp-primary-light) !important;
}

:deep(.el-menu-item:hover) {
	background: rgb(255, 255, 255, 0.05) !important;
}
</style>
