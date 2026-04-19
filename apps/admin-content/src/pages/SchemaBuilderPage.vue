<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Edit } from '@element-plus/icons-vue'
import { createApi } from '@admin-panel/lib'

interface FieldDefinition {
	name: string
	label: string
	fieldType: string
	required: boolean
	multiple: boolean
	relationTo?: string
}

interface ContentSchema {
	id: string
	name: string
	slug: string
	fields: FieldDefinition[]
	createdAt: string
}

const { fetchData: apiFetch } = createApi('content/schemas')

const schemas = ref<ContentSchema[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentSchemaId = ref('')

const form = reactive({
	name: '',
	slug: '',
	fields: [] as FieldDefinition[],
})

const fieldTypes = [
	{ label: 'Text', value: 'text' },
	{ label: 'Rich Text', value: 'rich_text' },
	{ label: 'Number', value: 'number' },
	{ label: 'Boolean', value: 'boolean' },
	{ label: 'Media', value: 'media' },
	{ label: 'Date', value: 'date' },
	{ label: 'Relation', value: 'relation' },
]

const fetchSchemas = async () => {
	loading.value = true

	try {
		const response = await apiFetch<ContentSchema[]>('')

		if (response?.data) {
			schemas.value = response.data
		}
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
		name: '',
		label: '',
		fieldType: 'text',
		required: false,
		multiple: false,
	})
}

const removeField = (index: number) => {
	form.fields.splice(index, 1)
}

const saveSchema = async () => {
	try {
		if (isEdit.value) {
			await apiFetch(`/${currentSchemaId.value}`, {
				method: 'PATCH',
				body: form,
			})

			ElMessage.success('Schema updated successfully')
		} else {
			await apiFetch('', {
				method: 'POST',
				body: form,
			})

			ElMessage.success('Schema created successfully')
		}

		dialogVisible.value = false

		fetchSchemas()
	} catch {
		ElMessage.error('Failed to save schema')
	}
}

const deleteSchema = async (id: string) => {
	try {
		await ElMessageBox.confirm('Are you sure you want to delete this schema?', 'Warning', {
			type: 'warning',
		})

		await apiFetch(`/${id}`, {
			method: 'DELETE',
		})

		ElMessage.success('Schema deleted successfully')

		fetchSchemas()
	} catch (error) {
		if (error !== 'cancel') {
			ElMessage.error('Failed to delete schema')
		}
	}
}

onMounted(fetchSchemas)
</script>

<template>
	<div class="schema-builder">
		<div class="header">
			<h1>Content Schemas</h1>
			<el-button type="primary" :icon="Plus" @click="handleAddSchema"> Create Schema </el-button>
		</div>

		<el-table :data="schemas" v-loading="loading" style="width: 100%">
			<el-table-column prop="name" label="Name" />
			<el-table-column prop="slug" label="Slug" />
			<el-table-column label="Fields count">
				<template #default="scope">
					{{ scope.row.fields?.length || 0 }}
				</template>
			</el-table-column>
			<el-table-column label="Actions" width="200">
				<template #default="scope">
					<el-button :icon="Edit" size="small" @click="handleEditSchema(scope.row)"> Edit </el-button>
					<el-button :icon="Delete" size="small" type="danger" @click="deleteSchema(scope.row.id)"> Delete </el-button>
				</template>
			</el-table-column>
		</el-table>

		<el-dialog v-model="dialogVisible" :title="isEdit ? 'Edit Schema' : 'Create Schema'" width="60%">
			<el-form :model="form" label-width="100px">
				<el-form-item label="Name">
					<el-input v-model="form.name" placeholder="e.g. Products" />
				</el-form-item>
				<el-form-item label="Slug">
					<el-input v-model="form.slug" placeholder="e.g. products" />
				</el-form-item>

				<div class="fields-section">
					<div class="fields-header">
						<h3>Fields</h3>
						<el-button type="success" size="small" :icon="Plus" @click="addField"> Add Field </el-button>
					</div>

					<el-table :data="form.fields" border style="width: 100%">
						<el-table-column label="Label">
							<template #default="scope">
								<el-input v-model="scope.row.label" size="small" />
							</template>
						</el-table-column>
						<el-table-column label="Name">
							<template #default="scope">
								<el-input v-model="scope.row.name" size="small" />
							</template>
						</el-table-column>
						<el-table-column label="Type" width="150">
							<template #default="scope">
								<el-select v-model="scope.row.fieldType" size="small">
									<el-option v-for="item in fieldTypes" :key="item.value" :label="item.label" :value="item.value" />
								</el-select>
							</template>
						</el-table-column>
						<el-table-column label="Settings" width="150">
							<template #default="scope">
								<el-checkbox v-model="scope.row.required" label="Req" />
								<el-checkbox v-model="scope.row.multiple" label="Mult" />
							</template>
						</el-table-column>
						<el-table-column label="" width="60">
							<template #default="scope">
								<el-button type="danger" size="small" :icon="Delete" circle @click="removeField(scope.$index)" />
							</template>
						</el-table-column>
					</el-table>
				</div>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="dialogVisible = false">Cancel</el-button>
					<el-button type="primary" @click="saveSchema">Save</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<style scoped>
.header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20px;
}

.fields-section {
	border-top: 1px solid #eee;
	padding-top: 20px;
	margin-top: 30px;
}

.fields-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 15px;
}

.fields-header h3 {
	margin: 0;
}
</style>
