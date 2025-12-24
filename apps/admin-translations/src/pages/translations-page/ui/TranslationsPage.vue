<template>
	<div id="__MF_TRANSLATIONS_PAGE__" class="translations-page">
		<h1>MF Translations</h1>

		<TranslationsFilters />
		<TranslationsTable />
		<TranslationsUpdateModal />
	</div>
</template>

<script setup lang="ts">
import { TranslationsUpdateModal } from '#features/translations-update-modal'
import { TranslationsTable } from '#features/translations-table'
import { TranslationsFilters } from '#features/translations-filters'
import { useTranslations } from '#entities/translation/lib/composables'

useTranslations()
</script>

<style scoped>
.translations-page {
	padding: 24px;
}
</style>
