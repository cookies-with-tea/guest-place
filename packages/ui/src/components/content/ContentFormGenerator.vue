<template>
	<div class="content-form-generator">
		<div v-for="field in fields" :key="field.name" class="content-form-generator__field">
			<label :for="field.name" class="content-form-generator__label">
				{{ field.label }}
				<span v-if="field.required" class="content-form-generator__required">*</span>
			</label>

			<div class="content-form-generator__input-wrapper">
				<template v-if="field.fieldType === FieldType.Text">
					<UiInput :id="field.name" v-model="formData[field.name]" :placeholder="field.label" />
				</template>

				<template v-else-if="field.fieldType === FieldType.RichText">
					<textarea
						:id="field.name"
						v-model="formData[field.name]"
						class="content-form-generator__textarea"
						:placeholder="field.label"
					></textarea>
				</template>

				<template v-else-if="field.fieldType === FieldType.Number">
					<UiInput
						:id="field.name"
						v-model.number="formData[field.name]"
						type="text"
						:placeholder="field.label"
						@update:model-value="onNumberInput(field.name, $event)"
					/>
				</template>

				<template v-else-if="field.fieldType === FieldType.Boolean">
					<input :id="field.name" v-model="formData[field.name]" type="checkbox" />
				</template>

				<template v-else-if="field.fieldType === FieldType.Media">
					<UiMediaPicker v-model="formData[field.name]" />
				</template>

				<!-- Fallback for unsupported types -->
				<template v-else>
					<div class="content-form-generator__unsupported"> Unsupported field type: {{ field.fieldType }} </div>
				</template>
			</div>

			<div v-if="errors?.[field.name]" class="content-form-generator__error">
				{{ errors[field.name][0] }}
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { reactive, watch } from 'vue'

import type { FieldDefinition } from '@admin-panel/lib'
import { FieldType } from '@admin-panel/lib'

import UiInput from '../ui-input'
import UiMediaPicker from '../ui-media-picker'

interface IProps {
	fields: FieldDefinition[]
	modelValue: Record<string, any>
	errors?: Record<string, string[]>
}

const props = defineProps<IProps>()

const emit = defineEmits<{
	(e: 'update:modelValue', value: Record<string, any>): void
}>()

const formData = reactive({ ...props.modelValue })

// Initialize default values for missing fields
props.fields.forEach((field) => {
	if (formData[field.name] === undefined) {
		formData[field.name] = field.defaultValue ?? getDefaultValue(field.fieldType)
	}
})

watch(
	formData,
	(newValue) => {
		emit('update:modelValue', { ...newValue })
	},
	{ deep: true }
)

watch(
	() => props.modelValue,
	(newValue) => {
		Object.assign(formData, newValue)
	},
	{ deep: true }
)

function getDefaultValue(type: FieldType) {
	switch (type) {
		case FieldType.Boolean:
			return false
		case FieldType.Number:
			return 0
		case FieldType.Media:
			return null
		default:
			return ''
	}
}

function onNumberInput(name: string, value: string) {
	const num = parseFloat(value)

	if (!isNaN(num)) {
		formData[name] = num
	}
}
</script>

<style scoped lang="scss">
.content-form-generator {
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.content-form-generator__field {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.content-form-generator__label {
	font-weight: 500;
	font-size: 14px;
	color: #344054;
}

.content-form-generator__required {
	color: #f04438;
	margin-left: 2px;
}

.content-form-generator__textarea {
	width: 100%;
	min-height: 120px;
	border: 1px solid #d0d5dd;
	border-radius: 8px;
	font-family: inherit;
	resize: vertical;
	padding: 10px 12px;

	&:focus {
		outline: none;
		border-color: #7f56d9;
		box-shadow: 0 0 0 4px rgb(158, 119, 237, 0.1);
	}
}

.content-form-generator__error {
	font-size: 12px;
	color: #f04438;
	margin-top: 4px;
}

.content-form-generator__unsupported {
	border: 1px dashed #d0d5dd;
	border-radius: 6px;
	font-size: 12px;
	color: #667085;
	background: #f9fafb;
	padding: 8px;
}
</style>
