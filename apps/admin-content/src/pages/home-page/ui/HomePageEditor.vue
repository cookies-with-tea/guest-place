<template>
	<div class="home-page-editor">
		<!-- Top Navigation Bar -->
		<header class="editor-topbar">
			<div class="editor-topbar__left">
				<el-button plain @click="$router.push('/pages')">
					← К страницам
				</el-button>
				<span class="live-pill">⚡ LIVE РЕДАКТОР</span>
				<h1 class="editor-title">Главная страница</h1>
				<span class="preview-route-pill">/ (Home)</span>
			</div>

			<div class="editor-topbar__right">
				<!-- Split Screen Toggle & Sizing -->
				<div class="split-controls">
					<button
						type="button"
						class="split-btn"
						:class="{ active: splitRatio === '50-50' }"
						title="Равный сплит (50% / 50%)"
						@click="setSplitRatio('50-50')"
					>
						◫ 50:50
					</button>
					<button
						type="button"
						class="split-btn"
						:class="{ active: splitRatio === '60-40' }"
						title="Широкая форма (60% / 40%)"
						@click="setSplitRatio('60-40')"
					>
						◧ 60:40
					</button>
					<button
						type="button"
						class="split-btn"
						:class="{ active: splitRatio === 'full' }"
						title="Только форма (100%)"
						@click="setSplitRatio('full')"
					>
						⛶ 100%
					</button>
				</div>

				<el-button plain :icon="Refresh" title="Перезагрузить данные из БД" @click="fetchData">
					Обновить
				</el-button>

				<el-button type="success" plain @click="openClientPreview">
					🌐 На сайт ↗
				</el-button>

				<el-button type="primary" :icon="Check" :loading="saving" @click="handleSave">
					💾 Сохранить изменения
				</el-button>
			</div>
		</header>

		<!-- Main Split Container -->
		<div class="editor-container" :class="[`split-${splitRatio}`]">
			<!-- LEFT: Form Pane -->
			<div class="editor-form-pane">
				<div v-if="loading" class="editor-loading">
					<el-skeleton :rows="10" animated />
				</div>

				<div v-else class="form-scrollable-content">
					<!-- Pill Tabs Navigation -->
					<div class="editor-tabs-nav">
						<button
							type="button"
							class="tab-nav-btn"
							:class="{ active: activeTab === 'hero' }"
							@click="activeTab = 'hero'"
						>
							<span class="tab-icon">🌟</span>
							<span class="tab-label">Первый экран (Hero)</span>
						</button>
						<button
							type="button"
							class="tab-nav-btn"
							:class="{ active: activeTab === 'categories' }"
							@click="activeTab = 'categories'"
						>
							<span class="tab-icon">📂</span>
							<span class="tab-label">Категории</span>
							<span class="tab-badge">{{ form.categories.length }}</span>
						</button>
						<button
							type="button"
							class="tab-nav-btn"
							:class="{ active: activeTab === 'latest' }"
							@click="activeTab = 'latest'"
						>
							<span class="tab-icon">🆕</span>
							<span class="tab-label">Последние</span>
						</button>
						<button
							type="button"
							class="tab-nav-btn"
							:class="{ active: activeTab === 'popular' }"
							@click="activeTab = 'popular'"
						>
							<span class="tab-icon">🔥</span>
							<span class="tab-label">Популярные</span>
						</button>
						<button
							type="button"
							class="tab-nav-btn"
							:class="{ active: activeTab === 'interactions' }"
							@click="activeTab = 'interactions'"
						>
							<span class="tab-icon">🎯</span>
							<span class="tab-label">Сценарии</span>
							<span class="tab-badge">{{ form.interactions.length }}</span>
						</button>
						<button
							type="button"
							class="tab-nav-btn"
							:class="{ active: activeTab === 'banner' }"
							@click="activeTab = 'banner'"
						>
							<span class="tab-icon">📢</span>
							<span class="tab-label">Нижний баннер</span>
						</button>
					</div>

					<!-- TAB 1: HERO SCREEN -->
					<div v-show="activeTab === 'hero'" class="tab-pane-content">
						<div class="editor-glass-card">
							<div class="card-head">
								<div class="card-head__icon">🌟</div>
								<div class="card-head__text">
									<h3>Заголовок и кнопки первого экрана</h3>
									<p>Главный месседж, подзаголовок и целевые действия пользователя</p>
								</div>
							</div>
							<el-form label-position="top">
								<el-form-item label="Главный заголовок">
									<el-input
										v-model="form.title"
										placeholder="СОЦИАЛЬНАЯ ИНТЕРАКТИВНАЯ ПЛАТФОРМА"
										size="large"
										@input="syncLivePreview"
									/>
								</el-form-item>
								<el-form-item label="Подзаголовок">
									<el-input
										v-model="form.subtitle"
										type="textarea"
										:rows="3"
										placeholder="Соединяем гостей и места&#10;Общение, бронирование здесь и сейчас"
										@input="syncLivePreview"
									/>
								</el-form-item>
								<el-row :gutter="16">
									<el-col :span="12">
										<el-form-item label="Кнопка «На карте»">
											<el-input
												v-model="form.heroMapButtonText"
												placeholder="Показать на карте"
												@input="syncLivePreview"
											/>
										</el-form-item>
									</el-col>
									<el-col :span="12">
										<el-form-item label="Кнопка «Списком»">
											<el-input
												v-model="form.heroListButtonText"
												placeholder="Показать списком"
												@input="syncLivePreview"
											/>
										</el-form-item>
									</el-col>
								</el-row>
							</el-form>
						</div>

						<div class="editor-glass-card">
							<div class="card-head">
								<div class="card-head__icon">🖼️</div>
								<div class="card-head__text">
									<h3>Медиа и иллюстрация первого экрана</h3>
									<p>Фоновое изображение или визуальный гайд по каталогу</p>
								</div>
							</div>
							<div class="media-wrap">
								<UiMediaPicker v-model="form.heroGuideUuid" @update:model-value="syncLivePreview" />
								<p class="field-hint">Изображение или графический референс первого экрана</p>
							</div>
						</div>
					</div>

					<!-- TAB 2: CATEGORIES -->
					<div v-show="activeTab === 'categories'" class="tab-pane-content">
						<div class="editor-glass-card">
							<div class="card-head">
								<div class="card-head__icon">📂</div>
								<div class="card-head__text">
									<h3>Секция «Места по категориям»</h3>
									<p>Управление быстрым выбором типа площадок</p>
								</div>
								<el-button type="primary" size="small" :icon="Plus" @click="addCategory">
									Добавить категорию
								</el-button>
							</div>

							<el-form label-position="top">
								<el-form-item label="Заголовок секции">
									<el-input
										v-model="form.categoriesTitle"
										placeholder="Места по категориям"
										@input="syncLivePreview"
									/>
								</el-form-item>
							</el-form>

							<div class="categories-grid">
								<div
									v-for="(cat, idx) in form.categories"
									:key="cat.id || idx"
									class="item-glass-card"
								>
									<div class="item-glass-card__head">
										<span class="item-num">#{{ idx + 1 }}</span>
										<el-button
											type="danger"
											link
											size="small"
											:icon="Delete"
											@click="removeCategory(idx)"
										>
											Удалить
										</el-button>
									</div>
									<el-form label-position="top" size="small">
										<el-form-item label="Название категории">
											<el-input
												v-model="cat.title"
												placeholder="Банкетные залы"
												@input="syncLivePreview"
											/>
										</el-form-item>
										<el-row :gutter="12">
											<el-col :span="12">
												<el-form-item label="Слаг">
													<el-input
														v-model="cat.slug"
														placeholder="banquet-halls"
														@input="syncLivePreview"
													/>
												</el-form-item>
											</el-col>
											<el-col :span="12">
												<el-form-item label="Ссылка">
													<el-input
														v-model="cat.link"
														placeholder="/venues?type=..."
														@input="syncLivePreview"
													/>
												</el-form-item>
											</el-col>
										</el-row>
									</el-form>
								</div>
							</div>
						</div>
					</div>

					<!-- TAB 3: LATEST VENUES SECTION -->
					<div v-show="activeTab === 'latest'" class="tab-pane-content">
						<div class="editor-glass-card">
							<div class="card-head">
								<div class="card-head__icon">🆕</div>
								<div class="card-head__text">
									<h3>Блок «Последние добавленные»</h3>
									<p>Настройки заголовка и кнопки перехода в полный каталог</p>
								</div>
							</div>
							<el-form label-position="top">
								<el-form-item label="Заголовок секции">
									<el-input
										v-model="form.latestSectionTitle"
										placeholder="Последние добавленные"
										@input="syncLivePreview"
									/>
								</el-form-item>
								<el-row :gutter="16">
									<el-col :span="12">
										<el-form-item label="Текст кнопки">
											<el-input
												v-model="form.latestSectionButtonText"
												placeholder="Показать еще"
												@input="syncLivePreview"
											/>
										</el-form-item>
									</el-col>
									<el-col :span="12">
										<el-form-item label="Ссылка кнопки">
											<el-input
												v-model="form.latestSectionButtonLink"
												placeholder="/venues"
												@input="syncLivePreview"
											/>
										</el-form-item>
									</el-col>
								</el-row>
							</el-form>

							<div class="info-callout">
								💡 Карточки площадок формируются автоматически из базы данных по дате добавления (4 последних активных площадки).
							</div>
						</div>
					</div>

					<!-- TAB 4: POPULAR VENUES SECTION -->
					<div v-show="activeTab === 'popular'" class="tab-pane-content">
						<div class="editor-glass-card">
							<div class="card-head">
								<div class="card-head__icon">🔥</div>
								<div class="card-head__text">
									<h3>Блок «Самые популярные»</h3>
									<p>Настройки заголовка и ссылки на каталог популярных мест</p>
								</div>
							</div>
							<el-form label-position="top">
								<el-form-item label="Заголовок секции">
									<el-input
										v-model="form.popularSectionTitle"
										placeholder="Самые популярные"
										@input="syncLivePreview"
									/>
								</el-form-item>
								<el-row :gutter="16">
									<el-col :span="12">
										<el-form-item label="Текст кнопки">
											<el-input
												v-model="form.popularSectionButtonText"
												placeholder="В каталог"
												@input="syncLivePreview"
											/>
										</el-form-item>
									</el-col>
									<el-col :span="12">
										<el-form-item label="Ссылка кнопки">
											<el-input
												v-model="form.popularSectionButtonLink"
												placeholder="/venues"
												@input="syncLivePreview"
											/>
										</el-form-item>
									</el-col>
								</el-row>
							</el-form>

							<div class="info-callout">
								💡 Карточки формируются автоматически по наивысшему рейтингу и числу отзывов.
							</div>
						</div>
					</div>

					<!-- TAB 5: INTERACTIONS (Сценарии) -->
					<div v-show="activeTab === 'interactions'" class="tab-pane-content">
						<div class="editor-glass-card">
							<div class="card-head">
								<div class="card-head__icon">🎯</div>
								<div class="card-head__text">
									<h3>Варианты взаимодействия с платформой</h3>
									<p>Шаги 1-4: Самостоятельный поиск, Интерактивная карта, Помощь эксперта, Подбор в чате</p>
								</div>
								<el-button type="primary" size="small" :icon="Plus" @click="addInteraction">
									Добавить шаг
								</el-button>
							</div>

							<el-form label-position="top">
								<el-form-item label="Общий заголовок секции">
									<el-input
										v-model="form.interactionsTitle"
										placeholder="Варианты взаимодействия с GP Platform"
										@input="syncLivePreview"
									/>
								</el-form-item>
							</el-form>

							<div class="interactions-grid">
								<div
									v-for="(item, idx) in form.interactions"
									:key="item.id || idx"
									class="item-glass-card"
								>
									<div class="item-glass-card__head">
										<span class="step-badge">Шаг {{ item.stepNumber }}</span>
										<el-switch
											v-model="item.isAccent"
											active-text="Акцент"
											size="small"
											@change="syncLivePreview"
										/>
										<el-button
											type="danger"
											link
											size="small"
											:icon="Delete"
											@click="removeInteraction(idx)"
										>
											✕
										</el-button>
									</div>

									<el-form label-position="top" size="small">
										<el-form-item label="Заголовок шага">
											<el-input
												v-model="item.title"
												placeholder="Самостоятельный поиск и бронирование"
												@input="syncLivePreview"
											/>
										</el-form-item>
										<el-form-item label="Описание">
											<el-input
												v-model="item.text"
												type="textarea"
												:rows="2"
												placeholder="Описание сценария..."
												@input="syncLivePreview"
											/>
										</el-form-item>
										<el-row :gutter="12">
											<el-col :span="12">
												<el-form-item label="Текст кнопки">
													<el-input
														v-model="item.buttonText"
														placeholder="Каталог поиска"
														@input="syncLivePreview"
													/>
												</el-form-item>
											</el-col>
											<el-col :span="12">
												<el-form-item label="Ссылка">
													<el-input
														v-model="item.link"
														placeholder="/venues"
														@input="syncLivePreview"
													/>
												</el-form-item>
											</el-col>
										</el-row>
									</el-form>
								</div>
							</div>
						</div>
					</div>

					<!-- TAB 6: BANNER -->
					<div v-show="activeTab === 'banner'" class="tab-pane-content">
						<div class="editor-glass-card">
							<div class="card-head">
								<div class="card-head__icon">📢</div>
								<div class="card-head__text">
									<h3>Финальный промо-баннер</h3>
									<p>Блок доверия и одновременного поиска внизу страницы</p>
								</div>
							</div>
							<el-form label-position="top">
								<el-form-item label="Заголовок баннера">
									<el-input
										v-model="form.bannerTitle"
										type="textarea"
										:rows="2"
										placeholder="Для быстрого поиска Вы можете пользоваться всеми вариантами одновременно."
										@input="syncLivePreview"
									/>
								</el-form-item>
								<el-form-item label="Слоган / Текст баннера">
									<el-input
										v-model="form.bannerText"
										type="textarea"
										:rows="2"
										placeholder="GP Платформа позволяет общаться напрямую здесь и сейчас. Мы за «прозрачные отношения»"
										@input="syncLivePreview"
									/>
								</el-form-item>
							</el-form>
						</div>

						<div class="editor-glass-card">
							<div class="card-head">
								<div class="card-head__icon">🎨</div>
								<div class="card-head__text">
									<h3>Фоновая графика баннера</h3>
									<p>Изображение для фона или плашки</p>
								</div>
							</div>
							<div class="media-wrap">
								<UiMediaPicker v-model="form.bannerGuideUuid" @update:model-value="syncLivePreview" />
								<p class="field-hint">Фоновое изображение или иконка нижнего блока</p>
							</div>
						</div>
					</div>
				</div>

				<!-- Floating Bottom Actions Bar -->
				<div class="form-bottom-actions">
					<div class="bottom-sync-status">
						<span class="sync-dot"></span>
						<span class="sync-label">Live Preview активен</span>
					</div>

					<div class="bottom-buttons">
						<el-button plain @click="$router.push('/pages')">
							✕ Отмена
						</el-button>
						<el-button
							type="primary"
							size="large"
							:loading="saving"
							@click="handleSave"
						>
							💾 Сохранить изменения
						</el-button>
					</div>
				</div>
			</div>

			<!-- RIGHT: Live Preview Iframe Pane -->
			<div v-if="splitRatio !== 'full'" class="editor-preview-pane">
				<!-- Preview Toolbar -->
				<div class="preview-toolbar">
					<div class="preview-toolbar__url">
						<span class="origin-tag">Nuxt 3 Client</span>
						<span class="url-path">/ (Home Page)</span>
						<button
							type="button"
							class="icon-action-btn"
							title="Перезагрузить страницу в фрейме"
							@click="reloadPreviewIframe"
						>
							↻
						</button>
					</div>

					<div class="preview-toolbar__devices">
						<button
							type="button"
							class="device-chip"
							:class="{ active: previewDevice === 'desktop' }"
							title="Десктоп (100%)"
							@click="previewDevice = 'desktop'"
						>
							🖥️ Desktop
						</button>
						<button
							type="button"
							class="device-chip"
							:class="{ active: previewDevice === 'tablet' }"
							title="Планшет (768px)"
							@click="previewDevice = 'tablet'"
						>
							📱 Tablet
						</button>
						<button
							type="button"
							class="device-chip"
							:class="{ active: previewDevice === 'mobile' }"
							title="Смартфон (375px)"
							@click="previewDevice = 'mobile'"
						>
							📱 Mobile
						</button>
						<button
							type="button"
							class="device-chip link-chip"
							title="Открыть в новой вкладке браузера"
							@click="openClientPreview"
						>
							↗ Вкладка
						</button>
					</div>
				</div>

				<!-- Preview Iframe Viewport Frame -->
				<div class="preview-viewport-shell" :class="`device-${previewDevice}`">
					<iframe
						ref="previewIframeRef"
						:src="previewUrl"
						class="preview-iframe"
						@load="onIframeLoad"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Check, Refresh, Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { createApi } from '@admin-panel/lib'
