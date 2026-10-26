<template>
	<div class="settings-page" :class="{ 'is-dark': isDark }">
		<!-- Page Header -->
		<div class="page-header glass-header">
			<div class="header-left">
				<div class="header-icon-box">
					<el-icon class="header-icon"><Setting /></el-icon>
				</div>
				<div class="header-titles">
					<div class="title-row">
						<h1>Глобальные настройки</h1>
						<el-tag effect="plain" round size="small" type="primary"> Singleton Configuration </el-tag>
					</div>
					<p class="subtitle">
						Централизованное управление параметрами сайта: метаданные, SEO по умолчанию, контакты и статус режима
						техобслуживания.
					</p>
				</div>
			</div>

			<div class="header-actions">
				<el-button :icon="Operation" plain @click="goToSchemas"> Конструктор схем </el-button>
				<el-button :icon="Reading" plain @click="goToDocs"> Документация подхода </el-button>
				<el-button :icon="Refresh" circle :loading="isLoading" @click="fetchData" />
			</div>
		</div>

		<!-- Main Content Area -->
		<div class="page-content">
			<!-- Loading State -->
			<div v-if="isLoading" class="loading-state glass-card">
				<el-skeleton :rows="6" animated />
			</div>

			<!-- State 1: Schema Exists -> Show Editor -->
			<template v-else-if="schema">
				<p class="mechanism-note">
					Это обычная схема CMS Schema Builder с зарезервированным системным slug'ом
					<code>global-settings</code> — не отдельный особый механизм. Она отрисовывается тем же
					<code>ContentEditor</code>, что и любая другая singleton-схема; единственное отличие — пункт меню и путь
					<code>/settings</code>.
				</p>

				<div class="schema-info-bar glass-card">
					<div class="info-meta">
						<span class="status-dot"></span>
						<span class="info-label">Активная синглтон-схема:</span>
						<code class="schema-badge">{{ schema.slug }}</code>
						<span class="fields-count">({{ schema.fields?.length || 0 }} полей)</span>
					</div>
					<el-button link type="primary" :icon="Tools" @click="goToSchemas">
						Изменить структуру полей в Конструкторе
					</el-button>
				</div>

				<div class="editor-wrapper glass-card">
					<ContentEditor
						v-model="formData"
						:errors="errors"
						:is-saving="isSaving"
						:schema="schema"
						:is-edit="Boolean(entryId)"
						@cancel="goToSchemas"
						@save="onSave"
					/>
				</div>
			</template>

			<!-- State 2: Schema NOT Found -> User-Friendly Onboarding -->
			<div v-else class="onboarding-card glass-card">
				<div class="onboarding-hero">
					<div class="hero-icon-wrapper">
						<el-icon class="hero-icon"><Tools /></el-icon>
					</div>

					<el-tag effect="dark" size="small" type="info" class="hero-badge"> Схема не инициализирована (404) </el-tag>

					<h2 class="hero-title">Для чего эта страница и как её настроить</h2>

					<p class="hero-desc">
						Страница «Глобальные настройки» использует синглтон-схему CMS с системным идентификатором
						<code>global-settings</code>. Поскольку база данных пуста или была сброшена, схема ещё не создана.
					</p>
				</div>

				<!-- Explanation Cards -->
				<div class="features-grid">
					<div class="feature-box">
						<div class="feature-num">01</div>
						<h4>Что такое синглтон?</h4>
						<p>
							В отличие от коллекций (статьи, страницы), синглтон существует в единственном экземпляре и предназначен
							для общесайтовых констант.
						</p>
					</div>

					<div class="feature-box">
						<div class="feature-num">02</div>
						<h4>Как это связано с Live Preview?</h4>
						<p>
							Название сайта, слоган и баннер техобслуживания сразу транслируются на клиентский сайт через реактивный
							мост postMessage.
						</p>
					</div>

					<div class="feature-box">
						<div class="feature-num">03</div>
						<h4>Гибкая кастомизация</h4>
						<p>
							Вы можете добавить любые свои поля (логотип, соцсети, аналитика) в любой момент через визуальный
							Конструктор схем.
						</p>
					</div>
				</div>

				<!-- Default Fields Preview -->
				<div class="default-fields-card">
					<div class="fields-card-header">
						<el-icon><InfoFilled /></el-icon>
						<span>Состав полей стандартной схемы по умолчанию:</span>
					</div>
					<div class="fields-chips">
						<span class="chip"><strong>site_name</strong> <small>(Text, Обязательное)</small> — Название сайта</span>
						<span class="chip"><strong>tagline</strong> <small>(Text)</small> — Слоган проекта</span>
						<span class="chip"><strong>description</strong> <small>(RichText)</small> — SEO Meta Описание</span>
						<span class="chip"><strong>contact_email</strong> <small>(Text)</small> — Контактный e-mail</span>
						<span class="chip"><strong>maintenance_mode</strong> <small>(Boolean)</small> — Режим техобслуживания</span>
					</div>
				</div>

				<!-- Action Buttons -->
				<div class="hero-actions">
					<el-button
						type="primary"
						size="large"
						:icon="Check"
						:loading="isInitializing"
						class="btn-gradient"
						@click="createDefaultSchema"
					>
						✨ Инициализировать схему в 1 клик
					</el-button>

					<el-button size="large" :icon="Operation" @click="goToSchemas"> Создать вручную в Конструкторе </el-button>

					<el-button size="large" text :icon="Reading" @click="goToDocs"> Документация подхода </el-button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import type { ContentSchema } from '@admin-panel/lib'
