<template>
	<div class="settings-page" :class="{ 'is-dark': isDark }">
		<div class="page-header">
			<h1>Global Configuration</h1>
		</div>

		<div class="page-content">
			<template v-if="schema">
				<ContentEditor
					v-model="formData"
					:errors="errors"
					:is-saving="isSaving"
					:schema="schema"
					@cancel="goBack"
					@save="onSave"
				/>
			</template>

			<div v-else-if="!isLoading" class="no-schema glass-panel">
				<p>Global configuration schema not found.</p>
				<el-button type="primary" @click="createDefaultSchema"> Initialize Settings Schema </el-button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import type { ContentSchema } from '@admin-panel/lib'
import { FieldType } from '@admin-panel/lib'
import { useTheme } from '@admin-panel/ui'
import { ElMessage } from 'element-plus'

import { ContentEditor } from '#features/content-editor'

import { contentApi } from '#entities/content'

const router = useRouter()

const { isDark } = useTheme()

const schema = ref<ContentSchema | null>(null)
const formData = reactive<Record<string, any>>({})
const errors = ref<Record<string, string[]>>({})
const isLoading = ref(true)
const isSaving = ref(false)

const SETTINGS_IDENTIFIER = 'global-settings'

const fetchData = async () => {
	isLoading.value = true

	try {
		const schemaRes = await contentApi.getSchemaByIdentifier(SETTINGS_IDENTIFIER)

		if (schemaRes.data) {
			schema.value = schemaRes.data

			try {
				const entriesRes = await contentApi.getEntries(schema.value.id)

				if (entriesRes.data && entriesRes.data.length > 0) {
					Object.assign(formData, entriesRes.data[0].data)
				}
			} catch (e: any) {
				// 404 is fine here, it just means no entries created yet
				if (e.status !== 404) throw e
			}
		}
	} catch (error: any) {
		if (error.status !== 404) {
			ElMessage.error(error.messages?.[0] || 'Failed to fetch settings')
		}
	} finally {
		isLoading.value = false
	}
}

const onSave = async () => {
	if (!schema.value) return
	isSaving.value = true

	errors.value = {}

	try {
		const entriesRes = await contentApi.getEntries(schema.value.id)
		const existingEntry = entriesRes.data?.[0]

		if (existingEntry) {
			await contentApi.updateEntry(existingEntry.id, formData)

			ElMessage.success('Settings updated')
		} else {
			await contentApi.createEntry({
				schema_id: schema.value.id,
				slug: 'global-settings-entry',
				data: formData,
			})

			ElMessage.success('Settings created')
		}
	} catch (error: any) {
		errors.value = error.errors || {}

		ElMessage.error(error.messages?.[0] || 'Failed to save settings')
	} finally {
		isSaving.value = false
	}
}

const createDefaultSchema = async () => {
	isLoading.value = true

	try {
		// First we need to expose createSchema in contentApi or use fetching directly
		// For now, I'll use a direct fetch or ensure contentApi has it
		await contentApi.createSchema({
			name: 'Global Settings',
			slug: SETTINGS_IDENTIFIER,
			fields: [
				{ label: 'Site Name', name: 'siteName', fieldType: FieldType.Text, required: true },
				{ label: 'Description', name: 'description', fieldType: FieldType.RichText, required: false },
				{ label: 'Maintenance Mode', name: 'maintenanceMode', fieldType: FieldType.Boolean, required: false },
			],
		})

		ElMessage.success('Settings schema initialized')

		fetchData()
	} catch (error: any) {
		ElMessage.error(error.messages?.[0] || 'Failed to initialize schema')
	} finally {
		isLoading.value = false
	}
}

const goBack = () => {
	// For settings, "back" could mean Dashboard
	router.push('/')
}

onMounted(fetchData)
</script>

<style scoped>
.settings-page {
	min-height: 100vh;
	color: var(--text-primary);
	background-color: var(--bg-page);
	transition: all 0.3s ease;
	padding: 32px;
}

.page-header {
	margin-bottom: 32px;
}

.page-header h1 {
	font-weight: 800;
	font-size: 32px;
	color: var(--text-primary);
}

.page-content {
	max-width: 800px;
	margin: 0 auto;
}

.no-schema {
	border-radius: 16px;
	text-align: center;
	padding: 48px;
}

.no-schema p {
	color: var(--text-muted);
	margin-bottom: 24px;
}
</style>
