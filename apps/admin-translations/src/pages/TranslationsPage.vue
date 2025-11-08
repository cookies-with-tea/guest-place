<template>
	<h1>Remote Translations Page</h1>

	<UiIcon name="arrow-left" />

	<TranslationEditor />
</template>

<script setup lang="ts">
import { UiIcon } from '@admin-panel/ui'
import TranslationEditor from '#shared/TranslationEditor.vue'
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { setLocale } from '@admin-panel/i18n'

const route = useRoute()

watch(
	() => route.params.locale,
	(newLocale) => {
		if (['en', 'ru', 'fr', 'ja'].includes(newLocale as string)) {
			setLocale(newLocale as string)
		}
	},
	{ immediate: true }
)
</script>
