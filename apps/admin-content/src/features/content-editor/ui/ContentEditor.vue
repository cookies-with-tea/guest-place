<template>
	<div class="content-editor-feature glass-panel" :class="{ 'is-dark': isDark }">
		<ContentEditorHeader
			v-model:status="status"
			v-model:is-translation-mode="translation.isTranslationMode"
			v-model:is-previewing="isPreviewing"
			:is-edit="isEdit"
			:is-saving="isSaving"
			@cancel="emit('cancel')"
			@save="handleSave"
		/>

		<el-tabs v-model="activeTab" class="editor-tabs">
			<el-tab-pane label="Content" name="content">
				<EntryContentTab v-model="modelValue" :schema="schema" :errors="errors" :translation="translation" />
			</el-tab-pane>

			<el-tab-pane label="SEO" name="seo">
				<UiSeoEditor v-model="seoData" />
			</el-tab-pane>

			<el-tab-pane v-if="isEdit" name="history">
				<template #label>
					<span class="history-tab-label">
						History
						<el-badge v-if="history.history.length > 0" :value="history.history.length" class="history-badge" />
					</span>
				</template>

				<EntryHistoryTab :history="history" />
			</el-tab-pane>

			<VersionDiffDrawer :history="history" :model-value="modelValue" :schema="schema" />
		</el-tabs>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import type { ContentSchema } from '@admin-panel/lib'
import { UiSeoEditor, useTheme } from '@admin-panel/ui'

import { useEntryHistory } from '../composables/useEntryHistory'
import { useTranslationMode } from '../composables/useTranslationMode'
import ContentEditorHeader from './components/ContentEditorHeader.vue'
import EntryContentTab from './components/EntryContentTab.vue'
import EntryHistoryTab from './components/EntryHistoryTab.vue'
import VersionDiffDrawer from './components/VersionDiffDrawer.vue'

interface Props {
	schema: ContentSchema | null
	isEdit?: boolean
	isSaving?: boolean
	errors?: Record<string, string[]>
	entryId?: string
}

const props = defineProps<Props>()

const modelValue = defineModel<Record<string, any>>({ required: true })
const status = defineModel<string>('status', { default: 'draft' })
const i18n = defineModel<Record<string, any>>('i18n', { default: () => ({}) })
const isPreviewing = defineModel<boolean>('isPreviewing', { default: false })

const emit = defineEmits<{
	save: [seo: any]
	cancel: []
	rollback: []
}>()

const { isDark } = useTheme()

const activeTab = ref('content')
const seoData = ref<any>({})

const translation = useTranslationMode(modelValue, i18n)
const entryId = computed(() => props.entryId)
const history = useEntryHistory(entryId, (e) => emit(e), activeTab)

// Sync SEO data from modelValue if present
watch(
	() => modelValue.value,
	(val) => {
		if (val && val._seo) {
			seoData.value = val._seo
		}
	},
	{ immediate: true }
)

// Emit save with SEO data
const handleSave = () => {
	emit('save', seoData.value)
}
</script>

<style scoped>
.content-editor-feature {
	border-radius: 16px;
	padding: 24px;
}

.history-tab-label {
	display: inline-flex;
	align-items: center;
	gap: 6px;
}

.history-badge :deep(.el-badge__content) {
	height: 16px;
	min-width: 16px;
	font-size: 9px;
	line-height: 16px;
	padding: 0 4px;
}
</style>
