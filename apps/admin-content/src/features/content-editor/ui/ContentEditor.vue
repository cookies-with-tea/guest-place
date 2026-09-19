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
				<el-button :type="isPreviewing ? 'primary' : 'default'" @click="isPreviewing = !isPreviewing">
					<svg v-if="isPreviewing" width="14" height="14" viewBox="0 0 24 24" fill="none" style="margin-right:4px;vertical-align:middle" xmlns="http://www.w3.org/2000/svg"><path d="M11 19H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M16 19h6M19 16v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
					{{ isPreviewing ? 'Split Preview' : 'Live Preview' }}
				</el-button>
				<el-button @click="emit('cancel')">Cancel</el-button>
				<el-button :loading="isSaving" type="primary" @click="handleSave">
					{{ isEdit ? 'Update' : 'Create' }}
				</el-button>
			</div>
		</div>

		<el-tabs v-model="activeTab" class="editor-tabs">
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

			<el-tab-pane v-if="isEdit" name="history">
				<template #label>
					<span class="history-tab-label">
						History
						<el-badge v-if="history.length > 0" :value="history.length" class="history-badge" />
					</span>
				</template>

				<div class="history-list">
					<!-- Toolbar -->
					<div class="history-toolbar">
						<span class="history-toolbar__title">Version History</span>
						<el-button size="small" :loading="isLoadingHistory" @click="fetchHistory">
							<svg width="13" height="13" viewBox="0 0 24 24" fill="none" style="margin-right:4px" xmlns="http://www.w3.org/2000/svg"><path d="M3 12A9 9 0 1 0 6 5.68" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M3 5v4h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
							Refresh
						</el-button>
					</div>

					<div v-if="isLoadingHistory" class="loading-state">
						<el-skeleton :rows="4" animated />
					</div>

					<div v-else-if="history.length > 0" class="activity-timeline">
						<div v-for="(log, idx) in history" :key="log.id" class="activity-item">
							<div class="activity-avatar">
								<el-avatar :size="32" :src="log.user?.avatar">
									{{ log.user?.name?.[0]?.toUpperCase() || 'A' }}
								</el-avatar>
							</div>
							<div class="activity-content">
								<div class="activity-header">
									<div class="activity-header__left">
										<el-tag size="small" type="info" style="font-weight:700">v{{ log.version_number }}</el-tag>
										<span class="user-name">{{ log.user?.name || 'Administrator' }}</span>
										<el-tag v-if="idx === 0" size="small" type="success" style="font-size:9px">LATEST</el-tag>
									</div>
									<span class="activity-date">{{ formatDate(log.created_at) }}</span>
								</div>
								<div v-if="log.comment" class="activity-comment">"{{ log.comment }}"</div>
								<div class="activity-actions">
									<el-button link size="small" type="primary" @click="openDiff(log)">
										<svg width="12" height="12" viewBox="0 0 24 24" fill="none" style="margin-right:3px" xmlns="http://www.w3.org/2000/svg"><path d="M9 3H5a2 2 0 00-2 2v14a2 2 0 002 2h4M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M12 8v8M9 11l3-3 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
										View Diff
									</el-button>
									<el-button link size="small" type="warning" @click="onRollback(log.id)">
										<svg width="12" height="12" viewBox="0 0 24 24" fill="none" style="margin-right:3px" xmlns="http://www.w3.org/2000/svg"><path d="M3 7v4h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 11A9 9 0 1 0 6.68 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
										Restore
									</el-button>
								</div>
							</div>
						</div>
					</div>

					<div v-else class="empty-state">
						<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity:0.3"><path d="M12 8v4l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/></svg>
						<p>No version history yet.<br><small>Versions are saved automatically on every update.</small></p>
					</div>
				</div>
			</el-tab-pane>

			<!-- Diff Drawer -->
			<el-drawer
				v-model="isDiffOpen"
				:title="`Diff: v${diffVersion?.version_number} → Current`"
				size="72%"
				direction="rtl"
				:destroy-on-close="false"
			>
				<template #header>
					<div class="diff-drawer-header">
						<span class="diff-drawer-title">Version Diff</span>
						<el-tag size="small" type="info">v{{ diffVersion?.version_number }}</el-tag>
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="color:#64748b" xmlns="http://www.w3.org/2000/svg"><path d="M5 12H19M12 5L19 12L12 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
						<el-tag size="small" type="success">Current</el-tag>
					</div>
				</template>
				<div class="diff-drawer-body">
					<VersionDiffViewer
						:version="diffVersion"
						:current-data="modelValue"
						:schema="schema"
					/>
					<div class="diff-drawer-footer">
						<el-button @click="isDiffOpen = false">Close</el-button>
						<el-button type="warning" @click="onRollback(diffVersion!.id); isDiffOpen = false">
							<svg width="13" height="13" viewBox="0 0 24 24" fill="none" style="margin-right:4px" xmlns="http://www.w3.org/2000/svg"><path d="M3 7v4h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 11A9 9 0 1 0 6.68 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
							Restore v{{ diffVersion?.version_number }}
						</el-button>
					</div>
				</div>
			</el-drawer>
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
import VersionDiffViewer from './components/VersionDiffViewer.vue'

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
const isPreviewing = defineModel<boolean>('isPreviewing', { default: false })
const seoData = ref<any>({})
const history = ref<any[]>([])
const isLoadingHistory = ref(false)

