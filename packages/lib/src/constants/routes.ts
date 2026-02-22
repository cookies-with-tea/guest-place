// TODO: Переписать на подрузку из админки

export const ROUTES = {
	users: {
		name: 'UsersPage',
		title: 'general.users',
	},
	translations: {
		name: 'TranslationsPage',
		title: 'general.tranlsations',
  },
  media: {
    name: 'MediaPage',
    title: 'general.media'
	}
} as const
