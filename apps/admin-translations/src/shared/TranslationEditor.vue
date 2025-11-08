<template>
	<div>{{ t('user.created').value }}</div>
	<div> {{ t('general.internal_error') }} </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18nStore } from '@admin-panel/i18n'

const { loadDict, t } = useI18nStore()

onMounted(() => {
	loadDict('user')

	loadDict('general')
})
</script>
