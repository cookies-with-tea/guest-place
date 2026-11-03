<template>
	<UiFloatingSettings />
	<router-view />
</template>

<script setup lang="ts">
import { UiFloatingSettings } from '@admin-panel/ui'
</script>

<style>
/* Reset root styles for MFE compatibility */
.admin-content-app {
	min-height: auto !important;
	padding: 0 !important;
}
</style>
