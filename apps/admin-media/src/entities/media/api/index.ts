import { createApi } from '@admin-panel/lib'

import type { MediaFilters, MediaItem } from '../model'

const { fetchData } = createApi('media')

const create = (data: FormData) => {
	return fetchData<MediaItem>('', {
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
		if (params.mediaTypes && params.mediaTypes.length > 0) query.media_type = params.mediaTypes.join(',')
		if (params.category && params.category.length > 0) query.category = params.category.join(',')
		if (params.tags && params.tags.length > 0) query.tags = params.tags.join(',')
		if (params.source && params.source.length > 0) query.source = params.source.join(',')
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

export const updateBulk = (uuids: string[], data: Partial<MediaItem>) => {
	return fetchData('/bulk', {
		method: 'PATCH',
		body: { uuids, data },
	})
}

export const mediaApi = {
	create,
	getAll,
	update,
	getById,
	deleteById,
	updateBulk,
}
