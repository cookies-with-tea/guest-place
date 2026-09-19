<template>
	<div class="content-editor-page" :class="{ 'is-split': isSplitPreview }">
		<div class="page-content" :class="{ 'is-split': isSplitPreview }">
			<!-- Editor panel -->
			<div class="editor-panel">
				<!-- Entity Soft Lock Warning Banner -->
				<div v-if="isLockedByOther" class="lock-banner">
					<div class="lock-banner__content">
						<span class="lock-banner__icon">⚠️</span>
						<span class="lock-banner__text">
							<strong>Режим только для чтения:</strong> Запись сейчас редактирует <u>{{ lockedByName || 'другой администратор' }}</u>.
							Одновременное сохранение заблокировано через Redis во избежание конфликтов.
						</span>
					</div>
					<el-button size="small" type="warning" plain @click="forceUnlock">
						Принудительно разблокировать
					</el-button>
				</div>

				<ContentEditor
					v-if="schema"
					v-model="formData"
					v-model:status="entryStatus"
					v-model:i18n="i18nData"
					v-model:is-previewing="isSplitPreview"
					:entry-id="entryId"
					:errors="errors"
					:is-edit="isEdit"
					:is-saving="isSaving"
					:schema="schema"
					@cancel="goBack"
					@rollback="fetchData"
					@save="onSave"
				/>
			</div>

			<!-- Split preview panel -->
			<transition name="preview-slide">
				<div v-if="isSplitPreview" class="preview-panel">
					<div class="preview-panel__header">
						<div class="preview-panel__title">
							<span class="preview-panel__badge">LIVE PREVIEW</span>
							<span class="preview-panel__name">{{ schema?.name || 'Live View' }}</span>
						</div>

						<div class="preview-panel__center">
							<!-- Preset page quick links -->
							<div class="preview-presets">
								<button
									type="button"
									:class="['preset-btn', { 'is-active': activePreset === 'about' }]"
									@click="selectPreset('/about')"
								>
									/about
								</button>
								<button
									type="button"
									:class="['preset-btn', { 'is-active': activePreset === 'guests' }]"
									@click="selectPreset('/guests')"
								>
									/guests
								</button>
								<button
									type="button"
									:class="['preset-btn', { 'is-active': activePreset === 'platforms' }]"
									@click="selectPreset('/platforms')"
								>
									/platforms
								</button>
							</div>

							<!-- URL input bar -->
							<div class="preview-urlbar">
								<span class="urlbar-origin">{{ clientBaseUrl }}</span>
								<input
									v-model="previewPathInput"
									class="urlbar-input"
									placeholder="/about"
									@keydown.enter="applyCustomPath"
									@blur="applyCustomPath"
								/>
								<button type="button" class="urlbar-btn" title="Обновить iframe (проверка сохранения)" @click="reloadIframe">
									<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
										<path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
									</svg>
								</button>
							</div>
						</div>

						<div class="preview-panel__controls">
							<button
								:class="['device-btn', { 'is-active': previewDevice === 'desktop' }]"
								title="Desktop"
								@click="previewDevice = 'desktop'"
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/>
									<path d="M8 21H16M12 17V21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
								</svg>
							</button>
							<button
								:class="['device-btn', { 'is-active': previewDevice === 'tablet' }]"
								title="Tablet"
								@click="previewDevice = 'tablet'"
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" stroke-width="1.5"/>
									<circle cx="12" cy="18" r="1" fill="currentColor"/>
								</svg>
							</button>
							<button
								:class="['device-btn', { 'is-active': previewDevice === 'mobile' }]"
								title="Mobile"
								@click="previewDevice = 'mobile'"
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" stroke-width="1.5"/>
									<circle cx="12" cy="18" r="1" fill="currentColor"/>
									<path d="M9 5H15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
								</svg>
							</button>
							<button class="device-btn" title="Open in new tab" @click="openInNewTab">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M18 13V19C18 19.5523 17.5523 20 17 20H5C4.44772 20 4 19.5523 4 19V7C4 6.44772 4.44772 6 5 6H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
									<path d="M15 4H20M20 4V9M20 4L10 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
								</svg>
							</button>
						</div>
					</div>
					<div class="preview-panel__viewport" :class="`is-${previewDevice}`">
						<iframe
							ref="splitIframeRef"
							:src="previewUrl"
							class="preview-panel__iframe"
							@load="onIframeLoad"
						/>
					</div>
				</div>
			</transition>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useEntityLock, type ContentSchema } from '@admin-panel/lib'
