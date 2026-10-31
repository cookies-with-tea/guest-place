import '@admin-panel/i18n'

declare module 'vue' {
	interface ComponentCustomProperties {
		/** Global translation helper registered by i18nPlugin. Use $T('key') */
		$T: (key: string, params?: Record<string, any>) => string
	}
}
