import { ref, watch } from 'vue'

import { GP_EVENTS, isBrowser, useEvents } from '@admin-panel/lib'

const ACCENT_COLOR_KEY = 'gp-theme-accent-color'
const GLASS_BLUR_KEY = 'gp-theme-glass-blur'

const DEFAULT_ACCENT = '#42b883'
const DEFAULT_BLUR = 16

const accentColor = ref(isBrowser ? localStorage.getItem(ACCENT_COLOR_KEY) || DEFAULT_ACCENT : DEFAULT_ACCENT)
const glassBlur = ref(isBrowser ? Number(localStorage.getItem(GLASS_BLUR_KEY)) || DEFAULT_BLUR : DEFAULT_BLUR)

const { dispatch, on } = useEvents()

export const useThemeBuilder = () => {
	const applyTheme = () => {
		if (!isBrowser) return

		const root = document.documentElement
		const color = accentColor.value

		root.style.setProperty('--gp-primary', color)

		root.style.setProperty('--gp-glass-blur', `${glassBlur.value}px`)

		// Try to handle transparency for shades if it's a hex color
		if (color.startsWith('#') && color.length === 7) {
			root.style.setProperty('--gp-primary-hover', color)

			root.style.setProperty('--gp-primary-light', `${color}33`)

			root.style.setProperty('--gp-primary-light-5', `${color}80`)

			root.style.setProperty('--gp-primary-light-7', `${color}b3`)
		} else {
			root.style.setProperty('--gp-primary-hover', color)

			root.style.setProperty('--gp-primary-light', color)

			root.style.setProperty('--gp-primary-light-5', color)

			root.style.setProperty('--gp-primary-light-7', color)
		}
	}

	const resetTheme = () => {
		accentColor.value = DEFAULT_ACCENT

		glassBlur.value = DEFAULT_BLUR

		if (isBrowser) {
			localStorage.removeItem(ACCENT_COLOR_KEY)

			localStorage.removeItem(GLASS_BLUR_KEY)
		}

		applyTheme()

		dispatch(GP_EVENTS.THEME_SETTINGS_CHANGED, { accentColor: DEFAULT_ACCENT, glassBlur: DEFAULT_BLUR })
	}

	watch(accentColor, (val) => {
		if (isBrowser) localStorage.setItem(ACCENT_COLOR_KEY, val)
		applyTheme()

		dispatch(GP_EVENTS.THEME_SETTINGS_CHANGED, { accentColor: val, glassBlur: glassBlur.value })
	})

	watch(glassBlur, (val) => {
		if (isBrowser) localStorage.setItem(GLASS_BLUR_KEY, String(val))
		applyTheme()

		dispatch(GP_EVENTS.THEME_SETTINGS_CHANGED, { accentColor: accentColor.value, glassBlur: val })
	})

	// Listen for changes from other tabs/MFs
	if (isBrowser) {
		// Event bus listener (same tab)
		on(GP_EVENTS.THEME_SETTINGS_CHANGED, (event: any) => {
			const { accentColor: newAccent, glassBlur: newBlur } = event.detail

			if (newAccent !== accentColor.value) {
				accentColor.value = newAccent

				applyTheme()
			}

			if (newBlur !== glassBlur.value) {
				glassBlur.value = newBlur

				applyTheme()
			}
		})

		// Storage listener (different tabs) — using useEvents.on instead of window.addEventListener
		on(GP_EVENTS.STORAGE, (event: StorageEvent) => {
			if (event.key === ACCENT_COLOR_KEY && event.newValue && event.newValue !== accentColor.value) {
				accentColor.value = event.newValue

				applyTheme()
			}

			if (event.key === GLASS_BLUR_KEY && event.newValue && Number(event.newValue) !== glassBlur.value) {
				glassBlur.value = Number(event.newValue)

				applyTheme()
			}
		})
	}

	// Initial apply
	if (isBrowser) {
		applyTheme()
	}

	return {
		accentColor,
		glassBlur,
		resetTheme,
		applyTheme,
	}
}
