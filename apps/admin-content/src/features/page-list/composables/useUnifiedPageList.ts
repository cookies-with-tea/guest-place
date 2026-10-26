import { computed, reactive, ref } from 'vue'
import type { PagesAndSchemas } from './usePagesAndSchemas'

// Pre-defined known fixed schema pages on client
const FIXED_SCHEMA_DEFINITIONS = [
	{
		title: 'Главная страница (Home)',
		slug: 'page_home',
		path: '/',
		icon: '🏠',
		description:
			'Индивидуальная вёрстка: Hero, Места по категориям, Последние добавленные, Самые популярные, Варианты взаимодействия',
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

/**
 * Merges block pages and schema-driven pages into one filterable, displayable list.
 */
export function useUnifiedPageList(pagesAndSchemas: PagesAndSchemas) {
	const typeFilter = ref<'all' | 'blocks' | 'schemas'>('all')
	const statusFilter = ref<'all' | 'published' | 'review' | 'draft'>('all')

	const schemaPages = computed(() => {
		const mapBySlug = new Map(pagesAndSchemas.schemas.map((s: any) => [s.slug, s]))

		const result = FIXED_SCHEMA_DEFINITIONS.map((def) => {
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
		for (const s of pagesAndSchemas.schemas) {
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

	const blockItems = computed(() =>
		pagesAndSchemas.pages.map((p: any) => {
			const parent = p.parent_id ? pagesAndSchemas.pages.find((item: any) => item.id === p.parent_id) : null
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
	)

	const totalItemsCount = computed(() => pagesAndSchemas.pages.length + schemaPages.value.length)

	const filteredBlockItems = computed(() => {
		if (statusFilter.value === 'all') return blockItems.value
		return blockItems.value.filter((b) => (b.status || 'draft') === statusFilter.value)
	})

	const displayItems = computed(() => {
		if (typeFilter.value === 'schemas') return schemaPages.value
		if (typeFilter.value === 'blocks') return filteredBlockItems.value

		// 'all' shows both blocks and schemas
		return [...schemaPages.value, ...filteredBlockItems.value]
	})

	function getStatusShort(st: string): string {
		if (st === 'published') return '🟢 Опубликовано'
		if (st === 'review') return '🟠 На проверке'
		return '⚪ Черновик'
	}

	function formatDate(dateStr?: string): string {
		if (!dateStr) return ''
		try {
			return new Date(dateStr).toLocaleDateString('ru-RU', {
				day: 'numeric',
				month: 'short',
				hour: '2-digit',
				minute: '2-digit',
			})
		} catch {
			return dateStr
		}
	}

	return reactive({
		typeFilter,
		statusFilter,
		schemaPages,
		blockItems,
		filteredBlockItems,
		totalItemsCount,
		displayItems,
		getStatusShort,
		formatDate,
	})
}

export type UnifiedPageList = ReturnType<typeof useUnifiedPageList>
