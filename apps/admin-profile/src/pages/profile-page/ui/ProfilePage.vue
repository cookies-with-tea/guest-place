<template>
	<div class="profile-page">
		<div class="profile-page__header">
			<h1 class="profile-page__title">Мой профиль</h1>
			<p class="profile-page__subtitle">Управляйте вашими личными данными и настройками безопасности</p>
		</div>

		<div v-if="isLoading" class="profile-page__loading">
			<el-skeleton animated :rows="10" />
		</div>

		<div v-else class="profile-page__content">
			<!-- Personal Info Section -->
			<section class="profile-section">
				<div class="profile-section__header">
					<h2 class="profile-section__title">Личная информация</h2>
				</div>
				<div class="profile-section__body">
					<div class="profile-avatar">
						<div class="profile-avatar__preview">
							<img v-if="avatarUrl" :src="avatarUrl" alt="Avatar" />
							<div v-else class="profile-avatar__placeholder">
								<el-icon><User /></el-icon>
							</div>
							<div class="profile-avatar__overlay">
								<el-upload action="#" :auto-upload="false" :on-change="onAvatarChange" :show-file-list="false">
									<el-icon class="profile-avatar__edit-icon"><Camera /></el-icon>
								</el-upload>
							</div>
						</div>
						<div class="profile-avatar__actions">
							<h3 class="profile-avatar__name">{{ form.firstName }} {{ form.lastName }}</h3>
							<p class="profile-avatar__hint">JPG, PNG или WebP. Максимум 2МБ.</p>
						</div>
					</div>

					<el-form class="profile-form" label-position="top" :model="form">
						<div class="profile-form__row">
							<el-form-item label="Имя" class="profile-form__item">
								<el-input v-model="form.firstName" placeholder="Введите имя" />
							</el-form-item>
							<el-form-item label="Фамилия" class="profile-form__item">
								<el-input v-model="form.lastName" placeholder="Введите фамилию" />
							</el-form-item>
						</div>
						<div class="profile-form__row">
							<el-form-item label="Email" class="profile-form__item">
								<el-input v-model="form.email" disabled />
							</el-form-item>
							<el-form-item label="Телефон" class="profile-form__item">
								<el-input v-model="form.phone" placeholder="+7 (999) 000-00-00" />
							</el-form-item>
						</div>
						<div class="profile-form__actions">
							<el-button :loading="isUpdating" type="primary" @click="saveProfile">Сохранить изменения</el-button>
						</div>
					</el-form>
				</div>
			</section>

			<!-- Security Section -->
			<section class="profile-section">
				<div class="profile-section__header">
					<h2 class="profile-section__title">Безопасность</h2>
				</div>
				<div class="profile-section__body">
					<el-form class="profile-form" label-position="top" :model="passwordForm">
						<el-form-item label="Текущий пароль">
							<el-input v-model="passwordForm.oldPassword" show-password type="password" />
						</el-form-item>
						<div class="profile-form__row">
							<el-form-item label="Новый пароль" class="profile-form__item">
								<el-input v-model="passwordForm.newPassword" show-password type="password" />
							</el-form-item>
							<el-form-item label="Подтвердите пароль" class="profile-form__item">
								<el-input v-model="confirmPassword" show-password type="password" />
							</el-form-item>
						</div>
						<div class="profile-form__actions">
							<el-button :loading="isChangingPassword" type="warning" @click="changePassword"
								>Обновить пароль</el-button
							>
						</div>
					</el-form>
				</div>
			</section>

			<!-- Notifications Section -->
			<section class="profile-section">
				<div class="profile-section__header">
					<h2 class="profile-section__title">Уведомления</h2>
				</div>
				<div class="profile-section__body">
					<div class="notification-item">
						<div class="notification-item__info">
							<h3 class="notification-item__title">Email-уведомления</h3>
							<p class="notification-item__description">Получать новости и обновления на электронную почту</p>
						</div>
						<el-switch v-model="notifications.email" />
					</div>
					<div class="notification-item">
						<div class="notification-item__info">
							<h3 class="notification-item__title">Системные уведомления</h3>
							<p class="notification-item__description">Уведомления о действиях в системе</p>
						</div>
						<el-switch v-model="notifications.system" />
					</div>
				</div>
			</section>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import { uploadMedia } from '@admin-panel/lib'
import { Camera, User } from '@element-plus/icons-vue'
import { ElMessage, type UploadProps } from 'element-plus'

import { useProfile } from '../../../entities/user/lib/composables'

const { profile, isLoading, isUpdating, isChangingPassword, handleUpdate, handleChangePassword } = useProfile()

const avatarUrl = ref('')
const form = ref({
	firstName: '',
	lastName: '',
	email: '',
	phone: '',
	avatarUuid: null as string | null,
})

const passwordForm = ref({
	oldPassword: '',
	newPassword: '',
})
const confirmPassword = ref('')

const notifications = ref({
	email: true,
	system: true,
})

