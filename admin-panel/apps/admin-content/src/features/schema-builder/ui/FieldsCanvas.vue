<template>
	<main class="canvas" @dragover.prevent @drop="fieldBuilder.onCanvasDrop">
		<nav v-if="fieldBuilder.fieldPath.length" class="breadcrumb">
			<button class="breadcrumb__item" @click="fieldBuilder.drillTo(-1)">{{ schemaForm.form.name || 'Fields' }}</button>
			<template v-for="(entry, i) in fieldBuilder.fieldPath" :key="entry.id">
				<span class="breadcrumb__sep">/</span>
				<button
					class="breadcrumb__item"
					:class="{ 'is-current': i === fieldBuilder.fieldPath.length - 1 }"
					@click="fieldBuilder.drillTo(i)"
				>
					{{ entry.label }}
				</button>
			</template>
		</nav>

		<div
			v-if="fieldBuilder.currentFields.length === 0"
			class="canvas-empty"
			@dragover.prevent
			@drop="fieldBuilder.onCanvasDrop"
		>
			<el-icon class="canvas-empty__icon"><Plus /></el-icon>
			<p class="canvas-empty__title">No fields yet</p>
			<p class="canvas-empty__hint">Click a field type on the left to add it</p>
		</div>

		<transition-group v-else class="fields-list" name="field-list" tag="div">
			<div
				v-for="(field, index) in fieldBuilder.currentFields"
				:key="field._id"
				:class="[
					'field-card',
					{ 'is-selected': fieldBuilder.selectedFieldId === field._id },
					{ 'is-dragging': fieldBuilder.draggingId === field._id },
					{ 'is-drag-over': fieldBuilder.dragOverIndex === index && fieldBuilder.draggingId !== field._id },
					{ 'has-error': fieldBuilder.fieldHasError(field.name) },
				]"
				draggable="true"
				@click="fieldBuilder.selectField(field._id)"
				@dragend="fieldBuilder.onDragEnd"
				@dragenter.prevent="fieldBuilder.onDragEnter(index)"
				@dragleave="fieldBuilder.onDragLeave"
				@dragover.prevent
				@dragstart="fieldBuilder.onDragStart($event, index, field._id)"
				@drop.stop="fieldBuilder.onFieldDrop(index)"
			>
				<!-- Drag handle -->
				<div class="field-card__handle" title="Drag to reorder">
					<svg fill="currentColor" height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg">
						<circle cx="9" cy="5" r="1.5" />
						<circle cx="15" cy="5" r="1.5" />
						<circle cx="9" cy="12" r="1.5" />
						<circle cx="15" cy="12" r="1.5" />
						<circle cx="9" cy="19" r="1.5" />
						<circle cx="15" cy="19" r="1.5" />
					</svg>
				</div>

				<!-- Field info -->
				<el-icon class="field-card__icon" :style="{ color: fieldBuilder.getFieldTypeInfo(field.fieldType).color }">
					<component :is="resolveIcon(fieldBuilder.getFieldTypeInfo(field.fieldType).icon)" />
				</el-icon>
				<div class="field-card__meta">
					<div class="field-card__label">
						<span v-if="field.label">{{ field.label }}</span>
						<span v-else class="placeholder-text">Untitled field</span>
						<span v-if="field.required" class="required-badge" title="Required">*</span>
					</div>
					<div class="field-card__name">{{ field.name || '—' }}</div>
				</div>

				<!-- Type badge -->
				<el-tag
					class="field-card__type"
					:color="fieldBuilder.getFieldTypeInfo(field.fieldType).color + '22'"
					size="small"
					:style="{
						color: fieldBuilder.getFieldTypeInfo(field.fieldType).color,
						borderColor: fieldBuilder.getFieldTypeInfo(field.fieldType).color + '44',
					}"
				>
					{{ fieldBuilder.getFieldTypeInfo(field.fieldType).label }}
				</el-tag>

				<!-- Actions -->
				<div class="field-card__actions" @click.stop>
					<button
						v-if="fieldBuilder.isNestable(field.fieldType)"
						class="field-action-btn field-action-btn--drill"
						:title="`Edit sub-fields (${field.fields?.length || 0})`"
						@click="fieldBuilder.drillInto(field._id)"
					>
						<span class="field-action-btn__count">{{ field.fields?.length || 0 }}</span>
						<svg
							fill="none"
							height="13"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							viewBox="0 0 24 24"
							width="13"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path d="M9 6l6 6-6 6" />
						</svg>
					</button>
					<button
						class="field-action-btn field-action-btn--delete"
						title="Delete field"
						@click="fieldBuilder.removeField(field._id)"
					>
						<svg
							fill="none"
							height="13"
							stroke="currentColor"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							viewBox="0 0 24 24"
							width="13"
							xmlns="http://www.w3.org/2000/svg"
						>
							<polyline points="3 6 5 6 21 6" />
							<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
							<path d="M10 11v6M14 11v6" />
							<path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
						</svg>
					</button>
				</div>

				<!-- Error hint -->
				<div v-if="fieldBuilder.fieldHasError(field.name)" class="field-error-indicator" />
			</div>
		</transition-group>
	</main>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import { resolveIcon } from '../lib/icons'
