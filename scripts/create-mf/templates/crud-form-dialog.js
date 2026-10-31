export function getCrudFormDialog(entitySingular, entityPlural, entityPluralCamel) {
	return `<template>
	<el-dialog
		v-model="${entityPluralCamel}.isDialogOpen"
		:title="${entityPluralCamel}.editingId ? 'Edit ${entitySingular}' : 'Create ${entitySingular}'"
		width="480px"
	>
		<el-form label-position="top">
			<el-form-item label="Name">
				<el-input v-model="${entityPluralCamel}.form.name" placeholder="Name..." />
			</el-form-item>

			<el-form-item label="Description">
				<el-input v-model="${entityPluralCamel}.form.description" type="textarea" :rows="3" placeholder="Description..." />
			</el-form-item>

			<el-form-item label="Status">
				<el-radio-group v-model="${entityPluralCamel}.form.status">
					<el-radio label="active">Active</el-radio>
					<el-radio label="inactive">Inactive</el-radio>
				</el-radio-group>
			</el-form-item>
		</el-form>

		<template #footer>
			<el-button @click="${entityPluralCamel}.isDialogOpen = false">Cancel</el-button>
			<el-button type="primary" :disabled="!${entityPluralCamel}.form.name.trim()" @click="${entityPluralCamel}.confirmSave">
				{{ ${entityPluralCamel}.editingId ? 'Save changes' : 'Create' }}
			</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import type { ${entityPlural}Data } from '../../composables/use${entityPlural}Data'

defineProps<{
	${entityPluralCamel}: ${entityPlural}Data
}>()
</script>
`
}