import { FieldType } from '@admin-panel/lib'
import { useTheme } from '@admin-panel/ui'
import { Check, InfoFilled, Operation, Reading, Refresh, Setting, Tools } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

import { ContentEditor } from '#features/content-editor'
import { contentApi } from '#entities/content'

const router = useRouter()
const { isDark } = useTheme()

const schema = ref<ContentSchema | null>(null)
const formData = reactive<Record<string, any>>({})
const errors = ref<Record<string, string[]>>({})
const isLoading = ref(true)
const isSaving = ref(false)
const isInitializing = ref(false)
const entryId = ref<string | null>(null)

const SETTINGS_IDENTIFIER = 'global-settings'

const fetchData = async () => {
	isLoading.value = true

	try {
		// Suppress global error toast since 404 is an expected state on fresh setup
		const schemaRes = await contentApi.getSchemaByIdentifier(SETTINGS_IDENTIFIER, { silent: true })

		if (schemaRes.data) {
			schema.value = schemaRes.data

			const entriesRes = await contentApi.getEntries(schema.value.id)

			if (entriesRes.data && entriesRes.data.length > 0) {
				const entry = entriesRes.data[0]
				entryId.value = entry.id
				Object.assign(formData, entry.data)
			}
		} else {
			schema.value = null
		}
	} catch (err: any) {
		// 404 means the schema has not been initialized yet — completely normal
		schema.value = null
		if (err.status !== 404 && err.statusCode !== 404) {
			console.error('Failed to fetch global settings schema:', err)
		}
	} finally {
		isLoading.value = false
	}
}

const onSave = async () => {
	if (!schema.value) return
	isSaving.value = true
	errors.value = {}

	try {
		const entriesRes = await contentApi.getEntries(schema.value.id)
		const existingEntry = entriesRes.data?.[0]

		if (existingEntry) {
			await contentApi.updateEntry(existingEntry.id, {
				data: formData,
				status: 'published',
			})
			ElMessage.success('Глобальные настройки успешно сохранены')
		} else {
			const createRes = await contentApi.createEntry({
				schema_id: schema.value.id,
				slug: 'global-settings-entry',
				status: 'published',
				data: formData,
			})
			if (createRes.data) {
				entryId.value = createRes.data.id
			}
			ElMessage.success('Глобальные настройки созданы и сохранены')
		}
	} catch (err: any) {
		console.error('Failed to save settings:', err)
		ElMessage.error(err.messages?.[0] || 'Ошибка при сохранении настроек')
	} finally {
		isSaving.value = false
	}
}

