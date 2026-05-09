<template>
	<div class="ui-auth-widget" :class="[`ui-auth-widget--${mode}`]">
		<div class="ui-auth-widget__container">
			<h2 class="ui-auth-widget__title">{{ title }}</h2>
			<p class="ui-auth-widget__subtitle">{{ subtitle }}</p>

			<el-form class="ui-auth-widget__form" label-position="top" :model="authForm" @submit.prevent="handleSubmit">
				<el-form-item v-if="mode === 'register'" label="Имя">
					<el-input v-model="authForm.name" placeholder="Введите ваше имя" />
				</el-form-item>

				<el-form-item label="Email">
					<el-input v-model="authForm.email" placeholder="example@mail.com" />
				</el-form-item>

				<el-form-item v-if="mode !== 'forgot-password'" label="Пароль">
					<el-input v-model="authForm.password" placeholder="••••••••" show-password type="password" />
				</el-form-item>

				<el-alert v-if="error" class="ui-auth-widget__error" :closable="false" show-icon :title="error" type="error" />

				<el-button class="ui-auth-widget__submit" :loading="loading" native-type="submit" type="primary">
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
import { type AuthMode, useAuthWidget } from '../lib/useAuthWidget'

const props = defineProps<{
	initialMode?: AuthMode
}>()

const { mode, loading, authForm, title, subtitle, submitButtonText, error, setMode, handleSubmit } = useAuthWidget(
	props.initialMode
)
</script>

<style lang="scss" scoped>
@use 'styles.scss';
</style>
