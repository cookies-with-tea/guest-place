<template>
	<div class="content-editor-page" :class="{ 'is-dark': isDark }">
		<div class="page-content">
			<ContentEditor
				v-if="schema"
				v-model="formData"
				:errors="errors"
				:is-edit="isEdit"
				:is-saving="isSaving"
				:schema="schema"
				@cancel="goBack"
				@save="onSave"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { ContentSchema } from '@admin-panel/lib'
import { useTheme } from '@admin-panel/ui'
import { ElMessage } from 'element-plus'

import { ContentEditor } from '#features/content-editor'

import { contentApi } from '#entities/content'

const route = useRoute()
const router = useRouter()
const schemaIdentifier = route.params.schemaIdentifier as string
const entryId = route.params.id as string | undefined

const { isDark } = useTheme()

const isEdit = computed(() => !!entryId)
const schema = ref<ContentSchema | null>(null)
const formData = ref<Record<string, any>>({})
const errors = ref<Record<string, string[]>>({})
const isSaving = ref(false)

const fetchData = async () => {
	try {
		const schemaRes = await contentApi.getSchemaByIdentifier(schemaIdentifier)

		if (schemaRes.data) {
			schema.value = schemaRes.data

			if (isEdit.value && entryId) {
				const entryRes = await contentApi.getEntry(entryId)

				if (entryRes.data) {
					formData.value = entryRes.data.data
				}
			}
		}
	} catch (error: any) {
		ElMessage.error(error.messages?.[0] || 'Failed to fetch editor data')
	}
}

const onSave = async () => {
	if (!schema.value) return
	isSaving.value = true

	errors.value = {}

	try {
		if (isEdit.value && entryId) {
			await contentApi.updateEntry(entryId, formData.value)

			ElMessage.success('Entry updated')
		} else {
			// Generate a simple slug for the entry
			const entrySlug = `entry-${Date.now()}`

			await contentApi.createEntry({
				schema_id: schema.value.id,
				slug: entrySlug,
				data: formData.value,
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
	color: var(--text-primary);
	background-color: var(--bg-page);
	transition: all 0.3s ease;
	padding: 32px;
}

.page-content {
	max-width: 800px;
	margin: 0 auto;
}
</style>
