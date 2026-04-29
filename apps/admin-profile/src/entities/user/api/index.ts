import { createApi } from '@admin-panel/lib'

import type { IChangePassword, IUserCreateUpdate, IUserResponse } from '../model'

const { fetchData } = createApi('user')

export const getMe = () => {
	return fetchData<IUserResponse>('/me', {
		method: 'GET',
	})
}

export const updateMe = (data: IUserCreateUpdate) => {
	return fetchData<IUserResponse>('/me', {
		method: 'PATCH',
		body: data,
	})
}

export const changePassword = (data: IChangePassword) => {
	return fetchData('/me/password', {
		method: 'POST',
		body: data,
	})
}

export const userApi = {
	getMe,
	updateMe,
	changePassword,
}
