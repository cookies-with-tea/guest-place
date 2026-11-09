// Defaults only — the sidebar group `title`/`icon` an MFE actually ends up showing can be
// overridden per-MFE from the admin UI (Orchestrator → Modules → "Заголовок в сайдбаре" /
// "Icon"), stored in `microfrontends.config.titleKey` / `microfrontends.icon` and read by
// admin-shell's `loadRemoteRoutes()`. These are just what a freshly-registered MFE shows
// before anyone customizes it, plus the route `name`s each MFE's own router relies on
// (those stay code-level — they're wiring, not display content).
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
		audit: {
			name: 'AuditPage',
			title: 'general.audit_log',
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
