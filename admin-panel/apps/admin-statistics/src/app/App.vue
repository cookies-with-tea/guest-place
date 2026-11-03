<template>
	<UiAuthGuard>
		<div class="app-layout">
			<UiSidebar simple />

			<main class="app-main">
				<UiFloatingSettings />
				<router-view />
			</main>
		</div>
	</UiAuthGuard>
</template>

<script setup lang="ts">
import { UiAuthGuard, UiFloatingSettings, UiSidebar } from '@admin-panel/ui'
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

:deep(.auth-dialog) {
	border-radius: var(--gp-radius-lg);
	overflow: hidden;

	.el-dialog__header {
		display: none;
	}

	.el-dialog__body {
		padding: 0;
	}
}
</style>
