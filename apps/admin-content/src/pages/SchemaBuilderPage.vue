<template>
	<div class="schema-builder-page" :class="{ 'is-dark': isDark }">
		<div class="page-header">
			<h1>Content Schemas</h1>
			<el-button :icon="Plus" type="primary" @click="handleAddSchema"> Create Schema </el-button>
		</div>

		<div class="page-content">
			<UiTable v-loading="loading" border :data="schemas">
				<el-table-column label="Name" prop="name" />
				<el-table-column label="Slug" prop="slug" />
				<el-table-column label="Fields count">
					<template #default="scope">
						<el-tag size="small" type="info">{{ scope.row.fields?.length || 0 }} fields</el-tag>
						<el-tag v-if="scope.row.isSingleton" size="small" style="margin-left: 8px" type="warning">Singleton</el-tag>
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
			</UiTable>
		</div>

		<UiModal v-model="dialogVisible" :title="isEdit ? 'Edit Schema' : 'Create Schema'" width="800px">
			<el-form label-position="top" :model="form">
				<div class="form-grid">
					<el-form-item label="Schema Name">
						<el-input v-model="form.name" placeholder="e.g. Products" />
					</el-form-item>
					<el-form-item label="Identifier (Slug)">
						<el-input v-model="form.slug" placeholder="e.g. products" />
					</el-form-item>
					<el-form-item label="Settings" style="display: flex; align-items: flex-end">
						<el-checkbox v-model="form.isSingleton" label="Singleton (Single entry)" />
					</el-form-item>
				</div>

				<div class="fields-section">
					<div class="fields-header">
						<h3>Fields Configuration</h3>
						<el-button :icon="Plus" size="small" type="success" @click="addField"> Add Field </el-button>
					</div>

					<div class="fields-list">
						<div
							v-for="(field, index) in form.fields"
							:key="index"
							class="field-item"
							draggable="true"
							@dragstart="handleDragStart(index)"
							@dragover.prevent
							@drop="handleDrop(index)"
						>
							<div class="field-drag-handle">
								<el-icon><Operation /></el-icon>
							</div>

							<div class="field-inputs">
								<el-input v-model="field.label" placeholder="Label" size="small" />
								<el-input v-model="field.name" placeholder="identifier" size="small" />
								<el-select v-model="field.fieldType" size="small" style="width: 140px">
									<el-option v-for="item in fieldTypes" :key="item.value" :label="item.label" :value="item.value" />
								</el-select>
								<el-checkbox v-model="field.required" label="Required" size="small" />
							</div>

							<el-button circle :icon="Delete" size="small" type="danger" @click="removeField(index)" />
						</div>

						<div v-if="form.fields.length === 0" class="fields-empty">
							No fields added yet. Click "Add Field" to start.
						</div>
					</div>
				</div>
			</el-form>
			<template #footer>
				<div class="dialog-footer">
					<el-button @click="dialogVisible = false">Cancel</el-button>
					<el-button :loading="saving" type="primary" @click="saveSchema">Save Schema</el-button>
				</div>
			</template>
		</UiModal>
	</div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import type { ContentSchema, FieldDefinition } from '@admin-panel/lib'
import { createApi, FieldType } from '@admin-panel/lib'
import { UiModal, UiTable, useTheme } from '@admin-panel/ui'
import { Delete, Document, Edit, Operation, Plus } from '@element-plus/icons-vue'
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
	isSingleton: false,
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

	form.isSingleton = false

	form.fields = []

	dialogVisible.value = true
}

const handleEditSchema = (schema: ContentSchema) => {
	isEdit.value = true

	currentSchemaId.value = schema.id

	form.name = schema.name

	form.slug = schema.slug

	form.isSingleton = !!schema.isSingleton

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

const dragIndex = ref<number | null>(null)

const handleDragStart = (index: number) => {
	dragIndex.value = index
}

const handleDrop = (index: number) => {
	if (dragIndex.value === null) return

	const item = form.fields.splice(dragIndex.value, 1)[0]

	form.fields.splice(index, 0, item)

	dragIndex.value = null
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

<style scoped lang="scss">
.schema-builder-page {
	min-height: 100vh;
	padding: 32px;
}

.page-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 32px;

	h1 {
		font-weight: 800;
		font-size: 2rem;
		letter-spacing: -0.02em;
		color: var(--gp-text-main);
		margin: 0;
	}
}

.page-content {
	border: 1px solid var(--gp-glass-border-inner);
	border-radius: var(--gp-radius-md);
	box-shadow: var(--gp-glass-shadow);
	background: var(--gp-glass-gradient);
	background-color: var(--gp-bg-glass);
	padding: 1px;
	overflow: hidden;
}

.form-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	margin-bottom: 32px;
	gap: 24px;
}

.fields-section {
	border-top: 1px solid var(--gp-glass-border);
	padding-top: 24px;
	margin-top: 32px;
}

.fields-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20px;

	h3 {
		font-weight: 700;
		font-size: 1.1rem;
		color: var(--gp-text-main);
		margin: 0;
	}
}

.action-buttons {
	display: flex;
	gap: 8px;
}

.fields-list {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.field-item {
	display: flex;
	align-items: center;
	border: 1px solid var(--gp-glass-border);
	border-radius: var(--gp-radius-sm);
	background: var(--gp-bg-glass-hover);
	transition: all 0.2s ease;
	cursor: grab;
	padding: 12px;
	gap: 16px;

	&:hover {
		border-color: var(--gp-primary-light);
		box-shadow: var(--gp-glass-shadow);
	}

	&:active {
		cursor: grabbing;
	}
}

.field-drag-handle {
	font-size: 18px;
	color: var(--gp-text-secondary);
	cursor: grab;
}

.field-inputs {
	display: flex;
	flex: 1;
	align-items: center;
	gap: 12px;
}

.fields-empty {
	border: 2px dashed var(--gp-glass-border);
	border-radius: var(--gp-radius-md);
	text-align: center;
	color: var(--gp-text-secondary);
	padding: 40px;
}

:deep(.el-table) {
	background: transparent !important;

	tr {
		background: transparent !important;
	}

	.el-table__inner-wrapper::before {
		display: none;
	}
}
</style>