import { UiMediaPicker } from '@admin-panel/ui'

const router = useRouter()
const { fetchData: apiFetch } = createApi('home')

const activeTab = ref('hero')
const loading = ref(false)
const saving = ref(false)
const splitRatio = ref<'50-50' | '60-40' | 'full'>('50-50')
const previewDevice = ref<'desktop' | 'tablet' | 'mobile'>('desktop')
const previewIframeRef = ref<HTMLIFrameElement | null>(null)

const clientBaseUrl = computed(() => (import.meta.env.VITE_CLIENT_URL || 'http://localhost:3000').replace(/\/$/, ''))
const previewUrl = computed(() => `${clientBaseUrl.value}/?preview=true`)

const form = reactive({
	title: '',
	subtitle: '',
	heroMapButtonText: '',
	heroListButtonText: '',
	heroGuideUuid: null as string | null,

	categoriesTitle: '',
	categories: [] as Array<{
		id?: number
		title: string
		slug: string
		link: string
		iconUuid?: string | null
		sortOrder?: number
	}>,

	latestSectionTitle: '',
	latestSectionButtonText: '',
	latestSectionButtonLink: '',

	popularSectionTitle: '',
	popularSectionButtonText: '',
	popularSectionButtonLink: '',

	interactionsTitle: '',
	interactions: [] as Array<{
		id?: number
		stepNumber: number
		title: string
		text: string
		buttonText: string
		link: string
		isAccent: boolean
		sortOrder?: number
	}>,

	bannerTitle: '',
	bannerText: '',
	bannerGuideUuid: null as string | null,
})

