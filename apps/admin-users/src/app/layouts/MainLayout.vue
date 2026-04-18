<template>
	<div class="main-layout">
		<div class="main-layout__content-wrapper">
			<div class="main-layout__content">
				<router-view />
			</div>
		</div>
		<div class="layout-actions">
			<UiThemeSwitcher />
		</div>
	</div>
</template>

<script setup lang="ts">
import { UiThemeSwitcher } from '@admin-panel/ui'
</script>

<style lang="scss" scoped>
.main-layout {
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;

	&__content {
		flex-grow: 1;
		padding-bottom: 100px;
	}

	&__content-wrapper {
		width: 100%;
		max-width: 1920px;
		display: flex;
		flex-grow: 1;
	}
}

.layout-actions {
	right: 32px;
	bottom: 32px;
	position: fixed;
	z-index: 1000;
}
</style>
