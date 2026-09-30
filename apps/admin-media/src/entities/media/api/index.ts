import { createApi } from '@admin-panel/lib'

import type {
	ChunkStatusResponse,
	ChunkUploadResultDTO,
	InitChunkUploadDTO,
	InitChunkUploadResponse,
	MediaConfig,
	MediaFilters,
	MediaFolder,
	MediaItem,
	MediaTagCount,
} from '../model'

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
		if (params.folderId !== undefined && params.folderId !== '') query.folder_id = params.folderId
		if (params.source && params.source.length > 0) query.source = params.source.join(',')
		if (params.minSizeBytes !== undefined) query.min_size_bytes = params.minSizeBytes
		if (params.maxSizeBytes !== undefined) query.max_size_bytes = params.maxSizeBytes
		if (params.dateFrom) query.date_from = params.dateFrom
		if (params.dateTo) query.date_to = params.dateTo
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

export const initChunkUpload = (data: InitChunkUploadDTO) => {
	return fetchData<InitChunkUploadResponse>('/upload/chunk/init', {
		method: 'POST',
		body: data,
	})
}

export const uploadChunk = (uploadId: string, chunkIndex: number, chunkData: Blob | ArrayBuffer) => {
	return fetchData<ChunkUploadResultDTO>(`/upload/chunk/${uploadId}/${chunkIndex}`, {
		method: 'POST',
		body: chunkData,
		headers: {
			'Content-Type': 'application/octet-stream',
		},
	})
}

export const getChunkStatus = (uploadId: string) => {
	return fetchData<ChunkStatusResponse>(`/upload/chunk/${uploadId}/status`, {
		method: 'GET',
	})
}

export const completeChunkUpload = (uploadId: string) => {
	return fetchData<MediaItem>(`/upload/chunk/${uploadId}/complete`, {
		method: 'POST',
	})
}

export const optimize = (uuid: string) => {
	return fetchData<MediaItem>(`/${uuid}/optimize`, {
		method: 'POST',
	})
}

export const optimizeBulk = (uuids: string[]) => {
	return fetchData<MediaItem[]>('/optimize/bulk', {
		method: 'POST',
		body: { uuids },
	})
}

export const getFolders = () => {
	return fetchData<MediaFolder[]>('/folders', {
		method: 'GET',
	})
}

export const createFolder = (data: { name: string; parentId?: string | null; color?: string }) => {
	return fetchData<MediaFolder>('/folders', {
		method: 'POST',
		body: data,
	})
}

export const updateFolder = (id: string, data: { name?: string; parentId?: string | null; color?: string }) => {
	return fetchData<MediaFolder>(`/folders/${id}`, {
		method: 'PUT',
		body: data,
	})
}

export const deleteFolder = (id: string) => {
	return fetchData(`/folders/${id}`, {
		method: 'DELETE',
	})
}

export const batchMove = (uuids: string[], folderId: string | null) => {
	return fetchData('/batch/move', {
		method: 'POST',
		body: { uuids, folderId },
	})
}

export const getTags = () => {
	return fetchData<MediaTagCount[]>('/tags', {
		method: 'GET',
	})
}

export const getConfig = () => {
	return fetchData<MediaConfig>('/config', {
		method: 'GET',
	})
}

export const mediaApi = {
	create,
	getAll,
	update,
	getById,
	deleteById,
	updateBulk,
	initChunkUpload,
	uploadChunk,
	getChunkStatus,
	completeChunkUpload,
	optimize,
	optimizeBulk,
	getFolders,
	createFolder,
	updateFolder,
	deleteFolder,
	batchMove,
	getTags,
	getConfig,
}
