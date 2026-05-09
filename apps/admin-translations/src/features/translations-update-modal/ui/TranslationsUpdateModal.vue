<template>
	<UiModal
		v-model="isModalOpen"
		:title="isEditing ? 'Edit translation' : 'Add translation'"
		width="600px"
		@close="closeModal"
	>
		<el-form ref="formRef" label-width="120px" :model="form" :rules="rules" @submit.prevent>
			<el-form-item label="Namespace" prop="namespace">
				<el-select v-model="form.namespace" clearable filterable placeholder="Select namespace" style="width: 100%">
					<el-option v-for="ns in allNamespaces" :key="ns" :label="ns" :value="ns" />
				</el-select>
			</el-form-item>

			<el-form-item label="Locale" prop="locale">
				<el-select v-model="form.locale" clearable filterable placeholder="Select locale" style="width: 100%">
					<el-option v-for="lang in allLanguages" :key="lang" :label="lang" :value="lang" />
				</el-select>
			</el-form-item>

			<template v-if="!isEditing">
				<el-form-item label="Bulk mode">
					<el-switch v-model="isBulkMode" />
					<span class="bulk-hint"> (Max 20 items, format: key: value)</span>
				</el-form-item>
			</template>

			<template v-if="isBulkMode && !isEditing">
				<el-form-item label="Translations" prop="bulkValue">
					<el-input
						v-model="form.bulkValue"
						placeholder="common.save: Сохранить&#10;common.cancel: Отмена"
						:rows="10"
						type="textarea"
					/>
				</el-form-item>
			</template>
			<template v-else>
				<el-form-item label="Key" prop="key">
					<el-input v-model="form.key" placeholder="e.g. common.save" />
				</el-form-item>

				<el-form-item label="Value" prop="value">
					<el-input v-model="form.value" :rows="3" type="textarea" />
				</el-form-item>
			</template>
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
import { ElMessage } from 'element-plus'

import { useTranslations } from '#entities/translation/lib/composables'

const {
	isModalOpen,
	isSubmitting,
	editingTranslation,
	closeModal,
	handleSubmit,
	allNamespaces,
	allLanguages,
	filters,
} = useTranslations()

const formRef = ref<FormInstance>()
const isBulkMode = ref(false)

const form = ref({
	namespace: '',
	locale: '',
	key: '',
	value: '',
	bulkValue: '',
})

const isEditing = computed(() => !!editingTranslation.value?.id)

watch(
	() => isModalOpen.value,
	(isOpen) => {
		isBulkMode.value = false

		if (isOpen && editingTranslation.value) {
			form.value = {
				namespace: editingTranslation.value.namespace || '',
				locale: (editingTranslation.value as any).locale || '',
				key: editingTranslation.value.key,
				value: editingTranslation.value.value,
				bulkValue: '',
			}
		} else {
			form.value = {
				namespace: filters.value.namespace || '',
				locale: filters.value.locale || '',
				key: '',
				value: '',
				bulkValue: '',
			}
		}
	}
)

const rules = computed<FormRules>(() => ({
	namespace: [{ required: true, message: 'Required', trigger: 'blur' }],
	locale: [{ required: true, message: 'Required', trigger: 'blur' }],
	key: [{ required: !isBulkMode.value, message: 'Required', trigger: 'blur' }],
	value: [{ required: !isBulkMode.value, message: 'Required', trigger: 'blur' }],
	bulkValue: [{ required: isBulkMode.value, message: 'Required', trigger: 'blur' }],
}))

const submitForm = async () => {
	await formRef.value?.validate()

	if (isBulkMode.value && !isEditing.value) {
		const lines = form.value.bulkValue.split('\n').filter((l) => l.trim().length > 0)

		if (lines.length > 20) {
			ElMessage.warning('Maximum 20 items allowed at once')

			return
		}

		const batch = lines
			.map((line) => {
				const separatorIndex = line.indexOf(':')

				if (separatorIndex === -1) return null

				const rawKey = line.substring(0, separatorIndex).trim()
				const value = line.substring(separatorIndex + 1).trim()

				if (!rawKey || !value) return null

				// Auto-detect namespace from key prefix if it contains a dot
				let ns = form.value.namespace

				if (rawKey.includes('.')) {
					ns = rawKey.split('.')[0]
				}

				return {
					namespace: ns,
					locale: form.value.locale,
					key: rawKey,
					value,
				}
			})
			.filter(Boolean) as any[]

		if (batch.length === 0) {
			ElMessage.error('Invalid bulk format. Use key: value')

			return
		}

		handleSubmit(batch)
	} else {
		handleSubmit({
			...(editingTranslation.value || {}),
			namespace: form.value.namespace,
			locale: form.value.locale,
			key: form.value.key,
			value: form.value.value,
		} as any)
	}
}
</script>

<style scoped>
.bulk-hint {
	font-size: 12px;
	color: var(--el-text-color-secondary);
	margin-left: 8px;
}
</style>