const setSplitRatio = (ratio: '50-50' | '60-40' | 'full') => {
	splitRatio.value = ratio
}

// -------------------------------------------------------------
// Live Preview Synchronization
// -------------------------------------------------------------
let syncTimer: any = null
const syncLivePreview = () => {
	if (splitRatio.value === 'full') return
	clearTimeout(syncTimer)
	syncTimer = setTimeout(() => {
		const iframe = previewIframeRef.value
		if (!iframe?.contentWindow) return
		iframe.contentWindow.postMessage(
			{
				type: 'GP_HOME_LIVE_PREVIEW',
				payload: JSON.parse(JSON.stringify(form)),
			},
			'*'
		)
	}, 100)
}

const onIframeLoad = () => {
	syncLivePreview()
}

const reloadPreviewIframe = () => {
	if (previewIframeRef.value) {
		const target = previewUrl.value
		previewIframeRef.value.src = 'about:blank'
		setTimeout(() => {
			if (previewIframeRef.value) {
				previewIframeRef.value.src = target
			}
		}, 80)
	}
}

// -------------------------------------------------------------
// Data Fetch & Save
// -------------------------------------------------------------
const fetchData = async () => {
	loading.value = true
	try {
		const response = await apiFetch<any>('')
		if (response.data) {
			const d = response.data
			form.title = d.title || ''
			form.subtitle = d.subtitle || ''
			form.heroMapButtonText = d.heroMapButtonText || 'Показать на карте'
			form.heroListButtonText = d.heroListButtonText || 'Показать списком'
			form.heroGuideUuid = d.heroGuideUuid || null

			form.categoriesTitle = d.categoriesTitle || 'Места по категориям'
			form.categories = (d.categories || []).map((c: any) => ({
				id: c.id,
				title: c.title,
				slug: c.slug,
				link: c.link,
				iconUuid: c.iconUuid || c.icon_uuid || null,
				sortOrder: c.sortOrder || c.sort_order || 0,
			}))

			form.latestSectionTitle = d.latestSectionTitle || 'Последние добавленные'
			form.latestSectionButtonText = d.latestSectionButtonText || 'Показать еще'
			form.latestSectionButtonLink = d.latestSectionButtonLink || '/venues'

			form.popularSectionTitle = d.popularSectionTitle || 'Самые популярные'
			form.popularSectionButtonText = d.popularSectionButtonText || 'В каталог'
			form.popularSectionButtonLink = d.popularSectionButtonLink || '/venues'

			form.interactionsTitle = d.interactionsTitle || 'Варианты взаимодействия с GP Platform'
			form.interactions = (d.interactions || []).map((item: any) => ({
				id: item.id,
				stepNumber: item.stepNumber || item.step_number || 1,
				title: item.title,
				text: item.text,
				buttonText: item.buttonText || item.button_text,
				link: item.link,
				isAccent: !!(item.isAccent ?? item.is_accent),
				sortOrder: item.sortOrder || item.sort_order || 0,
			}))

			form.bannerTitle = d.bannerTitle || ''
			form.bannerText = d.bannerText || ''
			form.bannerGuideUuid = d.bannerGuideUuid || null
		}
		syncLivePreview()
	} catch (err: any) {
		ElMessage.error(err.message || 'Ошибка загрузки данных главной страницы')
	} finally {
		loading.value = false
	}
}

