<template>
	<UiAuthGuard>
		<div class="app-layout">
			<UiSidebar />
			<main class="app-main">
				<UiFloatingSettings />
				<router-view />
			</main>
		</div>
	</UiAuthGuard>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

import { UiAuthGuard, UiFloatingSettings, UiSidebar, useSidebar } from '@admin-panel/ui'

const { setData } = useSidebar()

onMounted(() => {
	setData('system', [
		{
			title: 'menu.profile',
			icon: 'User',
			path: '/',
		},
	])
})
</script>

<style lang="scss" scoped>
.app-layout {
	min-height: 100vh;
	display: flex;
	background-color: var(--gp-bg-main);
}

.app-main {
	flex: 1;
	padding: 24px;
	overflow-y: auto;
}
</style>
