import type { User, UserFilters, CreateUserDTO, UpdateUserDTO } from '../model'
import { UserRole, UserStatus } from '../model'

const generateUuid = () =>
	'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0
		const v = c === 'x' ? r : (r & 0x3) | 0x8

		return v.toString(16)
	})

// === Mock data storage ===
let mockUsers: User[] = Array.from({ length: 87 }, (_, i) => ({
	uuid: generateUuid(),
	email: `user${i + 1}@example.com`,
	firstName: `First${i + 1}`,
	secondName: `Second${i + 1}`,
	lastName: i % 3 === 0 ? `Last${i + 1}` : undefined,
	phone: i % 2 === 0 ? `+123456789${String(i).padStart(2, '0')}` : undefined,
	avatar: undefined,
	birthDate: i % 4 === 0 ? '1990-05-15' : undefined,
	role: i % 5 === 0 ? UserRole.Admin : UserRole.User,
	status: i % 3 === 0 ? UserStatus.Active : i % 3 === 1 ? UserStatus.Inactive : UserStatus.InModeration,
	createdAt: '2023-01-01T12:00:00',
	updatedAt: '2023-01-01T12:00:00',
}))

// === Фильтрация ===
const filterUsers = (users: User[], filters: UserFilters): User[] => {
	return users.filter((user) => {
		const matchesStatus = !filters.status || user.status === filters.status
		const matchesRole = !filters.role || user.role === filters.role
		const matchesSearch =
			!filters.search ||
			user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
			user.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
			user.secondName.toLowerCase().includes(filters.search.toLowerCase()) ||
			(user.lastName?.toLowerCase().includes(filters.search.toLowerCase()) ?? false)

		return matchesStatus && matchesRole && matchesSearch
	})
}

// === Типы и функции ===
export interface FetchUsersParams extends UserFilters {
	page: number
	pageSize: number
}

export const fetchUsers = async (params: FetchUsersParams) => {
	await new Promise((r) => setTimeout(r, 300))

	const filtered = filterUsers(mockUsers, params)
	const start = (params.page - 1) * params.pageSize
	const paginated = filtered.slice(start, start + params.pageSize)

	return {
		data: paginated,
		pagination: {
			page: params.page,
			pageSize: params.pageSize,
			total: filtered.length,
		},
	}
}

export const createUser = async (data: Omit<CreateUserDTO, 'password'> & { password: string }): Promise<User> => {
	await new Promise((r) => setTimeout(r, 200))

	const newUser: User = {
		uuid: generateUuid(),
		email: data.email,
		firstName: data.firstName || '',
		secondName: data.secondName || '',
		lastName: data.lastName || undefined,
		phone: data.phone || undefined,
		avatar: undefined,
		birthDate: data.birthDate || undefined,
		role: data.role ?? UserRole.User,
		status: data.status ?? UserStatus.InModeration,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	}

	mockUsers.unshift(newUser)

	return newUser
}

export const updateUser = async (data: UpdateUserDTO): Promise<User> => {
	await new Promise((r) => setTimeout(r, 200))

	const index = mockUsers.findIndex((u) => u.uuid === data.uuid)

	if (index === -1) throw new Error('User not found')

	const updatedUser: User = {
		...mockUsers[index],
		...data,
		uuid: data.uuid,
		updatedAt: new Date().toISOString(),
	}

	mockUsers[index] = updatedUser

	return updatedUser
}

export const deleteUser = async (uuid: string): Promise<void> => {
	await new Promise((r) => setTimeout(r, 200))

	mockUsers = mockUsers.filter((u) => u.uuid !== uuid)
}
