import type { DefineComponent } from 'vue'

declare module '*.vue' {
	const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>
	export default component
}

declare module 'vue' {
	interface ComponentCustomProperties {
		/** Global translation helper registered by i18nPlugin */
		$T: (key: string, params?: Record<string, any>) => string
	}
}
