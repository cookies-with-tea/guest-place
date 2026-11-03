<template>
	<div class="ui-auth-widget" :class="[`ui-auth-widget--${mode}`]">
		<div class="ui-auth-widget__container">
			<h2 class="ui-auth-widget__title">{{ title }}</h2>
			<p class="ui-auth-widget__subtitle">{{ subtitle }}</p>

			<ElForm class="ui-auth-widget__form" label-position="top" :model="authForm" @submit.prevent="handleSubmit">
				<ElFormItem v-if="mode === 'register'" label="Имя">
					<ElInput v-model="authForm.name" placeholder="Введите ваше имя" />
				</ElFormItem>

				<ElFormItem label="Email">
					<ElInput v-model="authForm.email" placeholder="example@mail.com" />
				</ElFormItem>

				<ElFormItem v-if="mode !== 'forgot-password'" label="Пароль">
					<ElInput v-model="authForm.password" placeholder="••••••••" show-password type="password" />
				</ElFormItem>

				<ElAlert v-if="error" class="ui-auth-widget__error" :closable="false" show-icon :title="error" type="error" />

				<ElButton class="ui-auth-widget__submit" :loading="loading" native-type="submit" type="primary">
					{{ submitButtonText }}
				</ElButton>
			</ElForm>

			<div class="ui-auth-widget__footer">
				<template v-if="mode === 'login'">
					Нет аккаунта? <ElLink type="primary" @click="setMode('register')">Зарегистрироваться</ElLink>
				</template>
				<template v-else-if="mode === 'register'">
					Уже есть аккаунт? <ElLink type="primary" @click="setMode('login')">Войти</ElLink>
				</template>
				<template v-else>
					<ElLink type="primary" @click="setMode('login')">Вернуться к логину</ElLink>
				</template>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ElAlert, ElButton, ElForm, ElFormItem, ElInput, ElLink } from 'element-plus'

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