const createDefaultSchema = async () => {
	isInitializing.value = true

	try {
		const schemaRes = await contentApi.createSchema({
			name: 'Глобальные настройки',
			slug: SETTINGS_IDENTIFIER,
			isSingleton: true,
			fields: [
				{ name: 'site_name', label: 'Название сайта', fieldType: FieldType.Text, required: true },
				{ name: 'tagline', label: 'Слоган проекта', fieldType: FieldType.Text, required: false },
				{ name: 'description', label: 'Описание (SEO Meta)', fieldType: FieldType.RichText, required: false },
				{ name: 'contact_email', label: 'Контактный E-mail', fieldType: FieldType.Text, required: false },
				{ name: 'maintenance_mode', label: 'Режим техобслуживания', fieldType: FieldType.Boolean, required: false },
			],
		})

		if (schemaRes.data) {
			schema.value = schemaRes.data

			// Initialize default initial entry
			const initialData = {
				site_name: 'Guest Place',
				tagline: 'Modern Headless Platform',
				description: '<p>Современная платформа для управления контентом и бронированием.</p>',
				contact_email: 'admin@example.com',
				maintenance_mode: false,
			}

			const entryRes = await contentApi.createEntry({
				schema_id: schemaRes.data.id,
				slug: 'global-settings-entry',
				status: 'published',
				data: initialData,
			})

			if (entryRes.data) {
				entryId.value = entryRes.data.id
				Object.assign(formData, entryRes.data.data)
			}

			ElMessage.success('Схема глобальных настроек успешно инициализирована!')
		}
	} catch (err: any) {
		console.error('Failed to create default settings schema:', err)
		ElMessage.error(err.messages?.[0] || 'Не удалось создать схему настроек')
	} finally {
		isInitializing.value = false
	}
}

const goToSchemas = () => {
	const isShell = window.location.pathname.startsWith('/content')
	router.push(isShell ? '/content' : '/')
}

const goToDocs = () => {
	const isShell = window.location.pathname.startsWith('/content')
	router.push(isShell ? '/content/docs' : '/docs')
}

onMounted(fetchData)
</script>

<style scoped lang="scss">
.settings-page {
	min-height: calc(100vh - 70px);
	color: var(--gp-text-main, #1e293b);
	background: transparent;
	transition: all 0.3s ease;
	padding: 28px 32px;
}

.glass-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	border: 1px solid var(--gp-glass-border, rgb(255, 255, 255, 0.2));
	border-radius: 16px;
	box-shadow: 0 8px 24px rgb(0, 0, 0, 0.04);
	background: var(--gp-bg-glass, rgb(255, 255, 255, 0.65));
	padding: 20px 24px;
	margin-bottom: 24px;
	-webkit-backdrop-filter: blur(16px);
	backdrop-filter: blur(16px);
}

.header-left {
	display: flex;
	align-items: center;
	gap: 16px;
}

.header-icon-box {
	width: 48px;
	height: 48px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid rgb(99, 102, 241, 0.2);
	border-radius: 14px;
	color: #6366f1;
	background: linear-gradient(135deg, rgb(99, 102, 241, 0.15), rgb(168, 85, 247, 0.15));
}

.header-icon {
	font-size: 24px;
}

