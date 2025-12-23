<template>
	<el-dialog
		:title="isEditing ? 'Edit translation' : 'Add translation'"
		v-model="isModalOpen"
		width="500px"
		@closed="closeModal"
	>
		<el-form ref="formRef" :model="form" :rules="rules" label-width="100px" @submit.prevent>
			<el-form-item label="Namespace" prop="namespace">
				<el-select v-model="form.namespace" filterable clearable placeholder="Select namespace" style="width: 100%">
					<el-option v-for="ns in namespaces" :key="ns" :label="ns" :value="ns" />
				</el-select>
			</el-form-item>

			<el-form-item label="Language" prop="language">
				<el-select v-model="form.language" filterable clearable placeholder="Select language" style="width: 100%">
					<el-option v-for="lang in languages" :key="lang" :label="lang" :value="lang" />
				</el-select>
			</el-form-item>

			<el-form-item label="Key" prop="key">
				<el-input v-model="form.key" placeholder="e.g. common.save" />
			</el-form-item>

			<el-form-item label="Value" prop="value">
				<el-input v-model="form.value" type="textarea" :rows="3" />
			</el-form-item>
		</el-form>

		<template #footer>
			<el-button @click="closeModal">Cancel</el-button>
			<el-button type="primary" :loading="isSubmitting" @click="submitForm">
				{{ isEditing ? 'Save' : 'Add' }}
			</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useTranslations } from '@/entities/translation/lib/composables'

const { isModalOpen, editingTranslation, closeModal, handleSubmit } = useTranslations()

const formRef = ref<FormInstance>()
const isSubmitting = computed(() => /* можно добавить логику из мутаций, но для простоты — false */ false)

const form = ref({
	namespace: '',
	language: '',
	key: '',
	value: '',
})

const isEditing = computed(() => !!editingTranslation.value?.id)

watch(
	() => isModalOpen.value,
	(isOpen) => {
		if (isOpen && editingTranslation.value) {
			form.value = { ...editingTranslation.value }
		} else {
			form.value = { namespace: '', language: '', key: '', value: '' }
		}
	}
)

const namespaces = ['common', 'auth', 'profile', 'admin']
const languages = ['ru', 'en', 'es', 'fr']

const rules = ref<FormRules>({
	namespace: [{ required: true, message: 'Required', trigger: 'blur' }],
	language: [{ required: true, message: 'Required', trigger: 'blur' }],
	key: [{ required: true, message: 'Required', trigger: 'blur' }],
	value: [{ required: true, message: 'Required', trigger: 'blur' }],
})

const submitForm = async () => {
	await formRef.value?.validate()

	handleSubmit(form.value)
}
</script>
