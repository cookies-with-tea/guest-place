<template>
	<el-drawer v-model="isDetailDrawerOpen" title="User Details" direction="rtl" size="50%" @closed="closeDetailDrawer">
		<div v-if="userData" class="drawer-detail-user">
			<div class="avatar-section">
				<div class="avatar-container">
					<img v-if="userData.avatar" :src="userData.avatar" alt="User Avatar" class="avatar-image" />
					<div v-else class="avatar-placeholder">
						<span>{{ getInitials(userData) }}</span>
					</div>
				</div>
			</div>

			<el-descriptions title="User Information" border :column="1" class="user-info">
				<el-descriptions-item label="UUID">{{ userData.uuid }}</el-descriptions-item>
				<el-descriptions-item label="Email">{{ userData.email }}</el-descriptions-item>
				<el-descriptions-item label="First Name">{{ userData.firstName || '-' }}</el-descriptions-item>
				<el-descriptions-item label="Second Name">{{ userData.secondName || '-' }}</el-descriptions-item>
				<el-descriptions-item label="Last Name">{{ userData.lastName || '-' }}</el-descriptions-item>
				<el-descriptions-item label="Phone">{{ userData.phone || '-' }}</el-descriptions-item>
				<el-descriptions-item label="Birth Date">{{ userData.birthDate || '-' }}</el-descriptions-item>
				<el-descriptions-item label="Role">{{ userData.role || '-' }}</el-descriptions-item>
				<el-descriptions-item label="Status">{{ userData.status || '-' }}</el-descriptions-item>
				<el-descriptions-item label="Street">{{ userData.street || '-' }}</el-descriptions-item>
				<el-descriptions-item label="City">{{ userData.city || '-' }}</el-descriptions-item>
				<el-descriptions-item label="Gender">{{ userData.gender || '-' }}</el-descriptions-item>
			</el-descriptions>
		</div>
		<div v-else class="drawer-detail-user__loading">
			<el-skeleton animated />
		</div>
	</el-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUsers } from '#entities/user/lib/composables'

const { editingUser, isDetailDrawerOpen, closeDetailDrawer } = useUsers()

const userData = computed(() => {
	return editingUser?.value?.data
})

const getInitials = (user: any) => {
	if (!user) return ''

	const firstName = user.firstName || ''
	const lastName = user.lastName || ''

	return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase()
}
</script>

<style scoped>
.drawer-detail-user {
	display: flex;
	flex-direction: column;
	padding: 20px;
	gap: 20px;
}

.avatar-section {
	display: flex;
	justify-content: center;
	margin-bottom: 10px;
}

.avatar-container {
	width: 120px;
	height: 120px;
	position: relative;
	border: 3px solid #409eff;
	border-radius: 50%;
	box-shadow: 0 4px 12px rgb(64, 158, 255, 0.3);
	transition: transform 0.3s ease;
	overflow: hidden;
}

.avatar-container:hover {
	transform: scale(1.05);
}

.avatar-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
	transition: transform 0.3s ease;
}

.avatar-image:hover {
	transform: scale(1.1);
}

.avatar-placeholder {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 700;
	font-size: 24px;
	color: #fff;
	background-color: #409eff;
}

.drawer-detail-user__loading {
	padding: 20px;
}

.user-info {
	margin-top: 10px;
}
</style>
