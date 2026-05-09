import { ref } from 'vue'

import { GP_EVENTS, useEvents } from '@admin-panel/lib'

const { dispatch, on } = useEvents()

const THEME_KEY = 'gp-theme-mode'

const getInitialTheme = () => {
	const saved = localStorage.getItem(THEME_KEY)

	if (saved) return saved === 'dark'

	return window.matchMedia('(prefers-color-scheme: dark)').matches
}

const isDark = ref(getInitialTheme())

const updateDOM = (dark: boolean) => {
	if (typeof document === 'undefined') return

	if (dark) {
		document.documentElement.classList.add('dark')

		document.documentElement.classList.remove('light')
	} else {
		document.documentElement.classList.remove('dark')

		document.documentElement.classList.add('light')
	}
}

const toggleTheme = () => {
	isDark.value = !isDark.value

	const mode = isDark.value ? 'dark' : 'light'

	localStorage.setItem(THEME_KEY, mode)

	updateDOM(isDark.value)

	if (typeof window !== 'undefined') {
		dispatch(GP_EVENTS.THEME_CHANGED, { isDark: isDark.value })
	}
}

// Initial sync
if (typeof window !== 'undefined') {
	updateDOM(isDark.value)

	// Listen for changes from other TABS
	window.addEventListener('storage', (event) => {
		if (event.key === THEME_KEY) {
			const dark = event.newValue === 'dark'

			if (isDark.value !== dark) {
				isDark.value = dark

				updateDOM(dark)
			}
		}
	})

	// Listen for changes from the same window (MFE synchronization)
	on(GP_EVENTS.THEME_CHANGED, (event: any) => {
		if (isDark.value !== event.detail.isDark) {
			isDark.value = event.detail.isDark

			updateDOM(isDark.value)
		}
	})
}

export const useTheme = () => {
	return {
		isDark,
		toggleTheme,
	}
}
