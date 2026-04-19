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
		preview: 3004,
		dev: 4177,
	},
	orchestrator: {
		preview: 3005,
		dev: 4178,
	},
	about: {
		preview: 3006,
		dev: 4179,
	},
	content: {
		preview: 3007,
		dev: 4180,
	},
	guests: {
		preview: 3008,
		dev: 4181,
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
