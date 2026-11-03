<template>
	<div v-if="!isAuthenticated" class="ui-auth-guard">
		<UiAuthWidget />
	</div>
	<slot v-else />
</template>

<script setup lang="ts">
import { useAuth } from '@admin-panel/lib'

import UiAuthWidget from '../../../widgets/ui-auth-widget'

const { isAuthenticated } = useAuth()
</script>

<style scoped>
.ui-auth-guard {
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: var(--gp-bg-main);
}
</style>
