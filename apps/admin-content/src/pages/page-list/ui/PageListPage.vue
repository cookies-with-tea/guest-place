<template>
	<div class="page-list-view">
		<!-- Header -->
		<div class="page-header">
			<div class="page-header__left">
				<div class="header-title-row">
					<h1>Управление страницами сайта</h1>
					<el-tag size="small" type="primary" effect="plain" class="version-tag">Dual Architecture CMS</el-tag>
				</div>
				<p class="page-subtitle">
					Единый реестр страниц сайта: визуальный блочный конструктор и Schema-driven страницы со сложной вёрсткой
				</p>
			</div>
			<div class="page-header__actions">
				<el-button plain @click="router.push('/home')">
					🏠 Главная
				</el-button>
				<el-button plain @click="router.push('/venues')">
					🏰 Площадки
				</el-button>
				<el-button plain @click="router.push('/menus')">
					🧭 Меню сайта
				</el-button>
				<el-button plain @click="router.push('/redirects')">
					🔀 Редиректы (301/302)
				</el-button>
				<el-button plain @click="openSitemap">
					🗺️ Sitemap.xml
				</el-button>
				<el-button plain @click="router.push({ name: ROUTES.content.name })">
					🗂️ Конструктор схем
				</el-button>
				<el-button type="primary" @click="goToCreate">
					+ Создать блочную страницу
				</el-button>
			</div>
		</div>

		<!-- Architecture Info Strip -->
		<div class="architecture-strip">
			<div class="arch-item">
				<span class="arch-icon">📦</span>
				<div class="arch-info">
					<strong>Блочные страницы (Block-based)</strong>
					<span>Собираются из палитры переиспользуемых компонентов (Hero, Features, CTA, Quotes...) через визуальный конструктор. Роуты: <code>/p/*</code></span>
				</div>
			</div>
			<div class="arch-sep"></div>
			<div class="arch-item">
				<span class="arch-icon">📋</span>
				<div class="arch-info">
					<strong>Схемные страницы (Schema-driven)</strong>
					<span>Индивидуальная уникальная вёрстка фронтенда (About, Guests, Platforms). CMS хранит схему полей, наполняет контент и переводы. Роуты: <code>/*</code></span>
				</div>
			</div>
		</div>

		<div class="page-content">
			<!-- Loading state -->
			<div v-if="loading" class="loading-container">
				<el-skeleton animated :rows="4" />
			</div>

			<!-- Filter Bar: Page Types & Workflow Status -->
			<div class="page-filter-container">
				<div class="filter-group">
					<span class="filter-label">Тип страниц:</span>
					<el-radio-group v-model="typeFilter" size="default">
						<el-radio-button label="all">Все ({{ totalItemsCount }})</el-radio-button>
						<el-radio-button label="blocks">📦 Блочные ({{ pages.length }})</el-radio-button>
						<el-radio-button label="schemas">📋 Схемные ({{ schemaPages.length }})</el-radio-button>
					</el-radio-group>
				</div>

				<div v-if="typeFilter !== 'schemas' && pages.length > 0" class="filter-group">
					<span class="filter-label">Статус:</span>
					<el-radio-group v-model="statusFilter" size="default">
						<el-radio-button label="all">Все</el-radio-button>
						<el-radio-button label="published">Опубликовано ({{ countByStatus('published') }})</el-radio-button>
						<el-radio-button label="review">На проверке ({{ countByStatus('review') }})</el-radio-button>
						<el-radio-button label="draft">Черновики ({{ countByStatus('draft') }})</el-radio-button>
					</el-radio-group>
				</div>
			</div>

			<!-- Empty state -->
			<div v-if="!loading && displayItems.length === 0" class="empty-state">
				<div class="empty-state__icon">📄</div>
				<h3>Страниц не найдено</h3>
				<p>В выбранной категории пока нет доступных страниц</p>
				<div class="empty-actions">
					<el-button type="primary" @click="goToCreate">+ Создать блочную страницу</el-button>
					<el-button plain @click="handleCreateAboutTemplate">✨ Сгенерировать демо «О платформе»</el-button>
				</div>
			</div>

			<!-- Unified Cards Grid -->
			<div v-else class="pages-grid">
				<div
					v-for="item in displayItems"
					:key="item.key"
					class="page-card"
					:class="{ 'is-schema-card': item.isSchema }"
					@click="handleCardClick(item)"
				>
					<div class="page-card__header">
						<div class="page-card__icon-wrap">
							<span class="page-card__icon">{{ item.icon }}</span>
							<span class="page-card__type-pill" :class="item.isSchema ? 'pill-schema' : 'pill-block'">
								{{ item.isSchema ? 'СХЕМА ПОЛЕЙ' : 'БЛОЧНЫЙ КОНСТРУКТОР' }}
							</span>
						</div>

						<div class="page-card__badges">
							<!-- Status tag for block pages -->
							<el-tag
								v-if="!item.isSchema"
								size="small"
								:type="item.status === 'published' ? 'success' : item.status === 'review' ? 'warning' : 'info'"
							>
								{{ getStatusLabel(item.status).toUpperCase() }}
							</el-tag>

							<!-- Schema tag -->
							<el-tag v-else size="small" type="warning" effect="light">
								{{ item.hasSchema ? 'Схема готова' : 'Требует инициализации' }}
							</el-tag>
						</div>
					</div>

					<div class="page-card__body">
						<h3 class="page-card__title">{{ item.title }}</h3>
						<p v-if="item.description" class="page-card__desc">{{ item.description }}</p>

						<div class="page-card__slug-wrapper">
							<span class="slug-prefix">Путь:</span>
							<code class="page-card__slug">{{ item.path }}</code>
						</div>

						<div v-if="item.parentTitle" class="page-card__parent-badge">
							<span>↳ Родитель:</span>
							<strong>{{ item.parentTitle }}</strong>
							<span class="parent-slug">(/p/{{ item.parentSlug }})</span>
						</div>

						<div v-if="item.published_at" class="page-card__published-date">
							🚀 {{ formatDate(item.published_at) }}
						</div>
					</div>

					<div class="page-card__footer">
						<span class="page-card__count">
							<template v-if="!item.isSchema">
								📦 <strong>{{ item.blocks?.length || 0 }}</strong> блоков
							</template>
							<template v-else>
								📋 <strong>{{ item.fieldsCount || 0 }}</strong> полей схемы
							</template>
						</span>

						<div class="page-card__actions" @click.stop>
							<!-- Actions for BLOCK page -->
							<template v-if="!item.isSchema">
								<el-dropdown trigger="click" @command="(cmd: string) => quickSetStatus(item, cmd)">
									<el-button size="small" plain title="Сменить статус">
										{{ getStatusShort(item.status) }} ▾
									</el-button>
									<template #dropdown>
										<el-dropdown-menu>
											<el-dropdown-item command="draft" :disabled="item.status === 'draft'">
												📝 Черновик
											</el-dropdown-item>
											<el-dropdown-item command="review" :disabled="item.status === 'review'">
												🔍 На проверку
											</el-dropdown-item>
											<el-dropdown-item command="published" :disabled="item.status === 'published'">
												🚀 Опубликовать
											</el-dropdown-item>
										</el-dropdown-menu>
									</template>
								</el-dropdown>

								<el-button
									size="small"
									plain
									@click="openClientPreview(item.slug)"
								>
									👁️ Просмотр
								</el-button>

								<el-button
									size="small"
									type="primary"
									plain
									@click="goToEdit(item.id)"
								>
									Конструктор
								</el-button>

								<el-button
									size="small"
									type="danger"
									plain
									@click="handleDelete(item)"
								>
									✕
								</el-button>
							</template>

							<!-- Actions for SCHEMA page -->
							<template v-else>
								<el-button
									size="small"
									plain
									@click="openWebsitePath(item.path)"
								>
									👁️ На сайт
								</el-button>

								<el-button
									size="small"
									type="primary"
									plain
									@click="handleEditSchemaPage(item)"
								>
									{{ item.hasSchema ? 'Редактор контента' : 'Инициализировать' }}
								</el-button>
							</template>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { pagesApi, type PageItem } from '#entities/pages'
import { getSchemas, createSchema, createEntry } from '#entities/content/api'
import type { ContentSchema } from '@admin-panel/lib'
import { ROUTES } from '@admin-panel/lib'

const router = useRouter()

const pages = ref<PageItem[]>([])
const schemas = ref<ContentSchema[]>([])
const loading = ref(false)
const isCreatingTemplate = ref(false)

const typeFilter = ref<'all' | 'blocks' | 'schemas'>('all')
const statusFilter = ref<'all' | 'published' | 'review' | 'draft'>('all')

// Pre-defined known fixed schema pages on client
const fixedSchemaDefinitions = [
	{
		title: 'Главная страница (Home)',
		slug: 'page_home',
		path: '/',
		icon: '🏠',
		description: 'Индивидуальная вёрстка: Hero, Места по категориям, Последние добавленные, Самые популярные, Варианты взаимодействия',
	},
	{
		title: 'О платформе (About)',
		slug: 'page_about',
		path: '/about',
		icon: 'ℹ️',
		description: 'Индивидуальная вёрстка: Hero, Opportunities, Leadership, News, Mission',
	},
	{
		title: 'Гостям (Guests)',
		slug: 'page_guests',
		path: '/guests',
		icon: '👥',
		description: 'Индивидуальная вёрстка: возможности для гостей, каталог, быстрый выбор заведений',
	},
	{
		title: 'Площадкам (Platforms)',
		slug: 'page_platforms',
		path: '/platforms',
		icon: '📍',
		description: 'Индивидуальная вёрстка: тарифы, размещение заведений, аналитика бронирований',
	},
]

const schemaPages = computed(() => {
	const mapBySlug = new Map<string, ContentSchema>()
	for (const s of schemas.value) {
		mapBySlug.set(s.slug, s)
	}

	const result = fixedSchemaDefinitions.map((def) => {
		const found = mapBySlug.get(def.slug) || mapBySlug.get(def.slug.replace('page_', ''))
		return {
			key: `schema-${def.slug}`,
			isSchema: true,
			id: found?.id,
			title: def.title,
			slug: def.slug,
			path: def.path,
			icon: def.icon,
			description: def.description,
			hasSchema: !!found,
			fieldsCount: found?.fields?.length || 0,
			status: found ? 'published' : 'draft',
		}
	})

	// Also add any custom singleton schemas created in Schema Builder
	for (const s of schemas.value) {
		if (s.isSingleton && !result.some((r) => r.slug === s.slug || r.slug === `page_${s.slug}`)) {
			result.push({
				key: `schema-${s.slug}`,
				isSchema: true,
				id: s.id,
				title: s.name,
				slug: s.slug,
				path: `/${s.slug}`,
				icon: '📄',
				description: 'Кастомная Singleton-схема со специфичным набором полей',
				hasSchema: true,
				fieldsCount: s.fields?.length || 0,
				status: 'published',
			})
		}
	}

	return result
})

const blockItems = computed(() => {
	return pages.value.map((p) => {
		const parent = p.parent_id ? pages.value.find((item) => item.id === p.parent_id) : null
		return {
			key: `block-${p.id}`,
			isSchema: false,
			id: p.id,
			title: p.title,
			slug: p.slug,
			path: `/p/${p.slug}`,
			icon: '📦',
			description: 'Динамическая страница из реестра переиспользуемых блоков',
			status: p.status || 'draft',
			parent_id: p.parent_id,
			parentTitle: parent?.title,
			parentSlug: parent?.slug,
			blocks: p.blocks,
			published_at: p.published_at,
			published_by: p.published_by,
		}
	})
})

function openSitemap() {
	const base = (import.meta.env.VITE_CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '')
	window.open(`${base}/sitemap.xml`, '_blank')
}

const totalItemsCount = computed(() => pages.value.length + schemaPages.value.length)

const displayItems = computed(() => {
	if (typeFilter.value === 'schemas') {
		return schemaPages.value
	}

	let filteredBlocks = blockItems.value
	if (statusFilter.value !== 'all') {
		filteredBlocks = filteredBlocks.filter((b) => (b.status || 'draft') === statusFilter.value)
	}

	if (typeFilter.value === 'blocks') {
		return filteredBlocks
	}

	// 'all' shows both blocks and schemas
	return [...schemaPages.value, ...filteredBlocks]
})

function countByStatus(st: string): number {
	return pages.value.filter((p) => (p.status || 'draft') === st).length
}

function getStatusLabel(st: string): string {
	if (st === 'published') return 'Опубликовано'
	if (st === 'review') return 'На проверке'
	return 'Черновик'
}

function getStatusShort(st: string): string {
	if (st === 'published') return '🟢 Опубликовано'
	if (st === 'review') return '🟠 На проверке'
	return '⚪ Черновик'
}

function formatDate(dateStr?: string): string {
	if (!dateStr) return ''
	try {
		const d = new Date(dateStr)
		return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
	} catch {
		return dateStr
	}
}

async function quickSetStatus(item: any, newStatus: string) {
	try {
		await pagesApi.updatePage(item.id, {
			status: newStatus,
			published_at: newStatus === 'published' ? new Date().toISOString() : (item.published_at || undefined),
		})
		item.status = newStatus
		if (newStatus === 'published' && !item.published_at) {
			item.published_at = new Date().toISOString()
		}
		ElMessage.success(`Статус изменён: ${getStatusLabel(newStatus)}`)
	} catch (e: any) {
		ElMessage.error(e.message || 'Ошибка обновления статуса')
	}
}

const fetchData = async () => {
	loading.value = true
	try {
		const [pagesRes, schemasRes] = await Promise.all([
			pagesApi.getPages().catch(() => ({ data: [] })),
			getSchemas().catch(() => ({ data: [] })),
		])
		if (pagesRes?.data) {
			pages.value = pagesRes.data
		}
		if (schemasRes?.data) {
			schemas.value = schemasRes.data
		}
	} catch (err: any) {
		ElMessage.error(err.message || 'Ошибка загрузки страниц')
	} finally {
		loading.value = false
	}
}

onMounted(fetchData)

const goToCreate = () => {
	router.push({ name: 'PageCreate' })
}

const goToEdit = (id: string) => {
	router.push({ name: 'PageEdit', params: { id } })
}

const handleCardClick = (item: any) => {
	if (item.isSchema) {
		handleEditSchemaPage(item)
	} else {
		goToEdit(item.id)
	}
}

async function seedAboutSchema() {
	const res = await createSchema({
		name: 'Страница: О платформе',
		slug: 'page_about',
		is_singleton: true,
		fields: [
			{ name: 'city', label: 'Город по умолчанию', field_type: 'text', required: false },
			{ name: 'hero_title', label: 'Главный заголовок (Hero Title)', field_type: 'text', required: true },
			{ name: 'hero_subtitle', label: 'Подзаголовок Hero (многострочный)', field_type: 'text', required: false },
			{ name: 'guest_title', label: 'Название карточки 1 (Guest)', field_type: 'text', required: true },
			{ name: 'guest_features', label: 'Возможности Guest (через новую строку)', field_type: 'text', required: false },
			{ name: 'guest_button_text', label: 'Текст кнопки Guest', field_type: 'text', required: false },
			{ name: 'place_title', label: 'Название карточки 2 (Place)', field_type: 'text', required: true },
			{ name: 'place_features', label: 'Возможности Place (через новую строку)', field_type: 'text', required: false },
			{ name: 'place_button_text', label: 'Текст кнопки Place', field_type: 'text', required: false },
			{ name: 'quote_title', label: 'Заголовок цитаты', field_type: 'text', required: false },
			{ name: 'quote_description', label: 'Текст ценностей', field_type: 'text', required: false },
			{ name: 'mission_title_accent', label: 'Акцент слова Миссии', field_type: 'text', required: false },
			{ name: 'mission_text', label: 'Текст Миссии', field_type: 'rich_text', required: false },
			{ name: 'mission_image', label: 'Изображение Миссии', field_type: 'media', required: false },
			{ name: 'history_title_accent', label: 'Акцент слова Истории', field_type: 'text', required: false },
			{ name: 'history_text', label: 'Текст Истории', field_type: 'rich_text', required: false },
			{ name: 'history_image', label: 'Изображение Истории', field_type: 'media', required: false },
		],
	})
	if (res?.data?.id) {
		await createEntry({
			schema_id: res.data.id,
			slug: 'about-main-entry',
			status: 'published',
			data: {
				city: 'Москва',
				hero_title: 'О платформе Guest & Place',
				hero_subtitle: 'Платформа, позволяющая общаться напрямую!\nПомогаем каждому Гостю найти “свое” место.',
				guest_title: 'Guest',
				guest_features: 'Прямая связь с площадкой в режиме реального времени\nАктуальная информация, меню, цены, свободные даты\nПрямое онлайн бронирование и оплата',
				guest_button_text: 'Зарегистрироваться',
				place_title: 'Place',
				place_features: 'Чаты, видео-встречи\nОнлайн-показ площадки\nПрямые трансляции, новости, лента событий',
				place_button_text: 'Добавить место',
				quote_title: ' - проект от души :)',
				quote_description: 'Лидерство на рынке обеспечивается нашей талантливой командой',
				mission_title_accent: 'МИССИЯ',
				mission_text: '<p>Соединяем гостей и площадки, обеспечивая честность и открытость взаимодействия.</p>',
				mission_image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80',
				history_title_accent: 'СОЗДАНИЯ',
				history_text: '<p>Наша платформа выросла из простого желания убрать лишние барьеры между людьми.</p>',
				history_image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop&q=80',
			},
		})
	}
}

async function seedGuestsSchema() {
	const res = await createSchema({
		name: 'Страница: Гостям',
		slug: 'page_guests',
		is_singleton: true,
		fields: [
			{ name: 'city', label: 'Город', field_type: 'text', required: false },
			{ name: 'hero_title', label: 'Заголовок Hero', field_type: 'text', required: true },
			{ name: 'hero_description', label: 'Описание Hero', field_type: 'text', required: false },
			{ name: 'features', label: 'Возможности для гостей (список)', field_type: 'text', required: false },
			{ name: 'catalog_cta_title', label: 'Заголовок CTA каталога', field_type: 'text', required: false },
			{ name: 'catalog_cta_button', label: 'Кнопка перехода в каталог', field_type: 'text', required: false },
		],
	})
	if (res?.data?.id) {
		await createEntry({
			schema_id: res.data.id,
			slug: 'guests-main-entry',
			status: 'published',
			data: {
				city: 'Москва',
				hero_title: 'Все площадки города для ваших мероприятий',
				hero_description: 'Поиск ресторанов, лофтов, банкетных залов и открытых террас с прямым бронированием.',
				features: 'Моментальное подтверждение бронирования\nЧестные отзывы гостей\nОтсутствие скрытых комиссий',
				catalog_cta_title: 'Найдите идеальное место за 2 минуты',
				catalog_cta_button: 'Перейти в каталог',
			},
		})
	}
}

async function seedPlatformsSchema() {
	const res = await createSchema({
		name: 'Страница: Площадкам',
		slug: 'page_platforms',
		is_singleton: true,
		fields: [
			{ name: 'hero_title', label: 'Заголовок для владельцев площадок', field_type: 'text', required: true },
			{ name: 'hero_description', label: 'Описание преимуществ для бизнеса', field_type: 'text', required: false },
			{ name: 'registration_button_text', label: 'Кнопка регистрации площадки', field_type: 'text', required: false },
			{ name: 'benefits', label: 'Преимущества платформы', field_type: 'text', required: false },
			{ name: 'pricing_title', label: 'Заголовок блока тарифов', field_type: 'text', required: false },
		],
	})
	if (res?.data?.id) {
		await createEntry({
			schema_id: res.data.id,
			slug: 'platforms-main-entry',
			status: 'published',
			data: {
				hero_title: 'Разместите ваше заведение на Guest & Place',
				hero_description: 'Получайте прямые заявки от гостей без посредников и комиссий агентств.',
				registration_button_text: 'Добавить заведение',
				benefits: 'Удобный календарь бронирований\nПрямая связь в чате с гостями\nАналитика просмотров и конверсий',
				pricing_title: 'Прозрачные тарифы без скрытых платежей',
			},
		})
	}
}

const handleEditSchemaPage = async (item: any) => {
	if (item.slug === 'page_home') {
		router.push('/home')
		return
	}

	if (item.hasSchema) {
		router.push({ name: 'EntriesList', params: { schemaIdentifier: item.slug } })
		return
	}

	try {
		loading.value = true
		if (item.slug === 'page_about') {
			await seedAboutSchema()
			ElMessage.success('Схема «page_about» успешно инициализирована!')
		} else if (item.slug === 'page_guests') {
			await seedGuestsSchema()
			ElMessage.success('Схема «page_guests» успешно инициализирована!')
		} else if (item.slug === 'page_platforms') {
			await seedPlatformsSchema()
			ElMessage.success('Схема «page_platforms» успешно инициализирована!')
		}
		await fetchData()
		router.push({ name: 'EntriesList', params: { schemaIdentifier: item.slug } })
	} catch {
		router.push({ name: ROUTES.content.name })
		ElMessage.info(`Настройте схему «${item.title}» в конструкторе схем`)
	} finally {
		loading.value = false
	}
}

const openClientPreview = (slug: string) => {
	const cleanSlug = slug.replace(/^\/+/, '')
	const frontendUrl = import.meta.env.VITE_CLIENT_URL || 'http://localhost:3000'
	window.open(`${frontendUrl}/p/${cleanSlug}?preview=true`, '_blank')
}

const openWebsitePath = (path: string) => {
	const frontendUrl = import.meta.env.VITE_CLIENT_URL || 'http://localhost:3000'
	window.open(`${frontendUrl}${path}`, '_blank')
}

const handleDelete = async (item: any) => {
	try {
		await ElMessageBox.confirm(
			`Вы уверены, что хотите удалить блочную страницу «${item.title}» (/p/${item.slug})?`,
			'Подтверждение удаления',
			{
				confirmButtonText: 'Удалить',
				cancelButtonText: 'Отмена',
				type: 'warning',
			}
		)

		await pagesApi.deletePage(item.id)
		ElMessage.success('Страница удалена')
		fetchData()
	} catch {
		// Cancelled
	}
}

const handleCreateAboutTemplate = async () => {
	isCreatingTemplate.value = true
	try {
		const aboutPayload = {
			title: 'О платформе Guest & Place',
			slug: 'about',
			status: 'published',
			blocks: [
				{
					id: 'hero-1',
					type: 'hero',
					data: {
						title: 'О платформе Guest & Place',
						subtitle: 'Платформа, позволяющая общаться напрямую!\nПомогаем каждому Гостю найти “свое” место.\nМы за «прозрачные отношения»!',
					},
				},
				{
					id: 'features-1',
					type: 'two_column_features',
					data: {
						left_title: 'Guest',
						left_cta_text: 'Зарегистрироваться',
						right_title: 'Place',
						right_cta_text: 'Добавить место',
					},
				},
				{
					id: 'quote-1',
					type: 'quote_banner',
					data: {
						quote: ' - проект от души :)',
						description: 'Лидерство на рынке обеспечивается нашей талантливой командой, экспертами своего дела',
						val1_title: 'Постоянный поиск',
						val1_desc: 'постоянный поиск новых решений и внедрение новых технологий',
						val2_title: 'Превосходить ожидания',
						val2_desc: 'мы хотим превзойти ожидания пользователей и свои тоже :)',
					},
				},
				{
					id: 'mission-1',
					type: 'text_with_image',
					data: {
						title_prefix: 'НАША',
						title_accent: 'МИССИЯ',
						text: '<p>Соединяем гостей (людей) и места, создавая простоту и прозрачность в “отношениях”. Предоставляем самые современные технологии и инструменты для простого и легкого общения.</p>',
						image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80',
						image_position: 'right',
					},
				},
			],
			seo: {
				title: 'О платформе Guest & Place',
				description: 'Интерактивная платформа поиска мест по интересам напрямую',
			},
		}

		const res = await pagesApi.createPage(aboutPayload)
		ElMessage.success('Блочная страница «О платформе» успешно создана!')
		if (res.data?.id) {
			router.push({ name: 'PageEdit', params: { id: res.data.id } })
		} else {
			fetchData()
		}
	} catch (err: any) {
		ElMessage.error(err.message || 'Ошибка создания шаблона')
	} finally {
		isCreatingTemplate.value = false
	}
}
</script>

<style scoped>
.page-list-view {
	padding: 24px 32px;
	min-height: 100%;
	color: var(--text-primary);
	background: var(--bg-page, transparent);
}

.page-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20px;
}

.header-title-row {
	display: flex;
	align-items: center;
	gap: 12px;
	margin-bottom: 4px;
}

.page-header h1 {
	font-size: 24px;
	font-weight: 700;
	margin: 0;
	color: var(--text-primary);
}

.version-tag {
	font-weight: 600;
}

.page-subtitle {
	color: var(--text-muted);
	font-size: 14px;
	margin: 0;
}

.page-header__actions {
	display: flex;
	gap: 12px;
}

/* Architecture Information Strip */
.architecture-strip {
	display: flex;
	align-items: center;
	gap: 24px;
	padding: 14px 20px;
	background: var(--gp-bg-surface, var(--bg-card, rgba(30, 41, 59, 0.5)));
	border: 1px solid var(--gp-glass-border, var(--border-color, rgba(255, 255, 255, 0.1)));
	border-radius: 12px;
	margin-bottom: 24px;
	box-shadow: var(--gp-glass-shadow, 0 1px 3px rgba(0, 0, 0, 0.05));
}

