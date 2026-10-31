<template>
	<ContentFormGeneratorBase
		v-model="modelValue"
		:errors="errors"
		:fields="fields"
		:readonly="readonly"
		:translation-namespace="translationNamespace"
	>
		<template #relation="{ field, value, disabled, update }">
			<UiRelationPicker
				:disabled="disabled"
				:model-value="value"
				:multiple="field.multiple"
				:placeholder="field.label"
				:schema-slug="field.relationTo"
				@update:model-value="update"
			/>
		</template>
	</ContentFormGeneratorBase>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { FieldDefinition } from '@admin-panel/lib'
import { ContentFormGenerator as ContentFormGeneratorBase } from '@admin-panel/ui'

import TiptapEditor from './TiptapEditor.vue'
import UiRelationPicker from './UiRelationPicker.vue'

const modelValue = defineModel<Record<string, any>>({ required: true, default: () => ({}) })

withDefaults(
	defineProps<{
		fields: FieldDefinition[]
		errors?: Record<string, string[]>
		readonly?: boolean
		translationNamespace?: string
	}>(),
	{
		translationNamespace: 'content',
	}
)
</script>
