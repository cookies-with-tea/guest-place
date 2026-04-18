<template>
	<div class="app-container">
		<router-view />
		<div class="layout-actions">
			<UiThemeSwitcher />
		</div>
	</div>
</template>

<script setup lang="ts">
import { UiThemeSwitcher } from '@admin-panel/ui'
</script>

<style scoped>
.app-container {
	min-height: 100vh;
	position: relative;
}

.layout-actions {
	right: 32px;
	bottom: 32px;
	position: fixed;
	z-index: 1000;
}
</style>
