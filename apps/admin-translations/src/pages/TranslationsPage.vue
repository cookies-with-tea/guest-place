<template>
	<div class="translations-page">
		<TranslationsFilters />
		<TranslationsTable />
		<TranslationModal />
	</div>
</template>

<script setup lang="ts">
import { useTranslations } from '@/entities/translation/lib/composables'

import TranslationModal from '#features/TranslationModal.vue'
import TranslationsTable from '#features/TranslationsTable.vue'
import TranslationsFilters from '#features/TranslationsFilters.vue'

useTranslations()
</script>

<style scoped>
.translations-page {
	padding: 24px;
}
</style>
