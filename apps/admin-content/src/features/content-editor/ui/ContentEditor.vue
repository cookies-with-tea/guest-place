<template>
	<div class="content-editor-feature glass-panel" :class="{ 'is-dark': isDark }">
		<div class="editor-header">
			<h3>{{ isEdit ? 'Edit entry' : 'Create entry' }}</h3>
			<div class="header-actions">
				<el-button @click="emit('cancel')">Cancel</el-button>
				<el-button :loading="isSaving" type="primary" @click="emit('save')">
					{{ isEdit ? 'Update' : 'Create' }}
				</el-button>
			</div>
		</div>

		<div class="editor-content">
			<ContentFormGenerator v-if="schema" v-model="modelValue" :errors="errors" :fields="schema.fields" />
		</div>
	</div>
</template>

<script setup lang="ts">
import type { ContentSchema } from '@admin-panel/lib'
import { useTheme } from '@admin-panel/ui'

import ContentFormGenerator from './components/ContentFormGenerator.vue'

interface Props {
	schema: ContentSchema | null
	isEdit?: boolean
	isSaving?: boolean
	errors?: Record<string, string[]>
}

defineProps<Props>()

const modelValue = defineModel<Record<string, any>>({ required: true })

const emit = defineEmits<{
	save: []
	cancel: []
}>()

const { isDark } = useTheme()
</script>

<style scoped>
.content-editor-feature {
	border-radius: 16px;
	padding: 24px;
}

.editor-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 24px;
}

.editor-header h3 {
	font-weight: 700;
	font-size: 18px;
	color: var(--text-primary);
	margin: 0;
}

.header-actions {
	display: flex;
	gap: 12px;
}
</style>
