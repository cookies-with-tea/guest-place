import 'vue'

declare module 'vue' {
	interface ComponentCustomProperties {
		/** Global translation helper registered by i18nPlugin */
		$T: (key: string, params?: Record<string, any>) => string
	}
}

export {}