import type { SchemaForm } from '../composables/useSchemaForm'
import type { FieldBuilder } from '../composables/useFieldBuilder'

defineProps<{
	schemaForm: SchemaForm
	fieldBuilder: FieldBuilder
}>()
</script>

<style scoped>
.breadcrumb {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	font-size: 12px;
	margin-bottom: 16px;
	gap: 4px;
}

.breadcrumb__item {
	border: none;
	border-radius: 6px;
	color: var(--gp-text-secondary);
	background: transparent;
	cursor: pointer;
	padding: 3px 6px;

	&:hover {
		color: var(--gp-primary);
		background: var(--gp-bg-glass-hover);
	}

	&.is-current {
		font-weight: 600;
		color: var(--gp-text-main);
		cursor: default;
	}
}

.breadcrumb__sep {
	color: var(--gp-text-secondary);
	opacity: 0.5;
}

.field-action-btn--drill {
	width: auto;
	color: var(--gp-text-secondary);
	padding: 0 6px;
	gap: 3px;

	&:hover {
		color: var(--gp-primary);
		background: var(--gp-primary-light);
	}
}

.field-action-btn__count {
	font-weight: 700;
	font-size: 11px;
}

.canvas {
	background: transparent;
	padding: 24px;
	overflow-y: auto;
}

.canvas-empty {
	min-height: 400px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	border: 2px dashed var(--gp-glass-border);
	border-radius: 16px;
	text-align: center;
	transition: border-color 0.2s;
	gap: 10px;

	&:hover {
		border-color: var(--gp-primary-light);
	}
}

.canvas-empty__icon {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	font-size: 20px;
	color: var(--gp-text-secondary);
	background: var(--gp-bg-glass-hover);
}

.canvas-empty__title {
	font-weight: 600;
	font-size: 16px;
	color: var(--gp-text-main);
	margin: 0;
}

.canvas-empty__hint {
	font-size: 13px;
	color: var(--gp-text-secondary);
	margin: 0;
}

.field-list-enter-active,
.field-list-leave-active {
	transition:
		opacity 0.2s ease,
		transform 0.2s ease;
}

.field-list-enter-from {
	transform: translateY(-8px);
	opacity: 0;
}

.field-list-leave-to {
	transform: translateX(10px);
	opacity: 0;
}

.fields-list {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.field-card {
	position: relative;
	display: flex;
	align-items: center;
	border: 1.5px solid var(--gp-glass-border);
	border-radius: 12px;
	background: var(--gp-bg-glass);
	transition:
		border-color 0.15s,
		background 0.15s,
		box-shadow 0.15s,
		transform 0.1s;
	cursor: pointer;
	padding: 12px 14px;
	gap: 12px;
}

.field-card:hover {
	border-color: var(--gp-primary-light);
	box-shadow: var(--gp-glass-shadow);
	background: var(--gp-bg-glass-hover);
}

.field-card.is-selected {
	border-color: var(--gp-primary, #6366f1);
	box-shadow: 0 0 0 3px rgb(99, 102, 241, 0.15);
	background: var(--gp-bg-glass-hover);
}

.field-card.is-dragging {
	transform: scale(0.98);
	opacity: 0.4;
}

.field-card.is-drag-over {
	border-style: dashed;
	border-color: var(--gp-primary, #6366f1);
}

.field-card.has-error {
	border-color: var(--el-color-danger);
}

.field-card__handle {
	flex-shrink: 0;
	color: var(--gp-text-secondary);
	transition: opacity 0.15s;
	cursor: grab;
	opacity: 0.5;

	&:hover {
		opacity: 1;
	}

	&:active {
		cursor: grabbing;
	}
}

.field-card__icon {
	width: 1em;
	height: 1em;
	flex-shrink: 0;
	font-size: 20px;
}

.field-card__meta {
	min-width: 0;
	flex: 1;
}

.field-card__label {
	display: flex;
	align-items: center;
	font-weight: 600;
	font-size: 14px;
	white-space: nowrap;
	text-overflow: ellipsis;
	color: var(--gp-text-main);
	overflow: hidden;
	gap: 4px;
}

.field-card__name {
	font-family: 'JetBrains Mono', monospace;
	font-size: 11px;
	color: var(--gp-text-secondary);
	margin-top: 2px;
}

.field-card__type {
	flex-shrink: 0;
}

.field-card__actions {
	display: flex;
	flex-shrink: 0;
	transition: opacity 0.15s;
	opacity: 0;
	gap: 4px;
}

.field-card:hover .field-card__actions {
	opacity: 1;
}

.field-action-btn {
	width: 28px;
	height: 28px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border: none;
	border-radius: 6px;
	background: transparent;
	transition: background 0.15s;
	cursor: pointer;
}

.field-action-btn--delete {
	color: var(--el-color-danger);

	&:hover {
		background: rgb(239, 68, 68, 0.12);
	}
}

.required-badge {
	font-weight: 700;
	color: var(--el-color-danger);
}

.placeholder-text {
	font-weight: 400;
	font-style: italic;
	color: var(--gp-text-secondary);
}

.field-error-indicator {
	top: -3px;
	right: -3px;
	width: 8px;
	height: 8px;
	position: absolute;
	border: 2px solid var(--gp-bg-glass);
	border-radius: 50%;
	background: var(--el-color-danger);
}
</style>
