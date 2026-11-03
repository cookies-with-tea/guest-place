<template>
	<div class="redirects-page">
		<RedirectsPageHeader :redirects="redirects" />
		<RedirectsInfoStrip />
		<RedirectsFilterBar :redirects="redirects" />
		<RedirectsTable :redirects="redirects" />
		<RedirectFormDialog :redirects="redirects" />
	</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

import { useRedirectsData } from '../composables/useRedirectsData'
import RedirectFormDialog from './components/RedirectFormDialog.vue'
import RedirectsFilterBar from './components/RedirectsFilterBar.vue'
import RedirectsInfoStrip from './components/RedirectsInfoStrip.vue'
import RedirectsPageHeader from './components/RedirectsPageHeader.vue'
import RedirectsTable from './components/RedirectsTable.vue'

const redirects = useRedirectsData()

onMounted(async () => {
	await Promise.all([redirects.loadRedirects(), redirects.loadPages()])
})
</script>

<style scoped>
.redirects-page {
	max-width: 1400px;
	padding: 24px;
	margin: 0 auto;
}
</style>
