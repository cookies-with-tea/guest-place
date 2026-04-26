<template>
	<div class="content-editor-feature glass-panel" :class="{ 'is-dark': isDark }">
		<div class="editor-header">
			<h3>{{ isEdit ? 'Edit entry' : 'Create entry' }}</h3>
			<div class="header-actions">
				<el-select
					v-model="status"
					placeholder="Status"
					size="default"
					style="width: 130px; vertical-align: middle; margin-right: 8px"
				>
					<el-option label="Draft" value="draft">
						<div class="status-option"><el-tag size="small" type="info">DRAFT</el-tag></div>
					</el-option>
					<el-option label="Review" value="review">
						<div class="status-option"><el-tag size="small" type="warning">REVIEW</el-tag></div>
					</el-option>
					<el-option label="Published" value="published">
						<div class="status-option"><el-tag size="small" type="success">PUBLISHED</el-tag></div>
					</el-option>
				</el-select>
				<el-button :type="isTranslationMode ? 'warning' : 'default'" @click="isTranslationMode = !isTranslationMode">
					{{ isTranslationMode ? 'Exit Translation' : 'Translation Mode' }}
				</el-button>
				<el-button @click="isPreviewing = !isPreviewing">
					{{ isPreviewing ? 'Edit Mode' : 'Live Preview' }}
				</el-button>
				<el-button @click="emit('cancel')">Cancel</el-button>
				<el-button :loading="isSaving" type="primary" @click="handleSave">
					{{ isEdit ? 'Update' : 'Create' }}
				</el-button>
			</div>
		</div>

		<div v-if="isPreviewing" class="preview-container">
			<div class="preview-toolbar">
				<span>Previewing: {{ schema?.name }}</span>
				<el-radio-group v-model="previewDevice" size="small">
					<el-radio-button label="desktop">Desktop</el-radio-button>
					<el-radio-button label="mobile">Mobile</el-radio-button>
				</el-radio-group>
			</div>
			<iframe
				ref="previewIframe"
				:class="['preview-iframe', `is-${previewDevice}`]"
				:src="previewUrl"
				@load="sendPreviewData"
			></iframe>
		</div>

		<el-tabs v-else v-model="activeTab" class="editor-tabs">
			<el-tab-pane label="Content" name="content">
				<div class="editor-content" :class="{ 'is-translation': isTranslationMode }">
					<template v-if="!isTranslationMode">
						<ContentFormGenerator v-if="schema" v-model="modelValue" :errors="errors" :fields="schema.fields" />
					</template>
					<template v-else>
						<div class="translation-mode-container">
							<div class="translation-column source-column">
								<div class="column-header">
									<el-select v-model="sourceLocale" placeholder="Source Language" size="small">
										<el-option v-for="lang in languages" :key="lang.code" :label="lang.name" :value="lang.code" />
									</el-select>
									<span class="column-label">SOURCE</span>
								</div>
								<div class="column-body">
									<ContentFormGenerator v-if="schema" v-model="sourceData" :fields="schema.fields" readonly />
								</div>
							</div>

							<div class="translation-column target-column">
								<div class="column-header">
									<el-select v-model="targetLocale" placeholder="Target Language" size="small">
										<el-option v-for="lang in languages" :key="lang.code" :label="lang.name" :value="lang.code" />
									</el-select>
									<span class="column-label">TARGET</span>
								</div>
								<div class="column-body">
									<ContentFormGenerator v-if="schema" v-model="targetData" :errors="errors" :fields="schema.fields" />
								</div>
							</div>
						</div>
					</template>
				</div>
			</el-tab-pane>

			<el-tab-pane label="SEO" name="seo">
				<UiSeoEditor v-model="seoData" />
			</el-tab-pane>

			<el-tab-pane v-if="isEdit" label="History" name="history">
				<div class="history-list">
					<div v-if="isLoadingHistory" class="loading-state">Loading history...</div>
					<el-table v-else :data="history" border stripe>
						<el-table-column label="Version" prop="version_number" width="100" />
						<el-table-column label="Date" width="180">
							<template #default="{ row }">
								{{ new Date(row.created_at).toLocaleString() }}
							</template>
						</el-table-column>
						<el-table-column label="Comment" prop="comment" />
						<el-table-column label="Actions" width="120">
							<template #default="{ row }">
								<el-button size="small" type="warning" @click="onRollback(row.id)">Rollback</el-button>
							</template>
						</el-table-column>
					</el-table>
				</div>
			</el-tab-pane>
		</el-tabs>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import type { ContentSchema } from '@admin-panel/lib'
import { UiSeoEditor, useTheme } from '@admin-panel/ui'
import { ElMessage, ElMessageBox } from 'element-plus'

import { contentApi } from '#entities/content'

import ContentFormGenerator from './components/ContentFormGenerator.vue'

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

const emit = defineEmits<{
	save: [seo: any]
	cancel: []
	rollback: []
}>()

const { isDark } = useTheme()

const activeTab = ref('content')
const isPreviewing = ref(false)
const previewDevice = ref('desktop')
const previewIframe = ref<HTMLIFrameElement | null>(null)
const seoData = ref<any>({})
const history = ref<any[]>([])
const isLoadingHistory = ref(false)

