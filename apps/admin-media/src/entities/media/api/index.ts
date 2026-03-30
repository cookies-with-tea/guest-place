import { createApi } from '@admin-panel/lib'
import { IMedia } from '../model'
import { useAuthTemp } from '@/shared/lib/composables/useTempAuth'

const { fetchData } = createApi('media')
const { authToken } = useAuthTemp()

const create = (data: FormData) => {
	return fetchData('', {
		method: 'POST',
		body: data,
		headers: {
			Authorization: `Bearer ${authToken.value}`,
		},
	})
}

export const getAll = (params?: any) => {
	return fetchData<{ items: IMedia[]; pagination: any }>('', {
		method: 'GET',
		query: params,
		headers: {
			Authorization: `Bearer ${authToken.value}`,
		},
	})
}

export const update = (uuid: string, data: FormData) => {
	return fetchData(`/${uuid}`, {
		method: 'PATCH',
		body: data,
		headers: {
			Authorization: `Bearer ${authToken.value}`,
		},
	})
}

const getById = (uuid: string) => {
	return fetchData<IMedia>(`/${uuid}`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${authToken.value}`,
		},
	})
}

export const deleteById = (uuid: string) => {
	return fetchData(`/${uuid}`, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${authToken.value}`,
		},
	})
}

export const mediaApi = {
	create,
	getAll,
	update,
	getById,
	deleteById,
}
