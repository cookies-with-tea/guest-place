<template>
	<div class="settings-page">
		<SettingsPageHeader
			:is-loading="entry.isLoading"
			@refresh="entry.fetchData"
			@go-to-schemas="goToSchemas"
			@go-to-docs="goToDocs"
		/>

		<div class="page-content">
			<!-- Loading State -->
			<div v-if="entry.isLoading" class="loading-state glass-card">
				<el-skeleton :rows="6" animated />
			</div>

			<!-- State 1: Schema Exists -> Show Editor -->
			<SettingsSchemaEditor v-else-if="entry.schema" :entry="entry" @go-to-schemas="goToSchemas" />

			<!-- State 2: Schema NOT Found -> User-Friendly Onboarding -->
			<SettingsOnboarding v-else :entry="entry" @go-to-schemas="goToSchemas" @go-to-docs="goToDocs" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useGlobalSettingsEntry } from '../composables/useGlobalSettingsEntry'
import SettingsOnboarding from './components/SettingsOnboarding.vue'
import SettingsPageHeader from './components/SettingsPageHeader.vue'
import SettingsSchemaEditor from './components/SettingsSchemaEditor.vue'

const router = useRouter()

const entry = useGlobalSettingsEntry()

const goToSchemas = () => {
	const isShell = window.location.pathname.startsWith('/content')

	router.push(isShell ? '/content' : '/')
}

const goToDocs = () => {
	const isShell = window.location.pathname.startsWith('/content')

	router.push(isShell ? '/content/docs' : '/docs')
}

onMounted(entry.fetchData)
</script>

<style scoped lang="scss">
.settings-page {
	min-height: calc(100vh - 70px);
	color: var(--gp-text-main, #1e293b);
	background: transparent;
	transition: all 0.3s ease;
	padding: 28px 32px;
}

.page-content {
	max-width: 1080px;
	margin: 0 auto;
}

.glass-card {
	border: 1px solid var(--gp-glass-border, rgb(255, 255, 255, 0.2));
	border-radius: 20px;
	box-shadow: 0 12px 32px rgb(0, 0, 0, 0.05);
	background: var(--gp-bg-glass, rgb(255, 255, 255, 0.7));
	padding: 32px;
	-webkit-backdrop-filter: blur(16px);
	backdrop-filter: blur(16px);
}

.loading-state {
	padding: 40px;
}
</style>
