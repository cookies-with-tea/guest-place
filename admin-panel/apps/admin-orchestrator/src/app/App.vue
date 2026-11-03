<template>
	<UiAuthGuard>
		<div class="app-layout">
			<UiSidebar :data="sidebarData" :show-context-switcher="false" simple />
			<main class="app-main">
				<UiFloatingSettings />
				<router-view />
			</main>
		</div>
	</UiAuthGuard>
</template>

<script setup lang="ts">
import { UiAuthGuard, UiFloatingSettings, UiSidebar } from '@admin-panel/ui'

const sidebarData = [
	{ title: 'Топология', path: '/', icon: 'Share' },
	{ title: 'Модули (MFE)', path: '/modules', icon: 'Monitor' },
	{ title: 'Мониторинг', path: '/monitoring', icon: 'DataAnalysis' },
	{ title: 'Возможности', path: '/features', icon: 'MagicStick' },
	{ title: 'Логи системы', path: '/logs', icon: 'Memo' },
]
</script>

<style>
.app-layout {
	min-height: 100vh;
	display: flex;
	background: var(--gp-bg-main);
}

.app-main {
	flex: 1;
	padding: 32px;
	overflow-y: auto;
}
</style>
