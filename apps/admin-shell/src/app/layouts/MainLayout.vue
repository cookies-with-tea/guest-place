<template>
	<div class="main-layout">
		<TheSidebar />

		<div class="main-layout__content">
			<header>HOST HEADER</header>

			<RouterView />
		</div>
	</div>
</template>

<script lang="ts" setup>
import { TheSidebar } from '#widgets/the-sidebar'
</script>

<style lang="scss" scoped>
.main-layout {
	height: 100%;
	display: grid;
	grid-template-columns: 300px 1fr;
}
</style>