// Diff drawer state
const isDiffOpen = ref(false)
const diffVersion = ref<any>(null)

const openDiff = (version: any) => {
	diffVersion.value = version
	isDiffOpen.value = true
}

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

const formatDate = (iso: string) => {
	try {
		return new Date(iso).toLocaleString('ru-RU', {
			day: '2-digit', month: 'short', year: 'numeric',
			hour: '2-digit', minute: '2-digit',
		})
	} catch {
		return iso
	}
}
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

/* Activity Log Styles */
.activity-timeline {
	display: flex;
	flex-direction: column;
	padding: 10px 0;
	gap: 20px;
}

.activity-item {
	position: relative;
	display: flex;
	gap: 16px;

	&:not(:last-child)::after {
		content: '';
		top: 40px;
		left: 16px;
		bottom: -20px;
		width: 1px;
		position: absolute;
		background: var(--gp-glass-border);
	}
}

.activity-avatar {
	flex-shrink: 0;
	z-index: 1;
}

.activity-content {
	flex: 1;
	border: 1px solid var(--gp-glass-border);
	border-radius: 12px;
	background: var(--gp-bg-glass-hover);
	padding: 12px 16px;
}

.activity-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 8px;
}

.user-name {
	font-weight: 600;
	font-size: 14px;
	color: var(--gp-text-main);
}

.activity-date {
	font-size: 12px;
	color: var(--gp-text-secondary);
}

.activity-desc {
	font-size: 14px;
	line-height: 1.5;
	color: var(--gp-text-main);
}

.activity-comment {
	display: block;
	font-style: italic;
	color: var(--gp-text-secondary);
	margin-top: 4px;
}

.activity-actions {
	display: flex;
	border-top: 1px dashed var(--gp-glass-border);
	padding-top: 8px;
	margin-top: 8px;
	gap: 12px;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12px;
	text-align: center;
	color: var(--gp-text-secondary);
	padding: 40px;
	font-size: 14px;

	small { font-size: 12px; opacity: 0.7; }
}

/* History toolbar */
.history-list {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.history-toolbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-bottom: 12px;
	border-bottom: 1px solid var(--gp-glass-border, rgba(255,255,255,0.07));
}

.history-toolbar__title {
	font-weight: 700;
	font-size: 13px;
	color: var(--gp-text-main);
}

/* History tab label with badge */
.history-tab-label {
	display: inline-flex;
	align-items: center;
	gap: 6px;
}

.history-badge :deep(.el-badge__content) {
	font-size: 9px;
	padding: 0 4px;
	min-width: 16px;
	height: 16px;
	line-height: 16px;
}

/* Activity item updates */
.activity-header__left {
	display: flex;
	align-items: center;
	gap: 8px;
	flex-wrap: wrap;
}

/* Diff drawer */
.diff-drawer-header {
	display: flex;
	align-items: center;
	gap: 10px;
}

.diff-drawer-title {
	font-weight: 700;
	font-size: 15px;
	color: var(--gp-text-main);
}

.diff-drawer-body {
	display: flex;
	flex-direction: column;
	height: 100%;
}

.diff-drawer-footer {
	display: flex;
	justify-content: flex-end;
	gap: 12px;
	padding-top: 20px;
	margin-top: 24px;
	border-top: 1px solid var(--gp-glass-border, rgba(255,255,255,0.07));
	flex-shrink: 0;
}
</style>
