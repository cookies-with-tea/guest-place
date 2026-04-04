export function getPageVue(name, displayName) {
  const mfName = name.replace(/^admin-/, '')
  const id = `__MF_${mfName.toUpperCase().replace(/-/g, '_')}_PAGE__`
  return `<template>
	<div id="${id}" class="${mfName}-page">
		<h1>${displayName}</h1>
		<p>Welcome to the ${displayName} micro-frontend.</p>
	</div>
</template>

<script setup lang="ts">
// Page logic
</script>

<style scoped>
.${mfName}-page {
	padding: 24px;
}
</style>
`
}
