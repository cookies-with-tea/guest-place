import { createApi, type IWithPagination } from '@admin-panel/lib'
import type { IUserResponse, IUserCreateUpdate } from '../model'
import type { IPaginationQuery } from '@admin-panel/lib'

const { fetchData } = createApi('user')

const create = (data: IUserCreateUpdate) => {
	return fetchData('', {
		method: 'POST',
		body: data,
	})
}

export const update = (uuid: string, data: IUserCreateUpdate) => {
	return fetchData(`/${uuid}`, {
		method: 'PATCH',
		body: data,
	})
}

export const getAll = (params: IPaginationQuery) => {
	return fetchData<IWithPagination<IUserResponse>>('', {
		method: 'GET',
		params,
	})
}

const getById = (uuid: string) => {
	return fetchData<IUserCreateUpdate>(`/${uuid}`, {
		method: 'GET',
	})
}

export const deleteById = (uuid: string) => {
	return fetchData(`/${uuid}`, {
		method: 'DELETE',
	})
}

export const userApi = {
	create,
	update,
	getById,
	getAll,
	deleteById,
}