.arch-item {
	display: flex;
	align-items: flex-start;
	gap: 12px;
	flex: 1;
}

.arch-icon {
	font-size: 22px;
	line-height: 1;
}

.arch-info {
	display: flex;
	flex-direction: column;
	gap: 2px;
	font-size: 12px;
}

.arch-info strong {
	color: var(--text-main);
	font-size: 13px;
}

.arch-info span {
	color: var(--text-muted);
	line-height: 1.4;
}

.arch-info code {
	background: rgba(99, 102, 241, 0.1);
	color: #6366f1;
	padding: 1px 4px;
	border-radius: 4px;
	font-family: monospace;
}

.arch-sep {
	width: 1px;
	height: 36px;
	background: var(--border-color);
}

/* Filters */
.page-filter-container {
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 16px;
	margin-bottom: 24px;
	padding: 12px 16px;
	background: var(--gp-bg-surface, var(--bg-card, rgba(30, 41, 59, 0.5)));
	border: 1px solid var(--gp-glass-border, var(--border-color, rgba(255, 255, 255, 0.1)));
	border-radius: 10px;
}

.filter-group {
	display: flex;
	align-items: center;
	gap: 10px;
}

.filter-label {
	font-size: 13px;
	font-weight: 500;
	color: var(--text-muted);
}

