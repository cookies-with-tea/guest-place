<template>
	<div v-if="!authChecked" class="ui-auth-guard" />
	<div v-else-if="!isAuthenticated" class="ui-auth-guard">
		<UiAuthWidget />
	</div>
	<slot v-else />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuth } from '@admin-panel/lib'

import UiAuthWidget from '../../../widgets/ui-auth-widget'

const { isAuthenticated, authChecked, checkAuth } = useAuth()

// access_token живёт в HttpOnly-cookie — JS не может прочитать его напрямую,
// единственный способ узнать, валидна ли сессия, это спросить сервер.
onMounted(() => {
	if (!authChecked.value) checkAuth()
})
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
