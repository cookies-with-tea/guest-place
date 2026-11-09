import { computed, ref } from 'vue'

import { ElMessage } from 'element-plus'

import { type IPermission, rightsApi } from '#entities/user/api/rights'

export interface IPermissionGroup {
	module: string
	permissions: IPermission[]
}

const MODULE_LABELS: Record<string, string> = {
	mfe: 'MFE',
	user: 'User',
	i18n: 'i18n',
	media: 'Media',
	about: 'About',
	access: 'Access',
	system: 'System',
	features: 'Features',
	audit: 'Audit',
}

const moduleOf = (permissionId: string) => permissionId.split(':')[0] || permissionId

export const moduleLabel = (module: string) => MODULE_LABELS[module] || module

const cloneMatrix = (source: Record<string, Set<string>>) => {
	const result: Record<string, Set<string>> = {}

	for (const role of Object.keys(source)) {
		result[role] = new Set(source[role])
	}

	return result
}

export function useRightsMatrix() {
	const roles = ref<string[]>([])
	const permissions = ref<IPermission[]>([])
	const matrix = ref<Record<string, Set<string>>>({})
	const initialMatrix = ref<Record<string, Set<string>>>({})
	const search = ref('')

	const loading = ref(true)
	const saving = ref(false)

	const loadData = async () => {
		loading.value = true

		const [rolesRes, permsRes] = await Promise.all([rightsApi.getRoles(), rightsApi.getPermissions()])

		roles.value = rolesRes.data || []
		permissions.value = permsRes.data || []

		const rolePermissionsList = await Promise.all(roles.value.map((role) => rightsApi.getRolePermissions(role)))

		const nextMatrix: Record<string, Set<string>> = {}

		roles.value.forEach((role, i) => {
			nextMatrix[role] = new Set(rolePermissionsList[i].data || [])
		})

		matrix.value = nextMatrix
		initialMatrix.value = cloneMatrix(nextMatrix)

		loading.value = false
	}

	const groups = computed<IPermissionGroup[]>(() => {
		const query = search.value.trim().toLowerCase()

		const filtered = permissions.value.filter((perm) => {
			if (!query) return true

			return (
				perm.id.toLowerCase().includes(query) ||
				perm.name.toLowerCase().includes(query) ||
				(perm.description || '').toLowerCase().includes(query)
			)
		})

		const byModule = new Map<string, IPermission[]>()

		for (const perm of filtered) {
			const module = moduleOf(perm.id)

			if (!byModule.has(module)) byModule.set(module, [])

			byModule.get(module)!.push(perm)
		}

		return Array.from(byModule.entries())
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([module, perms]) => ({ module, permissions: perms }))
	})

	const isChecked = (role: string, permissionId: string) => matrix.value[role]?.has(permissionId) ?? false

	const toggle = (role: string, permissionId: string) => {
		const set = matrix.value[role]

		if (!set) return

		if (set.has(permissionId)) {
			set.delete(permissionId)
		} else {
			set.add(permissionId)
		}
	}

	const dirtyRoles = computed(() =>
		roles.value.filter((role) => {
			const current = matrix.value[role]
			const initial = initialMatrix.value[role]

			if (!current || !initial) return false
			if (current.size !== initial.size) return true

			for (const id of current) {
				if (!initial.has(id)) return true
			}

			return false
		})
	)

	const isDirty = computed(() => dirtyRoles.value.length > 0)

	const save = async () => {
		saving.value = true

		try {
			await Promise.all(
				dirtyRoles.value.map((role) => rightsApi.updateRolePermissions(role, Array.from(matrix.value[role])))
			)

			initialMatrix.value = cloneMatrix(matrix.value)

			ElMessage.success('Права обновлены')
		} finally {
			saving.value = false
		}
	}

	const reset = () => {
		matrix.value = cloneMatrix(initialMatrix.value)
	}

	return {
		roles,
		groups,
		search,
		loading,
		saving,
		isDirty,
		dirtyRoles,
		isChecked,
		toggle,
		save,
		reset,
		loadData,
	}
}