import { ElMessage } from 'element-plus'

import { ContentEditor } from '#features/content-editor'

import { contentApi } from '#entities/content'

const route = useRoute()
const router = useRouter()
const schemaIdentifier = route.params.schemaIdentifier as string
const entryId = ref<string | undefined>(route.params.id as string | undefined)

const isEdit = computed(() => !!entryId.value)
const schema = ref<ContentSchema | null>(null)
const formData = reactive<Record<string, any>>({})
const errors = ref<Record<string, string[]>>({})
const isSaving = ref(false)
const entryStatus = ref('draft')
const i18nData = reactive<Record<string, any>>({})

const lockEntityId = computed(() => (isEdit.value && entryId.value ? String(entryId.value) : ''))
const { isLocked, isLockedByOther, lockedByName, forceUnlock } = useEntityLock('entry', lockEntityId)

// Split preview state — driven from ContentEditor button
const isSplitPreview = ref(false)
const previewDevice = ref<'desktop' | 'tablet' | 'mobile'>('desktop')
const splitIframeRef = ref<HTMLIFrameElement | null>(null)
const iframeReady = ref(false)

const clientBaseUrl = computed(() => import.meta.env.VITE_CLIENT_URL || 'http://localhost:3000')
const previewPathInput = ref('/about')
const activePreset = ref('about')

// Auto-detect default preset from schema slug/name
const autoDetectPreset = () => {
	const currentSlug = (schema.value?.slug || schemaIdentifier || '').toLowerCase()
	const schemaName = (schema.value?.name || '').toLowerCase()

	if (currentSlug.includes('guest')) {
		activePreset.value = 'guests'
		previewPathInput.value = '/guests'
	} else if (currentSlug.includes('platform') && !currentSlug.includes('about')) {
		activePreset.value = 'platforms'
		previewPathInput.value = '/platforms'
	} else {
		// Default to /about for any about schema, pageAbout, page_about or generic page
		activePreset.value = 'about'
		previewPathInput.value = '/about'
	}
}

const previewUrl = computed(() => {
	const base = clientBaseUrl.value.replace(/\/$/, '')
	let path = (previewPathInput.value || '/about').trim()
	if (!path.startsWith('/')) path = `/${path}`

	// Always append preview=true query so client composables know they are in preview mode
	const sep = path.includes('?') ? '&' : '?'
	if (!path.includes('preview=')) {
		return `${base}${path}${sep}preview=true`
	}
	return `${base}${path}`
})

const selectPreset = (path: string) => {
	previewPathInput.value = path
	activePreset.value = path.replace('/', '')
	reloadIframe()
}

const applyCustomPath = () => {
	activePreset.value = ''
	reloadIframe()
}

const reloadIframe = () => {
	if (splitIframeRef.value) {
		iframeReady.value = false
		const targetUrl = previewUrl.value
		splitIframeRef.value.src = 'about:blank'
		setTimeout(() => {
			if (splitIframeRef.value) {
				splitIframeRef.value.src = targetUrl
			}
		}, 60)
	}
}

const openedPreviewWindow = ref<Window | null>(null)

const openInNewTab = () => {
	openedPreviewWindow.value = window.open(previewUrl.value, '_blank')
}

// Send draft data to iframe and opened tab
const sendPreviewData = () => {
	const payload = JSON.parse(JSON.stringify({
		data: formData,
		schema: schema.value,
	}))

	const iframe = splitIframeRef.value
	if (isSplitPreview.value && iframe?.contentWindow) {
		iframe.contentWindow.postMessage({ type: 'CMS_PREVIEW_DATA', payload }, '*')
	}

	if (openedPreviewWindow.value && !openedPreviewWindow.value.closed) {
		openedPreviewWindow.value.postMessage({ type: 'CMS_PREVIEW_DATA', payload }, '*')
	}
}

const onIframeLoad = () => {
	iframeReady.value = true
	sendPreviewData()
	setTimeout(sendPreviewData, 200)
}

// Listen for PREVIEW_READY signal from client
const handlePreviewMessage = (event: MessageEvent) => {
	if (event.data?.type === 'PREVIEW_READY') {
		iframeReady.value = true
		sendPreviewData()
	}
}

