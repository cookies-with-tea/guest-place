import { createApi } from '@admin-panel/lib'

const { fetchData } = createApi('user')

export const getRoles = () => fetchData<string[]>('/roles')

export const getPermissions = () => fetchData<string[]>('/permissions')

export const getRolePermissions = (role: string) => fetchData<string[]>(`/roles/${role}/permissions`)

export const updateRolePermissions = (role: string, permissions: string[]) =>
	fetchData(`/roles/${role}/permissions`, {
		method: 'POST',
		body: permissions,
	})

export const rightsApi = {
	getRoles,
	getPermissions,
	getRolePermissions,
	updateRolePermissions,
}
