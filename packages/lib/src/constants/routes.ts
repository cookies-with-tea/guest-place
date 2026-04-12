// TODO: Переписать на подрузку из админки

export const ROUTES = {
	users: {
		icon: 'User',
		list: {
			name: 'UsersPage',
			title: 'general.users',
		},
		rights: {
			name: 'RightsPage',
			title: 'general.rights',
		},
	},
	translations: {
		name: 'TranslationsPage',
		title: 'general.translations',
		icon: 'ChatDotRound',
	},
	media: {
		name: 'MediaPage',
		title: 'general.media',
		icon: 'Picture',
	},
	orchestrator: {
		name: 'OrchestratorPage',
		title: 'general.orchestrator',
		icon: 'Coordinate',
	},
} as const
