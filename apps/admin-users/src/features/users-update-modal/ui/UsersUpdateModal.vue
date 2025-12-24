<template>
	<el-dialog :title="isEditing ? 'Edit user' : 'Add user'" v-model="isModalOpen" width="600px">
		<el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
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
		</el-form>

		<template #footer>
			<el-button @click="closeModal">Cancel</el-button>
			<el-button type="primary" :loading="isSubmitting" @click="submit">
				{{ isEditing ? 'Save' : 'Create' }}
			</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useUsers } from '#entities/user/lib/composables'
import { UserRole, UserStatus } from '#entities/user/model'

const { isModalOpen, editingUser, closeModal, handleSubmit, isSubmitting } = useUsers()

const formRef = ref<FormInstance>()
const form = ref({
	email: '',
	password: '',
	firstName: '',
	secondName: '',
	lastName: '',
	phone: '',
	birthDate: '',
	role: undefined as UserRole | undefined,
	status: undefined as UserStatus | undefined,
})

const isEditing = computed(() => !!editingUser.value?.uuid)

watch(isModalOpen, (isOpen) => {
	if (isOpen && editingUser.value) {
		const u = editingUser.value

		form.value = {
			email: u.email,
			password: '',
			firstName: u.firstName,
			secondName: u.secondName,
			lastName: u.lastName || '',
			phone: u.phone || '',
			birthDate: u.birthDate || '',
			role: u.role,
			status: u.status,
		}
	} else {
		form.value = {
			email: '',
			password: '',
			firstName: '',
			secondName: '',
			lastName: '',
			phone: '',
			birthDate: '',
			role: undefined,
			status: undefined,
		}
	}
})

const rules = computed<FormRules>(() => ({
	email: [{ required: true, message: 'Email is required', trigger: 'blur' }],
	password: [{ required: !isEditing.value, message: 'Password is required', trigger: 'blur' }],
	firstName: [{ required: true, message: 'First name is required', trigger: 'blur' }],
	secondName: [{ required: true, message: 'Second name is required', trigger: 'blur' }],
}))

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
			uuid: editingUser.value!.uuid,
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