.header-titles {
	.title-row {
		display: flex;
		align-items: center;
		margin-bottom: 4px;
		gap: 12px;

		h1 {
			font-weight: 700;
			font-size: 22px;
			letter-spacing: -0.02em;
			color: var(--gp-text-main, #1e293b);
			margin: 0;
		}
	}

	.subtitle {
		font-size: 13px;
		color: var(--gp-text-secondary, #64748b);
		margin: 0;
	}
}

.header-actions {
	display: flex;
	align-items: center;
	gap: 10px;
}

.page-content {
	max-width: 1080px;
	margin: 0 auto;
}

.glass-card {
	border: 1px solid var(--gp-glass-border, rgb(255, 255, 255, 0.2));
	border-radius: 20px;
	box-shadow: 0 12px 32px rgb(0, 0, 0, 0.05);
	background: var(--gp-bg-glass, rgb(255, 255, 255, 0.7));
	padding: 32px;
	-webkit-backdrop-filter: blur(16px);
	backdrop-filter: blur(16px);
}

.loading-state {
	padding: 40px;
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
	border-radius: 12px;
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
			color: var(--gp-text-muted, #94a3b8);
		}
	}
}

.editor-wrapper {
	padding: 24px;
}

/* Onboarding Hero */
.onboarding-card {
	text-align: center;
	padding: 48px;
}

.onboarding-hero {
	max-width: 620px;
	display: flex;
	flex-direction: column;
	align-items: center;
	margin: 0 auto 32px;
}

.hero-icon-wrapper {
	width: 72px;
	height: 72px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid rgb(99, 102, 241, 0.25);
	border-radius: 20px;
	background: linear-gradient(135deg, rgb(99, 102, 241, 0.15), rgb(168, 85, 247, 0.15));
	margin-bottom: 20px;
}

.hero-icon {
	font-size: 36px;
	color: #6366f1;
}

.hero-badge {
	margin-bottom: 12px;
}

.hero-title {
	font-weight: 800;
	font-size: 24px;
	color: var(--gp-text-main, #1e293b);
	margin: 0 0 12px;
}

.hero-desc {
	font-size: 15px;
	line-height: 1.6;
	color: var(--gp-text-secondary, #64748b);
	margin: 0;

	code {
		border-radius: 4px;
		font-family: monospace;
		color: #6366f1;
		background: rgb(99, 102, 241, 0.1);
		padding: 2px 6px;
	}
}

/* Feature Grid */
.features-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	text-align: left;
	margin-bottom: 32px;
	gap: 20px;
}

.feature-box {
	position: relative;
	border: 1px solid rgb(255, 255, 255, 0.2);
	border-radius: 14px;
	background: rgb(255, 255, 255, 0.4);
	transition: all 0.2s ease;
	padding: 20px;

	.feature-num {
		font-weight: 800;
		font-size: 12px;
		letter-spacing: 0.05em;
		color: #6366f1;
		margin-bottom: 8px;
		opacity: 0.8;
	}

	h4 {
		font-weight: 700;
		font-size: 15px;
		color: var(--gp-text-main, #1e293b);
		margin: 0 0 8px;
	}

	p {
		font-size: 13px;
		line-height: 1.5;
		color: var(--gp-text-secondary, #64748b);
		margin: 0;
	}

	&:hover {
		box-shadow: 0 8px 20px rgb(0, 0, 0, 0.05);
		transform: translateY(-2px);
	}
}

/* Default Fields Card */
.default-fields-card {
	border: 1px solid rgb(99, 102, 241, 0.15);
	border-radius: 14px;
	text-align: left;
	background: rgb(99, 102, 241, 0.05);
	padding: 16px 20px;
	margin-bottom: 36px;

	.fields-card-header {
		display: flex;
		align-items: center;
		font-weight: 600;
		font-size: 13px;
		color: #4f46e5;
		margin-bottom: 12px;
		gap: 8px;
	}

	.fields-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;

		.chip {
			display: inline-flex;
			align-items: center;
			border: 1px solid rgb(0, 0, 0, 0.06);
			border-radius: 8px;
			font-size: 12px;
			color: var(--gp-text-main, #334155);
			background: var(--gp-bg-surface, #fff);
			padding: 4px 10px;
			gap: 4px;

			strong {
				font-family: monospace;
				color: #6366f1;
			}

			small {
				color: #94a3b8;
			}
		}
	}
}

/* Actions */
.hero-actions {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: center;
	gap: 16px;
}

.btn-gradient {
	border: none !important;
	box-shadow: 0 4px 14px rgb(99, 102, 241, 0.35);
	font-weight: 600;
	background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;

	&:hover {
		transform: translateY(-1px);
		opacity: 0.95;
	}
}

/* Dark Mode Adjustments */
.is-dark {
	.glass-header,
	.glass-card {
		border-color: rgb(255, 255, 255, 0.08);
		box-shadow: 0 12px 32px rgb(0, 0, 0, 0.3);
		background: rgb(15, 23, 42, 0.75);
	}

	.feature-box {
		border-color: rgb(255, 255, 255, 0.06);
		background: rgb(30, 41, 59, 0.5);
	}

	.default-fields-card {
		border-color: rgb(99, 102, 241, 0.2);
		background: rgb(99, 102, 241, 0.08);

		.fields-chips .chip {
			border-color: rgb(255, 255, 255, 0.1);
			color: #e2e8f0;
			background: #1e293b;
		}
	}
}

@media (width <= 840px) {
	.features-grid {
		grid-template-columns: 1fr;
	}

	.glass-header {
		flex-direction: column;
		align-items: flex-start;
		gap: 16px;
	}
}
</style>