/* Grid & Cards */
.pages-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
	gap: 20px;
}

.page-card {
	background: var(--bg-card);
	border: 1px solid var(--border-color);
	border-radius: 14px;
	padding: 20px;
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	flex-direction: column;
	backdrop-filter: blur(8px);
	position: relative;
	overflow: hidden;
}

.page-card:hover {
	transform: translateY(-2px);
	box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
	border-color: #6366f1;
}

.page-card.is-schema-card {
	border-left: 4px solid #f59e0b;
}

.page-card:not(.is-schema-card) {
	border-left: 4px solid #6366f1;
}

.page-card__header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12px;
}

.page-card__icon-wrap {
	display: flex;
	align-items: center;
	gap: 8px;
}

.page-card__icon {
	font-size: 22px;
}

.page-card__type-pill {
	font-size: 9px;
	font-weight: 800;
	letter-spacing: 0.5px;
	padding: 2px 6px;
	border-radius: 4px;
}

.pill-schema {
	background: rgba(245, 158, 11, 0.12);
	color: #d97706;
}

.pill-block {
	background: rgba(99, 102, 241, 0.12);
	color: #6366f1;
}

.page-card__title {
	font-size: 16px;
	font-weight: 600;
	margin: 0 0 6px 0;
	color: var(--text-primary);
}

