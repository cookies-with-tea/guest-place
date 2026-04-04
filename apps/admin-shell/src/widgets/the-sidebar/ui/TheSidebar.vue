<template>
	<aside class="the-sidebar">
		<el-menu
			:default-active="activePath"
			mode="vertical"
			background-color="#2c3e50"
			text-color="#ecf0f1"
			active-text-color="#409EFF"
			router
			class="sidebar-menu"
		>
			<el-menu-item v-for="item in sidebarData" :key="item.path" :index="item.path" :route="{ path: item.path }">
				<template #title>
					{{ t(item.title).value }}
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
	width: 240px;
	height: 100vh;
	box-shadow: 2px 0 6px rgb(0, 0, 0, 0.2);
}

.sidebar-menu {
	height: 100%;
	border-right: none;
}
</style>
