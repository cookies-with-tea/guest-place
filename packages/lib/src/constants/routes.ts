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
	directus: {
		name: 'DirectusPage',
		title: 'general.directus',
	},
	'directus-2': {
		name: 'Directus2Page',
		title: 'general.directus-2',
	},
} as const
