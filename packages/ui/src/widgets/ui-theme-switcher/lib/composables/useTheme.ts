import { ref } from 'vue'

const THEME_KEY = 'gp-theme-mode'

const isDark = ref(localStorage.getItem(THEME_KEY) === 'dark')

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
		window.dispatchEvent(new CustomEvent('gp-theme-changed', { detail: { isDark: isDark.value } }))
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
	window.addEventListener('gp-theme-changed', ((event: CustomEvent) => {
		if (isDark.value !== event.detail.isDark) {
			isDark.value = event.detail.isDark

			updateDOM(isDark.value)
		}
	}) as EventListener)
}

export const useTheme = () => {
	return {
		isDark,
		toggleTheme,
	}
}
