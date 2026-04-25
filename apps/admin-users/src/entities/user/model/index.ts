export enum UserRole {
	Superadmin = 'superadmin',
	Admin = 'admin',
	Editor = 'editor',
	User = 'user',
}

export enum UserStatus {
	Active = 'active',
	Inactive = 'inactive',
	InModeration = 'in_moderation',
}

export interface IUserResponse {
	uuid?: string
	email?: string
	password?: string
	firstName?: string
	secondName?: string
	lastName?: string
	birthDate?: string
	role?: UserRole
	status?: UserStatus
	phone?: string
	avatar?: string
	street?: string
	city?: string
	gender?: string
}

export interface IUserCreateUpdate {
	uuid?: string
	email?: string
	password?: string
	firstName?: string
	secondName?: string
	lastName?: string
	birthDate?: string
	role?: UserRole
	status?: UserStatus
	phone?: string
	avatar?: string
	avatarUuid?: string | null
	street?: string
	city?: string
	gender?: string
}

export interface UserFilters {
	status?: UserStatus[]
	role?: UserRole[]
	search?: string
	name?: string
	email?: string
	phone?: string
	city?: string
	firstName?: string
	lastName?: string
	secondName?: string
	sortBy?: string
	sortOrder?: 'ASC' | 'DESC'
}

export const USERS_QUERY_KEY = 'users'
