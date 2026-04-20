<template>
	<div class="content-page" :class="{ 'is-dark': isDark }">
		<div class="page-header">
			<h1>{{ schema?.name || 'Content' }}</h1>
			<el-button :icon="Plus" type="primary" @click="goToCreate"> Add Entry </el-button>
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
</style>
