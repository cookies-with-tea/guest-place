// TODO: Переписать на подрузку из админки

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
