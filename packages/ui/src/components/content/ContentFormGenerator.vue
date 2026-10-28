<template>
	<div class="content-form-generator">
		<div v-for="field in fields" :key="field.name" class="content-form-generator__field">
			<label :for="field.name" class="content-form-generator__label">
				{{ field.label }}
				<span v-if="field.required" class="content-form-generator__required">*</span>
			</label>

			<div class="content-form-generator__control">
				<ContentFieldControl
					v-model="modelValue[field.name]"
					:field="field"
					:readonly="readonly"
					:translation-namespace="translationNamespace"
				>
					<!-- @vue-ignore: vue-tsc can't resolve this dynamically-named forwarded slot's prop type (TS7022) without a real runtime effect -->
					<template v-for="(_, slotName) in $slots" #[slotName]="slotScope" :key="slotName">
						<slot :name="slotName" v-bind="slotScope as object" />
					</template>
				</ContentFieldControl>
			</div>

			<div v-if="errors?.[field.name]" class="content-form-generator__error">
				{{ errors[field.name][0] }}
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { watch } from 'vue'

import type { FieldDefinition } from '@admin-panel/lib'
import { FieldType } from '@admin-panel/lib'

import ContentFieldControl from './ContentFieldControl.vue'
import { getDefaultValue } from './fieldDefaults'

defineOptions({
	name: 'ContentFormGenerator',
})

interface Props {
	fields: FieldDefinition[]
	errors?: Record<string, string[]>
	readonly?: boolean
	// Namespace prefix for auto-generated translation keys (see UiRichTextField), e.g. the schema slug.
	translationNamespace?: string
}

const props = withDefaults(defineProps<Props>(), {
	readonly: false,
	translationNamespace: 'content',
})

const modelValue = defineModel<Record<string, any>>({ required: true, default: () => ({}) })

function ensureDefaults(fieldList: FieldDefinition[]) {
	fieldList.forEach((field) => {
		if (modelValue.value[field.name] === undefined) {
			modelValue.value[field.name] =
				field.defaultValue !== undefined ? field.defaultValue : getDefaultValue(field.fieldType)
		}
	})
}

watch(() => props.fields, ensureDefaults, { immediate: true })
</script>

<style scoped lang="scss">
.content-form-generator {
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 20px;

	&__field {
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	&__label {
		font-weight: 500;
		font-size: 14px;
		color: var(--text-primary);
	}

	&__required {
		color: var(--el-color-danger, #f04438);
		margin-left: 2px;
	}

	&__control {
		min-width: 0;
	}

	&__error {
		font-size: 12px;
		color: var(--el-color-danger, #f04438);
		margin-top: 2px;
	}
}
</style>