watch(isSplitPreview, (val) => {
	if (val) {
		autoDetectPreset()
		iframeReady.value = false
		window.addEventListener('message', handlePreviewMessage)
		// Small delay to ensure iframe receives draft once ready
		setTimeout(sendPreviewData, 350)
	} else {
		window.removeEventListener('message', handlePreviewMessage)
		iframeReady.value = false
	}
})

// Reactively push changes to iframe whenever formData changes
watch(
	() => ({ ...formData }),
	() => {
		if (isSplitPreview.value) {
			sendPreviewData()
		}
	},
	{ deep: true }
)

const fetchData = async () => {
	try {
		const schemaRes = await contentApi.getSchemaByIdentifier(schemaIdentifier)

		if (schemaRes.data) {
			schema.value = schemaRes.data
			autoDetectPreset()

			if (isEdit.value && entryId.value) {
				const entryRes = await contentApi.getEntry(entryId.value)

				if (entryRes.data) {
					// Clear and merge to keep reactivity
					Object.keys(formData).forEach((key) => delete formData[key])

					Object.assign(formData, entryRes.data.data)

					entryStatus.value = entryRes.data.status

					if (entryRes.data.i18n) {
						Object.keys(i18nData).forEach((k) => delete i18nData[k])

						Object.assign(i18nData, entryRes.data.i18n)
					}
				}
			}
		}
	} catch (error: any) {
		ElMessage.error(error.messages?.[0] || 'Failed to fetch editor data')
	}
}

const onSave = async (seoData?: any) => {
	if (!schema.value) return
	if (isLockedByOther.value) {
		ElMessage.warning(`Запись заблокирована пользователем ${lockedByName.value || 'другим администратором'}`)
		return
	}
	isSaving.value = true

	errors.value = {}

	// Merge SEO data into formData
	const finalData = {
		...formData,
		_seo: seoData,
	}

	try {
		const payload = {
			data: finalData,
			status: entryStatus.value,
			i18n: i18nData,
		}

		if (isEdit.value && entryId.value) {
			await contentApi.updateEntry(entryId.value, payload)
			ElMessage.success('Запись сохранена в БД! Изменения применены.')
		} else {
			// Generate a slug for the entry
			const entrySlug = `${schema.value.slug}-entry-${Date.now()}`

			const res = await contentApi.createEntry({
				schema_id: schema.value.id,
				slug: entrySlug,
				...payload,
			})

			ElMessage.success('Запись успешно создана и сохранена!')
			if (res.data?.id) {
				entryId.value = res.data.id
				router.replace({
					name: 'EntryEdit',
					params: { schemaIdentifier: schema.value.slug, id: res.data.id },
				})
			}
		}

		// Keep iframe synced
		sendPreviewData()

		// If NOT in split preview, return back to list
		if (!isSplitPreview.value) {
			goBack()
		}
	} catch (error: any) {
		errors.value = error.errors || {}
		ElMessage.error(error.messages?.[0] || 'Failed to save entry')
	} finally {
		isSaving.value = false
	}
}

const goBack = () => {
	router.push({ name: 'EntriesList', params: { schemaIdentifier } })
}

onMounted(fetchData)
</script>

