/**
 * Smart UI Style Loader
 * Avoids duplicating global library styles when running inside the Shell.
 */
export function initUiStyles() {
	if (typeof window === 'undefined') return

	// Check if core styles are already loaded by the Shell or another MF
	if (window.document.documentElement.dataset.gpUiStylesLoaded) {
		return
	}

	// Mark as loaded
	window.document.documentElement.dataset.gpUiStylesLoaded = 'true'

	// Load heavy library styles
	// @ts-ignore
	import('element-plus/dist/index.css')
	// @ts-ignore
	import('element-plus/theme-chalk/dark/css-vars.css')

	// Load our global resets/side-effects only once
	// @ts-ignore
	import('../assets/styles/index.scss')
}
