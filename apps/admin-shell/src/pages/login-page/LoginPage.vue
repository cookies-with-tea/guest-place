<template>
	<div class="login-page">
		<UiAuthWidget />
	</div>
</template>

<script setup lang="ts">
import { UiAuthWidget } from '@admin-panel/ui'
</script>

<style lang="scss" scoped>
.login-page {
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	background: var(--el-bg-color-page);
	padding: 24px;
}
</style>
