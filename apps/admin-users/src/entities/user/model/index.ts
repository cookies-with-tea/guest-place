export enum UserRole {
	Admin = 'admin',
	User = 'user',
}

export enum UserStatus {
	Active = 'active',
	Inactive = 'inactive',
	InModeration = 'in_moderation',
}

export interface User {
	uuid: string
	email: string
	firstName: string
	secondName: string
	lastName?: string
	phone?: string
	avatar?: string
	birthDate?: string // 'YYYY-MM-DD'
	role?: UserRole
	status?: UserStatus
	createdAt: string // ISO
	updatedAt: string
}

export interface CreateUserDTO {
	email: string
	password: string
	phone?: string
	firstName?: string
	secondName?: string
	lastName?: string
	birthDate?: string
	role?: UserRole
	status?: UserStatus
}

export interface UpdateUserDTO extends Partial<CreateUserDTO> {
	uuid: string
}

export interface UserFilters {
	status?: UserStatus
	role?: UserRole
	search?: string
}

export interface Pagination {
	page: number
	pageSize: number
	total: number
}

export const USERS_QUERY_KEY = 'users'
