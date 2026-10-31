/**
 * Smart UI Style Loader
 * Avoids duplicating global library styles when running inside the Shell.
 *
 * Strategy: Inject critical CSS variables synchronously to prevent FOUC,
 * then load heavy library styles asynchronously.
 */

/** Critical CSS token that must be applied before first paint to prevent FOUC */
const CRITICAL_CSS = `
  :root {
    --gp-bg-main: #0b1120;
    --gp-bg-surface: #131a2e;
    --gp-bg-element: #1a2240;
    --gp-primary: #a78bfa;
    --gp-primary-hover: #c4b5fd;
    --gp-primary-light: rgba(167, 139, 250, 0.18);
    --gp-primary-light-5: rgba(167, 139, 250, 0.5);
    --gp-primary-light-7: rgba(167, 139, 250, 0.7);
    --gp-text-main: #f0f6fc;
    --gp-text-secondary: #8b949e;
    --gp-text-disabled: #484f58;
    --gp-border-color: #30363d;
    --gp-border-color-hover: rgba(255,255,255,0.2);
    --gp-bg-glass: #131a2e;
    --gp-bg-glass-hover: #1a2240;
    --gp-glass-blur: 0px;
    --gp-glass-border: rgba(255,255,255,0.08);
    --gp-glass-shadow: 0 8px 32px 0 rgba(0,0,0,0.45);
    --gp-radius-sm: 16px;
    --gp-radius-md: 24px;
    --gp-radius-lg: 32px;
    --gp-sidebar-width: 260px;
    --gp-header-height: 64px;
  }
  html.light {
    --gp-bg-main: #f6f8fa;
    --gp-bg-surface: #fff;
    --gp-bg-element: #f3f4f6;
    --gp-text-main: #1f2328;
    --gp-text-secondary: #656d76;
    --gp-text-disabled: #8c959f;
    --gp-border-color: #d0d7de;
    --gp-border-color-hover: rgba(0,0,0,0.1);
    --gp-primary: #7c3aed;
    --gp-primary-hover: #6d28d9;
    --gp-primary-light: rgba(124, 58, 237, 0.12);
    --gp-primary-light-5: rgba(124, 58, 237, 0.5);
    --gp-primary-light-7: rgba(124, 58, 237, 0.7);
    --gp-bg-glass: #fff;
    --gp-bg-glass-hover: #f9f8fd;
    --gp-glass-border: #ece9f7;
    --gp-glass-shadow: 0 4px 20px 0 rgba(124, 58, 237, 0.08);
  }
  /* Anti-FOUC: hide body until styles are applied */
  body { opacity: 0; transition: opacity 0.15s ease; }
  body.gp-ready { opacity: 1; }
`

import { isBrowser } from '@admin-panel/lib'

export function initUiStyles() {
	if (!isBrowser) return

	// Check if core styles are already loaded by the Shell or another MF
	if (window.document.documentElement.dataset.gpUiStylesLoaded || (window as any).__gp_styles_loading) {
		return
	}

	// Mark as loading/loaded
	;(window as any).__gp_styles_loading = true

	window.document.documentElement.dataset.gpUiStylesLoaded = 'true'

	// 1. Inject critical CSS synchronously — prevents FOUC on first paint

	const criticalStyle = document.createElement('style')

	criticalStyle.id = 'gp-critical'

	// Load persisted theme settings
	const savedAccent = localStorage.getItem('gp-theme-accent-color') || '#7c3aed'
	const savedBlur = localStorage.getItem('gp-theme-glass-blur') || '16'

	const themedCss = CRITICAL_CSS.replace(/--gp-primary:\s*[^;]+;/, `--gp-primary: ${savedAccent};`)
		.replace(/--gp-primary-light:\s*[^;]+;/, `--gp-primary-light: ${savedAccent}33;`)
		.replace(/--gp-primary-light-5:\s*[^;]+;/, `--gp-primary-light-5: ${savedAccent}80;`)
		.replace(/--gp-primary-light-7:\s*[^;]+;/, `--gp-primary-light-7: ${savedAccent}b3;`)
		.replace(/--gp-glass-blur:\s*[^;]+;/, `--gp-glass-blur: ${savedBlur}px;`)

	criticalStyle.textContent = themedCss

	document.head.insertBefore(criticalStyle, document.head.firstChild)

	// Heavy styles are now injected via import '@admin-panel/ui/inject-styles' in main.ts
	// We still reveal the body after a short tick to ensure styles are applied
	setTimeout(() => {
		document.body.classList.add('gp-ready')
	}, 100)
}
