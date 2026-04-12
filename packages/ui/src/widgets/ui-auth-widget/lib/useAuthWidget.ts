import { ref, reactive, computed } from 'vue'
import { authApi, useAuth } from '@admin-panel/lib'

export type AuthMode = 'login' | 'register' | 'forgot-password' | 'mfa'

export function useAuthWidget(initialMode: AuthMode = 'login') {
	const mode = ref<AuthMode>(initialMode)
	const loading = ref(false)
	const error = ref<string | null>(null)

	const { setTokens, setUser } = useAuth()

	const authForm = reactive({
		name: '',
		email: '',
		password: '',
		rememberMe: false,
	})

	const title = computed(() => {
		switch (mode.value) {
			case 'login':
				return 'С возвращением'
			case 'register':
				return 'Создать аккаунт'
			case 'forgot-password':
				return 'Восстановление доступа'
			case 'mfa':
				return 'Второй этап проверки'
			default:
				return ''
		}
	})

	const subtitle = computed(() => {
		switch (mode.value) {
			case 'login':
				return 'Введите свои данные для входа'
			case 'register':
				return 'Присоединяйтесь к Guest Place сегодня'
			case 'forgot-password':
				return 'Мы отправим инструкции на ваш email'
			case 'mfa':
				return 'Введите код из приложения'
			default:
				return ''
		}
	})

	const submitButtonText = computed(() => {
		switch (mode.value) {
			case 'login':
				return 'Войти'
			case 'register':
				return 'Зарегистрироваться'
			case 'forgot-password':
				return 'Сбросить пароль'
			case 'mfa':
				return 'Подтвердить'
			default:
				return 'Отправить'
		}
	})

	const setMode = (newMode: AuthMode) => {
		mode.value = newMode

		error.value = null
	}

	const handleLogin = async () => {
		try {
			loading.value = true

			error.value = null

			const response = await authApi.login({
				email: authForm.email,
				password: authForm.password,
			})

			if (response.data) {
				setTokens({
					accessToken: response.data.accessToken,
					refreshToken: response.data.refreshToken,
				})

				// Optional: fetch user profile here
				setUser({
					uuid: 'temp-uuid', // Should come from payload or separate call
					email: authForm.email,
					role: 'admin', // Should be reactive based on token/profile
				})

				// Refresh page to apply new state across all MFEs
				window.location.reload()
			}
		} catch (e: any) {
			error.value = e.messages?.[0] || 'Ошибка при входе'
		} finally {
			loading.value = false
		}
	}

	const handleRegister = async () => {
		try {
			loading.value = true

			error.value = null

			await authApi.register({
				email: authForm.email,
				password: authForm.password,
				// ... other fields
			})

			setMode('login')
		} catch (e: any) {
			error.value = e.messages?.[0] || 'Ошибка при регистрации'
		} finally {
			loading.value = false
		}
	}

	const handleSubmit = async () => {
		if (mode.value === 'login') {
			await handleLogin()
		} else if (mode.value === 'register') {
			await handleRegister()
		}
	}

	return {
		mode,
		loading,
		authForm,
		title,
		subtitle,
		submitButtonText,
		error,
		setMode,
		handleSubmit,
	}
}
