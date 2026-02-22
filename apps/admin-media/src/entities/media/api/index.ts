import { createApi } from '@admin-panel/lib'
import { IMedia } from '../model'

const { fetchData } = createApi('media')

const create = (data: FormData) => {
	return fetchData('', {
		method: 'POST',
		body: data,
	})
}

export const getAll = (params?: any) => {
	return fetchData<IMedia[]>('', {
    method: 'GET',
		query: params,
	})
}

export const update = (uuid: string, data: FormData) => {
	return fetchData(`/${uuid}`, {
		method: 'PATCH',
		body: data,
	})
}

const getById = (uuid: string) => {
	return fetchData<IMedia>(`/${uuid}`, {
		method: 'GET',
	})
}

export const deleteById = (uuid: string) => {
	return fetchData(`/${uuid}`, {
		method: 'DELETE',
	})
}

export const mediaApi = {
  create,
	getAll,
	update,
	getById,
	deleteById,
}
