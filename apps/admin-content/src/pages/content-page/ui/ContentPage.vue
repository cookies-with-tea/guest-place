<template>
	<div class="content-page" :class="{ 'is-dark': isDark }">
		<div class="page-header">
			<h1>{{ schema?.name || 'Content' }}</h1>
			<div class="header-right">
				<el-button @click="onExport"> Export JSON </el-button>
				<el-button @click="triggerImport"> Import JSON </el-button>
				<el-button :icon="Plus" type="primary" @click="goToCreate"> Add Entry </el-button>
				<input ref="fileInput" accept=".json" style="display: none" type="file" @change="onImport" />
			</div>
		</div>

		<div class="page-content">
			<ContentTable :entries="entries" :is-loading="isLoading" :schema="schema" @delete="onDelete" @edit="goToEdit" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { ContentEntry, ContentSchema } from '@admin-panel/lib'
import { useTheme } from '@admin-panel/ui'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

import { ContentTable } from '#features/content-table'

import { contentApi } from '#entities/content'

const route = useRoute()
const router = useRouter()
const schemaIdentifier = route.params.schemaIdentifier as string

const { isDark } = useTheme()

const schema = ref<ContentSchema | null>(null)
const entries = ref<ContentEntry[]>([])
const isLoading = ref(true)

const fetchData = async () => {
	isLoading.value = true

	try {
		const schemaRes = await contentApi.getSchemaByIdentifier(schemaIdentifier)

		if (schemaRes.data) {
			schema.value = schemaRes.data

			const entriesRes = await contentApi.getEntries(schema.value!.id)

			if (entriesRes.data) {
				entries.value = entriesRes.data

				// Singleton logic: auto-redirect to editor
				if (schema.value.isSingleton) {
					if (entries.value.length === 1) {
						goToEdit(entries.value[0].id)

						return
					} else if (entries.value.length === 0) {
						goToCreate()

						return
					}
				}
			}
		}
	} catch (error: any) {
		ElMessage.error(error.messages?.[0] || 'Failed to fetch content')
	} finally {
		isLoading.value = false
	}
}

const goToCreate = () => {
	router.push({ name: 'EntryCreate', params: { schemaIdentifier } })
}

const goToEdit = (id: string) => {
	router.push({ name: 'EntryEdit', params: { schemaIdentifier, id } })
}

const onDelete = async (id: string) => {
	try {
		await contentApi.deleteEntry(id)

		ElMessage.success('Entry deleted')

		fetchData()
	} catch (error: any) {
		ElMessage.error(error.messages?.[0] || 'Failed to delete entry')
	}
}

const fileInput = ref<HTMLInputElement | null>(null)

const onExport = () => {
	const data = JSON.stringify(entries.value, null, 2)
	const blob = new Blob([data], { type: 'application/json' })
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')

	a.href = url

	a.download = `${schemaIdentifier}-export-${new Date().toISOString().split('T')[0]}.json`

	a.click()

	URL.revokeObjectURL(url)

	ElMessage.success('Export started')
}

const triggerImport = () => {
	fileInput.value?.click()
}

const onImport = async (event: any) => {
	const file = event.target.files?.[0]

	if (!file || !schema.value) return

	const reader = new FileReader()

	reader.onload = async (e) => {
		try {
			const importedData = JSON.parse(e.target?.result as string)

			if (!Array.isArray(importedData)) {
				throw new Error('Imported data must be an array of entries')
			}

			let successCount = 0

			for (const item of importedData) {
				try {
					await contentApi.createEntry({
						schema_id: schema.value!.id,
						slug: item.slug || `imported-${Date.now()}-${successCount}`,
						data: item.data,
					})

					successCount++
				} catch {
					// Error handled per item if needed
				}
			}

			ElMessage.success(`Successfully imported ${successCount} entries`)

			fetchData()
		} catch (err: any) {
			ElMessage.error(`Import failed: ${err.message}`)
		} finally {
			if (fileInput.value) fileInput.value.value = ''
		}
	}

	reader.readAsText(file)
}

onMounted(fetchData)
</script>

<style scoped>
.content-page {
	min-height: 100vh;
	color: var(--text-primary);
	background-color: var(--bg-page);
	transition: all 0.3s ease;
	padding: 32px;
}

.page-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 32px;
}

.page-header h1 {
	font-weight: 800;
	font-size: 32px;
	letter-spacing: -0.02em;
	color: var(--text-primary);
	margin: 0;
}

.header-right {
	display: flex;
	align-items: center;
	gap: 12px;
}
</style>
