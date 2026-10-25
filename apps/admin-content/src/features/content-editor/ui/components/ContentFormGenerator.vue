<template>
	<ContentFormGeneratorBase v-model="modelValue" :errors="errors" :fields="fields" :readonly="readonly">
		<template #rich-text="{ field, value, disabled, update }">
			<TiptapEditor
				:disabled="disabled"
				:model-value="value"
				:placeholder="`Write ${field.label}...`"
				@update:model-value="update"
			/>
		</template>
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
import type { FieldDefinition } from '@admin-panel/lib'
import { ContentFormGenerator as ContentFormGeneratorBase } from '@admin-panel/ui'

import TiptapEditor from './TiptapEditor.vue'
import UiRelationPicker from './UiRelationPicker.vue'

const modelValue = defineModel<Record<string, any>>({ required: true, default: () => ({}) })

defineProps<{
	fields: FieldDefinition[]
	errors?: Record<string, string[]>
	readonly?: boolean
}>()
</script>
