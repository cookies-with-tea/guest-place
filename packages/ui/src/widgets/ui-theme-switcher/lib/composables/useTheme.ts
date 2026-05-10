import { ref } from 'vue'

import { GP_EVENTS, isBrowser, useEvents } from '@admin-panel/lib'

const { dispatch, on } = useEvents()

const THEME_KEY = 'gp-theme-mode'

const getInitialTheme = () => {
	if (!isBrowser) return true

	const saved = localStorage.getItem(THEME_KEY)

	if (saved) return saved === 'dark'

	return window.matchMedia('(prefers-color-scheme: dark)').matches
}

const isDark = ref(getInitialTheme())

const updateDOM = (dark: boolean) => {
	if (!isBrowser) return

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

	if (isBrowser) {
		localStorage.setItem(THEME_KEY, mode)
	}

	updateDOM(isDark.value)

	dispatch(GP_EVENTS.THEME_CHANGED, { isDark: isDark.value })
}

// Initial sync
if (isBrowser) {
	updateDOM(isDark.value)

	// Listen for changes from other TABS
	on(GP_EVENTS.STORAGE, (event: any) => {
		const storageEvent = event as StorageEvent

		if (storageEvent.key === THEME_KEY) {
			const dark = storageEvent.newValue === 'dark'

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
