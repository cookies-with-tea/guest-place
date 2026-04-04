// TODO: Переписать на подрузку из админки

export const ROUTES = {
	users: {
		name: 'UsersPage',
		title: 'general.users',
	},
	translations: {
		name: 'TranslationsPage',
		title: 'general.translations',
	},
	media: {
		name: 'MediaPage',
		title: 'general.media',
	},
	orchestrator: {
		name: 'OrchestratorPage',
		title: 'general.orchestrator',
	},
} as const
