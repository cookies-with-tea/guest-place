export enum UserRole {
	Admin = 'admin',
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
	avatar_uuid?: string | null
	street?: string
	city?: string
	gender?: string
}

export interface UserFilters {
	status?: UserStatus
	role?: UserRole
	search?: string
}

export const USERS_QUERY_KEY = 'users'
