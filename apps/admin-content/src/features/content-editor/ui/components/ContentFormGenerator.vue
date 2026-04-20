<template>
	<div class="content-form-generator" :class="{ 'is-dark': isDark }">
		<el-form label-position="top" :model="modelValue">
			<el-form-item
				v-for="field in fields"
				:key="field.name"
				:label="field.label"
				:prop="field.name"
				:rules="field.required ? [{ required: true, message: `${field.label} is required` }] : []"
			>
				<!-- Text / RichText -->
				<template v-if="field.fieldType === FieldType.Text || field.fieldType === FieldType.RichText">
					<el-input
						v-model="modelValue[field.name]"
						:placeholder="field.label"
						:rows="field.fieldType === FieldType.RichText ? 4 : 1"
						:type="field.fieldType === FieldType.RichText ? 'textarea' : 'text'"
					/>
				</template>

				<!-- Number -->
				<template v-else-if="field.fieldType === FieldType.Number">
					<el-input-number v-model="modelValue[field.name]" :placeholder="field.label" style="width: 100%" />
				</template>

				<!-- Boolean -->
				<template v-else-if="field.fieldType === FieldType.Boolean">
					<el-switch v-model="modelValue[field.name]" />
				</template>

				<!-- Media -->
				<template v-else-if="field.fieldType === FieldType.Media">
					<UiMediaPicker v-model="modelValue[field.name]" />
				</template>

				<!-- Date -->
				<template v-else-if="field.fieldType === FieldType.Date">
					<el-date-picker v-model="modelValue[field.name]" placeholder="Pick a date" style="width: 100%" type="date" />
				</template>

				<!-- Fallback -->
				<template v-else>
					<div class="unsupported-type">
						Unsupported type: {{ field.fieldType }}
						<span style="font-size: 10px; opacity: 0.5">
							(Raw: {{ (field as any).field_type }}, Name: {{ field.name }})
						</span>
					</div>
				</template>

				<div v-if="errors?.[field.name]" class="field-error">
					{{ errors[field.name][0] }}
				</div>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import type { FieldDefinition } from '@admin-panel/lib'
import { FieldType } from '@admin-panel/lib'
import { useTheme } from '@admin-panel/ui'
import { UiMediaPicker } from '@admin-panel/ui'

const modelValue = defineModel<Record<string, any>>({ required: true })

interface Props {
	fields: FieldDefinition[]
	errors?: Record<string, string[]>
}

defineProps<Props>()

const { isDark } = useTheme()
</script>

<style scoped>
.content-form-generator {
	width: 100%;
}

.unsupported-type {
	border: 1px dashed var(--border-color);
	border-radius: 4px;
	font-size: 12px;
	color: var(--text-muted);
	padding: 8px;
}

.field-error {
	font-size: 12px;
	color: var(--el-color-danger);
	margin-top: 4px;
}

:deep(.el-form-item__label) {
	font-weight: 600;
	color: var(--text-primary);
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
	box-shadow: 0 0 0 1px var(--border-color) inset !important;
	background-color: var(--bg-surface) !important;
}

:deep(.el-input__inner),
:deep(.el-textarea__inner) {
	color: var(--text-primary) !important;
}
</style>
