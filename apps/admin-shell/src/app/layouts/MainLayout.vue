<template>
	<div class="main-layout">
		<TheSidebar />

		<div class="main-layout__content">
			<header class="main-header glass-panel">
				<div class="header-left">
					<span class="page-title">{{ currentTitle }}</span>
				</div>
				<div class="header-right">
					<el-dropdown trigger="click">
						<div class="user-profile">
							<el-avatar :size="32" :icon="UserFilled" />
						</div>
						<template #dropdown>
							<el-dropdown-menu>
								<el-dropdown-item>Профиль</el-dropdown-item>
								<el-dropdown-item divided>Выйти</el-dropdown-item>
							</el-dropdown-menu>
						</template>
					</el-dropdown>
				</div>
			</header>

			<main class="page-content">
				<RouterView />
			</main>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { UserFilled } from '@element-plus/icons-vue'
import { TheSidebar } from '#widgets/the-sidebar'

const route = useRoute()
const currentTitle = computed(() => (route.meta?.title as string) || 'Dashboard')
</script>

<style lang="scss" scoped>
.main-layout {
	height: 100vh;
	width: 100vw;
	display: flex;
	background: var(--gp-bg-main);
	overflow: hidden;
}

.main-layout__content {
	flex: 1;
	display: flex;
	flex-direction: column;
	min-width: 0;
}

.main-header {
	height: var(--gp-header-height);
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 24px;
	z-index: 100;
}

.header-right {
	display: flex;
	align-items: center;
	gap: 16px;
}

.page-content {
	flex: 1;
	padding: 24px;
	overflow-y: auto;
}

.user-profile {
	cursor: pointer;
	display: flex;
	align-items: center;
}
</style>
