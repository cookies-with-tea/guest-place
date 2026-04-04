export const APPS_PORTS = {
	shell: {
		preview: 3000,
		dev: 4173,
	},
	statistics: {
		preview: 3001,
		dev: 4174,
	},
	translations: {
		preview: 3002,
		dev: 4175,
	},
	users: {
		preview: 3003,
		dev: 4176,
  },
  media: {
    preview: 4004,
    dev: 4177,
  },
} as const

export const PACKAGES_PORTS = {
	i18n: {
		preview: 6000,
		dev: 4177,
	},
	ui: {
		preview: 6001,
		dev: 4178,
	},
} as const
