<template>
	<el-dialog :title="isEditing ? 'Edit user' : 'Add user'" v-model="isModalOpen" width="600px" @closed="handleModalClose">
		<el-form :model="form" :rules="rules" ref="formRef" label-width="120px" @submit.prevent>
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
					type="date"
					format="YYYY-MM-DD"
					value-format="YYYY-MM-DD"
					placeholder="Pick a date"
				/>
			</el-form-item>
			<el-form-item label="Role">
				<el-select v-model="form.role" clearable placeholder="Select role">
					<el-option label="Admin" :value="UserRole.Admin" />
					<el-option label="User" :value="UserRole.User" />
				</el-select>
			</el-form-item>
			<el-form-item label="Status">
				<el-select v-model="form.status" clearable placeholder="Select status">
					<el-option label="Active" :value="UserStatus.Active" />
					<el-option label="Inactive" :value="UserStatus.Inactive" />
					<el-option label="In moderation" :value="UserStatus.InModeration" />
				</el-select>
			</el-form-item>
			<el-upload
				:auto-upload="false"
				action="#"
				class="avatar-uploader"
				:on-change="onFilesChange"
				:show-file-list="false"
			>
				<img v-if="avtarUrl" :src="avtarUrl" class="avatar" />
				<el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
			</el-upload>
		</el-form>

		<template #footer>
			<el-button @click="handleModalClose">Cancel</el-button>
			<el-button type="primary" :loading="isSubmitting" @click="submit">
				{{ isEditing ? 'Save' : 'Create' }}
			</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import type { IUserCreateUpdate } from '#entities/user'
import { UserRole, UserStatus, useUsers } from '#entities/user'
import { uploadMedia } from '@admin-panel/lib'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadProps } from 'element-plus'
import { computed, ref, useTemplateRef, watch } from 'vue'

const rules = computed<FormRules>(() => ({
	email: [{ required: true, message: 'Email is required', trigger: 'blur' }],
	password: [{ required: !isEditing.value, message: 'Password is required', trigger: 'blur' }],
}))

const { isModalOpen, closeModal, handleSubmit, isSubmitting, editingUser, editingUserUuid } = useUsers()

const formRef = useTemplateRef<FormInstance>('formRef')

const avtarUrl = ref<string>('')

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
	city: '',
	gender: '',
	street: '',
})

const isEditing = computed(() => !!editingUserUuid.value)

watch([isModalOpen, editingUser, editingUserUuid], ([isOpen, user, userUuid]) => {
  formRef.value?.clearValidate()

	if (isOpen && user?.data && userUuid) {
		const u = user.data

		form.value = {
			email: u.email || '',
			password: u.password || '',
			firstName: u.firstName || '',
			secondName: u.secondName || '',
			lastName: u.lastName || '',
			phone: u.phone || '',
			birthDate: u.birthDate || '',
			role: u.role || UserRole.User,
			status: u.status || UserStatus.Active,
			avatar: u.avatar || '',
			city: u.city || '',
			gender: u.gender || '',
			street: u.street || '',
		}
	}
})

const onFilesChange: UploadProps['onChange'] = async (file) => {
	avtarUrl.value = (await uploadMedia(file.raw!))?.url ?? ''
}

const handleModalClose = () => {
  closeModal()

  resetForm()
}

const resetForm = () => {
	avtarUrl.value = ''

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
		city: '',
		gender: '',
		street: '',
	}
}

const submit = async () => {
	await formRef.value?.validate()

	if (!isEditing.value) {
		handleSubmit({
			email: form.value.email,
			password: form.value.password,
			firstName: form.value.firstName,
			secondName: form.value.secondName,
			lastName: form.value.lastName || undefined,
			phone: form.value.phone || undefined,
			birthDate: form.value.birthDate || undefined,
			role: form.value.role,
			status: form.value.status,
		})
	} else {
		handleSubmit({
			uuid: editingUserUuid.value,
			email: form.value.email,
			firstName: form.value.firstName,
			secondName: form.value.secondName,
			lastName: form.value.lastName || undefined,
			phone: form.value.phone || undefined,
			birthDate: form.value.birthDate || undefined,
			role: form.value.role,
			status: form.value.status,
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
	border: 1px dashed var(--el-border-color);
	border-radius: 6px;
	cursor: pointer;
	position: relative;
	overflow: hidden;
	transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
	border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
	font-size: 28px;
	color: #8c939d;
	width: 178px;
	height: 178px;
	text-align: center;
}
</style>
