<template>
	<UiModal
		v-model="isModalOpen"
		:title="isEditing ? 'Edit translation' : 'Add translation'"
		width="500px"
		@close="closeModal"
	>
		<el-form ref="formRef" label-width="100px" :model="form" :rules="rules" @submit.prevent>
			<el-form-item label="Namespace" prop="namespace">
				<el-select v-model="form.namespace" clearable filterable placeholder="Select namespace" style="width: 100%">
					<el-option v-for="ns in namespaces" :key="ns" :label="ns" :value="ns" />
				</el-select>
			</el-form-item>

			<el-form-item label="Language" prop="language">
				<el-select v-model="form.language" clearable filterable placeholder="Select language" style="width: 100%">
					<el-option v-for="lang in languages" :key="lang" :label="lang" :value="lang" />
				</el-select>
			</el-form-item>

			<el-form-item label="Key" prop="key">
				<el-input v-model="form.key" placeholder="e.g. common.save" />
			</el-form-item>

			<el-form-item label="Value" prop="value">
				<el-input v-model="form.value" :rows="3" type="textarea" />
			</el-form-item>
		</el-form>

		<template #footer>
			<el-button @click="closeModal">Cancel</el-button>
			<el-button :loading="isSubmitting" type="primary" @click="submitForm">
				{{ isEditing ? 'Save' : 'Add' }}
			</el-button>
		</template>
	</UiModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { UiModal } from '@admin-panel/ui'
import type { FormInstance, FormRules } from 'element-plus'

import { useTranslations } from '#entities/translation/lib/composables'

const { isModalOpen, editingTranslation, closeModal, handleSubmit } = useTranslations()

const formRef = ref<FormInstance>()
const isSubmitting = computed(() => false)

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
