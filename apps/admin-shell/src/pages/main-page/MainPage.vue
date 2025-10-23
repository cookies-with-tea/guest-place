<template>
	<div class="main-page"> Main </div>

	<UiButton @click="toggleTheme">Toggle</UiButton>
	<UiButton appearance="secondary" @click="toggleTheme">Toggle</UiButton>
	<UiButton appearance="text" @click="toggleTheme">Toggle</UiButton>
</template>

<script lang="ts" setup>
import { UiButton } from '#shared/ui'

const toggleTheme = () => {
	const current = document.documentElement.getAttribute('data-theme')
	const next = current === 'dark' ? 'light' : 'dark'

	document.documentElement.setAttribute('data-theme', next)
}
</script>
