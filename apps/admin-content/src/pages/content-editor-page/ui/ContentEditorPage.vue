<template>
	<div class="content-editor-page">
		<div class="page-content">
			<ContentEditor
				v-if="schema"
				v-model="formData"
				v-model:status="entryStatus"
				v-model:i18n="i18nData"
				:entry-id="entryId"
				:errors="errors"
				:is-edit="isEdit"
				:is-saving="isSaving"
				:schema="schema"
				@cancel="goBack"
				@rollback="fetchData"
				@save="onSave"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { ContentSchema } from '@admin-panel/lib'
import { ElMessage } from 'element-plus'

import { ContentEditor } from '#features/content-editor'

import { contentApi } from '#entities/content'

const route = useRoute()
const router = useRouter()
const schemaIdentifier = route.params.schemaIdentifier as string
const entryId = route.params.id as string | undefined

const isEdit = computed(() => !!entryId)
const schema = ref<ContentSchema | null>(null)
const formData = reactive<Record<string, any>>({})
const errors = ref<Record<string, string[]>>({})
const isSaving = ref(false)
const entryStatus = ref('draft')
const i18nData = reactive<Record<string, any>>({})

const fetchData = async () => {
	try {
		const schemaRes = await contentApi.getSchemaByIdentifier(schemaIdentifier)

		if (schemaRes.data) {
			schema.value = schemaRes.data

			if (isEdit.value && entryId) {
				const entryRes = await contentApi.getEntry(entryId)

				if (entryRes.data) {
					// Clear and merge to keep reactivity
					Object.keys(formData).forEach((key) => delete formData[key])

					Object.assign(formData, entryRes.data.data)

					entryStatus.value = entryRes.data.status

					if (entryRes.data.i18n) {
						Object.keys(i18nData).forEach((k) => delete i18nData[k])

						Object.assign(i18nData, entryRes.data.i18n)
					}
				}
			}
		}
	} catch (error: any) {
		ElMessage.error(error.messages?.[0] || 'Failed to fetch editor data')
	}
}

const onSave = async (seoData?: any) => {
	if (!schema.value) return
	isSaving.value = true

	errors.value = {}

	// Merge SEO data into formData
	const finalData = {
		...formData,
		_seo: seoData,
	}

	console.log('[Content Editor Page] Saving data:', {
		isEdit: isEdit.value,
		entryId,
		finalData,
	})

	try {
		const payload = {
			data: finalData,
			status: entryStatus.value,
			i18n: i18nData,
		}

		if (isEdit.value && entryId) {
			await contentApi.updateEntry(entryId, payload)

			ElMessage.success('Entry updated')
		} else {
			// Generate a simple slug for the entry
			const entrySlug = `entry-${Date.now()}`

			await contentApi.createEntry({
				schema_id: schema.value.id,
				slug: entrySlug,
				...payload,
			})

			ElMessage.success('Entry created')
		}

		goBack()
	} catch (error: any) {
		errors.value = error.errors || {}

		ElMessage.error(error.messages?.[0] || 'Failed to save entry')
	} finally {
		isSaving.value = false
	}
}

const goBack = () => {
	router.push({ name: 'EntriesList', params: { schemaIdentifier } })
}

onMounted(fetchData)
</script>

<style scoped>
.content-editor-page {
	min-height: 100vh;
	color: var(--gp-text-main);
	background-color: transparent;
	transition: all 0.3s ease;
	padding: 32px;
}

.page-content {
	max-width: 800px;
	margin: 0 auto;
}
</style>
