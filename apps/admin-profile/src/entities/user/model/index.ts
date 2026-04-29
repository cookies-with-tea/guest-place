export interface IUserResponse {
	uuid: string
	email: string
	firstName: string
	secondName?: string
	lastName: string
	birthDate?: string
	role: string
	status: string
	phone?: string
	avatar?: string
	street?: string
	city?: string
	gender?: string
	createdAt: string
	updatedAt: string
}

export interface IUserCreateUpdate {
	email?: string
	firstName?: string
	secondName?: string
	lastName?: string
	birthDate?: string
	phone?: string
	avatar?: string
	avatarUuid?: string | null
	street?: string
	city?: string
	gender?: string
}

export interface IChangePassword {
	oldPassword?: string
	newPassword?: string
}
