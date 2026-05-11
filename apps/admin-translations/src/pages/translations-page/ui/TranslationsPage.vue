<template>
	<div id="__MF_TRANSLATIONS_PAGE__" class="translations-page">
		<el-tabs v-model="activeTab">
			<el-tab-pane label="Dictionary" name="translations">
				<TranslationsFilters />
				<TranslationsTable />
			</el-tab-pane>

			<el-tab-pane label="Namespace Management" name="namespaces">
				<NamespacesManagement />
			</el-tab-pane>
		</el-tabs>

		<TranslationsUpdateModal />
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import NamespacesManagement from '#features/namespaces-management/ui/NamespacesManagement.vue'
import { TranslationsFilters } from '#features/translations-filters'
import { TranslationsTable } from '#features/translations-table'
import { TranslationsUpdateModal } from '#features/translations-update-modal'

import { useTranslations } from '#entities/translation/lib/composables'

const activeTab = ref('translations')

useTranslations()
</script>

<style scoped>
.translations-page {
	padding: 24px;
}
</style>
