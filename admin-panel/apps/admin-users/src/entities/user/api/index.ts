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

export const getAll = (params: IPaginationQuery & any) => {
	const processedParams: Record<string, any> = {}

	// Map all keys from params
	Object.entries(params).forEach(([key, value]) => {
		if (value === undefined || value === null || value === '') return

		if (key === 'sortBy') processedParams.sort_by = value
		else if (key === 'sortOrder') processedParams.sort_order = value
		else if (key === 'firstName') processedParams.first_name = value
		else if (key === 'lastName') processedParams.last_name = value
		else if (key === 'secondName') processedParams.second_name = value
		else if (key === 'role' && Array.isArray(value)) processedParams.role = value.join(',')
		else if (key === 'status' && Array.isArray(value)) processedParams.status = value.join(',')
		else processedParams[key] = value
	})

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
