import type { IPaginationQuery } from '@admin-panel/lib'
import { createApi, type IWithPagination } from '@admin-panel/lib'

import type { IUserCreateUpdate, IUserResponse } from '../model'

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
	const processedParams = { ...params } as any

	if (Array.isArray(processedParams.role)) {
		processedParams.role = processedParams.role.join(',')
	}

	if (Array.isArray(processedParams.status)) {
		processedParams.status = processedParams.status.join(',')
	}

	return fetchData<IWithPagination<IUserResponse>>('', {
		method: 'GET',
		params: processedParams,
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
