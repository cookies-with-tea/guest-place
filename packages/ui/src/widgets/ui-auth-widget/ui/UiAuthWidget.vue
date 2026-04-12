<template>
	<div class="ui-auth-widget" :class="[`ui-auth-widget--${mode}`]">
		<div class="ui-auth-widget__container">
			<h2 class="ui-auth-widget__title">{{ title }}</h2>
			<p class="ui-auth-widget__subtitle">{{ subtitle }}</p>

			<el-form :model="authForm" class="ui-auth-widget__form" label-position="top">
				<el-form-item v-if="mode === 'register'" label="Имя">
					<el-input v-model="authForm.name" placeholder="Введите ваше имя" />
				</el-form-item>

				<el-form-item label="Email">
					<el-input v-model="authForm.email" placeholder="example@mail.com" />
				</el-form-item>

				<el-form-item v-if="mode !== 'forgot-password'" label="Пароль">
					<el-input v-model="authForm.password" type="password" show-password placeholder="••••••••" />
				</el-form-item>

				<div v-if="mode === 'login'" class="ui-auth-widget__extra">
					<el-checkbox v-model="authForm.rememberMe">Запомнить меня</el-checkbox>
					<el-link type="primary" :underline="false" @click="setMode('forgot-password')">
						Забыли пароль?
					</el-link>
				</div>

				<el-button type="primary" class="ui-auth-widget__submit" :loading="loading" @click="handleSubmit">
					{{ submitButtonText }}
				</el-button>
			</el-form>

			<div class="ui-auth-widget__footer">
				<template v-if="mode === 'login'">
					Нет аккаунта? <el-link type="primary" @click="setMode('register')">Зарегистрироваться</el-link>
				</template>
				<template v-else-if="mode === 'register'">
					Уже есть аккаунт? <el-link type="primary" @click="setMode('login')">Войти</el-link>
				</template>
				<template v-else>
					<el-link type="primary" @click="setMode('login')">Вернуться к логину</el-link>
				</template>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'

type AuthMode = 'login' | 'register' | 'forgot-password' | 'mfa'

const props = defineProps<{
	initialMode?: AuthMode
}>()

const mode = ref<AuthMode>(props.initialMode || 'login')
const loading = ref(false)

const authForm = reactive({
	name: '',
	email: '',
	password: '',
	rememberMe: false
})

const title = computed(() => {
	switch (mode.value) {
		case 'login': return 'С возвращением'
		case 'register': return 'Создать аккаунт'
		case 'forgot-password': return 'Восстановление доступа'
		case 'mfa': return 'Второй этап проверки'
		default: return ''
	}
})

const subtitle = computed(() => {
	switch (mode.value) {
		case 'login': return 'Введите свои данные для входа'
		case 'register': return 'Присоединяйтесь к Guest Place сегодня'
		case 'forgot-password': return 'Мы отправим инструкции на ваш email'
		case 'mfa': return 'Введите код из приложения'
		default: return ''
	}
})

const submitButtonText = computed(() => {
	switch (mode.value) {
		case 'login': return 'Войти'
		case 'register': return 'Зарегистрироваться'
		case 'forgot-password': return 'Сбросить пароль'
		case 'mfa': return 'Подтвердить'
		default: return 'Отправить'
	}
})

const setMode = (newMode: AuthMode) => {
	mode.value = newMode
}

const handleSubmit = async () => {
	loading.value = true
	// Mock API call
	await new Promise(resolve => setTimeout(resolve, 1500))
	loading.value = false
	console.log('Auth submitted:', { mode: mode.value, ...authForm })
}
</script>

<style lang="scss" scoped>
@use 'styles.scss';
</style>
