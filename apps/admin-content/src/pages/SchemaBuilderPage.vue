<template>
	<div class="schema-builder-page" :class="{ 'is-dark': isDark }">
		<div class="page-header">
			<h1>Content Schemas</h1>
			<el-button :icon="Plus" type="primary" @click="handleAddSchema"> Create Schema </el-button>
		</div>

		<div class="page-content">
			<el-table v-loading="loading" border class="premium-table" :data="schemas">
				<el-table-column label="Name" prop="name" />
				<el-table-column label="Slug" prop="slug" />
				<el-table-column label="Fields count">
					<template #default="scope">
						<el-tag size="small" type="info">{{ scope.row.fields?.length || 0 }} fields</el-tag>
					</template>
				</el-table-column>
				<el-table-column label="Actions" width="280">
					<template #default="scope">
						<div class="action-buttons">
							<el-button :icon="Document" plain size="small" type="success" @click="goToEntries(scope.row.slug)">
								Entries
							</el-button>
							<el-button :icon="Edit" plain size="small" @click="handleEditSchema(scope.row)"> Edit </el-button>
							<el-button :icon="Delete" plain size="small" type="danger" @click="deleteSchema(scope.row.id)">
								Delete
							</el-button>
						</div>
					</template>
				</el-table-column>
			</el-table>
		</div>

		<el-dialog
			v-model="dialogVisible"
			class="premium-dialog"
			:title="isEdit ? 'Edit Schema' : 'Create Schema'"
			width="800px"
		>
			<el-form label-position="top" :model="form">
				<div class="form-grid">
					<el-form-item label="Schema Name">
						<el-input v-model="form.name" placeholder="e.g. Products" />
					</el-form-item>
					<el-form-item label="Identifier (Slug)">
						<el-input v-model="form.slug" placeholder="e.g. products" />
					</el-form-item>
				</div>

				<div class="fields-section">
					<div class="fields-header">
						<h3>Fields Configuration</h3>
						<el-button :icon="Plus" size="small" type="success" @click="addField"> Add Field </el-button>
					</div>

					<el-table border :data="form.fields" style="width: 100%">
						<el-table-column label="Label" min-width="150">
							<template #default="scope">
								<el-input v-model="scope.row.label" placeholder="Field Label" size="small" />
							</template>
						</el-table-column>
						<el-table-column label="Identifier" min-width="150">
							<template #default="scope">
								<el-input v-model="scope.row.name" placeholder="field_name" size="small" />
							</template>
						</el-table-column>
						<el-table-column label="Type" width="160">
							<template #default="scope">
								<el-select v-model="scope.row.fieldType" size="small">
									<el-option v-for="item in fieldTypes" :key="item.value" :label="item.label" :value="item.value" />
								</el-select>
							</template>
						</el-table-column>
						<el-table-column label="Settings" width="120">
							<template #default="scope">
								<el-checkbox v-model="scope.row.required" label="Req" />
							</template>
						</el-table-column>
						<el-table-column label="" width="60">
							<template #default="scope">
								<el-button circle :icon="Delete" size="small" type="danger" @click="removeField(scope.$index)" />
							</template>
						</el-table-column>
					</el-table>
				</div>
			</el-form>
			<template #footer>
				<div class="dialog-footer">
					<el-button @click="dialogVisible = false">Cancel</el-button>
					<el-button :loading="saving" type="primary" @click="saveSchema">Save Schema</el-button>
				</div>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import type { ContentSchema, FieldDefinition } from '@admin-panel/lib'
import { createApi } from '@admin-panel/lib'
import { FieldType } from '@admin-panel/lib'
import { useTheme } from '@admin-panel/ui'
import { Delete, Document, Edit, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const { fetchData: apiFetch } = createApi('content/schemas')
const { isDark } = useTheme()

const schemas = ref<ContentSchema[]>([])
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentSchemaId = ref('')

const form = reactive({
	name: '',
	slug: '',
	fields: [] as FieldDefinition[],
})

const fieldTypes = [
	{ label: 'Text', value: FieldType.Text },
	{ label: 'Rich Text', value: FieldType.RichText },
	{ label: 'Number', value: FieldType.Number },
	{ label: 'Boolean', value: FieldType.Boolean },
	{ label: 'Media', value: FieldType.Media },
	{ label: 'Date', value: FieldType.Date },
]

const goToEntries = (slug: string) => {
	router.push({ name: 'EntriesList', params: { schemaIdentifier: slug } })
}

const fetchSchemas = async () => {
	loading.value = true

	try {
		const response = await apiFetch<ContentSchema[]>('')

		if (response.data) schemas.value = response.data
	} catch {
		ElMessage.error('Failed to fetch schemas')
	} finally {
		loading.value = false
	}
}

const handleAddSchema = () => {
	isEdit.value = false

	form.name = ''

	form.slug = ''

	form.fields = []

	dialogVisible.value = true
}

const handleEditSchema = (schema: ContentSchema) => {
	isEdit.value = true

	currentSchemaId.value = schema.id

	form.name = schema.name

	form.slug = schema.slug

	form.fields = JSON.parse(JSON.stringify(schema.fields))

	dialogVisible.value = true
}

const addField = () => {
	form.fields.push({
		label: '',
		name: '',
		fieldType: FieldType.Text,
		required: false,
		multiple: false,
	})
}

const removeField = (index: number) => {
	form.fields.splice(index, 1)
}

const saveSchema = async () => {
	saving.value = true

	try {
		if (isEdit.value) {
			await apiFetch(`/${currentSchemaId.value}`, {
				method: 'PATCH',
				body: form,
			})

			ElMessage.success('Schema updated')
		} else {
			await apiFetch('', {
				method: 'POST',
				body: form,
			})

			ElMessage.success('Schema created')
		}

		dialogVisible.value = false

		fetchSchemas()
	} catch (error: any) {
		ElMessage.error(error.messages?.[0] || 'Failed to save schema')
	} finally {
		saving.value = false
	}
}

const deleteSchema = async (id: string) => {
	try {
		await ElMessageBox.confirm('Permanent delete schema and ALL entries?', 'Warning', {
			confirmButtonText: 'Delete',
			cancelButtonText: 'Cancel',
			type: 'warning',
		})

		await apiFetch(`/${id}`, { method: 'DELETE' })

		ElMessage.success('Schema deleted')

		fetchSchemas()
	} catch (error) {
		if (error !== 'cancel') ElMessage.error('Delete failed')
	}
}

onMounted(fetchSchemas)
</script>

<style scoped>
.schema-builder-page {
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
	color: var(--text-primary);
}

.premium-table {
	border: 1px solid var(--border-color);
	border-radius: 16px;
	background-color: var(--bg-card) !important;
}

.form-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 20px;
}

.fields-section {
	border-top: 1px solid var(--border-color);
	padding-top: 24px;
	margin-top: 32px;
}

.fields-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16px;
}

.fields-header h3 {
	font-weight: 700;
	font-size: 16px;
	margin: 0;
}

.action-buttons {
	display: flex;
	gap: 8px;
}
</style>
