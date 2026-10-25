<template>
	<div class="builder-header">
		<div class="builder-header__left">
			<button class="back-btn" @click="emit('close')">
				<svg
					fill="none"
					height="16"
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					viewBox="0 0 24 24"
					width="16"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M19 12H5M12 5l-7 7 7 7" />
				</svg>
				Back
			</button>
			<div class="builder-header__meta">
				<div class="meta-inputs">
					<input
						v-model="schemaForm.form.name"
						class="meta-input meta-input--name"
						placeholder="Schema name…"
						@input="schemaForm.onNameInput"
					/>
					<div class="meta-slug">
						<span class="meta-slug__prefix">/</span>
						<input
							v-model="schemaForm.form.slug"
							class="meta-input meta-input--slug"
							placeholder="slug"
							@input="emit('slug-touched')"
						/>
					</div>
				</div>
				<label class="singleton-toggle">
					<el-switch v-model="schemaForm.form.isSingleton" size="small" />
					<span>Singleton</span>
				</label>
			</div>
		</div>
		<div class="builder-header__right">
			<span v-if="fieldBuilder.validationErrors.length > 0" class="validation-summary">
				{{ fieldBuilder.validationErrors.length }} error{{ fieldBuilder.validationErrors.length > 1 ? 's' : '' }}
			</span>
			<el-button @click="emit('close')">Cancel</el-button>
			<el-button
				:disabled="
					schemaForm.isLockedByOther ||
					fieldBuilder.validationErrors.length > 0 ||
					!schemaForm.form.name ||
					!schemaForm.form.slug
				"
				:loading="schemaForm.saving"
				type="primary"
				@click="schemaForm.saveSchema"
			>
				{{ schemaForm.isEdit ? 'Update Schema' : 'Save Schema' }}
			</el-button>
		</div>
	</div>

	<!-- Entity Soft Lock Warning Banner -->
	<div v-if="schemaForm.isLockedByOther" class="lock-banner">
		<div class="lock-banner__content">
			<span class="lock-banner__icon">⚠️</span>
			<span class="lock-banner__text">
				<strong>Режим только для чтения:</strong> Схему сейчас редактирует
				<u>{{ schemaForm.lockedByName || 'другой администратор' }}</u
				>. Одновременное редактирование заблокировано через Redis во избежание конфликтов.
			</span>
		</div>
		<el-button size="small" type="warning" plain @click="schemaForm.forceUnlock">
			Принудительно разблокировать
		</el-button>
	</div>
</template>

<script setup lang="ts">
import type { SchemaForm } from '../composables/useSchemaForm'
import type { FieldBuilder } from '../composables/useFieldBuilder'

defineProps<{
	schemaForm: SchemaForm
	fieldBuilder: FieldBuilder
}>()

const emit = defineEmits<{
	close: []
	'slug-touched': []
}>()
</script>

<style scoped>
.builder-header {
	display: flex;
	flex-shrink: 0;
	align-items: center;
	justify-content: space-between;
	border-bottom: 1px solid var(--gp-glass-border);
	background: var(--gp-bg-glass);
	padding: 12px 24px;
	z-index: 10;
	backdrop-filter: blur(12px);
	gap: 16px;
}

.builder-header__left {
	min-width: 0;
	display: flex;
	flex: 1;
	align-items: center;
	gap: 20px;
}

.builder-header__right {
	display: flex;
	flex-shrink: 0;
	align-items: center;
	gap: 10px;
}

.back-btn {
	display: inline-flex;
	align-items: center;
	border: 1px solid var(--gp-glass-border);
	border-radius: 8px;
	font-weight: 500;
	font-size: 13px;
	white-space: nowrap;
	color: var(--gp-text-secondary);
	background: transparent;
	transition:
		background 0.15s,
		color 0.15s;
	cursor: pointer;
	padding: 6px 12px;
	gap: 6px;

	&:hover {
		color: var(--gp-text-main);
		background: var(--gp-bg-glass-hover);
	}
}

.builder-header__meta {
	min-width: 0;
	display: flex;
	flex: 1;
	align-items: center;
	gap: 16px;
}

.meta-inputs {
	min-width: 0;
	display: flex;
	flex: 1;
	align-items: center;
	gap: 12px;
}

.meta-input {
	outline: none;
	border: 1px solid transparent;
	border-radius: 8px;
	font-family: inherit;
	color: var(--gp-text-main);
	background: transparent;
	transition:
		border-color 0.15s,
		background 0.15s;
	padding: 6px 10px;

	&:hover,
	&:focus {
		border-color: var(--gp-glass-border);
		background: var(--gp-bg-glass-hover);
	}
}

.meta-input--name {
	width: 220px;
	font-weight: 700;
	font-size: 16px;
}

.meta-slug {
	display: flex;
	align-items: center;
	gap: 2px;
}

.meta-slug__prefix {
	font-weight: 600;
	font-size: 14px;
	color: var(--gp-text-secondary);
}

.meta-input--slug {
	width: 160px;
	font-family: 'JetBrains Mono', monospace;
	font-size: 13px;
	color: var(--gp-text-secondary);
}

.singleton-toggle {
	display: flex;
	align-items: center;
	font-size: 13px;
	white-space: nowrap;
	color: var(--gp-text-secondary);
	cursor: pointer;
	gap: 8px;
}

.validation-summary {
	font-weight: 600;
	font-size: 12px;
	color: var(--el-color-danger);
}

.lock-banner {
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-bottom: 1px solid rgb(245, 158, 11, 0.3);
	font-size: 13px;
	color: #f59e0b;
	background: rgb(245, 158, 11, 0.12);
	padding: 10px 20px;
	z-index: 10;

	&__content {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	&__icon {
		font-size: 16px;
	}

	&__text {
		color: var(--gp-text-main, #f8fafc);

		strong {
			color: #f59e0b;
		}

		u {
			font-weight: 600;
			text-decoration-color: #f59e0b;
		}
	}
}
</style>