const handleSave = async () => {
	saving.value = true
	try {
		await apiFetch('', {
			method: 'PUT',
			body: form,
		})
		ElMessage.success('Контент главной страницы успешно сохранён!')
		reloadPreviewIframe()
	} catch (err: any) {
		ElMessage.error(err.message || 'Не удалось сохранить изменения')
	} finally {
		saving.value = false
	}
}

const addCategory = () => {
	form.categories.push({
		title: '',
		slug: '',
		link: '/venues',
		iconUuid: null,
		sortOrder: form.categories.length + 1,
	})
	syncLivePreview()
}

const removeCategory = (idx: number) => {
	form.categories.splice(idx, 1)
	syncLivePreview()
}

const addInteraction = () => {
	form.interactions.push({
		stepNumber: form.interactions.length + 1,
		title: '',
		text: '',
		buttonText: 'Подробнее',
		link: '/venues',
		isAccent: false,
		sortOrder: form.interactions.length + 1,
	})
	syncLivePreview()
}

const removeInteraction = (idx: number) => {
	form.interactions.splice(idx, 1)
	syncLivePreview()
}

const openClientPreview = () => {
	window.open(clientBaseUrl.value, '_blank')
}

onMounted(fetchData)
</script>

<style scoped lang="scss">
.home-page-editor {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: calc(100vh - 60px);
	background: var(--gp-bg-main, #0b1120);
	overflow: hidden;
	color: var(--gp-text-main, #f8fafc);
}

/* Top Bar */
.editor-topbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 24px;
	background: var(--gp-bg-surface, #1e293b);
	border-bottom: 1px solid var(--gp-glass-border, rgba(255, 255, 255, 0.08));
	flex-shrink: 0;
	z-index: 15;

	&__left {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	&__right {
		display: flex;
		align-items: center;
		gap: 10px;
	}
}

.live-pill {
	background: linear-gradient(135deg, #0ea5e9, #6366f1);
	color: #fff;
	font-size: 11px;
	font-weight: 700;
	padding: 4px 10px;
	border-radius: 6px;
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

.editor-title {
	margin: 0;
	font-size: 17px;
	font-weight: 600;
	color: var(--gp-text-main, #fff);
}

.preview-route-pill {
	font-size: 12px;
	padding: 2px 8px;
	border-radius: 4px;
	background: rgba(255, 255, 255, 0.06);
	color: var(--gp-text-secondary, #94a3b8);
}

/* Split Ratio Buttons */
.split-controls {
	display: flex;
	background: rgba(0, 0, 0, 0.25);
	padding: 2px;
	border-radius: 8px;
	border: 1px solid var(--gp-glass-border, rgba(255, 255, 255, 0.08));
}

.split-btn {
	background: transparent;
	border: none;
	color: var(--gp-text-secondary, #94a3b8);
	font-size: 12px;
	font-weight: 500;
	padding: 4px 10px;
	border-radius: 6px;
	cursor: pointer;
	transition: all 0.15s;

	&:hover {
		color: #fff;
	}

	&.active {
		background: var(--gp-primary, #42b883);
		color: #fff;
		font-weight: 600;
	}
}

/* Split Container */
.editor-container {
	display: flex;
	width: 100%;
	flex: 1;
	overflow: hidden;

	&.split-50-50 {
		.editor-form-pane {
			width: 50%;
			border-right: 1px solid var(--gp-glass-border, rgba(255, 255, 255, 0.08));
		}
		.editor-preview-pane {
			width: 50%;
		}
	}

	&.split-60-40 {
		.editor-form-pane {
			width: 60%;
			border-right: 1px solid var(--gp-glass-border, rgba(255, 255, 255, 0.08));
		}
		.editor-preview-pane {
			width: 40%;
		}
	}

	&.split-full {
		.editor-form-pane {
			width: 100%;
		}
		.editor-preview-pane {
			display: none;
		}
	}
}

/* Form Pane */
.editor-form-pane {
	height: 100%;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
	background: var(--gp-bg-main, #0b1120);
	position: relative;
}

.form-scrollable-content {
	flex: 1;
	padding: 24px;
	overflow-y: auto;
}

/* Tabs Navigation Pills */
.editor-tabs-nav {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin-bottom: 20px;
	padding-bottom: 16px;
	border-bottom: 1px solid var(--gp-glass-border, rgba(255, 255, 255, 0.08));
}

.tab-nav-btn {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	padding: 8px 14px;
	background: var(--gp-bg-surface, rgba(30, 41, 59, 0.5));
	border: 1px solid var(--gp-glass-border, rgba(255, 255, 255, 0.08));
	border-radius: 10px;
	color: var(--gp-text-secondary, #94a3b8);
	font-size: 13px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s;

	&:hover {
		color: var(--gp-text-main, #fff);
		background: rgba(255, 255, 255, 0.05);
	}

	&.active {
		background: rgba(66, 184, 131, 0.15);
		border-color: var(--gp-primary, #42b883);
		color: #fff;
		font-weight: 600;
		box-shadow: 0 0 16px rgba(66, 184, 131, 0.18);
	}
}

.tab-badge {
	background: rgba(0, 0, 0, 0.35);
	color: var(--gp-primary, #42b883);
	font-size: 11px;
	font-weight: 700;
	padding: 1px 6px;
	border-radius: 10px;
}

/* Glass Cards */
.editor-glass-card {
	background: var(--gp-bg-card, var(--gp-bg-surface, rgba(30, 41, 59, 0.5)));
	border: 1px solid var(--gp-glass-border, rgba(255, 255, 255, 0.08));
	border-radius: 14px;
	padding: 22px;
	margin-bottom: 20px;
	backdrop-filter: blur(12px);
}

.card-head {
	display: flex;
	align-items: flex-start;
	gap: 12px;
	margin-bottom: 18px;
	padding-bottom: 14px;
	border-bottom: 1px solid var(--gp-glass-border, rgba(255, 255, 255, 0.06));

	&__icon {
		font-size: 22px;
		line-height: 1;
	}

	&__text {
		flex: 1;

		h3 {
			margin: 0;
			font-size: 16px;
			font-weight: 600;
			color: var(--gp-text-main, #fff);
		}

		p {
			margin: 4px 0 0;
			font-size: 12px;
			color: var(--gp-text-secondary, #94a3b8);
		}
	}
}

.info-callout {
	margin-top: 14px;
	padding: 10px 14px;
	background: rgba(56, 189, 248, 0.08);
	border: 1px solid rgba(56, 189, 248, 0.2);
	border-radius: 8px;
	font-size: 13px;
	color: var(--gp-text-main, #f8fafc);
}

.field-hint {
	font-size: 12px;
	color: var(--gp-text-secondary, #94a3b8);
	margin: 8px 0 0;
}

/* Grids for Items */
.categories-grid,
.interactions-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
	gap: 16px;
	margin-top: 16px;
}

.item-glass-card {
	background: var(--gp-bg-element, rgba(15, 23, 42, 0.4));
	border: 1px solid var(--gp-glass-border, rgba(255, 255, 255, 0.08));
	border-radius: 12px;
	padding: 14px;

	&__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 10px;
	}
}

.item-num {
	font-size: 11px;
	font-weight: 700;
	color: var(--gp-primary, #42b883);
}

.step-badge {
	font-size: 12px;
	font-weight: 700;
	color: #38bdf8;
}

/* Floating Bottom Actions */
.form-bottom-actions {
	position: sticky;
	bottom: 0;
	background: rgba(15, 23, 42, 0.95);
	backdrop-filter: blur(16px);
	border-top: 1px solid var(--gp-glass-border, rgba(255, 255, 255, 0.08));
	padding: 14px 24px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	z-index: 10;
}

.bottom-sync-status {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 12px;
	color: var(--gp-text-secondary, #94a3b8);
}

.sync-dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: #10b981;
	box-shadow: 0 0 8px #10b981;
}

.bottom-buttons {
	display: flex;
	align-items: center;
	gap: 10px;
}

/* RIGHT: Preview Pane */
.editor-preview-pane {
	height: 100%;
	display: flex;
	flex-direction: column;
	background: #090e17;
}

.preview-toolbar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 10px 16px;
	background: var(--gp-bg-surface, #1e293b);
	border-bottom: 1px solid var(--gp-glass-border, rgba(255, 255, 255, 0.08));
	flex-shrink: 0;

	&__url {
		display: flex;
		align-items: center;
		gap: 8px;
		background: rgba(0, 0, 0, 0.35);
		padding: 4px 10px;
		border-radius: 6px;
		border: 1px solid var(--gp-glass-border, rgba(255, 255, 255, 0.06));
		font-size: 12px;
	}

	&__devices {
		display: flex;
		align-items: center;
		gap: 6px;
	}
}

.origin-tag {
	font-weight: 700;
	color: var(--gp-primary, #42b883);
	font-size: 11px;
}

.url-path {
	color: #e2e8f0;
}

.icon-action-btn {
	background: transparent;
	border: none;
	color: #94a3b8;
	cursor: pointer;
	font-size: 14px;
	padding: 0 4px;
	transition: color 0.15s;

	&:hover {
		color: #fff;
	}
}

.device-chip {
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid var(--gp-glass-border, rgba(255, 255, 255, 0.08));
	color: var(--gp-text-secondary, #94a3b8);
	font-size: 11px;
	padding: 4px 8px;
	border-radius: 6px;
	cursor: pointer;
	transition: all 0.15s;

	&:hover {
		color: #fff;
		background: rgba(255, 255, 255, 0.1);
	}

	&.active {
		background: var(--accent-primary, #0284c7);
		border-color: var(--accent-primary, #0284c7);
		color: #fff;
		font-weight: 600;
	}

	&.link-chip {
		color: #10b981;
		border-color: rgba(16, 185, 129, 0.3);
		background: rgba(16, 185, 129, 0.08);

		&:hover {
			background: rgba(16, 185, 129, 0.2);
		}
	}
}

/* Preview Viewport Shell */
.preview-viewport-shell {
	flex: 1;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #090e17;
	padding: 12px;
	overflow: hidden;

	&.device-desktop .preview-iframe {
		width: 100%;
		height: 100%;
		border-radius: 8px;
	}

	&.device-tablet .preview-iframe {
		width: 768px;
		height: 100%;
		border-radius: 12px;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
	}

	&.device-mobile .preview-iframe {
		width: 375px;
		height: 100%;
		border-radius: 16px;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
	}
}

.preview-iframe {
	border: 1px solid var(--gp-glass-border, rgba(255, 255, 255, 0.1));
	background: #fff;
	transition: width 0.25s ease;
}

/* Deep Theme Form Overrides */
:deep(.el-form-item__label) {
	color: var(--gp-text-secondary, #94a3b8) !important;
	font-weight: 500;
	font-size: 13px;
	margin-bottom: 6px;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
	background-color: var(--gp-bg-element, rgba(15, 23, 42, 0.5)) !important;
	box-shadow: 0 0 0 1px var(--gp-glass-border, rgba(255, 255, 255, 0.12)) inset !important;
	color: var(--gp-text-main, #f8fafc) !important;
	border-radius: 8px;

	input {
		color: var(--gp-text-main, #f8fafc) !important;
	}

	&.is-focus,
	&:focus {
		box-shadow: 0 0 0 1px var(--gp-primary, #42b883) inset !important;
	}
}

:deep(.el-textarea__inner) {
	border: none !important;
}
</style>
