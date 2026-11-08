/**
 * Side-effect import to inject global UI styles.
 * Smartly skips injection if styles are already present in the window context.
 */

import { isBrowser } from '@admin-panel/lib'

if (isBrowser) {
	// Global guard to prevent multiple injections across different MFEs
	if (!(window as any).__gp_styles_injected) {
		const isShell = !!(window as any).__gp_is_shell
		const isInsideShell = !!(window as any).__gp_shell_active

		// Inject only if we are the Shell OR if we are running standalone
		if (isShell || !isInsideShell) {
			;(window as any).__gp_styles_injected = true

			import('../assets/styles/bundle.scss')
		}
	}
}