<style scoped lang="scss">
.content-editor-page {
	height: calc(100vh - 64px);
	overflow-y: auto;
	background: var(--gp-bg-main, #0f1117);

	&.is-split {
		overflow: hidden;
	}
}

.page-content {
	display: block;
	max-width: 1400px;
	margin: 0 auto;
	padding: 16px;
	height: 100%;

	&.is-split {
		max-width: 100%;
		padding: 12px 16px;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
		height: 100%;
		box-sizing: border-box;
	}
}

.editor-panel {
	min-width: 0;
	height: 100%;
	overflow-y: auto;
}

/* Split preview panel */
.preview-panel {
	border-radius: 12px;
	border: 1px solid var(--gp-glass-border, rgba(255,255,255,0.08));
	background: var(--gp-surface-card, #161b26);
	box-shadow: 0 8px 32px rgba(0,0,0,0.35);
	overflow: hidden;
	display: flex;
	flex-direction: column;
	max-height: calc(100vh - 32px);
}

.preview-panel__header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 10px 14px;
	border-bottom: 1px solid var(--gp-glass-border, rgba(255,255,255,0.06));
	background: rgba(255,255,255,0.03);
	flex-shrink: 0;
	gap: 12px;
}

.preview-panel__title {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 13px;
	font-weight: 600;
	color: var(--gp-text-secondary, #94a3b8);
	white-space: nowrap;
}

.preview-panel__badge {
	font-size: 9px;
	font-weight: 800;
	letter-spacing: 0.12em;
	color: #a5b4fc;
	background: rgba(99, 102, 241, 0.15);
	border: 1px solid rgba(99, 102, 241, 0.35);
	border-radius: 4px;
	padding: 2px 6px;
}

.preview-panel__name {
	max-width: 120px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.preview-panel__center {
	display: flex;
	align-items: center;
	gap: 8px;
	flex: 1;
	max-width: 480px;
	min-width: 0;
}

.preview-presets {
	display: flex;
	align-items: center;
	gap: 4px;
	flex-shrink: 0;
}

.preset-btn {
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 4px;
	padding: 3px 8px;
	font-size: 11px;
	font-weight: 500;
	color: var(--gp-text-secondary, #94a3b8);
	cursor: pointer;
	transition: all 0.15s ease;

	&:hover {
		background: rgba(255, 255, 255, 0.1);
		color: #fff;
	}

	&.is-active {
		background: rgba(99, 102, 241, 0.2);
		border-color: rgba(99, 102, 241, 0.5);
		color: #a5b4fc;
	}
}

.preview-urlbar {
	display: flex;
	align-items: center;
	flex: 1;
	background: rgba(15, 23, 42, 0.6);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 6px;
	padding: 2px 6px 2px 10px;
	gap: 4px;
	min-width: 0;

	.urlbar-origin {
		font-size: 11px;
		color: var(--gp-text-secondary, #64748b);
		white-space: nowrap;
		user-select: none;
	}

	.urlbar-input {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		font-size: 12px;
		color: #e2e8f0;
		font-family: monospace;
		min-width: 50px;
	}

	.urlbar-btn {
		background: transparent;
		border: none;
		color: var(--gp-text-secondary, #94a3b8);
		cursor: pointer;
		display: flex;
		align-items: center;
		padding: 3px;
		border-radius: 4px;
		transition: all 0.15s ease;

		&:hover {
			background: rgba(255, 255, 255, 0.1);
			color: #38bdf8;
		}
	}
}

.preview-panel__controls {
	display: flex;
	align-items: center;
	gap: 4px;
	flex-shrink: 0;
}

.device-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 30px;
	height: 30px;
	border-radius: 6px;
	border: none;
	background: transparent;
	color: var(--gp-text-secondary, #64748b);
	cursor: pointer;
	transition: all 0.15s ease;
	text-decoration: none;

	&:hover {
		background: rgba(255, 255, 255, 0.06);
		color: var(--gp-text-main, #e2e8f0);
	}

	&.is-active {
		background: rgba(99, 102, 241, 0.15);
		color: #a5b4fc;
	}
}

.preview-panel__viewport {
	flex: 1;
	overflow: auto;
	background: #f1f5f9;
	display: flex;
	align-items: flex-start;
	justify-content: center;
	transition: all 0.3s ease;
	min-height: 500px;

	&.is-tablet,
	&.is-mobile {
		padding: 20px;
		background: #0f1117;
	}
}

.preview-panel__iframe {
	width: 100%;
	height: 100%;
	min-height: 560px;
	border: none;
	background: #fff;
	display: block;
	transition: all 0.3s ease;
}

.preview-panel__viewport.is-tablet .preview-panel__iframe {
	max-width: 768px;
	border-radius: 16px;
	border: 6px solid #334155;
	box-shadow: 0 20px 60px rgba(0,0,0,0.5);
	min-height: 600px;
}

.preview-panel__viewport.is-mobile .preview-panel__iframe {
	max-width: 390px;
	border-radius: 32px;
	border: 8px solid #334155;
	box-shadow: 0 20px 60px rgba(0,0,0,0.5);
	min-height: 667px;
}

/* Slide-in transition */
.preview-slide-enter-active,
.preview-slide-leave-active {
	transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.preview-slide-enter-from,
.preview-slide-leave-to {
	opacity: 0;
	transform: translateX(24px);
}

.lock-banner {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 10px 16px;
	margin-bottom: 16px;
	border-radius: 8px;
	background: rgba(245, 158, 11, 0.12);
	border: 1px solid rgba(245, 158, 11, 0.3);
	color: #f59e0b;
	font-size: 13px;

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
