<template>
	<div class="rights-page glass-card">
		<div class="header">
			<h1>Rights Management</h1>
			<p>Manage permissions for each user role</p>
		</div>

		<el-tabs v-model="activeRole" class="role-tabs" @tab-change="handleTabChange">
			<el-tab-pane v-for="role in roles" :key="role" :label="role.toUpperCase()" :name="role">
				<div v-if="loadingPermissions" class="loading-state">
					<el-skeleton :rows="5" animated />
				</div>
				<div v-else class="permissions-container">
					<h3>Permissions for {{ role }}</h3>
					<el-checkbox-group v-model="selectedPermissions" class="permissions-grid">
						<el-checkbox v-for="perm in allPermissions" :key="perm" :label="perm" border class="perm-checkbox">
							{{ perm }}
						</el-checkbox>
					</el-checkbox-group>

					<div class="actions">
						<el-button type="primary" :loading="saving" @click="savePermissions"> Save Changes </el-button>
						<el-button @click="resetPermissions">Reset</el-button>
					</div>
				</div>
			</el-tab-pane>
		</el-tabs>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { rightsApi } from '#entities/user/api/rights'
import { ElMessage } from 'element-plus'

const roles = ref<string[]>([])
const allPermissions = ref<string[]>([])
const activeRole = ref('')
const selectedPermissions = ref<string[]>([])
const initialPermissions = ref<string[]>([])

const loading = ref(true)
const loadingPermissions = ref(false)
const saving = ref(false)

const loadData = async () => {
	try {
		const [rolesRes, permsRes] = await Promise.all([rightsApi.getRoles(), rightsApi.getPermissions()])

		roles.value = rolesRes.data || []

		allPermissions.value = permsRes.data || []

		if (roles.value.length > 0) {
			activeRole.value = roles.value[0]

			await loadRolePermissions(activeRole.value)
		}
	} catch {
		ElMessage.error('Failed to load rights data')
	} finally {
		loading.value = false
	}
}

const loadRolePermissions = async (role: string) => {
	loadingPermissions.value = true

	try {
		const res = await rightsApi.getRolePermissions(role)

		selectedPermissions.value = res.data || []

		initialPermissions.value = [...selectedPermissions.value]
	} catch {
		ElMessage.error(`Failed to load permissions for ${role}`)
	} finally {
		loadingPermissions.value = false
	}
}

const handleTabChange = (role: string) => {
	loadRolePermissions(role as string)
}

const savePermissions = async () => {
	saving.value = true

	try {
		await rightsApi.updateRolePermissions(activeRole.value, selectedPermissions.value)

		ElMessage.success('Permissions updated successfully')

		initialPermissions.value = [...selectedPermissions.value]
	} catch {
		ElMessage.error('Failed to update permissions')
	} finally {
		saving.value = false
	}
}

const resetPermissions = () => {
	selectedPermissions.value = [...initialPermissions.value]
}

onMounted(loadData)
</script>

<style scoped>
.rights-page {
	min-height: 400px;
	padding: 24px;
}

.header {
	margin-bottom: 32px;
}

.header h1 {
	font-size: 1.5rem;
	color: var(--gp-text-primary);
	margin: 0;
}

.header p {
	color: var(--gp-text-secondary);
	margin: 8px 0 0;
}

.role-tabs {
	margin-top: 24px;
}

.permissions-container {
	padding: 24px 0;
}

.permissions-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	margin: 24px 0;
	gap: 16px;
}

.perm-checkbox {
	width: 100%;
	margin-right: 0 !important;
}

.actions {
	display: flex;
	margin-top: 32px;
	gap: 12px;
}

.loading-state {
	padding: 40px 0;
}

:deep(.el-tabs__item) {
	font-weight: 600;
	font-size: 0.9rem;
}
</style>
