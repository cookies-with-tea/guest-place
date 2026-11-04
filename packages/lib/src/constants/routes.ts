// Решено (архитектурно): НЕ переписывать на динамическую подгрузку из БД.
// `name`/`icon` структурно привязаны к реальным роутам Vue Router и
// Module Federation remotes — их обязаны знать на этапе сборки (type-safety,
// `router.push({ name })`, см. IMPROVEMENTS.md §5). `title` — не хардкод:
// это уже i18n-ключ (`menu.*`), редактируемый контент-менеджером через
// admin-translations без деплоя. Т.е. динамическая часть (текст) уже
// вынесена туда, куда и должна была — в CMS/переводы; структура остаётся
// кодом осознанно.

export const ROUTES = {
	users: {
		title: 'menu.users',
		icon: 'User',
		list: {
			name: 'UsersPage',
			title: 'menu.users',
		},
		rights: {
			name: 'RightsPage',
			title: 'general.access_control',
		},
	},
	translations: {
		name: 'TranslationsPage',
		title: 'menu.translations',
		icon: 'ChatDotRound',
	},
	media: {
		name: 'MediaPage',
		title: 'menu.media',
		icon: 'Picture',
	},
	orchestrator: {
		title: 'menu.orchestrator',
		icon: 'Coordinate',
		list: {
			name: 'OrchestratorPage',
			title: 'menu.orchestrator',
		},
		features: {
			name: 'FeaturesPage',
			title: 'menu.features',
		},
	},
	content: {
		name: 'SchemaBuilder',
		title: 'menu.schemas',
		icon: 'Document',
	},
	platforms: {
		name: 'PlatformsPage',
		title: 'menu.platforms',
		icon: 'Place',
	},
	statistics: {
		name: 'StatisticsDashboard',
		title: 'menu.dashboard',
		icon: 'TrendCharts',
	},
	profile: {
		name: 'ProfilePage',
		title: 'menu.profile',
		icon: 'User',
	},
} as const
