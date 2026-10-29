<template>
	<p class="mechanism-note">
		Это обычная схема CMS Schema Builder с зарезервированным системным slug'ом
		<code>global-settings</code> — не отдельный особый механизм. Она отрисовывается тем же <code>ContentEditor</code>,
		что и любая другая singleton-схема; единственное отличие — пункт меню и путь <code>/settings</code>.
	</p>

	<div class="schema-info-bar glass-card" :class="{ 'is-dark': isDark }">
		<div class="info-meta">
			<span class="status-dot"></span>
			<span class="info-label">Активная синглтон-схема:</span>
			<code class="schema-badge">{{ entry.schema!.slug }}</code>
			<span class="fields-count">({{ entry.schema!.fields?.length || 0 }} полей)</span>
		</div>
		<el-button link type="primary" :icon="Tools" @click="emit('go-to-schemas')">
			Изменить структуру полей в Конструкторе
		</el-button>
	</div>

	<div class="editor-wrapper glass-card" :class="{ 'is-dark': isDark }">
		<ContentEditor
			v-model="entry.formData"
			:errors="entry.errors"
			:is-saving="entry.isSaving"
			:schema="entry.schema"
			:is-edit="Boolean(entry.entryId)"
			@cancel="emit('go-to-schemas')"
			@save="entry.onSave"
		/>
	</div>
</template>

<script setup lang="ts">
import { useTheme } from '@admin-panel/ui'
import { Tools } from '@element-plus/icons-vue'

import { ContentEditor } from '#features/content-editor'

import type { GlobalSettingsEntry } from '../../composables/useGlobalSettingsEntry'

defineProps<{
	entry: GlobalSettingsEntry
}>()

const emit = defineEmits<{
	'go-to-schemas': []
}>()

const { isDark } = useTheme()
</script>

<style scoped lang="scss">
.glass-card {
	border: 1px solid var(--gp-glass-border, rgb(255, 255, 255, 0.2));
	border-radius: 20px;
	box-shadow: 0 12px 32px rgb(0, 0, 0, 0.05);
	background: var(--gp-bg-glass, rgb(255, 255, 255, 0.7));
	padding: 32px;
	-webkit-backdrop-filter: blur(16px);
	backdrop-filter: blur(16px);

	&.is-dark {
		border-color: rgb(255, 255, 255, 0.08);
		box-shadow: 0 12px 32px rgb(0, 0, 0, 0.3);
		background: rgb(15, 23, 42, 0.75);
	}
}

.mechanism-note {
	border: 1px solid rgb(99, 102, 241, 0.15);
	border-radius: 10px;
	font-size: 13px;
	line-height: 1.6;
	color: var(--gp-text-secondary, #64748b);
	background: rgb(99, 102, 241, 0.05);
	padding: 10px 16px;
	margin: 0 0 20px;

	code {
		border-radius: 4px;
		font-family: monospace;
		color: #6366f1;
		background: rgb(99, 102, 241, 0.1);
		padding: 1px 6px;
	}
}

/* Schema Info Bar */
.schema-info-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 14px 20px;
	margin-bottom: 20px;

	.info-meta {
		display: flex;
		align-items: center;
		font-size: 13px;
		gap: 8px;

		.status-dot {
			width: 8px;
			height: 8px;
			border-radius: 50%;
			box-shadow: 0 0 8px #10b981;
			background: #10b981;
		}

		.info-label {
			color: var(--gp-text-secondary, #64748b);
		}

		.schema-badge {
			border-radius: 6px;
			font-family: monospace;
			font-weight: 600;
			color: #6366f1;
			background: rgb(99, 102, 241, 0.1);
			padding: 2px 8px;
		}

		.fields-count {
			font-size: 12px;
			color: var(--text-muted, #94a3b8);
		}
	}
}

.editor-wrapper {
	padding: 24px;
}
</style>