.page-card__desc {
	font-size: 12px;
	color: var(--text-muted);
	margin: 0 0 12px 0;
	line-height: 1.4;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.page-card__slug-wrapper {
	font-size: 12px;
	color: var(--text-muted);
	display: flex;
	align-items: center;
	gap: 6px;
	margin-bottom: 14px;
}

.page-card__slug {
	background: var(--bg-surface);
	border: 1px solid var(--border-color);
	padding: 2px 8px;
	border-radius: 4px;
	color: var(--accent-primary, #38bdf8);
	font-family: monospace;
	font-size: 12px;
}

.page-card__parent-badge {
	font-size: 11px;
	color: #6366f1;
	background: rgba(99, 102, 241, 0.08);
	border: 1px dashed rgba(99, 102, 241, 0.3);
	border-radius: 6px;
	padding: 4px 8px;
	margin-bottom: 12px;
	display: flex;
	align-items: center;
	gap: 5px;
}

.page-card__parent-badge .parent-slug {
	color: var(--text-muted);
	font-family: monospace;
	font-size: 10px;
}

.page-card__published-date {
	font-size: 11px;
	color: var(--text-muted);
	margin-bottom: 12px;
}

.page-card__footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: auto;
	padding-top: 14px;
	border-top: 1px solid var(--border-color);
}

.page-card__count {
	font-size: 12px;
	color: var(--text-muted);
}

.page-card__actions {
	display: flex;
	gap: 6px;
}

/* Empty state */
.empty-state {
	text-align: center;
	padding: 80px 24px;
	background: var(--bg-card);
	border: 2px dashed var(--border-color);
	border-radius: 16px;
	max-width: 520px;
	margin: 40px auto;
	backdrop-filter: blur(8px);
}

.empty-state__icon {
	font-size: 48px;
	margin-bottom: 16px;
}

.empty-state h3 {
	font-size: 18px;
	font-weight: 600;
	margin: 0 0 8px 0;
	color: var(--text-primary);
}

.empty-state p {
	color: var(--text-muted);
	font-size: 14px;
	margin: 0 0 24px 0;
}

.empty-actions {
	display: flex;
	justify-content: center;
	gap: 12px;
}
</style>
