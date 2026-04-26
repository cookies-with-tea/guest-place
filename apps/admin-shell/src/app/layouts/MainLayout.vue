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
					<UiLanguageSwitcher />
					<UiThemeSwitcher />

					<div v-if="isAuthenticated" class="user-info">
						<el-dropdown trigger="click">
							<div class="user-profile">
								<el-avatar :icon="UserFilled" :size="32" />
								<span class="user-name">{{ user?.firstName || user?.email }}</span>
							</div>
							<template #dropdown>
								<el-dropdown-menu>
									<el-dropdown-item>{{ $T('shell.profile') }}</el-dropdown-item>
									<el-dropdown-item divided @click="clearAuth">{{ $T('shell.logout') }}</el-dropdown-item>
								</el-dropdown-menu>
							</template>
						</el-dropdown>
					</div>
					<el-button v-else plain size="small" type="primary" @click="loginDialogVisible = true">
						{{ $T('shell.login') }}
					</el-button>
				</div>
			</header>

			<el-dialog v-model="loginDialogVisible" custom-class="auth-dialog" :show-close="false" title="" width="400px">
				<UiAuthWidget />
			</el-dialog>

			<main class="page-content">
				<RouterView v-slot="{ Component, route: currentRoute }">
					<Transition mode="out-in" name="fade-transform">
						<div :key="currentRoute.path" class="page-wrapper">
							<component :is="Component" />
						</div>
					</Transition>
				</RouterView>
			</main>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import { useI18n } from '@admin-panel/i18n'
import { useAuth } from '@admin-panel/lib'
import { UiAuthWidget, UiLanguageSwitcher, UiThemeSwitcher } from '@admin-panel/ui'
import { UserFilled } from '@element-plus/icons-vue'

import { TheSidebar } from '#widgets/the-sidebar'

const route = useRoute()
const { t } = useI18n()

const currentTitle = computed(() => {
	const titleKey = route.meta?.title as string

	return titleKey ? (titleKey.includes('.') ? t(titleKey) : titleKey) : 'Dashboard'
})

const { user, isAuthenticated, clearAuth } = useAuth()
const loginDialogVisible = ref(false)
</script>

<style lang="scss" scoped>
.main-layout {
	width: 100vw;
	height: 100vh;
	position: relative;
	display: flex;
	background: var(--gp-bg-main);
	overflow: hidden;
}

.ambient-bg {
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	position: absolute;
	pointer-events: none;
	overflow: hidden;
	z-index: 0;
}

.ambient-orb {
	position: absolute;
	border-radius: 50%;
	filter: blur(100px);
	animation: float 20s infinite ease-in-out alternate;
	opacity: 0.3;
}

.orb-1 {
	top: -10%;
	right: -5%;
	width: 600px;
	height: 600px;
	background: var(--gp-primary);
}

.orb-2 {
	left: 10%;
	bottom: -15%;
	width: 500px;
	height: 500px;
	background: #6e39cb;
	animation-delay: -10s;
}

@keyframes float {
	0% {
		transform: translate(0, 0) scale(1);
	}

	100% {
		transform: translate(-50px, 50px) scale(1.1);
	}
}

.main-layout__content {
	min-width: 0;
	display: flex;
	flex: 1;
	flex-direction: column;
	z-index: 1;
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

.page-title {
	font-weight: 600;
	font-size: 1rem;
	letter-spacing: 0.2px;
	color: var(--gp-text-main);
}

.page-content {
	flex: 1;
	padding: 24px;
	overflow-y: auto;
}

.user-profile {
	display: flex;
	align-items: center;
	border-radius: var(--gp-radius-sm);
	transition: background 0.2s ease;
	cursor: pointer;
	padding: 4px 8px;
	gap: 10px;

	&:hover {
		background: var(--gp-bg-glass-hover);
	}
}

.user-name {
	max-width: 140px;
	font-weight: 500;
	font-size: 0.875rem;
	white-space: nowrap;
	text-overflow: ellipsis;
	color: var(--gp-text-main);
	overflow: hidden;
}
</style>
