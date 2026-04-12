import type { App } from 'vue'

export interface MFLifecycleHooks {
	/**
	 * Called when the micro-frontend is loaded and initialized.
	 * Can be used to register global stores, styles, or logic.
	 */
	onMount?: (app: App, context: any) => void | Promise<void>

	/**
	 * Called when the micro-frontend is about to be unmounted or replaced.
	 */
	onUnmount?: (app: App) => void | Promise<void>
}

/**
 * Standard interface for a remote module's entry point.
 */
export interface remoteModuleEntry {
	routes: any[]
	hooks?: MFLifecycleHooks
}