onMounted(() => {
	if (profile.value) {
		syncForm()
	}
})

watch(profile, (newProfile) => {
	if (newProfile) {
		syncForm()
	}
})

const syncForm = () => {
	const user = profile.value?.data

	if (!user) return
	form.value.firstName = user.firstName || ''

	form.value.lastName = user.lastName || ''

	form.value.email = user.email || ''

	form.value.phone = user.phone || ''

	avatarUrl.value = user.avatar || ''
}

const onAvatarChange: UploadProps['onChange'] = async (file) => {
	try {
		const result = await uploadMedia(file.raw!)

		if (result) {
			avatarUrl.value = result.url

			form.value.avatarUuid = result.uuid

			ElMessage.success('Аватар успешно загружен')
		}
	} catch {
		ElMessage.error('Ошибка при загрузке аватара')
	}
}

const saveProfile = async () => {
	try {
		await handleUpdate({
			firstName: form.value.firstName,
			lastName: form.value.lastName,
			phone: form.value.phone,
			avatar: avatarUrl.value,
			avatarUuid: form.value.avatarUuid,
		})

		ElMessage.success('Профиль успешно обновлен')
	} catch {
		ElMessage.error('Ошибка при обновлении профиля')
	}
}

const changePassword = async () => {
	if (passwordForm.value.newPassword !== confirmPassword.value) {
		ElMessage.error('Пароли не совпадают')

		return
	}

	try {
		await handleChangePassword({
			oldPassword: passwordForm.value.oldPassword,
			newPassword: passwordForm.value.newPassword,
		})

		ElMessage.success('Пароль успешно изменен')

		passwordForm.value.oldPassword = ''

		passwordForm.value.newPassword = ''

		confirmPassword.value = ''
	} catch {
		ElMessage.error('Ошибка при смене пароля')
	}
}
</script>

<style lang="scss" scoped>
.profile-page {
	max-width: 1000px;
	padding: 24px;
	margin: 0 auto;

	&__header {
		margin-bottom: 40px;
	}

	&__title {
		font-weight: 700;
		font-size: 32px;
		color: var(--gp-text-main);
		margin-bottom: 8px;
	}

	&__subtitle {
		font-size: 16px;
		color: var(--gp-text-secondary);
	}

	&__content {
		display: flex;
		flex-direction: column;
		gap: 32px;
	}
}

.profile-section {
	border: 1px solid var(--gp-glass-border);
	border-radius: var(--gp-radius-md);
	box-shadow: var(--gp-glass-shadow);
	background: var(--gp-bg-glass);
	overflow: hidden;
	backdrop-filter: blur(var(--gp-glass-blur));

	&__header {
		border-bottom: 1px solid var(--gp-glass-border);
		padding: 24px 32px;
	}

	&__title {
		font-weight: 600;
		font-size: 20px;
		color: var(--gp-text-main);
	}

	&__body {
		padding: 32px;
	}
}

.profile-avatar {
	display: flex;
	align-items: center;
	margin-bottom: 32px;
	gap: 24px;

	&__preview {
		width: 100px;
		height: 100px;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid var(--gp-glass-border);
		border-radius: 50%;
		background: var(--gp-bg-element);
		transition: all 0.3s ease;
		overflow: hidden;

		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}

		.el-icon {
			font-size: 40px;
			color: var(--gp-text-disabled);
		}

		&:hover .profile-avatar__overlay {
			opacity: 1;
		}

		&:hover {
			border-color: var(--gp-primary);
			transform: scale(1.05);
		}
	}

	&__overlay {
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgb(0, 0, 0, 0.4);
		transition: opacity 0.3s ease;
		cursor: pointer;
		opacity: 0;
	}

	&__edit-icon {
		font-size: 24px !important;
		color: #fff !important;
	}

	&__actions {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	&__name {
		font-weight: 600;
		font-size: 18px;
		color: var(--gp-text-main);
	}

	&__hint {
		font-size: 12px;
		color: var(--gp-text-secondary);
	}
}

.profile-form {
	&__row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 24px;

		@media (width <= 768px) {
			grid-template-columns: 1fr;
			gap: 0;
		}
	}

	&__actions {
		display: flex;
		justify-content: flex-end;
		margin-top: 16px;
	}

	:deep(.el-form-item__label) {
		font-weight: 500;
		color: var(--gp-text-secondary);
	}

	:deep(.el-input__wrapper) {
		border: 1px solid var(--gp-border-color) !important;
		border-radius: 12px;
		box-shadow: none !important;
		background: var(--gp-bg-element) !important;

		&.is-focus {
			border-color: var(--gp-primary) !important;
		}
	}
}

.notification-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 0;

	&:not(:last-child) {
		border-bottom: 1px solid var(--gp-glass-border);
	}

	&__title {
		font-weight: 500;
		font-size: 16px;
		color: var(--gp-text-main);
		margin-bottom: 4px;
	}

	&__description {
		font-size: 14px;
		color: var(--gp-text-secondary);
	}
}
</style>
