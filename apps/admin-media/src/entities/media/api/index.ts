import { createApi } from '@admin-panel/lib'

import type { MediaFilters, MediaItem } from '../model'

const { fetchData } = createApi('media')

const create = (data: FormData) => {
	return fetchData('', {
		method: 'POST',
		body: data,
	})
}

export const getAll = (params?: MediaFilters) => {
	const query: Record<string, any> = {}

	if (params) {
		if (params.search) query.search = params.search
		if (params.sortBy) query.sort_by = params.sortBy
		if (params.sortOrder) query.sort_order = params.sortOrder
		if (params.mediaTypes && params.mediaTypes.length > 0) query.media_type = params.mediaTypes
		if (params.category && params.category.length > 0) query.category = params.category
		if (params.tags && params.tags.length > 0) query.tags = params.tags
		if (params.page) query.page = params.page
		if (params.limit) query.limit = params.limit
	}

	return fetchData<{ items: MediaItem[]; pagination: any }>('', {
		method: 'GET',
		query,
	})
}

export const update = (uuid: string, data: Partial<MediaItem>) => {
	return fetchData(`/${uuid}`, {
		method: 'PUT',
		body: data,
	})
}

const getById = (uuid: string) => {
	return fetchData<MediaItem>(`/${uuid}`, {
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