// Translation states
const isTranslationMode = ref(false)
const languages = ref<any[]>([])
const sourceLocale = ref('en')
const targetLocale = ref('ru')

const fetchLanguages = async () => {
	try {
		const res = await contentApi.getLanguages()

		if (res.data) {
			languages.value = res.data
		}
	} catch {
		console.warn('Failed to fetch languages')
	}
}

fetchLanguages()

const sourceData = computed(() => {
	if (sourceLocale.value === 'en') return modelValue.value

	return i18n.value?.[sourceLocale.value] || {}
})

const targetData = computed({
	get: () => {
		return i18n.value?.[targetLocale.value] || {}
	},
	set: (val) => {
		if (!i18n.value) i18n.value = {}
		i18n.value[targetLocale.value] = val
	},
})

// In a real app, this would be a config-driven URL
const previewUrl = computed(() => {
	const baseUrl = import.meta.env.VITE_CLIENT_URL || 'http://localhost:3000'

	return `${baseUrl}/preview?schema=${props.schema?.slug}&id=${props.entryId || 'new'}`
})

// Sync data with iframe
const sendPreviewData = () => {
	console.log('[CMS Editor] sendPreviewData triggered', {
		isPreviewing: isPreviewing.value,
		hasIframe: !!previewIframe.value,
		hasWindow: !!previewIframe.value?.contentWindow,
	})

	if (isPreviewing.value && previewIframe.value && previewIframe.value.contentWindow) {
		const targetOrigin = import.meta.env.VITE_CLIENT_URL || 'http://localhost:3000'
		const payload = JSON.parse(
			JSON.stringify({
				data: modelValue.value,
				seo: seoData.value,
				schema: props.schema,
			})
		)

		console.log('[CMS Editor] Posting serialized message to iframe:', payload, 'Target:', targetOrigin)

		previewIframe.value.contentWindow.postMessage(
			{
				type: 'CMS_PREVIEW_DATA',
				payload,
			},
			targetOrigin
		)
	}
}

watch(
	[() => modelValue.value, isPreviewing],
	() => {
		sendPreviewData()
	},
	{ deep: true }
)

// Listen for PREVIEW_READY to send initial data
const handlePreviewMessage = (event: MessageEvent) => {
	if (event.data?.type === 'PREVIEW_READY') {
		console.log('[CMS Editor] Received PREVIEW_READY from iframe')

		sendPreviewData()
	}
}

watch(isPreviewing, (val) => {
	if (val) {
		window.addEventListener('message', handlePreviewMessage)
	} else {
		window.removeEventListener('message', handlePreviewMessage)
	}
})

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

const fetchHistory = async () => {
	if (!props.entryId) return
	isLoadingHistory.value = true

	try {
		const res = await contentApi.getEntryVersions(props.entryId)

		if (res.data) {
			history.value = res.data
		}
	} catch {
		ElMessage.error('Failed to fetch version history')
	} finally {
		isLoadingHistory.value = false
	}
}

const onRollback = (versionId: string) => {
	ElMessageBox.confirm('Are you sure you want to rollback to this version?', 'Warning', {
		confirmButtonText: 'Rollback',
		cancelButtonText: 'Cancel',
		type: 'warning',
	}).then(async () => {
		try {
			if (!props.entryId) return
			await contentApi.rollbackEntryVersion(props.entryId, versionId)

			ElMessage.success('Version restored')

			emit('rollback')
		} catch {
			ElMessage.error('Failed to rollback version')
		}
	})
}

watch(activeTab, (tab) => {
	if (tab === 'history' && history.value.length === 0) {
		fetchHistory()
	}
})
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

.preview-container {
	border: 1px solid var(--border-color);
	border-radius: 12px;
	background: #f1f5f9;
	margin-top: 24px;
	overflow: hidden;
}

.preview-toolbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-bottom: 1px solid var(--border-color);
	font-weight: 600;
	font-size: 13px;
	background: var(--bg-card);
	padding: 12px 20px;
}

.preview-iframe {
	width: 100%;
	height: 600px;
	border: none;
	background: #fff;
	transition: all 0.3s ease;
}

.preview-iframe.is-mobile {
	height: 667px;
	max-width: 375px;
	display: block;
	border: 8px solid #334155;
	border-radius: 32px;
	margin: 20px auto;
}

.status-option {
	height: 34px;
	display: flex;
	align-items: center;
}

.translation-mode-container {
	width: 100%;
	display: flex;
	gap: 24px;
}

.translation-column {
	min-width: 0;
	display: flex;
	flex: 1;
	flex-direction: column;
}

.column-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	border-bottom: 1px dashed var(--border-color);
	padding-bottom: 12px;
	margin-bottom: 16px;
}

.column-label {
	font-weight: 800;
	font-size: 10px;
	letter-spacing: 0.1em;
	color: var(--text-muted);
}

.column-body {
	flex: 1;
}

.source-column {
	opacity: 0.8;
}

.is-translation {
	max-width: 1200px !important;
}
</style>
