<template>
	<el-dialog
		v-model="isModalOpen"
		:title="isEditing ? 'Edit user' : 'Add user'"
		width="600px"
		@closed="handleModalClose"
	>
		<el-form ref="formRef" v-loading="isSubmitting" label-width="120px" :model="form" :rules="rules" @submit.prevent>
			<el-form-item label="Email" prop="email">
				<el-input v-model="form.email" />
			</el-form-item>
			<el-form-item v-if="!isEditing" label="Password" prop="password">
				<el-input v-model="form.password" type="password" />
			</el-form-item>
			<el-form-item label="First name" prop="firstName">
				<el-input v-model="form.firstName" />
			</el-form-item>
			<el-form-item label="Second name" prop="secondName">
				<el-input v-model="form.secondName" />
			</el-form-item>
			<el-form-item label="Last name">
				<el-input v-model="form.lastName" />
			</el-form-item>
			<el-form-item label="Phone">
				<el-input v-model="form.phone" />
			</el-form-item>
			<el-form-item label="Birth date">
				<el-date-picker
					v-model="form.birthDate"
					format="YYYY-MM-DD"
					placeholder="Pick a date"
					type="date"
					value-format="YYYY-MM-DD"
				/>
			</el-form-item>
			<el-form-item label="Role">
				<el-select v-model="form.role" clearable placeholder="Select role" popper-class="premium-dark-select">
					<el-option label="Superadmin" :value="UserRole.Superadmin" />
					<el-option label="Admin" :value="UserRole.Admin" />
					<el-option label="Editor" :value="UserRole.Editor" />
					<el-option label="User" :value="UserRole.User" />
				</el-select>
			</el-form-item>
			<el-form-item label="Status">
				<el-select v-model="form.status" clearable placeholder="Select status" popper-class="premium-dark-select">
					<el-option label="Active" :value="UserStatus.Active" />
					<el-option label="Inactive" :value="UserStatus.Inactive" />
					<el-option label="In moderation" :value="UserStatus.InModeration" />
				</el-select>
			</el-form-item>
			<el-form-item label="Street">
				<el-input v-model="form.street" />
			</el-form-item>
			<el-form-item label="City">
				<el-input v-model="form.city" />
			</el-form-item>
			<el-form-item label="Gender">
				<el-radio-group v-model="form.gender">
					<el-radio label="male">Male</el-radio>
					<el-radio label="female">Female</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-upload
				action="#"
				:auto-upload="false"
				class="avatar-uploader"
				:on-change="onFilesChange"
				:show-file-list="false"
			>
				<img v-if="avatarUrl" class="avatar" :src="avatarUrl" />
				<el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
			</el-upload>
		</el-form>

		<template #footer>
			<el-button @click="handleModalClose">Cancel</el-button>
			<el-button :loading="isSubmitting" type="primary" @click="submit">
				{{ isEditing ? 'Save' : 'Create' }}
			</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue'

import { uploadMedia } from '@admin-panel/lib'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadProps } from 'element-plus'

import type { IUserCreateUpdate } from '#entities/user'
import { UserRole, UserStatus, useUsers } from '#entities/user'

const rules = computed<FormRules>(() => ({
	email: [{ required: true, message: 'Email is required', trigger: 'blur' }],
	password: [{ required: !isEditing.value, message: 'Password is required', trigger: 'blur' }],
}))

const { isModalOpen, closeModal, handleSubmit, isSubmitting, editingUser, editingUserUuid } = useUsers()

const formRef = useTemplateRef<FormInstance>('formRef')

const avatarUrl = ref<string>('')

const form = ref<IUserCreateUpdate>({
	email: '',
	password: '',
	firstName: '',
	secondName: '',
	lastName: '',
	phone: '',
	birthDate: '',
	role: UserRole.User,
	status: UserStatus.Active,
	avatar: '',
	avatarUuid: null,
	city: '',
	gender: '',
	street: '',
})

const isEditing = computed(() => !!editingUserUuid.value)

watch([isModalOpen, editingUser, editingUserUuid], ([isOpen, user, userUuid]) => {
	formRef.value?.clearValidate()

	if (isOpen && user?.data && userUuid) {
		setFormData(user.data)

		avatarUrl.value = user.data.avatar || ''
	}
})

const setFormData = (user: IUserCreateUpdate) => {
	form.value = {
		email: user.email || '',
		password: user.password || '',
		firstName: user.firstName || '',
		secondName: user.secondName || '',
		lastName: user.lastName || '',
		phone: user.phone || '',
		birthDate: user.birthDate || '',
		role: user.role || UserRole.User,
		status: user.status || UserStatus.Active,
		avatar: user.avatar || '',
		avatarUuid: user.avatarUuid || null,
		city: user.city || '',
		gender: user.gender || '',
		street: user.street || '',
	}
}

const onFilesChange: UploadProps['onChange'] = async (file) => {
	const result = await uploadMedia(file.raw!)

	avatarUrl.value = result?.url ?? ''

	form.value.avatarUuid = result?.uuid ?? null
}

const handleModalClose = () => {
	closeModal()

	resetForm()
}

const resetForm = () => {
	avatarUrl.value = ''

	form.value = {
		email: '',
		password: '',
		firstName: '',
		secondName: '',
		lastName: '',
		phone: '',
		birthDate: '',
		role: UserRole.User,
		status: UserStatus.Active,
		avatar: '',
		avatarUuid: null,
		city: '',
		gender: '',
		street: '',
	}
}

const submit = async () => {
	await formRef.value?.validate()

	if (!isEditing.value) {
		handleSubmit({
			...form.value,
			avatar: avatarUrl.value,
			birthDate: form.value.birthDate || undefined,
			lastName: form.value.lastName || undefined,
			phone: form.value.phone || undefined,
		})
	} else {
		handleSubmit({
			...form.value,
			uuid: editingUserUuid.value,
			avatar: avatarUrl.value,
			birthDate: form.value.birthDate || undefined,
			lastName: form.value.lastName || undefined,
			phone: form.value.phone || undefined,
		})
	}
}
</script>

<style scoped>
.avatar-uploader .avatar {
	width: 178px;
	height: 178px;
	display: block;
}
</style>

<style>
.avatar-uploader .el-upload {
	position: relative;
	border: 1px dashed var(--border-color);
	border-radius: 6px;
	background-color: var(--bg-surface);
	transition: var(--el-transition-duration-fast);
	cursor: pointer;
	overflow: hidden;
}

.avatar-uploader .el-upload:hover {
	border-color: var(--accent-primary);
}

.el-icon.avatar-uploader-icon {
	width: 178px;
	height: 178px;
	font-size: 28px;
	text-align: center;
	color: var(--text-muted);
}
</style>
