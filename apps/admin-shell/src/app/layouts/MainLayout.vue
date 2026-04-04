<template>
	<div class="main-layout">
		<div class="ambient-bg">
			<div class="ambient-orb orb-1"></div>
			<div class="ambient-orb orb-2"></div>
		</div>
		<TheSidebar />

		<div class="main-layout__content">
			<header class="main-header glass-panel">
				<div class="header-left">
					<span class="page-title">{{ currentTitle }}</span>
				</div>
				<div class="header-right">
					<UiThemeSwitcher />
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
import { UiThemeSwitcher } from '@admin-panel/ui'

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
	position: relative;
}

.ambient-bg {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	overflow: hidden;
	z-index: 0;
	pointer-events: none;
}

.ambient-orb {
	position: absolute;
	border-radius: 50%;
	filter: blur(100px);
	opacity: 0.3;
	animation: float 20s infinite ease-in-out alternate;
}

.orb-1 {
	top: -10%;
	right: -5%;
	width: 600px;
	height: 600px;
	background: var(--gp-primary);
}

.orb-2 {
	bottom: -15%;
	left: 10%;
	width: 500px;
	height: 500px;
	background: #6e39cb;
	animation-delay: -10s;
}

@keyframes float {
	0% { transform: translate(0, 0) scale(1); }
	100% { transform: translate(-50px, 50px) scale(1.1); }
}

.main-layout__content {
  z-index: 1;
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
