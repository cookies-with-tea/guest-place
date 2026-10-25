<template>
	<aside class="config-panel">
		<div v-if="!fieldBuilder.selectedField" class="config-panel__empty">
			<div class="config-panel__empty-icon">⚙️</div>
			<p>Select a field to configure it</p>
		</div>

		<div v-else class="config-form">
			<div class="config-form__header">
				<span class="config-form__type-icon">{{
					fieldBuilder.getFieldTypeInfo(fieldBuilder.selectedField.fieldType).icon
				}}</span>
				<span class="config-form__type-label"
					>{{ fieldBuilder.getFieldTypeInfo(fieldBuilder.selectedField.fieldType).label }} Field</span
				>
			</div>

			<div class="config-field">
				<label class="config-label">Label <span class="required-star">*</span></label>
				<input
					v-model="fieldBuilder.selectedField.label"
					class="config-input"
					:class="{ 'has-error': !fieldBuilder.selectedField.label }"
					placeholder="e.g. Title"
					@input="fieldBuilder.onFieldLabelInput"
				/>
				<div v-if="!fieldBuilder.selectedField.label" class="config-error">Label is required</div>
			</div>

			<div class="config-field">
				<label class="config-label">Identifier (name) <span class="required-star">*</span></label>
				<input
					v-model="fieldBuilder.selectedField.name"
					class="config-input config-input--mono"
					:class="{ 'has-error': fieldBuilder.getFieldNameError(fieldBuilder.selectedField.name) }"
					placeholder="e.g. title"
					@input="fieldBuilder.selectedField._nameTouched = true"
				/>
				<div v-if="fieldBuilder.getFieldNameError(fieldBuilder.selectedField.name)" class="config-error">
					{{ fieldBuilder.getFieldNameError(fieldBuilder.selectedField.name) }}
				</div>
				<div v-else class="config-hint">Used as data key. Lowercase letters, digits and hyphens only.</div>
			</div>

			<div class="config-field">
				<label class="config-label">Type</label>
				<el-select v-model="fieldBuilder.selectedField.fieldType" size="default" style="width: 100%">
					<el-option
						v-for="ft in fieldBuilder.fieldTypePalette"
						:key="ft.value"
						:label="`${ft.icon}  ${ft.label}`"
						:value="ft.value"
					/>
				</el-select>
			</div>

			<div class="config-field">
				<label class="config-toggle">
					<el-switch v-model="fieldBuilder.selectedField.required" size="small" />
					<span>Required field</span>
				</label>
			</div>

			<!-- Relation-specific options -->
			<template v-if="fieldBuilder.selectedField.fieldType === FieldType.Relation">
				<div class="config-divider">Relation Options</div>
				<div class="config-field">
					<label class="config-label">Relation To (Schema slug) <span class="required-star">*</span></label>
					<input
						v-model="fieldBuilder.selectedField.relationTo"
						class="config-input config-input--mono"
						placeholder="e.g. products"
					/>
					<div class="config-hint">The slug of the target schema</div>
				</div>
				<div class="config-field">
					<label class="config-toggle">
						<el-switch v-model="fieldBuilder.selectedField.multiple" size="small" />
						<span>Allow multiple</span>
					</label>
				</div>
			</template>

			<!-- Default value (text/number) -->
			<template
				v-if="
					fieldBuilder.selectedField.fieldType === FieldType.Text ||
					fieldBuilder.selectedField.fieldType === FieldType.RichText
				"
			>
				<div class="config-divider">Advanced</div>
				<div class="config-field">
					<label class="config-label">Default Value</label>
					<input
						v-model="fieldBuilder.selectedField.defaultValue"
						class="config-input"
						placeholder="Optional default value"
					/>
				</div>
			</template>

			<template v-if="fieldBuilder.selectedField.fieldType === FieldType.Number">
				<div class="config-divider">Advanced</div>
				<div class="config-field">
					<label class="config-label">Default Value</label>
					<input
						v-model.number="fieldBuilder.selectedField.defaultValue"
						class="config-input"
						placeholder="0"
						type="number"
					/>
				</div>
			</template>
		</div>
	</aside>
</template>

<script setup lang="ts">
import { FieldType } from '@admin-panel/lib'
import type { FieldBuilder } from '../composables/useFieldBuilder'

defineProps<{
	fieldBuilder: FieldBuilder
}>()
</script>

<style scoped>
.config-panel {
	border-left: 1px solid var(--gp-glass-border);
	background: var(--gp-bg-glass);
	padding: 20px;
	overflow-y: auto;
}

.config-panel__empty {
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	text-align: center;
	gap: 12px;
}

.config-panel__empty-icon {
	font-size: 36px;
}

.config-panel__empty p {
	font-size: 13px;
	color: var(--gp-text-secondary);
	margin: 0;
}

.config-form {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.config-form__header {
	display: flex;
	align-items: center;
	border-bottom: 1px solid var(--gp-glass-border);
	font-weight: 700;
	font-size: 13px;
	color: var(--gp-text-main);
	padding-bottom: 16px;
	gap: 8px;
}

.config-form__type-icon {
	font-size: 20px;
}

.config-field {
	display: flex;
	flex-direction: column;
	gap: 6px;
}

.config-label {
	font-weight: 600;
	font-size: 12px;
	letter-spacing: 0.03em;
	color: var(--gp-text-secondary);
}

.required-star {
	color: var(--el-color-danger);
}

.config-input {
	width: 100%;
	height: 34px;
	outline: none;
	border: 1px solid var(--gp-glass-border);
	border-radius: 8px;
	box-sizing: border-box;
	font-family: inherit;
	font-size: 13px;
	color: var(--gp-text-main);
	background: var(--gp-bg-glass-hover);
	transition:
		border-color 0.15s,
		box-shadow 0.15s;
	padding: 0 10px;

	&:focus {
		border-color: var(--gp-primary, #6366f1);
		box-shadow: 0 0 0 3px rgb(99, 102, 241, 0.15);
	}

	&.has-error {
		border-color: var(--el-color-danger);
	}
}

.config-input--mono {
	font-family: 'JetBrains Mono', monospace;
	font-size: 12px;
}

.config-error {
	font-size: 11px;
	color: var(--el-color-danger);
}

.config-hint {
	font-size: 11px;
	line-height: 1.4;
	color: var(--gp-text-secondary);
}

.config-toggle {
	display: flex;
	align-items: center;
	font-size: 13px;
	color: var(--gp-text-main);
	cursor: pointer;
	gap: 8px;
}

.config-divider {
	border-top: 1px solid var(--gp-glass-border);
	font-weight: 800;
	font-size: 10px;
	letter-spacing: 0.1em;
	text-transform: uppercase;
	color: var(--gp-text-secondary);
	padding: 8px 0 0;
}
</style>
