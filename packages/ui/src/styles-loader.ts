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
    --gp-bg-main: #0a0b10;
    --gp-bg-surface: #161b22;
    --gp-bg-element: #1f242c;
    --gp-primary: #42b883;
    --gp-primary-hover: #3fb27d;
    --gp-primary-light: rgba(66,184,131,0.2);
    --gp-text-main: #f0f6fc;
    --gp-text-secondary: #8b949e;
    --gp-text-disabled: #484f58;
    --gp-border-color: #30363d;
    --gp-border-color-hover: rgba(255,255,255,0.2);
    --gp-bg-glass: rgba(255,255,255,0.03);
    --gp-bg-glass-hover: rgba(255,255,255,0.06);
    --gp-glass-blur: 16px;
    --gp-glass-border: rgba(255,255,255,0.08);
    --gp-glass-shadow: 0 8px 32px 0 rgba(0,0,0,0.37);
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
    --gp-bg-glass: rgba(255,255,255,0.6);
    --gp-bg-glass-hover: rgba(255,255,255,0.8);
    --gp-glass-border: rgba(0,0,0,0.05);
    --gp-glass-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }
  /* Anti-FOUC: hide body until styles are applied */
  body { opacity: 0; transition: opacity 0.15s ease; }
  body.gp-ready { opacity: 1; }
`

export function initUiStyles() {
	if (typeof window === 'undefined') return

	// Check if core styles are already loaded by the Shell or another MF
	if (window.document.documentElement.dataset.gpUiStylesLoaded) {
		return
	}

	// Mark as loaded
	window.document.documentElement.dataset.gpUiStylesLoaded = 'true'

	// 1. Inject critical CSS synchronously — prevents FOUC on first paint

	const criticalStyle = document.createElement('style')

	criticalStyle.id = 'gp-critical'

	criticalStyle.textContent = CRITICAL_CSS

	document.head.insertBefore(criticalStyle, document.head.firstChild)

	// 2. Load heavy library styles asynchronously (non-blocking)
	// @ts-ignore
	const elPlusMain = import('element-plus/dist/index.css')
	// @ts-ignore
	const elPlusDark = import('element-plus/theme-chalk/dark/css-vars.css')
	// @ts-ignore
	const globalStyles = import('../assets/styles/index.scss')

	// 3. Reveal body once critical assets are ready
	Promise.all([elPlusMain, elPlusDark, globalStyles]).then(() => {
		document.body.classList.add('gp-ready')
	})
}
