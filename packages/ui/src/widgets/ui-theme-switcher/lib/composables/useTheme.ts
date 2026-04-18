import { ref } from 'vue'

const isDark = ref(localStorage.getItem('theme') === 'dark')

const toggleTheme = () => {
	isDark.value = !isDark.value

	localStorage.setItem('theme', isDark.value ? 'dark' : 'light')

	if (isDark.value) {
		document.documentElement.classList.add('dark')
	} else {
		document.documentElement.classList.remove('dark')
	}
}

// Initial check
if (isDark.value) {
	document.documentElement.classList.add('dark')
}

export const useTheme = () => {
	return {
		isDark,
		toggleTheme,
	}
}
